// Mockup content. ME stands in for the player's name typed at the start (kept on device only).
// Player name typed at the start; kept in memory only. "지우" is the mockup default.
export let ME = "지우";

// Account ids unrelated to the typed name, so they never contradict it (matches the sky profile photo).
// daejeon: the school's anonymous "대신 전해드립니다" account that posts the fake.
export const PEOPLE = { meId: "sky_0731", daejeon: "ojung.daejeon" };

const PALETTE = ["#8fa6c9", "#c99a8f", "#9fbf9a", "#b9a3d1", "#d4b483", "#86b8b8", "#c98fb0", "#a0a8b5"];

export function color(name) {
  let hash = 0;
  for (const ch of name) hash = (hash * 31 + ch.codePointAt(0)) >>> 0;
  return PALETTE[hash % PALETTE.length];
}

// What the fake clip makes "me" say: a synthetic voice over my own public vlog footage.
// It opens with the very sentence the player read aloud in the prologue, then turns.
const fakeLine = (name) => `안녕하세요, 저는 ${name}입니다.<br>수아 걔 진짜 역겹지 않냐?<br>내일 애들이랑 확실히 밟아 줄 거야.`;
export let FAKE_LINE = fakeLine(ME);

// The one reply the player can send in the class room (a send button, not a choice). It backfires.
export const DENY_TEXT = "나 아니야. 나 그런 말 한 적 없어";

// Reels made with "my" AI voice, shown on the audio page of the fake reel: [caption, hue].
export const VOICE_MEMES = (name) => [
  [`${name} 목소리로 급식 리뷰`, 0],
  [`${name}한테 아무 말 시키기`, 40],
  ["수아 협박 리믹스", 300],
  [`${name} 버전 사과문ㅋㅋ`, 180],
  [`${name} 목소리 노래방`, 90],
  [`담임쌤께 드리는 말 (${name} ver.)`, 220],
  ["이 목소리로 전화하기 챌린지", 130],
  [`${name} 성대모사 아님 AI임`, 260],
  ["원본보다 더 똑같음", 20],
];

// Phase 1 notifications used on the lock screen, banners and the storm (timetable numbers in comments).
export const LOCK_NOTIFS = [
  { app: "feed", title: "2-3 우리반", body: `지민: ${ME} 이거 너야?`, when: "지금" }, // #1
  { app: "feed", title: "2-3 우리반", body: "지민님이 릴스를 보냈습니다", when: "지금" }, // #2
  { app: "feed", title: "2-3 우리반", body: "서연: 수아한테 이게 무슨 말이야?", when: "지금" }, // #3
];

// Reel comments in order of arrival: [id, text, likes, reply?]. The sheet sorts by likes, so the one
// comment that doubts the clip (1 like) sinks to the bottom as popular ones arrive.
export const REEL_COMMENTS = [
  ["hot_clip", "○○중 2-3이래", 213],
  ["dream_09", "실화냐", 98],
  ["moon.k", "스티커로 가려도 후드 보면 딱 앎", 341],
  ["user_0291", "말투까지 똑같음", 187],
  ["lemon.tree", "이거 AI 아님? 목소리만 입힌 거 같은데", 1, ["dream_09", "아닌데? 본인 계정 태그돼 있음"]],
  ["jimin.__", "수아 불쌍하다", 156],
  ["sky.blue_", "저장함", 44],
  ["k.minji", "내일 학교 난리 나겠네", 132],
  ["o_o.h", "원본 있는 사람", 27],
  ["user_8812", "옆 학교 애들도 봄", 61],
  ["hot_clip", "학폭위 열리겠네", 209],
];

// Storm #28-47: [app, title, body, tag] (tags in design/ai-ethics-v0-phase1-timetable.md).
export const STORM = [
  ["feed", "현우", "영상에 AI라고 써 있지도 않던데", "R"],
  ["voice", "보이스팝", "회원님의 AI 목소리가 '인기 목소리'에 올랐어요", "S4"],
  ["talk", "엄마", "엄마 지금 들어간다", "S1"],
  ["feed", "하린", "나도 이제 애들한테 뭐라고 해야 할지 모르겠어", "S1"],
  ["talk", "담임 선생님", "부모님께도 연락드렸다.", "S1"],
  ["phone", "전화", "엄마 부재중 전화 3통", "S1"],
  ["feed", "메시지 요청", "다른 학교: ○○중 2-3 걔 계정 이거 맞지?", "S2"],
  ["feed", "피드", "hot_clip님이 릴스를 공유했습니다: ○○중 학폭 가해자 계정", "S2"],
  ["feed", "피드", "메시지 요청 4건", "S2"],
  ["feed", "옆 반", "너 진짜 수아 밟는다고 했어?", "S2"],
  ["feed", "피드", "회원님의 브이로그 조회수 2만 회", "S3"],
  ["feed", "메시지 요청", "낯선 계정: 님 예전 브이로그 다 저장함", "S3"],
  ["feed", "피드", "dream_09님이 회원님의 브이로그에 댓글을 남겼습니다", "S3"],
  ["feed", "피드", "회원님의 브이로그에 새 댓글 34개", "S3"],
  ["feed", "메시지 요청", "낯선 계정: 교문 보니까 ○○중 맞네", "S3"],
  ["feed", "메시지 요청", "브이로그 원본 있어요?", "S3"],
  ["voice", "보이스팝", "회원님의 AI 목소리로 새 작품 8개가 만들어졌어요", "S4"],
  ["feed", "준호", "억양까지 똑같아서 소름", "S4"],
  ["talk", "채원", "보이스팝 인기 목소리에 니 목소리 있던데?", "S4"],
  ["feed", "피드", "낯선 계정님이 회원님의 브이로그를 공유했습니다", "S3"],
];

