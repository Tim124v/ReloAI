'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CreditCard, CheckCircle2, Zap, Loader2, AlertCircle } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';

const FREE_LIMIT = 3;

function BillingContent() {
  const { user, refreshUser } = useAuth();
  const params = useSearchParams();
  const success = params?.get('success');
  const canceled = params?.get('canceled');
  const [loadingCheckout, setLoadingCheckout] = useState(false);
  const [loadingPortal, setLoadingPortal] = useState(false);
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    if (success) refreshUser();
  }, [success]);

  const startCheckout = async () => {
    setApiError('');
    setLoadingCheckout(true);
    try {
      const data = await api.post<{ url: string }>('/api/billing/create-checkout', {
        returnUrl: window.location.origin,
      });
      if (data.url) window.location.href = data.url;
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : 'Failed to start checkout. Make sure Stripe is configured.');
    } finally {
      setLoadingCheckout(false);
    }
  };

  const openPortal = async () => {
    setApiError('');
    setLoadingPortal(true);
    try {
      const data = await api.post<{ url: string }>('/api/billing/portal', {});
      if (data.url) window.location.href = data.url;
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : 'Failed to open billing portal.');
    } finally {
      setLoadingPortal(false);
    }
  };

  const isPro = user?.plan === 'PRO';
  const used = user?.monthlyUsage ?? 0;
  const usagePct = Math.min(100, (used / FREE_LIMIT) * 100);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <CreditCard className="w-5 h-5 text-slate-400" />
        <h1 className="text-xl font-bold">Billing & Plan</h1>
      </div>

      {success && (
        <div className="mb-6 p-4 rounded-xl bg-green-900/20 border border-green-700/40 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-400" />
          <p className="text-green-300 text-sm font-medium">Pro activated! Unlimited analyses unlocked.</p>
        </div>
      )}
      {canceled && (
        <div className="mb-6 p-4 rounded-xl bg-slate-800/50 border border-[#252d3d] flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-slate-400" />
          <p className="text-slate-400 text-sm">Checkout canceled. No charge was made.</p>
        </div>
      )}

      {/* Plan card */}
      <div className="p-6 bg-[#161a22] border border-[#252d3d] rounded-xl mb-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-sm text-slate-500 mb-1">Current plan</p>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">{isPro ? 'Pro' : 'Free'}</span>
              {isPro && (
                <span className="px-2 py-0.5 text-xs bg-indigo-900/50 border border-indigo-700/50 text-indigo-300 rounded-full">
                  Active
                </span>
              )}
            </div>
          </div>
          {isPro && (
            <div className="text-right">
              <p className="text-sm text-slate-500">Billing</p>
              <p className="font-semibold">$9 / month</p>
            </div>
          )}
        </div>

        {/* Usage meter (free only) */}
        {!isPro && (
          <div className="mb-5">
            <div className="flex justify-between text-xs text-slate-500 mb-1.5">
              <span>This month's usage</span>
              <span>{used}/{FREE_LIMIT} analyses</span>
            </div>
            <div className="h-1.5 bg-[#252d3d] rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  usagePct >= 100 ? 'bg-red-500' : usagePct >= 60 ? 'bg-amber-500' : 'bg-indigo-500'
                }`}
                style={{ width: `${usagePct}%` }}
              />
            </div>
            {used >= FREE_LIMIT && (
              <p className="text-xs text-red-400 mt-1.5">Limit reached — resets next month</p>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 mb-5">
          {(isPro
            ? ['Unlimited analyses', 'Full history', 'Priority processing', 'Cancel anytime']
            : [`${FREE_LIMIT} analyses/month`, 'Full history', 'All features included', 'Resets monthly']
          ).map((f) => (
            <div key={f} className="flex items-center gap-2 text-sm text-slate-400">
              <CheckCircle2 className={`w-4 h-4 shrink-0 ${isPro ? 'text-indigo-400' : 'text-slate-600'}`} />{f}
            </div>
          ))}
        </div>

        {apiError && (
          <div className="mb-4 p-3 rounded-lg bg-red-900/20 border border-red-700/50 text-red-400 text-sm">{apiError}</div>
        )}

        {isPro ? (
          <button
            onClick={openPortal} disabled={loadingPortal}
            className="flex items-center gap-2 px-4 py-2.5 border border-[#252d3d] hover:border-indigo-600 rounded-lg text-sm text-slate-300 hover:text-white transition-colors disabled:opacity-50"
          >
            {loadingPortal && <Loader2 className="w-4 h-4 animate-spin" />}
            Manage subscription
          </button>
        ) : (
          <button
            onClick={startCheckout} disabled={loadingCheckout}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-semibold text-sm transition-colors disabled:opacity-50"
          >
            {loadingCheckout ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
            {loadingCheckout ? 'Redirecting…' : 'Upgrade to Pro — $9/month'}
          </button>
        )}
      </div>

      {/* Pro features */}
      {!isPro && (
        <div className="p-5 bg-indigo-900/10 border border-indigo-700/30 rounded-xl">
          <p className="font-semibold mb-3 text-indigo-300 text-sm">Why upgrade to Pro?</p>
          <div className="space-y-2">
            {[
              'Unlimited analyses — no monthly cap, analyze as many profiles as you want',
              'Never lose momentum — plan multiple scenarios without waiting for reset',
              'Cancel anytime — no long-term commitment',
            ].map((f) => (
              <div key={f} className="flex items-start gap-2 text-sm text-slate-400">
                <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />{f}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function BillingPage() {
  return (
    <Suspense fallback={<div className="max-w-2xl mx-auto px-4 py-8"><Loader2 className="w-6 h-6 animate-spin text-indigo-400" /></div>}>
      <BillingContent />
    </Suspense>
  );
}
