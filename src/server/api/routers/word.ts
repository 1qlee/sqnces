import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
} from "~/server/api/trpc";
import type { WordEntry } from "~/server/types/definition";

let cachedWord: { data: { word: string, sequence: string }, timestamp: number } | null = null;
const CACHE_DURATION = 60; // seconds
const CACHE_DURATION_FACTORED = CACHE_DURATION * 1000;

function generateSequence(str: string) {
  const substrings = [];

  // Loop through the string and extract 3-letter substrings
  for (let i = 0; i <= str.length - 3; i++) {
    const substring = str.substring(i, i + 3);

    // Check if the substring contains any spaces
    if (!substring.includes(' ')) {
      substrings.push(substring);
    }
  }

  // Return a random substring from the list, if any are found
  if (substrings.length > 0) {
    const randomIndex = Math.floor(Math.random() * substrings.length);
    return substrings[randomIndex];
  }
}

export const wordRouter = createTRPCRouter({
  get: publicProcedure
    .query(async () => {
      if (cachedWord && Date.now() - cachedWord.timestamp < CACHE_DURATION_FACTORED) {
        return cachedWord.data;
      }

      const wordRes = await fetch(
        `https://random-word-api.vercel.app/api?words=1&length=${Math.floor(Math.random() * 5) + 5}`,
      );

      const wordData = (await wordRes.json()) as string[]; // response will be an array with one word in it
      const word: string = (wordData[0] ?? "DEFAULT").toUpperCase(); // the word
      const sequence: string = generateSequence(word) ?? generateSequence("DEFAULT") ?? "DEF"; // random 3-letter sequence with a default value of an empty string

      cachedWord = { 
        data: {
          word,
          sequence,
        }, 
        timestamp: Date.now() 
      };

      return cachedWord.data;
    }),

  validate: publicProcedure
    .input(z.object({ word: z.string() }))
    .query(async ({ input }) => {
      const definitionRes = await fetch(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${input.word}`
      )
      // https://www.dictionaryapi.com/products/api-collegiate-dictionary

      const definitionData = await definitionRes.json() as WordEntry[];

      if (typeof definitionData === "object" && "title" in definitionData) {
        return {
          isValid: false,
          message: "Invalid word",
          definition: "No definition found",
        };
      }

      const entry = definitionData[0]!;
      const definition = entry?.meanings[0]?.definitions[0]?.definition;

      return {
        isValid: true,
        message: "Valid word",
        definition: definition ?? "No definition found",
      }
    }),
});
