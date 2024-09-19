import { Dispatch, memo, SetStateAction, useState } from "react";

import styles from "./Guesses.module.css";
import type { Word } from "~/server/types/word";
import { type GameState } from "~/app/components/game/Game.types";
import { X, Empty, Check, Swap, Pen } from "@phosphor-icons/react";
import { Guess } from "../guess-area/Guess.types";

type GuessesProps = {
  gameState: GameState;
  guess: Guess;
  wordData: Word;
  setGuess: Dispatch<SetStateAction<Guess>>;
  setGameState: Dispatch<SetStateAction<GameState>>;
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
      return <Swap size={10} weight="bold" />;
    case "empty":
      return <Empty size={10} weight="bold" />;
    default:
      return null;
  }
}

export const Guesses = memo(({
  gameState,
  guess,
  setGameState,
}: GuessesProps) => {
  const { guesses, status } = gameState;

  if (guesses.length === 0 && guess.letters.length === 0) {
    return (
      <p className={styles.helperText}>Start typing to enter your first guess</p>
    )
  }

  function handlePointerDown(event: React.PointerEvent<HTMLSpanElement>, index: number) {
    if (gameState.editing.key === index) {
      setGameState({
        ...gameState,
        editing: {
          toggled: !gameState.editing.toggled,
          key: index,
        },
      });
    }
    else {
      setGameState({
        ...gameState,
        editing: {
          toggled: true,
          key: index,
        }
      });
    }
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
              className={[
                styles.letter,
                styles.isCurrentGuess,
                gameState.editing.toggled && gameState.editing.key === i ? styles.isEditing : "",
              ].filter(Boolean).join(" ")}
              onPointerDown={event => handlePointerDown(event, i)}
            >
              <span>{char === "Blank" ? "" : char}</span>
              <span className={styles.icon}>{gameState.editing.toggled && gameState.editing.key === i && <Pen size={10} />}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  )
});

Guesses.displayName = "Guesses";