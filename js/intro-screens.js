// Intro in first person: name, then a prologue two weeks earlier in the AI cover-song app 보이스팝,
// then the night itself. No avatar, no face: the phone is simply the player's phone.
import { ic } from "./icons.js";
import { ME, VOICE_APP, TITLE } from "./data.js";
import { TEASE_FIRST_MS, TEASE_STEP_MS } from "./constants.js";
import { consentScreen, songScreen, recordScreen, doneScreen } from "./voice-screens.js";
import { card as notifCard } from "./ios-screens.js";

// A black card: a small grey line over a large white one (time cards, title, monologue).
export const monoCard = (top, main, extra = "", cls = "") => `
  <div class="screen mono ${cls}">
    <div class="mono-box">${top ? `<div class="mono-top">${top}</div>` : ""}<div class="mono-main">${main}</div>${extra}</div>
  </div>`;

export const card = (top = "2주 전", bottom = "오후 7:10") => monoCard(top, bottom);

// The first screen: notifications drop in (CSS delays), then the hook line, the title and the button.
// It is silent: browsers allow sound only after a tap, so sound starts with "휴대폰 켜기".
export const titleScreen = (live = false) => `
  <div class="screen mono title">
    <div class="tease">${TITLE.teaser.map((item, index) => `<div class="tease-card" style="animation-delay:${(TEASE_FIRST_MS + index * TEASE_STEP_MS) / 1000}s">${notifCard(item)}</div>`).join("")}</div>
    <div class="tease-hook"><p>${TITLE.hook}</p><h1>${TITLE.title}</h1></div>
    <div class="title-foot"><span>${TITLE.note}</span><button class="btn-main ${live ? "" : "blink"}" ${live ? 'data-p="title-go"' : ""}>${ic("power", 18, 2.4)} ${TITLE.cta}</button></div>
  </div>`;

export function nameInput() {
  return `
  <div class="screen name-in">
    <div class="box">
      <h1>체험을 위해<br>당신의 이름을 입력해 주세요</h1>
      <p>친구들이 메시지에서 이 이름으로 당신을 부릅니다.</p>
      <div class="field">${ME}<i class="caret"></i></div>
      <div class="note">${ic("lock", 14, 2)} 이름은 이 기기 안에서만 쓰이고 저장되지 않아요. 녹음이나 촬영은 하지 않아요.</div>
    </div>
    <div class="btn-main blink" style="top:760px">다음</div>
    <i class="home-ind"></i>
  </div>`;
}

const unchecked = () => VOICE_APP.consents.map(() => false);

export const voiceConsent = () => consentScreen({ clock: "7:10", checked: unchecked() });
export const voiceConsentAll = () => consentScreen({ clock: "7:10", checked: VOICE_APP.consents.map(() => true) });
export const voiceSong = () => songScreen({ clock: "7:11" });
export const voiceRecord = () => recordScreen({ clock: "7:11", name: ME, rec: "rec", sec: 4 });
export const voiceDone = () => doneScreen({ clock: "7:12", name: ME, song: 0 });
