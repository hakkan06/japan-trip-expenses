import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    let categories = await prisma.category.findMany({
      orderBy: { name: 'asc' }
    });

    if (categories.length === 0) {
      // Auto-seed categories
      await prisma.category.createMany({
        data: [
          { name: 'Ulaşım', color: '#3b82f6', icon: '🚆' },
          { name: 'Yemek', color: '#ef4444', icon: '🍱' },
          { name: 'Konaklama', color: '#8b5cf6', icon: '🏨' },
          { name: 'Alışveriş', color: '#f59e0b', icon: '🛍️' },
          { name: 'Eğlence', color: '#10b981', icon: '🎡' },
          { name: 'Market', color: '#6366f1', icon: '🏪' },
          { name: 'Diğer', color: '#6b7280', icon: '📝' }
        ]
      });
      categories = await prisma.category.findMany({
        orderBy: { name: 'asc' }
      });
    }

    return NextResponse.json(categories);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}
