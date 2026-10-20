// Phase 2 screens and overlays. Tap targets carry data-r; rewind.js waits for them.
import { ic, statusBar } from "../icons.js";
import { ME, PEOPLE } from "../data.js";
import { face } from "../faces.js";
import { card } from "../ios-screens.js";
import { msg } from "../talk-screens.js";
import { reels, moreSheet, reportReasons, reportDone, privacy } from "../feed-screens.js";
import { REMAINING, CHANGED, HELP, LESSON_BUTTON, END } from "./rewind-data.js";
import { SURVEY } from "../data.js";

// The vlog frame (generated-images/ai-ethics/vlog-sticker.png, resized).
export const VLOG_IMG = "img/vlog.jpg";


export const counter = (count, pulse = false) => `<div class="rw-count ${pulse ? "pulse" : ""}">알림 <b>${count}</b></div>`;

export const hud = (forward) => `<div class="rw-hud ${forward ? "fwd" : ""}"><span class="rw-ico">${ic(forward ? "fast-forward" : "rewind", 44, 2, 'fill="currentColor"')}</span><b class="rw-day"></b><span class="rw-time"></span></div>`;

export function dialog({ when, ask, chips = null, picked = [], after = "", button = "해 보기" }) {
  const chipRow = chips ? `<div class="rw-chips">${chips.map((label, index) => `<span class="rw-chip ${picked.includes(index) ? "on" : "blink"}" data-r="chip-${index}">${picked.includes(index) ? ic("check", 16, 3) : ""}${label}</span>`).join("")}</div>` : "";
  const done = !chips || picked.length === chips.length;
  return `<div class="rw-dim"></div><div class="rw-card"><span class="rw-when">${ic("rewind", 14, 2.4, 'fill="currentColor"')} ${when}</span><p>${ask}</p>${chipRow}
    ${after && done ? `<p class="rw-after pop">${after}</p>` : ""}${done ? `<button class="blink" data-r="go">${button}</button>` : ""}</div>`;
}

export function lesson({ title, text, tags }, from, to, button = LESSON_BUTTON.back) {
  return `<div class="rw-dim"></div><div class="rw-card lesson pop"><span class="rw-drop">알림 ${from} → <b>${to}</b></span><h3>${title}</h3><p>${text}</p>
    <div class="rw-tags">${tags.map((tag) => `<span>${tag}</span>`).join("")}</div><button class="blink" data-r="go">${button}</button></div>`;
}

export const pile = (cards) =>
  `<div class="rw-dim light"></div><div class="rw-pile">${cards.map((item, index) => `<div class="rw-c" style="top:${70 + ((index * 61) % 600)}px;--r:${((index * 37) % 13) - 6}deg">${card(item, "light")}</div>`).join("")}</div>`;

export const toast = (text) => `<div class="rw-toast pop">${text}</div>`;

// Stop 1: the reel at 11:03, the screenshot, the share sheet, mom's room and the report.
export const reelAt = (clock) => reels().replace('<span class="a blink"', '<span class="a"').replace("11:04", clock);
export const captureButton = () => `<span class="rw-capture blink" data-r="capture">${ic("scan", 20, 2.2)} 화면 캡처</span>`;
export const flash = () => `<div class="rw-flash"></div>`;
export const shotThumb = () => `<span class="rw-thumb blink" data-r="thumb" style="background-image:url(${VLOG_IMG})"></span>`;

export function shareSheet(clock) {
  const person = (name, key, blink = false) => `<span class="sh-p ${blink ? "blink" : ""}" data-r="${key}">${face(name, 58)}<em>${name}</em></span>`;
  return reelAt(clock).replace(
    '<i class="home-ind light"></i>',
    `<div class="dim"></div><div class="sheet sh-sheet"><div class="grab"></div>
      <div class="sh-top"><span class="sh-img" style="background-image:url(${VLOG_IMG})"></span><div><b>스크린샷</b><small>PNG 이미지 · 방금</small></div></div>
      <div class="sh-row">${person("엄마", "to-mom", true)}${person("담임 선생님", "to-other")}${person("하린", "to-other")}${person("가족", "to-other")}</div>
      <div class="sh-acts"><span>${ic("copy", 22, 2)}복사</span><span>${ic("download", 22, 2)}사진에 저장</span><span>${ic("printer", 22, 2)}프린트</span></div></div><i class="home-ind"></i>`
  );
}

