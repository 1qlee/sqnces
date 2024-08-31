"use client";

import { useState, useEffect } from "react";
import type { WordData } from "~/app/components/game/Game";

import { Guesses } from "../guesses/Guesses";
import Keyboard from "../keyboard/Keyboard";
import toast from "react-hot-toast";

export type GameState = {
  guesses: string[];
  currentGuessIndex: number;
  status: "won" | "lost" | "playing";
}

export default function GuessArea({
  data
}: WordData) {
  const [gameState, setGameState] = useState<GameState>({
    guesses: [],
    currentGuessIndex: 0,
    status: "playing",
  })
  const { word } = data

  useEffect(() => {
    if (gameState.status === "playing") {
      if (gameState.guesses[gameState.currentGuessIndex - 1] === word) {
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
    <div>
      <Guesses 
        gameState={gameState}
        wordData={data}
      />
      <Keyboard
        gameState={gameState}
        setGameState={setGameState}
        wordData={data}
      />
    </div>
  )
}