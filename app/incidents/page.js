'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import SiteNav from '../../components/SiteNav';

const currency = (n) =>
  new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD', maximumFractionDigits: 0 }).format(n || 0);

const SEVERITY_STYLE = {
  critical: 'bg-rust/10 text-rust border-rust/30',
  high: 'bg-brass/10 text-brass border-brass/30',
  medium: 'bg-navy/10 text-navy border-navy/30',
  low: 'bg-moss/10 text-moss border-moss/30',
};

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/incidents')
      .then((r) => r.json())
      .then((d) => {
        setIncidents(d.incidents || []);
        setLoading(false);
      });
  }, []);

  return (
    <main className="min-h-screen bg-paper">
      <SiteNav />
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-10">
        <p className="font-mono text-xs tracking-wideish text-navy mb-2">INCIDENT WORKSPACE</p>
        <h1 className="font-display text-2xl sm:text-3xl text-charcoal mb-2">Disruption events across the network.</h1>
        <p className="text-sm text-slateline max-w-2xl mb-8">
          Each incident carries its root cause, quantified impact, response options, and an
          actions checklist. Open one to investigate and log a decision.
        </p>

        <div className="space-y-3">
          {loading && <p className="text-sm text-slateline/60">Loading incidents…</p>}
          {incidents.map((inc) => (
            <Link
              key={inc.id}
              href={`/incidents/${inc.id}`}
              className="block border border-hairline rounded-lg p-5 hover:bg-black/[0.02] transition-colors"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-display text-lg text-charcoal">{inc.title}</p>
                  <p className="text-xs text-slateline/70 mt-1">{inc.location} · {inc.port?.code}</p>
                </div>
                <span className={`text-[11px] font-mono px-2 py-1 rounded border capitalize shrink-0 ${SEVERITY_STYLE[inc.severity] || ''}`}>
                  {inc.severity}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-xs font-mono text-slateline/70">
                <span>{currency(inc.financial_exposure_aud)} exposure</span>
                <span>{inc.affected_supplier_count} suppliers</span>
                <span>{inc.affected_shipment_count} shipments</span>
                <span className="capitalize">{inc.status}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
