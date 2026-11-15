const root = 'https://make.fun/api';
const responseCache = new Map();
const inFlightFetches = new Map();
export function cachedRevalidatedFetch(path) {
  const url = root + path;
  const old = responseCache.get(url);
  if (old && Date.now() - old.time < 60000) return Promise.resolve(old.data);
  if (inFlightFetches.has(url)) return inFlightFetches.get(url);
  const headers = old?.etag ? { 'If-None-Match': old.etag } : {};
  const task = fetch(url, { headers }).then(async (response) => {
    if (response.status === 304 && old) { old.time = Date.now(); return old.data; }
    if (!response.ok) throw new Error(`make.fun returned ${response.status}`);
    const data = await response.json();
    responseCache.set(url, { data, etag: response.headers.get('ETag'), time: Date.now() });
    return data;
  }).finally(() => inFlightFetches.delete(url));
  inFlightFetches.set(url, task);
  return task;
}
export const boardData = () => cachedRevalidatedFetch('/competitions?status=open&activity=times');
export const bountyData = (slug) => cachedRevalidatedFetch(`/competitions/${encodeURIComponent(slug)}`);
export const leaderboardData = (slug) => cachedRevalidatedFetch(`/competitions/${encodeURIComponent(slug)}/leaderboard`);
export const profileData = (handle) => cachedRevalidatedFetch(`/profiles/${encodeURIComponent(handle.replace(/^@/, ''))}`);
