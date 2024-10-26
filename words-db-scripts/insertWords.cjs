const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');
const path = require('path');

// Adjust this to point to your JSON file (e.g., words_6.json, words_7.json)
const jsonFilePath = path.join(__dirname, 'scored-8.json');

// Extract word length from the filename
const wordLength = parseInt(jsonFilePath.match(/\d+/)[0], 10);

// Batch size for creating many records
const BATCH_SIZE = 100;

async function insertData(limit = 10) {
  try {
    // Step 1: Load the JSON file
    const rawData = fs.readFileSync(jsonFilePath, 'utf-8');
    const wordsData = JSON.parse(rawData);

    // Step 2: Limit the number of words for testing
    const limitedWordsData = wordsData.slice(0, limit);

    // Step 3: Prepare data for batch insertions
    const wordInsertPromises = [];
    const sequenceInsertPromises = [];
    const scoreInsertPromises = [];
    const wordSequenceRelations = [];  // To store word-sequence connections

    for (const wordEntry of wordsData) {
      const { word, sequences } = wordEntry;

      // Step 3a: Batch word creation
      wordInsertPromises.push({
        word: word,
        length: wordLength,
      });

      // Step 3b: Handle Sequences and Scores
      for (const seq of sequences) {
        sequenceInsertPromises.push({
          where: { letters: seq.letters },
          create: {
            letters: seq.letters,
          },
        });

        scoreInsertPromises.push({
          wordLength: wordLength,
          score: seq.score,
          category: seq.category,
          letters: seq.letters, // Temporary storage for associating sequence later
        });

        // Step 3c: Store word-sequence relationship for later connection
        wordSequenceRelations.push({
          word,
          sequenceLetters: seq.letters,
        });
      }
    }

    // Step 4: Batch insert words
    const createdWords = await prisma.word.createMany({
      data: wordInsertPromises,
      skipDuplicates: true,  // Skip duplicates to prevent errors
    });

    console.log(`Created ${createdWords.count} words.`);

    // Step 5: Batch insert sequences and upsert scores
    for (let i = 0; i < sequenceInsertPromises.length; i += BATCH_SIZE) {
      const batch = sequenceInsertPromises.slice(i, i + BATCH_SIZE);
      await prisma.sequence.createMany({
        data: batch.map(seq => seq.create),
        skipDuplicates: true,  // Skip duplicates
      });
    }

    console.log(`Inserted sequences in batches.`);

    // Step 6: Batch insert scores (after ensuring sequences exist)
    for (let i = 0; i < scoreInsertPromises.length; i += BATCH_SIZE) {
      const batch = scoreInsertPromises.slice(i, i + BATCH_SIZE);

      // First, resolve all the sequences outside the transaction
      const sequenceResults = await Promise.all(batch.map(async (score) => {
        const foundSequence = await prisma.sequence.findUnique({
          where: { letters: score.letters },
        });

        // If no sequence is found, return null
        return foundSequence ? { ...score, sequenceId: foundSequence.id } : null;
      }));

      // Filter out any nulls (sequences that were not found)
      const validSequences = sequenceResults.filter((result) => result !== null);

      // Now run the upserts inside the transaction
      await prisma.$transaction(
        validSequences.map((score) =>
          prisma.score.upsert({
            where: {
              sequenceId_wordLength: {
                sequenceId: score.sequenceId,
                wordLength: score.wordLength,
              },
            },
            update: {
              score: score.score,
              category: score.category,
            },
            create: {
              wordLength: score.wordLength,
              score: score.score,
              category: score.category,
              sequence: {
                connect: { id: score.sequenceId },
              },
            },
          })
        )
      );
    }

    console.log('Inserted scores successfully.');

    // Step 7: Connect words to sequences (many-to-many relationship)
    for (let i = 0; i < wordSequenceRelations.length; i += BATCH_SIZE) {
      const batch = wordSequenceRelations.slice(i, i + BATCH_SIZE);

      await Promise.all(
        batch.map(async ({ word, sequenceLetters }) => {
          const foundSequence = await prisma.sequence.findUnique({
            where: { letters: sequenceLetters },
          });

          if (foundSequence) {
            await prisma.word.update({
              where: { word: word },
              data: {
                sequences: {
                  connect: { id: foundSequence.id },
                },
              },
            });
          }
        })
      );
    }

    console.log('Connected words to sequences.');

  } catch (error) {
    console.error('Error inserting data:', error);
  } finally {
    // Step 8: Disconnect Prisma Client
    await prisma.$disconnect();
  }
}


// Run the insert function for testing with a limit of 10 words
insertData();
