"use server"

import { api } from "~/trpc/server";

import styles from "./Game.module.css";
import Sequence from "../sequence/Sequence";
import GuessArea from "../guess-area/GuessArea";

export default async function Game() {
  const data = await api.word.get();

  return (
    <main 
      className={styles.game}
    >
      <Sequence 
        data={data}
      />
      <GuessArea 
        data={data}
      />
    </main>
  )
}