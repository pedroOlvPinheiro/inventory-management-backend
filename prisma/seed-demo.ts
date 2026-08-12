import 'dotenv/config';
import { randomUUID } from 'crypto';
import { PrismaClient } from '@prisma/client';

// Movimentações de teste pra apresentação: entradas, saídas (avulsas e em
// kit personalizado) e retornos espalhados em dias diferentes, pra que
// gráficos/linha do tempo e o alerta de estoque baixo apareçam com dados
// reais no lugar de uma base zerada. NÃO faz parte do seed automático do
// `prisma migrate reset` (que continua rodando só prisma/seed.ts) — rode
// manualmente com `npm run seed:demo` sempre que quiser popular de novo.
//
// Resolve materiais/ocasiões/pessoas pelo NOME (não por id fixo): os ids são
// gerados aleatoriamente (@default(uuid())) a cada `prisma/seed.ts`, então
// mudam de máquina pra máquina. Rodar isso pressupõe que prisma/seed.ts já
// rodou antes (materiais, ocasiões e pessoas precisam existir).

const prisma = new PrismaClient();

const MATERIAL_NAMES = {
  bottons: 'Bottons',
  adesivosCelular: 'Adesivos de Celular',
  cartazes: 'Cartazes',
  adesivosCasa: 'Adesivos de Casa (Retangular)',
  cartoes: 'Cartões',
} as const;

const OCCASION_NAMES = {
  panfletagem: 'Panfletagem',
  passeatas: 'Passeatas',
  adesivaco: 'Adesivaço',
} as const;

const PERSON_NAMES = {
  ana: 'Ana Paula Souza',
  carlos: 'Carlos Eduardo Lima',
  beatriz: 'Beatriz Fernandes',
} as const;

function at(day: number, hour = 10) {
  return new Date(2026, 7, day, hour, 0, 0); // agosto (mês 7, 0-indexado)
}

interface EntrySeed {
  materialId: string;
  quantity: number;
  createdAt: Date;
}

interface WithdrawalSeed {
  materialId: string;
  quantity: number;
  personId: string;
  occasionId: string;
  createdAt: Date;
  withdrawalGroupId?: string;
}

interface ReturnSeed {
  materialId: string;
  quantity: number;
  occasionId: string;
  createdAt: Date;
}

async function resolveIds<T extends Record<string, string>>(
  names: T,
  finder: (name: string) => Promise<{ id: string } | null>,
  label: string,
): Promise<{ [K in keyof T]: string }> {
  const result = {} as { [K in keyof T]: string };

  for (const key of Object.keys(names) as (keyof T)[]) {
    const name = names[key];
    const record = await finder(name);

    if (!record) {
      throw new Error(
        `${label} "${name}" não encontrado(a) — rode "npx prisma db seed" (ou migrate reset) antes de rodar o seed de demonstração.`,
      );
    }

    result[key] = record.id;
  }

  return result;
}

