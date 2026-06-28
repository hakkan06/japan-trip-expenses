import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // Rename existing ones if they exist (migration from old seed)
    await prisma.user.updateMany({ where: { name: 'Ayşe' }, data: { name: 'Şükran' } });
    await prisma.user.updateMany({ where: { name: 'Mehmet' }, data: { name: 'Can' } });

    let users = await prisma.user.findMany({
      orderBy: { name: 'asc' }
    });

    if (users.length === 0) {
      // Auto-seed users
      await prisma.user.createMany({
        data: [
          { name: 'Ortak' },
          { name: 'Hakan' },
          { name: 'Şükran' },
          { name: 'Can' }
        ]
      });
      users = await prisma.user.findMany({
        orderBy: { name: 'asc' }
      });
    }

    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}
