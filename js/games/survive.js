/* Game: Disaster Survival (id: survive) - card, menu info and game engine. */
GAMES.push({id:'survive',name:'Disaster Survival',tag:'Survival',e:'☄️',c:['#ff8a4f','#ff4f6a'],like:'91%',pl:'8.9K',hint:'Vote for a map in the lobby, then survive the disaster! Climb high for floods and lava, avoid red rings (meteors and lightning), dodge cracks (earthquake), find a roof for acid rain, and run from tornadoes. WASD move, Space jump.'});
META.survive={c:'Survival',m:'Multiplayer',t:['Rounds','Map voting']};
ENG.survive={d3:true,NAMES:['Meteor Shower','Flood','Tornado','Earthquake','Lightning Storm','Acid Rain','Lava Rise'],MN:['Pyramid Valley','Little Town','Mountain','Desert Ruins','Harbor','Snowy Village','Castle','Industrial Yard','Sky Ruins'],
 ex(){return{dd:this.dead?1:0,dc:this.cyc,v:this.vote,vc:this.cyc,mk:this.mk,mc:this.cyc}},
 rem(c,q){const d=!!(q.dd&&q.dc===this.cyc);if(d&&!c.dead)explode(c);c.dead=d;c.g.visible=!d},
 buildMap(k){
  if(this.mg)scene.remove(this.mg);const G=this.mg=new THREE.Group();scene.add(G);
  const S=this.S=[{x:0,z:0,r:60,top:0}],rs=mulb(k*77+5);
  const box=(w,h,d,x,z,c,y0)=>{y0=y0||0;const m=slab(w,h,d,x,y0+h/2,z,c);G.add(m);S.push({x,z,hw:w/2,hd:d/2,top:y0+h,bot:y0})};
  const spiral=(cx,cz,H,c)=>{for(let i=1;i<=Math.floor(H/5);i++)box(6,1,6,cx+Math.cos(i)*9,cz+Math.sin(i)*9,c,5*i-1)};
  this.isl.material.color.setHex([0x9bc27a,0x5b9a45,0x78a35a,0x8c9a72,0xd9b878,0x8c97a0,0xe8f0f5,0x7d8a6a,0x777b82,0xa8c8a0][k+1]);
  if(k===0)[[-26,-18],[24,-22],[4,30]].forEach(([cx,cz])=>[[16,5],[12,10],[8,15],[5,20]].forEach(([w,t],i)=>box(w,t,w,cx,cz,[0xb08a5a,0xc29b6a,0xa77f50,0x8f6b43][i])));
  if(k===1){box(10,30,10,0,0,0x9aa3ad);spiral(0,0,30,0xd9a441);
   for(let i=0;i<7;i++){const a=i*.9+.3,ca=Math.cos(a),sa=Math.sin(a),x=ca*33,z=sa*33;box(12,7,12,x,z,[0xd9c7a8,0xc9a98a,0xe2d5b8][i%3]);box(14,1,14,x,z,0xa0453a,7);box(5,3.5,5,x-ca*9,z-sa*9,0x8a8f98)}}
  if(k===2){[[46,4],[36,8],[26,12],[16,16],[8,20]].forEach(([w,t],i)=>box(w,t,w,0,0,[0x7d8a6a,0x8a8a78,0x9a9588,0xa8a8a8,0xe8eef2][i]));
   for(let i=0;i<10;i++){const a=rs()*6.283,r=30+rs()*28,b=new THREE.Mesh(new THREE.SphereGeometry(2+rs()*2,8,6),lam(0x8a8d93));b.position.set(Math.cos(a)*r,1,Math.sin(a)*r);b.castShadow=true;G.add(b)}}
  if(k===3){[[34,4],[26,8],[18,12],[10,16]].forEach(([w,t],i)=>box(w,t,w,0,0,[0xe3c88a,0xd9b878,0xcfa96a,0xc29b5a][i]));
   [[-26,-26],[26,-26],[-26,26],[26,26]].forEach(([x,z])=>box(3,14,3,x,z,0xc9a35f));
   for(let i=0;i<6;i++){const a=i*1.05+.4,r=33+rs()*5;box(11,6,2,Math.cos(a)*r,Math.sin(a)*r,0xb8935a)}}
  if(k===4){[[-30,-20],[22,-24],[0,32]].forEach(([cx,cz],j)=>{for(let l=0;l<3;l++)box(12,4,5,cx+l*5,cz,[0xd04a3a,0x3a7bd0,0xe0a830][(j+l)%3],l*4)});
   box(8,26,8,-2,-2,0xf0f0f0);spiral(-2,-2,26,0xe05050)}
  if(k===5){for(let i=0;i<5;i++){const a=i*1.25+.2,ca=Math.cos(a),sa=Math.sin(a),x=ca*32,z=sa*32;box(10,6,10,x,z,0x8a5a2b);box(12,1,12,x,z,0xffffff,6);box(5,3,5,x-ca*8,z-sa*8,0x9aa0aa)}
   box(8,24,8,0,0,0x9a6a3a);spiral(0,0,24,0xcfd8e0);const pd=new THREE.Mesh(new THREE.CylinderGeometry(9,9,.1,24),lam(0x9fd8ff));pd.position.set(20,.05,-38);G.add(pd)}
  if(k===6){box(18,20,18,0,0,0x9a9aa8);[[26,4],[21,8],[16,12],[11,16]].forEach(([x,t])=>box(5,t,6,x,0,0xb0b0be));[[-14,-14],[14,-14],[-14,14],[14,14]].forEach(([x,z])=>box(7,22,7,x,z,0x8a8a98));
   [[-25,-38],[25,-38],[-25,38],[25,38]].forEach(([x,z])=>box(22,8,3,x,z,0xa8a8b4));[[-38,-25],[-38,25],[38,-25],[38,25]].forEach(([x,z])=>box(3,8,22,x,z,0xa8a8b4))}
  if(k===7){[[-24,-24],[24,-24],[-24,24],[24,24]].forEach(([x,z])=>{box(14,12,14,x,z,0x8a8f98);const sx=x<0?-1:1;box(5,8,5,x+sx*9.5,z,0xe0a830);box(5,4,5,x+sx*14.5,z,0xd04a3a)});box(6,28,6,0,0,0x7a7f88);spiral(0,0,28,0xe05050)}
  if(k===8)for(let i=1;i<=8;i++){const a=i*.6;box(7,1,7,Math.cos(a)*20,Math.sin(a)*20,[0x9fd0e8,0xc9a0dc,0xf2c46d][i%3],4*i-1)}
  [[0,-1],[.87,.5],[-.87,.5]].forEach(([ca,sa])=>{const x=ca*44,z=sa*44;box(12,1,12,x,z,0xcfd3da,8);[[-5,-5],[5,-5],[-5,5],[5,5]].forEach(([a,b])=>box(1.5,8,1.5,x+a,z+b,0xb8bcc4))});
  if(k!==4&&k!==7)for(let i=0;i<16;i++){const a=rs()*6.283,r=40+rs()*17,x=Math.cos(a)*r,z=Math.sin(a)*r,pine=k===2||k===5,cac=k===3;
   const tr=new THREE.Mesh(new THREE.CylinderGeometry(cac?1:.7,cac?1:.9,cac?7:4,7),lam(cac?0x3f8f3f:0x7a5230));tr.position.set(x,cac?3.5:2,z);tr.castShadow=true;G.add(tr);
   if(!cac){const lf=new THREE.Mesh(pine?new THREE.ConeGeometry(3.2,8,8):new THREE.SphereGeometry(3.4,10,8),lam(k===5?0x2b5e3a:pine?0x2f6b3a:0x4caf50));lf.position.set(x,pine?7:6.2,z);lf.castShadow=true;G.add(lf)}}},
 start(){
  baseScene(0x87c7ff);showOver('');
  const isl=new THREE.Mesh(new THREE.CylinderGeometry(60,60,4,48),lam(0x5b9a45));isl.position.y=-2;isl.receiveShadow=true;scene.add(isl);this.isl=isl;
  const sea=new THREE.Mesh(new THREE.PlaneGeometry(900,900),new THREE.MeshBasicMaterial({color:0x2a7fd4}));sea.rotation.x=-Math.PI/2;sea.position.y=-6;scene.add(sea);
  this.fl=new THREE.Mesh(new THREE.CylinderGeometry(75,75,1,40),new THREE.MeshBasicMaterial({color:0x3d8fe0,transparent:true,opacity:.6}));this.fl.visible=false;scene.add(this.fl);
  this.tw=new THREE.Group();for(let i=0;i<7;i++){const r=new THREE.Mesh(new THREE.CylinderGeometry(2.4+i*1.5,1.6+i*1.5,6,14,1,true),new THREE.MeshLambertMaterial({color:0x8a8f98,transparent:true,opacity:.75,side:THREE.DoubleSide}));r.position.y=3+i*5.5;this.tw.add(r)}this.tw.visible=false;scene.add(this.tw);this.CR=[];this.LB=[];this.seen=false;this.wait=false;const rp0=new Float32Array(900),rs0=mulb(9);for(let i=0;i<300;i++){rp0[i*3]=(rs0()-.5)*90;rp0[i*3+1]=rs0()*60;rp0[i*3+2]=(rs0()-.5)*90}const rg=new THREE.BufferGeometry();rg.setAttribute('position',new THREE.BufferAttribute(rp0,3));this.rain=new THREE.Points(rg,new THREE.PointsMaterial({color:0x8aff6a,size:1.1}));this.rain.visible=false;this.rain.frustumCulled=false;scene.add(this.rain);
  this.P=newP(0,0,0);this.M=[];this.cyc=-1;this.n=0;this.hp=100;this.dead=false;this.sk=null;this.vote=-1;this.mk=-1;this.ts=performance.now();this.mg=null;this.buildMap(-1);
  this.vu=voteUI(this.MN,i=>{if(Date.now()/1000%60<9&&!this.dead)this.vote=i})},
 update(dt){
  const P=this.P,T=Date.now()/1000,cyc=Math.floor(T/60),s=T-cyc*60,d=Math.floor(mulb(cyc)()*7),t=s-19,act=s>=19&&s<54&&this.lk;
  const hurt=a=>{if(this.dead||this.wait)return;this.hp-=a;if(this.hp<=0){this.hp=0;this.dead=true;shk=1;explode(P);P.g.visible=false}};
  if(cyc!==this.cyc){this.cyc=cyc;this.hp=100;this.dead=false;this.won=false;this.lk=false;this.vote=-1;this.mk=-1;this.wait=!this.seen&&s>=15;this.wsp=0;this.seen=true;P.g.visible=true;clearDebris();this.M.forEach(o=>scene.remove(o.m,o.ring));this.M=[];this.CR.forEach(c=>scene.remove(c.m));this.CR=[];this.LB.forEach(b=>{scene.remove(b.m);if(b.bolt)scene.remove(b.bolt)});this.LB=[];this.buildMap(-1);Object.assign(P,{x:(Math.random()-.5)*20,y:1,z:(Math.random()-.5)*20,vy:0})}
  if(s>=12&&!this.lk&&performance.now()-this.ts>2500){this.lk=true;this.mk=pickMap(9,cyc,this.vote);this.buildMap(this.mk);const sa=Math.random()*6.283;Object.assign(P,{x:Math.cos(sa)*48,y:1,z:Math.sin(sa)*48,vy:0});snd(660,.15,'sine',.12,990)}
  const sk=act?[0xd9763a,0x7c8fa3,0x6f7480,0x8a6f5a,0x3b3f58,0x7d9a6a,0x8a3a2a][d]:0x87c7ff;
  if(this.sk!==sk){this.sk=sk;scene.background.setHex(sk);scene.fog.color.setHex(sk)}
  if(this.dead||this.wait){if(this.wait){P.y=-300;P.vy=0;P.g.visible=false;if(!this.wsp){this.wsp=1;SP.on=true;SP.k=null}}if(!specCam())orbitCam(this.wait?{x:0,y:30,z:0}:P)}
  else ctrl(P,dt,this.S);
  const fld=(d===1||d===6)&&this.lk,lvl=fld?(act?-1+t/35*19:(s>=54?Math.max(-1,18-(s-54)/6*19):-1)):-1;
  this.fl.visible=lvl>-.5;this.fl.position.y=lvl;this.fl.material.color.setHex(d===6?0xff5a1a:0x3d8fe0);this.fl.material.opacity=d===6?.9:.6;
  if(!this.dead&&P.y<lvl-1)hurt((d===6?45:25)*dt);
  this.tw.visible=act&&d===2;
  if(act&&d===2){const a=cyc+t*.3,cx=Math.cos(a)*30+Math.sin(a*2.3)*10,cz=Math.sin(a)*30;this.tw.position.set(cx,0,cz);this.tw.rotation.y+=dt*4;
   if(!this.dead){const dx=cx-P.x,dz=cz-P.z,dd=Math.hypot(dx,dz)||1;if(dd<18){const f=(1-dd/18)*16;P.x+=(dx/dd*f-dz/dd*f*.6)*dt;P.z+=(dz/dd*f+dx/dd*f*.6)*dt;if(dd<8){P.vy+=260*dt;hurt(20*dt)}}}}
  if(act&&d===0){const wi=Math.floor(Date.now()/450);if(wi!==this.wi){this.wi=wi;const rs=mulb(wi),an=rs()*6.283,rr=Math.sqrt(rs())*55,x=Math.cos(an)*rr,z=Math.sin(an)*rr;
   const m=new THREE.Mesh(new THREE.SphereGeometry(4,12,12),new THREE.MeshBasicMaterial({color:0xff7a1a}));m.position.set(x,150,z);
   const ring=new THREE.Mesh(new THREE.RingGeometry(0,8,24),new THREE.MeshBasicMaterial({color:0xff2222,transparent:true,opacity:.45}));ring.rotation.x=-Math.PI/2;ring.position.set(x,.2,z);scene.add(m,ring);this.M.push({m,ring})}}
  this.M=this.M.filter(o=>{o.m.position.y-=100*dt;if(o.m.position.y<=3){if(!this.dead&&Math.hypot(P.x-o.m.position.x,P.z-o.m.position.z)<9){hurt(60);shk=.7}scene.remove(o.m,o.ring);return false}return true});
  if(act&&d===3){shk=Math.max(shk,.45);const wi=Math.floor(Date.now()/700);if(wi!==this.cw){this.cw=wi;const rs=mulb(wi+31),x=(rs()-.5)*100,z=(rs()-.5)*100,m=new THREE.Mesh(new THREE.CircleGeometry(8,20),new THREE.MeshBasicMaterial({color:0x6b4a2b,transparent:true,opacity:.7}));m.rotation.x=-Math.PI/2;m.position.set(x,.15,z);scene.add(m);this.CR.push({m,x,z,t:0})}}
  this.CR=this.CR.filter(c=>{c.t+=dt;if(c.t>1)c.m.material.color.setHex(0x111111);if(c.t>1&&!this.dead&&P.y<3&&Math.hypot(P.x-c.x,P.z-c.z)<8)hurt(40*dt);if(c.t>3||!act){scene.remove(c.m);return false}return true});
  if(act&&d===4){const wi=Math.floor(Date.now()/600);if(wi!==this.lw){this.lw=wi;const rs=mulb(wi+77),x=(rs()-.5)*110,z=(rs()-.5)*110,m=new THREE.Mesh(new THREE.RingGeometry(0,6,20),new THREE.MeshBasicMaterial({color:0xffffaa,transparent:true,opacity:.5}));m.rotation.x=-Math.PI/2;m.position.set(x,.25,z);scene.add(m);this.LB.push({m,x,z,t:0})}}
  this.LB=this.LB.filter(b=>{b.t+=dt;if(b.t>1&&!b.h){b.h=1;const bolt=new THREE.Mesh(new THREE.BoxGeometry(1.2,120,1.2),new THREE.MeshBasicMaterial({color:0xffffff}));bolt.position.set(b.x,60,b.z);scene.add(bolt);b.bolt=bolt;shk=.6;snd(120,.3,'sawtooth',.2,40);if(!this.dead&&Math.hypot(P.x-b.x,P.z-b.z)<6)hurt(70)}if(b.t>1.15||!act){scene.remove(b.m);if(b.bolt)scene.remove(b.bolt);return false}return true});
  this.rain.visible=act&&d===5;
  if(act&&d===5){const a=this.rain.geometry.attributes.position;for(let i=0;i<a.count;i++){let y=a.getY(i)-60*dt;if(y<0)y+=60;a.setY(i,y)}a.needsUpdate=true;this.rain.position.set(P.x,0,P.z);
   if(!this.dead&&!this.S.some(sd=>!sd.r&&bt(sd)>=P.y+3&&Math.abs(P.x-sd.x)<sd.hw&&Math.abs(P.z-sd.z)<sd.hd))hurt(7*dt)}
  if(P.y<-20)hurt(999);
  if(s>=54&&!this.won&&!this.dead&&!this.wait){this.won=true;this.n++;snd(660,.2,'sine',.14,990)}
  voteSet(this.vu,tally(9,cyc,this.vote),this.vote,s<12);
  setB(this.wait&&s>=15?'Round in progress \u2014 spectating until the next round':s<9?'Lobby \u2014 vote for a map! '+Math.ceil(9-s)+'s':s<15?(this.mk>=0?'Map: '+this.MN[this.mk]:'Counting votes...')+' \u2014 starting in '+Math.ceil(15-s)+'s':s<19?'\u26a0 '+this.NAMES[d]+' incoming!':act?this.NAMES[d]+' \u2014 '+Math.ceil(54-s)+'s left':this.dead?'You did not survive. Next round soon...':'You survived! \ud83c\udf89');
  specUI(this.dead||this.wait);setHP(this.hp);scoreEl.textContent='Survived: '+this.n+' rounds'}};
