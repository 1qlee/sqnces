"use client";

import { useState, useEffect, type Dispatch, type SetStateAction } from "react";
import type { ClientWord } from "~/server/types/word";
import type { Editing, Game, GameStatus } from "~/app/components/game/Game.types";
import type { Guess } from "./Guess.types";

import { Guesses } from "../guesses/Guesses";
import Keyboard from "../keyboard/Keyboard";
import useGameState from "~/app/hooks/useGameState";
import type { KeysStatus, Status } from "../keyboard/Keyboard.types";

type GuessAreaProps = {
  currentGame: Game;
  wordData: ClientWord;
  setShowEndgameModal: Dispatch<SetStateAction<boolean>>;
  setDisableGameModeSelect: Dispatch<SetStateAction<boolean>>;
}

export default function GuessArea({ 
  wordData,
  currentGame,
  setShowEndgameModal,
  setDisableGameModeSelect,
}: GuessAreaProps) {
  const [gameState, setGameState] = useGameState(); 
  const [delayedStatus, setDelayedStatus] = useState<GameStatus>(undefined);
  const guesses = currentGame.guesses;
  const letterStatusMap: Record<string, Status> = guesses.reduce((acc, guess) => {
    guess.validationMap.forEach(({ letter, type }) => {
      if (!acc[letter] || 
        (acc[letter] === "empty") || 
        (acc[letter] === "incorrect" && type !== "empty") || 
        (acc[letter] === "incorrectEmpty" && type !== "empty" && type !== "incorrect") || 
        (acc[letter] === "misplacedEmpty" && type !== "empty" && type !== "incorrect" && type !== "incorrectEmpty") || 
        (acc[letter] === "misplaced" && type === "correct")) {
      acc[letter] = type;
      }
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
  const isGameWonOrLost = currentGame.status === "won" || currentGame.status === "lost";


  useEffect(() => {
    if (isGameWonOrLost) {
      setDisableGameModeSelect(true);
      // Only update the delayedStatus after 1000ms
      const timer = setTimeout(() => {
        setDelayedStatus(currentGame.status);
        setDisableGameModeSelect(false);
      }, 1000);

      return () => clearTimeout(timer);
    }
    else {
      setDelayedStatus(currentGame.status);
    }
  }, [currentGame.status]);

  useEffect(() => {
    if (delayedStatus === "won" || delayedStatus === "lost") {
      setShowEndgameModal(true);
    }
    else {
      setShowEndgameModal(false);
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
  }, [delayedStatus, gameState.wordLength])
  
  return (
    <>
      <Guesses
        currentGame={currentGame}
        editing={editing}
        guess={guess}
        setEditing={setEditing}
        setGuess={setGuess}
      />
      <Keyboard
        currentGame={currentGame}
        editing={editing}
        guess={guess}
        keysStatus={keysStatus}
        wordData={wordData}
        setEditing={setEditing}
        setGuess={setGuess}
        setKeysStatus={setKeysStatus}
      />
    </>
  )
}