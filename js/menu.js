/* menu.js - home screen: hero banner, game cards, search, favorites, settings.
   Loaded last so every game has registered itself. */
const FEAT=['zom','snow','fish','garden','survive','mm','hang'].filter(id=>GAMES.some(g=>g.id===id));let fi=0,cat='All',qry='';
const G$=id=>GAMES.find(g=>g.id===id),bgOf=g=>'linear-gradient(135deg,'+g.c[0]+','+g.c[1]+')',catOf=g=>(META[g.id]||{}).c||g.tag;
function mkCard(g){const m=META[g.id]||{},b=document.createElement('div');b.className='gc';b.tabIndex=0;
 b.innerHTML='<div class="art" style="background:'+bgOf(g)+'">'+g.e+(g.soon?'<span class="nw" style="background:#555">SOON</span>':m.n?'<span class="nw">NEW</span>':'')+'<button class="fav" title="Favorite">'+(ST.fav.includes(g.id)?'\u2665':'\u2661')+'</button></div><div class="bd"><b>'+g.name+'</b><div class="mt"><span>'+catOf(g)+'</span><span>'+(m.m||'')+'</span></div></div>';
 b.onclick=e=>{if(e.target.classList.contains('fav')){e.stopPropagation();toggleFav(g.id);return}if(g.soon)return;openGd(g)};b.onkeydown=e=>{if(e.key==='Enter'&&!g.soon)openGd(g)};return b}
function toggleFav(id){const i=ST.fav.indexOf(id);if(i<0)ST.fav.push(id);else ST.fav.splice(i,1);saveS();renderMenu()}
function noteRecent(id){ST.rec=[id,...ST.rec.filter(x=>x!==id)].slice(0,4);saveS();renderMenu()}
function renderHero(){if(!FEAT.length)return;const g=G$(FEAT[fi]),h=document.getElementById('hero');h.style.background=bgOf(g);
 h.innerHTML='<div class="big">'+g.e+'</div><div><h1>'+g.name+'</h1><p>'+g.hint.split('. ')[0]+'.</p><button class="hbtn" id="hp1">\u25b6 Play now</button><button class="hbtn alt" id="hp2">Details</button></div><div class="dots">'+FEAT.map((x,i)=>'<i class="'+(i===fi?'on':'')+'" data-i="'+i+'"></i>').join('')+'</div>';
 document.getElementById('hp1').onclick=()=>openGame(g);document.getElementById('hp2').onclick=()=>openGd(g);h.querySelectorAll('.dots i').forEach(d=>d.onclick=()=>{fi=+d.dataset.i;renderHero()})}
function renderMenu(){const R=document.getElementById('rows');R.innerHTML='';
 const sec=(t,list)=>{if(!list.length)return;const h=document.createElement('div');h.className='sec';h.textContent=t;R.appendChild(h);const gr=document.createElement('div');gr.className='gg';list.forEach(g=>gr.appendChild(mkCard(g)));R.appendChild(gr)};
 if(!qry&&cat==='All'){sec('\u23f1 Continue playing',ST.rec.map(G$).filter(Boolean));sec('\u2665 Favorites',ST.fav.map(G$).filter(Boolean))}
 const ch=document.createElement('div');ch.className='chips';['All',...new Set(GAMES.map(catOf))].forEach(c=>{const b=document.createElement('button');b.textContent=c;if(c===cat)b.className='on';b.onclick=()=>{cat=c;renderMenu()};ch.appendChild(b)});R.appendChild(ch);
 const list=GAMES.filter(g=>(cat==='All'||catOf(g)===cat)&&(!qry||(g.name+' '+g.tag+' '+catOf(g)).toLowerCase().includes(qry)));
 sec(cat==='All'?'All games':cat,list);if(!list.length){const e=document.createElement('div');e.className='sec';e.textContent='No games match your search.';R.appendChild(e)}}
