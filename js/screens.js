// Screens in game order, grouped by stage. Each step says what happens and what blinks next.
import * as feed from "./feed-screens.js";
import * as talk from "./talk-screens.js";
import * as ios from "./ios-screens.js";
import * as intro from "./intro-screens.js";
import * as R from "./run/rewind-views.js";
import { STOPS, NEW_NIGHT } from "./run/rewind-data.js";
import { allCounted } from "./run/timeline.js";
import { consentScreen } from "./voice-screens.js";
import { VOICE_APP, MONOLOGUE, REWIND_PROMPT } from "./data.js";
import { lock } from "./run/views.js";
import { clockText } from "./utils.js";

// Gallery only: lay a phase 2 overlay on top of a screen.
const over = (html, overlay) => html.replace(/<\/div>\s*$/, `${overlay}</div>`);
const hudAt = (day, time) => R.hud(false).replace('<b class="rw-day"></b>', `<b class="rw-day">${day}</b>`).replace('<span class="rw-time"></span>', `<span class="rw-time">${time}</span>`);
const remaining = () => allCounted().filter((item) => item.tag === "R");

export const STAGES = [
  {
    id: "intro",
    title: "도입 · 1분 30초",
    steps: [
      ["title", "첫 화면", "그날 밤 알림 3개가 하나씩 떨어진 뒤 \"분명 내 목소리인데, 나는 그런 말을 한 적이 없다.\"와 제목, \"휴대폰 켜기\". 소리는 이 버튼을 누른 뒤부터 난다.", () => intro.titleScreen()],
      ["name", "이름 입력", "입력한 이름은 이후 모든 메시지, 영상 설명, 녹음 문장에 들어간다. 녹음과 촬영은 하지 않는다.", intro.nameInput],
      ["card-before", "2주 전", "검은 화면에 시간만 보인다.", () => intro.card("2주 전", "오후 7:10")],
      ["voice-consent", "보이스팝 약관", "AI 커버곡 앱. \"전체 동의\"가 깜빡인다. 선택 항목 안에 \"내 AI 목소리 공개\"가 섞여 있다. 프롤로그에서는 항목을 하나씩 누를 수 없다.", intro.voiceConsent],
      ["voice-consent-all", "전체 동의 후", "다섯 항목이 모두 켜지고 \"동의하고 시작하기\"가 깜빡인다.", intro.voiceConsentAll],
      ["voice-song", "노래 고르기", "보기 셋 중 하나를 고른다. 고른 노래가 완성 화면에 나온다.", intro.voiceSong],
      ["voice-record", "목소리 녹음", "내 이름이 들어간 문장을 읽는 화면. 마이크는 열지 않고 파형만 움직인다.", intro.voiceRecord],
      ["voice-done", "내 AI 목소리 완성", "\"내 AI 목소리 · 전체 공개\"가 켜져 있다. 3초 뒤 검은 화면.", intro.voiceDone],
      ["card-after", "그리고 2주 뒤", "곧바로 잠금 화면으로 넘어간다. 밤이라 미디어 볼륨은 0.", () => intro.card("그리고 2주 뒤", "오후 11:00")],
    ],
  },
  {
    id: "phase1",
    title: "1단계 그날 밤 · 3분",
    steps: [
      ["lock", "잠금 화면 0:00", "반 DM방 알림 #1~3이 쌓인다. 알림을 누르면 홈으로.", ios.lock],
      ["home", "홈 · 피드 깜빡임", "피드 아이콘이 깜빡인다. 보이스팝도 홈 화면에 있다.", ios.home],
      ["dm-inbox", "피드 DM 목록", "2-3 우리반이 맨 위. 이틀 전 수아와의 평범한 대화가 아래에 있다.", feed.dmInbox],
      ["dm-group", "반 DM방 0:05~0:47", "지민의 \"이거 너야?\"와 대전 계정의 릴스, 다섯 명의 공유, 수아가 방을 나감. 대본이 끝나면 미리 채워진 \"나 아니야\"의 보내기가 깜빡이고, 보내면 \"AI 핑계 대는 거 봐\", \"그럼 증거 있어?\"가 돌아온다. 2:42에 방에서 내보내진다.", feed.dmGroup],
      ["banner", "앱 안 배너 0:50", "하린의 DM이 위에서 내려온다. 배너가 깜빡인다.", ios.banner],
      ["dm-one", "1:1 DM 하린", "\"괜찮아? 말 좀 해봐\". 입력창은 비어 있고 답할 수 없다. 뒤로 가면 아래 릴스 탭이 깜빡인다.", feed.dmOne],
      ["reels", "릴스 0:55", "○○중 대신 전해드립니다 계정의 [제보] 릴스. 소리 없이(미디어 볼륨 0) 자동 자막, 스티커로 가린 얼굴, 내 계정 태그. 댓글이 깜빡인다.", feed.reels],
      ["comments", "릴스 댓글", "좋아요 순 정렬. \"이거 AI 아님?\"(좋아요 1)이 인기 댓글에 밀려 맨 아래로 내려간다.", feed.comments],
      ["audio", "릴스 오디오", "\"보이스팝 · 내 계정의 AI 목소리\"를 누르면, 내 목소리로 만든 밈 릴스가 12개에서 34개로 늘어난다.", feed.audioPage],
      ["more", "릴스 더보기", "신고가 깜빡인다.", feed.moreSheet],
      ["report", "신고 사유", "\"합성·조작된 콘텐츠\"가 깜빡인다.", feed.reportReasons],
      ["report-done", "신고 접수", "\"검토 중입니다\". 다시 들어가도 같은 문구다.", feed.reportDone],
      ["activity", "알림(하트) 1:00~1:50", "태그, 댓글, 새 팔로워가 쌓인다. 마지막에 담임의 톡 알림 #19가 온다.", feed.activity],
      ["home-talk", "홈 · 톡 깜빡임 1:55", "피드를 나오면 톡이 깜빡인다. 엄마의 부재중 전화가 온다.", () => ios.home("talk", { feed: 19, talk: 6, phone: 1, voice: 1 })],
      ["talk-list", "톡 목록", "담임 선생님 방이 깜빡인다.", talk.talkList],
      ["talk-teacher", "톡 담임 선생님", "\"학교폭력 신고가 들어왔다. 내일 아침 8시까지 교무실로 와라.\"", talk.talkRoomTeacher],
      ["talk-mom", "톡 엄마", "오후 3:07의 평범한 대화 아래 \"수아 엄마가 학부모 단톡방에 영상을 올렸대\".", talk.talkRoomMom],
      ["storm", "폭풍 2:50 → 정지 2:55", "알림 20개가 0.25초 간격으로 기울어진 채 쌓이고, 화면이 얼어붙으며 \"알림 47\". 음악이 끊긴다.", ios.storm],
      ["monologue", "정지 뒤 독백", `검은 화면에 한 줄씩(2.8초 간격): ${MONOLOGUE.map(([, main]) => main.replace("<br>", " ")).join(" / ")}`, () => intro.monoCard(...MONOLOGUE[1])],
      ["rewind-prompt", "되감기 버튼", "\"어떻게 이런 일이 일어난 걸까?\"와 \"되감기\". 화면 어디를 눌러도 2단계가 시작된다.", () => intro.monoCard(...REWIND_PROMPT, '<button class="rw-go">되감기</button>')],
    ],
  },
  {
    id: "phase2",
    title: "2단계 되감기 · 8분",
    steps: [
      ["rw-travel", "되감기", "얼어붙은 화면에서 \"되감기\"를 누르면 시계와 날짜가 거꾸로 돈다. 위에는 남은 알림 수.", () => over(lock({ lockNotifs: [], clock: "11:12" }), R.counter(47) + hudAt("10월 19일 (월)", "오후 11:07"))],
      ["rw-stop1", "멈춤 1 · 흰 안내창", "그날 밤 11:03의 릴스에서 멈춘다.", () => over(R.reelAt("11:03"), R.counter(47) + R.dialog(STOPS[0]))],
      ["rw-share", "멈춤 1 · 캡처해서 엄마에게", "화면 캡처 → 썸네일 → 공유 시트에서 엄마. 다른 사람을 누르면 \"먼저 보호자에게\" 안내.", () => over(R.shareSheet("11:03"), R.counter(47))],
      ["rw-mom", "멈춤 1 · 엄마의 답", "\"캡처 잘했다. 엄마가 지금 갈게\". 뒤로 가서 릴스를 합성·조작으로 신고한다.", () => over(R.momRoom("11:03", [{ who: "me", text: R.shotBubble() }, { who: "me", text: "엄마 이거 나 아니야. 누가 내 목소리를 AI로 만들어서 올렸어", time: "오후 11:03" }, { who: "엄마", text: "알았어. 캡처 잘했다.", first: true }, { who: "엄마", text: "엄마가 지금 갈게. 담임 선생님께도 같이 말씀드리자" }, { who: "엄마", text: "영상은 신고해 둬", time: "오후 11:03" }], true), R.counter(47))],
      ["rw-shatter", "알림이 깨짐", "그 원인에서 나온 알림이 쌓였다가 하나씩 깨지고 숫자가 준다.", () => over(R.reelAt("11:03"), R.counter(41) + R.pile(allCounted().filter((item) => item.tag === "S1")))],
      ["rw-lesson", "교훈 카드", "여기서 요건 이름이 처음 붙는다.", () => over(R.reelAt("11:03"), R.counter(35) + R.lesson(STOPS[0].lesson, 47, 35))],
      ["rw-stop2", "멈춤 2 · 프로필 편집", "소개의 \"○○중 2-3\"을 눌러 지운다. 취미를 누르면 \"다른 말을 찾아보세요\".", () => over(R.profileEdit("9:15", { blinkSchool: true }), R.counter(35))],
      ["rw-stop3", "멈춤 3 · 알아볼 수 있는 것", "목소리, 후드 차림, 교문을 모두 누른 뒤 비공개로 바꾼다.", () => over(R.vlogUpload("4:20"), R.counter(24) + R.dialog({ ...STOPS[2], picked: [0, 2], button: "공개 범위 바꾸기" }))],
      ["privacy", "멈춤 3 · 계정 공개 범위", "비공개 전환.", feed.privacy],
      ["rw-stop4", "멈춤 4 · 선택 동의 끄기", "프롤로그의 약관 화면. 이번에는 항목을 하나씩 누를 수 있다. 필수는 꺼지지 않는다.", () => over(consentScreen({ clock: "7:10", checked: VOICE_APP.consents.map((_, index) => index !== 3), tappable: true }), R.counter(13))],
      ["rw-night", "새로운 그날 밤", "앞으로 감겨 11:00. 남은 알림 5개와 엄마, 담임의 답.", () => over(lock({ lockNotifs: remaining().reverse(), clock: clockText(NEW_NIGHT) }), R.counter(5))],
      ["ending", "엔딩", "47과 5, 바꾼 것 네 가지. 카드를 뒤집으면 출처와 요건. 다 뒤집으면 두 줄 아래 \"도움받을 수 있는 곳\", 그 아래 \"처음부터 다시 하기\"(테두리)와 \"공유하기\"(메인).", () => R.ending(remaining(), [0, 1, 2, 3, 4], true)],
    ],
  },
];

export const ALL = STAGES.flatMap((stage) => stage.steps.map((step) => ({ stage, id: step[0], label: step[1], note: step[2], render: step[3] })));
