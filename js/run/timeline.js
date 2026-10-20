// Phase 1 events, copied from design/ai-ethics-v0-phase1-timetable.md. t = real seconds from 0:00.
// "to" is where a tap on the notification leads; "room" + "msg" add a line to that room when it fires.
// "tag" is the cause the notification comes from; phase 2 shatters each tag's notifications.
import { ME, PEOPLE, STORM } from "../data.js";

const n = (t, tag, app, title, body, extra = {}) => ({ t, tag, type: "notif", app, title, body, ...extra });
const line = (t, room, who, text) => ({ t, type: "line", room, msg: { who, text } });
// Act 2: someone sends me the reel with one line. Known people get a thread, strangers a request.
// "extra" fills the heart (activity) tab quietly: tags, likes, comments and follows that come with the spread.
const share = (t, tag, room, who, text, extra = {}) => n(t, tag, "feed", who, `릴스를 보냈습니다 · ${text}`, { to: room, room, share: { who, text }, ...extra });
const request = (t, tag, who, text, reel = true, extra = {}) => n(t, tag, "feed", "메시지 요청", reel ? `${who}님이 릴스를 보냈습니다: ${text}` : `${who}: ${text}`, { to: "dm:request", request: { who, text, reel }, ...extra });

export const SCHOOL_NOTICE = () => `<b>[○○중] 학교폭력 사안 접수 안내</b><br>2학년 3반 ${ME} 학생 관련 사안이 접수되었습니다. 10월 20일(화) 오전 8시, 보호자와 함께 교무실로 오시기 바랍니다.`;

