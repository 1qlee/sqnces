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
  puzzle: number;
  settings: GameSettings;
}

export type Game = {
  guesses: GuessData[];
  status: GameStatus;
  hardMode: boolean;
  word?: string;
}

export type Stats = {
  played: number;
  won: number;
  lost: number;
  timesGuessed: number;
  lettersUsed: number;
  currentStreak: number;
  longestStreak: number;
}

export type GameMode = {
  easyMode: Stats;
  hardMode: Stats;
}

export type UserStats = {
  games: {
    [key in WordLength]: {
      easyMode: Stats;
      hardMode: Stats;
    };
  };
}