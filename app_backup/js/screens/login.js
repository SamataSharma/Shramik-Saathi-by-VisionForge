// Common Unified Login Screen: Backend Role Detection (Trainee vs Supervisor)

export function renderLoginScreen(container, state) {
  // Hide bottom nav while on login screen
  const bottomNav = document.getElementById('bottom-nav');
  if (bottomNav) bottomNav.style.display = 'none';

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 85vh; text-align: center; padding: 20px 16px; animation: fadeIn 0.3s ease;">
      
      <!-- Official App Logo -->
      <div style="width: 170px; max-width: 60vw; margin-bottom: 16px; filter: drop-shadow(0 6px 16px rgba(0,0,0,0.1));">
        <img src="/assets/images/mine_ar_logo.png" alt="VISIONFORGE MINE AR" style="width: 100%; height: auto; object-fit: contain; border-radius: 12px;" />
      </div>

      <span style="background: rgba(2, 132, 199, 0.1); color: #0284c7; font-size: 11px; font-weight: 800; padding: 4px 12px; border-radius: 9999px; margin-bottom: 6px;">
        VISIONFORGE • VOCATIONAL SAFETY TRAINING
      </span>

      <h1 style="font-size: 22px; font-weight: 900; color: var(--text-primary); margin-bottom: 4px;">
        MINE AR Portal
      </h1>
      <p style="font-size: 13px; color: var(--text-secondary); max-width: 320px; line-height: 1.4; margin-bottom: 22px;">
        Enter your credentials to access your individual safety training records or supervisor console.
      </p>

      <!-- Unified Login Form Card -->
      <div style="background: #ffffff; border-radius: 20px; padding: 22px 20px; border: 1.5px solid #e2e8f0; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.06); width: 100%; max-width: 360px; text-align: left; margin-bottom: 20px;">
        
        <form id="unified-login-form">
          <div style="margin-bottom: 14px;">
            <label for="login-userid" style="font-size: 11.5px; font-weight: 700; color: #475569; text-transform: uppercase; margin-bottom: 6px; display: block;">
              User ID / Username
            </label>
            <div style="position: relative;">
              <input id="login-userid" type="text" required placeholder="e.g. anik01 or supervisor01" value="anik01"
                style="width: 100%; padding: 12px 14px 12px 38px; border-radius: 10px; border: 1.5px solid #cbd5e1; font-size: 14px; font-weight: 600; background: #f8fafc; color: #0f172a; box-sizing: border-box;" />
              <span style="position: absolute; left: 12px; top: 12px; font-size: 15px; opacity: 0.6;">👤</span>
            </div>
          </div>

          <div style="margin-bottom: 18px;">
            <label for="login-password" style="font-size: 11.5px; font-weight: 700; color: #475569; text-transform: uppercase; margin-bottom: 6px; display: block;">
              Password
            </label>
            <div style="position: relative;">
              <input id="login-password" type="password" required placeholder="Enter password" value="mine123"
                style="width: 100%; padding: 12px 14px 12px 38px; border-radius: 10px; border: 1.5px solid #cbd5e1; font-size: 14px; font-weight: 600; background: #f8fafc; color: #0f172a; box-sizing: border-box;" />
              <span style="position: absolute; left: 12px; top: 12px; font-size: 15px; opacity: 0.6;">🔒</span>
            </div>
          </div>

          <div id="login-error-banner" style="display: none; background: #fef2f2; border: 1px solid #fecaca; color: #b91c1c; padding: 10px 12px; border-radius: 8px; font-size: 12.5px; margin-bottom: 14px; font-weight: 500;">
          </div>

          <button type="submit" id="btn-submit-login" class="btn-primary" style="width: 100%; padding: 13px; font-size: 14.5px; font-weight: 800; border-radius: 12px; background: linear-gradient(135deg, #0284c7, #0369a1); box-shadow: 0 4px 14px rgba(2, 132, 199, 0.35); display: flex; align-items: center; justify-content: center; gap: 8px;">
            <span>LOGIN</span>
            <span>➔</span>
          </button>
        </form>

        <!-- Role routing explanation -->
        <div style="margin-top: 14px; padding-top: 12px; border-top: 1px dashed #e2e8f0; font-size: 11px; color: #64748b; line-height: 1.4;">
          🛡️ <strong>Role-Based Access:</strong> Trainee logins automatically open Trainee Home; Supervisor credentials open the DGMS Audit Console.
        </div>
      </div>

      <!-- Quick Demo Account Selector (Click to Fill) -->
      <div style="width: 100%; max-width: 360px; text-align: left;">
        <div style="font-size: 11px; font-weight: 800; color: #94a3b8; text-transform: uppercase; margin-bottom: 8px; letter-spacing: 0.5px;">
          Quick Select Official Accounts:
        </div>

        <div style="display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 10px;">
          <button class="account-pill active" data-uid="anik01" data-pw="mine123" data-name="Anik Mondol (Operator)">
            👷 Anik Mondol (anik01)
          </button>
          <button class="account-pill" data-uid="samata01" data-pw="mine123" data-name="Samata Sharma (Specialist)">
            👷 Samata Sharma (samata01)
          </button>
          <button class="account-pill" data-uid="shambhavi01" data-pw="mine123" data-name="Shambhavi (Haulage)">
            👷 Shambhavi (shambhavi01)
          </button>
          <button class="account-pill" data-uid="arkadip01" data-pw="mine123" data-name="Arkadip Ghosh (Ventilation)">
            👷 Arkadip Ghosh (arkadip01)
          </button>
          <button class="account-pill" data-uid="sahnik01" data-pw="mine123" data-name="Sahnik Barui (Retraining)">
            ⚠️ Sahnik Barui (sahnik01)
          </button>
          <button class="account-pill" data-uid="abhay01" data-pw="mine123" data-name="Abhay (Rescue Master)">
            ⭐ Abhay (abhay01)
          </button>
          <button class="account-pill supervisor-pill" data-uid="supervisor01" data-pw="admin123" data-name="Er. R. K. Verma (Supervisor)">
            👨‍💼 Supervisor (supervisor01)
          </button>
        </div>
      </div>

      <div style="font-size: 11px; color: #94a3b8; margin-top: 16px;">
        Compliant with Coal Mines Regulations 2017 & DGMS Safety Standards
      </div>
    </div>

    <style>
      .account-pill {
        background: #f1f5f9;
        color: #334155;
        border: 1px solid #cbd5e1;
        padding: 5px 10px;
        border-radius: 9999px;
        font-size: 11.5px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.15s ease;
      }
      .account-pill:hover, .account-pill.active {
        background: #e0f2fe;
        color: #0284c7;
        border-color: #38bdf8;
      }
      .supervisor-pill {
        background: #fef3c7;
        color: #92400e;
        border-color: #fcd34d;
      }
      .supervisor-pill:hover, .supervisor-pill.active {
        background: #fde68a;
        color: #78350f;
        border-color: #f59e0b;
      }
    </style>
  `;

  const userIdInput = container.querySelector('#login-userid');
  const passwordInput = container.querySelector('#login-password');
  const errorBanner = container.querySelector('#login-error-banner');
  const form = container.querySelector('#unified-login-form');

  // Quick select badges
  container.querySelectorAll('.account-pill').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      container.querySelectorAll('.account-pill').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      userIdInput.value = btn.getAttribute('data-uid');
      passwordInput.value = btn.getAttribute('data-pw');
      if (errorBanner) errorBanner.style.display = 'none';
    });
  });

  // Handle Form Submission
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (errorBanner) errorBanner.style.display = 'none';

    const userId = userIdInput.value.trim();
    const password = passwordInput.value.trim();
    const submitBtn = container.querySelector('#btn-submit-login');

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<span>Authenticating...</span>`;
    }

    try {
      const resp = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, password: password })
      });

      const data = await resp.json();

      if (!resp.ok) {
        throw new Error(data.detail || 'Authentication failed');
      }

      // Persist authenticated credentials
      localStorage.setItem('mine_ar_token', data.token || 'token_auth');
      localStorage.setItem('mine_ar_role', data.role);
      localStorage.setItem('mine_ar_user_id', data.user.id || userId);

      state.userRole = data.role;

      if (data.role === 'supervisor') {
        state.supervisor = data.user;
        window.location.hash = '#supervisor';
      } else {
        state.worker = data.user;
        window.location.hash = '#home';
      }

    } catch (err) {
      if (errorBanner) {
        errorBanner.textContent = err.message || 'Login failed. Please verify credentials.';
        errorBanner.style.display = 'block';
      }
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `<span>LOGIN</span> <span>➔</span>`;
      }
    }
  });
}