async function main() {
  const MATERIAL = await resolveIds(
    MATERIAL_NAMES,
    (name) => prisma.material.findUnique({ where: { name }, select: { id: true } }),
    'Material',
  );
  const OCCASION = await resolveIds(
    OCCASION_NAMES,
    (name) => prisma.occasion.findUnique({ where: { name }, select: { id: true } }),
    'Ocasião',
  );
  const PERSON = await resolveIds(
    PERSON_NAMES,
    (name) => prisma.person.findUnique({ where: { name }, select: { id: true } }),
    'Pessoa',
  );

  const entries: EntrySeed[] = [
    { materialId: MATERIAL.bottons, quantity: 3000, createdAt: at(2) },
    { materialId: MATERIAL.adesivosCelular, quantity: 1000, createdAt: at(2) },
    { materialId: MATERIAL.cartazes, quantity: 500, createdAt: at(3) },
    { materialId: MATERIAL.adesivosCasa, quantity: 200, createdAt: at(3) },
    { materialId: MATERIAL.cartoes, quantity: 2000, createdAt: at(2) },
  ];

  const withdrawals: WithdrawalSeed[] = [
    { materialId: MATERIAL.bottons, quantity: 4000, personId: PERSON.ana, occasionId: OCCASION.panfletagem, createdAt: at(4) },
    { materialId: MATERIAL.bottons, quantity: 3500, personId: PERSON.carlos, occasionId: OCCASION.passeatas, createdAt: at(7) },
    { materialId: MATERIAL.bottons, quantity: 5000, personId: PERSON.beatriz, occasionId: OCCASION.adesivaco, createdAt: at(10) },

    { materialId: MATERIAL.adesivosCelular, quantity: 1200, personId: PERSON.ana, occasionId: OCCASION.panfletagem, createdAt: at(5) },
    { materialId: MATERIAL.adesivosCelular, quantity: 900, personId: PERSON.carlos, occasionId: OCCASION.passeatas, createdAt: at(9) },

    { materialId: MATERIAL.cartazes, quantity: 800, personId: PERSON.beatriz, occasionId: OCCASION.adesivaco, createdAt: at(6) },
    { materialId: MATERIAL.cartazes, quantity: 700, personId: PERSON.ana, occasionId: OCCASION.panfletagem, createdAt: at(11) },

    // Adesivos de Casa (Retangular): consumo proposital mais agressivo, pra
    // passar dos 50% e mostrar o alerta de estoque baixo funcionando de verdade.
    { materialId: MATERIAL.adesivosCasa, quantity: 400, personId: PERSON.ana, occasionId: OCCASION.panfletagem, createdAt: at(4) },
    { materialId: MATERIAL.adesivosCasa, quantity: 500, personId: PERSON.carlos, occasionId: OCCASION.passeatas, createdAt: at(6) },
    { materialId: MATERIAL.adesivosCasa, quantity: 350, personId: PERSON.beatriz, occasionId: OCCASION.adesivaco, createdAt: at(8) },
    { materialId: MATERIAL.adesivosCasa, quantity: 600, personId: PERSON.ana, occasionId: OCCASION.panfletagem, createdAt: at(9) },
    { materialId: MATERIAL.adesivosCasa, quantity: 450, personId: PERSON.carlos, occasionId: OCCASION.passeatas, createdAt: at(10) },
    { materialId: MATERIAL.adesivosCasa, quantity: 500, personId: PERSON.beatriz, occasionId: OCCASION.adesivaco, createdAt: at(11) },
    { materialId: MATERIAL.adesivosCasa, quantity: 300, personId: PERSON.ana, occasionId: OCCASION.panfletagem, createdAt: at(12) },
  ];

  const returns: ReturnSeed[] = [
    { materialId: MATERIAL.bottons, quantity: 500, occasionId: OCCASION.panfletagem, createdAt: at(5, 16) },
    { materialId: MATERIAL.cartazes, quantity: 200, occasionId: OCCASION.adesivaco, createdAt: at(7, 16) },
    { materialId: MATERIAL.adesivosCasa, quantity: 400, occasionId: OCCASION.passeatas, createdAt: at(7, 16) },
  ];

  // Kit personalizado: 3 materiais retirados juntos, mesma pessoa/ocasião,
  // pra demonstrar o agrupamento no histórico de Saídas.
  const batchGroupId = randomUUID();

  const batchWithdrawals: WithdrawalSeed[] = [
    { materialId: MATERIAL.cartoes, quantity: 3000, personId: PERSON.beatriz, occasionId: OCCASION.adesivaco, createdAt: at(12, 14), withdrawalGroupId: batchGroupId },
    { materialId: MATERIAL.bottons, quantity: 1500, personId: PERSON.beatriz, occasionId: OCCASION.adesivaco, createdAt: at(12, 14), withdrawalGroupId: batchGroupId },
    { materialId: MATERIAL.adesivosCelular, quantity: 600, personId: PERSON.beatriz, occasionId: OCCASION.adesivaco, createdAt: at(12, 14), withdrawalGroupId: batchGroupId },
  ];

  const allWithdrawals = [...withdrawals, ...batchWithdrawals];

  const netByMaterial = new Map<string, number>();
  const applyDelta = (materialId: string, delta: number) => {
    netByMaterial.set(materialId, (netByMaterial.get(materialId) ?? 0) + delta);
  };

  for (const entry of entries) applyDelta(entry.materialId, entry.quantity);
  for (const withdrawal of allWithdrawals) applyDelta(withdrawal.materialId, -withdrawal.quantity);
  for (const stockReturn of returns) applyDelta(stockReturn.materialId, stockReturn.quantity);

  await prisma.$transaction([
    ...entries.map((entry) => prisma.stockEntry.create({ data: entry })),
    ...allWithdrawals.map((withdrawal) => prisma.withdrawal.create({ data: withdrawal })),
    ...returns.map((stockReturn) => prisma.return.create({ data: stockReturn })),
    ...Array.from(netByMaterial.entries()).map(([materialId, delta]) =>
      prisma.material.update({
        where: { id: materialId },
        data: { currentQuantity: { increment: delta } },
      }),
    ),
  ]);

  console.log(
    `OK: ${entries.length} entradas, ${allWithdrawals.length} saídas (incl. 1 kit personalizado com ${batchWithdrawals.length} itens), ${returns.length} retornos criados.`,
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
