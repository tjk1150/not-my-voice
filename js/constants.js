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
export const BANNER_ROOMS = ["dm:harin", "dm:sua", "talk:teacher"];
export const TALK_ORDER = ["talk:teacher", "talk:mom", "talk:tutor", "talk:chaewon"];

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
export const RUN_LAYOUT = { bezel: 10, pad: 24, barGap: 12, bar: 44, fullMaxWidth: 540, maxZoom: 1.15 };

// The design gallery (?s=, ?play, the overview) opens only on these hosts; elsewhere the page plays.
export const DESIGN_HOSTS = ["localhost", "127.0.0.1"];
export const LAYOUT_CHECK_MS = 500;

// Share card canvas (Instagram story size) and its colours.
export const CARD_SIZE = { width: 1080, height: 1920 };
export const CARD_COLORS = { bg: "#0b0c10", panel: "#1a1d27", text: "#ffffff", dim: "#9aa0ab", accent: "#6f7dff", alert: "#ff453a", chip: "#2b3170" };
export const CARD_FONT = "Pretendard, -apple-system, 'Apple SD Gothic Neo', sans-serif";

export const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];
