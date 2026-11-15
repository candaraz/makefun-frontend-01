import { boardData } from './api.js';

const root = document.querySelector('#app');
let clock;
let routeVersion = 0;
const esc = (x) => String(x ?? '').replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
const left = (x) => { const ms = new Date(x).getTime() - Date.now(); if (!Number.isFinite(ms) || ms <= 0) return 'Ended'; const d = Math.floor(ms / 86400000), h = Math.floor(ms % 86400000 / 3600000), m = Math.floor(ms % 3600000 / 60000); return d ? `${d}d ${h}h left` : h ? `${h}h ${m}m left` : `${m}m left`; };
const pot = (x) => { const n = Number(x.potUsd ?? x.pot ?? x.rewardAmount ?? 0); return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: Number.isInteger(n) ? 0 : 2 }); };
async function lazyView(root, parts) {
  if (parts[0] === 'bounty' && parts[2] === 'leaderboard') { const view = await import('./leaderboard.js'); await view.show(root, parts[1]); }
  else if (parts[0] === 'bounty') { const view = await import('./bounty.js'); await view.show(root, parts[1]); }
  else if (parts[0] === 'profile') { const view = await import('./profile.js'); await view.show(root, parts[1]); }
  else throw new Error('That page does not exist.');
}
function tick() {
  document.querySelectorAll('[data-deadline]').forEach((node) => { node.textContent = left(node.dataset.deadline); });
}
function board(data) {
  const items = [...(data.items || [])].sort((a, b) => {
    const aa = new Date(a.deadline).getTime(), bb = new Date(b.deadline).getTime();
    return (aa <= Date.now()) - (bb <= Date.now()) || aa - bb;
  });
  return `<section class="intro"><div><p class="eyebrow">MAKE.FUN · LIVE PRIZE POOLS</p><h1>Build. Enter. Win.</h1><p>Open bounties, live rewards, and standings.</p></div><div class="live"><i></i> Live board <span>${items.length} bounties</span></div></section>
    <div class="board-head"><span>Competition</span><span>Live pot</span><span>Entry</span><span>Deadline</span><span>Entries</span></div>
    <ul class="board">${items.map((b) => { const open = new Date(b.deadline).getTime() > Date.now(); return `<li class="board-row"><a class="title-link" href="#/bounty/${encodeURIComponent(b.slug)}"><span class="status ${open ? 'open' : ''}">${open ? 'TAKING ENTRIES' : 'CLOSED'}</span><strong>${esc(b.title)}</strong></a><div class="pot">${pot(b)}<small>USD total</small></div><div>${b.entryFeeUsd != null ? `<span class="fee">${pot({potUsd:b.entryFeeUsd})} fee</span>` : '<span class="free">No fee</span>'}</div><div class="deadline" data-deadline="${esc(b.deadline)}">${left(b.deadline)}</div><div class="entries">${Number(b.submissionCount || 0).toLocaleString()}<small>entries</small></div></li>`; }).join('')}</ul>`;
}
function path() { return location.hash || '#/'; }
async function render() {
  const version = ++routeVersion;
  window.__shotReady = false;
  clearInterval(clock);
  root.innerHTML = '<div class="loading">Loading…</div>';
  try {
    const parts = path().slice(2).split('/').filter(Boolean).map(decodeURIComponent);
    let view;
    if (!parts.length) {
      document.title = 'Live bounty board | make.fun';
      view = document.createElement('div');
      view.innerHTML = board(await boardData());
    } else {
      view = document.createElement('div');
      await lazyView(view, parts);
    }
    if (version !== routeVersion) return;
    root.replaceChildren(view);
    tick(); clock = setInterval(tick, 1000);
    window.scrollTo(0, 0);
    window.__shotReady = true;
  } catch (error) {
    if (version !== routeVersion) return;
    root.innerHTML = `<section class="error"><p class="eyebrow">LIVE DATA UNAVAILABLE</p><h1>We couldn't load this view.</h1><p>${esc(error.message)}</p><a href="#/">Back to the board</a></section>`;
    window.__shotReady = true;
  }
}
window.addEventListener('hashchange', render);
render();
