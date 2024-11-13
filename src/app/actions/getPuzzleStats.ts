"use server"

import { api } from "~/trpc/server";

export async function getPuzzleStats({id, wordLength }: { id: number, wordLength: number }) {
  const data = await api.puzzle.getStats({
    puzzleId: id,
    wordLength: wordLength,
  });

  return data;
}