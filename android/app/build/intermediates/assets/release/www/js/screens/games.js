// Games Screen: Expanded Vocational Training Games Suite
// Uses realistic coal mine photographic environments with 7 interactive vocational games

import { t, getLanguage } from '../i18n.js';
import { speak, playSuccessChime, playPenaltyBuzz } from '../voice.js';

// Real photographic scenario definitions
const REALISTIC_SCENARIOS = [
  {
    id: "game_conveyor_fire",
    nameKey: "game_hazard_hunt_title",
    defaultName: "Conveyor Belt Seized Roller & Dust Fire",
    location: "Trunk Haulage Roadway",
    image: "/assets/images/hazard_conveyor_fire.png",
    timeLimit: 40,
    hazards: [
      {
        id: "h1",
        name: "Red-Hot Seized Roller (Friction)",
        nameHi: "अत्यधिक गर्म सीज्ड रोलर (घर्षण खतरा)",
        nameSat: "ᱞᱚᱞᱚ ᱨᱳᱞᱟᱨ (ᱜᱷᱟᱨᱥᱚᱬ ᱵᱤᱯᱚᱫᱽ)",
        x: 44, y: 62, radius: 42,
        action: "Deploy Dry Chemical Powder (DCP) & isolate power",
        actionHi: "DCP पाउडर चलाएं और बिजली काटें",
        actionSat: "DCP ᱯᱟᱣᱰᱟᱨ ᱪᱟᱹᱞᱩᱭ ᱢᱮ ᱟᱨ ᱵᱤᱡᱽᱞᱤ ᱵᱚᱸᱫᱽ ᱢᱮ",
        xp: 25
      },
      {
        id: "h2",
        name: "Combustible Coal Dust Accumulation",
        nameHi: "ज्वलनशील कोयला धूल जमाव",
        nameSat: "ᱡᱩᱞᱩᱜ ᱠᱚᱭᱞᱟ ᱫᱷᱩᱲᱤ",
        x: 22, y: 80, radius: 45,
        action: "Clear coal dust fines and apply stone dust barrier",
        actionHi: "कोयला धूल साफ करें और स्टोन डस्ट बैरियर लगाएं",
        actionSat: "ᱫᱷᱩᱲᱤ ᱥᱟᱯᱷᱟᱭ ᱢᱮ ᱟᱨ ᱫᱷᱤᱨᱤ ᱫᱷᱩᱲᱤ ᱞᱟᱜᱟᱣ ᱢᱮ",
        xp: 20
      },
      {
        id: "h3",
        name: "Emergency Pull-Cord Station",
        nameHi: "आपातकालीन पुल-कॉर्ड स्विच",
        nameSat: "ᱤᱢᱟᱨᱡᱮᱱᱥᱤ ᱯᱩᱞ-ᱠᱳᱨᱰ ᱛᱟᱨ",
        x: 14, y: 39, radius: 38,
        action: "Ensure clear unobstructed access along conveyor wire",
        actionHi: "पुल-कॉर्ड तक पहुंचने का रास्ता साफ रखें",
        actionSat: "ᱯᱩᱞ-ᱠᱳᱨᱰ ᱰᱟᱦᱟᱨ ᱥᱟᱯᱷᱟ ᱫᱚᱦᱚᱭ ᱢᱮ",
        xp: 20
      }
    ]
  },
  {
    id: "game_electrical_sub",
    nameKey: "game_loto_title",
    defaultName: "Underground Substation & Trailing Cables",
    location: "Main Section Substation",
    image: "/assets/images/hazard_electrical_substation.png",
    timeLimit: 35,
    hazards: [
      {
        id: "h4",
        name: "Water Pool Near Transformer Enclosure",
        nameHi: "ट्रांसफार्मर के पास पानी का जमाव",
        nameSat: "ᱴᱨᱟᱱᱥᱯᱷᱟᱨᱢᱟᱨ ᱥᱩᱨ ᱫᱟᱜ ᱡᱟᱣᱨᱟ",
        x: 26, y: 76, radius: 45,
        action: "Isolate power supply and divert water flow",
        actionHi: "बिजली सप्लाई काटें और पानी हटाएं",
        actionSat: "ᱵᱤᱡᱽᱞᱤ ᱵᱚᱸᱫᱽ ᱢᱮ ᱟᱨ ᱫᱟᱜ ᱥᱟᱦᱟᱭ ᱢᱮ",
        xp: 25
      },
      {
        id: "h5",
        name: "Heavy Trailing Cables Near Machinery",
        nameHi: "मशीन के पास भारी ट्रेलिंग केबल",
        nameSat: "ᱢᱮᱥᱤᱱ ᱥᱩᱨ ᱴᱨᱮᱞᱤᱝ ᱠᱮᱵᱚᱞ",
        x: 50, y: 80, radius: 42,
        action: "Suspend cables on insulated overhead hooks",
        actionHi: "केबल को इंसुलेटेड हैंगर पर टांगें",
        actionSat: "ᱠᱮᱵᱚᱞ ᱪᱮᱛᱟᱱ ᱨᱮ ᱴᱟᱸᱜᱟᱣ ᱢᱮ",
        xp: 25
      }
    ]
  },
  {
    id: "game_roof_spalling",
    nameKey: "game_roof_title",
    defaultName: "Working Face Strata & Roof Support",
    location: "Active Coal Extraction Face",
    image: "/assets/images/hazard_roof_spalling.png",
    timeLimit: 35,
    hazards: [
      {
        id: "h6",
        name: "Fractured Roof Delamination (Drummy)",
        nameHi: "कमजोर छत में दरार (ड्रामी छत)",
        nameSat: "ᱪᱷᱟᱛ ᱨᱮ ᱯᱷᱟᱴ (ᱰᱨᱟᱢᱤ ᱪᱷᱟᱛ)",
        x: 52, y: 32, radius: 45,
        action: "Sound warning, withdraw workers, and install prop",
        actionHi: "चेतावनी दें, पीछे हटें और खूंटा सहारा लगाएं",
        actionSat: "ᱦᱚᱦᱚ ᱢᱮ, ᱛᱟᱭᱚᱢᱚᱜ ᱢᱮ ᱟᱨ ᱠᱷᱩᱱᱴᱤ ᱴᱮᱠᱟᱣ ᱮᱢ ᱢᱮ",
        xp: 30
      },
      {
        id: "h7",
        name: "Loose Fallen Rock Near Track",
        nameHi: "ट्रैक के पास गिरा ढीला पत्थर",
        nameSat: "ᱴᱨᱮᱠ ᱥᱩᱨ ᱧᱩᱨ ᱟᱠᱟᱱ ᱫᱷᱤᱨᱤ",
        x: 45, y: 80, radius: 38,
        action: "Cordon off spalling zone and notify mining sirdar",
        actionHi: "खतरनाक क्षेत्र को घेरें और सरदार को बताएं",
        actionSat: "ᱴᱷᱟᱶ ᱮᱥᱮᱫ ᱢᱮ ᱟᱨ ᱥᱚᱨᱫᱟᱨ ᱵᱟᱰᱟᱭ ᱦᱚᱪᱚᱭᱮ ᱢᱮ",
        xp: 25
      }
    ]
  }
];