// Built after the name is typed, so every line carries the player's name.
export const buildPhase1 = () => [
  // Act 1, friends: the class DM room, where 지민 shares the reel and the player watches it (#1-7)
  n(0, "R", "feed", "2-3 우리반", `지민: ${ME} 이거 너야?`, { to: "dm-group" }),
  // The voice app itself, which let anyone make my voice say anything (ending card "합성 앱").
  n(1, "R", "voice", "보이스팝", "회원님의 AI 목소리로 '말하기' 영상이 만들어졌어요", { to: "" }),
  n(2, "S4", "feed", "2-3 우리반", "서연: 수아한테 이게 무슨 말이야?", { to: "dm-group" }),
  n(3, "S3", "feed", "2-3 우리반", "새 메시지 12개", { to: "dm-group" }),
  { t: 15, type: "call" },
  n(40, "S2", "feed", "예린", "너 대전에 태그돼 있던데", { to: "dm:yerin", room: "dm:yerin", msg: { who: "예린", text: "너 대전에 태그돼 있던데" } }),
  line(41, "dm:yerin", "예린", "진짜 수아한테 그랬어?"),
  n(47, "S1", "feed", "2-3 우리반", "서연: 수아한테 사과는 해야지", { to: "dm-group", nudge: true }),
  n(50, "S1", "feed", "하린", "괜찮아? 이거 진짜 너 아니지? 말 좀 해봐", { to: "dm:harin", room: "dm:harin", msg: { who: "하린", text: "괜찮아?" } }),
  line(51, "dm:harin", "하린", "이거 진짜 너 아니지?"),
  line(52, "dm:harin", "하린", "말 좀 해봐"),
  // Act 2, it spreads: the same reel keeps arriving in my DMs, from farther and farther away (#8-15).
  // The player opens the first one and sees the numbers climb; there is nothing to do but watch.
  share(53, "S2", "dm:minjae", "민재", "너네 반 걔 맞지? 대전에 태그돼 있던데", { act: [PEOPLE.daejeon, "님이 회원님을 릴스에 태그했습니다."] }),
  request(58, "S2", "moon-k", "너가 그 ○○중 2-3 걔임?", true, { act: ["jimin-2-3", "님 외 22명이 회원님이 태그된 릴스를 좋아합니다."] }),
  share(62, "R", "dm:jiwon", "지원", "추천에 떠서 봤어. 이거 너 아니지?"),
  share(68, "S3", "dm:yuna", "유나", "학원 애들 다 봄. 브이로그 목소리랑 완전 똑같던데", { act: ["dream-09", "님이 회원님의 게시물에 댓글을 남겼습니다: 브이로그 목소리랑 완전 똑같네", "post"] }),
  request(74, "S3", "dream-09", "후드 보니까 딱 너던데ㅋㅋ", true, { follow: 3 }),
  share(80, "S3", "dm:hajun", "하준", "3학년 단톡에도 돌아. 교문 보니까 너네 학교 맞네", { act: ["moon-k", "님이 회원님이 태그된 릴스에 댓글을 남겼습니다: 스티커로 가려도 후드 보면 딱 앎"] }),
  request(86, "S2", "hot-clip", "수아 협박한 애 계정 여기 맞음?ㅋㅋ", true, { act: ["hot-clip", "님이 회원님을 언급했습니다: 수아 협박한 애 계정 여기임"] }),
  request(92, "S2", "seojun-b", "다른 학교인데 우리 반 단톡에도 올라옴"),
  n(98, "S1", "feed", "2-3 우리반", "도윤: 왜 아무 말도 안 함? 진짜인가 보네", { to: "dm-group", room: "dm-group", msg: { who: "도윤", text: "왜 아무 말도 안 함? 진짜인가 보네" }, deniedBody: "도윤: 해명 끝? 증거는 없고?", deniedMsg: { who: "도윤", text: "해명 끝? 증거는 없고?" } }),
  // 수아 herself closes act 2, still inside 피드.
  n(100, "S4", "feed", "수아", "나한테 왜 그랬어?", { to: "dm:sua", room: "dm:sua", msg: { who: "수아", text: "나한테 왜 그랬어?" } }),
  line(101, "dm:sua", "수아", "나 내일 학교 못 가겠어"),
  n(104, "S4", "voice", "보이스팝", "회원님의 AI 목소리로 만든 영상이 34개가 되었어요", { to: "" }),
  n(108, "R", "feed", "피드", "신고하신 릴스는 검토 중입니다", { to: "reels", unreported: "회원님이 태그된 릴스 조회수 1만 회" }),
  // Act 3, the adults: a 톡 banner carries the player from 피드 to 톡 (#19-27).
  n(112, "S1", "talk", "담임 선생님", `${ME}, 학교폭력 신고가 들어왔다.`, { to: "talk:teacher", room: "talk:teacher", msg: { who: "담임 선생님", text: `${ME}, 학교폭력 신고가 들어왔다.` } }),
  line(113, "talk:teacher", "담임 선생님", "내일 아침 8시까지 교무실로 와라."),
  n(118, "S1", "phone", "전화", "엄마 부재중 전화", { to: "talk:mom" }),
  n(123, "S1", "talk", "엄마", "수아 엄마가 학부모 단톡방에 영상을 올렸대", { to: "talk:mom", room: "talk:mom", msg: { who: "엄마", text: "수아 엄마가 학부모 단톡방에 영상을 올렸대" } }),
  line(124, "talk:mom", "엄마", "이게 무슨 일이니"),
  line(125, "talk:mom", "엄마", "전화 받아"),
  n(129, "S2", "talk", "학원 선생님", `${ME}, 학원 아이들 사이에 영상이 돌던데 무슨 일 있니?`, { to: "talk:tutor", room: "talk:tutor", msg: { who: "학원 선생님", text: `${ME}, 학원 아이들 사이에 영상이 돌던데 무슨 일 있니?` } }),
  n(141, "S4", "talk", "채원", "우리 학원 단톡에도 올라왔어", { to: "talk:chaewon", room: "talk:chaewon", msg: { who: "채원", text: "우리 학원 단톡에도 올라왔어" } }),
  line(142, "talk:chaewon", "채원", "다들 니 목소리 맞대"),
  request(147, "S2", "낯선 계정", "프로필에 ○○중 2-3 써 놨네", false),
  n(155, "S1", "talk", "엄마", "학교에서 문자 왔어", { to: "talk:mom", room: "talk:mom", msg: { who: "엄마", text: "학교에서 문자 왔어" } }),
  { t: 156, type: "line", room: "talk:mom", msg: { who: "엄마", text: SCHOOL_NOTICE(), preview: "[○○중] 학교폭력 사안 접수 안내", notice: true } },
  n(162, "S1", "feed", "2-3 우리반", "지민님이 회원님을 내보냈습니다", { to: "dm-group", kick: true }),
  { t: 170, type: "storm" },
  { t: 175, type: "freeze" },
];

// All 47 counted notifications with their cause, for phase 2: [{ app, title, body, tag }].
export const allCounted = () => [
  ...buildPhase1().filter((ev) => ev.type === "notif").map(({ app, title, body, tag }) => ({ app, title, body, tag })),
  ...STORM.map(([app, title, body, tag]) => ({ app, title, body, tag })),
];

// Storm cards #28-47 arrive every 0.25 s from 2:50.
export { STORM };

export const PHASE_LENGTH = 180;
export const SECONDS_PER_GAME_MINUTE = 15;
