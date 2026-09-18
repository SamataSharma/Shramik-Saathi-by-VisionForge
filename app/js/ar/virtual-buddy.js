// Interactive Virtual Safety Buddy Simulation Engine for VISIONFORGE - MINE AR
// 3-State Non-Intrusive Architecture: ON + EXPANDED, ON + MINIMIZED, OFF
// Features scenario-specific simulated training guidance across all 5 hazard modules.

import { speak, playSuccessChime, playPenaltyBuzz } from '../voice.js';
import { t } from '../i18n.js';

export class VirtualBuddySystem {
  constructor(options = {}) {
    this.container = options.container;
    this.scenarioId = options.scenarioId || 'sim_fire_explosion';
    this.onStateChange = options.onStateChange || (() => {});
    this.onMistake = options.onMistake || (() => {});
    this.onDecisionCorrect = options.onDecisionCorrect || (() => {});
    this.onModeChange = options.onModeChange || (() => {});

    this.buddyName = t('buddy_title', "Arjun (Training Safety Buddy)");
    this.currentState = "STEP_0";
    this.stepIndex = 0;
    this.decisionScore = 0;

    // 3 States: 'expanded' | 'minimized' | 'off'
    // Default: ON + EXPANDED (as required)
    this.uiMode = options.initialMode || 'expanded';
  }

  start() {
    this.stepIndex = 0;
    this.transitionTo("STEP_0");
  }

  setMode(newMode) {
    if (this.uiMode === newMode) return;
    this.uiMode = newMode;
    this.renderUI();
    this.onModeChange(this.uiMode);
  }

  transitionTo(nextState) {
    this.currentState = nextState;
    this.renderUI();
    this.onStateChange(this.currentState);
  }

