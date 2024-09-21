"use client";

import { Word } from "~/server/types/word";

import styles from "./Game.module.css";
import Sequence from "../sequence/Sequence";
import GuessArea from "../guess-area/GuessArea";
import Modal from "../modal/Modal";

export default function Game({
  wordData
}: { wordData: Word }) {

  return (
    <main 
      className={styles.game}
    >
      <Modal />
      <Sequence 
        wordData={wordData}
      />
      <GuessArea 
        wordData={wordData}
      />
    </main>
  )
}