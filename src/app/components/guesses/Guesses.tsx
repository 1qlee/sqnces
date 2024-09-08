import { memo } from "react";

import styles from "./Guesses.module.css";
import { type GameState } from "~/app/types/gameTypes";
import { X, Empty, Check, Square } from "@phosphor-icons/react";

type GuessesProps = {
  gameState: GameState;
  guess: string;
  wordData: {
    word: string;
    sequence: string;
  };
}

function parseLetterStyle(type: string) {
  switch (type) {
    case "correct":
      return styles.isCorrect;
    case "incorrect":
      return styles.isIncorrect;
    case "misplaced":
      return styles.isMisplaced;
    case "empty":
      return styles.isEmpty;
    default:
      return null;
  }
}

function parseLetterIcon(type: string) {
  switch (type) {
    case "correct":
      return <Check size={10} weight="bold" />;
    case "incorrect":
      return <X size={10} weight="bold" />;
    case "misplaced":
      return <Square size={10} weight="bold" />;
    case "empty":
      return <Empty size={10} weight="bold" />;
    default:
      return null;
  }
}

export const Guesses = memo(({
  gameState,
  guess,
}: GuessesProps) => {
  const { guesses, status } = gameState;

  if (guesses.length === 0 && guess.length === 0) {
    return (
      <p className={styles.helperText}>Start typing to enter your first guess</p>
    )
  }

  return (
    <div className={styles.wrapper}>
      {guesses.map((guess, index) => (
        <div className={styles.word} key={index}>
          {guess?.validationMap.map((char, i) => (
            <span
              key={i}
              className={`${styles.letter} ${styles.noAnimation} ${parseLetterStyle(char.type)}`}
            >
              {char.letter}
              <span className={styles.icon}>{parseLetterIcon(char.type)}</span>
            </span>
          ))}
        </div>
      ))}
      {status === "playing" && (
        <div className={styles.word}>
          {guess?.split("").map((char, i) => (
            <span
              key={i}
              className={styles.letter}
            >
              {char}
            </span>
          ))}
        </div>
      )}
    </div>
  )
});

Guesses.displayName = "Guesses";