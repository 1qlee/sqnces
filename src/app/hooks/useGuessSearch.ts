// useGuessSearch.js
import { useCallback } from 'react';
import { openDB } from 'idb';
import validGuesses from '../utils/guessProvider';

const GUESSES_DB = "guessesDB";
const STORE_NAME = "guessesStore";

type Guess = {
  guess: string;
  id: number;
};

function findGuess(arr: Guess[], target: string): boolean {
  let left = 0;
  let right = arr.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (arr[mid]!.guess === target) {
      return true; // Target found
    }
    if (arr[mid]!.guess !== undefined && arr[mid]!.guess < target) {
      left = mid + 1; // Search in the right half
    } else {
      right = mid - 1; // Search in the left half
    }
  }
  return false; // Target not found
}

export default function useGuessSearch() {
  const searchGuess = useCallback(async (guess: string): Promise<boolean> => {
    try {
      const db = await openDB(GUESSES_DB, 1);

      const tx = db.transaction(STORE_NAME, 'readonly');

      // Retrieve all entries from the store
      const guesses = await tx.store.getAll() as Guess[];
      const size = guesses.length;

      if (size < validGuesses.length) {
        throw new Error("indexdDB has an incomplete word list.");
      }

      return findGuess(guesses, guess);
    } catch (error) {
      console.log("FALLBACK")
      // If an error occurs, search the json word list directly
      const guesses = validGuesses.map((guess, index) => ({ guess, id: index })) as Guess[];
      return findGuess(guesses, guess);
    }
  }, []);

  return searchGuess;
}
