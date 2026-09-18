// Automated Gap Detection & Retraining Recommendation Engine

export function analyzeGaps(pillarScores, mistakes = []) {
  const recommendations = [];

  if (pillarScores.accuracy < 70) {
    recommendations.push({
      module: "Fire Extinguisher Selection (DCP vs Water)",
      reason: "Incorrect firefighting media chosen. High risk of hazardous chemical reaction in coal seams.",
      priority: "HIGH"
    });
  }

  if (pillarScores.procedure < 75) {
    recommendations.push({
      module: "PASS Protocol (Aim at Base & Sweep)",
      reason: "Extinguisher discharge was ineffective due to improper nozzle orientation or unpulled pin.",
      priority: "CRITICAL"
    });
  }

  if (pillarScores.hazardRec < 70) {
    recommendations.push({
      module: "Spontaneous Combustion Early Recognition",
      reason: "Delayed hazard detection (> 8 seconds) increases risk of underground seam flashover.",
      priority: "MEDIUM"
    });
  }

  if (mistakes.some(m => m.toLowerCase().includes('return') || m.toLowerCase().includes('downwind'))) {
    recommendations.push({
      module: "Ventilation & Safe Positioning",
      reason: "Approached fire from return airway into toxic Carbon Monoxide plume. CMR Regulation 138 violation.",
      priority: "CRITICAL"
    });
  }

  return {
    needsRetraining: recommendations.length > 0,
    recommendations
  };
}
