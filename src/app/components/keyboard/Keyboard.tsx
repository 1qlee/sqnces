"use client"

import { useEffect, useState } from "react";

import styles from "./Keyboard.module.css";
import { Backspace, KeyReturn } from "@phosphor-icons/react/dist/ssr";
import { GuessProps, validateAlpha } from "../playarea/Playarea";
import { useRef } from "react";

const KeyboardRows = [
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', "Backspace"],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', "Enter"],
  ['z', 'x', 'c', 'v', 'b', 'n', 'm']
]

export default function Keyboard({ 
  guess, 
  activeKeys, 
  setGuess, 
  setActiveKeys,
  setSubmittedWords,
}: GuessProps) {
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const repeatInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    console.log("yo")
    document.addEventListener('keydown', handleKeyTyping);
    document.addEventListener('keyup', () => setActiveKeys([]));

    return () => {
      document.removeEventListener('keydown', handleKeyTyping);
      document.removeEventListener('keyup', () => setActiveKeys([]));
    }
  }, [guess])
  
  // ***** HELPERS ***** //
  const isKeyActive = (key: string) => activeKeys.includes(key);

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
  
  function handleKeyPress(event: React.KeyboardEvent<HTMLButtonElement> | React.MouseEvent<HTMLButtonElement, MouseEvent>, key: string) {
    updateActiveKeys(key);

    // deleting
    if (key === "Backspace" || key === "Delete") {
      // check for mouse event
      if (!('key' in event)) {
        // detect long press when deleting
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

  // ***** EVENT HANDLERS ***** //
  function handleGuessSubmit() {
    if (guess.length > 0) {
      setSubmittedWords && setSubmittedWords(prev => [...prev, guess]);
      setGuess("");
    }
  }

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
    }
    else if (key !== 'Tab') {
      if (validateAlpha(key)) {
        setGuess(prev => prev + key.toUpperCase())
      }
      else if (key === "Enter") {
        handleGuessSubmit();
      }
      else {
        event.preventDefault();
      }
    }
  }

  function handleMouseDown(event: React.MouseEvent<HTMLButtonElement, MouseEvent>, key: string) {
    handleKeyPress(event, key)
  }

  // when tabbing through keys, we need to handle inputting keys via the "Enter" key
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

  return (
    <div 
      className={styles.keyboard}
    >
      {KeyboardRows.map((row, i) => (
        <div 
          className={styles.row}
          key={i}
        >
          {row.map((key) => (
            <button
              key={key}
              className={styles.key + (isKeyActive(key) ? ` ${styles.active}` : "")}
              aria-label={key}
              onKeyDown={e => handleKeyDown(e, key)}
              onKeyUp={() => handleKeyUp(key)}
              onMouseDown={e => handleMouseDown(e, key)}
              onMouseUp={() => handleKeyUp(key)}
              onMouseLeave={() => handleMouseLeave()}
            >
              {key !== "Backspace" && key !== "Enter" && key.toUpperCase()}
              {key === "Backspace" && <Backspace size={20} />}
              {key === "Enter" && <KeyReturn size={20} />}
            </button>
          ))}
        </div>
      ))}
    </div>
  )
}