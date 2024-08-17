"use client";

import React from "react";

import styles from "./Guess.module.css";
import { GuessProps } from "../playarea/Playarea";

export const Guess = React.memo(({
  guess,
}: GuessProps) => {
  return (
    <div className={styles.input}>
      {guess && <h1>{guess}</h1>}
    </div>
  )
})