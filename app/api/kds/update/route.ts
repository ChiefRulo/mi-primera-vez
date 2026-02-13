import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(request: Request) {
    try {
        const { orderIds, status } = await request.json(); // Expecting array of ids

        if (!orderIds || !Array.isArray(orderIds) || !status) {
            return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
        }

        await prisma.orderLine.updateMany({
            where: {
                id: { in: orderIds }
            },
            data: { status }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
