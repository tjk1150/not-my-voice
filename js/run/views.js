// Live views for phase 1. Each takes the engine state and returns the screen HTML.
// Tap targets carry data-go; the engine decides what each one does and what blinks.
import { ic, statusBar, avatar } from "../icons.js";
import { ME, PEOPLE, REEL_COMMENTS } from "../data.js";
import { face } from "../faces.js";
import { tabbar, ringAv, groupAv, bubble, reelCard, reels as reelsStatic, commentsSheet, audioPage, denyComposer, kickedComposer, moreSheet, reportReasons, reportDone } from "../feed-screens.js";
import { sq, stranger, msg } from "../talk-screens.js";
import { card, home as homeStatic } from "../ios-screens.js";
import { ROOMS, OLD_DMS, CALLERS, SHARE_ROOMS } from "./rooms.js";

const homeInd = (light = false) => `<i class="home-ind ${light ? "light" : ""}"></i><span class="home-hit" data-go="home"></span>`;

export function lock(state) {
  const list = state.lockNotifs.slice(0, 7);
  return `
  <div class="screen lock">
    <div class="wall"></div>
    ${statusBar("", "light")}<span class="carrier">SKT</span>
    <div class="date">10월 19일 (월)</div>
    <div class="clock">${state.clock}</div>
    <div class="notifs">${list.map((item, index) => `<div data-go="notif-${index}" class="${index === 0 && item.fresh ? "drop" : ""}">${card(item)}</div>`).join("")}</div>
    <span class="qbtn" style="left:50px">${ic("flashlight", 22, 2)}</span>
    <span class="qbtn" style="left:293px">${ic("camera", 24, 2)}</span>
    ${homeInd(true)}
  </div>`;
}

export const home = (state) => homeStatic("", state.badges, state.clock) + `<span class="home-hit" data-go="home"></span>`;

const REEL_THUMB = "img/fake-clip-b.jpg";

// Newest first, like the app: as the reel keeps arriving, rows with the same thumbnail pile up on top.
function inboxRows(state) {
  const rows = [];
  const group = state.rooms["dm-group"];
  const groupLast = [...group.lines].reverse().find((line) => line.text || line.sys);
  rows.push({ id: "dm-group", name: "2-3 우리반", sub: groupLast ? (groupLast.sys || `${groupLast.who}: ${groupLast.text}`) + " · 방금" : `지민: ${ME} 이거 너야? · 방금`, unread: state.unread["dm-group"] > 0, group: true, at: group.updated });
  for (const id of ["dm:sua", "dm:harin", "dm:yerin", ...SHARE_ROOMS]) {
    const room = state.rooms[id];
    const last = room.lines[room.lines.length - 1];
    const reel = room.lines.some((line) => line.reel);
    if (state.unread[id] > 0 || room.fresh) rows.push({ id, name: ROOMS[id].name, sub: `${last.text} · 방금`, unread: state.unread[id] > 0, ring: id === "dm:harin", reel, at: room.updated });
  }
  const requests = state.rooms["dm:request"];
  const lastRequest = requests.lines[requests.lines.length - 1];
  if (lastRequest) rows.push({ id: "dm:request", name: `메시지 요청 ${state.flags.requests.length}개`, sub: `${lastRequest.who}: ${lastRequest.text}`, unread: state.unread["dm:request"] > 0, request: true, reel: requests.lines.some((line) => line.reel), at: requests.updated });
  rows.sort((a, b) => b.at - a.at);
  // 수아 sits among the old threads until her message arrives: two days ago they planned lunch together.
  const old = state.rooms["dm:sua"].fresh ? [] : [{ id: "", name: "수아", sub: "월요일에 같이 매점 가자 · 2일" }];
  return rows.concat(old, OLD_DMS.map(([name, sub]) => ({ id: "", name, sub })));
}

export function dmInbox(state) {
  return `
  <div class="screen">
    ${statusBar(state.clock)}
    <header class="f-head"><span class="title">${PEOPLE.meId} ${ic("chevron-down", 16, 2.2)}<i class="dot"></i></span><span class="act">${ic("square-pen", 24, 2)}</span></header>
    <section class="dm-list">${inboxRows(state)
      .slice(0, 9)
      .map(
        (row) => `<div class="dm-row ${row.unread ? "unread" : ""}" ${row.id ? `data-go="room-${row.id}"` : ""}>
          ${row.group ? groupAv() : row.request ? avatar(56, ic("user-round", 30, 2), "#c7ccd4") : row.ring ? ringAv(row.name, 56) : face(row.name, 56)}
          <div class="txt"><div class="name">${row.name}</div><div class="sub">${row.sub}</div></div>${row.reel ? `<span class="thumb" style="background-image:url(${REEL_THUMB})"></span>` : ""}${row.unread ? '<i class="udot"></i>' : ""}</div>`
      )
      .join("")}</section>
    ${tabbar("dm")}${homeInd()}
  </div>`;
}

