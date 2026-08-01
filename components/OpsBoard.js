'use client';

import { useEffect, useState } from 'react';
import { classifyWeatherRisk } from '../lib/engine';

const STATUS_LABEL = {
  low: 'ON SCHEDULE',
  medium: 'MONITOR',
  high: 'WEATHER HOLD',
  critical: 'OPS SUSPENDED',
  unknown: 'AWAITING DATA',
};

const DOT_COLOR = {
  low: '#4C7A63',
  medium: '#C08A3E',
  high: '#C4462B',
  critical: '#C4462B',
  unknown: '#5B6B7A',
};

export default function OpsBoard() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatedAt, setUpdatedAt] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const portsRes = await fetch('/api/ports');
        const { ports } = await portsRes.json();
        if (!ports || cancelled) return;

        const results = await Promise.all(
          ports.map(async (port) => {
            try {
              const wRes = await fetch(`/api/weather?lat=${port.lat}&lon=${port.lon}`);
              const weather = await wRes.json();
              const risk = classifyWeatherRisk(weather);
              return { port, weather, risk };
            } catch {
              return { port, weather: null, risk: { level: 'unknown', score: 0 } };
            }
          })
        );

        if (!cancelled) {
          results.sort((a, b) => b.risk.score - a.risk.score);
          setRows(results);
          setUpdatedAt(new Date());
          setLoading(false);
        }
      } catch {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    const interval = setInterval(load, 5 * 60 * 1000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="board-scan rounded-lg bg-ink border border-white/10 shadow-2xl overflow-hidden">
      <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-white/10">
        <span className="font-mono text-[11px] tracking-wideish text-brassLight">LIVE PORT STATUS BOARD</span>
        <span className="font-mono text-[10px] text-white/40">
          {updatedAt ? `UPDATED ${updatedAt.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' })}` : '—'}
        </span>
      </div>

      <div className="flap-row px-4 sm:px-5 py-2 text-[10px] font-mono tracking-wideish text-white/40 border-b border-white/10">
        <span>CODE</span>
        <span>PORT</span>
        <span>STATUS</span>
        <span className="flap-eta">DELAY EST.</span>
      </div>

      <div className="divide-y divide-white/5">
        {loading && (
          <div className="px-5 py-6 text-white/40 font-mono text-xs">Reading live wind, swell and precipitation feeds…</div>
        )}
        {!loading &&
          rows.map(({ port, risk }) => (
            <div key={port.code} className="flap-row px-4 sm:px-5 py-2.5">
              <span className="font-mono text-xs text-white/70">{port.code}</span>
              <span className="text-sm text-fog truncate pr-2">{port.name}</span>
              <span className="flex items-center gap-2">
                <span className="risk-dot" style={{ backgroundColor: DOT_COLOR[risk.level] }} />
                <span className="flap font-mono text-[11px] tracking-wide text-fog px-1.5 py-0.5">
                  <span className="flap-char">{STATUS_LABEL[risk.level]}</span>
                </span>
              </span>
              <span className="flap-eta font-mono text-xs text-white/50">
                {risk.level === 'unknown' ? '—' : risk.score >= 65 ? '2–4 days' : risk.score >= 40 ? '1–2 days' : risk.score >= 18 ? '~0.5–1 day' : 'nominal'}
              </span>
            </div>
          ))}
      </div>
    </div>
  );
}
