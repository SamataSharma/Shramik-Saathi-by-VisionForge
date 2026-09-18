// Activity History Screen: Complete Trainee Activity Audit with Solution Drilldown

import { t } from '../i18n.js';

export async function renderActivityHistoryScreen(container, state) {
  const traineeId = state.worker?.id || 'anik01';
  let historyData = [];
  let currentFilter = 'all';

  try {
    const resp = await fetch(`/api/v1/trainees/${traineeId}/activities/history`);
    if (resp.ok) {
      historyData = await resp.json();
    }
  } catch (e) {
    console.warn('Failed to fetch activity history:', e);
  }

  // Fallback sample if offline or empty
  if (!historyData || historyData.length === 0) {
    historyData = [
      {
        id: "att_act_002",
        activity_title: "Fire Extinguisher Selection",
        activity_category: "Fire Safety",
        attempt_number: 2,
        question: "Which fire extinguishing media must be selected for an electrical conveyor belt drive fire in an underground seam?",
        selected_answer: "Dry Chemical Powder (DCP - IS 2171)",
        correct_answer: "Dry Chemical Powder (DCP - IS 2171)",
        is_correct: true,
        score: 100,
        xp_delta: 15,
        time_taken_sec: 5.4,
        timestamp: "2026-09-12T14:30:00Z",
        explanation: "Dry Chemical Powder non-conductively interrupts the chemical chain reaction and smothers coal dust without causing an electrical conduction hazard.",
        mistakes: [],
        improvement_notes: "Outstanding improvement! Solved 2.8s faster than Attempt #1 and selected correct non-conductive agent."
      },
      {
        id: "att_act_001",
        activity_title: "Fire Extinguisher Selection",
        activity_category: "Fire Safety",
        attempt_number: 1,
        question: "Which fire extinguishing media must be selected for an electrical conveyor belt drive fire in an underground seam?",
        selected_answer: "Water Extinguisher / Spray",
        correct_answer: "Dry Chemical Powder (DCP - IS 2171)",
        is_correct: false,
        score: 0,
        xp_delta: -10,
        time_taken_sec: 8.2,
        timestamp: "2026-09-11T09:14:00Z",
        explanation: "Dry Chemical Powder non-conductively interrupts the chemical chain reaction and smothers coal dust without causing an electrical conduction hazard.",
        mistakes: ["Selected water spray for electrical conveyor motor", "Risk of high-pressure dust cloud explosion"],
        improvement_notes: "Review Module 2. Never spray solid water onto energized underground conveyor drives."
      }
    ];
  }

  function renderView() {
    let filteredList = historyData;
    if (currentFilter === 'correct') {
      filteredList = historyData.filter(item => item.is_correct);
    } else if (currentFilter === 'incorrect' || currentFilter === 'needs_improvement') {
      filteredList = historyData.filter(item => !item.is_correct);
    }

    container.innerHTML = `
      <div style="padding-top: 8px;">
        <!-- Header -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <button id="btn-hist-back" class="btn-secondary" style="padding: 6px 12px; border-radius: var(--radius-full);">
              ← Back
            </button>
            <h2 style="font-size: 18px; font-weight: 800; color: var(--text-primary);">Activity History</h2>
          </div>
          <button id="btn-goto-practice" class="btn-primary" style="padding: 6px 14px; font-size: 12px;">
            + Practice New Drill
          </button>
        </div>

        <!-- Summary Banner -->
        <div style="background: linear-gradient(135deg, #1b3a5b, #0d233a); border-radius: var(--radius-xl); padding: 18px; color: #ffffff; margin-bottom: 16px; box-shadow: var(--shadow-sm);">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <span style="font-size: 11px; text-transform: uppercase; color: #93c5fd; font-weight: 700;">TRAINEE AUDIT LOG</span>
              <h3 style="font-size: 17px; font-weight: 800; margin-top: 2px;">${state.worker?.name || 'Suresh'}</h3>
            </div>
            <div style="text-align: right;">
              <span style="font-size: 22px; font-weight: 900; color: #10b981;">
                ${historyData.filter(h => h.is_correct).length}/${historyData.length}
              </span>
              <div style="font-size: 10.5px; color: #94a3b8;">Total Drills Passed</div>
            </div>
          </div>
        </div>

        <!-- Filter Pills Bar -->
        <div style="display: flex; gap: 8px; overflow-x: auto; padding-bottom: 8px; margin-bottom: 16px; scrollbar-width: none;">
          <button class="btn-util ${currentFilter === 'all' ? 'btn-demo-mode' : ''}" data-filter="all">
            All Attempts (${historyData.length})
          </button>
          <button class="btn-util ${currentFilter === 'correct' ? 'btn-demo-mode' : ''}" data-filter="correct">
            ✅ Correct (${historyData.filter(h => h.is_correct).length})
          </button>
          <button class="btn-util ${currentFilter === 'incorrect' ? 'btn-demo-mode' : ''}" data-filter="incorrect">
            ❌ Incorrect (${historyData.filter(h => !h.is_correct).length})
          </button>
          <button class="btn-util ${currentFilter === 'needs_improvement' ? 'btn-demo-mode' : ''}" data-filter="needs_improvement">
            ⚠️ Needs Review
          </button>
        </div>

        <!-- History Cards List -->
        <div style="display: flex; flex-direction: column; gap: 14px; margin-bottom: 24px;">
          ${filteredList.length === 0 ? `
            <div style="background: #ffffff; padding: 24px; border-radius: var(--radius-lg); text-align: center; color: var(--text-muted);">
              No activity records found for this filter.
            </div>
          ` : filteredList.map(item => `
            <div class="training-card" style="border-left: 5px solid ${item.is_correct ? '#10b981' : '#ef4444'};">
              <!-- Top Row: Title, Attempt Number, Date -->
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
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
                    ${new Date(item.timestamp).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <!-- Question Section -->
              <div style="background: #f8fafc; padding: 12px; border-radius: var(--radius-md); margin-bottom: 12px;">
                <div style="font-size: 10px; font-weight: 800; color: #64748b; text-transform: uppercase;">QUESTION</div>
                <div style="font-size: 13px; font-weight: 700; color: #0f172a; margin-top: 3px; line-height: 1.4;">
                  ${item.question}
                </div>
              </div>

              <!-- My Answer vs Correct Answer -->
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 12px;">
                <div style="background: ${item.is_correct ? '#f0fdf4' : '#fef2f2'}; border: 1px solid ${item.is_correct ? '#bbf7d0' : '#fecaca'}; padding: 10px; border-radius: var(--radius-md);">
                  <div style="font-size: 10px; font-weight: 800; color: ${item.is_correct ? '#166534' : '#991b1b'}; text-transform: uppercase;">
                    MY PREVIOUS ANSWER
                  </div>
                  <div style="font-size: 12.5px; font-weight: 700; color: ${item.is_correct ? '#15803d' : '#b91c1c'}; margin-top: 3px;">
                    ${item.selected_answer}
                  </div>
                </div>

                <div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 10px; border-radius: var(--radius-md);">
                  <div style="font-size: 10px; font-weight: 800; color: #166534; text-transform: uppercase;">
                    CORRECT ANSWER
                  </div>
                  <div style="font-size: 12.5px; font-weight: 700; color: #15803d; margin-top: 3px;">
                    ${item.correct_answer}
                  </div>
                </div>
              </div>

              <!-- Why It Was Correct (Explanation) -->
              <div style="background: #f1f5f9; padding: 10px 12px; border-radius: var(--radius-md); margin-bottom: 10px; font-size: 12px; line-height: 1.5; color: #334155;">
                <strong style="color: #0369a1;">💡 Why it was correct:</strong> ${item.explanation}
              </div>

              <!-- Metrics & Improvement Footer -->
              <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #e2e8f0; padding-top: 10px; font-size: 11.5px; color: #64748b;">
                <div style="display: flex; gap: 12px;">
                  <span>Score: <strong>${item.score}/100</strong></span>
                  <span>XP: <strong style="color: ${item.xp_delta >= 0 ? '#10b981' : '#ef4444'};">${item.xp_delta >= 0 ? '+' : ''}${item.xp_delta} XP</strong></span>
                  <span>Time: <strong>${item.time_taken_sec}s</strong></span>
                </div>
              </div>

              <!-- What I should improve (if provided) -->
              ${item.improvement_notes ? `
                <div style="margin-top: 8px; padding: 8px 10px; border-radius: var(--radius-sm); font-size: 11.5px; background: ${item.is_correct ? '#ecfdf5' : '#fffbeb'}; color: ${item.is_correct ? '#065f46' : '#92400e'}; border-left: 3px solid ${item.is_correct ? '#10b981' : '#f59e0b'};">
                  <strong>🔍 Improvement Analysis:</strong> ${item.improvement_notes}
                </div>
              ` : ''}
            </div>
          `).join('')}
        </div>
      </div>
    `;

    // Bind listeners
    container.querySelector('#btn-hist-back')?.addEventListener('click', () => {
      window.location.hash = '#activities';
    });

    container.querySelector('#btn-goto-practice')?.addEventListener('click', () => {
      window.location.hash = '#activities';
    });

    container.querySelectorAll('[data-filter]').forEach(btn => {
      btn.addEventListener('click', () => {
        currentFilter = btn.getAttribute('data-filter');
        renderView();
      });
    });
  }

  renderView();
}
