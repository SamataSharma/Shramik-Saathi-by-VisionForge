// AR & Simulation Training Screen: Surface Locking, 3D Conveyor Hazard, 3D DCP Extinguisher & PASS Animations

import { AREngine } from '../ar/ar-engine.js';
import { ObjectDetector } from '../cv/object-detector.js';
import { TelemetryEngine } from '../engine/telemetry.js';
import { SafetyValidator } from '../engine/validator.js';
import { calculateAttemptScore } from '../engine/gamification.js';
import { speak, playExtinguisherHiss, playSuccessChime, playPenaltyBuzz } from '../voice.js';

let activeEngine = null;
let activeDetector = null;
let activeTelemetry = null;
let timerInterval = null;

export function renderARScreen(container, state) {
  // Hide bottom nav while in tactical AR mode
  const bottomNav = document.getElementById('bottom-nav');
  if (bottomNav) bottomNav.style.display = 'none';

  const isSimMode = window.location.hash.includes('mode=sim');

  container.innerHTML = `
    <div id="ar-viewport-container">
      <!-- Live WebCam Feed -->
      <video id="ar-video-stream" playsinline autoplay muted></video>

      <!-- Three.js Canvas Overlaid on Video -->
      <canvas id="ar-three-canvas"></canvas>

      <!-- Tactical AR HUD Overlay -->
      <div id="ar-hud-overlay">
        <!-- Top HUD Header -->
        <div class="hud-top-bar">
          <div class="hud-scenario-info">
            <div style="display: flex; align-items: center; gap: 8px;">
              <h3 style="margin: 0; font-size: 14px;">CONVEYOR FIRE (CMR 136)</h3>
              <span id="hud-ar-status" style="background: rgba(2, 132, 199, 0.9); color: #ffffff; padding: 2px 8px; border-radius: var(--radius-full); font-size: 10px; font-weight: 800; text-transform: uppercase;">
                SCANNING SURFACE...
              </span>
            </div>
            <span style="font-size: 11px; color: #94a3b8;">Dhanbad Seam #4 • Underground Coal Link</span>
          </div>
          <div class="hud-timer-badge" id="hud-timer">00:00.00</div>
          <div class="hud-score-chip" id="hud-score-chip">+0 XP</div>
        </div>

        <!-- Center Aim Reticle & CV Bounding Box -->
        <div class="hud-center-zone">
          <div class="hud-danger-alert" id="hud-danger-banner">
            <span>⚠️</span> SPONTANEOUS HEATING / BELT FRICTION FIRE
          </div>

          <!-- CV Target Box -->
          <div class="cv-bounding-box" id="cv-box">
            <span class="cv-corner-tl"></span>
            <span class="cv-corner-tr"></span>
            <span class="cv-corner-bl"></span>
            <span class="cv-corner-br"></span>
            <span class="cv-label-tag" id="cv-label">[SCANNING FLOOR / EQUIPMENT...]</span>
          </div>

          <!-- Floating XP Toast Container -->
          <div id="floating-toast-slot"></div>
        </div>

        <!-- Bottom Action Deck -->
        <div class="hud-control-deck">
          <!-- Step 0: Surface Scan & Lock (AR Mode only) -->
          <div id="deck-step-scan" class="deck-step-block">
            <div class="deck-step-title">
              <span>Step 0: Surface Plane Detection</span>
              <span style="color: #38bdf8; font-size: 11px;">Aim camera at floor</span>
            </div>
            <p style="font-size: 12px; color: #cbd5e1; margin-bottom: 10px; line-height: 1.4;">
              Aim reticle at the floor surface to anchor the underground conveyor hazard in real space.
            </p>
            <button class="btn-primary" id="btn-lock-surface" style="width: 100%; padding: 12px; font-size: 13.5px; background: linear-gradient(135deg, #0284c7, #0369a1); font-weight: 800;">
              📍 Tap to Lock Surface & Place Conveyor Hazard
            </button>
          </div>

          <!-- Step 1: Equipment Selection -->
          <div id="deck-step-equip" class="deck-step-block" style="display: none;">
            <div class="deck-step-title">
              <span>Step 1: Select Firefighting Media</span>
              <span style="color: #38bdf8; font-size: 11px;">CV Scanner Active</span>
            </div>
            <div class="deck-options-grid">
              <button class="deck-btn" id="btn-equip-dcp" data-equip="dcp_extinguisher">
                <span>🧯</span> DCP Extinguisher (IS 2171)
              </button>
              <button class="deck-btn" id="btn-equip-water" data-equip="water_extinguisher">
                <span>💧</span> Water Hose / Spray
              </button>
            </div>
          </div>

          <!-- Step 2: Approach Airway Selection -->
          <div id="deck-step-approach" class="deck-step-block" style="display: none;">
            <div class="deck-step-title">
              <span>Step 2: Ventilation Approach Position</span>
              <span style="color: #f59e0b; font-size: 11px;">Check Airway</span>
            </div>
            <div class="deck-options-grid">
              <button class="deck-btn" id="btn-approach-intake" data-pos="intake">
                <span>🌬️</span> Intake Airway (Upwind - Safe)
              </button>
              <button class="deck-btn danger-action" id="btn-approach-return" data-pos="return">
                <span>☠️</span> Return Airway (Downwind - Toxic)
              </button>
            </div>
          </div>

          <!-- Step 3: PASS Protocol Sequence -->
          <div id="deck-step-pass" class="deck-step-block" style="display: none;">
            <div class="deck-step-title">
              <span>Step 3: Execute PASS Technique</span>
              <span id="pass-progress-tag" style="color: #10b981; font-size: 11px;">0/4 Complete</span>
            </div>
            <div class="pass-controls-row">
              <button class="pass-step-btn" id="btn-pass-pull" data-pass="pull">
                <span class="pass-letter">P</span>
                <span>PULL PIN</span>
              </button>
              <button class="pass-step-btn" id="btn-pass-aim" data-pass="aim" disabled>
                <span class="pass-letter">A</span>
                <span>AIM BASE</span>
              </button>
              <button class="pass-step-btn" id="btn-pass-squeeze" data-pass="squeeze" disabled>
                <span class="pass-letter">S</span>
                <span>SQUEEZE</span>
              </button>
              <button class="pass-step-btn" id="btn-pass-sweep" data-pass="sweep" disabled>
                <span class="pass-letter">S</span>
                <span>SWEEP</span>
              </button>
            </div>
          </div>

          <!-- Completion Action -->
          <div id="deck-step-finish" style="display: none; text-align: center;">
            <button class="btn-primary" id="btn-finish-drill" style="width: 100%; padding: 12px; font-size: 14px; background: linear-gradient(135deg, #059669, #10b981); font-weight: 800;">
              ✓ Extinguished! View Assessment & DGMS Analytics
            </button>
          </div>

          <!-- Utility Bar: Switch Camera vs 3D Gallery / Exit -->
          <div class="hud-util-row">
            <button class="btn-hud-ghost" id="btn-toggle-sim">
              🔄 Switch 3D Mine / Camera
            </button>
            <button class="btn-hud-ghost" id="btn-exit-ar" style="border-color: rgba(239, 68, 68, 0.4); color: #fca5a5;">
              ✕ Abort Drill
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

  activeEngine = new AREngine(videoEl, canvasEl);
  activeTelemetry = new TelemetryEngine();
  const validator = new SafetyValidator();

  let selectedEquipment = null;
  let selectedApproach = null;
  const completedPassSteps = [];
  let currentScoreXP = 0;

  function showToast(text, isPenalty = false) {
    const slot = container.querySelector('#floating-toast-slot');
    if (!slot) return;
    const toast = document.createElement('div');
    toast.className = `floating-feedback ${isPenalty ? 'penalty' : ''}`;
    toast.textContent = text;
    slot.appendChild(toast);
    setTimeout(() => toast.remove(), 2400);
  }

  function advanceFromScanToEquip() {
    activeEngine.lockSurface();
    container.querySelector('#deck-step-scan').style.display = 'none';
    container.querySelector('#deck-step-equip').style.display = 'block';

    if (statusBadge) {
      statusBadge.style.background = '#059669';
      statusBadge.textContent = 'AR MODE: SURFACE LOCKED';
    }

    playSuccessChime();
    speak("Surface locked. Conveyor belt friction fire anchored. Select your firefighting media.");
  }

  // Start AR Engine
  activeEngine.initialize().then((info) => {
    if (isSimMode || info.isFallback) {
      if (isSimMode && !info.isFallback) {
        activeEngine.engageFallbackSimulation();
      }
      if (statusBadge) {
        statusBadge.style.background = '#d97706';
        statusBadge.textContent = 'SIMULATION MODE: 3D MINE GALLERY';
      }
      // Auto bypass scan in pure 3D gallery mode
      container.querySelector('#deck-step-scan').style.display = 'none';
      container.querySelector('#deck-step-equip').style.display = 'block';
    } else {
      if (statusBadge) {
        statusBadge.style.background = '#0284c7';
        statusBadge.textContent = 'SCANNING ENVIRONMENT...';
      }
    }

    activeTelemetry.start();

    // Start Real-Time Millisecond Timer
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

    // Initial voice prompt
    speak("Emergency warning. Spontaneous heating fire detected on belt conveyor. Point camera to lock surface, or select equipment.");
  });

  // Tap to lock surface listeners
  container.querySelector('#btn-lock-surface')?.addEventListener('click', advanceFromScanToEquip);
  canvasEl?.addEventListener('click', () => {
    if (activeEngine && !activeEngine.isSurfaceLocked) {
      advanceFromScanToEquip();
    }
  });

  // Start CV Detector
  activeDetector = new ObjectDetector({
    video: videoEl,
    onDetected: () => {
      const dcpBtn = container.querySelector('#btn-equip-dcp');
      if (dcpBtn && container.querySelector('#deck-step-equip').style.display !== 'none') {
        dcpBtn.classList.add('selected');
        dcpBtn.click();
      }
    }
  });
  activeDetector.start();

  // 1. Equipment Selection Handlers
  container.querySelectorAll('[data-equip]').forEach(btn => {
    btn.addEventListener('click', () => {
      const equip = btn.getAttribute('data-equip');
      selectedEquipment = equip;

      container.querySelectorAll('[data-equip]').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');

      const validation = validator.validateEquipment(equip);
      activeTelemetry.recordHazardRecognition();
      activeTelemetry.logAction('EQUIPMENT_SELECTED', { equipment: equip, valid: validation.isValid });

      if (validation.isValid) {
        currentScoreXP += 30; // 15 speed bonus + 15 correct equipment
        showToast("+15 XP Correct Equipment: Dry Chemical Powder (DCP)!");
        playSuccessChime();
        speak("Dry Chemical Powder selected. Choose your ventilation approach.");
      } else {
        currentScoreXP -= 10;
        activeTelemetry.recordMistake("Selected water spray for coal dust conveyor fire");
        showToast("-10 XP Penalty: Water spray is hazardous near conveyor motor!", true);
        playPenaltyBuzz();
        speak("Hazard warning. Water spray can cause electric shock or coal dust explosion.");
      }

      container.querySelector('#hud-score-chip').textContent = `${currentScoreXP >= 0 ? '+' : ''}${currentScoreXP} XP`;

      // Advance to Step 2
      container.querySelector('#deck-step-equip').style.display = 'none';
      container.querySelector('#deck-step-approach').style.display = 'block';
    });
  });

  // 2. Approach Selection Handlers
  container.querySelectorAll('[data-pos]').forEach(btn => {
    btn.addEventListener('click', () => {
      const pos = btn.getAttribute('data-pos');
      selectedApproach = pos;

      const validation = validator.validateApproach(pos);
      activeTelemetry.logAction('APPROACH_SELECTED', { position: pos, valid: validation.isValid });

      if (validation.isValid) {
        showToast("✓ Safe Approach: Intake Airway (Upwind)!");
        playSuccessChime();
        speak("Safe positioning confirmed. Fresh air at your back. Execute the PASS protocol.");
      } else {
        currentScoreXP -= 20;
        activeTelemetry.recordMistake("Approached from return airway (downwind toxic CO)");
        showToast("-20 XP Danger: Approaching downwind in toxic smoke!", true);
        playPenaltyBuzz();
        speak("Critical violation! Approaching from return airway puts you directly in toxic carbon monoxide smoke.");
      }

      container.querySelector('#hud-score-chip').textContent = `${currentScoreXP >= 0 ? '+' : ''}${currentScoreXP} XP`;

      // Advance to Step 3 (PASS)
      container.querySelector('#deck-step-approach').style.display = 'none';
      container.querySelector('#deck-step-pass').style.display = 'block';
    });
  });

  // 3. Interactive PASS Protocol Handlers
  const passButtons = {
    pull: container.querySelector('#btn-pass-pull'),
    aim: container.querySelector('#btn-pass-aim'),
    squeeze: container.querySelector('#btn-pass-squeeze'),
    sweep: container.querySelector('#btn-pass-sweep')
  };

  passButtons.pull?.addEventListener('click', () => {
    completedPassSteps.push('pull');
    passButtons.pull.classList.add('completed');
    passButtons.pull.disabled = true;
    passButtons.aim.disabled = false;
    currentScoreXP += 5;
    activeTelemetry.logAction('PASS_PULL');

    // Trigger 3D Extinguisher Pull-Pin Animation
    if (activeEngine) {
      activeEngine.animatePullPin();
    }

    showToast("+5 XP [P] Pin Pulled & Valve Unlocked!");
    playSuccessChime();
    speak("Pin pulled. Aim nozzle at the base of the fire.");
    container.querySelector('#pass-progress-tag').textContent = "1/4 Complete";
    container.querySelector('#hud-score-chip').textContent = `+${currentScoreXP} XP`;
  });

  passButtons.aim?.addEventListener('click', () => {
    completedPassSteps.push('aim');
    passButtons.aim.classList.add('completed');
    passButtons.aim.disabled = true;
    passButtons.squeeze.disabled = false;
    currentScoreXP += 5;
    activeTelemetry.logAction('PASS_AIM');

    // Trigger 3D Extinguisher Aim Animation
    if (activeEngine) {
      activeEngine.animateAim();
      activeEngine.shrinkFire(0.2);
    }

    showToast("+5 XP [A] Aimed at Flame Base!");
    playSuccessChime();
    speak("Aimed at base. Squeeze the operating lever.");
    container.querySelector('#pass-progress-tag').textContent = "2/4 Complete";
    container.querySelector('#hud-score-chip').textContent = `+${currentScoreXP} XP`;
  });

  passButtons.squeeze?.addEventListener('click', () => {
    completedPassSteps.push('squeeze');
    passButtons.squeeze.classList.add('completed');
    passButtons.squeeze.disabled = true;
    passButtons.sweep.disabled = false;
    currentScoreXP += 5;
    activeTelemetry.logAction('PASS_SQUEEZE');

    // Trigger 3D Extinguisher Squeeze Lever & DCP Powder Discharge
    if (activeEngine) {
      activeEngine.animateSqueeze();
      activeEngine.shrinkFire(0.4);
    }

    showToast("+5 XP [S] Squeezed Lever - Discharging DCP Cloud!");
    speak("Discharging dry chemical powder. Sweep side to side to blanket the burning coal.");
    container.querySelector('#pass-progress-tag').textContent = "3/4 Complete";
    container.querySelector('#hud-score-chip').textContent = `+${currentScoreXP} XP`;
  });

  passButtons.sweep?.addEventListener('click', () => {
    completedPassSteps.push('sweep');
    passButtons.sweep.classList.add('completed');
    passButtons.sweep.disabled = true;
    currentScoreXP += 60; // 10 + 50 completion bonus
    activeTelemetry.logAction('PASS_SWEEP');

    // Trigger 3D Extinguisher Sweep & Complete Extinguishment
    if (activeEngine) {
      activeEngine.animateSweep(1.0);
      activeEngine.extinguishCompletely();
    }

    playSuccessChime();
    speak("Fire successfully extinguished. Drill completed.");

    showToast("+60 XP Drill Complete & Extinguished!");
    container.querySelector('#pass-progress-tag').textContent = "4/4 Complete!";
    container.querySelector('#hud-danger-banner').style.background = "#10b981";
    container.querySelector('#hud-danger-banner').innerHTML = "<span>✓</span> HAZARD NEUTRALIZED (SAFE)";
    container.querySelector('#hud-score-chip').textContent = `+${currentScoreXP} XP`;

    // Show finish button
    container.querySelector('#deck-step-pass').style.display = 'none';
    container.querySelector('#deck-step-finish').style.display = 'block';
  });

  // 4. Finish Drill Action
  container.querySelector('#btn-finish-drill')?.addEventListener('click', async () => {
    clearInterval(timerInterval);
    const telemetryData = activeTelemetry.finish();

    const evaluation = calculateAttemptScore(telemetryData, {
      equipmentCorrect: (selectedEquipment === 'dcp_extinguisher'),
      approachCorrect: (selectedApproach === 'intake'),
      passCompletedCount: completedPassSteps.length
    });

    state.lastAttemptResult = {
      telemetry: telemetryData,
      evaluation: evaluation,
      equipment_selected: selectedEquipment,
      approach_position: selectedApproach,
      pass_steps_completed: completedPassSteps
    };

    // Save and send to backend
    const attemptPayload = {
      worker_id: state.worker?.id || 'anik01',
      scenario_id: 'fire_conveyor_01',
      duration_ms: telemetryData.duration_ms,
      hazard_rec_ms: telemetryData.hazard_rec_ms,
      equipment_selected: selectedEquipment || 'dcp_extinguisher',
      approach_position: selectedApproach || 'intake',
      pass_steps_completed: completedPassSteps,
      mistakes: telemetryData.mistakes || [],
      is_offline: !navigator.onLine
    };

    try {
      if (navigator.onLine) {
        const resp = await fetch('/api/v1/attempts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(attemptPayload)
        });
        if (resp.ok) {
          const apiResult = await resp.json();
          state.apiResult = apiResult;
          if (state.worker) {
            state.worker.xp = apiResult.new_total_xp;
            state.worker.level = apiResult.new_level;
            state.worker.progress_pct = apiResult.new_progress_pct;
            state.worker.competency_score = apiResult.competency_score;
          }
        }
      } else {
        const { queueOfflineAttempt } = await import('../db.js');
        await queueOfflineAttempt(attemptPayload);
      }
    } catch (e) {
      console.warn('Attempt save fallback:', e);
    }

    teardownAR();
    window.location.hash = '#results';
  });

  // Toggle Camera vs 3D Simulation Mode
  container.querySelector('#btn-toggle-sim')?.addEventListener('click', () => {
    activeEngine.toggleFallbackMode();
    if (statusBadge) {
      if (activeEngine.isFallbackMode) {
        statusBadge.style.background = '#d97706';
        statusBadge.textContent = 'SIMULATION MODE: 3D MINE GALLERY';
      } else {
        statusBadge.style.background = activeEngine.isSurfaceLocked ? '#059669' : '#0284c7';
        statusBadge.textContent = activeEngine.isSurfaceLocked ? 'AR MODE: SURFACE LOCKED' : 'SCANNING ENVIRONMENT...';
      }
    }
  });

  // Abort Drill
  container.querySelector('#btn-exit-ar')?.addEventListener('click', () => {
    teardownAR();
    window.location.hash = '#home';
  });
}

export function teardownAR() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  if (activeEngine) {
    activeEngine.destroy();
    activeEngine = null;
  }
  if (activeDetector) {
    activeDetector.stop();
    activeDetector = null;
  }
  const bottomNav = document.getElementById('bottom-nav');
  if (bottomNav) bottomNav.style.display = 'flex';
}
