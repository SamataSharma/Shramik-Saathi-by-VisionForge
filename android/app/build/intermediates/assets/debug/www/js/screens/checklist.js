// Interactive AR Safety Checklist Screen: Pre-Drill Mandatory Verification

import { getScenarioById } from '../engine/scenarios-data.js';
import { speak, playSuccessChime } from '../voice.js';

export function renderChecklistScreen(container, state) {
  // Parse scenario ID from URL hash or fallback
  const rawHash = window.location.hash;
  let scenarioId = 'sim_fire_explosion';
  if (rawHash.includes('scenario=')) {
    const match = rawHash.match(/scenario=([a-zA-Z0-9_]+)/);
    if (match) scenarioId = match[1];
  }

  const scenario = getScenarioById(scenarioId);
  const checklistItems = scenario.checklist || [];
  const checkedSet = new Set();

  speak(`Safety checklist for ${scenario.title}. Complete all safety checks before starting AR simulation.`);

  container.innerHTML = `
    <div style="padding-top: 8px; max-width: 600px; margin: 0 auto;">
      <!-- Header -->
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
        <div style="display: flex; align-items: center; gap: 10px;">
          <button id="btn-checklist-back" class="btn-secondary" style="padding: 6px 12px; border-radius: var(--radius-full);">
            ← Back
          </button>
          <div>
            <span style="font-size: 11px; font-weight: 700; color: #0284c7; text-transform: uppercase;">
              ${scenario.domain}
            </span>
            <h2 style="font-size: 18px; font-weight: 800; color: var(--text-primary); margin: 0;">
              AR Safety Checklist
            </h2>
          </div>
        </div>
        <div id="checklist-counter-badge" style="
          font-size: 12px;
          font-weight: 800;
          color: #0284c7;
          background: #e0f2fe;
          padding: 4px 10px;
          border-radius: var(--radius-full);
        ">
          0 / ${checklistItems.length} Verified
        </div>
      </div>

      <!-- Checklist Information Card -->
      <div style="
        background: linear-gradient(135deg, #0b1f33 0%, #1e3a5f 100%);
        border-radius: var(--radius-xl);
        padding: 18px 20px;
        color: #ffffff;
        margin-bottom: 20px;
        box-shadow: var(--shadow-md);
      ">
        <div style="font-size: 11px; font-weight: 700; color: #38bdf8; text-transform: uppercase; margin-bottom: 4px;">
          Pre-Simulation Safety Verification
        </div>
        <h3 style="font-size: 16px; font-weight: 800; margin: 0 0 6px 0;">
          ${scenario.title}
        </h3>
        <p style="font-size: 12px; color: #cbd5e1; margin: 0; line-height: 1.4;">
          All items must be physically verified prior to establishing the augmented reality hazard anchor.
        </p>
      </div>

      <!-- Interactive Checklist Items -->
      <div style="background: #ffffff; border-radius: var(--radius-xl); padding: 18px; border: 1px solid #e2e8f0; box-shadow: var(--shadow-sm); margin-bottom: 20px;">
        <h4 style="font-size: 13px; font-weight: 700; color: var(--text-primary); margin: 0 0 14px 0;">
          Required Pre-Entry Checklist:
        </h4>

        <div style="display: flex; flex-direction: column; gap: 10px;" id="checklist-items-container">
          ${checklistItems.map((item, idx) => `
            <label class="checklist-item-row" data-item-id="${item.id}" style="
              display: flex;
              align-items: flex-start;
              gap: 12px;
              padding: 12px 14px;
              background: #f8fafc;
              border: 1.5px solid #e2e8f0;
              border-radius: var(--radius-md);
              cursor: pointer;
              transition: all 0.2s ease;
            ">
              <input 
                type="checkbox" 
                class="checklist-checkbox" 
                data-id="${item.id}"
                style="
                  width: 18px;
                  height: 18px;
                  margin-top: 2px;
                  accent-color: #0284c7;
                  cursor: pointer;
                "
              />
              <span style="font-size: 13px; color: #1e293b; font-weight: 500; line-height: 1.45;">
                ${item.text}
              </span>
            </label>
          `).join('')}
        </div>
      </div>

      <!-- Action Buttons -->
      <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 24px;">
        <button 
          id="btn-launch-ar-verified" 
          disabled 
          class="btn-primary" 
          style="
            width: 100%;
            padding: 14px;
            font-size: 15px;
            font-weight: 800;
            border-radius: 12px;
            opacity: 0.5;
            cursor: not-allowed;
            transition: all 0.2s;
          "
        >
          🔒 Complete All Checks to Launch AR
        </button>

        <button 
          id="btn-quick-verify" 
          class="btn-secondary" 
          style="
            width: 100%;
            padding: 10px;
            font-size: 12.5px;
            color: #64748b;
          "
        >
          ✓ Verify All for Testing
        </button>
      </div>
    </div>
  `;

  const launchBtn = container.querySelector('#btn-launch-ar-verified');
  const counterBadge = container.querySelector('#checklist-counter-badge');

  function updateChecklistState() {
    const total = checklistItems.length;
    const checkedCount = checkedSet.size;

    counterBadge.textContent = `${checkedCount} / ${total} Verified`;

    if (checkedCount === total) {
      counterBadge.style.background = '#dcfce7';
      counterBadge.style.color = '#15803d';

      launchBtn.disabled = false;
      launchBtn.style.opacity = '1';
      launchBtn.style.cursor = 'pointer';
      launchBtn.style.background = 'linear-gradient(135deg, #059669, #10b981)';
      launchBtn.textContent = '🚀 Start AR Simulation (Checks Complete)';
      playSuccessChime();
    } else {
      counterBadge.style.background = '#e0f2fe';
      counterBadge.style.color = '#0284c7';

      launchBtn.disabled = true;
      launchBtn.style.opacity = '0.5';
      launchBtn.style.cursor = 'not-allowed';
      launchBtn.style.background = 'linear-gradient(135deg, #0284c7, #0369a1)';
      launchBtn.textContent = `🔒 Complete All Checks (${checkedCount}/${total}) to Launch AR`;
    }
  }

  container.querySelectorAll('.checklist-checkbox').forEach(cb => {
    cb.addEventListener('change', () => {
      const id = cb.getAttribute('data-id');
      const row = cb.closest('.checklist-item-row');
      if (cb.checked) {
        checkedSet.add(id);
        if (row) {
          row.style.background = '#f0fdf4';
          row.style.borderColor = '#86efac';
        }
      } else {
        checkedSet.delete(id);
        if (row) {
          row.style.background = '#f8fafc';
          row.style.borderColor = '#e2e8f0';
        }
      }
      updateChecklistState();
    });
  });

  // Quick verify helper
  container.querySelector('#btn-quick-verify')?.addEventListener('click', () => {
    container.querySelectorAll('.checklist-checkbox').forEach(cb => {
      cb.checked = true;
      const id = cb.getAttribute('data-id');
      checkedSet.add(id);
      const row = cb.closest('.checklist-item-row');
      if (row) {
        row.style.background = '#f0fdf4';
        row.style.borderColor = '#86efac';
      }
    });
    updateChecklistState();
  });

  // Navigation handlers
  container.querySelector('#btn-checklist-back')?.addEventListener('click', () => {
    window.location.hash = `#briefing?scenario=${scenarioId}`;
  });

  launchBtn?.addEventListener('click', () => {
    if (checkedSet.size === checklistItems.length) {
      state.currentScenarioChecklistCompleted = true;
      state.currentScenarioId = scenarioId;
      window.location.hash = `#ar?scenario=${scenarioId}`;
    }
  });
}
