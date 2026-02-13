import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const tableId = '8';
    console.log('Finding or Creating Table');
    let table = await prisma.table.findUnique({ where: { id: tableId } });
    if (!table) {
        console.log('Creating table...');
        table = await prisma.table.create({
            data: { id: tableId, name: `Table ${tableId}`, qrHash: `hash-${tableId}` }
        });
    }
    console.log('Table found/created:', table);

    console.log('Creating Session');
    // Replicating getOrCreateSession logic from lib/session.ts
    let session = await prisma.session.findFirst({
        where: {
            tableId,
            status: 'ACTIVE',
        },
    });

    if (!session) {
        session = await prisma.session.create({
            data: {
                tableId: table.id
            }
        });
    }
    console.log('Session Created/Found:', session);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
