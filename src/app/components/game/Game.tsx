"use server"

import { api } from "~/trpc/server";

import styles from "./Game.module.css";
import Sequence from "../sequence/Sequence";
import GuessArea from "../guess-area/GuessArea";

export default async function Game() {
  const WORD_LENGTH = 6;
  const wordData = await api.word.get({ length: WORD_LENGTH });

  return (
    <main 
      className={styles.game}
    >
      <Sequence 
        wordData={wordData}
      />
      <GuessArea 
        wordData={wordData}
      />
    </main>
  )
}