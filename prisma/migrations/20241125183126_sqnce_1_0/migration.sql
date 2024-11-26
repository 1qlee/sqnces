/*
  Warnings:

  - You are about to drop the `Post` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "Category" AS ENUM ('Easy', 'Medium', 'Hard');

-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "Post_createdById_fkey";

-- DropTable
DROP TABLE "Post";

-- CreateTable
CREATE TABLE "WordSequence" (
    "id" SERIAL NOT NULL,
    "wordId" INTEGER NOT NULL,
    "sequenceId" INTEGER NOT NULL,
    "puzzleId" INTEGER NOT NULL,

    CONSTRAINT "WordSequence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Puzzle" (
    "id" SERIAL NOT NULL,
    "number" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "datePlayed" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Puzzle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PuzzleStats" (
    "id" SERIAL NOT NULL,
    "puzzleId" INTEGER NOT NULL,
    "wordLength" INTEGER NOT NULL,
    "lettersUsed" DECIMAL(3,1) NOT NULL,
    "timesGuessed" DECIMAL(2,1) NOT NULL,
    "timesFailed" INTEGER NOT NULL DEFAULT 0,
    "timesSolved" INTEGER NOT NULL DEFAULT 0,
    "timesPlayed" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PuzzleStats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Word" (
    "id" SERIAL NOT NULL,
    "word" TEXT NOT NULL,
    "length" INTEGER NOT NULL,
    "lastUsed" TIMESTAMP(3),
    "timesUsed" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Word_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sequence" (
    "id" SERIAL NOT NULL,
    "letters" TEXT NOT NULL,
    "lastUsed" TIMESTAMP(3),
    "timesUsed" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Sequence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Score" (
    "id" SERIAL NOT NULL,
    "wordLength" INTEGER NOT NULL,
    "score" INTEGER NOT NULL,
    "category" "Category" NOT NULL,
    "sequenceId" INTEGER NOT NULL,

    CONSTRAINT "Score_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_WordSequences" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "WordSequence_puzzleId_wordId_sequenceId_key" ON "WordSequence"("puzzleId", "wordId", "sequenceId");

-- CreateIndex
CREATE UNIQUE INDEX "Puzzle_number_key" ON "Puzzle"("number");

-- CreateIndex
CREATE UNIQUE INDEX "Puzzle_datePlayed_key" ON "Puzzle"("datePlayed");

-- CreateIndex
CREATE INDEX "Puzzle_id_idx" ON "Puzzle"("id");

-- CreateIndex
CREATE INDEX "PuzzleStats_puzzleId_wordLength_idx" ON "PuzzleStats"("puzzleId", "wordLength");

-- CreateIndex
CREATE UNIQUE INDEX "PuzzleStats_puzzleId_wordLength_key" ON "PuzzleStats"("puzzleId", "wordLength");

-- CreateIndex
CREATE UNIQUE INDEX "Word_word_key" ON "Word"("word");

-- CreateIndex
CREATE INDEX "Word_length_idx" ON "Word"("length");

-- CreateIndex
CREATE INDEX "Word_length_timesUsed_idx" ON "Word"("length", "timesUsed");

-- CreateIndex
CREATE UNIQUE INDEX "Sequence_letters_key" ON "Sequence"("letters");

-- CreateIndex
CREATE INDEX "Sequence_letters_idx" ON "Sequence"("letters");

-- CreateIndex
CREATE INDEX "Score_sequenceId_wordLength_idx" ON "Score"("sequenceId", "wordLength");

-- CreateIndex
CREATE UNIQUE INDEX "Score_sequenceId_wordLength_key" ON "Score"("sequenceId", "wordLength");

-- CreateIndex
CREATE UNIQUE INDEX "_WordSequences_AB_unique" ON "_WordSequences"("A", "B");

-- CreateIndex
CREATE INDEX "_WordSequences_B_index" ON "_WordSequences"("B");

-- AddForeignKey
ALTER TABLE "WordSequence" ADD CONSTRAINT "WordSequence_wordId_fkey" FOREIGN KEY ("wordId") REFERENCES "Word"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WordSequence" ADD CONSTRAINT "WordSequence_sequenceId_fkey" FOREIGN KEY ("sequenceId") REFERENCES "Sequence"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WordSequence" ADD CONSTRAINT "WordSequence_puzzleId_fkey" FOREIGN KEY ("puzzleId") REFERENCES "Puzzle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PuzzleStats" ADD CONSTRAINT "PuzzleStats_puzzleId_fkey" FOREIGN KEY ("puzzleId") REFERENCES "Puzzle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Score" ADD CONSTRAINT "Score_sequenceId_fkey" FOREIGN KEY ("sequenceId") REFERENCES "Sequence"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_WordSequences" ADD CONSTRAINT "_WordSequences_A_fkey" FOREIGN KEY ("A") REFERENCES "Sequence"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_WordSequences" ADD CONSTRAINT "_WordSequences_B_fkey" FOREIGN KEY ("B") REFERENCES "Word"("id") ON DELETE CASCADE ON UPDATE CASCADE;
