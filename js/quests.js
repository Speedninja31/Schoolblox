/* quests.js - hourly SchoolBux quests, badges and gamepasses. Reads game progress without touching game code.
   Saved in localStorage as hubquests / hubbadges / hubpasses (so accounts + export/import include them). */
(()=>{
const $=id=>document.getElementById(id),HOUR=36e5,hr=()=>Math.floor(Date.now()/HOUR);
const ld=(k,d)=>{try{return Object.assign(d,JSON.parse(localStorage.getItem(k)||'{}'))}catch(e){return d}};
let S=ld('hubquests',{h:0,p:{},d:{},r:{}}),B=ld('hubbadges',{own:{},life:{},qd:0,hd:0,t:0,pl:{}}),PS=ld('hubpasses',{own:{}});
const sv=()=>{try{localStorage.setItem('hubquests',JSON.stringify(S));localStorage.setItem('hubbadges',JSON.stringify(B));localStorage.setItem('hubpasses',JSON.stringify(PS))}catch(e){}};
/* Quests: per game [reward, [[text, metric, target], ...variants]] - one easy (20) and one hard (100) per game, variant rotates every hour */
const Q={
 tower:['Sky Tower','🗼',[[20,[['Reach checkpoint 2','cp',2],['Reach checkpoint 3','cp',3]]],[100,[['Reach checkpoint 5','cp',5],['Reach the summit','win',1]]]]],
 survive:['Disaster Survival','🌪️',[[20,[['Survive 1 round','rounds',1],['Survive 2 rounds','rounds',2]]],[100,[['Survive 4 rounds','rounds',4],['Survive 5 rounds','rounds',5]]]]],
 zom:['Zombie Siege','🧟',[[20,[['Reach wave 3','wave',3],['Reach wave 4','wave',4]]],[100,[['Reach wave 8','wave',8],['Reach wave 10','wave',10]]]]],
 snow:['Snowball Fight','⛄',[[20,[['Get 3 kills','kills',3],['Get 4 kills','kills',4]]],[100,[['Get 12 kills','kills',12],['Get 15 kills','kills',15]]]]],
 fish:['Fishing Frenzy','🎣',[[20,[['Catch 4 fish','fish',4],['Catch 5 fish','fish',5]]],[100,[['Catch 20 fish','fish',20],['Catch 25 fish','fish',25]]]]],
 garden:['Garden Grove','🌻',[[20,[['Harvest 8 crops','crops',8],['Harvest 10 crops','crops',10]]],[100,[['Harvest 40 crops','crops',40],['Harvest 50 crops','crops',50]]]]],
 pizza:['Pizza Place','🍕',[[20,[['Serve 4 orders','served',4],['Serve 5 orders','served',5]]],[100,[['Serve 20 orders','served',20],['Serve 25 orders','served',25]]]]],
 mm:['Murder Mystery','🕵️',[[20,[['Collect 8 coins','coins',8],['Collect 10 coins','coins',10]]],[100,[['Win 2 rounds','wins',2],['Win 3 rounds','wins',3]]]]],
 pets:['Pet Hatchery','🥚',[[20,[['Hatch 5 eggs','hatch',5],['Hatch 6 eggs','hatch',6]]],[100,[['Hatch 30 eggs','hatch',30],['Hatch 40 eggs','hatch',40]]]]],
 hang:['Plaza Hangout','🏙️',[[20,[['Use 3 emotes','emotes',3],['Send 3 chat messages','chats',3]]],[100,[['Walk around for 6 minutes','move',360],['Walk around for 8 minutes','move',480]]]]],
 jail:['Cops & Robbers','🚓',[[20,[['Pull off 2 heists','rob',2],['Make 2 arrests','arrest',2]]],[100,[['Pull off 6 heists','rob',6],['Make 6 arrests','arrest',6]]]]]
};
let mmw={k:'',n:0},hv={m:0,e:0,pe:null,c:0};
/* How progress is read from each running game: kind 'inc' counts increases, 'max' keeps the highest value */
const M={tower:{cp:['max',e=>e.cpi],win:['max',e=>e.won?1:0]},survive:{rounds:['inc',e=>e.n]},zom:{wave:['max',e=>e.wave]},snow:{kills:['inc',e=>e.kc]},
 fish:{fish:['inc',e=>e.cgn]},garden:{crops:['inc',e=>e.D.bag.length]},pizza:{served:['inc',e=>e.D.served]},pets:{hatch:['inc',e=>e.S.ht]},
 mm:{coins:['inc',e=>e.cn],wins:['inc',e=>{const k=(e.res||'')+'|'+e.hold;if(e.res&&e.res.indexOf('You win')>=0&&k!==mmw.k)mmw.n++;mmw.k=k;return mmw.n}]},
 hang:{move:['inc',e=>{if(e.P&&e.P.hs>0)hv.m++;return hv.m}],emotes:['inc',e=>{const x=e.P&&e.P.emote;if(x&&!hv.pe)hv.e++;hv.pe=x;return hv.e}],chats:['inc',e=>hv.c]},jail:{rob:['inc',e=>e.rbc],arrest:['inc',e=>e.arc]}};
const PASSES=[['vip','👑','VIP',400,'+25% SchoolBux from every quest, plus a VIP tag next to your name.'],
 ['rr','🔁','Quest Reroll',250,'Swap any unfinished quest for a different one (once per quest each hour).'],
 ['spd','⚡','Speed Coil',350,'A TOOL for your hotbar. Equip it (Z) to run 25% faster in the 3D games (not in Murder Mystery).'],
 ['jmp','🦘','High Jump',350,'A TOOL for your hotbar. Equip it (X) to jump higher in the 3D games (not in Murder Mystery).'],
 ['idle','💰','Idle Income',600,'Earn 4 SchoolBux per minute just for being here, instead of 1.']];
const has=id=>!!PS.own[id],fair=()=>typeof curId!=='undefined'&&curId==='mm';
const hash=s=>{let h=0;for(const c of s)h=(h*31+c.charCodeAt(0))>>>0;return h};
const qOf=(g,i)=>{const d=Q[g][2][i],k=g+':'+i,vs=d[1],v=vs[(hash(k)+S.h+(S.r[k]||0))%vs.length];return{key:k,g,r:d[0],text:v[0],m:v[1],n:v[2]}};
const rew=q=>Math.round(q.r*(has('vip')?1.25:1)),L=k=>B.life[k]||0,pc=()=>Object.keys(PS.own).length;
const BD=[['welcome','👋','Welcome!','Join SchoolBlox',()=>1,1],['q1','🎯','First Quest','Complete a quest',()=>B.qd,1],['q10','🏅','Quest Hunter','Complete 10 quests',()=>B.qd,10],
 ['q50','🏆','Quest Master','Complete 50 quests',()=>B.qd,50],['h5','💎','Big Game Hunter','Complete 5 hard quests',()=>B.hd,5],['b500','💵','Saver','Hold 500 SchoolBux',()=>BX.b,500],
 ['b2k','🤑','Rich','Hold 2000 SchoolBux',()=>BX.b,2000],['p1','🎟️','Pass Holder','Buy a gamepass',pc,1],['pall','👑','Pass Collector','Own every gamepass',pc,PASSES.length],
 ['fash','🧢','Fashionista','Own 10 shop items',()=>Object.keys(BX.own).length,10],['ex5','🧭','Explorer','Play 5 different games',()=>Object.keys(B.pl).length,5],
 ['ex10','🌍','World Traveler','Play every quest game',()=>Object.keys(B.pl).length,Object.keys(Q).length],['t60','⏱️','Dedicated','Play for 60 minutes',()=>Math.floor(B.t/60),60],
 ['sum','🗼','Summit Climber','Reach the Sky Tower summit',()=>L('tower:win'),1],['sur','🛡️','Survivor','Survive 10 disaster rounds',()=>L('survive:rounds'),10],
 ['zom','🧟','Zombie Slayer','Reach wave 10 in Zombie Siege',()=>L('zom:wave'),10],['snow','⛄','Snow Champion','Get 25 snowball kills',()=>L('snow:kills'),25],
 ['ang','🎣','Master Angler','Catch 50 fish',()=>L('fish:fish'),50],['grn','🌻','Green Thumb','Harvest 100 crops',()=>L('garden:crops'),100],
 ['piz','🍕','Pizza Pro','Serve 50 pizza orders',()=>L('pizza:served'),50],['det','🕵️','Detective','Win 5 Murder Mystery rounds',()=>L('mm:wins'),5],
 ['egg','🥚','Egg Hatcher','Hatch 100 eggs',()=>L('pets:hatch'),100],['soc','🕺','Social Butterfly','Use 20 emotes or chat messages',()=>L('hang:emotes')+L('hang:chats'),20]];
function finish(q){S.d[q.key]=1;const r=rew(q);BX.b+=r;saveBX();bxUpdate();B.qd++;if(q.r>=100)B.hd++;try{sfx('victory',.7)}catch(e){}toast('🎯 Quest complete: '+q.text+' · +'+r+' SchoolBux 💵')}
function credit(g,k,kind,v,d){const lk=g+':'+k;B.life[lk]=kind==='max'?Math.max(L(lk),v):L(lk)+d;
 Q[g][2].forEach((_,i)=>{const q=qOf(g,i);if(q.m!==k||S.d[q.key])return;const c=S.p[q.key]||0;S.p[q.key]=Math.min(q.n,kind==='max'?Math.max(c,v):c+d);if(S.p[q.key]>=q.n)finish(q)})}
const last={};let active=false;
const sg=window.startGame;window.startGame=function(){const r=sg.apply(this,arguments);for(const k in last)if(k.indexOf(curId+':')===0)delete last[k];active=true;TL.eq=null;return r};
$('close').addEventListener('click',()=>{active=false});
$('chatin').addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.value.trim()&&curId==='hang'&&active)hv.c++});
function tick(){
 if(S.h!==hr()){const first=S.h===0;S={h:hr(),p:{},d:{},r:{}};sv();if(!first){toast('🎯 New hourly quests are ready!');if($('qp').classList.contains('on'))draw()}}
 if(active&&$('modal').classList.contains('on')&&curId&&M[curId]&&ENG[curId]){B.t++;B.pl[curId]=1;
  for(const k in M[curId]){let v;try{v=M[curId][k][1](ENG[curId])}catch(e){continue}if(typeof v!=='number'||!isFinite(v))continue;
   const key=curId+':'+k,l=last[key];if(l!==undefined&&v>l)credit(curId,k,M[curId][k][0],v,v-l);last[key]=v}}
 BD.forEach(b=>{if(!B.own[b[0]]&&b[4]()>=b[5]){B.own[b[0]]=Date.now();toast(b[1]+' Badge unlocked: '+b[2])}});
 sv();hud();if($('qp').classList.contains('on'))draw();vip()}

