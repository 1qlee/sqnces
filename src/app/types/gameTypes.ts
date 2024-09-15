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

export type GuessData = {
  number: number;
  validationMap: LetterData[];
  word: string;
  length: number;
}

export type WordData = {
  letters: string[];
  sequence: string;
  word: string;
  length: number;
}