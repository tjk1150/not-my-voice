// Draws the story-sized share card on a canvas and returns it as a PNG file.
// Top: the night's notifications piled at angles under an island-style "알림 47", as the screen froze.
// Bottom: a story-style poll of the remaining five with the player's pick marked, a question back to
// the reader, and the link. Never the player's name or the fake clip.
import { SHARE_CARD } from "../data.js";
import { CARD_SIZE, CARD_COLORS, CARD_APPS, CARD_FONT } from "../constants.js";

const font = (weight, size) => `${weight} ${size}px ${CARD_FONT}`;
const MID = CARD_SIZE.width / 2;

// Fixed scatter for the pile, back card first: [x offset, y, rotation in degrees].
const PILE_SPOTS = [[-40, 280, -6], [34, 352, 4], [-14, 424, -3], [48, 496, 5], [-30, 568, -4], [12, 640, 3], [-36, 712, -2]];
const NOTIF = { width: 860, height: 140, radius: 36, tile: 84 };
const POLL = { top: 1060, side: 90, row: 68, gap: 14, radius: 34 };

function roundRect(ctx, x, y, width, height, radius, fill) {
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, radius);
  ctx.fillStyle = fill;
  ctx.fill();
}

// Cuts text with an ellipsis so it fits maxWidth.
function fit(ctx, text, maxWidth) {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let cut = text;
  while (cut && ctx.measureText(`${cut}…`).width > maxWidth) cut = cut.slice(0, -1);
  return `${cut}…`;
}

// Text drawn in parts of different colours, centred as a whole.
function centredParts(ctx, parts, y) {
  const total = parts.reduce((sum, [text]) => sum + ctx.measureText(text).width, 0);
  let x = MID - total / 2;
  ctx.textAlign = "left";
  for (const [text, color] of parts) {
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);
    x += ctx.measureText(text).width;
  }
  ctx.textAlign = "center";
}

function appTile(ctx, app, x, y) {
  const colors = CARD_APPS[app] || CARD_APPS.feed;
  const gradient = ctx.createLinearGradient(x, y + NOTIF.tile, x + NOTIF.tile, y);
  colors.forEach((color, index) => gradient.addColorStop(colors.length === 1 ? 0 : index / (colors.length - 1), color));
  roundRect(ctx, x, y, NOTIF.tile, NOTIF.tile, 22, gradient);
}

// Opaque cards, darker toward the back, so text never shows through from the card behind.
function notification(ctx, [app, title, body], [dx, y, degrees], depth) {
  const x = MID - NOTIF.width / 2;
  const shade = Math.round(40 + depth * 24);
  ctx.save();
  ctx.translate(MID + dx, y + NOTIF.height / 2);
  ctx.rotate((degrees * Math.PI) / 180);
  ctx.translate(-MID, -(y + NOTIF.height / 2));
  ctx.shadowColor = "rgba(0, 0, 0, 0.45)";
  ctx.shadowBlur = 30;
  ctx.shadowOffsetY = 12;
  roundRect(ctx, x, y, NOTIF.width, NOTIF.height, NOTIF.radius, `rgb(${shade}, ${shade + 2}, ${shade + 12})`);
  ctx.shadowColor = "transparent";
  appTile(ctx, app, x + 28, y + 28);
  ctx.textAlign = "left";
  ctx.fillStyle = CARD_COLORS.text;
  ctx.font = font(700, 36);
  ctx.fillText(title, x + 136, y + 62);
  ctx.fillStyle = "rgba(255, 255, 255, 0.82)";
  ctx.font = font(500, 32);
  ctx.fillText(fit(ctx, body, NOTIF.width - 180), x + 136, y + 106);
  ctx.textAlign = "right";
  ctx.fillStyle = CARD_COLORS.dim;
  ctx.font = font(500, 26);
  ctx.fillText("지금", x + NOTIF.width - 30, y + 60);
  ctx.restore();
  ctx.textAlign = "center";
}

function island(ctx) {
  roundRect(ctx, MID - 170, 150, 340, 92, 46, "#000000");
  ctx.font = font(800, 46);
  centredParts(ctx, [["알림 ", CARD_COLORS.text], ["47", CARD_COLORS.alert]], 212);
}

