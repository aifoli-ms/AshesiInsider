'use client';

import { X } from 'lucide-react';
import { useState } from 'react';
import SignUpModal from './sign-up-modal';
import { supabase } from '@/lib/supabaseClient';

interface SignInModalProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export default function SignInModal({ onClose, onSuccess }: SignInModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showSignUp, setShowSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    if (!supabase) {
      setLoading(false);
      setError('Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local.');
      return;
    }
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (signInError) {
      setError(signInError.message);
      return;
    }
    if (onSuccess) {
      onSuccess();
    } else {
      onClose();
    }
  };

  if (showSignUp) {
    return <SignUpModal onClose={onClose} />;
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background rounded-2xl shadow-2xl p-8 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-secondary">Welcome Back</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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
              placeholder="your.email@ashesi.edu.gh"
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
            disabled={loading}
            className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-bold hover:opacity-90 transition-opacity mt-6 disabled:opacity-60"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <button
          type="button"
          onClick={() => {
            if (!supabase) {
              setError('Supabase is not configured. Add env vars to .env.local.');
              return;
            }
            supabase.auth.signInWithOAuth({
              provider: 'google',
              options: { redirectTo: typeof window !== 'undefined' ? window.location.origin : undefined },
            });
          }}
          className="w-full mt-4 border border-border rounded-lg py-3 font-semibold hover:bg-accent/50 transition-colors"
        >
          Continue with Google
        </button>

        <p className="text-center text-muted-foreground text-sm mt-4">
          Don't have an account?{' '}
          <button
            type="button"
            onClick={() => setShowSignUp(true)}
            className="text-primary cursor-pointer font-semibold underline-offset-4 hover:underline"
          >
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
}
