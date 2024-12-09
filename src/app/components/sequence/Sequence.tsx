import { Game } from "../game/Game.types";
import styles from "./Sequence.module.css";
import type { ClientWord } from "~/server/types/puzzle";

import GuessTracker from "../guess-tracker/GuessTracker";

type SequenceProps = {
  currentGame: Game;
  wordData: ClientWord;
}

export default function Sequence({
  currentGame,
  wordData,
}: SequenceProps) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.sequence}>
        {wordData.sequence.letters.map((char, i) => (
          <span 
            key={i}
            className={styles.letter}
          >
            {char}
          </span>
        ))}
      </div>
      <GuessTracker 
        game={currentGame}
        size="large"
      />
    </div>
  )
}