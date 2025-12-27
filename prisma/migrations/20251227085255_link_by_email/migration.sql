/*
  Warnings:

  - You are about to drop the column `userId` on the `Exam` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Timetable` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userEmail]` on the table `Timetable` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userEmail` to the `Exam` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userEmail` to the `Timetable` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Exam" DROP CONSTRAINT "Exam_userId_fkey";

-- DropForeignKey
ALTER TABLE "Timetable" DROP CONSTRAINT "Timetable_userId_fkey";

-- DropIndex
DROP INDEX "Timetable_userId_key";

-- AlterTable
ALTER TABLE "Exam" DROP COLUMN "userId",
ADD COLUMN     "userEmail" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Timetable" DROP COLUMN "userId",
ADD COLUMN     "userEmail" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Timetable_userEmail_key" ON "Timetable"("userEmail");

-- AddForeignKey
ALTER TABLE "Timetable" ADD CONSTRAINT "Timetable_userEmail_fkey" FOREIGN KEY ("userEmail") REFERENCES "User"("email") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exam" ADD CONSTRAINT "Exam_userEmail_fkey" FOREIGN KEY ("userEmail") REFERENCES "User"("email") ON DELETE RESTRICT ON UPDATE CASCADE;
