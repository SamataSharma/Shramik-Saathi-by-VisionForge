// Main App Controller & State Manager for VISIONFORGE MINE AR

import { Router } from './router.js';
import { initSyncEngine } from './sync.js';
import { getLocalWorker, saveLocalWorker } from './db.js';
import { setLanguage, getLanguage } from './i18n.js';

const appState = {
  userRole: localStorage.getItem('mine_ar_role') || 'trainee',
  worker: {
    id: "anik01",
    name: "Anik Mondol",
    role: "Underground Belt Conveyor Operator",
    mine_location: "Dhanbad Seam #4 (BCCL)",
    level: 2,
    level_title: "Miner Grade II",
    xp: 420,
    progress_pct: 48,
    competency_score: 84.5,
    avatar_url: "/assets/images/worker_avatar.svg",
    streaks: 5,
    notifications_count: 2
  },
  supervisor: {
    id: "supervisor01",
    name: "Er. R. K. Verma",
    designation: "Director of Mine Safety (DGMS Dhanbad)",
    role: "supervisor"
  },
  lastAttemptResult: null
};

document.addEventListener('DOMContentLoaded', () => {
  console.log('[MINE AR] Bootstrapping vocational simulator with complete training history...');

  // 1. Initialize Client-Side Router immediately so splash and routing start with ZERO delay
  const container = document.getElementById('main-view');
  const router = new Router(container, appState);
  router.init();

  // 2. Load worker profile concurrently in background without blocking the UI
  let currentTraineeId = localStorage.getItem('mine_ar_user_id') || 'anik01';
  if (currentTraineeId === 'suresh_01' || !currentTraineeId) {
    currentTraineeId = 'anik01';
    localStorage.setItem('mine_ar_user_id', 'anik01');
  }

  fetch(`/api/v1/trainees/${currentTraineeId}`)
    .then(async (apiResp) => {
      if (apiResp.ok) {
        const apiWorker = await apiResp.json();
        appState.worker = apiWorker;
        await saveLocalWorker(apiWorker);
        localStorage.setItem('mine_ar_user_id', apiWorker.id);
      } else {
        const localWorker = await getLocalWorker(currentTraineeId);
        if (localWorker) appState.worker = localWorker;
      }
    })
    .catch(async () => {
      const localWorker = await getLocalWorker(currentTraineeId);
      if (localWorker) appState.worker = localWorker;
    });

  // 3. Register Service Worker for offline operation
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(e => {
      console.warn('[ServiceWorker] Registration skipped:', e);
    });
  }

  // 4. Initialize Offline Sync Manager
  initSyncEngine();

  // Switch Role / Logout
  document.getElementById('btn-util-role')?.addEventListener('click', () => {
    localStorage.removeItem('mine_ar_token');
    localStorage.removeItem('mine_ar_role');
    localStorage.removeItem('mine_ar_user_id');
    window.location.hash = '#login';
  });

  // Language Quick Switcher
  document.getElementById('btn-util-lang')?.addEventListener('click', () => {
    const current = getLanguage();
    const next = current === 'en' ? 'hi' : (current === 'hi' ? 'sat' : 'en');
    setLanguage(next);
    document.getElementById('btn-util-lang').textContent = `🌐 ${next.toUpperCase()}`;
    router.handleRoute();
  });

  // Sync Pill click triggers immediate sync
  document.getElementById('sync-status-pill')?.addEventListener('click', async () => {
    const { syncPendingData } = await import('./sync.js');
    await syncPendingData();
  });

  // Listen to external worker update events
  document.addEventListener('workerUpdated', (e) => {
    appState.worker = e.detail;
    router.handleRoute();
  });

  document.addEventListener('languageChanged', () => {
    router.handleRoute();
  });

  console.log('[MINE AR] Initialized successfully. Current role:', appState.userRole);
});
