// Client-Side Hash Router for VISIONFORGE MINE AR with Role-Based Access Control

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
import { renderARScreen, teardownAR } from './screens/ar-sim.js';
import { renderResultsScreen } from './screens/results.js';
import { renderProgressScreen } from './screens/progress.js';
import { renderSupervisorScreen } from './screens/supervisor.js';
import { renderCertificateView } from './screens/certificate-view.js';
import { renderSettingsScreen } from './screens/settings.js';

export class Router {
  constructor(container, state) {
    this.container = container;
    this.state = state;
    this.currentRoute = null;

    window.addEventListener('hashchange', () => this.handleRoute());
  }

  init() {
    if (!window.location.hash) {
      window.location.hash = '#splash';
    } else {
      this.handleRoute();
    }
  }

  handleRoute() {
    const rawHash = window.location.hash.slice(1) || 'splash';
    const route = rawHash.split('?')[0];

    // Clean up AR if moving away
    if (this.currentRoute === 'ar' && route !== 'ar') {
      teardownAR();
    }
    this.currentRoute = route;

    // Reset supervisor mode if navigating to worker screens
    if (route !== 'supervisor') {
      document.body.classList.remove('supervisor-mode');
    }

    // Role-Based Guard: Trainees CANNOT access supervisor console!
    if (route === 'supervisor' && this.state.userRole === 'trainee') {
      alert("Access Denied: Trainees do not have permission to view the Supervisor Console.");
      window.location.hash = '#home';
      return;
    }

    // Update bottom navigation visibility and active state
    this.updateBottomNav(route);

    // Scroll to top
    window.scrollTo(0, 0);

    switch (route) {
      case 'login':
        renderLoginScreen(this.container, this.state);
        break;
      case 'splash':
        renderSplashScreen(this.container, this.state);
        break;
      case 'home':
        renderHomeScreen(this.container, this.state);
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
