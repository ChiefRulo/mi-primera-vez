'use client';

import { useState, useEffect } from 'react';
import { Users, DollarSign, CheckCircle } from 'lucide-react';

export default function AdminPage() {
    const [sessions, setSessions] = useState<any[]>([]);

    const fetchSessions = () => {
        fetch('/api/admin/sessions')
            .then(res => res.json())
            .then(setSessions);
    };

    useEffect(() => {
        fetchSessions();
        const interval = setInterval(fetchSessions, 10000);
        return () => clearInterval(interval);
    }, []);

    const confirmPayment = async (userId: string, total: number) => {
        const tip = total * 0.1; // Default 10% assumption for quick confirm MVP
        if (!confirm(`Cobrar $${(total + tip).toFixed(2)} (inc. 10% propina)?`)) return;

        await fetch('/api/admin/payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, total, tip, method: 'CASH' })
        });
        fetchSessions();
    };

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Panel de Meseros - Tablas Activas</h1>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sessions.map(session => (
                    <div key={session.id} className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
                        <div className="bg-gray-800 text-white p-4 flex justify-between items-center">
                            <h2 className="text-xl font-bold">{session.table?.name}</h2>
                            <span className="text-sm bg-green-500 px-2 py-0.5 rounded text-black font-bold">ACTIVA</span>
                        </div>

                        <div className="p-4 space-y-4">
                            {session.users.map((user: any) => {
                                const orderTotal = user.orders.reduce((sum: number, o: any) => sum + (o.product.price * o.quantity), 0);
                                const paid = user.payments.length > 0;

                                return (
                                    <div key={user.id} className={`p-3 rounded-lg border ${paid ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="font-bold text-gray-700 flex items-center gap-2">
                                                <Users size={16} /> {user.name}
                                            </span>
                                            <span className="font-mono font-bold">${orderTotal.toFixed(2)}</span>
                                        </div>

                                        {/* Items Summary */}
                                        <div className="text-xs text-gray-500 mb-3 ml-6">
                                            {user.orders.map((o: any) => (
                                                <div key={o.id}>{o.quantity}x {o.product.name} ({o.status})</div>
                                            ))}
                                        </div>

                                        {!paid && orderTotal > 0 && (
                                            <button
                                                onClick={() => confirmPayment(user.id, orderTotal)}
                                                className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 rounded flex justify-center items-center gap-2"
                                            >
                                                <DollarSign size={14} /> Cobrar Cuenta
                                            </button>
                                        )}
                                        {paid && (
                                            <div className="text-center text-green-600 font-bold text-sm flex justify-center items-center gap-2">
                                                <CheckCircle size={14} /> Pagado
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}

                {sessions.length === 0 && (
                    <div className="col-span-full text-center text-gray-400 py-20">
                        No hay mesas activas por el momento.
                    </div>
                )}
            </div>
        </div>
    );
}
