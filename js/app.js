// Three views: ordered gallery (default), one screen at 393x852 (?s=<id>, used for overlay checks),
// and step-through play mode (?play, optionally ?play=phase1).
import { STAGES, ALL } from "./screens.js";

const params = new URLSearchParams(location.search);
const root = document.getElementById("root");
if (params.has("still")) document.body.classList.add("no-motion");

const icons = () => window.lucide?.createIcons();

function gallery() {
  let number = 0;
  root.className = "gallery-wrap";
  root.innerHTML = `
    <header class="g-top"><h1>AI 윤리 체험 화면 시안</h1><a class="g-play" href="?run">처음부터 플레이</a><a class="g-play ghost" href="?run&phase1">1단계만 플레이</a><a class="g-play ghost" href="?play=phase1">1단계 진행 보기</a><a class="g-play ghost" href="?play">처음부터 진행 보기</a></header>
    ${STAGES.map(
      (stage) => `<section class="g-stage"><h2>${stage.title}</h2><div class="gallery">${stage.steps
        .map(([id, label, note, render]) => {
          number += 1;
          return `<figure><div class="phone">${render()}</div><figcaption><b>${number}. ${label}</b><span>${note}</span></figcaption></figure>`;
        })
        .join("")}</div></section>`
    ).join("")}`;
  icons();
}

function play(stageId) {
  const steps = stageId ? ALL.filter((step) => step.stage.id === stageId) : ALL;
  let index = Math.max(0, steps.findIndex((step) => step.id === params.get("at")));
  root.className = "play";
  const draw = () => {
    const step = steps[index];
    root.innerHTML = `
      <div class="p-phone"><div class="phone">${step.render()}</div></div>
      <aside class="p-side">
        <div class="p-stage">${step.stage.title}</div>
        <div class="p-count">${index + 1} / ${steps.length}</div>
        <h1>${step.label}</h1>
        <p>${step.note}</p>
        <div class="p-nav"><button data-go="-1" ${index === 0 ? "disabled" : ""}>이전</button><button data-go="1" class="next" ${index === steps.length - 1 ? "disabled" : ""}>다음</button></div>
        <p class="p-hint">휴대폰 화면을 누르거나 → 키로 넘어가요. <a href="./">전체 시안으로</a></p>
        <ol class="p-list">${steps.map((item, at) => `<li class="${at === index ? "on" : ""}" data-at="${at}">${item.label}</li>`).join("")}</ol>
      </aside>`;
    icons();
  };
  const go = (delta) => {
    index = Math.min(steps.length - 1, Math.max(0, index + delta));
    draw();
  };
  root.addEventListener("click", (event) => {
    const button = event.target.closest("[data-go]");
    const item = event.target.closest("[data-at]");
    if (button) go(Number(button.dataset.go));
    else if (item) { index = Number(item.dataset.at); draw(); }
    else if (event.target.closest(".p-phone")) go(1);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "ArrowRight") go(1);
    if (event.key === "ArrowLeft") go(-1);
  });
  draw();
  // Fit the 852pt phone into short windows (e.g. the app's browser pane).
  const fit = () => {
    const box = root.querySelector(".p-phone");
    if (box) box.style.zoom = String(Math.min(1, (window.innerHeight - 64) / 872));
  };
  new MutationObserver(fit).observe(root, { childList: true });
  window.addEventListener("resize", fit);
  fit();
}

const only = params.get("s");
if (params.has("run")) {
  import("./run/engine.js").then((module) => module.start(root, params));
} else if (only) {
  document.body.classList.add("single");
  const found = ALL.find((step) => step.id === only);
  root.innerHTML = `<div class="phone">${found ? found.render() : "없는 화면"}</div>`;
  icons();
} else if (params.has("play")) {
  play(params.get("play"));
} else {
  gallery();
}
document.body.dataset.ready = "1";
