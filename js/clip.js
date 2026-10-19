// The synthetic clip as the player meets it: my own public vlog footage (hood up, face under the
// sticker I added myself) with an AI voice laid over it, re-uploaded in low quality and playing muted
// with auto captions (the phone is on silent at night). The player never gets to see or hear
// anything that would let them say "that is not me".
import { ic } from "./icons.js";

export function clip({ caption = "", mute = true } = {}) {
  return `
  <div class="clip">
    <div class="clip-in">
      <img class="fa" src="img/fake-clip-a.jpg" alt=""><img class="fb" src="img/fake-clip-b.jpg" alt="">
    </div>
    ${caption ? `<div class="autocap">${caption}</div>` : ""}
    ${mute ? `<span class="mute">${ic("volume-x", 14, 2.4)}</span>` : ""}
  </div>`;
}
