"use server"

import { api } from "~/trpc/server";
import type { ClientPuzzle } from "~/server/types/word";
import { format } from "date-fns";

export async function getPuzzle(date: string): Promise<ClientPuzzle>{
  const data = await api.word.get({ usersDate: format(date, "MM-dd-yyyy") });

  return data!;
}