function feedLines(lines, group, pop) {
  return lines
    .map((line, index) => {
      const cls = index === lines.length - 1 && pop ? " pop" : "";
      if (line.day) return `<div class="day${cls}">${line.day}</div>`;
      if (line.sys) return `<div class="sys${cls}">${line.sys}</div>`;
      const prev = lines[index - 1];
      const next = lines[index + 1];
      const first = !prev || prev.who !== line.who || prev.sys || prev.day;
      const last = !next || next.who !== line.who || next.sys || next.day;
      const pos = first && last ? "" : first ? "grp-top" : last ? "grp-end" : "grp-mid";
      const html = line.reel ? reelCard().replace('<div class="reelcard">', '<div class="reelcard" data-go="reel-open">') : "";
      return `<div class="line${cls}">${bubble(line.who, line.text || "", { group, first, last, pos, html })}</div>`;
    })
    .join("");
}

const typingBubble = (who, size = 28) => `<div class="m pop">${face(who, size)}<div class="col"><div class="bub typing"><i></i><i></i><i></i></div></div></div>`;

export function feedRoom(state, id) {
  const room = state.rooms[id];
  const info = ROOMS[id];
  const avatarHtml = info.group ? groupAv(40) : info.request ? avatar(40, ic("user-round", 22, 2), "#c7ccd4") : face(info.name, 40);
  const leave = info.group && state.guide === "leave" ? `<span class="leave blink" data-go="leave">나가기</span>` : "";
  return `
  <div class="screen">
    ${statusBar(state.clock)}
    <div class="fade-top"></div>
    <header class="r-head"><span class="gbtn glass" data-go="back">${ic("chevron-left", 26, 2)}</span>
      <span class="who">${avatarHtml}<span><span class="nm">${info.name} ${ic("chevron-right", 16, 2.2)}</span><span class="hd">${info.sub}</span></span></span>
      ${leave}<span class="calls"><span class="gbtn glass">${ic("phone", 24, 1.8)}</span><span class="gbtn glass">${ic("video", 24, 1.8)}</span></span></header>
    <section class="msgs live">${feedLines(room.lines, info.group || info.request, room.pop)}${room.typing ? typingBubble(room.typing) : ""}</section>
    ${composer(state, id)}
    ${homeInd()}
  </div>`;
}

// The class room offers one prefilled denial once its script has played; after removal it is closed.
export const canDeny = (state) => {
  const room = state.rooms["dm-group"];
  return room.started && !room.queue.length && !room.typing && !state.denied && !state.kicked;
};

function composer(state, id) {
  if (id === "dm-group" && state.kicked) return kickedComposer();
  if (id === "dm-group" && canDeny(state)) return denyComposer();
  return `<div class="composer"><span class="cam">${ic("camera", 22, 2.2)}</span><span class="ph">메시지 보내기...</span>
      <span class="tools">${ic("mic", 22, 2)}${ic("image", 22, 2)}${ic("sticker", 22, 2)}${ic("circle-plus", 22, 2)}</span></div>`;
}

export const audio = (state) => audioPage(Math.min(34, 12 + Math.max(0, Math.floor((state.t - 53) / 3)))).replace('<i class="home-ind"></i>', homeInd()).replace("11:05", state.clock);

const compact = (value) => (value >= 10000 ? `${(value / 10000).toFixed(1).replace(".0", "")}만` : value.toLocaleString("ko-KR"));

// A reel opened from a DM gets a back arrow where the reels tab has its "+".
export function reels(state) {
  const back = state.reelFrom ? (html) => html.replace(/<span class="plus">[\s\S]*?<\/span>/, `<span class="plus" data-go="close-reel">${ic("chevron-left", 30, 2.2)}</span>`) : (html) => html;
  return back(reelsStatic())
    .replace("1.2만", compact(state.reel.likes))
    .replace("1,904", compact(state.reel.shares))
    .replace('<span class="a blink"', '<span class="a"')
    .replace('<i class="home-ind light"></i>', homeInd(true))
    .replace(/11:04/, state.clock);
}

