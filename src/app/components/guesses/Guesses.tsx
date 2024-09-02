import { memo, useMemo } from "react";

import styles from "./Guesses.module.css";
import { ArrowFatDown, ArrowFatUp, CheckFat } from "@phosphor-icons/react";
import type { GameState } from "../guess-area/GuessArea";

type GuessesProps = {
  gameState: GameState;
  guess: string;
  wordData: {
    word: string;
    sequence: string;
  };
}

const BlankWord = memo(({ word, guess }: { word: string, guess: string }) => {
  const splitWord = word.split("");

  return (
    <div className={styles.word}>
      {splitWord.map((char, i) => (
        <span
          key={i}
          className={styles.letter}
          style={{ animationDelay: `${i * 50}ms` }}
        >
          {guess[i]}
        </span>
      ))}
    </div>
  )
})

export const Guesses = memo(({
  gameState,
  guess,
  wordData,
}: GuessesProps) => {
  const { word } = wordData;
  const { guesses, currentGuessIndex } = gameState;

  return (
    <div className={styles.wrapper}>
      {guesses.map((guess, index) => (
        <div className={styles.word} key={index}>
          {guess?.validationMap.map((char, i) => (
            <span
              key={i}
              className={`${styles.letter} ${styles.noAnimation}`}

            >
              {char.letter}
            </span>
          ))}
        </div>
      ))}
      {gameState.status === "playing" && currentGuessIndex > 0 ? (
        <BlankWord 
          word={word} 
          guess={guess}
        />
      ) : (
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
BlankWord.displayName = "BlankWord";