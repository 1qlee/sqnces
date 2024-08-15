"use client"

import { Dispatch, SetStateAction, useState } from "react";

import GuessInput from "../guess-input/GuessInput";
import Keyboard from "../keyboard/Keyboard";
import styles from "./Playarea.module.css";

export interface GuessProps {
  guess: string
  setGuess: Dispatch<SetStateAction<string>>
}

export default function Playarea() {
  const [guess, setGuess] = useState("");

  return (
    <section className={styles.playarea}>
      <Keyboard 
        guess={guess}
        setGuess={setGuess}
      />
      <GuessInput
        guess={guess}
        setGuess={setGuess}
      />
    </section>
  )
}