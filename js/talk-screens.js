// 톡 screens for ring 3 (adults and the academy) of phase 1.
import { ic, statusBar, avatar } from "./icons.js";
import { ME } from "./data.js";
import { face } from "./faces.js";

export const sq = (name, size) => face(name, size, "sq");
export const stranger = (size) => avatar(size, ic("user-round", Math.round(size * 0.6), 2), "#4a4a4a", "sq");

export function talkList() {
  const rows = [
    { name: "채원", pv: "다들 니 목소리 맞대", tm: "오후 11:09", n: 2 },
    { name: "학원 선생님", pv: `${ME}, 학원 아이들 사이에 영상이 돌던데 무슨 일 있니?`, tm: "오후 11:08", n: 1 },
    { name: "엄마", pv: "전화 받아", tm: "오후 11:08", n: 3 },
    { name: "담임 선생님", pv: "내일 아침 8시까지 교무실로 와라.", tm: "오후 11:07", n: 2, blink: true },
    { name: "가족", cnt: 4, pv: "주말에 할머니 댁 가는 거 잊지 말고~", tm: "오후 6:41" },
  ];
  return `
  <div class="screen talk">
    ${statusBar("11:09", "light")}
    <header class="k-head"><h1>채팅</h1><span class="icons">${ic("search", 26, 2)}${ic("message-circle-plus", 26, 2)}${ic("settings", 26, 2)}</span></header>
    <div class="k-chips"><span class="k-chip on">전체</span><span class="k-chip">안읽음 <span class="n">8</span></span><span class="k-chip">${ic("list-plus", 20, 2)}</span></div>
    <section class="k-list">
      ${rows
        .map(
          (r) => `<div class="k-row ${r.blink ? "blink" : ""}">${r.stranger ? stranger(48) : sq(r.name, 48)}
          <div class="txt"><div class="nm">${r.name}${r.cnt ? ` <span class="cnt">${r.cnt}</span>` : ""}</div><div class="pv">${r.pv}</div></div>
          <div class="meta"><span class="tm">${r.tm}</span>${r.n ? `<span class="k-badge">${r.n}</span>` : ""}</div></div>`
        )
        .join("")}
    </section>
    <nav class="k-tabs">
      <span class="t">${ic("user-round", 28, 0, 'fill="currentColor"')}</span>
      <span class="t on">${ic("message-circle", 28, 0, 'fill="currentColor"')}<span class="k-badge">8</span></span>
      <span class="t">${ic("circle-play", 28, 2)}</span>
      <span class="t">${ic("shopping-bag", 28, 2)}</span>
      <span class="t">${ic("ellipsis", 28, 2.4)}</span>
    </nav>
    <i class="home-ind"></i>
  </div>`;
}

export const msg = (who, text, opts = {}) => {
  if (who === "me") {
    return `<div class="k-m me ${opts.first ? "first" : ""}"><div class="line"><div class="k-bub">${text}</div><span class="stamp">${opts.time || ""}</span></div></div>`;
  }
  const av = opts.first ? (opts.stranger ? stranger(34) : sq(who, 34)) : '<span class="spacer"></span>';
  return `<div class="k-m ${opts.first ? "first" : ""}">${av}<div class="col">${opts.first ? `<span class="who">${who}</span>` : ""}
    <div class="line"><div class="k-bub">${text}</div><span class="stamp">${opts.unread ? '<span class="u">1</span>' : ""}${opts.time || ""}</span></div></div></div>`;
};

export function talkRoomMom() {
  return `
  <div class="screen talk">
    ${statusBar("11:08", "light")}
    <header class="k-rhead"><span class="pill glass dark">${ic("chevron-left", 26, 2)}9</span><span class="ttl">엄마</span>
      <span class="pill r glass dark">${ic("search", 24, 2)}${ic("menu", 24, 2)}</span></header>
    <section class="k-msgs">
      <span class="k-date">2026년 10월 19일 월요일 ${ic("chevron-right", 14, 2)}</span>
      ${msg("엄마", "학원 끝나면 바로 와", { first: true, time: "오후 3:07" })}
      ${msg("me", "응", { time: "오후 3:10" })}
      ${msg("엄마", "수아 엄마가 학부모 단톡방에 영상을 올렸대", { first: true })}
      ${msg("엄마", "이게 무슨 일이니")}
      ${msg("엄마", "전화 받아", { unread: true, time: "오후 11:08" })}
    </section>
    <div class="k-input">${ic("plus", 26, 2)}<span class="ph">메시지 입력</span><span class="c">${ic("smile", 20, 2)}</span><span class="c">${ic("hash", 20, 2)}</span><span class="c">${ic("audio-lines", 20, 2)}</span></div>
    <i class="home-ind"></i>
  </div>`;
}

export function talkRoomTeacher() {
  return `
  <div class="screen talk">
    ${statusBar("11:07", "light")}
    <header class="k-rhead"><span class="pill glass dark">${ic("chevron-left", 26, 2)}8</span><span class="ttl">담임 선생님</span>
      <span class="pill r glass dark">${ic("search", 24, 2)}${ic("menu", 24, 2)}</span></header>
    <section class="k-msgs">
      <span class="k-date">2026년 10월 16일 금요일 ${ic("chevron-right", 14, 2)}</span>
      ${msg("담임 선생님", "현장체험학습 신청서 월요일까지 꼭 내세요.", { first: true, time: "오후 4:30" })}
      ${msg("me", "네", { time: "오후 4:41" })}
      <span class="k-date">2026년 10월 19일 월요일 ${ic("chevron-right", 14, 2)}</span>
      ${msg("담임 선생님", `${ME}, 학교폭력 신고가 들어왔다.`, { first: true })}
      ${msg("담임 선생님", "내일 아침 8시까지 교무실로 와라.", { unread: true, time: "오후 11:07" })}
    </section>
    <div class="k-input">${ic("plus", 26, 2)}<span class="ph">메시지 입력</span><span class="c">${ic("smile", 20, 2)}</span><span class="c">${ic("hash", 20, 2)}</span><span class="c">${ic("audio-lines", 20, 2)}</span></div>
    <i class="home-ind"></i>
  </div>`;
}
