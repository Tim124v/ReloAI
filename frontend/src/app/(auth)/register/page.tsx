'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MapPin, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useI18n } from '@/lib/i18n';

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { t } = useI18n();
  const a = t.auth.register;
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) { setError(a.passwordError); return; }
    setLoading(true);
    try {
      const data = await api.post<{ token: string; user: any }>('/api/auth/register', { name, email, password });
      login(data.token, data.user);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0f14] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6 text-sm transition-colors">
            <MapPin className="w-4 h-4" /> ReloAI
          </Link>
          <h1 className="text-2xl font-bold text-white">{a.title}</h1>
          <p className="text-slate-500 text-sm mt-1">{a.subtitle}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1.5">{a.name} <span className="text-slate-600">{a.optional}</span></label>
            <input
              type="text" value={name} onChange={(e) => setName(e.target.value)}
              placeholder="Alex"
              className="w-full px-3.5 py-2.5 bg-[#161a22] border border-white/8 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors text-sm"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1.5">{a.email}</label>
            <input
              type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-3.5 py-2.5 bg-[#161a22] border border-white/8 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors text-sm"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1.5">{a.password}</label>
            <input
              type="password" required autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder={a.minChars}
              className="w-full px-3.5 py-2.5 bg-[#161a22] border border-white/8 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors text-sm"
            />
          </div>

          {error && (
            <div className="px-3 py-2.5 bg-red-900/20 border border-red-700/50 rounded-lg text-red-400 text-sm">{error}</div>
          )}

          <button
            type="submit" disabled={loading}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed rounded-lg font-semibold text-sm transition-colors flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? a.creating : a.submit}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-6">
          {a.alreadyHave}{' '}
          <Link href="/login" className="text-indigo-400 hover:text-indigo-300 transition-colors">{a.signIn}</Link>
        </p>
      </div>
    </div>
  );
}
