/* menu.js - SchoolBlox home screen: profile, friends strip, game rows, search, favorites, settings.
   Loaded last so every game has registered itself. */
const FEAT=['zom','snow','fish','garden','survive','mm','hang','tower','pets'].filter(id=>GAMES.some(g=>g.id===id));
let cat='All',qry='';
const $e=id=>document.getElementById(id),hashS=s=>{let h=0;for(const c of String(s))h=(h*31+c.charCodeAt(0))>>>0;return h};
const G$=id=>GAMES.find(g=>g.id===id),bgOf=g=>'linear-gradient(135deg,'+g.c[0]+','+g.c[1]+')',catOf=g=>(META[g.id]||{}).c||g.tag;
/* ---------- little 2D avatar (profile + friends) ---------- */
let svgN=0;
function avSvg(av,sz){const hex=n=>'#'+n.toString(16).padStart(6,'0'),sk=hex(OPT.skin[av.skin||0][1]),sh=hex(OPT.shirt[av.shirt||0][1]),hat=(OPT.hat[av.hat||0]||[])[1]||'',id='c'+(svgN++);
 const H={cap:'<path d="M32 28a18 16 0 0 1 36 0z" fill="#e0352b"/><rect x="30" y="27" width="40" height="4" rx="2" fill="#b02a22"/>',top:'<rect x="36" y="4" width="28" height="24" fill="#1a1a1a"/><rect x="28" y="26" width="44" height="5" rx="2" fill="#1a1a1a"/>',crown:'<path d="M33 28V10l9 9 8-12 8 12 9-9v18z" fill="#ffcf33"/>',party:'<path d="M50 2l15 28H35z" fill="#ff5fb0"/>',wizard:'<path d="M50 0l17 29H33z" fill="#4b2a9a"/><rect x="26" y="27" width="48" height="4" rx="2" fill="#4b2a9a"/>',cowboy:'<rect x="38" y="12" width="24" height="16" rx="4" fill="#8a5a2b"/><rect x="22" y="26" width="56" height="5" rx="2.5" fill="#8a5a2b"/>',beanie:'<path d="M33 28a17 17 0 0 1 34 0z" fill="#3b82f6"/><circle cx="50" cy="10" r="4" fill="#fff"/>',chef:'<rect x="36" y="14" width="28" height="15" fill="#fff"/><circle cx="42" cy="12" r="9" fill="#fff"/><circle cx="58" cy="12" r="9" fill="#fff"/>',santa:'<path d="M33 29c0-18 14-26 28-22l8 6-4 4 3 12z" fill="#d62828"/><rect x="32" y="26" width="38" height="6" rx="3" fill="#fff"/>',halo:'<ellipse cx="50" cy="14" rx="15" ry="4" fill="none" stroke="#ffe066" stroke-width="3"/>',phones:'<path d="M32 38a18 18 0 0 1 36 0" fill="none" stroke="#333" stroke-width="4"/><rect x="28" y="34" width="7" height="12" rx="3" fill="#e0352b"/><rect x="65" y="34" width="7" height="12" rx="3" fill="#e0352b"/>',straw:'<rect x="38" y="12" width="24" height="16" rx="4" fill="#e6c36a"/><rect x="22" y="26" width="56" height="5" rx="2.5" fill="#e6c36a"/>',pirate:'<path d="M26 28l24-14 24 14z" fill="#1a1a1a"/>',grad:'<rect x="26" y="20" width="48" height="6" fill="#1a1a1a"/><rect x="38" y="24" width="24" height="7" fill="#1a1a1a"/>'};
 return '<svg viewBox="0 0 100 100" width="'+sz+'" height="'+sz+'"><defs><clipPath id="'+id+'"><circle cx="50" cy="50" r="50"/></clipPath></defs><g clip-path="url(#'+id+')"><rect width="100" height="100" fill="#fff"/><rect x="14" y="60" width="16" height="44" rx="4" fill="'+sk+'"/><rect x="70" y="60" width="16" height="44" rx="4" fill="'+sk+'"/><rect x="28" y="58" width="44" height="46" rx="5" fill="'+sh+'"/><rect x="34" y="26" width="32" height="34" rx="9" fill="'+sk+'"/><circle cx="43" cy="42" r="2.4" fill="#111"/><circle cx="57" cy="42" r="2.4" fill="#111"/><path d="M42 50q8 7 16 0" fill="none" stroke="#111" stroke-width="2.2" stroke-linecap="round"/>'+(H[hat]||'')+'</g></svg>'}
