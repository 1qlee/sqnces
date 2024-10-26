import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function clearTables() {
  try {
    // Delete all records from the Puzzle table
    await prisma.puzzle.deleteMany({});
    console.log('All records from Puzzle table deleted.');

    // // Delete all records from the Score table
    // await prisma.score.deleteMany({});
    // console.log('All records from Score table deleted.');

    // // Delete all records from the Sequence table
    // await prisma.sequence.deleteMany({});
    // console.log('All records from Sequence table deleted.');

    // // Delete all records from the Word table
    // await prisma.word.deleteMany({});
    // console.log('All records from Word table deleted.');
  } catch (error) {
    console.error('Error deleting records:', error);
  } finally {
    // Disconnect the Prisma Client
    await prisma.$disconnect();
  }
}

// Execute the function to clear tables
clearTables();
