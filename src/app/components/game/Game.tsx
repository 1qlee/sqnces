import styles from "./Game.module.css";
import Sequence from "../sequence/Sequence";
import GuessArea from "../guess-area/GuessArea";

export function validateAlpha(char: string) {
  // if char is not an alpha character
  if (!/^[a-zA-Z]$/.test(char)) {
    return false;
  }

  return true;
}

export default async function Game() {

  return (
    <main 
      className={styles.game}
    >
      <Sequence />
      <GuessArea />
    </main>
  )
}