function renderProfile(){const n=myName();$e('pav').innerHTML=avSvg(AV,150);$e('hn').textContent=n;$e('uname').textContent=n;}
function renderFs(){const el=$e('frs');if(!el)return;const ids=Object.keys(FRS),now=Date.now(),on=ids.filter(c=>SEEN[c]&&now-SEEN[c].t<20000);el.innerHTML='';
 const hd=document.createElement('div');hd.className='shd';hd.innerHTML='<h2></h2><button class="sa">See All</button>';hd.firstChild.textContent='Friends ('+ids.length+') \u00b7 '+on.length+' online';hd.lastChild.onclick=()=>openFr();el.appendChild(hd);
 const bx=document.createElement('div');bx.className='fbox';
 if(!ids.length){bx.innerHTML='<div class="fe">No friends yet. Press <b>Invite Friends</b> to share your link, or <a>add a friend by code</a>.</div>';bx.querySelector('a').onclick=()=>openFr()}
 ids.forEach(c=>{const s=SEEN[c],o=on.includes(c),nm=String(FRS[c]).replace(/[^\w -]/g,'').slice(0,14)||'Friend',h=hashS(nm),d=document.createElement('div');d.className='fav2'+(o?'':' off');
  d.innerHTML='<div class="fa">'+avSvg({skin:h%6,shirt:(h>>3)%OPT.shirt.length,hat:[0,1,2,5,6,7,13][(h>>6)%7]},90)+'</div>'+(o?'<div class="st '+(s.g?'pl':'on')+'">'+(s.g?'\ud83c\udfae':'\ud83d\udc64')+'</div>':'')+'<span></span>';
  d.lastChild.textContent=nm;d.onclick=()=>{if(o&&s.g)joinFriend(c);else openFr()};bx.appendChild(d)});
 el.appendChild(bx);const b=$e('fbadge');b.textContent=on.length;b.style.display=on.length?'flex':'none'}
/* ---------- game cards ---------- */
function mkCard(g){const m=META[g.id]||{},b=document.createElement('div');b.className='sgc';b.tabIndex=0;
 b.innerHTML='<div class="art" style="background:'+bgOf(g)+'">'+g.e+(g.soon?'<span class="nw" style="background:#555">SOON</span>':m.n?'<span class="nw">NEW</span>':'')+'<button class="fv" title="Favorite">'+(ST.fav.includes(g.id)?'\u2665':'\u2661')+'</button></div><div class="bd"><b></b><small></small><small></small></div>';
 b.querySelector('b').textContent=g.name;const sm=b.querySelectorAll('small');sm[0].textContent=g.soon?'Coming soon':(m.m||g.tag);sm[1].textContent=catOf(g);
 b.onclick=e=>{if(e.target.classList.contains('fv')){e.stopPropagation();toggleFav(g.id);return}if(g.soon)return;openGd(g)};b.onkeydown=e=>{if(e.key==='Enter'&&!g.soon)openGd(g)};return b}