export async function renderGamesScreen(container, state) {
  const traineeId = state.worker?.id || 'anik01';
  let currentGameType = 'hub'; // 'hub' | 'hazard_hunt' | 'ppe' | 'evac' | 'loto' | 'gas' | 'roof' | 'quiz'

  function renderHub() {
    container.innerHTML = `
      <div id="games-hub-view" style="padding-top: 4px; padding-bottom: 24px;">
        <!-- Header -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <button id="btn-games-back-home" class="btn-secondary" style="padding: 6px 12px; border-radius: var(--radius-full);">
              ← ${t('back')}
            </button>
            <h2 style="font-size: 18px; font-weight: 800; color: var(--text-primary); margin: 0;">
              ${t('games')}
            </h2>
          </div>
          <span style="font-size: 11px; font-weight: 700; color: #b45309; background: #fef3c7; padding: 4px 10px; border-radius: 9999px;">
            7 ${t('games')}
          </span>
        </div>

        <!-- Banner Card -->
        <div style="
          background: linear-gradient(135deg, #78350f 0%, #d97706 100%);
          color: #ffffff;
          border-radius: var(--radius-xl);
          padding: 18px;
          margin-bottom: 18px;
          box-shadow: var(--shadow-md);
        ">
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 6px;">
            <span style="font-size: 24px;">🎮</span>
            <h3 style="margin: 0; font-size: 16px; font-weight: 800;">
              ${t('games_banner_title')}
            </h3>
          </div>
          <p style="margin: 0; font-size: 12px; color: #fef3c7; line-height: 1.45;">
            ${t('games_banner_subtitle')}
          </p>
        </div>

        <!-- 7 Games Grid -->
        <div style="display: flex; flex-direction: column; gap: 12px;">
          <!-- 1. Hazard Hunt -->
          <div class="game-item-card" data-game="hazard_hunt" style="
            background: #ffffff; border-radius: var(--radius-lg); padding: 14px;
            border: 1px solid #e2e8f0; box-shadow: var(--shadow-sm); cursor: pointer;
            display: flex; gap: 14px; align-items: center;
          ">
            <img src="/assets/images/hazard_conveyor_fire.png" alt="Hazard Hunt" style="width: 72px; height: 62px; object-fit: cover; border-radius: 10px;" />
            <div style="flex: 1;">
              <h4 style="margin: 0 0 4px 0; font-size: 13.5px; font-weight: 800; color: var(--text-primary);">${t('game_hazard_hunt_title')}</h4>
              <p style="margin: 0 0 6px 0; font-size: 11.5px; color: var(--text-secondary); line-height: 1.35;">${t('game_hazard_hunt_sub')}</p>
              <span style="font-size: 11px; font-weight: 700; color: #b45309;">${t('play_now')} →</span>
            </div>
          </div>

          <!-- 2. PPE & Gear Selection -->
          <div class="game-item-card" data-game="ppe" style="
            background: #ffffff; border-radius: var(--radius-lg); padding: 14px;
            border: 1px solid #e2e8f0; box-shadow: var(--shadow-sm); cursor: pointer;
            display: flex; gap: 14px; align-items: center;
          ">
            <div style="width: 72px; height: 62px; background: #e0f2fe; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 28px;">🦺</div>
            <div style="flex: 1;">
              <h4 style="margin: 0 0 4px 0; font-size: 13.5px; font-weight: 800; color: var(--text-primary);">${t('game_ppe_title')}</h4>
              <p style="margin: 0 0 6px 0; font-size: 11.5px; color: var(--text-secondary); line-height: 1.35;">${t('game_ppe_sub')}</p>
              <span style="font-size: 11px; font-weight: 700; color: #0284c7;">${t('play_now')} →</span>
            </div>
          </div>

          <!-- 3. Evacuation Route Decision -->
          <div class="game-item-card" data-game="evac" style="
            background: #ffffff; border-radius: var(--radius-lg); padding: 14px;
            border: 1px solid #e2e8f0; box-shadow: var(--shadow-sm); cursor: pointer;
            display: flex; gap: 14px; align-items: center;
          ">
            <div style="width: 72px; height: 62px; background: #fee2e2; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 28px;">🚨</div>
            <div style="flex: 1;">
              <h4 style="margin: 0 0 4px 0; font-size: 13.5px; font-weight: 800; color: var(--text-primary);">${t('game_evac_title')}</h4>
              <p style="margin: 0 0 6px 0; font-size: 11.5px; color: var(--text-secondary); line-height: 1.35;">${t('game_evac_sub')}</p>
              <span style="font-size: 11px; font-weight: 700; color: #ef4444;">${t('play_now')} →</span>
            </div>
          </div>

          <!-- 4. Machinery Safety & LOTO -->
          <div class="game-item-card" data-game="loto" style="
            background: #ffffff; border-radius: var(--radius-lg); padding: 14px;
            border: 1px solid #e2e8f0; box-shadow: var(--shadow-sm); cursor: pointer;
            display: flex; gap: 14px; align-items: center;
          ">
            <img src="/assets/images/hazard_electrical_substation.png" alt="LOTO" style="width: 72px; height: 62px; object-fit: cover; border-radius: 10px;" />
            <div style="flex: 1;">
              <h4 style="margin: 0 0 4px 0; font-size: 13.5px; font-weight: 800; color: var(--text-primary);">${t('game_loto_title')}</h4>
              <p style="margin: 0 0 6px 0; font-size: 11.5px; color: var(--text-secondary); line-height: 1.35;">${t('game_loto_sub')}</p>
              <span style="font-size: 11px; font-weight: 700; color: #16a34a;">${t('play_now')} →</span>
            </div>
          </div>

          <!-- 5. Gas Testing & Response -->
          <div class="game-item-card" data-game="gas" style="
            background: #ffffff; border-radius: var(--radius-lg); padding: 14px;
            border: 1px solid #e2e8f0; box-shadow: var(--shadow-sm); cursor: pointer;
            display: flex; gap: 14px; align-items: center;
          ">
            <div style="width: 72px; height: 62px; background: #fef3c7; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 28px;">💨</div>
            <div style="flex: 1;">
              <h4 style="margin: 0 0 4px 0; font-size: 13.5px; font-weight: 800; color: var(--text-primary);">${t('game_gas_title')}</h4>
              <p style="margin: 0 0 6px 0; font-size: 11.5px; color: var(--text-secondary); line-height: 1.35;">${t('game_gas_sub')}</p>
              <span style="font-size: 11px; font-weight: 700; color: #d97706;">${t('play_now')} →</span>
            </div>
          </div>

          <!-- 6. Roof Sounding & Support -->
          <div class="game-item-card" data-game="roof" style="
            background: #ffffff; border-radius: var(--radius-lg); padding: 14px;
            border: 1px solid #e2e8f0; box-shadow: var(--shadow-sm); cursor: pointer;
            display: flex; gap: 14px; align-items: center;
          ">
            <img src="/assets/images/hazard_roof_spalling.png" alt="Roof Sounding" style="width: 72px; height: 62px; object-fit: cover; border-radius: 10px;" />
            <div style="flex: 1;">
              <h4 style="margin: 0 0 4px 0; font-size: 13.5px; font-weight: 800; color: var(--text-primary);">${t('game_roof_title')}</h4>
              <p style="margin: 0 0 6px 0; font-size: 11.5px; color: var(--text-secondary); line-height: 1.35;">${t('game_roof_sub')}</p>
              <span style="font-size: 11px; font-weight: 700; color: #475569;">${t('play_now')} →</span>
            </div>
          </div>

          <!-- 7. Rapid Safety Quiz -->
          <div class="game-item-card" data-game="quiz" style="
            background: #ffffff; border-radius: var(--radius-lg); padding: 14px;
            border: 1px solid #e2e8f0; box-shadow: var(--shadow-sm); cursor: pointer;
            display: flex; gap: 14px; align-items: center;
          ">
            <div style="width: 72px; height: 62px; background: #ede9fe; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 28px;">⚡</div>
            <div style="flex: 1;">
              <h4 style="margin: 0 0 4px 0; font-size: 13.5px; font-weight: 800; color: var(--text-primary);">${t('game_quiz_title')}</h4>
              <p style="margin: 0 0 6px 0; font-size: 11.5px; color: var(--text-secondary); line-height: 1.35;">${t('game_quiz_sub')}</p>
              <span style="font-size: 11px; font-weight: 700; color: #7c3aed;">${t('play_now')} →</span>
            </div>
          </div>
        </div>
      </div>
    `;

    container.querySelector('#btn-games-back-home')?.addEventListener('click', () => {
      window.location.hash = '#home';
    });

    container.querySelectorAll('.game-item-card').forEach(card => {
      card.addEventListener('click', () => {
        const game = card.getAttribute('data-game');
        launchGame(game);
      });
    });
  }

  function launchGame(game) {
    if (game === 'hazard_hunt') runHazardHuntGame();
    else if (game === 'ppe') runPPESelectionGame();
    else if (game === 'evac') runEvacDecisionGame();
    else if (game === 'loto') runLOTOGame();
    else if (game === 'gas') runGasResponseGame();
    else if (game === 'roof') runRoofSoundingGame();
    else if (game === 'quiz') runSafetyQuizGame();
  }

  // --- GAME 1: HAZARD HUNT (Real Photos) ---
  function runHazardHuntGame() {
    let scenIdx = 0;
    const scen = REALISTIC_SCENARIOS[scenIdx];
    let found = [];
    let scoreXP = 0;
    let timer = scen.timeLimit;
    let timerId = null;

    function renderHuntUI() {
      const currentScenario = REALISTIC_SCENARIOS[scenIdx];
      const lang = getLanguage();

      container.innerHTML = `
        <div style="padding-top: 4px;">
          <!-- Header -->
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <button id="btn-hunt-back" class="btn-secondary" style="padding: 5px 12px; border-radius: 9999px;">
              ← ${t('back')}
            </button>
            <div style="display: flex; gap: 8px;">
              <span class="hud-timer-badge" id="hunt-timer">00:${String(timer).padStart(2, '0')}</span>
              <span class="hud-score-chip" id="hunt-score">+${scoreXP} XP</span>
            </div>
          </div>

          <!-- Scenario Card -->
          <div style="background: #ffffff; border-radius: var(--radius-lg); padding: 14px; border: 1px solid #e2e8f0; margin-bottom: 12px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <h3 style="margin: 0; font-size: 14px; font-weight: 800; color: var(--text-primary);">
                ${currentScenario.defaultName}
              </h3>
              <span style="font-size: 11px; font-weight: 700; color: #0284c7;">${currentScenario.location}</span>
            </div>
            <p style="margin: 0; font-size: 11.5px; color: var(--text-secondary);">
              ${t('hazard_hunt_desc')}
            </p>
          </div>

          <!-- Photo Viewport with Interactive Targets -->
          <div style="position: relative; border-radius: var(--radius-lg); overflow: hidden; border: 2px solid #334155; background: #0b1320;">
            <img id="hunt-img" src="${currentScenario.image}" alt="Mine Hazard" style="width: 100%; height: auto; display: block;" />

            <!-- Interactive Clickable Target Hotspots -->
            ${currentScenario.hazards.map(h => {
              const isFound = found.includes(h.id);
              return `
                <div class="hunt-target-box" data-id="${h.id}" style="
                  position: absolute;
                  left: ${h.x}%;
                  top: ${h.y}%;
                  transform: translate(-50%, -50%);
                  width: ${h.radius * 1.5}px;
                  height: ${h.radius * 1.5}px;
                  border: 2px dashed ${isFound ? '#10b981' : '#f59e0b'};
                  background: ${isFound ? 'rgba(16, 185, 129, 0.35)' : 'rgba(245, 158, 11, 0.15)'};
                  border-radius: 50%;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  cursor: pointer;
                  transition: all 0.2s;
                ">
                  <span style="font-size: 18px;">${isFound ? '✓' : '⚠️'}</span>
                </div>
              `;
            }).join('')}
          </div>

          <!-- Action Feedback Deck -->
          <div id="hunt-feedback" style="
            margin-top: 12px; background: #ffffff; border-radius: var(--radius-md);
            padding: 12px; border: 1px solid #cbd5e1; font-size: 12px; min-height: 48px;
            display: flex; align-items: center; justify-content: space-between;
          ">
            <span id="hunt-feedback-text" style="color: var(--text-secondary);">
              ${t('select_hazard_prompt')}
            </span>
            <span id="hunt-progress-text" style="font-weight: 700; color: #0284c7;">
              ${found.length} / ${currentScenario.hazards.length}
            </span>
          </div>
        </div>
      `;

      container.querySelector('#btn-hunt-back')?.addEventListener('click', () => {
        clearInterval(timerId);
        renderHub();
      });

      container.querySelectorAll('.hunt-target-box').forEach(el => {
        el.addEventListener('click', () => {
          const hId = el.getAttribute('data-id');
          if (found.includes(hId)) return;

          found.push(hId);
          const hazard = currentScenario.hazards.find(h => h.id === hId);
          scoreXP += hazard.xp;
          playSuccessChime();

          const nameStr = lang === 'hi' ? hazard.nameHi : (lang === 'sat' ? hazard.nameSat : hazard.name);
          const actionStr = lang === 'hi' ? hazard.actionHi : (lang === 'sat' ? hazard.actionSat : hazard.action);

          speak(actionStr);
          renderHuntUI();

          const feedbackEl = container.querySelector('#hunt-feedback-text');
          if (feedbackEl) {
            feedbackEl.innerHTML = `<strong>✓ ${nameStr}:</strong> ${actionStr}`;
          }

          if (found.length === currentScenario.hazards.length) {
            clearInterval(timerId);
            setTimeout(() => {
              showCompletionModal(t('game_hazard_hunt_title'), scoreXP, 100);
            }, 700);
          }
        });
      });
    }

    renderHuntUI();

    timerId = setInterval(() => {
      timer--;
      const timerEl = container.querySelector('#hunt-timer');
      if (timerEl) timerEl.textContent = `00:${String(timer).padStart(2, '0')}`;
      if (timer <= 0) {
        clearInterval(timerId);
        showCompletionModal(t('game_hazard_hunt_title'), scoreXP, Math.round((found.length / scen.hazards.length) * 100));
      }
    }, 1000);
  }

  // --- GAME 2: PPE & GEAR SELECTION ---
  function runPPESelectionGame() {
    const ppeItems = [
      { id: "helmet", name: "Mining Helmet with Cap Lamp", nameHi: "माइनिंग हेलमेट व कैप लैंप", nameSat: "ᱦᱮᱞᱢᱮᱴ ᱟᱨ ᱵᱟᱹᱛᱤ", icon: "⛑️", mandatory: true },
      { id: "fsr", name: "Filter Self-Rescuer (FSR)", nameHi: "फिल्टर सेल्फ-रेस्क्युअर (FSR)", nameSat: "ᱥᱮᱞᱯᱷ-ᱨᱮᱥᱠᱤᱣᱚᱨ", icon: "🤿", mandatory: true },
      { id: "boots", name: "Steel-Toe Safety Boots", nameHi: "स्टील-टो सुरक्षा जूते", nameSat: "ᱨᱩᱠᱷᱤᱭᱟᱹ ᱡᱩᱛᱟᱹ", icon: "🥾", mandatory: true },
      { id: "mask", name: "Dust Respirator Mask", nameHi: "धूल मास्क (Respirator)", nameSat: "ᱫᱷᱩᱲᱤ ᱢᱟᱥᱠ", icon: "😷", mandatory: true },
      { id: "gloves", name: "Insulated Leather Gloves", nameHi: "इंसुलेटेड सुरक्षा दस्ताने", nameSat: "ᱛᱤ ᱢᱳᱡᱟ", icon: "🧤", mandatory: true },
      { id: "methanometer", name: "Digital Multi-Gas Detector", nameHi: "डिजिटल गैस डिटेक्टर", nameSat: "ᱜᱮᱥ ᱰᱤᱴᱮᱠᱴᱚᱨ", icon: "📟", mandatory: true },
      { id: "sandals", name: "Rubber Flip-Flops", nameHi: "रबर चप्पल", nameSat: "ᱪᱚᱴᱯᱚᱴ ᱪᱚᱯᱚᱞ", icon: "🩴", mandatory: false },
      { id: "earphones", name: "Mobile Phone Earphones", nameHi: "ईयरफोन (निषिद्ध)", nameSat: "ᱤᱭᱟᱨᱯᱷᱳᱱ", icon: "🎧", mandatory: false }
    ];

    let selected = [];
    const lang = getLanguage();

    function renderPPE() {
      container.innerHTML = `
        <div style="padding-top: 4px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
            <button id="btn-ppe-back" class="btn-secondary" style="padding: 5px 12px; border-radius: 9999px;">
              ← ${t('back')}
            </button>
            <h3 style="margin: 0; font-size: 15px; font-weight: 800; color: var(--text-primary);">
              ${t('game_ppe_title')}
            </h3>
          </div>

          <div style="background: #ffffff; border-radius: var(--radius-lg); padding: 14px; border: 1px solid #e2e8f0; margin-bottom: 14px;">
            <p style="margin: 0; font-size: 12px; color: var(--text-secondary); line-height: 1.4;">
              ${t('game_ppe_sub')}
            </p>
          </div>

          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 16px;">
            ${ppeItems.map(item => {
              const isSel = selected.includes(item.id);
              const title = lang === 'hi' ? item.nameHi : (lang === 'sat' ? item.nameSat : item.name);
              return `
                <div class="ppe-card" data-id="${item.id}" style="
                  background: ${isSel ? '#e0f2fe' : '#ffffff'};
                  border: 2px solid ${isSel ? '#0284c7' : '#e2e8f0'};
                  border-radius: 12px;
                  padding: 12px;
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  text-align: center;
                  cursor: pointer;
                  transition: all 0.2s;
                ">
                  <span style="font-size: 32px; margin-bottom: 6px;">${item.icon}</span>
                  <span style="font-size: 12px; font-weight: 700; color: var(--text-primary);">${title}</span>
                  <span style="font-size: 10px; margin-top: 4px; font-weight: 800; color: ${isSel ? '#0284c7' : '#94a3b8'};">
                    ${isSel ? '✓ EQUIPPED' : '+ SELECT'}
                  </span>
                </div>
              `;
            }).join('')}
          </div>

          <button id="btn-submit-ppe" class="btn-primary" style="width: 100%; padding: 13px; font-size: 14px;">
            ${t('submit')}
          </button>
        </div>
      `;

      container.querySelector('#btn-ppe-back')?.addEventListener('click', renderHub);

      container.querySelectorAll('.ppe-card').forEach(c => {
        c.addEventListener('click', () => {
          const id = c.getAttribute('data-id');
          if (selected.includes(id)) {
            selected = selected.filter(x => x !== id);
          } else {
            selected.push(id);
          }
          renderPPE();
        });
      });

      container.querySelector('#btn-submit-ppe')?.addEventListener('click', () => {
        const correctMandatory = ppeItems.filter(p => p.mandatory).map(p => p.id);
        const wrongItems = selected.filter(id => !ppeItems.find(p => p.id === id).mandatory);
        const missedItems = correctMandatory.filter(id => !selected.includes(id));

        if (wrongItems.length === 0 && missedItems.length === 0) {
          playSuccessChime();
          speak("All mandatory personal protective equipment correctly equipped.");
          showCompletionModal(t('game_ppe_title'), 100, 100);
        } else {
          playPenaltyBuzz();
          speak("Incorrect gear selection. Remove prohibited items and equip all mandatory safety gear.");
          alert(lang === 'hi' ? "गलत गियर चयन! कृपया गैर-कानूनी आइटम हटाएं और सभी अनिवार्य उपकरण पहनें।" : (lang === 'sat' ? "ᱵᱷᱩᱞ ᱥᱟᱯᱟᱵ ᱵᱟᱪᱷᱟᱣ! ᱢᱟᱱᱟ ᱟᱠᱟᱱ ᱥᱟᱯᱟᱵ ᱥᱟᱦᱟᱭ ᱢᱮ ᱟᱨ ᱨᱩᱠᱷᱤᱭᱟᱹ ᱥᱟᱯᱟᱵ ᱦᱚᱨᱚᱜ ᱢᱮ᱾" : "Check your gear! Remove prohibited items and equip all mandatory safety equipment."));
        }
      });
    }

    renderPPE();
  }

  // --- GAME 3: EMERGENCY EVACUATION DECISION ---
  function runEvacDecisionGame() {
    let step = 0;
    const lang = getLanguage();
    const steps = [
      {
        title: "Smoke Sighted in Heading",
        desc: "Thick combustion smoke detected flowing along trunk conveyor road.",
        q: "What is your immediate first action?",
        options: [
          { text: "Don Filter Self-Rescuer (FSR) immediately within 30 seconds", correct: true },
          { text: "Run toward return airway without respirator", correct: false }
        ],
        hint: "Always don self-rescuer before taking any other evacuation steps."
      },
      {
        title: "Airway Selection",
        desc: "You have donned your FSR. Two airways lead towards the pit bottom.",
        q: "Which evacuation route must you follow?",
        options: [
          { text: "Follow intake airway against fresh airflow (Upwind)", correct: true },
          { text: "Follow return airway in direction of toxic smoke (Downwind)", correct: false }
        ],
        hint: "Intake airway delivers fresh air and carries carbon monoxide away."
      },
      {
        title: "Path Obstruction Encountered",
        desc: "A heavy canvas ventilation brattice is torn, and dense smoke blocks egress.",
        q: "What is your safe survival procedure?",
        options: [
          { text: "Follow the statutory lifeline wire to the nearest Refuge Bay", correct: true },
          { text: "Remove FSR mask to shout for assistance", correct: false }
        ],
        hint: "Lifelines with directional cones lead directly to sealed refuge chambers."
      }
    ];

    function renderEvacStep() {
      const cur = steps[step];
      container.innerHTML = `
        <div style="padding-top: 4px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <button id="btn-evac-back" class="btn-secondary" style="padding: 5px 12px; border-radius: 9999px;">
              ← ${t('back')}
            </button>
            <span style="font-size: 11px; font-weight: 700; color: #ef4444; background: #fee2e2; padding: 4px 10px; border-radius: 9999px;">
              Step ${step + 1} / ${steps.length}
            </span>
          </div>

          <div style="position: relative; border-radius: var(--radius-lg); overflow: hidden; margin-bottom: 14px;">
            <img src="/assets/images/hazard_conveyor_fire.png" alt="Evacuation" style="width: 100%; height: 160px; object-fit: cover; filter: brightness(0.65);" />
            <div style="position: absolute; inset: 0; display: flex; flex-direction: column; justify-content: flex-end; padding: 14px; background: linear-gradient(to top, rgba(0,0,0,0.85), transparent);">
              <h3 style="margin: 0 0 4px 0; color: #ffffff; font-size: 15px; font-weight: 800;">${cur.title}</h3>
              <p style="margin: 0; color: #cbd5e1; font-size: 11.5px;">${cur.desc}</p>
            </div>
          </div>

          <div style="background: #ffffff; border-radius: var(--radius-lg); padding: 14px; border: 1px solid #e2e8f0; margin-bottom: 14px;">
            <h4 style="margin: 0 0 10px 0; font-size: 13px; font-weight: 800; color: var(--text-primary);">${cur.q}</h4>
            <div style="display: flex; flex-direction: column; gap: 8px;">
              ${cur.options.map((opt, idx) => `
                <button class="evac-opt-btn" data-correct="${opt.correct}" style="
                  background: #f8fafc; border: 1.5px solid #cbd5e1; border-radius: 8px;
                  padding: 12px; font-size: 12px; font-weight: 700; color: var(--text-primary);
                  text-align: left; cursor: pointer; transition: all 0.2s;
                ">
                  ${opt.text}
                </button>
              `).join('')}
            </div>
          </div>
        </div>
      `;

      container.querySelector('#btn-evac-back')?.addEventListener('click', renderHub);

      container.querySelectorAll('.evac-opt-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const isCorr = btn.getAttribute('data-correct') === 'true';
          if (isCorr) {
            playSuccessChime();
            speak(t('buddy_safe_feedback'));
            step++;
            if (step >= steps.length) {
              showCompletionModal(t('game_evac_title'), 90, 100);
            } else {
              renderEvacStep();
            }
          } else {
            playPenaltyBuzz();
            speak(cur.hint);
            alert(cur.hint);
          }
        });
      });
    }

    renderEvacStep();
  }

  // --- GAME 4: MACHINERY SAFETY & LOTO ---
  function runLOTOGame() {
    let phase = 0;
    const lotoTasks = [
      {
        title: "Step 1: Nip-Point Hazard Identification",
        action: "Identify missing mesh guard around conveyor drive head-pulley.",
        btn: "🚨 Spot Unguarded Pulley & Sound Stop Signal"
      },
      {
        title: "Step 2: Emergency Pull-Cord Trip",
        action: "Activate the safety pull-cord wire along conveyor length.",
        btn: "⏹️ Pull Emergency Conveyor Cord"
      },
      {
        title: "Step 3: Lock-Out / Tag-Out (LOTO) Breaker",
        action: "Padlock the gate-end box isolating circuit breaker switch.",
        btn: "🔒 Apply Padlock & Danger Safety Tag"
      }
    ];

    function renderLOTO() {
      const cur = lotoTasks[phase];
      container.innerHTML = `
        <div style="padding-top: 4px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <button id="btn-loto-back" class="btn-secondary" style="padding: 5px 12px; border-radius: 9999px;">
              ← ${t('back')}
            </button>
            <h3 style="margin: 0; font-size: 14px; font-weight: 800; color: var(--text-primary);">
              ${t('game_loto_title')}
            </h3>
          </div>

          <div style="position: relative; border-radius: var(--radius-lg); overflow: hidden; margin-bottom: 14px;">
            <img src="/assets/images/hazard_electrical_substation.png" alt="Electrical LOTO" style="width: 100%; height: 160px; object-fit: cover;" />
          </div>

          <div style="background: #ffffff; border-radius: var(--radius-lg); padding: 16px; border: 1px solid #e2e8f0; margin-bottom: 14px;">
            <h4 style="margin: 0 0 6px 0; font-size: 14px; font-weight: 800; color: var(--text-primary);">${cur.title}</h4>
            <p style="margin: 0 0 16px 0; font-size: 12px; color: var(--text-secondary);">${cur.action}</p>
            <button id="btn-do-loto-step" class="btn-primary" style="width: 100%; padding: 12px; font-size: 13px;">
              ${cur.btn}
            </button>
          </div>
        </div>
      `;

      container.querySelector('#btn-loto-back')?.addEventListener('click', renderHub);

      container.querySelector('#btn-do-loto-step')?.addEventListener('click', () => {
        playSuccessChime();
        phase++;
        if (phase >= lotoTasks.length) {
          speak("Conveyor motor isolated and LOTO padlock secured successfully.");
          showCompletionModal(t('game_loto_title'), 85, 100);
        } else {
          renderLOTO();
        }
      });
    }

    renderLOTO();
  }

  // --- GAME 5: GAS TESTING & CONFINED SPACE ---
  function runGasResponseGame() {
    container.innerHTML = `
      <div style="padding-top: 4px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <button id="btn-gas-back" class="btn-secondary" style="padding: 5px 12px; border-radius: 9999px;">
            ← ${t('back')}
          </button>
          <h3 style="margin: 0; font-size: 14px; font-weight: 800; color: var(--text-primary);">
            ${t('game_gas_title')}
          </h3>
        </div>

        <!-- Digital Multi-Gas Detector Reading -->
        <div style="
          background: #020617; border: 3px solid #334155; border-radius: var(--radius-xl);
          padding: 18px; margin-bottom: 14px; text-align: center; color: #38bdf8;
        ">
          <span style="font-size: 11px; font-weight: 800; color: #94a3b8; text-transform: uppercase;">Digital Gas Analyzer Reading</span>
          <div style="display: flex; justify-content: space-around; margin: 14px 0;">
            <div>
              <div style="font-size: 24px; font-weight: 900; color: #ef4444; font-family: monospace;">1.45%</div>
              <div style="font-size: 11px; color: #94a3b8;">CH4 (Methane)</div>
            </div>
            <div>
              <div style="font-size: 24px; font-weight: 900; color: #f59e0b; font-family: monospace;">58 ppm</div>
              <div style="font-size: 11px; color: #94a3b8;">CO (Carbon Monoxide)</div>
            </div>
            <div>
              <div style="font-size: 24px; font-weight: 900; color: #10b981; font-family: monospace;">18.5%</div>
              <div style="font-size: 11px; color: #94a3b8;">O2 (Oxygen)</div>
            </div>
          </div>
          <span style="background: rgba(239, 68, 68, 0.2); border: 1px solid #ef4444; color: #fca5a5; padding: 4px 12px; border-radius: 9999px; font-size: 11px; font-weight: 800;">
            ⚠️ CMR 153 LIMIT EXCEEDED (CH4 > 1.25%)
          </span>
        </div>

        <div style="background: #ffffff; border-radius: var(--radius-lg); padding: 14px; border: 1px solid #e2e8f0; margin-bottom: 14px;">
          <h4 style="margin: 0 0 10px 0; font-size: 13px; font-weight: 800; color: var(--text-primary);">
            Under CMR 2017 regulations, what is the mandatory immediate action?
          </h4>
          <div style="display: flex; flex-direction: column; gap: 8px;">
            <button class="gas-choice-btn" data-correct="true" style="
              background: #f8fafc; border: 1.5px solid #cbd5e1; border-radius: 8px;
              padding: 12px; font-size: 12px; font-weight: 700; color: var(--text-primary);
              text-align: left; cursor: pointer;
            ">
              A. Cut electrical power immediately and withdraw all miners to fresh air
            </button>
            <button class="gas-choice-btn" data-correct="false" style="
              background: #f8fafc; border: 1.5px solid #cbd5e1; border-radius: 8px;
              padding: 12px; font-size: 12px; font-weight: 700; color: var(--text-primary);
              text-align: left; cursor: pointer;
            ">
              B. Continue coal extraction and increase auxiliary fan speed
            </button>
            <button class="gas-choice-btn" data-correct="false" style="
              background: #f8fafc; border: 1.5px solid #cbd5e1; border-radius: 8px;
              padding: 12px; font-size: 12px; font-weight: 700; color: var(--text-primary);
              text-align: left; cursor: pointer;
            ">
              C. Use water spray to absorb the methane gas accumulation
            </button>
          </div>
        </div>
      </div>
    `;

    container.querySelector('#btn-gas-back')?.addEventListener('click', renderHub);

    container.querySelectorAll('.gas-choice-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const isCorr = btn.getAttribute('data-correct') === 'true';
        if (isCorr) {
          playSuccessChime();
          speak("Correct. Under CMR 153, power must be disconnected and heading evacuated when inflammable gas exceeds one point two five percent.");
          showCompletionModal(t('game_gas_title'), 90, 100);
        } else {
          playPenaltyBuzz();
          speak("Incorrect. Methane gas above 1.25% requires immediate electrical power cut-off and miner withdrawal.");
          alert("Incorrect: Methane above 1.25% requires immediate power cut-off & evacuation under CMR 153.");
        }
      });
    });
  }

  // --- GAME 6: ROOF SOUNDING & STRATA SUPPORT ---
  function runRoofSoundingGame() {
    let testDone = false;

    container.innerHTML = `
      <div style="padding-top: 4px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <button id="btn-roof-back" class="btn-secondary" style="padding: 5px 12px; border-radius: 9999px;">
            ← ${t('back')}
          </button>
          <h3 style="margin: 0; font-size: 14px; font-weight: 800; color: var(--text-primary);">
            ${t('game_roof_title')}
          </h3>
        </div>

        <div style="position: relative; border-radius: var(--radius-lg); overflow: hidden; margin-bottom: 14px;">
          <img src="/assets/images/hazard_roof_spalling.png" alt="Roof Strata" style="width: 100%; height: 160px; object-fit: cover;" />
        </div>

        <div style="background: #ffffff; border-radius: var(--radius-lg); padding: 14px; border: 1px solid #e2e8f0; margin-bottom: 14px;">
          <h4 style="margin: 0 0 6px 0; font-size: 13.5px; font-weight: 800; color: var(--text-primary);">
            Roof Sounding & Vibration Inspection
          </h4>
          <p style="margin: 0 0 12px 0; font-size: 12px; color: var(--text-secondary);">
            Tap the roof rock with testing stick while holding fingers against strata to detect hollow drummy vibration.
          </p>
          <button id="btn-sound-roof" class="btn-primary" style="width: 100%; padding: 12px; font-size: 13px; margin-bottom: 10px;">
            🥢 Tap Strata with Sounding Stick
          </button>
          <div id="roof-sound-result" style="display: none; padding: 10px; border-radius: 8px; background: #fef2f2; border: 1px solid #fecaca; color: #991b1b; font-size: 12px; font-weight: 700;">
            ⚠️ Dull, hollow 'drummy' vibration detected! Bed separation in progress.
          </div>
        </div>

        <div id="prop-install-box" style="display: none; background: #ffffff; border-radius: var(--radius-lg); padding: 14px; border: 1px solid #e2e8f0;">
          <button id="btn-set-prop" class="btn-primary" style="width: 100%; padding: 12px; font-size: 13px; background: #16a34a;">
            🪵 Set Hydraulic Prop & Lid Support Under SSR
          </button>
        </div>
      </div>
    `;

    container.querySelector('#btn-roof-back')?.addEventListener('click', renderHub);

    container.querySelector('#btn-sound-roof')?.addEventListener('click', () => {
      playPenaltyBuzz();
      container.querySelector('#roof-sound-result').style.display = 'block';
      container.querySelector('#prop-install-box').style.display = 'block';
      speak("Dull drummy vibration detected. Set hydraulic prop and wooden lid immediately under Systematic Support Rules.");
      testDone = true;
    });

    container.querySelector('#btn-set-prop')?.addEventListener('click', () => {
      playSuccessChime();
      speak("Hydraulic prop erected and secured with wooden lid.");
      showCompletionModal(t('game_roof_title'), 95, 100);
    });
  }

  // --- GAME 7: RAPID SAFETY QUIZ ---
  function runSafetyQuizGame() {
    let qIdx = 0;
    let quizScore = 0;
    const lang = getLanguage();

    const questions = [
      {
        q: "What type of extinguisher is safe on motorized electric belt drives?",
        options: [
          { text: "Dry Chemical Powder (DCP)", correct: true },
          { text: "Water Hose Jet", correct: false }
        ]
      },
      {
        q: "When approaching a fire underground, what is the correct approach?",
        options: [
          { text: "Upwind (From intake fresh air)", correct: true },
          { text: "Downwind (From return smoke)", correct: false }
        ]
      },
      {
        q: "Under CMR 2017, what is the maximum permissible methane in general body?",
        options: [
          { text: "0.75%", correct: true },
          { text: "3.50%", correct: false }
        ]
      }
    ];

    function renderQuiz() {
      const cur = questions[qIdx];
      container.innerHTML = `
        <div style="padding-top: 4px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <button id="btn-quiz-back" class="btn-secondary" style="padding: 5px 12px; border-radius: 9999px;">
              ← ${t('back')}
            </button>
            <span style="font-size: 11px; font-weight: 700; color: #7c3aed; background: #ede9fe; padding: 4px 10px; border-radius: 9999px;">
              Q ${qIdx + 1} / ${questions.length}
            </span>
          </div>

          <div style="background: #ffffff; border-radius: var(--radius-lg); padding: 16px; border: 1px solid #e2e8f0; margin-bottom: 14px;">
            <h4 style="margin: 0 0 14px 0; font-size: 14px; font-weight: 800; color: var(--text-primary);">${cur.q}</h4>
            <div style="display: flex; flex-direction: column; gap: 10px;">
              ${cur.options.map(opt => `
                <button class="quiz-btn" data-correct="${opt.correct}" style="
                  background: #f8fafc; border: 1.5px solid #cbd5e1; border-radius: 8px;
                  padding: 12px; font-size: 12.5px; font-weight: 700; color: var(--text-primary);
                  text-align: left; cursor: pointer;
                ">
                  ${opt.text}
                </button>
              `).join('')}
            </div>
          </div>
        </div>
      `;

      container.querySelector('#btn-quiz-back')?.addEventListener('click', renderHub);

      container.querySelectorAll('.quiz-btn').forEach(b => {
        b.addEventListener('click', () => {
          const isCorr = b.getAttribute('data-correct') === 'true';
          if (isCorr) {
            quizScore += 30;
            playSuccessChime();
          } else {
            playPenaltyBuzz();
          }

          qIdx++;
          if (qIdx >= questions.length) {
            showCompletionModal(t('game_quiz_title'), quizScore, Math.round((quizScore / 90) * 100));
          } else {
            renderQuiz();
          }
        });
      });
    }

    renderQuiz();
  }

  // --- COMPLETION MODAL ---
  function showCompletionModal(title, xp, acc) {
    // Record game attempt locally & to backend
    fetch(`/api/v1/trainees/${traineeId}/games/attempt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        trainee_id: traineeId,
        game_id: "game_vocational_" + Date.now(),
        score_pct: acc,
        time_taken_sec: 25,
        hazards_found: 3,
        total_hazards: 3,
        mistakes_count: acc === 100 ? 0 : 1,
        xp_earned: xp
      })
    }).catch(() => {});

    // Update worker XP locally
    if (state.worker) {
      state.worker.xp = (state.worker.xp || 0) + xp;
    }

    const modal = document.createElement('div');
    modal.className = 'modal-overlay open';
    modal.innerHTML = `
      <div class="modal-sheet" style="text-align: center; padding: 24px;">
        <span style="font-size: 48px; display: block; margin-bottom: 10px;">🏆</span>
        <h3 style="margin: 0 0 6px 0; font-size: 18px; font-weight: 900; color: var(--text-primary);">
          ${t('game_completed')}
        </h3>
        <p style="margin: 0 0 16px 0; font-size: 13px; color: var(--text-secondary);">
          ${title} • ${t('congratulations')}
        </p>

        <div style="display: flex; justify-content: space-around; background: #f8fafc; border-radius: 12px; padding: 12px; margin-bottom: 18px;">
          <div>
            <div style="font-size: 20px; font-weight: 800; color: #10b981;">+${xp}</div>
            <div style="font-size: 11px; color: #94a3b8;">${t('xp_earned')}</div>
          </div>
          <div>
            <div style="font-size: 20px; font-weight: 800; color: #0284c7;">${acc}%</div>
            <div style="font-size: 11px; color: #94a3b8;">${t('accuracy')}</div>
          </div>
        </div>

        <button id="btn-finish-game-modal" class="btn-primary" style="width: 100%; padding: 12px; font-size: 14px;">
          ${t('all_games')}
        </button>
      </div>
    `;

    document.body.appendChild(modal);

    modal.querySelector('#btn-finish-game-modal')?.addEventListener('click', () => {
      modal.remove();
      renderHub();
    });
  }

  // Render Hub initially
  renderHub();
}
