import { memo } from "react";

import styles from "./Guesses.module.css";
import { ArrowFatDown, ArrowFatUp, CheckFat } from "@phosphor-icons/react";
import type { GameState } from "../guess-area/GuessArea";

type GuessesProps = {
  gameState: GameState;
  wordData: {
    word: string;
    sequence: string;
  };
}

function countUnmatchedCharacters(string1: string, string2: string) {
  let unmatchedCount = 0;

  // Compare characters at each position
  for (let i = 0; i < string1.length; i++) {
    if (string1[i] !== string2[i]) {
      unmatchedCount++;
    }
  }

  return unmatchedCount;
}

export const Guesses = memo(({
  gameState,
  wordData,
}: GuessesProps) => {
  const { word } = wordData;
  const { guesses } = gameState;

  return (
    <div className={styles.wrapper}>
      {guesses.map((guess, index) => (
        <div className={styles.word} key={index}>
          {guess?.split("").map((char, i) => (
            <p
              key={i}
              className={styles.letter}
              style={{ animationDelay: `${i * 50}ms` }}
            >
              {char}
            </p>
          ))}
          {(index === 0 || index === 1 || index === 2) && (
            <span 
              className={styles.icon}
              style={{ animationDelay: `${guess.length * 50 + 300}ms` }}
            >
              {word.length === guess.length ? (
                <>
                  {index === 0 && (
                    <CheckFat size={16} weight="fill" color="var(--foreground)" />
                  )}
                  {index > 1 && (
                    <span style={{color: "red", fontSize:"0.75rem"}}>{countUnmatchedCharacters(guess, word)}</span>
                  )}
                </>
              ) : word.length > guess.length ? (
                <ArrowFatUp size={16} weight="fill" color="var(--foreground)" />
              ) : (
                <ArrowFatDown size={16} weight="fill" color="var(--foreground)" />
              )}
            </span>
          )}
        </div>
      ))}
    </div>
  )
});

Guesses.displayName = "Guesses";