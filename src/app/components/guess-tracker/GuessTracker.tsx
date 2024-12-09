import styles from "./GuessTracker.module.css";
import type { Game } from "../game/Game.types";
import clsx from "clsx";

const dummyGuesses = [
  "", "", "", "", "", ""
]

type GuessTrackerProps = {
  game: Game;
  size?: "large";
}

export default function GuessTracker({ 
  game,
  size,
}: GuessTrackerProps) {
  return (
    <div className={clsx(
      styles.tracker,
      size === "large" && styles.isLarge,
    )}>
      {dummyGuesses.map((_, i) => (
        <span
          key={i}
          className={
            clsx(
              styles.track,
              game.guesses[i] && styles.isFilled,
              game?.word === game.guesses[i]?.word && styles.isCorrect,
            )
          }>
        </span>
      ))}
    </div>
  )
}