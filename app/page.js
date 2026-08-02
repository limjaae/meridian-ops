'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import SiteNav from '../components/SiteNav';
import OntologyDiagram from '../components/OntologyDiagram';

const currency = (n) =>
  new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD', maximumFractionDigits: 0, notation: 'compact' }).format(n || 0);

const SEVERITY_STYLE = {
  critical: 'bg-rust/10 text-rust border-rust/30',
  high: 'bg-brass/10 text-brass border-brass/30',
  medium: 'bg-navy/10 text-navy border-navy/30',
  low: 'bg-moss/10 text-moss border-moss/30',
};

export default function MissionControlPage() {
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

  const activeIncidents = incidents.filter((i) => i.status === 'active');
  const totalExposure = activeIncidents.reduce((s, i) => s + (i.financial_exposure_aud || 0), 0);
  const totalSuppliers = activeIncidents.reduce((s, i) => s + (i.affected_supplier_count || 0), 0);

  return (
    <main className="min-h-screen bg-paper">
      <SiteNav />

      {/* Mission Control */}
      <section className="max-w-6xl mx-auto px-5 sm:px-8 pt-10 sm:pt-14 pb-10">
        <p className="font-mono text-xs tracking-wideish text-navy mb-2">GLOBAL SUPPLY NETWORK STATUS</p>
        <h1 className="font-display font-medium text-3xl sm:text-4xl text-charcoal max-w-2xl leading-tight">
          What operational problems require attention right now?
        </h1>

        <div className="mt-8 grid sm:grid-cols-3 gap-4">
          <StatCard label="CRITICAL EVENTS" value={loading ? '—' : activeIncidents.length} accent="rust" />
          <StatCard label="FINANCIAL EXPOSURE" value={loading ? '—' : currency(totalExposure)} accent="brass" />
          <StatCard label="SUPPLIERS AFFECTED" value={loading ? '—' : totalSuppliers} accent="navy" />
        </div>

        <div className="mt-8 border border-hairline rounded-lg overflow-hidden">
          <div className="px-5 py-3 border-b border-hairline bg-[#FAFAFA]">
            <p className="font-mono text-[11px] tracking-wideish text-slateline">PRIORITY ACTIONS</p>
          </div>
          <div className="divide-y divide-hairline">
            {loading && <div className="px-5 py-6 text-sm text-slateline/60">Loading incidents…</div>}
            {!loading && activeIncidents.length === 0 && (
              <div className="px-5 py-6 text-sm text-slateline/60">No active incidents. All clear.</div>
            )}
            {activeIncidents.map((inc, i) => (
              <Link
                key={inc.id}
                href={`/incidents/${inc.id}`}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-5 py-4 hover:bg-black/[0.02] transition-colors"
              >
                <div className="flex items-start gap-3">
                  <span className="font-mono text-xs text-slateline/50 pt-0.5">{i + 1}.</span>
                  <div>
                    <p className="text-sm font-medium text-charcoal">{inc.title}</p>
                    <p className="text-xs text-slateline/70 mt-0.5">
                      {currency(inc.financial_exposure_aud)} exposure · {inc.affected_supplier_count} suppliers affected · response required within {inc.response_deadline_hours}h
                    </p>
                  </div>
                </div>
                <span className={`text-[11px] font-mono px-2 py-1 rounded border capitalize shrink-0 ${SEVERITY_STYLE[inc.severity] || ''}`}>
                  {inc.severity}
                </span>
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/demo" className="bg-navy text-white text-sm font-medium px-4 py-2.5 rounded-md hover:bg-navyLight transition-colors">
            Walk through the demo scenario
          </Link>
          <Link href="/network" className="border border-hairline text-sm font-medium px-4 py-2.5 rounded-md text-charcoal hover:bg-black/5 transition-colors">
            View supply network
          </Link>
        </div>
      </section>

      {/* Positioning */}
      <section className="border-y border-hairline bg-[#FAFAFA]">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-14">
          <p className="font-mono text-xs tracking-wideish text-navy mb-3">WHAT MERIDIAN IS</p>
          <h2 className="font-display text-2xl sm:text-3xl text-charcoal max-w-3xl leading-snug">
            A platform that helps organisations detect operational risk, understand its impact, and
            coordinate a response across a complex supply network — not another dashboard.
          </h2>
          <p className="mt-3 text-sm text-slateline max-w-2xl">Turning operational complexity into coordinated action.</p>
        </div>
      </section>

      {/* Personas */}
      <section className="max-w-6xl mx-auto px-5 sm:px-8 py-14">
        <p className="font-mono text-xs tracking-wideish text-navy mb-5">WHO THIS IS BUILT FOR</p>
        <div className="grid md:grid-cols-2 gap-6">
          <PersonaCard
            name="Sarah Chen"
            title="Supply Chain Operations Director"
            goals={['Prevent production delays', 'Understand risks early', 'Coordinate teams']}
            pains={['Data exists across 15 systems', 'Analysts manually build reports', 'Decisions need multiple meetings']}
            metric="Reduce disruption response time by 50%"
          />
          <PersonaCard
            name="Daniel Wong"
            title="Supply Chain Analyst"
            goals={['Investigate disruptions', 'Identify root causes', 'Recommend actions']}
            pains={['Data fragmentation across systems', 'Lack of end-to-end visibility']}
            metric="Cut root-cause investigation time from days to hours"
          />
        </div>
      </section>

      {/* Ontology */}
      <section className="border-y border-hairline bg-[#FAFAFA]">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-14">
          <p className="font-mono text-xs tracking-wideish text-navy mb-3">THE DATA MODEL</p>
          <h2 className="font-display text-2xl text-charcoal max-w-2xl mb-6">
            Operations as connected entities, not disconnected tables.
          </h2>
          <div className="bg-white border border-hairline rounded-lg p-5 overflow-x-auto">
            <OntologyDiagram />
          </div>
          <p className="mt-4 text-sm text-slateline max-w-2xl">
            Every incident, decision, and outcome traces back through this ontology — a supplier
            provides a product, shipped through a port, affected by a disruption, requiring a
            human decision. That connective structure is what lets Meridian explain impact instead
            of just reporting it.
          </p>
        </div>
      </section>

      {/* Impact simulation */}
      <section className="max-w-6xl mx-auto px-5 sm:px-8 py-14">
        <p className="font-mono text-xs tracking-wideish text-navy mb-5">ILLUSTRATIVE IMPACT MODEL</p>
        <div className="grid sm:grid-cols-2 gap-6">
          <div className="border border-hairline rounded-lg p-6">
            <p className="font-mono text-[11px] tracking-wideish text-slateline mb-4">BEFORE</p>
            <MetricRow label="Average disruption detection" value="14 days" />
            <MetricRow label="Manual analysis effort" value="~40 hours" />
          </div>
          <div className="border border-hairline rounded-lg p-6 bg-moss/5">
            <p className="font-mono text-[11px] tracking-wideish text-moss mb-4">WITH MERIDIAN</p>
            <MetricRow label="Detection" value="~2 hours" />
            <MetricRow label="Investigation" value="~5 hours" />
            <MetricRow label="Estimated avoided disruption cost" value="$2.8M" highlight />
          </div>
        </div>
        <p className="mt-3 text-xs text-slateline/60 max-w-2xl">
          Illustrative planning figures based on the demo scenario, not a measured customer result.
        </p>
      </section>

      <footer className="border-t border-hairline">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-xs text-slateline/60">Meridian Operations · Turning operational complexity into coordinated action.</p>
          <Link href="/dashboard" className="text-xs text-slateline hover:text-charcoal underline underline-offset-4">
            Live port-weather assessment tool →
          </Link>
        </div>
      </footer>
    </main>
  );
}

function StatCard({ label, value, accent }) {
  const accentClass = { rust: 'text-rust', brass: 'text-brass', navy: 'text-navy' }[accent] || 'text-charcoal';
  return (
    <div className="border border-hairline rounded-lg p-5">
      <p className="font-mono text-[11px] tracking-wideish text-slateline mb-2">{label}</p>
      <p className={`font-display text-3xl ${accentClass}`}>{value}</p>
    </div>
  );
}

function PersonaCard({ name, title, goals, pains, metric }) {
  return (
    <div className="border border-hairline rounded-lg p-6">
      <h3 className="font-display text-lg text-charcoal">{name}</h3>
      <p className="text-xs text-slateline/70 mb-4">{title}</p>
      <p className="font-mono text-[10px] tracking-wideish text-navy mb-1.5">GOALS</p>
      <ul className="text-sm text-charcoal mb-4 space-y-1">
        {goals.map((g) => (
          <li key={g} className="flex gap-2"><span className="text-slateline/40">—</span>{g}</li>
        ))}
      </ul>
      <p className="font-mono text-[10px] tracking-wideish text-rust mb-1.5">PAIN POINTS</p>
      <ul className="text-sm text-charcoal mb-4 space-y-1">
        {pains.map((p) => (
          <li key={p} className="flex gap-2"><span className="text-slateline/40">—</span>{p}</li>
        ))}
      </ul>
      <p className="font-mono text-[10px] tracking-wideish text-moss mb-1">SUCCESS METRIC</p>
      <p className="text-sm text-charcoal">{metric}</p>
    </div>
  );
}

function MetricRow({ label, value, highlight }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-sm text-slateline">{label}</span>
      <span className={`font-display text-base ${highlight ? 'text-moss' : 'text-charcoal'}`}>{value}</span>
    </div>
  );
}
