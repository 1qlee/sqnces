"use client";

import { useState, useEffect, type Dispatch, type SetStateAction } from "react";
import type { ClientWord } from "~/server/types/word";
import type { Editing, Game } from "~/app/components/game/Game.types";
import type { Guess } from "./Guess.types";

import { Guesses } from "../guesses/Guesses";
import Keyboard from "../keyboard/Keyboard";
import useGameState from "~/app/hooks/useGameState";
import { KeysStatus, Status } from "../keyboard/Keyboard.types";

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
  const [gameState, setGameState] = useGameState(); 
  const guesses = currentGame.guesses;
  const letterStatusMap: Record<string, Status> = guesses.reduce((acc, guess) => {
    guess.validationMap.forEach(({ letter, type }) => {
      acc[letter] = type;
    });
    return acc;
  }, {} as Record<string, Status>);
  const [keysStatus, setKeysStatus] = useState<KeysStatus>(letterStatusMap);
  const [guess, setGuess] = useState<Guess>({
    string: "",
    letters: [],
  });
  const [editing, setEditing] = useState<Editing>({
    toggled: false,
    key: 0,
  })

  useEffect(() => {
    if (currentGame.status === "won" || currentGame.status === "lost") {
      setShowEndgameModal(true);
    }

    if (currentGame.status === "notStarted") {
      setGameState({
        ...gameState,
        games: {
          ...gameState.games,
          [gameState.wordLength]: {
            guesses: [...gameState.games[gameState.wordLength as keyof typeof gameState.games].guesses],
            status: "playing",
          },
        }
      })
    }

    setGuess({
      string: "",
      letters: [],
    })
    setKeysStatus(letterStatusMap);
  }, [currentGame.status, gameState.wordLength])
  
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
        keysStatus={keysStatus}
        wordData={wordData}
        guess={guess}
        editing={editing}
        setEditing={setEditing}
        setGuess={setGuess}
        setKeysStatus={setKeysStatus}
      />
    </>
  )
}