/* ---------- Tools: Speed Coil and High Jump are real tools. Own the gamepass, then equip from the hotbar (Z / X or click). ---------- */
const TOOLS=[['spd','⚡','Speed Coil','KeyZ','Z',0xffb300],['jmp','🦘','High Jump','KeyX','X',0x3ddc84]];
const TL={eq:null,m:null,mp:null,mk:null};
const lm=c=>new THREE.MeshLambertMaterial({color:c,emissive:c,emissiveIntensity:.25});
function toolMesh(k,col){const g=new THREE.Group(),m=lm(col),d=lm(0x333344);
 if(k==='spd'){for(let i=0;i<3;i++){const r=new THREE.Mesh(new THREE.TorusGeometry(.62-i*.08,.13,8,20),m);r.rotation.x=Math.PI/2;r.position.y=i*.34;g.add(r)}
  const h=new THREE.Mesh(new THREE.CylinderGeometry(.12,.12,1.3,8),d);h.position.y=.34;g.add(h)}
 else{const b=new THREE.Mesh(new THREE.CylinderGeometry(.55,.55,.16,16),d);g.add(b);for(let i=0;i<4;i++){const r=new THREE.Mesh(new THREE.TorusGeometry(.4,.07,6,16),m);r.rotation.x=Math.PI/2;r.position.y=.25+i*.24;g.add(r)}
  const t=new THREE.Mesh(new THREE.CylinderGeometry(.55,.55,.16,16),m);t.position.y=1.2;g.add(t)}
 g.scale.setScalar(.9);return g}
