export type GameState = {
  guesses: GuessData[];
  currentGuessIndex: number;
  status: "won" | "lost" | "playing";
}

export type LetterData = {
  letter: string;
  type: "sequence" | "correct" | "incorrect" | "misplaced" | "empty";
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
}

export interface WordData {
  data: {
    letters: string[];
    sequence: string;
    word: string;
  }
}