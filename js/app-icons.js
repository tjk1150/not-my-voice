// Fictional app icons. Familiar colour families, our own glyphs (no third-party marks).
// Squircle radius follows iOS (22.4% of the side).

const R = 0.224;

const frame = (size, bg, glyph) => `
  <svg width="${size}" height="${size}" viewBox="0 0 64 64" class="appicon">
    <defs>${bg.defs || ""}</defs>
    <rect width="64" height="64" rx="${64 * R}" fill="${bg.fill}"/>
    ${glyph}
  </svg>`;

export const APP_ICONS = {
  // 피드: warm sunset gradient, rounded speech bubble with a heart.
  feed: (size = 64) =>
    frame(
      size,
      {
        defs: `<linearGradient id="gFeed" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#ff8a3d"/><stop offset=".5" stop-color="#ff3f7f"/><stop offset="1" stop-color="#8b5cf6"/></linearGradient>`,
        fill: "url(#gFeed)",
      },
      `<path d="M32 15c-10 0-18 7-18 16 0 4.3 1.8 8.2 4.8 11.1L17 50l8.6-3.6c2 .6 4.2.9 6.4.9 10 0 18-7 18-16s-8-16.3-18-16.3z" fill="none" stroke="#fff" stroke-width="4.2" stroke-linejoin="round"/>
       <path d="M32 38.5s-8-4.6-8-10.1c0-2.6 2-4.4 4.3-4.4 1.6 0 2.9.8 3.7 2.1.8-1.3 2.1-2.1 3.7-2.1 2.3 0 4.3 1.8 4.3 4.4 0 5.5-8 10.1-8 10.1z" fill="#fff"/>`
    ),
  // 톡: yellow, dark round bubble with typing dots.
  talk: (size = 64) =>
    frame(
      size,
      { fill: "#ffd84d" },
      `<path d="M32 14c-11.6 0-21 7.4-21 16.5 0 5.9 3.9 11 9.8 13.9L19 52l9-5.6c1.3.2 2.6.2 4 .2 11.6 0 21-7.4 21-16.5S43.6 14 32 14z" fill="#3b2a20"/>
       <circle cx="23" cy="30.5" r="3.2" fill="#ffd84d"/><circle cx="32" cy="30.5" r="3.2" fill="#ffd84d"/><circle cx="41" cy="30.5" r="3.2" fill="#ffd84d"/>`
    ),
  phone: (size = 64) =>
    frame(
      size,
      { defs: `<linearGradient id="gPh" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5fe06f"/><stop offset="1" stop-color="#1fb83a"/></linearGradient>`, fill: "url(#gPh)" },
      `<path d="M24.5 16.5c1.2-.4 2.5.1 3.1 1.2l3 5.6c.5 1 .3 2.2-.5 3l-2.6 2.5c1.6 3.6 4.4 6.4 8 8l2.5-2.6c.8-.8 2-1 3-.5l5.6 3c1.1.6 1.6 1.9 1.2 3.1l-1.2 3.4c-.6 1.6-2.1 2.6-3.8 2.5C29.6 44.9 19.1 34.4 18.3 21.2c-.1-1.7.9-3.2 2.5-3.8z" fill="#fff"/>`
    ),
  // 보이스팝 (fictional AI cover-song app from the prologue): violet to teal, sound bars.
  voice: (size = 64) =>
    frame(
      size,
      {
        defs: `<linearGradient id="gVoice" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7c3aed"/><stop offset="1" stop-color="#14b8a6"/></linearGradient>`,
        fill: "url(#gVoice)",
      },
      `<g fill="#fff"><rect x="15" y="27" width="5" height="10" rx="2.5"/><rect x="23" y="20" width="5" height="24" rx="2.5"/><rect x="31" y="14" width="5" height="36" rx="2.5"/><rect x="39" y="22" width="5" height="20" rx="2.5"/><rect x="47" y="28" width="5" height="8" rx="2.5"/></g>`
    ),
  // Neutral filler apps so the home screen reads as a normal phone.
  plain: (size, bg, glyphSvg) => frame(size, { fill: bg }, glyphSvg),
};
