/* Game: Fishing Frenzy (id: fish) - card, menu info and game engine. */
GAMES.push({id:'fish',name:'Fishing Frenzy',tag:'Fishing',e:'🎣',c:['#29b6f6','#0d47a1'],hint:'Hold E (or the Cast button) to charge, release to cast into the water. When the bobber dips, press E fast, then hold E to keep the green bar on the fish. Sell your catch at the Fish Shop (F) to buy better rods and bait, travel to 3 locations, and fill your Fish Book. Fish change at night!'});
META.fish={c:'Casual',m:'Solo \u00b7 Social',t:['Fishing','Collect','Shop'],n:1};
ENG.fish={d3:true,noEmote:1,
 RAR:['Common','Uncommon','Rare','Epic','Legendary','Mythic'],RC:['#9aa0aa','#4caf50','#29b6f6','#b45cff','#ffb300','#ff4081'],
 LOCS:[['Sunset Lake',0,0],['Mushroom Swamp',300,0],['Coral Bay',-300,0]],
 FISH:[['minnow','Minnow','🐟',0,.1,.4,6,1,0],['bluegill','Bluegill','🐠',0,.2,.9,9,1,0],['perch','Perch','🐟',0,.3,1.2,12,1,0],['bass','Bass','🐟',1,1,4,30,1,0],['trout','Trout','🐟',1,1,5,36,1,0],['pike','Pike','🐟',2,3,12,90,1,0],['catfish','Catfish','🐟',2,4,18,110,1,0],['koi','Golden Koi','🐠',3,3,9,420,1,0],['serpent','Lake Serpent','🐉',4,20,60,2500,1,0],['sunfish','Sun Dragonfish','🐲',5,50,120,15000,1,0],
  ['tadpole','Tadpole','🐸',0,.05,.2,6,2,0],['mudfish','Mudfish','🐟',0,.5,2,10,2,0],['eel','Eel','🐍',1,1,5,34,2,0],['mcrab','Mushroom Crab','🦀',1,.5,2,38,2,0],['gar','Glow Gar','🐟',2,3,9,120,2,0],['frogking','Frog King','🐸',2,2,6,140,2,0],['gator','Swamp Gator','🐊',3,40,120,520,2,0],['ghost','Ghost Carp','👻',4,5,15,2800,2,1],['toadzilla','Toadzilla','🐸',5,60,150,16000,2,1],
  ['clown','Clownfish','🐠',0,.1,.4,8,4,0],['sardine','Sardine','🐟',0,.1,.3,7,4,0],['puffer','Pufferfish','🐡',1,.5,2,40,4,0],['octo','Octopus','🐙',1,2,8,45,4,0],['lobster','Lobster','🦞',2,1,5,150,4,0],['manta','Manta Ray','🐟',2,20,80,170,4,0],['shark','Shark','🦈',3,80,400,700,4,0],['whale','Blue Whale','🐋',4,2000,9000,3500,4,0],['kraken','Kraken','🦑',5,500,2000,20000,4,1]],
 RODS:[['Plastic Rod',0,0,.18,1],['Bamboo Rod',300,.1,.22,1.25],['Carbon Rod',1500,.25,.28,1.6],['Mythic Rod',8000,.5,.34,2.2],['Celestial Rod',40000,1,.42,3]],
 BAITS:[['Worm',15,.1,1.3],['Glow Bait',60,.3,1.6],['Golden Bait',250,.8,2.2]],MUT:[['',1],['Shiny',1.5],['Giant',2],['Albino',3]],
 load(){let d={};try{d=JSON.parse(localStorage.getItem('hubfish')||'{}')}catch(e){}this.D=Object.assign({m:0,rod:0,own:[1,0,0,0,0],bait:[0,0,0],be:-1,bag:[],book:{}},d)},
 save(){try{localStorage.setItem('hubfish',JSON.stringify(this.D))}catch(e){}},
 ex(){return{fs:({idle:0,charge:1,reel:3})[this.fst]||2,bb:this.bob&&['cast','wait','bite','reel'].includes(this.fst)?[Math.round(this.bob.position.x),Math.round(this.bob.position.z)]:null,cg:this.cg}},
 mkBob(){const g=new THREE.Group(),a=new THREE.Mesh(new THREE.SphereGeometry(.4,8,6),new THREE.MeshBasicMaterial({color:0xff3b30})),b=new THREE.Mesh(new THREE.SphereGeometry(.3,8,6),new THREE.MeshBasicMaterial({color:0xffffff}));b.position.y=.35;g.add(a,b);return g},
 rodOn(c){const g=new THREE.Group(),m=new THREE.Mesh(new THREE.CylinderGeometry(.06,.1,5,6),lam(0x6b4a2b));m.position.set(0,-4.4,0);g.add(m);g.visible=false;c.J.aR.add(g);c.rod=g},
 rem(c,q){const f=q.fs||0;if(f>0){c.J.aR.rotation.x=-1.1;if(!c.rod)this.rodOn(c);c.rod.visible=true}else if(c.rod)c.rod.visible=false;
  if(Array.isArray(q.bb)){if(!c.bob){c.bob=this.mkBob();scene.add(c.bob)}c.bob.visible=true;c.bob.position.set(q.bb[0],this.wy+.25+Math.sin(Date.now()/300+c.x)*.08,q.bb[1])}else if(c.bob)c.bob.visible=false;
  if(Array.isArray(q.cg)&&q.cg[0]>(c.lcg||0)){const first=c.lcg!==undefined;c.lcg=q.cg[0];if(first&&q.cg[3]>=3)logChat(cl(q.n)||'Player','caught a '+this.RAR[q.cg[3]]+' '+cl(q.cg[1])+' ('+q.cg[2]+' kg)!')}else if(c.lcg===undefined)c.lcg=Array.isArray(q.cg)?q.cg[0]:0},
 inWater(x,z){for(const l of this.LOCS){const dx=x-l[1],dz=z-l[2];if(Math.hypot(dx,dz)<23.5)return false;if(Math.abs(dx)<4.5&&dz>18&&dz<58)return false;if(Math.abs(dx)<8&&Math.abs(dz-58)<7)return false}return true},
 pick(dist){const D=this.D,rod=this.RODS[D.rod],bait=this.bu>=0?this.BAITS[this.bu]:null,L=rod[2]+(bait?bait[2]:0)+Math.min(.15,dist/400),pool=this.FISH.filter(f=>(f[7]&(1<<this.loc))&&(!f[8]||this.night)),ws=[70,22,6,1.6,.35,.05].map((v,i)=>v*Math.pow(1+L,i*1.1)),rs=[0,1,2,3,4,5].filter(r=>pool.some(f=>f[3]===r));
  let tot=0;rs.forEach(r=>{tot+=ws[r]});let x=Math.random()*tot,rar=rs[0];for(const r of rs){if((x-=ws[r])<0){rar=r;break}}
  const lst=pool.filter(f=>f[3]===rar),f=lst[Math.floor(Math.random()*lst.length)],kg=f[4]+(f[5]-f[4])*Math.pow(Math.random(),1.7),m=Math.random();return{f,kg:Math.round(kg*10)/10,mu:m<.01?3:m<.04?2:m<.12?1:0}},
 val(it){const f=this.FISH.find(x=>x[0]===it[0]);return Math.round(f[6]*(.7+.6*(it[1]-f[4])/Math.max(.01,f[5]-f[4]))*this.MUT[it[2]][1])},
 q(id){return document.getElementById(id)},msg(t){this.mtxt=t;this.mt=Date.now()/1000+2},
 reelIn(){this.q('reel').style.display='none';if(this.bob)this.bob.visible=false;this.line.visible=false},
 startReel(){const f=this.fish.f,rod=this.RODS[this.D.rod];this.fst='reel';Object.assign(this,{fp:.5,ft:.5,fto:0,bp:.5,bv:0,pr:.35,sp:.22+f[3]*.11+Math.min(.15,this.fish.kg/300),hw:Math.max(.07,rod[3]/2-f[3]*.008)});this.q('reel').style.display='block';this.q('rfi').textContent=f[2];this.q('rbar').style.width=(this.hw*200)+'%';snd(500,.1,'square',.1,700)},
 reelStep(dt,hold){this.bv+=(hold?2.6:-2.2)*dt;this.bv*=Math.max(0,1-2.4*dt);this.bp+=this.bv*dt;if(this.bp<this.hw){this.bp=this.hw;this.bv=Math.max(0,this.bv)}if(this.bp>1-this.hw){this.bp=1-this.hw;this.bv=Math.min(0,this.bv)}
  this.fto-=dt;if(this.fto<=0){this.ft=.05+Math.random()*.9;this.fto=.5+Math.random()}this.fp+=Math.sign(this.ft-this.fp)*Math.min(Math.abs(this.ft-this.fp),this.sp*dt*(1+Math.random()*.4));
  const ins=Math.abs(this.fp-this.bp)<this.hw;this.pr+=(ins?.28:-.2)*dt;
  this.q('rbar').style.left=((this.bp-this.hw)*100)+'%';this.q('rfi').style.left=(this.fp*100)+'%';this.q('rpg').firstChild.style.width=(this.pr*100)+'%';
  if(this.pr>=1)this.land();else if(this.pr<=0){this.msg('The fish escaped!');this.reelIn();this.fst='idle';snd(150,.3,'sawtooth',.1,60)}},
 land(){const D=this.D,{f,kg,mu}=this.fish,it=[f[0],kg,mu];D.bag.push(it);const b=D.book[f[0]]||(D.book[f[0]]={n:0,max:0}),neu=b.n===0;b.n++;b.max=Math.max(b.max,kg);this.save();this.cg=[++this.cgn,f[1],kg,f[3]];this.reelIn();this.fst='idle';
  const v=this.val(it),c=this.RC[f[3]],cd=this.q('fcard');cd.innerHTML=`<div class="fcd" style="border-color:${c}"><div class="fe">${f[2]}</div><b>${this.MUT[mu][0]?this.MUT[mu][0]+' ':''}${f[1]}</b><div style="color:${c};font-weight:800">${this.RAR[f[3]]}</div><div>${kg} kg \u00b7 $${v}</div>${neu?'<small style="color:#ffd23a">NEW CATCH!</small>':''}</div>`;cd.style.display='block';this.pop=Date.now()/1000+2.6;
  snd(f[3]>=3?1000:700,.4,'sine',.16,f[3]>=3?1800:1100);if(f[3]>=3){shk=.3;for(let i=0;i<8;i++)setTimeout(()=>{if(cur===this)fxBurst(this.P.x+(Math.random()-.5)*8,this.P.y+4+Math.random()*4,this.P.z+(Math.random()-.5)*8,[0xffd23a,0xff4081,0xb45cff][i%3])},i*80)}},
 shopHTML(){const D=this.D,t=this.tab||'sell',T=[['sell','💰 Sell'],['rods','🎣 Rods'],['bait','🪱 Bait'],['book','📖 Book']];let b='';
  if(t==='sell'){const tot=D.bag.reduce((a,i)=>a+this.val(i),0),g={};D.bag.forEach(i=>{g[i[0]]=(g[i[0]]||0)+1});b='<div class="fl">'+(D.bag.length?Object.keys(g).map(id=>{const f=this.FISH.find(x=>x[0]===id);return `<div class="fr"><span>${f[2]} ${f[1]}</span><b style="color:${this.RC[f[3]]}">${this.RAR[f[3]]}</b><span>x${g[id]}</span></div>`}).join(''):'<small>Your bag is empty. Go catch some fish!</small>')+`</div><button data-a="sell" ${D.bag.length?'':'disabled'}>Sell all (+$${fm(tot)})</button>`}
  else if(t==='rods')b='<div class="fl">'+this.RODS.map((r,i)=>`<div class="fr"><span><b>${r[0]}</b><br><small>Luck +${Math.round(r[2]*100)}% \u00b7 Control ${Math.round(r[3]*100)} \u00b7 Lure x${r[4]}</small></span>${D.own[i]?`<button data-a="eqrod" data-v="${i}" ${D.rod===i?'disabled':''}>${D.rod===i?'Equipped':'Equip'}</button>`:`<button data-a="buyrod" data-v="${i}" ${D.m<r[1]?'disabled':''}>$${fm(r[1])}</button>`}</div>`).join('')+'</div>';
  else if(t==='bait')b='<div class="fl">'+this.BAITS.map((r,i)=>`<div class="fr"><span><b>${r[0]}</b> <small>x${D.bait[i]}</small><br><small>Luck +${Math.round(r[2]*100)}% \u00b7 Lure x${r[3]}</small></span><span><button data-a="buybait" data-v="${i}" ${D.m<r[1]*5?'disabled':''}>Buy x5 $${r[1]*5}</button> <button data-a="eqbait" data-v="${i}">${D.be===i?'Unequip':'Equip'}</button></span></div>`).join('')+'</div>';
  else{const n=Object.keys(D.book).length;b=`<div class="fl"><small>Discovered ${n}/${this.FISH.length}</small>`+this.FISH.map(f=>{const k=D.book[f[0]];return k?`<div class="fr"><span>${f[2]} ${f[1]}</span><b style="color:${this.RC[f[3]]}">${this.RAR[f[3]]}</b><small>x${k.n} \u00b7 best ${k.max} kg</small></div>`:`<div class="fr" style="opacity:.4"><span>\u2754 ???</span><small>${['Lake','Swamp','','Bay'][f[7]===1?0:f[7]===2?1:3]}</small></div>`}).join('')+'</div>'}
  return `<div style="display:flex;justify-content:space-between;align-items:center"><b>🐟 Fish Shop \u00b7 $${fm(D.m)}</b><button data-a="close">\u2715</button></div><div class="ftabs" style="margin-top:8px">${T.map(x=>`<button data-a="tab" data-v="${x[0]}" class="${t===x[0]?'on':''}">${x[1]}</button>`).join('')}</div>${b}`},
 act(a,v){const D=this.D;
  if(a==='close'){this.shop=false;this.q('fshop').style.display='none';return}
  if(a==='tab')this.tab=v;
  else if(a==='sell'){const tot=D.bag.reduce((x,i)=>x+this.val(i),0);D.m+=tot;D.bag=[];snd(1000,.3,'sine',.14,1600)}
  else if(a==='buyrod'){const r=this.RODS[v];if(D.m>=r[1]){D.m-=r[1];D.own[v]=1;D.rod=+v;snd(900,.3,'sine',.14,1400)}}
  else if(a==='eqrod'){D.rod=+v}
  else if(a==='buybait'){const c=this.BAITS[v][1]*5;if(D.m>=c){D.m-=c;D.bait[v]+=5;D.be=+v;snd(700,.15,'sine',.12,1000)}}
  else if(a==='eqbait'){D.be=D.be===+v?-1:+v}
  this.save();this.q('fshop').innerHTML=this.shopHTML()},
 toggleShop(){this.shop=!this.shop;const p=this.q('fshop');p.style.display=this.shop?'block':'none';if(this.shop)p.innerHTML=this.shopHTML()},
 reset(){Object.assign(this.P,{x:0,y:1,z:36,vy:0});this.fst='idle';this.reelIn()},
 start(){
  this.load();baseScene(0x87c7ff);showOver('');yaw=Math.PI;this.pads=[];const S=this.S=[],G=new THREE.Group();scene.add(G);this.G=G;this.hemi=scene.children.find(o=>o.isHemisphereLight);
  const box=(w,h,d,x,z,c,y0)=>{y0=y0||0;const m=slab(w,h,d,x,y0+h/2,z,c);G.add(m);S.push({x,z,hw:w/2,hd:d/2,top:y0+h,bot:y0});return m},rs=mulb(51);
  this.wy=-1.2;this.col=new THREE.Color();this.c2=new THREE.Color();this.loc=0;this.fst='idle';this.cgn=0;this.cg=null;this.bu=-1;this.night=false;this.ep=false;this.fpv=false;this.shop=false;this.tab='sell';this.pcd=0;this.mt=0;this.pop=0;this.pw=0;this.pd=1;
  this.LOCS.forEach(([n,ox,oz],k)=>{const isl=new THREE.Mesh(new THREE.CylinderGeometry(22,24,6,32),lam([0x7fbf5a,0x5a7a3a,0xe8d8a0][k]));isl.position.set(ox,-3,oz);isl.receiveShadow=true;G.add(isl);S.push({x:ox,z:oz,r:22,top:0});
   box(7,.5,38,ox,oz+38,0x8a5a2b,-.5);box(14,.5,12,ox,oz+58,0x8a5a2b,-.5);
   for(let i=0;i<7;i++){const p=new THREE.Mesh(new THREE.CylinderGeometry(.35,.35,5,6),lam(0x5a3d28));p.position.set(ox+(i%2?3.2:-3.2),-2.5,oz+22+i*5.5);G.add(p)}
   for(let i=0;i<10;i++){const a=i*.62+k*2,r=12+rs()*8,x=ox+Math.cos(a)*r,z=oz-Math.abs(Math.sin(a))*r*.9,tr=new THREE.Mesh(new THREE.CylinderGeometry(.5,.7,4,6),lam(0x7a5230));tr.position.set(x,2,z);tr.castShadow=true;
    const lf=new THREE.Mesh(k===1?new THREE.ConeGeometry(2,3,8):new THREE.SphereGeometry(2.6,8,6),lam(k===1?0xd0453a:k===2?0x3fa34d:0x4caf50));lf.position.set(x,k===1?5:5.4,z);lf.castShadow=true;G.add(tr,lf)}
   const t=tag(n);t.scale.set(14,3.5,1);t.position.set(ox,9,oz+8);G.add(t);
   const pad=(x,z,to,lab,col)=>{const m=new THREE.Mesh(new THREE.CylinderGeometry(2.4,2.4,.3,20),new THREE.MeshBasicMaterial({color:col}));m.position.set(x,.2,z);G.add(m);const l=tag(lab);l.position.y=4;m.add(l);this.pads.push({x,z,to})};
   if(k===0){pad(14,-6,1,'\u2192 Swamp',0x3d6b4a);pad(14,4,2,'\u2192 Coral Bay',0x14b8c9)}else pad(ox+12,oz-4,0,'\u2190 Back to Lake',0xffd23a)});
  box(10,7,8,-16,-10,0xa0643c);G.add(slab(12,1,10,-16,7.5,-10,0x6b2e1e));
  const sv=AV;AV=Object.assign({},ZAVS[0],{skin:1,face:0,shirt:3,hat:OPT.hat.findIndex(h=>h[1]==='straw'),hair:OPT.hair.findIndex(h=>h[1]==='shortbk'),jacket:OPT.jacket.findIndex(h=>h[1]==='rain')});this.npc=newP(-12,0,-2);AV=sv;const nt=tag('Fish Shop (F)');nt.scale.set(9,2.2,1);nt.position.y=7.2;this.npc.g.add(nt);
  this.water=new THREE.Mesh(new THREE.PlaneGeometry(300,300,50,50),new THREE.MeshLambertMaterial({color:0x2a7fd4,transparent:true,opacity:.85}));this.water.rotation.x=-Math.PI/2;scene.add(this.water);
  this.bob=this.mkBob();this.bob.visible=false;scene.add(this.bob);const lg=new THREE.BufferGeometry();lg.setAttribute('position',new THREE.BufferAttribute(new Float32Array(6),3));this.line=new THREE.Line(lg,new THREE.LineBasicMaterial({color:0xffffff}));this.line.frustumCulled=false;this.line.visible=false;scene.add(this.line);
  this.P=newP(0,1,36);this.rodOn(this.P);
  this.w=gw('<div id="fhud"><div id="fpw"><i></i></div><button id="fbtn">🎣 Cast</button></div><div id="reel"><div id="rtr"><div id="rbar"></div><div id="rfi">🐟</div></div><div id="rpg"><i></i></div><small>Hold E (or the button) to move the green bar right</small></div><div id="fcard"></div><div id="fshop"></div>');
  const fb=this.q('fbtn');fb.onpointerdown=e=>{e.preventDefault();keys.KeyE=true};['pointerup','pointerleave','pointercancel'].forEach(v=>fb.addEventListener(v,()=>{keys.KeyE=false}));
  this.q('fshop').onclick=e=>{const b=e.target.closest('[data-a]');if(b)this.act(b.dataset.a,b.dataset.v)}},
 update(dt){
  const P=this.P,T=Date.now()/1000,D=this.D,rod=this.RODS[D.rod],fx=-Math.sin(yaw),fz=-Math.cos(yaw);
  const dl=(Math.sin(T/300*6.283)+1)/2;this.night=dl<.3;this.col.setHex(0x0a0f2a).lerp(this.c2.setHex(0x87c7ff),Math.min(1,dl*1.4));scene.background.copy(this.col);scene.fog.color.copy(this.col);this.hemi.intensity=.22+.5*dl;sun.intensity=.08+.55*dl;
  let k=0,bd=1e9;this.LOCS.forEach((l,i)=>{const d=Math.hypot(P.x-l[1],P.z-l[2]);if(d<bd){bd=d;k=i}});this.loc=k;this.water.material.color.setHex([0x2a7fd4,0x3d6b4a,0x14b8c9][k]);
  const wx=Math.round(P.x/5)*5,wz=Math.round(P.z/5)*5,pa=this.water.geometry.attributes.position;this.water.position.set(wx,this.wy,wz);for(let i=0;i<pa.count;i++){const X=wx+pa.getX(i),Z=wz-pa.getY(i);pa.setZ(i,Math.sin(X*.12+T*1.4)*.22+Math.cos(Z*.1+T*1.1)*.2)}pa.needsUpdate=true;
  const eD=!!keys.KeyE,eP=eD&&!this.ep,eU=!eD&&this.ep;this.ep=eD;const fP=!!keys.KeyF&&!this.fpv;this.fpv=!!keys.KeyF;
  npcTick(this.npc,P,dt);this.npc.g.visible=k===0;
  const nearNpc=k===0&&Math.hypot(P.x+12,P.z+2)<7;if(fP&&this.fst==='idle'&&nearNpc)this.toggleShop();if(this.shop&&!nearNpc)this.toggleShop();
  const busy=this.fst!=='idle'||this.shop;
  if(busy){P.hs=0;P.emote=null;P.t+=dt;animate(P,dt);orbitCam(P)}else ctrl(P,dt,this.S);
  P.rod.visible=this.fst!=='idle';if(this.fst!=='idle')P.J.aR.rotation.x=-1.1;
  this.pcd-=dt;if(this.fst==='idle'&&this.pcd<=0)for(const p of this.pads)if(Math.hypot(P.x-p.x,P.z-p.z)<2.6){const L=this.LOCS[p.to];Object.assign(P,{x:L[1],y:1,z:L[2]+(p.to===0?12:6),vy:0});this.pcd=1.5;snd(400,.3,'sine',.12,900);break}
  const st=this.fst;
  if(st==='idle'){if(eP&&!this.shop&&P.gr){this.fst='charge';this.pw=0;this.pd=1;snd(300,.1,'sine',.08,500)}}
  else if(st==='charge'){this.pw+=this.pd*dt*1.1;if(this.pw>=1){this.pw=1;this.pd=-1}if(this.pw<=0){this.pw=0;this.pd=1}P.yaw=yaw+Math.PI;
   if(eU){const dist=12+this.pw*46,tx=P.x+fx*dist,tz=P.z+fz*dist;if(!this.inWater(tx,tz)){this.msg('Cast into open water!');this.fst='idle'}else{this.bu=D.be>=0&&D.bait[D.be]>0?D.be:-1;if(this.bu>=0)D.bait[this.bu]--;this.save();this.tgt={x:tx,z:tz,d:dist};this.ct=0;this.fst='cast';this.bob.visible=true;this.line.visible=true;snd(500,.25,'sine',.12,200)}}}
  else if(st==='cast'){this.ct+=dt;const u=Math.min(1,this.ct/.7);this.bob.position.set(P.x+(this.tgt.x-P.x)*u,this.wy+.25+Math.sin(u*Math.PI)*8,P.z+(this.tgt.z-P.z)*u);P.yaw=yaw+Math.PI;
   if(u>=1){this.fst='wait';this.tw=(3+Math.random()*8)/(rod[4]*(this.bu>=0?this.BAITS[this.bu][3]:1));fxBurst(this.tgt.x,this.wy,this.tgt.z,0xffffff);snd(180,.2,'sine',.1,80)}}
  else if(st==='wait'){this.tw-=dt;this.bob.position.y=this.wy+.25+Math.sin(T*3)*.08;if(eP){this.fst='idle';this.reelIn()}else if(this.tw<=0){this.fst='bite';this.tb=1.4;this.fish=this.pick(this.tgt.d);fxBurst(this.tgt.x,this.wy,this.tgt.z,0xffffff);snd(900,.15,'square',.1,1400)}}
  else if(st==='bite'){this.tb-=dt;this.bob.position.y=this.wy-.2+Math.sin(T*30)*.15;if(eP)this.startReel();else if(this.tb<=0){this.msg('It got away...');this.fst='idle';this.reelIn()}}
  else if(st==='reel')this.reelStep(dt,eD||keys.Space);
  if(this.fst!=='idle'&&this.fst!=='charge'){const a=this.line.geometry.attributes.position,b=this.bob.position;a.setXYZ(0,P.x+fx*3.5,P.y+5.6,P.z+fz*3.5);a.setXYZ(1,b.x,b.y,b.z);a.needsUpdate=true}
  this.q('fpw').style.display=this.fst==='charge'?'block':'none';this.q('fpw').firstChild.style.width=(this.pw*100)+'%';this.q('fbtn').textContent=this.fst==='idle'?'🎣 Cast':this.fst==='charge'?'Release!':this.fst==='bite'?'\u2757 REEL!':this.fst==='reel'?'Hold!':'Wait...';
  if(this.pop&&T>this.pop){this.q('fcard').style.display='none';this.pop=0}
  setB(this.fst==='bite'?'\u2757 A fish is biting! Press E!':T<this.mt?this.mtxt:this.fst==='wait'?'Waiting for a bite... (E to reel in)':nearNpc&&!this.shop?'F: open the Fish Shop':'');
  const bait=D.be>=0?this.BAITS[D.be][0]+' x'+D.bait[D.be]:'no bait';scoreEl.textContent='$'+fm(D.m)+' \u00b7 🎒 '+D.bag.length+' \u00b7 '+rod[0]+' \u00b7 '+bait+' \u00b7 '+this.LOCS[k][0]+' '+(this.night?'🌙':'\u2600\ufe0f')}};
