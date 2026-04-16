import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const patronPwd = await bcrypt.hash('admin123', 10);
  const receptPwd = await bcrypt.hash('1234', 10);

  const patron = await prisma.user.upsert({
    where: { username: 'patron' },
    update: {},
    create: { username: 'patron', password: patronPwd, nom: 'Le Patron', role: 'PATRON' },
  });

  const aminata = await prisma.user.upsert({
    where: { username: 'aminata' },
    update: {},
    create: { username: 'aminata', password: receptPwd, nom: 'Aminata K.', role: 'RECEPTIONNISTE' },
  });

  const kofi = await prisma.user.upsert({
    where: { username: 'kofi' },
    update: {},
    create: { username: 'kofi', password: receptPwd, nom: 'Kofi A.', role: 'RECEPTIONNISTE' },
  });

  console.log('Utilisateurs créés:', { patron: patron.username, aminata: aminata.username, kofi: kofi.username });

  await prisma.bonCommande.upsert({
    where: { numero: 'BC-2025-0041' },
    update: {},
    create: {
      numero: 'BC-2025-0041',
      fournisseur: 'SARL Fournitures Pro',
      imputation: 'Cartouches HP + ramettes A4',
      statut: 'LIVRE',
      dateTransmission: new Date('2025-04-01'),
      dateReception: new Date('2025-04-04'),
      articlesRecus: 'Cartouches HP x10, Ramettes A4 x20 — conforme',
      lieuReception: 'Magasin principal',
      createdById: patron.id,
      receptionnisteId: aminata.id,
    },
  });

  await prisma.bonCommande.upsert({
    where: { numero: 'BC-2025-0042' },
    update: {},
    create: {
      numero: 'BC-2025-0042',
      fournisseur: 'Tech Solutions SARL',
      imputation: 'Câbles réseau CAT6 lot de 50',
      statut: 'TRANSMIS',
      dateTransmission: new Date('2025-04-03'),
      createdById: patron.id,
    },
  });

  await prisma.bonCommande.upsert({
    where: { numero: 'BC-2025-0043' },
    update: {},
    create: {
      numero: 'BC-2025-0043',
      fournisseur: 'Bureau Center CI',
      imputation: 'Mobilier — 2 fauteuils ergonomiques',
      statut: 'LIVRE',
      dateTransmission: new Date('2025-04-05'),
      dateReception: new Date('2025-04-10'),
      articlesRecus: 'Fauteuil noir x2 — 1 pied manquant signalé',
      lieuReception: 'Bureau direction',
      createdById: patron.id,
      receptionnisteId: kofi.id,
    },
  });

  await prisma.bonCommande.upsert({
    where: { numero: 'BC-2025-0044' },
    update: {},
    create: {
      numero: 'BC-2025-0044',
      fournisseur: "InfoPrint Côte d'Ivoire",
      imputation: 'Imprimante multifonction A3',
      statut: 'TRANSMIS',
      dateTransmission: new Date('2025-04-08'),
      createdById: patron.id,
    },
  });

  console.log('BCs de test créés.');
  console.log('\n✅ Seed terminé !');
  console.log('   → patron / admin123');
  console.log('   → aminata / 1234');
  console.log('   → kofi / 1234');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());