// Phase 1 runtime: real time drives the game clock (15 s = 1 game minute), notifications,
// room scripts, the bullies' group call and the storm. The player only taps; the next target blinks.
import { buildPhase1, STORM, SECONDS_PER_GAME_MINUTE } from "./timeline.js";
import { ROOMS, groupScript, rejoinLines, STAYED_LINES, CALL_LINES, DENY_REPLIES, KICK_LINES } from "./rooms.js";
import { DENY_TEXT } from "../data.js";
import { runPrologue } from "./prologue.js";
import { runRewind } from "./rewind.js";
import { playCall } from "./call-audio.js";
import { sfx } from "./sfx.js";
import { bgm } from "./bgm.js";
import { setPlayer } from "../data.js";
import * as V from "./views.js";
import { ic } from "../icons.js";
import { card } from "../ios-screens.js";
import { TAP_TO_VIEW, BANNER_ROOMS, TALK_ORDER, FREEZE_HOLD_MS, MONOLOGUE_MS } from "../constants.js";
import { MONOLOGUE, REWIND_PROMPT } from "../data.js";
import { monoCard } from "../intro-screens.js";
import { bindLayout } from "./layout.js";


function initialState() {
  const rooms = {};
  for (const [id, info] of Object.entries(ROOMS)) {
    rooms[id] = { lines: info.history.map((line) => ({ ...line })), queue: [], nextAt: 0, typing: null, started: id !== "dm-group", fresh: false, updated: 0, time: "", pop: false };
  }
  rooms["dm-group"].queue = groupScript();
  return {
    events: buildPhase1(), t: 0, next: 0, fired: 0, view: "lock", locked: true, clock: "11:00", rooms, unread: {}, notifs: [], lockNotifs: [], banner: null,
    activity: [], activityFresh: false, flags: { requests: [], follow: 0 }, reel: { likes: 23, shares: 3 }, commentsShown: 0, commentsFresh: false,
    reported: false, left: false, denied: false, kicked: false, call: { state: "none" }, storm: { on: false, count: 0, frozen: false }, seen: new Set(["lock"]), guide: null,
  };
}

const clockAt = (t) => `11:${String(Math.min(12, Math.floor(t / SECONDS_PER_GAME_MINUTE))).padStart(2, "0")}`;
const ampm = (clock) => `오후 ${clock}`;

