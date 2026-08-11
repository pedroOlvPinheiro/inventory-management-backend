/*
  Warnings:

  - You are about to drop the column `responsibleName` on the `Withdrawal` table. All the data in the column will be lost.
  - Added the required column `personId` to the `Withdrawal` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Withdrawal" DROP COLUMN "responsibleName",
ADD COLUMN     "personId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "PoliticalReference" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "PoliticalReference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Person" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contact" TEXT,
    "politicalReferenceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Person_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PoliticalReference_name_key" ON "PoliticalReference"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Person_name_key" ON "Person"("name");

-- AddForeignKey
ALTER TABLE "Withdrawal" ADD CONSTRAINT "Withdrawal_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Person" ADD CONSTRAINT "Person_politicalReferenceId_fkey" FOREIGN KEY ("politicalReferenceId") REFERENCES "PoliticalReference"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
