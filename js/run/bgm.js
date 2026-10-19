// Background music, synthesized per scene so there is no file to license.
// prologue: light arpeggio of an ordinary evening. night: a soft minor pad and a quiet pulse that
// grow a little busier as phase 1 goes on (uneasy, not horror), cut to silence at the freeze. rewind: swells that grow and stop short, like
// sound played backwards. newnight: a warm pad with sparse bells. ending: a slow, soft arpeggio.
import { audio, bus, ready, onUnlock, envelope } from "./audio-ctx.js";
import { CHORDS, ARP, NIGHT_DRONE, NIGHT_EERIE, NEW_NIGHT_PAD, BELLS, TEMPO, LOOKAHEAD_S, FADE_S } from "./sound-data.js";

let wanted = null;
let live = null;
let intensity = 0;

function tone(dest, freq, at, { type = "sine", peak, attack = 0.01, hold = 0, release }) {
  const { gain, end } = envelope(dest, { at, peak, attack, hold, release });
  const osc = audio().createOscillator();
  osc.type = type;
  osc.frequency.value = freq;
  osc.connect(gain);
  osc.start(at);
  osc.stop(end);
}

function heartbeat(dest, at, strength) {
  const ctx = audio();
  const { gain, end } = envelope(dest, { at, peak: strength, attack: 0.005, release: 0.18 });
  const osc = ctx.createOscillator();
  osc.frequency.setValueAtTime(72, at);
  osc.frequency.exponentialRampToValueAtTime(38, at + 0.16);
  osc.connect(gain);
  osc.start(at);
  osc.stop(end);
}

// Sustained oscillators through a lowpass, faded in; returns handles to steer and stop them.
function pad(dest, freqs, { type, cutoff, level, detune = 0 }) {
  const ctx = audio();
  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = cutoff;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(level, ctx.currentTime + 3);
  filter.connect(gain).connect(dest);
  const oscs = freqs.map((freq, index) => {
    const osc = ctx.createOscillator();
    osc.type = type;
    osc.frequency.value = freq;
    osc.detune.value = (index % 2 ? 1 : -1) * detune;
    osc.connect(filter);
    osc.start();
    return osc;
  });
  return { filter, stop: () => oscs.forEach((osc) => osc.stop()) };
}

const SCENES = {
  prologue: {
    stepSeconds: () => 60 / TEMPO.prologue / 2,
    note(dest, step, at) {
      const chord = CHORDS.bright[Math.floor(step / 8) % 4];
      tone(dest, chord[ARP[step % 8]], at, { type: "triangle", peak: 0.1, release: 0.45 });
      if (step % 8 === 0) tone(dest, chord[0] / 2, at, { peak: 0.12, attack: 0.02, release: 1.6 });
    },
  },
  night: {
    // Four steps per heartbeat ("lub", "dub", rest, rest); the beat quickens with intensity.
    stepSeconds: () => 0.3 - 0.06 * intensity,
    sustain: (dest) => {
      const drone = pad(dest, NIGHT_DRONE, { type: "triangle", cutoff: 500, level: 0.11, detune: 4 });
      return { stop: drone.stop, update: (value) => drone.filter.frequency.setTargetAtTime(500 + 500 * value, audio().currentTime, 0.8) };
    },
    note(dest, step, at) {
      const strength = 0.05 + 0.13 * intensity;
      if (step % 4 === 0) heartbeat(dest, at, strength);
      if (step % 4 === 1) heartbeat(dest, at, strength * 0.6);
      if (intensity > 0.5 && step % 32 === 0) tone(dest, NIGHT_EERIE[(step / 32) % 2], at, { peak: 0.02 * intensity, attack: 0.8, release: 2.2 });
    },
  },
  rewind: {
    stepSeconds: () => 1.6,
    note(dest, step, at) {
      const chord = CHORDS.minor[Math.floor(step / 2) % 4];
      chord.forEach((freq) => tone(dest, freq * 2, at, { type: "triangle", peak: 0.045, attack: 1.45, release: 0.06 }));
      if (step % 2 === 0) tone(dest, chord[0] / 2, at, { peak: 0.06, attack: 1.5, release: 0.1 });
    },
  },
  newnight: {
    stepSeconds: () => 1.1,
    sustain: (dest) => pad(dest, NEW_NIGHT_PAD, { type: "triangle", cutoff: 900, level: 0.1 }),
    note(dest, step, at) {
      if (step % 3 === 0) tone(dest, BELLS[(step / 3) % BELLS.length], at, { peak: 0.05, release: 2.2 });
    },
  },
  ending: {
    stepSeconds: () => 60 / TEMPO.ending / 2,
    note(dest, step, at) {
      const chord = CHORDS.bright[Math.floor(step / 8) % 4];
      tone(dest, chord[ARP[step % 8]] * 2, at, { peak: 0.05, release: 1.2 });
      if (step % 8 === 0) tone(dest, chord[0], at, { type: "triangle", peak: 0.06, attack: 0.3, release: 2.5 });
    },
  },
};

function schedule() {
  const now = audio().currentTime;
  while (live.next < now + LOOKAHEAD_S) {
    live.scene.note(live.out, live.step, live.next);
    live.next += live.scene.stepSeconds();
    live.step += 1;
  }
}

function begin() {
  const ctx = audio();
  const out = ctx.createGain();
  out.gain.setValueAtTime(0.0001, ctx.currentTime);
  out.gain.exponentialRampToValueAtTime(1, ctx.currentTime + FADE_S);
  out.connect(bus("music"));
  const scene = SCENES[wanted];
  live = { scene, out, step: 0, next: ctx.currentTime + 0.1, sustain: scene.sustain?.(out) ?? null };
  live.sustain?.update?.(intensity);
  live.timer = setInterval(schedule, 100);
}

function end(fadeSeconds) {
  if (!live) return;
  const ctx = audio();
  const old = live;
  live = null;
  clearInterval(old.timer);
  const gain = old.out.gain;
  gain.cancelScheduledValues(ctx.currentTime);
  gain.setValueAtTime(Math.max(gain.value, 0.0001), ctx.currentTime);
  if (fadeSeconds > 0) gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + fadeSeconds);
  else gain.setValueAtTime(0, ctx.currentTime);
  setTimeout(() => { old.sustain?.stop(); old.out.disconnect(); }, fadeSeconds * 1000 + 300);
}

export const bgm = {
  // Remembers the scene even before the first tap; it starts as soon as audio is unlocked.
  play(name) {
    if (wanted === name && live) return;
    wanted = name;
    if (!ready()) return;
    end(FADE_S);
    begin();
  },
  stop(fadeSeconds = 0) {
    wanted = null;
    if (ready()) end(fadeSeconds);
  },
  setIntensity(value) {
    const next = Math.max(0, Math.min(1, value));
    if (Math.abs(next - intensity) < 0.02) return;
    intensity = next;
    live?.sustain?.update?.(intensity);
  },
};

onUnlock(() => { if (wanted && !live) begin(); });
