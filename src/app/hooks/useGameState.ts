import { useSyncExternalStore, useRef } from "react";
import type { Game, GameState, WordLength } from "../components/game/Game.types";

const defaultGameState: GameState = {
  games: {
    6: {
      guesses: [],
      status: "notStarted",
      hardMode: true,
      word: "",
    },
    7: {
      guesses: [],
      status: "notStarted",
      hardMode: true,
      word: "",
    },
    8: {
      guesses: [],
      status: "notStarted",
      hardMode: true,
      word: "",
    },
  },
  showHelp: true,
  wordLength: 6,
  puzzle: 0,
  settings: {
    hardMode: true,
  }
};

function validateGameState(obj: GameState): boolean {
  const gameStateKeys = ["games", "showHelp", "wordLength", "puzzle", "settings"];
  const gameKeys = ["guesses", "status", "hardMode", "word"];
  let invalid = false;

  const clone = structuredClone(obj);

  // Check top-level keys
  gameStateKeys.forEach((key) => {
    if (!(key in clone)) {
      invalid = true;
    }

    // If "games", validate its structure
    if (key === "games" && typeof clone.games === "object") {
      Object.keys(clone.games).forEach((lengthKey) => {
        const numberedKey = +lengthKey as WordLength;
        const game: Game = clone.games[numberedKey];

        gameKeys.forEach((requiredKey) => {
          if (!(requiredKey in game)) {
            console.log("Missing key", requiredKey, "in game", numberedKey);
            invalid = true;
          }
        });
      });
    }
  });

  return invalid;
}

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
      const isGameStateInvalid = validateGameState(parsedGameState);

      if (isGameStateInvalid) {
        console.log(parsedGameState);
        console.log("Invalid game state, resetting to default");
        cachedGameState.current = defaultGameState;
        setGameState({
          ...defaultGameState,
        });

        return cachedGameState.current;
      }
      
      const isStateCached = JSON.stringify(cachedGameState.current) === gameState;
      // if no cache or cache is different from localStorage
      if (!cachedGameState.current || !isStateCached) {
        cachedGameState.current = parsedGameState;
      }

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