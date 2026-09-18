// Official Splash / Welcome Screen for VISIONFORGE - MINE AR

export function renderSplashScreen(container, state) {
  // Hide bottom navigation bar during splash
  const bottomNav = document.getElementById('bottom-nav');
  if (bottomNav) bottomNav.style.display = 'none';

  container.innerHTML = `
    <div id="splash-view" style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 85vh; text-align: center; padding: 24px; animation: fadeIn 0.4s ease-out; cursor: pointer;">
      
      <!-- Official Provided MINE AR Logo Asset -->
      <div style="width: 220px; max-width: 78vw; margin-bottom: 24px; filter: drop-shadow(0 12px 28px rgba(2, 132, 199, 0.25)); transition: transform 0.3s ease;">
        <img src="/assets/images/mine_ar_logo.png" alt="VISIONFORGE MINE AR" style="width: 100%; height: auto; object-fit: contain; border-radius: 16px;" />
      </div>

      <!-- Tagline & Context -->
      <div style="display: inline-block; background: rgba(2, 132, 199, 0.1); color: #0284c7; font-size: 11.5px; font-weight: 800; padding: 5px 14px; border-radius: 9999px; letter-spacing: 0.5px; margin-bottom: 12px; border: 1px solid rgba(2, 132, 199, 0.2);">
        AR-BASED VOCATIONAL SAFETY TRAINING
      </div>

      <p style="font-size: 14.5px; font-weight: 600; color: #475569; margin-bottom: 32px; letter-spacing: 0.2px;">
        Learn. Practice. Respond. Stay Safe.
      </p>

      <!-- Professional Animated Loading Bar -->
      <div style="width: 180px; height: 5px; background: #e2e8f0; border-radius: 9999px; overflow: hidden; position: relative; margin-bottom: 18px;">
        <div id="splash-progress-bar" style="width: 0%; height: 100%; background: linear-gradient(90deg, #0284c7, #f97316); border-radius: 9999px; transition: width 2.4s cubic-bezier(0.4, 0, 0.2, 1);"></div>
      </div>

      <div id="splash-status-text" style="font-size: 11.5px; color: #94a3b8; font-weight: 500;">
        Initializing safety simulator...
      </div>

      <!-- Quick skip indicator -->
      <div style="margin-top: 28px; font-size: 11px; color: #cbd5e1; display: flex; align-items: center; gap: 4px;">
        <span>Tap to skip</span> <span>➔</span>
      </div>
    </div>
  `;

  let navigated = false;
  function navigateNext() {
    if (navigated) return;
    navigated = true;

    // Check existing authentication
    const token = localStorage.getItem('mine_ar_token');
    const role = localStorage.getItem('mine_ar_role');
    const userId = localStorage.getItem('mine_ar_user_id');

    if (token && userId) {
      if (role === 'supervisor') {
        window.location.hash = '#supervisor';
      } else {
        window.location.hash = '#home';
      }
    } else {
      window.location.hash = '#login';
    }
  }

  // Animate progress bar smoothly
  requestAnimationFrame(() => {
    const bar = container.querySelector('#splash-progress-bar');
    if (bar) bar.style.width = '100%';
  });

  // Auto-navigate after ~2.4 seconds
  const autoTimer = setTimeout(() => {
    navigateNext();
  }, 2400);

  // Allow immediate skip on click/tap
  container.querySelector('#splash-view')?.addEventListener('click', () => {
    clearTimeout(autoTimer);
    navigateNext();
  });
}
