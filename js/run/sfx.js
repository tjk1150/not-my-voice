// Sound effects synthesized with Web Audio: no files, nothing to license, and no real app's
// trademark sound is copied. Each app has its own short cue in the same spirit as the real one:
// 톡 a bright two-note chirp, 피드 a soft bubble pop, 보이스팝 a rising arpeggio, 전화 a marimba ring.
// The phone's media volume is at 0 (videos play silently); notification sounds still play.
import { audio, bus, ready, unlock, isMuted, setMuted, noiseBuffer, envelope } from "./audio-ctx.js";
import { CUES } from "./sound-data.js";

const out = () => bus("sfx");

// A struck tone: a sine plus a quieter overtone, both decaying fast (marimba or bell colour).
function strike(freq, at, { peak, release, overtone = 3, overtoneLevel = 0.25, type = "sine" }) {
  const ctx = audio();
  [[freq, peak], [freq * overtone, peak * overtoneLevel]].forEach(([hz, level]) => {
    const { gain, end } = envelope(out(), { at, peak: level, attack: 0.004, release });
    const osc = ctx.createOscillator();
    osc.type = type;
    osc.frequency.value = hz;
    osc.connect(gain);
    osc.start(at);
    osc.stop(end);
  });
}

// A short burst of filtered noise (clicks, whooshes).
function burst(at, { peak, attack = 0.002, release, type = "bandpass", from, to = from, q = 1 }) {
  const ctx = audio();
  const { gain, end } = envelope(out(), { at, peak, attack, release });
  const source = ctx.createBufferSource();
  source.buffer = noiseBuffer();
  const filter = ctx.createBiquadFilter();
  filter.type = type;
  filter.Q.value = q;
  filter.frequency.setValueAtTime(from, at);
  filter.frequency.exponentialRampToValueAtTime(to, end);
  source.connect(filter).connect(gain);
  source.start(at, Math.random());
  source.stop(end);
}

const play = {
  talk(at) {
    CUES.talk.forEach((freq, index) => strike(freq, at + index * 0.11, { peak: 0.16, release: 0.16, overtone: 2, overtoneLevel: 0.2, type: "triangle" }));
  },
  feed(at) {
    const ctx = audio();
    const { gain, end } = envelope(out(), { at, peak: 0.2, attack: 0.004, release: 0.12 });
    const osc = ctx.createOscillator();
    osc.frequency.setValueAtTime(CUES.feedPop[0], at);
    osc.frequency.exponentialRampToValueAtTime(CUES.feedPop[1], at + 0.07);
    osc.connect(gain);
    osc.start(at);
    osc.stop(end);
    strike(CUES.feedBell, at + 0.06, { peak: 0.07, release: 0.35 });
  },
  voice(at) {
    CUES.voice.forEach((freq, index) => strike(freq, at + index * 0.07, { peak: 0.09, release: 0.22, type: "triangle" }));
  },
  phone(at) {
    CUES.missed.forEach((freq, index) => strike(freq, at + index * 0.16, { peak: 0.12, release: 0.3, overtone: 4, overtoneLevel: 0.15 }));
  },
};

