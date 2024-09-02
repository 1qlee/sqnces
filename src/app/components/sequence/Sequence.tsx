import styles from "./Sequence.module.css";
import type { WordData } from "~/app/components/game/Game";

export default async function Sequence({
  data
}: WordData) {

  return (
    <div className={styles.wrapper}>
      <div className={styles.sequence}>
        {data.sequence.split("").map((char, i) => (
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