'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { MapPin, History, CreditCard, LogOut, Zap, ChevronDown, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useI18n } from '@/lib/i18n';
import { LOCALES, type Locale } from '@/lib/i18n-data';

function LangSwitcher() {
  const { locale, setLocale } = useI18n();
  const [open, setOpen] = useState(false);
  const current = LOCALES.find(l => l.code === locale)!;
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-[#1e2330] transition-all text-xs"
      >
        <span>{current.flag}</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 w-36 bg-[#1a1f2e] border border-[#2a3347] rounded-xl shadow-2xl z-50 overflow-hidden">
            {LOCALES.map(l => (
              <button
                key={l.code}
                onClick={() => { setLocale(l.code as Locale); setOpen(false); }}
                className={`w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-white/5 transition-colors ${locale === l.code ? 'text-indigo-400' : 'text-slate-400'}`}
              >
                <span>{l.flag}</span><span>{l.label}</span>
                {locale === l.code && <CheckCircle2 className="w-3 h-3 ml-auto" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const { t } = useI18n();
  const router = useRouter();
  const path = usePathname();

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#080a0f] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const FREE_LIMIT = 3;
  const handleLogout = () => { logout(); router.push('/'); };

  const navLinks = [
    { href: '/dashboard', label: t.nav.dashboard, icon: Zap },
    { href: '/dashboard/history', label: t.nav.history, icon: History },
    { href: '/dashboard/billing', label: t.nav.billing, icon: CreditCard },
  ];

  return (
    <div className="min-h-screen bg-[#080a0f] flex flex-col">
      <nav className="border-b border-white/5 px-6 py-3.5 flex items-center justify-between backdrop-blur-md bg-[#080a0f]/90 sticky top-0 z-20">
        <div className="flex items-center gap-5">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <MapPin className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="hidden sm:block font-bold text-sm bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">ReloAI</span>
          </Link>
          <div className="flex gap-1">
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href} href={href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all ${
                  path === href
                    ? 'bg-indigo-600/80 text-white shadow-lg shadow-indigo-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />{label}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <LangSwitcher />
          <div className="hidden sm:flex items-center gap-2">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              user.plan === 'PRO'
                ? 'bg-indigo-900/50 text-indigo-300 border border-indigo-700/50'
                : 'bg-white/5 text-slate-400 border border-white/8'
            }`}>
              {user.plan}
            </span>
            {user.plan === 'FREE' && (
              <span className="text-xs text-slate-600">
                {Math.max(0, FREE_LIMIT - user.monthlyUsage)}/{FREE_LIMIT}
              </span>
            )}
          </div>
          <button onClick={handleLogout} className="p-1.5 text-slate-500 hover:text-white rounded-lg hover:bg-white/5 transition-colors">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </nav>
      <main className="flex-1">{children}</main>
    </div>
  );
}
