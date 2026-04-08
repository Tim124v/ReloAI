'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  MapPin, Loader2, AlertTriangle, ChevronDown, ChevronUp,
  CheckCircle2, ArrowRight, Lightbulb, Globe, Route
} from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';

const FREE_LIMIT = 3;

type AnalysisType = 'country' | 'plan';

interface CountryResult {
  summary: string;
  countries: Array<{
    name: string;
    flag: string;
    score: number;
    reasons: string[];
    visa: string;
    cost: string;
    pros: string[];
    cons: string[];
  }>;
  plan: string[];
  checklist: string[];
}

interface PlanResult {
  destination: string;
  summary: string;
  phases: Array<{
    phase: string;
    duration: string;
    tasks: string[];
  }>;
  requirements: string[];
  costs: {
    visa: string;
    monthly: string;
    oneTime: string;
  };
  tips: string[];
}

const EXAMPLE_PROFILES = [
  { profession: 'Software Engineer', budget: '$3,000/month', language: 'English', goals: 'Low taxes, warm climate, tech community, easy long-term visa' },
  { profession: 'Freelance Designer', budget: '$2,000/month', language: 'English', goals: 'Good internet, EU access, low bureaucracy, affordable rent' },
  { profession: 'Finance Manager', budget: '$6,000/month', language: 'English', goals: 'Financial hub, 0% personal income tax, international connections' },
  { profession: 'Teacher / Educator', budget: '$1,500/month', language: 'English or Spanish', goals: 'Low cost of living, safe for family, warm weather' },
];

const PLAN_EXAMPLES = [
  { profession: 'Software Engineer', budget: '$3,000/month', language: 'English', destination: 'Portugal' },
  { profession: 'Freelance Designer', budget: '$2,000/month', language: 'English', destination: 'Georgia' },
  { profession: 'Finance Manager', budget: '$6,000/month', language: 'English', destination: 'UAE' },
  { profession: 'Digital Nomad', budget: '$2,500/month', language: 'English', destination: 'Thailand' },
];

const LANGUAGE_OPTIONS = ['English', 'Spanish', 'French', 'German', 'Portuguese', 'Russian', 'Arabic', 'Chinese'];

