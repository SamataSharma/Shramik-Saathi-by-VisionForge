// Dedicated Vocational Training Section for VISIONFORGE - MINE AR
// Industrial underground coal mining safety curriculum compliant with DGMS & CMR 2017

import { t } from '../i18n.js';

export function renderVocationalScreen(container, state) {
  const worker = state.worker || {};

  container.innerHTML = `
    <div id="vocational-screen" style="padding-top: 4px; padding-bottom: 24px;">
      <!-- Header with Back button -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <div style="display: flex; align-items: center; gap: 10px;">
          <button id="btn-vocational-back" class="btn-secondary" style="padding: 6px 12px; border-radius: var(--radius-full);">
            ← ${t('back')}
          </button>
          <h2 style="font-size: 18px; font-weight: 800; color: var(--text-primary); margin: 0;">
            ${t('vocational')}
          </h2>
        </div>
        <span style="font-size: 11px; font-weight: 700; color: #0284c7; background: #e0f2fe; padding: 4px 10px; border-radius: 9999px;">
          DGMS CMR 2017
        </span>
      </div>

      <!-- Hero Banner -->
      <div style="
        background: linear-gradient(135deg, #0b1f33 0%, #1b3a5b 100%);
        color: #ffffff;
        border-radius: var(--radius-xl);
        padding: 20px;
        margin-bottom: 20px;
        box-shadow: var(--shadow-md);
      ">
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
          <span style="font-size: 24px;">⚒️</span>
          <h3 style="margin: 0; font-size: 16px; font-weight: 800; color: #38bdf8;">
            ${t('voc_hero_title')}
          </h3>
        </div>
        <p style="margin: 0; font-size: 12px; color: #cbd5e1; line-height: 1.5;">
          ${t('voc_hero_desc')}
        </p>
      </div>

      <!-- Vocational Modules Grid -->
      <div style="display: flex; flex-direction: column; gap: 14px;">
        <!-- Module 1: CMR 2017 -->
        <article class="voc-card" data-route="lessons" style="
          background: #ffffff;
          border-radius: var(--radius-lg);
          padding: 16px;
          border: 1px solid #e2e8f0;
          box-shadow: var(--shadow-sm);
          cursor: pointer;
        ">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="font-size: 22px;">📜</span>
              <h4 style="margin: 0; font-size: 14px; font-weight: 800; color: var(--text-primary);">
                ${t('voc_mod1_title')}
              </h4>
            </div>
            <span class="card-pill-tag pill-lessons">${t('completed_badge')}</span>
          </div>
          <p style="margin: 0 0 12px 0; font-size: 12px; color: var(--text-secondary); line-height: 1.4;">
            ${t('voc_mod1_desc')}
          </p>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 11px; font-weight: 700; color: #0284c7;">CMR Reg. 37, 43</span>
            <button class="btn-secondary" style="padding: 6px 14px; font-size: 11.5px; border-radius: 9999px;">
              ${t('start_module')} →
            </button>
          </div>
        </article>

        <!-- Module 2: Mine Ventilation & Gas Detection -->
        <article class="voc-card" data-route="ar" data-scenario="sim_gas_confined" style="
          background: #ffffff;
          border-radius: var(--radius-lg);
          padding: 16px;
          border: 1px solid #e2e8f0;
          box-shadow: var(--shadow-sm);
          cursor: pointer;
        ">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="font-size: 22px;">💨</span>
              <h4 style="margin: 0; font-size: 14px; font-weight: 800; color: var(--text-primary);">
                ${t('voc_mod2_title')}
              </h4>
            </div>
            <span class="card-pill-tag pill-games">AR Simulation</span>
          </div>
          <p style="margin: 0 0 12px 0; font-size: 12px; color: var(--text-secondary); line-height: 1.4;">
            ${t('voc_mod2_desc')}
          </p>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 11px; font-weight: 700; color: #0284c7;">CMR Reg. 153, 169</span>
            <button class="btn-primary" style="padding: 6px 14px; font-size: 11.5px; border-radius: 9999px;">
              ${t('start_module')} →
            </button>
          </div>
        </article>

        <!-- Module 3: Strata Control & SSR -->
        <article class="voc-card" data-route="ar" data-scenario="sim_roof_strata" style="
          background: #ffffff;
          border-radius: var(--radius-lg);
          padding: 16px;
          border: 1px solid #e2e8f0;
          box-shadow: var(--shadow-sm);
          cursor: pointer;
        ">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="font-size: 22px;">🪨</span>
              <h4 style="margin: 0; font-size: 14px; font-weight: 800; color: var(--text-primary);">
                ${t('voc_mod3_title')}
              </h4>
            </div>
            <span class="card-pill-tag pill-games">AR Simulation</span>
          </div>
          <p style="margin: 0 0 12px 0; font-size: 12px; color: var(--text-secondary); line-height: 1.4;">
            ${t('voc_mod3_desc')}
          </p>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 11px; font-weight: 700; color: #0284c7;">CMR Reg. 123 (SSR)</span>
            <button class="btn-primary" style="padding: 6px 14px; font-size: 11.5px; border-radius: 9999px;">
              ${t('start_module')} →
            </button>
          </div>
        </article>

        <!-- Module 4: Electrical Isolation & LOTO -->
        <article class="voc-card" data-route="games" style="
          background: #ffffff;
          border-radius: var(--radius-lg);
          padding: 16px;
          border: 1px solid #e2e8f0;
          box-shadow: var(--shadow-sm);
          cursor: pointer;
        ">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="font-size: 22px;">⚡</span>
              <h4 style="margin: 0; font-size: 14px; font-weight: 800; color: var(--text-primary);">
                ${t('voc_mod4_title')}
              </h4>
            </div>
            <span class="card-pill-tag pill-games">Practice Game</span>
          </div>
          <p style="margin: 0 0 12px 0; font-size: 12px; color: var(--text-secondary); line-height: 1.4;">
            ${t('voc_mod4_desc')}
          </p>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 11px; font-weight: 700; color: #0284c7;">CEA Rules 2010</span>
            <button class="btn-secondary" style="padding: 6px 14px; font-size: 11.5px; border-radius: 9999px;">
              ${t('start_module')} →
            </button>
          </div>
        </article>

        <!-- Module 5: Belt Conveyor Safety -->
        <article class="voc-card" data-route="ar" data-scenario="sim_fire_explosion" style="
          background: #ffffff;
          border-radius: var(--radius-lg);
          padding: 16px;
          border: 1px solid #e2e8f0;
          box-shadow: var(--shadow-sm);
          cursor: pointer;
        ">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="font-size: 22px;">🔥</span>
              <h4 style="margin: 0; font-size: 14px; font-weight: 800; color: var(--text-primary);">
                ${t('voc_mod5_title')}
              </h4>
            </div>
            <span class="card-pill-tag pill-games">AR Simulation</span>
          </div>
          <p style="margin: 0 0 12px 0; font-size: 12px; color: var(--text-secondary); line-height: 1.4;">
            ${t('voc_mod5_desc')}
          </p>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 11px; font-weight: 700; color: #0284c7;">CMR Reg. 92, 136</span>
            <button class="btn-primary" style="padding: 6px 14px; font-size: 11.5px; border-radius: 9999px;">
              ${t('start_module')} →
            </button>
          </div>
        </article>

        <!-- Module 6: Self-Rescuer & Evacuation -->
        <article class="voc-card" data-route="ar" data-scenario="sim_emergency_evac" style="
          background: #ffffff;
          border-radius: var(--radius-lg);
          padding: 16px;
          border: 1px solid #e2e8f0;
          box-shadow: var(--shadow-sm);
          cursor: pointer;
        ">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="font-size: 22px;">🚨</span>
              <h4 style="margin: 0; font-size: 14px; font-weight: 800; color: var(--text-primary);">
                ${t('voc_mod6_title')}
              </h4>
            </div>
            <span class="card-pill-tag pill-games">AR Simulation</span>
          </div>
          <p style="margin: 0 0 12px 0; font-size: 12px; color: var(--text-secondary); line-height: 1.4;">
            ${t('voc_mod6_desc')}
          </p>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 11px; font-weight: 700; color: #0284c7;">CMR Reg. 215, 239</span>
            <button class="btn-primary" style="padding: 6px 14px; font-size: 11.5px; border-radius: 9999px;">
              ${t('start_module')} →
            </button>
          </div>
        </article>
      </div>
    </div>
  `;

  // Attach navigation
  container.querySelector('#btn-vocational-back')?.addEventListener('click', () => {
    window.location.hash = '#home';
  });

  container.querySelectorAll('.voc-card').forEach(card => {
    card.addEventListener('click', () => {
      const route = card.getAttribute('data-route');
      const scenario = card.getAttribute('data-scenario');
      if (scenario) {
        window.location.hash = `#${route}?scenario=${scenario}`;
      } else {
        window.location.hash = `#${route}`;
      }
    });
  });
}
