import { z } from "zod";
import {
  createTRPCContext,
  createTRPCRouter,
  publicProcedure,
} from "~/server/api/trpc";
import type { CachedPuzzle, PuzzleCache, ClientPuzzle, LettersMap, SplitWordLetter, LetterData, KeysStatus, Key } from "~/server/types/word";
import { endOfToday, endOfTomorrow, format, startOfDay, isSameDay, startOfToday, startOfTomorrow, addDays } from "date-fns";
import { toZonedTime, fromZonedTime } from "date-fns-tz"; // Handle timezones
import fs from "fs";
import path from "path";

let todaysCache: CachedPuzzle = {
  words: [],
  date: "",
  id: 0,
};
let tomorrowsCache: CachedPuzzle = {
  words: [],
  date: "",
  id: 0,
};

const cacheFilePath = path.join(process.cwd(), 'src', 'server', 'cache', 'puzzleCache.json');

// Save cache to file
function saveCacheToFile() {
  const cacheData: PuzzleCache = {
    today: todaysCache,
    tomorrow: tomorrowsCache,
  };

  fs.writeFileSync(cacheFilePath, JSON.stringify(cacheData), "utf-8");
  console.log("[WORD API] Cache saved to file.");
}

async function getWordsForCache() {
  const ctx = await createTRPCContext({ headers: new Headers() });
  const { db } = ctx;

  const todayStart = startOfToday(); // Today at 00:00
  const todayEnd = endOfToday();

  const todaysPuzzle = await db.puzzle.findFirst({
    where: {
      datePlayed: {
        gte: todayStart,
        lt: todayEnd,
      }
    },
    select: {
      id: true,
      datePlayed: true,
      wordSequences: {
        select: {
          word: {
            select: {
              id: true,
              word: true,
              length: true,
            }
          },
          sequence: {
            select: {
              id: true,
              letters: true,
              scores: true,
            }
          }
        }
      },
    }
  });

  todaysCache.words = todaysPuzzle!.wordSequences.map((wordSequence) => {
    const sequenceLetters = wordSequence.sequence.letters
    const indexOfSequence = wordSequence.word.word.indexOf(sequenceLetters);
    const wordWithoutSequence = wordSequence.word.word.substring(0, indexOfSequence) + wordSequence.word.word.substring(indexOfSequence + 3);
    const letters = wordWithoutSequence.split('');
    letters.splice(indexOfSequence, 0, "", "", "");
    
    return {
      id: wordSequence.word.id,
      word: wordSequence.word.word,
      length: wordSequence.word.length,
      letters: letters,
      sequence: {
        id: wordSequence.sequence.id,
        string: sequenceLetters,
        index: indexOfSequence,
        letters: sequenceLetters.split(''),
        score: wordSequence.sequence.scores.find(score => score.wordLength === wordSequence.word.length)!,
      },
    }
  });
  todaysCache.id = todaysPuzzle!.id;
  todaysCache.date = todaysPuzzle!.datePlayed.toISOString();

  const tomorrowStart = startOfTomorrow(); // Today at 00:00
  const tomorrowEnd = endOfTomorrow();

  const tomorrowsPuzzle = await db.puzzle.findFirst({
    where: {
      datePlayed: {
        gte: tomorrowStart,
        lt: tomorrowEnd,
      }
    },
    select: {
      id: true,
      datePlayed: true,
      wordSequences: {
        select: {
          word: {
            select: {
              id: true,
              word: true,
              length: true,
            }
          },
          sequence: {
            select: {
              id: true,
              letters: true,
              scores: true,
            }
          }
        }
      },
    }
  });

  tomorrowsCache.words = tomorrowsPuzzle!.wordSequences.map((wordSequence) => {
    const sequenceLetters = wordSequence.sequence.letters
    const indexOfSequence = wordSequence.word.word.indexOf(sequenceLetters);
    const wordWithoutSequence = wordSequence.word.word.substring(0, indexOfSequence) + wordSequence.word.word.substring(indexOfSequence + 3);
    const letters = wordWithoutSequence.split('');
    letters.splice(indexOfSequence, 0, "", "", "");

    return {
      id: wordSequence.word.id,
      word: wordSequence.word.word,
      length: wordSequence.word.length,
      letters: letters,
      sequence: {
        id: wordSequence.sequence.id,
        string: sequenceLetters,
        index: indexOfSequence,
        letters: sequenceLetters.split(''),
        score: wordSequence.sequence.scores.find(score => score.wordLength === wordSequence.word.length)!,
      },
    }
  });
  tomorrowsCache.id = tomorrowsPuzzle!.id;
  tomorrowsCache.date = tomorrowsPuzzle!.datePlayed.toISOString();
}

