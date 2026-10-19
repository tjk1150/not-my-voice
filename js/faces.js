// Profile picture by character name, falling back to an initial on a colour.
// The anonymous school account gets a plain megaphone, as such pages usually do.
import { avatar, ic } from "./icons.js";
import { PHOTOS, PEOPLE, color } from "./data.js";

export function face(name, size, cls = "") {
  if (name === PEOPLE.daejeon) return avatar(size, ic("megaphone", Math.round(size * 0.5), 2.2), "#1f2a44", cls);
  const key = PHOTOS[name];
  if (!key) return avatar(size, name[0], color(name), cls);
  return `<span class="av ${cls}" style="width:${size}px;height:${size}px;background:#ddd url(img/av-${key}.jpg) center/cover"></span>`;
}
