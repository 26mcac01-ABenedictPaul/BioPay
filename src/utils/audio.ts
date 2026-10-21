/**
 * Synthesizes Google Pay style audio feedback using the Web Audio API.
 * Provides authentic payment chime, biometric scan chirp, and tick tones.
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  try {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  } catch {
    return null;
  }
}

/**
 * Famous Google Pay-style ascending success chime (cheerful two-tone arpeggio)
 */
export function playSuccessChime() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  
  // Note 1: E5 (659.25 Hz)
  const osc1 = ctx.createOscillator();
  const gain1 = ctx.createGain();
  osc1.type = 'sine';
  osc1.frequency.setValueAtTime(659.25, now);
  gain1.gain.setValueAtTime(0.001, now);
  gain1.gain.exponentialRampToValueAtTime(0.35, now + 0.05);
  gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
  osc1.connect(gain1);
  gain1.connect(ctx.destination);
  osc1.start(now);
  osc1.stop(now + 0.35);

  // Note 2: B5 (987.77 Hz)
  const osc2 = ctx.createOscillator();
  const gain2 = ctx.createGain();
  osc2.type = 'sine';
  osc2.frequency.setValueAtTime(987.77, now + 0.12);
  gain2.gain.setValueAtTime(0.001, now + 0.12);
  gain2.gain.exponentialRampToValueAtTime(0.4, now + 0.16);
  gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
  osc2.connect(gain2);
  gain2.connect(ctx.destination);
  osc2.start(now + 0.12);
  osc2.stop(now + 0.6);

  // Note 3: E6 (1318.51 Hz) - crystal chime finish
  const osc3 = ctx.createOscillator();
  const gain3 = ctx.createGain();
  osc3.type = 'triangle';
  osc3.frequency.setValueAtTime(1318.51, now + 0.22);
  gain3.gain.setValueAtTime(0.001, now + 0.22);
  gain3.gain.exponentialRampToValueAtTime(0.28, now + 0.26);
  gain3.gain.exponentialRampToValueAtTime(0.0001, now + 0.95);
  osc3.connect(gain3);
  gain3.connect(ctx.destination);
  osc3.start(now + 0.22);
  osc3.stop(now + 0.95);
}

/**
 * Biometric laser scan pulse tone
 */
export function playBiometricScanChirp() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(800, now);
  osc.frequency.exponentialRampToValueAtTime(1600, now + 0.15);

  gain.gain.setValueAtTime(0.001, now);
  gain.gain.linearRampToValueAtTime(0.18, now + 0.03);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.18);
}

/**
 * Fingerprint touch tick for sensor contact
 */
export function playTouchTick() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(120, now);
  osc.frequency.exponentialRampToValueAtTime(60, now + 0.06);

  gain.gain.setValueAtTime(0.25, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.06);
}

/**
 * Scratch card shimmer sound
 */
export function playRewardRevealSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const notes = [523.25, 659.25, 783.99, 1046.50]; // C E G C
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now + i * 0.07);
    gain.gain.setValueAtTime(0.001, now + i * 0.07);
    gain.gain.linearRampToValueAtTime(0.25, now + i * 0.07 + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.07 + 0.3);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now + i * 0.07);
    osc.stop(now + i * 0.07 + 0.3);
  });
}
