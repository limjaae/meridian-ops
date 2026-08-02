'use client';

import { useEffect, useState } from 'react';
import SiteNav from '../../components/SiteNav';

const currency = (n) =>
  new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD', maximumFractionDigits: 0 }).format(n || 0);

export default function DecisionsPage() {
  const [decisions, setDecisions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/decisions')
      .then((r) => r.json())
      .then((d) => {
        setDecisions(d.decisions || []);
        setLoading(false);
      });
  }, []);

  return (
    <main className="min-h-screen bg-paper">
      <SiteNav />
      <div className="max-w-4xl mx-auto px-5 sm:px-8 py-10">
        <p className="font-mono text-xs tracking-wideish text-navy mb-2">DECISION REGISTER</p>
        <h1 className="font-display text-2xl sm:text-3xl text-charcoal mb-2">Every decision, with its reasoning, in one place.</h1>
        <p className="text-sm text-slateline max-w-2xl mb-8">
          Meridian doesn&apos;t make the call for you. It records who did, what they chose, and why,
          so the reasoning survives past the meeting where it happened.
        </p>

        <div className="space-y-3">
          {loading && <p className="text-sm text-slateline/60">Loading decisions…</p>}
          {!loading && decisions.length === 0 && <p className="text-sm text-slateline/60">No decisions logged yet.</p>}
          {decisions.map((d) => (
            <div key={d.id} className="border border-hairline rounded-lg p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs font-mono text-slateline/60">{d.incident?.title}</p>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded border capitalize bg-moss/10 text-moss border-moss/30">
                  {d.status}
                </span>
              </div>
              <p className="font-display text-lg text-charcoal mt-2">{d.option_selected}</p>
              <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs font-mono text-slateline/70 mt-2">
                <span>owner: {d.owner}</span>
                {d.expected_cost_aud != null && <span>{currency(d.expected_cost_aud)}</span>}
                {d.expected_delay_days != null && <span>{d.expected_delay_days}d delay</span>}
                <span>{new Date(d.created_at).toLocaleDateString('en-AU')}</span>
              </div>
              <p className="text-sm text-slateline mt-3">{d.business_reason}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
