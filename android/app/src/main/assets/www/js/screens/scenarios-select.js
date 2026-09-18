// Scenario Selection Screen: Catalog of All Five Vocational Training Simulations

import { SCENARIOS } from '../engine/scenarios-data.js';

export function renderScenariosSelectScreen(container, state) {
  container.innerHTML = `
    <div style="padding-top: 8px; max-width: 600px; margin: 0 auto;">
      <!-- Header -->
      <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 20px;">
        <button id="btn-scenarios-back" class="btn-secondary" style="padding: 6px 12px; border-radius: var(--radius-full);">
          ← Back
        </button>
        <div>
          <h2 style="font-size: 19px; font-weight: 800; color: var(--text-primary); margin: 0;">
            Vocational Simulations
          </h2>
          <span style="font-size: 12px; color: var(--text-secondary);">
            5 Official Mining Vocational Training Domains
          </span>
        </div>
      </div>

      <!-- Scenarios List -->
      <div style="display: flex; flex-direction: column; gap: 14px; margin-bottom: 24px;">
        ${SCENARIOS.map((scen, idx) => `
          <div 
            class="scenario-card-item" 
            data-scenario-id="${scen.id}"
            style="
              background: #ffffff;
              border-radius: var(--radius-xl);
              padding: 18px;
              border: 1.5px solid #e2e8f0;
              box-shadow: var(--shadow-sm);
              cursor: pointer;
              transition: transform 0.15s, border-color 0.15s, box-shadow 0.15s;
            "
          >
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
              <span style="
                background: #e0f2fe;
                color: #0369a1;
                font-size: 11px;
                font-weight: 800;
                padding: 3px 10px;
                border-radius: var(--radius-full);
                text-transform: uppercase;
              ">
                Domain ${idx + 1}: ${scen.domain}
              </span>
              <span style="font-size: 11px; color: #64748b; font-weight: 600;">
                📍 ${scen.location}
              </span>
            </div>

            <h3 style="font-size: 16px; font-weight: 800; color: var(--text-primary); margin: 0 0 6px 0;">
              ${scen.title}
            </h3>

            <p style="font-size: 12.5px; color: #475569; margin: 0 0 14px 0; line-height: 1.45;">
              ${scen.briefing}
            </p>

            <div style="
              display: flex;
              align-items: center;
              justify-content: space-between;
              padding-top: 10px;
              border-top: 1px dashed #e2e8f0;
              font-size: 12px;
            ">
              <span style="color: #64748b;">Target: <strong style="color: #1e293b;">${scen.supportedTargetLabel}</strong></span>
              <span style="color: #0284c7; font-weight: 700; display: flex; align-items: center; gap: 4px;">
                Start Briefing ➔
              </span>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  container.querySelector('#btn-scenarios-back')?.addEventListener('click', () => {
    window.location.hash = '#home';
  });

  container.querySelectorAll('[data-scenario-id]').forEach(card => {
    card.addEventListener('click', () => {
      const id = card.getAttribute('data-scenario-id');
      window.location.hash = `#briefing?scenario=${id}`;
    });
  });
}
