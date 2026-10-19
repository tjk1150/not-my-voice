// Icon helpers. Line icons come from Lucide (ISC license), drawn at the sizes measured on captures.
// Status bar glyphs are drawn here because they are system UI, not app assets.

export function ic(name, size = 24, stroke = 2, extra = "") {
  return `<i data-lucide="${name}" width="${size}" height="${size}" stroke-width="${stroke}" ${extra}></i>`;
}

export function statusBar(time = "11:00", tone = "") {
  return `
  <div class="sbar ${tone}">
    <span class="time">${time}</span>
    <span class="right">
      <svg width="18" height="12" viewBox="0 0 18 12" fill="currentColor">
        <rect x="0" y="8" width="3.2" height="4" rx="1"/><rect x="4.8" y="5.5" width="3.2" height="6.5" rx="1"/>
        <rect x="9.6" y="3" width="3.2" height="9" rx="1"/><rect x="14.4" y="0.5" width="3.2" height="11.5" rx="1" opacity=".35"/>
      </svg>
      <svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor">
        <path d="M8 2.6c2.3 0 4.4.9 6 2.4l1.2-1.3C13.3 1.8 10.8.8 8 .8S2.7 1.8.8 3.7L2 5c1.6-1.5 3.7-2.4 6-2.4z"/>
        <path d="M8 6c1.4 0 2.6.5 3.6 1.4l1.2-1.3C11.5 4.9 9.8 4.2 8 4.2s-3.5.7-4.8 1.9l1.2 1.3C5.4 6.5 6.6 6 8 6z"/>
        <path d="M8 9.3c.6 0 1.1.2 1.5.6L8 11.5 6.5 9.9c.4-.4.9-.6 1.5-.6z"/>
      </svg>
      <svg width="28" height="13" viewBox="0 0 28 13">
        <rect class="batt-fill" x="0" y="0" width="25" height="13" rx="4.2" fill="currentColor"/>
        <rect x="26" y="4.3" width="1.6" height="4.4" rx=".8" fill="currentColor" opacity=".4"/>
        <text class="batt-num" x="12.5" y="10.2" text-anchor="middle" font-size="10" font-weight="700" fill="#fff" font-family="-apple-system, Pretendard">92</text>
      </svg>
    </span>
  </div>`;
}

export function avatar(size, label = "", color = "#c7ccd4", cls = "") {
  const font = Math.round(size * 0.4);
  return `<span class="av ${cls}" style="width:${size}px;height:${size}px;--av:${color};font-size:${font}px">${label}</span>`;
}