  getScenarioSteps() {
    switch (this.scenarioId) {
      case 'sim_fire_explosion':
        return [
          {
            state: "STEP_0",
            icon: "🔥",
            title: "Thermal Hazard Assessment",
            status: "Simulated Heating Indicator",
            message: "\"Conveyor friction heating detected on belt roller. Toxic smoke rising. For an energized electrical drive fire, which extinguishing media should we select under training guidance?\"",
            voice: "Conveyor friction heating detected. Select the correct extinguishing media under training guidance.",
            options: [
              { text: "A. Dry Chemical Powder (DCP - IS 2171)", choice: "safe", xp: 20, feedback: "Safe choice. Dry Chemical Powder is rated for electrical equipment without conducting current." },
              { text: "B. Water Hose Spray Jet", choice: "unsafe", reason: "Training warning: Water conducts electrical current near motorized drives." },
              { text: "C. Unpressurized Sand Bucket", choice: "unsafe", reason: "Training warning: Insufficient coverage for active conveyor friction fire." }
            ],
            nextState: "STEP_1"
          },
          {
            state: "STEP_1",
            icon: "🌬️",
            title: "Tactical Airway Positioning",
            status: "Airflow Direction Check",
            message: "\"Extinguisher ready. Now check the ventilation airflow direction. Which approach route provides safe positioning upwind from combustion gases?\"",
            voice: "Check ventilation airflow. Which approach provides safe positioning upwind?",
            options: [
              { text: "A. Intake Airway (Upwind - Fresh air flowing toward hazard)", choice: "safe", xp: 20, feedback: "Safe positioning confirmed. Fresh air at your back carries smoke away." },
              { text: "B. Return Airway (Downwind - Direct path of smoke)", choice: "unsafe", reason: "Training warning: Approaching from return airway leads directly into toxic combustion smoke." }
            ],
            nextState: "STEP_2"
          },
          {
            state: "STEP_2",
            icon: "🧯",
            title: "PASS Method Execution",
            status: "Simulated Extinguisher Operation",
            message: "\"Position confirmed upwind. Follow the PASS protocol: Pull pin, Aim nozzle at base, Squeeze operating lever, and Sweep side to side across flame base.\"",
            voice: "Position confirmed upwind. Follow the PASS protocol.",
            actionBtn: { text: "✓ Execute PASS Extinguisher Sequence", xp: 30 },
            nextState: "COMPLETED"
          }
        ];

      case 'sim_gas_confined':
        return [
          {
            state: "STEP_0",
            icon: "📻",
            title: "Communication Verification",
            status: "Heading Ingress Check",
            message: "\"Prior to entering the remote heading collar, verify two-way verbal radio communication with the team and check multi-gas monitor response.\"",
            voice: "Verify two-way verbal communication and multi-gas detector response.",
            actionBtn: { text: "📻 Confirm Two-Way Verbal Comms Link", xp: 15 },
            nextState: "STEP_1"
          },
          {
            state: "STEP_1",
            icon: "🦺",
            title: "PPE & Respirator Verification",
            status: "Safety Gear Inspection",
            message: "\"Comms active. Verify your Self-Contained Self-Rescuer (SCSR) canister seal is intact and multi-gas detector sample pump is drawing.\"",
            voice: "Verify self-rescuer oxygen canister and multi-gas detector pump.",
            actionBtn: { text: "🦺 Verify SCSR Tamper Seal & Gas Detector", xp: 15 },
            nextState: "STEP_2"
          },
          {
            state: "STEP_2",
            icon: "⚠️",
            title: "Gas Reading & Withdrawal",
            status: "Simulated Threshold: CH4 > 1.25%",
            message: "\"Audible gas alarm sounding! Reading indicates methane above the simulated threshold. What is the recommended training response?\"",
            voice: "Gas alarm sounding above simulated threshold. What is your training response?",
            options: [
              { text: "A. Immediately isolate electrical power and withdraw team upwind into fresh air", choice: "safe", xp: 40, feedback: "Safe response confirmed. Power isolated and team withdrawn upwind into fresh air." },
              { text: "B. Continue operating machinery while increasing water spray", choice: "unsafe", reason: "Training warning: Operating machinery during gas spikes risks electrical ignition." },
              { text: "C. Direct compressed air line at sensor to clear reading", choice: "unsafe", reason: "Training warning: Compressed air can induce static sparks in methane atmospheres." }
            ],
            nextState: "COMPLETED"
          }
        ];

      case 'sim_machinery_safety':
        return [
          {
            state: "STEP_0",
            icon: "⚡",
            title: "Hazard Recognition & Isolation",
            status: "Damaged Cable Insulation",
            message: "\"Damaged insulation observed on 3.3kV flexible trailing cable near machine tracks. What is the mandatory electrical isolation procedure?\"",
            voice: "Damaged trailing cable insulation observed. What is the isolation procedure?",
            options: [
              { text: "A. De-energize gate-end circuit breaker and apply Lockout/Tagout (LOTO) padlock", choice: "safe", xp: 25, feedback: "Correct training procedure. De-energize at breaker and attach physical LOTO padlock before approach." },
              { text: "B. Kick cable clear with safety boots while machine idles", choice: "unsafe", reason: "Training warning: Never physically reposition high-voltage cables while energized." },
              { text: "C. Wrap vinyl tape over damaged sheath without cutting power", choice: "unsafe", reason: "Training warning: High-voltage cables must never be handled while energized." }
            ],
            nextState: "STEP_1"
          },
          {
            state: "STEP_1",
            icon: "🚧",
            title: "Clearance Perimeter",
            status: "Simulated Stand-Off Distance: 1.5m",
            message: "\"Breaker handle locked and tagged. Now verify all personnel maintain the simulated 1.5-meter clearance perimeter from the articulated boom.\"",
            voice: "Verify 1.5 meter clearance perimeter from moving equipment.",
            actionBtn: { text: "⚠️ Establish 1.5m Clearance Stand-Off Zone", xp: 25 },
            nextState: "STEP_2"
          },
          {
            state: "STEP_2",
            icon: "🛑",
            title: "Emergency Stop Verification",
            status: "Emergency Trip Switch Test",
            message: "\"Clearance confirmed. Test the emergency stop pull-cord trip switch to ensure machine cannot be restarted before maintenance is complete.\"",
            voice: "Test emergency trip pull-cord mechanism.",
            actionBtn: { text: "🛑 Test Emergency Pull-Cord Trip Mechanism", xp: 25 },
            nextState: "COMPLETED"
          }
        ];

      case 'sim_emergency_evac':
        return [
          {
            state: "STEP_0",
            icon: "🚨",
            title: "Emergency Alert & SCSR",
            status: "Simulated Evacuation Siren Active",
            message: "\"Mine evacuation siren active and smoke haze detected in airway. What is the primary personal safety step?\"",
            voice: "Emergency alarm sounding. What is your immediate personal safety step?",
            options: [
              { text: "A. Don and activate Self-Contained Self-Rescuer (SCSR) oxygen apparatus", choice: "safe", xp: 25, feedback: "Safe response confirmed. Self-rescuer provides respiratory protection in contaminated airways." },
              { text: "B. Run toward shaft holding breath", choice: "unsafe", reason: "Training warning: Inhaling toxic combustion gases causes rapid incapacitation." },
              { text: "C. Remain in heading waiting for telephone contact", choice: "unsafe", reason: "Training warning: Smoke can quickly migrate into dead-end headings." }
            ],
            nextState: "STEP_1"
          },
          {
            state: "STEP_1",
            icon: "🧭",
            title: "Tactile Lifeline Navigation",
            status: "Directional Cones toward Intake",
            message: "\"SCSR active. Locate the tactile lifeline wire. Which directional cone orientation guides egress toward fresh air intake?\"",
            voice: "Locate tactile lifeline. Check cone orientation.",
            options: [
              { text: "A. Follow cones pointing along intake roadway toward the escape shaft", choice: "safe", xp: 25, feedback: "Safe choice. Cones point in the direction of fresh air intake and refuge." },
              { text: "B. Follow cones pointing into return roadway", choice: "unsafe", reason: "Training warning: Cones pointing downwind guide into the smoke stream." }
            ],
            nextState: "STEP_2"
          },
          {
            state: "STEP_2",
            icon: "🚪",
            title: "Airlock & Refuge Ingress",
            status: "Separation Barrier Protocol",
            message: "\"Entering airlock separation door. Ensure door is firmly latched behind the team to prevent smoke migration, then proceed into the refuge chamber.\"",
            voice: "Pass through separation door and ensure it latches securely.",
            actionBtn: { text: "🚪 Pass & Securely Latch Air-Lock Doors", xp: 30 },
            nextState: "COMPLETED"
          }
        ];

      case 'sim_roof_strata':
        return [
          {
            state: "STEP_0",
            icon: "👂",
            title: "Strata Acoustic Awareness",
            status: "Simulated Cracking & Spalling",
            message: "\"Audible strata cracking detected along the roof joint with loose rock spalling. What is the recommended inspection procedure?\"",
            voice: "Strata cracking detected. What is the recommended inspection procedure?",
            options: [
              { text: "A. Stand clear and perform sound-and-tap acoustic test with non-ferrous testing rod", choice: "safe", xp: 25, feedback: "Safe procedure confirmed. Sound-and-tap testing evaluates strata cohesion from safe position." },
              { text: "B. Walk directly under cracking face to shovel fallen rock", choice: "unsafe", reason: "Training warning: Advancing beneath unstable roof risks traumatic rock fall injury." },
              { text: "C. Dismiss noise as normal ground settlement without checking", choice: "unsafe", reason: "Training warning: Distinct cracking often precedes rapid strata delamination." }
            ],
            nextState: "STEP_1"
          },
          {
            state: "STEP_1",
            icon: "🔨",
            title: "Sound-and-Tap Acoustic Test",
            status: "Strata Cohesion Evaluation",
            message: "\"Testing rod produces a dull, hollow 'drummy' sound when tapped on the strata joint. What does this acoustic feedback indicate?\"",
            voice: "Sound-and-tap produces hollow sound. What does this indicate?",
            options: [
              { text: "A. Bed separation and unstable spalling slab requiring immediate support and stand-off", choice: "safe", xp: 25, feedback: "Accurate analysis. Drummy acoustic response indicates bed separation." },
              { text: "B. Competent solid rock that is safe to work under without support", choice: "unsafe", reason: "Training warning: Solid competent rock produces a clear metallic ring, not a hollow drummy sound." }
            ],
            nextState: "STEP_2"
          },
          {
            state: "STEP_2",
            icon: "🚩",
            title: "Stand-Off Cordon & Withdrawal",
            status: "Simulated Stand-Off Distance: 3m",
            message: "\"Hydraulic props bearing load. Establish the simulated 3-meter stand-off danger boundary and execute safe team withdrawal to supported roadway.\"",
            voice: "Establish 3 meter stand-off boundary and withdraw to supported roadway.",
            actionBtn: { text: "🚩 Establish 3m Boundary & Execute Withdrawal", xp: 30 },
            nextState: "COMPLETED"
          }
        ];

      default:
        return [];
    }
  }

