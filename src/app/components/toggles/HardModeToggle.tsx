"use client";

import useGameState from "~/app/hooks/useGameState";
import flexStyles from "../styles/Flex.module.css";

import Toggle from "../toggle/Toggle";
import toast from "react-hot-toast";
import type { WordLength } from "../game/Game.types";

export default function HardModeToggle() {
  const [gameState, setGameState] = useGameState();
  const isHardModeOn = gameState.settings.hardMode;
  const currentGame = gameState.games[gameState.wordLength as WordLength];

  function handleToggle() {
    // if the game has already started in easy mode, don't allow the user to switch to hard mode
    if (!isHardModeOn && currentGame.guesses.length > 0) {
      toast.error("You can't disable hard mode after you've already started the puzzle.");
      return;
    }

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

  return (
    <Toggle
      onClick={() => handleToggle()}
    >
      <div className={flexStyles.flexCentered}>
        <span>
          {isHardModeOn ? "On" : "Off"}
        </span>
      </div>
    </Toggle>
  )
}