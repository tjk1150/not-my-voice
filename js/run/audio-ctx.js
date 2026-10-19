// One AudioContext for effects and music, with a master volume (the mute toggle) and two buses.
// Browsers start audio only after a tap, so unlock() runs on the first pointerdown.
let ctx = null;
let master = null;
let buses = null;
let muted = false;
const unlockListeners = [];

export const audio = () => ctx;
export const bus = (name) => buses?.[name];
export const ready = () => Boolean(ctx) && ctx.state === "running";
export const isMuted = () => muted;
export const onUnlock = (listener) => unlockListeners.push(listener);

export function unlock() {
  if (!ctx) {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain();
    master.connect(ctx.destination);
    const make = (level) => {
      const gain = ctx.createGain();
      gain.gain.value = level;
      gain.connect(master);
      return gain;
    };
    buses = { sfx: make(1), music: make(0.32) };
  }
  if (ctx.state === "suspended") ctx.resume().then(() => unlockListeners.forEach((listener) => listener()));
  else unlockListeners.forEach((listener) => listener());
}

export function setMuted(value) {
  muted = value;
  if (master) master.gain.setTargetAtTime(value ? 0 : 1, ctx.currentTime, 0.05);
}

let noise = null;
export function noiseBuffer() {
  if (noise) return noise;
  noise = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
  const data = noise.getChannelData(0);
  for (let index = 0; index < data.length; index += 1) data[index] = Math.random() * 2 - 1;
  return noise;
}

// A gain with an attack and an exponential release starting at `at`, connected to `dest`.
export function envelope(dest, { at = ctx.currentTime, peak, attack, hold = 0, release }) {
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, at);
  gain.gain.exponentialRampToValueAtTime(peak, at + attack);
  gain.gain.setValueAtTime(peak, at + attack + hold);
  gain.gain.exponentialRampToValueAtTime(0.0001, at + attack + hold + release);
  gain.connect(dest);
  return { gain, end: at + attack + hold + release + 0.05 };
}
