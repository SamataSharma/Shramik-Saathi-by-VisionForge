// Scenario Briefing Screen: 30-Sec Industrial Pre-Drill Context

import { speak } from '../voice.js';

export function renderBriefingScreen(container, state) {
  speak("Scenario Briefing: Underground Seam 4 Conveyor Fire. Spontaneous combustion detected. Approach from intake airway and prepare Dry Chemical Powder extinguisher.");

  container.innerHTML = `
    <div style="padding-top: 8px;">
      <!-- Back Navigation Header -->
      <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 20px;">
        <button id="btn-brief-back" class="btn-secondary" style="padding: 6px 12px; border-radius: var(--radius-full);">
          ← Back
        </button>
        <span style="font-size: 13px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.8px;">
          DGMS VOCATIONAL DRILL #01
        </span>
      </div>

      <!-- Hero Header Banner -->
      <div style="background: linear-gradient(135deg, #0b1f33 0%, #1e3a5f 100%); border-radius: var(--radius-xl); padding: 22px; color: #ffffff; margin-bottom: 20px; box-shadow: var(--shadow-md);">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
          <span style="background: #dc2626; color: #ffffff; font-size: 11px; font-weight: 800; padding: 3px 10px; border-radius: var(--radius-full);">
            CRITICAL HAZARD
          </span>
          <span style="font-size: 12px; color: #38bdf8; font-family: monospace;">DGMS CMR 136</span>
        </div>
        <h2 style="font-size: 20px; font-weight: 800; margin-bottom: 8px;">
          Underground Coal Mine Fire & Spontaneous Heating
        </h2>
        <p style="font-size: 13px; color: #94a3b8; line-height: 1.45;">
          Dhanbad Seam #4 Trunk Belt Conveyor Gallery (Bharat Coking Coal Ltd - BCCL)
        </p>
      </div>

      <!-- Scenario Briefing Card -->
      <div style="background: #ffffff; border-radius: var(--radius-xl); padding: 20px; border: 1px solid #e2e8f0; box-shadow: var(--shadow-sm); margin-bottom: 20px;">
        <h3 style="font-size: 15px; font-weight: 700; color: var(--text-primary); margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
          <span>📋</span> Operational Scenario
        </h3>
        <p style="font-size: 13px; color: var(--text-secondary); line-height: 1.6; margin-bottom: 16px;">
          Friction between a seized conveyor roller idler and rubber belt has ignited coal dust accumulation. Dense toxic smoke containing Carbon Monoxide (CO) is traveling down the gallery.
        </p>

        <div style="background: #f8fafc; border-radius: var(--radius-md); padding: 14px; margin-bottom: 16px; border-left: 4px solid #0284c7;">
          <h4 style="font-size: 12px; font-weight: 700; color: #0369a1; text-transform: uppercase; margin-bottom: 6px;">
            Target Safety Doctrine:
          </h4>
          <ul style="font-size: 12.5px; color: #334155; padding-left: 18px; line-height: 1.6;">
            <li><strong>Hazard Recognition:</strong> Detect flame & smoke within 5 seconds (+15 XP).</li>
            <li><strong>Extinguisher Selection:</strong> Choose <strong>Dry Chemical Powder (DCP)</strong>. Water is hazardous near motors!</li>
            <li><strong>Ventilation Safety:</strong> Approach exclusively from <strong>Intake Airway</strong> (upwind).</li>
            <li><strong>PASS Execution:</strong> Pull pin, Aim at base, Squeeze lever, Sweep side-to-side.</li>
          </ul>
        </div>

        <div style="display: flex; flex-direction: column; gap: 10px;">
          <button id="btn-start-ar-camera" class="btn-primary" style="width: 100%; padding: 14px; font-size: 15px;">
            📷 Launch WebXR AR Simulator (Camera)
          </button>
          <button id="btn-start-sim-mode" class="btn-secondary" style="width: 100%; padding: 12px; font-size: 14px;">
            🎮 Launch 3D Mine Gallery Simulator
          </button>
        </div>
      </div>
    </div>
  `;

  container.querySelector('#btn-brief-back')?.addEventListener('click', () => {
    window.location.hash = '#home';
  });

  container.querySelector('#btn-start-ar-camera')?.addEventListener('click', () => {
    window.location.hash = '#ar';
  });

  container.querySelector('#btn-start-sim-mode')?.addEventListener('click', () => {
    window.location.hash = '#ar?mode=sim';
  });
}
