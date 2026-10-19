// Plays the classmates' lines of the group call one after another, after the player accepts.
// The phone's ringer is silent at night, but call audio still plays once a call is answered.
// If the first file is missing or blocked, onEnd(false) lets the engine fall back to a silent call.
import { CALL_AUDIO } from "./rooms.js";
import { CALL_GAP_MS } from "../constants.js";

export function playCall({ onSpeaker, onEnd }) {
  let index = 0;
  let current = null;
  let finished = false;
  const finish = (ok) => {
    if (finished) return;
    finished = true;
    onSpeaker(null);
    onEnd(ok);
  };
  const next = () => {
    if (finished) return;
    if (index >= CALL_AUDIO.length) return finish(true);
    const line = CALL_AUDIO[index];
    const first = index === 0;
    index += 1;
    // A missing file reports both an "error" event and a rejected play(); move on only once.
    let moved = false;
    const fail = () => {
      if (moved) return;
      moved = true;
      if (first) finish(false);
      else next();
    };
    current = new Audio(line.file);
    current.addEventListener("ended", () => { moved = true; setTimeout(next, CALL_GAP_MS); });
    current.addEventListener("error", fail);
    current.play().then(() => onSpeaker(line.who)).catch(fail);
  };
  next();
  return () => {
    current?.pause();
    finish(true);
  };
}
