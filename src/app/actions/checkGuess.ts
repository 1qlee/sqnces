"use server"

import { api } from "~/trpc/server";

export async function checkGuess({
  guess,
  usersDate,
  length,
  hardMode,
}: {
  guess: string;
  usersDate: string;
  length: number;
  hardMode: boolean;
}) {
  const data = await api.word.check({ guess, usersDate, length, hardMode });

  return data;
}