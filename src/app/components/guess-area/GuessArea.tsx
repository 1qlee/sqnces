"use client";

import { useState, useEffect } from "react";
import type { Word } from "~/server/types/word";
import type { GameState } from "~/app/components/game/Game.types";
import type { Guess } from "./Guess.types";

import { Guesses } from "../guesses/Guesses";
import Keyboard from "../keyboard/Keyboard";
import toast from "react-hot-toast";

export default function GuessArea({ wordData }: { wordData: Word }) {
  const [guess, setGuess] = useState<Guess>({
    string: "",
    letters: [],
  });
  const [gameState, setGameState] = useState<GameState>({
    guesses: [],
    currentGuessIndex: 0,
    status: "playing",
    editing: {
      toggled: false,
      key: 0,
    },
  })
  const { data } = wordData;
  const { word } = data;

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
        toast.error(`You lost! The word was: ${word}`);
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
        wordData={wordData}
        guess={guess}
        setGuess={setGuess}
        setGameState={setGameState}
      />
      <Keyboard
        gameState={gameState}
        setGameState={setGameState}
        wordData={wordData}
        guess={guess}
        setGuess={setGuess}
      />
    </>
  )
}