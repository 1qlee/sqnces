import { ClientWord } from "~/server/types/puzzle";
import type { GuessData } from "../guess-area/Guess.types";

export type Editing = {
  toggled: boolean;
  key: number;
}

export type WordLength = 6 | 7 | 8;

export type GameSettings = {
  hardMode: boolean;
}

export type GameStatus = "won" | "lost" | "playing" | "notStarted";
export type Puzzle = {
  id: number;
  date: string;
  words: ClientWord[];
}

export type GameState = {
  games: {
    [key in WordLength]: Game;
  };
  wordLength: number;
  showHelp: boolean;
  puzzle: Puzzle;
  settings: GameSettings;
}

export type Game = {
  guesses: GuessData[];
  status: GameStatus;
  hardMode: boolean;
  word?: string;
}

export type Stats = {
  currentStreak: number;
  lastPlayed: string | null;
  lettersUsed: number;
  longestStreak: number;
  lost: number;
  timesPlayed: number;
  timesGuessed: number;
  won: number;
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