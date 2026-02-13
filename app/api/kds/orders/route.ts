import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    const orders = await prisma.orderLine.findMany({
        where: {
            status: { not: 'DELIVERED' } // Only active orders (Sent, Preparing, Ready)
            // Implementation Note: 'DELIVERED' or 'CANCELLED' might be archived or just not shown in active KDS
        },
        include: {
            product: true,
            user: true,
            session: {
                include: { table: true }
            }
        },
        orderBy: {
            createdAt: 'asc'
        }
    });

    return NextResponse.json(orders);
}
