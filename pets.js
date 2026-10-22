/* Game: Pet Hatchery (id: pets) - card, menu info and game engine. */
GAMES.push({id:'pets',name:'Pet Hatchery',tag:'Roleplay',e:'🥚',c:['#ffd24f','#ff9bd0'],like:'96%',pl:'31.2K',hint:'Tap the egg to earn coins, hatch 5 kinds of eggs for 24 pets across 6 rarities, equip your best pets for bonus power, evolve duplicates into Golden pets, buy upgrades and fill your Pet Dex. Claim a free daily gift!'});
META.pets={c:'Casual',m:'Solo',t:['Hatching','Idle','Collect'],n:1};
ENG.pets={d3:false,
 RC:{Common:'#9aa0aa',Uncommon:'#4caf50',Rare:'#29b6f6',Epic:'#b45cff',Legendary:'#ffb300',Mythic:'#ff4081'},TI:['Common','Uncommon','Rare','Epic','Legendary','Mythic'],
 EGGS:[
  {id:'basic',n:'Basic Egg',e:'🥚',c:100,col:'#ffd24f',p:[['dog','Dog','🐶','Common',50,1],['cat','Cat','🐱','Common',50,1],['bunny','Bunny','🐰','Uncommon',25,3],['fox','Fox','🦊','Uncommon',20,3],['panda','Panda','🐼','Rare',6,10],['unicorn','Unicorn','🦄','Epic',1.2,40]]},
  {id:'forest',n:'Forest Egg',e:'🌲',c:600,col:'#4caf50',p:[['frog','Frog','🐸','Common',45,5],['deer','Deer','🦌','Uncommon',30,12],['owl','Owl','🦉','Rare',14,35],['wolf','Wolf','🐺','Epic',3,120],['bear','Bear','🐻','Epic',2,160],['trex','T-Rex','🦖','Legendary',.5,500]]},
  {id:'ocean',n:'Ocean Egg',e:'🌊',c:3000,col:'#29b6f6',p:[['crab','Crab','🦀','Common',45,25],['fishp','Fish','🐠','Uncommon',30,60],['octo','Octopus','🐙','Rare',15,160],['shark','Shark','🦈','Epic',4,520],['whale','Whale','🐋','Legendary',.8,1800]]},
  {id:'space',n:'Space Egg',e:'🚀',c:15000,col:'#7e57c2',p:[['alien','Alien','👽','Uncommon',40,240],['robot','Robot','🤖','Rare',30,700],['ghost','Ghost','👻','Epic',12,2200],['ufo','UFO Pet','🛸','Legendary',2,9000]]},
  {id:'dragon',n:'Dragon Egg',e:'🐉',c:80000,col:'#ff5252',p:[['drake','Drake','🦎','Rare',40,3000],['dragon','Dragon','🐲','Epic',25,12000],['phoenix','Phoenix','🔥','Legendary',6,50000],['cosmic','Cosmic Unicorn','🌌','Mythic',1,250000]]}],
 all(){if(!this.A){this.A={};this.EGGS.forEach(e=>e.p.forEach(p=>{this.A[p[0]]={id:p[0],n:p[1],e:p[2],r:p[3],pw:p[5]}}))}return this.A},
 load(){let d={};try{d=JSON.parse(localStorage.getItem('hubpet2')||'{}')}catch(x){}this.S=Object.assign({c:0,g:0,cl:1,au:0,lk:0,sl:3,eq:[],inv:{},dex:{},last:0,ht:0,tab:'hatch'},d)},
 save(){try{localStorage.setItem('hubpet2',JSON.stringify(this.S))}catch(x){}},
 pw(){const S=this.S,A=this.all();let p=S.cl;for(const id of S.eq){const i=S.inv[id];if(i&&A[id])p+=A[id].pw*(i.g>0?3:1)}return Math.floor(p)},
 cps(){return this.S.au?this.S.au*Math.max(1,Math.floor(this.pw()*.25)):0},
 cost(k){const S=this.S;return k==='cl'?Math.round(40*Math.pow(1.55,S.cl-1)):k==='au'?Math.round(250*Math.pow(1.7,S.au)):k==='lk'?Math.round(400*Math.pow(2.1,S.lk)):Math.round(1500*Math.pow(3,S.sl-3))},
 gp(){const o=[];this.EGGS.forEach(e=>e.p.forEach(p=>{if(this.TI.indexOf(p[3])>=3)o.push([p[0],p[1],p[2],p[3],1,p[5]])}));return o},
 roll(pool){const ws=pool.map(p=>p[4]*Math.pow(1+this.S.lk*.15,this.TI.indexOf(p[3])));let r=Math.random()*ws.reduce((a,b)=>a+b,0);for(let i=0;i<ws.length;i++){if((r-=ws[i])<0)return pool[i]}return pool[0]},
 hatch(id,n){const S=this.S,gem=id==='gem',egg=gem?{p:this.gp()}:this.EGGS.find(e=>e.id===id),tot=gem?25*n:egg.c*n;
  if(gem?S.g<tot:S.c<tot){snd(150,.15,'square',.1,100);return}
  if(gem)S.g-=tot;else S.c-=tot;const res=[];
  for(let i=0;i<n;i++){const p=this.roll(egg.p),it=S.inv[p[0]]||(S.inv[p[0]]={n:0,g:0}),neu=!S.dex[p[0]];it.n++;S.dex[p[0]]=1;S.ht++;if(this.TI.indexOf(p[3])>=3&&Math.random()<.3)S.g++;res.push({p,neu})}
  this.save();this.reveal(res)},
 reveal(res){const o=document.getElementById('pto');o.className='on';o.innerHTML='<div class="pegg">🥚</div>';snd(300,.8,'sine',.1,600);
  setTimeout(()=>{const best=Math.max(...res.map(r=>this.TI.indexOf(r.p[3])));snd(best>=3?1000:700,.5,'sine',.16,best>=3?1800:1100);
   o.innerHTML='<div class="prv2">'+res.map(r=>`<div class="pcard" style="--c:${this.RC[r.p[3]]}"><div class="pe">${r.p[2]}</div><b>${r.p[1]}</b><div class="rr" style="color:${this.RC[r.p[3]]}">${r.p[3]}</div><small>\u26a1 +${r.p[5]} power</small>${r.neu?'<div style="color:#ffd23a;font-weight:800">NEW!</div>':''}</div>`).join('')+'<div style="width:100%;text-align:center"><button data-a="close">Awesome!</button></div></div>'},1100)},
 act(a,v,e){const S=this.S,A=this.all();
  if(a==='tap'){const p=this.pw();S.c+=p;if(e){const f=document.createElement('div');f.className='tapfx';f.textContent='+'+fm(p);f.style.left=(e.clientX-12)+'px';f.style.top=(e.clientY-30)+'px';document.body.appendChild(f);setTimeout(()=>f.remove(),800)}snd(600+Math.random()*200,.05,'square',.04,900);this.top();return}
  if(a==='close'){document.getElementById('pto').className='';this.render();return}
  if(a==='tab'){S.tab=v;this.render();return}
  if(a==='hatch'){const[i,n]=v.split(':');this.hatch(i,+n);this.top();return}
  if(a==='daily'){if(Date.now()-S.last>864e5){S.last=Date.now();S.c+=1000+S.ht*10;S.g+=3;snd(900,.3,'sine',.14,1500)}this.save();this.render();return}
  if(a==='eq'){const i=S.eq.indexOf(v);if(i>=0)S.eq.splice(i,1);else if(S.eq.length<S.sl)S.eq.push(v);this.save();this.render();return}
  if(a==='evo'){const it=S.inv[v];if(it&&it.n>=5){it.n-=5;it.g++;snd(800,.4,'sine',.14,1600)}this.save();this.render();return}
  if(a==='up'){const c=this.cost(v);if(S.c>=c&&!(v==='lk'&&S.lk>=10)&&!(v==='sl'&&S.sl>=6)&&!(v==='au'&&S.au>=50)){S.c-=c;if(v==='cl')S.cl++;else if(v==='au')S.au++;else if(v==='lk')S.lk++;else S.sl++;snd(700,.15,'sine',.12,1100)}else snd(150,.15,'square',.1,100);this.save();this.render()}},
 top(){const S=this.S;document.getElementById('pc').textContent=fm(S.c);document.getElementById('pg').textContent=S.g;document.getElementById('pp').textContent=fm(this.pw())+'/tap \u00b7 '+fm(this.cps())+'/s';scoreEl.textContent='🪙 '+fm(S.c)+' \u00b7 💎 '+S.g},
 render(){const S=this.S,A=this.all(),f=fm,tabs=[['hatch','🥚 Hatch'],['pets','🐾 Pets'],['upg','\u2b06\ufe0f Upgrades'],['dex','📖 Pet Dex']];let b='';
  if(S.tab==='hatch'){b='<div class="ptap" data-a="tap"><div class="eggbig">🥚</div><div>Tap the egg for coins!</div></div><div class="pgrid">'+this.EGGS.map(e=>`<div class="pcard" style="--c:${e.col}"><div class="pe">${e.e}</div><b>${e.n}</b><div class="odds">${e.p.map(p=>`<span title="${p[1]} (${p[3]})" style="color:${this.RC[p[3]]}">${p[2]}</span>`).join('')}</div><div class="pb"><button data-a="hatch" data-v="${e.id}:1">🪙 ${f(e.c)}<small>Hatch x1</small></button><button data-a="hatch" data-v="${e.id}:3">🪙 ${f(e.c*3)}<small>Hatch x3</small></button></div></div>`).join('')+`<div class="pcard" style="--c:#ff4081"><div class="pe">💎</div><b>Gem Egg</b><div class="odds">Epic \u00b7 Legendary \u00b7 Mythic</div><div class="pb"><button data-a="hatch" data-v="gem:1">💎 25<small>Hatch x1</small></button></div></div></div>`}
  else if(S.tab==='pets'){const ids=Object.keys(S.inv).filter(id=>A[id]&&(S.inv[id].n>0||S.inv[id].g>0)).sort((a,b)=>A[b].pw-A[a].pw);
   b=`<div class="cur" style="display:inline-block;margin-bottom:12px">Equipped ${S.eq.length}/${S.sl}: ${S.eq.map(id=>A[id].e).join(' ')||'none'}</div>`+(ids.length?'<div class="pgrid">'+ids.map(id=>{const p=A[id],i=S.inv[id],eq=S.eq.includes(id);return `<div class="pcard" style="--c:${this.RC[p.r]}"><span class="x">${i.g?'\u2b50x'+i.g+' ':''}x${i.n}</span><div class="pe">${p.e}</div><b>${p.n}</b><div class="rr" style="color:${this.RC[p.r]}">${p.r}</div><small>\u26a1 ${f(p.pw*(i.g>0?3:1))} power</small><div class="pb" style="margin-top:8px"><button data-a="eq" data-v="${id}">${eq?'Unequip':'Equip'}</button>${i.n>=5?`<button data-a="evo" data-v="${id}" style="background:#ffb300">Evolve x5</button>`:''}</div></div>`}).join('')+'</div>':'<p>No pets yet. Hatch an egg!</p>')}
  else if(S.tab==='upg'){const U=[['cl','👆 Click Power','+1 coin per tap',S.cl,null],['au','\u23f1\ufe0f Auto Clicker','Earns coins every second',S.au,50],['lk','🍀 Lucky Hatch','Better odds for rare pets',S.lk,10],['sl','🐾 Pet Slots','Equip more pets',S.sl,6]];
   b='<div class="pgrid">'+U.map(u=>{const mx=u[4]&&u[3]>=u[4],c=this.cost(u[0]);return `<div class="pcard"><b>${u[1]}</b><div><small>${u[2]}</small></div><div style="margin:8px 0;font-size:20px">Level ${u[3]}</div><button data-a="up" data-v="${u[0]}" ${mx||S.c<c?'disabled':''}>${mx?'MAX':'🪙 '+f(c)}</button></div>`}).join('')+'</div>'}
  else{const all=Object.values(A),got=all.filter(p=>S.dex[p.id]).length;b=`<div class="cur" style="display:inline-block;margin-bottom:12px">Collected ${got}/${all.length}</div><div class="pgrid">`+all.map(p=>S.dex[p.id]?`<div class="pcard" style="--c:${this.RC[p.r]}"><div class="pe">${p.e}</div><b>${p.n}</b><div class="rr" style="color:${this.RC[p.r]}">${p.r}</div></div>`:`<div class="pcard dim"><div class="pe">\u2754</div><b>???</b></div>`).join('')+'</div>'}
  const dl=Date.now()-S.last>864e5;
  petview.innerHTML=`<div class="pt"><div class="ptb"><div class="cur">🪙 <b id="pc"></b></div><div class="cur">💎 <b id="pg"></b></div><div class="cur">\u26a1 <span id="pp"></span></div><button data-a="daily" ${dl?'':'disabled'}>🎁 ${dl?'Claim daily gift':'Daily gift claimed'}</button></div><div class="ptabs">${tabs.map(t=>`<button data-a="tab" data-v="${t[0]}" class="${S.tab===t[0]?'on':''}">${t[1]}</button>`).join('')}</div>${b}</div><div id="pto"></div>`;this.top()},
 start(){this.load();this.acc=0;this.sv=0;petview.onclick=e=>{const b=e.target.closest('[data-a]');if(b)this.act(b.dataset.a,b.dataset.v,e)};this.render()},
 update(dt){this.acc+=dt;this.sv+=dt;if(this.acc>=1){this.acc-=1;const c=this.cps();if(c){this.S.c+=c;this.top()}}if(this.sv>5){this.sv=0;this.save()}}};
