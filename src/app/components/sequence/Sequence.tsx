import styles from "./Sequence.module.css";
import type { WordData } from "~/app/components/game/Game";

export default async function Sequence({
  data
}: WordData) {

  return (
    <div className={styles.sequence}>
      {data.sequence}
      <p>{data.word}</p>
    </div>
  )
}

