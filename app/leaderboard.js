import { leaderboardData } from './api.js';
import { esc, money } from './format.js';

export async function show(root, slug) {
  const data = await leaderboardData(slug);
  const entries = data.entries || [];
  const columns = (data.columns || []).filter((c) => !c.hidden);
  const cols = columns.length ? columns : [{ key: 'score', title: 'Score', source: '', precision: 2 }];
  const record = entries.some((e) => e.record || e.judgeRecord || e.judge);
  const pages = Math.max(1, Math.ceil(entries.length / 50));
  let page = 0;
  const heading = data.competition?.title || data.title || slug;
  document.title = `Leaderboard · ${heading} | make.fun`;
  root.innerHTML = `<nav class="crumb"><a href="#/bounty/${encodeURIComponent(slug)}">← ${esc(heading)}</a><span>/</span><span>Leaderboard</span></nav><section class="table-hero"><div><p class="eyebrow">LIVE STANDINGS</p><h1>${esc(heading)}</h1><p>Entries are ranked on the competition's published scoring columns.</p></div><strong>${entries.length.toLocaleString()} <small>entries</small></strong></section>
    <div class="table-wrap"><table class="leader-table"><caption>${esc(heading)} leaderboard · ${entries.length.toLocaleString()} entries</caption><thead><tr><th scope="col">Rank</th><th scope="col">Entrant</th>${cols.map((c) => `<th scope="col" class="num">${esc(c.title || c.key)}</th>`).join('')}${record ? '<th scope="col">W–D–L</th>' : ''}</tr></thead><tbody id="leader-rows"></tbody></table></div>
    <div class="pager"><button type="button" data-page="-1" aria-label="Previous page">← Previous</button><span id="page-label"></span><button type="button" data-page="1" aria-label="Next page">Next →</button></div>`;
  const body = root.querySelector('#leader-rows'), label = root.querySelector('#page-label');
  function paint() {
    const batch = entries.slice(page * 50, (page + 1) * 50);
    body.innerHTML = batch.map((e, i) => {
      const handle = e.handle || 'unknown', values = e.values || {};
      const rec = e.judgeRecord || e.judge || e.record || {};
      return `<tr><td class="rank">${esc(e.rank ?? page * 50 + i + 1)}</td><td><a class="entrant" href="#/profile/${encodeURIComponent(handle)}">${esc(handle)}</a><small>${esc(e.title || e.status || '')}</small></td>${cols.map((c) => {
        let v = values[c.key] ?? e[c.key];
        if (v == null) return '<td class="num">—</td>';
        if (String(c.source || '').toLowerCase().includes('micro')) v = Number(v) / 1000000;
        const n = Number(v);
        const formatted = Number.isFinite(n) ? n.toLocaleString('en-US', { maximumFractionDigits: String(c.source || '').toLowerCase().includes('micro') ? 6 : c.precision ?? 4 }) : esc(v);
        return `<td class="num">${formatted}</td>`;
      }).join('')}${record ? `<td>${esc(rec.wins ?? 0)}–${esc(rec.draws ?? 0)}–${esc(rec.losses ?? 0)}</td>` : ''}</tr>`;
    }).join('');
    label.textContent = `Page ${page + 1} of ${pages}`;
    root.querySelector('[data-page="-1"]').disabled = page === 0;
    root.querySelector('[data-page="1"]').disabled = page === pages - 1;
  }
  root.querySelector('.pager').addEventListener('click', (event) => {
    const button = event.target.closest('button[data-page]');
    if (!button || button.disabled) return;
    page = Math.min(pages - 1, Math.max(0, page + Number(button.dataset.page)));
    paint();
  });
  paint();
}