export function start(root, params) {
  const speed = Number(params.get("speed")) || 1;
  // ?run starts with the prologue; ?run&phase1 (or a ?t= jump) starts at the lock screen; ?run&phase2 at the rewind.
  const skipPrologue = params.has("phase1") || params.has("t") || params.has("phase2");
  let state = initialState();
  let running = false;
  let last = 0;

  root.className = "run-wrap";
  root.innerHTML = `
    <div class="phone run"><div class="scr"></div><div class="ov"></div>
      ${skipPrologue ? `<div class="startcard"><div><p>1단계</p><h1>그날 밤</h1><span>밤 11시. 영상 소리(미디어 볼륨)는 꺼 두었어요.<br>깜빡이는 곳을 눌러 확인해 보세요.</span><button data-start>시작</button></div></div>` : ""}</div>
    <aside class="run-side"><p class="r-hint"></p><span class="r-stats"><span class="r-time"><b>0:00</b> / 3:00</span><span class="r-count">알림 <b>0</b> / 47</span></span>
      <button class="r-sound" data-sound aria-label="소리 끄기" title="소리 끄기">${ic("volume-2", 20, 2)}</button></aside>`;
  // Time and notification count are for checking the run (?debug); students see only the phone.
  if (params.has("debug")) root.dataset.debug = "";
  const phone = root.querySelector(".phone");
  bindLayout(root, phone);
  const scr = root.querySelector(".scr");
  const ov = root.querySelector(".ov");

  const icons = () => window.lucide?.createIcons();
  const vibrate = () => {
    phone.classList.remove("shake");
    void phone.offsetWidth;
    phone.classList.add("shake");
    // Browsers block vibration until the user has tapped the page; skip it until then.
    if (navigator.userActivation?.hasBeenActive) navigator.vibrate?.(140);
  };

  const badges = () => {
    const count = (app) => state.notifs.filter((item) => item.app === app && !item.opened).length;
    return { feed: count("feed"), talk: count("talk"), phone: count("phone"), voice: count("voice") };
  };

  function renderView() {
    const view = state.view;
    const s = { ...state, badges: badges() };
    let html;
    if (view === "lock") html = V.lock(s);
    else if (view === "home") html = V.home(s);
    else if (view === "dm-inbox") html = V.dmInbox(s);
    else if (view.startsWith("dm")) html = V.feedRoom(s, view);
    else if (view === "reels") html = V.reels(s);
    else if (view === "comments") html = V.comments(s);
    else if (view === "audio") html = V.audio(s);
    else if (view === "more") html = V.more(s);
    else if (view === "report") html = V.report(s);
    else if (view === "report-done") html = V.reportDoneView(s);
    else if (view === "activity") html = V.activity(s);
    else if (view === "talk-list") html = V.talkList(s);
    else html = V.talkRoom(s, view);
    const live = scr.querySelector(".live");
    const pinned = !live || live.scrollHeight - live.scrollTop - live.clientHeight < 40;
    const keep = live ? live.scrollTop : 0;
    scr.innerHTML = html;
    icons();
    const next = scr.querySelector(".live");
    if (next) next.scrollTop = pinned ? next.scrollHeight : keep;
    for (const room of Object.values(state.rooms)) room.pop = false;
    state.lockNotifs.forEach((item) => (item.fresh = false));
    state.activityFresh = false;
    state.commentsFresh = false;
    applyGuide(true);
  }

  function renderOverlay() {
    let html = "";
    if (state.banner && !state.storm.on) html += `<div class="banner run-banner" data-go="banner">${card(state.banner.item, "light")}</div>`;
    html += V.callLayer(state.call);
    if (state.storm.on) {
      html += `<div class="storm-pile">${STORM.slice(0, state.storm.count)
        .map(([app, title, body], index) => card({ app, title, body }, `light ${index === state.storm.count - 1 ? "drop" : ""}`, `top:${60 + ((index * 53) % 640)}px;transform:rotate(${((index * 37) % 13) - 6}deg)`))
        .join("")}</div>`;
      // The whole frozen screen starts the rewind, not only the button.
      // Frozen pile, then the monologue on black, then the rewind prompt (the whole card is tappable).
      if (state.storm.frozen) {
        const step = state.mono || 0;
        if (step === 0) html += `<div class="freeze"><span class="count">알림 47</span></div>`;
        else if (step <= MONOLOGUE.length) html += monoCard(...MONOLOGUE[step - 1]);
        else html += `<div class="rewind-card" data-rewind>${monoCard(...REWIND_PROMPT, `<button class="rw-go">${ic("rewind", 22, 2, 'fill="currentColor"')} 되감기</button>`)}</div>`;
      }
    }
    ov.innerHTML = html;
    icons();
    applyGuide(true);
  }

  function guideFor() {
    const { view, t, seen, unread, rooms } = state;
    const groupDone = rooms["dm-group"].started && !rooms["dm-group"].queue.length && !rooms["dm-group"].typing;
    if (state.storm.on) return null;
    if (state.call.state === "ringing") return "accept";
    if (state.banner && BANNER_ROOMS.includes(state.banner.item.to) && !seen.has(state.banner.item.to)) return "banner";
    if (view === "lock") return "notif-0";
    if (view === "home") return !seen.has("dm-group") || (!state.reported && t < 112) ? "app-feed" : "app-talk";
    if (view === "dm-inbox") {
      if (!seen.has("dm-group")) return "room-dm-group";
      if (unread["dm:sua"]) return "room-dm:sua";
      if (unread["dm:harin"]) return "room-dm:harin";
      if (unread["dm:yerin"]) return "room-dm:yerin";
      if (unread["dm-group"] && t > 47 && t < 60) return "room-dm-group";
      return !state.reported ? "tab-reels" : t >= 112 ? "home" : "tab-home";
    }
    if (view === "dm-group") return V.canDeny(state) ? "deny" : groupDone && t >= 38 && t < 47 && !state.left && !state.kicked ? "leave" : groupDone && (t >= 50 || state.kicked) ? "back" : null;
    if (view.startsWith("dm:")) return "back";
    if (view === "reels") return !seen.has("comments") ? "comments" : !seen.has("audio") ? "audio" : state.reported ? "tab-home" : "more";
    if (view === "audio") return "close-audio";
    if (view === "comments") return V.commentCount(t) >= 9 ? "close-comments" : null;
    if (view === "more") return "report-go";
    if (view === "report") return "reason-fake";
    if (view === "report-done") return "done";
    if (view === "activity") return t >= 112 ? "home" : null;
    if (view === "talk-list") {
      const next = TALK_ORDER.find((id) => unread[id]);
      return next ? `room-${next}` : null;
    }
    if (view.startsWith("talk:")) return "back";
    return null;
  }

  function applyGuide(force = false) {
    const next = guideFor();
    if (!force && next === state.guide) return;
    const before = state.guide;
    state.guide = next;
    if (before !== next && (next === "leave" || before === "leave")) return renderView();
    root.querySelectorAll("[data-guided]").forEach((el) => { el.classList.remove("blink"); el.removeAttribute("data-guided"); });
    // Phase 1 guides only by the blinking target inside the phone: no text outside it.
    if (!next) return;
    const target = root.querySelector(`[data-go="${next}"]`);
    if (target) { target.classList.add("blink"); target.setAttribute("data-guided", ""); }
  }

  // An open 피드 DM room plays a soft in-chat pop for each message from someone else (as the app does);
  // the notification sound for that room is skipped in present(), so each message sounds once.
  function chatSound(id, line) {
    if (state.view !== id || !line.who || line.who === "me") return;
    if (id.startsWith("talk:")) sfx.inChatTalk();
    else if (id.startsWith("dm")) sfx.inChat();
  }

  // A second or third message from the same person: the banner (or lock card) shows that message
  // and the alert sounds again, as on a real phone. These follow-ups are not part of the 47.
  function followUp(ev) {
    const info = ROOMS[ev.room];
    const item = { app: info.app, title: info.name, body: ev.msg.preview || ev.msg.text, to: ev.room, opened: false };
    if (!state.locked && state.view === ev.room) return;
    if (state.locked) state.lockNotifs.unshift({ ...item, fresh: true });
    else state.banner = { item, until: state.t + 3 };
    vibrate();
    sfx.notify(info.app);
  }

  function pushLine(id, line) {
    const room = state.rooms[id];
    const entry = { ...line, time: ampm(state.clock) };
    room.fresh = true;
    room.updated = state.t;
    room.time = ampm(state.clock);
    if (id === "dm-group" && (!room.started || room.queue.length || room.typing)) room.queue.push(entry);
    else { room.lines.push(entry); room.pop = true; chatSound(id, entry); }
    if (state.view !== id) state.unread[id] = (state.unread[id] || 0) + 1;
  }

  // Group lines always go through the queue so they appear one by one with a typing indicator.
  function queueGroup(lines) {
    const room = state.rooms["dm-group"];
    lines.forEach((line) => room.queue.push({ ...line }));
    room.fresh = true;
    room.updated = state.t;
    room.time = ampm(state.clock);
    if (state.view !== "dm-group") state.unread["dm-group"] = (state.unread["dm-group"] || 0) + lines.length;
  }

  function present(item) {
    state.fired += 1;
    // Like a real phone: the room or screen already open gets neither a banner nor a sound.
    const open = !state.locked && item.to === state.view;
    if (state.locked) state.lockNotifs.unshift({ ...item, fresh: true });
    else if (!open) state.banner = { item, until: state.t + 3 };
    if (open) return;
    vibrate();
    sfx.notify(item.app);
  }

  function fire(ev) {
    if (ev.type === "notif") {
      let body = ev.unreported && !state.reported ? ev.unreported : ev.body;
      if (ev.rejoin) {
        // Stayed and denied: no "read and ignored" jab, the room just moves on.
        const stayed = state.denied ? STAYED_LINES.slice(1) : STAYED_LINES;
        const lines = state.left ? rejoinLines() : stayed;
        if (!state.left) body = `${stayed[0].who}: ${stayed[0].text}`;
        queueGroup(lines);
      }
      if (ev.kick) { state.kicked = true; queueGroup(KICK_LINES); }
      const msg = state.denied && ev.deniedMsg ? ev.deniedMsg : ev.msg;
      if (state.denied && ev.deniedBody) body = ev.deniedBody;
      const item = { app: ev.app, title: ev.title, body, to: ev.to, opened: false };
      state.notifs.push(item);
      if (ev.room) pushLine(ev.room, msg);
      else if (ev.to === "dm-group" && state.view !== "dm-group") state.unread["dm-group"] = (state.unread["dm-group"] || 0) + 1;
      if (ev.act) { state.activity.unshift(ev.act); state.activityFresh = true; }
      if (ev.request) state.flags.requests = [...state.flags.requests, ev.request];
      if (ev.follow) state.flags.follow = ev.follow;
      present(item);
    } else if (ev.type === "line") { pushLine(ev.room, ev.msg); followUp(ev); }
    else if (ev.type === "call") { state.call = { state: "ringing", start: state.t, buzz: state.t }; vibrate(); sfx.ring(); }
    else if (ev.type === "storm") { state.storm.on = true; state.banner = null; }
    else if (ev.type === "freeze") {
      // A long frame can reach the freeze before the last storm card; finish the pile first.
      state.fired += STORM.length - state.storm.count;
      state.storm.count = STORM.length;
      state.storm.frozen = true;
      sfx.thud();
      // A jump start (?t=) freezes before the player taps "시작"; the monologue waits for that tap.
      if (running) startMonologue();
      else state.monoPending = true;
      bgm.stop(0);
    }
  }

  function step(dt) {
    state.t += dt;
    const t = state.t;
    bgm.setIntensity(t / 170);
    let viewDirty = false;
    let overlayDirty = false;
    const clock = clockAt(t);
    if (clock !== state.clock) { state.clock = clock; root.querySelectorAll(".screen:not(.lock) .sbar .time").forEach((el) => (el.textContent = clock)); const big = root.querySelector(".lock .clock"); if (big) big.textContent = clock; }
    while (state.events[state.next] && state.events[state.next].t <= t) {
      fire(state.events[state.next]);
      state.next += 1;
      viewDirty = true;
      overlayDirty = true;
    }
    const group = state.rooms["dm-group"];
    if (group.started && (group.queue.length || group.typing) && t >= group.nextAt) {
      const item = group.queue[0];
      if (item && item.who && item.who !== "me" && !group.typing) { group.typing = item.who; group.nextAt = t + 0.5; }
      else if (item) { group.typing = null; group.lines.push(group.queue.shift()); group.pop = true; group.nextAt = t + (item.who ? 0.35 : 0.3); chatSound("dm-group", item); }
      else group.typing = null;
      if (state.view === "dm-group") viewDirty = true;
    }
    const call = state.call;
    if (call.state === "ringing") {
      if (t - call.buzz > 1.2) { call.buzz = t; vibrate(); sfx.ring(); }
      if (t - call.start > 12) { call.state = "gone"; queueGroup(CALL_LINES.missed); overlayDirty = viewDirty = true; }
    } else if (call.state === "active") {
      call.elapsed = t - call.start;
      const beat = Math.floor(call.elapsed * 2.5);
      if (beat !== call.beat) { call.beat = beat; overlayDirty = true; }
      // With voices the call lasts as long as the lines; without them (or if blocked) 5 seconds.
      const over = call.audio === "done" || (call.audio === "none" && call.elapsed > 5) || call.elapsed > 25;
      if (over) { call.stop?.(); call.state = "ended"; call.endAt = t; call.speaker = null; overlayDirty = true; }
    } else if (call.state === "ended" && t - call.endAt > 1.2) {
      call.state = "gone";
      queueGroup([{ sys: `음성 통화 종료 · 0:${String(Math.round(call.endAt - call.start)).padStart(2, "0")}` }, ...CALL_LINES.answered]);
      overlayDirty = viewDirty = true;
    }
    if (state.view === "comments") {
      const shown = V.commentCount(t);
      if (shown !== state.commentsShown) { state.commentsShown = shown; state.commentsFresh = true; viewDirty = true; }
    }
    if (state.banner && t > state.banner.until) { state.banner = null; overlayDirty = true; }
    if (state.storm.on && !state.storm.frozen) {
      const count = Math.min(STORM.length, Math.floor((t - 170) / 0.25) + 1);
      if (count !== state.storm.count) { state.storm.count = count; state.fired = 27 + count; vibrate(); sfx.notify(STORM[count - 1][0]); overlayDirty = true; }
    }
    if (t > 53 && t < 170) {
      const k = Math.min(1, (t - 53) / 110);
      state.reel = { likes: Math.round(23 + (12000 - 23) * k * k), shares: Math.round(3 + 1901 * k * k) };
      if (state.view === "reels" && Math.floor(t * 2) !== Math.floor((t - dt) * 2)) {
        const counts = root.querySelectorAll(".reel .acts .a span");
        if (counts[0]) counts[0].textContent = state.reel.likes >= 10000 ? `${(state.reel.likes / 10000).toFixed(1).replace(".0", "")}만` : state.reel.likes.toLocaleString("ko-KR");
      }
    }
    if (viewDirty && !["more", "report", "report-done"].includes(state.view)) renderView();
    if (overlayDirty) renderOverlay();
    applyGuide();
    const shown = Math.min(180, Math.floor(t));
    root.querySelector(".r-time b").textContent = `${Math.floor(shown / 60)}:${String(shown % 60).padStart(2, "0")}`;
    root.querySelector(".r-count b").textContent = Math.min(47, state.fired);
  }

  function navigate(view) {
    if (!view) return;
    state.locked = false;
    state.view = view;
    state.seen.add(view);
    state.notifs.forEach((item) => { if (item.to === view) item.opened = true; });
    state.unread[view] = 0;
    const room = state.rooms[view];
    if (view === "dm-group" && !room.started) { room.started = true; room.nextAt = state.t + 0.4; }
    renderView();
  }

  // pointerdown, not click: the screen re-renders often and a click can land on a replaced node.
  root.addEventListener("pointerdown", (event) => {
    sfx.unlock();
    const sound = event.target.closest("[data-sound]");
    if (sound) {
      sfx.setMuted(!sfx.muted);
      const label = sfx.muted ? "소리 켜기" : "소리 끄기";
      sound.innerHTML = ic(sfx.muted ? "volume-x" : "volume-2", 20, 2);
      sound.setAttribute("aria-label", label);
      sound.title = label;
      icons();
      return;
    }
    if (event.target.closest("[data-start]")) { root.querySelector(".startcard").remove(); running = true; last = performance.now(); if (!state.storm.frozen) bgm.play("night"); if (state.monoPending) { state.monoPending = false; startMonologue(); } renderView(); return; }
    if (event.target.closest("[data-rewind]")) { startRewind(); return; }
    if (!running) return;
    const el = event.target.closest("[data-go]");
    if (!el) return;
    const key = el.dataset.go;
    if (key.startsWith("notif-")) return navigate(state.lockNotifs[Number(key.slice(6))]?.to || "home");
    if (key === "banner") { const to = state.banner?.item.to; state.banner = null; renderOverlay(); return navigate(to); }
    if (key.startsWith("room-")) return key === "room-request" ? null : navigate(key.slice(5));
    if (key === "back") return navigate(state.view.startsWith("talk:") ? "talk-list" : "dm-inbox");
    if (key === "deny") { state.denied = true; queueGroup([{ who: "me", text: DENY_TEXT }, ...DENY_REPLIES]); return renderView(); }
    if (key === "leave") { state.left = true; state.rooms["dm-group"].lines.push({ sys: "회원님이 대화방을 나갔습니다" }); return navigate("dm-inbox"); }
    if (key === "reason-fake" || key === "reason-other") { state.reported = true; return navigate("report-done"); }
    if (key === "done") return navigate("reels");
    if (key === "accept") {
      const call = { state: "active", start: state.t, beat: 0, elapsed: 0, speaker: null, audio: "playing" };
      call.stop = playCall({ onSpeaker: (who) => { call.speaker = who; renderOverlay(); }, onEnd: (ok) => { call.audio = ok ? "done" : "none"; } });
      state.call = call;
      return renderOverlay();
    }
    if (key === "decline") { state.call = { state: "gone" }; queueGroup(CALL_LINES.missed); renderOverlay(); return renderView(); }
    if (TAP_TO_VIEW[key]) return navigate(TAP_TO_VIEW[key]);
  });

  setInterval(() => {
    const now = performance.now();
    if (running && !state.storm.frozen) step(Math.min(0.5, ((now - last) / 1000) * speed));
    last = now;
  }, 100);

  // Phase 2 takes over the same phone: the engine stops reacting to taps.
  // Defined before the prologue branch returns, so every entry path can reach it.
  function startMonologue() {
    state.mono = 0;
    const advance = () => {
      state.mono += 1;
      renderOverlay();
      if (state.mono <= MONOLOGUE.length) setTimeout(advance, MONOLOGUE_MS);
    };
    setTimeout(advance, FREEZE_HOLD_MS);
  }

  function startRewind() {
    running = false;
    bgm.play("rewind");
    hintEl().textContent = "";
    runRewind({ root, scr, ov, icons, vibrate, sfx, side: { time: root.querySelector(".r-time"), count: root.querySelector(".r-count b"), hint: hintEl() } });
  }
  const hintEl = () => root.querySelector(".r-hint");

  // Test hook: ?debug exposes the state and controls (no effect on normal play).
  if (params.has("debug")) window.__run = { get state() { return state; }, navigate, step, begin: () => { root.querySelector(".startcard")?.remove(); running = true; last = performance.now(); renderView(); } };
  if (!skipPrologue) {
    root.querySelector(".r-time").innerHTML = "<b>프롤로그</b>";
    runPrologue(scr, { icons }).then(({ name, choice }) => {
      bgm.play("night");
      setPlayer(name, choice);
      state = initialState();
      root.querySelector(".r-time").innerHTML = "<b>0:00</b> / 3:00";
      running = true;
      last = performance.now();
      renderView();
      renderOverlay();
    });
    return;
  }
  if (params.has("phase2")) {
    root.querySelector(".startcard")?.remove();
    for (let i = 0; i < 1760; i += 1) step(0.1);
    renderView();
    renderOverlay();
    startRewind();
    return;
  }
  const jump = Number(params.get("t"));
  if (jump > 0) { for (let i = 0; i < jump * 10; i += 1) step(0.1); }
  renderView();
  renderOverlay();
}
