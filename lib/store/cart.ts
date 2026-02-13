import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    notes?: string;
    modifiers?: string; // stored as JSON string or keeping simple for now
}

interface CartState {
    items: CartItem[];
    addItem: (item: CartItem) => void;
    removeItem: (productId: string) => void;
    updateItemQuantity: (productId: string, quantity: number) => void;
    clearCart: () => void;
    total: () => number;
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],
            addItem: (item) => set((state) => {
                const existing = state.items.find((i) => i.productId === item.productId);
                if (existing) {
                    return {
                        items: state.items.map((i) =>
                            i.productId === item.productId
                                ? { ...i, quantity: i.quantity + item.quantity }
                                : i
                        ),
                    };
                }
                return { items: [...state.items, item] };
            }),
            removeItem: (id) => set((state) => ({ items: state.items.filter((i) => i.productId !== id) })),
            updateItemQuantity: (id, q) => set((state) => ({
                items: state.items.map((i) => (i.productId === id ? { ...i, quantity: q } : i)).filter(i => i.quantity > 0)
            })),
            clearCart: () => set({ items: [] }),
            total: () => get().items.reduce((sum, item) => sum + item.price * item.quantity, 0),
        }),
        {
            name: 'comanda-cart-storage',
        }
    )
);
