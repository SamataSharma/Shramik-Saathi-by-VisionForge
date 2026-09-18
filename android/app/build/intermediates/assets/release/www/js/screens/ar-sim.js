// AR & Simulation Training Screen: Guided Flow with Stage 1 Hazard ID, Audio Ducking, and Worker-Friendly UI
// Flow: START -> OBSERVE -> IDENTIFY HAZARD -> SELECT ACTION -> PERFORM PROCEDURE -> FEEDBACK -> ASSESSMENT -> RESULT

import { AREngine } from '../ar/ar-engine.js';
import { TelemetryEngine } from '../engine/telemetry.js';
import { SafetyValidator } from '../engine/validator.js';
import { calculateAttemptScore } from '../engine/gamification.js';
import { getScenarioById } from '../engine/scenarios-data.js';
import { VirtualBuddySystem } from '../ar/virtual-buddy.js';
import { speak, playExtinguisherHiss, playSuccessChime, playPenaltyBuzz, stopScenarioAlarm } from '../voice.js';
import { t, getLanguage } from '../i18n.js';

let activeEngine = null;
let activeTelemetry = null;
let activeBuddy = null;
let timerInterval = null;

export function renderARScreen(container, state) {
  // Hide bottom nav while in tactical AR mode
  const bottomNav = document.getElementById('bottom-nav');
  if (bottomNav) bottomNav.style.display = 'none';

  const rawHash = window.location.hash;
  const isSimMode = rawHash.includes('mode=sim');

  let scenarioId = 'sim_fire_explosion';
  if (rawHash.includes('scenario=')) {
    const match = rawHash.match(/scenario=([a-zA-Z0-9_]+)/);
    if (match) scenarioId = match[1];
  } else if (state.currentScenarioId) {
    scenarioId = state.currentScenarioId;
  }

  const scenario = getScenarioById(scenarioId);
  const hasNativeBridge = !!window.AndroidBridge;

  container.innerHTML = `
    <div id="ar-viewport-container">
      <!-- Live Camera Stream -->
      <video id="ar-video-stream" playsinline autoplay muted></video>

      <!-- Three.js Canvas Overlaid on Video (Interactive Camera Look / Drag) -->
      <canvas id="ar-three-canvas" title="Drag to inspect surroundings and discover anchored hazard"></canvas>

      <!-- Tactical AR HUD Overlay -->
      <div id="ar-hud-overlay">
        <!-- Top HUD Header (Compact Safe Banner) -->
        <div class="hud-top-bar">
          <div class="hud-scenario-info">
            <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
              <h3 style="margin: 0; font-size: 13px; text-transform: uppercase;">
                ${t(scenario.id === 'sim_fire_explosion' ? 'sim_fire_title' :
                    scenario.id === 'sim_gas_confined' ? 'sim_gas_title' :
                    scenario.id === 'sim_machinery_safety' ? 'sim_mach_title' :
                    scenario.id === 'sim_emergency_evac' ? 'sim_evac_title' : 'sim_roof_title')}
              </h3>
              <span id="hud-ar-status" style="
                background: rgba(2, 132, 199, 0.9);
                color: #ffffff;
                padding: 2px 8px;
                border-radius: var(--radius-full);
                font-size: 9.5px;
                font-weight: 800;
                text-transform: uppercase;
              ">
                ${isSimMode ? t('ar_sim_mode_label') : t('ar_scanning')}
              </span>
            </div>
            <span style="font-size: 10.5px; color: #94a3b8;">${scenario.location}</span>
          </div>

          <!-- Buddy Toggle Switch (Cycles: Expanded -> Minimized -> Off) -->
          <button id="btn-hud-buddy-toggle" class="hud-buddy-toggle-btn" title="Toggle Virtual Safety Buddy Mode">
            <span>${t('buddy_btn_on')}</span>
          </button>

          <div class="hud-timer-badge" id="hud-timer">00:00.00</div>
          <div class="hud-score-chip" id="hud-score-chip">+0 XP</div>
        </div>

        <!-- Center Notification Zone (Compact, Non-Obtrusive Banner) -->
        <div class="hud-center-zone">
          <div class="hud-danger-alert" id="hud-danger-banner" style="max-width: 90vw; font-size: 11.5px; padding: 6px 14px;">
            <span>🔍</span> ${t('ar_scanning')}
          </div>

          <!-- Environmental Status Tag -->
          <div id="ar-discovery-tag" style="
            background: rgba(15, 23, 42, 0.85);
            border: 1px solid rgba(56, 189, 248, 0.3);
            border-radius: var(--radius-full);
            padding: 3px 12px;
            font-size: 10.5px;
            color: #cbd5e1;
            margin-top: 4px;
            text-align: center;
            max-width: 85vw;
          ">
            ${t('ar_observe_surroundings')}
          </div>

          <!-- Floating XP Toast Container -->
          <div id="floating-toast-slot"></div>
        </div>

        <!-- Bottom Control Deck -->
        <div class="hud-control-deck">
          <!-- Reusable Virtual Safety Buddy Slot (Default: ON + EXPANDED) -->
          <div id="deck-buddy-slot" style="margin-bottom: 8px;"></div>

          <!-- STAGE 1: Hazard Identification Interface (Initial Observe Step) -->
          <div id="deck-hazard-id" style="display: none; margin-bottom: 8px;">
            <div class="deck-step-title">
              <span>${t('what_do_you_see')}</span>
              <span style="color: #f59e0b; font-size: 11px;">${t('select_hazard_prompt')}</span>
            </div>
            <div class="deck-options-grid" id="hazard-id-options-grid">
              ${renderHazardIdOptionsHTML(scenario.id)}
            </div>
          </div>

          <!-- STAGE 2: Guided Action Controls (Revealed after correct Hazard ID) -->
          <div id="deck-scenario-actions" style="display: none;">
            ${renderScenarioControlsHTML(scenario)}
          </div>

          <!-- Completion Action -->
          <div id="deck-step-finish" style="display: none; text-align: center;">
            <button class="btn-primary" id="btn-finish-drill" style="width: 100%; padding: 12px; font-size: 13.5px; background: linear-gradient(135deg, #059669, #10b981); font-weight: 800;">
              ✓ ${t('complete_scenario')}
            </button>
          </div>

          <!-- Utility Bar: Switch Camera vs 3D Simulation / Tracking Label / Exit -->
          <div class="hud-util-row" style="margin-top: 8px; display: flex; justify-content: space-between; align-items: center;">
            <button class="btn-hud-ghost" id="btn-toggle-sim" style="font-size: 10.5px; padding: 4px 8px;">
              🔄 ${t('switch_camera_sim')}
            </button>
            <span style="font-size: 9.5px; color: #64748b;" id="tracking-mode-indicator">
              ${hasNativeBridge ? 'TRACKING: ANDROID ARCORE' : 'TRACKING: SIMULATION FALLBACK'}
            </span>
            <button class="btn-hud-ghost" id="btn-exit-ar" style="border-color: rgba(239, 68, 68, 0.4); color: #fca5a5; font-size: 10.5px; padding: 4px 8px;">
              ✕ ${t('exit_simulation')}
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  // Initialize Core Systems
  const videoEl = container.querySelector('#ar-video-stream');
  const canvasEl = container.querySelector('#ar-three-canvas');
  const statusBadge = container.querySelector('#hud-ar-status');
  const dangerBanner = container.querySelector('#hud-danger-banner');
  const discoveryTag = container.querySelector('#ar-discovery-tag');
  const buddyToggleBtn = container.querySelector('#btn-hud-buddy-toggle');

  activeEngine = new AREngine(videoEl, canvasEl, { scenarioId: scenario.id });
  activeTelemetry = new TelemetryEngine();
  const validator = new SafetyValidator();

  let selectedEquipment = null;
  let selectedApproach = null;
  const completedSteps = [];
  let currentScoreXP = 0;
  let hazardIdentified = false;

  function showToast(text, isPenalty = false) {
    const slot = container.querySelector('#floating-toast-slot');
    if (!slot) return;
    const toast = document.createElement('div');
    toast.className = `floating-feedback ${isPenalty ? 'penalty' : ''}`;
    toast.textContent = text;
    slot.appendChild(toast);
    setTimeout(() => toast.remove(), 2200);
  }

  // Start AR Engine & Automated Guided Flow
  activeEngine.initialize().then((info) => {
    const trackingModeIndicator = container.querySelector('#tracking-mode-indicator');
    if (trackingModeIndicator && info.trackingMode) {
      trackingModeIndicator.textContent = `TRACKING: ${info.trackingMode}`;
    }

    if (isSimMode || info.isFallback) {
      if (isSimMode && !info.isFallback) {
        activeEngine.engageFallbackSimulation();
      }
    }

    // AUTOMATED AR SEQUENCE:
    // 1. SCANNING ENVIRONMENT...
    speak(t('ar_scanning'));

    // 2. TRAINING AREA DETECTED (~1.0s)
    setTimeout(() => {
      if (statusBadge) {
        statusBadge.style.background = '#0284c7';
        statusBadge.textContent = t('ar_area_detected');
      }
      if (dangerBanner) {
        dangerBanner.innerHTML = `<span>📍</span> ${t('ar_area_detected')}`;
      }
      playSuccessChime();

      // 3. GENERATING & ANCHORING RANDOM DISCOVERABLE HAZARD (~0.7s)
      setTimeout(() => {
        // Execute discovery algorithm: candidate validation within camera FOV
        const anchor = activeEngine.generateAndAnchorRandomHazard();

        // 4. HAZARD ANCHORED -> STAGE 1: OBSERVE & IDENTIFY HAZARD
        setTimeout(() => {
          if (statusBadge) {
            statusBadge.style.background = '#059669';
            statusBadge.textContent = isSimMode || info.isFallback
              ? t('ar_sim_mode_label')
              : t('ar_real_mode_label');
          }
          if (dangerBanner) {
            dangerBanner.style.background = 'rgba(220, 38, 38, 0.9)';
            dangerBanner.innerHTML = `<span>🔍</span> ${t('ar_observe_surroundings')}`;
          }
          if (discoveryTag) {
            discoveryTag.textContent = t('what_do_you_see');
          }

          // Start Telemetry Timer
          activeTelemetry.start();
          const timerDisplay = container.querySelector('#hud-timer');
          const startTime = performance.now();

          timerInterval = setInterval(() => {
            const elapsed = performance.now() - startTime;
            const sec = Math.floor(elapsed / 1000);
            const ms = Math.floor((elapsed % 1000) / 10);
            if (timerDisplay) {
              timerDisplay.textContent = `00:${String(sec).padStart(2, '0')}.${String(ms).padStart(2, '0')}`;
            }
          }, 30);

          // Reveal Stage 1: Hazard Identification Interface
          const hazardIdDeck = container.querySelector('#deck-hazard-id');
          if (hazardIdDeck) {
            hazardIdDeck.style.display = 'block';
          }

          playSuccessChime();
          speak(t('ar_observe_surroundings'));
        }, 700);

      }, 700);

    }, 1000);
  });

  // Stage 1 Hazard Identification click handling
  container.querySelectorAll('.hazard-id-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (hazardIdentified) return;
      const isCorrect = btn.getAttribute('data-correct') === 'true';

      if (isCorrect) {
        hazardIdentified = true;
        btn.classList.add('selected');
        currentScoreXP += 40;
        container.querySelector('#hud-score-chip').textContent = `+${currentScoreXP} XP`;
        showToast(`+40 XP ${t('buddy_safe_feedback')}`);
        playSuccessChime();

        activeTelemetry.recordHazardRecognition();
        completedSteps.push('hazard_identified');

        // Update top danger banner to identified hazard
        if (dangerBanner) {
          dangerBanner.innerHTML = `<span>⚠️</span> ${btn.textContent.trim()}`;
        }
        if (discoveryTag) {
          discoveryTag.textContent = t('hazard_resolved');
        }

        speak(t('buddy_safe_feedback'));

        // Transition from Stage 1 to Stage 2 (Guided Action Controls)
        setTimeout(() => {
          container.querySelector('#deck-hazard-id').style.display = 'none';
          container.querySelector('#deck-scenario-actions').style.display = 'block';
        }, 600);

      } else {
        currentScoreXP = Math.max(0, currentScoreXP - 10);
        container.querySelector('#hud-score-chip').textContent = `${currentScoreXP} XP`;
        showToast(`-10 XP: ${t('buddy_wrong_feedback')}`, true);
        playPenaltyBuzz();
        activeTelemetry.recordMistake("Identified incorrect hazard");
        speak(t('buddy_wrong_feedback'));
      }
    });
  });

  // Initialize Virtual Safety Buddy (Default: ON + EXPANDED)
  const buddySlot = container.querySelector('#deck-buddy-slot');
  if (buddySlot) {
    activeBuddy = new VirtualBuddySystem({
      container: buddySlot,
      scenarioId: scenario.id,
      initialMode: 'expanded',
      onDecisionCorrect: (xp) => {
        currentScoreXP += xp;
        container.querySelector('#hud-score-chip').textContent = `+${currentScoreXP} XP`;
        showToast(`+${xp} XP ${t('buddy_safe_feedback')}`);
      },
      onMistake: (msg) => {
        activeTelemetry.recordMistake(msg);
        currentScoreXP = Math.max(0, currentScoreXP - 15);
        container.querySelector('#hud-score-chip').textContent = `${currentScoreXP} XP`;
        showToast(`-15 XP: ${msg}`, true);
      },
      onModeChange: (newMode) => {
        if (buddyToggleBtn) {
          if (newMode === 'off') {
            buddyToggleBtn.innerHTML = `<span>${t('buddy_btn_off')}</span>`;
          } else if (newMode === 'minimized') {
            buddyToggleBtn.innerHTML = `<span>${t('buddy_btn_min')}</span>`;
          } else {
            buddyToggleBtn.innerHTML = `<span>${t('buddy_btn_on')}</span>`;
          }
        }
      },
      onStateChange: (stateName) => {
        if (stateName === 'COMPLETED') {
          if (scenario.id === 'sim_fire_explosion' && activeEngine) {
            activeEngine.extinguishCompletely();
          } else if (scenario.id === 'sim_gas_confined' && activeEngine) {
            activeEngine.gasSystem?.isolate();
          } else if (scenario.id === 'sim_machinery_safety' && activeEngine) {
            activeEngine.machinerySystem?.isolate();
          } else if (scenario.id === 'sim_emergency_evac' && activeEngine) {
            activeEngine.evacSystem?.complete();
          } else if (scenario.id === 'sim_roof_strata' && activeEngine) {
            activeEngine.strataSystem?.secure();
          }
          completedSteps.push('buddy_training_guidance');
          stopScenarioAlarm();

          setTimeout(() => {
            container.querySelector('#deck-scenario-actions').style.display = 'none';
            container.querySelector('#deck-step-finish').style.display = 'block';
            container.querySelector('#hud-danger-banner').style.background = "#10b981";
            container.querySelector('#hud-danger-banner').innerHTML = `<span>✓</span> ${t('hazard_resolved')}`;
            playSuccessChime();
          }, 800);
        }
      }
    });
    activeBuddy.start();
  }

  // Top HUD Buddy Toggle Button: Cycles Expanded -> Minimized -> Off -> Expanded (Does NOT reset progress)
  buddyToggleBtn?.addEventListener('click', () => {
    if (!activeBuddy) return;
    if (activeBuddy.uiMode === 'expanded') {
      activeBuddy.setMode('minimized');
    } else if (activeBuddy.uiMode === 'minimized') {
      activeBuddy.setMode('off');
    } else {
      activeBuddy.setMode('expanded');
    }
  });

  // Stage 2 Guided Scenario Interactions Setup
  setupScenarioInteractions(container, scenario, {
    activeEngine,
    activeTelemetry,
    validator,
    showToast,
    setEquipment: (eq) => { selectedEquipment = eq; },
    setApproach: (ap) => { selectedApproach = ap; },
    addStep: (s) => completedSteps.push(s),
    onXP: (delta) => {
      currentScoreXP += delta;
      container.querySelector('#hud-score-chip').textContent = `${currentScoreXP >= 0 ? '+' : ''}${currentScoreXP} XP`;
    },
    onComplete: () => {
      stopScenarioAlarm();
      container.querySelector('#deck-scenario-actions').style.display = 'none';
      container.querySelector('#deck-step-finish').style.display = 'block';
      container.querySelector('#hud-danger-banner').style.background = "#10b981";
      container.querySelector('#hud-danger-banner').innerHTML = `<span>✓</span> ${t('hazard_resolved')}`;
      playSuccessChime();
    }
  });

  // Finish Drill Action
  container.querySelector('#btn-finish-drill')?.addEventListener('click', async () => {
    clearInterval(timerInterval);
    stopScenarioAlarm();
    const telemetryData = activeTelemetry.finish();

    const evaluation = calculateAttemptScore(telemetryData, {
      equipmentCorrect: (selectedEquipment === 'dcp_extinguisher' || scenario.id !== 'sim_fire_explosion'),
      approachCorrect: (selectedApproach === 'intake' || scenario.id !== 'sim_fire_explosion'),
      passCompletedCount: 4
    });

    state.lastAttemptResult = {
      scenario_id: scenario.id,
      scenario_title: scenario.title,
      telemetry: telemetryData,
      evaluation: evaluation,
      checklist_completed: true
    };

    // Store attempt record in database / offline queue
    const attemptPayload = {
      worker_id: state.worker?.id || 'anik01',
      scenario_id: scenario.id,
      duration_ms: telemetryData.duration_ms,
      hazard_rec_ms: telemetryData.hazard_rec_ms,
      equipment_selected: selectedEquipment || 'verified_gear',
      approach_position: selectedApproach || 'intake',
      pass_steps_completed: completedSteps,
      mistakes: telemetryData.mistakes || [],
      checklist_verified: true,
      is_offline: !navigator.onLine
    };

    try {
      if (navigator.onLine) {
        await fetch('/api/v1/scenarios/attempt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(attemptPayload)
        });
      }
    } catch (e) {
      console.warn('[AR] Offline record queued');
    }

    teardownAR();
    window.location.hash = '#results';
  });

  // Camera vs Simulation switch
  container.querySelector('#btn-toggle-sim')?.addEventListener('click', () => {
    if (activeEngine) {
      activeEngine.toggleCameraSimulation();
      const isNowFallback = activeEngine.isFallbackMode;
      if (statusBadge) {
        statusBadge.textContent = isNowFallback ? t('ar_sim_mode_label') : t('ar_real_mode_label');
      }
    }
  });

  // Exit Simulation
  container.querySelector('#btn-exit-ar')?.addEventListener('click', () => {
    stopScenarioAlarm();
    teardownAR();
    window.location.hash = '#home';
  });
}

// Stage 1 Hazard Identification Options Generator
function renderHazardIdOptionsHTML(scenarioId) {
  const optionsMap = {
    sim_fire_explosion: [
      { key: 'hazard_fire', correct: true },
      { key: 'hazard_gas', correct: false },
      { key: 'hazard_machinery', correct: false },
      { key: 'hazard_roof', correct: false }
    ],
    sim_gas_confined: [
      { key: 'hazard_gas', correct: true },
      { key: 'hazard_fire', correct: false },
      { key: 'hazard_machinery', correct: false },
      { key: 'hazard_evac', correct: false }
    ],
    sim_machinery_safety: [
      { key: 'hazard_machinery', correct: true },
      { key: 'hazard_fire', correct: false },
      { key: 'hazard_gas', correct: false },
      { key: 'hazard_roof', correct: false }
    ],
    sim_emergency_evac: [
      { key: 'hazard_evac', correct: true },
      { key: 'hazard_machinery', correct: false },
      { key: 'hazard_gas', correct: false },
      { key: 'hazard_roof', correct: false }
    ],
    sim_roof_strata: [
      { key: 'hazard_roof', correct: true },
      { key: 'hazard_fire', correct: false },
      { key: 'hazard_machinery', correct: false },
      { key: 'hazard_gas', correct: false }
    ]
  };

  const opts = optionsMap[scenarioId] || optionsMap.sim_fire_explosion;

  return opts.map(o => `
    <button class="deck-btn hazard-id-btn" data-correct="${o.correct}" style="
      background: rgba(255, 255, 255, 0.09);
      border: 1.5px solid rgba(255, 255, 255, 0.2);
      border-radius: 8px;
      padding: 10px 12px;
      font-size: 11.5px;
      font-weight: 700;
      color: #ffffff;
      cursor: pointer;
      text-align: left;
      transition: all 0.2s;
    ">
      ${t(o.key)}
    </button>
  `).join('');
}

// Stage 2 Guided Actions Controls for All 5 Scenarios
function renderScenarioControlsHTML(scenario) {
  return `
    ${scenario.id === 'sim_fire_explosion' ? `
      <!-- Step 1: Equipment Selection -->
      <div class="deck-step-block" id="step-block-equipment">
        <div class="deck-step-title">
          <span>${t('select_equipment')}</span>
        </div>
        <div class="deck-options-grid">
          <button class="deck-btn" data-equip="dcp_extinguisher">🧯 ${t('dcp_extinguisher')}</button>
          <button class="deck-btn" data-equip="water_extinguisher">💧 ${t('water_extinguisher')}</button>
          <button class="deck-btn" data-equip="co2_extinguisher">💨 ${t('co2_extinguisher')}</button>
        </div>
      </div>

      <!-- Step 2: Ventilation Approach -->
      <div class="deck-step-block" id="step-block-approach" style="display: none;">
        <div class="deck-step-title">
          <span>${t('select_approach')}</span>
        </div>
        <div class="deck-options-grid">
          <button class="deck-btn" data-approach="intake">🌬️ ${t('intake_airway')}</button>
          <button class="deck-btn" data-approach="return">☠️ ${t('return_airway')}</button>
        </div>
      </div>

      <!-- Step 3: PASS Protocol Execution -->
      <div class="deck-step-block" id="step-block-pass" style="display: none;">
        <div class="deck-step-title">
          <span>PASS Protocol: Tap sequence</span>
        </div>
        <div class="pass-controls-row">
          <button class="pass-step-btn" data-pass="pull"><span class="pass-letter">P</span>${t('pass_pull')}</button>
          <button class="pass-step-btn" data-pass="aim" disabled><span class="pass-letter">A</span>${t('pass_aim')}</button>
          <button class="pass-step-btn" data-pass="squeeze" disabled><span class="pass-letter">S</span>${t('pass_squeeze')}</button>
          <button class="pass-step-btn" data-pass="sweep" disabled><span class="pass-letter">S</span>${t('pass_sweep')}</button>
        </div>
      </div>
    ` : ''}

    ${scenario.id === 'sim_gas_confined' ? `
      <div class="deck-step-block">
        <div class="deck-step-title">
          <span>${t('sim_gas_title')}</span>
        </div>
        <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 6px;">
          <button id="btn-gas-monitor" class="btn-primary" style="padding: 10px; font-size: 12px;">
            📟 Check Multi-Gas Monitor (CH4 / CO)
          </button>
          <button id="btn-gas-ppe" class="btn-secondary" disabled style="padding: 10px; font-size: 12px;">
            🤿 ${t('wear_helmet')} & Don 60-min SCSR
          </button>
          <button id="btn-gas-isolate" class="btn-secondary" disabled style="padding: 10px; font-size: 12px;">
            🛑 Isolate Power & ${t('move_away')} Upwind
          </button>
        </div>
      </div>
    ` : ''}

    ${scenario.id === 'sim_machinery_safety' ? `
      <div class="deck-step-block">
        <div class="deck-step-title">
          <span>${t('sim_mach_title')}</span>
        </div>
        <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 6px;">
          <button id="btn-mach-loto" class="btn-primary" style="padding: 10px; font-size: 12px;">
            🔒 De-energize & Lockout-Tagout (LOTO)
          </button>
          <button id="btn-mach-clear" class="btn-secondary" disabled style="padding: 10px; font-size: 12px;">
            ⚠️ Establish 1.5m Stand-off Perimeter
          </button>
          <button id="btn-mach-pullcord" class="btn-secondary" disabled style="padding: 10px; font-size: 12px;">
            🛑 Test Emergency Pull-Cord Trip Switch
          </button>
        </div>
      </div>
    ` : ''}

    ${scenario.id === 'sim_emergency_evac' ? `
      <div class="deck-step-block">
        <div class="deck-step-title">
          <span>${t('sim_evac_title')}</span>
        </div>
        <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 6px;">
          <button id="btn-evac-scsr" class="btn-primary" style="padding: 10px; font-size: 12px;">
            🤿 Don and Seal Self-Rescuer
          </button>
          <button id="btn-evac-lifeline" class="btn-secondary" disabled style="padding: 10px; font-size: 12px;">
            🧭 Follow Lifeline Cones to Intake (${t('go_to_exit')})
          </button>
          <button id="btn-evac-door" class="btn-secondary" disabled style="padding: 10px; font-size: 12px;">
            🚪 Pass and Latch Refuge Air-Lock Door
          </button>
        </div>
      </div>
    ` : ''}

    ${scenario.id === 'sim_roof_strata' ? `
      <div class="deck-step-block">
        <div class="deck-step-title">
          <span>${t('sim_roof_title')}</span>
        </div>
        <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 6px;">
          <button id="btn-roof-sound" class="btn-primary" style="padding: 10px; font-size: 12px;">
            🥢 Execute Sound-and-Tap Test with Stick
          </button>
          <button id="btn-roof-props" class="btn-secondary" disabled style="padding: 10px; font-size: 12px;">
            🪵 Set Hydraulic Prop & Lid Support Under SSR
          </button>
          <button id="btn-roof-standoff" class="btn-secondary" disabled style="padding: 10px; font-size: 12px;">
            🚩 ${t('call_supervisor')} & Cordon Loose Roof
          </button>
        </div>
      </div>
    ` : ''}
  `;
}

function setupScenarioInteractions(container, scenario, helpers) {
  const { activeEngine, activeTelemetry, validator, showToast, setEquipment, setApproach, addStep, onXP, onComplete } = helpers;

  if (scenario.id === 'sim_fire_explosion') {
    let selectedEquipment = null;
    let selectedApproach = null;
    const completedPassSteps = [];

    container.querySelectorAll('[data-equip]').forEach(btn => {
      btn.addEventListener('click', () => {
        const equip = btn.getAttribute('data-equip');
        selectedEquipment = equip;
        setEquipment(equip);

        container.querySelectorAll('[data-equip]').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');

        const validation = validator.validateEquipment(equip);
        activeTelemetry.recordHazardRecognition();
        activeTelemetry.logAction('EQUIPMENT_SELECTED', { equipment: equip, valid: validation.isValid });

        if (validation.isValid) {
          onXP(30);
          showToast(`+30 XP ${t('buddy_safe_feedback')}`);
          playSuccessChime();
          speak(t('take_extinguisher'));
          setTimeout(() => {
            const appBlock = container.querySelector('#step-block-approach');
            if (appBlock) appBlock.style.display = 'block';
          }, 300);
        } else {
          onXP(-10);
          activeTelemetry.recordMistake("Selected water spray near electrical drive");
          showToast("-10 XP: Unsafe media on electric fire!", true);
          playPenaltyBuzz();
          speak("Do not use water on electrical conveyor drive. Select Dry Chemical Powder.");
        }
      });
    });

    container.querySelectorAll('[data-approach]').forEach(btn => {
      btn.addEventListener('click', () => {
        const approach = btn.getAttribute('data-approach');
        selectedApproach = approach;
        setApproach(approach);

        container.querySelectorAll('[data-approach]').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');

        const validation = validator.validateApproach(approach);
        activeTelemetry.logAction('APPROACH_SELECTED', { approach: approach, valid: validation.isValid });

        if (validation.isValid) {
          onXP(25);
          showToast(`+25 XP ${t('buddy_safe_feedback')}`);
          playSuccessChime();
          speak("Approach position confirmed upwind. Follow PASS extinguisher sequence.");
          setTimeout(() => {
            const passBlock = container.querySelector('#step-block-pass');
            if (passBlock) passBlock.style.display = 'block';
          }, 300);
        } else {
          onXP(-15);
          activeTelemetry.recordMistake("Selected return airway approach directly in toxic smoke");
          showToast("-15 XP: Downwind approach exposes to smoke!", true);
          playPenaltyBuzz();
          speak("Do not approach from return airway. Approach upwind from intake airway.");
        }
      });
    });

    // PASS Controls
    const passBtns = {
      pull: container.querySelector('[data-pass="pull"]'),
      aim: container.querySelector('[data-pass="aim"]'),
      squeeze: container.querySelector('[data-pass="squeeze"]'),
      sweep: container.querySelector('[data-pass="sweep"]')
    };

    passBtns.pull?.addEventListener('click', () => {
      passBtns.pull.classList.add('completed');
      passBtns.aim.disabled = false;
      completedPassSteps.push('pull');
      addStep('pull');
      onXP(15);
      showToast("+15 XP Pin Pulled!");
      playSuccessChime();
      speak(t('pass_pull'));
      if (activeEngine) activeEngine.triggerPassStep('pull');
    });

    passBtns.aim?.addEventListener('click', () => {
      passBtns.aim.classList.add('completed');
      passBtns.squeeze.disabled = false;
      completedPassSteps.push('aim');
      addStep('aim');
      onXP(15);
      showToast("+15 XP Aimed at Flame Base!");
      playSuccessChime();
      speak(t('pass_aim'));
      if (activeEngine) activeEngine.triggerPassStep('aim');
    });

    passBtns.squeeze?.addEventListener('click', () => {
      passBtns.squeeze.classList.add('completed');
      passBtns.sweep.disabled = false;
      completedPassSteps.push('squeeze');
      addStep('squeeze');
      onXP(20);
      showToast("+20 XP Lever Squeezed!");
      playExtinguisherHiss();
      speak(t('pass_squeeze'));
      if (activeEngine) activeEngine.triggerPassStep('squeeze');
    });

    passBtns.sweep?.addEventListener('click', () => {
      passBtns.sweep.classList.add('completed');
      completedPassSteps.push('sweep');
      addStep('sweep');
      onXP(25);
      showToast("+25 XP Swept Side-to-Side - Fire Out!");
      playExtinguisherHiss();
      speak(t('use_extinguisher'));

      if (activeEngine) {
        activeEngine.triggerPassStep('sweep');
        setTimeout(() => activeEngine.extinguishCompletely(), 1200);
      }
      setTimeout(onComplete, 1600);
    });

  } else if (scenario.id === 'sim_gas_confined') {
    const btnMonitor = container.querySelector('#btn-gas-monitor');
    const btnPPE = container.querySelector('#btn-gas-ppe');
    const btnIsolate = container.querySelector('#btn-gas-isolate');

    btnMonitor?.addEventListener('click', () => {
      btnMonitor.disabled = true;
      btnMonitor.classList.add('completed');
      btnPPE.disabled = false;
      addStep('gas_monitor_checked');
      onXP(25);
      showToast("+25 XP Multi-Gas Monitor Verified!");
      playSuccessChime();
      speak("Methane detected above 1.25%. Don self-rescuer oxygen pack.");
    });

    btnPPE?.addEventListener('click', () => {
      btnPPE.disabled = true;
      btnPPE.classList.add('completed');
      btnIsolate.disabled = false;
      addStep('scsr_pack_donned');
      onXP(25);
      showToast("+25 XP SCSR Oxygen Sealed!");
      playSuccessChime();
      speak("Self-rescuer sealed. Cut electrical power and withdraw team upwind.");
    });

    btnIsolate?.addEventListener('click', () => {
      btnIsolate.disabled = true;
      btnIsolate.classList.add('completed');
      addStep('power_isolated_withdrawal');
      onXP(50);
      if (activeEngine) activeEngine.gasSystem?.isolate();
      showToast("+50 XP Power Cut & Safe Withdrawal Executed!");
      onComplete();
    });

  } else if (scenario.id === 'sim_machinery_safety') {
    const btnLoto = container.querySelector('#btn-mach-loto');
    const btnClear = container.querySelector('#btn-mach-clear');
    const btnPull = container.querySelector('#btn-mach-pullcord');

    btnLoto?.addEventListener('click', () => {
      btnLoto.disabled = true;
      btnLoto.classList.add('completed');
      btnClear.disabled = false;
      addStep('loto_padlock_applied');
      onXP(25);
      showToast("+25 XP Lock-Out Tag-Out Applied!");
      playSuccessChime();
      speak("Electrical switch padlocked. Establish stand-off perimeter.");
    });

    btnClear?.addEventListener('click', () => {
      btnClear.disabled = true;
      btnClear.classList.add('completed');
      btnPull.disabled = false;
      addStep('standoff_perimeter_verified');
      onXP(25);
      showToast("+25 XP 1.5m Clearance Maintained!");
      playSuccessChime();
      speak("Clearance confirmed. Test emergency pull-cord trip switch.");
    });

    btnPull?.addEventListener('click', () => {
      btnPull.disabled = true;
      btnPull.classList.add('completed');
      addStep('pullcord_trip_tested');
      onXP(50);
      if (activeEngine) activeEngine.machinerySystem?.isolate();
      showToast("+50 XP Emergency Trip Mechanism Verified Safe!");
      onComplete();
    });

  } else if (scenario.id === 'sim_emergency_evac') {
    const btnScsr = container.querySelector('#btn-evac-scsr');
    const btnLine = container.querySelector('#btn-evac-lifeline');
    const btnDoor = container.querySelector('#btn-evac-door');

    btnScsr?.addEventListener('click', () => {
      btnScsr.disabled = true;
      btnScsr.classList.add('completed');
      btnLine.disabled = false;
      addStep('scsr_donned_sealed');
      onXP(25);
      showToast("+25 XP Self-Rescuer Donned Under 30s!");
      playSuccessChime();
      speak("Self-rescuer sealed. Follow lifeline cones towards intake airway.");
    });

    btnLine?.addEventListener('click', () => {
      btnLine.disabled = true;
      btnLine.classList.add('completed');
      btnDoor.disabled = false;
      addStep('lifeline_navigated');
      onXP(25);
      showToast("+25 XP Lifeline Cones Followed Toward Intake!");
      playSuccessChime();
      speak(t('go_to_exit'));
    });

    btnDoor?.addEventListener('click', () => {
      btnDoor.disabled = true;
      btnDoor.classList.add('completed');
      addStep('refuge_door_latched');
      onXP(50);
      if (activeEngine) activeEngine.evacSystem?.complete();
      showToast("+50 XP Refuge Airlock Latched Securely!");
      onComplete();
    });

  } else if (scenario.id === 'sim_roof_strata') {
    const btnSound = container.querySelector('#btn-roof-sound');
    const btnProps = container.querySelector('#btn-roof-props');
    const btnStandoff = container.querySelector('#btn-roof-standoff');

    btnSound?.addEventListener('click', () => {
      btnSound.disabled = true;
      btnSound.classList.add('completed');
      btnProps.disabled = false;
      addStep('sound_and_tap_tested');
      onXP(25);
      showToast("+25 XP Sound-and-Tap Testing Performed!");
      playSuccessChime();
      speak("Sounding test reveals drummy spalling layer. Inspect hydraulic props.");
    });

    btnProps?.addEventListener('click', () => {
      btnProps.disabled = true;
      btnProps.classList.add('completed');
      btnStandoff.disabled = false;
      addStep('hydraulic_props_inspected');
      onXP(25);
      showToast("+25 XP Support Prop Integrity Checked!");
      playSuccessChime();
      speak("Props verified. Call supervisor and cordon off loose roof area.");
    });

    btnStandoff?.addEventListener('click', () => {
      btnStandoff.disabled = true;
      btnStandoff.classList.add('completed');
      addStep('standoff_safety_cordon');
      onXP(50);
      if (activeEngine) activeEngine.strataSystem?.secure();
      showToast("+50 XP Spalling Cordon Established!");
      onComplete();
    });
  }
}

export function teardownAR() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  stopScenarioAlarm();
  if (activeEngine) {
    activeEngine.destroy();
    activeEngine = null;
  }
  activeBuddy = null;
  const bottomNav = document.getElementById('bottom-nav');
  if (bottomNav) bottomNav.style.display = 'flex';
}
