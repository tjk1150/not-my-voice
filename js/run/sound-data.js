// Notes for the synthesized background music and effects (Hz). C major colours the ordinary day and the ending,
// A minor the rewind and, softly, the night.
const C4 = 261.63, D4 = 293.66, E4 = 329.63, F3 = 174.61, G3 = 196.0, A3 = 220.0, B3 = 246.94, G4 = 392.0, B4 = 493.88;

export const CHORDS = {
  // Cmaj7, Am7, Fmaj7, G
  bright: [[C4, E4, G4, B4], [A3, C4, E4, G4], [F3, A3, C4, E4], [G3, B3, D4, G4]],
  // Am, F, C, G
  minor: [[A3, C4, E4], [F3, A3, C4], [C4, E4, G4], [G3, B3, D4]],
};

// Arpeggio order over one bar of eight steps.
export const ARP = [0, 1, 2, 3, 2, 1, 2, 3];

// The night: a soft A minor pad (A2, E3, A3, C4) and two gentle high notes that drift in later.
export const NIGHT_DRONE = [110.0, 164.81, 220.0, 261.63];
export const NIGHT_EERIE = [659.25, 523.25];
export const NEW_NIGHT_PAD = [130.81, 196.0, 261.63, 329.63];
export const BELLS = [523.25, 659.25, 783.99, 659.25];

export const TEMPO = { prologue: 84, ending: 66 };

// How far ahead notes are scheduled, and the crossfade between scenes.
export const LOOKAHEAD_S = 0.3;
export const FADE_S = 1.2;

// Short cues for effects (Hz). Original motifs, not recordings of any real app.
export const CUES = {
  talk: [1318.51, 1760.0],
  feedPop: [520, 1040],
  feedBell: 1567.98,
  inChat: [700, 1200],
  voice: [1046.5, 1318.51, 1567.98],
  missed: [987.77, 783.99],
  // [note, beat] of one ringtone cycle (about 0.85 s)
  ring: [[659.25, 0], [987.77, 1], [880.0, 2], [987.77, 3], [659.25, 4], [987.77, 5]],
  dismiss: [2093.0, 2349.32, 2637.02],
  chime: [660, 990],
  recStart: [880, 1318.51],
  learned: [783.99, 1046.5, 1318.51, 1567.98],
};
