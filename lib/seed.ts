import { prisma } from '@/lib/prisma';

export async function seedProducts() {
    const count = await prisma.product.count();
    if (count > 0) return;

    const products = [
        // Bebidas
        { name: 'Coca Cola', category: 'Bebidas', price: 35.0, description: 'Lata 355ml', imageUrl: 'https://via.placeholder.com/150' },
        { name: 'Limonada', category: 'Bebidas', price: 45.0, description: 'Natural o Mineral', imageUrl: 'https://via.placeholder.com/150' },
        { name: 'Cerveza Corona', category: 'Bebidas', price: 55.0, description: 'Botella 355ml', imageUrl: 'https://via.placeholder.com/150' },

        // Entradas
        { name: 'Guacamole', category: 'Entradas', price: 95.0, description: 'Con totopos caseros', imageUrl: 'https://via.placeholder.com/150' },
        { name: 'Queso Fundido', category: 'Entradas', price: 120.0, description: 'Con chorizo o champiñones', imageUrl: 'https://via.placeholder.com/150' },

        // Platos Fuertes
        { name: 'Tacos de Asada', category: 'Platos', price: 150.0, description: 'Orden de 4, con cebolla y cilantro', imageUrl: 'https://via.placeholder.com/150' },
        { name: 'Hamburguesa Clasica', category: 'Platos', price: 180.0, description: 'Con papas a la francesa', imageUrl: 'https://via.placeholder.com/150' },
    ];

    for (const p of products) {
        await prisma.product.create({ data: p });
    }
}
