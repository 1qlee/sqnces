"use client";

import { memo } from "react";

import styles from "./SubmittedWords.module.css";

interface SubmittedWordsProps {
  words: string[];
}

export const SubmittedWords = memo(({
  words,
}: SubmittedWordsProps) => {
  return (
    <div className={styles.wrapper}>
      {words.map((word, index) => (
        <p 
          key={index}
          className={styles.word}  
        >
          {word}
        </p>
      ))}
    </div>
  )
});

SubmittedWords.displayName = "SubmittedWords";