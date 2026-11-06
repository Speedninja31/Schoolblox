/* Game: Fishing Frenzy (id: fish) - card, menu info and game engine.
   v2: 3D fish you can see swimming, nibbling + biting, real rod/boat/hut models, NPC shopkeepers with requests,
   ambient anglers, angler levels, weather, day/night, junk + treasure, bigger bags.
   Everything for this game lives in this file; the helpers are private inside the function below. */
GAMES.push({id:'fish',name:'Fishing Frenzy',tag:'Fishing',e:'🎣',c:['#29b6f6','#0d47a1'],hint:'Hold E (or the Cast button) to charge, release to cast - the gold zone is a Perfect Cast. Fish are really swimming out there: cast near one to lure it. It will nibble first. When the bobber dips and the ! shows, press E fast, then hold E to keep the green bar on the fish. Sell your catch to the shopkeepers (F), do their requests, level up, buy better rods and bait, and fill your Fish Book across 3 islands. Fish change at night and when it rains!'});
META.fish={c:'Casual',m:'Solo \u00b7 Social',t:['Fishing','Collect','Shop'],n:1};
ENG.fish=(()=>{
const RAR=['Common','Uncommon','Rare','Epic','Legendary','Mythic'],RC=['#9aa0aa','#4caf50','#29b6f6','#b45cff','#ffb300','#ff4081'],RCH=RC.map(c=>parseInt(c.slice(1),16));
const LOCS=[['Sunset Lake',0,0],['Mushroom Swamp',300,0],['Coral Bay',-300,0]];
const FISH=[['minnow','Minnow','🐟',0,.1,.4,6,1,0],['bluegill','Bluegill','🐠',0,.2,.9,9,1,0],['perch','Perch','🐟',0,.3,1.2,12,1,0],['bass','Bass','🐟',1,1,4,30,1,0],['trout','Trout','🐟',1,1,5,36,1,0],['pike','Pike','🐟',2,3,12,90,1,0],['catfish','Catfish','🐟',2,4,18,110,1,0],['koi','Golden Koi','🐠',3,3,9,420,1,0],['serpent','Lake Serpent','🐉',4,20,60,2500,1,0],['sunfish','Sun Dragonfish','🐲',5,50,120,15000,1,0],
 ['tadpole','Tadpole','🐸',0,.05,.2,6,2,0],['mudfish','Mudfish','🐟',0,.5,2,10,2,0],['eel','Eel','🐍',1,1,5,34,2,0],['mcrab','Mushroom Crab','🦀',1,.5,2,38,2,0],['gar','Glow Gar','🐟',2,3,9,120,2,0],['frogking','Frog King','🐸',2,2,6,140,2,0],['gator','Swamp Gator','🐊',3,40,120,520,2,0],['ghost','Ghost Carp','👻',4,5,15,2800,2,1],['toadzilla','Toadzilla','🐸',5,60,150,16000,2,1],
 ['clown','Clownfish','🐠',0,.1,.4,8,4,0],['sardine','Sardine','🐟',0,.1,.3,7,4,0],['puffer','Pufferfish','🐡',1,.5,2,40,4,0],['octo','Octopus','🐙',1,2,8,45,4,0],['lobster','Lobster','🦞',2,1,5,150,4,0],['manta','Manta Ray','🐟',2,20,80,170,4,0],['shark','Shark','🦈',3,80,400,700,4,0],['whale','Blue Whale','🐋',4,2000,9000,3500,4,0],['kraken','Kraken','🦑',5,500,2000,20000,4,1]];
const RODS=[['Plastic Rod',0,0,.18,1],['Bamboo Rod',300,.1,.22,1.25],['Carbon Rod',1500,.25,.28,1.6],['Mythic Rod',8000,.5,.34,2.2],['Celestial Rod',40000,1,.42,3]];
const RODC=[[0xc9d1d9,0xe0352b,null],[0xd9b25f,0x3a8a3a,null],[0x2b2f36,0x29b6f6,0x0a3a55],[0x8a4fe0,0xffd23a,0x3a1670],[0xfff3a0,0xff4081,0x703a50]];
const BAITS=[['Worm',15,.1,1.3],['Glow Bait',60,.3,1.6],['Golden Bait',250,.8,2.2]],MUT=[['',1],['Shiny',1.5],['Giant',2],['Albino',3]];
const CAPS=[25,40,60,100],CAPC=[400,2500,12000];
const SPC={boot:['Old Boot','🥾',3,0],can:['Tin Can','🥫',2,0],chest:['Treasure Chest','🧰',0,1]};
const BEH={dart:['minnow','sardine','frogking','clown','bluegill','puffer'],power:['shark','whale','kraken','gator','toadzilla','sunfish','serpent','manta','catfish','pike']};
/* species look: [shape, body colour, belly/accent colour] */
const FV={minnow:['fish',0xaab8c4,0xe8eef2],bluegill:['fish',0x4a7fa8,0xffa24a],perch:['fish',0x6b8e3a,0xf2d36b],bass:['fish',0x4d6b3a,0xcfd8a0],trout:['fish',0x8aa0a8,0xff9aa8],pike:['pike',0x58703a,0xd6e0a0],catfish:['cat',0x6b5a48,0xcbbba0],koi:['koi',0xff7a1f,0xffffff],serpent:['serp',0x2fb58a,0xffe27a],sunfish:['serp',0xffb300,0xff5252],
 tadpole:['tad',0x33402a,0x55663a],mudfish:['fish',0x6b5a3a,0xb09a70],eel:['eel',0x3a4a30,0x8a9a60],mcrab:['crab',0xd0453a,0xffe0a0],gar:['pike',0x7a8a5a,0xe0e8c0],frogking:['frog',0x4caf50,0xffd23a],gator:['gator',0x3d6b3a,0xcbd89a],ghost:['fish',0xbfd8ff,0xffffff],toadzilla:['frog',0x7a5a8a,0xffb0ff],
 clown:['clown',0xff7a1f,0xffffff],sardine:['fish',0x9fb8cc,0xe8f0f6],puffer:['puff',0xe8c86a,0xfff3c0],octo:['octo',0xd0505a,0xff9aa0],lobster:['crab',0xc0362b,0xffc08a],manta:['ray',0x2a3a5a,0xe8eef8],shark:['shark',0x6b7f90,0xe8eef2],whale:['whale',0x2f5f9a,0xdce8f2],kraken:['octo',0x6a2fa8,0xff40c0]};
const NPCD=[{name:'Old Finn',shop:"Finn's Fish Shop",loc:0,e:'🧓',av:{skin:1,shirt:3,hat:'straw',hair:'shortbk',jacket:'rain'},sign:['FISH SHOP','#7a4a22','#ffe9b0'],wall:0xa0643c,roof:0x6b2e1e,
  lines:["Fresh catch? Bring it here!","The big ones bite at night.","Cast near a shadow in the water.","A Perfect Cast brings the rare ones.","Rain? Best fishing all week!"]},
 {name:'Granny Moss',shop:"Granny's Bait & Brews",loc:1,e:'🧙',av:{skin:4,shirt:4,hat:'wizard',hair:'longbk',jacket:'cardi'},sign:["BAIT & BREWS",'#2f4a2a','#c8ffb0'],wall:0x5a6a3a,roof:0x3d2a5a,
  lines:["Hehehe... the swamp is hungry.","Ghost fish only come at night.","Glow Bait. Trust me, dearie.","Mind the gator, dear.","My cauldron needs a Mudfish."]},
 {name:'Capt. Coral',shop:"Coral's Tackle",loc:2,e:'🏴\u200d☠️',av:{skin:3,shirt:0,hat:'pirate',hair:'curly',jacket:'blazer'},sign:["TACKLE SHOP",'#14606e','#fff3c0'],wall:0xe0c890,roof:0x1f7a8a,
  lines:["Arr! The sharks are running!","Heard a Kraken lurks at night.","A real angler lands the big ones.","Salt air and a bent rod. Perfect.","Sell me those fish, matey!"]}];
const ANGD=[{loc:0,x:2.6,z:44,yaw:Math.PI/2,bx:13,bz:44,av:{skin:2,shirt:5,hat:'beanie',hair:'messy',jacket:'hood_gray'},name:'Sam',rod:1},
 {loc:1,x:-2.6,z:36,yaw:-Math.PI/2,bx:-13,bz:36,av:{skin:0,shirt:1,hat:'cat',hair:'pigp',jacket:'hood_pink'},name:'Mia',rod:0},
 {loc:2,x:6,z:62,yaw:0,bx:6,bz:75,av:{skin:5,shirt:2,hat:'bunny',hair:'ponyr',jacket:'denim'},name:'Kai',rod:2}];
const GS=new THREE.SphereGeometry(.5,12,9),GC=new THREE.ConeGeometry(.5,1,8),GB=new THREE.BoxGeometry(1,1,1),GY=new THREE.CylinderGeometry(.5,.5,1,8),GD=new THREE.SphereGeometry(.5,12,6,0,Math.PI*2,0,Math.PI/2),GR=new THREE.IcosahedronGeometry(1,0);
const mat=(c,g)=>new THREE.MeshLambertMaterial({color:c,emissive:g==null?new THREE.Color(c).multiplyScalar(.28):g});
const mk=(geo,c,sx,sy,sz,x,y,z,g)=>{const m=new THREE.Mesh(geo,mat(c,g));m.scale.set(sx,sy,sz);m.position.set(x||0,y||0,z||0);return m};
const wk=(geo,c,sx,sy,sz,x,y,z)=>mk(geo,c,sx,sy,sz,x,y,z,0);
const V3=THREE.Vector3,clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),rnd=(a,b)=>a+Math.random()*(b-a),pickOf=a=>a[Math.floor(Math.random()*a.length)];
const angTo=(a,t,r)=>{const d=Math.atan2(Math.sin(t-a),Math.cos(t-a));return a+clamp(d,-r,r)};

/* ---------- 3D fish: every species has its own low-poly model, length 1 along +z (head forward) ---------- */
function fishModel(id){
 const v=FV[id]||['fish',0x88aacc,0xffffff],sh=v[0],c=v[1],c2=v[2],g=new THREE.Group(),U=g.userData;
 const add=(m,p)=>{(p||g).add(m);return m},eye=(x,y,z,r)=>add(mk(GS,0x0a0a0a,r,r,r,x,y,z,0));
 const fin=(w,h,l,tl,df)=>{add(mk(GS,c,w,h,l));add(mk(GS,c2,w*.82,h*.55,l*.8,0,-h*.2,.04));
  const tail=new THREE.Group();tail.position.z=-l*.46;g.add(tail);const tf=mk(GC,c,.1,tl,h*1.5);tf.rotation.x=Math.PI/2;tf.position.z=-tl/2;tail.add(tf);
  add(mk(GC,c,.07,h*.8*df,l*.32,0,h*.5,l*.02));[-1,1].forEach(s=>{const f=mk(GB,c,.22,.04,.2,s*w*.55,-h*.12,l*.16);f.rotation.z=-s*.5;g.add(f);eye(s*w*.36,h*.16,l*.34,Math.max(.05,h*.12))});
  U.anim=(t,s)=>{tail.rotation.y=Math.sin(t*9*s)*.5;g.rotation.z=Math.sin(t*4.5*s)*.04};return tail};
 if(sh==='pike'){fin(.2,.26,1,.3,.9);add(mk(GB,c2,.14,.05,.22,0,-.03,.56))}
 else if(sh==='cat'){fin(.46,.4,1,.34,.9);[-1,1].forEach(s=>[0,1].forEach(i=>{const w=mk(GY,c2,.02,.34,.02,s*.22,-.08-i*.05,.5);w.rotation.z=s*(1.1+i*.3);g.add(w)}))}
 else if(sh==='koi'){fin(.4,.42,1,.45,1);[[.08,.2,.2],[-.08,.2,-.1],[.06,.19,-.32]].forEach(p=>add(mk(GS,0xffffff,.22,.08,.26,p[0],p[1],p[2])))}
 else if(sh==='clown'){fin(.4,.46,.9,.3,1);add(mk(GS,0xffffff,.43,.48,.1,0,0,.2));add(mk(GS,0xffffff,.43,.48,.1,0,0,-.12))}
 else if(sh==='tad'){fin(.5,.5,.55,.5,.2)}
 else if(sh==='shark'){fin(.3,.34,1,.45,2.4);add(mk(GB,0x222222,.14,.02,.2,0,-.14,.4))}
 else if(sh==='whale'){const t=fin(.5,.5,1,.2,.3);t.add(mk(GB,c,.95,.05,.32,0,0,-.2))}
 else if(sh==='ray'){add(mk(GS,c,.34,.14,.55));add(mk(GS,c2,.3,.05,.45,0,-.06,.02));const w=[-1,1].map(s=>{const q=new THREE.Group();q.position.x=s*.12;g.add(q);q.add(mk(GS,c,.62,.06,.5,s*.3,0,-.02));return q});
  add(mk(GY,c,.03,.55,.03,0,0,-.58)).rotation.x=Math.PI/2;[-1,1].forEach(s=>eye(s*.08,.07,.22,.04));U.anim=(t,s)=>{w.forEach((q,i)=>q.rotation.z=(i?1:-1)*Math.sin(t*3*s)*.35)}}
 else if(sh==='eel'||sh==='serp'||sh==='gator'){const n=sh==='eel'?10:sh==='serp'?14:9,th=sh==='eel'?.07:sh==='serp'?.1:.12,segs=[];
  for(let i=0;i<n;i++){const u=i/(n-1),r=th*(1.15-u*.75)*(i===0?1.3:1),m=mk(sh==='gator'?GB:GS,sh==='serp'&&i%2?c2:c,r*2,r*2*(sh==='gator'?.7:1),1/(n-1)*1.7,0,0,.5-u);g.add(m);segs.push(m);
   if(sh==='serp'&&i>0&&i%3===0)add(mk(GC,c2,.04,.14,.16,0,r+.03,.5-u))}
  const hz=.5,hr=th*1.3;[-1,1].forEach(s=>eye(s*hr*.7,hr*.5,hz+.03,.04));
  if(sh==='gator'){add(mk(GB,c,.12,.07,.34,0,-.01,hz+.2));[-1,1].forEach(s=>add(mk(GS,c,.06,.06,.06,s*.06,.08,hz+.03)))}
  if(sh==='serp')[-1,1].forEach(s=>{const h=mk(GC,0xffe27a,.05,.2,.05,s*.07,.12,hz-.04);h.rotation.z=-s*.3;g.add(h)});
  U.anim=(t,s)=>{segs.forEach((m,i)=>{m.position.x=Math.sin(t*6*s-i*.7)*.09*(i/(n-1))})}}
 else if(sh==='crab'){const lob=id==='lobster',L=lob?1.25:1;add(mk(GS,c,.5,.24,.42*L));add(mk(GS,c2,.4,.1,.36*L,0,-.1,0));
  [-1,1].forEach(s=>{add(mk(GY,0x222222,.03,.14,.03,s*.12,.18,.2*L));eye(s*.12,.26,.2*L,.07);const arm=mk(GB,c,.07,.07,.3,s*.26,0,.34*L);arm.rotation.y=-s*.4;g.add(arm);add(mk(GS,c,.2,.1,.24,s*.34,0,.52*L));
   [-.12,0,.12].forEach(z=>{const l=mk(GB,c2,.26,.04,.04,s*.34,-.04,z*L);l.rotation.z=-s*.3;g.add(l)})});
  if(lob){for(let i=0;i<4;i++)add(mk(GS,c,.3-i*.05,.15,.16,0,0,-.3-i*.12));[-1,1].forEach(s=>{const a=mk(GB,c2,.02,.02,.6,s*.08,.1,.62);a.rotation.y=s*.25;g.add(a)})}
  U.anim=(t,s)=>{g.rotation.z=Math.sin(t*7*s)*.05}}
 else if(sh==='frog'){add(mk(GS,c,.62,.42,.8));add(mk(GS,c2,.5,.2,.6,0,-.12,.02));
  [-1,1].forEach(s=>{add(mk(GS,c,.2,.2,.2,s*.2,.24,.28));eye(s*.2,.27,.34,.08);g.add(mk(GS,c,.22,.26,.4,s*.34,-.04,-.2));g.add(mk(GB,c2,.16,.04,.3,s*.36,-.16,-.42));g.add(mk(GB,c2,.1,.04,.24,s*.22,-.16,.4))});
  U.anim=(t,s)=>{g.rotation.x=Math.sin(t*5*s)*.05}}
 else if(sh==='puff'){add(mk(GS,c,.7,.66,.8));add(mk(GS,c2,.56,.3,.62,0,-.2,.04));
  for(let i=0;i<22;i++){const a=i*2.4,b=Math.acos(1-2*(i+.5)/22),d=new V3(Math.sin(b)*Math.cos(a),Math.cos(b),Math.sin(b)*Math.sin(a)),s=mk(GC,0xb09040,.07,.18,.07,d.x*.34,d.y*.32,d.z*.38);s.quaternion.setFromUnitVectors(new V3(0,1,0),d);g.add(s)}
  [-1,1].forEach(s=>eye(s*.2,.1,.36,.08));const tail=new THREE.Group();tail.position.z=-.4;g.add(tail);const tf=mk(GC,c2,.1,.26,.3,0,0,-.13);tf.rotation.x=Math.PI/2;tail.add(tf);U.anim=(t,s)=>{tail.rotation.y=Math.sin(t*10*s)*.5}}
 else if(sh==='octo'){add(mk(GS,c,.62,.7,.9,0,.05,.1));add(mk(GS,c2,.5,.4,.5,0,.2,.2));[-1,1].forEach(s=>eye(s*.2,.12,.5,.1));const T=[];
  for(let k=0;k<8;k++){const a=k/8*Math.PI*2,ch=[];for(let i=0;i<6;i++){const m=mk(GS,k%2?c:c2,.14-i*.016,.14-i*.016,.2,Math.cos(a)*(.18+i*.02),Math.sin(a)*.12-.1,-.1-i*.14);g.add(m);ch.push(m)}T.push({a,ch})}
  U.anim=(t,s)=>{T.forEach((q,k)=>q.ch.forEach((m,i)=>{m.position.x=Math.cos(q.a)*(.18+i*.02)+Math.sin(t*4*s+k+i*.6)*.05*i;m.position.y=Math.sin(q.a)*.12-.1+Math.cos(t*3*s+k+i*.5)*.03*i}))}}
 else fin(.34,.44,1,.4,1);
 if(id==='ghost')g.traverse(o=>{if(o.material){o.material.transparent=true;o.material.opacity=.6;o.material.emissive.setHex(0x88aaff)}});
 return g}
function applyMut(g,mu){if(mu===1)g.traverse(o=>{if(o.material)o.material.emissive.setHex(0x8a6a00)});if(mu===2)g.scale.multiplyScalar(1.3);if(mu===3)g.traverse(o=>{if(o.material){o.material.color.setHex(0xf4f4f4);o.material.emissive.setHex(0x555555)}})}
function junkModel(k){const g=new THREE.Group();
 if(k==='chest'){g.add(wk(GB,0x8a5a2b,1,.6,.7),mk(GB,0xffd23a,1.04,.12,.74,0,.05,0,0x6a5000));const lid=wk(GY,0x8a5a2b,.7,1,.7,0,.3,0);lid.rotation.z=Math.PI/2;g.add(lid)}
 else if(k==='boot'){g.add(wk(GB,0x5a3d28,.35,.7,.35,0,.1,-.05),wk(GB,0x5a3d28,.35,.22,.7,0,-.15,.15))}
 else g.add(wk(GY,0x9aa0aa,.4,.55,.4,0,0,0));return g}
/* ---------- rod: handle, reel, 4 bendable blade segments, guide rings, tip ---------- */
function mkRod(i){const [bc,ac,gl]=RODC[clamp(i|0,0,4)],g=new THREE.Group(),h=new THREE.Group();g.add(h);g.position.set(0,-2,.3);h.rotation.x=-1.2;
 h.add(wk(GY,0x6b4a2b,.26,1.2,.26,0,-.3,0));const rl=wk(GY,ac,.4,.16,.4,.2,-.55,0);rl.rotation.z=Math.PI/2;h.add(rl);
 const bends=[];let par=h,y=-.9;const len=1.7;for(let s=0;s<4;s++){const seg=new THREE.Group();seg.position.y=y;par.add(seg);const r=.13-s*.028;seg.add(mk(GY,bc,r*2,len,r*2,0,-len/2,0,gl==null?0:gl));seg.add(mk(GS,0x222222,.14,.14,.14,0,-len,.05,0));bends.push(seg);par=seg;y=-len}
 const tip=new THREE.Object3D();tip.position.y=-len;par.add(tip);g.userData={bends,tip,h};if(i>=3){const o=mk(GS,ac,.34,.34,.34,0,-len,0,ac);par.add(o)}g.visible=false;return g}
function bendRod(r,b){r.userData.bends.forEach((s,i)=>s.rotation.x=b*(.5+i*.35))}
function mkLine(n){const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(new Float32Array(n*3),3));const l=new THREE.Line(geo,new THREE.LineBasicMaterial({color:0xf4f4f4,transparent:true,opacity:.9}));l.frustumCulled=false;l.visible=false;l.userData.n=n;return l}
function setLine(l,a,b,sag,wob,T){const n=l.userData.n,p=l.geometry.attributes.position;for(let i=0;i<n;i++){const u=i/(n-1),s=4*u*(1-u);p.setXYZ(i,a.x+(b.x-a.x)*u+(wob?Math.sin(T*40+i)*wob*s:0),a.y+(b.y-a.y)*u-sag*s,a.z+(b.z-a.z)*u+(wob?Math.cos(T*37+i)*wob*s:0))}p.needsUpdate=true}
function mkBob(){const g=new THREE.Group();g.add(new THREE.Mesh(new THREE.SphereGeometry(.4,10,8),new THREE.MeshBasicMaterial({color:0xff3b30})));const b=new THREE.Mesh(new THREE.SphereGeometry(.3,10,8),new THREE.MeshBasicMaterial({color:0xffffff}));b.position.y=.35;g.add(b);const s=new THREE.Mesh(new THREE.CylinderGeometry(.04,.04,.9,5),new THREE.MeshBasicMaterial({color:0x222222}));s.position.y=.95;g.add(s);return g}
function woodTex(rx,ry){const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d');x.fillStyle='#9a6a38';x.fillRect(0,0,64,64);for(let i=0;i<8;i++){x.fillStyle=i%2?'#8a5a2b':'#a8763f';x.fillRect(0,i*8,64,7);x.fillStyle='rgba(0,0,0,.28)';x.fillRect(0,i*8+7,64,1)}const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(rx,ry);return t}
function signMat(txt,bg,fg){const c=document.createElement('canvas');c.width=256;c.height=96;const x=c.getContext('2d');x.fillStyle=bg;x.fillRect(0,0,256,96);x.strokeStyle=fg;x.lineWidth=6;x.strokeRect(5,5,246,86);x.fillStyle=fg;x.font='bold 30px system-ui';x.textAlign='center';x.fillText(txt,128,58);return new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(c)})}
/* speech bubble sprite */
function mkBubble(){const c=document.createElement('canvas');c.width=512;c.height=160;const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(c),depthTest:false,transparent:true}));sp.scale.set(10,3.1,1);sp.position.y=9;sp.visible=false;sp.renderOrder=9;sp.userData={c,t:0,txt:''};return sp}
function say(sp,txt,sec){const u=sp.userData;if(u.txt!==txt){u.txt=txt;const x=u.c.getContext('2d');x.clearRect(0,0,512,160);x.fillStyle='rgba(255,255,255,.96)';x.strokeStyle='#223';x.lineWidth=5;const r=24,w=500,h=118;x.beginPath();x.moveTo(6+r,6);x.arcTo(6+w,6,6+w,6+h,r);x.arcTo(6+w,6+h,6,6+h,r);x.arcTo(6,6+h,6,6,r);x.arcTo(6,6,6+w,6,r);x.closePath();x.fill();x.stroke();
  x.beginPath();x.moveTo(236,122);x.lineTo(256,154);x.lineTo(278,122);x.fill();x.fillStyle='#223';x.font='bold 34px system-ui';x.textAlign='center';const ws=String(txt).split(' ');let ln='',y=58,L=[];ws.forEach(w=>{const t=ln?ln+' '+w:w;if(x.measureText(t).width>460&&ln){L.push(ln);ln=w}else ln=t});L.push(ln);if(L.length>1)y=46;L.slice(0,2).forEach((q,i)=>x.fillText(q,256,y+i*42));sp.material.map.needsUpdate=true}u.t=sec;sp.visible=true}
