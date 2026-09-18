// Games Screen: Enhanced Realistic Hazard Hunt with Industrial Imagery & Attempt History

import { speak, playSuccessChime, playPenaltyBuzz } from '../voice.js';

const REALISTIC_SCENARIOS = [
  {
    id: "game_conveyor_fire",
    name: "Conveyor Belt Seized Roller & Dust Fire",
    location: "Dhanbad Seam #4 Trunk Haulage",
    image: "/assets/images/hazard_conveyor_fire.svg",
    timeLimit: 45,
    hazards: [
      {
        id: "h1",
        name: "Red-Hot Seized Roller Idler (Friction Hazard)",
        x: 54, y: 70, radius: 40,
        risk: "Frictional heating exceeds 200°C, igniting vulcanized rubber belt and coal dust.",
        correctAction: "Immediately activate emergency pull-cord, isolate motor power, and deploy Dry Chemical Powder (DCP).",
        xp: 25
      },
      {
        id: "h2",
        name: "Combustible Coal Dust Accumulation",
        x: 25, y: 88, radius: 45,
        risk: "Dry pulverized coal (<75 microns) creates risk of secondary airborne dust explosion.",
        correctAction: "Apply statutory inert stone dust barrier (>85% non-combustible content under CMR 137).",
        xp: 20
      },
      {
        id: "h3",
        name: "Emergency Pull-Cord Switch Station",
        x: 74, y: 72, radius: 35,
        risk: "Failure to verify operational pull-cord prevents immediate conveyor stoppage during jam.",
        correctAction: "Ensure unobstructed path to pull-cord wire along entire gallery length.",
        xp: 20
      }
    ]
  },
  {
    id: "game_electrical_sub",
    name: "Underground 3.3kV Electrical Substation",
    location: "Bokaro Link Underground Substation #2",
    image: "/assets/images/hazard_electrical_substation.svg",
    timeLimit: 40,
    hazards: [
      {
        id: "h4",
        name: "Water Puddle Under High-Voltage Transformer",
        x: 40, y: 86, radius: 45,
        risk: "Conductive water accumulation risks catastrophic ground fault and flashover electrocution.",
        correctAction: "Divert water inflow, de-energize circuit breaker, and tag out transformer.",
        xp: 25
      },
      {
        id: "h5",
        name: "Frayed 3.3kV Trailing Cable with Electrical Arcing",
        x: 56, y: 87, radius: 40,
        risk: "Exposed live conductors create open spark hazard in potentially gassy seam.",
        correctAction: "Lockout-tagout feeder switch, discharge cable capacitance, and splice with flameproof kit.",
        xp: 30
      }
    ]
  },
  {
    id: "game_roof_spalling",
    name: "Working Face Strata & Gas Monitoring",
    location: "Jharia Seam #9 Continuous Miner Face",
    image: "/assets/images/hazard_roof_spalling.svg",
    timeLimit: 35,
    hazards: [
      {
        id: "h6",
        name: "Roof Strata Cracking & Spalling Chunks",
        x: 47, y: 35, radius: 45,
        risk: "Delamination along sandstone bedding planes signals imminent major roof fall.",
        correctAction: "Sound roof warning, withdraw continuous miner, and install resin-grouted roof bolts.",
        xp: 30
      },
      {
        id: "h7",
        name: "Methane Sensor Indicating 1.4% CH4",
        x: 30, y: 44, radius: 35,
        risk: "Gas concentration exceeds statutory 1.25% threshold (DGMS CMR 169). Risk of firedamp ignition.",
        correctAction: "Instantly de-energize cutting head, withdraw team into intake air, and increase face ventilation.",
        xp: 30
      }
    ]
  }
];

