import { PrismaClient, MaterialType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const occasionNames = [
    'Confraternizações',
    'Panfletagem',
    'Passeatas',
    'Adesivaço',
  ];

  for (const name of occasionNames) {
    await prisma.occasion.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  const materialNames = [
    'Santinhos',
    'Bottons',
    'Panfletos',
    'Adesivos de Celular',
    'Cartazes',
    'Adesivos de Casa (Retangular)',
    'Cartões',
  ];

  for (const name of materialNames) {
    await prisma.material.upsert({
      where: { name },
      update: {},
      create: { name, type: MaterialType.SIMPLE },
    });
  }

  const kits = [
    {
      name: 'Kit Liderança',
      recipe: [
        { materialName: 'Santinhos', quantityPerKit: 200 },
        { materialName: 'Bottons', quantityPerKit: 72 },
        { materialName: 'Adesivos de Celular', quantityPerKit: 10 },
        { materialName: 'Cartazes', quantityPerKit: 20 },
        { materialName: 'Adesivos de Casa (Retangular)', quantityPerKit: 5 },
      ],
    },
    {
      name: 'Kit Carro',
      recipe: [
        { materialName: 'Cartões', quantityPerKit: 100 },
        { materialName: 'Bottons', quantityPerKit: 50 },
        { materialName: 'Adesivos de Celular', quantityPerKit: 10 },
        { materialName: 'Adesivos de Casa (Retangular)', quantityPerKit: 1 },
      ],
    },
  ];

  for (const kitSeed of kits) {
    const kit = await prisma.material.upsert({
      where: { name: kitSeed.name },
      update: {},
      create: { name: kitSeed.name, type: MaterialType.KIT },
    });

    // idempotente: reconstroi a receita do zero a cada seed, em vez de acumular duplicatas
    await prisma.kitComponent.deleteMany({ where: { kitId: kit.id } });

    for (const item of kitSeed.recipe) {
      const component = await prisma.material.findUniqueOrThrow({
        where: { name: item.materialName },
      });

      await prisma.kitComponent.create({
        data: {
          kitId: kit.id,
          componentId: component.id,
          quantityPerKit: item.quantityPerKit,
        },
      });
    }
  }

  console.log(
    `Seed concluído: ${occasionNames.length} ocasiões, ${materialNames.length} materiais simples e ${kits.length} kits com receita.`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
