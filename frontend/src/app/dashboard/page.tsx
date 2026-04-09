'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Globe, Route, FileText, DollarSign,
  Loader2, AlertTriangle, ChevronDown, ChevronUp,
  CheckCircle2, ArrowRight, ArrowLeft, Lightbulb,
  MapPin, ShieldCheck
} from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useI18n } from '@/lib/i18n';
import { AnalysisMode, MODE_CONFIGS } from '@/services/ai.service';
import type { CountryResult, PlanResult, VisaResult, CostResult } from '@/services/ai.service';

const FREE_LIMIT = 3;

type WizardStep = 'mode' | 'input' | 'result';

const MODE_ICONS: Record<AnalysisMode, React.ElementType> = {
  country: Globe,
  plan: Route,
  visa: FileText,
  cost: DollarSign,
};

const MODE_COLORS: Record<AnalysisMode, string> = {
  country: 'from-indigo-500 to-violet-600',
  plan: 'from-blue-500 to-cyan-600',
  visa: 'from-emerald-500 to-teal-600',
  cost: 'from-amber-500 to-orange-600',
};

const FIELD_LANGUAGE_OPTIONS = ['English', 'Spanish', 'French', 'German', 'Portuguese', 'Russian', 'Arabic', 'Chinese'];
const LIFESTYLE_OPTIONS = ['Budget', 'Comfortable', 'Premium'];

