import type { GuessData } from "../guess-area/Guess.types";

export type Editing = {
  toggled: boolean;
  key: number;
}

export type WordLength = 6 | 7 | 8;

export type GameSettings = {
  hardMode: boolean;
}

export type GameState = {
  games: {
    [key in WordLength]: Game;
  };
  wordLength: number;
  showHelp: boolean;
  puzzle: number | undefined;
  loading?: boolean;
  settings: GameSettings;
}

export type Game = {
  guesses: GuessData[];
  status: "won" | "lost" | "playing" | "notStarted" | undefined;
}

export type Stats = {
  played: number;
  won: number;
  lost: number;
  winRate: string;
  currentStreak: number;
  longestStreak: number;
}

export type GameStats = {
  games: {
    [key in WordLength]: Stats;
  };
}