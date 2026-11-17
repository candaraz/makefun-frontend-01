const root = 'https://make.fun/api';
const responseCache = new Map();
const inFlightFetches = new Map();
export const requestStats={requests:0,unchanged:0,memory:0,updatedAt:Date.now()};
export function refreshCached(){for(const value of responseCache.values())value.time=0}
export function cachedRevalidatedFetch(path) {
  const url = root + path;
  const old = responseCache.get(url);
  if (old && Date.now() - old.time < 60000) {requestStats.memory++;return Promise.resolve(old.data)}
  if (inFlightFetches.has(url)) return inFlightFetches.get(url);
  const headers = old?.etag ? { 'If-None-Match': old.etag } : {};
  requestStats.requests++;
  const task = fetch(url, { headers }).then(async (response) => {
    if (response.status === 304 && old) { old.time = Date.now();requestStats.unchanged++;requestStats.updatedAt=Date.now();return old.data; }
    if (!response.ok) throw new Error(`make.fun returned ${response.status}`);
    const data = await response.json();
    responseCache.set(url, { data, etag: response.headers.get('ETag'), time: Date.now() });
    requestStats.updatedAt=Date.now();
    return data;
  }).finally(() => inFlightFetches.delete(url));
  inFlightFetches.set(url, task);
  return task;
}
export const boardData = () => cachedRevalidatedFetch('/competitions?status=open&activity=times');
export const bountyData = (slug) => cachedRevalidatedFetch(`/competitions/${encodeURIComponent(slug)}`);
export const leaderboardData = (slug) => cachedRevalidatedFetch(`/competitions/${encodeURIComponent(slug)}/leaderboard`);
export const profileData = (handle) => cachedRevalidatedFetch(`/profiles/${encodeURIComponent(handle.replace(/^@/, ''))}`);