  renderUI() {
    if (!this.container) return;

    // State 3: OFF -> Completely hide buddy container
    if (this.uiMode === 'off') {
      this.container.style.display = 'none';
      return;
    }

    this.container.style.display = 'block';

    const steps = this.getScenarioSteps();

    // Completed State
    if (this.currentState === "COMPLETED") {
      let completionMsg = "All simulated safety guidance steps completed successfully.";
      if (this.scenarioId === 'sim_fire_explosion') {
        completionMsg = "\"Conveyor heating extinguished, thermal hazard controlled, and area secured under training guidance.\"";
      } else if (this.scenarioId === 'sim_gas_confined') {
        completionMsg = "\"Power isolated, team accounted for, and withdrawn into fresh intake air safely.\"";
      } else if (this.scenarioId === 'sim_machinery_safety') {
        completionMsg = "\"Zero energy verified, clearance perimeter maintained, and emergency trip switch tested safe.\"";
      } else if (this.scenarioId === 'sim_emergency_evac') {
        completionMsg = "\"Team has safely entered refuge chamber with SCSR active and airlocks secured.\"";
      } else if (this.scenarioId === 'sim_roof_strata') {
        completionMsg = "\"3m stand-off cordon established and team safely withdrawn to supported roadway.\"";
      }

      if (this.uiMode === 'minimized') {
        this.container.innerHTML = `
          <div class="buddy-mini-pill completed" id="btn-expand-buddy" title="Tap to expand Virtual Buddy">
            <span>👷</span>
            <span style="font-size: 11px; font-weight: 700;">BUDDY • ✓ DONE</span>
            <span style="font-size: 9px; opacity: 0.8;">[EXPAND ▴]</span>
          </div>
        `;
        this.container.querySelector('#btn-expand-buddy')?.addEventListener('click', () => this.setMode('expanded'));
        return;
      }

      this.container.innerHTML = `
        <div class="buddy-card" style="background: rgba(6, 78, 59, 0.95); border: 1.5px solid #10b981; border-radius: 12px; padding: 12px; color: #ffffff;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 20px;">👷‍♂️</span>
              <div>
                <strong style="color: #6ee7b7; font-size: 12.5px;">${this.buddyName}</strong>
                <div style="font-size: 10px; color: #a7f3d0;">✓ Training Guidance Verified</div>
              </div>
            </div>
            <div style="display: flex; gap: 4px;">
              <button id="buddy-btn-minimize" class="buddy-hdr-btn" title="Minimize">▾</button>
              <button id="buddy-btn-turnoff" class="buddy-hdr-btn" title="Turn OFF">✕</button>
            </div>
          </div>
          <p style="font-size: 11.5px; color: #d1fae5; margin: 0; line-height: 1.4;">
            Buddy: <em>${completionMsg}</em>
          </p>
        </div>
      `;
      this.container.querySelector('#buddy-btn-minimize')?.addEventListener('click', () => this.setMode('minimized'));
      this.container.querySelector('#buddy-btn-turnoff')?.addEventListener('click', () => this.setMode('off'));
      return;
    }

    const currentStepObj = steps.find(s => s.state === this.currentState) || steps[0];
    if (!currentStepObj) return;

    // State 2: MINIMIZED -> Small floating badge
    if (this.uiMode === 'minimized') {
      this.container.innerHTML = `
        <div class="buddy-mini-pill" id="btn-expand-buddy" title="${t('buddy_expand')}">
          <span>👷</span>
          <span style="font-size: 11px; font-weight: 700;">${t('buddy_badge')} • ${t('step_label')} ${this.stepIndex + 1}/${steps.length}</span>
          <span style="font-size: 9px; opacity: 0.8;">[${t('buddy_expand')} ▴]</span>
        </div>
      `;
      this.container.querySelector('#btn-expand-buddy')?.addEventListener('click', () => this.setMode('expanded'));
      return;
    }

    // State 1: EXPANDED -> Compact, non-intrusive interactive panel
    let actionHTML = '';
    if (currentStepObj.options) {
      actionHTML = `
        <div style="display: flex; flex-direction: column; gap: 6px; margin-top: 8px;" id="buddy-decision-options">
          ${currentStepObj.options.map(opt => `
            <button class="buddy-opt" data-choice="${opt.choice}" data-xp="${opt.xp || 0}" data-reason="${opt.reason || ''}" data-feedback="${opt.feedback || ''}" style="text-align: left; padding: 8px 10px; font-size: 11px; color: #ffffff; background: rgba(30, 41, 59, 0.9); border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 6px; cursor: pointer; line-height: 1.3;">
              ${opt.text}
            </button>
          `).join('')}
        </div>
      `;
    } else if (currentStepObj.actionBtn) {
      actionHTML = `
        <button id="btn-buddy-step-action" class="btn-primary" data-xp="${currentStepObj.actionBtn.xp || 20}" style="width: 100%; padding: 9px; font-size: 11.5px; font-weight: 700; margin-top: 8px; background: linear-gradient(135deg, #0284c7, #0369a1); border: none; border-radius: 6px; color: #ffffff; cursor: pointer;">
          ${currentStepObj.actionBtn.text}
        </button>
      `;
    }

    this.container.innerHTML = `
      <div class="buddy-card" style="background: rgba(15, 23, 42, 0.94); border: 1.5px solid #0284c7; border-radius: 10px; padding: 10px 12px; color: #ffffff; box-shadow: 0 4px 18px rgba(0, 0, 0, 0.5);">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
          <div style="display: flex; align-items: center; gap: 6px;">
            <span style="font-size: 18px;">${currentStepObj.icon}</span>
            <div>
              <strong style="color: #38bdf8; font-size: 12px;">${t('buddy_title', this.buddyName)}</strong>
              <div style="font-size: 9.5px; color: #94a3b8;">${currentStepObj.status}</div>
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 6px;">
            <span style="background: rgba(2, 132, 199, 0.25); color: #38bdf8; font-size: 9.5px; font-weight: 800; padding: 1px 6px; border-radius: 9999px;">
              ${this.stepIndex + 1}/${steps.length}
            </span>
            <button id="buddy-btn-minimize" class="buddy-hdr-btn" title="${t('buddy_minimize')}">▾</button>
            <button id="buddy-btn-turnoff" class="buddy-hdr-btn" title="${t('buddy_turnoff')}">✕</button>
          </div>
        </div>
        <p style="font-size: 11px; color: #cbd5e1; margin: 0; line-height: 1.35;">
          ${currentStepObj.message}
        </p>
        ${actionHTML}
      </div>
    `;

    if (currentStepObj.voice) {
      speak(currentStepObj.voice);
    }

    this.container.querySelector('#buddy-btn-minimize')?.addEventListener('click', () => this.setMode('minimized'));
    this.container.querySelector('#buddy-btn-turnoff')?.addEventListener('click', () => this.setMode('off'));

    this.attachEvents(currentStepObj);
  }

