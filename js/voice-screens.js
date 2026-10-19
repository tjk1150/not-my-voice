// 보이스팝, the fictional AI cover-song app of the prologue (two weeks earlier).
// Shared by the gallery and the live prologue: each screen takes a small state object.
// Nothing is recorded: the waveform is drawn, never captured.
import { ic, statusBar } from "./icons.js";
import { APP_ICONS } from "./app-icons.js";
import { VOICE_APP } from "./data.js";
import { SONG_PLAYS, WAVE_BAR_COUNT } from "./constants.js";

const check = (on, size) => `<span class="vp-chk ${on ? "on" : ""}" style="width:${size}px;height:${size}px">${ic("check", Math.round(size * 0.62), 3)}</span>`;
const brand = () => `<header class="vp-brand">${APP_ICONS.voice(28)}<b>${VOICE_APP.name}</b></header>`;

export const wave = (live = false) =>
  `<div class="vp-wave ${live ? "live" : ""}">${Array.from({ length: WAVE_BAR_COUNT }, (_, index) => `<i style="height:${8 + ((index * 37) % 29)}px;animation-delay:${(index % 7) * 0.09}s"></i>`).join("")}</div>`;

// st: { clock, checked: boolean[], tappable, blinkItem, agreeBlink } ; tappable lets single items toggle (stop 4).
export function consentScreen(st) {
  const all = st.checked.every(Boolean);
  const ready = VOICE_APP.consents.every((item, index) => !item.req || st.checked[index]);
  const rows = VOICE_APP.consents
    .map(
      (item, index) => `<li class="${st.blinkItem === index ? "blink" : ""}" ${st.tappable ? `data-r="c-${index}"` : ""}>${check(st.checked[index], 20)}
        <div><span class="tag ${item.req ? "req" : ""}">${item.req ? "필수" : "선택"}</span> ${item.text}${item.note ? `<small>${item.note}</small>` : ""}</div>${ic("chevron-right", 18, 2)}</li>`
    )
    .join("");
  return `
  <div class="screen vp">
    ${statusBar(st.clock, "light")}
    <div class="vp-body">
      ${brand()}
      <h1 class="vp-h">시작하려면<br>약관에 동의해 주세요</h1>
      <p class="vp-sub">${VOICE_APP.tagline}</p>
      <div class="vp-all ${all ? "on" : st.tappable ? "" : "blink"}" data-p="all" ${st.tappable ? 'data-r="all"' : ""}>${check(all, 26)}<b>전체 동의</b><small>선택 항목 포함</small></div>
      <ul class="vp-list">${rows}</ul>
    </div>
    <button class="vp-btn ${ready ? "on" : ""} ${ready && st.agreeBlink !== false ? "blink" : ""}" ${ready ? 'data-p="agree" data-r="agree"' : "disabled"}>동의하고 시작하기</button>
  </div>`;
}

export function songScreen(st) {
  const songs = VOICE_APP.songs
    .map((title, index) => `<div class="vp-song blink" data-p="song-${index}"><span class="cover c${index}">${ic("music", 22, 2)}</span><div><b>${title}</b><small>커버 ${SONG_PLAYS[index]}회</small></div>${ic("chevron-right", 20, 2)}</div>`)
    .join("");
  return `
  <div class="screen vp">
    ${statusBar(st.clock, "light")}
    <div class="vp-body">
      ${brand()}
      <h1 class="vp-h">어떤 노래를<br>내 목소리로 불러 볼까요?</h1>
      <p class="vp-sub">지금 인기 있는 노래</p>
      <div class="vp-songs">${songs}</div>
    </div>
  </div>`;
}

// st.rec: "idle" | "rec" | "learn" ; st.sec counts the fake recording ; st.learn is 0..1.
export function recordScreen(st) {
  const state = { idle: "버튼을 누르면 녹음이 시작돼요", rec: `녹음 중 0:${String(st.sec || 0).padStart(2, "0")} / 0:10`, learn: "AI가 내 목소리를 배우고 있어요" }[st.rec];
  const control =
    st.rec === "learn"
      ? `<div class="vp-progress"><i style="width:${Math.round((st.learn || 0) * 100)}%"></i></div>`
      : `<span class="vp-mic ${st.rec === "rec" ? "rec" : "blink"}" ${st.rec === "idle" ? 'data-p="mic"' : ""}>${ic(st.rec === "rec" ? "square" : "mic", 34, 2.2, st.rec === "rec" ? 'fill="currentColor"' : "")}</span>`;
  return `
  <div class="screen vp">
    ${statusBar(st.clock, "light")}
    <div class="vp-body">
      ${brand()}
      <h1 class="vp-h">내 목소리를<br>녹음해 주세요</h1>
      <p class="vp-sub">아래 문장을 소리 내어 읽어 주세요</p>
      <blockquote class="vp-script">${VOICE_APP.script(st.name)}</blockquote>
      ${wave(st.rec === "rec")}
      <p class="vp-state">${state}</p>
    </div>
    <div class="vp-control">${control}</div>
  </div>`;
}

export function doneScreen(st) {
  return `
  <div class="screen vp">
    ${statusBar(st.clock, "light")}
    <div class="vp-body">
      ${brand()}
      <h1 class="vp-h">내 AI 목소리가<br>완성됐어요</h1>
      <div class="vp-card pop"><span class="cover c${st.song}">${ic("play", 26, 0, 'fill="currentColor"')}</span><div><b>${VOICE_APP.songs[st.song]}</b><small>${st.name}의 AI 목소리</small></div></div>
      ${wave(true)}
      ${st.shared === false
        ? `<div class="vp-share">${ic("lock", 22, 2)}<div><b>내 AI 목소리 · 나만 사용</b><small>다른 이용자는 이 목소리를 쓸 수 없어요</small></div><span class="vp-toggle"></span></div>`
        : `<div class="vp-share">${ic("globe", 22, 2)}<div><b>내 AI 목소리 · 전체 공개</b><small>다른 이용자도 이 목소리로 노래와 말을 만들 수 있어요</small></div><span class="vp-toggle on"></span></div>`}
    </div>
  </div>`;
}
