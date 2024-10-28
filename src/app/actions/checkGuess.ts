"use server"

import { api } from "~/trpc/server";

export async function checkGuess({
  guess,
  usersDate,
  length,
  hardMode,
  puzzleId,
}: {
  guess: string;
  usersDate: string;
  length: number;
  hardMode: boolean;
  puzzleId: number;
}) {
  const data = await api.word.check({ guess, usersDate, length, hardMode, puzzleId });

  return data;
}