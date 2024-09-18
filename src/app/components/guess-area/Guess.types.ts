import { LetterData } from '../game/Game.types';
import { Key } from '../keyboard/Keyboard.types';

export type Guess = { 
  string: string; 
  letters: Key[];
}

export type GuessData = {
  number: number;
  validationMap: LetterData[];
  word: string;
  length: number;
}