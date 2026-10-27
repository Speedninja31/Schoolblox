/* Game: Garden Grove (id: garden) - card, menu info and game engine. */
GAMES.push({id:'garden',name:'Garden Grove',tag:'Farming',e:'🌱',c:['#7ed957','#2e7d32'],hint:'Buy seeds at the Seed Shop (stock changes every 2.5 minutes), then walk into your big garden bed and press E anywhere on the soil to plant (a green ring shows the spot). Press E near a plant to water it, and E again to harvest when ripe. Sell crops at the stand. Press 1-9 to pick a seed. Rain makes plants grow faster. Visit friends\' gardens too!'});
META.garden={c:'Casual',m:'Solo \u00b7 Social',t:['Farming','Idle','Seeds'],n:1};
ENG.garden={d3:true,noEmote:1,
 CROPS:[['carrot','Carrot','🥕',10,30,25,.3,0xff8a1f,'cone',1,12],['strawberry','Strawberry','🍓',50,60,130,.2,0xe0352b,'sphere',.9,10],['blueberry','Blueberry','🫐',400,90,900,.1,0x3a5fcb,'sphere',.7,8],['tomato','Tomato','🍅',800,120,2000,.4,0xe53935,'sphere',.6,6],['corn','Corn','🌽',1500,150,4000,.8,0xffd23a,'tall',.5,5],['pumpkin','Pumpkin','🎃',3000,200,9000,3,0xff7a1a,'big',.35,4],['watermelon','Watermelon','🍉',6500,260,20000,6,0x3f9e4a,'big',.25,3],['sunflower','Sunflower','🌻',12000,300,36000,1,0xffc400,'flower',.18,2],['dragon','Dragon Fruit','🐉',30000,420,90000,1.5,0xff4f9a,'sphere',.08,1],['mango','Golden Mango','🥭',75000,600,240000,2,0xffb300,'sphere',.04,1]],
 load(){let d={};try{d=JSON.parse(localStorage.getItem('hubgarden')||'{}')}catch(e){}this.D=Object.assign({m:100,seeds:{0:3},tiles:[],cap:16,bag:[],sel:0,bt:{r:-1,c:{}}},d);const D=this.D;
  if(D.v!==2){const old=Array.isArray(D.tiles)?D.tiles:[];D.tiles=[];old.forEach((t,i)=>{if(t&&typeof t.c==='number')D.tiles.push(Object.assign({},t,{x:((i%5)-2)*6,z:(Math.floor(i/5)-1.5)*6}))});D.cap=Math.max(16,(D.un||8)*2);D.v=2}
  if(!Array.isArray(D.tiles))D.tiles=[]},
 save(){try{localStorage.setItem('hubgarden',JSON.stringify(this.D))}catch(e){}},
 pc(k){return[Math.cos(k*.785)*85,Math.sin(k*.785)*85]},code(t){return(Math.round(t.x*2)+40)*100+(Math.round(t.z*2)+40)},
 prog(t,n){return Math.max(0,(n-t.t)/(this.CROPS[t.c][4]*1000))},stage(t,n){const p=this.prog(t,n);return p<.25?0:p<.5?1:p<1?2:3},
 gdc(){const n=Date.now();return this.D.tiles.map(t=>[this.code(t),t.c*4+this.stage(t,n)])},
 ex(){return{sl:this.slot,gd:this.gdc()}},
 cm(ci,st,code){const C=this.CROPS[ci],g=new THREE.Group(),s=[.3,.55,.8,1][st],sh=C[8],fl=sh==='flower'?2.5:1,rr=mulb((code|0)+ci*7),ripe=st===3;
  const stem=new THREE.Mesh(new THREE.CylinderGeometry(.08,.12,1.2*s*fl,6),lam(0x3f9e4a));stem.position.y=.6*s*fl;g.add(stem);
  for(let i=0;i<4;i++){const a=i*1.57+rr()*.8,lf=new THREE.Mesh(new THREE.SphereGeometry(.5*s,8,6),lam(i%2?0x4caf50:0x3f9e4a));lf.position.set(Math.cos(a)*.55*s,.35*s,Math.sin(a)*.55*s);lf.scale.y=.45;g.add(lf)}
  if(st>=2){const n=(sh==='sphere'||sh==='cone')?(ripe?4:2):(sh==='tall'&&ripe?2:1),off=[[0,0],[.55,.3],[-.5,-.35],[.1,.7]];
   for(let i=0;i<n;i++){const k=i?.8:1,f=new THREE.Mesh(sh==='cone'?new THREE.ConeGeometry(.45*s*k,1.3*s*k,8):sh==='tall'?new THREE.CylinderGeometry(.35*s*k,.35*s*k,2.2*s*k,8):sh==='flower'?new THREE.CylinderGeometry(s,s,.25,14):new THREE.SphereGeometry((sh==='big'?1.2:.6)*s*k,10,8),lam(ripe?C[7]:0xb7d98a)),
    y=sh==='cone'?.3*s:sh==='tall'?1.3*s:sh==='flower'?3*s:(sh==='big'?.9:.7)*s;f.position.set(off[i][0]*s*(sh==='tall'?1.1:1),y+(i&&sh!=='tall'?-.1*s:0),off[i][1]*s);if(sh==='cone')f.rotation.x=Math.PI;if(sh==='flower')f.rotation.x=1.4;if(ripe)f.material.emissive.setHex(0x222222);g.add(f)}}
  g.rotation.y=rr()*6.28;g.traverse(o=>{if(o.isMesh)o.castShadow=true});return g},
 sync(k,list){const pm=this.pm[k],[cx,cz]=this.pc(k);for(const code in pm)if(!list.has(+code)){scene.remove(pm[code].g);delete pm[code]}
  list.forEach((e,code)=>{const c=pm[code];if(!c||c.c!==e[0]||c.s!==e[1]){if(c)scene.remove(c.g);const g=this.cm(e[0],e[1],code);g.position.set(cx+(Math.floor(code/100)-40)/2,.17,cz+(code%100-40)/2);scene.add(g);pm[code]={g,c:e[0],s:e[1]}}})},
 owned(){return Object.keys(this.D.seeds).filter(i=>this.D.seeds[i]>0).map(Number)},
 stock(){const T=Date.now()/1000,r=Math.floor(T/150),D=this.D;if(D.bt.r!==r)D.bt={r,c:{}};const rg=mulb(r*7+3);return this.CROPS.map((C,i)=>{const q=rg()<C[9]?1+Math.floor(rg()*C[10]):0;return Math.max(0,q-(D.bt.c[i]||0))})},
 bar(){const D=this.D,o=this.owned();if(!o.includes(D.sel)&&o.length)D.sel=o[0];this.q('gbar').innerHTML=o.length?o.map((i,n)=>`<div class="gs ${i===D.sel?'on':''}">${this.CROPS[i][2]}<small>${n+1} \u00b7 x${D.seeds[i]}</small></div>`).join(''):'<div class="gs">🌱<small>Buy seeds at the shop!</small></div>'},
 q(id){return document.getElementById(id)},
 shopHTML(){const D=this.D,st=this.stock(),ex=Math.round(500*Math.pow(2.2,(D.cap-16)/8));
  return `<div style="display:flex;justify-content:space-between;align-items:center"><b>🌱 Seed Shop \u00b7 $${fm(D.m)}</b><button data-a="close">\u2715</button></div><small>Stock refreshes every 2.5 minutes.</small><div class="fl">`+this.CROPS.map((C,i)=>`<div class="fr"><span>${C[2]} <b>${C[1]}</b><br><small>${C[4]}s grow \u00b7 sells ~$${fm(C[5])}</small></span><span><small>${st[i]} left</small> <button data-a="buy" data-v="${i}" ${st[i]<1||D.m<C[3]?'disabled':''}>$${fm(C[3])}</button></span></div>`).join('')+`</div><button data-a="expand" ${D.cap>=64||D.m<ex?'disabled':''}>${D.cap>=64?'Garden fully expanded':'Expand garden +8 plants ($'+fm(ex)+')'}</button><small>Plants: ${D.tiles.length}/${D.cap}</small>`},
 act(a,v){const D=this.D;
  if(a==='close'){this.shop=false;this.q('gshop').style.display='none';return}
  if(a==='buy'){const C=this.CROPS[v],st=this.stock();if(st[v]>0&&D.m>=C[3]){D.m-=C[3];D.seeds[v]=(D.seeds[v]||0)+1;D.bt.c[v]=(D.bt.c[v]||0)+1;snd(800,.12,'sine',.12,1200)}}
  else if(a==='expand'){const ex=Math.round(500*Math.pow(2.2,(D.cap-16)/8));if(D.cap<64&&D.m>=ex){D.m-=ex;D.cap+=8;snd(700,.3,'sine',.14,1300)}}
  this.save();this.q('gshop').innerHTML=this.shopHTML();this.bar()},
 toggleShop(){this.shop=!this.shop;const p=this.q('gshop');p.style.display=this.shop?'block':'none';if(this.shop)p.innerHTML=this.shopHTML()},
 home(){if(this.slot<0)return;const[cx,cz]=this.pc(this.slot);Object.assign(this.P,{x:cx,y:1,z:cz+21,vy:0})},
 reset(){this.home()},
 start(){
  this.load();baseScene(0x87c7ff);showOver('');const S=this.S=[{x:0,z:0,r:135,top:0}],G=new THREE.Group();scene.add(G);this.G=G;this.hemi=scene.children.find(o=>o.isHemisphereLight);
  const gr=new THREE.Mesh(new THREE.CylinderGeometry(135,135,6,48),tmat(0x78c850,'grass',44));gr.position.y=-3;gr.receiveShadow=true;G.add(gr);const pth=new THREE.Mesh(new THREE.CylinderGeometry(40,40,.2,40),tmat(0xe8d8a0,'sand',16));pth.position.y=.1;pth.receiveShadow=true;G.add(pth);
  const box=(w,h,d,x,z,c,y0)=>{y0=y0||0;const m=slab(w,h,d,x,y0+h/2,z,c);G.add(m);S.push({x,z,hw:w/2,hd:d/2,top:y0+h,bot:y0});return m},rs=mulb(61);
  box(10,7,8,-14,-22,0xa0643c).material=tmat(0xa0643c,'brick',2);G.add(slab(12,1,10,-14,7.5,-22,0x6b2e1e));box(10,3,5,14,-22,0xd9a441).material=tmat(0xd9a441,'wood',2);G.add(slab(11,.6,6,14,3.3,-22,0xe0352b));
  box(8,1.5,8,0,0,0x888d96);const fo=new THREE.Mesh(new THREE.CylinderGeometry(3,3,.3,20),new THREE.MeshBasicMaterial({color:0x4aa8ff}));fo.position.y=1.7;G.add(fo);
  const mk=o=>{const a={};for(const k in OPT)a[k]=0;return Object.assign(a,o)},sv=AV;
  AV=mk({skin:1,shirt:5,hat:OPT.hat.findIndex(h=>h[1]==='straw'),hair:OPT.hair.findIndex(h=>h[1]==='shortbr'),jacket:OPT.jacket.findIndex(h=>h[1]==='overall')});this.n1=newP(-14,0,-14);AV=mk({skin:2,shirt:3,hat:13,hair:OPT.hair.findIndex(h=>h[1]==='ponyr'),jacket:OPT.jacket.findIndex(h=>h[1]==='cardi')});this.n2=newP(14,0,-14);AV=sv;
  [[this.n1,'Seed Shop (E)'],[this.n2,'Sell Crops (E)']].forEach(([n,t])=>{const l=tag(t);l.scale.set(9,2.2,1);l.position.y=7.2;n.g.add(l)});
  this.pm=[];this.sg=[];this.ow=[];const sl=(w,h,d,x,y,z,c,k,rep)=>{const m=slab(w,h,d,x,y,z,c);m.material=tmat(c,k,rep);G.add(m);return m};
  for(let k=0;k<8;k++){const[cx,cz]=this.pc(k);sl(40,.24,36,cx,0,cz,0x6aa84f,'grass',8);sl(32,.3,28,cx,.02,cz,0x6b4a2b,'dirt',5);
   [-1,1].forEach(q=>{sl(33.4,.7,.7,cx,.3,cz+q*14.35,0x8a5a2b,'wood',1);sl(.7,.7,29,cx+q*16.35,.3,cz,0x8a5a2b,'wood',1)});this.pm[k]={};
   const sg=tag('Empty plot');sg.scale.set(10,2.5,1);sg.position.set(cx,7,cz-17);scene.add(sg);this.sg[k]=sg;this.ow[k]=''}
  for(let i=0;i<26;i++){const a=rs()*6.283,r=108+rs()*20,x=Math.cos(a)*r,z=Math.sin(a)*r,tr=new THREE.Mesh(new THREE.CylinderGeometry(.7,.9,5,7),lam(0x7a5230)),lf=new THREE.Mesh(new THREE.SphereGeometry(3.6,10,8),lam(0x3fa34d));tr.position.set(x,2.5,z);lf.position.set(x,7,z);tr.castShadow=lf.castShadow=true;G.add(tr,lf)}
  const rp=new Float32Array(900),r0=mulb(9);for(let i=0;i<300;i++){rp[i*3]=(r0()-.5)*90;rp[i*3+1]=r0()*60;rp[i*3+2]=(r0()-.5)*90}const rg=new THREE.BufferGeometry();rg.setAttribute('position',new THREE.BufferAttribute(rp,3));this.rain=new THREE.Points(rg,new THREE.PointsMaterial({color:0x8ab4ff,size:1.1}));this.rain.visible=false;this.rain.frustumCulled=false;scene.add(this.rain);
  this.gh=new THREE.Mesh(new THREE.RingGeometry(.6,.85,24),new THREE.MeshBasicMaterial({color:0x7cfc6a,transparent:true,opacity:.75,side:THREE.DoubleSide}));this.gh.rotation.x=-Math.PI/2;this.gh.visible=false;scene.add(this.gh);this.slot=-1;this.shop=false;this.ep=false;this.wasRain=false;this.col=new THREE.Color();this.c2=new THREE.Color();this.P=newP(0,1,14);
  this.w=gw('<div id="gbar"></div><div id="gshop"></div><div style="position:absolute;right:14px;bottom:70px;display:flex;flex-direction:column;gap:6px;z-index:6"><button class="gbtn" id="gh1">🏡 My Garden</button><button class="gbtn" id="gh2">🏪 Shop</button></div>');
  this.q('gshop').onclick=e=>{const b=e.target.closest('[data-a]');if(b)this.act(b.dataset.a,b.dataset.v)};this.q('gh1').onclick=()=>this.home();this.q('gh2').onclick=()=>Object.assign(this.P,{x:0,y:1,z:-12,vy:0});this.bar();npcTick(this.n1,this.P,.016);npcTick(this.n2,this.P,.016)},
 update(dt){
  const P=this.P,D=this.D,T=Date.now()/1000,now=Date.now(),peers=[...RM.values()],rain=(T%240)>=180;npcTick(this.n1,P,dt);npcTick(this.n2,P,dt);
  const used=new Map();for(const c of peers){const q=c.q;if(q&&Number.isInteger(q.sl)&&q.sl>=0&&q.sl<8)used.set(q.sl,c.pid)}
  if(this.slot<0||(used.has(this.slot)&&used.get(this.slot)<myId)){let f=-1;for(let k=0;k<8;k++)if(!used.has(k)){f=k;break}if(f>=0&&f!==this.slot){this.slot=f;this.home()}else if(f<0)this.slot=-1}
  if(rain!==this.wasRain){this.wasRain=rain;if(rain)reveal('IT\u2019S RAINING','#8ab4ff','Plants grow faster!')}
  const gray=rain?.35:0;this.col.setHex(0x87c7ff).lerp(this.c2.setHex(0x6e7b8f),gray);scene.background.copy(this.col);scene.fog.color.copy(this.col);this.hemi.intensity=rain?.45:.5;
  this.rain.visible=rain;if(rain){const a=this.rain.geometry.attributes.position;for(let i=0;i<a.count;i++){let y=a.getY(i)-70*dt;if(y<0)y+=60;a.setY(i,y)}a.needsUpdate=true;this.rain.position.set(P.x,0,P.z);D.tiles.forEach(t=>{if(t)t.t-=dt*500})}
  const eP=!!keys.KeyE&&!this.ep;this.ep=!!keys.KeyE;
  for(let i=1;i<=9;i++)if(keys['Digit'+i]&&!this['dk'+i]){const o=this.owned();if(o[i-1]!==undefined){D.sel=o[i-1];this.bar()}}for(let i=1;i<=9;i++)this['dk'+i]=!!keys['Digit'+i];
  if(this.shop)orbitCam(P),P.hs=0,P.t+=dt,animate(P,dt);else ctrl(P,dt,this.S);
  const nS=Math.hypot(P.x+14,P.z+22)<12,nM=Math.hypot(P.x-14,P.z+22)<12;
  if(this.shop&&!nS)this.toggleShop();
  let near=-1,spot=null,full=false;this.gh.visible=false;if(this.slot>=0){const[cx,cz]=this.pc(this.slot),lx=P.x-cx,lz=P.z-cz;let bd=2.6;D.tiles.forEach((t,i)=>{const d=Math.hypot(lx-t.x,lz-t.z);if(d<bd){bd=d;near=i}});
   if(near<0&&Math.abs(lx)<=15.2&&Math.abs(lz)<=13.2){if(D.tiles.length>=D.cap)full=true;else{spot=[Math.max(-15,Math.min(15,Math.round(lx*2)/2)),Math.max(-13,Math.min(13,Math.round(lz*2)/2))];if(!this.shop&&D.seeds[D.sel]>0){this.gh.visible=true;this.gh.position.set(cx+spot[0],.2,cz+spot[1])}}}}
  let prompt='';
  if(nS&&!this.shop)prompt='E: open the Seed Shop';else if(nM){const tot=D.bag.reduce((a,i)=>a+this.val(i),0);prompt=D.bag.length?'E: sell all crops (+$'+fm(tot)+')':'Nothing to sell yet'}
  else if(near>=0){const t=D.tiles[near],p=this.prog(t,now);prompt=p>=1?'E: harvest '+this.CROPS[t.c][1]:'E: water '+this.CROPS[t.c][1]+' ('+Math.floor(p*100)+'%)'}
  else if(spot)prompt=D.seeds[D.sel]>0?'E: plant '+this.CROPS[D.sel][1]+' here ('+D.tiles.length+'/'+D.cap+')':'Buy seeds at the Seed Shop first';
  else if(full)prompt='Garden full - expand it at the Seed Shop'
  if(eP&&!this.shop){
   if(nS)this.toggleShop();
   else if(nM){const tot=D.bag.reduce((a,i)=>a+this.val(i),0);if(D.bag.length){D.m+=tot;D.bag=[];snd(1000,.3,'sine',.14,1600);reveal('+$'+fm(tot),'#3ddc84','Crops sold!');this.save()}}
   else if(near>=0){const t=D.tiles[near],[cx,cz]=this.pc(this.slot),wx=cx+t.x,wz=cz+t.z;
    if(this.prog(t,now)>=1){const m=Math.random(),mu=m<.003?10:m<.015?5:rain?1.5:1;D.bag.push([t.c,t.kg,mu]);D.tiles.splice(near,1);fxBurst(wx,2,wz,this.CROPS[t.c][7]);snd(900,.2,'sine',.14,1400);if(mu>=5)reveal(mu===10?'RAINBOW!':'GOLDEN!',mu===10?'#ff4081':'#ffd23a',this.CROPS[t.c][1]+' x'+mu);this.save()}
    else if(!t.w||now-t.w>15000){t.w=now;t.t-=this.CROPS[t.c][4]*100;fxBurst(wx,2,wz,0x4aa8ff);snd(500,.2,'sine',.08,300);this.save()}}
   else if(spot&&D.seeds[D.sel]>0){const C=this.CROPS[D.sel],[cx,cz]=this.pc(this.slot);D.seeds[D.sel]--;D.tiles.push({c:D.sel,t:now,kg:Math.round(C[6]*(.8+Math.random()*.7)*100)/100,x:spot[0],z:spot[1]});fxBurst(cx+spot[0],1,cz+spot[1],0x8b5a2b);snd(300,.1,'sine',.1,500);this.bar();this.save()}}
  if(this.slot>=0){const m=new Map();D.tiles.forEach(t=>m.set(this.code(t),[t.c,this.stage(t,now)]));this.sync(this.slot,m)}
  const seen=new Set();for(const c of peers){const q=c.q;if(!q||!Number.isInteger(q.sl)||q.sl<0||q.sl>7||q.sl===this.slot||!Array.isArray(q.gd))continue;seen.add(q.sl);const m=new Map();for(const e of q.gd.slice(0,70)){if(!Array.isArray(e))continue;const cd=e[0]|0,v=e[1]|0,x2=Math.floor(cd/100)-40,z2=cd%100-40;if(Math.abs(x2)<=30&&Math.abs(z2)<=26&&v>=0&&v<40)m.set(cd,[v>>2,v&3])};this.sync(q.sl,m)}
  for(let k=0;k<8;k++){if(k!==this.slot&&!seen.has(k))this.sync(k,new Map());const nm=k===this.slot?'Your Garden':used.has(k)?String((RM.get([...RM.keys()].find(id=>id===used.get(k)))||{q:{}}).q.n||'Player').replace(/[^\w ]/g,'').slice(0,12)+'\u2019s Garden':'Empty plot';
   if(nm!==this.ow[k]){this.ow[k]=nm;const[cx,cz]=this.pc(k);scene.remove(this.sg[k]);const t=tag(nm);t.scale.set(10,2.5,1);t.position.set(cx,7,cz-17);scene.add(t);this.sg[k]=t}}
  setB(this.shop?'':prompt);scoreEl.textContent='$'+fm(D.m)+' \u00b7 🎒 '+D.bag.length+' crops \u00b7 '+(rain?'🌧\ufe0f Rain':'\u2600\ufe0f Clear')+(this.slot<0?' \u00b7 spectating (all plots taken)':'')},
 val(it){const C=this.CROPS[it[0]];return Math.round(C[5]*(it[1]/C[6])*it[2])}};
