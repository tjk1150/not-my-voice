// 피드 screens filled with the phase 1 script (design/ai-ethics-v0-phase1-timetable.md).
import { ic, statusBar } from "./icons.js";
import { ME, PEOPLE, FAKE_LINE, REEL_COMMENTS, VOICE_MEMES, DENY_TEXT } from "./data.js";
import { face } from "./faces.js";
import { clip } from "./clip.js";
import { REEL_GO } from "./constants.js";

const FILLED = new Set(["home", "dm"]);

export const tabbar = (on, dark = false) => {
  const tabs = [["house", "home"], ["square-play", "reels"], ["send", "dm"], ["search", "search"], ["circle-user-round", "me"]];
  return `<nav class="tabbar glass ${dark ? "dark" : ""}">${tabs
    .map(([icon, key]) => `<span class="tab ${key === on ? "on" : ""}" data-go="tab-${key}">${key === "me" ? face("me", 26) + '<i class="pdot"></i>' : ic(icon, 25, key === on ? 2.4 : 2, key === on && FILLED.has(key) ? 'fill="currentColor"' : "")}</span>`)
    .join("")}</nav>`;
};

export const ringAv = (name, size, seen = false) => `<span class="ring ${seen ? "seen" : ""}">${face(name, size)}</span>`;

export function dmInbox() {
  const rows = [
    { name: "2-3 우리반", sub: "지민: 수아 나갔다. 어떡할 거야 · 방금", unread: true, group: true },
    { name: "하린", sub: "괜찮아? 이거 진짜 너 아니지? 말 좀 해봐 · 방금", unread: true, ring: true },
    { name: "예린", sub: "진짜 수아한테 그랬어? · 1분", unread: true },
    { name: "지민", sub: "릴스를 보냈습니다 · 2분" },
    { name: "서연", sub: "내일 수행평가 몇 쪽까지야? · 3시간", ring: true },
    { name: "도윤", sub: "ㅇㅋ · 어제" },
    { name: "수아", sub: "월요일에 같이 매점 가자 · 2일" },
    { name: "태윤", sub: "전송됨 · 3일" },
    { name: "가은", sub: "회원님이 스토리에 답장했습니다 · 5일" },
  ];
  return `
  <div class="screen">
    ${statusBar("11:03")}
    <header class="f-head">
      <span class="title">${PEOPLE.meId} ${ic("chevron-down", 16, 2.2)}<i class="dot"></i></span>
      <span class="act">${ic("square-pen", 24, 2)}</span>
    </header>
    <section class="dm-list">
      ${rows
        .map(
          (r) => `
        <div class="dm-row ${r.unread ? "unread" : ""} ${r.group ? "blink" : ""}">
          ${r.group ? groupAv() : r.ring ? ringAv(r.name, 56) : face(r.name, 56)}
          <div class="txt"><div class="name">${r.name}</div><div class="sub">${r.sub}</div></div>
          ${r.unread ? '<i class="udot"></i>' : ""}
        </div>`
        )
        .join("")}
    </section>
    ${tabbar("dm")}
    <i class="home-ind"></i>
  </div>`;
}

export function groupAv(size = 56) {
  const inner = Math.round(size * 0.68);
  return `<span style="position:relative;width:${size}px;height:${size}px;flex:none">
    <span style="position:absolute;left:0;top:0">${face("지민", inner)}</span>
    <span style="position:absolute;right:0;bottom:0;border:2px solid #fff;border-radius:50%">${face("서연", inner)}</span>
  </span>`;
}

export const bubble = (who, text, opts = {}) => {
  const me = who === "me";
  const showAv = !me && opts.last;
  const name = !me && opts.first && opts.group ? `<span class="who">${who}</span>` : "";
  const cls = [me ? "me" : "", opts.pos || ""].join(" ");
  return `<div class="m ${cls}">${me ? "" : showAv ? face(who, 28) : '<span class="spacer"></span>'}
    <div class="col">${name}${opts.html || `<div class="bub">${text}</div>`}</div></div>`;
};

