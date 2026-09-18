// Notifications Drawer & Manager for VISIONFORGE - MINE AR
// Fully workable offline & synced notification system for Trainees and Supervisors

import { t } from '../i18n.js';

const DEFAULT_NOTIFICATIONS = [
  {
    id: "notif_1",
    type: "reminder",
    titleKey: "notification_reminder",
    defaultTitle: "Training Reminder: Weekly belt conveyor fire drill scheduled.",
    timestamp: "10m ago",
    read: false,
    icon: "⏰",
    role: "trainee"
  },
  {
    id: "notif_2",
    type: "retraining",
    titleKey: "notification_retraining",
    defaultTitle: "Retraining Required: Low competency score in Gas Testing drill.",
    timestamp: "1h ago",
    read: false,
    icon: "⚠️",
    role: "trainee"
  },
  {
    id: "notif_3",
    type: "new_module",
    titleKey: "notification_new_module",
    defaultTitle: "New Module: DGMS CMR 2017 Chapter 11 now accessible.",
    timestamp: "3h ago",
    read: true,
    icon: "📚",
    role: "trainee"
  },
  {
    id: "notif_4",
    type: "cert",
    titleKey: "notification_cert",
    defaultTitle: "Certificate Ready: Underground Mine Safety certificate issued.",
    timestamp: "Yesterday",
    read: true,
    icon: "🎓",
    role: "trainee"
  },
  {
    id: "notif_5",
    type: "supervisor_note",
    titleKey: "notification_supervisor",
    defaultTitle: "Supervisor Notice: Shift briefing at pithead 07:00 AM.",
    timestamp: "2d ago",
    read: true,
    icon: "👷",
    role: "trainee"
  }
];

export function getStoredNotifications() {
  try {
    const raw = localStorage.getItem('mine_ar_notifications');
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return DEFAULT_NOTIFICATIONS;
}

export function saveStoredNotifications(notifs) {
  try {
    localStorage.setItem('mine_ar_notifications', JSON.stringify(notifs));
  } catch (e) {}
}

export function getUnreadCount() {
  const notifs = getStoredNotifications();
  return notifs.filter(n => !n.read).length;
}

export function openNotificationsDrawer(onUpdateCallback) {
  let notifs = getStoredNotifications();

  // Create overlay if not present
  let overlay = document.getElementById('notifications-drawer-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'notifications-drawer-overlay';
    overlay.className = 'modal-overlay';
    document.body.appendChild(overlay);
  }

  function renderContent() {
    const unreadCount = notifs.filter(n => !n.read).length;

    overlay.innerHTML = `
      <div class="modal-sheet" style="
        max-width: 420px;
        max-height: 80vh;
        display: flex;
        flex-direction: column;
        padding: 20px;
        border-radius: var(--radius-xl);
      ">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; border-bottom: 1px solid #f1f5f9; padding-bottom: 12px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 18px;">🔔</span>
            <h3 style="margin: 0; font-size: 16px; font-weight: 800; color: var(--text-primary);">
              ${t('notifications_title')}
            </h3>
            ${unreadCount > 0 ? `<span style="background: #ef4444; color: #fff; font-size: 10.5px; font-weight: 800; padding: 2px 7px; border-radius: 9999px;">${unreadCount}</span>` : ''}
          </div>
          <button id="btn-close-notifs" style="background: none; border: none; font-size: 18px; color: #64748b; cursor: pointer; padding: 4px;">✕</button>
        </div>

        <div style="display: flex; justify-content: flex-end; margin-bottom: 10px;">
          <button id="btn-mark-all-read" style="background: none; border: none; font-size: 11.5px; font-weight: 700; color: #0284c7; cursor: pointer;">
            ${t('mark_all_read')}
          </button>
        </div>

        <div style="flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; padding-right: 4px;">
          ${notifs.length === 0 ? `
            <div style="text-align: center; padding: 30px 10px; color: #94a3b8; font-size: 13px;">
              ${t('no_notifications')}
            </div>
          ` : notifs.map(n => `
            <div class="notif-item ${n.read ? 'read' : 'unread'}" data-id="${n.id}" style="
              background: ${n.read ? '#f8fafc' : '#f0f9ff'};
              border: 1px solid ${n.read ? '#e2e8f0' : '#bae6fd'};
              border-radius: 12px;
              padding: 12px;
              display: flex;
              gap: 12px;
              align-items: flex-start;
              cursor: pointer;
              transition: all 0.2s;
            ">
              <span style="font-size: 20px; flex-shrink: 0; margin-top: 2px;">${n.icon}</span>
              <div style="flex: 1;">
                <p style="margin: 0 0 4px 0; font-size: 12.5px; font-weight: ${n.read ? '500' : '700'}; color: var(--text-primary); line-height: 1.4;">
                  ${t(n.titleKey, n.defaultTitle)}
                </p>
                <span style="font-size: 10.5px; color: #94a3b8; font-weight: 600;">${n.timestamp}</span>
              </div>
              ${!n.read ? `<span style="width: 8px; height: 8px; border-radius: 50%; background: #0284c7; margin-top: 6px; flex-shrink: 0;"></span>` : ''}
            </div>
          `).join('')}
        </div>
      </div>
    `;

    overlay.querySelector('#btn-close-notifs')?.addEventListener('click', () => {
      overlay.classList.remove('open');
    });

    overlay.querySelector('#btn-mark-all-read')?.addEventListener('click', () => {
      notifs = notifs.map(n => ({ ...n, read: true }));
      saveStoredNotifications(notifs);
      renderContent();
      if (onUpdateCallback) onUpdateCallback(0);
    });

    overlay.querySelectorAll('.notif-item').forEach(el => {
      el.addEventListener('click', () => {
        const id = el.getAttribute('data-id');
        notifs = notifs.map(n => n.id === id ? { ...n, read: true } : n);
        saveStoredNotifications(notifs);
        renderContent();
        if (onUpdateCallback) onUpdateCallback(getUnreadCount());
      });
    });
  }

  renderContent();
  overlay.classList.add('open');

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      overlay.classList.remove('open');
    }
  });
}
