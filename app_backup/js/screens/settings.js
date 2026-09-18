// Settings Screen: Multilingual, Voice, Sound, Offline Sync & Profile

import { t, setLanguage, getLanguage } from '../i18n.js';
import { setVoiceEnabled, setSoundEnabled } from '../voice.js';
import { syncPendingData } from '../sync.js';

export function renderSettingsScreen(container, state) {
  const currentLang = getLanguage();
  const worker = state.worker || { name: "Suresh", mine_location: "Dhanbad Seam #4" };

  container.innerHTML = `
    <div style="padding-top: 8px;">
      <div style="margin-bottom: 20px;">
        <h2 style="font-size: 20px; font-weight: 800; color: var(--text-primary); margin-bottom: 4px;">
          ${t('nav_settings')}
        </h2>
        <p style="font-size: 13px; color: var(--text-secondary);">
          Preferences, Language, Voice & Offline Data Controls
        </p>
      </div>

      <!-- Worker Profile Summary -->
      <div style="background: #ffffff; border-radius: var(--radius-xl); padding: 18px; border: 1px solid #e2e8f0; box-shadow: var(--shadow-sm); display: flex; align-items: center; gap: 14px; margin-bottom: 20px;">
        <img src="/assets/images/worker_avatar.svg" alt="Suresh" style="width: 54px; height: 54px; border-radius: 50%; border: 2px solid #0284c7;" />
        <div>
          <h3 style="font-size: 16px; font-weight: 800; color: var(--text-primary);">${worker.name}</h3>
          <div style="font-size: 12px; color: var(--text-secondary); margin-top: 2px;">${worker.mine_location}</div>
          <span style="display: inline-block; background: #e0f2fe; color: #0369a1; font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: var(--radius-full); margin-top: 4px;">
            ROLE: Underground Trainee
          </span>
        </div>
      </div>

      <!-- Language Selector -->
      <div style="background: #ffffff; border-radius: var(--radius-xl); padding: 18px; border: 1px solid #e2e8f0; box-shadow: var(--shadow-sm); margin-bottom: 20px;">
        <h3 style="font-size: 14px; font-weight: 800; color: var(--text-primary); margin-bottom: 12px;">
          🌐 Multilingual Language (Jharkhand Seams)
        </h3>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;">
          <button class="deck-btn ${currentLang === 'en' ? 'selected' : ''}" data-lang="en" style="justify-content: center;">
            English
          </button>
          <button class="deck-btn ${currentLang === 'hi' ? 'selected' : ''}" data-lang="hi" style="justify-content: center;">
            हिन्दी (Hindi)
          </button>
          <button class="deck-btn ${currentLang === 'sat' ? 'selected' : ''}" data-lang="sat" style="justify-content: center;">
            संताली (Santali)
          </button>
        </div>
      </div>

      <!-- Toggles: Voice & Sound -->
      <div style="background: #ffffff; border-radius: var(--radius-xl); padding: 18px; border: 1px solid #e2e8f0; box-shadow: var(--shadow-sm); margin-bottom: 20px;">
        <h3 style="font-size: 14px; font-weight: 800; color: var(--text-primary); margin-bottom: 14px;">
          Audio & Accessibility
        </h3>

        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <div>
            <div style="font-size: 13px; font-weight: 700; color: #1e293b;">Web Speech Voice Guidance</div>
            <div style="font-size: 11px; color: var(--text-secondary);">Spoken safety instructions & emergency warnings</div>
          </div>
          <input type="checkbox" id="toggle-voice" checked style="width: 20px; height: 20px; accent-color: #0284c7;" />
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <div style="font-size: 13px; font-weight: 700; color: #1e293b;">Mine Siren & Sound Effects</div>
            <div style="font-size: 11px; color: var(--text-secondary);">Web Audio synthetic alarms & combustion hiss</div>
          </div>
          <input type="checkbox" id="toggle-sound" checked style="width: 20px; height: 20px; accent-color: #0284c7;" />
        </div>
      </div>

      <!-- Offline & Cloud Sync -->
      <div style="background: #ffffff; border-radius: var(--radius-xl); padding: 18px; border: 1px solid #e2e8f0; box-shadow: var(--shadow-sm); margin-bottom: 20px;">
        <h3 style="font-size: 14px; font-weight: 800; color: var(--text-primary); margin-bottom: 8px;">
          Offline-First Cache & Cloud Sync
        </h3>
        <p style="font-size: 12px; color: var(--text-secondary); line-height: 1.5; margin-bottom: 14px;">
          All scenarios, 3D simulations, and attempt evaluations run 100% offline inside coal mines. Pending attempts sync automatically when connected.
        </p>
        <button id="btn-sync-now" class="btn-secondary" style="width: 100%; padding: 10px; font-size: 12px;">
          🔄 Sync Local Data with Cloud Now
        </button>
      </div>

      <!-- Reset Training Progress -->
      <div style="background: #ffffff; border-radius: var(--radius-xl); padding: 18px; border: 1px solid #e2e8f0; box-shadow: var(--shadow-sm); margin-bottom: 24px;">
        <button id="btn-reset-data" class="btn-secondary" style="width: 100%; padding: 10px; font-size: 12px; color: #ef4444; border-color: #fca5a5;">
          🗑️ Reset Demo Training Progress
        </button>
      </div>
    </div>
  `;

  // Bind Language Toggles
  container.querySelectorAll('[data-lang]').forEach(btn => {
    btn.addEventListener('click', () => {
      const lang = btn.getAttribute('data-lang');
      setLanguage(lang);
      renderSettingsScreen(container, state);
    });
  });

  // Bind Audio Toggles
  container.querySelector('#toggle-voice')?.addEventListener('change', (e) => {
    setVoiceEnabled(e.target.checked);
  });

  container.querySelector('#toggle-sound')?.addEventListener('change', (e) => {
    setSoundEnabled(e.target.checked);
  });

  // Bind Sync
  container.querySelector('#btn-sync-now')?.addEventListener('click', async () => {
    await syncPendingData();
    alert("Cloud Sync completed successfully!");
  });

  // Bind Reset
  container.querySelector('#btn-reset-data')?.addEventListener('click', () => {
    if (confirm("Reset all drill progress and return to default state?")) {
      if (state.worker) {
        state.worker.xp = 120;
        state.worker.level = 1;
        state.worker.progress_pct = 28;
        state.worker.competency_score = 78.5;
      }
      alert("Training progress reset to baseline.");
      window.location.hash = '#home';
    }
  });
}
