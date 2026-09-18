// Client-Side Hash Router for VISIONFORGE MINE AR with Role-Based Access Control
// Enforces strict isolation: #login, #splash, and #home never overlap in the DOM

import { renderLoginScreen } from './screens/login.js';
import { renderSplashScreen } from './screens/splash.js';
import { renderHomeScreen } from './screens/home.js';
import { renderLevelsScreen } from './screens/levels.js';
import { renderLessonsScreen } from './screens/lessons.js';
import { renderGamesScreen } from './screens/games.js';
import { renderStoriesScreen } from './screens/stories.js';
import { renderActivitiesScreen } from './screens/activities.js';
import { renderActivityHistoryScreen } from './screens/activity-history.js';
import { renderDiscoverScreen } from './screens/discover.js';
import { renderBriefingScreen } from './screens/scenario-brief.js';
import { renderChecklistScreen } from './screens/checklist.js';
import { renderScenariosSelectScreen } from './screens/scenarios-select.js';
import { renderARScreen, teardownAR } from './screens/ar-sim.js';
import { renderResultsScreen } from './screens/results.js';
import { renderProgressScreen } from './screens/progress.js';
import { renderSupervisorScreen } from './screens/supervisor.js';
import { renderCertificateView } from './screens/certificate-view.js';
import { renderSettingsScreen } from './screens/settings.js';
import { renderVocationalScreen } from './screens/vocational.js';
import { t } from './i18n.js';

export class Router {
  constructor(container, state) {
    this.container = container; // Reference to #main-view
    this.state = state;
    this.currentRoute = null;

    window.addEventListener('hashchange', () => this.handleRoute());
    document.addEventListener('languageChanged', () => {
      this.handleRoute();
    });
  }

  init() {
    // Startup sequence requirement: App Open -> Splash screen (~2s) -> Login (or destination if logged in)
    // If application has not completed its initial boot, enforce #splash
    if (!document.body.classList.contains('bootstrapped')) {
      if (window.location.hash !== '#splash') {
        window.location.hash = '#splash';
      }
    }
    this.handleRoute();
  }

