// Scenario Briefing Screen: Pre-Drill Context and Target Safety Doctrine

import { getScenarioById } from '../engine/scenarios-data.js';
import { speak } from '../voice.js';

export function renderBriefingScreen(container, state) {
  const rawHash = window.location.hash;
  let scenarioId = 'sim_fire_explosion';
  if (rawHash.includes('scenario=')) {
    const match = rawHash.match(/scenario=([a-zA-Z0-9_]+)/);
    if (match) scenarioId = match[1];
  }

  const scenario = getScenarioById(scenarioId);
  speak(`Scenario Briefing: ${scenario.title}. ${scenario.briefing}`);

  container.innerHTML = `
    <div style="padding-top: 8px; max-width: 600px; margin: 0 auto;">
      <!-- Back Navigation Header -->
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
        <div style="display: flex; align-items: center; gap: 10px;">
          <button id="btn-brief-back" class="btn-secondary" style="padding: 6px 12px; border-radius: var(--radius-full);">
            ← Back
          </button>
          <span style="font-size: 11px; font-weight: 800; color: #0284c7; text-transform: uppercase; letter-spacing: 0.5px;">
            ${scenario.domain}
          </span>
        </div>
      </div>

      <!-- Hero Header Banner -->
      <div style="
        background: linear-gradient(135deg, #0b1f33 0%, #1e3a5f 100%);
        border-radius: var(--radius-xl);
        padding: 22px;
        color: #ffffff;
        margin-bottom: 20px;
        box-shadow: var(--shadow-md);
      ">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
          <span style="background: rgba(239, 68, 68, 0.25); color: #fca5a5; border: 1px solid rgba(239, 68, 68, 0.4); font-size: 11px; font-weight: 800; padding: 3px 10px; border-radius: var(--radius-full);">
            ${scenario.hazardType}
          </span>
          <span style="font-size: 11.5px; color: #38bdf8; font-family: monospace;">📍 ${scenario.location}</span>
        </div>
        <h2 style="font-size: 20px; font-weight: 800; margin: 0 0 6px 0;">
          ${scenario.title}
        </h2>
        <p style="font-size: 12.5px; color: #94a3b8; margin: 0; line-height: 1.4;">
          Supported Target: ${scenario.supportedTargetLabel}
        </p>
      </div>

      <!-- Operational Context Card -->
      <div style="background: #ffffff; border-radius: var(--radius-xl); padding: 20px; border: 1px solid #e2e8f0; box-shadow: var(--shadow-sm); margin-bottom: 20px;">
        <h3 style="font-size: 15px; font-weight: 700; color: var(--text-primary); margin: 0 0 10px 0; display: flex; align-items: center; gap: 8px;">
          <span>📋</span> Operational Scenario Briefing
        </h3>
        <p style="font-size: 13px; color: var(--text-secondary); line-height: 1.6; margin: 0 0 16px 0;">
          ${scenario.briefing}
        </p>

        <div style="background: #f8fafc; border-radius: var(--radius-md); padding: 14px; margin-bottom: 18px; border-left: 4px solid #0284c7;">
          <h4 style="font-size: 12px; font-weight: 700; color: #0369a1; text-transform: uppercase; margin: 0 0 8px 0;">
            Target Safety Protocol:
          </h4>
          <ul style="font-size: 12.5px; color: #334155; padding-left: 18px; line-height: 1.6; margin: 0;">
            ${scenario.targetSafetyDoctrine.map(item => `<li>${item}</li>`).join('')}
          </ul>
        </div>

        <!-- Next: Safety Checklist -->
        <div style="display: flex; flex-direction: column; gap: 10px;">
          <button id="btn-proceed-checklist" class="btn-primary" style="width: 100%; padding: 14px; font-size: 15px; font-weight: 800;">
            ✓ Proceed to AR Safety Checklist →
          </button>
          <button id="btn-brief-sim-mode" class="btn-secondary" style="width: 100%; padding: 11px; font-size: 13px;">
            🎮 Launch Controlled Simulation Mode
          </button>
        </div>
      </div>
    </div>
  `;

  container.querySelector('#btn-brief-back')?.addEventListener('click', () => {
    window.location.hash = '#home';
  });

  container.querySelector('#btn-proceed-checklist')?.addEventListener('click', () => {
    window.location.hash = `#checklist?scenario=${scenario.id}`;
  });

  container.querySelector('#btn-brief-sim-mode')?.addEventListener('click', () => {
    window.location.hash = `#ar?scenario=${scenario.id}&mode=sim`;
  });
}
