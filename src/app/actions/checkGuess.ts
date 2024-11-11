"use server"

import { api } from "~/trpc/server";
import { format } from "date-fns";
import type { GuessData } from "../components/guess-area/Guess.types";

export async function checkGuess({
  guess,
  guesses,
  hardMode,
  length,
  puzzleId,
  usersDate,
}: {
  guess: string;
  guesses: GuessData[];
  hardMode: boolean;
  length: number;
  puzzleId: number;
  usersDate: string;
}) {
  const lettersUsed = guesses.reduce((acc, guess) => guess.word.length + acc, 0) + guess.length;
  const timesGuessed = guesses.length + 1;

  const data = await api.word.check({
    guess,
    lettersUsed,
    timesGuessed,
    usersDate: format(usersDate, "MM-dd-yyyy"),
    length,
    hardMode,
    puzzleId,
  });

  return data;
}