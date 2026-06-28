import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    let users = await prisma.user.findMany({
      orderBy: { name: 'asc' }
    });

    if (users.length === 0) {
      // Auto-seed users
      await prisma.user.createMany({
        data: [
          { name: 'Ortak' },
          { name: 'Hakan' },
          { name: 'Ayşe' },
          { name: 'Mehmet' }
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
