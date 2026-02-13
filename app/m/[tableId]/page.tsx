'use client';

import { useState, useEffect, use } from 'react';
import { Send, ShoppingBag, X, Plus, Minus, ChevronRight } from 'lucide-react';
import { useCartStore } from '@/lib/store/cart';

// Types
interface Product {
    id: string;
    name: string;
    price: number;
    category: string;
    description: string;
    imageUrl?: string;
}

export default function CustomerPage({ params }: { params: Promise<{ tableId: string }> }) {
    const { tableId } = use(params);

    // -- State --
    const [step, setStep] = useState<'ONBOARDING' | 'MENU'>('ONBOARDING');
    // Chat
    const [messages, setMessages] = useState<Array<{ role: 'bot' | 'user', text: string }>>([
        { role: 'bot', text: '¡Hola! Bienvenido. 👋' },
        { role: 'bot', text: 'Para comenzar, ¿cuál es tu nombre?' }
    ]);
    const [input, setInput] = useState('');
    const [userData, setUserData] = useState({ name: '', phone: '', email: '' });
    const [currentField, setCurrentField] = useState<'name' | 'phone' | 'email' | 'done'>('name');

    // Menu
    const [products, setProducts] = useState<Product[]>([]);
    const [activeCategory, setActiveCategory] = useState('Todos');
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [orderStatus, setOrderStatus] = useState('');

    // Store
    const cart = useCartStore();

    // Categories derived from products
    const categories = ['Todos', ...Array.from(new Set(products.map(p => p.category)))];
    const filteredProducts = activeCategory === 'Todos'
        ? products
        : products.filter(p => p.category === activeCategory);

    // -- Effects --

    // 1. Restore Session
    useEffect(() => {
        const saved = localStorage.getItem(`comanda_session_${tableId}`);
        if (saved) {
            setStep('MENU');
            const parsed = JSON.parse(saved);
            setUserData(prev => ({ ...prev, name: parsed.user.name })); // Basic restore
        }
    }, [tableId]);

    // 2. Fetch Menu when in MENU step
    useEffect(() => {
        if (step === 'MENU') {
            fetch('/api/products')
                .then(res => res.json())
                .then(data => setProducts(data));
        }
    }, [step]);


    // -- Handlers --

    const handleSend = async () => {
        if (!input.trim()) return;
        const val = input.trim();
        setMessages(prev => [...prev, { role: 'user', text: val }]);
        setInput('');

        if (currentField === 'name') {
            setUserData(p => ({ ...p, name: val }));
            setCurrentField('phone');
            setTimeout(() => setMessages(p => [...p, { role: 'bot', text: `Mucho gusto, ${val}. ¿Tu teléfono?` }]), 600);
        } else if (currentField === 'phone') {
            setUserData(p => ({ ...p, phone: val }));
            setCurrentField('email');
            setTimeout(() => setMessages(p => [...p, { role: 'bot', text: '¿Tienes email? (O escribe "no")' }]), 600);
        } else if (currentField === 'email') {
            const email = val.toLowerCase().includes('no') ? '' : val;
            setMessages(p => [...p, { role: 'bot', text: 'Creando sesión...' }]);

            // API Join
            try {
                const res = await fetch('/api/session/join', {
                    method: 'POST',
                    body: JSON.stringify({ tableId, name: userData.name, phone: userData.phone, email }),
                    headers: { 'Content-Type': 'application/json' }
                });
                if (res.ok) {
                    const data = await res.json();
                    localStorage.setItem(`comanda_session_${tableId}`, JSON.stringify(data.data));
                    setTimeout(() => setStep('MENU'), 1000);
                } else {
                    setMessages(p => [...p, { role: 'bot', text: 'Error al iniciar. Intenta recargar.' }]);
                }
            } catch (e) { console.error(e); }
        }
    };

    const submitOrder = async () => {
        const saved = localStorage.getItem(`comanda_session_${tableId}`);
        if (!saved) return;
        const sessionData = JSON.parse(saved);

        try {
            const res = await fetch('/api/order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sessionId: sessionData.session.id,
                    userId: sessionData.user.id,
                    items: cart.items
                })
            });

            if (res.ok) {
                cart.clearCart();
                setIsCartOpen(false);
                setOrderStatus('¡Orden enviada a cocina! 👨‍🍳');
                setTimeout(() => setOrderStatus(''), 5000);
            }
        } catch (e) {
            alert('Error enviando orden');
        }
    };

    // -- Renders --

    if (step === 'ONBOARDING') {
        return (
            <div className="flex flex-col h-screen bg-gray-100 max-w-md mx-auto shadow-2xl overflow-hidden">
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((m, i) => (
                        <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`px-4 py-2 rounded-2xl max-w-[85%] ${m.role === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white text-gray-800 shadow rounded-bl-none'
                                }`}>
                                {m.text}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="p-4 bg-white border-t flex gap-2">
                    <input
                        className="flex-1 bg-gray-100 rounded-full px-4 py-3 focus:outline-none"
                        placeholder="Escribe aquí..."
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSend()}
                    />
                    <button onClick={handleSend} className="bg-blue-600 text-white p-3 rounded-full"> <Send size={20} /> </button>
                </div>
            </div>
        );
    }

    // MENU RENDER
    return (
        <div className="min-h-screen bg-gray-50 pb-24 max-w-md mx-auto shadow-2xl relative">
            <header className="bg-white p-4 shadow-sm sticky top-0 z-10 flex justify-between items-center">
                <div>
                    <h1 className="font-bold text-lg text-gray-800">Mesa {tableId.substring(0, 4)}</h1>
                    <p className="text-xs text-green-600">● Sesión Activa</p>
                </div>
                <button onClick={() => setIsCartOpen(true)} className="relative p-2">
                    <ShoppingBag className="text-gray-700" />
                    {cart.items.length > 0 && (
                        <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                            {cart.items.reduce((a, b) => a + b.quantity, 0)}
                        </span>
                    )}
                </button>
            </header>

            {/* Categories */}
            <div className="flex gap-2 p-4 overflow-x-auto no-scrollbar">
                {categories.map(c => (
                    <button
                        key={c}
                        onClick={() => setActiveCategory(c)}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${activeCategory === c ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 border border-gray-200'
                            }`}
                    >
                        {c}
                    </button>
                ))}
            </div>

            {/* Product Grid */}
            <div className="px-4 space-y-4">
                {orderStatus && (
                    <div className="bg-green-100 text-green-800 p-3 rounded-lg text-center mb-4 text-sm font-medium animate-pulse">
                        {orderStatus}
                    </div>
                )}

                {filteredProducts.map(product => (
                    <div key={product.id} className="bg-white p-3 rounded-xl shadow-sm flex gap-4">
                        <div className="w-20 h-20 bg-gray-200 rounded-lg flex-shrink-0" />
                        <div className="flex-1 flex flex-col justify-between">
                            <div>
                                <h3 className="font-semibold text-gray-800">{product.name}</h3>
                                <p className="text-xs text-gray-500 line-clamp-2">{product.description}</p>
                            </div>
                            <div className="flex justify-between items-center mt-2">
                                <span className="font-bold text-gray-900">${product.price}</span>
                                <button
                                    onClick={() => cart.addItem({ productId: product.id, name: product.name, price: product.price, quantity: 1 })}
                                    className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold hover:bg-blue-100"
                                >
                                    + Agregar
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Cart Modal / Sheet */}
            {isCartOpen && (
                <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-t-3xl p-6 min-h-[50vh] max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold">Mi Comanda</h2>
                            <button onClick={() => setIsCartOpen(false)}> <X className="text-gray-400" /> </button>
                        </div>

                        {cart.items.length === 0 ? (
                            <div className="text-center text-gray-400 py-10">Tu comanda está vacía 🍽️</div>
                        ) : (
                            <div className="space-y-4">
                                {cart.items.map(item => (
                                    <div key={item.productId} className="flex justify-between items-center border-b pb-4">
                                        <div>
                                            <p className="font-medium text-gray-800">{item.name}</p>
                                            <p className="text-sm text-gray-500">${item.price * item.quantity}</p>
                                        </div>
                                        <div className="flex items-center gap-3 bg-gray-100 rounded-full px-2 py-1">
                                            <button onClick={() => cart.updateItemQuantity(item.productId, item.quantity - 1)} className="p-1"><Minus size={14} /></button>
                                            <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                                            <button onClick={() => cart.addItem({ ...item, quantity: 1 })} className="p-1"><Plus size={14} /></button>
                                        </div>
                                    </div>
                                ))}

                                <div className="pt-4">
                                    <div className="flex justify-between text-lg font-bold mb-4">
                                        <span>Total</span>
                                        <span>${cart.total()}</span>
                                    </div>
                                    <button
                                        onClick={submitOrder}
                                        className="w-full bg-black text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-gray-800 active:scale-[0.98] transition-all"
                                    >
                                        Enviar a Cocina
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
