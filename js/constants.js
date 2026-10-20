// Fixed values shared by screens and the runtime (tuning numbers, tap routing, orders).

// Prologue (보이스팝)
export const SONG_PLAYS = ["1.2만", "8,400", "5,100"];
export const WAVE_BAR_COUNT = 34;
export const REC_STEP_MS = 350;
export const LEARN_STEPS = 12;

// Reel action icons that open something in the live run.
export const REEL_GO = { "message-circle": "comments", ellipsis: "more" };

// Phase 1 runtime: what a tap opens, which banners lead the player, the order of 톡 rooms.
export const TAP_TO_VIEW = { "app-feed": "dm-inbox", "app-talk": "talk-list", "tab-dm": "dm-inbox", "tab-reels": "reels", "tab-home": "activity", comments: "comments", "close-comments": "reels", audio: "audio", "close-audio": "reels", more: "more", "close-sheet": "reels", "report-go": "report", "close-report": "reels", home: "home" };
// Banners that lead the player into the next room. Until that room is opened they stay up, so the
// way from 피드 to 톡 is always a banner and never the home screen.
export const BANNER_ROOMS = ["dm:harin", "dm:minjae", "dm:sua", "talk:teacher"];
// 톡 rooms the player is led into, in order. 학원 선생님 and 채원 only pile up in the chat list.
export const TALK_ORDER = ["talk:teacher", "talk:mom"];

// Pause between classmates' lines in the group call.
export const CALL_GAP_MS = 180;

// Title screen: when each teaser card drops (CSS uses the same times).
export const TEASE_FIRST_MS = 500;
export const TEASE_STEP_MS = 900;

// After the freeze: how long the frozen pile holds, then each monologue card.
export const FREEZE_HOLD_MS = 1800;
export const MONOLOGUE_MS = 2800;

// Run layout (CSS px). The phone keeps its 393 x 852 point grid and is scaled with CSS zoom.
export const PHONE_SIZE = { width: 393, height: 852 };
export const RUN_LAYOUT = { bezel: 10, pad: 24, fullMaxWidth: 540, maxZoom: 1.15 };

// The design gallery (?s=, ?play, the overview) opens only on these hosts; elsewhere the page plays.
export const DESIGN_HOSTS = ["localhost", "127.0.0.1"];
export const LAYOUT_CHECK_MS = 500;
// A phone held sideways (tablets are taller than this): the run asks to turn it back and pauses.
export const SIDEWAYS_QUERY = "(orientation: landscape) and (max-height: 500px) and (pointer: coarse)";

export const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];
