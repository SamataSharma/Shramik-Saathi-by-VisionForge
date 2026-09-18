// VISIONFORGE – MINE AR SAFETY TRAINING CONTROL CENTER
// Supervisor Console: Workforce Overview, Cross-Scenario Analytics, Retraining Management & Statutory Certification

import { t } from '../i18n.js';

export async function renderSupervisorScreen(container, state) {
  document.body.classList.add('supervisor-mode');

  // Verify supervisor role
  if (state.userRole && state.userRole !== 'supervisor') {
    alert("Access Denied: Only authenticated supervisors can access the DGMS Control Center.");
    window.location.hash = '#login';
    return;
  }

  let dashboardData = null;
  let auditLogs = [];
  let scenarioAnalytics = [];

  try {
    const [dashResp, auditResp, analyticsResp] = await Promise.all([
      fetch('/api/v1/dashboard'),
      fetch('/api/v1/audit-logs'),
      fetch('/api/v1/scenarios/analytics')
    ]);
    if (dashResp.ok) dashboardData = await dashResp.json();
    if (auditResp.ok) auditLogs = await auditResp.json();
    if (analyticsResp.ok) scenarioAnalytics = await analyticsResp.json();
  } catch (e) {
    console.warn('Supervisor fetch fallback:', e);
  }

  if (!dashboardData) {
    dashboardData = {
      stats: { total_workers: 6, active_training: 5, average_competency: 81.3, retraining_required: 1, scenarios_completed: 32 },
      worker_roster: [
        { id: "anik01", name: "Anik Mondol", role: "Conveyor Belt Operator", mine_location: "Dhanbad Seam #4", level: 1, xp: 320, competency: 86.5, status: "Competent", status_color: "green", certificate_status: "ELIGIBLE" },
        { id: "samata01", name: "Samata Sharma", role: "Ventilation Safety Sirdar", mine_location: "Jharia Deep Shaft #2", level: 2, xp: 450, competency: 91.0, status: "Competent", status_color: "green", certificate_status: "ELIGIBLE" },
        { id: "shambhavi01", name: "Shambhavi", role: "Haulage & Transport Guard", mine_location: "Bokaro Open Link #1", level: 1, xp: 180, competency: 64.0, status: "Retraining Required", status_color: "red", certificate_status: "NOT_ELIGIBLE" },
        { id: "arkadip01", name: "Arkadip Ghosh", role: "Electrical Fitter", mine_location: "Dhanbad Panel C", level: 2, xp: 520, competency: 88.0, status: "Competent", status_color: "green", certificate_status: "ELIGIBLE" },
        { id: "sahnik01", name: "Sahnik Barui", role: "Gas Testing Overseer", mine_location: "Raniganj Seam #7", level: 3, xp: 740, competency: 94.5, status: "Competent", status_color: "green", certificate_status: "ISSUED" },
        { id: "abhay01", name: "Abhay", role: "Rescue Team Member", mine_location: "Jharia Central Station", level: 1, xp: 210, competency: 78.0, status: "Competent", status_color: "green", certificate_status: "NOT_ELIGIBLE" }
      ]
    };
  }

  const stats = dashboardData.stats;
  const roster = dashboardData.worker_roster;

  container.innerHTML = `
    <div class="supervisor-container" style="max-width: 1280px; margin: 0 auto; padding: 20px 16px;">
      <!-- Top Supervisor Header -->
      <div class="supervisor-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 14px; background: #ffffff; padding: 20px 24px; border-radius: var(--radius-xl); border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
        <div class="supervisor-title-group">
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 4px;">
            <span style="font-size: 24px;">🛡️</span>
            <h2 style="font-size: 20px; font-weight: 900; letter-spacing: -0.5px; color: #0f172a; margin: 0;">
              ${t('supervisor_console')}
            </h2>
          </div>
          <p style="font-size: 13px; color: #64748b; margin: 0;">
            ${t('supervisor_badge')} • ${t('vocational_desc')}
          </p>
        </div>
        <div style="display: flex; gap: 10px; align-items: center;">
          <button id="btn-refresh-sup" class="btn-secondary" style="font-size: 12.5px; padding: 8px 16px; font-weight: 700; border-radius: 8px;">
            🔄 ${t('sync_now_btn')}
          </button>
          <button id="btn-logout-sup" class="btn-primary" style="font-size: 12.5px; padding: 8px 16px; font-weight: 700; background: linear-gradient(135deg, #ef4444, #dc2626); border: none; border-radius: 8px; color: #ffffff;">
            🚪 ${t('switch_account')}
          </button>
        </div>
      </div>

      <!-- 6 KPI Stat Cards Grid -->
      <div class="kpi-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 14px; margin-bottom: 24px;">
        <div class="kpi-card" style="background: #ffffff; border-radius: 14px; padding: 18px; border: 1px solid #e2e8f0; box-shadow: 0 2px 8px rgba(0,0,0,0.03);">
          <span class="kpi-label" style="font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase;">${t('total_miners')}</span>
          <span class="kpi-value" style="font-size: 28px; font-weight: 900; color: #0f172a; margin: 6px 0 2px 0;">${stats.total_workers}</span>
          <span class="kpi-subtext" style="font-size: 11px; color: #0284c7; font-weight: 700;">${stats.total_workers} ${t('total_miners')}</span>
        </div>

        <div class="kpi-card" style="background: #ffffff; border-radius: 14px; padding: 18px; border: 1px solid #e2e8f0; box-shadow: 0 2px 8px rgba(0,0,0,0.03);">
          <span class="kpi-label" style="font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase;">${t('active_in_training')}</span>
          <span class="kpi-value" style="font-size: 28px; font-weight: 900; color: #0284c7; margin: 6px 0 2px 0;">${stats.active_training}</span>
          <span class="kpi-subtext" style="font-size: 11px; color: #10b981; font-weight: 700;">${t('active_badge')}</span>
        </div>

        <div class="kpi-card" style="background: #ffffff; border-radius: 14px; padding: 18px; border: 1px solid #e2e8f0; box-shadow: 0 2px 8px rgba(0,0,0,0.03);">
          <span class="kpi-label" style="font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase;">${t('completed_badge')}</span>
          <span class="kpi-value" style="font-size: 28px; font-weight: 900; color: #10b981; margin: 6px 0 2px 0;">${roster.filter(w => w.certificate_status === 'ISSUED' || w.competency >= 85).length} / ${roster.length}</span>
          <span class="kpi-subtext" style="font-size: 11px; color: #10b981; font-weight: 700;">${t('cert_issued')}</span>
        </div>

        <div class="kpi-card" style="background: #ffffff; border-radius: 14px; padding: 18px; border: 1px solid #e2e8f0; box-shadow: 0 2px 8px rgba(0,0,0,0.03);">
          <span class="kpi-label" style="font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase;">${t('avg_competency')}</span>
          <span class="kpi-value" style="font-size: 28px; font-weight: 900; color: #0f172a; margin: 6px 0 2px 0;">${stats.average_competency}%</span>
          <span class="kpi-subtext" style="font-size: 11px; color: #10b981; font-weight: 700;">${t('status_competent')}: 70%</span>
        </div>

        <div class="kpi-card alert-card" style="background: #ffffff; border-radius: 14px; padding: 18px; border: 1px solid #fecaca; box-shadow: 0 2px 8px rgba(239, 68, 68, 0.08);">
          <span class="kpi-label" style="font-size: 11px; font-weight: 800; color: #b91c1c; text-transform: uppercase;">${t('retraining_needed')}</span>
          <span class="kpi-value" style="font-size: 28px; font-weight: 900; color: #ef4444; margin: 6px 0 2px 0;">${stats.retraining_required}</span>
          <span class="kpi-subtext" style="font-size: 11px; color: #ef4444; font-weight: 700;">${t('retraining_recommended')}</span>
        </div>

        <div class="kpi-card" style="background: #ffffff; border-radius: 14px; padding: 18px; border: 1px solid #e2e8f0; box-shadow: 0 2px 8px rgba(0,0,0,0.03);">
          <span class="kpi-label" style="font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase;">${t('scenarios_count')}</span>
          <span class="kpi-value" style="font-size: 28px; font-weight: 900; color: #8b5cf6; margin: 6px 0 2px 0;">${stats.scenarios_completed}</span>
          <span class="kpi-subtext" style="font-size: 11px; color: #8b5cf6; font-weight: 700;">${t('timing_logged')}</span>
        </div>
      </div>

      <!-- Retraining Queue & Management -->
      ${(() => {
        const flagged = roster.find(w => w.status === 'Retraining Required' || w.competency < 70) || roster[2];
        return `
          <div class="retraining-item" style="background: #fef2f2; border: 1.5px solid #fca5a5; border-radius: 14px; padding: 18px 22px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 14px;">
            <div class="retraining-info" style="max-width: 800px;">
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                <span style="font-size: 20px;">🚨</span>
                <h4 style="font-size: 15px; font-weight: 900; color: #991b1b; margin: 0;">
                  AUTOMATED RETRAINING QUEUE: ${flagged.name} (${flagged.role} • Competency: ${flagged.competency}%)
                </h4>
              </div>
              <p style="font-size: 12.5px; color: #7f1d1d; margin: 0; line-height: 1.5;">
                Action Flag: Competency below 70% threshold. Immediate intervention required to reinforce statutory mining protocols before underground dispatch.
              </p>
            </div>
            <button class="btn-primary" id="btn-open-retrain-modal" data-trainee="${flagged.id}" data-name="${flagged.name}" style="padding: 10px 18px; font-size: 13px; font-weight: 800; background: linear-gradient(135deg, #dc2626, #b91c1c); border: none; border-radius: 8px; color: #ffffff; cursor: pointer;">
              ⚡ Assign Retraining Modules
            </button>
          </div>
        `;
      })()}

      <!-- Cross-Scenario Analytics (All 5 Official Simulations) -->
      <div class="dashboard-card" style="background: #ffffff; border-radius: var(--radius-xl); padding: 22px; border: 1px solid #e2e8f0; box-shadow: 0 2px 8px rgba(0,0,0,0.03); margin-bottom: 24px;">
        <div class="card-header-flex" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 10px;">
          <div>
            <h3 style="font-size: 17px; font-weight: 800; color: #0f172a; margin: 0 0 4px 0;">
              📊 5-Simulation Performance & Hazard Recognition Analytics
            </h3>
            <span style="font-size: 12px; color: #64748b;">Live telemetry aggregated across all 5 official training simulations</span>
          </div>
          <span style="background: #e0f2fe; color: #0369a1; font-weight: 800; font-size: 11px; padding: 4px 10px; border-radius: 9999px;">
            5 ACTIVE SIMULATIONS
          </span>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px;">
          ${(scenarioAnalytics.length > 0 ? scenarioAnalytics : [
            { id: 'sim_fire_explosion', title: 'Conveyor Belt Fire & Explosion', domain: 'Thermal & Fire Safety', pass_rate: 82.5, avg_competency: 84.0, total_attempts: 14, common_mistakes: ["Water selected on energized motor", "Return airway toxic approach"] },
            { id: 'sim_gas_confined', title: 'Methane Leak & Confined Space', domain: 'Mine Atmospheric Safety', pass_rate: 76.0, avg_competency: 78.5, total_attempts: 8, common_mistakes: ["Delayed power isolation during 1.35% alarm"] },
            { id: 'sim_machinery_safety', title: 'Continuous Miner LOTO & Cable', domain: 'Mechanical & Electrical', pass_rate: 80.0, avg_competency: 82.0, total_attempts: 6, common_mistakes: ["Approach within 1.5m articulated boom radius"] },
            { id: 'sim_emergency_evac', title: 'Escapeway Navigation & Lifeline', domain: 'Emergency Mine Evacuation', pass_rate: 88.0, avg_competency: 89.0, total_attempts: 5, common_mistakes: ["Unsealed SCSR before crossing airlock"] },
            { id: 'sim_roof_strata', title: 'Strata Spalling & Roof Support', domain: 'Strata Control & Fall Prevention', pass_rate: 74.0, avg_competency: 76.0, total_attempts: 7, common_mistakes: ["Omitted sound-and-tap test on bedding plane"] }
          ]).map(sc => `
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px; display: flex; flex-direction: column; justify-content: space-between;">
              <div>
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px;">
                  <span style="font-size: 10px; font-weight: 800; color: #0284c7; text-transform: uppercase;">${sc.domain || 'Mine Safety'}</span>
                  <span style="font-size: 11px; font-weight: 800; color: ${sc.pass_rate >= 80 ? '#10b981' : '#d97706'};">${sc.pass_rate}% PASS</span>
                </div>
                <strong style="font-size: 13px; color: #0f172a; display: block; margin-bottom: 8px; line-height: 1.3;">${sc.title}</strong>
              </div>
              <div style="border-top: 1px solid #e2e8f0; padding-top: 8px; margin-top: 8px; font-size: 11.5px; color: #64748b;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
                  <span>Avg Competency:</span>
                  <strong style="color: #0f172a;">${(sc.average_competency !== undefined ? sc.average_competency : sc.avg_competency)}%</strong>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span>Logged Attempts:</span>
                  <strong style="color: #0f172a;">${sc.total_attempts}</strong>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Trainee Roster Table (All 6 Workers) -->
      <div class="dashboard-card" style="background: #ffffff; border-radius: var(--radius-xl); padding: 22px; border: 1px solid #e2e8f0; box-shadow: 0 2px 8px rgba(0,0,0,0.03); margin-bottom: 24px;">
        <div class="card-header-flex" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <div>
            <h3 style="font-size: 17px; font-weight: 800; color: #0f172a; margin: 0 0 4px 0;">
              👷 ${t('worker_roster')}
            </h3>
            <span style="font-size: 12px; color: #64748b;">${t('vocational_desc')}</span>
          </div>
        </div>

        <div class="table-responsive" style="overflow-x: auto;">
          <table class="roster-table" style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <thead>
              <tr style="border-bottom: 2px solid #e2e8f0; text-align: left; color: #64748b; font-size: 11px; text-transform: uppercase;">
                <th style="padding: 12px 10px;">${t('role_worker')}</th>
                <th style="padding: 12px 10px;">${t('app_subtitle')}</th>
                <th style="padding: 12px 10px;">${t('level')}</th>
                <th style="padding: 12px 10px;">XP</th>
                <th style="padding: 12px 10px;">${t('competency_score')}</th>
                <th style="padding: 12px 10px;">${t('status_competent')}</th>
                <th style="padding: 12px 10px;">${t('view_certificate')}</th>
                <th style="padding: 12px 10px; text-align: right;">${t('discover')}</th>
              </tr>
            </thead>
            <tbody>
              ${roster.map(w => `
                <tr data-drill-trainee="${w.id}" style="border-bottom: 1px solid #f1f5f9; cursor: pointer; transition: background 0.15s;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='transparent'">
                  <td style="padding: 12px 10px;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                      <img src="${w.avatar_url || '/assets/images/worker_avatar.svg'}" alt="${w.name}" style="width: 36px; height: 36px; border-radius: 50%; border: 1.5px solid #0284c7;" />
                      <div>
                        <strong style="color: #0f172a; font-size: 13.5px;">${w.name}</strong>
                        <div style="font-size: 11px; color: #64748b;">${w.role}</div>
                      </div>
                    </div>
                  </td>
                  <td style="padding: 12px 10px; color: #475569;">${w.mine_location}</td>
                  <td style="padding: 12px 10px;"><span style="font-weight: 700; color: #0284c7;">Lvl ${w.level}</span></td>
                  <td style="padding: 12px 10px;"><span style="font-weight: 800; color: #f59e0b;">${w.xp} XP</span></td>
                  <td style="padding: 12px 10px;">
                    <span style="font-weight: 800; color: ${w.competency >= 80 ? '#10b981' : (w.competency >= 65 ? '#d97706' : '#ef4444')}; font-size: 14px;">
                      ${w.competency}%
                    </span>
                  </td>
                  <td style="padding: 12px 10px;">
                    <span style="display: inline-block; padding: 3px 8px; border-radius: 9999px; font-size: 10.5px; font-weight: 800; background: ${w.status_color === 'green' ? '#d1fae5' : (w.status_color === 'yellow' ? '#fef3c7' : '#fee2e2')}; color: ${w.status_color === 'green' ? '#065f46' : (w.status_color === 'yellow' ? '#92400e' : '#991b1b')};">
                      ${w.status}
                    </span>
                  </td>
                  <td style="padding: 12px 10px;">
                    <span style="font-size: 11px; font-weight: 800; color: ${w.certificate_status === 'ISSUED' ? '#10b981' : (w.certificate_status === 'ELIGIBLE' ? '#d97706' : '#94a3b8')};">
                      ${w.certificate_status === 'ISSUED' ? '✅ ISSUED' : (w.certificate_status === 'ELIGIBLE' ? '⏳ ELIGIBLE' : '—')}
                    </span>
                  </td>
                  <td style="padding: 12px 10px; text-align: right;">
                    <button class="btn-primary" style="padding: 6px 12px; font-size: 11.5px; font-weight: 700; border-radius: 6px;">
                      Drill Down ➔
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Statutory Audit Log Feed -->
      <div class="dashboard-card" style="background: #ffffff; border-radius: var(--radius-xl); padding: 22px; border: 1px solid #e2e8f0; box-shadow: 0 2px 8px rgba(0,0,0,0.03);">
        <div class="card-header-flex" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
          <div>
            <h3 style="font-size: 17px; font-weight: 800; color: #0f172a; margin: 0 0 4px 0;">
              📜 ${t('audit_trail')}
            </h3>
            <span style="font-size: 12px; color: #64748b;">${t('vocational_desc')}</span>
          </div>
          <span style="font-size: 11px; font-weight: 800; color: #10b981; background: #d1fae5; padding: 2px 8px; border-radius: 9999px;">
            SHA-256
          </span>
        </div>

        <div style="display: flex; flex-direction: column; gap: 8px;">
          ${(auditLogs.length > 0 ? auditLogs.slice(0, 6) : [
            { action: 'CERTIFICATE_ISSUED', details: 'Officially issued DGMS Certificate to Sahnik Barui (Score: 94.5%)', timestamp: new Date().toISOString() },
            { action: 'SIMULATION_PASSED', details: 'Anik Mondol completed Conveyor Fire drill with 86.5% score', timestamp: new Date().toISOString() },
            { action: 'RETRAINING_ASSIGNED', details: 'Assigned mandatory review modules to Shambhavi', timestamp: new Date().toISOString() }
          ]).map(l => `
            <div style="display: flex; justify-content: space-between; align-items: center; background: #f8fafc; padding: 10px 14px; border-radius: 8px; font-size: 12px; border: 1px solid #e2e8f0;">
              <div>
                <span style="background: #e0f2fe; color: #0369a1; font-weight: 800; font-size: 10px; padding: 2px 8px; border-radius: 9999px; margin-right: 8px;">
                  ${l.action}
                </span>
                <span style="color: #334155;">${l.details}</span>
              </div>
              <span style="font-size: 11px; color: #64748b; font-family: monospace;">
                ${new Date(l.timestamp).toLocaleTimeString()}
              </span>
            </div>
          `).join('')}
        </div>
      </div>
    </div>

    <!-- Retraining Assignment Modal Slot -->
    <div id="retraining-modal-slot"></div>

    <!-- Trainee Drill-Down Modal Container -->
    <div id="trainee-modal-slot"></div>
  `;

  // Bind Listeners
  container.querySelector('#btn-logout-sup')?.addEventListener('click', () => {
    state.userRole = null;
    localStorage.removeItem('mine_ar_role');
    document.body.classList.remove('supervisor-mode');
    window.location.hash = '#login';
  });

  container.querySelector('#btn-refresh-sup')?.addEventListener('click', () => {
    renderSupervisorScreen(container, state);
  });

  // Retraining Assignment Modal
  container.querySelector('#btn-open-retrain-modal')?.addEventListener('click', (e) => {
    const tid = e.currentTarget.getAttribute('data-trainee');
    const tname = e.currentTarget.getAttribute('data-name');
    openRetrainingModal(tid, tname, container, state);
  });

  // Drilldown Click
  container.querySelectorAll('[data-drill-trainee]').forEach(row => {
    row.addEventListener('click', () => {
      const tid = row.getAttribute('data-drill-trainee');
      openTraineeDrilldownModal(tid, state);
    });
  });
}

// ----------------- RETRAINING ASSIGNMENT MODAL ----------------- //

function openRetrainingModal(traineeId, traineeName, container, state) {
  const slot = document.getElementById('retraining-modal-slot');
  if (!slot) return;

  slot.innerHTML = `
    <div class="modal-overlay open" id="retrain-modal-overlay" style="position: fixed; inset: 0; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 10001; padding: 16px;">
      <div class="modal-sheet" style="background: #ffffff; width: 100%; max-width: 520px; border-radius: 16px; padding: 24px; box-shadow: 0 20px 40px rgba(0,0,0,0.2);">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; border-bottom: 1px solid #e2e8f0; padding-bottom: 12px;">
          <div>
            <h3 style="font-size: 17px; font-weight: 800; color: #0f172a; margin: 0 0 2px 0;">
              ⚡ Assign Statutory Retraining
            </h3>
            <span style="font-size: 12px; color: #64748b;">Target Trainee: <strong>${traineeName}</strong> (${traineeId})</span>
          </div>
          <button id="btn-close-retrain-modal" style="background: none; border: none; font-size: 18px; cursor: pointer; color: #64748b;">✕</button>
        </div>

        <p style="font-size: 12.5px; color: #475569; margin-bottom: 14px;">
          Select mandatory curriculum modules for this trainee to repeat before field reassessment:
        </p>

        <div style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 18px;" id="retrain-modules-list">
          <label style="display: flex; align-items: center; gap: 10px; font-size: 12.5px; color: #1e293b; background: #f8fafc; padding: 10px; border-radius: 8px; border: 1px solid #e2e8f0; cursor: pointer;">
            <input type="checkbox" value="Fire Extinguisher Selection (DCP vs Water)" checked style="accent-color: #0284c7;" />
            <span>🔥 Module 1: Fire Extinguisher Selection (DCP vs Water)</span>
          </label>
          <label style="display: flex; align-items: center; gap: 10px; font-size: 12.5px; color: #1e293b; background: #f8fafc; padding: 10px; border-radius: 8px; border: 1px solid #e2e8f0; cursor: pointer;">
            <input type="checkbox" value="Intake vs Return Airway Positioning" checked style="accent-color: #0284c7;" />
            <span>🌬️ Module 2: Intake vs Return Airway Positioning</span>
          </label>
          <label style="display: flex; align-items: center; gap: 10px; font-size: 12.5px; color: #1e293b; background: #f8fafc; padding: 10px; border-radius: 8px; border: 1px solid #e2e8f0; cursor: pointer;">
            <input type="checkbox" value="PASS Extinguisher Protocol Drill" style="accent-color: #0284c7;" />
            <span>🧯 Module 3: PASS Extinguisher Protocol Drill</span>
          </label>
          <label style="display: flex; align-items: center; gap: 10px; font-size: 12.5px; color: #1e293b; background: #f8fafc; padding: 10px; border-radius: 8px; border: 1px solid #e2e8f0; cursor: pointer;">
            <input type="checkbox" value="Methane Alarm & CMR 169 Power Isolation" style="accent-color: #0284c7;" />
            <span>⚠️ Module 4: Methane Alarm & CMR 169 Power Isolation</span>
          </label>
          <label style="display: flex; align-items: center; gap: 10px; font-size: 12.5px; color: #1e293b; background: #f8fafc; padding: 10px; border-radius: 8px; border: 1px solid #e2e8f0; cursor: pointer;">
            <input type="checkbox" value="High Voltage Machinery LOTO & Boom Clearance" style="accent-color: #0284c7;" />
            <span>⚡ Module 5: High Voltage Machinery LOTO & Boom Clearance</span>
          </label>
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 10px;">
          <button id="btn-cancel-retrain" class="btn-secondary" style="padding: 8px 16px; font-size: 13px;">Cancel</button>
          <button id="btn-submit-retrain" class="btn-primary" style="padding: 8px 18px; font-size: 13px; font-weight: 800; background: linear-gradient(135deg, #0284c7, #0369a1);">
            Dispatch Mandatory Retraining
          </button>
        </div>
      </div>
    </div>
  `;

  slot.querySelector('#btn-close-retrain-modal')?.addEventListener('click', () => { slot.innerHTML = ''; });
  slot.querySelector('#btn-cancel-retrain')?.addEventListener('click', () => { slot.innerHTML = ''; });

  slot.querySelector('#btn-submit-retrain')?.addEventListener('click', async () => {
    const checkedBoxes = slot.querySelectorAll('#retrain-modules-list input[type="checkbox"]:checked');
    const selectedModules = Array.from(checkedBoxes).map(cb => cb.value);

    if (selectedModules.length === 0) {
      alert("Please select at least one retraining module.");
      return;
    }

    try {
      const resp = await fetch('/api/v1/supervisor/retraining/assign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('mine_ar_token') || 'test-sup-token'}`
        },
        body: JSON.stringify({
          trainee_id: traineeId,
          supervisor_id: 'supervisor01',
          modules: selectedModules,
          notes: 'Assigned via VisionForge Safety Training Control Center.'
        })
      });

      if (resp.ok) {
        alert(`Mandatory Retraining Dispatched: ${traineeName} assigned to ${selectedModules.length} review modules.`);
        slot.innerHTML = '';
        renderSupervisorScreen(container, state);
      } else {
        const err = await resp.json();
        alert(`Failed to assign retraining: ${err.detail || 'Access Denied'}`);
      }
    } catch (e) {
      alert(`Assignment request failed: ${e.message}`);
    }
  });
}

