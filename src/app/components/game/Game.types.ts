import { GuessData } from "../guess-area/Guess.types";

export type GameState = {
  guesses: GuessData[];
  currentGuessIndex: number;
  status: "won" | "lost" | "playing";
}

export type LetterData = {
  letter: string;
  type: "correct" | "incorrect" | "misplaced" | "empty" | "sequence";
  sequence: boolean;
}

export type SplitWordLetter = { 
  letter: string;
  sequence: boolean;
  index: number;
}