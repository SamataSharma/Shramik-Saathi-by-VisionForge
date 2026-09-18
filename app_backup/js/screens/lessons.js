// Safety Lessons Screen: Full Video-Based Vocational Training with Segmented Parts, Custom Player & Persistent History

import { speak, playSuccessChime, playPenaltyBuzz } from '../voice.js';

const LESSON_PARTS = [
  {
    id: "part_1",
    partNumber: 1,
    title: "Introduction to Mine Fire & Coal Heating",
    videoUrl: "/assets/videos/fire_safety_part1.mp4",
    durationStr: "03:20",
    durationSec: 200,
    startTimeSec: 0,
    summary: "Safety training explaining underground coal mine fire hazards, spontaneous combustion chemistry, and emergency response activation.",
    keyPoints: [
      "Coal fines absorb atmospheric oxygen leading to exothermic reaction",
      "Early heating detection prevents catastrophic seam fires",
      "DGMS CMR Regulation 136 mandates continuous carbon monoxide monitoring",
      "Immediate alarm sounding before attempting manual suppression"
    ],
    question: "What is the earliest sensory indicator of spontaneous coal combustion underground?",
    options: [
      { text: "Roaring open flames on the belt", correct: false, reason: "By the time open flames appear, combustion is dangerously advanced." },
      { text: "Sweet paraffin-like 'fire stink' odor & localized haze", correct: true, reason: "Correct! The low-temperature oxidation of coal volatiles emits a distinct paraffin odor first." },
      { text: "Sudden roof collapse", correct: false, reason: "Roof collapse is a geomechanical hazard, not an early fire sign." }
    ]
  },
  {
    id: "part_2",
    partNumber: 2,
    title: "Recognizing Fire & Smoke Dynamics",
    videoUrl: "/assets/videos/fire_safety_part1.mp4",
    durationStr: "02:45",
    durationSec: 165,
    startTimeSec: 35,
    summary: "Understand mine ventilation dynamics, smoke spread velocities, and the lethal hazard of Carbon Monoxide (CO) in return airways.",
    keyPoints: [
      "Always approach fires with fresh intake ventilation at your back",
      "Never advance from the return airway where toxic CO accumulates",
      "Carbon monoxide at 0.1% (1000 ppm) causes unconsciousness in 30 minutes",
      "Deploy 60-minute SCSR respiratory protection immediately upon smoke contact"
    ],
    question: "If a fire occurs in a trunk conveyor gallery, where MUST the firefighting team position themselves?",
    options: [
      { text: "In the Return Airway downwind of the smoke", correct: false, reason: "Fatal mistake: Return air contains lethal Carbon Monoxide (CO)." },
      { text: "In the Intake Airway with fresh air traveling past them toward the fire", correct: true, reason: "Correct! Fresh intake airflow blows heat, smoke, and toxic gases away from workers." },
      { text: "Directly underneath the burning belt drive", correct: false, reason: "Falling burning rubber creates extreme burn and entrapment hazards." }
    ]
  },
  {
    id: "part_3",
    partNumber: 3,
    title: "Fire Extinguisher Selection & Inspection",
    videoUrl: "/assets/videos/fire_safety_part2.mp4",
    durationStr: "03:50",
    durationSec: 230,
    startTimeSec: 0,
    summary: "Inspection and operational selection of certified Dry Chemical Powder (DCP - IS 2171) cylinders for energized electrical conveyor drives.",
    keyPoints: [
      "Use Dry Chemical Powder (DCP) on electrical conveyor drive motors",
      "Never direct high-pressure solid water streams onto dry coal dust (dust explosion risk)",
      "Verify pressure gauge needle is resting firmly inside the operational GREEN zone",
      "Check tamper seal and discharge hose for obstructions prior to approach"
    ],
    question: "Which fire extinguishing media must be selected for an electrical conveyor belt drive fire in an underground seam?",
    options: [
      { text: "Water Extinguisher / High Pressure Jet", correct: false, reason: "Water jet risks electrical shock and violently aerates explosive coal dust." },
      { text: "Dry Chemical Powder (DCP - IS 2171)", correct: true, reason: "Correct! DCP non-conductively smothers fire without causing an electrical conduction hazard." },
      { text: "Sand bucket alone", correct: false, reason: "Sand is insufficient for running rubber belt friction." }
    ]
  },
  {
    id: "part_4",
    partNumber: 4,
    title: "PASS Protocol Standard Procedure",
    videoUrl: "/assets/videos/fire_safety_part2.mp4",
    durationStr: "03:15",
    durationSec: 195,
    startTimeSec: 45,
    summary: "Master the 4-step PASS procedure: Pull safety pin, Aim at the fuel base, Squeeze operating lever, and Sweep side-to-side across the fire bed.",
    keyPoints: [
      "P - Pull the safety lock pin firmly to break inspection tamper seal",
      "A - Aim the discharge nozzle directly at the BASE of the burning fuel",
      "S - Squeeze the discharge operating lever smoothly and continuously",
      "S - Sweep the nozzle horizontally side-to-side across the coal friction bed"
    ],
    question: "Where should the extinguisher nozzle be targeted during discharge?",
    options: [
      { text: "At the top of the smoke plume", correct: false, reason: "Discharging into smoke plume wastes extinguishing agent into ventilation airflow." },
      { text: "At the very base of the burning fuel", correct: true, reason: "Correct! Smothering the fuel base cuts off oxygen and knocks down chemical combustion." },
      { text: "Upward toward mine roof bolts", correct: false, reason: "Aiming at the roof bolting has zero effect on the floor/belt fire." }
    ]
  },
  {
    id: "part_5",
    partNumber: 5,
    title: "Emergency Evacuation & Response Signaling",
    videoUrl: "/assets/videos/fire_safety_part2.mp4",
    durationStr: "02:30",
    durationSec: 150,
    startTimeSec: 10,
    summary: "Protocol for rapid face evacuation, telephonic alert to pit-head bankman, refuge chamber entry, and mine rescue brigade handoff.",
    keyPoints: [
      "If fire cannot be extinguished within 60 seconds, initiate immediate evacuation",
      "Activate shaft telephone and communicate exact seam and airway location",
      "Follow evacuation lifelines with tactile directional cones pointing to intake shaft",
      "Never open ventilation separation doors without supervisor authorization"
    ],
    question: "What is the mandatory immediate action when conveyor flame spreads beyond first-aid capability?",
    options: [
      { text: "Continue fighting fire alone until cylinder empty", correct: false, reason: "Dangerous: toxic smoke will trap the solo worker." },
      { text: "Sound evacuation alarm, withdraw upwind, and alert bankman", correct: true, reason: "Correct! Life safety takes precedence; follow statutory CMR emergency withdrawal." },
      { text: "Hide in return airway dead-end", correct: false, reason: "Fatal: deadly Carbon Monoxide accumulates in dead ends." }
    ]
  }
];

