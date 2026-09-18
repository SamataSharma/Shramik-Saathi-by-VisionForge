// DGMS 4-Pillar Competency Assessment Engine

export function computeCompetencyScore(accuracy, speed, procedure, hazardRec) {
  const c = (0.35 * accuracy) + (0.30 * speed) + (0.25 * procedure) + (0.10 * hazardRec);
  return Math.round(Math.max(0, Math.min(100, c)) * 10) / 10;
}

export function evaluatePillars(scores) {
  return {
    accuracy: { label: "Equipment & Hazard Accuracy", score: scores.accuracy, status: scores.accuracy >= 75 ? "green" : (scores.accuracy >= 60 ? "yellow" : "red") },
    speed: { label: "Emergency Response Speed", score: scores.speed, status: scores.speed >= 75 ? "green" : (scores.speed >= 60 ? "yellow" : "red") },
    procedure: { label: "PASS Standard Procedure", score: scores.procedure, status: scores.procedure >= 75 ? "green" : (scores.procedure >= 60 ? "yellow" : "red") },
    hazardRec: { label: "Hazard Recognition Time", score: scores.hazardRec, status: scores.hazardRec >= 75 ? "green" : (scores.hazardRec >= 60 ? "yellow" : "red") }
  };
}
