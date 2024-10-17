import { z } from "zod";
import {
  createTRPCContext,
  createTRPCRouter,
  publicProcedure,
} from "~/server/api/trpc";
import type { Word, CachedPuzzle, PuzzleCache, ClientPuzzle, LettersMap, SplitWordLetter, LetterData, KeysStatus, Key, Sequence } from "~/server/types/word";
import cron from "node-cron";
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz"; // Handle timezones
import fs from "fs";
import path from "path";

let todaysPuzzle: CachedPuzzle = {
  words: [],
  date: "",
  id: 0,
};
let tomorrowsPuzzle: CachedPuzzle = {
  words: [],
  date: "",
  id: 0,
};
let guesses4: string[], guesses5: string[], guesses6: string[], guesses7: string[], guesses8: string[];
let usedSequences: string[] = [];
let isJobRunning = false;
let isJobDone = false;
const fallbackWords = [
  {
    sequence: {
      string: "OUS",
      index: 3,
      letters: ["O", "U", "S"],
      score: 34,
    },
    length: 6,
    puzzleId: 0,
  },
  {
    sequence: {
      string: "PIR",
      index: 0,
      letters: ["P", "I", "R"],
      score: 25,
    },
    length: 7,
    puzzleId: 0,
  },
  {
    sequence: {
      string: "ITY",
      index: 5,
      letters: ["I", "T", "Y"],
      score: 124,
    },
    length: 8,
    puzzleId: 0,
  },
]

const cacheFilePath = path.join(process.cwd(), 'src', 'server', 'cache', 'puzzleCache.json');

// Save cache to file
function saveCacheToFile() {
  const cacheData: PuzzleCache = {
    today: todaysPuzzle,
    tomorrow: tomorrowsPuzzle,
  };

  fs.writeFileSync(cacheFilePath, JSON.stringify(cacheData), "utf-8");
  console.log("[WORD API] Cache saved to file.");
}

// Load words cache from file or create new words if cache is empty
async function loadWordsFromFile() {
  if (fs.existsSync(cacheFilePath)) {
    console.log("[WORD API] Cache file found.");
    const cacheData = await JSON.parse(fs.readFileSync(cacheFilePath, "utf-8")) as PuzzleCache;

    // if cache is empty, fill it with new words
    if (Object.keys(cacheData).length <= 0) {
      console.log("[WORD API] Cache file is empty.");
      const currentDate = new Date();

      const todaysDate = format(currentDate, "yyyy-MM-dd");
      const currentPuzzle = await generateNewWords(todaysDate) as CachedPuzzle;
      todaysPuzzle.words = currentPuzzle.words;
      todaysPuzzle.date = todaysDate;
      todaysPuzzle.id = currentPuzzle.id;

      console.log("[WORD API] Generated random words to save to cache.");

      const tomorrowsDate = currentDate.setDate(currentDate.getDate() + 1);
      const nextDate = format(tomorrowsDate, "yyyy-MM-dd");
      const nextPuzzle = await generateNewWords(nextDate) as CachedPuzzle;
      tomorrowsPuzzle.words = nextPuzzle.words;
      tomorrowsPuzzle.date = nextDate;
      tomorrowsPuzzle.id = nextPuzzle.id;

      saveCacheToFile();

      console.log("[WORD API] Generated random words to save to cache.");

      return; 
    }

    todaysPuzzle = cacheData.today;
    tomorrowsPuzzle = cacheData.tomorrow;

    console.log("[WORD API] Cache loaded.");
  }
  else {
    console.log("[WORD API] No cache file found.");
    fs.writeFileSync(cacheFilePath, JSON.stringify({ today: {}, tomorrow: {} }), "utf-8");
    const currentDate = new Date();
    
    const todaysDate = format(currentDate, "yyyy-MM-dd");
    const currentPuzzle = await generateNewWords(todaysDate);
    todaysPuzzle.words = currentPuzzle.words;
    todaysPuzzle.date = format(currentDate, "yyyy-MM-dd");
    todaysPuzzle.id = currentPuzzle.id;

    saveCacheToFile();

    console.log("[WORD API] Generated random words to save to cache.");

    const tomorrowsDate = currentDate.setDate(currentDate.getDate() + 1);
    const nextDate = format(tomorrowsDate, "yyyy-MM-dd");
    const nextPuzzle = await generateNewWords(nextDate);
    tomorrowsPuzzle.words = nextPuzzle.words;
    tomorrowsPuzzle.date = nextDate;
    tomorrowsPuzzle.id = nextPuzzle.id;

    saveCacheToFile();

    console.log("[WORD API] Generated random words to save to cache.");

  }
}