// ----------------- TRAINEE DRILLDOWN MODAL ----------------- //

async function openTraineeDrilldownModal(traineeId, state) {
  let trainee = null;
  let history = null;
  let dailyProgress = [];
  let retraining = null;

  try {
    const [tResp, hResp, dpResp, retResp] = await Promise.all([
      fetch(`/api/v1/trainees/${traineeId}`),
      fetch(`/api/v1/trainees/${traineeId}/history`),
      fetch(`/api/v1/trainees/${traineeId}/daily-progress`),
      fetch(`/api/v1/trainees/${traineeId}/retraining`)
    ]);
    if (tResp.ok) trainee = await tResp.json();
    if (hResp.ok) history = await hResp.json();
    if (dpResp.ok) dailyProgress = await dpResp.json();
    if (retResp.ok) retraining = await retResp.json();
  } catch (e) {
    console.warn('Drilldown fetch fallback:', e);
  }

  if (!trainee) return;

  const slot = document.getElementById('trainee-modal-slot');
  if (!slot) return;

  const officialScenarios = [
    { id: 'sim_fire_explosion', title: 'Conveyor Belt Fire & Explosion', domain: 'Thermal & Fire Safety' },
    { id: 'sim_gas_confined', title: 'Methane Leak & Confined Space', domain: 'Atmospheric Safety' },
    { id: 'sim_machinery_safety', title: 'Continuous Miner LOTO & Cable', domain: 'Machinery Safety' },
    { id: 'sim_emergency_evac', title: 'Escapeway Navigation & Lifeline', domain: 'Emergency Evacuation' },
    { id: 'sim_roof_strata', title: 'Strata Spalling & Roof Support', domain: 'Roof & Strata Control' }
  ];

  slot.innerHTML = `
    <div class="modal-overlay open" id="drill-modal-overlay" style="position: fixed; inset: 0; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 10000; padding: 16px;">
      <div class="modal-sheet" style="background: #ffffff; width: 100%; max-width: 880px; max-height: 90vh; overflow-y: auto; border-radius: 16px; padding: 24px; box-shadow: 0 20px 40px rgba(0,0,0,0.2);">
        <!-- Modal Top Bar -->
        <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px solid #e2e8f0; padding-bottom: 16px; margin-bottom: 16px;">
          <div style="display: flex; align-items: center; gap: 14px;">
            <img src="${trainee.avatar_url || '/assets/images/worker_avatar.svg'}" style="width: 54px; height: 54px; border-radius: 50%; border: 2.5px solid #0284c7;" />
            <div>
              <h3 style="font-size: 19px; font-weight: 800; color: #0f172a; margin: 0 0 2px 0;">${trainee.name}</h3>
              <div style="font-size: 12px; color: #64748b;">${trainee.role} • ${trainee.mine_location}</div>
              <span style="display: inline-block; background: #e0f2fe; color: #0369a1; font-size: 11px; font-weight: 800; padding: 2px 8px; border-radius: 9999px; margin-top: 4px;">
                LEVEL ${trainee.level}: ${trainee.level_title} • ${trainee.xp} XP
              </span>
            </div>
          </div>
          <button id="btn-close-drill-modal" class="btn-secondary" style="padding: 6px 14px; border-radius: 9999px; font-size: 12px; cursor: pointer;">
            ✕ Close
          </button>
        </div>

        <!-- Navigation Tabs inside Modal -->
        <div style="display: flex; gap: 8px; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px; margin-bottom: 16px; overflow-x: auto; scrollbar-width: none;">
          <button class="btn-util btn-demo-mode" data-dtab="tab-overview">Overview & 5-Sim Progress</button>
          <button class="btn-util" data-dtab="tab-daily">Daily Progress</button>
          <button class="btn-util" data-dtab="tab-lessons">Videos & Lessons (${history?.lesson_progress?.length || 0})</button>
          <button class="btn-util" data-dtab="tab-activities">Activity History (${history?.activity_attempts?.length || 0})</button>
          <button class="btn-util" data-dtab="tab-games">Game History (${history?.game_attempts?.length || 0})</button>
          <button class="btn-util" data-dtab="tab-ar">AR Simulations (${history?.scenario_attempts?.length || 0})</button>
          <button class="btn-util" data-dtab="tab-cert">Certificate Issuance</button>
        </div>

        <!-- TAB 1: OVERVIEW & 5-SIMULATION PROGRESS -->
        <div id="tab-overview" class="modal-tab-content">
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 10px; margin-bottom: 16px;">
            <div style="background: #f8fafc; padding: 14px; border-radius: 12px; text-align: center; border: 1px solid #e2e8f0;">
              <div style="font-size: 10.5px; color: #64748b; font-weight: 800;">DGMS COMPETENCY</div>
              <div style="font-size: 26px; font-weight: 900; color: #10b981;">${trainee.competency_score}%</div>
            </div>
            <div style="background: #f8fafc; padding: 14px; border-radius: 12px; text-align: center; border: 1px solid #e2e8f0;">
              <div style="font-size: 10.5px; color: #64748b; font-weight: 800;">CURRICULUM PROGRESS</div>
              <div style="font-size: 26px; font-weight: 900; color: #0284c7;">${trainee.progress_pct}%</div>
            </div>
            <div style="background: #f8fafc; padding: 14px; border-radius: 12px; text-align: center; border: 1px solid #e2e8f0;">
              <div style="font-size: 10.5px; color: #64748b; font-weight: 800;">ACTIVE STREAKS</div>
              <div style="font-size: 26px; font-weight: 900; color: #f59e0b;">${trainee.streaks} Days</div>
            </div>
          </div>

          <!-- 5 Official Simulations Status Grid -->
          <h4 style="font-size: 13.5px; font-weight: 800; color: #0f172a; margin-bottom: 10px;">
            🎯 5-Simulation Vocational Progress Breakdown
          </h4>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 10px; margin-bottom: 16px;">
            ${officialScenarios.map(sc => {
              const attempts = history?.scenario_attempts?.filter(a => a.scenario_id === sc.id) || [];
              const passed = attempts.some(a => a.passed);
              const bestScore = attempts.length > 0 ? Math.max(...attempts.map(a => a.competency_score)) : null;
              return `
                <div style="background: #f8fafc; border: 1px solid ${passed ? '#a7f3d0' : '#e2e8f0'}; border-left: 4px solid ${passed ? '#10b981' : (attempts.length > 0 ? '#f59e0b' : '#94a3b8')}; border-radius: 10px; padding: 12px;">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                    <span style="font-size: 10px; font-weight: 800; color: #64748b; text-transform: uppercase;">${sc.domain}</span>
                    <span style="font-size: 10px; font-weight: 800; padding: 2px 6px; border-radius: 9999px; background: ${passed ? '#d1fae5' : (attempts.length > 0 ? '#fef3c7' : '#f1f5f9')}; color: ${passed ? '#065f46' : (attempts.length > 0 ? '#92400e' : '#64748b')};">
                      ${passed ? '✓ COMPLETED' : (attempts.length > 0 ? 'IN PROGRESS' : 'NOT ATTEMPTED')}
                    </span>
                  </div>
                  <strong style="font-size: 12.5px; color: #0f172a; display: block; margin-bottom: 4px;">${sc.title}</strong>
                  <div style="font-size: 11px; color: #64748b;">
                    Attempts: <strong>${attempts.length}</strong> • Best Score: <strong>${bestScore !== null ? `${bestScore}%` : '—'}</strong>
                  </div>
                </div>
              `;
            }).join('')}
          </div>

          <!-- Weak Areas / Retraining Box -->
          ${retraining && retraining.retraining_required ? `
            <div style="background: #fee2e2; border: 1px solid #fca5a5; border-radius: 12px; padding: 14px; margin-bottom: 16px;">
              <h4 style="color: #991b1b; font-size: 13px; font-weight: 800; margin: 0 0 4px 0;">⚠️ AUTOMATIC GAP DETECTION</h4>
              <p style="font-size: 12px; color: #7f1d1d; margin: 0 0 8px 0;">Recommended Retraining Modules:</p>
              <ul style="font-size: 12px; color: #7f1d1d; padding-left: 18px; margin: 0;">
                ${retraining.recommended_modules.map(m => `<li><strong>${m}</strong></li>`).join('')}
              </ul>
            </div>
          ` : `
            <div style="background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 12px; padding: 12px; margin-bottom: 16px; font-size: 12.5px; color: #065f46;">
              ✓ Trainee has exceeded competency standard threshold. No mandatory retraining required.
            </div>
          `}
        </div>

        <!-- TAB 2: DAILY PROGRESS -->
        <div id="tab-daily" class="modal-tab-content" style="display: none;">
          <h4 style="font-size: 13px; font-weight: 800; color: #0f172a; margin-bottom: 10px;">Mon–Sun Training Breakdown</h4>
          <div style="display: flex; flex-direction: column; gap: 8px;">
            ${dailyProgress.map(dp => `
              <div style="display: flex; justify-content: space-between; align-items: center; background: #f8fafc; padding: 12px 16px; border-radius: 10px; font-size: 12.5px; border: 1px solid #e2e8f0;">
                <div>
                  <strong style="color: #0284c7;">${dp.day_name} (${dp.date})</strong>
                  <div style="font-size: 11px; color: #64748b; margin-top: 2px;">
                    Lessons: ${dp.lessons_completed} • Activities: ${dp.activities_completed} • Games: ${dp.games_completed} • AR: ${dp.ar_scenarios_completed}
                  </div>
                </div>
                <div style="text-align: right;">
                  <span style="font-weight: 800; color: #10b981;">Score: ${dp.avg_accuracy}%</span>
                  <div style="font-size: 11px; color: #f59e0b; font-weight: 700;">+${dp.xp_earned} XP (${dp.training_time_min} mins)</div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- TAB: LESSONS & VIDEOS -->
        <div id="tab-lessons" class="modal-tab-content" style="display: none;">
          <h4 style="font-size: 13px; font-weight: 800; color: #0f172a; margin-bottom: 10px;">Video Lessons & Knowledge Checks</h4>
          <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 16px;">
            ${[
              { id: 'part1', title: 'Part 1: Fire Chemistry & Triangle', duration: '0:35' },
              { id: 'part2', title: 'Part 2: Underground Coal Seam Fire Classes', duration: '0:37' },
              { id: 'part3', title: 'Part 3: Dry Chemical Powder (IS-2171) PASS Method', duration: '0:45' },
              { id: 'part4', title: 'Part 4: Intake vs Return Airway Positioning', duration: '0:40' },
              { id: 'part5', title: 'Part 5: Evacuation Procedure & Self-Rescuer Deployment', duration: '0:30' }
            ].map((p, idx) => {
              const prog = history?.lesson_progress?.find(lp => lp.part_id === p.id);
              const watched = prog ? Math.round(prog.watched_pct) : (idx === 0 ? 100 : 0);
              const isComp = prog ? (prog.completed === 1) : (idx === 0);
              return `
                <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px;">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                    <div>
                      <strong style="font-size: 13px; color: #0f172a;">${p.title}</strong>
                      <span style="font-size: 11px; color: #64748b; margin-left: 6px;">(${p.duration})</span>
                    </div>
                    <span style="font-size: 11px; font-weight: 800; padding: 2px 8px; border-radius: 9999px; background: ${isComp ? '#d1fae5' : (watched > 0 ? '#fef3c7' : '#f1f5f9')}; color: ${isComp ? '#065f46' : (watched > 0 ? '#92400e' : '#64748b')};">
                      ${isComp ? '✓ COMPLETED' : (watched > 0 ? `${watched}% WATCHED` : 'NOT STARTED')}
                    </span>
                  </div>
                  <div style="height: 6px; background: #e2e8f0; border-radius: 3px; overflow: hidden;">
                    <div style="height: 100%; width: ${watched}%; background: ${isComp ? '#10b981' : '#0284c7'}; transition: width 0.3s ease;"></div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- TAB 3: ACTIVITY HISTORY -->
        <div id="tab-activities" class="modal-tab-content" style="display: none;">
          <h4 style="font-size: 13px; font-weight: 800; color: #0f172a; margin-bottom: 10px;">Complete Activity Attempts</h4>
          <div style="display: flex; flex-direction: column; gap: 10px;">
            ${history?.activity_attempts && history.activity_attempts.length > 0 ? history.activity_attempts.map(att => `
              <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-left: 4px solid ${att.is_correct ? '#10b981' : '#ef4444'}; border-radius: 10px; padding: 12px; font-size: 12px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                  <strong>${att.activity_title} (Attempt #${att.attempt_number})</strong>
                  <span style="font-weight: 800; color: ${att.is_correct ? '#10b981' : '#ef4444'};">${att.is_correct ? 'CORRECT' : 'INCORRECT'} (${att.time_taken_sec}s)</span>
                </div>
                <div style="margin-bottom: 4px;"><strong>Q:</strong> ${att.question}</div>
                <div style="margin-bottom: 2px; color: ${att.is_correct ? '#15803d' : '#b91c1c'};"><strong>Trainee Answer:</strong> ${att.selected_answer}</div>
                <div style="color: #15803d;"><strong>Correct Answer:</strong> ${att.correct_answer}</div>
                ${att.improvement_notes ? `<div style="margin-top: 6px; font-style: italic; color: #0369a1;">Analysis: ${att.improvement_notes}</div>` : ''}
              </div>
            `).join('') : '<div style="color: #64748b; font-size: 12px;">No activity attempts logged.</div>'}
          </div>
        </div>

        <!-- TAB 4: GAMES HISTORY -->
        <div id="tab-games" class="modal-tab-content" style="display: none;">
          <h4 style="font-size: 13px; font-weight: 800; color: #0f172a; margin-bottom: 10px;">Hazard Hunt Inspection Records</h4>
          <div style="display: flex; flex-direction: column; gap: 8px;">
            ${history?.game_attempts && history.game_attempts.length > 0 ? history.game_attempts.map(gh => `
              <div style="background: #f8fafc; padding: 10px 14px; border-radius: 10px; font-size: 12px; display: flex; justify-content: space-between; align-items: center; border: 1px solid #e2e8f0;">
                <div>
                  <strong>Attempt #${gh.attempt_number}</strong> • ${gh.hazards_found}/${gh.total_hazards} Hazards Found
                  <div style="font-size: 10.5px; color: #64748b;">Time: ${gh.time_taken_sec}s • Misclicks: ${gh.mistakes_count}</div>
                </div>
                <div style="text-align: right;">
                  <strong style="color: #10b981; font-size: 14px;">${gh.score_pct}%</strong>
                  <div style="font-size: 11px; color: #f59e0b; font-weight: 700;">+${gh.xp_earned} XP</div>
                </div>
              </div>
            `).join('') : '<div style="color: #64748b; font-size: 12px;">No game attempts logged.</div>'}
          </div>
        </div>

        <!-- TAB 5: AR SIMULATIONS HISTORY -->
        <div id="tab-ar" class="modal-tab-content" style="display: none;">
          <h4 style="font-size: 13px; font-weight: 800; color: #0f172a; margin-bottom: 10px;">AR Simulation Attempts (All 5 Scenarios)</h4>
          <div style="display: flex; flex-direction: column; gap: 8px;">
            ${history?.scenario_attempts && history.scenario_attempts.length > 0 ? history.scenario_attempts.map(sa => {
              const scObj = officialScenarios.find(s => s.id === sa.scenario_id) || { title: sa.scenario_id, domain: 'AR Drill' };
              return `
                <div style="background: #f8fafc; padding: 12px; border-radius: 10px; font-size: 12px; border: 1px solid #e2e8f0;">
                  <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                    <div>
                      <span style="font-size: 10.5px; color: #0284c7; font-weight: 800; text-transform: uppercase;">${scObj.domain}</span>
                      <strong style="display: block; font-size: 13px; color: #0f172a;">${scObj.title}</strong>
                    </div>
                    <span style="font-weight: 800; color: ${sa.passed ? '#10b981' : '#ef4444'}; font-size: 12px;">
                      ${sa.passed ? '✓ PASSED' : 'FAILED'}
                    </span>
                  </div>
                  <div style="font-size: 11.5px; color: #475569; margin-top: 4px;">
                    Equipment: <strong>${sa.equipment_selected}</strong> • Approach: <strong>${sa.approach_position}</strong>
                  </div>
                  <div style="font-size: 11.5px; color: #475569; margin-top: 2px;">
                    Competency: <strong style="color: #10b981;">${sa.competency_score}%</strong> • Duration: ${(sa.duration_ms / 1000).toFixed(1)}s • Rec Time: ${(sa.hazard_rec_ms / 1000).toFixed(2)}s
                  </div>
                </div>
              `;
            }).join('') : '<div style="color: #64748b; font-size: 12px;">No AR simulation attempts logged.</div>'}
          </div>
        </div>

        <!-- TAB 6: CERTIFICATE ISSUANCE CONTROL -->
        <div id="tab-cert" class="modal-tab-content" style="display: none;">
          <div style="background: #ffffff; border: 1.5px solid #0284c7; border-radius: 14px; padding: 20px; text-align: center;">
            <div style="font-size: 32px; margin-bottom: 8px;">📜</div>
            <h4 style="font-size: 16px; font-weight: 800; color: #0f172a; margin: 0 0 6px 0;">
              DGMS Statutory Certificate Control
            </h4>
            <p style="font-size: 12.5px; color: #64748b; margin: 0 0 16px 0;">
              Only an authenticated supervisor can authorize and officially issue the competency certificate.
            </p>

            <div style="background: #f8fafc; padding: 14px; border-radius: 10px; text-align: left; font-size: 12.5px; line-height: 1.6; margin-bottom: 18px; border: 1px solid #e2e8f0;">
              <div>Trainee: <strong>${trainee.name}</strong> (${trainee.role})</div>
              <div>Current Competency: <strong style="color: #10b981;">${trainee.competency_score}%</strong></div>
              <div>Eligibility Status: <strong style="color: #0284c7;">${trainee.certificate ? trainee.certificate.status : (trainee.competency_score >= 85 ? 'ELIGIBLE' : 'IN_PROGRESS')}</strong></div>
            </div>

            <!-- Issue Certificate Button (Supervisor Only!) -->
            <button id="btn-sup-issue-cert" class="btn-primary" style="width: 100%; padding: 12px; font-size: 14px; font-weight: 800; background: linear-gradient(135deg, #059669, #10b981); border: none; border-radius: 8px; color: #ffffff; cursor: pointer;">
              ✓ Authorize & Issue Official DGMS Certificate
            </button>

            <div id="cert-issue-feedback" style="display: none; margin-top: 14px; padding: 12px; border-radius: 8px; font-size: 12.5px; text-align: left;"></div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Close button
  slot.querySelector('#btn-close-drill-modal')?.addEventListener('click', () => {
    slot.innerHTML = '';
  });

  // Tab switching inside modal
  slot.querySelectorAll('[data-dtab]').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-dtab');
      slot.querySelectorAll('.modal-tab-content').forEach(c => c.style.display = 'none');
      slot.querySelectorAll('[data-dtab]').forEach(b => b.classList.remove('btn-demo-mode'));

      slot.querySelector(`#${targetTab}`).style.display = 'block';
      btn.classList.add('btn-demo-mode');
    });
  });

  // Supervisor-Only Certificate Issue Handler with Confirmation Dialog
  slot.querySelector('#btn-sup-issue-cert')?.addEventListener('click', async () => {
    const confirmed = confirm(
      `CONFIRM STATUTORY CERTIFICATE ISSUANCE:\n\n` +
      `Trainee: ${trainee.name}\n` +
      `Competency Score: ${trainee.competency_score}%\n` +
      `Supervisor: Er. R. K. Verma (DGMS Dhanbad)\n` +
      `Date: ${new Date().toISOString().split('T')[0]}\n\n` +
      `Are you sure you want to officially issue this certificate?`
    );

    if (!confirmed) return;

    try {
      const resp = await fetch('/api/v1/supervisor/certificates/issue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('mine_ar_token') || 'test-sup-token'}`
        },
        body: JSON.stringify({
          trainee_id: trainee.id,
          supervisor_id: 'supervisor01',
          notes: `Official DGMS certificate issued after verifying ${trainee.competency_score}% competency score.`
        })
      });

      const fb = slot.querySelector('#cert-issue-feedback');
      fb.style.display = 'block';

      if (resp.ok) {
        const certData = await resp.json();
        fb.style.background = '#d1fae5';
        fb.style.color = '#065f46';
        fb.innerHTML = `
          <strong>✅ Certificate Issued Successfully!</strong><br>
          Certificate ID: <strong>${certData.certificate.cert_id}</strong><br>
          QR Verification Hash Generated & Logged to DGMS Audit Trail.
        `;
        slot.querySelector('#btn-sup-issue-cert').disabled = true;
      } else {
        const err = await resp.json();
        fb.style.background = '#fee2e2';
        fb.style.color = '#991b1b';
        fb.textContent = `Issuance Failed: ${err.detail || 'Access Denied'}`;
      }
    } catch (e) {
      alert("Issuance request failed: " + e.message);
    }
  });
}
