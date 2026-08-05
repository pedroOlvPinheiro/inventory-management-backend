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

  const materialNames = ['Santinhos', 'Bottons', 'Panfletos'];

  for (const name of materialNames) {
    await prisma.material.upsert({
      where: { name },
      update: {},
      create: { name, type: MaterialType.SIMPLE },
    });
  }

  console.log('Seed concluído: 4 ocasiões e 3 materiais.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
