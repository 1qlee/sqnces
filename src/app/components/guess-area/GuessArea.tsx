"use client";

import { useState, useEffect } from "react";
import type { WordData } from "~/app/components/game/Game";

import { Guesses } from "../guesses/Guesses";
import Keyboard from "../keyboard/Keyboard";
import toast from "react-hot-toast";

export type GameState = {
  guesses: GuessData[];
  currentGuessIndex: number;
  status: "won" | "lost" | "playing";
}

export type LetterData = {
  letter: string;
  type: "correct" | "incorrect" | "misplaced";
}

export type GuessData = {
  number: number;
  validationMap: LetterData[];
  word: string;
}

export default function GuessArea({
  data
}: WordData) {
  const [guess, setGuess] = useState("");
  const [gameState, setGameState] = useState<GameState>({
    guesses: [],
    currentGuessIndex: 0,
    status: "playing",
  })
  const { word } = data

  useEffect(() => {
    if (gameState.status === "playing") {
      if (gameState.guesses[gameState.currentGuessIndex - 1]?.word === word) {
        toast.success("You won!");
        setGameState({
          ...gameState,
          status: "won",
        })
      }
      else if (gameState.currentGuessIndex === 6) {
        toast.error("You lost!");
        setGameState({
          ...gameState,
          status: "lost",
        })
      }
    }
  }, [gameState])
  
  return (
    <>
      <Guesses 
        gameState={gameState}
        wordData={data}
        guess={guess}
      />
      <Keyboard
        gameState={gameState}
        setGameState={setGameState}
        wordData={data}
        guess={guess}
        setGuess={setGuess}
      />
    </>
  )
}