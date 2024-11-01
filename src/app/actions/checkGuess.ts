"use server"

import { api } from "~/trpc/server";
import { format } from "date-fns";

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
  console.log("PUZZLE ID", puzzleId);
  console.log("USERS DATE", format(usersDate, "MM-dd-yyyy"));
  const data = await api.word.check({ guess, usersDate: format(usersDate, "MM-dd-yyyy"), length, hardMode, puzzleId });

  return data;
}