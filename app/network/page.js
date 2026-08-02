'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import SiteNav from '../../components/SiteNav';
import OpsBoard from '../../components/OpsBoard';

export default function NetworkPage() {
  const [ports, setPorts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);

  useEffect(() => {
    fetch('/api/ports').then((r) => r.json()).then((d) => setPorts(d.ports || []));
    fetch('/api/suppliers').then((r) => r.json()).then((d) => setSuppliers(d.suppliers || []));
  }, []);

  const byCountry = suppliers.reduce((acc, s) => {
    const key = s.country || 'Other';
    acc[key] = acc[key] || [];
    acc[key].push(s);
    return acc;
  }, {});

  return (
    <main className="min-h-screen bg-paper">
      <SiteNav />
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-10">
        <p className="font-mono text-xs tracking-wideish text-navy mb-2">SUPPLY NETWORK</p>
        <h1 className="font-display text-2xl sm:text-3xl text-charcoal mb-2">Ports, suppliers, and live conditions.</h1>
        <p className="text-sm text-slateline max-w-2xl mb-8">
          The network Meridian monitors for this demo: twelve ports across Australia and Asia-Pacific,
          and the semiconductor suppliers and freight accounts that depend on them.
        </p>

        <div className="grid lg:grid-cols-[1fr_360px] gap-6 items-start">
          <div className="space-y-3">
            <p className="font-mono text-[11px] tracking-wideish text-slateline mb-1">SUPPLIERS BY COUNTRY</p>
            {Object.entries(byCountry).map(([country, list]) => (
              <div key={country} className="border border-hairline rounded-lg overflow-hidden">
                <div className="px-4 py-2.5 bg-[#FAFAFA] border-b border-hairline text-sm font-medium text-charcoal">
                  {country} <span className="text-slateline/50 font-normal">· {list.length} supplier{list.length === 1 ? '' : 's'}</span>
                </div>
                <div className="divide-y divide-hairline">
                  {list.map((s) => (
                    <div key={s.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 text-sm">
                      <div>
                        <span className="text-charcoal font-medium">{s.name}</span>
                        <span className="text-slateline/60 text-xs ml-2">{s.port?.name}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs font-mono text-slateline/70">
                        <span>risk {s.risk_score ?? '—'}</span>
                        <span>capacity {s.capacity_utilization ?? '—'}%</span>
                        <span className="capitalize">{s.dependency_level}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {!suppliers.length && <p className="text-sm text-slateline/60">Loading suppliers…</p>}
          </div>

          <div className="space-y-4">
            <OpsBoard />
            <Link
              href="/dashboard"
              className="block text-center border border-hairline text-sm font-medium px-4 py-2.5 rounded-md text-charcoal hover:bg-black/5 transition-colors"
            >
              Open live conditions assessment tool
            </Link>
          </div>
        </div>

        <div className="mt-10">
          <p className="font-mono text-[11px] tracking-wideish text-slateline mb-3">ALL MONITORED PORTS</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {ports.map((p) => (
              <div key={p.code} className="border border-hairline rounded-lg p-4">
                <p className="font-mono text-xs text-slateline/60">{p.code} · {p.state}</p>
                <p className="text-sm font-medium text-charcoal mt-1">{p.name}</p>
                <p className="text-xs text-slateline/70 mt-1">{p.primary_cargo}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
