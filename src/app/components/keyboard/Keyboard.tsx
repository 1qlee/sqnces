import "~/styles/toast.css";
import styles from "./Keyboard.module.css";
import toast from "react-hot-toast";
import type { ClientWord, CheckedGuess, GetWordResponse } from "~/server/types/puzzle";
import type { Game, WordLength } from "../game/Game.types";
import type { Guess } from "../guess-area/Guess.types";
import type { Status, KeysStatus, Key, KeyStyleOrIcon } from "../keyboard/Keyboard.types";
import { type Dispatch, type SetStateAction, useEffect, useState, useRef, type CSSProperties } from "react";
import useGameState from "~/hooks/useGameState";
import useGuessSearch from "~/hooks/useGuessSearch";
import useUserStats from "~/hooks/useUserStats";
import { generateDateString } from "~/app/helpers/formatters/dates";
import { validateAlpha } from "~/app/helpers/validators/text";
import { useReward } from "react-rewards";
import { X, Check, ArrowsLeftRight, KeyReturn, Square } from "@phosphor-icons/react";
import { checkGuess } from "~/app/actions/checkGuess";
import { useGameContext, useGameDispatch } from "~/app/contexts/GameProvider";

const KeyboardRows: Key[][] = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['', 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ''],
  ['', '', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'Backspace', '']
]

const CONFETTI_STYLE: CSSProperties = {
  position: "fixed",
  bottom: "0",
  left: "50%",
  transform: "translateX(-50%)",
  width: "2px",
  height: "2px",
  display: "block",
  background: "transparent",
  zIndex: 1000,
}

function createConfettiConfig(options = {}) {
  const defaultConfig = {
    lifetime: 300,
    angle: 90,
    spread: 45,
    zIndex: 12822,
    colors: ["#E93D82", "#8E4EC6", "#5B5BD6", "#0090FF", "#12A594", "#46A758", "#F76B15", "#FFE629"],
  };

  // Merge defaults with options, where options override defaults
  return { ...defaultConfig, ...options };
}

interface KeyboardProps {
  currentGame: Game;
  keysStatus: KeysStatus;
  guess: Guess;
  wordData: ClientWord;
  setKeysStatus: Dispatch<SetStateAction<KeysStatus>>
  setGuess: Dispatch<SetStateAction<{
    string: string;
    letters: Key[];
  }>>;
}

