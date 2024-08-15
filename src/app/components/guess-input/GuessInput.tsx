"use client"

import { useEffect, useState } from "react";
import styles from "./GuessInput.module.css";
import { GuessProps } from "../playarea/Playarea";

export default function GuessInput({ guess, setGuess }: GuessProps) {

  function handleKeyDown(event: KeyboardEvent) {
    // Allow only alpha characters
    const char = event.key;

    if (char === 'Backspace' || char === 'Delete') {
      setGuess(prev => prev.slice(0, -1))
    }
    else if (char !== 'Tab') {
      if (!/^[a-zA-Z]$/.test(char)) {
        event.preventDefault();
      }
      else {
        setGuess(prev => prev + char)
      }
    }
  }

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    }
  }, [])

  return (
    <div className={styles.input}>
      {guess ? (
        <span>{guess}</span>
      ) : (
        <div>Start typing...</div>
      )}
    </div>
  )
}