async function getValidWord(length: number): Promise<Word> {
  let randomWord: Word | undefined;
  do {
    randomWord = await getRandomWord(length);
  } while (!randomWord);

  return randomWord;
}

async function generateNewWords(date: string) {
  const ctx = await createTRPCContext({ headers: new Headers() });
  const { db } = ctx;

  const random6 = await getValidWord(6);
  const random7 = await getValidWord(7);
  const random8 = await getValidWord(8);

  usedSequences = []; // Reset usedSequences array

  // save the puzzle to the database
  const newPuzzle = await db.puzzle.create({
    data: {
      words: {
        connect: [
          { id: random6.id }, // Connect a word by its id
          { id: random7.id },
          { id: random8.id },
        ],
      },
      sequences: {
        connect: [
          { id: random6.sequence.id }, // Connect a sequence by its id
          { id: random7.sequence.id },
          { id: random8.sequence.id },
        ],
      },
      lastPlayed: date,
    },
  });

  return {
    words: [random6, random7, random8],
    id: newPuzzle.id,
  }
}

function getLocalDate(timezone: string): string {
  const now = new Date();
  const localNow = toZonedTime(now, timezone); // Convert to the user's local time
  return format(localNow, "yyyy-MM-dd"); // Return date-only (midnight)
}

// Set today's words to tomorrow's words at the UTC midnight and
// generate a new set of words for tomorrow
if (process.env.NODE_ENV === "production") {
  cron.schedule("0 0 * * *", () => {
    (async () => {
      if (isJobRunning || isJobDone) {
        console.log("Cron job is already running. Skipping this execution.");
        return;
      }

      isJobRunning = true;

      try {
        const currentDate = new Date();
        const tomorrowsDate = currentDate.setDate(currentDate.getDate() + 1);

        // change today's words with tomorrow's words
        todaysPuzzle = JSON.parse(JSON.stringify(tomorrowsPuzzle)) as CachedPuzzle;

        const formattedDate = format(tomorrowsDate, "yyyy-MM-dd")
        const newPuzzle = await generateNewWords(formattedDate);
        tomorrowsPuzzle.date = formattedDate;
        tomorrowsPuzzle.words = newPuzzle.words;
        tomorrowsPuzzle.id = newPuzzle.id;

        saveCacheToFile(); // Save new words to cache

        console.log(`[WORD API] CRON: Set today's words to tomorrow's words for ${tomorrowsPuzzle.date}`);
      } catch (error) {
        console.log(`[WORD API] CRON: Error setting today's words to tomorrow's words.`);
      } finally {
        isJobRunning = false;
        isJobDone = true;
      }
    })
  });

  cron.schedule("01 0 * * *", () => {
    if (isJobDone) isJobDone = false;
  })
}

function getRandomSequence(sequences: Sequence[]): Sequence | undefined {
  // Step 1: Filter sequences with timesUsed = 0
  const unusedSequences = sequences.filter(seq => seq.timesUsed === 0);

  // Step 2: If there are any unused sequences, pick one randomly
  if (unusedSequences.length > 0) {
    let sequence: Sequence;
    let attempts = 0;
    const maxAttempts = unusedSequences.length;

    // If usedSequences is empty, return the first sequence
    if (usedSequences.length === 0) {
      return unusedSequences[0];
    }

    // Sequentially iterate through unusedSequences
    do {
      sequence = unusedSequences[attempts]!;
      attempts++;
    } while (usedSequences.includes(sequence.letters) && attempts < maxAttempts);

    // Return undefined if no valid sequence is found
    if (usedSequences.includes(sequence.letters)) {
      return undefined;
    }

    usedSequences.push(sequence.letters);
    return sequence;
  }

  // Step 3: If no unused sequences, sort by least recent lastUsed
  const sortedByLastUsed = sequences.sort((a, b) => {
    // Handle nulls for lastUsed (nulls are considered least recent)
    if (a.lastUsed === null && b.lastUsed === null) return 0;
    if (a.lastUsed === null) return -1;
    if (b.lastUsed === null) return 1;

    // Compare lastUsed dates (least recent first)
    return new Date(a.lastUsed).getTime() - new Date(b.lastUsed).getTime();
  });

  // Step 4: Return the least recently used sequence that is not in usedSequences
  for (const sequence of sortedByLastUsed) {
    if (!usedSequences.includes(sequence.letters)) {
      usedSequences.push(sequence.letters);
      return sequence;
    }
  }

  // Step 5: If all sequences are in usedSequences, return undefined
  return undefined;
}

