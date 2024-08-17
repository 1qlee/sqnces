"use client"

import { Dispatch, SetStateAction, useState } from "react";

import { Guess } from "../guess/Guess";
import Keyboard from "../keyboard/Keyboard";
import styles from "./Playarea.module.css";
import { SubmittedWords } from "../submitted-words/SubmittedWords";

export interface GuessProps {
  guess: string;
  setGuess: Dispatch<SetStateAction<string>>;
  activeKeys: string[];
  setActiveKeys: Dispatch<SetStateAction<string[]>>;
  setSubmittedWords?: Dispatch<SetStateAction<string[]>>;
  submittedWords?: string[];
}

export function validateAlpha(char: string) {
  // if char is not an alpha character
  if (!/^[a-zA-Z]$/.test(char)) {
    return false;
  }

  return true;
}

export default function Playarea() {
  const [guess, setGuess] = useState("");
  const [activeKeys, setActiveKeys] = useState<string[]>([]);
  const [submittedWords, setSubmittedWords] = useState<string[]>([]);

  return (
    <section className={styles.playarea}>
      <SubmittedWords 
        words={submittedWords}
      />
      <Guess
        guess={guess}
        setGuess={setGuess}
        activeKeys={activeKeys}
        setActiveKeys={setActiveKeys}
        submittedWords={submittedWords}
      />
      <div>
        <Keyboard
          guess={guess}
          setGuess={setGuess}
          activeKeys={activeKeys}
          setActiveKeys={setActiveKeys}
          setSubmittedWords={setSubmittedWords}
        />
      </div>
    </section>
  )
}