export const reelCard = (by = PEOPLE.daejeon) => `
  <div class="reelcard">
    ${clip({ caption: FAKE_LINE })}
    <div class="by">${face(by, 22)}<span>${by}</span></div>
    <span class="play">${ic("play", 40, 0, 'fill="#fff"')}</span>
    <span class="tag">${ic("square-play", 18, 2.2)}</span>
  </div>`;

export function dmGroup() {
  return `
  <div class="screen">
    ${statusBar("11:02")}
    <div class="fade-top"></div>
    <header class="r-head">
      <span class="gbtn glass">${ic("chevron-left", 26, 2)}</span>
      <span class="who">${groupAv(40)}
        <span><span class="nm">2-3 우리반 ${ic("chevron-right", 16, 2.2)}</span><span class="hd">멤버 28명</span></span></span>
      <span class="calls"><span class="gbtn glass">${ic("phone", 24, 1.8)}</span><span class="gbtn glass">${ic("video", 24, 1.8)}</span></span>
    </header>
    <section class="msgs">
      <div class="day">오늘 오후 11:00</div>
      ${bubble("지민", `${ME} 이거 너야?`, { group: true, first: true, pos: "grp-top" })}
      ${bubble("지민", "", { last: true, pos: "grp-end", html: reelCard() })}
      ${bubble("서연", "수아한테 이게 무슨 말이야?", { group: true, first: true, last: true })}
      ${bubble("도윤", "밟아 준다고? 미쳤네", { group: true, first: true, last: true })}
      ${bubble("현우", "목소리 완전 걔인데", { group: true, first: true, last: true })}
      <div class="sys">민서님이 릴스를 공유했습니다</div>
      <div class="sys" style="margin-top:0">태윤님이 릴스를 공유했습니다</div>
      <div class="sys" style="margin-top:0">가은님이 릴스를 공유했습니다</div>
    </section>
    <div class="composer"><span class="cam">${ic("camera", 22, 2.2)}</span><span class="ph">메시지 보내기...</span>
      <span class="tools">${ic("mic", 22, 2)}${ic("image", 22, 2)}${ic("sticker", 22, 2)}${ic("circle-plus", 22, 2)}</span></div>
    <i class="home-ind"></i>
  </div>`;
}

// Composer with the prefilled denial and a blinking send button (class room only).
export const denyComposer = () => `<div class="composer typed"><span class="cam">${ic("camera", 22, 2.2)}</span><span class="txt">${DENY_TEXT}</span>
  <span class="sendb" data-go="deny">${ic("arrow-up", 20, 2.6)}</span></div>`;
export const kickedComposer = () => `<div class="composer closed">이 대화방에 더 이상 메시지를 보낼 수 없습니다.</div>`;

export function dmOne() {
  return `
  <div class="screen">
    ${statusBar("11:03")}
    <div class="fade-top"></div>
    <header class="r-head">
      <span class="gbtn glass">${ic("chevron-left", 26, 2)}</span>
      <span class="who">${face("하린", 40)}<span><span class="nm">하린 ${ic("chevron-right", 16, 2.2)}</span><span class="hd">harin-0412</span></span></span>
      <span class="calls"><span class="gbtn glass">${ic("phone", 24, 1.8)}</span><span class="gbtn glass">${ic("video", 24, 1.8)}</span></span>
    </header>
    <section class="msgs">
      <div class="day">오늘 오후 3:12</div>
      ${bubble("me", "체육복 내일 꼭 가져와")}
      ${bubble("하린", "ㅇㅋㅇㅋ", { last: true })}
      <div class="day">오후 11:03</div>
      ${bubble("하린", "괜찮아?", { pos: "grp-top" })}
      ${bubble("하린", "이거 진짜 너 아니지?", { pos: "grp-mid" })}
      ${bubble("하린", "말 좀 해봐", { last: true, pos: "grp-end" })}
    </section>
    <div class="composer"><span class="cam">${ic("camera", 22, 2.2)}</span><span class="ph">메시지 보내기...</span>
      <span class="tools">${ic("mic", 22, 2)}${ic("image", 22, 2)}${ic("sticker", 22, 2)}${ic("circle-plus", 22, 2)}</span></div>
    <i class="home-ind"></i>
  </div>`;
}

