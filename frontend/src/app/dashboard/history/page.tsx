'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { History, MapPin, X, Loader2, ArrowRight, CheckCircle2 } from 'lucide-react';
import { api } from '@/lib/api';

interface HistoryItem {
  id: string;
  profession: string;
  budget: string | null;
  createdAt: string;
  tokens: number;
}

interface HistoryDetail {
  id: string;
  input: { profession: string; budget: string; language: string; goals: string };
  result: {
    summary: string;
    countries: Array<{
      name: string;
      flag: string;
      score: number;
      reasons: string[];
      visa: string;
      cost: string;
    }>;
    plan: string[];
    checklist: string[];
  };
  createdAt: string;
  tokens: number;
}

export default function HistoryPage() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<HistoryDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    api.get<{ history: HistoryItem[] }>('/api/ai/history')
      .then((d) => setItems(d.history))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const openDetail = async (id: string) => {
    setLoadingDetail(true);
    try {
      const data = await api.get<HistoryDetail>(`/api/ai/history/${id}`);
      setSelected(data);
    } catch {}
    setLoadingDetail(false);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 flex justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <History className="w-5 h-5 text-slate-400" />
        <h1 className="text-xl font-bold">Analysis History</h1>
        <span className="text-sm text-slate-500">({items.length})</span>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-20">
          <MapPin className="w-10 h-10 text-slate-700 mx-auto mb-3" />
          <p className="text-slate-500 mb-4">No analyses yet</p>
          <Link href="/dashboard" className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-semibold transition-colors">
            Run your first analysis
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <button
              key={item.id} onClick={() => openDetail(item.id)}
              className="w-full flex items-center justify-between p-4 bg-[#161a22] hover:bg-[#1e2330] rounded-xl transition-all text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-900/40 flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-indigo-400" />
                </div>
                <div>
                  <p className="font-medium text-sm">{item.profession}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {item.budget && `${item.budget} · `}
                    {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    {item.tokens ? ` · ${item.tokens.toLocaleString()} tokens` : ''}
                  </p>
                </div>
              </div>
              <span className="text-xs text-indigo-400">View →</span>
            </button>
          ))}
        </div>
      )}

      {/* Detail modal */}
      {(selected || loadingDetail) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-[#161a22] rounded-2xl overflow-hidden flex flex-col max-h-[90vh] shadow-2xl shadow-black/50">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
              <h2 className="font-semibold">
                {selected ? `${selected.input?.profession}` : 'Loading…'}
              </h2>
              <button onClick={() => setSelected(null)} className="p-1 text-slate-500 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-y-auto px-6 py-5 flex-1">
              {loadingDetail ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
                </div>
              ) : selected ? (
                <div className="space-y-5">
                  {/* Input summary */}
                  <div className="p-3 bg-white/[0.04] rounded-lg text-xs text-slate-400 space-y-1">
                    <div><span className="text-slate-600">Budget:</span> {selected.input?.budget}</div>
                    <div><span className="text-slate-600">Language:</span> {selected.input?.language}</div>
                    <div><span className="text-slate-600">Goals:</span> {selected.input?.goals}</div>
                  </div>

                  {/* Summary */}
                  {selected.result?.summary && (
                    <p className="text-sm text-slate-300 leading-relaxed">{selected.result.summary}</p>
                  )}

                  {/* Countries */}
                  {selected.result?.countries?.map((c, i) => (
                    <div key={c.name} className="p-4 bg-white/[0.04] rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{c.flag}</span>
                          <span className="font-semibold text-sm">{i + 1}. {c.name}</span>
                        </div>
                        <span className="text-xs font-bold text-indigo-300">{c.score}/100</span>
                      </div>
                      <p className="text-xs text-slate-500 mb-1">Visa: {c.visa}</p>
                      <p className="text-xs text-slate-500">Cost: {c.cost}</p>
                      <div className="mt-2 space-y-0.5">
                        {c.reasons?.map((r) => (
                          <div key={r} className="flex items-start gap-1.5 text-xs text-slate-400">
                            <ArrowRight className="w-3 h-3 text-indigo-400 shrink-0 mt-0.5" />{r}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  {/* Checklist */}
                  {selected.result?.checklist?.length > 0 && (
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Checklist</p>
                      {selected.result.checklist.map((item) => (
                        <div key={item} className="flex items-center gap-2 text-xs text-slate-400 py-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />{item}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
