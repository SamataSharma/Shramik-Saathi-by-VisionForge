// Certificate View Screen: Trainee Certificate Eligibility & Supervisor Verification

import { t } from '../i18n.js';
import { renderQRCodeSVG } from '../assessment/certificate.js';

export async function renderCertificateView(container, state) {
  const traineeId = state.worker?.id || 'anik01';
  let certStatus = null;

  try {
    const resp = await fetch(`/api/v1/trainees/${traineeId}/certificate-status`);
    if (resp.ok) {
      certStatus = await resp.json();
    }
  } catch (e) {
    console.warn('Certificate status fetch fallback:', e);
  }

  const isIssued = certStatus && certStatus.status === 'ISSUED';
  const cert = certStatus?.certificate;

  if (!isIssued) {
    // Trainee view when certificate is not yet issued by supervisor
    container.innerHTML = `
      <div style="padding-top: 8px;">
        <!-- Header -->
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 20px;">
          <button id="btn-cert-back" class="btn-secondary" style="padding: 6px 12px; border-radius: var(--radius-full);">
            ← ${t('back')}
          </button>
          <h2 style="font-size: 18px; font-weight: 800; color: var(--text-primary);">${t('cert_eligibility')}</h2>
        </div>

        <!-- Pending Review Status Card -->
        <div style="background: #ffffff; border-radius: var(--radius-xl); padding: 24px; border: 1.5px solid #cbd5e1; box-shadow: var(--shadow-sm); text-align: center; margin-bottom: 20px;">
          <div style="width: 64px; height: 64px; border-radius: 50%; background: #fef3c7; color: #b45309; display: flex; align-items: center; justify-content: center; font-size: 30px; margin: 0 auto 16px auto;">
            ⏳
          </div>

          <span style="background: #fef3c7; color: #92400e; font-size: 11px; font-weight: 800; padding: 4px 12px; border-radius: var(--radius-full);">
            ${t('pending_issuance')}
          </span>

          <h3 style="font-size: 18px; font-weight: 800; color: var(--text-primary); margin: 14px 0 6px 0;">
            ${t('cert_dgms_title')}
          </h3>
          <p style="font-size: 13px; color: var(--text-secondary); line-height: 1.5; max-width: 340px; margin: 0 auto 20px auto;">
            ${t('cert_authority_note')}
          </p>

          <div style="background: #f8fafc; border-radius: var(--radius-md); padding: 14px; text-align: left; font-size: 12.5px; border-left: 4px solid #0284c7; margin-bottom: 20px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
              <span style="color: #64748b;">${t('role_worker')}:</span>
              <strong>${state.worker?.name || 'Anik Mondol'}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
              <span style="color: #64748b;">${t('competency_score')}:</span>
              <strong style="color: #10b981;">${state.worker?.competency_score || 78.5}%</strong>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #64748b;">${t('benchmark_target')}:</span>
              <span>Min 75% (${t('status_competent')})</span>
            </div>
          </div>

          <div style="font-size: 12px; color: #64748b;">
            🔒 ${t('cert_authority_note')}
          </div>
        </div>

        <button id="btn-return-home" class="btn-primary" style="width: 100%; padding: 12px; font-size: 13px;">
          ${t('return_worker_home')}
        </button>
      </div>
    `;

    container.querySelector('#btn-cert-back')?.addEventListener('click', () => {
      window.location.hash = '#home';
    });

    container.querySelector('#btn-return-home')?.addEventListener('click', () => {
      window.location.hash = '#home';
    });
    return;
  }

  // Official Certificate Display (when ISSUED by Supervisor)
  const certId = cert.cert_id;
  const qrSvg = renderQRCodeSVG(`https://visionforge.mine-ar.in/verify/${certId}`);

  container.innerHTML = `
    <div style="padding-top: 8px;">
      <!-- Header -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <button id="btn-cert-back" class="btn-secondary" style="padding: 6px 12px; border-radius: var(--radius-full);">
          ← ${t('back')}
        </button>
        <button id="btn-print-cert" class="btn-primary" style="padding: 6px 14px; font-size: 12px;">
          ${t('cert_print_pdf')}
        </button>
      </div>

      <!-- Certificate Outer Frame -->
      <div class="certificate-frame">
        <!-- DGMS Emblem -->
        <div class="cert-emblem">
          <svg viewBox="0 0 60 60" width="60" height="60">
            <circle cx="30" cy="30" r="28" fill="#1b3a5b" stroke="#f59e0b" stroke-width="2"/>
            <path d="M20 40 L30 18 L40 40 Z" fill="#f59e0b"/>
            <circle cx="30" cy="24" r="4" fill="#ffffff"/>
            <line x1="16" y1="42" x2="44" y2="42" stroke="#ffffff" stroke-width="2"/>
          </svg>
        </div>

        <div class="cert-dgms-header">
          DIRECTORATE GENERAL OF MINES SAFETY (DGMS)<br>
          GOVERNMENT OF INDIA • DHANBAD COALFIELDS REGION
        </div>

        <h2 class="cert-main-title">${t('cert_dgms_title')}</h2>

        <div class="cert-recipient-label">This is to certify that</div>
        <div class="cert-worker-name">${cert.worker_name}</div>

        <p class="cert-body-desc">
          has successfully completed all required training modules and demonstrated statutory proficiency in <strong>Underground Mine Fire Emergency Response, PASS Extinguisher Deployment, and Ventilation Safety</strong> under DGMS & Coal Mines Regulations 2017.
        </p>

        <!-- QR Code & Cryptographic Verification -->
        <div style="margin: 16px 0;">
          <div class="cert-qr-box">${qrSvg}</div>
          <div style="font-family: monospace; font-size: 10px; color: #64748b; margin-top: 6px;">
            VERIFY ID: ${certId}
          </div>
        </div>

        <!-- Meta Grid -->
        <div class="cert-meta-grid">
          <div class="cert-meta-col">
            <div class="cert-meta-label">${t('competency_index')}</div>
            <div class="cert-meta-val" style="color: #10b981;">${cert.competency_score}%</div>
          </div>
          <div class="cert-meta-col">
            <div class="cert-meta-label">DATE OF ISSUE</div>
            <div class="cert-meta-val">${cert.issue_date}</div>
          </div>
          <div class="cert-meta-col">
            <div class="cert-meta-label">AUTHORIZED BY</div>
            <div class="cert-meta-val" style="color: #0284c7;">${cert.issued_by_supervisor_id || 'Supervisor R.K. Verma'}</div>
          </div>
        </div>
      </div>
    </div>
  `;

  container.querySelector('#btn-cert-back')?.addEventListener('click', () => {
    window.location.hash = '#home';
  });

  container.querySelector('#btn-print-cert')?.addEventListener('click', () => {
    window.print();
  });
}
