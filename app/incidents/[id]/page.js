'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import SiteNav from '../../../components/SiteNav';

const currency = (n) =>
  new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD', maximumFractionDigits: 0 }).format(n || 0);

export default function IncidentWorkspacePage({ params }) {
  const { id } = params;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState(null);
  const [owner, setOwner] = useState('Sarah Chen — Supply Chain Operations Director');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [decisionLogged, setDecisionLogged] = useState(false);

  function load() {
    fetch(`/api/incidents/${id}`)
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      });
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function toggleAction(action) {
    await fetch(`/api/actions/${action.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ done: !action.done }),
    });
    load();
  }

  async function submitDecision() {
    if (!selectedOption || !reason.trim()) return;
    setSubmitting(true);
    try {
      await fetch('/api/decisions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          incidentId: Number(id),
          owner,
          optionSelected: selectedOption.label,
          expectedCostAud: selectedOption.cost_impact_aud,
          expectedDelayDays: selectedOption.delay_impact_days,
          businessReason: reason,
        }),
      });
      setDecisionLogged(true);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-paper">
        <SiteNav />
        <div className="max-w-4xl mx-auto px-5 sm:px-8 py-16 text-sm text-slateline/60">Loading incident…</div>
      </main>
    );
  }

  if (!data || data.error) {
    return (
      <main className="min-h-screen bg-paper">
        <SiteNav />
        <div className="max-w-4xl mx-auto px-5 sm:px-8 py-16 text-sm text-rust">Incident not found.</div>
      </main>
    );
  }

  const { incident, options, actions, affectedSuppliers } = data;

  return (
    <main className="min-h-screen bg-paper">
      <SiteNav />
      <div className="max-w-4xl mx-auto px-5 sm:px-8 py-10">
        <Link href="/incidents" className="text-xs text-slateline hover:text-charcoal underline underline-offset-4">
          ← All incidents
        </Link>

        <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
          <h1 className="font-display text-2xl sm:text-3xl text-charcoal">{incident.title}</h1>
          <span className="text-[11px] font-mono px-2 py-1 rounded border capitalize bg-rust/10 text-rust border-rust/30 shrink-0">
            {incident.severity}
          </span>
        </div>
        <p className="text-sm text-slateline mt-2">{incident.location}</p>

        {/* Root cause */}
        <Section title="ROOT CAUSE">
          <p className="text-sm text-charcoal">{incident.root_cause}</p>
        </Section>

        {/* Impact */}
        <Section title="IMPACT">
          <div className="grid sm:grid-cols-3 gap-4">
            <MiniStat value={incident.affected_supplier_count} label="suppliers" />
            <MiniStat value={incident.affected_shipment_count} label="shipments" />
            <MiniStat value={currency(incident.financial_exposure_aud)} label="exposure" />
          </div>
          <p className="text-sm text-slateline mt-4">{incident.description}</p>
        </Section>

        {/* Affected suppliers */}
        <Section title="AFFECTED SUPPLIERS">
          <div className="divide-y divide-hairline">
            {affectedSuppliers.map((s) => (
              <div key={s.id} className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm">
                <span className="text-charcoal">{s.name} <span className="text-slateline/50 text-xs">({s.country})</span></span>
                <span className="text-xs font-mono text-slateline/70">risk {s.risk_score} · capacity {s.capacity_utilization}%</span>
              </div>
            ))}
          </div>
        </Section>

        {/* Response options */}
        <Section title="RESPONSE OPTIONS">
          <div className="grid sm:grid-cols-2 gap-4">
            {options.map((opt) => {
              const active = selectedOption?.id === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => setSelectedOption(opt)}
                  className={`text-left border rounded-lg p-4 transition-colors ${
                    active ? 'border-navy bg-navy/5' : 'border-hairline hover:bg-black/[0.02]'
                  }`}
                >
                  <p className="text-sm font-medium text-charcoal mb-2">{opt.label}</p>
                  <div className="flex gap-4 text-xs font-mono text-slateline/70">
                    <span>+{currency(opt.cost_impact_aud)}</span>
                    <span>+{opt.delay_impact_days}d delay</span>
                  </div>
                  {opt.notes && <p className="text-xs text-slateline/60 mt-2">{opt.notes}</p>}
                </button>
              );
            })}
          </div>

          {selectedOption && !decisionLogged && (
            <div className="mt-5 border border-hairline rounded-lg p-4 bg-[#FAFAFA]">
              <p className="font-mono text-[11px] tracking-wideish text-navy mb-3">LOG DECISION</p>
              <label className="block text-xs text-slateline mb-1">Owner</label>
              <input
                value={owner}
                onChange={(e) => setOwner(e.target.value)}
                className="w-full mb-3 px-3 py-2 border border-hairline rounded-md text-sm"
              />
              <label className="block text-xs text-slateline mb-1">Business reason</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Why this option, over the alternatives?"
                rows={2}
                className="w-full mb-3 px-3 py-2 border border-hairline rounded-md text-sm"
              />
              <button
                onClick={submitDecision}
                disabled={submitting || !reason.trim()}
                className="bg-navy text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-navyLight disabled:opacity-50 transition-colors"
              >
                {submitting ? 'Logging…' : 'Select action & log decision'}
              </button>
            </div>
          )}

          {decisionLogged && (
            <div className="mt-5 border border-moss/30 bg-moss/10 rounded-lg p-4 text-sm text-moss">
              Decision logged to the register. <Link href="/decisions" className="underline underline-offset-4">View decision register →</Link>
            </div>
          )}
        </Section>

        {/* Incident actions checklist */}
        <Section title="ACTIONS">
          <div className="space-y-2">
            {actions.map((a) => (
              <label key={a.id} className="flex items-start gap-2.5 text-sm cursor-pointer">
                <input type="checkbox" checked={a.done} onChange={() => toggleAction(a)} className="mt-0.5" />
                <span className={a.done ? 'text-slateline/50 line-through' : 'text-charcoal'}>{a.description}</span>
              </label>
            ))}
          </div>
        </Section>
      </div>
    </main>
  );
}

function Section({ title, children }) {
  return (
    <div className="mt-8 pt-6 border-t border-hairline">
      <p className="font-mono text-[11px] tracking-wideish text-navy mb-3">{title}</p>
      {children}
    </div>
  );
}

function MiniStat({ value, label }) {
  return (
    <div>
      <p className="font-display text-2xl text-charcoal">{value}</p>
      <p className="text-xs text-slateline/70 mt-0.5">{label}</p>
    </div>
  );
}
