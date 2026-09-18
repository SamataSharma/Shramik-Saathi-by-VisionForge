// Web Speech API Voice Guidance & Web Audio Sound Effects Synthesizer

import { getLanguage } from './i18n.js';

let audioCtx = null;
let voiceEnabled = true;
let soundEnabled = true;

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

// ----------------- Web Speech API Voice Guidance ----------------- //

export function speak(text, options = {}) {
  if (!voiceEnabled || !('speechSynthesis' in window)) return;

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

  utterance.rate = options.rate || 1.0;
  utterance.pitch = options.pitch || 1.0;
  utterance.volume = options.volume || 1.0;

  window.speechSynthesis.speak(utterance);
}

export function setVoiceEnabled(state) {
  voiceEnabled = state;
  if (!state && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

export function setSoundEnabled(state) {
  soundEnabled = state;
}

// ----------------- Web Audio Procedural Sound Effects ----------------- //

// 1. Mine Evacuation Siren (Oscillating Dual Tone)
let sirenOsc = null;
let sirenGain = null;
let sirenInterval = null;

export function startMineSiren() {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  stopMineSiren();

  sirenOsc = ctx.createOscillator();
  sirenGain = ctx.createGain();

  sirenOsc.type = 'sawtooth';
  sirenOsc.frequency.setValueAtTime(650, ctx.currentTime);

  sirenGain.gain.setValueAtTime(0.08, ctx.currentTime);

  sirenOsc.connect(sirenGain);
  sirenGain.connect(ctx.destination);
  sirenOsc.start();

  let toggle = false;
  sirenInterval = setInterval(() => {
    if (!sirenOsc || !ctx) return;
    toggle = !toggle;
    const targetFreq = toggle ? 920 : 640;
    sirenOsc.frequency.exponentialRampToValueAtTime(targetFreq, ctx.currentTime + 0.35);
  }, 450);
}

export function stopMineSiren() {
  if (sirenInterval) {
    clearInterval(sirenInterval);
    sirenInterval = null;
  }
  if (sirenOsc) {
    try { sirenOsc.stop(); sirenOsc.disconnect(); } catch (e) {}
    sirenOsc = null;
  }
}

// 2. Fire Combustion Rumble (Filtered Low Noise)
let combustionSource = null;

export function playCombustionRoar() {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const bufferSize = ctx.sampleRate * 2;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  noise.loop = true;

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(220, ctx.currentTime);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.12, ctx.currentTime);

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  noise.start();
  combustionSource = noise;
}

export function stopCombustionRoar() {
  if (combustionSource) {
    try { combustionSource.stop(); combustionSource.disconnect(); } catch (e) {}
    combustionSource = null;
  }
}

// 3. Extinguisher Discharge Hiss (White Noise Burst)
export function playExtinguisherHiss() {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const duration = 1.2;
  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.setValueAtTime(1400, ctx.currentTime);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.2, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  noise.start();
}

// 4. Success Chime (Positive Triad Chord)
export function playSuccessChime() {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const freqs = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
  freqs.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, ctx.currentTime + (idx * 0.08));

    gain.gain.setValueAtTime(0.15, ctx.currentTime + (idx * 0.08));
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8 + (idx * 0.08));

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime + (idx * 0.08));
    osc.stop(ctx.currentTime + 0.9 + (idx * 0.08));
  });
}

// 5. Danger / Error Buzzer
export function playPenaltyBuzz() {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(120, ctx.currentTime);

  gain.gain.setValueAtTime(0.25, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start();
  osc.stop(ctx.currentTime + 0.45);
}
