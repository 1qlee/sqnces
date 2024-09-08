export type GameState = {
  guesses: GuessData[];
  currentGuessIndex: number;
  status: "won" | "lost" | "playing";
}

export type LetterData = {
  letter: string;
  type: "sequence" | "correct" | "incorrect" | "misplaced" | "empty";
}

export type GuessData = {
  number: number;
  validationMap: LetterData[];
  word: string;
}

export interface WordData {
  data: {
    sequence: string;
    word: string;
  }
}