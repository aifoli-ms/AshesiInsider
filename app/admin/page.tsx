//@Divine Kwawukume
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminDashboard from '@/components/pages/admin-dashboard';
import Navigation from '@/components/navigation';
import { Button } from '@/components/ui/button';

export default function AdminPage() {
    const router = useRouter();
    const [isAuthed, setIsAuthed] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);

    // Login state
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loginLoading, setLoginLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const checkAuth = async () => {
        try {
            const res = await fetch('/api/auth/session', { cache: 'no-store' });
            if (res.ok) {
                const data = await res.json();
                const admin = data.user?.role === 'admin';
                setIsAuthed(true);
                setIsAdmin(admin);
            } else {
                setIsAuthed(false);
                setIsAdmin(false);
            }
        } catch {
            setIsAuthed(false);
            setIsAdmin(false);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void checkAuth();
    }, []);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoginLoading(true);
        setError(null);

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                setError(data?.error ?? 'Login failed');
                setLoginLoading(false);
                return;
            }

            // Login successful, re-check auth to get role
            await checkAuth();
            setLoginLoading(false);
        } catch (err) {
            setError('An error occurred during login');
            setLoginLoading(false);
        }
    };

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        setIsAuthed(false);
        setIsAdmin(false);
        setEmail('');
        setPassword('');
        router.push('/');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-xl font-semibold text-muted-foreground">Checking authorization...</div>
            </div>
        );
    }

    // If authenticated and admin, show dashboard
    if (isAuthed && isAdmin) {
        return (
            <div className="min-h-screen bg-background text-foreground">
                <Navigation
                    currentPage="admin"
                    onNavigate={(page) => {
                        if (page !== 'admin') router.push('/');
                    }}
                    onSignIn={() => { }}
                    isAuthed={true}
                    isAdmin={true}
                    onSignOut={handleLogout}
                />
                <AdminDashboard />
            </div>
        );
    }

    // If authenticated but NOT admin
    if (isAuthed && !isAdmin) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background p-4">
                <div className="max-w-md w-full bg-card border border-border rounded-xl shadow-lg p-8 text-center">
                    <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="m15 9-6 6" /><path d="m9 9 6 6" /></svg>
                    </div>
                    <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
                    <p className="text-muted-foreground mb-6">
                        You are logged in, but your account does not have administrator privileges Sorry.
                    </p>
                    <div className="flex gap-4 justify-center">
                        <Button variant="outline" onClick={() => router.push('/')}>
                            Go Home
                        </Button>
                        <Button variant="destructive" onClick={handleLogout}>
                            Sign Out
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    // Not authenticated - Show Admin Login Form
    return (
        <div className="min-h-screen flex items-center justify-center bg-secondary/5 p-4">
            <div className="max-w-md w-full bg-background border border-border rounded-2xl shadow-xl p-8">
                <div className="text-center mb-8">
                    <div className="w-12 h-12 bg-primary text-primary-foreground rounded-lg flex items-center justify-center font-bold text-xl mx-auto mb-4">
                        🎓
                    </div>
                    <h1 className="text-2xl font-bold text-foreground">Admin Portal</h1>
                    <p className="text-muted-foreground">Sign in to access the dashboard</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    {error && (
                        <div className="text-sm text-red-600 bg-red-500/10 border border-red-500/30 rounded-md px-3 py-2">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                            Email Address
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="admin@ashesi.edu.gh"
                            className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder-muted-foreground"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                            Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder-muted-foreground"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loginLoading}
                        className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-bold hover:opacity-90 transition-opacity mt-2 disabled:opacity-60"
                    >
                        {loginLoading ? 'Verifying...' : 'Access Dashboard'}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <button
                        onClick={() => router.push('/')}
                        className="text-sm text-muted-foreground hover:text-foreground hover:underline"
                    >
                        ← Back to Ashesi Insider
                    </button>
                </div>
            </div>
        </div>
    );
}
