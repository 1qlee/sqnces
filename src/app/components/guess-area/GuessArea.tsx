"use client";

import { useState } from "react";

import { Guesses } from "../guesses/Guesses";
import Keyboard from "../keyboard/Keyboard";

export default function GuessArea() {
  const [submittedGuesses, setSubmittedGuesses] = useState<string[]>([]);
  
  return (
    <div>
      <Guesses 
        submittedGuesses={submittedGuesses}
      />
      <Keyboard
        setSubmittedGuesses={setSubmittedGuesses}
      />
    </div>
  )
}