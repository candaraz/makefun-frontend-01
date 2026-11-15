const root = 'https://make.fun/api';
const cache = new Map();
const pending = new Map();
export function read(path) {
  const url = root + path;
  const old = cache.get(url);
  if (old && Date.now() - old.time < 60000) return Promise.resolve(old.data);
  if (pending.has(url)) return pending.get(url);
  const headers = old?.etag ? { 'If-None-Match': old.etag } : {};
  const task = fetch(url, { headers }).then(async (response) => {
    if (response.status === 304 && old) { old.time = Date.now(); return old.data; }
    if (!response.ok) throw new Error(`make.fun returned ${response.status}`);
    const data = await response.json();
    cache.set(url, { data, etag: response.headers.get('ETag'), time: Date.now() });
    return data;
  }).finally(() => pending.delete(url));
  pending.set(url, task);
  return task;
}
export const boardData = () => read('/competitions?status=open&activity=times');
export const bountyData = (slug) => read(`/competitions/${encodeURIComponent(slug)}`);
export const leaderboardData = (slug) => read(`/competitions/${encodeURIComponent(slug)}/leaderboard`);
export const profileData = (handle) => read(`/profiles/${encodeURIComponent(handle.replace(/^@/, ''))}`);