async function getRandomWord(length: number): Promise<Word | undefined> {
  const ctx = await createTRPCContext({ headers: new Headers() });
  const { db } = ctx;

  // Query the database for a random word of the given length
  let randomWord = await db.word.findRandom({
    select: { 
      id: true, 
      word: true, 
      sequences: {
        select: {
          id: true,
          letters: true,
          timesUsed: true,
          lastUsed: true,
          scores: true,
        }
      }, 
      puzzles: true,
      length: true 
    },
    where: { length: length, timesUsed: 0 },
  });

  // if no word is found, that means all words of that length have been used
  // so we reset the timesUsed field for all words of that length
  if (!randomWord) {
    // Safety check: make sure timesUsed is not 0 for any word of that length
    // await db.word.updateMany({
    //   where: { length: length, timesUsed: { not: 0 } },
    //   data: { timesUsed: 0 },
    // });

    // Now we can try to find a random word again
    randomWord = await db.word.findRandom({
      select: {
        id: true,
        word: true,
        sequences: {
          select: {
            id: true,
            letters: true,
            timesUsed: true,
            lastUsed: true,
            scores: true,
          }
        },
        puzzles: true,
        length: true
      },
      where: { length: length, timesUsed: 0 },
    });
  }

  const sequence = getRandomSequence(randomWord!.sequences);

  if (!sequence) {
    console.log(`WORD API] No unique sequence found for ${randomWord!.word}`);

    return undefined;
  }

  const sequenceLetters = sequence.letters;
  const indexOfSequence = randomWord!.word.indexOf(sequenceLetters);
  const wordWithoutSequence = randomWord!.word.substring(0, indexOfSequence) + randomWord!.word.substring(indexOfSequence + 3);
  const letters = wordWithoutSequence.split('');
  letters.splice(indexOfSequence, 0, "", "", "");

  // Update the word's timesUsed field
  // await db.word.update({
  //   where: { id: randomWord.id },
  //   data: { lastUsed: now, timesUsed: { increment: 1 } },
  // });

  // await db.sequence.update({
  //   where: { id: sequence!.id },
  //   data: { lastUsed: now, timesUsed: { increment: 1 } },
  // })

  const newWord: Word = {
    id: randomWord!.id,
    word: randomWord!.word,
    sequence: {
      id: sequence.id,
      string: sequenceLetters,
      index: randomWord!.word.indexOf(sequenceLetters),
      letters: sequenceLetters.split(''),
      score: sequence.scores.find(score => score.wordLength === length)!,
    },
    letters: letters,
    length: randomWord!.length,
  };

  return newWord;
}

function loadGuessFile(filePath: string) {
  const jsonData = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(jsonData) as string[];
}

function loadAllGuessFiles() {
  if (!guesses4 || !guesses5 || !guesses6 || !guesses7 || !guesses8) {
    console.log("[WORD API] Caching guess files...");

    for (let i = 4; i < 9; i++) {
      const filePath = path.join(process.cwd(), 'src', 'server', 'guesses', `guesses-${i}.json`);

      switch (i) {
        case 4:
          if (!guesses4) guesses4 = loadGuessFile(filePath);
          break;
        case 5:
          if (!guesses5) guesses5 = loadGuessFile(filePath);
          break;
        case 6:
          if (!guesses6) guesses6 = loadGuessFile(filePath);
          break;
        case 7:
          if (!guesses7) guesses7 = loadGuessFile(filePath);
          break;
        case 8:
          if (!guesses8) guesses8 = loadGuessFile(filePath);
          break;
      }
    }
  }
}

// binary search
function findGuessInFile(arr: string[], target: string) {
  let left = 0;
  let right = arr.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (arr[mid] === target) {
      return true; // Target found
    }
    if (arr[mid] !== undefined && arr[mid] < target) {
      left = mid + 1; // Search in the right half
    } else {
      right = mid - 1; // Search in the left half
    }
  }
  return false; // Target not found
}

