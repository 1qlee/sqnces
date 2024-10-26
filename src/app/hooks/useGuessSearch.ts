// useGuessSearch.js
import { useCallback } from 'react';
import { openDB } from 'idb';

const GUESSES_DB = "guessesDB";
const STORE_NAME = "guessesStore";

function findGuess(arr: { guess: string, id: number }[], target: string): boolean {
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
      const guesses: { guess: string, id: number }[] = await tx.store.getAll();
      return findGuess(guesses, guess);
    } catch (error) {
      return false;
    }
  }, []);

  return searchGuess;
}
