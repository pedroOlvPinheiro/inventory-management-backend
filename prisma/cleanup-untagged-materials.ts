import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

// Script de uso único: roda DEPOIS de aplicar a migration que adiciona a
// coluna obrigatória `tags` em Material, e ANTES de recadastrar os materiais
// reais (com etiqueta e data de entrada) pela própria interface.
//
// Apaga só o que é referente a Material (materiais + entradas/saídas/
// retornos/kits ligados a eles) — não mexe em Ocasião, Pessoa ou Referência
// Política. Se algum material já tiver etiqueta, o script aborta: isso
// indica que já foi recadastrado e rodar de novo apagaria dados reais.
//
// Uso: npm run cleanup:materials

const prisma = new PrismaClient();

async function main() {
  const materials = await prisma.material.findMany({
    select: { id: true, name: true, tags: true },
  });

  if (materials.length === 0) {
    console.log('Nenhum material encontrado. Nada a fazer.');
    return;
  }

  const alreadyTagged = materials.filter((material) => material.tags.length > 0);

  if (alreadyTagged.length > 0) {
    throw new Error(
      `Abortando: ${alreadyTagged.length} material(is) já têm etiqueta (ex: "${alreadyTagged[0].name}"). ` +
        'Esse script é só pra limpar materiais antigos sem etiqueta — rodar de novo apagaria dados reais já recadastrados.',
    );
  }

  const [kitComponents, kitAssemblies, withdrawals, returns, entries, deletedMaterials] =
    await prisma.$transaction([
      prisma.kitComponent.deleteMany({}),
      prisma.kitAssembly.deleteMany({}),
      prisma.withdrawal.deleteMany({}),
      prisma.return.deleteMany({}),
      prisma.stockEntry.deleteMany({}),
      prisma.material.deleteMany({}),
    ]);

  console.log(
    `OK: ${deletedMaterials.count} materiais sem etiqueta removidos (junto com ${kitComponents.count} componentes de kit, ` +
      `${kitAssemblies.count} montagens, ${withdrawals.count} saídas, ${returns.count} retornos, ${entries.count} entradas). ` +
      'Pode recadastrar os materiais reais pela interface agora.',
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
