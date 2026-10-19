// Draws the story-sized share card on a canvas and returns it as a PNG file.
// Contents: the experience title, "47 notifications in one night", the player's pick among the
// remaining five with its reason and requirement, a question back to the reader, and the link.
import { SHARE_CARD } from "../data.js";
import { CARD_SIZE, CARD_COLORS, CARD_FONT } from "../constants.js";

const font = (weight, size) => `${weight} ${size}px ${CARD_FONT}`;

// Breaks text into lines that fit maxWidth: by words, and inside a word if one word is too long.
function wrap(ctx, text, maxWidth) {
  const lines = [];
  let line = "";
  for (const word of text.split(" ")) {
    const next = line ? `${line} ${word}` : word;
    if (ctx.measureText(next).width <= maxWidth) { line = next; continue; }
    if (line) lines.push(line);
    line = "";
    for (const char of word) {
      if (ctx.measureText(line + char).width > maxWidth && line) { lines.push(line); line = ""; }
      line += char;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function roundRect(ctx, x, y, width, height, radius, fill) {
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, radius);
  ctx.fillStyle = fill;
  ctx.fill();
}

// One line where a part is coloured differently, centred.
function centredParts(ctx, parts, y) {
  const total = parts.reduce((sum, [text]) => sum + ctx.measureText(text).width, 0);
  let x = (CARD_SIZE.width - total) / 2;
  ctx.textAlign = "left";
  for (const [text, color] of parts) {
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);
    x += ctx.measureText(text).width;
  }
  ctx.textAlign = "center";
}

export async function drawShareCard({ pick, url }) {
  await Promise.all([font(400, 40), font(700, 40), font(800, 40)].map((spec) => document.fonts?.load(spec, "가나다AI47").catch(() => null)));
  const canvas = document.createElement("canvas");
  canvas.width = CARD_SIZE.width;
  canvas.height = CARD_SIZE.height;
  const ctx = canvas.getContext("2d");
  const mid = CARD_SIZE.width / 2;
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";

  const glow = ctx.createRadialGradient(mid, 520, 40, mid, 520, 900);
  glow.addColorStop(0, "#1c2140");
  glow.addColorStop(1, CARD_COLORS.bg);
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, CARD_SIZE.width, CARD_SIZE.height);

  ctx.fillStyle = CARD_COLORS.dim;
  ctx.font = font(600, 40);
  ctx.fillText(SHARE_CARD.kicker, mid, 210);
  ctx.fillStyle = CARD_COLORS.text;
  ctx.font = font(800, 104);
  ctx.fillText(SHARE_CARD.title, mid, 340);

  ctx.font = font(500, 54);
  ctx.fillStyle = CARD_COLORS.text;
  ctx.fillText(SHARE_CARD.lines[0], mid, 500);
  ctx.font = font(800, 72);
  centredParts(ctx, [["하룻밤에 알림 ", CARD_COLORS.text], ["47", CARD_COLORS.alert], ["개", CARD_COLORS.text]], 600);

  ctx.font = font(500, 42);
  ctx.fillStyle = CARD_COLORS.dim;
  SHARE_CARD.ask.forEach((line, index) => ctx.fillText(line, mid, 790 + index * 58));

  const top = 900;
  ctx.font = font(500, 40);
  const why = wrap(ctx, pick.why, 680);
  const panelHeight = 300 + why.length * 56;
  roundRect(ctx, 90, top, 900, panelHeight, 48, CARD_COLORS.panel);
  ctx.fillStyle = CARD_COLORS.accent;
  ctx.font = font(700, 38);
  ctx.fillText(SHARE_CARD.mine, mid, top + 86);
  ctx.fillStyle = CARD_COLORS.text;
  ctx.font = font(800, 92);
  ctx.fillText(pick.who, mid, top + 196);
  ctx.fillStyle = CARD_COLORS.dim;
  ctx.font = font(500, 40);
  why.forEach((line, index) => ctx.fillText(line, mid, top + 268 + index * 56));
  ctx.font = font(700, 34);
  const chipWidth = ctx.measureText(pick.req).width + 60;
  const chipTop = top + panelHeight + 34;
  roundRect(ctx, mid - chipWidth / 2, chipTop, chipWidth, 64, 32, CARD_COLORS.chip);
  ctx.fillStyle = "#c9cfff";
  ctx.fillText(pick.req, mid, chipTop + 44);

  ctx.fillStyle = CARD_COLORS.text;
  ctx.font = font(800, 72);
  ctx.fillText(SHARE_CARD.question, mid, 1560);

  ctx.fillStyle = CARD_COLORS.dim;
  ctx.font = font(500, 38);
  ctx.fillText(SHARE_CARD.cta, mid, 1700);
  ctx.fillStyle = CARD_COLORS.accent;
  ctx.font = font(700, 36);
  ctx.fillText(url.replace(/^https?:\/\//, ""), mid, 1760);

  const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
  return new File([blob], "내가-하지-않은-말.png", { type: "image/png" });
}
