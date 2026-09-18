// Official Full-Screen Splash Screen for VISIONFORGE - MINE AR
// Uses the exact logo at app/assets/images/mine_ar_logo.png

export function renderSplashScreen(container, state) {
  // Clear any existing contents from container
  if (container) container.innerHTML = '';

  // Ensure global navigation and utility bar are hidden during splash
  const bottomNav = document.getElementById('bottom-nav');
  if (bottomNav) bottomNav.style.display = 'none';
  const utilBar = document.getElementById('global-utility-bar');
  if (utilBar) utilBar.style.display = 'none';

  // Retrieve the existing HTML #splash element
  const splashEl = document.getElementById('splash');
  if (splashEl) {
    splashEl.style.display = 'flex';
    splashEl.style.opacity = '1';
  }

  let transitioned = false;

  function completeSplash() {
    if (transitioned) return;
    transitioned = true;

    // Check session authentication
    const token = localStorage.getItem('mine_ar_token');
    const role = localStorage.getItem('mine_ar_role') || state?.userRole;

    let targetHash = '#login';
    if (token) {
      targetHash = (role === 'supervisor') ? '#supervisor' : '#home';
    }

    // Mark application as bootstrapped so styles reveal content
    document.body.classList.add('bootstrapped');

    if (splashEl) {
      splashEl.style.opacity = '0';
      setTimeout(() => {
        splashEl.style.display = 'none';
        window.location.hash = targetHash;
      }, 380);
    } else {
      window.location.hash = targetHash;
    }
  }

  // Display for approximately 2 seconds, then transition
  const timer = setTimeout(() => {
    completeSplash();
  }, 2000);

  // Allow instant skip on click
  splashEl?.addEventListener('click', () => {
    clearTimeout(timer);
    completeSplash();
  }, { once: true });
}