export default function Keyboard({ 
  guess,
  currentGame,
  keysStatus,
  wordData,
  setGuess,
  setKeysStatus,
}: KeyboardProps) {
  const searchGuess = useGuessSearch();
  const context = useGameContext();
  const { editing } = context;
  const dispatch = useGameDispatch();
  const [userStats, setUserStats] = useUserStats();
  const [activeKeys, setActiveKeys] = useState<Key[]>([]);
  const [gameState, setGameState] = useGameState();
  const [loading, setLoading] = useState(false);
  const guessRef = useRef(guess); // Create a ref to store the guess value
  const isGameOver = currentGame.status === "won" || currentGame.status === "lost";
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const repeatInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const { reward: smallReward } = useReward("confetti-small", "confetti", createConfettiConfig({
    elementCount: 12,
    startVelocity: 12,
    spread: 90,
    colors: ["#E93D82", "#978365", "#0090FF", "#12A594", "#8B8D98", "#F76B15"],
  }));
  const { reward: normalReward } = useReward("confetti-normal", "confetti", createConfettiConfig({
    elementCount: 30,
    spread: 60,
  }));
  const { reward: goldReward } = useReward("confetti-gold", "confetti", createConfettiConfig({
    elementCount: 70,
    spread: 90,
    colors: ["#FFC53D", "#FFBA18", "#FFE629", "#FFDC00"],
  }));

  function handleKeyInput(key: Key) {
    const capitalizedKey = key !== "Blank" ? key.toUpperCase() as Key : key;

    if (validateAlpha(key)) {
      if (editing.toggled) {
        setGuess(prev => ({
          string: prev.string.slice(0, editing.key) + capitalizedKey + prev.string.slice(editing.key + 1),
          letters: prev.letters.map((letter, i) => (i === editing.key ? capitalizedKey : letter)),
        }));
      }
      else if (guessRef.current.letters.includes("Blank") && guessRef.current.letters.length === wordData.length) {
        const newString = guessRef.current.string.replace(" ", capitalizedKey);
        const blankIndex = guessRef.current.letters.indexOf("Blank");
        const newLetters = [
          ...guessRef.current.letters.slice(0, blankIndex),
          capitalizedKey,
          ...guessRef.current.letters.slice(blankIndex + 1),
        ]

        setGuess({
          string: newString,
          letters: newLetters,
        });
      }
      else {
        if (guessRef.current.letters.length < wordData.length) {
          setGuess(prev => ({
            string: prev.string + key.toUpperCase(),
            letters: [...prev.letters, capitalizedKey],
          }));
        }
      }
    }
    else if (key === ' ' || key === "Blank") {
      if (editing.toggled) {
        setGuess(prev => ({
          string: prev.string.slice(0, editing.key) + " " + prev.string.slice(editing.key + 1),
          letters: prev.letters.map((letter, i) => (i === editing.key ? "Blank" : letter)),
        }));
        dispatch({
          type: "editKey",
          toggled: false,
          key: 0,
        });
      }
      else {
        if (guessRef.current.letters.length < wordData.length) {
          setGuess(prev => ({
            string: prev.string + " ",
            letters: [...prev.letters, "Blank"],
          }));
        }
      }
    }
  }

  function handleBackspace(event: KeyboardEvent | React.PointerEvent<HTMLButtonElement> | React.KeyboardEvent<HTMLButtonElement>) {
    const modifierPressed = event.shiftKey || event.ctrlKey || event.metaKey;

    if (editing.toggled) {
      setGuess(prev => ({
        string: prev.string.slice(0, editing.key) + prev.string.slice(editing.key + 1),
        letters: prev.letters.filter((_, i) => i !== editing.key),
      }));
      dispatch({
        type: "editKey",
        toggled: false,
        key: 0,
      });
    }
    else if (modifierPressed) {
      setGuess({
        string: "",
        letters: [],
      });
    } else {
      deleteChar();
    }
  }

  // Sync the ref with the state whenever it updates
  useEffect(() => {
    guessRef.current = guess;
  }, [guess]);

  useEffect(() => {
    function handleKeyTyping(event: KeyboardEvent) {
      if (document.activeElement instanceof HTMLElement && document.activeElement !== document.body) {
        return;
      }

      if (!loading) {
        const specialKeys = ['Backspace', 'Enter', 'Tab', 'Escape'];
        const key = specialKeys.includes(event.key) ? event.key as Key : event.key.toUpperCase() as Key;
        updateActiveKeys(key);

        if (key === 'Backspace') {
          handleBackspace(event);
        } 
        else if (key === 'Escape') {
          dispatch({
            type: "editKey",
            toggled: false,
            key: 0,
          })
        }
        else if (key !== 'Tab' && key !== 'Enter') {
          handleKeyInput(key);
        }
        else if (key === 'Enter') {
          void handleGuessSubmit();
        } 
        else {
          event.preventDefault();
        }
      }
    }

    if (!isGameOver) {
      document.addEventListener('keydown', handleKeyTyping);
      document.addEventListener('keyup', () => setActiveKeys([]));
    }

    return () => {
      document.removeEventListener('keydown', handleKeyTyping);
      document.removeEventListener('keyup', () => setActiveKeys([]));
    }
  }, [loading, gameState, editing])
  
  // ***** HELPERS ***** //\
  function generateWonText(numOfGuesses: number): string {
    const textCategories = {
      excited: [
        "Hot damn, that was fast.",
        "You got me. You boomed me. You're so good (x4).",
        "Behold, the power of your brain.",
        "We got a word wiz over here!",
        "You made it look easy.",
        "I can be more difficult, I swear!",
        "Winner, winner, sequenced dinner!",
        "Sequentastic!",
        "Are you a dictionary?!",
        "Here's a word for you: W-I-N-N-E-R.",
      ],
      normal: [
        "Nice job!",
        "Not too shabby!",
        "You did it! You really did it!",
        "Bravo!",
        "Ding ding ding!",
        "Great work there!",
        "You got it!",
        "That'll do the trick!",
        "A job well done!",
        "Solid effort!",
      ],
      negative: [
        "That almost went south...",
        "That was intense!",
        "WHEW!",
        "That was a close one.",
        "You literally almost lost.",
        "Living on the edge, huh?",
        "You had me on the edge of my seat!",
        "I was worried for a second there.",
        "A real nail-biter!",
        "For a second, I wasn't sure you'd make it.",
      ],
    };

    if (numOfGuesses === 0) {
      goldReward();
      return "Word-in-one!";
    }

    const category = numOfGuesses === 1 ? "excited" : (numOfGuesses <= 4 )? "normal" : "negative";

    if (category) {
      if (category === "excited" || category === "normal") {
        normalReward();
      }
      else if (category === "negative") {
        smallReward();
      }

      const options = textCategories[category];
      return options[Math.floor(Math.random() * options.length)]!;
    }

    return "You won!";
  }

  function isKeyActive(key: Key) {
    if (key.length > 0) {
      return activeKeys.includes(key);
    }
  };

  function getKeyStyleOrIcon(
    status: Status | "" = "",
    type: "style" | "icon",
  ) {
    const keyStyleOrIcon: KeyStyleOrIcon = {
      "": { style: "" },
      correct: { style: styles.isCorrect, component: <Check size={12} weight="bold" /> },
      incorrect: { style: styles.isIncorrect, component: <X size={12} weight="bold" /> },
      incorrectEmpty: { style: styles.isIncorrect, component: <X size={12} weight="bold" /> },
      misplaced: { style: styles.isMisplaced, component: <ArrowsLeftRight size={12} weight="bold" /> },
      misplacedEmpty: { style: styles.isMisplaced, component: <ArrowsLeftRight size={12} weight="bold" /> },
    };

    const result = keyStyleOrIcon[status];

    if (result) {
      return type === "style" ? result.style : result.component;
    }

    return "";
  }

  function clearTimers() {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
    if (repeatInterval.current) {
      clearInterval(repeatInterval.current);
    }
  }

  function deleteChar() {
    setGuess(prev => ({
      string: prev.string.slice(0, -1),
      letters: prev.letters.slice(0, -1),
    }));
  }

  function updateActiveKeys(key: Key) {
    setActiveKeys(prev => [...prev, key]);
  }

  async function handleGuessSubmit() {
    const guessedWord = guessRef.current.string;

    if (editing.toggled) {
      return dispatch({
        type: "editKey",
        toggled: false,
        key: 0,
      });
    }

    if (guessRef.current.letters.includes("Blank")) {
      toast.dismiss();
      return toast.error("Remove blank tiles.");
    }

    if (guessedWord.length < 4) {
      toast.dismiss();
      return toast.error("Minimum 4-letter word.");
    }

    // if the guess doesn't include the sequence
    if (!guessedWord.includes(wordData.sequence.string)) {
      toast.dismiss();
      toast.error("Word must include the sequence.");
    }
    else {
      setLoading(true);
      const isGuessValid = await searchGuess(guessedWord);

      if (!isGuessValid) {
        setLoading(false);
        toast.dismiss();
        return toast.error("Invalid word");
      };
      
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Request timed out")), 10000) // 10 seconds timeout
      );

      try {
        // Race the API call against the timeout
        const validateData = await Promise.race([
          checkGuess({
            guess: guessedWord,
            guesses: currentGame.guesses,
            hardMode: gameState.settings.hardMode,
            length: wordData.length,
            puzzleId: gameState.puzzle.id,
            usersDate: new Date().toLocaleDateString(),
          }),
          timeoutPromise,
        ]) as CheckedGuess;

        setKeysStatus((prev) => ({ ...prev, ...validateData.keys }));

        const newGuess = {
          validationMap: validateData.map,
          word: guessedWord,
          length: guessedWord.length,
        };

        const gameStatus = validateData.won
          ? "won"
          : currentGame.guesses.length >= 5
            ? "lost"
            : "playing";

        if (gameStatus === "won") {
          const text = generateWonText(currentGame.guesses.length);
          toast.success(text, {
            duration: 3000,
          });
        } else if (gameStatus === "lost") {
          toast.error(`You lost. The word was ${validateData?.word}.`);
        }

        setGameState({
          ...gameState,
          games: {
            ...gameState.games,
            [wordData.length]: {
              ...currentGame,
              guesses: [...currentGame.guesses, newGuess],
              status: gameStatus,
              word: (gameStatus === "won" || gameStatus === "lost") ? validateData?.word : "",
            },
          },
        });

        // clear guess
        setGuess({
          string: "",
          letters: [],
        });

        if (gameStatus === "won" || gameStatus === "lost") {
          const today = new Date();
          const yesterday = today.setDate(today.getDate() - 1);
          const yesterdayDateString = generateDateString(new Date(yesterday));
          const gameMode = currentGame.hardMode ? 'hardMode' : 'easyMode'
          const gameToModify = userStats.games[wordData.length as WordLength][gameMode];
          const newTimesPlayed = gameToModify.timesPlayed + 1;
          const lettersUsed = currentGame.guesses.reduce((acc, guess) => guess.word.length + acc, 0) + guessedWord.length;
          const totalLettersUsed = gameToModify.lettersUsed * gameToModify.timesPlayed;
          const newLettersUsed = parseFloat(((totalLettersUsed + lettersUsed) / newTimesPlayed).toFixed(1));
          const timesGuessed = currentGame.guesses.length + 1;
          const totalTimesGuessed = gameToModify.timesGuessed * gameToModify.timesPlayed;
          const newTimesGuessed = parseFloat(((totalTimesGuessed + timesGuessed) / newTimesPlayed).toFixed(1));
          const modifiedStreak = gameToModify?.lastPlayed === yesterdayDateString ? gameToModify.currentStreak + 1 : !gameToModify?.lastPlayed ? 1 : 0;
          const newCurrentStreak = gameStatus === "won" ? modifiedStreak : 0;

          setUserStats({
            ...userStats,
            games: {
              ...userStats.games,
              [wordData.length]: {
                ...userStats.games[wordData.length as WordLength],
                [gameMode]: {
                  ...gameToModify,
                  currentStreak: newCurrentStreak,
                  lastPlayed: generateDateString(),
                  lettersUsed: newLettersUsed,
                  longestStreak: newCurrentStreak > gameToModify.longestStreak ? newCurrentStreak : gameToModify.longestStreak,
                  lost: gameStatus === "lost" ? gameToModify.lost + 1 : gameToModify.lost,
                  timesPlayed: newTimesPlayed,
                  timesGuessed: newTimesGuessed,
                  won: gameStatus === "won" ? gameToModify.won + 1 : gameToModify.won,
                },
              }
            }
          })
        }

        setLoading(false);
      } catch (err: unknown) {
        setLoading(false);

        if (err instanceof Error) {
          const response = JSON.parse(err.message) as GetWordResponse;
          const error = response[0];
          
          if (error && typeof error.message === 'string') {
            const serverError = JSON.parse(error.message) as { message: string, code: string };

            toast.dismiss();
            toast.error(serverError.message);
          } else {
            console.error("Unexpected error format", error);
          }
        } else {
          toast.dismiss();
          toast.error("Unexpected error occurred. Please try refreshing your page.");
        }
      }
    }
  }

  // ***** EVENT HANDLERS ***** //
  function handleKeyPress(event: React.PointerEvent<HTMLButtonElement> | React.KeyboardEvent<HTMLButtonElement>, key: Key) {
    if ("pointerType" in event && event.button !== 0) {
      return 
    }

    if (!loading && !isGameOver) {
      event.preventDefault();
      updateActiveKeys(key);

      // deleting
      if (key === 'Backspace') {

        // check for non-keyboard event
        if (!('key' in event)) {
          // detect long press
          longPressTimer.current = setTimeout(() => {
            repeatInterval.current = setInterval(() => {
              deleteChar();
            }, 100);
          }, 500);

          handleBackspace(event);
        }
        else {
          handleBackspace(event);
        }
      }
      // submitting
      else if (key === 'Enter') {
        void handleGuessSubmit();
      }
      // inputting
      else {
        handleKeyInput(key)
      }
    }
  }

  // when keys are focused, we need to handle inputting keys via the "Enter" key
  function handleKeyDown(event: React.KeyboardEvent<HTMLButtonElement>, key: Key) {
    event.currentTarget.focus();
    const char = event.key;

    if (char === "Enter") {
      handleKeyPress(event, key)
    }
  }

  // handles both keyup and mouseup events
  function handleKeyUp(key: string) {
    clearTimers()
    setActiveKeys(prev => prev.filter(k => k !== key));
  }

  function handlePointerLeave() {
    clearTimers()

    if (activeKeys.length > 0) {
      setActiveKeys([]);
    }
  }

  // handle long press
  function handleContextMenu(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    event.preventDefault();
    return false;
  }

  return (
    <div 
      className={styles.keyboard}
    >
      <div style={{ overflow: "hidden"}}>
        <span
          id="confetti-small"
          style={CONFETTI_STYLE}
        ></span>
        <span
          id="confetti-normal"
          style={CONFETTI_STYLE}
        ></span>
        <span
          id="confetti-gold"
          style={CONFETTI_STYLE}
        ></span>
      </div>
      {KeyboardRows.map((row, i) => (
        <div 
          className={styles.row}
          key={i}
        >
          {row.map((key, index) => (
            <button
              key={key + index}
              disabled={loading}
              className={[
                key.length > 0 ? styles.key : styles.keySpacer,
                isKeyActive(key) ? styles.active : "",
                key === "Backspace" ? styles.largeKey : "",
                getKeyStyleOrIcon(keysStatus[key], "style"),
                wordData.sequence.letters.includes(key) ? styles.isSequence : "",
              ].filter(Boolean).join(" ")}
              {...(!isGameOver && { 
                onPointerDown: (event) => handleKeyPress(event, key),
                onPointerUp: () => handleKeyUp(key),
                onPointerLeave: handlePointerLeave,
                onKeyDown: (event) => handleKeyDown(event, key),
                onKeyUp: () => handleKeyUp(key),
                onContextMenu: (event) => handleContextMenu(event),
              })}
            >
              {key === "Backspace" ? "⌫" : key.toUpperCase()}
              <span className={styles.icon}>{getKeyStyleOrIcon(keysStatus[key], "icon")}</span>
            </button>
          ))}
        </div>
      ))}
      <div
        className={styles.buttonWrapper}
      >
        <button
          disabled={loading}
          className={[
            isKeyActive("Blank") ? styles.active : "",
            styles.button,
          ].filter(Boolean).join(" ")}
          {...(!isGameOver && {
            onPointerDown: (event) => handleKeyPress(event, "Blank"),
            onPointerUp: () => handleKeyUp("Blank"),
            onPointerLeave: handlePointerLeave,
            onKeyDown: (event) => handleKeyDown(event, "Blank"),
            onKeyUp: () => handleKeyUp("Blank"),
            onContextMenu: (event) => handleContextMenu(event),
          })}
        >
          <span>Space</span>
          <Square size={18} />
        </button>
        <button
          disabled={loading}
          className={[
            isKeyActive("Enter") ? styles.active : "",
            styles.button,
          ].filter(Boolean).join(" ")}
          {...(!isGameOver && {
            onPointerDown: (event) => handleKeyPress(event, "Enter"),
            onPointerUp: () => handleKeyUp("Enter"),
            onPointerLeave: handlePointerLeave,
            onKeyDown: (event) => handleKeyDown(event, "Enter"),
            onKeyUp: () => handleKeyUp("Enter"),
            onContextMenu: (event) => handleContextMenu(event),
          })}
        >
          <span>
            {editing.toggled ? "Change" : "Enter"}
          </span>
          <KeyReturn size={18} />
        </button>
      </div>
    </div>
  )
}