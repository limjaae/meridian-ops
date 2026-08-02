'use client';

import { useEffect, useMemo, useState } from 'react';
import SiteNav from '../../components/SiteNav';

const RISK_COLORS = {
  low: { dot: '#4C7A63', text: 'text-moss', bg: 'bg-moss/10', border: 'border-moss/30' },
  medium: { dot: '#C08A3E', text: 'text-brass', bg: 'bg-brass/10', border: 'border-brass/30' },
  high: { dot: '#C4462B', text: 'text-rust', bg: 'bg-rust/10', border: 'border-rust/30' },
  critical: { dot: '#C4462B', text: 'text-rust', bg: 'bg-rust/15', border: 'border-rust/40' },
  unknown: { dot: '#5B6B7A', text: 'text-slateline', bg: 'bg-slateline/10', border: 'border-slateline/30' },
};

const currency = (n) =>
  new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD', maximumFractionDigits: 0 }).format(n || 0);

export default function DashboardPage() {
  const [ports, setPorts] = useState([]);
  const [selectedCode, setSelectedCode] = useState('');
  const [scenario, setScenario] = useState({ portClosure: false, demandSpike: false });
  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const [tab, setTab] = useState('assess');

  useEffect(() => {
    fetch('/api/ports')
      .then((r) => r.json())
      .then((d) => {
        setPorts(d.ports || []);
        if (d.ports?.length) setSelectedCode(d.ports[0].code);
      });
  }, []);

  useEffect(() => {
    if (tab === 'history') {
      fetch('/api/history')
        .then((r) => r.json())
        .then((d) => setHistory(d.entries || []));
    }
  }, [tab]);

  const selectedPort = useMemo(() => ports.find((p) => p.code === selectedCode), [ports, selectedCode]);

  async function runAssessment() {
    if (!selectedCode) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/assess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ portCode: selectedCode, scenario }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error || 'Assessment failed');
      setAssessment(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  const risk = assessment?.risk?.level ? RISK_COLORS[assessment.risk.level] : RISK_COLORS.unknown;

  return (
    <main className="min-h-screen bg-paper">
      <SiteNav />

      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-8 sm:py-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="font-mono text-xs tracking-wideish text-navy mb-2">LIVE CONDITIONS ASSESSMENT</p>
            <h1 className="font-display text-2xl text-charcoal">Weather-driven port risk assessment.</h1>
          </div>
          <div className="flex items-center gap-1 text-sm">
            <button
              onClick={() => setTab('assess')}
              className={`px-3 py-1.5 rounded-md transition-colors ${tab === 'assess' ? 'bg-navy text-white' : 'text-slateline hover:bg-black/5'}`}
            >
              Assess
            </button>
            <button
              onClick={() => setTab('history')}
              className={`px-3 py-1.5 rounded-md transition-colors ${tab === 'history' ? 'bg-navy text-white' : 'text-slateline hover:bg-black/5'}`}
            >
              History
            </button>
          </div>
        </div>
        {tab === 'assess' && (
          <div className="grid lg:grid-cols-[320px_1fr] gap-6">
            {/* Control panel */}
            <div className="bg-white/70 border border-black/10 rounded-lg p-5 h-fit">
              <p className="font-mono text-[11px] tracking-wideish text-brass mb-3">SELECT PORT</p>
              <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                {ports.map((p) => (
                  <button
                    key={p.code}
                    onClick={() => setSelectedCode(p.code)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                      selectedCode === p.code ? 'bg-ink text-fog' : 'hover:bg-black/5 text-slateline'
                    }`}
                  >
                    <span className="font-mono text-xs mr-2 opacity-70">{p.code}</span>
                    {p.name}
                  </button>
                ))}
                {!ports.length && <p className="text-xs text-slateline/60">Loading ports…</p>}
              </div>

              {selectedPort && (
                <div className="mt-4 pt-4 border-t border-black/10 text-xs text-slateline leading-relaxed">
                  <p><span className="text-ink font-medium">{selectedPort.state}</span> · {selectedPort.primary_cargo}</p>
                  <p className="mt-1.5">{selectedPort.description}</p>
                </div>
              )}

              <p className="font-mono text-[11px] tracking-wideish text-brass mt-6 mb-3">SCENARIO INPUTS</p>
              <label className="flex items-start gap-2 text-sm text-slateline mb-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="mt-0.5"
                  checked={scenario.portClosure}
                  onChange={(e) => setScenario((s) => ({ ...s, portClosure: e.target.checked }))}
                />
                Simulate full port closure
              </label>
              <label className="flex items-start gap-2 text-sm text-slateline cursor-pointer">
                <input
                  type="checkbox"
                  className="mt-0.5"
                  checked={scenario.demandSpike}
                  onChange={(e) => setScenario((s) => ({ ...s, demandSpike: e.target.checked }))}
                />
                Simulate demand spike
              </label>

              <button
                onClick={runAssessment}
                disabled={loading || !selectedCode}
                className="mt-6 w-full bg-brass hover:bg-brassLight disabled:opacity-50 text-ink font-medium text-sm py-2.5 rounded-md transition-colors"
              >
                {loading ? 'Running assessment…' : 'Run assessment'}
              </button>
              {error && <p className="mt-3 text-xs text-rust">{error}</p>}
            </div>

            {/* Results */}
            <div>
              {!assessment && !loading && (
                <div className="h-full min-h-[320px] flex items-center justify-center border border-dashed border-black/15 rounded-lg text-slateline/60 text-sm">
                  Select a port and run an assessment to see live conditions and modeled impact.
                </div>
              )}

              {assessment && (
                <div className="space-y-5">
                  {/* Risk banner */}
                  <div className={`rounded-lg border ${risk.border} ${risk.bg} p-5`}>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <span className="risk-dot" style={{ backgroundColor: risk.dot }} />
                        <span className={`font-display text-lg ${risk.text} capitalize`}>{assessment.risk.level} risk</span>
                        <span className="text-xs text-slateline/60 font-mono">score {assessment.risk.score}/100</span>
                      </div>
                      <span className="text-xs text-slateline/60 font-mono">
                        {assessment.port.name} · {assessment.port.code}
                      </span>
                    </div>
                    {assessment.risk.reasons.length > 0 && (
                      <ul className="mt-3 space-y-1 text-sm text-slateline">
                        {assessment.risk.reasons.map((r, i) => (
                          <li key={i} className="flex gap-2">
                            <span className="text-slateline/40">•</span> {r}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* Live conditions + predicted delay */}
                  <div className="grid sm:grid-cols-3 gap-4">
                    <MetricCard label="LIVE WIND GUST" value={`${Math.round(assessment.weather?.windGustKmh || 0)} km/h`} />
                    <MetricCard label="SIGNIFICANT WAVE" value={assessment.weather?.waveHeightM != null ? `${assessment.weather.waveHeightM.toFixed(1)} m` : '—'} />
                    <MetricCard label="PREDICTED DELAY" value={`${assessment.predictedDelayDays} days`} highlight />
                  </div>

                  {/* Impact panels */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="bg-steel rounded-lg p-5">
                      <p className="font-mono text-[11px] tracking-wideish text-brassLight mb-2">INVENTORY IMPACT</p>
                      <p className="font-display text-2xl text-fog">{assessment.inventory.affectedTeu.toLocaleString()} TEU</p>
                      <p className="text-xs text-white/50 mt-1">
                        exposed across {assessment.affectedSuppliers.length} account{assessment.affectedSuppliers.length === 1 ? '' : 's'} ·
                        assumes {assessment.inventory.safetyStockAssumptionDays}-day safety stock
                      </p>
                    </div>
                    <div className="bg-steel rounded-lg p-5">
                      <p className="font-mono text-[11px] tracking-wideish text-brassLight mb-2">ESTIMATED REVENUE IMPACT</p>
                      <p className="font-display text-2xl text-fog">{currency(assessment.revenueImpactAud)}</p>
                      <p className="text-xs text-white/50 mt-1">
                        modeled at {currency(assessment.assumptions.avgDeclaredValuePerTeuAud)} / TEU declared value (editable assumption)
                      </p>
                    </div>
                  </div>

                  {/* Affected suppliers */}
                  {assessment.affectedSuppliers.length > 0 && (
                    <div className="bg-white/70 border border-black/10 rounded-lg p-5">
                      <p className="font-mono text-[11px] tracking-wideish text-brass mb-3">AFFECTED ACCOUNTS</p>
                      <div className="space-y-2">
                        {assessment.affectedSuppliers.map((s) => (
                          <div key={s.id} className="flex items-center justify-between text-sm border-b border-black/5 pb-2 last:border-0 last:pb-0">
                            <span className="text-ink">{s.name}</span>
                            <span className="text-xs text-slateline/60 font-mono capitalize">{s.sector} · {s.dependency_level} dependency</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recommended routes */}
                  {assessment.recommendedRoutes.length > 0 && (
                    <div className="bg-white/70 border border-black/10 rounded-lg p-5">
                      <p className="font-mono text-[11px] tracking-wideish text-brass mb-3">RECOMMENDED ALTERNATIVE ROUTES</p>
                      <div className="space-y-2.5">
                        {assessment.recommendedRoutes.map((r) => (
                          <div key={r.id} className="flex items-center justify-between text-sm">
                            <span className="text-ink">
                              via {r.alt?.name || 'alternate port'} <span className="text-slateline/50">({r.mode.replace('_', ' ')})</span>
                            </span>
                            <span className="text-xs text-slateline/60 font-mono">+{r.extra_transit_days}d · +{r.extra_cost_pct}% cost</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Assumptions disclosure */}
                  <details className="text-xs text-slateline/70 bg-black/[0.02] rounded-lg p-4 border border-black/5">
                    <summary className="cursor-pointer font-mono tracking-wideish text-slateline">MODEL ASSUMPTIONS</summary>
                    <ul className="mt-3 space-y-1 font-mono">
                      <li>Crane-stop wind gust threshold: {assessment.assumptions.craneStopGustKmh} km/h</li>
                      <li>Pilotage-suspend wave height: {assessment.assumptions.pilotSuspendWaveM} m</li>
                      <li>Heavy-rain handling threshold: {assessment.assumptions.heavyRainMmHr} mm/hr</li>
                      <li>Declared value assumption: {currency(assessment.assumptions.avgDeclaredValuePerTeuAud)} / TEU</li>
                      <li>Safety stock assumption: {assessment.assumptions.avgSafetyStockDays} days</li>
                    </ul>
                  </details>
                </div>
              )}
            </div>
          </div>
        )}

        {tab === 'history' && (
          <div className="bg-white/70 border border-black/10 rounded-lg p-5">
            <p className="font-mono text-[11px] tracking-wideish text-brass mb-4">RECENT ASSESSMENTS</p>
            {!history.length && <p className="text-sm text-slateline/60">No assessments logged yet.</p>}
            <div className="space-y-2">
              {history.map((h) => (
                <div key={h.id} className="flex flex-wrap items-center justify-between gap-2 text-sm border-b border-black/5 pb-2 last:border-0">
                  <span className="font-mono text-xs text-slateline/70">{new Date(h.created_at).toLocaleString('en-AU')}</span>
                  <span className="text-ink font-medium">{h.port_code}</span>
                  <span className={`text-xs capitalize font-mono ${RISK_COLORS[h.risk_level]?.text || ''}`}>{h.risk_level} · {h.risk_score}</span>
                  <span className="text-xs text-slateline/60 font-mono">{h.predicted_delay_days}d delay</span>
                  <span className="text-xs text-slateline/60 font-mono">{currency(h.revenue_impact_aud)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

function MetricCard({ label, value, highlight }) {
  return (
    <div className={`rounded-lg p-5 border ${highlight ? 'border-brass/40 bg-brass/10' : 'border-black/10 bg-white/70'}`}>
      <p className="font-mono text-[11px] tracking-wideish text-slateline/60 mb-2">{label}</p>
      <p className="font-display text-2xl text-ink">{value}</p>
    </div>
  );
}
