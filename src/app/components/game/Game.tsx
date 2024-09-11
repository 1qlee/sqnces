"use server"

import { api } from "~/trpc/server";

import styles from "./Game.module.css";
import Sequence from "../sequence/Sequence";
import GuessArea from "../guess-area/GuessArea";

export default async function Game({
  wordLength,
}: {
  wordLength: number;
}) {
  const wordData = await api.word.get({ length: wordLength });

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