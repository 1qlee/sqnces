"use client";

import React from "react";

import styles from "./Guess.module.css";

interface GuessProps {
  guess: string;
}

export const Guess = React.memo(({
  guess,
}: GuessProps) => {
  return (
    <div className={styles.guess}>
      {guess && <h1>{guess}</h1>}
    </div>
  )
})

Guess.displayName = "Guess";