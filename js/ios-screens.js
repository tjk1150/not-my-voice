// iOS surfaces: lock screen, home screen, in-app banner, notification storm.
import { ic, statusBar } from "./icons.js";
import { APP_ICONS } from "./app-icons.js";
import { LOCK_NOTIFS, STORM } from "./data.js";
import { dmInbox } from "./feed-screens.js";

export const card = ({ app, title, body, when = "지금" }, cls = "", style = "") => `
  <div class="ncard ${cls}" style="${style}"><span class="ico">${APP_ICONS[app](38)}</span>
    <div class="body"><b>${title}</b><span>${body}</span></div><span class="when">${when}</span></div>`;

export function lock() {
  return `
  <div class="screen lock">
    <div class="wall"></div>
    ${statusBar("", "light").replace('<span class="time"></span>', '<span class="time"></span>')}
    <span class="carrier">SKT</span>
    <div class="date">10월 19일 (월)</div>
    <div class="clock">11:00</div>
    <div class="notifs">${LOCK_NOTIFS.slice().reverse().map((n) => card(n)).join("")}</div>
    <span class="qbtn" style="left:50px">${ic("flashlight", 22, 2)}</span>
    <span class="qbtn" style="left:293px">${ic("camera", 24, 2)}</span>
    <i class="home-ind light"></i>
  </div>`;
}

const filler = [
  ["사진", "#ffffff", "images", "#f5a623"], ["카메라", "#3a3a3c", "camera", "#fff"], ["캘린더", "#ffffff", "calendar", "#ff3b30"], ["시계", "#1c1c1e", "clock-3", "#fff"],
  ["지도", "#5ac8fa", "map", "#fff"], ["날씨", "#3d8bfd", "cloud-sun", "#fff"], ["메모", "#ffd60a", "notebook-pen", "#3a3a3c"], ["설정", "#8e8e93", "settings", "#fff"],
];

const app = (label, iconHtml, badge = 0, blink = false, key = "") => `
  <span class="app ${blink ? "blink" : ""}" data-go="app-${key}">${iconHtml}${badge ? `<span class="badge">${badge}</span>` : ""}<span>${label}</span></span>`;

export function home(blinkApp = "feed", badges = { feed: 4, talk: 0, phone: 0 }, time = "11:00") {
  const fill = filler.map(([label, bg, glyph, fg]) => app(label, `<span class="fill-app" style="background:${bg};color:${fg}">${ic(glyph, 32, 2)}</span>`)).join("");
  return `
  <div class="screen home">
    <div class="wall"></div>
    ${statusBar(time, "light")}
    <div class="grid">
      ${fill}
      ${app("피드", APP_ICONS.feed(64), badges.feed, blinkApp === "feed", "feed")}
      ${app("톡", APP_ICONS.talk(64), badges.talk, blinkApp === "talk", "talk")}
      ${app("보이스팝", APP_ICONS.voice(64), badges.voice || 0, false, "voice")}
    </div>
    <div class="dots"><i></i><i></i></div>
    <div class="dock">
      ${app("", APP_ICONS.phone(64), badges.phone, blinkApp === "phone", "phone")}
      ${app("", `<span class="fill-app" style="background:#fff;color:#1a73e8">${ic("compass", 34, 2)}</span>`)}
      ${app("", `<span class="fill-app" style="background:linear-gradient(#5ff07a,#22c845)">${ic("message-circle", 34, 0, 'fill="#fff"')}</span>`)}
      ${app("", `<span class="fill-app" style="background:linear-gradient(#ff6b6b,#f0384d)">${ic("music", 32, 2.2)}</span>`)}
    </div>
    <i class="home-ind light"></i>
  </div>`;
}

export function banner() {
  return dmInbox().replace('<i class="home-ind"></i>', `<div class="banner blink">${card({ app: "feed", title: "하린", body: "괜찮아? 이거 진짜 너 아니지? 말 좀 해봐" }, "light")}</div><i class="home-ind"></i>`);
}

export function storm(frozen = true) {
  const piled = STORM.map(([app, title, body], index) => {
    const tilt = ((index * 37) % 13) - 6;
    const top = 70 + ((index * 53) % 640);
    return card({ app, title, body }, "light", `top:${top}px;transform:rotate(${tilt}deg);z-index:${60 + index}`);
  }).join("");
  return home("none", { feed: 41, talk: 12, phone: 3 }).replace(
    '<i class="home-ind light"></i>',
    `<div class="storm">${piled}</div>${frozen ? '<div class="freeze"><span class="count">알림 47</span></div>' : ""}<i class="home-ind light"></i>`
  );
}
