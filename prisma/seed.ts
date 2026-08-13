import { PrismaClient, MaterialType, PoliticalTag } from '@prisma/client';

const prisma = new PrismaClient();

// name deixou de ser @unique em Material (materiais tageados por figura
// política podem repetir nome), então o upsert-por-nome não vale mais aqui.
// Como esse seed só roda contra um banco recém-resetado, cria direto.
const SEED_TAGS: PoliticalTag[] = [
  PoliticalTag.PAULO_CASE,
  PoliticalTag.PEDRO_LUCAS,
  PoliticalTag.ORLEANS_BRANDAO,
];

async function main() {
  // Previsão da primeira semana de campanha: 500 Kit Liderança + 2000 Kit Carro.
  // Receitas fixas (briefing-tecnico-roo-code.md, Bloco 4.4):
  //   Kit Liderança: 200 santinhos, 72 bottons, 10 adesivos de celular, 20 cartazes, 5 adesivos de casa (retangular)
  //   Kit Carro: 100 cartões, 50 bottons, 10 adesivos de celular, 1 adesivo de casa (retangular)
  // Os kits em si não são cadastrados aqui (isso é feito depois, via POST /kits) —
  // só o estoque de materiais simples necessário pra montá-los nessas quantidades.
  const KIT_LIDERANCA_QUANTITY = 500;
  const KIT_CARRO_QUANTITY = 2000;

  const materialQuantities: Record<string, number> = {
    Santinhos: 200 * KIT_LIDERANCA_QUANTITY,
    Bottons: 72 * KIT_LIDERANCA_QUANTITY + 50 * KIT_CARRO_QUANTITY,
    'Adesivos de Celular': 10 * KIT_LIDERANCA_QUANTITY + 10 * KIT_CARRO_QUANTITY,
    Cartazes: 20 * KIT_LIDERANCA_QUANTITY,
    'Adesivos de Casa (Retangular)': 5 * KIT_LIDERANCA_QUANTITY + 1 * KIT_CARRO_QUANTITY,
    Cartões: 100 * KIT_CARRO_QUANTITY,
  };

  let materialIndex = 0;

  for (const [name, quantity] of Object.entries(materialQuantities)) {
    await prisma.material.create({
      data: {
        name,
        type: MaterialType.SIMPLE,
        tags: [SEED_TAGS[materialIndex % SEED_TAGS.length]],
        currentQuantity: quantity,
        referenceQuantity: quantity,
      },
    });
    materialIndex += 1;
  }

  const occasionNames = ['Panfletagem', 'Passeatas', 'Adesivaço'];

  for (const name of occasionNames) {
    await prisma.occasion.upsert({ where: { name }, update: {}, create: { name } });
  }

  const politicalReferenceNames = [
    'Liderança Zona Norte',
    'Liderança Centro',
    'Prefeitura Municipal',
  ];

  for (const name of politicalReferenceNames) {
    await prisma.politicalReference.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  const people = [
    {
      name: 'Ana Paula Souza',
      contact: '(11) 99999-0001',
      politicalReferenceName: 'Liderança Zona Norte',
    },
    {
      name: 'Carlos Eduardo Lima',
      contact: '(11) 99999-0002',
      politicalReferenceName: 'Liderança Centro',
    },
    {
      name: 'Beatriz Fernandes',
      contact: '(11) 99999-0003',
      politicalReferenceName: 'Prefeitura Municipal',
    },
  ];

  for (const personSeed of people) {
    const politicalReference = await prisma.politicalReference.findUniqueOrThrow({
      where: { name: personSeed.politicalReferenceName },
    });

    await prisma.person.upsert({
      where: { name: personSeed.name },
      update: {},
      create: {
        name: personSeed.name,
        contact: personSeed.contact,
        politicalReferenceId: politicalReference.id,
      },
    });
  }

  console.log(
    `Seed concluído: ${Object.keys(materialQuantities).length} materiais simples (estoque calculado para ${KIT_LIDERANCA_QUANTITY} Kit Liderança + ${KIT_CARRO_QUANTITY} Kit Carro), ${occasionNames.length} ocasiões, ${politicalReferenceNames.length} referências políticas e ${people.length} pessoas.`,
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