export async function renderLessonsScreen(container, state) {
  let activePartIndex = 0;
  const traineeId = state.worker?.id || 'anik01';
  let progressMap = {};
  let quizHistoryMap = {};

  // Fetch Trainee's Video Progress & Quiz History from API
  try {
    const [progResp, histResp] = await Promise.all([
      fetch(`/api/v1/trainees/${traineeId}/lessons/progress`),
      fetch(`/api/v1/trainees/${traineeId}/history`)
    ]);

    if (progResp.ok) {
      const progs = await progResp.json();
      progs.forEach(p => {
        progressMap[p.part_id] = p;
      });
    }

    if (histResp.ok) {
      const hist = await histResp.json();
      if (hist.lesson_quizzes) {
        hist.lesson_quizzes.forEach(q => {
          if (!quizHistoryMap[q.part_id]) quizHistoryMap[q.part_id] = [];
          quizHistoryMap[q.part_id].push(q);
        });
      }
    }
  } catch (e) {
    console.warn('Could not load online lesson progress, using local storage cache:', e);
  }

  function renderView() {
    const part = LESSON_PARTS[activePartIndex];
    const partProgress = progressMap[part.id] || {
      watched_pct: 0,
      last_position_sec: 0,
      is_completed: 0
    };
    const partQuizHistory = quizHistoryMap[part.id] || [];

    container.innerHTML = `
      <div style="padding-top: 6px; padding-bottom: 30px;">
        
        <!-- Header & Back Navigation -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <button id="btn-lessons-back" class="btn-secondary" style="padding: 6px 12px; border-radius: var(--radius-full); font-size: 13px;">
              ← Back
            </button>
            <div>
              <h2 style="font-size: 18px; font-weight: 800; color: var(--text-primary); margin: 0;">Safety Lessons</h2>
              <span style="font-size: 11px; color: var(--text-secondary); font-weight: 600;">Module 1: Fire & Explosion Safety</span>
            </div>
          </div>
          <span style="font-size: 11.5px; font-weight: 700; color: #0284c7; background: #e0f2fe; padding: 4px 10px; border-radius: var(--radius-full);">
            Part ${part.partNumber} of ${LESSON_PARTS.length}
          </span>
        </div>

        <!-- Segmented Training Parts Horizontal Rail -->
        <div style="margin-bottom: 16px;">
          <div style="font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase; margin-bottom: 8px; letter-spacing: 0.5px;">
            Training Parts:
          </div>
          <div style="display: flex; gap: 8px; overflow-x: auto; padding-bottom: 6px; scrollbar-width: none;">
            ${LESSON_PARTS.map((p, idx) => {
              const pProg = progressMap[p.id];
              const isDone = pProg && pProg.is_completed;
              const isCurr = idx === activePartIndex;
              return `
                <button class="part-pill ${isCurr ? 'active' : ''} ${isDone ? 'completed' : ''}" data-part-idx="${idx}" style="flex-shrink: 0;">
                  <span>${isDone ? '✅' : '▶'}</span>
                  <span>Part ${p.partNumber}</span>
                  <span style="opacity: 0.75; font-size: 10.5px;">(${p.durationStr})</span>
                </button>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Main Video Player Card -->
        <div style="background: #0f172a; border-radius: 18px; overflow: hidden; box-shadow: 0 12px 30px rgba(0,0,0,0.25); margin-bottom: 18px; border: 1px solid #1e293b;">
          
          <!-- Video Header Bar -->
          <div style="padding: 12px 16px; background: #1e293b; display: flex; justify-content: space-between; align-items: center; color: #ffffff;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="background: #f97316; color: #ffffff; font-size: 10.5px; font-weight: 800; padding: 2px 8px; border-radius: 4px;">
                PART ${part.partNumber}
              </span>
              <span style="font-size: 13px; font-weight: 700; max-width: 200px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                ${part.title}
              </span>
            </div>
            <span id="video-completion-badge" style="font-size: 11px; font-weight: 700; color: ${partProgress.is_completed ? '#10b981' : '#94a3b8'};">
              ${partProgress.is_completed ? '✅ Completed' : '⏳ In Progress'}
            </span>
          </div>

          <!-- Video Wrapper -->
          <div style="position: relative; width: 100%; background: #000000; aspect-ratio: 16/9; display: flex; align-items: center; justify-content: center;">
            <video id="training-video-player" playsinline preload="metadata" style="width: 100%; height: 100%; object-fit: contain;">
              <source src="${part.videoUrl}" type="video/mp4">
              Your browser does not support HTML5 video.
            </video>

            <!-- Big Overlay Play Button -->
            <button id="video-big-play-btn" style="position: absolute; width: 64px; height: 64px; border-radius: 50%; background: rgba(2, 132, 199, 0.85); border: none; color: #ffffff; font-size: 28px; display: flex; align-items: center; justify-content: center; cursor: pointer; backdrop-filter: blur(4px); box-shadow: 0 8px 24px rgba(0,0,0,0.4); transition: transform 0.2s ease;">
              ▶
            </button>
          </div>

          <!-- Custom Mobile Video Controls -->
          <div style="padding: 12px 14px; background: #0b1329; color: #ffffff;">
            
            <!-- Seek Progress Bar -->
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
              <span id="vid-curr-time" style="font-size: 11px; font-family: monospace; color: #94a3b8; min-width: 38px;">00:00</span>
              <input type="range" id="vid-seek-bar" value="0" min="0" max="100" step="0.1" 
                style="flex: 1; accent-color: #0284c7; height: 5px; cursor: pointer; border-radius: 4px; background: #334155;" />
              <span id="vid-total-time" style="font-size: 11px; font-family: monospace; color: #94a3b8; min-width: 38px;">${part.durationStr}</span>
            </div>

            <!-- Action Buttons Row -->
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div style="display: flex; align-items: center; gap: 10px;">
                <button id="btn-vid-play-toggle" class="vid-ctrl-btn" title="Play / Pause">
                  ▶ Play
                </button>
                <button id="btn-vid-rewind" class="vid-ctrl-btn" title="Rewind 10s">
                  ⏪ 10s
                </button>
                <button id="btn-vid-forward" class="vid-ctrl-btn" title="Forward 10s">
                  ⏩ 10s
                </button>
              </div>

              <div style="display: flex; align-items: center; gap: 8px;">
                <button id="btn-vid-volume" class="vid-ctrl-btn" title="Mute / Unmute">
                  🔊
                </button>
                <button id="btn-vid-fullscreen" class="vid-ctrl-btn" title="Fullscreen">
                  ⛶
                </button>
              </div>
            </div>

          </div>

          <!-- Lesson Part Completed Toast Banner -->
          <div id="part-completed-banner" style="display: ${partProgress.is_completed ? 'flex' : 'none'}; align-items: center; justify-content: space-between; padding: 10px 14px; background: #064e3b; border-top: 1px solid #059669; color: #a7f3d0; font-size: 12.5px; font-weight: 700;">
            <span>✅ Lesson Part Completed (+20 XP awarded)</span>
            <span style="font-size: 11px; background: #047857; color: #ffffff; padding: 2px 8px; border-radius: 4px;">SAVED</span>
          </div>
        </div>

        <!-- Description & Statutory Learning Points Card -->
        <div style="background: #ffffff; border-radius: 18px; padding: 20px; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.03); margin-bottom: 20px;">
          <h3 style="font-size: 16.5px; font-weight: 800; color: var(--text-primary); margin-top: 0; margin-bottom: 8px;">
            ${part.title}
          </h3>
          <p style="font-size: 13px; color: var(--text-secondary); line-height: 1.55; margin-bottom: 16px;">
            ${part.summary}
          </p>

          <div style="background: #f8fafc; border-radius: 12px; padding: 14px; border-left: 4px solid #0284c7; margin-bottom: 18px;">
            <h4 style="font-size: 12px; font-weight: 800; color: #0284c7; text-transform: uppercase; margin: 0 0 8px 0; letter-spacing: 0.5px;">
              Key Statutory Principles:
            </h4>
            <ul style="font-size: 12.5px; color: #334155; padding-left: 18px; margin: 0; line-height: 1.65;">
              ${part.keyPoints.map(pt => `<li>${pt}</li>`).join('')}
            </ul>
          </div>

          <!-- Knowledge Check Section -->
          <div style="border-top: 1px solid #e2e8f0; padding-top: 16px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
              <h4 style="font-size: 13.5px; font-weight: 800; color: #b45309; margin: 0; display: flex; align-items: center; gap: 6px;">
                <span>❓</span> Knowledge Check (+15 XP)
              </h4>
              <span id="quiz-attempt-badge" style="font-size: 11px; font-weight: 700; color: #64748b; background: #f1f5f9; padding: 3px 8px; border-radius: 4px;">
                ${partQuizHistory.length > 0 ? `Attempt #${partQuizHistory.length} Recorded` : 'Not Attempted'}
              </span>
            </div>

            <p style="font-size: 13.5px; font-weight: 700; color: var(--text-primary); margin-bottom: 12px; line-height: 1.4;">
              ${part.question}
            </p>

            <div style="display: flex; flex-direction: column; gap: 8px;" id="quiz-options-container">
              ${part.options.map((opt, oIdx) => `
                <button class="lesson-quiz-opt" data-opt-idx="${oIdx}" style="text-align: left; padding: 12px 14px; font-size: 13px; font-weight: 600; color: #1e293b; background: #f8fafc; border: 1.5px solid #cbd5e1; border-radius: 10px; cursor: pointer; transition: all 0.15s ease;">
                  ${opt.text}
                </button>
              `).join('')}
            </div>

            <div id="quiz-feedback-box" style="display: none; margin-top: 14px; padding: 14px; border-radius: 10px; font-size: 13px; line-height: 1.5;"></div>

            <!-- Previous Attempts Audit List for this Lesson Part -->
            ${partQuizHistory.length > 0 ? `
              <div style="margin-top: 16px; padding-top: 12px; border-top: 1px dashed #e2e8f0;">
                <div style="font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase; margin-bottom: 6px;">
                  Previous Attempt History:
                </div>
                <div style="display: flex; flex-direction: column; gap: 6px;">
                  ${partQuizHistory.map(qh => `
                    <div style="font-size: 11.5px; background: #f8fafc; border: 1px solid #e2e8f0; padding: 6px 10px; border-radius: 6px; display: flex; justify-content: space-between; align-items: center;">
                      <span>Attempt #${qh.attempt_number}: <strong>${qh.selected_answer}</strong></span>
                      <span style="color: ${qh.is_correct ? '#059669' : '#dc2626'}; font-weight: 800;">
                        ${qh.is_correct ? '✅ CORRECT' : '❌ INCORRECT'}
                      </span>
                    </div>
                  `).join('')}
                </div>
              </div>
            ` : ''}

          </div>
        </div>

        <!-- Navigation Next / Previous Part -->
        <div style="display: flex; justify-content: space-between; gap: 12px;">
          <button id="btn-prev-part" class="btn-secondary" style="flex: 1; padding: 12px; font-size: 13px;" ${activePartIndex === 0 ? 'disabled' : ''}>
            ← Previous Part
          </button>
          <button id="btn-next-part" class="btn-primary" style="flex: 1; padding: 12px; font-size: 13px;" ${activePartIndex === LESSON_PARTS.length - 1 ? 'disabled' : ''}>
            Next Lesson Part →
          </button>
        </div>

      </div>

      <style>
        .part-pill {
          background: #ffffff;
          border: 1.5px solid #cbd5e1;
          color: #334155;
          padding: 7px 12px;
          border-radius: 9999px;
          font-size: 12px;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .part-pill:hover, .part-pill.active {
          background: #e0f2fe;
          border-color: #0284c7;
          color: #0284c7;
        }
        .part-pill.completed {
          border-color: #10b981;
          background: #ecfdf5;
          color: #047857;
        }
        .vid-ctrl-btn {
          background: #1e293b;
          border: 1px solid #334155;
          color: #ffffff;
          padding: 6px 10px;
          border-radius: 6px;
          font-size: 11.5px;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.15s;
        }
        .vid-ctrl-btn:hover {
          background: #334155;
        }
        .lesson-quiz-opt:hover {
          background: #e0f2fe;
          border-color: #0284c7;
        }
      </style>
    `;

    // ----------------- Video Player Controller ----------------- //
    const video = container.querySelector('#training-video-player');
    const bigPlayBtn = container.querySelector('#video-big-play-btn');
    const playToggleBtn = container.querySelector('#btn-vid-play-toggle');
    const rewindBtn = container.querySelector('#btn-vid-rewind');
    const forwardBtn = container.querySelector('#btn-vid-forward');
    const volumeBtn = container.querySelector('#btn-vid-volume');
    const fullscreenBtn = container.querySelector('#btn-vid-fullscreen');
    const seekBar = container.querySelector('#vid-seek-bar');
    const currTimeDisplay = container.querySelector('#vid-curr-time');
    const totalTimeDisplay = container.querySelector('#vid-total-time');
    const completedBanner = container.querySelector('#part-completed-banner');
    const completionBadge = container.querySelector('#video-completion-badge');

    function formatTime(sec) {
      const m = Math.floor(sec / 60);
      const s = Math.floor(sec % 60);
      return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }

    // Restore last position if available
    let lastPos = partProgress.last_position_sec || 0;
    if (lastPos > 2 && lastPos < (part.durationSec - 5)) {
      video.currentTime = lastPos;
      currTimeDisplay.textContent = formatTime(lastPos);
    }

    function togglePlay() {
      if (video.paused) {
        video.play().catch(e => console.warn('Autoplay prevented:', e));
        bigPlayBtn.style.display = 'none';
        playToggleBtn.textContent = '⏸ Pause';
      } else {
        video.pause();
        bigPlayBtn.style.display = 'flex';
        playToggleBtn.textContent = '▶ Play';
      }
    }

    bigPlayBtn?.addEventListener('click', togglePlay);
    video?.addEventListener('click', togglePlay);
    playToggleBtn?.addEventListener('click', togglePlay);

    rewindBtn?.addEventListener('click', () => {
      video.currentTime = Math.max(0, video.currentTime - 10);
    });

    forwardBtn?.addEventListener('click', () => {
      video.currentTime = Math.min(video.duration || 100, video.currentTime + 10);
    });

    volumeBtn?.addEventListener('click', () => {
      video.muted = !video.muted;
      volumeBtn.textContent = video.muted ? '🔇' : '🔊';
    });

    fullscreenBtn?.addEventListener('click', () => {
      if (video.requestFullscreen) {
        video.requestFullscreen();
      } else if (video.webkitRequestFullscreen) {
        video.webkitRequestFullscreen();
      }
    });

    seekBar?.addEventListener('input', () => {
      const targetTime = (seekBar.value / 100) * (video.duration || part.durationSec);
      video.currentTime = targetTime;
    });

    let lastSyncTime = 0;
    video?.addEventListener('timeupdate', () => {
      if (!video.duration) return;
      const pct = (video.currentTime / video.duration) * 100;
      seekBar.value = pct;
      currTimeDisplay.textContent = formatTime(video.currentTime);
      totalTimeDisplay.textContent = formatTime(video.duration);

      // Periodically sync position to backend (every 3 seconds)
      const now = Date.now();
      if (now - lastSyncTime > 3000) {
        lastSyncTime = now;
        const isComplete = pct >= 85 || (partProgress.is_completed === 1);
        fetch(`/api/v1/trainees/${traineeId}/lessons/progress`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            trainee_id: traineeId,
            lesson_id: "mod_01",
            part_id: part.id,
            video_url: part.videoUrl,
            watched_pct: Math.round(pct),
            last_position_sec: Math.round(video.currentTime),
            is_completed: isComplete
          })
        }).catch(err => console.warn('Progress sync:', err));
      }
    });

    // When video completes or reaches end
    async function handleVideoCompleted() {
      completedBanner.style.display = 'flex';
      completionBadge.textContent = '✅ Completed';
      completionBadge.style.color = '#10b981';

      if (!partProgress.is_completed) {
        partProgress.is_completed = 1;
        progressMap[part.id] = partProgress;
        playSuccessChime();
        speak(`Lesson Part ${part.partNumber} completed. Twenty XP awarded.`);

        try {
          await fetch(`/api/v1/trainees/${traineeId}/lessons/progress`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              trainee_id: traineeId,
              lesson_id: "mod_01",
              part_id: part.id,
              video_url: part.videoUrl,
              watched_pct: 100,
              last_position_sec: Math.round(video.duration || 100),
              is_completed: true
            })
          });
          if (state.worker) state.worker.xp += 20;
        } catch (e) {
          console.warn('Completed post err:', e);
        }
      }
    }

    video?.addEventListener('ended', handleVideoCompleted);

    // ----------------- Knowledge Check Quiz ----------------- //
    const fbBox = container.querySelector('#quiz-feedback-box');
    container.querySelectorAll('.lesson-quiz-opt').forEach(btn => {
      btn.addEventListener('click', async () => {
        const oIdx = parseInt(btn.getAttribute('data-opt-idx'));
        const opt = part.options[oIdx];

        container.querySelectorAll('.lesson-quiz-opt').forEach(b => b.disabled = true);
        fbBox.style.display = 'block';

        if (opt.correct) {
          btn.style.borderColor = '#10b981';
          btn.style.background = '#d1fae5';
          fbBox.style.background = '#d1fae5';
          fbBox.style.color = '#065f46';
          fbBox.innerHTML = `<strong>✓ Correct! (+15 XP)</strong><br>${opt.reason}`;
          playSuccessChime();
          speak("Correct response. Knowledge check passed.");
        } else {
          btn.style.borderColor = '#ef4444';
          btn.style.background = '#fee2e2';
          fbBox.style.background = '#fee2e2';
          fbBox.style.color = '#991b1b';
          fbBox.innerHTML = `<strong>✗ Incorrect</strong><br>${opt.reason}`;
          playPenaltyBuzz();
          speak("Incorrect answer. Review statutory doctrine.");
        }

        // Post quiz attempt to permanent backend SQLite audit
        try {
          const qResp = await fetch(`/api/v1/trainees/${traineeId}/lessons/quiz`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              trainee_id: traineeId,
              lesson_id: "mod_01",
              part_id: part.id,
              question: part.question,
              selected_answer: opt.text,
              time_taken_sec: 4.5
            })
          });
          if (qResp.ok) {
            const res = await qResp.json();
            const badge = container.querySelector('#quiz-attempt-badge');
            if (badge) badge.textContent = `Attempt #${res.attempt_number} Saved`;
            if (opt.correct && state.worker) state.worker.xp += 15;
          }
        } catch (err) {
          console.warn('Quiz post error:', err);
        }
      });
    });

    // Navigation Between Parts
    container.querySelector('#btn-lessons-back')?.addEventListener('click', () => {
      video.pause();
      window.location.hash = '#home';
    });

    container.querySelectorAll('[data-part-idx]').forEach(btn => {
      btn.addEventListener('click', () => {
        video.pause();
        activePartIndex = parseInt(btn.getAttribute('data-part-idx'));
        renderView();
      });
    });

    container.querySelector('#btn-prev-part')?.addEventListener('click', () => {
      if (activePartIndex > 0) {
        video.pause();
        activePartIndex--;
        renderView();
      }
    });

    container.querySelector('#btn-next-part')?.addEventListener('click', () => {
      if (activePartIndex < LESSON_PARTS.length - 1) {
        video.pause();
        activePartIndex++;
        renderView();
      }
    });
  }

  renderView();
}
