// Progress Screen: Worker Competency Dashboard & Telemetry History

import { t } from '../i18n.js';
import { getLevelDetails } from '../engine/gamification.js';

export function renderProgressScreen(container, state) {
  const worker = state.worker || {
    name: "Anik Mondol",
    level: 1,
    xp: 120,
    progress_pct: 28,
    competency_score: 78.5,
    streaks: 4
  };

  const levelInfo = getLevelDetails(worker.xp);

  container.innerHTML = `
    <div style="padding-top: 8px;">
      <!-- Header -->
      <div style="margin-bottom: 20px;">
        <h2 style="font-size: 20px; font-weight: 800; color: var(--text-primary); margin-bottom: 4px;">
          ${t('nav_progress')} & ${t('competency_score')}
        </h2>
        <p style="font-size: 13px; color: var(--text-secondary);">
          ${t('assessment_telemetry')}
        </p>
      </div>

      <!-- Main Overview Card -->
      <div style="background: #ffffff; border-radius: var(--radius-xl); padding: 20px; border: 1px solid #e2e8f0; box-shadow: var(--shadow-sm); margin-bottom: 20px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <div>
            <span style="font-size: 11px; text-transform: uppercase; font-weight: 700; color: var(--text-muted);">
              ${t('competency_index')}
            </span>
            <div style="font-size: 32px; font-weight: 900; color: #0284c7; margin-top: 2px;">
              ${worker.competency_score}%
            </div>
          </div>
          <div style="text-align: right;">
            <span style="background: #d1fae5; color: #065f46; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: var(--radius-full);">
              🟢 ${t('status_competent')}
            </span>
            <div style="font-size: 12px; color: var(--text-secondary); margin-top: 6px;">
              🔥 ${worker.streaks} ${t('day_streak')}
            </div>
          </div>
        </div>

        <div style="font-size: 11px; font-weight: 600; color: #64748b; margin-bottom: 6px; display: flex; justify-content: space-between;">
          <span>${t('curriculum_mastery')}</span>
          <span>${worker.progress_pct}%</span>
        </div>
        <div class="progress-track">
          <div class="progress-bar-fill" style="width: ${worker.progress_pct}%;"></div>
        </div>
      </div>

      <!-- 4 Pillars Breakdown -->
      <div style="background: #ffffff; border-radius: var(--radius-xl); padding: 20px; border: 1px solid #e2e8f0; box-shadow: var(--shadow-sm); margin-bottom: 20px;">
        <h3 style="font-size: 14px; font-weight: 700; color: var(--text-primary); margin-bottom: 16px;">
          ${t('assessment_telemetry')}
        </h3>

        <div class="pillar-row">
          <div class="pillar-labels">
            <span>${t('pillar_accuracy')}</span>
            <span style="font-weight: 700; color: #10b981;">88.0%</span>
          </div>
          <div class="pillar-track">
            <div class="pillar-fill high" style="width: 88%;"></div>
          </div>
        </div>

        <div class="pillar-row">
          <div class="pillar-labels">
            <span>${t('pillar_speed')}</span>
            <span style="font-weight: 700; color: #10b981;">82.5%</span>
          </div>
          <div class="pillar-track">
            <div class="pillar-fill high" style="width: 82.5%;"></div>
          </div>
        </div>

        <div class="pillar-row">
          <div class="pillar-labels">
            <span>${t('pillar_procedure')}</span>
            <span style="font-weight: 700; color: #10b981;">85.0%</span>
          </div>
          <div class="pillar-track">
            <div class="pillar-fill high" style="width: 85%;"></div>
          </div>
        </div>

        <div class="pillar-row">
          <div class="pillar-labels">
            <span>${t('pillar_hazard_rec')}</span>
            <span style="font-weight: 700; color: #f59e0b;">74.0%</span>
          </div>
          <div class="pillar-track">
            <div class="pillar-fill mid" style="width: 74%;"></div>
          </div>
        </div>
      </div>

      <!-- Training Metrics Grid -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px;">
        <div style="background: #ffffff; padding: 16px; border-radius: var(--radius-lg); border: 1px solid #e2e8f0; text-align: center;">
          <div style="font-size: 11px; color: var(--text-muted); font-weight: 700;">${t('avg_reaction')}</div>
          <div style="font-size: 22px; font-weight: 800; color: #0f172a; margin-top: 4px;">3.8s</div>
          <div style="font-size: 11px; color: #10b981; margin-top: 2px;">⚡ ${t('under_threshold')}</div>
        </div>

        <div style="background: #ffffff; padding: 16px; border-radius: var(--radius-lg); border: 1px solid #e2e8f0; text-align: center;">
          <div style="font-size: 11px; color: var(--text-muted); font-weight: 700;">${t('safety_penalties')}</div>
          <div style="font-size: 22px; font-weight: 800; color: #0f172a; margin-top: 4px;">0</div>
          <div style="font-size: 11px; color: #10b981; margin-top: 2px;">✓ ${t('zero_penalties')}</div>
        </div>
      </div>

      <!-- Certificate Action -->
      <button id="btn-progress-cert" class="btn-primary" style="width: 100%; padding: 14px; font-size: 14px; margin-bottom: 24px;">
        📜 ${t('view_verifiable_cert')}
      </button>
    </div>
  `;

  container.querySelector('#btn-progress-cert')?.addEventListener('click', () => {
    window.location.hash = '#certificate';
  });
}
