import { useSyncExternalStore, useRef } from "react";
import type { GameState } from "../components/game/Game.types";

const defaultGameState: GameState = {
  games: {
    6: {
      guesses: [],
      status: "notStarted",
      hardMode: false,
    },
    7: {
      guesses: [],
      status: "notStarted",
      hardMode: false,
    },
    8: {
      guesses: [],
      status: "notStarted",
      hardMode: false,
    },
  },
  showHelp: true,
  wordLength: 6,
  puzzle: 0,
  settings: {
    hardMode: false,
  }
};

export default function useGameState() {
  const cachedGameState = useRef<GameState>();

  const setGameState = (newGameState: GameState) => {
    const stringifiedState = JSON.stringify(newGameState);

    window.localStorage.setItem("gameState", stringifiedState);
    cachedGameState.current = newGameState;
    window.dispatchEvent(
      new StorageEvent("storage", { key: "gameState", newValue: stringifiedState })
    );
  };

  // Function to get the current gameState from localStorage
  const getSnapshot = () => {
    const gameState = window.localStorage.getItem("gameState");

    if (gameState) {
      const parsedGameState = JSON.parse(gameState) as GameState;
      
      if ("games" in parsedGameState || !("settings" in parsedGameState)) {
        const isStateCached = JSON.stringify(cachedGameState.current) === gameState;
        // if no cache or cache is different from localStorage
        if (!cachedGameState.current || !isStateCached) {
          cachedGameState.current = parsedGameState;
        }

        return cachedGameState.current;
      }
      
      cachedGameState.current = defaultGameState

      return cachedGameState.current;
    }
    else {
      cachedGameState.current = defaultGameState;
      setGameState({
        ...defaultGameState,
      });

      return defaultGameState;
    }
  };

  const getServerSnapshot = () => {
    return defaultGameState;
  }

  const subscribe = (listener: () => void) => {
    window.addEventListener("storage", listener);
    return () => void window.removeEventListener("storage", listener);
  };

  const gameData = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return [gameData, setGameState] as const;
}