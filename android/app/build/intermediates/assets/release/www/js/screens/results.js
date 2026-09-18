// Results & Competency Assessment Screen

import { t } from '../i18n.js';
import { speak, playSuccessChime } from '../voice.js';

export function renderResultsScreen(container, state) {
  const result = state.lastAttemptResult || {
    evaluation: {
      xpEarned: 115,
      competency: 88.5,
      accuracy: 95.0,
      speed: 94.0,
      procedure: 100.0,
      hazardRec: 92.0,
      passed: true,
      newBadges: ["⚡ Rapid Responder", "🔥 Fire Safety Rookie"]
    },
    telemetry: {
      duration_ms: 18400,
      hazard_rec_ms: 3200,
      mistakes: []
    }
  };

  const evalData = result.evaluation;
  const isRetrainingNeeded = evalData.competency < 70 || (result.telemetry.mistakes && result.telemetry.mistakes.length > 0);

  playSuccessChime();
  speak(`Drill completed. Competency score: ${evalData.competency} percent. You earned ${evalData.xpEarned} XP.`);

  container.innerHTML = `
    <div style="padding-top: 10px;">
      <!-- Hero Header -->
      <div style="text-align: center; margin-bottom: 20px;">
        <div style="display: inline-block; background: #d1fae5; color: #065f46; font-size: 13px; font-weight: 800; padding: 6px 18px; border-radius: var(--radius-full); margin-bottom: 8px;">
          ✓ ${t('drill_completed')}
        </div>
        <h2 style="font-size: 22px; font-weight: 800; color: var(--text-primary);">
          ${t('assessment_telemetry')}
        </h2>
        <p style="font-size: 13px; color: var(--text-secondary);">
          ${t('results_title')}
        </p>
      </div>

      <!-- XP & Competency Score Cards -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px;">
        <div style="background: linear-gradient(135deg, #1b3a5b, #0284c7); border-radius: var(--radius-lg); padding: 16px; color: #ffffff; text-align: center;">
          <div style="font-size: 11px; text-transform: uppercase; font-weight: 700; color: #93c5fd; margin-bottom: 4px;">${t('xp_earned')}</div>
          <div style="font-size: 28px; font-weight: 900; color: #fbbf24;">+${evalData.xpEarned}</div>
          <div style="font-size: 11px; color: #e0f2fe;">XP: ${state.worker?.xp || 235}</div>
        </div>

        <div style="background: #ffffff; border-radius: var(--radius-lg); padding: 16px; border: 1px solid #e2e8f0; text-align: center; box-shadow: var(--shadow-sm);">
          <div style="font-size: 11px; text-transform: uppercase; font-weight: 700; color: var(--text-muted); margin-bottom: 4px;">${t('competency_score')}</div>
          <div style="font-size: 28px; font-weight: 900; color: #10b981;">${evalData.competency}%</div>
          <div style="font-size: 11px; color: #059669; font-weight: 600;">${t('status_competent')}</div>
        </div>
      </div>

      <!-- Before vs After Reaction Improvement -->
      <div style="background: #ffffff; border-radius: var(--radius-xl); padding: 18px; border: 1px solid #e2e8f0; box-shadow: var(--shadow-sm); margin-bottom: 20px;">
        <h3 style="font-size: 14px; font-weight: 700; color: var(--text-primary); margin-bottom: 12px; display: flex; align-items: center; gap: 6px;">
          <span>⚡</span> ${t('reaction_timing')}
        </h3>
        <div style="display: flex; justify-content: space-between; align-items: center; background: #f8fafc; border-radius: var(--radius-md); padding: 12px 16px;">
          <div>
            <div style="font-size: 11px; color: #64748b;">${t('benchmark_target')}</div>
            <div style="font-size: 16px; font-weight: 700; color: #64748b;">5.00s</div>
          </div>
          <div style="font-size: 20px; color: #10b981; font-weight: 800;">➔</div>
          <div>
            <div style="font-size: 11px; color: #059669; font-weight: 700;">${t('recorded_time')}</div>
            <div style="font-size: 16px; font-weight: 800; color: #059669;">${(result.telemetry.hazard_rec_ms / 1000).toFixed(2)}s</div>
          </div>
          <div style="background: #dcfce7; color: #15803d; font-size: 11px; font-weight: 800; padding: 4px 10px; border-radius: var(--radius-full);">
            ${t('timing_logged')}
          </div>
        </div>
      </div>

      <!-- 4 Competency Pillars -->
      <div style="background: #ffffff; border-radius: var(--radius-xl); padding: 18px; border: 1px solid #e2e8f0; box-shadow: var(--shadow-sm); margin-bottom: 20px;">
        <h3 style="font-size: 14px; font-weight: 700; color: var(--text-primary); margin-bottom: 14px;">
          ${t('assessment_telemetry')}
        </h3>

        <div class="pillar-row">
          <div class="pillar-labels">
            <span>${t('pillar_accuracy')}</span>
            <span>${evalData.accuracy}%</span>
          </div>
          <div class="pillar-track">
            <div class="pillar-fill high" style="width: ${evalData.accuracy}%;"></div>
          </div>
        </div>

        <div class="pillar-row">
          <div class="pillar-labels">
            <span>${t('pillar_speed')}</span>
            <span>${evalData.speed}%</span>
          </div>
          <div class="pillar-track">
            <div class="pillar-fill high" style="width: ${evalData.speed}%;"></div>
          </div>
        </div>

        <div class="pillar-row">
          <div class="pillar-labels">
            <span>${t('pillar_procedure')}</span>
            <span>${evalData.procedure}%</span>
          </div>
          <div class="pillar-track">
            <div class="pillar-fill high" style="width: ${evalData.procedure}%;"></div>
          </div>
        </div>

        <div class="pillar-row">
          <div class="pillar-labels">
            <span>${t('pillar_hazard_rec')}</span>
            <span>${evalData.hazardRec}%</span>
          </div>
          <div class="pillar-track">
            <div class="pillar-fill high" style="width: ${evalData.hazardRec}%;"></div>
          </div>
        </div>
      </div>

      <!-- Badges Unlocked Section -->
      ${evalData.newBadges && evalData.newBadges.length > 0 ? `
        <div style="background: linear-gradient(135deg, #fffbeb, #fef3c7); border: 1px solid #fde68a; border-radius: var(--radius-xl); padding: 16px; margin-bottom: 20px;">
          <h3 style="font-size: 13px; font-weight: 800; color: #b45309; margin-bottom: 10px; display: flex; align-items: center; gap: 6px;">
            <span>🏅</span> ${t('badges_unlocked')}
          </h3>
          <div style="display: flex; gap: 8px; flex-wrap: wrap;">
            ${evalData.newBadges.map(b => `
              <span style="background: #ffffff; color: #92400e; font-size: 12px; font-weight: 700; padding: 6px 12px; border-radius: var(--radius-full); box-shadow: var(--shadow-sm);">
                ${b}
              </span>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <!-- Action Navigation -->
      <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px;">
        <button id="btn-view-cert" class="btn-primary" style="width: 100%; padding: 14px; font-size: 14px; background: linear-gradient(135deg, #0b1f33, #1e3a8a);">
          📜 ${t('view_verifiable_cert')}
        </button>
        <button id="btn-return-home" class="btn-secondary" style="width: 100%; padding: 12px; font-size: 14px;">
          🏠 ${t('return_worker_home')}
        </button>
      </div>
    </div>
  `;

  container.querySelector('#btn-view-cert')?.addEventListener('click', () => {
    window.location.hash = '#certificate';
  });

  container.querySelector('#btn-return-home')?.addEventListener('click', () => {
    window.location.hash = '#home';
  });
}
