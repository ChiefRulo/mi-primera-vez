import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const { userId, total, tip, method } = await request.json();

        // Create Payment Record
        const payment = await prisma.payment.create({
            data: {
                userId,
                amount: total,
                tipAmount: tip,
                method,
                status: 'PAID'
            }
        });

        return NextResponse.json({ success: true, payment });
    } catch (error) {
        return NextResponse.json({ error: 'Server Error' }, { status: 500 });
    }
}
