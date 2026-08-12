import 'dotenv/config';
import { randomUUID } from 'crypto';
import { PrismaClient } from '@prisma/client';

// Movimentações de teste pra apresentação: entradas, saídas (avulsas e em
// kit personalizado) e retornos espalhados em dias diferentes, pra que
// gráficos/linha do tempo e o alerta de estoque baixo apareçam com dados
// reais no lugar de uma base zerada. NÃO faz parte do seed automático do
// `prisma migrate reset` (que continua rodando só prisma/seed.ts) — rode
// manualmente com `npm run seed:demo` sempre que quiser popular de novo.

const prisma = new PrismaClient();

const MATERIAL = {
  bottons: '163488d6-abc5-4ca6-b6a2-d2489fe9d522',
  adesivosCelular: '4f65d873-a08b-429e-9984-0e9a594d82cf',
  cartazes: '7302752d-3567-4b20-ae07-3b7a3f1649de',
  adesivosCasa: '22a3093f-679c-431d-8d9d-5353c19c7c20',
  cartoes: 'fd2f8153-8276-48d2-aad8-35474201866b',
};

const OCCASION = {
  panfletagem: '2aaf042d-57c8-4d70-884d-1bffd6f573d8',
  passeatas: '503b16a7-c3a7-4314-98b1-ef82c2f72c29',
  adesivaco: '25ed7b52-77da-4a67-ba8c-344f72c0e9f4',
};

const PERSON = {
  ana: '0a989e15-c6a8-41f6-a479-328d9f2e8a64',
  carlos: '80db2987-997b-44c7-8d30-2baa451421a0',
  beatriz: 'c78d59ca-b60f-4b77-b403-afb15cdc963d',
};

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
const BATCH_GROUP_ID = randomUUID();

const batchWithdrawals: WithdrawalSeed[] = [
  { materialId: MATERIAL.cartoes, quantity: 3000, personId: PERSON.beatriz, occasionId: OCCASION.adesivaco, createdAt: at(12, 14), withdrawalGroupId: BATCH_GROUP_ID },
  { materialId: MATERIAL.bottons, quantity: 1500, personId: PERSON.beatriz, occasionId: OCCASION.adesivaco, createdAt: at(12, 14), withdrawalGroupId: BATCH_GROUP_ID },
  { materialId: MATERIAL.adesivosCelular, quantity: 600, personId: PERSON.beatriz, occasionId: OCCASION.adesivaco, createdAt: at(12, 14), withdrawalGroupId: BATCH_GROUP_ID },
];

async function main() {
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
