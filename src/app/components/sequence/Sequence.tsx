"use client";

import styles from "./Sequence.module.css";
import { Word } from "~/server/types/word";

export default function Sequence({
  wordData
}: { wordData: Word }) {

  return (
    <div className={styles.wrapper}>
      <div className={styles.sequence}>
        {wordData.data.sequence.letters.map((char, i) => (
          <span 
            key={i}
            className={styles.letter}
          >
            {char}
          </span>
        ))}
      </div>
    </div>
  )
}