function poll(ctx, options, picked) {
  ctx.font = font(800, 38);
  const height = 82 + 38 + options.length * POLL.row + (options.length - 1) * POLL.gap + 44;
  const width = CARD_SIZE.width - POLL.side * 2;
  ctx.shadowColor = "rgba(0, 0, 0, 0.35)";
  ctx.shadowBlur = 40;
  roundRect(ctx, POLL.side, POLL.top, width, height, 48, CARD_COLORS.poll);
  ctx.shadowColor = "transparent";
  ctx.fillStyle = CARD_COLORS.pollInk;
  ctx.fillText(SHARE_CARD.poll, MID, POLL.top + 82);
  options.forEach((label, index) => {
    const y = POLL.top + 120 + index * (POLL.row + POLL.gap);
    const mine = index === picked;
    roundRect(ctx, POLL.side + 40, y, width - 80, POLL.row, POLL.radius, mine ? CARD_COLORS.accent : CARD_COLORS.option);
    ctx.textAlign = "left";
    ctx.fillStyle = mine ? CARD_COLORS.text : CARD_COLORS.pollInk;
    ctx.font = font(mine ? 800 : 600, 34);
    ctx.fillText(label, POLL.side + 80, y + 46);
    if (mine) {
      ctx.textAlign = "right";
      ctx.font = font(700, 28);
      ctx.fillText(`✓ ${SHARE_CARD.mine}`, POLL.side + width - 80, y + 45);
    }
    ctx.textAlign = "center";
  });
  return POLL.top + height;
}

// pick: one of the remaining five ({ who }); options: all five labels in order.
export async function drawShareCard({ pick, options, url }) {
  await Promise.all([font(500, 40), font(600, 40), font(700, 40), font(800, 40)].map((spec) => document.fonts?.load(spec, "가나다AI47").catch(() => null)));
  const canvas = document.createElement("canvas");
  canvas.width = CARD_SIZE.width;
  canvas.height = CARD_SIZE.height;
  const ctx = canvas.getContext("2d");
  ctx.textAlign = "center";

  const sky = ctx.createLinearGradient(0, 0, 0, CARD_SIZE.height);
  sky.addColorStop(0, CARD_COLORS.bgTop);
  sky.addColorStop(0.55, CARD_COLORS.bg);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, CARD_SIZE.width, CARD_SIZE.height);

  ctx.fillStyle = CARD_COLORS.dim;
  ctx.font = font(600, 32);
  ctx.fillText(SHARE_CARD.kicker, MID, 100);

  PILE_SPOTS.forEach((spot, index) => notification(ctx, SHARE_CARD.pile[index], spot, index / (PILE_SPOTS.length - 1)));
  island(ctx);

  // The pile sinks into the night before the headline.
  const fade = ctx.createLinearGradient(0, 780, 0, 900);
  fade.addColorStop(0, "rgba(11, 12, 16, 0)");
  fade.addColorStop(1, CARD_COLORS.bg);
  ctx.fillStyle = fade;
  ctx.fillRect(0, 780, CARD_SIZE.width, 140);

  ctx.fillStyle = CARD_COLORS.dim;
  ctx.font = font(500, 40);
  ctx.fillText(SHARE_CARD.lines[0], MID, 930);
  ctx.font = font(800, 72);
  centredParts(ctx, [["하룻밤에 알림 ", CARD_COLORS.text], ["47", CARD_COLORS.alert], ["개", CARD_COLORS.text]], 1012);

  const pollEnd = poll(ctx, options, options.indexOf(pick.who));

  ctx.fillStyle = CARD_COLORS.text;
  ctx.font = font(800, 64);
  ctx.fillText(SHARE_CARD.question, MID, pollEnd + 130);
  ctx.fillStyle = CARD_COLORS.dim;
  ctx.font = font(500, 34);
  ctx.fillText(SHARE_CARD.cta, MID, pollEnd + 210);
  ctx.fillStyle = "#9aa6ff";
  ctx.font = font(700, 34);
  ctx.fillText(url.replace(/^https?:\/\//, "").replace(/\?.*$/, ""), MID, pollEnd + 262);

  const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
  return new File([blob], "내가-하지-않은-말.png", { type: "image/png" });
}
