// Phase 2 content: when each stop happens, what the white card asks, and what is learned.
// Dates are 2026; phase 1 ends 10/19 23:12. Requirement names appear here for the first time.

export const PHASE1_END = new Date(2026, 9, 19, 23, 12);
export const NEW_NIGHT = new Date(2026, 9, 19, 23, 0);

export const STOPS = [
  {
    tag: "S1",
    at: new Date(2026, 9, 19, 23, 3),
    when: "멈춤 1 · 오늘 밤 오후 11:03",
    ask: "그때 당신은 친구들에게 해명만 하고, 어른들에게는 아무 말도 하지 않았어요.<br>지금이라면 무엇을 할 수 있을까요?",
    lesson: {
      title: "증거를 남기고, 어른에게 먼저",
      text: "단톡방에서 해명하는 것만으로는 퍼지는 걸 막을 수 없어요. 캡처로 증거를 남기고 보호자와 선생님께 먼저 알리면, 어른들이 신고보다 내 이야기를 먼저 듣게 돼요.",
      tags: ["⑧ 책임성", "⑨ 안전성"],
    },
  },
  {
    tag: "S2",
    at: new Date(2026, 9, 14, 21, 15),
    when: "멈춤 2 · 5일 전 오후 9:15",
    ask: "프로필을 고치던 순간이에요.<br>모르는 사람이 이 프로필로 당신을 찾을 수 있는 말을 모두 눌러 지워 보세요.",
    lesson: {
      title: "학교, 생일, 동네, 학원은 나를 찾아오는 길",
      text: "프로필에 적은 학교와 반, 생일, 사는 동네, 다니는 학원은 모르는 사람이 나를 찾아 태그하고 연락하는 길이 돼요. 친구들은 소개를 보지 않아도 나를 알아요.",
      tags: ["② 프라이버시 보호"],
    },
  },
  {
    tag: "S3",
    at: new Date(2026, 9, 12, 16, 20),
    when: "멈춤 3 · 1주 전 오후 4:20",
    ask: "교문 앞 브이로그를 올린 순간이에요. 얼굴은 스티커로 가렸어요.<br>그래도 이 영상으로 알 수 있는 것을 모두 눌러 보세요.",
    chips: ["목소리", "후드 차림", "교문"],
    after: "모두 알아볼 수 있어요. 게다가 이 계정은 전체 공개라 누구나 영상을 보고 내려받을 수 있어요.",
    lesson: {
      title: "가려도 알아볼 수 있어요",
      text: "얼굴을 가려도 목소리, 옷, 교문으로 알아볼 수 있어요. 전체 공개 영상은 누구나 내려받아 다시 쓸 수 있고, 가짜 영상의 화면도 여기서 나왔어요.",
      tags: ["② 프라이버시 보호"],
    },
  },
  {
    tag: "S4",
    at: new Date(2026, 9, 5, 19, 10),
    when: "멈춤 4 · 2주 전 오후 7:10",
    ask: "보이스팝을 처음 켠 순간이에요. 그때 당신은 \"전체 동의\"를 눌렀어요.<br>이 앱을 쓰는 데 꼭 필요하지 않은 동의를 꺼 보세요.",
    lesson: {
      title: "전체 동의 안의 선택 동의",
      text: "전체 동의 안에는 꼭 필요하지 않은 동의가 섞여 있어요. 내 목소리도 내 개인정보예요. 공개하면 다른 사람이 내 목소리로 내가 하지 않은 말을 만들 수 있어요.",
      tags: ["② 프라이버시 보호", "⑦ 데이터 관리"],
    },
  },
];

// The new night: the five notifications nobody but others could have stopped, then two warm replies.
export const WARM = [
  ["talk", "엄마", "얘기해 줘서 고마워. 내일 같이 학교 가자"],
  ["talk", "담임 선생님", "먼저 말해 줘서 고맙다. 내일 같이 확인해 보자."],
];

// Where each remaining notification came from (same order as the R notifications in the timeline).
export const REMAINING = [
  { who: "처음 공유한 친구", why: "받은 영상을 확인하지 않고 퍼뜨렸어요", req: "① 인권 보장" },
  { who: "목소리 합성 앱", why: "본인인지 확인하지 않고 내 목소리로 말을 만들게 했어요", req: "④ 침해금지 · ⑨ 안전성" },
  { who: "추천 알고리즘", why: "자극적인 영상을 더 많은 사람에게 보여 줬어요", req: "⑤ 공공성" },
  { who: "신고 처리", why: "신고해도 \"검토 중\"이라는 답만 왔어요", req: "⑧ 책임성" },
  { who: "AI 표시 없는 영상", why: "AI로 만든 영상이라는 표시가 없어 진짜처럼 보였어요", req: "⑩ 투명성" },
];

// The lesson card's button: back to an earlier stop, or (after the last stop) forward to the night itself.
// Stop 2: the bio, token by token. Personal ones point strangers to me; the hobby does not.
export const BIO = [
  { key: "school", text: "○○중 2-3", personal: true },
  { key: "birth", text: "3월 14일생", personal: true },
  { key: "town", text: "○○동", personal: true },
  { key: "academy", text: "○○수학학원", personal: true },
  { key: "hobby", text: "노래 부르는 거 좋아함", personal: false },
];

export const LESSON_BUTTON = { back: "계속 되감기", forward: "다시 재생하기" };

// Stop 1: the player's answer when mom asks whether the reel was reported.
export const MOM_REPLY = "아직. 지금 신고할게";

export const CHANGED = ["어른에게 알리고 신고하기", "프로필에서 학교, 생일, 동네, 학원 지우기", "브이로그 계정 비공개로 바꾸기", "앱의 선택 동의 끄기"];

// Ending copy: the drop in one line, what the player changed, then the question over the five cards that remain.
export const END = {
  head: "나를 가해자로 몰던 알림이<br>47개에서 5개로 줄었어요.",
  changed: "내가 바꾼 것",
  question: "누구의 책임일까요?",
  tip: "남은 알림을 하나씩 눌러 보세요",
  note: "AI를 만든 사람도, 서비스로 내놓은 회사도, 영상을 받아 퍼뜨린 사람도 각자 책임이 있어요.",
};

export const HELP = [
  ["phone", "117", "학교폭력 신고·상담, 24시간 (문자 #0117)"],
  ["message-circle", "1388", "청소년 상담, 24시간 (전화, 문자, 카카오톡)"],
  ["shield-alert", "경찰청 사이버범죄 신고", "ecrm.police.go.kr (상담 182)"],
  ["trash-2", "1377", "방송미디어통신심의위원회, 불법 정보 삭제 요청"],
];

