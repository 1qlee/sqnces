import { GuessData } from "../guess-area/Guess.types";
import { Key } from "../keyboard/Keyboard.types";

export type Editing = {
  toggled: boolean;
  key: number;
}

export type GameState = {
  guesses: GuessData[];
  currentGuessIndex: number;
  status: "won" | "lost" | "playing";
  editing: Editing;
  showHelp: boolean;
}

export type LetterData = {
  letter: Key;
  type: "correct" | "incorrect" | "misplaced" | "empty" | "sequence";
  sequence: boolean;
}

export type SplitWordLetter = { 
  letter: Key;
  sequence: boolean;
  index: number;
}