// Clean Full-Screen Login Screen for VISIONFORGE - MINE AR
// Dedicated First/Main Interface with Global Language Selection

import { t, getLanguage, setLanguage } from '../i18n.js';

export function renderLoginScreen(container, state) {
  // Ensure global nav elements and in-app shells are completely hidden
  const bottomNav = document.getElementById('bottom-nav');
  if (bottomNav) bottomNav.style.display = 'none';
  const utilBar = document.getElementById('global-utility-bar');
  if (utilBar) utilBar.style.display = 'none';
  const appShell = document.getElementById('app-shell');
  if (appShell) appShell.style.display = 'none';
  const splashEl = document.getElementById('splash');
  if (splashEl) splashEl.style.display = 'none';

  // Ensure body has the route-login class
  document.body.classList.add('route-login');
  document.body.classList.remove('route-splash', 'supervisor-mode');

  const currentLang = getLanguage();

  // Mount clean Login content into container
  container.innerHTML = `
    <div id="login-screen-wrapper" style="
      width: 100%;
      min-height: 100vh;
      background: radial-gradient(circle at center, #0f233a 0%, #081524 60%, #02070e 100%);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 24px 16px;
      box-sizing: border-box;
      user-select: none;
    ">
      <!-- Global Language Switcher Pill (First/Main Interface) -->
      <div style="margin-bottom: 18px; display: flex; align-items: center; gap: 6px; background: rgba(15, 23, 42, 0.7); padding: 4px 6px; border-radius: 9999px; border: 1px solid rgba(56, 189, 248, 0.25);">
        <button class="lang-pill-btn ${currentLang === 'en' ? 'active' : ''}" data-lang="en" style="
          background: ${currentLang === 'en' ? 'linear-gradient(135deg, #0284c7, #2563eb)' : 'transparent'};
          color: ${currentLang === 'en' ? '#ffffff' : '#94a3b8'};
          border: none;
          padding: 5px 12px;
          border-radius: 9999px;
          font-size: 11.5px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
        ">
          English
        </button>
        <button class="lang-pill-btn ${currentLang === 'hi' ? 'active' : ''}" data-lang="hi" style="
          background: ${currentLang === 'hi' ? 'linear-gradient(135deg, #0284c7, #2563eb)' : 'transparent'};
          color: ${currentLang === 'hi' ? '#ffffff' : '#94a3b8'};
          border: none;
          padding: 5px 12px;
          border-radius: 9999px;
          font-size: 11.5px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
        ">
          हिन्दी
        </button>
        <button class="lang-pill-btn ${currentLang === 'sat' ? 'active' : ''}" data-lang="sat" style="
          background: ${currentLang === 'sat' ? 'linear-gradient(135deg, #0284c7, #2563eb)' : 'transparent'};
          color: ${currentLang === 'sat' ? '#ffffff' : '#94a3b8'};
          border: none;
          padding: 5px 12px;
          border-radius: 9999px;
          font-size: 11.5px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
        ">
          ᱥᱟᱱᱛᱟᱲᱤ
        </button>
      </div>

      <!-- MINE AR Brand Logo Header -->
      <div style="text-align: center; margin-bottom: 20px;">
        <div style="width: 120px; max-width: 44vw; margin: 0 auto 14px auto;">
          <img 
            src="/assets/images/shramik_saathi_logo.png" 
            alt="SHRAMIK SAATHI" 
            style="
              width: 100%;
              height: auto;
              aspect-ratio: 1 / 1;
              object-fit: contain;
              border-radius: 18px;
              filter: drop-shadow(0 12px 30px rgba(0, 0, 0, 0.7));
              display: block;
            " 
          />
        </div>
        <h1 style="font-size: 22px; font-weight: 900; color: #ffffff; margin: 0 0 4px 0; letter-spacing: 0.5px;">
          ${t('login_title', 'Miner Portal Login')}
        </h1>
        <p style="font-size: 12px; color: #94a3b8; margin: 0;">
          ${t('login_subtitle')}
        </p>
      </div>

      <!-- Clean Centered Login Card -->
      <div style="
        background: #ffffff;
        border-radius: 18px;
        padding: 26px 22px;
        border: 1px solid #e2e8f0;
        box-shadow: 0 20px 45px -10px rgba(0, 0, 0, 0.5);
        width: 100%;
        max-width: 390px;
        box-sizing: border-box;
      ">
        <form id="unified-login-form" autocomplete="on">
          <!-- User ID Field -->
          <div style="margin-bottom: 16px;">
            <label for="login-userid" style="
              display: block;
              font-size: 12px;
              font-weight: 800;
              color: #334155;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              margin-bottom: 6px;
            ">
              ${t('worker_id')}
            </label>
            <input 
              id="login-userid" 
              type="text" 
              required 
              placeholder="anik01 / supervisor01" 
              autocomplete="username"
              style="
                width: 100%;
                padding: 12px 14px;
                border-radius: 8px;
                border: 1.5px solid #cbd5e1;
                font-size: 14px;
                font-weight: 600;
                background: #f8fafc;
                color: #0f172a;
                box-sizing: border-box;
                outline: none;
                transition: border-color 0.2s;
              " 
            />
          </div>

          <!-- Password Field with Show/Hide Toggle -->
          <div style="margin-bottom: 20px;">
            <label for="login-password" style="
              display: block;
              font-size: 12px;
              font-weight: 800;
              color: #334155;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              margin-bottom: 6px;
            ">
              ${t('password')}
            </label>
            <div style="position: relative;">
              <input 
                id="login-password" 
                type="password" 
                required 
                placeholder="••••••••" 
                autocomplete="current-password"
                style="
                  width: 100%;
                  padding: 12px 42px 12px 14px;
                  border-radius: 8px;
                  border: 1.5px solid #cbd5e1;
                  font-size: 14px;
                  font-weight: 600;
                  background: #f8fafc;
                  color: #0f172a;
                  box-sizing: border-box;
                  outline: none;
                  transition: border-color 0.2s;
                " 
              />
              <button 
                type="button" 
                id="btn-toggle-password" 
                aria-label="Toggle password visibility"
                style="
                  position: absolute;
                  right: 10px;
                  top: 50%;
                  transform: translateY(-50%);
                  background: none;
                  border: none;
                  cursor: pointer;
                  padding: 6px;
                  color: #64748b;
                  font-size: 14px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                "
              >
                👁️
              </button>
            </div>
          </div>

          <!-- Error Alert Banner (Hidden by default) -->
          <div id="login-error-banner" style="
            display: none;
            background: #fee2e2;
            color: #991b1b;
            padding: 10px 14px;
            border-radius: 8px;
            font-size: 12.5px;
            font-weight: 600;
            margin-bottom: 18px;
            border: 1px solid #fca5a5;
            line-height: 1.4;
          "></div>

          <!-- Submit Button -->
          <button 
            type="submit" 
            id="btn-login-submit"
            style="
              width: 100%;
              padding: 13px;
              font-size: 14px;
              font-weight: 800;
              letter-spacing: 0.5px;
              text-transform: uppercase;
              color: #ffffff;
              background: linear-gradient(135deg, #0284c7, #0369a1);
              border: none;
              border-radius: 8px;
              cursor: pointer;
              box-shadow: 0 4px 12px rgba(2, 132, 199, 0.4);
              transition: transform 0.15s, box-shadow 0.15s;
            "
          >
            ${t('login_btn')}
          </button>
        </form>

        <!-- Demo Quick-Fill Access -->
        <div style="margin-top: 20px; padding-top: 14px; border-top: 1px solid #f1f5f9; text-align: center;">
          <span style="font-size: 10.5px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px;">
            ${t('demo_login')}
          </span>
          <div style="display: flex; gap: 8px; justify-content: center; margin-top: 8px;">
            <button type="button" id="btn-demo-trainee" style="
              background: #f0f9ff;
              border: 1px solid #bae6fd;
              color: #0369a1;
              padding: 6px 12px;
              border-radius: 9999px;
              font-size: 11px;
              font-weight: 700;
              cursor: pointer;
            ">
              👷 ${t('role_worker')} (anik01)
            </button>
            <button type="button" id="btn-demo-supervisor" style="
              background: #fdf4ff;
              border: 1px solid #f5d0fe;
              color: #86198f;
              padding: 6px 12px;
              border-radius: 9999px;
              font-size: 11px;
              font-weight: 700;
              cursor: pointer;
            ">
              🛡️ ${t('role_supervisor')} (supervisor01)
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  // Language buttons handling
  container.querySelectorAll('.lang-pill-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const selected = e.currentTarget.getAttribute('data-lang');
      setLanguage(selected);
      renderLoginScreen(container, state);
    });
  });

  // Attach Event Handlers
  const form = container.querySelector('#unified-login-form');
  const userIdInput = container.querySelector('#login-userid');
  const passwordInput = container.querySelector('#login-password');
  const toggleBtn = container.querySelector('#btn-toggle-password');
  const errorBanner = container.querySelector('#login-error-banner');
  const submitBtn = container.querySelector('#btn-login-submit');

  // 1. Password Visibility Toggle
  toggleBtn?.addEventListener('click', () => {
    if (passwordInput.type === 'password') {
      passwordInput.type = 'text';
      toggleBtn.textContent = '🔒';
    } else {
      passwordInput.type = 'password';
      toggleBtn.textContent = '👁️';
    }
  });

  // 2. Demo Quick-Fill Buttons
  container.querySelector('#btn-demo-trainee')?.addEventListener('click', () => {
    userIdInput.value = 'anik01';
    passwordInput.value = 'mine123';
    errorBanner.style.display = 'none';
  });

  container.querySelector('#btn-demo-supervisor')?.addEventListener('click', () => {
    userIdInput.value = 'supervisor01';
    passwordInput.value = 'admin123';
    errorBanner.style.display = 'none';
  });

  // 3. Form Submit Handler
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const userId = userIdInput.value.trim();
    const password = passwordInput.value;

    if (!userId || !password) {
      errorBanner.textContent = t('invalid_credentials');
      errorBanner.style.display = 'block';
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = t('loading');
    errorBanner.style.display = 'none';

    try {
      const resp = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, password: password })
      });

      if (resp.ok) {
        const data = await resp.json();
        // Persist session
        localStorage.setItem('mine_ar_token', data.token);
        localStorage.setItem('mine_ar_role', data.role);
        localStorage.setItem('mine_ar_user_id', data.user.id || data.user.username);
        state.userRole = data.role;

        if (data.role === 'trainee') {
          state.worker = data.user;
          window.location.hash = '#home';
        } else if (data.role === 'supervisor') {
          state.supervisor = data.user;
          window.location.hash = '#supervisor';
        } else {
          window.location.hash = '#home';
        }
      } else {
        const err = await resp.json().catch(() => ({}));
        errorBanner.textContent = err.detail || t('invalid_credentials');
        errorBanner.style.display = 'block';
        submitBtn.disabled = false;
        submitBtn.textContent = t('login_btn');
      }
    } catch (err) {
      // Offline fallback authentication
      if (userId === 'supervisor01' && password === 'admin123') {
        localStorage.setItem('mine_ar_token', 'offline-token-supervisor');
        localStorage.setItem('mine_ar_role', 'supervisor');
        localStorage.setItem('mine_ar_user_id', 'supervisor01');
        state.userRole = 'supervisor';
        window.location.hash = '#supervisor';
      } else if (userId === 'anik01' && password === 'mine123') {
        localStorage.setItem('mine_ar_token', 'offline-token-trainee');
        localStorage.setItem('mine_ar_role', 'trainee');
        localStorage.setItem('mine_ar_user_id', 'anik01');
        state.userRole = 'trainee';
        window.location.hash = '#home';
      } else {
        errorBanner.textContent = t('invalid_credentials');
        errorBanner.style.display = 'block';
        submitBtn.disabled = false;
        submitBtn.textContent = t('login_btn');
      }
    }
  });
}
