import { GuessData } from "../guess-area/Guess.types";

export type Editing = {
  toggled: boolean;
  key: number;
}

export type GameState = {
  guesses: GuessData[];
  currentGuessIndex: number;
  status: "won" | "lost" | "playing";
  editing: Editing;
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