// Prologue before phase 1: name input, "2주 전", the AI cover-song app 보이스팝
// (tap "전체 동의", pick a song, read one sentence), then "그리고 2주 뒤".
// Resolves with { name, choice } where choice is the song index. The name stays in memory only,
// and nothing is recorded: the microphone is never opened.
import { ic } from "../icons.js";
import { card, titleScreen } from "../intro-screens.js";
import { VOICE_APP } from "../data.js";
import { consentScreen, songScreen, recordScreen, doneScreen } from "../voice-screens.js";

import { REC_STEP_MS, LEARN_STEPS } from "../constants.js";
import { wait } from "../utils.js";
import { sfx } from "./sfx.js";
import { bgm } from "./bgm.js";

// Letters, digits and spaces only, at most 6 characters: no markup can reach the screens.
export const cleanName = (raw) => raw.replace(/[^\p{L}\p{N} ]/gu, "").trim().slice(0, 6);

function nameScreen() {
  return `
  <div class="screen name-in">
    <div class="box">
      <h1>체험을 위해<br>당신의 이름을 입력해 주세요</h1>
      <p>친구들이 메시지에서 이 이름으로 당신을 부릅니다.</p>
      <label class="field"><input id="pname" maxlength="6" autocomplete="off" placeholder="이름" aria-label="이름"></label>
      <div class="note">${ic("lock", 14, 2)} 이름은 이 기기 안에서만 쓰이고 저장되지 않아요. 녹음이나 촬영은 하지 않아요.</div>
    </div>
    <button class="btn-main" style="top:760px" data-p="name-go" disabled>다음</button>
  </div>`;
}

export function runPrologue(scr, { icons }) {
  return new Promise((resolve) => {
    const st = { name: "", song: 0, checked: VOICE_APP.consents.map(() => false), tappable: false, rec: "idle", sec: 0, learn: 0, clock: "7:10", busy: false };
    const abort = new AbortController();
    const show = (html) => { scr.innerHTML = html; icons(); };

    async function afterName() {
      show(card("2주 전", "오후 7:10"));
      await wait(2200);
      show(consentScreen(st));
    }

    async function afterAll() {
      st.checked = st.checked.map(() => true);
      show(consentScreen(st));
    }

    async function afterAgree() {
      st.clock = "7:11";
      show(songScreen(st));
    }

    async function afterSong(index) {
      st.song = index;
      show(recordScreen(st));
    }

    async function afterMic() {
      sfx.recStart();
      st.rec = "rec";
      show(recordScreen(st));
      const label = scr.querySelector(".vp-state");
      for (st.sec = 1; st.sec <= 10; st.sec += 1) {
        await wait(REC_STEP_MS);
        label.textContent = `녹음 중 0:${String(st.sec).padStart(2, "0")} / 0:10`;
      }
      st.rec = "learn";
      show(recordScreen(st));
      const bar = scr.querySelector(".vp-progress i");
      for (let step = 1; step <= LEARN_STEPS; step += 1) {
        await wait(200);
        bar.style.width = `${Math.round((step / LEARN_STEPS) * 100)}%`;
      }
      await wait(300);
      st.clock = "7:12";
      sfx.learned();
      show(doneScreen(st));
      await wait(3600);
      show(card("그리고 2주 뒤", "오후 11:00"));
      await wait(2400);
      abort.abort();
      resolve({ name: st.name, choice: st.song });
    }

    // Title first; the name screen comes after "휴대폰 켜기". That tap is the first one, so it also
    // unlocks audio (engine pointerdown) and the prologue music starts with it.
    let input = null;
    async function showName() {
      bgm.play("prologue");
      show(nameScreen());
      input = scr.querySelector("#pname");
      const button = scr.querySelector("[data-p='name-go']");
      input.addEventListener("input", () => { button.disabled = !cleanName(input.value); }, { signal: abort.signal });
      input.addEventListener("keydown", (event) => { if (event.key === "Enter" && !button.disabled) button.click(); }, { signal: abort.signal });
      setTimeout(() => input.focus(), 50);
    }
    show(titleScreen(true));

    scr.addEventListener("click", (event) => {
      const el = event.target.closest("[data-p]");
      if (!el || st.busy || !el.dataset.p) return;
      const key = el.dataset.p;
      const run = (task) => { st.busy = true; task().finally(() => { st.busy = false; }); };
      if (key === "title-go") run(showName);
      else if (key === "name-go") { st.name = cleanName(input.value); if (st.name) run(afterName); }
      else if (key === "all") run(afterAll);
      else if (key === "agree") run(afterAgree);
      else if (key.startsWith("song-")) run(() => afterSong(Number(key.slice(5))));
      else if (key === "mic") run(afterMic);
    }, { signal: abort.signal });
  });
}