export function reels() {
  const acts = [["heart", "1.2만"], ["message-circle", "348"], ["repeat-2", "211"], ["send", "1,904"], ["bookmark", "87"], ["ellipsis", ""]];
  return `
  <div class="screen reel">
    ${clip({ caption: FAKE_LINE })}
    <div class="subtitle">[제보] ○○중 2-3 학폭</div>
    <div class="shade"></div>
    ${statusBar("11:04", "light")}
    <div class="top"><span class="plus">${ic("plus", 30, 2.2)}</span><span class="tabs"><span>릴스</span><span class="off">친구</span></span></div>
    <div class="acts">${acts.map(([n, c]) => `<span class="a ${n === "ellipsis" ? "blink" : ""}" ${REEL_GO[n] ? `data-go="${REEL_GO[n]}"` : ""}>${ic(n, 28, 2)}${c ? `<span>${c}</span>` : ""}</span>`).join("")}</div>
    <div class="author">${face(PEOPLE.daejeon, 36)}<div><div class="nm">${PEOPLE.daejeon} <span class="follow">팔로우</span></div><div class="sub audio-link" data-go="audio">${ic("audio-lines", 13, 2.4, 'style="display:inline-block;vertical-align:-2px"')} 보이스팝 · ${PEOPLE.meId}의 AI 목소리</div></div></div>
    <div class="caption">[제보] 2-3 ${ME}, 같은 반 친구한테 한 말입니다. 제보자 보호를 위해 출처는 밝히지 않습니다. <b>@${PEOPLE.meId}</b></div>
    <div class="prog"><i></i></div>
    ${tabbar("reels", true)}
    <i class="home-ind light"></i>
  </div>`;
}

// Comments sorted by likes, as the app does by default. freshId marks the one that just arrived.
export function commentsSheet(shown = REEL_COMMENTS.length, freshId = -1) {
  const list = REEL_COMMENTS.slice(0, shown)
    .map((item, index) => ({ item, index }))
    .sort((a, b) => b.item[2] - a.item[2]);
  const row = ([who, text, likes], cls = "") => `<div class="cm ${cls}">${face(who, 32)}<div class="t"><b>${who}</b> <span class="ago">방금</span><div>${text}</div><span class="re">답글 달기</span></div><span class="lk">${ic("heart", 14, 2)}<em>${likes}</em></span></div>`;
  const rows = list
    .map(({ item, index }) => row(item, index === freshId ? "pop" : "") + (item[3] ? `<div class="cm-reply">${row([item[3][0], item[3][1], 12])}</div>` : ""))
    .join("");
  return `<div class="dim" data-go="close-comments"></div>
    <div class="sheet cm-sheet"><div class="grab"></div><h4>댓글</h4><span class="cm-x" data-go="close-comments">${ic("x", 22, 2)}</span>
      <section class="cm-list">${rows}</section>
      <div class="cm-input">${face("me", 32)}<span>${PEOPLE.meId}(으)로 댓글 달기...</span></div></div>`;
}

// The audio page behind the fake reel: my AI voice, reused by strangers for memes.
export function audioPage(count = 34) {
  const tiles = VOICE_MEMES(ME)
    .map(([caption, hue], index) => `<div class="au-tile" style="--hue:${hue}deg;--pos:${(index * 23) % 100}%"><span class="cap">${caption}</span><span class="views">${ic("play", 12, 0, 'fill="#fff"')}${[3.1, 1.8, 9.4, 2.2, 1.1, 4.6, 0.8, 1.5, 2.9][index]}만</span></div>`)
    .join("");
  return `
  <div class="screen">
    ${statusBar("11:05")}
    <div class="nav"><span class="l gbtn glass" data-go="close-audio">${ic("chevron-left", 26, 2)}</span>오디오<span class="r gbtn glass">${ic("send", 22, 2)}</span></div>
    <div class="au-head"><span class="au-cover">${ic("audio-lines", 44, 2.2)}</span>
      <div><b>${PEOPLE.meId}의 AI 목소리</b><span>보이스팝 · 릴스 <em>${count}</em>개</span><span class="au-save">${ic("bookmark", 16, 2)} 저장</span></div></div>
    <section class="au-grid">${tiles}</section>
    <div class="btn-main au-use">${ic("square-play", 18, 2)} 이 목소리 사용하기</div>
    <i class="home-ind"></i>
  </div>`;
}

