// Activities Screen: Interactive Vocational Drills with Attempt Logging and Dual Tabs

import { speak, playSuccessChime, playPenaltyBuzz } from '../voice.js';

export async function renderActivitiesScreen(container, state) {
  const traineeId = state.worker?.id || 'anik01';
  let activeTab = 'current'; // 'current' or 'history'
  let currentFilter = 'all'; // 'all', 'correct', 'incorrect'

  let activities = [];
  try {
    const resp = await fetch('/api/v1/activities');
    if (resp.ok) {
      activities = await resp.json();
    }
  } catch (e) {
    console.warn('Could not fetch activities from API, using fallback:', e);
  }

  if (!activities || activities.length === 0) {
    activities = [
      {
        id: "act_fire_extinguisher",
        title: "Fire Extinguisher Selection",
        category: "Fire Safety",
        description: "Select certified firefighting agent for underground conveyor drive motor and coal accumulation.",
        question: "Which fire extinguishing media must be selected for an electrical conveyor belt drive fire in an underground seam?",
        options: ["Water Extinguisher / Spray", "Dry Chemical Powder (DCP - IS 2171)", "Foam Extinguisher", "Carbon Dioxide in Return Airway"],
        correct_answer: "Dry Chemical Powder (DCP - IS 2171)",
        explanation: "Dry Chemical Powder non-conductively interrupts the chemical chain reaction and smothers coal dust without causing an electrical conduction hazard."
      },
      {
        id: "act_ventilation_airway",
        title: "Ventilation Airway Positioning",
        category: "Ventilation",
        description: "Identify statutory upwind positioning during fire and smoke suppression.",
        question: "When approaching a smoldering conveyor friction fire, which airway position provides safety from toxic Carbon Monoxide (CO)?",
        options: ["Return Airway (Downwind)", "Intake Airway (Upwind)", "Directly Underneath Belt Drive", "Neutral Airway"],
        correct_answer: "Intake Airway (Upwind)",
        explanation: "Intake Airway supplies fresh atmospheric air traveling past the firefighter toward the fire, carrying heat, dense smoke, and toxic carbon monoxide away."
      },
      {
        id: "act_methane_threshold",
        title: "Methane Threshold Action",
        category: "Gas Monitoring",
        description: "Statutory DGMS response when inflammable gas reaches critical limits.",
        question: "Under DGMS Coal Mines Regulation 169, what mandatory action is required if inflammable gas reaches 1.25% in the working face?",
        options: ["Continue work but turn on water mist", "Open compressed air valve to dilute gas", "Cut electric power and immediately withdraw team to intake air", "Ignore until gas reaches 5%"],
        correct_answer: "Cut electric power and immediately withdraw team to intake air",
        explanation: "At 1.25% methane (CH4), electrical power supply must be isolated immediately and all personnel withdrawn to fresh air until competent sirdar certifies safety."
      }
    ];
  }

  let historyData = [];
  async function fetchHistory() {
    try {
      const resp = await fetch(`/api/v1/trainees/${traineeId}/activities/history`);
      if (resp.ok) {
        historyData = await resp.json();
      }
    } catch (e) {
      console.warn('Failed to fetch activity history:', e);
    }
  }

  await fetchHistory();

  let selectedActivity = null;
  let startTime = null;

  function renderTabsView() {
    container.innerHTML = `
      <div style="padding-top: 8px;">
        <!-- Header -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <button id="btn-activities-back" class="btn-secondary" style="padding: 6px 12px; border-radius: var(--radius-full);">
              ← Back
            </button>
            <h2 style="font-size: 18px; font-weight: 800; color: var(--text-primary);">Activities & Drills</h2>
          </div>
          <div style="font-size: 12px; font-weight: 700; color: #0284c7; background: #e0f2fe; padding: 4px 10px; border-radius: var(--radius-full);">
            Trainee: ${state.worker?.name || traineeId}
          </div>
        </div>

        <!-- Section Navigation Tabs -->
        <div style="display: flex; gap: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 20px;">
          <button id="tab-btn-current" class="btn-util ${activeTab === 'current' ? 'btn-demo-mode' : ''}" style="flex: 1; font-weight: 800; font-size: 13px; padding: 10px 14px;">
            ⚡ CURRENT ACTIVITIES (${activities.length})
          </button>
          <button id="tab-btn-history" class="btn-util ${activeTab === 'history' ? 'btn-demo-mode' : ''}" style="flex: 1; font-weight: 800; font-size: 13px; padding: 10px 14px;">
            📜 MY TRAINING HISTORY (${historyData.length})
          </button>
        </div>

        <!-- Tab 1: Current Activities Content -->
        <div id="section-current-activities" style="display: ${activeTab === 'current' ? 'block' : 'none'};">
          <!-- Prompt Banner -->
          <div style="background: linear-gradient(135deg, #0284c7, #1e3a8a); color: #ffffff; border-radius: var(--radius-xl); padding: 16px; margin-bottom: 20px; box-shadow: var(--shadow-sm);">
            <div style="font-size: 11px; font-weight: 800; color: #93c5fd; text-transform: uppercase;">MANDATORY VOCATIONAL DRILLS</div>
            <div style="font-size: 15px; font-weight: 800; margin-top: 4px;">
              Statutory DGMS Hazard Responses
            </div>
            <p style="font-size: 12px; color: #cbd5e1; margin-top: 4px; margin-bottom: 0;">
              Complete active scenarios to reinforce emergency instincts. All submissions are automatically recorded in your statutory training history.
            </p>
          </div>

          <!-- Activities List -->
          <div style="display: flex; flex-direction: column; gap: 14px; margin-bottom: 24px;">
            ${activities.map((act) => `
              <div class="training-card" data-act-id="${act.id}" style="cursor: pointer; transition: transform 0.15s ease, box-shadow 0.15s ease;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                  <span style="background: #e0f2fe; color: #0369a1; font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: var(--radius-full);">
                    ${act.category}
                  </span>
                  <span style="font-size: 11px; color: #16a34a; font-weight: 700; background: #dcfce7; padding: 2px 8px; border-radius: var(--radius-full);">+15 XP</span>
                </div>
                <h4 style="font-size: 15px; font-weight: 800; color: var(--text-primary); margin-bottom: 4px;">
                  ${act.title}
                </h4>
                <p style="font-size: 12.5px; color: var(--text-secondary); line-height: 1.5; margin-bottom: 12px;">
                  ${act.description}
                </p>
                <button class="btn-primary" style="width: 100%; padding: 10px; font-size: 13px;">
                  Start Drill Attempt ➔
                </button>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Tab 2: My Training History Content -->
        <div id="section-history-activities" style="display: ${activeTab === 'history' ? 'block' : 'none'};">
          <!-- Summary Banner -->
          <div style="background: linear-gradient(135deg, #1e293b, #0f172a); border-radius: var(--radius-xl); padding: 16px; color: #ffffff; margin-bottom: 16px; box-shadow: var(--shadow-sm);">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <span style="font-size: 10.5px; text-transform: uppercase; color: #94a3b8; font-weight: 700;">PERMANENT ATTEMPT AUDIT</span>
                <h3 style="font-size: 16px; font-weight: 800; margin-top: 2px;">${state.worker?.name || 'Trainee'} Log</h3>
              </div>
              <div style="text-align: right;">
                <span style="font-size: 22px; font-weight: 900; color: #10b981;">
                  ${historyData.filter(h => h.is_correct).length}/${historyData.length}
                </span>
                <div style="font-size: 10.5px; color: #94a3b8;">Drills Passed</div>
              </div>
            </div>
          </div>

          <!-- Filter Pills -->
          <div style="display: flex; gap: 8px; margin-bottom: 16px; overflow-x: auto; scrollbar-width: none;">
            <button class="btn-util ${currentFilter === 'all' ? 'btn-demo-mode' : ''}" data-act-filter="all">
              All Attempts (${historyData.length})
            </button>
            <button class="btn-util ${currentFilter === 'correct' ? 'btn-demo-mode' : ''}" data-act-filter="correct">
              ✅ Correct (${historyData.filter(h => h.is_correct).length})
            </button>
            <button class="btn-util ${currentFilter === 'incorrect' ? 'btn-demo-mode' : ''}" data-act-filter="incorrect">
              ❌ Incorrect (${historyData.filter(h => !h.is_correct).length})
            </button>
          </div>

          <!-- History Attempt Cards -->
          <div id="history-cards-container" style="display: flex; flex-direction: column; gap: 14px; margin-bottom: 24px;">
            ${renderHistoryCards()}
          </div>
        </div>

        <!-- Inspection Modal Container Slot -->
        <div id="activity-detail-modal-slot"></div>
      </div>
    `;

    // Back to Home
    container.querySelector('#btn-activities-back')?.addEventListener('click', () => {
      window.location.hash = '#home';
    });

    // Tab Switches
    container.querySelector('#tab-btn-current')?.addEventListener('click', () => {
      activeTab = 'current';
      renderTabsView();
    });

    container.querySelector('#tab-btn-history')?.addEventListener('click', () => {
      activeTab = 'history';
      renderTabsView();
    });

    // Filter Buttons
    container.querySelectorAll('[data-act-filter]').forEach(btn => {
      btn.addEventListener('click', () => {
        currentFilter = btn.getAttribute('data-act-filter');
        const cardsSlot = container.querySelector('#history-cards-container');
        if (cardsSlot) {
          cardsSlot.innerHTML = renderHistoryCards();
          bindHistoryCardEvents();
        }
        container.querySelectorAll('[data-act-filter]').forEach(b => b.classList.remove('btn-demo-mode'));
        btn.classList.add('btn-demo-mode');
      });
    });

    // Drill Card Clicks
    container.querySelectorAll('[data-act-id]').forEach(card => {
      card.addEventListener('click', () => {
        const aid = card.getAttribute('data-act-id');
        selectedActivity = activities.find(a => a.id === aid);
        renderDrillView();
      });
    });

    bindHistoryCardEvents();
  }

  function renderHistoryCards() {
    let list = historyData;
    if (currentFilter === 'correct') {
      list = historyData.filter(item => item.is_correct);
    } else if (currentFilter === 'incorrect') {
      list = historyData.filter(item => !item.is_correct);
    }

    if (list.length === 0) {
      return `
        <div style="background: #ffffff; padding: 24px; border-radius: var(--radius-lg); text-align: center; color: var(--text-muted); border: 1px solid #e2e8f0;">
          No attempts found under this filter.
        </div>
      `;
    }

    return list.map(item => `
      <div class="training-card" style="border-left: 5px solid ${item.is_correct ? '#10b981' : '#ef4444'};">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
          <div>
            <span style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">
              ${item.activity_category} • ATTEMPT #${item.attempt_number}
            </span>
            <h4 style="font-size: 15px; font-weight: 800; color: var(--text-primary); margin-top: 2px;">
              ${item.activity_title}
            </h4>
          </div>
          <div style="text-align: right;">
            <span style="display: inline-block; padding: 3px 8px; border-radius: var(--radius-full); font-size: 11px; font-weight: 800; background: ${item.is_correct ? '#d1fae5' : '#fee2e2'}; color: ${item.is_correct ? '#065f46' : '#991b1b'};">
              ${item.is_correct ? '✅ CORRECT' : '❌ INCORRECT'}
            </span>
            <div style="font-size: 10px; color: #94a3b8; margin-top: 4px;">
              ${item.timestamp ? new Date(item.timestamp).toLocaleDateString() : 'Recent'}
            </div>
          </div>
        </div>

        <div style="background: #f8fafc; padding: 10px 12px; border-radius: var(--radius-md); margin-bottom: 10px; font-size: 12.5px;">
          <div style="font-size: 10px; font-weight: 800; color: #64748b; text-transform: uppercase;">QUESTION</div>
          <div style="font-weight: 600; color: #0f172a; margin-top: 2px; line-height: 1.4;">
            ${item.question}
          </div>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px;">
          <div style="font-size: 12px;">
            <span style="color: ${item.is_correct ? '#16a34a' : '#dc2626'}; font-weight: 800;">
              ${item.xp_delta >= 0 ? `+${item.xp_delta}` : item.xp_delta} XP
            </span>
            <span style="color: #64748b; margin-left: 8px;">Time: ${item.time_taken_sec}s</span>
          </div>
          <button class="btn-secondary btn-inspect-attempt" data-item-id="${item.id}" style="padding: 5px 12px; font-size: 12px; font-weight: 700; color: #0284c7; border-color: #0284c7;">
            🔍 Inspect Details ➔
          </button>
        </div>
      </div>
    `).join('');
  }

  function bindHistoryCardEvents() {
    container.querySelectorAll('.btn-inspect-attempt').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-item-id');
        const item = historyData.find(h => h.id === id);
        if (item) {
          openInspectionModal(item);
        }
      });
    });
  }

  function openInspectionModal(item) {
    const modalSlot = container.querySelector('#activity-detail-modal-slot');
    if (!modalSlot) return;

    modalSlot.innerHTML = `
      <div class="modal-overlay open" id="inspect-modal-overlay">
        <div class="modal-sheet" style="max-width: 600px; padding: 22px; max-height: 90vh; overflow-y: auto;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px solid #e2e8f0; padding-bottom: 12px; margin-bottom: 16px;">
            <div>
              <span style="font-size: 11px; font-weight: 800; color: #0284c7; text-transform: uppercase;">
                ${item.activity_category} • ATTEMPT #${item.attempt_number} AUDIT
              </span>
              <h3 style="font-size: 17px; font-weight: 800; color: var(--text-primary); margin-top: 2px;">
                ${item.activity_title}
              </h3>
            </div>
            <button id="btn-close-inspect" class="btn-secondary" style="padding: 6px 12px; border-radius: var(--radius-full);">
              ✕ Close
            </button>
          </div>

          <!-- Question Box -->
          <div style="background: #f8fafc; border-left: 4px solid #0284c7; padding: 12px 14px; border-radius: var(--radius-md); margin-bottom: 16px;">
            <div style="font-size: 10.5px; font-weight: 800; color: #64748b; text-transform: uppercase;">STATUTORY SCENARIO QUESTION</div>
            <div style="font-size: 13.5px; font-weight: 700; color: #0f172a; margin-top: 4px; line-height: 1.45;">
              ${item.question}
            </div>
          </div>

          <!-- Answer Comparison Grid -->
          <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 16px;">
            <div style="background: ${item.is_correct ? '#ecfdf5' : '#fef2f2'}; border: 1.5px solid ${item.is_correct ? '#10b981' : '#ef4444'}; border-radius: var(--radius-md); padding: 12px;">
              <div style="font-size: 10.5px; font-weight: 800; color: ${item.is_correct ? '#065f46' : '#991b1b'}; text-transform: uppercase;">
                YOUR SUBMITTED ANSWER ${item.is_correct ? '✓ (CORRECT)' : '❌ (INCORRECT)'}
              </div>
              <div style="font-size: 13px; font-weight: 700; color: ${item.is_correct ? '#065f46' : '#991b1b'}; margin-top: 4px;">
                ${item.selected_answer}
              </div>
            </div>

            ${!item.is_correct ? `
              <div style="background: #ecfdf5; border: 1.5px solid #10b981; border-radius: var(--radius-md); padding: 12px;">
                <div style="font-size: 10.5px; font-weight: 800; color: #065f46; text-transform: uppercase;">
                  MANDATORY DGMS STATUTORY ANSWER
                </div>
                <div style="font-size: 13px; font-weight: 700; color: #065f46; margin-top: 4px;">
                  ${item.correct_answer}
                </div>
              </div>
            ` : ''}
          </div>

          <!-- Performance Metric Row -->
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 16px;">
            <div style="background: #f8fafc; padding: 10px; border-radius: var(--radius-md); text-align: center; border: 1px solid #e2e8f0;">
              <div style="font-size: 10px; color: #64748b; font-weight: 700;">ACCURACY</div>
              <div style="font-size: 18px; font-weight: 900; color: ${item.is_correct ? '#10b981' : '#ef4444'};">${item.score}%</div>
            </div>
            <div style="background: #f8fafc; padding: 10px; border-radius: var(--radius-md); text-align: center; border: 1px solid #e2e8f0;">
              <div style="font-size: 10px; color: #64748b; font-weight: 700;">XP IMPACT</div>
              <div style="font-size: 18px; font-weight: 900; color: ${item.xp_delta >= 0 ? '#10b981' : '#ef4444'};">${item.xp_delta >= 0 ? `+${item.xp_delta}` : item.xp_delta}</div>
            </div>
            <div style="background: #f8fafc; padding: 10px; border-radius: var(--radius-md); text-align: center; border: 1px solid #e2e8f0;">
              <div style="font-size: 10px; color: #64748b; font-weight: 700;">REACTION TIME</div>
              <div style="font-size: 18px; font-weight: 900; color: #0284c7;">${item.time_taken_sec}s</div>
            </div>
          </div>

          <!-- Explanation -->
          <div style="background: #f0f9ff; border: 1px solid #bae6fd; border-radius: var(--radius-md); padding: 14px; margin-bottom: 16px; font-size: 12.5px; line-height: 1.5; color: #0369a1;">
            <strong style="display: block; margin-bottom: 4px;">DGMS Regulatory Guidance:</strong>
            ${item.explanation}
          </div>

          <!-- Improvement Notes if any -->
          ${item.improvement_notes ? `
            <div style="background: #fefce8; border: 1px solid #fef08a; border-radius: var(--radius-md); padding: 12px; margin-bottom: 16px; font-size: 12.5px; color: #854d0e;">
              <strong>Trainee Development Advice:</strong> ${item.improvement_notes}
            </div>
          ` : ''}

          <button id="btn-close-inspect-bottom" class="btn-primary" style="width: 100%; padding: 10px; font-size: 13px;">
            Close Audit Inspector
          </button>
        </div>
      </div>
    `;

    modalSlot.querySelector('#btn-close-inspect')?.addEventListener('click', () => {
      modalSlot.innerHTML = '';
    });
    modalSlot.querySelector('#btn-close-inspect-bottom')?.addEventListener('click', () => {
      modalSlot.innerHTML = '';
    });
  }

  function renderDrillView() {
    startTime = performance.now();
    const act = selectedActivity;

    container.innerHTML = `
      <div style="padding-top: 8px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <button id="btn-drill-back" class="btn-secondary" style="padding: 6px 12px; border-radius: var(--radius-full);">
            ← Back to Activities
          </button>
          <span style="font-size: 11px; font-weight: 800; color: #0284c7; background: #e0f2fe; padding: 4px 10px; border-radius: var(--radius-full);">
            ${act.category}
          </span>
        </div>

        <div style="background: #ffffff; border-radius: var(--radius-xl); padding: 20px; border: 1px solid #e2e8f0; box-shadow: var(--shadow-sm); margin-bottom: 20px;">
          <h3 style="font-size: 17px; font-weight: 800; color: var(--text-primary); margin-bottom: 6px;">
            ${act.title}
          </h3>
          <p style="font-size: 12.5px; color: var(--text-secondary); margin-bottom: 16px;">
            Read carefully and select the single correct statutory procedure.
          </p>

          <!-- Question Box -->
          <div style="background: #f8fafc; border-left: 4px solid #0284c7; padding: 14px; border-radius: var(--radius-md); margin-bottom: 16px;">
            <div style="font-size: 10px; font-weight: 800; color: #64748b; text-transform: uppercase; margin-bottom: 4px;">QUESTION</div>
            <div style="font-size: 14px; font-weight: 700; color: #0f172a; line-height: 1.45;">
              ${act.question}
            </div>
          </div>

          <!-- Options List -->
          <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 16px;" id="drill-options">
            ${act.options.map((opt) => `
              <button class="deck-btn" data-drill-opt="${opt}" style="text-align: left; padding: 14px; font-size: 13px; color: #1e293b; background: #f8fafc; border: 1px solid #cbd5e1; line-height: 1.4;">
                ${opt}
              </button>
            `).join('')}
          </div>

          <!-- Live Feedback Slot -->
          <div id="drill-feedback" style="display: none; padding: 14px; border-radius: var(--radius-md); font-size: 13px; line-height: 1.5; margin-bottom: 14px;"></div>

          <div id="drill-action-footer" style="display: none; display: flex; gap: 10px;">
            <button id="btn-see-history-now" class="btn-primary" style="flex: 1; font-size: 13px;">
              📜 View in My Training History
            </button>
            <button id="btn-retry-drill" class="btn-secondary" style="flex: 1; font-size: 13px;">
              🔄 Try Drill Again
            </button>
          </div>
        </div>
      </div>
    `;

    container.querySelector('#btn-drill-back')?.addEventListener('click', () => {
      renderTabsView();
    });

    const fbSlot = container.querySelector('#drill-feedback');
    const footerSlot = container.querySelector('#drill-action-footer');

    container.querySelectorAll('[data-drill-opt]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const selected = btn.getAttribute('data-drill-opt');
        const elapsedSec = Math.round(((performance.now() - startTime) / 1000) * 10) / 10;

        container.querySelectorAll('[data-drill-opt]').forEach(b => b.disabled = true);

        // Submit to Backend API
        let attemptRes = null;
        try {
          const resp = await fetch(`/api/v1/activities/${act.id}/attempt`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              trainee_id: traineeId,
              activity_id: act.id,
              selected_answer: selected,
              time_taken_sec: elapsedSec
            })
          });
          if (resp.ok) {
            attemptRes = await resp.json();
            if (state.worker) state.worker.xp = attemptRes.new_xp;
            // refresh history data in memory
            await fetchHistory();
          }
        } catch (e) {
          console.warn('Offline activity attempt save:', e);
        }

        const isCorrect = selected.trim().toLowerCase() === act.correct_answer.trim().toLowerCase();

        fbSlot.style.display = 'block';
        footerSlot.style.display = 'flex';

        if (isCorrect) {
          btn.style.borderColor = '#10b981';
          btn.style.background = '#d1fae5';
          fbSlot.style.background = '#d1fae5';
          fbSlot.style.color = '#065f46';
          fbSlot.innerHTML = `
            <strong>✓ Correct Answer! (+15 XP)</strong><br>
            Time taken: ${elapsedSec}s • Attempt #${attemptRes?.attempt_number || 1}<br>
            <em>${act.explanation}</em>
            ${attemptRes?.improvement_notes ? `<br><br><strong>Note:</strong> ${attemptRes.improvement_notes}` : ''}
          `;
          playSuccessChime();
          speak("Correct response. Your answer has been saved to your activity history.");
        } else {
          btn.style.borderColor = '#ef4444';
          btn.style.background = '#fee2e2';
          fbSlot.style.background = '#fee2e2';
          fbSlot.style.color = '#991b1b';
          fbSlot.innerHTML = `
            <strong>❌ Incorrect Answer (-10 XP)</strong><br>
            Your answer: <em>${selected}</em><br>
            Correct answer: <strong>${act.correct_answer}</strong><br><br>
            <strong>Why:</strong> ${act.explanation}
          `;
          playPenaltyBuzz();
          speak("Incorrect. Both this attempt and the correct solution have been logged in your history.");
        }

        container.querySelector('#btn-see-history-now')?.addEventListener('click', () => {
          activeTab = 'history';
          renderTabsView();
        });

        container.querySelector('#btn-retry-drill')?.addEventListener('click', () => {
          renderDrillView();
        });
      });
    });
  }

  renderTabsView();
}