function toolDrop(){if(TL.m&&TL.m.parent)TL.m.parent.remove(TL.m);TL.m=null;TL.mp=null;TL.mk=null}
function toolSync(){/* keep the held model on the current player's right hand */
 const e=active&&typeof curId!=='undefined'&&ENG[curId],P=e&&e.P,want=TL.eq&&has(TL.eq)&&!fair()&&P&&P.J&&P.J.aR?P:null;
 if(!want||TL.mk!==TL.eq){if(TL.m&&(!want||TL.mk!==TL.eq))toolDrop()}
 if(want&&!TL.m){const t=TOOLS.find(x=>x[0]===TL.eq),m=toolMesh(t[0],t[5]);m.position.set(0,-2,.55);m.rotation.x=Math.PI/2;want.J.aR.add(m);TL.m=m;TL.mp=want;TL.mk=TL.eq}
 else if(want&&TL.mp!==want){toolDrop()}
 if(TL.m){TL.m.rotation.z+=.04}}
const hmsg=document.createElement('div');hmsg.id='hmsg';document.body.appendChild(hmsg);let hmt=0;
function equip(k){const t=TOOLS.find(x=>x[0]===k);if(!t||!has(k)||!active||fair())return;TL.eq=TL.eq===k?null:k;hmsg.textContent=TL.eq?t[1]+' '+t[2]:'Put away';hmsg.style.opacity=1;clearTimeout(hmt);hmt=setTimeout(()=>{hmsg.style.opacity=0},1100);toolSync();toolBar()}
const hbar=document.createElement('div');hbar.id='hotbar';document.body.appendChild(hbar);
function toolBar(){const own=TOOLS.filter(t=>has(t[0])),show=active&&own.length&&!fair()&&typeof inGame==='function'&&inGame()&&!(typeof rbIsOpen==='function'&&rbIsOpen());hbar.style.display=show?'flex':'none';if(!show)return;
 const h=own.map(t=>`<button data-t="${t[0]}" class="${TL.eq===t[0]?'on':''}" title="${t[2]} (${t[4]})"><i>${t[4]}</i><span>${t[1]}</span><small>${t[2]}</small></button>`).join('');if(hbar.dataset.h!==h+TL.eq){hbar.dataset.h=h+TL.eq;hbar.innerHTML=h}}
