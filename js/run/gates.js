// Phase 1 gates: the story clock waits at a gate until the player has done one thing there.
// Events keep their times; a player who is late only makes the story wait, never skips ahead.
import { SHARE_ROOMS } from "./rooms.js";
import { GATE_QUIET } from "../constants.js";

// A room is quiet once everything sent into it has appeared and nothing new came for a moment
// (real seconds), so the answer to a reply is read before the next event pulls the player away.
export function quiet(state, id, seconds = GATE_QUIET) {
  const room = state.rooms[id];
  if (room.queue.length || room.typing) return false;
  if (state.pending.some((item) => item.room === id)) return false;
  return state.now - room.updated >= seconds;
}

const CHECKS = {
  // A reply chip was sent and its answers have all arrived.
  reply: (state, room) => Boolean(state.replied[room]) && quiet(state, room),
  // The group call was answered or declined (or rang out) and has ended.
  call: (state) => state.call.state === "gone",
  // The first shared reel was opened from its DM.
  reel: (state) => Boolean(state.sharedReelSeen),
  // The room was opened and its lines have been read.
  read: (state, room) => state.seen.has(room) && quiet(state, room),
};

export const gatePassed = (state, gate) => CHECKS[gate.gate](state, gate.room);

// The room a gate needs the player in (the call needs none: its screen covers the phone).
export const gateRoom = (gate) => (gate.gate === "reel" ? SHARE_ROOMS[0] : gate.room || null);
