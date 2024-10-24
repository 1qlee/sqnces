import type { Key as ImportedKey } from "~/app/components/keyboard/Keyboard.types";
import type { KeysStatus as ImportedKeysStatus } from "~/app/components/keyboard/Keyboard.types";

export type Word = {
  id: number;
  word: string;
  sequence: {
    id: number;
    string: string;
    index: number;
    letters: string[];
    score: Score;
  };
  letters: string[];
  length: number;
}

export type ClientWord = {
  sequence: {
    string: string;
    index: number;
    letters: string[];
    score: number;
  };
  length: number;
  puzzleId: number;
}

export type ClientPuzzle = {
  words: ClientWord[];
  id: number;
  date: string;
}

export type CachedPuzzle = { 
  words: Word[];
  id: number;
  date: string;
}

export type PuzzleCache = {
  today: CachedPuzzle;
  tomorrow: CachedPuzzle;
}

export type LettersMap = { 
  letter: string;
  used: boolean;
}[]

export type Sequence = {
  id: number; 
  lastUsed: Date | null; 
  timesUsed: number; 
  letters: string;
  scores: Score[];
}

export type Score = {
  id: number;
  wordLength: number;
  score: number;
  category: string;
  sequenceId: number;
}

export type LetterData = {
  letter: ImportedKey;
  type: "correct" | "incorrect" | "misplaced" | "empty" | "misplacedEmpty" | "sequence";
  sequence: boolean;
}

export type SplitWordLetter = {
  letter: ImportedKey;
  sequence: boolean;
  index: number;
}

export type CheckedGuess = {
  isValid: boolean;
  keys: KeysStatus;
  map: LetterData[];
  won: boolean;
}

// Extend the imported KeysStatus type
export type KeysStatus = ImportedKeysStatus
export type Key = ImportedKey