'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import SiteNav from '../../components/SiteNav';

const currency = (n) =>
  new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD', maximumFractionDigits: 0 }).format(n || 0);

const STEPS = [
  { key: 'detect', label: 'Disruption detected' },
  { key: 'network', label: 'Affected network identified' },
  { key: 'impact', label: 'Business impact calculated' },
  { key: 'options', label: 'Response options evaluated' },
  { key: 'brief', label: 'Executive briefing generated' },
];

export default function DemoPage() {
  const [data, setData] = useState(null);
  const [step, setStep] = useState(0);

  useEffect(() => {
    // Incident 1 is the marquee Shanghai / semiconductor scenario seeded for this demo.
    fetch('/api/incidents/1')
      .then((r) => r.json())
      .then(setData);
  }, []);

  const incident = data?.incident;

  return (
    <main className="min-h-screen bg-paper">
      <SiteNav />
      <div className="max-w-3xl mx-auto px-5 sm:px-8 py-10">
        <p className="font-mono text-xs tracking-wideish text-navy mb-2">DEMO MODE — NO LOGIN REQUIRED</p>
        <h1 className="font-display text-2xl sm:text-3xl text-charcoal mb-2">Asia-Pacific Semiconductor Crisis</h1>
        <p className="text-sm text-slateline max-w-2xl mb-8">
          A guided walkthrough of how Meridian moves from a live disruption to a coordinated,
          human-approved response.
        </p>

        {/* Stepper */}
        <div className="flex items-center gap-1 mb-8 overflow-x-auto no-scrollbar">
          {STEPS.map((s, i) => (
            <button
              key={s.key}
              onClick={() => setStep(i)}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-xs font-mono whitespace-nowrap transition-colors ${
                i === step ? 'bg-navy text-white' : i < step ? 'bg-moss/10 text-moss' : 'bg-black/5 text-slateline'
              }`}
            >
              <span>{i + 1}</span> {s.label}
            </button>
          ))}
        </div>

        {!data && <p className="text-sm text-slateline/60">Loading scenario…</p>}

        {data && (
          <div className="border border-hairline rounded-lg p-6 min-h-[280px]">
            {step === 0 && (
              <div>
                <p className="font-mono text-[11px] tracking-wideish text-rust mb-3">STEP 1 · DISRUPTION DETECTED</p>
                <p className="font-display text-xl text-charcoal mb-2">{incident.title}</p>
                <p className="text-sm text-slateline">{incident.root_cause}</p>
                <p className="text-xs text-slateline/60 mt-3 font-mono">Severity: {incident.severity} · Response required within {incident.response_deadline_hours}h</p>
              </div>
            )}

            {step === 1 && (
              <div>
                <p className="font-mono text-[11px] tracking-wideish text-rust mb-3">STEP 2 · AFFECTED NETWORK IDENTIFIED</p>
                <div className="grid sm:grid-cols-3 gap-4 mb-4">
                  <MiniStat value={incident.affected_supplier_count} label="suppliers" />
                  <MiniStat value={incident.affected_shipment_count} label="shipments" />
                  <MiniStat value={data.affectedSuppliers?.filter((s) => s.country === 'Taiwan').length || 0} label="Taiwan-based" />
                </div>
                <p className="text-sm text-slateline">
                  Meridian traces the ontology from the disrupted port through every dependent
                  supplier and product line, rather than relying on someone remembering who is exposed.
                </p>
              </div>
            )}

            {step === 2 && (
              <div>
                <p className="font-mono text-[11px] tracking-wideish text-rust mb-3">STEP 3 · BUSINESS IMPACT CALCULATED</p>
                <p className="font-display text-3xl text-rust mb-2">{currency(incident.financial_exposure_aud)}</p>
                <p className="text-sm text-slateline">estimated exposure across {incident.affected_supplier_count} suppliers and {incident.affected_shipment_count} shipments, over an expected {incident.expected_duration_days}-day disruption window.</p>
              </div>
            )}

            {step === 3 && (
              <div>
                <p className="font-mono text-[11px] tracking-wideish text-rust mb-3">STEP 4 · RESPONSE OPTIONS EVALUATED</p>
                <div className="space-y-2">
                  {data.options?.map((o) => (
                    <div key={o.id} className="flex flex-wrap items-center justify-between gap-2 border border-hairline rounded-md p-3 text-sm">
                      <span className="text-charcoal">{o.label}</span>
                      <span className="font-mono text-xs text-slateline/70">+{currency(o.cost_impact_aud)} · +{o.delay_impact_days}d</span>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-slateline mt-3">A human owner selects and approves the action — Meridian doesn&apos;t decide automatically.</p>
              </div>
            )}

            {step === 4 && (
              <div>
                <p className="font-mono text-[11px] tracking-wideish text-rust mb-3">STEP 5 · EXECUTIVE BRIEFING GENERATED</p>
                <div className="bg-[#FAFAFA] border border-hairline rounded-lg p-5 font-mono text-sm text-charcoal leading-relaxed">
                  <p className="text-slateline/60 mb-2">EXECUTIVE BRIEF</p>
                  <p className="mb-2"><span className="text-slateline/60">Situation:</span> {incident.location} disruption affecting semiconductor imports.</p>
                  <p className="mb-2"><span className="text-slateline/60">Business impact:</span> {currency(incident.financial_exposure_aud)} estimated exposure.</p>
                  <p><span className="text-slateline/60">Recommended action:</span> Activate alternative supplier network; escalate to Decision Register for owner approval.</p>
                </div>
                <Link href={`/incidents/1`} className="inline-block mt-4 text-sm text-navy underline underline-offset-4">
                  Open the full incident workspace →
                </Link>
              </div>
            )}
          </div>
        )}

        <div className="mt-6 flex justify-between">
          <button
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className="text-sm px-4 py-2 rounded-md border border-hairline disabled:opacity-40 text-charcoal"
          >
            Back
          </button>
          <button
            onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
            disabled={step === STEPS.length - 1}
            className="text-sm px-4 py-2 rounded-md bg-navy text-white disabled:opacity-40"
          >
            Next step
          </button>
        </div>
      </div>
    </main>
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
