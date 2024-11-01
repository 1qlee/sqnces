import { z, ZodError } from "zod";
import {
  createTRPCContext,
  createTRPCRouter,
  publicProcedure,
} from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import type { CachedPuzzle, PuzzleCache, ClientPuzzle, LettersMap, SplitWordLetter, LetterData, KeysStatus, Key } from "~/server/types/word";
import { endOfToday, endOfTomorrow, format, startOfToday, startOfTomorrow, addDays } from "date-fns";
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
  todaysCache.date = new Date(todaysPuzzle!.datePlayed).toLocaleDateString();

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
  tomorrowsCache.date = new Date(tomorrowsPuzzle!.datePlayed).toLocaleDateString();
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

await loadCache();

const today = new Date().toLocaleDateString();
const tomorrow = addDays(new Date(), 1).toLocaleDateString();

const checkGuessSchema = z
  .object({
    guess: z.string()
      .refine((val) => [4, 5, 6, 7, 8].includes(val.length), {
        message: JSON.stringify({
          message: "Word must be 6, 7, or 8 letters long.",
          code: "INVALID_GUESS_LENGTH"
        }),
      })
      .refine((val) => /^[a-zA-Z]+$/.test(val), {
        message: JSON.stringify({
          message: "Word must contain only alphabetic characters.",
          code: "INVALID_CHARACTERS"
        }),
      }),
    usersDate: z.string().refine((dateString) => {
      // Validate if the date part matches today or tomorrow
      return dateString === today || dateString === tomorrow;
    }, {
      message: JSON.stringify({
        message: "You are trying to submit a guess for an old puzzle. Please refresh the page or clear your cache.",
        code: "INVALID_DATE",
      })
    }),
    length: z.number().refine((val) => [6, 7, 8].includes(val), {
      message: JSON.stringify({
        message: "Word must be 6, 7, or 8 letters long.",
        code: "INVALID_WORD_LENGTH",
      })
    }),
    hardMode: z.boolean(),
    puzzleId: z.number().refine((val) => val === todaysCache.id || val === tomorrowsCache.id, {
      message: JSON.stringify({
        message: "Could not find this puzzle. Please refresh the page or clear your cache.",
        code: "INVALID_PUZZLE_ID",
      })
    }),
  })
  .refine((data) => data.puzzleId !== (data.usersDate === today ? todaysCache.id : tomorrowsCache.id), {
    message: JSON.stringify({
      message: "Received a request for an old puzzle. Please refresh the page or clear your cache.",
      code: "INVALID_PUZZLE_ID"
    }),
    path: ["puzzleId"], // Associates the error with the `usersDate` field
  });

export const wordRouter = createTRPCRouter({
  get: publicProcedure
  .input(z.object({ 
    usersDate: z.string().refine((dateString) => {
      // Validate if the date part matches today or tomorrow
      return dateString === today || dateString === tomorrow;
    }, {
      message: JSON.stringify({
        message: "Invalid date.",
        code: "INVALID_DATE",
      })
    }),
  }))
  .query(async ({ input }) => {
    const { usersDate } = input;

    // check if the cached puzzles exist for both today and tomorrow
    if (todaysCache.words.length > 0 && tomorrowsCache.words.length > 0) {
      // return the puzzle for today in the cache
      if (usersDate === new Date(todaysCache.date).toLocaleDateString()) {
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
      else if (usersDate === new Date(tomorrowsCache.date).toLocaleDateString()) {
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
    .input(checkGuessSchema)
    .query(async ({ input }) => {
      const { guess, usersDate, length, hardMode } = input;
      const guessLength = guess.length;
      const todaysDate = new Date(todaysCache.date).toLocaleDateString();
      const word = usersDate === todaysDate ? todaysCache.words.find(word => word.length === length)! : tomorrowsCache.words.find(word => word.length === length)!;
      const { sequence } = word;
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
        const misplacedLetterExists = lettersMap.find(l => l?.letter === letterGuessed && !l.used);

        // never override an existing letter
        if (validationMap[i]) continue;

        // sequence position
        if (letterIsSequence) {
          if (guessIsCorrect) {
            keys[letterGuessed] = "correct";
            validationMap[i] = { letter: letterGuessed, type: "correct", sequence: true };
          }
          else {
            validationMap[i] = { letter: letterGuessed, type: "sequence", sequence: true };
          }
        }
        // empty position
        else if (letterToCompare === "") {
          if (!hardMode) {
            if (misplacedLetterExists) {
              if (!correctLetterExists) {
                keys[letterGuessed] = "misplacedEmpty";
              };

              validationMap[i] = { letter: letterGuessed, type: "misplacedEmpty", sequence: false };
              misplacedLetterExists.used = true;
            }
            else if (letterToCompare !== letterGuessed) {
              if (!correctLetterExists) {
                keys[letterGuessed] = "incorrectEmpty";
              };

              validationMap[i] = { letter: letterGuessed, type: "incorrectEmpty", sequence: false };
            }
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
        // incorrect position
        else {
          // should never override a correct or misplaced letter on the keyboard
          if (!correctLetterExists && !lettersMap.find(l => l?.letter === letterGuessed)) {
            keys[letterGuessed] = "incorrect";
          };

          validationMap[i] = { letter: letterGuessed, type: "incorrect", sequence: false };
        }
      }

      return {
        status: "SUCCESS",
        keys: keys,
        map: validationMap,
        won: guessIsCorrect,
      }
    })
  ,
});
