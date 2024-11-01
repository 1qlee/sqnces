"use client";

import useGameState from "~/app/hooks/useGameState";
import flexStyles from "../styles/Flex.module.css";

import Toggle from "../toggle/Toggle";
import { Circle } from "@phosphor-icons/react";
import toast from "react-hot-toast";
import type { WordLength } from "../game/Game.types";

export default function HardModeToggle() {
  const [gameState, setGameState] = useGameState();
  const isHardModeOn = gameState.settings.hardMode;

  function handleToggle() {
    if (gameState.games[gameState.wordLength as WordLength].guesses.length === 0) {
      setGameState({
        ...gameState,
        games: {
          ...gameState.games,
          [gameState.wordLength]: {
            ...gameState.games[gameState.wordLength as WordLength],
            hardMode: !isHardModeOn,
          }
        },
        settings: {
          ...gameState.settings,
          hardMode: !isHardModeOn,
        }
      });
    }
    else {
      toast.error("You can't change the hard mode setting after you've already started the game.");
    }
  }

  return (
    <Toggle
      onClick={() => handleToggle()}
    >
      <div className={flexStyles.flexCentered}>
        <Circle 
          size={20} 
          weight="fill" 
          color={isHardModeOn ? "var(--correct)" : "var(--incorrect)"} 
        />
        <span style={{ fontSize: "1rem" }}>
          {isHardModeOn ? "On" : "Off"}
        </span>
      </div>
    </Toggle>
  )
}