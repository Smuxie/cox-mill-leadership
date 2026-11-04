import { localDate, eventStart, eventEnd, easternMidnight, nextDate } from '../lib/events.mjs';

const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('#main-nav');
if (toggle && nav) {
  const mobile = window.matchMedia('(max-width: 820px)');
  const close = () => { if (mobile.matches) nav.setAttribute('data-collapsed',''); toggle.setAttribute('aria-expanded','false'); };
  close();
  mobile.addEventListener('change', () => { if (mobile.matches) close(); else nav.removeAttribute('data-collapsed'); });
  toggle.addEventListener('click', () => { const expanded = toggle.getAttribute('aria-expanded') === 'true'; toggle.setAttribute('aria-expanded',String(!expanded)); nav.toggleAttribute('data-collapsed',expanded); });
  document.addEventListener('keydown', event => { if(event.key==='Escape'&&toggle.getAttribute('aria-expanded')==='true'){ close(); toggle.focus(); } });
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click',close));
}

const collections = [...document.querySelectorAll('[data-events]')].map(root => {
  const cards = [...root.querySelectorAll('[data-event]')];
  const list = root.querySelector('[data-event-list]');
  const calendar = root.querySelector('[data-calendar]');
  const today = localDate(Date.now());
  const state = { view:'list', category:'', year:'', order:root.dataset.mode==='past'?'desc':'asc', month:today.slice(0,7) };
  let count = -1;
  function filtered(now) {
    return cards.filter(card => (root.dataset.mode==='past' ? Number(card.dataset.end)<=now : Number(card.dataset.end)>now) && (!state.category||card.dataset.category===state.category) && (!state.year||card.dataset.year===state.year)).sort((a,b) => (state.order==='desc'?-1:1)*(Number(a.dataset.start)-Number(b.dataset.start)) || a.dataset.title.localeCompare(b.dataset.title));
  }
  function drawCalendar(matches) {
    if(!calendar) return;
    const [year,month] = state.month.split('-').map(Number);
    const date = new Date(Date.UTC(year,month-1,1,12));
    calendar.querySelector('[data-month-label]').textContent = new Intl.DateTimeFormat('en-US',{month:'long',year:'numeric',timeZone:'UTC'}).format(date);
    const days = calendar.querySelector('[data-days]');
    days.replaceChildren();
    const weekday = date.getUTCDay();
    for(let i=0;i<weekday;i++){const cell=document.createElement('div');cell.className='calendar-day empty';cell.setAttribute('aria-hidden','true');days.append(cell);}
    const daysInMonth = new Date(Date.UTC(year,month,0)).getUTCDate();
    const nowDate = localDate(Date.now());
    for(let day=1;day<=daysInMonth;day++){
      const dayDate=`${state.month}-${String(day).padStart(2,'0')}`;
      const cell=document.createElement('div');cell.className='calendar-day';
      const time=document.createElement('time');time.dateTime=dayDate;time.textContent=String(day);cell.append(time);
      if(dayDate===nowDate){cell.setAttribute('data-today','');time.setAttribute('aria-label',`${dayDate}, today`);}
      const dayStart=easternMidnight(dayDate), dayEnd=easternMidnight(nextDate(dayDate));
      for(const card of matches.filter(c=>Number(c.dataset.start)<dayEnd&&Number(c.dataset.end)>dayStart)){
        const link=document.createElement('a');link.href=`/events/${card.dataset.slug}/`;link.textContent=card.dataset.title;cell.append(link);
      }
      days.append(cell);
    }
  }
  function refresh() {
    const matches=filtered(Date.now());
    cards.forEach(card=>card.hidden=true);
    const shown=Number(root.dataset.limit)>0?matches.slice(0,Number(root.dataset.limit)):matches;
    shown.forEach(card=>{card.hidden=false;list.append(card);});
    list.hidden=state.view!=='list';
    root.querySelector('[data-empty]').hidden=matches.length>0||state.view==='calendar';
    if(calendar){calendar.hidden=state.view!=='calendar';if(state.view==='calendar')drawCalendar(matches);}
    if(count!==matches.length){root.querySelector('.event-count').textContent=`${matches.length} ${root.dataset.mode==='past'?'past':'upcoming'} event${matches.length===1?'':'s'} found.`;count=matches.length;}
  }
  root.querySelectorAll('[data-filter]').forEach(select=>select.addEventListener('change',()=>{state[select.dataset.filter]=select.value;refresh();}));
  root.querySelectorAll('[data-view]').forEach(button=>button.addEventListener('click',()=>{state.view=button.dataset.view;root.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));refresh();}));
  root.querySelectorAll('[data-month]').forEach(button=>button.addEventListener('click',()=>{const [year,month]=state.month.split('-').map(Number);const next=new Date(Date.UTC(year,month-1+Number(button.dataset.month),1,12));state.month=next.toISOString().slice(0,7);refresh();}));
  refresh();return refresh;
});

function refreshDates(){
  collections.forEach(refresh=>refresh());
  let featured=false;
  document.querySelectorAll('[data-announcement]').forEach(item=>{const active=(!item.dataset.expires||Date.parse(item.dataset.expires)>Date.now())&&!featured;item.hidden=!active;if(active)featured=true;});
  document.querySelectorAll('[data-event-state]').forEach(item=>{if(item.textContent==='Cancelled')return;item.textContent=Number(item.dataset.end)>Date.now()?'Upcoming / in progress':'Past event';});
}
refreshDates();
setInterval(refreshDates,30000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)refreshDates();});

let instagramScript;
function loadInstagramScript(){
  if(!instagramScript) instagramScript=new Promise((resolve,reject)=>{
    if(window.instgrm){resolve(window.instgrm);return;}
    const script=document.createElement('script');script.src='https://www.instagram.com/embed.js';script.async=true;
    script.onload=()=>resolve(window.instgrm);script.onerror=()=>{script.remove();instagramScript=undefined;reject(new Error('Instagram could not be loaded. Use the direct post link.'));};document.body.append(script);
  });
  return instagramScript;
}
document.querySelectorAll('[data-load-instagram]').forEach(button=>button.addEventListener('click',async()=>{
  const parent=button.closest('[data-instagram]');
  button.disabled=true;button.textContent='Loading Instagram…';
  const block=document.createElement('blockquote');block.className='instagram-media';block.setAttribute('data-instgrm-permalink',parent.dataset.instagram);block.setAttribute('data-instgrm-version','14');
  const link=document.createElement('a');link.href=parent.dataset.instagram;link.textContent='View this post on Instagram';link.target='_blank';link.rel='noopener noreferrer';block.append(link);
  parent.append(block);
  try{const instagram=await loadInstagramScript();if(!instagram?.Embeds)throw new Error('Instagram is unavailable.');instagram.Embeds.process();button.remove();parent.querySelector('.embed-note').textContent='If this post is unavailable, use the direct Instagram link below.';}
  catch{block.remove();button.disabled=false;button.textContent='Try loading Instagram again';parent.querySelector('.embed-note').textContent='Instagram could not be loaded. The direct post link below still works.';}
}));
