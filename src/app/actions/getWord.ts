"use server"

import { api } from "~/trpc/server";

export async function getWord(length: number) {
  const data = await api.word.get({ length: length });

  return data;
}