export function comments() {
  return reels().replace('<span class="a blink"', '<span class="a"').replace('<i class="home-ind light"></i>', commentsSheet(9) + '<i class="home-ind"></i>');
}

export function moreSheet() {
  const row = (icon, label, cls = "") => `<div class="row ${cls}">${ic(icon, 24, 2)}<span>${label}</span></div>`;
  return reels().replace(
    '<i class="home-ind light"></i>',
    `<div class="dim"></div>
    <div class="sheet">
      <div class="grab"></div>
      <div class="grp plain"><div class="row" style="height:57px">${face("지민", 32, "sq")}<span style="line-height:19px">오리지널 오디오 · jimin-2-3<br><small style="font-size:12px;color:var(--ink-2)">오디오</small></span></div>${row("bookmark", "저장")}${row("repeat-2", "리믹스 및 시퀀스")}</div>
      <div class="grp">${row("info", "이 게시물이 표시되는 이유")}${row("circle-check", "관심 있음")}${row("circle-x", "관심 없음")}
        <div class="row red blink">${ic("message-square-warning", 24, 2)}<span>신고</span></div></div>
    </div>
    <i class="home-ind"></i>`
  );
}

export function reportReasons() {
  const reasons = ["마음에 들지 않습니다", "따돌림 또는 원치 않는 연락", "자살, 자해 및 섭식 장애", "폭력, 혐오 또는 학대", "합성·조작된 콘텐츠", "나체 이미지 또는 성적 행위", "스캠, 사기 또는 스팸", "거짓 정보", "지식재산권 침해"];
  return `
  <div class="screen">
    ${statusBar("11:05")}
    <div class="nav">신고하기<span class="r gbtn glass">${ic("x", 26, 1.8)}</span></div>
    <div class="page">
      <h2>이 게시물을 신고하는 이유</h2>
      <p class="lead">회원님의 신고는 익명으로 처리됩니다. 누군가 위급한 상황에 있다고 생각된다면 즉시 현지 응급 서비스 기관에 연락하시기 바랍니다.</p>
      <div class="list" style="margin-top:44px">${reasons
        .map((r) => `<div class="li ${r.startsWith("합성") ? "blink" : ""}"><span>${r}</span>${ic("chevron-right", 22, 1.6, 'style="color:#686f78"')}</div>`)
        .join("")}</div>
    </div>
    <i class="home-ind"></i>
  </div>`;
}

export function reportDone() {
  const opt = (icon, label) => `<div class="li"><span class="ico">${ic(icon, 26, 1.8)}<span>${label}</span></span>${ic("chevron-right", 22, 1.6, 'style="color:#686f78"')}</div>`;
  return `
  <div class="screen">
    ${statusBar("11:06")}
    <div class="nav">신고하기<span class="r gbtn glass">${ic("x", 26, 1.8)}</span></div>
    <div class="page" style="top:145px">
      <div class="okcircle">${ic("clock-3", 32, 2.2)}</div>
      <h2>신고가 접수되었습니다</h2>
      <p class="lead">검토 중입니다. 검토가 끝나면 알려 드릴게요.</p>
      <div class="act-sec" style="margin-top:62px;font-size:17px">기타 옵션</div>
      <div class="list">${opt("ban", "jimin-2-3님 차단")}${opt("circle-slash", "jimin-2-3님 제한")}${opt("shield-check", "커뮤니티 규정에 대해 더 알아보기")}</div>
    </div>
    <div style="position:absolute;left:0;right:0;top:734px;border-top:1px solid #e3e6eb"></div>
    <div class="btn-main" style="top:748px">완료</div>
    <i class="home-ind"></i>
  </div>`;
}

