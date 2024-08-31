"use server"

import { api } from "~/trpc/server";

export async function getWord() {
  const data = await api.word.get();

  return data;
}