export function momRoom(clock, lines, { blinkBack = false, reply = "" } = {}) {
  const history = [msg("엄마", "학원 끝나면 바로 와", { first: true, time: "오후 3:07" }), msg("me", "응", { time: "오후 3:10" })];
  const body = lines.map((line, index) => `<div class="${index === lines.length - 1 ? "pop" : ""}">${line.typing ? `<div class="k-m first">${face("엄마", 34, "sq")}<div class="col"><div class="line"><div class="k-bub typing"><i></i><i></i><i></i></div></div></div></div>` : msg(line.who, line.text, { first: line.first, time: line.time || "" })}</div>`).join("");
  return `
  <div class="screen talk">
    ${statusBar(clock, "light")}
    <header class="k-rhead"><span class="pill glass dark ${blinkBack ? "blink" : ""}" data-r="back">${ic("chevron-left", 26, 2)}</span><span class="ttl">엄마</span><span class="pill r glass dark">${ic("search", 24, 2)}${ic("menu", 24, 2)}</span></header>
    <section class="k-msgs live"><span class="k-date">2026년 10월 19일 월요일</span>${history.join("")}${body}</section>
    ${reply ? `<div class="replies"><span class="reply-chip blink" data-r="reply">${reply}</span></div>` : ""}
    <div class="k-input">${ic("plus", 26, 2)}<span class="ph">메시지 입력</span><span class="c">${ic("smile", 20, 2)}</span><span class="c">${ic("hash", 20, 2)}</span><span class="c">${ic("audio-lines", 20, 2)}</span></div>
    <i class="home-ind light"></i>
  </div>`;
}

export const shotBubble = () => `<img class="k-shot" src="${VLOG_IMG}" alt="스크린샷">`;

// Back on the reel after mom's question: its "…" menu is where reporting starts.
export const reelMore = (clock) => reels().replace('<span class="a blink"', '<span class="a blink" data-r="more"').replace("11:04", clock);
export const moreAt = (clock) => moreSheet().replace('<div class="row red blink">', '<div class="row red blink" data-r="report">').replace('<span class="a blink"', '<span class="a"').replace("11:04", clock);
export const reportAt = (clock) => reportReasons().replace(/<div class="li ([^"]*)"><span>(합성[^<]*)<\/span>/, '<div class="li blink" data-r="fake"><span>$2</span>').replace("11:05", clock);
export const reportDoneAt = (clock) => reportDone().replace('<div class="btn-main" style="top:748px">', '<div class="btn-main blink" style="top:748px" data-r="done">').replace("11:06", clock);

// Stop 2: the profile editor five days earlier. Both bio items blink as editable candidates, so the
// blink shows what can be changed without giving the answer; after two misses only the school blinks.
export function profileEdit(clock, { school = true, blinkSchool = false, blinkDone = false } = {}) {
  const field = (label, value) => `<div class="pe-f"><label>${label}</label><div>${value}</div></div>`;
  const hobbyBlink = school && !blinkSchool ? "blink" : "";
  const bio = `${school ? `<span class="tok blink" data-r="bio-school">○○중 2-3</span> · ` : ""}<span class="tok ${hobbyBlink}" data-r="bio-hobby">노래 부르는 거 좋아함</span>`;
  return `
  <div class="screen">
    ${statusBar(clock)}
    <div class="nav"><span class="l pe-txt">취소</span>프로필 편집<span class="r pe-txt done ${blinkDone ? "blink" : ""}" ${blinkDone ? 'data-r="done"' : ""}>완료</span></div>
    <div class="pe-av">${face("me", 86)}<span>사진 또는 아바타 수정</span></div>
    <div class="pe-body">${field("이름", ME)}${field("사용자 이름", PEOPLE.meId)}${field("소개", bio)}${field("링크", '<span class="ph">링크 추가</span>')}
    <div class="pe-pub">${ic("globe", 16, 2)} 공개 계정 · 프로필은 모든 사람이 볼 수 있어요</div></div>
    <i class="home-ind"></i>
  </div>`;
}