  attachEvents(currentStepObj) {
    const actionBtn = this.container.querySelector('#btn-buddy-step-action');
    if (actionBtn) {
      actionBtn.addEventListener('click', () => {
        const xp = parseInt(actionBtn.getAttribute('data-xp') || '20', 10);
        playSuccessChime();
        this.onDecisionCorrect(xp);
        this.stepIndex++;
        this.transitionTo(currentStepObj.nextState);
      });
    }

    const decisionBtns = this.container.querySelectorAll('.buddy-opt');
    decisionBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const choice = btn.getAttribute('data-choice');
        const xp = parseInt(btn.getAttribute('data-xp') || '20', 10);
        const reason = btn.getAttribute('data-reason');
        const feedback = btn.getAttribute('data-feedback');

        if (choice === 'safe') {
          playSuccessChime();
          if (feedback) speak(feedback);
          btn.style.background = '#065f46';
          btn.style.borderColor = '#10b981';
          this.decisionScore += 50;
          this.onDecisionCorrect(xp);

          setTimeout(() => {
            this.stepIndex++;
            this.transitionTo(currentStepObj.nextState);
          }, 700);
        } else {
          playPenaltyBuzz();
          if (reason) speak(reason);
          btn.style.borderColor = '#ef4444';
          btn.style.background = '#7f1d1d';
          this.onMistake(reason || "Simulated training violation");
        }
      });
    });
  }
}
