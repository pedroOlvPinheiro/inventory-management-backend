-- CreateEnum
CREATE TYPE "MaterialType" AS ENUM ('SIMPLE', 'KIT');

-- CreateTable
CREATE TABLE "Material" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "MaterialType" NOT NULL DEFAULT 'SIMPLE',
    "currentQuantity" INTEGER NOT NULL DEFAULT 0,
    "referenceQuantity" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Material_pkey" PRIMARY KEY ("id")
);