hbar.onclick=e=>{const b=e.target.closest('button');if(b)equip(b.dataset.t)};
addEventListener('keydown',e=>{if(e.repeat||!active||e.target&&(e.target.tagName==='INPUT'||e.target.tagName==='TEXTAREA'))return;const t=TOOLS.find(x=>x[3]===e.code);if(t)equip(t[0])});
setInterval(()=>{toolSync();toolBar()},150);
/* ---------- UI ---------- */
let tab='quests';
const qp=document.createElement('div');qp.id='qp';document.body.appendChild(qp);
const mkb=(id,t,tab)=>{const b=document.createElement('button');b.id=id;b.title=t;b.className='rwb';$('hlp').parentNode.insertBefore(b,$('hlp'));b.onclick=()=>open(tab);return b};
const hb=mkb('qhb','Quests','quests'),hb2=mkb('bhb','Badges','badges'),hb3=mkb('phb','Gamepasses','passes');hb2.textContent='🏅';hb3.textContent='🎟️';
function hud(){const g=active&&Q[curId];hb.style.display=g?'':'none';hb2.style.display=hb3.style.display=active?'':'none';if(g){const d=[0,1].filter(i=>S.d[curId+':'+i]).length;hb.textContent='🎯 '+d+'/2'}}
function vip(){const h=$('hn');if(!h)return;let t=$('vipt');if(has('vip')&&!t){t=document.createElement('span');t.id='vipt';t.textContent='👑 VIP';h.parentNode.appendChild(t)}}
const bar=(v,n)=>`<div class="qbar"><i style="width:${Math.min(100,v/n*100)}%"></i></div>`;
function draw(){
 const left=HOUR-Date.now()%HOUR,mm=Math.floor(left/6e4),ss=String(Math.floor(left/1e3)%60).padStart(2,'0'),t=(id,n)=>`<button data-t="${id}" class="${tab===id?'on':''}">${n}</button>`;
 let h=`<div class="frh"><b>${tab==='badges'?'🏅 Badges':tab==='passes'?'🎟️ Gamepasses':'🎯 Quests'}</b><button data-a="x">✕</button></div><div class="qtop">💵 <b>${BX.b}</b> SchoolBux</div>`;
 if(tab==='quests'){h+=`<div class="qnote">Quests reset every hour · new ones in <b>${mm}:${ss}</b></div>`;
  Object.keys(Q).sort((a,b)=>(b===curId)-(a===curId)).forEach(g=>{h+=`<div class="qcard${g===curId&&active?' now':''}"><div class="qgh">${Q[g][1]} ${Q[g][0]}</div>`;
   [0,1].forEach(i=>{const q=qOf(g,i),p=S.p[q.key]||0,d=S.d[q.key];
    h+=`<div class="qrow${d?' done':''}"><span class="qtag ${q.r>=100?'hard':'easy'}">${q.r>=100?'HARD':'EASY'}</span><div class="qtx"><b>${q.text}</b>${bar(p,q.n)}<small>${d?'Completed ✓':p+' / '+q.n}</small></div><div class="qrw">+${rew(q)}<br>💵${has('rr')&&!d&&!S.r[q.key]?`<button data-a="rr" data-k="${q.key}" title="Reroll quest">🔁</button>`:''}</div></div>`});h+='</div>'})}
 if(tab==='badges'){h+=`<div class="qnote">${Object.keys(B.own).length} / ${BD.length} badges unlocked</div><div class="bgrid">`+BD.map(b=>{const o=B.own[b[0]],v=Math.min(b[4](),b[5]);return`<div class="bd${o?' got':''}"><div class="be">${b[1]}</div><b>${b[2]}</b><small>${b[3]}</small>${o?'<em>Unlocked</em>':bar(v,b[5])+`<small>${v} / ${b[5]}</small>`}</div>`}).join('')+'</div>'}
 if(tab==='passes'){h+='<div class="qnote">Gamepasses are bought once and kept forever.</div>'+PASSES.map(p=>`<div class="gp"><div class="be">${p[1]}</div><div class="gpt"><b>${p[2]}</b><small>${p[4]}</small></div>${has(p[0])?'<em>Owned ✓</em>':`<button data-a="buy" data-k="${p[0]}" class="${BX.b<p[3]?'no':''}">💵 ${p[3]}</button>`}</div>`).join('')}
 const sc=qp.scrollTop;qp.innerHTML=h;qp.scrollTop=sc}