function toggleFav(id){const i=ST.fav.indexOf(id);if(i<0)ST.fav.push(id);else ST.fav.splice(i,1);saveS();renderMenu()}
function noteRecent(id){ST.rec=[id,...ST.rec.filter(x=>x!==id)].slice(0,4);saveS();renderMenu()}
function renderMenu(){const R=$e('rows');R.innerHTML='';
 const hdr=(t,or,fn)=>{const h=document.createElement('div');h.className='shd';const x=document.createElement('h2');x.textContent=t;if(or)x.className='or';h.appendChild(x);if(fn){const b=document.createElement('button');b.className='sa';b.textContent='See All';b.onclick=fn;h.appendChild(b)}R.appendChild(h);return h};
 const row=list=>{const w=document.createElement('div');w.className='prow';const r=document.createElement('div');r.className='ro';list.forEach(g=>r.appendChild(mkCard(g)));w.appendChild(r);if(list.length>5){const n=document.createElement('button');n.className='nxt';n.textContent='\u203a';n.onclick=()=>r.scrollBy(320,0);w.appendChild(n)}R.appendChild(w)};
 if(!qry&&cat==='All'){const rc=ST.rec.map(G$).filter(Boolean);if(rc.length){hdr('Continue playing',true);row(rc)}const fv=ST.fav.map(G$).filter(Boolean);if(fv.length){hdr('Favorites',true);row(fv)}hdr('Popular',true,()=>$e('allh').scrollIntoView({behavior:'smooth'}));row(FEAT.map(G$))}
 hdr(qry?'Search results':'All games',false).id='allh';
 const ch=document.createElement('div');ch.className='chips2';['All','Favorites',...new Set(GAMES.map(catOf))].forEach(c=>{const b=document.createElement('button');b.textContent=c;if(c===cat)b.className='on';b.onclick=()=>{cat=c;renderMenu()};ch.appendChild(b)});R.appendChild(ch);
 const list=GAMES.filter(g=>(cat==='All'||(cat==='Favorites'?ST.fav.includes(g.id):catOf(g)===cat))&&(!qry||(g.name+' '+g.tag+' '+catOf(g)).toLowerCase().includes(qry)));
 const gr=document.createElement('div');gr.className='gg2';list.forEach(g=>gr.appendChild(mkCard(g)));R.appendChild(gr);
 if(!list.length){const e=document.createElement('div');e.className='fe';e.textContent='No games match.';R.appendChild(e)}}
/* ---------- game details popup ---------- */
function openGd(g){const m=META[g.id]||{},d=$e('gd');
 d.innerHTML='<div class="gdb"><div class="gda" style="background:'+bgOf(g)+'">'+g.e+'<button class="gdx" id="gdx">\u2715</button></div><div class="gdc"><h2></h2><div class="gdt">'+[catOf(g),m.m].concat(m.t||[]).filter(Boolean).map(t=>'<span>'+t+'</span>').join('')+'</div><p></p><div class="gdr"><button class="hbtn pri" id="gdp">\u25b6 Play</button><button class="hbtn alt2" id="gdf">'+(ST.fav.includes(g.id)?'\u2665 Favorited':'\u2661 Favorite')+'</button><button class="hbtn alt2" id="gdi">\ud83d\udd17 Copy invite</button></div></div></div>';
 d.querySelector('h2').textContent=g.name;d.querySelector('p').textContent=g.hint||'';
 d.classList.add('on');const cls=()=>d.classList.remove('on');d.onclick=e=>{if(e.target===d)cls()};$e('gdx').onclick=cls;
 $e('gdp').onclick=()=>{cls();openGame(g)};$e('gdf').onclick=()=>{toggleFav(g.id);openGd(g)};
 $e('gdi').onclick=function(){const u=location.origin+location.pathname+'?room='+roomCode()+'&game='+g.id;(navigator.clipboard?navigator.clipboard.writeText(u):Promise.reject()).then(()=>{this.textContent='Copied!'}).catch(()=>prompt('Copy this invite link',u))}}
