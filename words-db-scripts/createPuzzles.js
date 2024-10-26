import { PrismaClient } from '@prisma/client';
import prismaRandom from 'prisma-extension-random';
import { format, startOfToday } from 'date-fns';

const prisma = new PrismaClient().$extends(prismaRandom());

async function getValidWord(length, usedSequences, attempts = 0) {
  // Fetch a random word of the specified length
  let randomWord = await prisma.word.findRandom({
    where: { length: length, timesUsed: 0 },
    include: { sequences: true }
  });

  // If no word with timesUsed = 0, try timesUsed = 1
  if (!randomWord) {
    randomWord = await prisma.word.findRandom({
      where: { length: length, timesUsed: 1 },
      include: { sequences: true }
    });
  }

  // Get a valid sequence with attempts passed
  const validSequence = await getValidSequence(randomWord.sequences, usedSequences, attempts);

  // If no valid sequence is found, increment attempts and try again
  if (!validSequence) {
    console.log(`No valid sequence found for word after attempt #${attempts + 1}. Trying again...`);
    return getValidWord(length, usedSequences, attempts + 1);
  }

  // Return the word and sequence
  return {
    word: randomWord,
    sequence: validSequence
  };
}

async function getValidSequence(sequences, usedSequences, attempts = 0) {
  const MAX_ATTEMPTS = 10;

  // Filter sequences by those not already used in the puzzle
  const filteredSequences = sequences.filter(seq => !usedSequences.includes(seq.letters));

  // If no valid sequence remains, return undefined
  if (filteredSequences.length === 0) {
    console.log("No valid sequences found for this word.");
    return undefined;
  }

  // Check if there are any sequences with timesUsed = 0
  let unusedSequences = filteredSequences.filter(seq => seq.timesUsed === 0);

  // If no sequences with timesUsed = 0, increase attempts count
  if (unusedSequences.length === 0) {
    console.log(`No sequences with timesUsed = 0 found. Attempt #${attempts + 1}`);
    attempts++;
  }

  // If attempts exceed MAX_ATTEMPTS, allow timesUsed > 0 sequences
  if (attempts >= MAX_ATTEMPTS) {
    console.log("Max attempts reached. Allowing sequences with timesUsed > 0.");
    unusedSequences = filteredSequences; // Allow any sequence regardless of timesUsed
  }

  // If still no valid sequence remains, return undefined
  if (unusedSequences.length === 0) {
    return undefined;
  }

  // Sort by timesUsed (ascending) and lastUsed (least recent first)
  const sortedSequences = unusedSequences.sort((a, b) => {
    if (a.timesUsed !== b.timesUsed) {
      return a.timesUsed - b.timesUsed;
    }
    if (a.lastUsed === null) return -1;
    if (b.lastUsed === null) return 1;
    return new Date(a.lastUsed).getTime() - new Date(b.lastUsed).getTime();
  });

  // Return the least used and least recently used sequence
  return sortedSequences[0];
}

async function generateNewPuzzle(date) {
  const usedSequences = [];
  const words = [];

  // Generate valid words for different lengths and store their sequences
  const random6 = await getValidWord(6, usedSequences);
  usedSequences.push(random6.sequence.letters);
  words.push(random6);

  const random7 = await getValidWord(7, usedSequences);
  usedSequences.push(random7.sequence.letters);
  words.push(random7);

  const random8 = await getValidWord(8, usedSequences);
  usedSequences.push(random8.sequence.letters);
  words.push(random8);

  // Save the puzzle and update usage counts
  const newPuzzle = await prisma.puzzle.create({
    data: {
      datePlayed: date,
      wordSequences: {
        create: words.map(({ word, sequence }) => ({
          word: { connect: { id: word.id } },
          sequence: { connect: { id: sequence.id } }
        }))
      },
    },
    include: {
      wordSequences: {
        include: {
          word: true,
          sequence: true,
        }
      }
    }
  });

  // Update timesUsed for words and sequences
  await prisma.word.updateMany({
    where: { id: { in: [random6.word.id, random7.word.id, random8.word.id] } },
    data: { lastUsed: date, timesUsed: { increment: 1 } }
  });

  await prisma.sequence.updateMany({
    where: { id: { in: [random6.sequence.id, random7.sequence.id, random8.sequence.id] } },
    data: { lastUsed: date, timesUsed: { increment: 1 } }
  });

  return newPuzzle;
}

async function getStartingDate() {
  const mostRecentPuzzle = await prisma.puzzle.findFirst({
    orderBy: { datePlayed: 'desc' }, // Get the most recent datePlayed date
    select: { datePlayed: true } // Only select the datePlayed field
  });

  if (mostRecentPuzzle) {
    // Increment the most recent date by one day
    return incrementDateByOneDay(mostRecentPuzzle.datePlayed);
  } else {
    // If no puzzle exists, return today's date
    return startOfToday();
  }
}

function incrementDateByOneDay(currentDate) {
  const date = new Date(currentDate);
  date.setDate(date.getDate() + 1); // Increment date by one day

  return date;
}

async function createPuzzles(numberOfPuzzles) {
  let currentDate = await getStartingDate(); // Get the most recent date or today's date

  for (let i = 0; i < numberOfPuzzles; i++) {
    await generateNewPuzzle(currentDate);

    console.log(`Puzzle generated for ${format(currentDate, "MM-dd-yyyy")}.`);
    // Increment date for the next puzzle
    currentDate = incrementDateByOneDay(currentDate);
  }

  console.log(`Generated ${numberOfPuzzles} puzzles up until ${format(currentDate, "MM-dd-yyyy")}`);
}

// Start puzzle creation
createPuzzles(5)
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
