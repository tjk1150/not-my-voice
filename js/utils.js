// Small helpers shared by the prologue and phase 2.
import { WEEKDAYS } from "./constants.js";

export const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
export const easeInOut = (x) => (x < 0.5 ? 2 * x * x : 1 - (-2 * x + 2) ** 2 / 2);

export const dayText = (date) => `${date.getMonth() + 1}월 ${date.getDate()}일 (${WEEKDAYS[date.getDay()]})`;
export const timeText = (date) => `${date.getHours() < 12 ? "오전" : "오후"} ${date.getHours() % 12 || 12}:${String(date.getMinutes()).padStart(2, "0")}`;
export const clockText = (date) => `${date.getHours() % 12 || 12}:${String(date.getMinutes()).padStart(2, "0")}`;
