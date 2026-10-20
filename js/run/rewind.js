// Phase 2: one long rewind with four stops, the new night and the ending.
// Each stop: the clock runs backwards, the screen of that moment appears, a white card asks,
// the player changes one thing with their own hands, and that cause's notifications shatter.
import { VOICE_APP, ME, SONG } from "../data.js";
import { consentScreen, doneScreen } from "../voice-screens.js";
import { allCounted } from "./timeline.js";
import { PHASE1_END, NEW_NIGHT, STOPS, WARM } from "./rewind-data.js";
import * as R from "./rewind-views.js";
import { bgm } from "./bgm.js";
import { lock } from "./views.js";
import { wait, easeInOut, dayText, timeText, clockText } from "../utils.js";
import { LESSON_BUTTON, MOM_REPLY, BIO } from "./rewind-data.js";


export function runRewind({ root, scr, ov, icons, vibrate, sfx, side }) {
  const notifs = allCounted();
  let count = notifs.length;
  let pending = null;
  let toastTimer = 0;

  // One listener; each step waits for one of the keys it accepts.
  root.addEventListener("pointerdown", (event) => {
    const el = event.target.closest("[data-r]");
    if (!el || !pending || !pending.keys.includes(el.dataset.r)) return;
    const { resolve } = pending;
    pending = null;
    resolve(el.dataset.r);
  });
  const tap = (...keys) => new Promise((resolve) => { pending = { keys, resolve }; });

  const show = (html) => { scr.innerHTML = html; icons(); };
  const layer = (html = "") => { ov.innerHTML = R.counter(count) + html; icons(); };
  const toast = (text) => {
    ov.querySelector(".rw-toast")?.remove();
    ov.insertAdjacentHTML("beforeend", R.toast(text));
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => ov.querySelector(".rw-toast")?.remove(), 2400);
  };
  const setCount = (value) => {
    count = value;
    side.count.textContent = count;
    const pill = ov.querySelector(".rw-count");
    if (pill) { pill.outerHTML = R.counter(count, true); }
  };

  async function travel(from, to, forward = false, ms = 2600) {
    layer(R.hud(forward));
    scr.classList.add("rw-blur");
    sfx.travel(ms, forward);
    const day = ov.querySelector(".rw-day");
    const time = ov.querySelector(".rw-time");
    const steps = 48;
    for (let index = 0; index <= steps; index += 1) {
      const at = new Date(from.getTime() + (to.getTime() - from.getTime()) * easeInOut(index / steps));
      day.textContent = dayText(at);
      time.textContent = timeText(at);
      await wait(ms / steps);
    }
    scr.classList.remove("rw-blur");
  }

  async function ask(stop, screen) {
    show(screen);
    layer(R.dialog(stop));
    await tap("go");
    layer();
  }

  async function shatter(stop) {
    const cards = notifs.filter((item) => item.tag === stop.tag);
    const from = count;
    layer(R.pile(cards));
    await wait(1100);
    for (const el of ov.querySelectorAll(".rw-c")) {
      el.classList.add("crack");
      setCount(count - 1);
      sfx.dismiss(count);
      await wait(140);
    }
    await wait(600);
    // After the last stop the clock runs forward to the night, so the button says so.
    const last = stop === STOPS[STOPS.length - 1];
    layer(R.lesson(stop.lesson, from, count, last ? LESSON_BUTTON.forward : LESSON_BUTTON.back));
    sfx.chime();
    await tap("go");
  }

  async function stopOne(stop) {
    const clock = clockText(stop.at);
    await ask(stop, R.reelAt(clock));
    layer(R.captureButton());
    await tap("capture");
    sfx.shutter();
    layer(R.flash() + R.shotThumb());
    await tap("thumb");
    layer();
    show(R.shareSheet(clock));
    while ((await tap("to-mom", "to-other")) === "to-other") toast("먼저 보호자에게 보내 보세요. 선생님께는 엄마와 같이 말씀드릴 수 있어요.");
    const lines = [{ who: "me", text: R.shotBubble() }, { who: "me", text: `엄마 이거 나 아니야. 누가 내 목소리를 AI로 만들어서 올렸어`, time: `오후 ${clock}` }];
    show(R.momRoom(clock, lines));
    await wait(900);
    show(R.momRoom(clock, [...lines, { typing: true }]));
    await wait(1300);
    // Mom asks about the report, so going back to the reel to report it is the player's own answer.
    // Each line is rendered once (a re-render would replay its pop and look like a second message).
    const replies = [{ who: "엄마", text: "알았어. 캡처 잘했다.", first: true }, { who: "엄마", text: "엄마가 지금 갈게. 담임 선생님께도 같이 말씀드리자" }, { who: "엄마", text: "그 영상 신고는 했어?", time: `오후 ${clock}` }];
    for (let index = 1; index <= replies.length; index += 1) {
      const last = index === replies.length;
      show(R.momRoom(clock, [...lines, ...replies.slice(0, index)], { reply: last ? MOM_REPLY : "" }));
      if (!last) await wait(700);
    }
    await tap("reply");
    show(R.momRoom(clock, [...lines, ...replies, { who: "me", text: MOM_REPLY, time: `오후 ${clock}` }]));
    await wait(900);
    show(R.moreAt(clock));
    await tap("report");
    show(R.reportAt(clock));
    await tap("fake");
    show(R.reportDoneAt(clock));
    await tap("done");
    show(R.reelAt(clock));
    await shatter(stop);
  }

  async function stopTwo(stop) {
    const clock = clockText(stop.at);
    await ask(stop, R.profileEdit(clock));
    // Every personal item has to go; the hobby stays (it cannot lead anyone to me).
    const removed = [];
    let misses = 0;
    const left = () => BIO.filter((item) => item.personal && !removed.includes(item.key));
    while (left().length) {
      const key = (await tap(...BIO.filter((item) => !removed.includes(item.key)).map((item) => `bio-${item.key}`))).slice(4);
      const item = BIO.find((entry) => entry.key === key);
      if (item.personal) removed.push(key);
      else {
        misses += 1;
        toast("취미만으로는 당신을 찾기 어려워요. 다른 말을 찾아보세요.");
      }
      show(R.profileEdit(clock, { removed, hint: misses > 1, blinkDone: !left().length }));
    }
    await tap("done");
    show(R.profileEdit(clock, { removed, saved: true }));
    await shatter(stop);
  }

  async function stopThree(stop) {
    const clock = clockText(stop.at);
    show(R.vlogUpload(clock));
    const picked = [];
    layer(R.dialog({ ...stop, picked, button: "공개 범위 바꾸기" }));
    while (picked.length < stop.chips.length) {
      const index = Number((await tap(...stop.chips.map((_, chip) => `chip-${chip}`))).slice(5));
      if (!picked.includes(index)) picked.push(index);
      layer(R.dialog({ ...stop, picked, button: "공개 범위 바꾸기" }));
    }
    await tap("go");
    layer();
    show(R.privacyAt(clock, "toggle"));
    await tap("toggle");
    show(R.privacyAt(clock, "sheet"));
    await tap("private");
    show(R.privacyAt(clock, "on"));
    await wait(900);
    await shatter(stop);
  }

  async function stopFour(stop) {
    const st = { clock: clockText(stop.at), checked: VOICE_APP.consents.map(() => true), tappable: true, blinkOptional: true, agreeBlink: false };
    const optionalOn = () => VOICE_APP.consents.flatMap((item, index) => (!item.req && st.checked[index] ? [index] : []));
    await ask(stop, consentScreen(st));
    for (;;) {
      const key = await tap("agree", "all", ...VOICE_APP.consents.map((_, index) => `c-${index}`));
      if (key === "all") {
        // "전체 동의" here switches every optional item together; required ones stay on.
        const anyOptionalOn = VOICE_APP.consents.some((item, index) => !item.req && st.checked[index]);
        st.checked = VOICE_APP.consents.map((item) => item.req || !anyOptionalOn);
        if (!anyOptionalOn) toast("선택 동의가 다시 모두 켜졌어요.");
      } else if (key === "agree") {
        // Every optional consent has to be off: the card asks for all the ones the app does not need.
        const stillOn = optionalOn();
        if (!stillOn.length) break;
        toast(`아직 켜져 있는 선택 동의가 ${stillOn.length}개 있어요. 앱을 쓰는 데 꼭 필요하지 않은 건 모두 꺼 보세요.`);
      } else {
        const index = Number(key.slice(2));
        if (VOICE_APP.consents[index].req) toast("필수 항목은 끌 수 없어요. 앱을 쓰려면 필요해요.");
        else st.checked = st.checked.map((on, item) => (item === index ? !on : on));
      }
      st.agreeBlink = !optionalOn().length;
      show(consentScreen(st));
    }
    show(doneScreen({ clock: st.clock, name: ME, song: Math.max(0, VOICE_APP.songs.indexOf(SONG)), shared: false }));
    await wait(900);
    await shatter(stop);
  }

  async function newNight() {
    await travel(STOPS[3].at, NEW_NIGHT, true, 3200);
    bgm.play("newnight");
    const remaining = notifs.filter((item) => item.tag === "R");
    const list = [];
    const render = () => show(lock({ lockNotifs: list, clock: clockText(NEW_NIGHT) }));
    layer();
    render();
    await wait(1600);
    for (const item of [...remaining, ...WARM.map(([app, title, body]) => ({ app, title, body, warm: true }))]) {
      list.forEach((entry) => (entry.fresh = false));
      list.unshift({ ...item, fresh: true });
      render();
      vibrate();
      sfx.notify(item.app);
      await wait(item.warm ? 2200 : 1800);
    }
    layer(`<button class="rw-next blink" data-r="go">엔딩 보기</button>`);
    await tap("go");
  }

  async function endingScreen() {
    const items = notifs.filter((item) => item.tag === "R");
    const flipped = [];
    ov.innerHTML = "";
    side.time.innerHTML = "<b>엔딩</b>";
    show(R.ending(items, flipped, { intro: true }));
    const screen = scr.querySelector(".screen.end");
    sfx.chime();
    bgm.play("ending");
    for (;;) {
      const key = await tap(...items.map((_, index) => `card-${index}`), "help", "restart");
      // Always back to the very start (name input), whatever entry point was used.
      if (key === "restart") { location.href = `${location.pathname}?run`; return; }
      if (key === "help") {
        ov.innerHTML = R.helpSheet();
        icons();
        await tap("close");
        ov.innerHTML = "";
        continue;
      }
      // Flip in place, so the card turns and nothing above it redraws; the next card takes the blink.
      const index = Number(key.slice(5));
      if (flipped.includes(index)) continue;
      flipped.push(index);
      const cards = [...screen.querySelectorAll(".e-card")];
      cards.forEach((el) => el.classList.remove("blink"));
      cards[index].classList.add("flip");
      const next = cards.findIndex((_, at) => !flipped.includes(at));
      if (next >= 0) cards[next].classList.add("blink");
      else {
        screen.insertAdjacentHTML("beforeend", R.endingTail());
        icons();
        screen.querySelector(".e-tail")?.scrollIntoView?.({ behavior: "smooth", block: "end" });
      }
    }
  }

  async function run() {
    side.time.innerHTML = "<b>2단계</b> 되감기";
    let from = PHASE1_END;
    const steps = [stopOne, stopTwo, stopThree, stopFour];
    for (const [index, stop] of STOPS.entries()) {
      await travel(from, stop.at);
      await steps[index](stop);
      from = stop.at;
    }
    side.time.innerHTML = "<b>새로운 밤</b>";
    await newNight();
    await endingScreen();
  }

  run();
}

