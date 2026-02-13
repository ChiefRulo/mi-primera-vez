import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    const sessions = await prisma.session.findMany({
        where: { status: 'ACTIVE' },
        include: {
            table: true,
            users: {
                include: {
                    orders: {
                        include: { product: true }
                    },
                    payments: true
                }
            }
        }
    });

    return NextResponse.json(sessions);
}
