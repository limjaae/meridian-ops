// Meridian Operations — decision-support engine
// Transparent, rules-based modeling. Every threshold and assumption below
// is a labeled input, not a hidden constant — they are surfaced to the
// user in the assessment output so the reasoning can be audited.

export const ASSUMPTIONS = {
  craneStopGustKmh: 65, // typical gust threshold terminals cite for stopping quay crane ops
  pilotSuspendWaveM: 2.5, // significant wave height above which pilotage is commonly restricted
  heavyRainMmHr: 10,
  avgDeclaredValuePerTeuAud: 55000, // editable planning assumption, not a live market figure
  avgSafetyStockDays: 18, // typical import safety-stock cover assumed for affected retail/manufacturing accounts
  baseHandlingDelayDays: 0.5,
};

export function classifyWeatherRisk(weather) {
  if (!weather) return { level: 'unknown', score: 0, reasons: [] };
  const reasons = [];
  let score = 0;

  if (weather.windGustKmh >= ASSUMPTIONS.craneStopGustKmh) {
    score += 45;
    reasons.push(`Wind gusts of ${Math.round(weather.windGustKmh)} km/h exceed the ${ASSUMPTIONS.craneStopGustKmh} km/h crane-stop threshold`);
  } else if (weather.windGustKmh >= ASSUMPTIONS.craneStopGustKmh * 0.7) {
    score += 20;
    reasons.push(`Wind gusts of ${Math.round(weather.windGustKmh)} km/h are approaching the crane-stop threshold`);
  }

  if (weather.waveHeightM != null) {
    if (weather.waveHeightM >= ASSUMPTIONS.pilotSuspendWaveM) {
      score += 35;
      reasons.push(`Significant wave height of ${weather.waveHeightM.toFixed(1)} m exceeds the ${ASSUMPTIONS.pilotSuspendWaveM} m pilotage threshold`);
    } else if (weather.waveHeightM >= ASSUMPTIONS.pilotSuspendWaveM * 0.6) {
      score += 12;
      reasons.push(`Swell building toward the pilotage threshold (${weather.waveHeightM.toFixed(1)} m)`);
    }
  }

  if (weather.precipitationMm >= ASSUMPTIONS.heavyRainMmHr) {
    score += 20;
    reasons.push(`Precipitation of ${weather.precipitationMm.toFixed(1)} mm/hr may slow bulk and general cargo handling`);
  }

  score = Math.min(100, score);
  let level = 'low';
  if (score >= 65) level = 'critical';
  else if (score >= 40) level = 'high';
  else if (score >= 18) level = 'medium';

  return { level, score, reasons };
}

export function buildAssessment({ port, weather, suppliers, routes, scenario, assumptions }) {
  const a = { ...ASSUMPTIONS, ...(assumptions || {}) };
  const weatherRisk = classifyWeatherRisk(weather);

  let level = weatherRisk.level;
  let score = weatherRisk.score;
  const reasons = [...weatherRisk.reasons];

  if (scenario?.portClosure) {
    score = 100;
    level = 'critical';
    reasons.push('Manual scenario input: full port closure simulated');
  }
  if (scenario?.demandSpike) {
    score = Math.min(100, score + 15);
    reasons.push('Manual scenario input: demand spike simulated, compounding congestion risk');
    if (level === 'low') level = 'medium';
  }

  const severityMultiplier = { low: 0, medium: 0.6, high: 1.4, critical: 3 }[level] ?? 0;
  const predictedDelayDays = Number((a.baseHandlingDelayDays + severityMultiplier * 1.1).toFixed(1));

  const impactedSuppliers = (suppliers || []).filter((s) => s.monthly_volume_teu > 0);
  const dependencyWeight = { high: 1, medium: 0.6, low: 0.3 };
  const totalAffectedTeu = impactedSuppliers.reduce(
    (sum, s) => sum + s.monthly_volume_teu * (dependencyWeight[s.dependency_level] ?? 0.5) * (severityMultiplier > 0 ? 1 : 0),
    0
  );

  const dailyConsumptionTeu = impactedSuppliers.reduce((s, x) => s + x.monthly_volume_teu, 0) / 30;
  // Days of safety-stock cover consumed by the predicted delay, assuming
  // replenishment shipments stop for the duration of the disruption.
  const inventoryDaysAtRisk = dailyConsumptionTeu > 0 && severityMultiplier > 0
    ? Number(predictedDelayDays.toFixed(1))
    : 0;

  const revenueImpactAud = Math.round(totalAffectedTeu * a.avgDeclaredValuePerTeuAud * (predictedDelayDays / 14));

  const rankedRoutes = (routes || [])
    .map((r) => ({ ...r, penaltyScore: r.extra_transit_days * 10 + r.extra_cost_pct }))
    .sort((x, y) => x.penaltyScore - y.penaltyScore);

  return {
    port,
    weather,
    risk: { level, score, reasons },
    predictedDelayDays,
    inventory: {
      affectedTeu: Math.round(totalAffectedTeu),
      inventoryDaysAtRisk,
      safetyStockAssumptionDays: a.avgSafetyStockDays,
    },
    revenueImpactAud,
    affectedSuppliers: impactedSuppliers,
    recommendedRoutes: rankedRoutes.slice(0, 3),
    assumptions: a,
    scenario: scenario || {},
    generatedAt: new Date().toISOString(),
  };
}