export const sfx = {
  unlock,
  get muted() { return isMuted(); },
  setMuted,

  // One notification arriving, in the sound of its app.
  notify(app) {
    if (!ready()) return;
    (play[app] || play.feed)(audio().currentTime + 0.01);
  },

  // A message arriving in the DM room that is already open: one short, quiet pop.
  inChat() {
    if (!ready()) return;
    const ctx = audio();
    const at = ctx.currentTime + 0.01;
    const { gain, end } = envelope(out(), { at, peak: 0.12, attack: 0.003, release: 0.08 });
    const osc = ctx.createOscillator();
    osc.frequency.setValueAtTime(CUES.inChat[0], at);
    osc.frequency.exponentialRampToValueAtTime(CUES.inChat[1], at + 0.05);
    osc.connect(gain);
    osc.start(at);
    osc.stop(end);
  },

  // A 톡 message arriving in the chat room that is already open: the 톡 chirp, softer.
  inChatTalk() {
    if (!ready()) return;
    const at = audio().currentTime + 0.01;
    CUES.talk.forEach((freq, index) => strike(freq, at + index * 0.09, { peak: 0.08, release: 0.12, overtone: 2, overtoneLevel: 0.15, type: "triangle" }));
  },

  // One cycle of the incoming-call ringtone (the engine repeats it while the call rings).
  ring() {
    if (!ready()) return;
    const at = audio().currentTime + 0.01;
    CUES.ring.forEach(([freq, beat]) => strike(freq, at + beat * 0.14, { peak: 0.16, release: 0.4, overtone: 4, overtoneLevel: 0.18 }));
  },

  // The camera shutter of a screenshot: two quick mechanical clicks and a soft slide.
  shutter() {
    if (!ready()) return;
    const at = audio().currentTime + 0.01;
    burst(at, { peak: 0.35, release: 0.03, from: 3200, q: 2 });
    burst(at + 0.07, { peak: 0.28, release: 0.04, from: 2400, q: 2 });
    burst(at + 0.01, { peak: 0.06, attack: 0.01, release: 0.12, type: "lowpass", from: 1500, to: 400 });
  },

  // The freeze: one dull impact, then silence.
  thud() {
    if (!ready()) return;
    const ctx = audio();
    const { gain, end } = envelope(out(), { peak: 0.7, attack: 0.005, hold: 0.02, release: 0.7 });
    const osc = ctx.createOscillator();
    osc.frequency.setValueAtTime(90, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(35, ctx.currentTime + 0.6);
    osc.connect(gain);
    osc.start();
    osc.stop(end);
  },

  // Tape scrubbing backwards (or forwards): filtered noise sweeping with a fast flutter.
  travel(ms, forward = false) {
    if (!ready()) return;
    const ctx = audio();
    const seconds = ms / 1000;
    const { gain, end } = envelope(out(), { peak: 0.16, attack: 0.15, hold: Math.max(0, seconds - 0.45), release: 0.3 });
    const source = ctx.createBufferSource();
    source.buffer = noiseBuffer();
    source.loop = true;
    const band = ctx.createBiquadFilter();
    band.type = "bandpass";
    band.Q.value = 6;
    band.frequency.setValueAtTime(forward ? 600 : 2600, ctx.currentTime);
    band.frequency.exponentialRampToValueAtTime(forward ? 2600 : 500, ctx.currentTime + seconds);
    const flutter = ctx.createOscillator();
    const depth = ctx.createGain();
    flutter.frequency.value = forward ? 26 : 16;
    depth.gain.value = 0.5;
    const amp = ctx.createGain();
    amp.gain.value = 0.6;
    flutter.connect(depth).connect(amp.gain);
    source.connect(band).connect(amp).connect(gain);
    source.start();
    flutter.start();
    source.stop(end);
    flutter.stop(end);
  },

  // A notification taken away: a short soft swipe and a small high ping, gentler than a crash.
  dismiss(index = 0) {
    if (!ready()) return;
    const at = audio().currentTime + 0.01;
    burst(at, { peak: 0.09, attack: 0.02, release: 0.14, from: 900, to: 3200, q: 0.8 });
    strike(CUES.dismiss[index % CUES.dismiss.length], at + 0.05, { peak: 0.05, release: 0.25 });
  },

  // 보이스팝: recording starts (two quick rising beeps, like a voice recorder).
  recStart() {
    if (!ready()) return;
    const at = audio().currentTime + 0.01;
    CUES.recStart.forEach((freq, index) => strike(freq, at + index * 0.12, { peak: 0.12, release: 0.1, overtoneLevel: 0.05 }));
  },

  // 보이스팝: the AI voice is ready (a bright rising arpeggio).
  learned() {
    if (!ready()) return;
    const at = audio().currentTime + 0.01;
    CUES.learned.forEach((freq, index) => strike(freq, at + index * 0.09, { peak: 0.1, release: index === CUES.learned.length - 1 ? 0.9 : 0.3, type: "triangle", overtoneLevel: 0.12 }));
  },

  // A lesson card or the ending: two soft bell tones.
  chime() {
    if (!ready()) return;
    const at = audio().currentTime + 0.01;
    CUES.chime.forEach((freq, index) => strike(freq, at + index * 0.08, { peak: 0.09, release: 1.4, overtoneLevel: 0.1 }));
  },
};
