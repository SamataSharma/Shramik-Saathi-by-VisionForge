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

document.addEventListener('DOMContentLoaded', async () => {
  console.log('[MINE AR] Bootstrapping vocational simulator with complete training history...');

  // 1. Try loading worker profile from API or IndexedDB
  let currentTraineeId = localStorage.getItem('mine_ar_user_id') || 'anik01';
  if (currentTraineeId === 'suresh_01' || !currentTraineeId) {
    currentTraineeId = 'anik01';
    localStorage.setItem('mine_ar_user_id', 'anik01');
  }
  try {
    const apiResp = await fetch(`/api/v1/trainees/${currentTraineeId}`);
    if (apiResp.ok) {
      const apiWorker = await apiResp.json();
      appState.worker = apiWorker;
      await saveLocalWorker(apiWorker);
      localStorage.setItem('mine_ar_user_id', apiWorker.id);
    } else {
      const localWorker = await getLocalWorker(currentTraineeId);
      if (localWorker && localWorker.id !== 'suresh_01') appState.worker = localWorker;
    }
  } catch (err) {
    const localWorker = await getLocalWorker(currentTraineeId);
    if (localWorker && localWorker.id !== 'suresh_01') appState.worker = localWorker;
  }

  // 2. Register Service Worker for offline operation
  if ('serviceWorker' in navigator) {
    try {
      await navigator.serviceWorker.register('/sw.js');
      console.log('[ServiceWorker] Successfully registered');
    } catch (e) {
      console.warn('[ServiceWorker] Registration skipped:', e);
    }
  }

  // 3. Initialize Offline Sync Manager
  initSyncEngine();

  // 4. Initialize Client-Side Router
  const container = document.getElementById('main-view');
  const router = new Router(container, appState);
  router.init();

  // Switch Role / Login
  document.getElementById('btn-util-role')?.addEventListener('click', () => {
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
