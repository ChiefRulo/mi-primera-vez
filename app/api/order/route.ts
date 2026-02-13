import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { sessionId, userId, items } = body;
        // items: { productId, quantity, notes }[]

        if (!sessionId || !userId || !items || items.length === 0) {
            return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
        }

        // Verify session active
        const session = await prisma.session.findUnique({ where: { id: sessionId } });
        if (!session || session.status !== 'ACTIVE') {
            return NextResponse.json({ error: 'Session closed' }, { status: 403 });
        }

        // Create OrderLines
        const createdLines = [];
        for (const item of items) {
            const line = await prisma.orderLine.create({
                data: {
                    sessionId,
                    userId,
                    productId: item.productId,
                    quantity: item.quantity,
                    notes: item.notes,
                    status: 'SENT'
                }
            });
            createdLines.push(line);
        }

        // In a real app, trigger WebSocket/SSE event for KDS here

        return NextResponse.json({ success: true, count: createdLines.length });

    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: 'Server Error' }, { status: 500 });
    }
}