await loadWordsFromFile();
loadAllGuessFiles();

export const wordRouter = createTRPCRouter({
  get: publicProcedure
    .input(z.object({ 
      timezone: z.string().refine((val) => Intl.supportedValuesOf('timeZone').includes(val), {
        message: "Invalid time zone",
      })
    }))
    .query(async ({ input }) => {
      const { timezone } = input;
      const usersDate = getLocalDate(timezone);

      if (todaysPuzzle.words.length > 0 && tomorrowsPuzzle.words.length > 0) {
        // return the puzzle for today in the cache
        if (usersDate === todaysPuzzle.date) {
          const clientPuzzle: ClientPuzzle = {
            words: [],
            id: todaysPuzzle.id,
            date: todaysPuzzle.date,
          }
          clientPuzzle.words = todaysPuzzle.words.map((cachedWord) => ({
            sequence: {
              string: cachedWord.sequence.string,
              index: cachedWord.sequence.index,
              letters: cachedWord.sequence.letters,
              score: cachedWord.sequence.score.score,
            },
            length: cachedWord.length,
            puzzleId: todaysPuzzle.id,
          }));

          console.log(`[WORD API] Cache hit for today's words, date: ${todaysPuzzle.date}.`);

          return clientPuzzle;
        }
          // return the puzzle for tomorrow in the cache
        else if (usersDate === tomorrowsPuzzle.date) {
          const clientPuzzle: ClientPuzzle = {
            words: [],
            id: tomorrowsPuzzle.id,
            date: tomorrowsPuzzle.date,
          }
          clientPuzzle.words = tomorrowsPuzzle.words.map((cachedWord) => ({
            sequence: {
              string: cachedWord.sequence.string,
              index: cachedWord.sequence.index,
              letters: cachedWord.sequence.letters,
              score: cachedWord.sequence.score.score,
            },
            length: cachedWord.length,
            puzzleId: tomorrowsPuzzle.id,
          }));

          console.log(`[WORD API] Cache hit for tomorrow's words, date: ${tomorrowsPuzzle.date}.`);

          return clientPuzzle;
        }
        else {
          const fallbackPuzzle: ClientPuzzle = {
            words: fallbackWords,
            id: 0,
            date: usersDate,
          }
          // fallback
          return fallbackPuzzle;
        }
      }
    }),

  check: publicProcedure
    .input(z.object({ 
      guess: z.string().refine((val) => [4, 5, 6, 7, 8].includes(val.length), {
        message: "Word must be 6, 7, or 8 letters long",
      }),
      timezone: z.string().refine((val) => Intl.supportedValuesOf('timeZone').includes(val), {
        message: "Invalid time zone",
      }),
      length: z.number().refine((val) => [6, 7, 8].includes(val), {
        message: "Length must be one of 6, 7, or 8",
      }),
    }))
    .query(async ({ input }) => {
      const { guess, timezone, length } = input;
      const guessLength = guess.length;
      const usersDate = getLocalDate(timezone);
      let isGuessValid: boolean
      const word = usersDate === todaysPuzzle.date ? todaysPuzzle.words.find(word => word.length === length)! : tomorrowsPuzzle.words.find(word => word.length === length)!;

      switch (guessLength) {
        case 4:
          if (!guesses4) loadAllGuessFiles();
          isGuessValid = findGuessInFile(guesses4, guess);
          break;
        case 5:
          if (!guesses5) loadAllGuessFiles();
          isGuessValid = findGuessInFile(guesses5, guess);
          break;
        case 6:
          if (!guesses6) loadAllGuessFiles();
          isGuessValid = findGuessInFile(guesses6, guess);
          break;
        case 7:
          if (!guesses7) loadAllGuessFiles();
          isGuessValid = findGuessInFile(guesses7, guess);
          break;
        case 8:
          if (!guesses8) loadAllGuessFiles();
          isGuessValid = findGuessInFile(guesses8, guess);
          break;
        default:
          loadAllGuessFiles();
          isGuessValid = findGuessInFile(guesses6, guess);
      }

      if (!isGuessValid) {
        return {
          isValid: false,
          keys: {},
          map: [],
        }
      }

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
          validationMap[i] = { letter: letterGuessed, type: "empty", sequence: false };
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