// Comments arrive over time (every 4 s from the tag at 0:53); popular ones push the doubtful one down.
export const commentCount = (t) => Math.max(3, Math.min(REEL_COMMENTS.length, 3 + Math.floor((t - 53) / 4)));

export function comments(state) {
  const shown = commentCount(state.t);
  return reels(state).replace(homeInd(true), commentsSheet(shown, state.commentsFresh ? shown - 1 : -1) + homeInd());
}

export function more(state) {
  const full = moreSheet();
  const sheet = full.slice(full.indexOf('<div class="dim">'), full.lastIndexOf('<i class="home-ind"></i>')).replace('<div class="row red blink">', '<div class="row red" data-go="report-go">').replace('<div class="dim">', '<div class="dim" data-go="close-sheet">');
  return reels(state).replace(homeInd(true), sheet + homeInd());
}

export const report = (state) => reportReasons().replace(/<div class="li ([^"]*)"><span>(합성[^<]*)<\/span>/, '<div class="li" data-go="reason-fake"><span>$2</span>').replace(/<div class="li "/g, '<div class="li" data-go="reason-other"').replace('<span class="r gbtn glass">', '<span class="r gbtn glass" data-go="close-report">').replace("11:05", state.clock);

export const reportDoneView = (state) => reportDone().replace('<div class="btn-main" style="top:748px">', '<div class="btn-main" style="top:748px" data-go="done">').replace('<span class="r gbtn glass">', '<span class="r gbtn glass" data-go="done">').replace("11:06", state.clock);

export function activity(state) {
  const thumbs = { post: "img/vlog.jpg", reel: "img/fake-clip-b.jpg" };
  const rows = state.activity
    .map(([who, text, thumb = "reel"], index) => `<div class="act-row ${index === 0 && state.activityFresh ? "pop" : ""}">${face(who, 44)}<div class="t"><b>${who}</b>${text} <span class="ago">방금</span></div><span class="thumb" style="background:url(${thumbs[thumb]}) center 30%/cover"></span></div>`)
    .join("");
  return `
  <div class="screen">
    ${statusBar(state.clock)}
    <div class="nav"><span class="l gbtn glass" data-go="tab-dm">${ic("chevron-left", 26, 2)}</span>알림</div>
    <div class="page" style="top:112px">
      ${state.flags.follow ? `<div class="act-row">${face("dream-09", 44)}<div class="t"><b>dream-09</b>님 외 ${state.flags.follow - 1}명이 회원님을 팔로우하기 시작했습니다. <span class="ago">방금</span></div></div>` : ""}
      <div class="act-sec">오늘</div>${rows || '<p class="para">아직 알림이 없어요.</p>'}
    </div>
    ${tabbar("home")}${homeInd()}
  </div>`;
}

export function talkList(state) {
  const ids = Object.keys(ROOMS).filter((id) => ROOMS[id].app === "talk" && state.rooms[id].fresh);
  ids.sort((a, b) => state.rooms[b].updated - state.rooms[a].updated);
  const rows = ids.map((id) => {
    const info = ROOMS[id];
    const last = state.rooms[id].lines[state.rooms[id].lines.length - 1];
    return `<div class="k-row" data-go="room-${id}">${info.stranger ? stranger(48) : sq(info.name, 48)}<div class="txt"><div class="nm">${info.name}</div><div class="pv">${last.preview || last.text}</div></div>
      <div class="meta"><span class="tm">${state.rooms[id].time}</span>${state.unread[id] ? `<span class="k-badge">${state.unread[id]}</span>` : ""}</div></div>`;
  });
  rows.push(`<div class="k-row">${sq("가족", 48)}<div class="txt"><div class="nm">가족 <span class="cnt">4</span></div><div class="pv">주말에 할머니 댁 가는 거 잊지 말고~</div></div><div class="meta"><span class="tm">오후 6:41</span></div></div>`);
  const total = ids.reduce((sum, id) => sum + (state.unread[id] || 0), 0);
  return `
  <div class="screen talk">
    ${statusBar(state.clock, "light")}
    <header class="k-head"><h1>채팅</h1><span class="icons">${ic("search", 26, 2)}${ic("message-circle-plus", 26, 2)}${ic("settings", 26, 2)}</span></header>
    <div class="k-chips"><span class="k-chip on">전체</span><span class="k-chip">안읽음 ${total ? `<span class="n">${total}</span>` : ""}</span><span class="k-chip">${ic("list-plus", 20, 2)}</span></div>
    <section class="k-list">${rows.join("")}</section>
    <nav class="k-tabs"><span class="t">${ic("user-round", 28, 0, 'fill="currentColor"')}</span><span class="t on">${ic("message-circle", 28, 0, 'fill="currentColor"')}${total ? `<span class="k-badge">${total}</span>` : ""}</span><span class="t">${ic("circle-play", 28, 2)}</span><span class="t">${ic("shopping-bag", 28, 2)}</span><span class="t">${ic("ellipsis", 28, 2.4)}</span></nav>
    ${homeInd(true)}
  </div>`;
}

