"use server"

import { api } from "~/trpc/server";

export async function checkGuess({
  guess,
  date,
  length,
  hardMode,
}: {
  guess: string;
  date: string;
  length: number;
  hardMode: boolean;
}) {
  const data = await api.word.check({ guess, date, length, hardMode });

  return data;
}