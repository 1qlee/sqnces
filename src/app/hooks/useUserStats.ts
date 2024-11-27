import { useSyncExternalStore, useRef } from "react";
import type { GameMode, Stats, UserStats, WordLength } from "../components/game/Game.types";

function createDefaultStats(): Stats {
  return {
    currentStreak: 0,
    lastPlayed: null,
    lettersUsed: 0,
    longestStreak: 0,
    lost: 0,
    played: 0,
    timesGuessed: 0,
    won: 0,
  }
};

const defaultUserStats: UserStats = {
  games: {
    6: {
      easyMode: createDefaultStats(),
      hardMode: createDefaultStats(),
    },
    7: {
      easyMode: createDefaultStats(),
      hardMode: createDefaultStats(),
    },
    8: {
      easyMode: createDefaultStats(),
      hardMode: createDefaultStats(),
    },
  },
};

function validateAndCompleteStats(obj: UserStats): boolean {
  const requiredKeys = [
    "played",
    "won",
    "lost",
    "timesGuessed",
    "lettersUsed",
    "currentStreak",
    "longestStreak",
    "lastPlayed",
  ];
  let invalid = false;
  const clone = structuredClone(obj);

  // Loop through each "num" in games
  for (const gameKey in clone.games) {
    const numberedKey = +gameKey as WordLength;
    const game: GameMode = clone.games[numberedKey];

    // Check both easyMode and hardMode
    (["easyMode", "hardMode"] as const).forEach((mode) => {
      if (game[mode]) {
        requiredKeys.forEach((key) => {
          if (!(key in game[mode])) {
            invalid = true;
          }
        });
      }
    });
  }

  return invalid;
}

export default function useUserStats() {
  const cachedUserStats = useRef<UserStats>();

  const setUserStats = (newUserStats: UserStats) => {
    const stringifiedState = JSON.stringify(newUserStats);

    window.localStorage.setItem("userStats", stringifiedState);
    cachedUserStats.current = newUserStats;
    window.dispatchEvent(
      new StorageEvent("storage", { key: "userStats", newValue: stringifiedState })
    );
  };

  // Function to get the current userStats from localStorage
  const getSnapshot = () => {
    const userStats = window.localStorage.getItem("userStats");

    if (userStats) {
      const parsedUserStats = JSON.parse(userStats) as UserStats;
      const areStatsInvalid = validateAndCompleteStats(parsedUserStats);

      if (areStatsInvalid) {
        cachedUserStats.current = defaultUserStats;
        setUserStats({
          ...defaultUserStats,
        });

        return cachedUserStats.current;
      }

      const isStateCached = JSON.stringify(cachedUserStats.current) === userStats;
      // if no cache or cache is different from localStorage
      if (!cachedUserStats.current || !isStateCached) {
        cachedUserStats.current = parsedUserStats;
      }

      return cachedUserStats.current;
    }
    else {
      cachedUserStats.current = defaultUserStats;
      setUserStats({
        ...defaultUserStats,
      });

      return defaultUserStats;
    }
  };

  const getServerSnapshot = () => {
    return defaultUserStats;
  }

  const subscribe = (listener: () => void) => {
    window.addEventListener("storage", listener);
    return () => void window.removeEventListener("storage", listener);
  };

  const userStats = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return [userStats, setUserStats] as const;
}