function ScoreBar({ score }: { score: number }) {
  const color = score >= 85 ? 'bg-green-500' : score >= 70 ? 'bg-indigo-500' : 'bg-amber-500';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-white/8 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${score}%` }} />
      </div>
      <span className="text-xs font-bold text-white w-8 text-right">{score}</span>
    </div>
  );
}

function CountryCard({ country, rank }: { country: CountryResult['countries'][0]; rank: number }) {
  const [expanded, setExpanded] = useState(rank === 0);

  return (
    <div className={`rounded-xl transition-all ${rank === 0 ? 'bg-indigo-900/15 shadow-lg shadow-indigo-500/10' : 'bg-[#161a22]'}`}>
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 text-left"
      >
        <div className="flex items-center gap-3">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
            rank === 0 ? 'bg-indigo-600 text-white' : 'bg-white/8 text-slate-400'
          }`}>
            {rank + 1}
          </div>
          <span className="text-2xl">{country.flag}</span>
          <div>
            <p className="font-semibold text-white">{country.name}</p>
            <p className="text-xs text-slate-500">{country.cost}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-24">
            <ScoreBar score={country.score} />
          </div>
          {expanded ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
        </div>
      </button>

      {expanded && (
        <div className="px-5 pb-5 border-t border-white/5">
          <div className="mt-4 mb-4">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Why this country</p>
            <div className="space-y-1.5">
              {country.reasons.map((r) => (
                <div key={r} className="flex items-start gap-2 text-sm text-slate-300">
                  <ArrowRight className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />{r}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="p-3 rounded-lg bg-white/[0.04]">
              <p className="text-xs text-slate-500 mb-1">Visa path</p>
              <p className="text-sm text-slate-200">{country.visa}</p>
            </div>
            <div className="p-3 rounded-lg bg-white/[0.04]">
              <p className="text-xs text-slate-500 mb-1">Monthly cost</p>
              <p className="text-sm text-slate-200 font-semibold">{country.cost}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-green-500 uppercase tracking-wider mb-2">Pros</p>
              {country.pros.map((p) => (
                <div key={p} className="flex items-start gap-1.5 text-xs text-slate-400 mb-1">
                  <CheckCircle2 className="w-3 h-3 text-green-500 shrink-0 mt-0.5" />{p}
                </div>
              ))}
            </div>
            <div>
              <p className="text-xs text-red-400 uppercase tracking-wider mb-2">Cons</p>
              {country.cons.map((c) => (
                <div key={c} className="flex items-start gap-1.5 text-xs text-slate-400 mb-1">
                  <span className="w-3 h-3 text-red-400 shrink-0 mt-0.5 text-center">–</span>{c}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PlanResults({ plan }: { plan: PlanResult }) {
  return (
    <div className="space-y-6">
      <div className="p-5 bg-indigo-900/15 rounded-xl">
        <p className="text-xs text-indigo-400 uppercase tracking-wider mb-2">Relocation plan — {plan.destination}</p>
        <p className="text-slate-200 leading-relaxed">{plan.summary}</p>
      </div>

      <div className="bg-[#161a22] rounded-xl overflow-hidden shadow-xl shadow-black/20">
        <div className="px-5 py-4 border-b border-white/5">
          <h3 className="font-semibold text-sm">Step-by-step timeline</h3>
        </div>
        <div className="p-5 space-y-4">
          {plan.phases.map((phase, i) => (
            <div key={i} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-7 h-7 rounded-full bg-indigo-900/60 flex items-center justify-center text-xs font-bold text-indigo-300 shrink-0">
                  {i + 1}
                </div>
                {i < plan.phases.length - 1 && (
                  <div className="w-px flex-1 bg-white/5 mt-2" />
                )}
              </div>
              <div className="pb-4 flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <p className="text-sm font-semibold text-white">{phase.phase}</p>
                  <span className="text-xs text-slate-500 bg-white/[0.04] px-2 py-0.5 rounded-full">{phase.duration}</span>
                </div>
                <ul className="space-y-1.5">
                  {phase.tasks.map((task, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm text-slate-400">
                      <ArrowRight className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />{task}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 bg-[#161a22] rounded-xl">
          <p className="text-xs text-slate-500 mb-1">Visa cost</p>
          <p className="text-sm text-slate-200 font-semibold">{plan.costs.visa}</p>
        </div>
        <div className="p-4 bg-[#161a22] rounded-xl">
          <p className="text-xs text-slate-500 mb-1">Monthly living</p>
          <p className="text-sm text-slate-200 font-semibold">{plan.costs.monthly}</p>
        </div>
        <div className="p-4 bg-[#161a22] rounded-xl">
          <p className="text-xs text-slate-500 mb-1">One-time setup</p>
          <p className="text-sm text-slate-200 font-semibold">{plan.costs.oneTime}</p>
        </div>
      </div>

      <div className="bg-[#161a22] rounded-xl overflow-hidden shadow-xl shadow-black/20">
        <div className="px-5 py-4 border-b border-white/5">
          <h3 className="font-semibold text-sm">Required documents & conditions</h3>
        </div>
        <div className="p-5 space-y-2">
          {plan.requirements.map((req, i) => (
            <div key={i} className="flex items-start gap-2 text-sm text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />{req}
            </div>
          ))}
        </div>
      </div>

      {plan.tips?.length > 0 && (
        <div className="bg-[#161a22] rounded-xl overflow-hidden shadow-xl shadow-black/20">
          <div className="px-5 py-4 border-b border-white/5">
            <h3 className="font-semibold text-sm">Pro tips for {plan.destination}</h3>
          </div>
          <div className="p-5 space-y-2">
            {plan.tips.map((tip, i) => (
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
  const [analysisType, setAnalysisType] = useState<AnalysisType>('country');
  const [profession, setProfession] = useState('');
  const [budget, setBudget] = useState('');
  const [language, setLanguage] = useState('English');
  const [goals, setGoals] = useState('');
  const [destination, setDestination] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [limitReached, setLimitReached] = useState(false);
  const [countryResult, setCountryResult] = useState<CountryResult | null>(null);
  const [planResult, setPlanResult] = useState<PlanResult | null>(null);
  const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set());

  const remaining = user?.plan === 'FREE' ? Math.max(0, FREE_LIMIT - (user?.monthlyUsage ?? 0)) : null;

  const applyExample = (ex: typeof EXAMPLE_PROFILES[0] | typeof PLAN_EXAMPLES[0]) => {
    setProfession(ex.profession);
    setBudget(ex.budget);
    setLanguage(ex.language);
    if ('goals' in ex) setGoals(ex.goals);
    if ('destination' in ex) setDestination(ex.destination);
    setError('');
  };

  const switchType = (t: AnalysisType) => {
    setAnalysisType(t);
    setCountryResult(null);
    setPlanResult(null);
    setError('');
    setLimitReached(false);
    setCheckedItems(new Set());
  };

  const analyze = async () => {
    if (!profession.trim()) { setError('Enter your profession'); return; }
    if (!budget.trim()) { setError('Enter your monthly budget'); return; }
    if (analysisType === 'country' && !goals.trim()) { setError('Describe your relocation goals'); return; }
    if (analysisType === 'plan' && !destination.trim()) { setError('Enter your destination country'); return; }

    setError('');
    setLimitReached(false);
    setLoading(true);
    setCountryResult(null);
    setPlanResult(null);
    setCheckedItems(new Set());

    try {
      const data = await api.post<{ type: string; result: CountryResult | PlanResult }>('/api/ai/relocate', {
        type: analysisType,
        profession: profession.trim(),
        budget: budget.trim(),
        language,
        goals: goals.trim(),
        destination: destination.trim(),
      });
      if (data.type === 'plan') {
        setPlanResult(data.result as PlanResult);
      } else {
        setCountryResult(data.result as CountryResult);
      }
      await refreshUser();
    } catch (err: any) {
      if (err?.data?.error === 'FREE_LIMIT_REACHED') {
        setLimitReached(true);
      } else {
        setError(err.message || 'Analysis failed. Try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleCheck = (i: number) =>
    setCheckedItems((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {(limitReached || remaining === 0) && (
        <div className="mb-6 p-4 rounded-xl bg-amber-900/20 border border-amber-700/40 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-amber-300 font-medium text-sm">Monthly limit reached</p>
            <p className="text-amber-400/70 text-xs mt-0.5">
              Free plan: {FREE_LIMIT} analyses/month. Upgrade to Pro for unlimited.
            </p>
          </div>
          <Link href="/dashboard/billing" className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 rounded-lg text-xs font-semibold text-white whitespace-nowrap transition-colors">
            Upgrade →
          </Link>
        </div>
      )}

      <div className="bg-[#161a22] rounded-xl overflow-hidden mb-6 shadow-xl shadow-black/20">
        <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-indigo-400" />
            <h2 className="font-semibold">Your relocation profile</h2>
          </div>
          {remaining !== null && (
            <span className="text-xs text-slate-500">{remaining}/{FREE_LIMIT} analyses remaining</span>
          )}
        </div>

        <div className="px-5 pt-5">
          {/* Mode selector */}
          <div className="mb-5">
            <label className="block text-xs text-slate-500 mb-2">Analysis type</label>
            <div className="flex gap-2">
              <button
                onClick={() => switchType('country')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  analysisType === 'country'
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                    : 'bg-white/[0.05] text-slate-400 hover:text-white hover:bg-white/[0.09]'
                }`}
              >
                <Globe className="w-4 h-4" />
                Country Analysis
              </button>
              <button
                onClick={() => switchType('plan')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  analysisType === 'plan'
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                    : 'bg-white/[0.05] text-slate-400 hover:text-white hover:bg-white/[0.09]'
                }`}
              >
                <Route className="w-4 h-4" />
                Relocation Plan
              </button>
            </div>
            <p className="text-xs text-slate-600 mt-2">
              {analysisType === 'country'
                ? 'Find the 5 best countries for your profile — ranked by fit, visa, cost, and quality of life.'
                : 'Get a detailed step-by-step relocation plan for a specific destination country.'}
            </p>
          </div>

          {/* Example prompts */}
          <div className="mb-5">
            <div className="flex items-center gap-1.5 mb-2">
              <Lightbulb className="w-3.5 h-3.5 text-slate-500" />
              <p className="text-xs text-slate-500">Try an example</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {(analysisType === 'country' ? EXAMPLE_PROFILES : PLAN_EXAMPLES).map((ex) => (
                <button
                  key={ex.profession + ('destination' in ex ? ex.destination : '')}
                  onClick={() => applyExample(ex)}
                  className="px-2.5 py-1 text-xs bg-white/[0.05] hover:bg-white/[0.09] rounded-lg text-slate-400 hover:text-white transition-colors"
                >
                  {'destination' in ex ? `${ex.profession} → ${ex.destination}` : ex.profession}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs text-slate-500 mb-1.5">Profession / Job title *</label>
              <input
                value={profession} onChange={(e) => setProfession(e.target.value)}
                placeholder="e.g. Software Engineer, Freelancer"
                className="w-full px-3 py-2 bg-[#0d0f14] border border-white/8 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 text-sm transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1.5">Monthly budget *</label>
              <input
                value={budget} onChange={(e) => setBudget(e.target.value)}
                placeholder="e.g. $2,000–3,000/month"
                className="w-full px-3 py-2 bg-[#0d0f14] border border-white/8 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 text-sm transition-colors"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-xs text-slate-500 mb-1.5">Working language</label>
            <select
              value={language} onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-3 py-2 bg-[#0d0f14] border border-white/8 rounded-lg text-white focus:outline-none focus:border-indigo-500 text-sm transition-colors"
            >
              {LANGUAGE_OPTIONS.map((l) => <option key={l}>{l}</option>)}
            </select>
          </div>

          {analysisType === 'plan' ? (
            <div className="mb-5">
              <label className="block text-xs text-slate-500 mb-1.5">Destination country *</label>
              <input
                value={destination} onChange={(e) => setDestination(e.target.value)}
                placeholder="e.g. Portugal, UAE, Thailand, Georgia"
                className="w-full px-3 py-2 bg-[#0d0f14] border border-white/8 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 text-sm transition-colors"
              />
            </div>
          ) : (
            <div className="mb-5">
              <label className="block text-xs text-slate-500 mb-1.5">Relocation goals *</label>
              <textarea
                value={goals} onChange={(e) => setGoals(e.target.value)} rows={3}
                placeholder="e.g. Low income tax, warm climate, good healthcare, EU residency, English-speaking community, safe for family..."
                className="w-full px-3 py-2 bg-[#0d0f14] border border-white/8 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 text-sm resize-none transition-colors"
              />
            </div>
          )}

          {error && <p className="text-red-400 text-sm mb-3">{error}</p>}

          <div className="pb-5">
            <button
              onClick={analyze}
              disabled={loading || remaining === 0}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-semibold text-sm transition-colors"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : analysisType === 'plan' ? <Route className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
              {loading
                ? (analysisType === 'plan' ? 'Building plan…' : 'Analyzing…')
                : (analysisType === 'plan' ? 'Build my relocation plan' : 'Find my best countries')}
            </button>
          </div>
        </div>
      </div>

      {loading && (
        <div className="bg-[#161a22] rounded-xl p-8 text-center shadow-xl shadow-black/20">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-400 mx-auto mb-4" />
          {analysisType === 'plan' ? (
            <>
              <p className="text-slate-300 font-medium">Building your personalized relocation plan…</p>
              <p className="text-slate-500 text-sm mt-1">Checking visa requirements, costs, and local conditions</p>
            </>
          ) : (
            <>
              <p className="text-slate-300 font-medium">Analyzing 195 countries for your profile…</p>
              <p className="text-slate-500 text-sm mt-1">Checking visas, costs, tax regimes, and quality of life</p>
            </>
          )}
        </div>
      )}

      {countryResult && !loading && (
        <div className="space-y-6">
          <div className="p-5 bg-indigo-900/15 rounded-xl">
            <p className="text-xs text-indigo-400 uppercase tracking-wider mb-2">Personalized summary</p>
            <p className="text-slate-200 leading-relaxed">{countryResult.summary}</p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Top {countryResult.countries.length} countries for you
            </h3>
            <div className="space-y-3">
              {countryResult.countries.map((country, i) => (
                <CountryCard key={country.name} country={country} rank={i} />
              ))}
            </div>
          </div>

          <div className="bg-[#161a22] rounded-xl overflow-hidden shadow-xl shadow-black/20">
            <div className="px-5 py-4 border-b border-white/5">
              <h3 className="font-semibold text-sm">Your relocation roadmap</h3>
            </div>
            <div className="p-5">
              <div className="space-y-3">
                {countryResult.plan.map((step, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-indigo-900/60 flex items-center justify-center text-xs font-bold text-indigo-300 shrink-0">
                      {i + 1}
                    </div>
                    <p className="text-sm text-slate-300 pt-0.5">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-[#161a22] rounded-xl overflow-hidden shadow-xl shadow-black/20">
            <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
              <h3 className="font-semibold text-sm">Pre-move checklist</h3>
              <span className="text-xs text-slate-500">
                {checkedItems.size}/{countryResult.checklist.length} done
              </span>
            </div>
            <div className="p-5">
              <div className="space-y-2">
                {countryResult.checklist.map((item, i) => (
                  <button
                    key={i} onClick={() => toggleCheck(i)}
                    className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-white/[0.04] transition-colors text-left"
                  >
                    <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                      checkedItems.has(i) ? 'bg-green-600 border-green-600' : 'border-white/20'
                    }`}>
                      {checkedItems.has(i) && <CheckCircle2 className="w-3 h-3 text-white" />}
                    </div>
                    <span className={`text-sm ${checkedItems.has(i) ? 'line-through text-slate-600' : 'text-slate-300'}`}>
                      {item}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {planResult && !loading && <PlanResults plan={planResult} />}
    </div>
  );
}
