// Room content for phase 1. The class DM room opens empty and plays its script line by line
// (vaccine rhythm: system lines 0.4 s apart, messages about 1 s apart with a typing indicator).
// Other rooms start with ordinary history; new lines arrive from the timeline.
import { ME } from "../data.js";

const say = (who, text) => ({ who, text });
const sys = (text) => ({ sys: text });

export const groupScript = () => [
  { day: "오늘 오후 11:00" },
  say("지민", `${ME} 이거 너야?`),
  { who: "지민", reel: true },
  say("서연", "수아한테 이게 무슨 말이야?"),
  say("도윤", "밟아 준다고? 미쳤네"),
  say("현우", "목소리 완전 걔인데"),
  ...["민서", "태윤", "가은", "준호", "예준"].map((name) => sys(`${name}님이 릴스를 공유했습니다`)),
  say("서연", "브이로그 그 후드 맞잖아"),
  say("가은", "수아 지금 울고 있대"),
  sys("수아님이 대화방을 나갔습니다"),
  say("지민", "수아 나갔다. 어떡할 거야"),
];

// The class room keeps going at 0:47 (a player who has not answered also gets "읽씹 실화?").
export const STAYED_LINES = [say("지민", "읽씹 실화?"), say("서연", "수아한테 사과는 해야지"), say("지민", "대전에도 올라왔더라ㅋㅋ 다른 학교 애들도 봄")];

// The player tries to explain three times, by picking a reply chip, and each try fails differently:
// the class mocks it, a friend doubts it, and 수아 cannot be reached. "after" waits for the room's own
// lines (game seconds); "answers" arrive one by one; "closed" replaces the composer once sent.
export const REPLIES = {
  "dm-group": {
    chips: ["나 아니야. 나 그런 말 한 적 없어", "AI로 만든 거야. 내 목소리 아니야"],
    answers: [say("도윤", "AI 핑계 대는 거 봐ㅋㅋ"), say("서연", "그럼 증거 있어?"), say("현우", "녹음이 거짓말하냐?"), say("지민", "인사도 브이로그랑 똑같던데")],
  },
  "dm:harin": {
    after: 52,
    chips: ["진짜 나 아니야. 믿어 줘"],
    answers: [say("하린", "근데 목소리가 너잖아…"), say("하린", "나도 모르겠어")],
  },
  "dm:sua": {
    after: 101,
    chips: ["내가 한 거 아니야. 진짜야"],
    answers: [sys("메시지를 보내지 못했습니다. 수아님이 메시지를 받지 않아요")],
    closed: "수아님에게 메시지를 보낼 수 없습니다.",
  },
};

export const KICK_LINES = [sys("지민님이 회원님을 내보냈습니다")];

// The classmates' voices in the group call, in order. Spoken text lives in tools/make-call-audio.mjs,
// which renders these files; the player's own voice is never heard.
export const CALL_AUDIO = [
  { who: "지민", file: "audio/call-1-jimin.mp3" },
  { who: "도윤", file: "audio/call-2-doyun.mp3" },
  { who: "서연", file: "audio/call-3-seoyeon.mp3" },
  { who: "현우", file: "audio/call-4-hyunwoo.mp3" },
  { who: "지민", file: "audio/call-5-jimin.mp3" },
];

// The "ended" line gets the real call length when it is queued.
export const CALL_LINES = {
  answered: [say("도윤", "숨소리만 들리던데ㅋㅋ")],
  missed: [sys("놓친 음성 통화"), say("지민", "왜 안 받음? 할 말 없나 봐")],
};

export const CALLERS = ["지민", "도윤", "서연", "현우"];

export const ROOMS = {
  "dm-group": { app: "feed", name: "2-3 우리반", sub: "멤버 28명", group: true, history: [] },
  "dm:harin": { app: "feed", name: "하린", sub: "harin-0412", history: [{ day: "오늘 오후 3:12" }, say("me", "체육복 내일 꼭 가져와"), say("하린", "ㅇㅋㅇㅋ"), { day: "오후 11:03" }] },
  "dm:yerin": { app: "feed", name: "예린", sub: "yerin-2-4", history: [{ day: "어제 오후 8:40" }, say("예린", "수행평가 몇 쪽까지야?"), say("me", "48쪽"), { day: "오후 11:02" }] },
  "dm:sua": { app: "feed", name: "수아", sub: "sua-n_n", history: [{ day: "10월 17일 (토) 오후 5:21" }, say("수아", "월요일에 같이 매점 가자"), say("me", "ㅇㅋ 4교시 끝나고"), { day: "오후 11:06" }] },
  // Act 2: the same reel sent to me by people farther and farther from my class (see SHARE_ROOMS).
  "dm:minjae": { app: "feed", name: "민재", sub: "minjae-2-1", history: [{ day: "9월 30일 (화) 오후 4:02" }, say("민재", "체육대회 반티 사진 보내 줘"), say("me", "ㅇㅇ"), { day: "오후 11:03" }] },
  "dm:jiwon": { app: "feed", name: "지원", sub: "jiwon-k", history: [{ day: "9월 7일 (일) 오후 9:15" }, say("지원", "추석 때 할머니 댁에서 봐~"), say("me", "웅웅"), { day: "오후 11:04" }] },
  "dm:yuna": { app: "feed", name: "유나", sub: "yuna-math", history: [{ day: "10월 16일 (목) 오후 10:11" }, say("유나", "내일 학원 몇 시에 끝나?"), say("me", "9시"), { day: "오후 11:04" }] },
  "dm:hajun": { app: "feed", name: "하준", sub: "hajun-3-2", history: [{ day: "10월 2일 (목) 오후 6:30" }, say("하준", "동아리 발표 자료 내일까지"), say("me", "넵"), { day: "오후 11:05" }] },
  "talk:teacher": { app: "talk", name: "담임 선생님", history: [{ day: "2026년 10월 16일 금요일" }, say("담임 선생님", "현장체험학습 신청서 월요일까지 꼭 내세요."), say("me", "네"), { day: "2026년 10월 19일 월요일" }] },
  "talk:mom": { app: "talk", name: "엄마", history: [{ day: "2026년 10월 19일 월요일" }, say("엄마", "학원 끝나면 바로 와"), say("me", "응")] },
  "talk:tutor": { app: "talk", name: "학원 선생님", history: [{ day: "2026년 10월 17일 토요일" }, say("학원 선생님", "이번 주 숙제 23쪽까지"), say("me", "넵"), { day: "2026년 10월 19일 월요일" }] },
  "talk:chaewon": { app: "talk", name: "채원", history: [{ day: "2026년 10월 18일 일요일" }, say("채원", "내일 단어 시험 범위 어디야?"), say("me", "3과까지"), { day: "2026년 10월 19일 월요일" }] },
  // Strangers' messages collect in one request thread, each line under the sender's name.
  "dm:request": { app: "feed", name: "메시지 요청", sub: "팔로우하지 않는 계정", request: true, history: [] },
};

// Share threads in arrival order. Only the first is opened (the reel again, with its numbers); the rest
// pile up in the inbox with the same thumbnail while the player watches.
export const SHARE_ROOMS = ["dm:minjae", "dm:jiwon", "dm:yuna", "dm:hajun"];

// Old threads in the DM inbox, so the list looks lived in.
export const OLD_DMS = [
  ["지민", "릴스를 보냈습니다 · 2분"],
  ["서연", "내일 수행평가 몇 쪽까지야? · 3시간"],
  ["도윤", "ㅇㅋ · 어제"],
  ["태윤", "전송됨 · 3일"],
  ["가은", "회원님이 스토리에 답장했습니다 · 5일"],
];
