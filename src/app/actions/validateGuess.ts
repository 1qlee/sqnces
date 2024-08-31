"use server"

import { api } from "~/trpc/server";

export async function validateGuess(guess: string) {
  const data = await api.word.validate({ word: guess});
  
  return data;
}