function ScoreBar({ score }: { score: number }) {
  const color = score >= 85 ? 'bg-green-500' : score >= 70 ? 'bg-indigo-500' : 'bg-amber-500';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-white/8 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full`} style={{ width: `${score}%` }} />
      </div>
      <span className="text-xs font-bold text-white w-8 text-right">{score}</span>
    </div>
  );
}

function CountryCard({ country, rank }: { country: CountryResult['countries'][0]; rank: number }) {
  const { t } = useI18n();
  const r = t.dashboard.results;
  const [expanded, setExpanded] = useState(rank === 0);
  return (
    <div className={`rounded-xl ${rank === 0 ? 'bg-indigo-900/15' : 'bg-[#161a22]'}`}>
      <button onClick={() => setExpanded(v => !v)} className="w-full flex items-center justify-between px-5 py-4 text-left">
        <div className="flex items-center gap-3">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${rank === 0 ? 'bg-indigo-600 text-white' : 'bg-white/8 text-slate-400'}`}>{rank + 1}</div>
          <span className="text-2xl">{country.flag}</span>
          <div>
            <p className="font-semibold text-white">{country.name}</p>
            <p className="text-xs text-slate-500">{country.cost}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-24"><ScoreBar score={country.score} /></div>
          {expanded ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
        </div>
      </button>
      {expanded && (
        <div className="px-5 pb-5 border-t border-white/5">
          <div className="mt-4 mb-4 space-y-1.5">
            {country.reasons.map((reason, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-slate-300">
                <ArrowRight className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />{reason}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="p-3 rounded-lg bg-white/[0.04]"><p className="text-xs text-slate-500 mb-1">{r.visa}</p><p className="text-sm text-slate-200">{country.visa}</p></div>
            <div className="p-3 rounded-lg bg-white/[0.04]"><p className="text-xs text-slate-500 mb-1">{r.monthly}</p><p className="text-sm text-slate-200 font-semibold">{country.cost}</p></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-green-500 uppercase tracking-wider mb-2">{r.pros}</p>
              {country.pros.map((p, i) => <div key={i} className="flex items-start gap-1.5 text-xs text-slate-400 mb-1"><CheckCircle2 className="w-3 h-3 text-green-500 shrink-0 mt-0.5" />{p}</div>)}
            </div>
            <div>
              <p className="text-xs text-red-400 uppercase tracking-wider mb-2">{r.cons}</p>
              {country.cons.map((c, i) => <div key={i} className="flex items-start gap-1.5 text-xs text-slate-400 mb-1"><span className="text-red-400 shrink-0">–</span>{c}</div>)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CountryResults({ result, checkedItems, onToggle }: { result: CountryResult; checkedItems: Set<number>; onToggle: (i: number) => void }) {
  const { t } = useI18n();
  const r = t.dashboard.results;
  return (
    <div className="space-y-6">
      <div className="p-5 bg-indigo-900/15 rounded-xl">
        <p className="text-xs text-indigo-400 uppercase tracking-wider mb-2">{r.summary}</p>
        <p className="text-slate-200 leading-relaxed">{result.summary}</p>
      </div>
      <div className="space-y-3">
        {result.countries.map((c, i) => <CountryCard key={i} country={c} rank={i} />)}
      </div>
      <div className="bg-[#161a22] rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-white/5"><h3 className="font-semibold text-sm">{r.roadmap}</h3></div>
        <div className="p-5 space-y-3">
          {result.plan.map((step, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-indigo-900/60 flex items-center justify-center text-xs font-bold text-indigo-300 shrink-0">{i + 1}</div>
              <p className="text-sm text-slate-300 pt-0.5">{step}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-[#161a22] rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
          <h3 className="font-semibold text-sm">{r.checklist}</h3>
          <span className="text-xs text-slate-500">{checkedItems.size}/{result.checklist.length}</span>
        </div>
        <div className="p-5 space-y-2">
          {result.checklist.map((item, i) => (
            <button key={i} onClick={() => onToggle(i)} className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-white/[0.04] transition-colors text-left">
              <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${checkedItems.has(i) ? 'bg-green-600 border-green-600' : 'border-white/20'}`}>
                {checkedItems.has(i) && <CheckCircle2 className="w-3 h-3 text-white" />}
              </div>
              <span className={`text-sm ${checkedItems.has(i) ? 'line-through text-slate-600' : 'text-slate-300'}`}>{item}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function PlanResults({ result }: { result: PlanResult }) {
  const { t } = useI18n();
  const r = t.dashboard.results;
  return (
    <div className="space-y-6">
      <div className="p-5 bg-blue-900/15 rounded-xl">
        <p className="text-xs text-blue-400 uppercase tracking-wider mb-2">{t.dashboard.modes.plan.label} — {result.destination}</p>
        <p className="text-slate-200 leading-relaxed">{result.summary}</p>
      </div>
      <div className="bg-[#161a22] rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-white/5"><h3 className="font-semibold text-sm">{r.timeline}</h3></div>
        <div className="p-5 space-y-4">
          {result.phases.map((phase, i) => (
            <div key={i} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-7 h-7 rounded-full bg-blue-900/60 flex items-center justify-center text-xs font-bold text-blue-300 shrink-0">{i + 1}</div>
                {i < result.phases.length - 1 && <div className="w-px flex-1 bg-white/5 mt-2" />}
              </div>
              <div className="pb-4 flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <p className="text-sm font-semibold text-white">{phase.phase}</p>
                  <span className="text-xs text-slate-500 bg-white/[0.04] px-2 py-0.5 rounded-full">{phase.duration}</span>
                </div>
                <ul className="space-y-1.5">
                  {phase.tasks.map((task, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm text-slate-400">
                      <ArrowRight className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />{task}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {([['visa', result.costs.visa], ['monthly', result.costs.monthly], ['setup', result.costs.oneTime]] as const).map(([key, val]) => (
          <div key={key} className="p-4 bg-[#161a22] rounded-xl">
            <p className="text-xs text-slate-500 mb-1">{r[key as 'visa' | 'monthly' | 'setup']}</p>
            <p className="text-sm text-slate-200 font-semibold">{val}</p>
          </div>
        ))}
      </div>
      <div className="bg-[#161a22] rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-white/5"><h3 className="font-semibold text-sm">{r.requiredDocs}</h3></div>
        <div className="p-5 space-y-2">
          {result.requirements.map((req, i) => (
            <div key={i} className="flex items-start gap-2 text-sm text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />{req}
            </div>
          ))}
        </div>
      </div>
      {result.tips?.length > 0 && (
        <div className="bg-[#161a22] rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-white/5"><h3 className="font-semibold text-sm">{r.proTips}</h3></div>
          <div className="p-5 space-y-2">
            {result.tips.map((tip, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-slate-300">
                <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />{tip}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function VisaResults({ result }: { result: VisaResult }) {
  const { t } = useI18n();
  const r = t.dashboard.results;
  const difficultyColor = { easy: 'text-green-400', moderate: 'text-amber-400', hard: 'text-red-400' };
  return (
    <div className="space-y-6">
      <div className="p-5 bg-emerald-900/15 rounded-xl">
        <p className="text-xs text-emerald-400 uppercase tracking-wider mb-2">{t.dashboard.modes.visa.label} — {result.destination}</p>
        <p className="text-slate-200 leading-relaxed">{result.summary}</p>
      </div>
      {result.visaTypes.map((visa, i) => (
        <div key={i} className="bg-[#161a22] rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <h3 className="font-semibold text-sm">{visa.name}</h3>
            </div>
            <span className={`text-xs font-medium ${difficultyColor[visa.difficulty] || 'text-slate-400'}`}>
              {visa.difficulty}
            </span>
          </div>
          <div className="p-5 grid grid-cols-3 gap-3 mb-4">
            {([['duration', visa.duration], ['cost', visa.cost], ['processing', visa.processingTime]] as const).map(([key, val]) => (
              <div key={key} className="p-3 rounded-lg bg-white/[0.04]">
                <p className="text-xs text-slate-500 mb-1">{r[key as 'duration' | 'cost' | 'processing']}</p>
                <p className="text-sm text-slate-200">{val}</p>
              </div>
            ))}
          </div>
          <div className="px-5 pb-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">{r.requirements}</p>
              <ul className="space-y-1.5">
                {visa.requirements.map((req, j) => (
                  <li key={j} className="flex items-start gap-2 text-sm text-slate-400">
                    <ArrowRight className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />{req}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">{r.process}</p>
              <ol className="space-y-1.5">
                {visa.process.map((step, j) => (
                  <li key={j} className="flex items-start gap-2 text-sm text-slate-400">
                    <span className="text-xs text-emerald-500 font-bold shrink-0 mt-0.5">{j + 1}.</span>{step}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      ))}
      {result.documents?.length > 0 && (
        <div className="bg-[#161a22] rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-white/5"><h3 className="font-semibold text-sm">{r.docChecklist}</h3></div>
          <div className="p-5 space-y-2">
            {result.documents.map((doc, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />{doc}
              </div>
            ))}
          </div>
        </div>
      )}
      {result.tips?.length > 0 && (
        <div className="bg-[#161a22] rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-white/5"><h3 className="font-semibold text-sm">{r.tips}</h3></div>
          <div className="p-5 space-y-2">
            {result.tips.map((tip, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-slate-300">
                <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />{tip}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function CostResults({ result }: { result: CostResult }) {
  const { t } = useI18n();
  const r = t.dashboard.results;
  const breakdownKeys = ['housing', 'food', 'transport', 'utilities', 'healthcare', 'entertainment'] as const;
  const labels: Record<string, string> = {
    housing: r.housing, food: r.food, transport: r.transport,
    utilities: r.utilities, healthcare: r.healthcare, entertainment: r.entertainment,
  };
  return (
    <div className="space-y-6">
      <div className="p-5 bg-amber-900/15 rounded-xl">
        <p className="text-xs text-amber-400 uppercase tracking-wider mb-2">{t.dashboard.modes.cost.label} — {result.destination} · {result.lifestyle}</p>
        <p className="text-slate-200 leading-relaxed">{result.summary}</p>
      </div>
      <div className="bg-[#161a22] rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
          <h3 className="font-semibold text-sm">{r.monthlyBreakdown}</h3>
          <span className="text-sm font-bold text-amber-300">{result.total.min} – {result.total.max}</span>
        </div>
        <div className="p-5 space-y-4">
          {breakdownKeys.map(key => {
            const item = result.breakdown[key];
            if (!item) return null;
            return (
              <div key={key}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-slate-300">{labels[key]}</span>
                  <span className="text-sm font-semibold text-white">{item.range}</span>
                </div>
                <p className="text-xs text-slate-500">{item.notes}</p>
              </div>
            );
          })}
        </div>
      </div>
      {result.comparison && (
        <div className="p-4 bg-white/[0.04] rounded-xl">
          <p className="text-xs text-slate-500 mb-1">{r.comparison}</p>
          <p className="text-sm text-slate-300">{result.comparison}</p>
        </div>
      )}
      {result.tips?.length > 0 && (
        <div className="bg-[#161a22] rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-white/5"><h3 className="font-semibold text-sm">{r.savingTips}</h3></div>
          <div className="p-5 space-y-2">
            {result.tips.map((tip, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-slate-300">
                <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />{tip}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const { user, refreshUser } = useAuth();
  const { t } = useI18n();
  const d = t.dashboard;
  const [step, setStep] = useState<WizardStep>('mode');
  const [mode, setMode] = useState<AnalysisMode | null>(null);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [limitReached, setLimitReached] = useState(false);
  const [result, setResult] = useState<{ mode: AnalysisMode; data: unknown } | null>(null);
  const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set());

  const remaining = user?.plan === 'FREE' ? Math.max(0, FREE_LIMIT - (user?.monthlyUsage ?? 0)) : null;

  const selectMode = (m: AnalysisMode) => {
    setMode(m);
    setFields({});
    setError('');
    setResult(null);
    setStep('input');
  };

  const goBack = () => {
    if (step === 'input') { setStep('mode'); setMode(null); }
    if (step === 'result') { setStep('input'); }
    setError('');
  };

  const setField = (key: string, value: string) => setFields(prev => ({ ...prev, [key]: value }));

  const getFieldLabel = (fieldKey: string, fallback: string): string => {
    if (!mode) return fallback;
    const modeFields = d.modes[mode].fields as Record<string, string>;
    return modeFields[fieldKey] ?? fallback;
  };

  const submit = async () => {
    if (!mode) return;
    const config = MODE_CONFIGS[mode];
    for (const f of config.fields) {
      if (f.required && !fields[f.key]?.trim()) {
        const label = getFieldLabel(f.key, f.label);
        setError(`${label} — ${d.fieldRequired}`);
        return;
      }
    }
    setError('');
    setLimitReached(false);
    setLoading(true);
    setResult(null);
    setCheckedItems(new Set());

    try {
      const data = await api.post<{ mode: string; result: unknown }>('/api/ai/relocate', { mode, ...fields });
      setResult({ mode: data.mode as AnalysisMode, data: data.result });
      setStep('result');
      await refreshUser();
    } catch (err: any) {
      if (err?.data?.error === 'FREE_LIMIT_REACHED') setLimitReached(true);
      else setError(err.message || 'Analysis failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleCheck = (i: number) =>
    setCheckedItems(prev => { const n = new Set(prev); n.has(i) ? n.delete(i) : n.add(i); return n; });

  const stepLabels = d.steps;
  const currentStepIdx = step === 'mode' ? 0 : step === 'input' ? 1 : 2;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {(limitReached || remaining === 0) && (
        <div className="mb-6 p-4 rounded-xl bg-amber-900/20 border border-amber-700/40 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-amber-300 font-medium text-sm">{d.limitTitle}</p>
            <p className="text-amber-400/70 text-xs mt-0.5">{d.limitDesc}</p>
          </div>
          <Link href="/dashboard/billing" className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 rounded-lg text-xs font-semibold text-white whitespace-nowrap transition-colors">{d.upgrade} →</Link>
        </div>
      )}

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {stepLabels.map((label, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className={`flex items-center gap-2 ${i <= currentStepIdx ? 'text-white' : 'text-slate-600'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                i < currentStepIdx ? 'bg-green-600' : i === currentStepIdx ? 'bg-indigo-600' : 'bg-white/8'
              }`}>
                {i < currentStepIdx ? <CheckCircle2 className="w-3.5 h-3.5" /> : i + 1}
              </div>
              <span className="text-sm hidden sm:block">{label}</span>
            </div>
            {i < stepLabels.length - 1 && <div className={`w-8 h-px ${i < currentStepIdx ? 'bg-green-700' : 'bg-white/10'}`} />}
          </div>
        ))}
        {remaining !== null && (
          <span className="ml-auto text-xs text-slate-500">{remaining}/{FREE_LIMIT}</span>
        )}
      </div>

      {/* Step 1: Mode selection */}
      {step === 'mode' && (
        <div>
          <h2 className="text-lg font-bold mb-1">{d.heading}</h2>
          <p className="text-slate-500 text-sm mb-6">{d.subheading}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(Object.keys(MODE_CONFIGS) as AnalysisMode[]).map(m => {
              const Icon = MODE_ICONS[m];
              const gradient = MODE_COLORS[m];
              const modeT = d.modes[m];
              return (
                <button
                  key={m}
                  onClick={() => selectMode(m)}
                  disabled={remaining === 0}
                  className="group p-5 bg-[#161a22] hover:bg-[#1e2330] disabled:opacity-40 disabled:cursor-not-allowed rounded-xl text-left transition-all hover:shadow-xl hover:shadow-black/20"
                >
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-4 group-hover:scale-105 transition-transform`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <p className="font-semibold text-white mb-1">{modeT.label}</p>
                  <p className="text-sm text-slate-500">{modeT.description}</p>
                  <div className="mt-4 flex items-center gap-1 text-xs text-slate-600 group-hover:text-indigo-400 transition-colors">
                    {d.getStarted} <ArrowRight className="w-3 h-3" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Step 2: Input form */}
      {step === 'input' && mode && (
        <div>
          <button onClick={goBack} className="flex items-center gap-1.5 text-slate-500 hover:text-white text-sm mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> {d.back}
          </button>
          <div className="bg-[#161a22] rounded-xl overflow-hidden shadow-xl shadow-black/20">
            <div className="px-5 py-4 border-b border-white/5 flex items-center gap-3">
              {(() => { const Icon = MODE_ICONS[mode]; return <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${MODE_COLORS[mode]} flex items-center justify-center`}><Icon className="w-4 h-4 text-white" /></div>; })()}
              <div>
                <h2 className="font-semibold">{d.modes[mode].label}</h2>
                <p className="text-xs text-slate-500">{d.modes[mode].description}</p>
              </div>
            </div>
            <div className="px-5 py-5 space-y-4">
              {MODE_CONFIGS[mode].fields.map(field => (
                <div key={field.key}>
                  <label className="block text-xs text-slate-500 mb-1.5">
                    {getFieldLabel(field.key, field.label)}{field.required && ' *'}
                  </label>
                  {field.type === 'select' ? (
                    <select
                      value={fields[field.key] || (field.options?.[0] ?? '')}
                      onChange={e => setField(field.key, e.target.value)}
                      className="w-full px-3 py-2 bg-[#0d0f14] border border-white/8 rounded-lg text-white focus:outline-none focus:border-indigo-500 text-sm transition-colors"
                    >
                      {(field.key === 'language' ? FIELD_LANGUAGE_OPTIONS : field.key === 'lifestyle' ? LIFESTYLE_OPTIONS : field.options ?? []).map(opt => (
                        <option key={opt}>{opt}</option>
                      ))}
                    </select>
                  ) : field.type === 'textarea' ? (
                    <textarea
                      value={fields[field.key] || ''}
                      onChange={e => setField(field.key, e.target.value)}
                      rows={3}
                      placeholder={field.placeholder}
                      className="w-full px-3 py-2 bg-[#0d0f14] border border-white/8 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 text-sm resize-none transition-colors"
                    />
                  ) : (
                    <input
                      value={fields[field.key] || ''}
                      onChange={e => setField(field.key, e.target.value)}
                      placeholder={field.placeholder}
                      className="w-full px-3 py-2 bg-[#0d0f14] border border-white/8 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 text-sm transition-colors"
                    />
                  )}
                </div>
              ))}

              {error && <p className="text-red-400 text-sm">{error}</p>}

              <button
                onClick={submit}
                disabled={loading || remaining === 0}
                className={`flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r ${MODE_COLORS[mode]} hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-semibold text-sm transition-all`}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (() => { const Icon = MODE_ICONS[mode]; return <Icon className="w-4 h-4" />; })()}
                {loading ? d.analyzing : d.modes[mode].label}
              </button>
            </div>
          </div>

          {loading && (
            <div className="mt-6 bg-[#161a22] rounded-xl p-8 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-400 mx-auto mb-4" />
              <p className="text-slate-300 font-medium">{d.aiRunning}</p>
              <p className="text-slate-500 text-sm mt-1">{d.aiWait}</p>
            </div>
          )}
        </div>
      )}

      {/* Step 3: Results */}
      {step === 'result' && result && mode && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <button onClick={goBack} className="flex items-center gap-1.5 text-slate-500 hover:text-white text-sm transition-colors">
              <ArrowLeft className="w-4 h-4" /> {d.editInputs}
            </button>
            <button
              onClick={() => { setStep('mode'); setMode(null); setResult(null); }}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-white/[0.05] hover:bg-white/[0.09] rounded-lg text-slate-400 hover:text-white transition-colors"
            >
              <MapPin className="w-3.5 h-3.5" /> {d.newAnalysis}
            </button>
          </div>

          {result.mode === 'country' && <CountryResults result={result.data as CountryResult} checkedItems={checkedItems} onToggle={toggleCheck} />}
          {result.mode === 'plan' && <PlanResults result={result.data as PlanResult} />}
          {result.mode === 'visa' && <VisaResults result={result.data as VisaResult} />}
          {result.mode === 'cost' && <CostResults result={result.data as CostResult} />}
        </div>
      )}
    </div>
  );
}
