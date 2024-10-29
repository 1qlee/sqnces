"use client"

import "~/styles/toast.css";
import styles from "./Keyboard.module.css";
import toast from "react-hot-toast";
import type { ClientWord, CheckedGuess } from "~/server/types/word";
import type { Editing, Game } from "../game/Game.types";
import type { Guess } from "../guess-area/Guess.types";
import type { Status, KeysStatus, Key, KeyStyleOrIcon } from "../keyboard/Keyboard.types";
import useGameState from "~/app/hooks/useGameState";
import useGuessSearch from "~/app/hooks/useGuessSearch";
import { X, Check, ArrowsLeftRight, KeyReturn, Square } from "@phosphor-icons/react";
import { type Dispatch, type SetStateAction, useEffect, useState, useRef } from "react";
import { checkGuess } from "~/app/actions/checkGuess";

const KeyboardRows: Key[][] = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['', 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ''],
  ['', '', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'Backspace', '']
]

interface KeyboardProps {
  editing: Editing;
  currentGame: Game;
  keysStatus: KeysStatus;
  guess: Guess;
  wordData: ClientWord;
  setKeysStatus: Dispatch<SetStateAction<KeysStatus>>
  setEditing: Dispatch<SetStateAction<Editing>>;
  setGuess: Dispatch<SetStateAction<{
    string: string;
    letters: Key[];
  }>>;
}

export default function Keyboard({ 
  guess,
  currentGame,
  keysStatus,
  editing,
  wordData,
  setEditing,
  setGuess,
  setKeysStatus,
}: KeyboardProps) {
  const searchGuess = useGuessSearch();
  const [activeKeys, setActiveKeys] = useState<Key[]>([]);
  const [gameState, setGameState] = useGameState();
  const [loading, setLoading] = useState(false);
  const guessRef = useRef(guess); // Create a ref to store the guess value
  const isGameOver = currentGame.status === "won" || currentGame.status === "lost";
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const repeatInterval = useRef<ReturnType<typeof setInterval> | null>(null);

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
        setEditing({
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
      setEditing({
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
          setEditing({
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
  function validateAlpha(char: string) {
    // if char is not an alpha character
    if (!/^[a-zA-Z]$/.test(char)) {
      return false;
    }

    return true;
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
      return setEditing({
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
            usersDate: new Date().toLocaleDateString(),
            length: wordData.length,
            hardMode: gameState.settings.hardMode,
            puzzleId: gameState.puzzle!,
          }),
          timeoutPromise,
        ]) as CheckedGuess;

        if (!validateData.isValid) {
          setLoading(false);
          toast.dismiss();
          return toast.error("Invalid word");
        }

        if (validateData.status) {
          switch (validateData.status) {
            case "noSequence":
              toast.dismiss();
              return toast.error("Word must include the sequence.");
            case "invalidPuzzle":
              location.reload();
              toast.dismiss();
              return toast.error("Invalid puzzle.");
            default:
              break;
          }
        }

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
          toast.success("You won!");
        } else if (gameStatus === "lost") {
          toast.error("You lost!");
        }

        setGameState({
          ...gameState,
          games: {
            ...gameState.games,
            [wordData.length]: {
              guesses: [...currentGame.guesses, newGuess],
              status: gameStatus,
            },
          },
        });

        setGuess({
          string: "",
          letters: [],
        });

        setLoading(false);
      } catch (err) {
        setLoading(false);

        toast.error("Server error. Please refresh and try again.");
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