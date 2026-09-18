// Home Screen (Dashboard): Faithful to vocational mining aesthetic with global localization

import { t, getLanguage, setLanguage } from '../i18n.js';
import { getLevelDetails } from '../engine/gamification.js';
import { openNotificationsDrawer, getUnreadCount } from './notifications.js';

export function renderHomeScreen(container, state) {
  const worker = state.worker || {
    id: "anik01",
    name: "Anik Mondol",
    progress_pct: 48,
    level: 2,
    level_title: "Miner Grade II",
    xp: 420,
    notifications_count: 2
  };

  const levelInfo = getLevelDetails(worker.xp);
  const currentLang = getLanguage();
  const unreadCount = getUnreadCount();

  container.innerHTML = `
    <div id="home">
      <!-- Top Header: Avatar, Greeting, Progress Pill, Notification Bell, and Language Selector -->
      <header class="home-header">
        <div class="worker-profile-meta">
          <div class="avatar-wrapper">
            <img src="/assets/images/worker_avatar.svg" alt="${worker.name}" class="avatar-img" />
          </div>
          <div class="worker-greeting">
            <h1 style="margin: 0; font-size: 17px; font-weight: 800; color: var(--text-primary);">
              ${t('good_evening')}, ${worker.name}
            </h1>
            <div class="worker-submeta">
              <span class="flame-icon">🔥</span>
              <span>${t('progress')} ${worker.progress_pct}%</span>
            </div>
          </div>
        </div>

        <div style="display: flex; align-items: center; gap: 8px;">
          <!-- Notification Bell Button -->
          <button class="notification-btn" id="btn-notifications" aria-label="${t('notifications_title')}">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
            ${unreadCount > 0 ? `<span class="notification-badge" id="home-notif-badge">${unreadCount}</span>` : ''}
          </button>
        </div>
      </header>

      <!-- Dashboard Language Selector (strictly on First/Main and Dashboard) -->
      <div style="
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: #ffffff;
        padding: 8px 14px;
        border-radius: var(--radius-lg);
        margin-bottom: 16px;
        border: 1px solid #e2e8f0;
        box-shadow: var(--shadow-sm);
      ">
        <div style="display: flex; align-items: center; gap: 6px; font-size: 11.5px; font-weight: 700; color: var(--text-secondary);">
          <span>🌐</span>
          <span>${t('select_language')}</span>
        </div>
        <div style="display: flex; gap: 4px;">
          <button class="home-lang-btn ${currentLang === 'en' ? 'active' : ''}" data-lang="en" style="
            background: ${currentLang === 'en' ? '#0284c7' : '#f1f5f9'};
            color: ${currentLang === 'en' ? '#ffffff' : '#64748b'};
            border: none;
            padding: 4px 10px;
            border-radius: 9999px;
            font-size: 11px;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.2s;
          ">
            English
          </button>
          <button class="home-lang-btn ${currentLang === 'hi' ? 'active' : ''}" data-lang="hi" style="
            background: ${currentLang === 'hi' ? '#0284c7' : '#f1f5f9'};
            color: ${currentLang === 'hi' ? '#ffffff' : '#64748b'};
            border: none;
            padding: 4px 10px;
            border-radius: 9999px;
            font-size: 11px;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.2s;
          ">
            हिन्दी
          </button>
          <button class="home-lang-btn ${currentLang === 'sat' ? 'active' : ''}" data-lang="sat" style="
            background: ${currentLang === 'sat' ? '#0284c7' : '#f1f5f9'};
            color: ${currentLang === 'sat' ? '#ffffff' : '#64748b'};
            border: none;
            padding: 4px 10px;
            border-radius: 9999px;
            font-size: 11px;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.2s;
          ">
            ᱥᱟᱱᱛᱟᱲᱤ
          </button>
        </div>
      </div>

      <!-- Main Level Hero Card -->
      <section class="main-level-card" id="hero-level-card" style="cursor: pointer;">
        <div class="level-card-content">
          <div>
            <span class="level-badge">${t('level')} ${levelInfo.level}</span>
            <h2 class="level-title">${t('sim_fire_title')}</h2>
          </div>
          <img src="/assets/images/hazard_thumb.svg" alt="Hazard Thumbnail" class="level-thumb-img" />
        </div>

        <div class="progress-info">
          <span>${t('overall_progress')}</span>
          <span class="progress-pct-val">${worker.progress_pct}%</span>
        </div>
        <div class="progress-track">
          <div class="progress-bar-fill" style="width: ${worker.progress_pct}%"></div>
        </div>
      </section>

      <!-- Training Categories: 6 Pastel Circular Buttons Including Vocational -->
      <section style="margin-bottom: 20px;">
        <h3 class="section-title">${t('training_categories')}</h3>
        <div class="categories-scroll">
          <div class="category-item" data-route="vocational">
            <div class="category-circle" style="background: #e0f2fe; color: #0284c7;">
              <span style="font-size: 22px;">⚒️</span>
            </div>
            <span class="category-label">${t('vocational')}</span>
          </div>

          <div class="category-item" data-route="games">
            <div class="category-circle cat-games">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="6" y1="12" x2="10" y2="12"></line>
                <line x1="8" y1="10" x2="8" y2="14"></line>
                <line x1="15" y1="13" x2="15.01" y2="13"></line>
                <line x1="18" y1="11" x2="18.01" y2="11"></line>
                <rect x="2" y="6" width="20" height="12" rx="2"></rect>
              </svg>
            </div>
            <span class="category-label">${t('games')}</span>
          </div>

          <div class="category-item" data-route="lessons">
            <div class="category-circle cat-lessons">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
              </svg>
            </div>
            <span class="category-label">${t('lessons')}</span>
          </div>

          <div class="category-item" data-route="stories">
            <div class="category-circle cat-stories">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
              </svg>
            </div>
            <span class="category-label">${t('stories')}</span>
          </div>

          <div class="category-item" data-route="activities">
            <div class="category-circle cat-activities">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                <circle cx="12" cy="11" r="3"></circle>
              </svg>
            </div>
            <span class="category-label">${t('activities')}</span>
          </div>

          <div class="category-item" data-route="discover">
            <div class="category-circle cat-discover">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon>
              </svg>
            </div>
            <span class="category-label">${t('discover')}</span>
          </div>
        </div>
      </section>

      <!-- Training Cards Section -->
      <section style="display: flex; flex-direction: column; gap: 14px;">
        <!-- Card 1: Vocational Safety Training (NEW SECTION) -->
        <article class="training-card" id="card-vocational-training" data-route="vocational">
          <div class="training-card-top">
            <div class="training-card-meta">
              <div class="card-icon-box" style="background: #e0f2fe; color: #0284c7;">
                <span style="font-size: 20px;">⚒️</span>
              </div>
              <div>
                <div class="card-category-overline">${t('vocational')}</div>
                <h4 class="card-main-title">${t('vocational_training')}</h4>
              </div>
            </div>
            <button class="card-action-btn action-navy" aria-label="${t('vocational_training')}">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </button>
          </div>

          <div class="training-card-body">
            <div>
              <p class="card-desc-text">${t('vocational_desc')}</p>
              <span class="card-pill-tag" style="background: #e0f2fe; color: #0369a1;">${t('modules_count')}</span>
            </div>
            <img src="/assets/images/lessons_banner.svg" alt="Vocational Mining" class="card-banner-img" />
          </div>
        </article>

        <!-- Card 2: Interactive Training Games -->
        <article class="training-card" id="card-hazard-hunt" data-route="games">
          <div class="training-card-top">
            <div class="training-card-meta">
              <div class="card-icon-box card-icon-games">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="6" y1="12" x2="10" y2="12"></line>
                  <line x1="8" y1="10" x2="8" y2="14"></line>
                  <line x1="15" y1="13" x2="15.01" y2="13"></line>
                  <line x1="18" y1="11" x2="18.01" y2="11"></line>
                  <rect x="2" y="6" width="20" height="12" rx="2"></rect>
                </svg>
              </div>
              <div>
                <div class="card-category-overline">${t('games')}</div>
                <h4 class="card-main-title">${t('games_banner_title')}</h4>
              </div>
            </div>
            <button class="card-action-btn action-amber" aria-label="${t('games_banner_title')}">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </button>
          </div>

          <div class="training-card-body">
            <div>
              <p class="card-desc-text">${t('games_banner_subtitle')}</p>
              <span class="card-pill-tag pill-games">${t('scenarios_count')}</span>
            </div>
            <img src="/assets/images/games_banner.svg" alt="Mining Headframe" class="card-banner-img" />
          </div>
        </article>

        <!-- Card 3: AR Safety Scenarios Drill -->
        <article class="training-card" id="card-ar-scenarios" data-route="scenarios">
          <div class="training-card-top">
            <div class="training-card-meta">
              <div class="card-icon-box" style="background: #dcfce7; color: #16a34a;">
                <span style="font-size: 20px;">🥽</span>
              </div>
              <div>
                <div class="card-category-overline">AR SIMULATION</div>
                <h4 class="card-main-title">${t('start_training')}</h4>
              </div>
            </div>
            <button class="card-action-btn action-green" aria-label="${t('start_training')}">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </button>
          </div>

          <div class="training-card-body">
            <div>
              <p class="card-desc-text">${t('safety_lessons_desc')}</p>
              <span class="card-pill-tag" style="background: #dcfce7; color: #15803d;">5 AR Scenarios</span>
            </div>
            <img src="/assets/images/hazard_conveyor_fire.png" alt="AR Conveyor Fire" class="card-banner-img" />
          </div>
        </article>
      </section>
    </div>
  `;

  // Attach language selector listeners
  container.querySelectorAll('.home-lang-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const selected = e.currentTarget.getAttribute('data-lang');
      setLanguage(selected);
      renderHomeScreen(container, state);
    });
  });

  // Attach notification drawer listener
  container.querySelector('#btn-notifications')?.addEventListener('click', () => {
    openNotificationsDrawer((newUnread) => {
      const badge = container.querySelector('#home-notif-badge');
      if (badge) {
        if (newUnread > 0) {
          badge.textContent = newUnread;
          badge.style.display = 'inline-block';
        } else {
          badge.style.display = 'none';
        }
      }
    });
  });

  // Attach navigation routes
  container.querySelectorAll('[data-route]').forEach(el => {
    el.addEventListener('click', () => {
      const route = el.getAttribute('data-route');
      window.location.hash = `#${route}`;
    });
  });

  const heroCard = container.querySelector('#hero-level-card');
  if (heroCard) {
    heroCard.addEventListener('click', () => {
      window.location.hash = '#scenarios';
    });
  }
}
