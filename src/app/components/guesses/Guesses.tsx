import { memo } from "react";

import styles from "./Guesses.module.css";
import type { Word } from "~/server/types/word";
import { type GameState } from "~/app/components/game/Game.types";
import { X, Empty, Check, ArrowsLeftRight } from "@phosphor-icons/react";
import { Guess } from "../guess-area/Guess.types";

type GuessesProps = {
  gameState: GameState;
  guess: Guess;
  wordData: Word;
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
      return "";
  }
}

function parseLetterIcon(type: string) {
  switch (type) {
    case "correct":
      return <Check size={10} weight="bold" />;
    case "incorrect":
      return <X size={10} weight="bold" />;
    case "misplaced":
      return <ArrowsLeftRight size={10} weight="bold" />;
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

  if (guesses.length === 0 && guess.letters.length === 0) {
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
          {guess?.letters.map((char, i) => (
            <span
              key={i}
              className={`${styles.letter} ${styles.isCurrentGuess}`}
            >
              {char === "Blank" ? "" : char}
            </span>
          ))}
        </div>
      )}
    </div>
  )
});

Guesses.displayName = "Guesses";