// Stop 3: the vlog reel being shared one week earlier, then the account privacy switch.
export function vlogUpload(clock) {
  const row = (icon, label, value = "") => `<div class="vu-row">${ic(icon, 22, 2)}<span>${label}</span><em>${value}</em>${ic("chevron-right", 18, 2)}</div>`;
  return `
  <div class="screen">
    ${statusBar(clock)}
    <div class="nav"><span class="l gbtn glass">${ic("chevron-left", 26, 2)}</span>새 릴스</div>
    <div class="vu-top"><span class="vu-thumb" style="background-image:url(${VLOG_IMG})"></span><p>교문 앞에서 브이로그<br><span>#중2 #일상 #하교</span></p></div>
    ${row("user-round-plus", "사람 태그하기")}${row("audio-lines", "오디오", "원본 오디오(내 목소리)")}${row("globe", "공개 대상", "전체 공개")}
    <div class="btn-main" style="top:760px">공유</div>
    <i class="home-ind"></i>
  </div>`;
}

export const privacyAt = (clock, stage) => {
  if (stage === "toggle") return privacy(false).replace('<span class="toggle blink"></span>', '<span class="toggle blink" data-r="toggle"></span>').replace("4:20", clock);
  if (stage === "sheet") return privacy(true).replace('<span class="toggle blink"></span>', '<span class="toggle"></span>').replace('<div class="btn-main blink"', '<div class="btn-main blink" data-r="private"').replace("4:20", clock);
  return privacy(false).replace('<span class="toggle blink"></span>', '<span class="toggle on"></span>').replace("4:20", clock);
};

// Ending: what the player changed, and the question (with its answer line) over the remaining cards. Cards flip in place
// (rewind.js toggles their class), and the closing part is added once all five are turned.
export function ending(items, flipped = [], { intro = false, done = false } = {}) {
  const next = items.findIndex((_, index) => !flipped.includes(index));
  const cards = items
    .map((item, index) => {
      const src = REMAINING[index];
      return `<div class="e-card ${flipped.includes(index) ? "flip" : index === next ? "blink" : ""}" data-r="card-${index}"><div class="e-front">${card(item, "light")}</div>
        <div class="e-back"><b>${src.who}</b><span>${src.why}</span><em>${src.req}</em></div></div>`;
    })
    .join("");
  return `
  <div class="screen end ${intro ? "e-intro" : ""}">
    <section class="e-sec rise"><h3 class="e-label">${END.changed}</h3><ul class="e-checks">${CHANGED.map((text) => `<li>${ic("circle-check", 18, 2.2)}${text}</li>`).join("")}</ul></section>
    <section class="e-sec rise"><h2 class="e-q">${END.question}</h2><p class="e-note">${END.note}</p><p class="e-tip">${END.tip}</p><div class="e-cards">${cards}</div></section>
    ${done ? endingTail() : ""}
  </div>`;
}

export const endingTail = () => `<section class="e-sec e-tail">
  <button class="e-help-btn" data-r="help">${ic("life-buoy", 18, 2)} 도움받을 수 있는 곳 ${ic("chevron-right", 18, 2)}</button>
  <div class="e-btns"><button class="line" data-r="restart">처음부터 다시 하기</button>${SURVEY.url ? `<a class="main" href="${SURVEY.url}" target="_blank" rel="noopener">${ic("clipboard-list", 18, 2.2)} ${SURVEY.label}</a>` : ""}</div></section>`;

export const helpSheet = () => `<div class="rw-dim" data-r="close"></div><div class="sheet e-help pop"><div class="grab"></div><h3>도움받을 수 있는 곳</h3>
  ${HELP.map(([icon, name, text]) => `<div class="e-h">${ic(icon, 22, 2)}<div><b>${name}</b><span>${text}</span></div></div>`).join("")}
  <button data-r="close">닫기</button></div>`;
