import { NextResponse } from 'next/server';
import { getSupabaseClient } from '../../../lib/supabaseClient';
import { buildAssessment } from '../../../lib/engine';

export const dynamic = 'force-dynamic';

async function fetchWeather(lat, lon) {
  const forecastUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,precipitation,wind_speed_10m,wind_gusts_10m,weather_code&wind_speed_unit=kmh&timezone=auto`;
  const marineUrl = `https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lon}&current=wave_height,swell_wave_height&timezone=auto`;

  const [forecastRes, marineRes] = await Promise.all([
    fetch(forecastUrl, { cache: 'no-store' }),
    fetch(marineUrl, { cache: 'no-store' }).catch(() => null),
  ]);

  const forecast = forecastRes.ok ? await forecastRes.json() : {};
  const marine = marineRes && marineRes.ok ? await marineRes.json() : {};
  const current = forecast.current || {};
  const marineCurrent = marine.current || {};

  return {
    source: 'Open-Meteo (live)',
    fetchedAt: new Date().toISOString(),
    temperatureC: current.temperature_2m ?? null,
    precipitationMm: current.precipitation ?? 0,
    windSpeedKmh: current.wind_speed_10m ?? null,
    windGustKmh: current.wind_gusts_10m ?? current.wind_speed_10m ?? 0,
    waveHeightM: marineCurrent.wave_height ?? null,
    swellHeightM: marineCurrent.swell_wave_height ?? null,
  };
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { portCode, scenario, assumptions } = body || {};
    if (!portCode) {
      return NextResponse.json({ error: 'portCode is required' }, { status: 400 });
    }

    const supabase = getSupabaseClient();

    const { data: port, error: portErr } = await supabase
      .from('ports')
      .select('*')
      .eq('code', portCode)
      .single();

    if (portErr || !port) {
      return NextResponse.json({ error: 'port_not_found', detail: portErr?.message }, { status: 404 });
    }

    const [{ data: suppliers }, { data: routes }] = await Promise.all([
      supabase.from('suppliers').select('*').eq('primary_port_id', port.id),
      supabase.from('routes').select('*, alt:alt_port_id(code,name,state)').eq('origin_port_id', port.id),
    ]);

    const weather = await fetchWeather(port.lat, port.lon);

    const assessment = buildAssessment({
      port,
      weather,
      suppliers: suppliers || [],
      routes: routes || [],
      scenario,
      assumptions,
    });

    await supabase.from('query_log').insert({
      port_code: port.code,
      scenario: JSON.stringify(scenario || {}),
      risk_score: assessment.risk.score,
      risk_level: assessment.risk.level,
      predicted_delay_days: assessment.predictedDelayDays,
      revenue_impact_aud: assessment.revenueImpactAud,
    });

    return NextResponse.json(assessment);
  } catch (err) {
    return NextResponse.json(
      { error: 'assessment_failed', message: String(err.message || err) },
      { status: 500 }
    );
  }
}