// Load words cache from file or create new words if cache is empty
async function loadCache() {
  if (!fs.existsSync(cacheFilePath)) {
    console.log("[WORD API] No cache file found, creating a new cache file.");

    fs.writeFileSync(cacheFilePath, JSON.stringify({ today: {}, tomorrow: {} }), "utf-8");

    await getWordsForCache();

    saveCacheToFile();

    console.log("[WORD API] Generated random words to save to cache.");

    return;
  }

  console.log("[WORD API] Cache file found.");

  const cacheData = await JSON.parse(fs.readFileSync(cacheFilePath, "utf-8")) as PuzzleCache;

  // if cache is empty, fill it with new words
  if (Object.keys(cacheData).length <= 0) {
    console.log("[WORD API] Cache file is empty.");

    await getWordsForCache();

    saveCacheToFile();

    console.log("[WORD API] Generated random words to save to cache.");

    return; 
  }

  todaysCache = cacheData.today;
  tomorrowsCache = cacheData.tomorrow;

  console.log("[WORD API] Cache loaded.");
  
}

function getLocalDate(timezone: string): Date {
  const now = new Date();
  const localNow = toZonedTime(now, timezone); // Convert to the user's local time
  // Reset the time portion to midnight in the local timezone
  const localMidnight = new Date(
    localNow.getFullYear(),
    localNow.getMonth(),
    localNow.getDate(),
    0, 0, 0
  );

  // Convert local midnight back to UTC
  const utcMidnight = fromZonedTime(localMidnight, timezone);

  // Return the UTC midnight time
  return utcMidnight;
}

await loadCache();

const today = new Date().toISOString().split('T')[0];
const tomorrow = addDays(new Date(), 1).toISOString().split('T')[0];

