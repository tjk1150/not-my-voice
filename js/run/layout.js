// Fits the run to the screen. Two layouts, picked from the viewport size:
// stack - phone with a bezel, centred (desktop, tablets)
// full  - no bezel, the phone fills the screen (phones)
// The sound icon floats in the window's top-right corner in both, so nothing else takes height.
// CSS zoom scales the phone, so every screen keeps its 393 x 852 point layout and taps still land.
import { PHONE_SIZE, RUN_LAYOUT, LAYOUT_CHECK_MS } from "../constants.js";

export function layoutFor(viewWidth, viewHeight) {
  const { bezel, pad, fullMaxWidth, maxZoom } = RUN_LAYOUT;
  if (viewWidth <= fullMaxWidth) {
    return { mode: "full", zoom: Math.min(viewWidth / PHONE_SIZE.width, viewHeight / PHONE_SIZE.height) };
  }
  const zoom = Math.min(
    maxZoom,
    (viewHeight - 2 * (pad + bezel)) / PHONE_SIZE.height,
    (viewWidth - 2 * (pad + bezel)) / PHONE_SIZE.width,
  );
  return { mode: "stack", zoom };
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
    root.style.setProperty("--z", String(zoom));
  };
  // The window size can settle after load (mobile browsers, rotation, toolbars) without a
  // "resize" event, so a cheap size check also runs on a timer.
  window.addEventListener("resize", apply);
  window.visualViewport?.addEventListener("resize", apply);
  setInterval(apply, LAYOUT_CHECK_MS);
  apply();
}
