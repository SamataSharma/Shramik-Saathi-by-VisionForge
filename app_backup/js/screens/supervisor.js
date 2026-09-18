// Supervisor Console: Workforce Overview, Daily Progress, Trainee Drilldown & Certificate Control

export async function renderSupervisorScreen(container, state) {
  document.body.classList.add('supervisor-mode');

  // Verify supervisor role
  if (state.userRole && state.userRole !== 'supervisor') {
    alert("Access Denied: Only authenticated supervisors can access the DGMS Console.");
    window.location.hash = '#login';
    return;
  }

  let dashboardData = null;
  let auditLogs = [];
  try {
    const [dashResp, auditResp] = await Promise.all([
      fetch('/api/v1/dashboard'),
      fetch('/api/v1/audit-logs')
    ]);
    if (dashResp.ok) dashboardData = await dashResp.json();
    if (auditResp.ok) auditLogs = await auditResp.json();
  } catch (e) {
    console.warn('Supervisor fetch fallback:', e);
  }

  if (!dashboardData) {
    dashboardData = {
      stats: { total_workers: 6, active_training: 5, average_competency: 81.3, retraining_required: 1, scenarios_completed: 24 },
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
    <div class="supervisor-container">
      <!-- Top Supervisor Header -->
      <div class="supervisor-header">
        <div class="supervisor-title-group">
          <h2>DGMS Supervisor Console</h2>
          <p>Dhanbad, Jharia & Bokaro Seams • Workforce Safety Audit & Certification Engine</p>
        </div>
        <div style="display: flex; gap: 8px;">
          <button id="btn-logout-sup" class="btn-secondary" style="font-size: 12px; padding: 6px 14px;">
            🚪 Exit / Logout
          </button>
          <button id="btn-refresh-sup" class="btn-primary" style="font-size: 12px; padding: 6px 14px;">
            🔄 Refresh Live Data
          </button>
        </div>
      </div>

      <!-- KPI Grid -->
      <div class="kpi-grid">
        <div class="kpi-card">
          <span class="kpi-label">Registered Trainees</span>
          <span class="kpi-value">${stats.total_workers}</span>
          <span class="kpi-subtext">Active Seam Rosters</span>
        </div>

        <div class="kpi-card">
          <span class="kpi-label">Active Drills</span>
          <span class="kpi-value">${stats.active_training}</span>
          <span class="kpi-subtext">Underground Shifts</span>
        </div>

        <div class="kpi-card">
          <span class="kpi-label">Workforce Competency</span>
          <span class="kpi-value">${stats.average_competency}%</span>
          <span class="kpi-subtext">✓ DGMS Benchmark 75%</span>
        </div>

        <div class="kpi-card alert-card">
          <span class="kpi-label">Retraining Queue</span>
          <span class="kpi-value">${stats.retraining_required}</span>
          <span class="kpi-subtext">Action Required</span>
        </div>

        <div class="kpi-card">
          <span class="kpi-label">Total Attempts Logged</span>
          <span class="kpi-value">${stats.scenarios_completed}</span>
          <span class="kpi-subtext">Zero Data Overwrite</span>
        </div>
      </div>

      <!-- Retraining Queue Alert -->
      <div class="retraining-item" style="margin-bottom: 24px;">
        <div class="retraining-info">
          <h4>🚨 AUTOMATED RETRAINING QUEUE: Amit Singh (Competency: 58.2%)</h4>
          <p>
            Critical Failure: Approached conveyor fire from return airway (downwind). Selected water spray for electrical motor.
          </p>
        </div>
        <button class="btn-secondary" id="btn-sup-reassign" style="padding: 8px 14px; font-size: 12px; border-color: #ef4444; color: #991b1b; font-weight: 700;">
          Reassign Mandatory Modules
        </button>
      </div>

      <!-- Trainee Roster Table -->
      <div class="dashboard-card">
        <div class="card-header-flex">
          <div>
            <h3>Workforce Performance & Audit Roster</h3>
            <span style="font-size: 12px; color: var(--text-muted);">Click any trainee to open complete training history & drilldown</span>
          </div>
        </div>

        <div class="table-responsive">
          <table class="roster-table">
            <thead>
              <tr>
                <th>Trainee</th>
                <th>Mine Seam</th>
                <th>Level</th>
                <th>XP Points</th>
                <th>Competency</th>
                <th>Status</th>
                <th>Certificate</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              ${roster.map(w => `
                <tr data-drill-trainee="${w.id}">
                  <td>
                    <div class="worker-cell">
                      <img src="${w.avatar_url || '/assets/images/worker_avatar.svg'}" alt="${w.name}" class="worker-cell-avatar" />
                      <div class="worker-name-role">
                        <strong>${w.name}</strong>
                        <small>${w.role}</small>
                      </div>
                    </div>
                  </td>
                  <td>${w.mine_location}</td>
                  <td><span style="font-weight: 700;">Lvl ${w.level}</span></td>
                  <td><span style="font-weight: 800; color: #f59e0b;">${w.xp} XP</span></td>
                  <td><span style="font-weight: 800; color: ${w.competency >= 80 ? '#10b981' : (w.competency >= 65 ? '#d97706' : '#ef4444')};">${w.competency}%</span></td>
                  <td>
                    <span class="status-pill status-${w.status_color}">
                      ${w.status}
                    </span>
                  </td>
                  <td>
                    <span style="font-size: 11px; font-weight: 800; color: ${w.certificate_status === 'ISSUED' ? '#10b981' : (w.certificate_status === 'ELIGIBLE' ? '#d97706' : '#64748b')};">
                      ${w.certificate_status === 'ISSUED' ? '✅ ISSUED' : (w.certificate_status === 'ELIGIBLE' ? '⏳ ELIGIBLE' : '—')}
                    </span>
                  </td>
                  <td>
                    <button class="btn-primary" style="padding: 5px 12px; font-size: 11.5px;">
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
      <div class="dashboard-card" style="margin-top: 24px;">
        <div class="card-header-flex">
          <h3>Statutory Audit Trail & Activity Feed</h3>
          <span style="font-size: 11.5px; color: var(--text-muted);">Immutable DGMS compliance log</span>
        </div>
        <div style="display: flex; flex-direction: column; gap: 8px;">
          ${auditLogs.slice(0, 5).map(l => `
            <div style="display: flex; justify-content: space-between; align-items: center; background: #f8fafc; padding: 10px 14px; border-radius: var(--radius-md); font-size: 12px;">
              <div>
                <span style="background: #e0f2fe; color: #0369a1; font-weight: 800; font-size: 10px; padding: 2px 8px; border-radius: var(--radius-full); margin-right: 6px;">
                  ${l.action}
                </span>
                <span>${l.details}</span>
              </div>
              <span style="font-size: 11px; color: var(--text-muted); font-family: monospace;">
                ${new Date(l.timestamp).toLocaleTimeString()}
              </span>
            </div>
          `).join('')}
        </div>
      </div>
    </div>

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

  container.querySelector('#btn-sup-reassign')?.addEventListener('click', () => {
    alert("Mandatory Retraining Dispatched: Amit Singh assigned to Module 2 (Extinguisher Selection) & Module 4 (Airway Positioning).");
  });

  // Drilldown Click
  container.querySelectorAll('[data-drill-trainee]').forEach(row => {
    row.addEventListener('click', () => {
      const tid = row.getAttribute('data-drill-trainee');
      openTraineeDrilldownModal(tid, state);
    });
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

  slot.innerHTML = `
    <div class="modal-overlay open" id="drill-modal-overlay">
      <div class="modal-sheet" style="max-width: 820px; max-height: 90vh; overflow-y: auto; padding: 24px;">
        <!-- Modal Top Bar -->
        <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px solid #e2e8f0; padding-bottom: 16px; margin-bottom: 16px;">
          <div style="display: flex; align-items: center; gap: 14px;">
            <img src="${trainee.avatar_url || '/assets/images/worker_avatar.svg'}" style="width: 52px; height: 52px; border-radius: 50%; border: 2px solid #0284c7;" />
            <div>
              <h3 style="font-size: 19px; font-weight: 800; color: var(--text-primary);">${trainee.name}</h3>
              <div style="font-size: 12px; color: var(--text-secondary);">${trainee.role} • ${trainee.mine_location}</div>
              <span style="display: inline-block; background: #e0f2fe; color: #0369a1; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: var(--radius-full); margin-top: 4px;">
                LEVEL ${trainee.level}: ${trainee.level_title} • ${trainee.xp} XP
              </span>
            </div>
          </div>
          <button id="btn-close-drill-modal" class="btn-secondary" style="padding: 6px 12px; border-radius: var(--radius-full);">
            ✕ Close
          </button>
        </div>

        <!-- Navigation Tabs inside Modal -->
        <div style="display: flex; gap: 8px; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px; margin-bottom: 16px; overflow-x: auto; scrollbar-width: none;">
          <button class="btn-util btn-demo-mode" data-dtab="tab-overview">Overview</button>
          <button class="btn-util" data-dtab="tab-daily">Daily Progress</button>
          <button class="btn-util" data-dtab="tab-lessons">Videos & Lessons (${history?.lesson_progress?.length || 0})</button>
          <button class="btn-util" data-dtab="tab-activities">Activity History (${history?.activity_attempts?.length || 0})</button>
          <button class="btn-util" data-dtab="tab-games">Game History (${history?.game_attempts?.length || 0})</button>
          <button class="btn-util" data-dtab="tab-ar">AR Scenarios (${history?.scenario_attempts?.length || 0})</button>
          <button class="btn-util" data-dtab="tab-cert">Certificate Issuance</button>
        </div>

        <!-- TAB 1: OVERVIEW -->
        <div id="tab-overview" class="modal-tab-content">
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 10px; margin-bottom: 16px;">
            <div style="background: #f8fafc; padding: 12px; border-radius: var(--radius-md); text-align: center;">
              <div style="font-size: 10.5px; color: var(--text-muted); font-weight: 700;">DGMS COMPETENCY</div>
              <div style="font-size: 24px; font-weight: 900; color: #10b981;">${trainee.competency_score}%</div>
            </div>
            <div style="background: #f8fafc; padding: 12px; border-radius: var(--radius-md); text-align: center;">
              <div style="font-size: 10.5px; color: var(--text-muted); font-weight: 700;">CURRICULUM PROGRESS</div>
              <div style="font-size: 24px; font-weight: 900; color: #0284c7;">${trainee.progress_pct}%</div>
            </div>
            <div style="background: #f8fafc; padding: 12px; border-radius: var(--radius-md); text-align: center;">
              <div style="font-size: 10.5px; color: var(--text-muted); font-weight: 700;">ACTIVE STREAKS</div>
              <div style="font-size: 24px; font-weight: 900; color: #f59e0b;">${trainee.streaks} Days</div>
            </div>
          </div>

          <!-- Weak Areas / Retraining Box -->
          ${retraining && retraining.retraining_required ? `
            <div style="background: #fee2e2; border: 1px solid #fca5a5; border-radius: var(--radius-md); padding: 14px; margin-bottom: 16px;">
              <h4 style="color: #991b1b; font-size: 13px; font-weight: 800; margin-bottom: 4px;">⚠️ AUTOMATIC GAP DETECTION</h4>
              <p style="font-size: 12px; color: #7f1d1d; margin-bottom: 8px;">Recommended Retraining Modules:</p>
              <ul style="font-size: 12px; color: #7f1d1d; padding-left: 18px;">
                ${retraining.recommended_modules.map(m => `<li><strong>${m}</strong></li>`).join('')}
              </ul>
            </div>
          ` : `
            <div style="background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: var(--radius-md); padding: 12px; margin-bottom: 16px; font-size: 12.5px; color: #065f46;">
              ✓ Trainee has exceeded competency standard threshold. No mandatory retraining required.
            </div>
          `}
        </div>

        <!-- TAB 2: DAILY PROGRESS -->
        <div id="tab-daily" class="modal-tab-content" style="display: none;">
          <h4 style="font-size: 13px; font-weight: 800; color: var(--text-primary); margin-bottom: 10px;">Mon–Sun Training Breakdown</h4>
          <div style="display: flex; flex-direction: column; gap: 8px;">
            ${dailyProgress.map(dp => `
              <div style="display: flex; justify-content: space-between; align-items: center; background: #f8fafc; padding: 12px 16px; border-radius: var(--radius-md); font-size: 12.5px; border: 1px solid #e2e8f0;">
                <div>
                  <strong style="color: #0284c7;">${dp.day_name} (${dp.date})</strong>
                  <div style="font-size: 11px; color: var(--text-secondary); margin-top: 2px;">
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
          <h4 style="font-size: 13px; font-weight: 800; color: var(--text-primary); margin-bottom: 10px;">Video Lessons & Knowledge Checks</h4>
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
                <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: var(--radius-md); padding: 12px;">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                    <div>
                      <strong style="font-size: 13px; color: var(--text-primary);">${p.title}</strong>
                      <span style="font-size: 11px; color: var(--text-muted); margin-left: 6px;">(${p.duration})</span>
                    </div>
                    <span style="font-size: 11px; font-weight: 800; padding: 2px 8px; border-radius: var(--radius-full); background: ${isComp ? '#d1fae5' : (watched > 0 ? '#fef3c7' : '#f1f5f9')}; color: ${isComp ? '#065f46' : (watched > 0 ? '#92400e' : '#64748b')};">
                      ${isComp ? '✓ COMPLETED' : (watched > 0 ? `${watched}% WATCHED` : 'NOT STARTED')}
                    </span>
                  </div>
                  <!-- Progress Bar -->
                  <div style="height: 6px; background: #e2e8f0; border-radius: 3px; overflow: hidden;">
                    <div style="height: 100%; width: ${watched}%; background: ${isComp ? '#10b981' : '#0284c7'}; transition: width 0.3s ease;"></div>
                  </div>
                  ${prog ? `<div style="font-size: 10.5px; color: #64748b; margin-top: 4px;">Last position: ${Math.round(prog.last_position_sec)}s • Updated: ${new Date(prog.updated_at).toLocaleDateString()}</div>` : ''}
                </div>
              `;
            }).join('')}
          </div>

          <h5 style="font-size: 12px; font-weight: 800; color: var(--text-secondary); text-transform: uppercase; margin-bottom: 8px;">Post-Video Quiz Submissions</h5>
          <div style="display: flex; flex-direction: column; gap: 8px;">
            ${history?.lesson_quizzes && history.lesson_quizzes.length > 0 ? history.lesson_quizzes.map(q => `
              <div style="background: #f8fafc; border-left: 3px solid ${q.is_correct ? '#10b981' : '#ef4444'}; padding: 10px 14px; border-radius: var(--radius-sm); font-size: 12px;">
                <div style="display: flex; justify-content: space-between;">
                  <strong>${q.lesson_id} • Quiz (${q.score}%)</strong>
                  <span style="font-weight: 800; color: ${q.is_correct ? '#10b981' : '#ef4444'};">${q.is_correct ? 'PASSED' : 'FAILED'}</span>
                </div>
                <div style="font-size: 11px; color: var(--text-secondary); margin-top: 2px;">Answer: <em>${q.selected_answer}</em> • ${new Date(q.timestamp).toLocaleDateString()}</div>
              </div>
            `).join('') : '<div style="font-size: 12px; color: #94a3b8;">No post-lesson quizzes submitted yet.</div>'}
          </div>
        </div>

        <!-- TAB 3: ACTIVITY HISTORY -->
        <div id="tab-activities" class="modal-tab-content" style="display: none;">
          <h4 style="font-size: 13px; font-weight: 800; color: var(--text-primary); margin-bottom: 10px;">Complete Activity Attempts</h4>
          <div style="display: flex; flex-direction: column; gap: 10px;">
            ${history?.activity_attempts && history.activity_attempts.length > 0 ? history.activity_attempts.map(att => `
              <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-left: 4px solid ${att.is_correct ? '#10b981' : '#ef4444'}; border-radius: var(--radius-md); padding: 12px; font-size: 12px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                  <strong>${att.activity_title} (Attempt #${att.attempt_number})</strong>
                  <span style="font-weight: 800; color: ${att.is_correct ? '#10b981' : '#ef4444'};">${att.is_correct ? 'CORRECT' : 'INCORRECT'} (${att.time_taken_sec}s)</span>
                </div>
                <div style="margin-bottom: 4px;"><strong>Q:</strong> ${att.question}</div>
                <div style="margin-bottom: 2px; color: ${att.is_correct ? '#15803d' : '#b91c1c'};"><strong>Trainee Answer:</strong> ${att.selected_answer}</div>
                <div style="color: #15803d;"><strong>Correct Answer:</strong> ${att.correct_answer}</div>
                ${att.improvement_notes ? `<div style="margin-top: 6px; font-style: italic; color: #0369a1;">Analysis: ${att.improvement_notes}</div>` : ''}
              </div>
            `).join('') : '<div style="color: #64748b;">No activity attempts logged.</div>'}
          </div>
        </div>

        <!-- TAB 4: GAMES HISTORY -->
        <div id="tab-games" class="modal-tab-content" style="display: none;">
          <h4 style="font-size: 13px; font-weight: 800; color: var(--text-primary); margin-bottom: 10px;">Hazard Hunt Inspection Records</h4>
          <div style="display: flex; flex-direction: column; gap: 8px;">
            ${history?.game_attempts && history.game_attempts.length > 0 ? history.game_attempts.map(gh => `
              <div style="background: #f8fafc; padding: 10px 14px; border-radius: var(--radius-md); font-size: 12px; display: flex; justify-content: space-between; align-items: center; border: 1px solid #e2e8f0;">
                <div>
                  <strong>Attempt #${gh.attempt_number}</strong> • ${gh.hazards_found}/${gh.total_hazards} Hazards Found
                  <div style="font-size: 10.5px; color: #64748b;">Time: ${gh.time_taken_sec}s • Misclicks: ${gh.mistakes_count}</div>
                </div>
                <div style="text-align: right;">
                  <strong style="color: #10b981; font-size: 14px;">${gh.score_pct}%</strong>
                  <div style="font-size: 11px; color: #f59e0b; font-weight: 700;">+${gh.xp_earned} XP</div>
                </div>
              </div>
            `).join('') : '<div style="color: #64748b;">No game attempts logged.</div>'}
          </div>
        </div>

        <!-- TAB 5: AR SCENARIOS -->
        <div id="tab-ar" class="modal-tab-content" style="display: none;">
          <h4 style="font-size: 13px; font-weight: 800; color: var(--text-primary); margin-bottom: 10px;">Underground Conveyor Fire AR Attempts</h4>
          <div style="display: flex; flex-direction: column; gap: 8px;">
            ${history?.scenario_attempts && history.scenario_attempts.length > 0 ? history.scenario_attempts.map(sa => `
              <div style="background: #f8fafc; padding: 12px; border-radius: var(--radius-md); font-size: 12px; border: 1px solid #e2e8f0;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                  <strong>Hazard Rec: ${(sa.hazard_rec_ms / 1000).toFixed(2)}s</strong>
                  <span style="font-weight: 800; color: ${sa.passed ? '#10b981' : '#ef4444'};">${sa.passed ? 'PASSED' : 'FAILED'}</span>
                </div>
                <div>Equipment: <strong>${sa.equipment_selected}</strong> • Approach: <strong>${sa.approach_position}</strong></div>
                <div>Competency: <strong>${sa.competency_score}%</strong> • Total Time: ${(sa.duration_ms / 1000).toFixed(1)}s</div>
              </div>
            `).join('') : '<div style="color: #64748b;">No AR attempts logged.</div>'}
          </div>
        </div>

        <!-- TAB 6: CERTIFICATE ISSUANCE CONTROL -->
        <div id="tab-cert" class="modal-tab-content" style="display: none;">
          <div style="background: #ffffff; border: 1.5px solid #0284c7; border-radius: var(--radius-lg); padding: 18px; text-align: center;">
            <div style="font-size: 28px; margin-bottom: 8px;">📜</div>
            <h4 style="font-size: 16px; font-weight: 800; color: var(--text-primary);">
              DGMS Statutory Certificate Control
            </h4>
            <p style="font-size: 12.5px; color: var(--text-secondary); margin-bottom: 16px;">
              Only an authenticated supervisor can authorize and officially issue the competency certificate.
            </p>

            <div style="background: #f8fafc; padding: 14px; border-radius: var(--radius-md); text-align: left; font-size: 12px; line-height: 1.6; margin-bottom: 18px;">
              <div>Trainee: <strong>${trainee.name}</strong></div>
              <div>Current Competency: <strong style="color: #10b981;">${trainee.competency_score}%</strong></div>
              <div>Status: <strong>${trainee.certificate ? trainee.certificate.status : 'ELIGIBLE'}</strong></div>
            </div>

            <!-- Issue Certificate Button (Supervisor Only!) -->
            <button id="btn-sup-issue-cert" class="btn-primary" style="width: 100%; padding: 12px; font-size: 14px; background: linear-gradient(135deg, #059669, #10b981);">
              ✓ Authorize & Issue Official DGMS Certificate
            </button>

            <div id="cert-issue-feedback" style="display: none; margin-top: 14px; padding: 12px; border-radius: var(--radius-md); font-size: 12.5px;"></div>
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
          'X-User-Role': 'supervisor'
        },
        body: JSON.stringify({
          trainee_id: trainee.id,
          supervisor_id: 'supervisor_admin',
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
