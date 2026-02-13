import { NextResponse } from 'next/server';
import { getOrCreateSession, createUserInSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { tableId, name, phone, email } = body;

        // Validate inputs
        if (!tableId || !name || !phone) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // 1. Ensure Table Exists (For safety, we find active session or create it)
        // In a real app, we should check if Table ID is valid in DB first.
        // For MVP, we assume Table ID valid or auto-create Table row if strict constraint needed.
        // Let's assume Table needs to exist.
        let table = await prisma.table.findUnique({ where: { id: tableId } });
        if (!table) {
            // Auto-create table for MVP ease if it doesn't exist by ID? 
            // Or usually Table ID comes from a seed.
            // Let's check session logic.
            // For this MVP, let's create the Table if not found to unblock.
            table = await prisma.table.create({
                data: { id: tableId, name: `Table ${tableId.substring(0, 4)}`, qrHash: `hash-${tableId}` }
            })
        }

        // 2. Get/Create Session
        const session = await getOrCreateSession(table.id);

        // 3. Create/Link User
        const user = await createUserInSession(session.id, name, phone, email);

        return NextResponse.json({
            success: true,
            data: {
                session,
                user
            }
        });

    } catch (error) {
        console.error('Join Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
