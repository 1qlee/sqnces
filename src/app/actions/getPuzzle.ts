"use server"

import { api } from "~/trpc/server";
import type { ClientPuzzle } from "~/server/types/puzzle";

export async function getPuzzle(date: string): Promise<ClientPuzzle>{
  console.log("USERS DATE ON GETPUZZLE:", date);
  const data = await api.puzzle.get({ usersDate: date });

  return data!;
}