// Illustrated profile pictures (generated-images/ai-ethics, cropped into img/). The player never sees their own face: "me" is a sky photo.
export const PHOTOS = {
  me: "moonk", "지민": "jimin", "jimin.__": "jimin", "서연": "seoyeon", "도윤": "doyun", "현우": "hyunwoo", "하린": "harin",
  "예린": "yerin", "수아": "sua", "태윤": "taeyun", "가은": "gaeun", "민서": "minseo", "준호": "junho",
  hot_clip: "hotclip", "moon.k": "sunset", dream_09: "dream09",
  "담임 선생님": "teacher", "엄마": "mom", "학원 선생님": "tutor", "가족": "mom",
};

// The first screen, before the name: what this is, in one breath.
// A teaser: three notifications from the night drop onto a black screen one by one, then the hook.
export const TITLE = {
  teaser: [
    { app: "feed", title: "2-3 우리반", body: "지민: 이거 너야?", when: "오후 11:00" },
    { app: "feed", title: "피드", body: "회원님이 태그된 릴스 조회수 1만 회", when: "오후 11:06" },
    { app: "talk", title: "담임 선생님", body: "학교폭력 신고가 들어왔다.", when: "오후 11:07" },
  ],
  hook: "분명 내 목소리인데,<br>나는 그런 말을 한 적이 없다.",
  title: "내가 하지 않은 말",
  note: "AI 윤리 체험 · 약 15분 · 소리를 켜 주세요",
  cta: "휴대폰 켜기",
};

// After the freeze, before the rewind: what the player is left alone with ([small line, big line]).
export const MONOLOGUE = [
  ["", "내가 안 했어."],
  ["", "왜 다들 내가 했다고<br>생각하는 거야."],
  ["", "누구한테 말해야 할지<br>모르겠어."],
];
export const REWIND_PROMPT = ["", "이 밤은 어디서부터<br>시작됐을까?"];

// What the ending's share button sends. No name and nothing personal: only the question and the link.
export const SHARE = {
  title: "내가 하지 않은 말",
  text: "AI가 만든 내 목소리 하나로 하룻밤에 알림 47개. 너라면 어디서 막을 수 있을까?",
};

// The story-sized share card (text only; the player's pick is filled in, never their name).
export const SHARE_CARD = {
  kicker: "AI 윤리 체험",
  title: "내가 하지 않은 말",
  lines: ["AI가 만든 내 목소리 하나로", "하룻밤에 알림 47개"],
  ask: ["남은 알림 5개 중", "가장 먼저 바뀌어야 할 것"],
  mine: "내 선택",
  question: "너라면 뭘 고를래?",
  cta: "직접 겪어 보기",
};
export const PICK_PROMPT = { title: "남은 5개 중 가장 먼저 바뀌어야 할 것은?", sub: "고른 답이 공유 카드에 들어가요. 이름은 들어가지 않아요." };

// Prologue, two weeks earlier: an AI cover-song app. The player taps "전체 동의", which also turns on
// the optional "share my AI voice" consent. Stop 4 of phase 2 returns to this screen.
export const VOICE_APP = {
  name: "보이스팝",
  tagline: "10초 녹음이면 좋아하는 노래를 내 목소리로",
  consents: [
    { req: true, text: "서비스 이용약관" },
    { req: true, text: "개인정보 수집·이용 (음성 녹음)" },
    { req: false, text: "녹음한 목소리를 AI 학습에 활용", note: "더 자연스러운 AI 목소리를 만드는 데 쓰여요" },
    { req: false, text: "내 AI 목소리 공개", note: "다른 이용자도 내 목소리로 노래와 말을 만들 수 있어요" },
    { req: false, text: "이벤트·혜택 알림 받기" },
  ],
  songs: ["봄날의 정류장", "여름밤 산책", "별빛 메아리"],
  script: (name) => `안녕하세요, 저는 ${name}입니다.<br>오늘도 좋은 하루 보내세요.`,
};

export let SONG = VOICE_APP.songs[0];

export function setPlayer(name, song) {
  ME = name;
  FAKE_LINE = fakeLine(name);
  SONG = VOICE_APP.songs[song] ?? VOICE_APP.songs[0];
}
