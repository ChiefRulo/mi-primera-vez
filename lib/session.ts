import { prisma } from "@/lib/prisma";

export async function getOrCreateSession(tableId: string) {
    // Find active session for table
    let session = await prisma.session.findFirst({
        where: {
            tableId,
            status: 'ACTIVE',
        },
    });

    // If no active session, create one
    if (!session) {
        session = await prisma.session.create({
            data: {
                tableId,
            },
        });
    }

    return session;
}

export async function createUserInSession(sessionId: string, name: string, phone: string, email?: string) {
    // Check if user already exists in this session by phone
    const existingUser = await prisma.user.findFirst({
        where: {
            sessionId,
            phone,
        },
    });

    if (existingUser) {
        return existingUser;
    }

    return await prisma.user.create({
        data: {
            sessionId,
            name,
            phone,
            email,
        },
    });
}