function mkAv(o){const a={};for(const k in OPT)a[k]=0;a.skin=o.skin;a.shirt=o.shirt;a.pants=o.pants==null?1:o.pants;a.face=o.face||0;['hat','hair','jacket'].forEach(c=>{const i=OPT[c].findIndex(x=>x[1]===o[c]);a[c]=i<0?0:i});return a}
function mkChar(def,x,y,z){const sv=AV;AV=mkAv(def.av);let c;try{c=newP(x,y,z)}finally{AV=sv}return c}

/* ---------- world: three themed islands, docks, huts, props ---------- */
function buildWorld(E){
 const G=E.G,S=E.S,wy=E.wy,rs=mulb(51);E.LG=[];E.flames=[];E.bobs=[];E.NP=[];E.AN=[];E.pads=[];
 const put=(p,m,sh)=>{m.castShadow=sh!==false;m.receiveShadow=true;p.add(m);return m};
 const oak=(p,x,z,s)=>{put(p,wk(GY,0x7a5230,.9*s,4*s,.9*s,x,2*s,z));[[0,5.2,0,3.2],[1.4,4.5,.6,2.4],[-1.2,4.6,-.5,2.5]].forEach((q,i)=>put(p,wk(GS,[0x4caf50,0x43a047,0x5cbf5a][i],q[3]*s,q[3]*.85*s,q[3]*s,x+q[0]*s,q[1]*s,z+q[2]*s)))};
 const pine=(p,x,z,s)=>{put(p,wk(GY,0x6a4a2b,.7*s,3*s,.7*s,x,1.5*s,z));for(let i=0;i<3;i++)put(p,wk(GC,[0x2f7d4a,0x2a7040,0x358a52][i],(3.4-i*.8)*s,2.4*s,(3.4-i*.8)*s,x,(3.2+i*1.5)*s,z))};
 const palm=(p,x,z,s)=>{const ln=rs()*.5-.25;for(let i=0;i<4;i++)put(p,wk(GY,0x9a7048,.55*s,1.6*s,.55*s,x+ln*i*.5*s,(.8+i*1.5)*s,z));const tx=x+ln*2*s,ty=6.2*s;
  for(let i=0;i<6;i++){const a=i/6*Math.PI*2,lf=wk(GC,0x3fae4a,.5*s,3.2*s,1.2*s,tx+.93*Math.cos(a)*1.6*s,ty+.36*1.6*s,z-.93*Math.sin(a)*1.6*s);lf.rotation.z=-1.2;lf.rotation.y=a;put(p,lf)}
  put(p,wk(GS,0x6b4a2b,.5*s,.5*s,.5*s,tx,ty-.4*s,z))};
 const dead=(p,x,z,s)=>{const t=put(p,wk(GY,0x4a3a2e,.6*s,5*s,.6*s,x,2.5*s,z));t.rotation.z=(rs()-.5)*.3;for(let i=0;i<3;i++){const b=wk(GY,0x4a3a2e,.22*s,2.4*s,.22*s,x+Math.cos(i*2.1)*.9*s,(3.6+i*.5)*s,z+Math.sin(i*2.1)*.9*s);b.rotation.z=Math.cos(i*2.1)*.9;b.rotation.x=-Math.sin(i*2.1)*.9;put(p,b)}};
 const shroom=(p,x,z,s,c,glow)=>{put(p,wk(GY,0xf0e6d0,.7*s,2*s,.7*s,x,s,z));const cap=put(p,mk(GD,c,3*s,2*s,3*s,x,2*s,z,glow?c:0));cap.scale.set(3*s,2*s,3*s);if(!glow)for(let i=0;i<5;i++){const a=i*1.3;put(p,wk(GS,0xffffff,.45*s,.3*s,.45*s,x+Math.cos(a)*.9*s,(2.6+Math.sin(i)*.15)*s,z+Math.sin(a)*.9*s),false)}};
 const rock=(p,x,z,s)=>{const r=put(p,wk(GR,0x8a8f98,1.4*s,.9*s,1.1*s,x,.3*s,z));r.rotation.y=rs()*6};
 const reed=(p,x,z)=>{for(let i=0;i<4;i++){const h=2+rs()*1.6,r=wk(GY,0x6a8a3a,.1,h,.1,x+rs()*.8,h/2,z+rs()*.8);r.rotation.z=(rs()-.5)*.3;p.add(r)}p.add(wk(GY,0x6b4a2b,.22,.7,.22,x,2.4,z))};
 const lily=(p,x,z)=>{p.add(wk(GY,0x3f9a4a,1.7,.06,1.7,x,wy+.12,z));if(rs()<.5)p.add(wk(GS,0xff8ab8,.4,.3,.4,x,wy+.3,z))};
 const flower=(p,x,z)=>{const c=pickOf([0xff6b81,0xffd23a,0xffffff,0xb45cff]);p.add(wk(GS,c,.45,.45,.45,x,.3,z))};
 const coral=(p,x,z)=>{const c=pickOf([0xff6fa0,0xff8a3a,0xb45cff,0x4fe0c0]);for(let i=0;i<4;i++)p.add(mk(GC,c,.5+rs()*.3,1.2+rs()*1.4,.5+rs()*.3,x+(rs()-.5)*1.4,wy-1+rs()*.3,z+(rs()-.5)*1.4))};
 const barrel=(p,x,z)=>{put(p,wk(GY,0x8a5a2b,1.6,1.8,1.6,x,.9,z));put(p,wk(GY,0x444444,1.66,.1,1.66,x,1.1,z),false)};
 const crate=(p,x,z,s)=>put(p,wk(GB,0xb98a4a,1.6*s,1.6*s,1.6*s,x,.8*s,z));
 const post=(p,x,z,lamp)=>{put(p,wk(GY,0x5a3d28,.35,3,.35,x,1.5,z));if(lamp){p.add(mk(GS,0xffd878,.8,.8,.8,x,3.3,z,0xffd878))}};
 const torch=(p,x,z)=>{put(p,wk(GY,0x5a3d28,.3,3.2,.3,x,1.6,z));const f=mk(GC,0xff8a1f,.6,1.1,.6,x,3.6,z,0xff8a1f);p.add(f);E.flames.push({m:f,ph:rs()*6})};
 const umbrella=(p,x,z,c)=>{put(p,wk(GY,0xdddddd,.15,4,.15,x,2,z));put(p,wk(GC,c,5,1.4,5,x,4.4,z));};
 const boat=(p,x,z,c)=>{const b=new THREE.Group();b.position.set(x,wy+.2,z);b.add(wk(GB,c,2.6,.8,6.4),wk(GB,0xc9a070,2.1,.5,5.7));b.children[1].position.y=.22;[-1,1].forEach(s=>{const o=wk(GY,0x6b4a2b,.14,4,.14,s*1.5,.6,.5);o.rotation.z=s*.9;b.add(o)});b.children.forEach(m=>m.castShadow=true);p.add(b);E.bobs.push({m:b,y:wy+.2,ph:rs()*6})};
 const hut=(p,k,x,z,D)=>{put(p,wk(GB,D.wall,10,6,8,x,3,z));const r=new THREE.Mesh(new THREE.ConeGeometry(8.2,4,4),lam(D.roof));r.rotation.y=Math.PI/4;r.scale.set(1,1,.82);r.position.set(x,8,z);r.castShadow=true;p.add(r);
  put(p,wk(GB,0x3a2418,2,3.2,.2,x,1.6,z+4.05));[-1,1].forEach(s=>p.add(mk(GB,0xfff3b0,1.6,1.6,.2,x+s*3.2,3.6,z+4.05,0x6a5a20)));
  const sg=new THREE.Mesh(new THREE.BoxGeometry(5.2,1.5,.3),signMat(D.sign[0],D.sign[1],D.sign[2]));sg.position.set(x,5.6,z+4.3);p.add(sg);
  put(p,wk(GB,0x7a4a22,6.2,1.2,1.4,x+4,.6,z+5.7));barrel(p,x-6.2,z+3.4);crate(p,x-6,z+1.6,1);crate(p,x-5.4,z+3.5,.8);post(p,x-4,z+6.5,1);post(p,x+10,z+6.5,1);
  S.push({x:E.LOCS[k][1]+x,z:E.LOCS[k][2]+z,hw:5.2,hd:4.2,top:6});S.push({x:E.LOCS[k][1]+x+4,z:E.LOCS[k][2]+z+5.7,hw:3.2,hd:.8,top:1.2})};
 E.LOCS.forEach(([n,ox,oz],k)=>{const lg=new THREE.Group();lg.position.set(ox,0,oz);G.add(lg);E.LG.push(lg);const gc=[0x7fbf5a,0x56753a,0xe8d8a0][k];
  const isl=put(lg,new THREE.Mesh(new THREE.CylinderGeometry(22,24,6,40),lam(gc)),false);isl.position.y=-3;isl.receiveShadow=true;S.push({x:ox,z:oz,r:22,top:0});
  const sand=new THREE.Mesh(new THREE.RingGeometry(21.8,25.6,48),lam(k===2?0xf3e6b8:0xcdb980));sand.rotation.x=-Math.PI/2;sand.position.y=-.55;sand.receiveShadow=true;lg.add(sand);
  const foam=new THREE.Mesh(new THREE.RingGeometry(25,26.4,48),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.35,side:THREE.DoubleSide}));foam.rotation.x=-Math.PI/2;foam.position.y=wy+.18;lg.add(foam);E.foams=(E.foams||[]).concat(foam);
  for(let i=0;i<6;i++){const a=rs()*6.28,r=rs()*17,pt=wk(GY,[0x6fb04e,0x8ccf64,0x4f9a40][i%3],4+rs()*5,.05,4+rs()*5,Math.cos(a)*r,.03,-Math.abs(Math.sin(a))*r);lg.add(pt)}
  const dk=wk(GB,0x9a6a38,7,.5,38,0,-.25,38);dk.material=new THREE.MeshLambertMaterial({map:woodTex(1,19)});put(lg,dk);S.push({x:ox,z:oz+38,hw:3.5,hd:19,top:0,bot:-.5});
  const pl=wk(GB,0x9a6a38,14,.5,12,0,-.25,58);pl.material=new THREE.MeshLambertMaterial({map:woodTex(2,6)});put(lg,pl);S.push({x:ox,z:oz+58,hw:7,hd:6,top:0,bot:-.5});
  for(let i=0;i<7;i++)[-1,1].forEach(s=>lg.add(wk(GY,0x5a3d28,.7,5,.7,s*3.2,-2.5,22+i*5.5)));
  for(let i=0;i<7;i++){post(lg,-3.3,21+i*5.6,i%3===1);post(lg,3.3,21+i*5.6,i%3===1)}[-1,1].forEach(s=>put(lg,wk(GB,0x7a4a22,.2,.25,36,s*3.3,1.4,39),false));
  [-1,1].forEach(s=>{post(lg,s*6.6,52,0);post(lg,s*6.6,64,0);post(lg,s*6.6,58,0)});
  const t=tag(n);t.scale.set(14,3.5,1);t.position.set(0,10,8);lg.add(t);
  const D=NPCD[k];hut(lg,k,-16,-10,D);
  const pad=(x,z,to,lab,col)=>{const m=new THREE.Mesh(new THREE.CylinderGeometry(2.4,2.4,.3,24),new THREE.MeshBasicMaterial({color:col}));m.position.set(x,.2,z);lg.add(m);const rg=new THREE.Mesh(new THREE.TorusGeometry(2.7,.14,6,28),new THREE.MeshBasicMaterial({color:0xffffff}));rg.rotation.x=Math.PI/2;rg.position.y=.2;m.add(rg);const l=tag(lab);l.position.y=4;m.add(l);E.pads.push({x:ox+x,z:oz+z,to,m,rg})};
  if(k===0){pad(14,-6,1,'\u2192 Swamp',0x3d6b4a);pad(14,4,2,'\u2192 Coral Bay',0x14b8c9)}else pad(12,-4,0,'\u2190 Back to Lake',0xffd23a);
  /* theme dressing */
  if(k===0){for(let i=0;i<11;i++){const a=i*.62+1,r=11+rs()*9;oak(lg,Math.cos(a)*r,-Math.abs(Math.sin(a))*r*.9-2,.8+rs()*.5)}for(let i=0;i<18;i++){const a=rs()*6.28,r=4+rs()*16;flower(lg,Math.cos(a)*r,-Math.abs(Math.sin(a))*r)}
   for(let i=0;i<5;i++)rock(lg,Math.cos(i*1.3)*19,-Math.abs(Math.sin(i*1.3))*19-2,1);for(let i=0;i<9;i++){const a=.25+i*.32;lily(lg,Math.cos(a)*(28+rs()*10),Math.sin(a)*(28+rs()*10)*(-1)-8)}for(let i=0;i<6;i++){const a=3.5+i*.45;reed(lg,Math.cos(a)*22.5,Math.sin(a)*22.5)}
   boat(lg,-7,30,0x8a5a2b);const cf=new THREE.Group();cf.position.set(-5,0,-4);[0,1,2].forEach(i=>{const lgx=wk(GY,0x5a3d28,.3,1.4,.3,Math.cos(i*2.1)*.5,.3,Math.sin(i*2.1)*.5);lgx.rotation.z=1.3;lgx.rotation.y=i*2.1;cf.add(lgx)});const fl=mk(GC,0xff8a1f,.9,1.6,.9,0,1.1,0,0xff8a1f);cf.add(fl);E.flames.push({m:fl,ph:1});lg.add(cf);
   const rk=wk(GB,0x7a4a22,.2,3,.2,-24,1.5,-4);lg.add(rk);}
  if(k===1){for(let i=0;i<7;i++){const a=i*.9+.4,r=12+rs()*8;dead(lg,Math.cos(a)*r,-Math.abs(Math.sin(a))*r*.9-2,.9+rs()*.5)}
   for(let i=0;i<10;i++){const a=i*.62+.2,r=8+rs()*12,g=i%3===0;shroom(lg,Math.cos(a)*r,-Math.abs(Math.sin(a))*r-3,.7+rs()*.9,g?0x3fd8ff:i%2?0xd0453a:0xb45cff,g)}
   for(let i=0;i<12;i++){const a=.2+i*.26;lily(lg,Math.cos(a)*(27+rs()*12),-Math.sin(a)*(27+rs()*12)-6)}for(let i=0;i<8;i++){const a=3.4+i*.35;reed(lg,Math.cos(a)*22.5,Math.sin(a)*22.5)}
   const cd=new THREE.Group();cd.position.set(-8,0,-2);cd.add(wk(GY,0x222428,2.6,1.6,2.6,0,1,0),mk(GS,0x7dff7a,2.2,.5,2.2,0,1.8,0,0x7dff7a));[-1,1].forEach(s=>cd.add(wk(GY,0x5a3d28,.2,1.2,.2,s*1.6,.5,0)));lg.add(cd);E.flames.push({m:cd.children[1],ph:2,glow:1});}
  if(k===2){for(let i=0;i<9;i++){const a=i*.7+.8,r=11+rs()*9;palm(lg,Math.cos(a)*r,-Math.abs(Math.sin(a))*r*.9-2,.85+rs()*.4)}
   umbrella(lg,8,-14,0xe0352b);umbrella(lg,14,-8,0x29b6f6);umbrella(lg,-2,-16,0xffd23a);for(let i=0;i<14;i++){const a=rs()*6.28,r=14+rs()*7;lg.add(wk(GS,pickOf([0xffb0c0,0xfff3e0,0xffd8a0]),.5,.3,.5,Math.cos(a)*r,.1,-Math.abs(Math.sin(a))*r))}
   for(let i=0;i<24;i++){const a=rs()*6.28,r=26.5+rs()*5;coral(lg,Math.cos(a)*r,Math.sin(a)*r)}for(let i=0;i<4;i++)torch(lg,-3.6,26+i*9),torch(lg,3.6,26+i*9);
   boat(lg,7,30,0xe0e0e0);const lh=new THREE.Group();lh.position.set(-6,0,-16);for(let i=0;i<5;i++)lh.add(wk(GY,i%2?0xffffff:0xd0453a,4.6-i*.5,3,4.6-i*.5,0,1.5+i*3,0));lh.add(wk(GY,0x333333,3.4,.6,3.4,0,15.3,0),mk(GS,0xfff0a0,2.4,2.4,2.4,0,16.4,0,0xffe070),wk(GC,0xd0453a,4,2.2,4,0,18.4,0));lg.add(lh);S.push({x:ox-6,z:oz-16,r:2.6,top:20});
   const sh=new THREE.Group();sh.position.set(15,0,-3);sh.add(wk(GB,0x6b4a2b,3,1,7,0,.5,0),wk(GY,0x5a3d28,.3,9,.3,0,5,0),wk(GB,0xf2ead0,.1,5,3.4,0,6.3,.3));sh.rotation.y=.5;sh.rotation.z=.12;lg.add(sh)}
  /* NPC shopkeeper */
  const nc=mkChar(D,ox-12,0,oz-2),bub=mkBubble();bub.position.y=8.4;nc.g.add(bub);const nt=tag(D.name);nt.scale.set(7,1.8,1);nt.position.y=7.2;nc.g.add(nt);E.NP.push({c:nc,d:D,k,bub,i:k,near:false,wt:0,wv:0,li:0});
  /* ambient angler */
  const A=ANGD[k],ac=mkChar(A,ox+A.x,0,oz+A.z);ac.yaw=A.yaw;ac.g.rotation.y=A.yaw;ac.emote='sit';ac.gr=true;const ab=mkBubble();ab.position.y=7.4;ab.scale.set(8,2.5,1);ac.g.add(ab);const an=tag(A.name);an.scale.set(5,1.25,1);an.position.y=6.4;ac.g.add(an);
  const rod=mkRod(A.rod);rod.visible=true;ac.J.aR.add(rod);const bb=mkBob();bb.position.set(ox+A.bx,wy+.25,oz+A.bz);scene.add(bb);const ln=mkLine(12);ln.visible=true;scene.add(ln);
  E.AN.push({c:ac,d:A,k,bub:ab,rod,bob:bb,ln,t:rnd(6,20),st:0,at:0,ox,oz})});
}

