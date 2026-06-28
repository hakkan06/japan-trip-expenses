import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import * as dotenv from 'dotenv'

dotenv.config()

const connectionString = process.env.DATABASE_URL!
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })
async function main() {
  const users = ['Hakan', 'Ayşe', 'Mehmet'];
  for (const name of users) {
    await prisma.user.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  const categories = [
    { name: 'Ulaşım', color: '#3b82f6', icon: '✈️' },
    { name: 'Yemek', color: '#f59e0b', icon: '🍱' },
    { name: 'Alışveriş', color: '#10b981', icon: '🛍️' },
    { name: 'Konaklama', color: '#8b5cf6', icon: '🏨' },
    { name: 'Eğlence', color: '#ec4899', icon: '🎢' },
    { name: 'Hediye', color: '#f43f5e', icon: '🎁' },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { name: cat.name },
      update: {},
      create: cat,
    });
  }
}
main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
