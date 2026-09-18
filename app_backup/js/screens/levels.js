// Levels Screen: Tiered Level Progression (Trainee -> Rescue Master)

import { t } from '../i18n.js';
import { LEVELS, getLevelDetails, BADGE_DEFINITIONS } from '../engine/gamification.js';

export function renderLevelsScreen(container, state) {
  const worker = state.worker || { xp: 120, level: 1 };
  const currentInfo = getLevelDetails(worker.xp);

  container.innerHTML = `
    <div style="padding-top: 8px;">
      <!-- Header -->
      <div style="margin-bottom: 20px;">
        <h2 style="font-size: 20px; font-weight: 800; color: var(--text-primary); margin-bottom: 4px;">
          ${t('nav_levels')} & Competency Tiers
        </h2>
        <p style="font-size: 13px; color: var(--text-secondary);">
          Statutory DGMS Vocational Progression System
        </p>
      </div>

      <!-- Current Tier Highlight Card -->
      <div style="background: linear-gradient(135deg, #1b3a5b, #0d233a); border-radius: var(--radius-xl); padding: 22px; color: #ffffff; margin-bottom: 24px; box-shadow: var(--shadow-md);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
          <span style="background: rgba(56, 189, 248, 0.2); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.4); font-size: 11px; font-weight: 700; padding: 4px 12px; border-radius: var(--radius-full);">
            CURRENT RANK
          </span>
          <span style="font-size: 13px; font-weight: 800; color: #fbbf24;">${worker.xp} XP</span>
        </div>

        <h3 style="font-size: 22px; font-weight: 900; margin-bottom: 4px;">${currentInfo.title}</h3>
        <p style="font-size: 12px; color: #94a3b8; margin-bottom: 18px;">
          ${currentInfo.xpToNext > 0 ? `${currentInfo.xpToNext} XP required for next level promotion` : 'Highest vocational qualification achieved'}
        </p>

        <div style="display: flex; justify-content: space-between; font-size: 11px; color: #94a3b8; margin-bottom: 6px;">
          <span>Tier Progress</span>
          <span style="color: #f1f5f9; font-weight: 700;">${currentInfo.progressPct}%</span>
        </div>
        <div class="progress-track">
          <div class="progress-bar-fill" style="width: ${currentInfo.progressPct}%;"></div>
        </div>
      </div>

      <!-- Tier List -->
      <h3 class="section-title">Certification Levels</h3>
      <div style="display: flex; flex-direction: column; gap: 14px; margin-bottom: 24px;">
        ${LEVELS.map(lvl => {
          const isUnlocked = worker.xp >= lvl.minXp;
          const isCurrent = currentInfo.level === lvl.level;

          return `
            <div style="background: #ffffff; border-radius: var(--radius-lg); padding: 16px; border: 1px solid ${isCurrent ? '#38bdf8' : '#e2e8f0'}; box-shadow: var(--shadow-sm); display: flex; justify-content: space-between; align-items: center; opacity: ${isUnlocked ? '1' : '0.65'};">
              <div style="display: flex; align-items: center; gap: 14px;">
                <div style="width: 44px; height: 44px; border-radius: 50%; background: ${isUnlocked ? '#e0f2fe' : '#f1f5f9'}; color: ${isUnlocked ? '#0284c7' : '#94a3b8'}; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 16px;">
                  ${lvl.level}
                </div>
                <div>
                  <div style="font-size: 14px; font-weight: 700; color: var(--text-primary);">${lvl.title}</div>
                  <div style="font-size: 11px; color: var(--text-secondary); margin-top: 2px;">
                    ${lvl.minXp} - ${lvl.maxXp === 99999 ? '1000+' : lvl.maxXp} XP
                  </div>
                </div>
              </div>
              <div>
                ${isCurrent ? `
                  <span style="background: #e0f2fe; color: #0284c7; font-size: 11px; font-weight: 800; padding: 4px 10px; border-radius: var(--radius-full);">ACTIVE</span>
                ` : (isUnlocked ? `
                  <span style="color: #10b981; font-size: 18px; font-weight: 800;">✓</span>
                ` : `
                  <span style="color: #94a3b8; font-size: 16px;">🔒</span>
                `)}
              </div>
            </div>
          `;
        }).join('')}
      </div>

      <!-- Earned Badges -->
      <h3 class="section-title">Vocational Badges</h3>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 24px;">
        ${BADGE_DEFINITIONS.map(b => `
          <div style="background: #ffffff; border-radius: var(--radius-md); padding: 12px; border: 1px solid #e2e8f0; display: flex; align-items: flex-start; gap: 10px;">
            <span style="font-size: 24px;">${b.icon}</span>
            <div>
              <div style="font-size: 12px; font-weight: 700; color: var(--text-primary);">${b.title}</div>
              <div style="font-size: 10.5px; color: var(--text-muted); margin-top: 3px; line-height: 1.3;">${b.desc}</div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}
