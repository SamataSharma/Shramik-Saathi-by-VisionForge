// Stories Screen: Interactive Decision-Branching Mine Safety Stories

import { speak, playSuccessChime, playPenaltyBuzz } from '../voice.js';

const STORIES = [
  {
    id: "story_1",
    title: "Ravi Notices Smoke Near Conveyor #4",
    location: "Dhanbad Underground Seam",
    intro: "It is 2:40 PM. Miner Ravi is walking along the main trunk haulage roadway when he notices a faint grey haze and a distinctive sweet paraffin odor near roller idler #14.",
    dilemma: "What should Ravi do immediately?",
    choices: [
      {
        text: "A. Walk right up to the hot roller and touch it to check temperature",
        correct: false,
        outcome: "Dangerous! Touching a seized idler can cause severe contact burns, and inhaling localized toxic gases at the point of heating causes acute dizziness.",
        xp: 0
      },
      {
        text: "B. Sound emergency alarm, notify section sirdar, and approach cautiously from intake airway",
        correct: true,
        outcome: "Exemplary! Ravi followed DGMS Regulation 136. Early alarm prevents runaway belt combustion and ensures team safety.",
        xp: 25
      },
      {
        text: "C. Ignore it because shift change is in 20 minutes",
        correct: false,
        outcome: "Fatal negligence! Spontaneous combustion accelerates exponentially. Ignoring it could lead to full gallery ignition before the next shift arrives.",
        xp: 0
      },
      {
        text: "D. Throw a bucket of wash water directly over the electrical roller",
        correct: false,
        outcome: "Extreme hazard! Throwing water over energized electrical idler assemblies risks catastrophic electrocution and steam explosion.",
        xp: 0
      }
    ]
  },
  {
    id: "story_2",
    title: "Methane Whistle at Face #9",
    location: "Jharia Deep Seam #9",
    intro: "While operating the shearer machine, the digital multi-gas monitor emits a high-pitched intermittent tone showing 1.35% CH4 in the return airflow.",
    dilemma: "What is the mandatory statutory protocol under Coal Mines Regulations?",
    choices: [
      {
        text: "A. Keep cutting coal until the coal mine car is full",
        correct: false,
        outcome: "Illegal & Dangerous! DGMS CMR 169 dictates that at 1.25% CH4, all power must be cut and work stopped immediately.",
        xp: 0
      },
      {
        text: "B. Cut machine power, withdraw workers to intake airway, and alert Overman",
        correct: true,
        outcome: "Perfect adherence to CMR 169! De-energizing the machine eliminates ignition sparks, and withdrawing upwind prevents asphyxiation.",
        xp: 30
      },
      {
        text: "C. Open a compressed air valve to blow the methane away",
        correct: false,
        outcome: "Hazardous! Compressed air generates static electricity discharge that can ignite methane-air mixtures.",
        xp: 0
      }
    ]
  }
];

