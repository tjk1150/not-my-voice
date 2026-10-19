// Fits the run to the screen. Three layouts, picked from the viewport size:
// side  - phone with a bezel in the centre and the side panel to its right (desktop, landscape tablet)
// stack - phone with a bezel and a one-line bar above it (portrait tablet, narrow windows)
// full  - no bezel, the phone fills the screen and the bar sits above it (phones)
// CSS zoom scales the phone, so every screen keeps its 393 x 852 point layout and taps still land.
import { PHONE_SIZE, RUN_LAYOUT, LAYOUT_CHECK_MS } from "../constants.js";

export function layoutFor(viewWidth, viewHeight) {
  const { bezel, side, gap, pad, barGap, bar, fullMaxWidth, maxZoom } = RUN_LAYOUT;
  if (viewWidth <= fullMaxWidth) {
    return { mode: "full", zoom: Math.min(viewWidth / PHONE_SIZE.width, (viewHeight - bar) / PHONE_SIZE.height) };
  }
  const sideZoom = Math.min(maxZoom, (viewHeight - 2 * (pad + bezel)) / PHONE_SIZE.height);
  if (PHONE_SIZE.width * sideZoom + 2 * (pad + bezel + gap + side) <= viewWidth) return { mode: "side", zoom: sideZoom };
  const stackZoom = Math.min(
    maxZoom,
    (viewHeight - 2 * (pad + bezel) - barGap - bar) / PHONE_SIZE.height,
    (viewWidth - 2 * (pad + bezel)) / PHONE_SIZE.width,
  );
  return { mode: "stack", zoom: stackZoom };
}

export function bindLayout(root, phone) {
  let size = "";
  const apply = () => {
    const next = `${window.innerWidth}x${window.innerHeight}`;
    if (next === size) return;
    size = next;
    const { mode, zoom } = layoutFor(window.innerWidth, window.innerHeight);
    root.dataset.layout = mode;
    phone.style.zoom = String(zoom);
    root.style.setProperty("--phone-w", `${Math.floor(PHONE_SIZE.width * zoom)}px`);
  };
  // The window size can settle after load (mobile browsers, rotation, toolbars) without a
  // "resize" event, so a cheap size check also runs on a timer.
  window.addEventListener("resize", apply);
  window.visualViewport?.addEventListener("resize", apply);
  setInterval(apply, LAYOUT_CHECK_MS);
  apply();
}
