// Web Speech API Voice Guidance & Web Audio Procedural Sound Synthesizer
// With Audio Priority & Ducking Across All 5 Hazard Scenarios

import { getLanguage } from './i18n.js';

let audioCtx = null;
let voiceEnabled = true;
let soundEnabled = true;

// Master Alarm Gain Node for Ducking
let masterAlarmGain = null;
let isDucked = false;

function getAudioContext() {
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
      audioCtx = new AudioContext();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

function getMasterAlarmGain(ctx) {
  if (!masterAlarmGain && ctx) {
    masterAlarmGain = ctx.createGain();
    masterAlarmGain.gain.setValueAtTime(1.0, ctx.currentTime);
    masterAlarmGain.connect(ctx.destination);
  }
  return masterAlarmGain;
}

export function duckAlarms(isDucked) {
  if (!masterAlarmGain) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  const targetGain = isDucked ? 0.25 : 1.0;
  try {
    masterAlarmGain.gain.cancelScheduledValues(ctx.currentTime);
    masterAlarmGain.gain.linearRampToValueAtTime(targetGain, ctx.currentTime + 0.15);
  } catch (e) {
    masterAlarmGain.gain.value = targetGain;
  }
}

export function restoreAlarms() {
  duckAlarms(false);
}

// ----------------- Web Speech API Voice Guidance with Ducking ----------------- //

export function speak(text, options = {}) {
  if (!voiceEnabled || !('speechSynthesis' in window)) return;

  try {
    window.speechSynthesis.cancel(); // Cancel any ongoing speech

    const utterance = new SpeechSynthesisUtterance(text);
    const lang = getLanguage();

    if (lang === 'hi') {
      utterance.lang = 'hi-IN';
    } else if (lang === 'sat') {
      utterance.lang = 'hi-IN'; // Fallback to Hindi phonetic engine for Santali phonology
    } else {
      utterance.lang = 'en-IN';
    }

    utterance.rate = options.rate || 0.95;
    utterance.pitch = options.pitch || 1.0;
    utterance.volume = options.volume || 1.0;

    // Duck alarms when speaking starts
    utterance.onstart = () => {
      duckAlarms(true);
    };

    // Restore alarms when speaking finishes
    const restore = () => {
      duckAlarms(false);
    };
    utterance.onend = restore;
    utterance.onerror = restore;

    window.speechSynthesis.speak(utterance);
  } catch (e) {
    console.warn('[Voice] Speech error:', e);
  }
}

export function setVoiceEnabled(state) {
  voiceEnabled = state;
  if (!state && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

export function setSoundEnabled(state) {
  soundEnabled = state;
  if (!state) {
    stopScenarioAlarm();
  }
}

// ----------------- Procedural Alarms & Sounds for ALL 5 Scenarios ----------------- //

let activeAlarmType = null;
let sirenOsc1 = null;
let sirenOsc2 = null;
let sirenGain = null;
let sirenInterval = null;
let envNoiseSource = null;
let envFilter = null;
let envGain = null;

export function startScenarioAlarm(scenarioId) {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  stopScenarioAlarm();
  activeAlarmType = scenarioId;

  const master = getMasterAlarmGain(ctx);

  if (scenarioId === 'sim_fire_explosion') {
    // 1. FIRE: Dual-tone siren (650-920Hz) + combustion rumble
    sirenOsc1 = ctx.createOscillator();
    sirenGain = ctx.createGain();
    sirenOsc1.type = 'sawtooth';
    sirenOsc1.frequency.setValueAtTime(650, ctx.currentTime);
    sirenGain.gain.setValueAtTime(0.065, ctx.currentTime);
    sirenOsc1.connect(sirenGain);
    sirenGain.connect(master);
    sirenOsc1.start();

    let toggle = false;
    sirenInterval = setInterval(() => {
      if (!sirenOsc1 || !ctx) return;
      toggle = !toggle;
      sirenOsc1.frequency.exponentialRampToValueAtTime(toggle ? 920 : 640, ctx.currentTime + 0.35);
    }, 450);

    // Combustion low-frequency roar
    playCombustionRoar(master);

  } else if (scenarioId === 'sim_gas_confined') {
    // 2. GAS LEAK: Pulsing alarm chirp (880-1100Hz) + high-pressure hiss
    sirenOsc1 = ctx.createOscillator();
    sirenGain = ctx.createGain();
    sirenOsc1.type = 'sine';
    sirenOsc1.frequency.setValueAtTime(880, ctx.currentTime);
    sirenGain.gain.setValueAtTime(0.07, ctx.currentTime);
    sirenOsc1.connect(sirenGain);
    sirenGain.connect(master);
    sirenOsc1.start();

    let toggle = false;
    sirenInterval = setInterval(() => {
      if (!sirenOsc1 || !ctx) return;
      toggle = !toggle;
      sirenOsc1.frequency.setValueAtTime(toggle ? 1150 : 880, ctx.currentTime);
    }, 280);

    // Continuous gas hiss
    playGasHiss(master);

  } else if (scenarioId === 'sim_machinery_safety') {
    // 3. MACHINERY: Mechanical warble siren (520-740Hz) + rhythmic gear clatter
    sirenOsc1 = ctx.createOscillator();
    sirenGain = ctx.createGain();
    sirenOsc1.type = 'square';
    sirenOsc1.frequency.setValueAtTime(520, ctx.currentTime);
    sirenGain.gain.setValueAtTime(0.05, ctx.currentTime);
    sirenOsc1.connect(sirenGain);
    sirenGain.connect(master);
    sirenOsc1.start();

    let toggle = false;
    sirenInterval = setInterval(() => {
      if (!sirenOsc1 || !ctx) return;
      toggle = !toggle;
      sirenOsc1.frequency.linearRampToValueAtTime(toggle ? 740 : 520, ctx.currentTime + 0.25);
    }, 350);

    // Heavy conveyor motor drone
    playMachineryHum(master);

  } else if (scenarioId === 'sim_emergency_evac') {
    // 4. EVACUATION: Continuous sweep mine evacuation klaxon (420-850Hz sweep)
    sirenOsc1 = ctx.createOscillator();
    sirenGain = ctx.createGain();
    sirenOsc1.type = 'sawtooth';
    sirenOsc1.frequency.setValueAtTime(420, ctx.currentTime);
    sirenGain.gain.setValueAtTime(0.08, ctx.currentTime);
    sirenOsc1.connect(sirenGain);
    sirenGain.connect(master);
    sirenOsc1.start();

    let toggle = false;
    sirenInterval = setInterval(() => {
      if (!sirenOsc1 || !ctx) return;
      toggle = !toggle;
      sirenOsc1.frequency.exponentialRampToValueAtTime(toggle ? 850 : 420, ctx.currentTime + 0.5);
    }, 550);

  } else if (scenarioId === 'sim_roof_strata') {
    // 5. ROOF / STRATA: Dissonant warning siren (440Hz / 466Hz beating tone) + rock crack impulses
    sirenOsc1 = ctx.createOscillator();
    sirenOsc2 = ctx.createOscillator();
    sirenGain = ctx.createGain();

    sirenOsc1.type = 'triangle';
    sirenOsc1.frequency.setValueAtTime(440, ctx.currentTime);
    sirenOsc2.type = 'sawtooth';
    sirenOsc2.frequency.setValueAtTime(466, ctx.currentTime);

    sirenGain.gain.setValueAtTime(0.06, ctx.currentTime);
    sirenOsc1.connect(sirenGain);
    sirenOsc2.connect(sirenGain);
    sirenGain.connect(master);

    sirenOsc1.start();
    sirenOsc2.start();

    let toggle = false;
    sirenInterval = setInterval(() => {
      if (!sirenOsc1 || !ctx) return;
      toggle = !toggle;
      sirenOsc1.frequency.linearRampToValueAtTime(toggle ? 520 : 440, ctx.currentTime + 0.3);
    }, 600);
  }
}

export function stopScenarioAlarm() {
  if (sirenInterval) {
    clearInterval(sirenInterval);
    sirenInterval = null;
  }
  if (sirenOsc1) {
    try { sirenOsc1.stop(); sirenOsc1.disconnect(); } catch (e) {}
    sirenOsc1 = null;
  }
  if (sirenOsc2) {
    try { sirenOsc2.stop(); sirenOsc2.disconnect(); } catch (e) {}
    sirenOsc2 = null;
  }
  if (sirenGain) {
    try { sirenGain.disconnect(); } catch (e) {}
    sirenGain = null;
  }
  stopEnvNoise();
  activeAlarmType = null;
}

// Environmental Background Sound Synthesizers
function playCombustionRoar(destination) {
  const ctx = getAudioContext();
  if (!ctx) return;
  const bufferSize = ctx.sampleRate * 2;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

  envNoiseSource = ctx.createBufferSource();
  envNoiseSource.buffer = buffer;
  envNoiseSource.loop = true;

  envFilter = ctx.createBiquadFilter();
  envFilter.type = 'lowpass';
  envFilter.frequency.setValueAtTime(200, ctx.currentTime);

  envGain = ctx.createGain();
  envGain.gain.setValueAtTime(0.09, ctx.currentTime);

  envNoiseSource.connect(envFilter);
  envFilter.connect(envGain);
  envGain.connect(destination || ctx.destination);
  envNoiseSource.start();
}

function playGasHiss(destination) {
  const ctx = getAudioContext();
  if (!ctx) return;
  const bufferSize = ctx.sampleRate * 2;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

  envNoiseSource = ctx.createBufferSource();
  envNoiseSource.buffer = buffer;
  envNoiseSource.loop = true;

  envFilter = ctx.createBiquadFilter();
  envFilter.type = 'highpass';
  envFilter.frequency.setValueAtTime(2200, ctx.currentTime);

  envGain = ctx.createGain();
  envGain.gain.setValueAtTime(0.05, ctx.currentTime);

  envNoiseSource.connect(envFilter);
  envFilter.connect(envGain);
  envGain.connect(destination || ctx.destination);
  envNoiseSource.start();
}

function playMachineryHum(destination) {
  const ctx = getAudioContext();
  if (!ctx) return;
  envNoiseSource = ctx.createOscillator();
  envNoiseSource.type = 'triangle';
  envNoiseSource.frequency.setValueAtTime(110, ctx.currentTime);

  envGain = ctx.createGain();
  envGain.gain.setValueAtTime(0.06, ctx.currentTime);

  envNoiseSource.connect(envGain);
  envGain.connect(destination || ctx.destination);
  envNoiseSource.start();
}

function stopEnvNoise() {
  if (envNoiseSource) {
    try { envNoiseSource.stop(); envNoiseSource.disconnect(); } catch (e) {}
    envNoiseSource = null;
  }
  if (envFilter) {
    try { envFilter.disconnect(); } catch (e) {}
    envFilter = null;
  }
  if (envGain) {
    try { envGain.disconnect(); } catch (e) {}
    envGain = null;
  }
}

// Extinguisher Hiss
export function playExtinguisherHiss() {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const duration = 1.2;
  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.setValueAtTime(1400, ctx.currentTime);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.18, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  noise.start();
}

// Positive feedback chime
export function playSuccessChime() {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const freqs = [523.25, 659.25, 783.99, 1046.50];
  freqs.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, ctx.currentTime + (idx * 0.07));
    gain.gain.setValueAtTime(0.12, ctx.currentTime + (idx * 0.07));
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.7 + (idx * 0.07));
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime + (idx * 0.07));
    osc.stop(ctx.currentTime + 0.8 + (idx * 0.07));
  });
}

// Penalty buzzer
export function playPenaltyBuzz() {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(125, ctx.currentTime);
  gain.gain.setValueAtTime(0.2, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.4);
}

// Legacy aliases
export function startMineSiren() { startScenarioAlarm('sim_fire_explosion'); }
export function stopMineSiren() { stopScenarioAlarm(); }
export function playCombustionRoarLegacy() { playCombustionRoar(); }
export function stopCombustionRoarLegacy() { stopEnvNoise(); }