export function renderStoriesScreen(container, state) {
  let activeStoryIdx = 0;

  function renderView() {
    const s = STORIES[activeStoryIdx];

    container.innerHTML = `
      <div style="padding-top: 8px;">
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 20px;">
          <button id="btn-stories-back" class="btn-secondary" style="padding: 6px 12px; border-radius: var(--radius-full);">
            ← Back
          </button>
          <h2 style="font-size: 18px; font-weight: 800; color: var(--text-primary);">Safety Stories</h2>
        </div>

        <!-- Story Header Card -->
        <div style="background: linear-gradient(135deg, #065f46, #047857); border-radius: var(--radius-xl); padding: 22px; color: #ffffff; margin-bottom: 20px; box-shadow: var(--shadow-md);">
          <span style="background: rgba(255, 255, 255, 0.2); color: #ffffff; font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: var(--radius-full);">
            DECISION SCENARIO ${activeStoryIdx + 1} OF ${STORIES.length}
          </span>
          <h3 style="font-size: 19px; font-weight: 800; margin: 10px 0 4px 0;">${s.title}</h3>
          <span style="font-size: 12px; color: #a7f3d0;">📍 ${s.location}</span>
        </div>

        <!-- Narrative Content -->
        <div style="background: #ffffff; border-radius: var(--radius-xl); padding: 20px; border: 1px solid #e2e8f0; box-shadow: var(--shadow-sm); margin-bottom: 20px;">
          <h4 style="font-size: 14px; font-weight: 700; color: var(--text-primary); margin-bottom: 10px;">The Situation:</h4>
          <p style="font-size: 13.5px; color: #334155; line-height: 1.6; margin-bottom: 16px;">
            ${s.intro}
          </p>

          <div style="background: #ecfdf5; border-radius: var(--radius-md); padding: 14px; margin-bottom: 20px; border-left: 4px solid #10b981;">
            <h4 style="font-size: 13px; font-weight: 800; color: #065f46; margin-bottom: 4px;">Operational Dilemma:</h4>
            <p style="font-size: 13px; color: #047857; font-weight: 600;">${s.dilemma}</p>
          </div>

          <!-- Multiple Choices -->
          <div style="display: flex; flex-direction: column; gap: 10px;" id="choices-list">
            ${s.choices.map((c, cIdx) => `
              <button class="deck-btn" data-c-idx="${cIdx}" style="text-align: left; padding: 14px; font-size: 13px; color: #1e293b; background: #f8fafc; border: 1px solid #cbd5e1; line-height: 1.45;">
                ${c.text}
              </button>
            `).join('')}
          </div>

          <!-- Feedback Box -->
          <div id="story-outcome-box" style="display: none; margin-top: 18px; padding: 14px; border-radius: var(--radius-md); font-size: 13px; line-height: 1.5;"></div>
        </div>

        <!-- Switch Story Controls -->
        <div style="display: flex; justify-content: space-between; gap: 12px; margin-bottom: 24px;">
          <button id="btn-prev-story" class="btn-secondary" style="flex: 1;" ${activeStoryIdx === 0 ? 'disabled' : ''}>
            ← Previous Story
          </button>
          <button id="btn-next-story" class="btn-primary" style="flex: 1;" ${activeStoryIdx === STORIES.length - 1 ? 'disabled' : ''}>
            Next Story →
          </button>
        </div>
      </div>
    `;

    container.querySelector('#btn-stories-back')?.addEventListener('click', () => {
      window.location.hash = '#home';
    });

    container.querySelector('#btn-prev-story')?.addEventListener('click', () => {
      if (activeStoryIdx > 0) {
        activeStoryIdx--;
        renderView();
      }
    });

    container.querySelector('#btn-next-story')?.addEventListener('click', () => {
      if (activeStoryIdx < STORIES.length - 1) {
        activeStoryIdx++;
        renderView();
      }
    });

    // Choice clicks
    const outcomeBox = container.querySelector('#story-outcome-box');
    container.querySelectorAll('[data-c-idx]').forEach(btn => {
      btn.addEventListener('click', () => {
        const cIdx = parseInt(btn.getAttribute('data-c-idx'));
        const choice = s.choices[cIdx];

        container.querySelectorAll('[data-c-idx]').forEach(b => b.disabled = true);

        outcomeBox.style.display = 'block';
        if (choice.correct) {
          btn.style.borderColor = '#10b981';
          btn.style.background = '#d1fae5';
          outcomeBox.style.background = '#d1fae5';
          outcomeBox.style.color = '#065f46';
          outcomeBox.innerHTML = `<strong>✓ Excellent Safety Decision! (+${choice.xp} XP)</strong><br>${choice.outcome}`;
          playSuccessChime();
          speak("Excellent decision. Adherence to safety protocol confirmed.");
          if (state.worker) state.worker.xp += choice.xp;
        } else {
          btn.style.borderColor = '#ef4444';
          btn.style.background = '#fee2e2';
          outcomeBox.style.background = '#fee2e2';
          outcomeBox.style.color = '#991b1b';
          outcomeBox.innerHTML = `<strong>✗ Hazardous Action!</strong><br>${choice.outcome}`;
          playPenaltyBuzz();
          speak("Unsafe action. Review Coal Mines Regulations.");
        }
      });
    });
  }

  renderView();
}