export function talkRoom(state, id) {
  const info = ROOMS[id];
  const room = state.rooms[id];
  const lines = room.lines
    .map((line, index) => {
      const cls = index === room.lines.length - 1 && room.pop ? "pop" : "";
      if (line.day) return `<span class="k-date ${cls}">${line.day}</span>`;
      const prev = room.lines[index - 1];
      const next = room.lines[index + 1];
      const first = !prev || prev.who !== line.who || prev.day;
      const last = !next || next.who !== line.who || next.day;
      return `<div class="${cls}">${msg(line.who, line.text, { first, stranger: info.stranger, time: last ? line.time || "" : "", unread: last && line.who !== "me" })}</div>`;
    })
    .join("");
  const band = info.stranger
    ? `<div class="k-band">${ic("triangle-alert", 22, 2, 'style="color:#ff6b5b;flex:none;align-self:flex-start;margin-top:2px"')}<div style="flex:1"><b>친구로 추가되지 않은 사용자입니다.</b><br><span style="color:var(--k-ink-2)">금전 요구나 개인정보를 묻는 메시지는 주의하세요.</span><div class="acts"><span>친구 추가</span><span class="warn">차단</span></div></div></div>`
    : "";
  return `
  <div class="screen talk">
    ${statusBar(state.clock, "light")}
    <header class="k-rhead"><span class="pill glass dark" data-go="back">${ic("chevron-left", 26, 2)}</span><span class="ttl">${info.name}</span><span class="pill r glass dark">${ic("search", 24, 2)}${ic("menu", 24, 2)}</span></header>
    ${band}<section class="k-msgs live">${lines}</section>
    <div class="k-input">${ic("plus", 26, 2)}<span class="ph">메시지 입력</span><span class="c">${ic("smile", 20, 2)}</span><span class="c">${ic("hash", 20, 2)}</span><span class="c">${ic("audio-lines", 20, 2)}</span></div>
    ${homeInd(true)}
  </div>`;
}

export function callLayer(call) {
  if (!call || call.state === "none" || call.state === "gone") return "";
  // The ring lights on whoever is speaking; without voices it cycles through the four.
  const speaking = (name, index) => (call.speaker ? call.speaker === name : !call.audio || call.audio === "none" ? (call.beat + index) % 4 === 0 : false);
  const people = CALLERS.map((name, index) => `<span class="cp ${call.state === "active" ? `talk${speaking(name, index) ? " on" : ""}` : ""}">${face(name, call.state === "active" ? 120 : 52)}<em>${name}</em></span>`).join("");
  if (call.state === "ringing")
    return `<div class="call incoming"><div class="c-top">${groupAv(84)}<h2>2-3 우리반</h2><p>지민님이 음성 통화를 시작했습니다</p><div class="c-people small">${people}</div></div>
      <div class="c-btns"><span data-go="decline"><b class="no">${ic("phone-off", 30, 2)}</b>거절</span><span data-go="accept"><b class="yes blink">${ic("phone", 30, 2)}</b>수락</span></div></div>`;
  return `<div class="call active"><div class="c-head"><b>2-3 우리반</b><span>${call.state === "ended" ? "통화 종료" : `00:${String(Math.floor(call.elapsed)).padStart(2, "0")}`}</span></div>
    <div class="c-people grid">${people}</div>
    <div class="c-btns"><span>${ic("mic-off", 26, 2)}</span><span>${ic("video-off", 26, 2)}</span><span>${ic("volume-2", 26, 2)}</span><span class="end">${ic("phone-off", 26, 2)}</span></div></div>`;
}
