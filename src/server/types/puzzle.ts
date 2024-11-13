import type { Key as ImportedKey, Status as LetterStatus, KeysStatus as ImportedKeysStatus } from "~/app/components/keyboard/Keyboard.types";
import type { Decimal } from '@prisma/client/runtime/library';

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

export type GlobalStats = {
  lettersUsed: number | "...";
  timesGuessed: number | "...";
  timesPlayed: number | "...";
  timesSolved: number | "...";
  timesFailed: number | "...";
  winRate: number | "...";
};

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

export type PuzzleCache = CachedPuzzle[]

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
  type: LetterStatus;
  sequence: boolean;
}

export type SplitWordLetter = {
  letter: ImportedKey;
  sequence: boolean;
  index: number;
}

export type CheckedGuess = {
  keys: KeysStatus;
  map: LetterData[];
  won: boolean;
  message?: string;
  word?: string;
  status: string;
}

export type GetWordError = {
  code: string;
  message: {
    message: string;
    code: string;
  };
  path: string[];
}

export type GetWordResponse = GetWordError[]

// Extend the imported KeysStatus type
export type KeysStatus = ImportedKeysStatus
export type Key = ImportedKey