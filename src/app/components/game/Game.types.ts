import type { GuessData } from "../guess-area/Guess.types";

export type Editing = {
  toggled: boolean;
  key: number;
}

export type WordLength = 6 | 7 | 8;

export type GameSettings = {
  hardMode: boolean;
}

export type GameStatus = "won" | "lost" | "playing" | "notStarted" | undefined;

export type GameState = {
  games: {
    [key in WordLength]: Game;
  };
  wordLength: number;
  showHelp: boolean;
  puzzle: number | undefined;
  settings: GameSettings;
}

export type Game = {
  guesses: GuessData[];
  status: GameStatus;
  hardMode: boolean;
}

export type Stats = {
  played: number;
  won: number;
  lost: number;
  currentStreak: number;
  longestStreak: number;
}

export type UserStats = {
  games: {
    [key in WordLength]: {
      easyMode: Stats;
      hardMode: Stats;
    };
  };
}