  handleRoute() {
    const rawHash = window.location.hash.slice(1) || 'splash';
    const route = rawHash.split('?')[0];

    // Clean up AR if moving away
    if (this.currentRoute === 'ar' && route !== 'ar') {
      teardownAR();
    }
    this.currentRoute = route;

    // Check authentication for protected screens
    const token = localStorage.getItem('mine_ar_token');
    const userRole = localStorage.getItem('mine_ar_role') || this.state.userRole;

    if (!token && route !== 'splash' && route !== 'login') {
      window.location.hash = '#login';
      return;
    }

    // Role-Based Guard: Trainees CANNOT access supervisor console!
    if (route === 'supervisor' && userRole !== 'supervisor') {
      alert("Access Denied: Trainees do not have permission to view the Supervisor Control Center.");
      window.location.hash = '#home';
      return;
    }

    // Reference common structural elements
    const loginSlot = document.getElementById('login');
    const appShell = document.getElementById('app-shell');
    const splashEl = document.getElementById('splash');
    const bottomNav = document.getElementById('bottom-nav');
    const utilBar = document.getElementById('global-utility-bar');

    // Scroll to top
    window.scrollTo(0, 0);

    // =========================================================================
    // CASE 1: ROUTE = #login
    // Completely unmount Home and app-shell. Mount ONLY #login full screen.
    // =========================================================================
    if (route === 'login') {
      document.body.className = 'bootstrapped route-login';

      // 1. Unmount and clear any in-app content from #main-view
      this.container.innerHTML = '';

      // 2. Hide in-app containers
      if (appShell) appShell.style.display = 'none';
      if (bottomNav) bottomNav.style.display = 'none';
      if (utilBar) utilBar.style.display = 'none';
      if (splashEl) splashEl.style.display = 'none';

      // 3. Mount ONLY the clean login screen in dedicated #login container
      if (loginSlot) {
        loginSlot.style.display = 'flex';
        renderLoginScreen(loginSlot, this.state);
      }
      return;
    }

    // =========================================================================
    // CASE 2: ROUTE = #splash
    // Display splash screen holding for ~2 seconds.
    // =========================================================================
    if (route === 'splash') {
      document.body.className = 'route-splash';

      this.container.innerHTML = '';
      if (loginSlot) {
        loginSlot.innerHTML = '';
        loginSlot.style.display = 'none';
      }
      if (appShell) appShell.style.display = 'none';
      if (bottomNav) bottomNav.style.display = 'none';
      if (utilBar) utilBar.style.display = 'none';

      renderSplashScreen(this.container, this.state);
      return;
    }

    // =========================================================================
    // CASE 3: IN-APP ROUTES (#home, #levels, #supervisor, #ar, etc.)
    // Ensure #login and #splash are completely cleared and unmounted.
    // =========================================================================
    document.body.classList.remove('route-login', 'route-splash');
    document.body.classList.add('bootstrapped');

    // Unmount and hide login screen
    if (loginSlot) {
      loginSlot.innerHTML = '';
      loginSlot.style.display = 'none';
    }

    // Hide splash screen
    if (splashEl) {
      splashEl.style.display = 'none';
    }

    // Set supervisor mode if on supervisor console
    if (route === 'supervisor') {
      document.body.classList.add('supervisor-mode');
    } else {
      document.body.classList.remove('supervisor-mode');
    }

    // Reveal app shell
    if (appShell) {
      appShell.style.display = 'flex';
    }

    // Update global utility bar
    if (utilBar) {
      utilBar.style.display = (route === 'ar') ? 'none' : 'flex';
      // Language selector should appear only in First/Main interface and Dashboard
      const utilLangBtn = document.getElementById('btn-util-lang');
      if (utilLangBtn) {
        utilLangBtn.style.display = 'none'; // Only available on First/Main and Dashboard per requirement 3
      }
      const utilRoleBtn = document.getElementById('btn-util-role');
      if (utilRoleBtn) {
        utilRoleBtn.textContent = `👤 ${t('switch_account')}`;
      }
    }

    // Update bottom nav
    this.updateBottomNav(route);

    // Completely clear view container before rendering target screen
    this.container.innerHTML = '';

    switch (route) {
      case 'home':
        renderHomeScreen(this.container, this.state);
        break;
      case 'vocational':
        renderVocationalScreen(this.container, this.state);
        break;
      case 'levels':
        renderLevelsScreen(this.container, this.state);
        break;
      case 'lessons':
        renderLessonsScreen(this.container, this.state);
        break;
      case 'games':
        renderGamesScreen(this.container, this.state);
        break;
      case 'stories':
        renderStoriesScreen(this.container, this.state);
        break;
      case 'activities':
        renderActivitiesScreen(this.container, this.state);
        break;
      case 'activity-history':
        renderActivityHistoryScreen(this.container, this.state);
        break;
      case 'discover':
        renderDiscoverScreen(this.container, this.state);
        break;
      case 'briefing':
        renderBriefingScreen(this.container, this.state);
        break;
      case 'checklist':
        renderChecklistScreen(this.container, this.state);
        break;
      case 'scenarios':
        renderScenariosSelectScreen(this.container, this.state);
        break;
      case 'ar':
        renderARScreen(this.container, this.state);
        break;
      case 'results':
        renderResultsScreen(this.container, this.state);
        break;
      case 'progress':
        renderProgressScreen(this.container, this.state);
        break;
      case 'supervisor':
        renderSupervisorScreen(this.container, this.state);
        break;
      case 'certificate':
        renderCertificateView(this.container, this.state);
        break;
      case 'settings':
        renderSettingsScreen(this.container, this.state);
        break;
      default:
        renderHomeScreen(this.container, this.state);
    }
  }

  updateBottomNav(route) {
    const bottomNav = document.getElementById('bottom-nav');
    if (!bottomNav) return;

    // Dynamically localize tab labels
    const homeTab = document.getElementById('nav-tab-home');
    if (homeTab && homeTab.lastElementChild) homeTab.lastElementChild.textContent = t('nav_home');
    const levelsTab = document.getElementById('nav-tab-levels');
    if (levelsTab && levelsTab.lastElementChild) levelsTab.lastElementChild.textContent = t('nav_levels');
    const progressTab = document.getElementById('nav-tab-progress');
    if (progressTab && progressTab.lastElementChild) progressTab.lastElementChild.textContent = t('nav_progress');
    const settingsTab = document.getElementById('nav-tab-settings');
    if (settingsTab && settingsTab.lastElementChild) settingsTab.lastElementChild.textContent = t('nav_settings');

    // Hide nav on splash, login, supervisor, and immersive AR
    if (route === 'ar' || route === 'login' || route === 'splash' || route === 'supervisor') {
      bottomNav.style.display = 'none';
      return;
    }
    bottomNav.style.display = 'flex';

    bottomNav.querySelectorAll('.nav-tab').forEach(tab => {
      const tabRoute = tab.getAttribute('data-tab');
      if (tabRoute === route) {
        tab.classList.add('active');
      } else {
        tab.classList.remove('active');
      }
    });
  }
}
