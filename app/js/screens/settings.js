// Settings Screen: Display Cutout / Notch Testing, Audio Accessibility, Offline Sync & Profile

import { t } from '../i18n.js';
import { setVoiceEnabled, setSoundEnabled } from '../voice.js';
import { syncPendingData } from '../sync.js';

export function renderSettingsScreen(container, state) {
  const worker = state.worker || { name: "Anik Mondol", mine_location: "Dhanbad Seam #4" };

  // Detect current notch simulation class on document.body
  const bodyClasses = document.body.className;
  let activeNotch = 'none';
  if (bodyClasses.includes('notch-punch-center')) activeNotch = 'center';
  else if (bodyClasses.includes('notch-punch-corner')) activeNotch = 'corner';
  else if (bodyClasses.includes('notch-large')) activeNotch = 'large';
  else if (bodyClasses.includes('notch-waterdrop')) activeNotch = 'waterdrop';

  container.innerHTML = `
    <div style="padding-top: 8px;">
      <div style="margin-bottom: 20px;">
        <h2 style="font-size: 20px; font-weight: 800; color: var(--text-primary); margin-bottom: 4px;">
          ${t('nav_settings')}
        </h2>
        <p style="font-size: 13px; color: var(--text-secondary);">
          ${t('settings_title')}
        </p>
      </div>

      <!-- Worker Profile Summary -->
      <div style="background: #ffffff; border-radius: var(--radius-xl); padding: 18px; border: 1px solid #e2e8f0; box-shadow: var(--shadow-sm); display: flex; align-items: center; gap: 14px; margin-bottom: 20px;">
        <img src="/assets/images/worker_avatar.svg" alt="Trainee Avatar" style="width: 54px; height: 54px; border-radius: 50%; border: 2px solid #0284c7;" />
        <div>
          <h3 style="font-size: 16px; font-weight: 800; color: var(--text-primary);">${worker.name}</h3>
          <div style="font-size: 12px; color: var(--text-secondary); margin-top: 2px;">${worker.mine_location}</div>
          <span style="display: inline-block; background: #e0f2fe; color: #0369a1; font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: var(--radius-full); margin-top: 4px;">
            ${t('role_worker')}: ${worker.name}
          </span>
        </div>
      </div>

      <!-- Display Cutout / Notch Testing Simulator -->
      <div style="background: #ffffff; border-radius: var(--radius-xl); padding: 18px; border: 1px solid #e2e8f0; box-shadow: var(--shadow-sm); margin-bottom: 20px;">
        <h3 style="font-size: 14px; font-weight: 800; color: var(--text-primary); margin-bottom: 6px;">
          📱 ${t('notch_simulator_title')}
        </h3>
        <p style="font-size: 11.5px; color: var(--text-secondary); margin-bottom: 12px; line-height: 1.4;">
          Interactive hardware display cutouts to verify safe UI padding and AR camera alignment across standard and cut-out phone screens.
        </p>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 8px;">
          <button class="deck-btn ${activeNotch === 'none' ? 'selected' : ''}" data-notch="none" style="justify-content: center; font-size: 11px;">
            ${t('notch_none')}
          </button>
          <button class="deck-btn ${activeNotch === 'center' ? 'selected' : ''}" data-notch="center" style="justify-content: center; font-size: 11px;">
            ${t('notch_center')}
          </button>
          <button class="deck-btn ${activeNotch === 'corner' ? 'selected' : ''}" data-notch="corner" style="justify-content: center; font-size: 11px;">
            ${t('notch_corner')}
          </button>
          <button class="deck-btn ${activeNotch === 'large' ? 'selected' : ''}" data-notch="large" style="justify-content: center; font-size: 11px;">
            ${t('notch_large')}
          </button>
          <button class="deck-btn ${activeNotch === 'waterdrop' ? 'selected' : ''}" data-notch="waterdrop" style="justify-content: center; font-size: 11px;">
            ${t('notch_waterdrop')}
          </button>
        </div>
      </div>

      <!-- Toggles: Voice & Sound -->
      <div style="background: #ffffff; border-radius: var(--radius-xl); padding: 18px; border: 1px solid #e2e8f0; box-shadow: var(--shadow-sm); margin-bottom: 20px;">
        <h3 style="font-size: 14px; font-weight: 800; color: var(--text-primary); margin-bottom: 14px;">
          🔊 ${t('voice_guidance_toggle')}
        </h3>

        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <div>
            <div style="font-size: 13px; font-weight: 700; color: #1e293b;">${t('voice_guidance_toggle')}</div>
            <div style="font-size: 11px; color: var(--text-secondary);">${t('app_subtitle')}</div>
          </div>
          <input type="checkbox" id="toggle-voice" checked style="width: 20px; height: 20px; accent-color: #0284c7;" />
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <div style="font-size: 13px; font-weight: 700; color: #1e293b;">${t('sound_effects_toggle')}</div>
            <div style="font-size: 11px; color: var(--text-secondary);">${t('sim_fire_title')}</div>
          </div>
          <input type="checkbox" id="toggle-sound" checked style="width: 20px; height: 20px; accent-color: #0284c7;" />
        </div>
      </div>

      <!-- Offline & Cloud Sync -->
      <div style="background: #ffffff; border-radius: var(--radius-xl); padding: 18px; border: 1px solid #e2e8f0; box-shadow: var(--shadow-sm); margin-bottom: 20px;">
        <h3 style="font-size: 14px; font-weight: 800; color: var(--text-primary); margin-bottom: 8px;">
          ☁️ ${t('offline_cache_title')}
        </h3>
        <p style="font-size: 12px; color: var(--text-secondary); line-height: 1.5; margin-bottom: 14px;">
          ${t('offline_cache_desc')}
        </p>
        <button id="btn-sync-now" class="btn-secondary" style="width: 100%; padding: 10px; font-size: 12px;">
          🔄 ${t('sync_now_btn')}
        </button>
      </div>

      <!-- Reset Training Progress -->
      <div style="background: #ffffff; border-radius: var(--radius-xl); padding: 18px; border: 1px solid #e2e8f0; box-shadow: var(--shadow-sm); margin-bottom: 24px;">
        <button id="btn-reset-data" class="btn-secondary" style="width: 100%; padding: 10px; font-size: 12px; color: #ef4444; border-color: #fca5a5;">
          🗑️ ${t('reset_demo_data')}
        </button>
      </div>
    </div>
  `;

  // Bind Notch Simulator Toggles
  container.querySelectorAll('[data-notch]').forEach(btn => {
    btn.addEventListener('click', () => {
      const mode = btn.getAttribute('data-notch');
      // Remove all notch classes
      document.body.classList.remove('notch-punch-center', 'notch-punch-corner', 'notch-large', 'notch-waterdrop');
      if (mode === 'center') document.body.classList.add('notch-punch-center');
      else if (mode === 'corner') document.body.classList.add('notch-punch-corner');
      else if (mode === 'large') document.body.classList.add('notch-large');
      else if (mode === 'waterdrop') document.body.classList.add('notch-waterdrop');

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
    alert(t('online_status'));
  });

  // Bind Reset
  container.querySelector('#btn-reset-data')?.addEventListener('click', () => {
    if (confirm(t('reset_demo_data') + "?")) {
      if (state.worker) {
        state.worker.xp = 120;
        state.worker.level = 1;
        state.worker.progress_pct = 28;
        state.worker.competency_score = 78.5;
      }
      window.location.hash = '#home';
    }
  });
}
