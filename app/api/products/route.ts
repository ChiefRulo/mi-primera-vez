import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { seedProducts } from '@/lib/seed';

export async function GET() {
    await seedProducts(); // Ensure data exists for MVP
    const products = await prisma.product.findMany({
        where: { active: true }
    });
    return NextResponse.json(products);
}