function openGd(g){const m=META[g.id]||{},d=document.getElementById('gd');
 d.innerHTML='<div class="gdb"><div class="gda" style="background:'+bgOf(g)+'">'+g.e+'<button class="gdx" id="gdx">\u2715</button></div><div class="gdc"><h2>'+g.name+'</h2><div class="gdt">'+[catOf(g),m.m].concat(m.t||[]).filter(Boolean).map(t=>'<span>'+t+'</span>').join('')+'</div><p>'+g.hint+'</p><div class="gdr"><button class="hbtn pri" id="gdp">\u25b6 Play</button><button class="hbtn alt2" id="gdf">'+(ST.fav.includes(g.id)?'\u2665 Favorited':'\u2661 Favorite')+'</button><button class="hbtn alt2" id="gdi">🔗 Copy invite</button></div></div></div>';
 d.classList.add('on');const cls=()=>d.classList.remove('on');d.onclick=e=>{if(e.target===d)cls()};document.getElementById('gdx').onclick=cls;
 document.getElementById('gdp').onclick=()=>{cls();openGame(g)};document.getElementById('gdf').onclick=()=>{toggleFav(g.id);openGd(g)};
 document.getElementById('gdi').onclick=function(){const u=location.origin+location.pathname+'?room='+roomCode()+'&game='+g.id;(navigator.clipboard?navigator.clipboard.writeText(u):Promise.reject()).then(()=>{this.textContent='Copied!'}).catch(()=>prompt('Copy this invite link',u))}}
function openSet(){const p=document.getElementById('sp');p.classList.add('on');document.getElementById('sens').value=ST.sens;document.getElementById('sensv').textContent=ST.sens;document.getElementById('qual').value=ST.q;document.getElementById('thm').value=ST.th;document.getElementById('snb').textContent=mute?'🔇 Off':'🔊 On'}
document.getElementById('spx2').onclick=()=>document.getElementById('sp').classList.remove('on');
document.getElementById('sens').oninput=e=>{ST.sens=+e.target.value;SENS=ST.sens*.0006;document.getElementById('sensv').textContent=ST.sens;saveS()};
document.getElementById('qual').onchange=e=>{ST.q=e.target.value;saveS();if(renderer){renderer.setPixelRatio(pr());resize()}};
document.getElementById('thm').onchange=e=>{ST.th=e.target.value;saveS();if(ST.th==='auto')delete document.documentElement.dataset.theme;else document.documentElement.dataset.theme=ST.th};
document.getElementById('snb').onclick=()=>{document.getElementById('mt').click();document.getElementById('snb').textContent=mute?'🔇 Off':'🔊 On'};
document.getElementById('rst').onclick=()=>{if(confirm('Delete your saved name, friends, avatar and settings?')){try{localStorage.clear()}catch(e){}location.reload()}};
document.getElementById('q').oninput=e=>{qry=e.target.value.trim().toLowerCase();renderMenu()};
document.querySelectorAll('#side nav button').forEach(b=>b.onclick=()=>{const k=b.dataset.nav;
 if(k==='home'||k==='games'){document.querySelectorAll('#side nav button').forEach(x=>x.classList.toggle('on',x===b));if(k==='home')window.scrollTo({top:0,behavior:'smooth'});else document.getElementById('rows').scrollIntoView({behavior:'smooth'})}
 else if(k==='avatar')openGame(G$('avatar'));else if(k==='friends')openFr();else openSet()});
addEventListener('keydown',e=>{if(e.code==='Escape'){document.getElementById('gd').classList.remove('on');document.getElementById('sp').classList.remove('on')}});
try{renderHero()}catch(e){console.error(e)}try{renderMenu()}catch(e){console.error(e)}setInterval(()=>{if(!document.getElementById('modal').classList.contains('on')&&!document.getElementById('gd').classList.contains('on')){fi=(fi+1)%FEAT.length;renderHero()}},7000);
(()=>{const gp=new URLSearchParams(location.search).get('game');if(gp&&G$(gp))openGd(G$(gp))})();
