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
  puzzle: {
    id: 0,
    date: "",
    words: [],
  },
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
            invalid = true;
          }
        });
      });
    }

    if (key === "puzzle") {
      if (typeof clone.puzzle === "object") {
        const puzzleKeys = ["id", "date", "words"];

        puzzleKeys.forEach((requiredKey) => {
          if (!(requiredKey in clone.puzzle)) {
            invalid = true;
          }
        });
      }
      else {
        invalid = true;
      }
    }
  });

  return invalid;
}

export default function useGameState() {
  const cachedGameState = useRef<GameState | null>(null);

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

      return cachedGameState.current;
    }
  };

  const getServerSnapshot = () => {
    // Return cached state for stability
    if (cachedGameState.current !== null) return cachedGameState.current;

    // If SSR, use defaultGameState
    if (typeof window === "undefined") return defaultGameState;

    // During hydration, read from localStorage
    const storedState = window.localStorage.getItem("gameState");
    cachedGameState.current = storedState ? (JSON.parse(storedState) as GameState) : defaultGameState;

    return cachedGameState.current;
  }

  const subscribe = (listener: () => void) => {
    window.addEventListener("storage", listener);
    return () => void window.removeEventListener("storage", listener);
  };

  const gameData = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return [gameData, setGameState] as const;
}