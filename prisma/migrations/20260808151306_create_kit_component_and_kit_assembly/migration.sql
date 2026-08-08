-- CreateTable
CREATE TABLE "KitComponent" (
    "id" TEXT NOT NULL,
    "kitId" TEXT NOT NULL,
    "componentId" TEXT NOT NULL,
    "quantityPerKit" INTEGER NOT NULL,

    CONSTRAINT "KitComponent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KitAssembly" (
    "id" TEXT NOT NULL,
    "kitId" TEXT NOT NULL,
    "quantityAssembled" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "KitAssembly_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "KitComponent" ADD CONSTRAINT "KitComponent_kitId_fkey" FOREIGN KEY ("kitId") REFERENCES "Material"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KitComponent" ADD CONSTRAINT "KitComponent_componentId_fkey" FOREIGN KEY ("componentId") REFERENCES "Material"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KitAssembly" ADD CONSTRAINT "KitAssembly_kitId_fkey" FOREIGN KEY ("kitId") REFERENCES "Material"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
