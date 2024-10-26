import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function resetWordAndSequenceFields() {
  // Reset timesUsed and lastUsed for Word model
  await prisma.word.updateMany({
    data: {
      timesUsed: 0,
      lastUsed: null,
    }
  });

  // Reset timesUsed and lastUsed for Sequence model
  await prisma.sequence.updateMany({
    data: {
      timesUsed: 0,
      lastUsed: null,
    }
  });

  console.log('Reset timesUsed to 0 and lastUsed to null for Word and Sequence models.');
}

// Run the function
resetWordAndSequenceFields()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
