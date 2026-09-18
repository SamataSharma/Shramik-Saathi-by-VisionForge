// Home Screen: Faithfully reproduces the provided mobile UI screenshot

import { t } from '../i18n.js';
import { getLevelDetails } from '../engine/gamification.js';

export function renderHomeScreen(container, state) {
  const worker = state.worker || {
    id: "anik01",
    name: "Anik Mondol",
    progress_pct: 35,
    level: 1,
    level_title: "Fire & Explosion Response",
    xp: 320,
    notifications_count: 2
  };

  const levelInfo = getLevelDetails(worker.xp);

  container.innerHTML = `
    <!-- Top Header: Avatar, Greeting, Progress Pill, Notification Bell -->
    <header class="home-header">
      <div class="worker-profile-meta">
        <div class="avatar-wrapper">
          <img src="/assets/images/worker_avatar.svg" alt="${worker.name}" class="avatar-img" />
        </div>
        <div class="worker-greeting">
          <h1>${t('good_evening')}, ${worker.name}</h1>
          <div class="worker-submeta">
            <span class="flame-icon">🔥</span>
            <span>${t('progress')} ${worker.progress_pct}%</span>
          </div>
        </div>
      </div>
      <button class="notification-btn" id="btn-notifications" aria-label="Notifications">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
        </svg>
        <span class="notification-badge">${worker.notifications_count}</span>
      </button>
    </header>

    <!-- Main Level Hero Card -->
    <section class="main-level-card" id="hero-level-card">
      <div class="level-card-content">
        <div>
          <span class="level-badge">${t('level')} ${levelInfo.level}</span>
          <h2 class="level-title">${t('level_1_title')}</h2>
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

    <!-- Training Categories: 5 Pastel Circular Buttons -->
    <section>
      <h3 class="section-title">${t('training_categories')}</h3>
      <div class="categories-scroll">
        <div class="category-item" data-route="lessons">
          <div class="category-circle cat-lessons">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
            </svg>
          </div>
          <span class="category-label">${t('lessons')}</span>
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

    <!-- Training Cards List -->
    <section class="training-cards-list">
      <!-- Card 1: Safety Lessons -->
      <article class="training-card" id="card-safety-lessons" data-route="briefing">
        <div class="training-card-top">
          <div class="training-card-meta">
            <div class="card-icon-box card-icon-lessons">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
              </svg>
            </div>
            <div>
              <div class="card-category-overline">${t('lessons')}</div>
              <h4 class="card-main-title">${t('safety_lessons')}</h4>
            </div>
          </div>
          <button class="card-action-btn action-navy" aria-label="Start Safety Lessons">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </button>
        </div>

        <div class="training-card-body">
          <div>
            <p class="card-desc-text">${t('safety_lessons_desc')}</p>
            <span class="card-pill-tag pill-lessons">${t('modules_count')}</span>
          </div>
          <img src="/assets/images/lessons_banner.svg" alt="Mining Site" class="card-banner-img" />
        </div>
      </article>

      <!-- Card 2: Hazard Hunt Game -->
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
              <h4 class="card-main-title">${t('hazard_hunt')}</h4>
            </div>
          </div>
          <button class="card-action-btn action-amber" aria-label="Start Hazard Hunt">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </button>
        </div>

        <div class="training-card-body">
          <div>
            <p class="card-desc-text">${t('hazard_hunt_desc')}</p>
            <span class="card-pill-tag pill-games">${t('scenarios_count')}</span>
          </div>
          <img src="/assets/images/games_banner.svg" alt="Mining Headframe" class="card-banner-img" />
        </div>
      </article>
    </section>
  `;

  // Attach event listeners
  container.querySelectorAll('[data-route]').forEach(el => {
    el.addEventListener('click', () => {
      const route = el.getAttribute('data-route');
      window.location.hash = `#${route}`;
    });
  });

  const heroCard = container.querySelector('#hero-level-card');
  if (heroCard) {
    heroCard.addEventListener('click', () => {
      window.location.hash = '#briefing';
    });
  }
}
