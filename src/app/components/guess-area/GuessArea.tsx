"use client";

import { useState, useEffect, type Dispatch, type SetStateAction } from "react";
import type { ClientWord } from "~/server/types/word";
import type { Editing, Game } from "~/app/components/game/Game.types";
import type { Guess } from "./Guess.types";

import { Guesses } from "../guesses/Guesses";
import Keyboard from "../keyboard/Keyboard";
import toast from "react-hot-toast";

type GuessAreaProps = {
  wordData: ClientWord;
  setShowEndgameModal: Dispatch<SetStateAction<boolean>>;
  currentGame: Game;
}

export default function GuessArea({ 
  wordData,
  setShowEndgameModal,
  currentGame,
}: GuessAreaProps) {
  const [guess, setGuess] = useState<Guess>({
    string: "",
    letters: [],
  });
  const [editing, setEditing] = useState<Editing>({
    toggled: false,
    key: 0,
  })

  useEffect(() => {
    if (currentGame.status === "won") {
      toast.success("You won!", { id: "won" });
      setTimeout(() => {
        setShowEndgameModal(true);
      }, 1000);
    }
    else if (currentGame.status === "lost") {
      toast.error("You lost!", { id: "lost" });
      setTimeout(() => {
        setShowEndgameModal(true);
      }, 1000);
    }
  }, [currentGame.status])
  
  return (
    <>
      <Guesses
        currentGame={currentGame}
        guess={guess}
        editing={editing}
        setEditing={setEditing}
        setGuess={setGuess}
      />
      <Keyboard
        currentGame={currentGame}
        wordData={wordData}
        guess={guess}
        editing={editing}
        setEditing={setEditing}
        setGuess={setGuess}
      />
    </>
  )
}