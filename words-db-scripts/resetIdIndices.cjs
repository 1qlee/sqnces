const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function resetAutoIncrement() {
  try {
    // // Reset sequence for Puzzle table
    await prisma.$executeRaw`ALTER SEQUENCE "Puzzle_id_seq" RESTART WITH 1`;
    console.log('Reset sequence for Puzzle table.');

    // // Reset sequence for Score table
    // await prisma.$executeRaw`ALTER SEQUENCE "Score_id_seq" RESTART WITH 1`;
    // console.log('Reset sequence for Score table.');

    // // Reset sequence for Sequence table
    // await prisma.$executeRaw`ALTER SEQUENCE "Sequence_id_seq" RESTART WITH 1`;
    // console.log('Reset sequence for Sequence table.');

    // // Reset sequence for Word table
    // await prisma.$executeRaw`ALTER SEQUENCE "Word_id_seq" RESTART WITH 1`;
    // console.log('Reset sequence for Word table.');
  } catch (error) {
    console.error('Error resetting sequences:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetAutoIncrement();
