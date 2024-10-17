"use server"

import { api } from "~/trpc/server";
import type { ClientPuzzle } from "~/server/types/word";

export async function getPuzzle(timezone: string): Promise<ClientPuzzle>{
  const data = await api.word.get({ timezone: timezone });

  return data!;
}