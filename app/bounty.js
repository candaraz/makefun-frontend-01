import { bountyData } from './api.js';
import { date, esc, left, money, pot } from './format.js';

export async function show(root, slug) {
  const b = await bountyData(slug);
  document.title = `${b.title} | make.fun`;
  const rewards = b.rewardsNow || b.rewardsByPlace || b.rewards || b.payouts || [];
  const rows = Array.isArray(rewards) ? rewards.map((r, i) => `<tr><td>${esc(r.place ?? i + 1)}</td><td>${esc(r.label || r.title || `Place ${r.place ?? i + 1}`)}</td><td class="num">${money(r.amountUsd ?? r.rewardUsd ?? r.amount ?? r.usd)}</td></tr>`).join('') : Object.entries(rewards).map(([place, amount]) => `<tr><td>${esc(place)}</td><td>Place ${esc(place)}</td><td class="num">${money(amount.amountUsd ?? amount.usd ?? amount)}</td></tr>`).join('');
  root.innerHTML = `<nav class="crumb"><a href="#/">← All bounties</a><span>/</span><span>${esc(b.title)}</span></nav>
    <section class="hero bounty-hero"><div><p class="eyebrow">BOUNTY DETAILS</p><h1>${esc(b.title)}</h1><p class="lead">${esc(b.summary)}</p></div><div class="hero-pot"><small>LIVE PRIZE POOL</small><strong>${pot(b)}</strong><span>USD · grows with entries</span></div></section>
    <section class="facts"><div><span>ENTRY FEE</span><strong>${b.entryFeeUsd != null ? money(b.entryFeeUsd) : 'Free'}</strong></div><div><span>TIME LEFT</span><strong data-deadline="${esc(b.deadline)}">${left(b.deadline)}</strong></div><div><span>ENTRIES</span><strong>${Number(b.submissionCount || 0).toLocaleString()}</strong></div><div><span>STATUS</span><strong>${new Date(b.deadline).getTime() > Date.now() ? 'Open' : 'Closed'}</strong></div></section>
    <div class="detail-grid"><article><p class="eyebrow">THE CHALLENGE</p><h2>About this bounty</h2><p class="prose">${esc(b.description || b.summary)}</p>${b.rules ? `<h2>Rules</h2><pre class="rules">${esc(b.rules)}</pre>` : ''}<p class="dates">Opens ${date(b.openingTime || b.opensAt)} · Deadline ${date(b.deadline)}</p></article>
    <aside class="reward-card"><div class="aside-title"><div><p class="eyebrow">PAYOUT</p><h2>Rewards</h2></div><strong>${pot(b)}</strong></div><p class="muted">Live pool · the total updates as entries arrive.</p><table><caption>Rewards by place</caption><thead><tr><th scope="col">Place</th><th scope="col">Award</th><th scope="col" class="num">Prize</th></tr></thead><tbody>${rows || `<tr><td colspan="3">${money(b.rewardAmount)} prize pool</td></tr>`}</tbody></table><a class="button" href="#/bounty/${encodeURIComponent(slug)}/leaderboard">View leaderboard <span>→</span></a></aside></div>`;
}
