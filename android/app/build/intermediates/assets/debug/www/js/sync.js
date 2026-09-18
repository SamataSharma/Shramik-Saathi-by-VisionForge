// Offline Synchronization Manager (IndexedDB <-> FastAPI)

import { getPendingOfflineAttempts, clearPendingOfflineAttempts, saveLocalWorker } from './db.js';
import { t } from './i18n.js';

let isOnline = navigator.onLine;

export function initSyncEngine() {
  updateSyncUI();

  window.addEventListener('online', async () => {
    isOnline = true;
    updateSyncUI();
    console.log('[SyncEngine] Network reconnected. Syncing offline attempts...');
    await syncPendingData();
  });

  window.addEventListener('offline', () => {
    isOnline = false;
    updateSyncUI();
    console.log('[SyncEngine] Offline mode engaged. All attempts will persist locally.');
  });
}

export function getNetworkStatus() {
  return isOnline;
}

export function updateSyncUI() {
  const syncPill = document.getElementById('sync-status-pill');
  if (!syncPill) return;

  if (isOnline) {
    syncPill.className = 'sync-status-pill';
    syncPill.innerHTML = `<span class="sync-dot"></span> <span>${t('online_status')}</span>`;
  } else {
    syncPill.className = 'sync-status-pill offline';
    syncPill.innerHTML = `<span class="sync-dot"></span> <span>${t('offline_status')}</span>`;
  }
}

export async function syncPendingData() {
  if (!navigator.onLine) return;

  const pending = await getPendingOfflineAttempts();
  if (!pending || pending.length === 0) return;

  try {
    const payload = {
      worker_id: pending[0]?.worker_id || 'anik01',
      attempts: pending.map(p => ({
        worker_id: p.worker_id,
        scenario_id: p.scenario_id,
        duration_ms: p.duration_ms,
        hazard_rec_ms: p.hazard_rec_ms,
        equipment_selected: p.equipment_selected,
        approach_position: p.approach_position,
        pass_steps_completed: p.pass_steps_completed,
        mistakes: p.mistakes || [],
        is_offline: true
      }))
    };

    const resp = await fetch('/api/v1/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (resp.ok) {
      const data = await resp.json();
      console.log(`[SyncEngine] Successfully synced ${data.synced_attempts} attempts to backend!`);
      await clearPendingOfflineAttempts();
      if (data.updated_worker) {
        await saveLocalWorker(data.updated_worker);
        document.dispatchEvent(new CustomEvent('workerUpdated', { detail: data.updated_worker }));
      }
    }
  } catch (err) {
    console.warn('[SyncEngine] Sync failed, will retry on next connection:', err);
  }
}
