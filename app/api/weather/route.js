import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');

  if (!lat || !lon) {
    return NextResponse.json({ error: 'lat and lon are required' }, { status: 400 });
  }

  try {
    const forecastUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,precipitation,wind_speed_10m,wind_gusts_10m,weather_code&wind_speed_unit=kmh&timezone=auto`;
    const marineUrl = `https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lon}&current=wave_height,swell_wave_height&timezone=auto`;

    const [forecastRes, marineRes] = await Promise.all([
      fetch(forecastUrl, { cache: 'no-store' }),
      fetch(marineUrl, { cache: 'no-store' }).catch(() => null),
    ]);

    if (!forecastRes.ok) {
      throw new Error(`Open-Meteo forecast error: ${forecastRes.status}`);
    }
    const forecast = await forecastRes.json();
    let marine = null;
    if (marineRes && marineRes.ok) {
      marine = await marineRes.json();
    }

    const current = forecast.current || {};
    const marineCurrent = marine?.current || {};

    return NextResponse.json({
      source: 'Open-Meteo (live)',
      fetchedAt: new Date().toISOString(),
      temperatureC: current.temperature_2m ?? null,
      precipitationMm: current.precipitation ?? 0,
      windSpeedKmh: current.wind_speed_10m ?? null,
      windGustKmh: current.wind_gusts_10m ?? current.wind_speed_10m ?? 0,
      waveHeightM: marineCurrent.wave_height ?? null,
      swellHeightM: marineCurrent.swell_wave_height ?? null,
      weatherCode: current.weather_code ?? null,
    });
  } catch (err) {
    return NextResponse.json(
      { error: 'weather_fetch_failed', message: String(err.message || err) },
      { status: 502 }
    );
  }
}
