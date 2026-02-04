'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function LoginPage() {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await login(email, password);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Login failed');
        }
    };

    return (
        <div style={{
            display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh',
            background: 'var(--background)'
        }}>
            <div style={{
                background: 'var(--card-bg)', padding: '2rem', borderRadius: '1rem',
                border: '1px solid var(--border)', width: '100%', maxWidth: '400px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
            }}>
                <h1 style={{ marginBottom: '1.5rem', fontSize: '1.75rem', fontWeight: 700, textAlign: 'center' }}>Welcome Back</h1>
                {error && <div style={{ color: 'red', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                        style={{
                            padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border)',
                            background: 'var(--background)', color: 'var(--foreground)'
                        }}
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                        style={{
                            padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border)',
                            background: 'var(--background)', color: 'var(--foreground)'
                        }}
                    />
                    <button type="submit" style={{
                        padding: '0.75rem', borderRadius: '0.5rem', border: 'none',
                        background: 'var(--accent)', color: 'white', fontWeight: 600, cursor: 'pointer'
                    }}>
                        Sign In
                    </button>
                </form>
                <div style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.9rem' }}>
                    Don't have an account? <Link href="/register" style={{ color: 'var(--accent)', fontWeight: 500 }}>Join Club</Link>
                </div>
            </div>
        </div>
    );
}