export const wordRouter = createTRPCRouter({
  get: publicProcedure
  .input(z.object({ 
    usersDate: z.string().refine((dateString) => {
      // Validate if the date part matches today or tomorrow
      return dateString === today || dateString === tomorrow;
    }, {
      message: "Invalid date.",
    }),
  }))
  .query(async ({ input }) => {
    const { usersDate } = input;
    console.log("🚀 ~ .query ~ usersDate:", usersDate)

    // check if the cached puzzles exist for both today and tomorrow
    if (todaysCache.words.length > 0 && tomorrowsCache.words.length > 0) {
      // return the puzzle for today in the cache
      if (usersDate === todaysCache.date.split("T")[0]!) {
        const clientPuzzle: ClientPuzzle = {
          words: [],
          id: todaysCache.id,
          date: format(todaysCache.date, "MM-dd-yyyy"),
        }
        clientPuzzle.words = todaysCache.words.map((cachedWord) => ({
          sequence: {
            string: cachedWord.sequence.string,
            index: cachedWord.sequence.index,
            letters: cachedWord.sequence.letters,
            score: cachedWord.sequence.score.score,
          },
          length: cachedWord.length,
          puzzleId: todaysCache.id,
        }));

        console.log(`[WORD API] Cache hit for today's words, date: ${format(todaysCache.date, "MM-dd-yyyy")}.`);

        return clientPuzzle;
      }
      // return the puzzle for tomorrow in the cache
      else if (usersDate === tomorrowsCache.date.split("T")[0]!) {
        const clientPuzzle: ClientPuzzle = {
          words: [],
          id: tomorrowsCache.id,
          date: format(tomorrowsCache.date, "MM-dd-yyyy"),
        }
        clientPuzzle.words = tomorrowsCache.words.map((cachedWord) => ({
          sequence: {
            string: cachedWord.sequence.string,
            index: cachedWord.sequence.index,
            letters: cachedWord.sequence.letters,
            score: cachedWord.sequence.score.score,
          },
          length: cachedWord.length,
          puzzleId: tomorrowsCache.id,
        }));

        console.log(`[WORD API] Cache hit for tomorrow's words, date: ${format(tomorrowsCache.date, "MM-dd-yyyy") }.`);

        return clientPuzzle;
      }
      // this SHOULD mean the cache is completely stale, so we need to fetch new words
      else {
        console.log(`[WORD API] Cache miss for today and tomorrow's words. Fetching a new puzzle from the database.`);
        
        await getWordsForCache();

        saveCacheToFile();
      }
    }
    
  }),

  check: publicProcedure
    .input(z.object({ 
      guess: z.string().refine((val) => [4, 5, 6, 7, 8].includes(val.length), {
        message: "Word must be 6, 7, or 8 letters long",
      }),
      usersDate: z.string().refine((dateString) => {
        // Validate if the date part matches today or tomorrow
        return dateString === today || dateString === tomorrow;
      }, {
        message: "Invalid date.",
      }),
      length: z.number().refine((val) => [6, 7, 8].includes(val), {
        message: "Length must be one of 6, 7, or 8",
      }),
      hardMode: z.boolean(),
    }))
    .query(async ({ input }) => {
      const { guess, usersDate, length, hardMode } = input;
      const guessLength = guess.length;
      const todaysDate = todaysCache.date.split("T")[0]!;
      const word = usersDate === todaysDate ? todaysCache.words.find(word => word.length === length)! : tomorrowsCache.words.find(word => word.length === length)!;
      const { sequence } = word;

      if (!guess.includes(sequence.string)) {
        return {
          isValid: false,
          keys: {},
          map: [],
          won: false,
          message: "Word must include the sequence.",
        }
      }

      const guessIsCorrect = guess === word.word;
      const letters = word.letters;
      const lettersMap: LettersMap = letters.map((letter) => ({ letter, used: false }));
      const splitWord: SplitWordLetter[] = [];
      const validationMap: LetterData[] = []; // returned variable
      const keys: KeysStatus = {};
      // guess variables
      const charsBefore = guess.indexOf(sequence.string); // number of characters before the sequence begins 
      const charsAfter = guessLength - charsBefore - 3; // number of characters after the sequence ends 
      // word variables
      const wordLength = word.length; // length of the word 
      const startIndex = sequence.index - charsBefore; // can be a negative number 
      const endIndex = sequence.index + 3 + charsAfter;

      // we need to generate an array of letters that compares respectively to the letters in guess
      for (let n = startIndex; n < endIndex; n++) {
        // if the index is out of bounds (aka the guess has more characters on either side of the sequence than the word)
        if (n < 0 || n > wordLength) {
          splitWord.push({ letter: "", sequence: false, index: n, });
        }
        // mark the sequence letters
        else if (n >= sequence.index && n < sequence.index + 3) {
          splitWord.push({ letter: word.word.charAt(n) as Key, sequence: true, index: n });
        }
        else {
          splitWord.push({ letter: word.word.charAt(n) as Key, sequence: false, index: n });
        }
      }

      // pass through the guess once first to check for correct letters
      for (let i = 0; i < guessLength; i++) {
        const letterGuessed = guess.charAt(i);
        const letterToCompare = splitWord[i] ?? { letter: "", sequence: false, index: i };

        if (letterToCompare.letter === letterGuessed && !letterToCompare.sequence) {
          lettersMap[letterToCompare.index] = {
            letter: letterGuessed,
            used: true,
          };
          keys[letterGuessed] = "correct";
          validationMap[i] = { letter: letterGuessed, type: "correct", sequence: false };
        }
      }

      // compare the guess to the split word (the word that accurately corresponds to the same letter positions as the guess)
      for (let i = 0; i < guessLength; i++) {
        const letterGuessed = guess.charAt(i) as Key;
        const letterToCompare = splitWord[i]!.letter;
        const letterIsSequence = splitWord[i]!.sequence;
        // check to see if the guessed letter is already marked as correct
        const correctLetterExists = validationMap.length > 0 && validationMap.find(l => l?.letter === letterGuessed && l.type === "correct");
        const misplacedLetterExists = lettersMap.find(l => l.letter === letterGuessed && !l.used);

        // never override an existing letter
        if (validationMap[i]) continue;

        if (letterIsSequence) {
          if (guessIsCorrect) {
            keys[letterGuessed] = "correct";
            validationMap[i] = { letter: letterGuessed, type: "correct", sequence: true };
          }
          else {
            validationMap[i] = { letter: letterGuessed, type: "sequence", sequence: true };
          }
        }
        else if (letterToCompare === "") {
          if (!hardMode && misplacedLetterExists) {
            if (!correctLetterExists) {
              keys[letterGuessed] = "misplacedEmpty";
            };

            validationMap[i] = { letter: letterGuessed, type: "misplacedEmpty", sequence: false };
            misplacedLetterExists.used = true;
          }
          else {
            validationMap[i] = { letter: letterGuessed, type: "empty", sequence: false };
          };
        }
        else if (misplacedLetterExists) {
          if (!correctLetterExists) {
            keys[letterGuessed] = "misplaced";
          };

          validationMap[i] = { letter: letterGuessed, type: "misplaced", sequence: false };
          misplacedLetterExists.used = true;
        }
        else {
          if (!correctLetterExists) {
            keys[letterGuessed] = "incorrect";
          };

          validationMap[i] = { letter: letterGuessed, type: "incorrect", sequence: false };
        }
      }

      return {
        isValid: true,
        keys: keys,
        map: validationMap,
        won: guessIsCorrect,
      }
    })
  ,

  // validate: publicProcedure
  //   .input(z.object({ word: z.string() }))
  //   .query(async ({ input }) => {
      
      
  //     // const definitionRes = await fetch(
  //     //   `https://api.dictionaryapi.dev/api/v2/entries/en/${input.word}`
  //     // )
  //     // // https://www.dictionaryapi.com/products/api-collegiate-dictionary

  //     // const definitionData = await definitionRes.json() as WordEntry[];

  //     // if (typeof definitionData === "object" && "title" in definitionData) {
  //     //   return {
  //     //     isValid: false,
  //     //     message: "Invalid word",
  //     //     definition: "No definition found",
  //     //   };
  //     // }

  //     // const entry = definitionData[0]!;
  //     // const definition = entry?.meanings[0]?.definitions[0]?.definition;

  //     // return {
  //     //   isValid: true,
  //     //   message: "Valid word",
  //     //   definition: definition ?? "No definition found",
  //     // }
  //   }),
});
