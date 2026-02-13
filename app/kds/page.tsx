'use client';

import { useState, useEffect } from 'react';
import { RefreshCw, CheckCircle, Clock, ChefHat } from 'lucide-react';

export default function KDSPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchOrders = () => {
        setLoading(true);
        fetch('/api/kds/orders')
            .then(res => res.json())
            .then(data => {
                setOrders(data);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchOrders();
        const interval = setInterval(fetchOrders, 10000); // Poll every 10s
        return () => clearInterval(interval);
    }, []);

    const updateStatus = async (ids: string[], status: string) => {
        await fetch('/api/kds/update', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderIds: ids, status })
        });
        fetchOrders();
    };

    // Group by Status
    const sent = orders.filter(o => o.status === 'SENT');
    const preparing = orders.filter(o => o.status === 'PREPARING');
    const ready = orders.filter(o => o.status === 'READY');

    return (
        <div className="min-h-screen bg-gray-900 text-white p-6">
            <header className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold flex items-center gap-3">
                    <ChefHat /> Kitchen Display
                </h1>
                <button onClick={fetchOrders} className="p-2 bg-gray-800 rounded-full hover:bg-gray-700">
                    <RefreshCw className={loading ? "animate-spin" : ""} />
                </button>
            </header>

            <div className="grid grid-cols-3 gap-6 h-[80vh]">
                {/* NEW ORDERS */}
                <div className="bg-gray-800 rounded-2xl p-4 flex flex-col">
                    <h2 className="text-xl font-bold mb-4 border-b border-gray-700 pb-2 text-red-400">Nuevas ({sent.length})</h2>
                    <div className="flex-1 overflow-y-auto space-y-3">
                        {sent.map(order => (
                            <div key={order.id} className="bg-gray-700 p-4 rounded-xl border-l-4 border-red-500 animate-pulse-slow">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="font-bold text-lg">{order.session?.table?.name || 'Mesa ?'}</span>
                                    <span className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleTimeString()}</span>
                                </div>
                                <div className="text-xl font-bold mb-1">
                                    {order.quantity}x {order.product.name}
                                </div>
                                <div className="text-sm text-gray-300 mb-2">Usuario: {order.user.name}</div>
                                {order.notes && <div className="text-yellow-300 text-sm bg-gray-900 p-2 rounded mb-2">📝 {order.notes}</div>}

                                <button
                                    onClick={() => updateStatus([order.id], 'PREPARING')}
                                    className="w-full bg-red-600 hover:bg-red-700 py-2 rounded-lg font-bold mt-2"
                                >
                                    Empezar
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* PREPARING */}
                <div className="bg-gray-800 rounded-2xl p-4 flex flex-col">
                    <h2 className="text-xl font-bold mb-4 border-b border-gray-700 pb-2 text-yellow-400">Preparando ({preparing.length})</h2>
                    <div className="flex-1 overflow-y-auto space-y-3">
                        {preparing.map(order => (
                            <div key={order.id} className="bg-gray-700 p-4 rounded-xl border-l-4 border-yellow-500">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="font-bold text-lg">{order.session?.table?.name}</span>
                                    <span className="text-xs text-gray-400"><Clock size={12} className="inline" /> {new Date(order.createdAt).toLocaleTimeString()}</span>
                                </div>
                                <div className="text-xl font-bold mb-1">
                                    {order.quantity}x {order.product.name}
                                </div>
                                <button
                                    onClick={() => updateStatus([order.id], 'READY')}
                                    className="w-full bg-yellow-600 hover:bg-yellow-700 py-2 rounded-lg font-bold mt-2 text-black"
                                >
                                    Marcar Listo
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* READY */}
                <div className="bg-gray-800 rounded-2xl p-4 flex flex-col">
                    <h2 className="text-xl font-bold mb-4 border-b border-gray-700 pb-2 text-green-400">Listo para Entrega ({ready.length})</h2>
                    <div className="flex-1 overflow-y-auto space-y-3">
                        {ready.map(order => (
                            <div key={order.id} className="bg-gray-700 p-4 rounded-xl border-l-4 border-green-500 opacity-90">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="font-bold text-lg">{order.session?.table?.name}</span>
                                    <span className="text-xs text-gray-400">User: {order.user.name}</span>
                                </div>
                                <div className="text-xl font-bold mb-1">
                                    {order.quantity}x {order.product.name}
                                </div>
                                <button
                                    onClick={() => updateStatus([order.id], 'DELIVERED')}
                                    className="w-full bg-green-600 hover:bg-green-700 py-2 rounded-lg font-bold mt-2"
                                >
                                    Entregado
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
