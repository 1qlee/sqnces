"use client"

import { useState } from "react";

import Keyboard from "../keyboard/Keyboard";
import styles from "./Playarea.module.css";
import { SubmittedWords } from "../submitted-words/SubmittedWords";

export function validateAlpha(char: string) {
  // if char is not an alpha character
  if (!/^[a-zA-Z]$/.test(char)) {
    return false;
  }

  return true;
}

export default function Playarea() {
  const [submittedWords, setSubmittedWords] = useState<string[]>([]);

  return (
    <main 
      className={styles.playarea}
    >
      <SubmittedWords 
        words={submittedWords}
      />
      <Keyboard
        setSubmittedWords={setSubmittedWords}
      />
    </main>
  )
}