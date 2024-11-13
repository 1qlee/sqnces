import type { LetterData } from "../../../server/types/puzzle";
import type { Key } from '../keyboard/Keyboard.types';

export type Guess = { 
  string: string; 
  letters: Key[];
}

export type GuessData = {
  validationMap: LetterData[];
  word: string;
  length: number;
}