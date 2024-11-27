"use client";

import { type Dispatch, memo, type SetStateAction, useRef, useEffect } from "react";
import { useGameContext, useGameDispatch } from "~/app/contexts/GameProvider";

import styles from "./Guesses.module.css";
import type { Editing, Game } from "~/app/components/game/Game.types";
import type { GuessData, Guess } from "../guess-area/Guess.types";
import { X, Empty, Check, ArrowsLeftRight, Pen } from "@phosphor-icons/react";

type GuessesProps = {
  guess: Guess;
  currentGame: Game;
  setGuess: Dispatch<SetStateAction<Guess>>;
}

function parseLetterStyle(type: string) {
  switch (type) {
    case "correct":
      return styles.isCorrect;
    case "incorrect":
      return styles.isIncorrect;
    case "misplaced":
      return styles.isMisplaced;
    case "misplacedEmpty":
      return styles.isMisplacedEmpty;
    case "incorrectEmpty":
      return styles.isIncorrectEmpty;
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
  currentGame,
  guess,
  setGuess,
}: GuessesProps) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const isGameOver = currentGame.status === "won" || currentGame.status === "lost";
  const dispatch = useGameDispatch();
  const context = useGameContext();
  const { editing } = context;

  useEffect(() => {
    if (wrapperRef.current) {
      const hasScrollableContent =
      wrapperRef.current.scrollHeight > wrapperRef.current.clientHeight;

      if (hasScrollableContent) {
        // Scroll to the bottom if the content is scrollable
        wrapperRef.current.scrollTop = wrapperRef.current.scrollHeight;
      }
    }
  }, [guess])

  if (currentGame.guesses.length === 0 && guess.letters.length === 0) {
    return (
      <p className={styles.helperText}>Start typing to enter your first guess</p>
    )
  }

  function handleEditCurrGuess(index: number) {
    if (editing.key === index) {
      dispatch({
        type: "editKey",
        key: index,
      });
    }
    else {
      dispatch({
        type: "editKey",
        toggled: true,
        key: index,
      });
    }
  }

  function handleEditPrevGuess(guess: GuessData, index: number) {
    const letters = guess.validationMap.map(char => char.letter);

    setGuess({
      string: guess.word,
      letters: letters,
    })
    dispatch({
      type: "editKey",
      toggled: true,
      key: index,
    });
  }

  return (
    <div 
      className={styles.wrapper}
      ref={wrapperRef}
    >
      {currentGame.guesses.map((guess, index) => (
        <div className={styles.word} key={index}>
          {guess?.validationMap.map((char, i) => (
            <span
              key={i}
              className={`${styles.letter} ${styles.noAnimation} ${parseLetterStyle(char.type)}`}
              {...(!isGameOver && { onPointerDown: () => handleEditPrevGuess(guess, index) })}
            >
              {char.letter}
              {char.type === "misplacedEmpty" ? (
                <>
                  <span className={[styles.icon, styles.isLeft].join(" ")}><ArrowsLeftRight size={10} weight="bold" /></span>
                  <span className={styles.icon}><Empty size={10} weight="bold" /></span>
                </>
              ) : char.type === "incorrectEmpty" ? (
                  <>
                    <span className={[styles.icon, styles.isLeft].join(" ")}><X size={10} weight="bold" /></span>
                    <span className={styles.icon}><Empty size={10} weight="bold" /></span>
                  </>
              ) : (
                <span className={styles.icon}>{parseLetterIcon(char.type)}</span>
              )}
            </span>
          ))}
        </div>
      ))}
      {currentGame.status === "playing" && (
        <div className={styles.word}>
          {guess?.letters.map((char, i) => (
            <span
              key={i}
              className={[
                styles.letter,
                styles.isCurrentGuess,
                editing.toggled && editing.key === i ? styles.isEditing : "",
              ].filter(Boolean).join(" ")}
              {...(!isGameOver && { onPointerDown: () => handleEditCurrGuess(i) })}
            >
              <span>{char === "Blank" ? "" : char}</span>
              <span className={styles.icon}>{editing.toggled && editing.key === i && <Pen size={10} />}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  )
});

Guesses.displayName = "Guesses";