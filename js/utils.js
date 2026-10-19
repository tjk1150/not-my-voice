// Small helpers shared by the prologue and phase 2.
import { WEEKDAYS } from "./constants.js";

// Share the card image through the device's share sheet (phones, tablets: Instagram story,
// KakaoTalk, messages). Where files cannot be shared, save the image instead.
// Resolves "shared", "cancelled" or "saved" so the caller can say what happened.
export async function shareFile({ file, title, text, url }) {
  try {
    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file], title, text: `${text} ${url}` });
      return "shared";
    }
  } catch (error) {
    if (error?.name === "AbortError") return "cancelled";
  }
  saveFile(file);
  return "saved";
}

export function saveFile(file) {
  const link = document.createElement("a");
  link.href = URL.createObjectURL(file);
  link.download = file.name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(link.href), 1000);
}

export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
export const easeInOut = (x) => (x < 0.5 ? 2 * x * x : 1 - (-2 * x + 2) ** 2 / 2);

export const dayText = (date) => `${date.getMonth() + 1}월 ${date.getDate()}일 (${WEEKDAYS[date.getDay()]})`;
export const timeText = (date) => `${date.getHours() < 12 ? "오전" : "오후"} ${date.getHours() % 12 || 12}:${String(date.getMinutes()).padStart(2, "0")}`;
export const clockText = (date) => `${date.getHours() % 12 || 12}:${String(date.getMinutes()).padStart(2, "0")}`;