return{d3:true,noEmote:1,LOCS,FISH,RODS,BAITS,
 load(){let d={};try{d=JSON.parse(localStorage.getItem('hubfish')||'{}')}catch(e){}this.D=Object.assign({m:0,rod:0,own:[1,0,0,0,0],bait:[0,0,0],be:-1,bag:[],book:{},xp:0,lv:1,bc:0,rq:[null,null,null]},d);if(!Array.isArray(this.D.rq))this.D.rq=[null,null,null]},
 save(){try{localStorage.setItem('hubfish',JSON.stringify(this.D))}catch(e){}},
 ex(){return{fs:({idle:0,charge:1,reel:3})[this.fst]||2,bb:this.bob&&['cast','wait','bite','reel'].includes(this.fst)?[Math.round(this.bob.position.x),Math.round(this.bob.position.z)]:null,cg:this.cg,rd:this.D?this.D.rod:0}},
 mkBob,
 rem(c,q){const ri=q.rd|0;if(!c.rod||c.rodI!==ri){if(c.rod)c.J.aR.remove(c.rod);c.rod=mkRod(ri);c.rod.visible=true;c.J.aR.add(c.rod);c.rodI=ri}
  const f=q.fs||0;c.J.aR.rotation.x=f>0?-1.15:-.9;bendRod(c.rod,f===3?.35:f===2?.1:0);if(this.rm)this.rm.add(c);
  if(Array.isArray(q.bb)){if(!c.bob){c.bob=mkBob();scene.add(c.bob);c.ln=mkLine(10);scene.add(c.ln)}c.bob.visible=c.ln.visible=true;c.bob.position.set(q.bb[0],this.wy+.25+Math.sin(Date.now()/300+c.x)*.08,q.bb[1]);c.g.updateMatrixWorld(true);c.rod.userData.tip.getWorldPosition(this.tv);setLine(c.ln,this.tv,c.bob.position,.8,0,0)}else if(c.bob){c.bob.visible=false;c.ln.visible=false}
  if(Array.isArray(q.cg)&&q.cg[0]>(c.lcg||0)){const first=c.lcg!==undefined;c.lcg=q.cg[0];if(first&&q.cg[3]>=3)logChat(cl(q.n)||'Player','caught a '+RAR[q.cg[3]]+' '+cl(q.cg[1])+' ('+q.cg[2]+' kg)!')}else if(c.lcg===undefined)c.lcg=Array.isArray(q.cg)?q.cg[0]:0},
 inWater(x,z){for(const l of LOCS){const dx=x-l[1],dz=z-l[2];if(Math.hypot(dx,dz)<23.5)return false;if(Math.abs(dx)<4.5&&dz>18&&dz<58)return false;if(Math.abs(dx)<8&&Math.abs(dz-58)<7)return false}return true},
 luck(){const D=this.D;return RODS[D.rod][2]+(this.bu>=0?BAITS[this.bu][2]:0)+Math.min(.12,(D.lv-1)*.006)+(this.perfect?.1:0)+(this.rw>.5?.08:0)},
 pick(dist){const L=this.luck()+Math.min(.15,dist/400),r0=Math.random();
  if(r0<.03)return{sp:Math.random()<.5?'boot':'can'};if(r0<.042)return{sp:'chest'};
  const pool=FISH.filter(f=>(f[7]&(1<<this.loc))&&(!f[8]||this.night)),ws=[70,22,6,1.6,.35,.05].map((v,i)=>v*Math.pow(1+L,i*1.1)),rs=[0,1,2,3,4,5].filter(r=>pool.some(f=>f[3]===r));
  let tot=0;rs.forEach(r=>{tot+=ws[r]});let x=Math.random()*tot,rar=rs[0];for(const r of rs){if((x-=ws[r])<0){rar=r;break}}
  const f=pickOf(pool.filter(f=>f[3]===rar)),kg=f[4]+(f[5]-f[4])*Math.pow(Math.random(),1.7),m=Math.random();return{f,kg:Math.round(kg*10)/10,mu:m<.01?3:m<.04?2:m<.12?1:0}},
 val(it){const f=FISH.find(x=>x[0]===it[0]);return Math.round(f[6]*(.7+.6*(it[1]-f[4])/Math.max(.01,f[5]-f[4]))*MUT[it[2]][1]*(it[3]?1.15:1))},
 q(id){return document.getElementById(id)},msg(t){this.mtxt=t;this.mt=Date.now()/1000+2.2},
 cap(){return CAPS[this.D.bc||0]},need(){return Math.round(40*Math.pow(this.D.lv,1.45))},
 addXp(n){const D=this.D;D.xp+=n;let up=0;while(D.xp>=this.need()){D.xp-=this.need();D.lv++;up++;const b=D.lv*40;D.m+=b;reveal('LEVEL '+D.lv+'!','#ffd23a','+$'+b+' \u00b7 luck up');snd(600,.5,'sine',.15,1500);for(let i=0;i<8;i++)setTimeout(()=>{if(cur===this)fxBurst(this.P.x+rnd(-5,5),this.P.y+4+rnd(0,4),this.P.z+rnd(-5,5),[0xffd23a,0xff4081,0x29b6f6][i%3])},i*90)}return up},
 /* ----- requests from the shopkeepers ----- */
 genReq(i){const lv=this.D.lv;
  if(i===0){const pool=FISH.filter(f=>!f[8]&&f[3]<=Math.min(3,Math.floor(lv/3)+1)),f=pickOf(pool),n=f[3]<=1?2+Math.floor(Math.random()*3):1+Math.floor(Math.random()*2);return{t:'sp',k:f[0],n,h:0,r:Math.round(f[6]*n*2.2+30),x:10+f[3]*12,d:'Catch '+n+' '+f[1]+(n>1?'s':'')}}
  if(i===1){const rr=Math.min(4,1+Math.floor(lv/4)),n=rr>=3?1:2,r=[0,200,520,1500,6000][rr]*n;return{t:'ra',k:rr,n,h:0,r,x:20+rr*18,d:'Catch '+n+' '+RAR[rr]+' or better'}}
  const w=[2,6,15,40,100,250][Math.min(5,Math.floor(lv/3))];return{t:'kg',k:w,n:1,h:0,r:Math.round(60*Math.pow(w,.85)+80),x:15+Math.round(w/4),d:'Land one fish over '+w+' kg'}},
 reqProg(f,kg){const D=this.D;D.rq.forEach((q,i)=>{if(!q||q.h>=q.n)return;if((q.t==='sp'&&f[0]===q.k)||(q.t==='ra'&&f[3]>=q.k)||(q.t==='kg'&&kg>=q.k)){q.h++;if(q.h>=q.n){this.msg('\ud83d\udcdc Request done! Visit '+NPCD[i].name);snd(800,.2,'sine',.12,1200)}}})},
 /* ----- fish in the water ----- */
 mkFish(k,near,forced){const pool=FISH.filter(f=>(f[7]&(1<<k))&&(!f[8]||this.night)),AW=[55,25,12,5,2,.6],rs=[0,1,2,3,4,5].filter(r=>pool.some(f=>f[3]===r));let f,kg,mu;
  if(forced&&forced.f){f=forced.f;kg=forced.kg;mu=forced.mu}else{let tot=0;rs.forEach(r=>tot+=AW[r]);let x=Math.random()*tot,rar=rs[0];for(const r of rs){if((x-=AW[r])<0){rar=r;break}}f=pickOf(pool.filter(q=>q[3]===rar));kg=Math.round((f[4]+(f[5]-f[4])*Math.pow(Math.random(),1.7))*10)/10;const m=Math.random();mu=m<.01?3:m<.04?2:m<.12?1:0}
  const L=LOCS[k];let px=0,pz=0,ok=false;for(let t=0;t<24&&!ok;t++){if(near){const a=Math.random()*6.283,d=rnd(13,19);px=near.x+Math.sin(a)*d;pz=near.z+Math.cos(a)*d}else{const a=Math.random()*6.283,d=rnd(32,98);px=L[1]+Math.cos(a)*d;pz=L[2]+Math.sin(a)*d}const dd=Math.hypot(px-L[1],pz-L[2]);ok=this.inWater(px,pz)&&dd>28&&dd<105}
  if(!ok){px=L[1]+60;pz=L[2]-20}
  const m=fishModel(f[0]),sz=clamp(1.1+Math.cbrt(kg)*.95,1.3,22);m.scale.setScalar(sz);applyMut(m,mu);this.G.add(m);
  const e={f,kg,mu,m,sz,k,x:px,z:pz,a:Math.random()*6.283,sp:clamp(5.5-sz*.25,2,5.5)*rnd(.8,1.2),st:'wander',t:0,tt:rnd(1,3),tu:0,dep:.7+sz*.32,ph:Math.random()*20,ring:null};
  if(f[3]>=3){const r=new THREE.Mesh(new THREE.RingGeometry(.7,.95,22),new THREE.MeshBasicMaterial({color:RCH[f[3]],transparent:true,opacity:.6,side:THREE.DoubleSide}));r.rotation.x=-Math.PI/2;this.G.add(r);e.ring=r}
  m.visible=k===this.loc;if(e.ring)e.ring.visible=m.visible;this.FS[k].push(e);return e},
 rmFish(e){e.dead=true;this.G.remove(e.m);if(e.ring)this.G.remove(e.ring);const l=this.FS[e.k],i=l.indexOf(e);if(i>=0)l.splice(i,1);if(this.ae===e)this.ae=null;if(this.hooked===e)this.hooked=null},
 fishTick(dt,T){const k=this.loc,L=LOCS[k],list=this.FS[k],bob=this.bob,D=this.D,rod=RODS[D.rod],bx=bob.position.x,bz=bob.position.z,lure=rod[4]*(this.bu>=0?BAITS[this.bu][3]:1)*(1+this.rw*.5),lk=this.luck();
  if(this.ae&&this.fst==='idle'){if(this.ae.st==='curious'||this.ae.st==='nibble')this.ae.st='wander';this.ae=null}
  if(this.fst==='wait'&&!this.ae){for(const e of list){if(e.st!=='wander')continue;if(Math.hypot(e.x-bx,e.z-bz)>14+rod[4]*3)continue;if(Math.random()<.5*[1,.8,.6,.45,.32,.24][e.f[3]]*(1+lk*2.5)*lure*dt){this.ae=e;e.st='curious';e.t=0;break}}}
  for(let i=list.length-1;i>=0;i--){const e=list[i];e.t+=dt;if(e.f[8]&&!this.night&&e.st==='wander'){e.st='leave';e.t=0}
   if(e.st==='wander'){e.tt-=dt;if(e.tt<=0){e.tu=(Math.random()-.5)*1.4;e.tt=rnd(1.2,3.2)}e.a+=e.tu*dt;const dx=e.x-L[1],dz=e.z-L[2],d=Math.hypot(dx,dz)||1,nx=e.x+Math.sin(e.a)*e.sp*dt,nz=e.z+Math.cos(e.a)*e.sp*dt;
    if(d>104||d<28||!this.inWater(nx,nz)){const tx=L[1]+dx/d*62,tz=L[2]+dz/d*62;e.a=angTo(e.a,Math.atan2(tx-e.x,tz-e.z),2.6*dt)}e.x+=Math.sin(e.a)*e.sp*dt;e.z+=Math.cos(e.a)*e.sp*dt;e.dd=.7+e.sz*.32}
   else if(e.st==='curious'){const dx=bx-e.x,dz=bz-e.z,d=Math.hypot(dx,dz);e.a=angTo(e.a,Math.atan2(dx,dz),4*dt);const sp=Math.min(7,d*1.5+2);e.x+=Math.sin(e.a)*sp*dt;e.z+=Math.cos(e.a)*sp*dt;e.dd=.6+e.sz*.2;
    if(d<2.8){e.st='nibble';e.nt=0;e.nd=1.2+Math.random()*1.8+e.f[3]*.25;e.np=.5;e.cr=rnd(1.8,2.4)}else if(e.t>9){e.st='wander';this.ae=null}}
   else if(e.st==='nibble'){e.nt+=dt;const w=e.nt*2.2+e.ph,tx=bx+Math.cos(w)*e.cr,tz=bz+Math.sin(w)*e.cr;e.a=angTo(e.a,Math.atan2(tx-e.x,tz-e.z),6*dt);e.x+=(tx-e.x)*Math.min(1,dt*4);e.z+=(tz-e.z)*Math.min(1,dt*4);e.dd=.5+e.sz*.15;
    e.np-=dt;if(e.np<=0&&e.nt<e.nd-.3){e.np=.45+Math.random()*.5;this.dip=.22;this.ripple(bx,bz,.7);snd(260+Math.random()*80,.06,'sine',.06)}
    if(e.nt>=e.nd){e.st='hooked';this.hooked=e;this.fish={f:e.f,kg:e.kg,mu:e.mu}}}
   else if(e.st==='hooked'){const R=this.fst==='reel'?1.2+Math.abs(this.fp-.5)*3:.7;e.x=bx+Math.cos(T*3.1)*R;e.z=bz+Math.sin(T*2.3)*R;e.a=Math.atan2(-Math.sin(T*3.1)*3.1,Math.cos(T*2.3)*2.3);e.dd=.45+e.sz*.12;
    if(this.fst==='reel'&&Math.random()<dt*3){this.splash(e.x,e.z,3,.7)}}
   else if(e.st==='flee'){e.x+=Math.sin(e.a)*14*dt;e.z+=Math.cos(e.a)*14*dt;e.dd=(e.dd||1)+dt*2;if(e.t>1.6){this.rmFish(e);continue}}
   else if(e.st==='leave'){e.dd=(e.dd||1)+dt*2;if(e.dd>8){this.rmFish(e);continue}}
   e.dep+=((e.dd||e.dep)-e.dep)*Math.min(1,dt*3);e.m.position.set(e.x,this.wy-e.dep,e.z);e.m.rotation.y=e.a;const an=e.m.userData.anim;if(an)an(T+e.ph,e.st==='wander'?.7:1.5);
   if(e.ring){e.ring.position.set(e.x,this.wy+.17,e.z);const s=e.sz*(.7+.15*Math.sin(T*3+e.ph));e.ring.scale.set(s,s,s)}}
  this.spT[k]-=dt;if(list.length<10&&this.spT[k]<=0){this.mkFish(k);this.spT[k]=rnd(.6,1.6)}},
 /* ----- splashes + ripples ----- */
 splash(x,z,n,s){s=s||1;for(let i=0;i<n;i++){const d=this.drops.find(q=>q.l<=0);if(!d)break;d.l=.9;d.vx=rnd(-3,3)*s;d.vz=rnd(-3,3)*s;d.vy=rnd(7,13)*s;d.m.position.set(x,this.wy+.1,z);d.m.visible=true}this.ripple(x,z,s)},
 ripple(x,z,s){const r=this.rips.find(q=>q.l<=0);if(!r)return;r.l=r.mx=.9;r.s=s||1;r.m.position.set(x,this.wy+.2,z);r.m.visible=true},
 fx2(dt){this.drops.forEach(d=>{if(d.l<=0)return;d.l-=dt;d.vy-=34*dt;d.m.position.x+=d.vx*dt;d.m.position.z+=d.vz*dt;d.m.position.y+=d.vy*dt;d.m.material.opacity=Math.min(1,d.l*2);if(d.l<=0||d.m.position.y<this.wy-.2){d.l=0;d.m.visible=false}});
  this.rips.forEach(r=>{if(r.l<=0)return;r.l-=dt;const u=1-r.l/r.mx;r.m.scale.setScalar(.6+u*3.6*r.s);r.m.material.opacity=(1-u)*.65;if(r.l<=0)r.m.visible=false})},
 /* ----- reeling ----- */
 reelIn(){this.q('reel').style.display='none';this.bob.visible=false;this.line.visible=false;this.q('fbang').style.display='none'},
 cancelCast(){this.reelIn();this.fst='idle';const e=this.hooked||this.ae;if(e&&e.m){if(e.st==='hooked'||e.st==='curious'||e.st==='nibble'){e.st='wander'}}this.hooked=null;this.ae=null},
 startReel(perfect){const fs=this.fish,sp=fs.sp,f=fs.f,rod=RODS[this.D.rod];this.fst='reel';this.rt=0;this.outT=0;this.q('fbang').style.display='none';
  if(sp){Object.assign(this,{fp:.5,ft:.5,fto:0,bp:.5,bv:0,pr:.45,fsp:.1,hw:.22,beh:'steady'});this.q('rfi').textContent=SPC[sp][1];this.q('rfn').textContent='Something heavy...'}
  else{Object.assign(this,{fp:.5,ft:.5,fto:0,bp:.5,bv:0,pr:perfect?.5:.35,fsp:.22+f[3]*.11+Math.min(.15,fs.kg/300),hw:Math.max(.07,rod[3]/2-f[3]*.008),beh:BEH.dart.includes(f[0])?'dart':BEH.power.includes(f[0])?'power':'steady'});this.q('rfi').textContent=f[2];this.q('rfn').textContent=(perfect?'\u2728 Perfect hook! ':'')+(f[3]>=4?'It\'s HUGE!':f[3]>=3?'Strong fish!':f[3]>=2?'Nice pull!':'Something\'s on!')}
  this.q('reel').style.display='block';this.q('rbar').style.width=(this.hw*200)+'%';this.splash(this.bob.position.x,this.bob.position.z,10,1);snd(500,.1,'square',.1,700)},
 reelStep(dt,hold){this.rt+=dt;this.bv+=(hold?2.6:-2.2)*dt;this.bv*=Math.max(0,1-2.4*dt);this.bp+=this.bv*dt;if(this.bp<this.hw){this.bp=this.hw;this.bv=Math.max(0,this.bv)}if(this.bp>1-this.hw){this.bp=1-this.hw;this.bv=Math.min(0,this.bv)}
  this.fto-=dt;if(this.fto<=0){const b=this.beh;if(b==='dart'){this.ft=.05+Math.random()*.9;this.fto=.25+Math.random()*.5}else if(b==='power'){this.ft=Math.random()<.5?.08+Math.random()*.2:.7+Math.random()*.25;this.fto=.9+Math.random()*1.1}else{this.ft=.05+Math.random()*.9;this.fto=.5+Math.random()}}
  const spd=this.fsp*(this.beh==='dart'?1.35:this.beh==='power'?1.15:1);this.fp+=Math.sign(this.ft-this.fp)*Math.min(Math.abs(this.ft-this.fp),spd*dt*(1+Math.random()*.4));
  const ins=Math.abs(this.fp-this.bp)<this.hw;if(!ins&&this.rt>1.5)this.outT+=dt;const p0=this.pr;this.pr+=(ins?.28:-.2)*dt;
  this.q('rbar').style.left=((this.bp-this.hw)*100)+'%';this.q('rbar').style.background=ins?'rgba(61,220,132,.8)':'rgba(255,120,80,.55)';this.q('rfi').style.left=(this.fp*100)+'%';this.q('rpg').firstElementChild.style.width=(this.pr*100)+'%';
  if(p0<.5&&this.pr>=.5)snd(700,.08,'sine',.08,900);if(p0<.8&&this.pr>=.8)snd(900,.08,'sine',.08,1200);
  if(this.pr>=1)this.land();else if(this.pr<=0){this.msg('The fish escaped!');const e=this.hooked;this.cancelCast();if(e&&e.m){e.st='flee';e.t=0;e.a=Math.random()*6.283}snd(150,.3,'sawtooth',.1,60)}},
 land(){const D=this.D,fs=this.fish,sp=fs.sp,P=this.P,bp=this.bob.position,from=new V3(bp.x,this.wy,bp.z),e=this.hooked;let model,c,html,xp=0;this.splash(bp.x,bp.z,14,1.3);
  this.reelIn();this.fst='idle';this.hooked=null;this.ae=null;if(e&&e.m)this.rmFish(e);
  if(sp){const S=SPC[sp],v=sp==='chest'?Math.round(rnd(120,320)*(1+D.rod*1.1)):S[2];D.m+=v;xp=sp==='chest'?25:2;c=sp==='chest'?'#ffd23a':'#9a8a70';model=junkModel(sp);
   html=`<div class="fcd" style="border-color:${c}"><div class="fe">${S[1]}</div><b>${S[0]}</b><div style="color:${c};font-weight:800">${sp==='chest'?'TREASURE!':'Junk'}</div><div>+$${v}</div><small>+${xp} XP</small></div>`;snd(sp==='chest'?1000:300,.4,'sine',.14,sp==='chest'?1700:200);if(sp==='chest')try{sfx('victory',.6)}catch(x){}}
  else{const {f,kg,mu}=fs,fl=this.outT<.4&&this.rt>2.2,it=[f[0],kg,mu,fl?1:0];D.bag.push(it);const b=D.book[f[0]]||(D.book[f[0]]={n:0,max:0}),neu=b.n===0,rec=b.n>0&&kg>b.max;b.n++;b.max=Math.max(b.max,kg);this.cg=[++this.cgn,f[1],kg,f[3]];this.reqProg(f,kg);
   xp=Math.round(((f[3]+1)*10+Math.sqrt(kg)*2)*(1+mu*.3)*(fl?1.25:1));c=RC[f[3]];model=fishModel(f[0]);applyMut(model,mu);const v=this.val(it);
   html=`<div class="fcd" style="border-color:${c}"><div class="fe">${f[2]}</div><b>${MUT[mu][0]?MUT[mu][0]+' ':''}${f[1]}</b><div style="color:${c};font-weight:800">${RAR[f[3]]}</div><div>${kg} kg \u00b7 $${v}</div><small style="color:#7dff9a">+${xp} XP${fl?' \u00b7 FLAWLESS +15%':''}</small>${neu?'<br><small style="color:#ffd23a">NEW CATCH!</small>':rec?'<br><small style="color:#ffd23a">NEW RECORD!</small>':''}</div>`;
   snd(f[3]>=3?1000:700,.4,'sine',.16,f[3]>=3?1800:1100);if(f[3]>=4)try{sfx('victory',.7)}catch(x){}
   if(f[3]>=3){shk=.3;for(let i=0;i<8;i++)setTimeout(()=>{if(cur===this)fxBurst(P.x+rnd(-4,4),P.y+4+rnd(0,4),P.z+rnd(-4,4),[0xffd23a,0xff4081,0xb45cff][i%3])},i*80)}}
  const sz=sp?2.2:clamp(1.6+Math.cbrt(fs.kg)*.55,2,9);model.scale.multiplyScalar(sz);this.G.add(model);this.show={m:model,t:0,from};const cd=this.q('fcard');cd.innerHTML=html;cd.style.display='block';this.pop=Date.now()/1000+2.8;
  this.addXp(xp);this.save()},
 /* ----- shop ----- */
 shopHTML(){const D=this.D,t=this.tab||'sell',ni=this.ni||0,N=NPCD[ni],T=[['sell','\ud83d\udcb0 Sell'],['req','\ud83d\udcdc Request'+(D.rq[ni]&&D.rq[ni].h>=D.rq[ni].n?' \u2757':'')],['rods','\ud83c\udfa3 Rods'],['bait','\ud83e\udeb1 Bait'],['bag','\ud83c\udf92 Bag'],['book','\ud83d\udcd6 Book']];let b='';
  if(t==='sell'){const tot=D.bag.reduce((a,i)=>a+this.val(i),0),g={};D.bag.forEach(i=>{g[i[0]]=(g[i[0]]||0)+1});b='<div class="fl">'+(D.bag.length?Object.keys(g).map(id=>{const f=FISH.find(x=>x[0]===id);return `<div class="fr"><span>${f[2]} ${f[1]}</span><b style="color:${RC[f[3]]}">${RAR[f[3]]}</b><span>x${g[id]}</span></div>`}).join(''):'<small>Your bag is empty. Go catch some fish!</small>')+`</div><button data-a="sell" ${D.bag.length?'':'disabled'}>Sell all (+$${fm(tot)})</button>`}
  else if(t==='req'){const q=D.rq[ni];b='<div class="fl">'+(q?`<div class="fr"><span><b>\ud83d\udcdc ${q.d}</b><br><small>Progress ${Math.min(q.h,q.n)}/${q.n} \u00b7 Reward $${fm(q.r)} + ${q.x} XP</small></span>${q.h>=q.n?'<button data-a="claim">Claim!</button>':'<button data-a="skip">Skip</button>'}</div>`:'<small>No request right now.</small>')+'<small>Requests keep coming. Fish anywhere to make progress.</small></div>'}
  else if(t==='rods')b='<div class="fl">'+RODS.map((r,i)=>`<div class="fr"><span><b>${r[0]}</b><br><small>Luck +${Math.round(r[2]*100)}% \u00b7 Control ${Math.round(r[3]*100)} \u00b7 Lure x${r[4]}</small></span>${D.own[i]?`<button data-a="eqrod" data-v="${i}" ${D.rod===i?'disabled':''}>${D.rod===i?'Equipped':'Equip'}</button>`:`<button data-a="buyrod" data-v="${i}" ${D.m<r[1]?'disabled':''}>$${fm(r[1])}</button>`}</div>`).join('')+'</div>';
  else if(t==='bait')b='<div class="fl">'+BAITS.map((r,i)=>`<div class="fr"><span><b>${r[0]}</b> <small>x${D.bait[i]}</small><br><small>Luck +${Math.round(r[2]*100)}% \u00b7 Lure x${r[3]}</small></span><span><button data-a="buybait" data-v="${i}" ${D.m<r[1]*5?'disabled':''}>Buy x5 $${r[1]*5}</button> <button data-a="eqbait" data-v="${i}">${D.be===i?'Unequip':'Equip'}</button></span></div>`).join('')+'</div>';
  else if(t==='bag'){const bc=D.bc||0;b=`<div class="fl"><div class="fr"><span><b>\ud83c\udf92 Bag</b><br><small>${D.bag.length} / ${CAPS[bc]} fish</small></span>${bc<3?`<button data-a="bagup" ${D.m<CAPC[bc]?'disabled':''}>Upgrade to ${CAPS[bc+1]} \u00b7 $${fm(CAPC[bc])}</button>`:'<small>Max size</small>'}</div></div>`}
  else{const n=Object.keys(D.book).length;b=`<div class="fl"><small>Discovered ${n}/${FISH.length}</small>`+FISH.map(f=>{const k=D.book[f[0]];return k?`<div class="fr"><span>${f[2]} ${f[1]}</span><b style="color:${RC[f[3]]}">${RAR[f[3]]}</b><small>x${k.n} \u00b7 best ${k.max} kg</small></div>`:`<div class="fr" style="opacity:.4"><span>\u2754 ???</span><small>${['Lake','Swamp','','Bay'][f[7]===1?0:f[7]===2?1:3]}${f[8]?' \u00b7 night':''}</small></div>`}).join('')+'</div>'}
  return `<div style="display:flex;justify-content:space-between;align-items:center"><b>${N.e} ${N.shop} \u00b7 $${fm(D.m)} \u00b7 Lv ${D.lv}</b><button data-a="close">\u2715</button></div><div class="ftabs" style="margin-top:8px">${T.map(x=>`<button data-a="tab" data-v="${x[0]}" class="${t===x[0]?'on':''}">${x[1]}</button>`).join('')}</div>${b}`},
 act(a,v){const D=this.D,ni=this.ni||0;
  if(a==='close'){this.shop=false;this.q('fshop').style.display='none';return}
  if(a==='tab')this.tab=v;
  else if(a==='sell'){const tot=D.bag.reduce((x,i)=>x+this.val(i),0);D.m+=tot;D.bag=[];snd(1000,.3,'sine',.14,1600);const n=this.NP[ni];if(n)say(n.bub,'Pleasure doing business!',2.5)}
  else if(a==='buyrod'){const r=RODS[v];if(D.m>=r[1]){D.m-=r[1];D.own[v]=1;D.rod=+v;snd(900,.3,'sine',.14,1400);this.P.rodI=-1}}
  else if(a==='eqrod'){D.rod=+v;this.P.rodI=-1}
  else if(a==='buybait'){const c=BAITS[v][1]*5;if(D.m>=c){D.m-=c;D.bait[v]+=5;D.be=+v;snd(700,.15,'sine',.12,1000)}}
  else if(a==='eqbait'){D.be=D.be===+v?-1:+v}
  else if(a==='bagup'){const bc=D.bc||0;if(bc<3&&D.m>=CAPC[bc]){D.m-=CAPC[bc];D.bc=bc+1;snd(900,.3,'sine',.14,1500)}}
  else if(a==='claim'){const q=D.rq[ni];if(q&&q.h>=q.n){D.m+=q.r;this.addXp(q.x);D.rq[ni]=this.genReq(ni);snd(1000,.4,'sine',.15,1700);const n=this.NP[ni];if(n)say(n.bub,'Thank you! Here you go!',3)}}
  else if(a==='skip'){D.rq[ni]=this.genReq(ni)}
  this.save();this.q('fshop').innerHTML=this.shopHTML()},
 toggleShop(ni){this.shop=!this.shop;if(ni!=null)this.ni=ni;const p=this.q('fshop');p.style.display=this.shop?'block':'none';if(this.shop){p.innerHTML=this.shopHTML();const n=this.NP[this.ni];if(n)say(n.bub,pickOf(n.d.lines),3)}},
 reset(){const L=LOCS[this.loc];Object.assign(this.P,{x:L[1],y:1,z:L[2]+30,vy:0});this.cancelCast()},
 setLoc(k){this.loc=k;this.LG.forEach((g,i)=>g.visible=i===k);this.FS.forEach((l,i)=>l.forEach(e=>{e.m.visible=i===k;if(e.ring)e.ring.visible=i===k}));this.NP.forEach(n=>n.c.g.visible=n.k===k);this.AN.forEach(n=>{n.c.g.visible=n.k===k;n.bob.visible=n.ln.visible=n.k===k});
  this.pads.forEach(p=>p.m.visible=Math.abs(p.x-LOCS[k][1])<60);this.wtgt.setHex([0x2a7fd4,0x3d6b4a,0x14b8c9][k])},
 sky(T,dt){const dl=(Math.sin(T/300*6.283)+1)/2;this.night=dl<.3;const wk2=Math.floor(T/240),ph=T%240,rainOn=mulb(wk2*7919+13)()<.32&&ph>20&&ph<150;this.rainOn=rainOn;this.rw+=((rainOn?1:0)-this.rw)*Math.min(1,dt*.6);
  const b=this.col.setHex(0x0a0f2a).lerp(this.c2.setHex(0x87c7ff),Math.min(1,dl*1.4)),ow=Math.max(0,1-Math.abs(dl-.45)/.2)*.7;if(ow>0)b.lerp(this.c3.setHex(0xff9a5a),ow);b.lerp(this.c4.setHex(0x59636e),this.rw*.55*Math.min(1,dl*2+.3));
  scene.background.copy(b);scene.fog.color.copy(b);scene.fog.near=150-90*this.rw;scene.fog.far=400-160*this.rw;this.hemi.intensity=(.22+.5*dl)*(1-.25*this.rw);sun.intensity=(.08+.55*dl)*(1-.5*this.rw);
  const a=T/300*6.283,cp=camera.position,sy=Math.sin(a);this.sunM.position.set(cp.x+Math.cos(a)*300,cp.y+sy*230,cp.z-190);this.sunM.visible=sy>-.08&&this.rw<.7;this.moonM.position.set(cp.x-Math.cos(a)*300,cp.y-sy*230,cp.z-190);this.moonM.visible=sy<.08&&this.rw<.7;
  this.stars.position.copy(cp);this.stars.material.opacity=clamp(1-dl*2.4,0,.9)*(1-this.rw);this.clouds.forEach(c=>{c.position.x+=c.userData.v*dt;if(c.position.x>this.P.x+260)c.position.x-=520;c.children.forEach(m=>m.material.color.setHex(0xffffff).lerp(this.c4,this.rw*.6+(1-dl)*.5))});
  this.rain.visible=this.rw>.05;if(this.rain.visible){const p=this.rain.geometry.attributes.position,n=p.count/2;this.rain.position.set(this.P.x,this.P.y,this.P.z);this.rain.material.opacity=.45*this.rw;for(let i=0;i<n;i++){let y=p.getY(i*2)-70*dt;if(y<0)y+=40;p.setY(i*2,y);p.setY(i*2+1,y+1.6)}p.needsUpdate=true}},
 start(){
  this.load();baseScene(0x87c7ff);showOver('');yaw=Math.PI;this.pads=[];const S=this.S=[],G=this.G=new THREE.Group();scene.add(G);this.hemi=scene.children.find(o=>o.isHemisphereLight);
  this.wy=-1.2;this.col=new THREE.Color();this.c2=new THREE.Color();this.c3=new THREE.Color();this.c4=new THREE.Color();this.wcol=new THREE.Color(0x2a7fd4);this.wtgt=new THREE.Color(0x2a7fd4);this.tv=new V3();this.loc=0;this.fst='idle';this.cgn=0;this.cg=null;this.bu=-1;this.night=false;this.rw=0;this.ep=false;this.fpv=false;this.shop=false;this.tab='sell';this.ni=0;this.pcd=0;this.mt=0;this.pop=0;this.pw=0;this.pd=1;this.rm=new Set();this.show=null;this.hooked=null;this.ae=null;this.dip=0;this.perfect=false;this.FS=[[],[],[]];this.spT=[0,0,0];this.arm=-.9;this.bend=0;this.fovT=60;this.LOCS=LOCS;
  buildWorld(this);
  this.water=new THREE.Mesh(new THREE.PlaneGeometry(300,300,50,50),new THREE.MeshLambertMaterial({color:0x2a7fd4,transparent:true,opacity:.7}));this.water.rotation.x=-Math.PI/2;scene.add(this.water);
  /* sky: sun, moon, stars, clouds, gulls, rain */
  this.sunM=new THREE.Mesh(new THREE.SphereGeometry(16,16,12),new THREE.MeshBasicMaterial({color:0xfff2b0,fog:false}));this.moonM=new THREE.Mesh(new THREE.SphereGeometry(11,16,12),new THREE.MeshBasicMaterial({color:0xe8eeff,fog:false}));scene.add(this.sunM,this.moonM);
  {const sp=new Float32Array(900),r=mulb(7);for(let i=0;i<300;i++){const a=r()*6.283,e=Math.acos(r()*.95),d=420;sp[i*3]=Math.sin(e)*Math.cos(a)*d;sp[i*3+1]=Math.cos(e)*d;sp[i*3+2]=Math.sin(e)*Math.sin(a)*d}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(sp,3));this.stars=new THREE.Points(g,new THREE.PointsMaterial({color:0xffffff,size:2,sizeAttenuation:false,transparent:true,opacity:0,fog:false}));scene.add(this.stars)}
  this.clouds=[];{const r=mulb(11);for(let i=0;i<9;i++){const c=new THREE.Group();for(let j=0;j<4;j++){const m=new THREE.Mesh(new THREE.SphereGeometry(1,8,6),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.85}));m.scale.set(8+r()*6,3.5+r()*2,6+r()*4);m.position.set(j*7-10,r()*2,r()*4);c.add(m)}c.position.set(r()*520-260,70+r()*30,r()*400-250);c.userData.v=1.5+r()*2;scene.add(c);this.clouds.push(c)}}
  {const sp=new Float32Array(260*6),r=mulb(5);for(let i=0;i<260;i++){const x=r()*80-40,y=r()*40,z=r()*80-40;sp.set([x,y,z,x,y+1.6,z],i*6)}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(sp,3));this.rain=new THREE.LineSegments(g,new THREE.LineBasicMaterial({color:0xbfd8ff,transparent:true,opacity:.4,fog:false}));this.rain.frustumCulled=false;this.rain.visible=false;scene.add(this.rain)}
  this.birds=[];for(let i=0;i<4;i++){const b=new THREE.Group();b.add(wk(GS,0xffffff,.8,.5,1.6,0,0,0));const w=[-1,1].map(s=>{const q=new THREE.Group();q.add(wk(GB,0xf0f0f0,1.8,.08,.7,s*.9,0,0));b.add(q);return q});b.userData={w,a:i*1.6,r:40+i*12,h:26+i*4,s:.25+i*.05};scene.add(b);this.birds.push(b)}
  /* splash + ripple pools */
  this.drops=[];for(let i=0;i<40;i++){const m=new THREE.Mesh(new THREE.SphereGeometry(.18,6,4),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true}));m.visible=false;scene.add(m);this.drops.push({m,l:0,vx:0,vy:0,vz:0})}
  this.rips=[];for(let i=0;i<10;i++){const m=new THREE.Mesh(new THREE.RingGeometry(.7,.9,24),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,side:THREE.DoubleSide}));m.rotation.x=-Math.PI/2;m.visible=false;scene.add(m);this.rips.push({m,l:0,mx:1,s:1})}
  /* bobber, "!" marker, line */
  this.bob=mkBob();this.bob.visible=false;scene.add(this.bob);this.line=mkLine(16);scene.add(this.line);
  /* fireflies */
  {const sp=new Float32Array(120),r=mulb(9);for(let i=0;i<40;i++)sp.set([r()*60-30,1+r()*5,r()*60-30],i*3);const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(sp,3));this.ff=new THREE.Points(g,new THREE.PointsMaterial({color:0xfff27a,size:.7,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false}));scene.add(this.ff)}
  this.P=newP(0,1,36);this.P.rod=mkRod(this.D.rod);this.P.rodI=this.D.rod;this.P.J.aR.add(this.P.rod);this.P.rod.visible=true;
  for(let k=0;k<3;k++)for(let i=0;i<10;i++)this.mkFish(k);
  this.setLoc(0);
  [0,1,2].forEach(i=>{if(!this.D.rq[i])this.D.rq[i]=this.genReq(i)});this.save();
  this.w=gw('<div id="fst"><div class="fr1"><b id="flv">Lv 1</b><div id="fxp"><i></i></div></div><div id="fln"></div><div id="fq"></div></div><div id="fhud"><div id="fpw"><i></i><u></u></div><button id="fbtn">🎣 Cast</button></div><button id="ftalk">💬 Talk</button><div id="fbang">!</div><div id="reel"><div id="rfn">Something is on!</div><div id="rtr"><div id="rbar"></div><div id="rfi">🐟</div></div><div id="rpg"><i></i></div><small>Hold E (or the button) to lift the green bar. Keep it on the fish!</small></div><div id="fcard"></div><div id="fshop"></div>');
  const fb=this.q('fbtn');fb.onpointerdown=e=>{e.preventDefault();keys.KeyE=true};['pointerup','pointerleave','pointercancel'].forEach(v=>fb.addEventListener(v,()=>{keys.KeyE=false}));
  this.q('fshop').onclick=e=>{const b=e.target.closest('[data-a]');if(b)this.act(b.dataset.a,b.dataset.v)};this.q('ftalk').onclick=()=>{if(this.fst==='idle'&&this.nearN>=0)this.toggleShop(this.nearN)}},
 upd(id,v,h){const c=this.hc||(this.hc={});if(c[id]===v)return;c[id]=v;const e=this.q(id);if(e){if(h)e.innerHTML=v;else e.textContent=v}},
 update(dt){
  dt=Math.min(dt,.05);if(!this.tip)this.tip=new V3();
  const P=this.P,T=Date.now()/1000,D=this.D,rod=RODS[D.rod],fx=-Math.sin(yaw),fz=-Math.cos(yaw);
  this.sky(T,dt);
  let k=0,bd=1e9;LOCS.forEach((l,i)=>{const d=Math.hypot(P.x-l[1],P.z-l[2]);if(d<bd){bd=d;k=i}});if(k!==this.loc)this.setLoc(k);
  /* water, props */
  this.wcol.lerp(this.wtgt,Math.min(1,dt*2));this.water.material.color.copy(this.wcol);
  const wx=Math.round(P.x/5)*5,wz=Math.round(P.z/5)*5,pa=this.water.geometry.attributes.position,rw=this.rw;this.water.position.set(wx,this.wy,wz);for(let i=0;i<pa.count;i++){const X=wx+pa.getX(i),Z=wz-pa.getY(i);pa.setZ(i,Math.sin(X*.12+T*1.4)*.16+Math.cos(Z*.1+T*1.1)*.14+rw*Math.sin(X*.5+T*4)*.07)}pa.needsUpdate=true;
  this.foams.forEach((f,i)=>{f.material.opacity=.28+.12*Math.sin(T*1.6+i);f.scale.setScalar(1+.015*Math.sin(T*1.2+i))});this.flames.forEach(f=>{f.m.scale.y=1+Math.sin(T*12+f.ph)*.2});this.bobs.forEach(b=>{b.m.position.y=b.y+Math.sin(T*1.3+b.ph)*.12;b.m.rotation.z=Math.sin(T*1.1+b.ph)*.03});this.pads.forEach(p=>{p.rg.rotation.z+=dt*1.5;p.m.rotation.y+=dt});
  this.birds.forEach(b=>{const u=b.userData;u.a+=dt*u.s;b.position.set(LOCS[k][1]+Math.cos(u.a)*u.r,u.h+Math.sin(T+u.r)*2,LOCS[k][2]+Math.sin(u.a)*u.r);b.rotation.y=-u.a;u.w.forEach((w,i)=>w.rotation.z=(i?1:-1)*Math.sin(T*7+u.r)*.5);b.visible=!this.night&&this.rw<.6});
  this.ff.position.set(P.x,0,P.z);this.ff.material.opacity=this.night&&k!==2?.9:0;this.ff.material.size=.6+.25*Math.sin(T*3);this.fx2(dt);
  if(P.rodI!==D.rod){P.J.aR.remove(P.rod);P.rod=mkRod(D.rod);P.rod.visible=true;P.J.aR.add(P.rod);P.rodI=D.rod}
  const eD=!!keys.KeyE,eP=eD&&!this.ep,eU=!eD&&this.ep;this.ep=eD;const fP=!!keys.KeyF&&!this.fpv;this.fpv=!!keys.KeyF;
  /* shopkeepers + ambient anglers */
  let nearN=-1;this.NP.forEach(n=>{if(n.k!==k)return;npcTick(n.c,P,dt);const d=Math.hypot(P.x-n.c.x,P.z-n.c.z);if(d<8&&nearN<0)nearN=n.i;const u=n.bub.userData;u.t-=dt;if(u.t<=0)n.bub.visible=false;
   if(d<14){if(!n.hi){n.hi=true;n.c.emote='wave';n.we=2;say(n.bub,'Hi! Welcome to '+n.d.shop+'!',3.4)}n.wt-=dt;if(n.wt<=0&&!n.bub.visible){n.wt=rnd(7,12);say(n.bub,pickOf(n.d.lines),3.6)}}else n.hi=false;if(n.we>0){n.we-=dt;if(n.we<=0)n.c.emote=null}});
  this.AN.forEach(a=>{if(a.k!==k)return;const c=a.c,b=a.bob;c.gr=true;c.hs=0;c.vy=0;c.t+=dt;animate(c,dt);a.t-=dt;let arm=-.95,bend=0;const u=a.bub.userData;u.t-=dt;if(u.t<=0)a.bub.visible=false;
   if(a.st===0){b.position.y=this.wy+.25+Math.sin(T*3+a.ox)*.08;if(a.t<=0){a.st=1;a.t=1.2}}
   else if(a.st===1){b.position.y=this.wy-.2+Math.sin(T*30)*.12;bend=.3;if(a.t<.8)arm=-1.7;if(a.t<=0){a.st=2;a.t=.9;this.splash(b.position.x,b.position.z,8,1)}}
   else{arm=-1.7+(1-a.t/.9)*.8;bend=.2;b.position.y=this.wy+.4;if(a.t<=0){a.st=0;a.t=rnd(14,34);say(a.bub,Math.random()<.65?pickOf(['Got one! \ud83d\udc1f','Nice catch! \ud83c\udfa3','Look at this one! \ud83d\udc20','Gotcha! \ud83d\udc21']):pickOf(['Aw, it got away...','Missed it!']),3)}}
   c.J.aR.rotation.x=arm;bendRod(a.rod,bend);c.g.updateMatrixWorld(true);a.rod.userData.tip.getWorldPosition(this.tv);setLine(a.ln,this.tv,b.position,.9,0,0)});
  this.nearN=nearN;this.q('ftalk').style.display=nearN>=0&&this.fst==='idle'&&!this.shop?'block':'none';
  if(fP&&this.fst==='idle'&&nearN>=0)this.toggleShop(nearN);else if(this.shop&&(nearN<0||nearN!==this.ni))this.toggleShop();
  const busy=this.fst!=='idle'||this.shop;
  if(busy){P.hs=0;P.emote=null;P.t+=dt;animate(P,dt);orbitCam(P)}else ctrl(P,dt,this.S);
  if(P.y<-5&&this.fst==='idle'){const L=LOCS[k];this.splash(P.x,P.z,16,1.4);snd(160,.4,'sine',.14,60);Object.assign(P,{x:L[1],y:1,z:L[2]+30,vy:0});this.msg('Splash! You swam back to the dock.')}
  this.pcd-=dt;if(this.fst==='idle'&&this.pcd<=0)for(const p of this.pads)if(Math.hypot(P.x-p.x,P.z-p.z)<2.6&&Math.abs(p.x-LOCS[k][1])<60){const L=LOCS[p.to];Object.assign(P,{x:L[1],y:1,z:L[2]+(p.to===0?12:6),vy:0});this.pcd=1.5;snd(400,.3,'sine',.12,900);break}
  /* fishing state machine */
  const st=this.fst,bob=this.bob;
  if(st==='idle'){if(eP&&!this.shop&&P.gr){if(D.bag.length>=this.cap()){this.msg('Bag full! Sell fish at a shop (F).');snd(200,.2,'square',.08,120)}else{this.fst='charge';this.pw=0;this.pd=1;snd(300,.1,'sine',.08,500)}}}
  else if(st==='charge'){this.pw+=this.pd*dt*1.1;if(this.pw>=1){this.pw=1;this.pd=-1}if(this.pw<=0){this.pw=0;this.pd=1}P.yaw=yaw+Math.PI;
   if(eU){const perfect=this.pw>=.88,dist=12+this.pw*46+(perfect?3:0),tx=P.x+fx*dist,tz=P.z+fz*dist;if(!this.inWater(tx,tz)){this.msg('Cast into open water!');this.fst='idle'}else{this.perfect=perfect;if(perfect)this.msg('\u2728 Perfect cast!');this.bu=D.be>=0&&D.bait[D.be]>0?D.be:-1;if(this.bu>=0)D.bait[this.bu]--;this.save();this.tgt={x:tx,z:tz,d:dist};this.ts=0;this.fst='throw';snd(500,.25,'sine',.12,200)}}}
  else if(st==='throw'){this.ts+=dt;P.yaw=yaw+Math.PI;if(this.ts>=.22){this.ct=0;this.cs=this.tip.clone();this.fst='cast';bob.visible=true;this.line.visible=true}}
  else if(st==='cast'){this.ct+=dt;const u=Math.min(1,this.ct/.7);bob.position.set(this.cs.x+(this.tgt.x-this.cs.x)*u,this.cs.y+(this.wy+.25-this.cs.y)*u+Math.sin(u*Math.PI)*8,this.cs.z+(this.tgt.z-this.cs.z)*u);bob.rotation.y+=dt*8;P.yaw=yaw+Math.PI;
   if(u>=1){this.fst='wait';this.tw=(6+Math.random()*6)/(rod[4]*(this.bu>=0?BAITS[this.bu][3]:1));this.dip=0;this.splash(this.tgt.x,this.tgt.z,10,1);snd(180,.2,'sine',.1,80)}}
  else if(st==='wait'){this.tw-=dt;this.dip=Math.max(0,this.dip-dt);bob.position.y=this.wy+.25+Math.sin(T*3)*.08-(this.dip>0?.35*Math.sin(this.dip/.22*Math.PI):0);
   if(eP)this.cancelCast();
   else if(this.hooked){this.fst='bite';this.tb=1.5;this.bt0=T;this.q('fbang').style.display='block';snd(900,.15,'square',.1,1400);this.splash(bob.position.x,bob.position.z,6,.8)}
   else if(this.tw<=0&&!this.ae){const r=this.pick(this.tgt.d);if(r.sp){this.hooked={sp:r.sp};this.fish=r}else{const e=this.mkFish(this.loc,{x:bob.position.x,z:bob.position.z},r);e.st='curious';e.t=0;this.ae=e}this.tw=(6+Math.random()*6)/(rod[4]*(this.bu>=0?BAITS[this.bu][3]:1))}}
  else if(st==='bite'){this.tb-=dt;bob.position.y=this.wy-.2+Math.sin(T*30)*.15;this.q('fbang').style.transform='translateX(-50%) scale('+(1+.18*Math.sin(T*20))+')';
   if(eP)this.startReel(T-this.bt0<.35);else if(this.tb<=0){this.msg('It got away...');const e=this.hooked;this.cancelCast();if(e&&e.m){e.st='flee';e.t=0;e.a=Math.random()*6.283}}}
  else if(st==='reel'){bob.position.y=this.wy+.2+Math.sin(T*20)*.1;this.reelStep(dt,eD||keys.Space)}
  this.fishTick(dt,T);
  /* body + rod animation */
  const f2=this.fst;if(f2!=='idle'&&!this.shop&&f2!=='charge'&&f2!=='throw')P.yaw=yaw+Math.PI;
  let ta=-.9,bd2=0;if(f2==='charge')ta=-1.1-1.6*this.pw;else if(f2==='throw')ta=-2.7+(this.ts/.22)*2;else if(f2==='cast')ta=-1;else if(f2==='wait')ta=-1+Math.sin(T*1.5)*.03;else if(f2==='bite'){ta=-1.15+Math.sin(T*40)*.1;bd2=.3}else if(f2==='reel'){ta=-1.35;bd2=(Math.abs(this.fp-this.bp)<this.hw?.6:.35)+Math.sin(T*25)*.05}
  this.arm+=(ta-this.arm)*Math.min(1,dt*(f2==='throw'?30:10));this.bend+=(bd2-this.bend)*Math.min(1,dt*8);P.J.aR.rotation.x=this.arm;bendRod(P.rod,this.bend);P.rod.visible=true;
  P.g.updateMatrixWorld(true);P.rod.userData.tip.getWorldPosition(this.tip);
  if(f2==='cast'||f2==='wait'||f2==='bite'||f2==='reel'){const dd=Math.hypot(bob.position.x-this.tip.x,bob.position.z-this.tip.z);setLine(this.line,this.tip,bob.position,f2==='reel'?.4:f2==='cast'?2:Math.min(3,1.2+dd/30),f2==='reel'?.12:0,T)}
  /* camera zoom */
  const ft=f2==='reel'?52:f2==='bite'?56:60;camera.fov+=(ft-camera.fov)*Math.min(1,dt*5);if(Math.abs(camera.fov-(this.lf||0))>.05){camera.updateProjectionMatrix();this.lf=camera.fov}
  /* catch showcase + card */
  if(this.show){const s=this.show;s.t+=dt;const to=new V3(P.x,P.y+8.8+Math.sin(T*2)*.25,P.z),u=Math.min(1,s.t/.9);s.m.position.lerpVectors(s.from,to,u);s.m.position.y+=Math.sin(u*Math.PI)*7;s.m.rotation.y+=dt*(u<1?9:1.6);const an=s.m.userData.anim;if(an)an(T,1.2)}
  if(this.pop&&T>this.pop){this.q('fcard').style.display='none';this.pop=0;if(this.show){fxBurst(this.show.m.position.x,this.show.m.position.y,this.show.m.position.z,0xffffff);this.G.remove(this.show.m);this.show=null}}
  /* HUD */
  const D2=this.D,need=this.need(),bait=D2.be>=0?BAITS[D2.be][0]+' x'+D2.bait[D2.be]:'no bait';
  this.upd('flv','Lv '+D2.lv);this.q('fxp').firstElementChild.style.width=Math.min(100,D2.xp/need*100)+'%';
  this.upd('fln','$'+fm(D2.m)+' \u00b7 \ud83c\udf92 '+D2.bag.length+'/'+this.cap()+' \u00b7 '+rod[0]+' \u00b7 '+bait+'<br>'+LOCS[k][0]+' '+(this.night?'\ud83c\udf19':'\u2600\ufe0f')+(this.rainOn?' \ud83c\udf27 Rain: fish bite more!':''),1);
  this.upd('fq',D2.rq.map((q,i)=>q?'<span style="opacity:'+(q.h>=q.n?1:.8)+'">'+(q.h>=q.n?'\u2705':'\ud83d\udcdc')+' '+NPCD[i].name.split(' ').pop()+': '+q.d+' ('+Math.min(q.h,q.n)+'/'+q.n+')</span>':'').join('<br>'),1);
  this.q('fpw').style.display=f2==='charge'?'block':'none';this.q('fpw').firstChild.style.width=(this.pw*100)+'%';
  this.upd('fbtn',f2==='idle'?'\ud83c\udfa3 Cast':f2==='charge'?'Release!':f2==='bite'?'\u2757 REEL!':f2==='reel'?'Hold!':f2==='wait'?'Reel in':'...');
  const act=this.ae;setB(f2==='bite'?'\u2757 A fish is biting! Press E!':T<this.mt?this.mtxt:f2==='wait'?(act&&act.st==='nibble'?'It\'s nibbling... wait for the dip!':act?'A fish is interested...':'Waiting for a bite... (E to reel in)'):nearN>=0&&!this.shop&&f2==='idle'?'F: talk to '+NPCD[nearN].name:'');
  scoreEl.textContent='Lv '+D2.lv+' \u00b7 $'+fm(D2.m)+' \u00b7 \ud83c\udf92 '+D2.bag.length+'/'+this.cap()+' \u00b7 '+LOCS[k][0]+' '+(this.night?'\ud83c\udf19':'\u2600\ufe0f')}};
})();