export async function renderGamesScreen(container, state) {
  let activeScenIdx = 0;
  let timerSec = 45;
  let timerId = null;
  let foundHazards = [];
  let mistakesCount = 0;
  let scoreXP = 0;
  let gameHistory = [];

  const traineeId = state.worker?.id || 'anik01';

  try {
    const resp = await fetch(`/api/v1/trainees/${traineeId}/games/history`);
    if (resp.ok) {
      gameHistory = await resp.json();
    }
  } catch (e) {
    console.warn('Game history fetch fallback:', e);
  }

  function renderLobby() {
    container.innerHTML = `
      <div style="padding-top: 8px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <button id="btn-games-back" class="btn-secondary" style="padding: 6px 12px; border-radius: var(--radius-full);">
              ← Back
            </button>
            <h2 style="font-size: 18px; font-weight: 800; color: var(--text-primary);">Hazard Hunt</h2>
          </div>
          <span style="font-size: 12px; font-weight: 700; color: #b45309; background: #fef3c7; padding: 4px 10px; border-radius: var(--radius-full);">
            Realistic Photo Edition
          </span>
        </div>

        <!-- Banner Card -->
        <div style="background: linear-gradient(135deg, #451a03, #18181b); border-radius: var(--radius-xl); padding: 22px; color: #ffffff; margin-bottom: 20px; box-shadow: var(--shadow-md);">
          <span style="background: #f59e0b; color: #0b1f33; font-size: 11px; font-weight: 800; padding: 3px 10px; border-radius: var(--radius-full);">
            REAL-WORLD SCENARIOS
          </span>
          <h3 style="font-size: 19px; font-weight: 900; margin: 10px 0 6px 0;">Realistic Mining Hazard Hunt</h3>
          <p style="font-size: 13px; color: #cbd5e1; line-height: 1.5;">
            Inspect realistic underground coal seam photographs. Tap directly on real industrial hazards and execute statutory DGMS countermeasures against the clock!
          </p>
        </div>

        <!-- Scenario Cards -->
        <h3 class="section-title">Select Operational Mine Scene</h3>
        <div style="display: flex; flex-direction: column; gap: 14px; margin-bottom: 24px;">
          ${REALISTIC_SCENARIOS.map((scen, idx) => `
            <div class="training-card" data-start-real-scen="${idx}">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                <span style="background: #fef3c7; color: #b45309; font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: var(--radius-full);">
                  ⏱ ${scen.timeLimit}s LIMIT
                </span>
                <span style="font-size: 11.5px; font-weight: 700; color: #0284c7;">${scen.hazards.length} Critical Hazards</span>
              </div>
              <h4 style="font-size: 16px; font-weight: 800; color: var(--text-primary); margin-bottom: 4px;">
                ${scen.name}
              </h4>
              <p style="font-size: 12.5px; color: var(--text-secondary); margin-bottom: 12px;">
                📍 ${scen.location}
              </p>
              <div style="width: 100%; height: 120px; border-radius: var(--radius-md); overflow: hidden; margin-bottom: 12px; border: 1px solid #cbd5e1;">
                <img src="${scen.image}" alt="${scen.name}" style="width: 100%; height: 100%; object-fit: cover;" />
              </div>
              <button class="btn-primary" style="width: 100%; padding: 10px; font-size: 13px; background: linear-gradient(135deg, #d97706, #f59e0b); color: #0b1f33; font-weight: 800;">
                Launch Realistic Hazard Hunt ➔
              </button>
            </div>
          `).join('')}
        </div>

        <!-- Previous Game Attempts Progression -->
        ${gameHistory && gameHistory.length > 0 ? `
          <div style="background: #ffffff; border-radius: var(--radius-xl); padding: 20px; border: 1px solid #e2e8f0; box-shadow: var(--shadow-sm); margin-bottom: 24px;">
            <h3 style="font-size: 15px; font-weight: 800; color: var(--text-primary); margin-bottom: 12px; display: flex; align-items: center; gap: 6px;">
              <span>📈</span> My Game Progression History
            </h3>
            <div style="display: flex; flex-direction: column; gap: 8px;">
              ${gameHistory.slice(0, 4).map(gh => `
                <div style="display: flex; justify-content: space-between; align-items: center; background: #f8fafc; padding: 10px 14px; border-radius: var(--radius-md); font-size: 12px;">
                  <div>
                    <strong>Attempt #${gh.attempt_number}</strong> • ${gh.hazards_found}/${gh.total_hazards} Hazards
                    <div style="font-size: 11px; color: var(--text-muted);">${new Date(gh.timestamp).toLocaleDateString()}</div>
                  </div>
                  <div style="text-align: right;">
                    <span style="font-weight: 800; color: #10b981; font-size: 14px;">${gh.score_pct}%</span>
                    <div style="font-size: 11px; color: #f59e0b; font-weight: 700;">+${gh.xp_earned} XP</div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    `;

    container.querySelector('#btn-games-back')?.addEventListener('click', () => {
      window.location.hash = '#home';
    });

    container.querySelectorAll('[data-start-real-scen]').forEach(el => {
      el.addEventListener('click', () => {
        activeScenIdx = parseInt(el.getAttribute('data-start-real-scen'));
        startRealGame();
      });
    });
  }

  function startRealGame() {
    const scen = REALISTIC_SCENARIOS[activeScenIdx];
    timerSec = scen.timeLimit;
    foundHazards = [];
    mistakesCount = 0;
    scoreXP = 0;

    speak(`Examine the real mining scene. Locate all ${scen.hazards.length} hazards before the countdown reaches zero.`);

    container.innerHTML = `
      <div style="padding-top: 8px;">
        <!-- Top HUD -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <div>
            <h3 style="font-size: 15px; font-weight: 800; color: var(--text-primary);">${scen.name}</h3>
            <span style="font-size: 11.5px; color: var(--text-secondary);">Click directly on hazards in the image</span>
          </div>
          <div style="display: flex; gap: 8px; align-items: center;">
            <span style="background: #fef3c7; color: #b45309; font-weight: 800; font-size: 13px; padding: 4px 10px; border-radius: var(--radius-sm);" id="game-live-timer">
              ⏱ ${timerSec}s
            </span>
            <span style="background: #dcfce7; color: #15803d; font-weight: 800; font-size: 13px; padding: 4px 10px; border-radius: var(--radius-sm);" id="game-live-score">
              0 XP
            </span>
          </div>
        </div>

        <!-- Interactive Realistic Photo Viewport -->
        <div id="real-scene-viewport" style="position: relative; width: 100%; height: 340px; border-radius: var(--radius-xl); overflow: hidden; border: 2.5px solid #334155; box-shadow: var(--shadow-md); margin-bottom: 16px; cursor: crosshair;">
          <img src="${scen.image}" alt="Mine Scene" style="width: 100%; height: 100%; object-fit: cover;" />

          <!-- Clickable Hotspot Zones -->
          ${scen.hazards.map(h => `
            <div class="real-hazard-spot" data-hid="${h.id}" style="position: absolute; left: ${h.x}%; top: ${h.y}%; transform: translate(-50%, -50%); width: 50px; height: 50px; border-radius: 50%; border: 2px dashed rgba(239, 68, 68, 0.4); background: rgba(239, 68, 68, 0.15); display: flex; align-items: center; justify-content: center;">
              <span style="font-size: 14px; opacity: 0.6;">⚠️</span>
            </div>
          `).join('')}
        </div>

        <!-- Status & Hazard Details Box -->
        <div id="hazard-info-box" style="background: #ffffff; border-radius: var(--radius-lg); padding: 14px; border: 1px solid #e2e8f0; font-size: 12.5px; line-height: 1.5; color: var(--text-secondary); margin-bottom: 16px;">
          Tap on suspicious objects, arcing cables, or smoldering coal dust in the photo.
        </div>

        <button id="btn-quit-real-game" class="btn-secondary" style="width: 100%;">
          Abandon Inspection
        </button>
      </div>
    `;

    // Timer Interval
    timerId = setInterval(() => {
      timerSec--;
      const tEl = container.querySelector('#game-live-timer');
      if (tEl) tEl.textContent = `⏱ ${timerSec}s`;

      if (timerSec <= 0) {
        clearInterval(timerId);
        endRealGame(false);
      }
    }, 1000);

    // Bind Hotspot Clicks
    const infoBox = container.querySelector('#hazard-info-box');

    container.querySelectorAll('.real-hazard-spot').forEach(spot => {
      spot.addEventListener('click', (e) => {
        e.stopPropagation();
        const hid = spot.getAttribute('data-hid');
        if (foundHazards.includes(hid)) return;

        const hObj = scen.hazards.find(h => h.id === hid);
        foundHazards.push(hid);

        spot.style.border = '2.5px solid #10b981';
        spot.style.background = 'rgba(16, 185, 129, 0.45)';
        spot.innerHTML = '<span style="color: #ffffff; font-weight: 800; font-size: 18px;">✓</span>';

        scoreXP += hObj.xp;
        container.querySelector('#game-live-score').textContent = `+${scoreXP} XP`;

        infoBox.style.borderLeft = '4px solid #10b981';
        infoBox.innerHTML = `
          <strong style="color: #065f46; font-size: 13.5px;">✓ Hazard Identified: ${hObj.name} (+${hObj.xp} XP)</strong><br>
          <strong>Risk:</strong> ${hObj.risk}<br>
          <strong>Statutory Corrective Action:</strong> ${hObj.correctAction}
        `;

        playSuccessChime();
        speak(`${hObj.name} identified.`);

        if (foundHazards.length === scen.hazards.length) {
          clearInterval(timerId);
          endRealGame(true);
        }
      });
    });

    // Misclick in Scene
    container.querySelector('#real-scene-viewport')?.addEventListener('click', (e) => {
      if (e.target.closest('.real-hazard-spot')) return;
      mistakesCount++;
      infoBox.style.borderLeft = '4px solid #ef4444';
      infoBox.innerHTML = `<span style="color: #991b1b;">❌ No hazard at this location. Observe surroundings carefully.</span>`;
      playPenaltyBuzz();
    });

    container.querySelector('#btn-quit-real-game')?.addEventListener('click', () => {
      clearInterval(timerId);
      renderLobby();
    });
  }

  async function endRealGame(isWin) {
    const scen = REALISTIC_SCENARIOS[activeScenIdx];
    const totalHazards = scen.hazards.length;
    const scorePct = Math.round((foundHazards.length / totalHazards) * 100);
    const timeTaken = scen.timeLimit - timerSec;

    // Post Attempt to Backend History
    try {
      await fetch(`/api/v1/games/${scen.id}/attempt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trainee_id: traineeId,
          game_id: scen.id,
          score_pct: scorePct,
          time_taken_sec: timeTaken,
          hazards_found: foundHazards.length,
          total_hazards: totalHazards,
          mistakes_count: mistakesCount,
          xp_earned: scoreXP
        })
      });
    } catch (e) {
      console.warn('Game attempt save error:', e);
    }

    if (state.worker) {
      state.worker.xp += scoreXP;
    }

    container.innerHTML = `
      <div style="padding-top: 20px; text-align: center;">
        <div style="font-size: 48px; margin-bottom: 12px;">${isWin ? '🏆' : '⏱️'}</div>
        <h2 style="font-size: 22px; font-weight: 800; color: var(--text-primary); margin-bottom: 6px;">
          ${isWin ? 'Inspection Completed!' : 'Time Limit Reached'}
        </h2>
        <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 20px;">
          ${isWin ? `All ${foundHazards.length} critical hazards spotted in ${timeTaken}s.` : `Found ${foundHazards.length} of ${totalHazards} hazards.`}
        </p>

        <!-- Stats Card -->
        <div style="background: #ffffff; border-radius: var(--radius-xl); padding: 20px; border: 1px solid #e2e8f0; max-width: 340px; margin: 0 auto 24px auto; box-shadow: var(--shadow-sm); text-align: left;">
          <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #f1f5f9; padding-bottom: 10px; margin-bottom: 10px;">
            <span style="color: var(--text-secondary); font-size: 13px;">Score / Accuracy:</span>
            <strong style="color: #10b981; font-size: 15px;">${scorePct}%</strong>
          </div>
          <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #f1f5f9; padding-bottom: 10px; margin-bottom: 10px;">
            <span style="color: var(--text-secondary); font-size: 13px;">XP Earned:</span>
            <strong style="color: #f59e0b; font-size: 15px;">+${scoreXP} XP</strong>
          </div>
          <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #f1f5f9; padding-bottom: 10px; margin-bottom: 10px;">
            <span style="color: var(--text-secondary); font-size: 13px;">Inspection Time:</span>
            <strong style="color: var(--text-primary); font-size: 14px;">${timeTaken}s</strong>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span style="color: var(--text-secondary); font-size: 13px;">Misclicks:</span>
            <strong style="color: ${mistakesCount > 0 ? '#ef4444' : '#10b981'}; font-size: 14px;">${mistakesCount}</strong>
          </div>
        </div>

        <div style="display: flex; gap: 10px; max-width: 340px; margin: 0 auto;">
          <button id="btn-retry-real-game" class="btn-primary" style="flex: 1; padding: 12px; font-size: 13px;">
            Play Another Scene
          </button>
          <button id="btn-return-lobby" class="btn-secondary" style="flex: 1; padding: 12px; font-size: 13px;">
            Lobby & History
          </button>
        </div>
      </div>
    `;

    container.querySelector('#btn-retry-real-game')?.addEventListener('click', () => {
      renderLobby();
    });

    container.querySelector('#btn-return-lobby')?.addEventListener('click', () => {
      renderLobby();
    });
  }

  renderLobby();
}
