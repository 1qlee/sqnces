import { memo } from "react";

import styles from "./Guesses.module.css";

interface GuessesProps {
  submittedGuesses: string[];
}

export const Guesses = memo(({
  submittedGuesses,
}: GuessesProps) => {
  return (
    <div className={styles.wrapper}>
      {submittedGuesses.map((guess, index) => (
        <div className={styles.word} key={index}>
          {guess.split("").map((char, i) => (
            <p
              key={i}
              className={styles.letter}
            >
              {char}
            </p>
          ))}
        </div>
      ))}
    </div>
  )
});

Guesses.displayName = "Guesses";