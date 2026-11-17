import {bountyData} from './api.js';
import {date,esc,left,money,pot} from './format.js';

export async function show(root,slug,embedded=false){
 const b=await bountyData(slug),rewards=b.rewardsNow||b.rewardsByPlace||b.rewards||b.payouts||[];
 const rows=Array.isArray(rewards)?rewards.map((r,i)=>`<tr><td>${esc(r.place??i+1)}</td><td>${esc(r.label||r.title||`Place ${r.place??i+1}`)}</td><td class="num">${money(r.baseUsd??r.amountUsd??r.rewardUsd??r.amount??r.usd)}</td><td class="num">${money(r.feeShareUsd||0)}</td><td class="num">${money(r.amountUsd??r.rewardUsd??r.amount??r.usd)}</td></tr>`).join(''):Object.entries(rewards).map(([p,v])=>`<tr><td>${esc(p)}</td><td>Place ${esc(p)}</td><td class="num">${money(v)}</td><td class="num">—</td><td class="num">${money(v)}</td></tr>`).join('');
 const open=new Date(b.deadline)>Date.now();document.title=`${b.title} | make.fun`;
 root.innerHTML=`${embedded?'':`<nav class="crumb"><a href="#/">← All bounties</a><span>/</span><span>${esc(b.title)}</span></nav>`}
 <div class="detail-top"><div><p class="eyebrow">BOUNTY DETAILS</p><h1>${esc(b.title)}</h1><span class="badge">${open?'TAKING ENTRIES':'CLOSED'} · ${esc(b.category||'COMPETITION')}</span></div><a class="badge" href="#/bounty/${encodeURIComponent(slug)}/leaderboard">LEADERBOARD →</a></div>
 <div class="detail-stats"><div><span>LIVE POT</span><b>${pot(b)}</b></div><div><span>TIME LEFT</span><b data-deadline="${esc(b.deadline)}">${left(b.deadline)}</b></div><div><span>ENTRY FEE</span><b>${b.entryFeeUsd!=null?money(b.entryFeeUsd):'Free'}</b></div><div><span>ENTRIES</span><b>${Number(b.submissionCount||0).toLocaleString()}</b></div></div>
 <section class="reward-card"><h2>Rewards at the live pot</h2><table><caption>${pot(b)} live pot · base award plus fee share</caption><thead><tr><th scope="col">Place</th><th scope="col">Award</th><th scope="col" class="num">Base</th><th scope="col" class="num">Fees</th><th scope="col" class="num">Total</th></tr></thead><tbody>${rows||`<tr><td colspan="5">${money(b.rewardAmount)} prize pool</td></tr>`}</tbody></table><a class="button" href="#/bounty/${encodeURIComponent(slug)}/leaderboard">View all ${Number(b.submissionCount||0).toLocaleString()} entries</a></section>
 <p class="pot-note">${money(b.rewardAmount||0)} base rewards + ${money(b.entryFeesUsd||0)} in entry fees · ${Number(b.entryFeePayers||0).toLocaleString()} fee payers</p>
 <article class="detail-copy"><h2>Challenge</h2><p class="prose">${esc(b.description||b.summary||'')}</p>${b.rules?`<h2>Rules</h2><pre class="rules">${esc(b.rules)}</pre>`:''}<p class="dates">Opens ${date(b.openingTime||b.opensAt||b.publishedAt)} · Deadline ${date(b.deadline)}</p></article>`;
 return b
}
