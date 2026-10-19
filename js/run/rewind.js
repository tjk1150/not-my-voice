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
import { wait, easeInOut, dayText, timeText, clockText, shareFile, saveFile, copyText } from "../utils.js";
import { SHARE } from "../data.js";
import { REMAINING } from "./rewind-data.js";
import { drawShareCard } from "./share-card.js";


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
    layer(R.lesson(stop.lesson, from, count));
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
    const replies = [{ who: "엄마", text: "알았어. 캡처 잘했다.", first: true }, { who: "엄마", text: "엄마가 지금 갈게. 담임 선생님께도 같이 말씀드리자" }, { who: "엄마", text: "영상은 신고해 둬", time: `오후 ${clock}` }];
    for (let index = 1; index <= replies.length; index += 1) {
      show(R.momRoom(clock, [...lines, ...replies.slice(0, index)]));
      await wait(700);
    }
    show(R.momRoom(clock, [...lines, ...replies], true));
    await tap("back");
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
    let misses = 0;
    while ((await tap("bio-school", "bio-hobby")) === "bio-hobby") {
      misses += 1;
      show(R.profileEdit(clock, { blinkSchool: misses > 1 }));
      toast("취미만으로는 당신을 찾기 어려워요. 다른 말을 찾아보세요.");
    }
    show(R.profileEdit(clock, { school: false, blinkDone: true }));
    await tap("done");
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
    const st = { clock: clockText(stop.at), checked: VOICE_APP.consents.map(() => true), tappable: true, blinkItem: null, agreeBlink: false };
    const optionalOn = () => VOICE_APP.consents.flatMap((item, index) => (!item.req && st.checked[index] ? [index] : []));
    await ask(stop, consentScreen(st));
    for (;;) {
      const key = await tap("agree", "all", ...VOICE_APP.consents.map((_, index) => `c-${index}`));
      if (key === "all") {
        // "전체 동의" here switches every optional item together; required ones stay on.
        const anyOptionalOn = VOICE_APP.consents.some((item, index) => !item.req && st.checked[index]);
        st.checked = VOICE_APP.consents.map((item) => item.req || !anyOptionalOn);
        if (anyOptionalOn) st.blinkItem = null;
        else toast("선택 동의가 다시 모두 켜졌어요.");
      } else if (key === "agree") {
        // Every optional consent has to be off: the card asks for all the ones the app does not need.
        const stillOn = optionalOn();
        if (!stillOn.length) break;
        st.blinkItem = stillOn[0];
        toast(`아직 켜져 있는 선택 동의가 ${stillOn.length}개 있어요. 앱을 쓰는 데 꼭 필요하지 않은 건 모두 꺼 보세요.`);
      } else {
        const index = Number(key.slice(2));
        if (VOICE_APP.consents[index].req) toast("필수 항목은 끌 수 없어요. 앱을 쓰려면 필요해요.");
        else st.checked = st.checked.map((on, item) => (item === index ? !on : on));
        if (index === st.blinkItem && !st.checked[index]) st.blinkItem = optionalOn()[0] ?? null;
      }
      st.agreeBlink = !optionalOn().length;
      show(consentScreen(st));
    }
    show(doneScreen({ clock: st.clock, name: ME, song: Math.max(0, VOICE_APP.songs.indexOf(SONG)), shared: false }));
    await wait(2400);
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

  // Pick one of the remaining five, draw the story card with that pick, then send, save or copy.
  async function shareFlow() {
    const url = `${location.origin}${location.pathname}?run`;
    ov.innerHTML = R.pickSheet();
    icons();
    const picked = await tap("close", ...REMAINING.map((_, index) => `pick-${index}`));
    if (picked === "close") { ov.innerHTML = ""; return; }
    ov.innerHTML = R.cardSheet(null);
    const file = await drawShareCard({ pick: REMAINING[Number(picked.slice(5))], url });
    const src = URL.createObjectURL(file);
    ov.innerHTML = R.cardSheet(src);
    icons();
    for (;;) {
      const key = await tap("send", "save", "copy", "close");
      if (key === "close") break;
      if (key === "save") { saveFile(file); toast("이미지를 저장했어요. 인스타그램 스토리에 올려 보세요."); }
      if (key === "copy") toast((await copyText(`${SHARE.text} ${url}`)) ? "링크를 복사했어요." : "이 기기에서는 복사할 수 없어요.");
      if (key === "send") {
        const result = await shareFile({ file, ...SHARE, url });
        if (result === "shared") break;
        if (result === "saved") toast("이 기기는 바로 공유할 수 없어 이미지를 저장했어요.");
      }
    }
    URL.revokeObjectURL(src);
    ov.innerHTML = "";
  }

  async function endingScreen() {
    const items = notifs.filter((item) => item.tag === "R");
    const flipped = [];
    ov.innerHTML = "";
    side.time.innerHTML = "<b>엔딩</b>";
    show(R.ending(items, flipped, false));
    sfx.chime();
    bgm.play("ending");
    for (;;) {
      const key = await tap(...items.map((_, index) => `card-${index}`), "help", "restart", "share");
      if (key === "share") {
        await shareFlow();
        continue;
      }
      // Always back to the very start (name input), whatever entry point was used.
      if (key === "restart") { location.href = `${location.pathname}?run`; return; }
      if (key === "help") {
        ov.innerHTML = R.helpSheet();
        icons();
        await tap("close");
        ov.innerHTML = "";
        continue;
      }
      const index = Number(key.slice(5));
      if (!flipped.includes(index)) flipped.push(index);
      show(R.ending(items, flipped, flipped.length === items.length));
      const cards = scr.querySelector(".e-cards");
      if (flipped.length === items.length) cards?.scrollIntoView?.({ block: "nearest" });
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