/* ---------- settings ---------- */
function openSet(){const p=$e('sp');p.classList.add('on');$e('sens').value=ST.sens;$e('sensv').textContent=ST.sens;$e('qual').value=ST.q;$e('thm').value=ST.th;$e('snb').textContent=mute?'\ud83d\udd07 Off':'\ud83d\udd0a On';$e('shd').value=ST.sh;$e('cap').value=String(ST.cap);$e('fpsb').checked=!!ST.fps;$e('shk').checked=ST.shake!==false;$e('hnt').checked=ST.hints!==false;$e('calm').checked=!!ST.calm;$e('vol').value=Math.round(ST.vol*100);$e('volv').textContent=Math.round(ST.vol*100)+'%'}
$e('spx2').onclick=()=>$e('sp').classList.remove('on');
$e('sens').oninput=e=>{ST.sens=+e.target.value;SENS=ST.sens*.0006;$e('sensv').textContent=ST.sens;saveS()};
$e('qual').onchange=e=>{ST.q=e.target.value;saveS();if(renderer){renderer.setPixelRatio(pr());resize()}};
$e('thm').onchange=e=>{ST.th=e.target.value;saveS();if(ST.th==='auto')delete document.documentElement.dataset.theme;else document.documentElement.dataset.theme=ST.th};
$e('shd').onchange=e=>{ST.sh=e.target.value;saveS();applyGfx()};
$e('cap').onchange=e=>{ST.cap=+e.target.value;saveS()};
$e('fpsb').onchange=e=>{ST.fps=e.target.checked;saveS()};
$e('shk').onchange=e=>{ST.shake=e.target.checked;saveS()};
$e('hnt').onchange=e=>{ST.hints=e.target.checked;saveS()};
$e('calm').onchange=e=>{ST.calm=e.target.checked;document.documentElement.classList.toggle('calm',ST.calm);saveS()};
$e('vol').oninput=e=>{ST.vol=+e.target.value/100;$e('volv').textContent=e.target.value+'%';saveS()};
$e('snb').onclick=()=>{$e('mt').click();$e('snb').textContent=mute?'\ud83d\udd07 Off':'\ud83d\udd0a On'};
$e('rst').onclick=()=>{if(confirm('Delete your saved name, friends, avatar and settings?')){try{localStorage.clear()}catch(e){}location.reload()}};
/* ---------- navigation, search, banner ---------- */
function goTo(k){if(k==='home')window.scrollTo({top:0,behavior:'smooth'});else if(k==='games'){const a=$e('allh');if(a)a.scrollIntoView({behavior:'smooth'})}
 else if(k==='catalog'||k==='avatar'){SHOPMODE=k==='catalog'?'catalog':'avatar';openGame(G$('avatar'))}else if(k==='friends')openFr();else if(k==='settings')openSet();
 else if(k==='favorites'){cat='Favorites';renderMenu();$e('allh').scrollIntoView({behavior:'smooth'})}else if(k==='recent'){cat='All';qry='';renderMenu();$e('rows').scrollIntoView({behavior:'smooth'})}}
document.querySelectorAll('[data-nav],[data-go]').forEach(b=>b.onclick=()=>goTo(b.dataset.nav||b.dataset.go));
$e('gear').onclick=openSet;$e('brand').onclick=()=>goTo('home');
$e('q').oninput=e=>{qry=e.target.value.trim().toLowerCase();renderMenu()};
$e('nick').addEventListener('input',renderProfile);
const TIPS=['Welcome to SchoolBlox! Share your room code so your friends can join you.','Vote for the next map in the lobby of Murder Mystery, Disaster Survival and Snowball Fight!','New: Fishing Frenzy and Garden Grove - catch rare fish and grow giant crops!','Press R in Sky Tower to respawn at your last checkpoint.','Open Character to wear hats, outfits and effects. Everything is free!'];let tipN=0;
const showTip=()=>{$e('ban').textContent=TIPS[tipN%TIPS.length]};
addEventListener('keydown',e=>{if(e.code==='Escape'){$e('gd').classList.remove('on');$e('sp').classList.remove('on')}});
showTip();renderProfile();renderFs();try{renderMenu()}catch(e){console.error(e)}
setInterval(()=>{if(!$e('modal').classList.contains('on')){renderProfile();renderFs()}},2500);
setInterval(()=>{tipN++;showTip()},8000);
(()=>{const gp=new URLSearchParams(location.search).get('game');if(gp&&G$(gp))openGd(G$(gp))})();
