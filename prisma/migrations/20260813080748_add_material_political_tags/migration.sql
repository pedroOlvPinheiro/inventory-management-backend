-- CreateEnum
CREATE TYPE "PoliticalTag" AS ENUM ('PAULO_CASE', 'PEDRO_LUCAS', 'ORLEANS_BRANDAO');

-- DropIndex
DROP INDEX "Material_name_key";

-- AlterTable
ALTER TABLE "Material" ADD COLUMN     "tags" "PoliticalTag"[] NOT NULL;

-- AddCheckConstraint
ALTER TABLE "Material" ADD CONSTRAINT "Material_tags_count_check" CHECK (cardinality("tags") BETWEEN 1 AND 3);
