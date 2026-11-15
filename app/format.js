export const esc = (x) => String(x ?? '').replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
export const money = (x) => Number(x ?? 0).toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: Number.isInteger(Number(x)) ? 0 : 2 });
export const date = (x) => x ? new Date(x).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'UTC' }) + ' UTC' : '—';
export function left(x) {
  const ms = new Date(x).getTime() - Date.now();
  if (!Number.isFinite(ms) || ms <= 0) return 'Ended';
  const d = Math.floor(ms / 86400000), h = Math.floor(ms % 86400000 / 3600000), m = Math.floor(ms % 3600000 / 60000);
  return d ? `${d}d ${h}h left` : h ? `${h}h ${m}m left` : `${m}m left`;
}
export const pot = (x) => money(x.potUsd ?? x.pot ?? x.rewardAmount);
export function image(url, alt, cls = '') {
  return url ? `<img class="${cls}" crossorigin="anonymous" src="${esc(url)}" alt="${esc(alt)}">` : '';
}
