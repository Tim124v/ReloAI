'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Globe, Zap, Lock, BarChart3, ArrowRight, CheckCircle2,
  MapPin, ChevronDown, Star, Users, Clock, TrendingUp
} from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { LOCALES, type Locale } from '@/lib/i18n-data';

function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();
  const [open, setOpen] = useState(false);
  const current = LOCALES.find(l => l.code === locale)!;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all text-sm"
      >
        <span>{current.flag}</span>
        <span className="hidden sm:block">{current.label}</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-40 bg-[#1a1f2e] border border-[#2a3347] rounded-xl shadow-2xl z-50 overflow-hidden">
            {LOCALES.map(l => (
              <button
                key={l.code}
                onClick={() => { setLocale(l.code as Locale); setOpen(false); }}
                className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-white/5 transition-colors text-left ${locale === l.code ? 'text-indigo-400' : 'text-slate-300'}`}
              >
                <span>{l.flag}</span>
                <span>{l.label}</span>
                {locale === l.code && <CheckCircle2 className="w-3.5 h-3.5 ml-auto text-indigo-400" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl overflow-hidden bg-white/[0.03]">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-white/[0.03] transition-colors"
      >
        <span className="font-medium text-white text-sm pr-4">{q}</span>
        <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="px-6 pb-5 text-slate-400 text-sm leading-relaxed border-t border-white/5">
          <div className="pt-4">{a}</div>
        </div>
      )}
    </div>
  );
}

export default function LandingPage() {
  const { t } = useI18n();

  const stats = [
    { icon: Globe, value: '195', label: t.stats.countries },
    { icon: Users, value: '12K+', label: t.stats.users },
    { icon: Star, value: '4.9★', label: t.stats.rating },
    { icon: Clock, value: '< 3', label: t.stats.time },
  ];

  return (
    <div className="min-h-screen bg-[#080a0f] text-white overflow-hidden">

      {/* Ambient background glows */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/3 left-0 w-[400px] h-[400px] bg-violet-600/8 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-indigo-500/6 rounded-full blur-[80px]" />
      </div>

      {/* Navbar */}
      <nav className="relative z-10 border-b border-white/5 backdrop-blur-md bg-[#080a0f]/80 sticky top-0">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <MapPin className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              ReloAI
            </span>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <Link href="/login" className="px-4 py-2 text-slate-400 hover:text-white transition-colors text-sm">
              {t.nav.signIn}
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 rounded-lg text-sm font-medium transition-all shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30"
            >
              {t.nav.getStarted}
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative max-w-5xl mx-auto px-6 pt-28 pb-20 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-medium mb-8 backdrop-blur-sm">
          <Zap className="w-3.5 h-3.5" />
          {t.hero.badge}
        </div>

        <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold mb-6 leading-[1.05] tracking-tight">
          <span className="bg-gradient-to-br from-white via-white to-slate-400 bg-clip-text text-transparent">
            {t.hero.title1}
          </span>
          <br />
          <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-indigo-300 bg-clip-text text-transparent">
            {t.hero.title2}
          </span>
        </h1>

        <p className="text-lg text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
          {t.hero.subtitle}
        </p>

        <div className="flex gap-3 justify-center flex-wrap">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-7 py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 rounded-xl font-semibold transition-all hover:scale-105 shadow-xl shadow-indigo-500/25 hover:shadow-indigo-500/40 text-sm"
          >
            {t.hero.cta} <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-7 py-3.5 bg-white/6 hover:bg-white/10 rounded-xl text-slate-300 hover:text-white transition-all backdrop-blur-sm text-sm"
          >
            {t.hero.ctaSecondary}
          </Link>
        </div>
        <p className="text-xs text-slate-600 mt-5">{t.hero.free}</p>

        {/* Floating country cards */}
        <div className="mt-16 relative">
          <div className="absolute inset-0 bg-gradient-to-t from-[#080a0f] to-transparent z-10 bottom-0 h-16 pointer-events-none" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl mx-auto">
            {t.profiles.items.slice(0, 4).map((ex, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-3.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.07] backdrop-blur-sm transition-all"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500/20 to-violet-500/20 flex items-center justify-center shrink-0">
                  <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                </div>
                <div className="text-left min-w-0">
                  <p className="text-sm text-white font-medium truncate">{ex.profession}</p>
                  <p className="text-xs text-slate-500 truncate">{ex.budget} · {ex.goal}</p>
                </div>
                <div className="ml-auto shrink-0">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-600 mt-3">{t.profiles.label}</p>
        </div>
      </section>

      {/* Stats bar */}
      <section className="relative max-w-4xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {stats.map(({ icon: Icon, value, label }, i) => (
            <div key={i} className="text-center p-5 rounded-2xl bg-white/[0.03] backdrop-blur-sm">
              <Icon className="w-5 h-5 text-indigo-400 mx-auto mb-2" />
              <p className="text-3xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">{value}</p>
              <p className="text-xs text-slate-500 mt-1">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="relative max-w-5xl mx-auto px-6 pb-24">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
            {t.how.title}
          </h2>
          <p className="text-slate-500 text-sm">{t.how.subtitle}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {t.how.steps.map((step, i) => (
            <div key={i} className="relative p-6 rounded-2xl bg-gradient-to-b from-white/5 to-white/2 backdrop-blur-sm group hover:from-white/7 hover:to-white/3 transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-sm font-bold shadow-lg shadow-indigo-500/20">
                  {i + 1}
                </div>
                <div className="flex-1 h-px bg-gradient-to-r from-indigo-500/30 to-transparent" />
              </div>
              <h3 className="font-semibold text-white mb-2">{step.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="relative max-w-5xl mx-auto px-6 pb-24">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
            {t.features.title}
          </h2>
          <p className="text-slate-500 text-sm">{t.features.subtitle}</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { icon: BarChart3, ...t.features.items[0] },
            { icon: TrendingUp, ...t.features.items[1] },
            { icon: Globe, ...t.features.items[2] },
            { icon: Lock, ...t.features.items[3] },
          ].map(({ icon: Icon, title, desc }, i) => (
            <div
              key={i}
              className="p-5 rounded-2xl bg-gradient-to-b from-white/5 to-transparent hover:from-white/7 transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 flex items-center justify-center mb-4 group-hover:from-indigo-500/30 group-hover:to-violet-500/30 transition-all">
                <Icon className="w-5 h-5 text-indigo-400" />
              </div>
              <h3 className="font-semibold text-white mb-2 text-sm">{title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Output preview */}
      <section className="relative max-w-4xl mx-auto px-6 pb-24">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
            {t.preview.title}
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Countries */}
          <div className="p-5 bg-gradient-to-b from-white/5 to-transparent rounded-2xl">
            <p className="text-xs text-indigo-400 font-semibold uppercase tracking-wider mb-4 flex items-center gap-2">
              <BarChart3 className="w-3.5 h-3.5" /> {t.preview.topCountries}
            </p>
            {t.preview.countries.map((c, i) => (
              <div key={i} className="flex items-center gap-2 py-2 border-b border-white/5 last:border-0">
                <span className="text-xs text-slate-500 w-4">{i + 1}</span>
                <span className="text-sm text-slate-300">{c}</span>
              </div>
            ))}
          </div>
          {/* Plan */}
          <div className="p-5 bg-gradient-to-b from-white/5 to-transparent rounded-2xl">
            <p className="text-xs text-violet-400 font-semibold uppercase tracking-wider mb-4 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5" /> {t.preview.plan}
            </p>
            {t.preview.steps.map((s, i) => (
              <div key={i} className="flex items-start gap-2 py-2 border-b border-white/5 last:border-0">
                <div className="w-1.5 h-1.5 rounded-full bg-violet-400 mt-2 shrink-0" />
                <span className="text-sm text-slate-300">{s}</span>
              </div>
            ))}
          </div>
          {/* Checklist */}
          <div className="p-5 bg-gradient-to-b from-white/5 to-transparent rounded-2xl">
            <p className="text-xs text-green-400 font-semibold uppercase tracking-wider mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5" /> {t.preview.checklist}
            </p>
            {t.preview.checks.map((item, i) => (
              <div key={i} className="flex items-center gap-2 py-2 border-b border-white/5 last:border-0">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
                <span className="text-sm text-slate-300">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="relative max-w-5xl mx-auto px-6 pb-24">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
            {t.testimonials.title}
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {t.testimonials.items.map((item, i) => (
            <div
              key={i}
              className="p-6 rounded-2xl bg-gradient-to-b from-white/5 to-transparent flex flex-col gap-4"
            >
              <div className="flex text-amber-400 gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-current" />
                ))}
              </div>
              <p className="text-slate-300 text-sm leading-relaxed flex-1">&ldquo;{item.quote}&rdquo;</p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-xs font-bold">
                  {item.name[0]}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{item.name}</p>
                  <p className="text-xs text-slate-500">{item.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="relative max-w-3xl mx-auto px-6 pb-24">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
            {t.pricing.title}
          </h2>
          <p className="text-slate-500 text-sm">{t.pricing.subtitle}</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Free */}
          <div className="p-7 rounded-2xl bg-gradient-to-b from-white/4 to-transparent">
            <p className="text-slate-400 text-sm mb-2">{t.pricing.free.name}</p>
            <div className="flex items-end gap-1 mb-1">
              <span className="text-4xl font-bold text-white">{t.pricing.free.price}</span>
            </div>
            <p className="text-slate-500 text-xs mb-7">{t.pricing.free.desc}</p>
            <ul className="space-y-3 mb-7">
              {t.pricing.free.features.map((f, i) => (
                <li key={i} className="flex items-center gap-2.5 text-sm text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-slate-600 shrink-0" />{f}
                </li>
              ))}
            </ul>
            <Link
              href="/register"
              className="block text-center py-2.5 bg-white/5 hover:bg-white/9 rounded-xl text-sm transition-all"
            >
              {t.pricing.free.cta}
            </Link>
          </div>
          {/* Pro */}
          <div className="relative p-7 rounded-2xl bg-gradient-to-b from-indigo-600/20 to-violet-600/5 border border-indigo-500/30 shadow-xl shadow-indigo-500/10">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-full text-xs font-semibold shadow-lg shadow-indigo-500/30 whitespace-nowrap">
              {t.pricing.pro.badge}
            </div>
            <p className="text-indigo-300 text-sm mb-2">{t.pricing.pro.name}</p>
            <div className="flex items-end gap-1 mb-1">
              <span className="text-4xl font-bold text-white">{t.pricing.pro.price}</span>
              <span className="text-slate-400 text-lg mb-1">{t.pricing.pro.period}</span>
            </div>
            <p className="text-slate-500 text-xs mb-7">{t.pricing.pro.desc}</p>
            <ul className="space-y-3 mb-7">
              {t.pricing.pro.features.map((f, i) => (
                <li key={i} className="flex items-center gap-2.5 text-sm text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />{f}
                </li>
              ))}
            </ul>
            <Link
              href="/register"
              className="block text-center py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-indigo-500/20"
            >
              {t.pricing.pro.cta}
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="relative max-w-2xl mx-auto px-6 pb-24">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
            {t.faq.title}
          </h2>
        </div>
        <div className="space-y-2">
          {t.faq.items.map((item, i) => (
            <FaqItem key={i} q={item.q} a={item.a} />
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="relative max-w-3xl mx-auto px-6 pb-24">
        <div className="relative p-12 rounded-3xl overflow-hidden text-center">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 via-violet-600/15 to-indigo-600/10 rounded-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(99,102,241,0.15)_0%,_transparent_70%)]" />
          <div className="relative">
            <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent">
              {t.cta.title}
            </h2>
            <p className="text-slate-400 mb-8 text-sm leading-relaxed max-w-md mx-auto">
              {t.cta.subtitle}
            </p>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 rounded-xl font-semibold transition-all hover:scale-105 shadow-xl shadow-indigo-500/30 text-sm"
            >
              {t.cta.button} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-white/5 py-10">
        <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <MapPin className="w-3 h-3 text-white" />
            </div>
            <span className="text-sm font-semibold text-slate-300">ReloAI</span>
          </div>
          <p className="text-xs text-slate-600">{t.footer.tagline}</p>
          <p className="text-xs text-slate-600">© {new Date().getFullYear()} {t.footer.copy}</p>
        </div>
      </footer>
    </div>
  );
}
