import styles from "./Sequence.module.css";
import { type WordData } from "~/app/types/gameTypes";

export default async function Sequence({
  wordData
}: { wordData: WordData }) {

  return (
    <>
      <div className={styles.wrapper}>
        <div className={styles.sequence}>
          {wordData.sequence.split("").map((char, i) => (
            <span 
              key={i}
              className={styles.letter}
            >
              {char}
            </span>
          ))}
        </div>
      </div>
    </>
  )
}