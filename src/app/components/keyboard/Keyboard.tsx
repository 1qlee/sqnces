"use client"

import { type Dispatch, type SetStateAction, useEffect, useState } from "react";
import { validateGuess } from "~/app/actions/validateGuess";
import { X, Check, Square } from "@phosphor-icons/react";

import styles from "./Keyboard.module.css";
import { useRef } from "react";
import { Guess } from "../guess/Guess";
import { type LetterData, type GameState, type GuessData, type SplitWordLetter } from "~/app/types/gameTypes";
import toast from "react-hot-toast";
import "~/styles/toast.css";

const KeyboardRows = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['', 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ''],
  ['', '', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'Backspace', '']
]
const WORD_LENGTH = 6;

interface KeyboardProps {
  gameState: GameState;
  setGameState: Dispatch<SetStateAction<GameState>>;
  guess: string;
  setGuess: Dispatch<SetStateAction<string>>;
  wordData: {
    word: string;
    sequence: string;
    letters: string[];
  };
}

type KeyStatus = "misplaced" | "incorrect" | "correct" | "sequence";

type Keys = Record<string, KeyStatus>;

export default function Keyboard({ 
  gameState,
  guess,
  setGameState,
  setGuess,
  wordData,
}: KeyboardProps) {
  const isGameOver = gameState.status === "won" || gameState.status === "lost";
  const [keysStatus, setKeysStatus] = useState<Keys>({});
  const [loading, setLoading] = useState(false);
  const [activeKeys, setActiveKeys] = useState<string[]>([]);
  const guessRef = useRef(guess); // Create a ref to store the guess value
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const repeatInterval = useRef<ReturnType<typeof setInterval> | null>(null);

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
        const key = event.key;
        updateActiveKeys(key);

        if (key === 'Backspace' || key === 'Delete') {
          const modifierPressed = event.shiftKey || event.ctrlKey || event.metaKey;

          if (modifierPressed) {
            setGuess("");
          } else {
            deleteChar();
          }
        } else if (key !== 'Tab') {
          if (validateAlpha(key) && guessRef.current.length < WORD_LENGTH) {
            setGuess(prev => prev + key.toUpperCase());
          } else if (key === "Enter") {
            void handleGuessSubmit();
          } else {
            event.preventDefault();
          }
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
  }, [loading, gameState.status])
  
  // ***** HELPERS ***** //\
  function validateAlpha(char: string) {
    // if char is not an alpha character
    if (!/^[a-zA-Z]$/.test(char)) {
      return false;
    }

    return true;
  }

  function isKeyActive(key: string) {
    if (key.length > 0) {
      return activeKeys.includes(key);
    }
  };

  function getKeyStyleOrIcon(
    status: "misplaced" | "incorrect" | "correct" | "sequence" | "" = "",
    type: "style" | "icon",
  ) {
    type StatusMap = Record<string, { style: string | undefined; component: JSX.Element }>;

    const statusMap: StatusMap = {
      "": { style: "", component: <></> },
      correct: { style: styles.isCorrect, component: <Check /> },
      incorrect: { style: styles.isIncorrect, component: <X /> },
      misplaced: { style: styles.isMisplaced, component: <Square /> },
      sequence: { style: styles.isSequence, component: <Check /> },
    };

    const result = statusMap[status];

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
    setGuess(prev => prev.slice(0, -1));
  }

  function updateActiveKeys(key: string) {
    setActiveKeys(prev => [...prev, key]);
  }

  function createValidationMap(guessedWord: string) {
    const { word, sequence, letters } = wordData;
    const fullWord: { letter: string, used: boolean }[] = letters.map((letter) => ({ letter, used: false }));
    const splitWord: SplitWordLetter[] = [];
    const result: LetterData[] = []; // returned variable
    // guess variables
    const guessLength = guessedWord.length; // length of the guess
    const charsBefore = guessedWord.indexOf(sequence); // number of characters before the sequence begins 
    const charsAfter = guessLength - charsBefore - 3; // number of characters after the sequence ends 
    // word variables
    const wordLength = word.length; // length of the word 
    const startIndex = word.indexOf(sequence) - charsBefore; // can be a negative number 
    const endIndex = word.indexOf(sequence) + 3 + charsAfter; // 

    // we need to generate an array of letters that compares respectively to the letters in guess
    for (let n = startIndex; n < endIndex; n++) {
      // if the index is out of bounds (aka the guess has more characters on either side of the sequence than the word)
      if (n < 0 || n > wordLength) {
        splitWord.push({ 
          letter: "",
          sequence: false,
          index: n,
        });
     }
      // ignore the sequence's letters
      else if (n >= word.indexOf(sequence) && n < word.indexOf(sequence) + 3) {
        splitWord.push({ 
          letter: word.charAt(n),
          sequence: true,
          index: n,
        });
      }
      else {
        splitWord.push({ 
          letter: word.charAt(n),
          sequence: false,
          index: n,
        });
      }
    }

    // pass through the guess once first to check for correct letters
    for (let i = 0; i < guessLength; i++) {
      const guessedLetter = guessedWord.charAt(i);
      const comparedLetter = splitWord[i];

      if (comparedLetter && comparedLetter.letter === guessedLetter && !comparedLetter.sequence) {
        fullWord[comparedLetter.index]!.used = true;
        setKeysStatus(prev => ({
          ...prev,
          [guessedLetter]: "correct",
        }));
        result[i] = { letter: guessedLetter, type: "correct" };
      }
    }

    for (let i = 0; i < guessLength; i++) {
      const guessedLetter = guessedWord.charAt(i);
      const misplacedLetter = fullWord.find((l) => l.letter === guessedLetter && !l.used);
      const comparedLetter = splitWord[i];

      if (comparedLetter && !result[i]) {
        if (comparedLetter.sequence) {
          setKeysStatus(prev => ({
            ...prev,
            [guessedLetter]: "sequence",
          }));
          result[i] = { letter: guessedLetter, type: "sequence" };
        }
        else if (comparedLetter.letter === "") {
          result[i] = { letter: guessedLetter, type: "empty" };
        }
        else if (misplacedLetter) {
          misplacedLetter.used = true;
          setKeysStatus(prev => ({
            ...prev,
            [guessedLetter]: "misplaced",
          }));
          result[i] = { letter: guessedLetter, type: "misplaced" };
        }
        else {
          if (result.filter(f => f.letter === guessedLetter && f.type === "correct").length === 0) {
            setKeysStatus(prev => ({
              ...prev,
              [guessedLetter]: "incorrect",
            }));
          }

          result[i] = { letter: guessedLetter, type: "incorrect" };
        }
      }
    }

    return result
  }

  async function handleGuessSubmit() {
    const guessedWord = guessRef.current;

    if (guessedWord.length < 4) {
      toast.dismiss();
      return toast.error("Minimum 4-letter word.");
    }

    // if the guess doesn't include the sequence
    if (!guessedWord.includes(wordData.sequence)) {
      toast.dismiss();
      toast.error("Word must include the sequence");
    }
    else {
      setLoading(true);
      // check if guess is a valid word
      const validateData = await validateGuess(guessedWord);
      const newGuessIndex = gameState.currentGuessIndex + 1

      if (validateData.isValid) {
        const newGuess: GuessData = {
          number: newGuessIndex,
          validationMap: createValidationMap(guessedWord),
          word: guessedWord,
        }

        setGameState({
          ...gameState,
          guesses: [
            ...gameState?.guesses,
            newGuess,
          ],
          currentGuessIndex: newGuessIndex,
        })
        setGuess("");
        return setLoading(false);;
      }
      else {
        setLoading(false);
        toast.dismiss();
        return toast.error("Invalid word");
      }
    }
  }

  // ***** EVENT HANDLERS ***** //
  function handleKeyPress(event: React.PointerEvent<HTMLButtonElement> | React.KeyboardEvent<HTMLButtonElement>, key: string) {
    if ("pointerType" in event && event.button !== 0) {
      return 
    }

    if (!loading && !isGameOver) {
      event.preventDefault();
      updateActiveKeys(key);

      // deleting
      if (key === "Backspace") {

        // check for non-keyboard event
        if (!('key' in event)) {
          // detect long press
          longPressTimer.current = setTimeout(() => {
            repeatInterval.current = setInterval(() => {
              deleteChar();
            }, 100);
          }, 500);

          deleteChar();
        }
        else {
          if (event.shiftKey || event.ctrlKey || event.metaKey) {
            setGuess("");
          } else {
            deleteChar();
          }
        }
      }
      // submitting
      else if (key === "Enter") {
        void handleGuessSubmit();
      }
      // inputting
      else {
        if (validateAlpha(key) && guessRef.current.length < WORD_LENGTH) {
          setGuess(prev => prev + key.toUpperCase());
        }
      }
    }
  }

  // when keys are focused, we need to handle inputting keys via the "Enter" key
  function handleKeyDown(event: React.KeyboardEvent<HTMLButtonElement>, key: string) {
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
  function handleContextMenu(event: React.MouseEvent<HTMLButtonElement, MouseEvent>, key: string) {
    event.preventDefault();
    return false;
  }

  return (
    <div 
      className={styles.keyboard}
    >
      <Guess 
        guess={guess}
        loading={loading}
      />
      {KeyboardRows.map((row, i) => (
        <div 
          className={styles.row}
          key={i}
        >
          {row.map((key, index) => (
            <button
              key={key + index}
              className={[
                key.length > 0 ? styles.key : styles.keySpacer,
                isKeyActive(key) ? styles.active : "",
                key === "Backspace" ? styles.largeKey : "",
                getKeyStyleOrIcon(keysStatus[key], "style")
              ].filter(Boolean).join(" ")}
              {...(!isGameOver && { 
                onPointerDown: (event) => handleKeyPress(event, key),
                onPointerUp: () => handleKeyUp(key),
                onPointerLeave: handlePointerLeave,
                onKeyDown: (event) => handleKeyDown(event, key),
                onKeyUp: () => handleKeyUp(key),
                onContextMenu: (event) => handleContextMenu(event, key),
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
          className={styles.submitButton}
          {...(!isGameOver && {
            onPointerDown: (event) => handleKeyPress(event, "Enter"),
            onPointerUp: () => handleKeyUp("Enter"),
            onPointerLeave: handlePointerLeave,
            onKeyDown: (event) => handleKeyDown(event, "Enter"),
            onKeyUp: () => handleKeyUp("Enter"),
            onContextMenu: (event) => handleContextMenu(event, "Enter"),
          })}
        >
          <span>Enter</span>
        </button>
      </div>
    </div>
  )
}