"use server"

import { api } from "~/trpc/server";

export async function checkGuess({
  guess,
  timezone,
  length,
  hardMode,
}: {
  guess: string;
  timezone: string;
  length: number;
  hardMode: boolean;
}) {
  const data = await api.word.check({ guess, timezone, length, hardMode });

  return data;
}