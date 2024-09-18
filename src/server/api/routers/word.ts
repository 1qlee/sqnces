import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
} from "~/server/api/trpc";
import type { WordEntry } from "~/server/types/definition";
import type { Word } from "~/server/types/word";

let cachedWord: Word | null = null;
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

  // Return a random substring from the list
  const randomIndex = Math.floor(Math.random() * substrings.length);

  return {
    string: substrings[randomIndex] ?? str.substring(0,3),
    index: randomIndex ?? 0,
    letters: substrings[randomIndex]!.split('') ?? str.substring(0,3).split(''),
  };
}

export const wordRouter = createTRPCRouter({
  get: publicProcedure
    .input(z.object({ length: z.number() }))
    .query(async ({ input }) => {
      if (cachedWord && Date.now() - cachedWord.timestamp < CACHE_DURATION_FACTORED) {
        return cachedWord;
      }

      const DEFAULT_WORD = "FAMILY";
      const DEFAULT_LETTERS = ["F", "", "", "", "L", "Y"];
      const DEFAULT_SEQUENCE = {
        string: "AMI",
        index: 1,
        letters: ["A", "M", "I"],
      };
      const wordRes = await fetch(
        `https://random-word-api.vercel.app/api?words=1&length=${input.length}`,
      );

      const wordData = (await wordRes.json()) as string[]; // response will be an array with one word in it
      const word: string = (wordData[0] ?? DEFAULT_WORD).toUpperCase(); // the word
      const sequence: { string: string, index: number, letters: string[] } = generateSequence(word) // random 3-letter sequence with a default value of an empty string
      const wordWithoutSequence = word.substring(0, sequence.index) + word.substring(sequence.index + 3); // remove the sequence from the word
      const letters = wordWithoutSequence.split("");
      letters.splice(sequence.index, 0, "", "", "");

      cachedWord = { 
        data: {
          letters: letters ?? DEFAULT_LETTERS,
          word: word ?? DEFAULT_WORD,
          sequence: sequence ?? DEFAULT_SEQUENCE,
          length: input.length,
        }, 
        timestamp: Date.now() 
      };

      return cachedWord;
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