qp.onclick=e=>{const b=e.target.closest('button');if(!b)return;const a=b.dataset.a,k=b.dataset.k;
 if(b.dataset.t){tab=b.dataset.t;draw();return}
 if(a==='x')qp.classList.remove('on');
 if(a==='rr'&&has('rr')&&!S.r[k]&&!S.d[k]){S.r[k]=1;delete S.p[k];sv();toast('🔁 Quest rerolled!')}
 if(a==='buy'){const p=PASSES.find(x=>x[0]===k);if(p&&!has(k)){if(BX.b<p[3])toast('Not enough SchoolBux - you need '+(p[3]-BX.b)+' more');else{BX.b-=p[3];PS.own[k]=1;saveBX();bxUpdate();toast(p[1]+' '+p[2]+' unlocked!')}}}
 sv();draw()};
function open(t){tab=t==='badges'||t==='passes'?t:'quests';qp.classList.add('on');draw()}
addEventListener('keydown',e=>{if(e.code==='Escape')qp.classList.remove('on')});
const cc=document.querySelector('.cc');if(cc){cc.style.cursor='pointer';cc.onclick=()=>open('quests')}
window.SBQ={open,idle:()=>has('idle')?4:1,spd:()=>has('spd')&&TL.eq==='spd'&&!fair()?1.25:1,jmp:()=>has('jmp')&&TL.eq==='jmp'&&!fair()?1.15:1};
tick();setInterval(tick,1000);
})();
