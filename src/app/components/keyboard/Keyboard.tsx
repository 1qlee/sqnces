"use client"

import { type Dispatch, type SetStateAction, useEffect, useState } from "react";

import styles from "./Keyboard.module.css";
import { Backspace, KeyReturn } from "@phosphor-icons/react/dist/ssr";
import { validateAlpha } from "../playarea/Playarea";
import { useRef } from "react";
import { Guess } from "../guess/Guess";

const KeyboardRows = [
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p',],
  ['', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ''],
  ["Enter", 'z', 'x', 'c', 'v', 'b', 'n', 'm', 'Backspace']
]

interface KeyboardProps {
  setSubmittedWords?: Dispatch<SetStateAction<string[]>>;
}

export default function Keyboard({ 
  setSubmittedWords,
}: KeyboardProps) {
  const [guess, setGuess] = useState("");
  const guessRef = useRef(guess); // Create a ref to store the guess value
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const repeatInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const [activeKeys, setActiveKeys] = useState<string[]>([]);

  // Sync the ref with the state whenever it updates
  useEffect(() => {
    guessRef.current = guess;
  }, [guess]);

  useEffect(() => {
    function handleKeyTyping(event: KeyboardEvent) {
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
          console.log("ENTER: ", guessRef.current);
          handleGuessSubmit();
        } else {
          event.preventDefault();
        }
      }
    }

    document.addEventListener('keydown', handleKeyTyping);
    document.addEventListener('keyup', () => setActiveKeys([]));

    return () => {
      document.removeEventListener('keydown', handleKeyTyping);
      document.removeEventListener('keyup', () => setActiveKeys([]));
    }
  }, [])
  
  // ***** HELPERS ***** //
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

  // ***** EVENT HANDLERS ***** //
  // only to handle long press delete
  function handleKeyTouch(key: string) {
    handleKeyUp(key);
    
    if (key === "Backspace") {
      longPressTimer.current = setTimeout(() => {
        repeatInterval.current = setInterval(() => {
          deleteChar();
        }, 100);
      }, 500);
    }
  }

  function handleKeyPress(event: React.KeyboardEvent<HTMLButtonElement> | React.MouseEvent<HTMLButtonElement, MouseEvent>, key: string) {
    updateActiveKeys(key);

    // deleting
    if (key === "Backspace") {

      // check for mouse event (not a keyboard event)
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
      handleGuessSubmit();
    }
    // inputting
    else {
      
      if (validateAlpha(key)) {
        setGuess(prev => prev + key.toUpperCase());
      }
    }
  }

  function handleGuessSubmit() {
    if (guessRef.current.length > 0) {
      setSubmittedWords && setSubmittedWords(prev => [...prev, guessRef.current]);
      setGuess("");
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

  function handleMouseLeave() {
    clearTimers()

    if (activeKeys.length > 0) {
      setActiveKeys([]);
    }
  }

  // handle long press
  function handleContextMenu(event: React.MouseEvent<HTMLButtonElement, MouseEvent>, key: string) {
    event.preventDefault();
    handleKeyTouch(key);
  }


  return (
    <div 
      className={styles.keyboard}
    >
      <Guess 
        guess={guess}
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
              onTouchStart={() => handleKeyTouch(key)}
              onTouchEnd={() => handleKeyUp(key)}
              onMouseDown={(event) => event.button === 0 && handleKeyPress(event, key)}
              onMouseUp={() => handleKeyUp(key)}
              onMouseLeave={handleMouseLeave}
              onKeyDown={(event) => handleKeyDown(event, key)}
              onKeyUp={() => handleKeyUp(key)}
              onContextMenu={(event) => handleContextMenu(event, key)}
            >
              {key === "Backspace" ? <Backspace size={20} /> : key === "Enter" ? <KeyReturn size={20} /> : key.toUpperCase()}
            </button>
          ))}
        </div>
      ))}
    </div>
  )
}