// ═══════════════════════════════════════════════════════════════
// Sound Engine — Mechanical keystroke SFX & combo tones
// ═══════════════════════════════════════════════════════════════

let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function playTone(freq = 440, volume = 0.14, type = 'sine', duration = 0.05) {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration + 0.01);
  } catch {
    // Audio not available
  }
}

export function playCorrectKey(combo = 0) {
  playTone(520 + Math.min(240, combo * 9), 0.14, 'triangle', 0.038);
}

export function playErrorKey() {
  playTone(155, 0.16, 'sawtooth', 0.075);
}

export function playFinishFanfare() {
  playTone(523, 0.12);
  setTimeout(() => playTone(659, 0.12), 110);
  setTimeout(() => playTone(784, 0.18), 220);
}

export function playCountdownBeep() {
  playTone(440, 0.08, 'square', 0.1);
}

export function playGoBeep() {
  playTone(880, 0.1, 'square', 0.15);
}

