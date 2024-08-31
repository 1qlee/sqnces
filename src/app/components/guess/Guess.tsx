"use client";

import React from "react";

import styles from "./Guess.module.css";

interface GuessProps {
  guess: string;
  loading: boolean;
}

export const Guess = React.memo(({
  guess,
  loading,
}: GuessProps) => {
  return (
    <div className={`${styles.guess} ${loading ? styles.loading : ""}`}>
      {guess && <p>{guess}</p>}
    </div>
  )
})

Guess.displayName = "Guess";