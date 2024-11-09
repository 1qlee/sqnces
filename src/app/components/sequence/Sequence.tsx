import styles from "./Sequence.module.css";
import type { ClientWord } from "~/server/types/word";

type SequenceProps = {
  wordData: ClientWord;
}

export default function Sequence({
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
    </div>
  )
}