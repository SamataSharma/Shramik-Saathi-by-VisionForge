// Gamification Engine: XP Matrix, Level Progression, Badges & Streaks

export const LEVELS = [
  { level: 1, title: "Mining Trainee", minXp: 0, maxXp: 199 },
  { level: 2, title: "Miner Grade II", minXp: 200, maxXp: 499 },
  { level: 3, title: "Safety Specialist", minXp: 500, maxXp: 999 },
  { level: 4, title: "Mine Rescue Master", minXp: 1000, maxXp: 99999 }
];

export const BADGE_DEFINITIONS = [
  { key: "fire_rookie", title: "Fire Safety Rookie", icon: "🔥", desc: "Complete Underground Mine Fire Response drill." },
  { key: "rapid_responder", title: "Rapid Responder", icon: "⚡", desc: "Hazard recognition under 4.0 seconds in emergency drill." },
  { key: "ppe_sentinel", title: "PPE Sentinel", icon: "⛑️", desc: "100% pre-shift compliance check with zero infractions." },
  { key: "gas_shield", title: "Gas Shield Master", icon: "🛡️", desc: "Detect toxic gas seepage below Lower Explosive Limit." },
  { key: "flawless_exec", title: "Flawless Execution", icon: "🎯", desc: "Zero penalties and 100% accuracy in emergency simulation." },
  { key: "dgms_certified", title: "DGMS Certified Practitioner", icon: "🏆", desc: "Complete all mandatory modules with >=85% competency." }
];

export function getLevelDetails(xp) {
  for (const lvl of LEVELS) {
    if (xp >= lvl.minXp && xp <= lvl.maxXp) {
      const span = lvl.maxXp - lvl.minXp;
      const progress = span > 0 ? Math.min(100, Math.round(((xp - lvl.minXp) / span) * 100)) : 100;
      return {
        level: lvl.level,
        title: lvl.title,
        progressPct: Math.max(15, progress),
        nextLevelXp: lvl.maxXp + 1,
        xpToNext: Math.max(0, (lvl.maxXp + 1) - xp)
      };
    }
  }
  return { level: 4, title: "Mine Rescue Master", progressPct: 100, nextLevelXp: 1000, xpToNext: 0 };
}

export function calculateAttemptScore(telemetry, validationResults) {
  let xpEarned = 0;
  const mistakes = telemetry.mistakes || [];

  // 1. Hazard Recognition Speed
  const recSec = telemetry.hazard_rec_ms / 1000;
  if (recSec <= 5.0) xpEarned += 15;
  else if (recSec <= 10.0) xpEarned += 10;
  else xpEarned += 5;

  // 2. Equipment Selection
  if (validationResults.equipmentCorrect) xpEarned += 15;
  else xpEarned -= 10;

  // 3. Ventilation Approach
  if (!validationResults.approachCorrect) xpEarned -= 20;

  // 4. PASS Execution
  if (validationResults.passCompletedCount === 4) xpEarned += 25;
  else xpEarned += (validationResults.passCompletedCount * 5);

  // 5. Completion Bonus
  if (validationResults.equipmentCorrect && validationResults.approachCorrect) {
    xpEarned += 50;
  } else {
    xpEarned += 10;
  }

  // Ensure minimum positive XP for effort
  xpEarned = Math.max(10, xpEarned);

  // Pillar calculations
  const accuracy = validationResults.equipmentCorrect ? 95.0 : 35.0;
  const procedure = (validationResults.passCompletedCount / 4.0) * 100.0;
  const speed = recSec <= 4.0 ? 98.0 : (recSec <= 8.0 ? 82.0 : 60.0);
  const hazardRec = recSec <= 5.0 ? 95.0 : (recSec <= 10.0 ? 78.0 : 55.0);

  // Competency Formula: C = 0.35*Acc + 0.30*Speed + 0.25*Proc + 0.10*HazRec
  const competency = Math.round(((0.35 * accuracy) + (0.30 * speed) + (0.25 * procedure) + (0.10 * hazardRec)) * 10) / 10;

  // Badges check
  const newBadges = [];
  if (competency >= 70 && validationResults.approachCorrect) {
    newBadges.push("🔥 Fire Safety Rookie");
  }
  if (recSec < 4.0) {
    newBadges.push("⚡ Rapid Responder");
  }
  if (mistakes.length === 0 && procedure === 100) {
    newBadges.push("🎯 Flawless Execution");
  }
  if (competency >= 85) {
    newBadges.push("🏆 DGMS Certified Practitioner");
  }

  return {
    xpEarned,
    accuracy,
    speed,
    procedure,
    hazardRec,
    competency,
    passed: (competency >= 70 && validationResults.approachCorrect && validationResults.equipmentCorrect),
    newBadges
  };
}
