"use server"

import { api } from "~/trpc/server";

export async function checkGuess({
  guess,
  timezone,
  length,
}: {
  guess: string;
  timezone: string;
  length: number;
}) {
  const data = await api.word.check({ guess, timezone, length });

  return data;
}