export function privacy(sheet = true) {
  return `
  <div class="screen">
    ${statusBar("4:20")}
    <div class="nav"><span class="l gbtn glass">${ic("chevron-left", 26, 2)}</span>계정 공개 범위</div>
    <div class="page" style="top:122px">
      <div style="display:flex;align-items:center;justify-content:space-between;padding:0 16px;height:36px;font-size:17px">비공개 계정<span class="toggle blink"></span></div>
      <p class="para">계정이 공개 상태인 경우 피드 계정이 없는 사람을 포함해서 피드 안팎의 모든 사람이 프로필과 게시물을 볼 수 있습니다.</p>
      <p class="para" style="margin-top:28px">계정이 비공개 상태인 경우 회원님이 승인한 팔로워만 회원님이 공유하는 콘텐츠와 팔로워 및 팔로잉 리스트를 볼 수 있습니다. <a>더 알아보기</a></p>
    </div>
    ${sheet ? privacySheet() : ""}
    <i class="home-ind"></i>
  </div>`;
}

function privacySheet() {
  const row = (icon, text) => `<div style="display:flex;gap:14px;padding:12px 20px;font-size:15px;line-height:17px">${ic(icon, 26, 2, 'style="flex:none"')}<span>${text}</span></div>`;
  return `<div class="dim"></div>
  <div class="sheet" style="padding:0 0 51px">
    <div class="grab" style="margin-bottom:22px"></div>
    <h3>비공개 계정으로 전환하시겠어요?</h3>
    <div style="border-top:1px solid #eceef1;padding:14px 0 18px">
      ${row("square-play", "회원님의 팔로워만 회원님의 사진과 동영상을 볼 수 있습니다.")}
      ${row("at-sign", "모르는 사람은 회원님을 태그하거나 언급할 수 없게 됩니다.")}
      ${row("repeat-2", "아무도 회원님의 콘텐츠를 다시 사용할 수 없습니다.")}
    </div>
    <div style="border-top:1px solid #eceef1;padding:16px 16px 0"><div class="btn-main blink" style="position:static;height:43px;border-radius:14px">비공개로 전환</div></div>
  </div>`;
}

export function activity() {
  const thumbs = { post: "img/vlog.jpg", reel: "img/fake-clip-b.jpg" };
  const row = (who, text, ago, thumb = "reel") => `<div class="act-row">${face(who, 44)}
    <div class="t"><b>${who}</b>${text} <span class="ago">${ago}</span></div>
    <span class="thumb" style="background:url(${thumbs[thumb]}) center 30%/cover"></span></div>`;
  return `
  <div class="screen">
    ${statusBar("11:06")}
    <div class="nav"><span class="l gbtn glass">${ic("chevron-left", 26, 2)}</span>알림</div>
    <div class="page" style="top:112px">
      <div class="act-row">${face("dream-09", 44)}<div class="t"><b>dream-09</b>님 외 2명이 회원님을 팔로우하기 시작했습니다. <span class="ago">2분</span></div></div>
      <div class="act-sec">오늘</div>
      ${row("hot-clip", "님이 회원님을 언급했습니다: 수아 협박한 애 계정 여기임", "1분")}
      ${row("moon-k", "님이 회원님이 태그된 릴스에 댓글을 남겼습니다: 스티커로 가려도 후드 보면 딱 앎", "1분")}
      ${row("dream-09", "님이 회원님의 게시물에 댓글을 남겼습니다: 브이로그 목소리랑 완전 똑같네", "2분", "post")}
      ${row("jimin-2-3", "님 외 22명이 회원님이 태그된 릴스를 좋아합니다.", "3분")}
      ${row(PEOPLE.daejeon, "님이 회원님을 릴스에 태그했습니다.", "3분")}
    </div>
    ${tabbar("")}
    <i class="home-ind"></i>
  </div>`;
}
