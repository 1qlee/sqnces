"use client"

import { type Dispatch, type SetStateAction, useEffect, useState } from "react";
import { validateGuess } from "~/app/actions/validateGuess";

import styles from "./Keyboard.module.css";
import { Backspace, KeyReturn } from "@phosphor-icons/react";
import { useRef } from "react";
import { Guess } from "../guess/Guess";
import type { GameState } from "../guess-area/GuessArea";
import toast from "react-hot-toast";
import "~/styles/toast.css";

const KeyboardRows = [
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p',],
  ['', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ''],
  ["Enter", 'z', 'x', 'c', 'v', 'b', 'n', 'm', 'Backspace']
]

interface KeyboardProps {
  gameState: GameState;
  setGameState: Dispatch<SetStateAction<GameState>>;
  wordData: {
    word: string;
    sequence: string;
  };
}

export default function Keyboard({ 
  gameState,
  setGameState,
  wordData,
}: KeyboardProps) {
  const isGameOver = gameState.status === "won" || gameState.status === "lost";
  const [loading, setLoading] = useState(false);
  const [guess, setGuess] = useState("");
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
      if (!loading) {
        // unfocus any keys
        if (document.activeElement instanceof HTMLElement && document.activeElement !== document.body) {
          document.activeElement.blur();
        }

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
          if (validateAlpha(key)) {
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

  const isKeyActive = (key: string) => {
    if (key.length > 0) {
      return activeKeys.includes(key);
    }
  };

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

  async function handleGuessSubmit() {
    if (guessRef.current.length > 3) {
      const word = guessRef.current;
      
      // if the guess doesn't include the sequence
      if (wordData.sequence && !word.includes(wordData.sequence)) {
        toast.error("Word must include the sequence");
      }
      else {
        setLoading(true);
        // check if guess is a valid word
        const validateData = await validateGuess(word);
        const newGuessIndex = gameState.currentGuessIndex + 1

        if (validateData.isValid) {
          setGameState({
            ...gameState,
            guesses: [
              ...gameState.guesses,
              word,
            ],
            currentGuessIndex: newGuessIndex,
          })
          setGuess("");
          return setLoading(false);;
        }
        else {
          setLoading(false);
          return toast.error("Invalid word");
        }
      }
    }
    else {
      return toast.error("Word is 4 letters or more.")
    }
  }

  // ***** EVENT HANDLERS ***** //
  function handleKeyPress(event: React.PointerEvent<HTMLButtonElement> | React.KeyboardEvent<HTMLButtonElement>, key: string) {
    if (!loading && !isGameOver) {
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
        if (validateAlpha(key)) {
          setGuess(prev => prev + key.toUpperCase());
        }
      }
    }
  }

  // when keys are focused, we need to handle inputting keys via the "Enter" key
  function handleKeyDown(event: React.KeyboardEvent<HTMLButtonElement>, key: string) {
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
              className={`
                ${key.length > 0 ? styles.key : styles.keySpacer} 
                ${isKeyActive(key) ? styles.active : ""}
                ${key === "Enter" || key === "Backspace" ? styles.largeKey : ""}
              `}
              {...(!isGameOver && { 
                onPointerDown: (event) => handleKeyPress(event, key),
                onPointerUp: () => handleKeyUp(key),
                onPointerLeave: handlePointerLeave,
                onKeyDown: (event) => handleKeyDown(event, key),
                onKeyUp: () => handleKeyUp(key),
                onContextMenu: (event) => handleContextMenu(event, key),
              })}
            >
              {key === "Backspace" ? <Backspace size={20} /> : key === "Enter" ? <KeyReturn size={20} /> : key.toUpperCase()}
            </button>
          ))}
        </div>
      ))}
    </div>
  )
}