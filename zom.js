/* Game: Zombie Siege (id: zom) - card, menu info and game engine. */
GAMES.push({id:'zom',name:'Zombie Siege',tag:'Co-op FPS',e:'🧟',c:['#3a5f2a','#1b2a14'],like:'95%',pl:'18.3K',hint:'First-person zombie survival. The mouse locks when you press Play. WASD move, mouse aim, click to shoot, right-click to aim down sights, R reload, Q or wheel swap guns, F buys guns, perks and the Mystery Box. Headshots do double damage. Grab power-ups the zombies drop. Vote for a map in the lobby.'});
META.zom={c:'Shooter',m:'Co-op',t:['FPS','Waves'],n:1};
ENG.zom={d3:true,fps:true,MN:['Abandoned Compound','Farmstead','Bunker','Graveyard'],
 ZW:[{n:'M1911',d:34,r:.28,m:8,rs:80,t:1.4,p:1,sp:.012,au:0,c:0,k:.014,col:0x3a3f47,len:.3,f:[900,70]},{n:'MP5',d:22,r:.075,m:30,rs:240,t:1.7,p:1,sp:.03,au:1,c:1000,k:.008,col:0x2b2f36,len:.45,f:[1100,90]},{n:'M16',d:38,r:.11,m:30,rs:210,t:2,p:1,sp:.018,au:1,c:1500,k:.012,col:0x30343c,len:.8,long:1,f:[800,60]},{n:'SPAS-12',d:15,r:.75,m:8,rs:56,t:2.4,p:9,sp:.085,au:0,c:1200,k:.05,col:0x4a3a2a,len:.7,long:1,f:[500,50]},{n:'Kar98',d:150,r:1.1,m:5,rs:35,t:2.6,p:1,sp:.002,au:0,c:2000,k:.06,col:0x5a4630,len:1.1,long:1,pi:1,f:[300,40]},{n:'Ray Gun',d:160,r:.4,m:20,rs:160,t:2.2,p:1,sp:.01,au:0,c:0,k:.02,col:0x35c46a,len:.5,ray:1,f:[1500,300]}],
 ex(){const o={hq:this.hq,pc:this.pc,dd:this.dead?1:0,v:this.vote,vc:0,at:this.at};if(this.host)o.hz={z:this.Z.map(z=>[z.id,Math.round(z.x*10)/10,Math.round(z.z*10)/10,Math.round(z.hp),z.ty]),w:this.wave,ph:this.ph,tm:Math.ceil(this.tm),ks:this.ks,hk:this.hk,ik:Math.round(this.ikT),dp:Math.round(this.dpT),ma:this.ma,m:this.mk,pu:this.PU.map(p=>[p.id,Math.round(p.x),Math.round(p.z),p.ty])};return o},
 rem(c,q,dt){const d=!!q.dd;if(d&&!c.dead)explode(c);c.dead=d;c.g.visible=!d;
  if(typeof q.at==='number'&&q.at!==c.lat){if(c.lat!==undefined){c.att=.2;if(!c.w)wpn(c,'s');muzzle(c)}c.lat=q.at}
  if(c.att>0){c.att-=dt;c.J.aR.rotation.x=-1.5;if(c.w)c.w.visible=true}else if(c.w)c.w.visible=false},
 hitZ(id,dmg,pid,head){const z=this.Z.find(o=>o.id===id);if(!z)return;z.hp-=dmg;if(z.hp<=0){this.Z=this.Z.filter(o=>o!==z);this.ks[pid]=(this.ks[pid]||0)+1;if(head)this.hk[pid]=(this.hk[pid]||0)+1;if(Math.random()<.07)this.PU.push({id:this.nid++,x:z.x,z:z.z,ty:['ma','ik','dp'][Math.floor(Math.random()*3)],life:25})}},
 grab(id){const i=this.PU.findIndex(p=>p.id===id);if(i<0)return;const p=this.PU.splice(i,1)[0],n=Date.now()/1000;if(p.ty==='ma')this.ma++;else if(p.ty==='ik')this.ikT=n+20;else this.dpT=n+20},
 give(wi,own){const w=this.ZW[wi];this.mag[wi]=w.m;this.rsv[wi]=w.rs;this.rl=0;if(!own){if(this.sl[1]<0){this.sl[1]=wi;this.cs=1}else this.sl[this.cs]=wi}},
 wheel(d){if(this.sl[1]>=0&&!this.dead){this.cs=1-this.cs;this.rl=0;snd(500,.05,'square',.06,300)}},
 buildMap(k){
  if(this.mg)scene.remove(this.mg);const G=this.mg=new THREE.Group();scene.add(G);this.cm=k;
  const S=this.S=[{x:0,z:0,hw:62,hd:62,top:0}],rs=mulb(k*53+9),sky=[0x141b2e,0x1a2233,0x241414,0x142018][k];
  scene.background.setHex(sky);scene.fog.color.setHex(sky);scene.fog.near=26;scene.fog.far=140;
  const box=(w,h,d,x,z,c,y0)=>{y0=y0||0;const m=slab(w,h,d,x,y0+h/2,z,c);G.add(m);S.push({x,z,hw:w/2,hd:d/2,top:y0+h,bot:y0})};
  G.add(slab(124,1,124,0,-.5,0,[0x3a3d44,0x4b5a35,0x2c2f36,0x2f3a30][k]));
  [[0,-63,64,1],[0,63,64,1],[-63,0,1,64],[63,0,1,64]].forEach(([x,z,hw,hd])=>box(hw*2,12,hd*2,x,z,[0x25282e,0x5a3d28,0x1f2228,0x2a2d2a][k]));
  this.gates=[[0,-56],[0,56],[-56,0],[56,0]];
  [[-30,-30],[30,-30],[-30,30],[30,30]].forEach(([x,z])=>{const p=new THREE.Mesh(new THREE.CylinderGeometry(.25,.3,9,6),lam(0x333a44));p.position.set(x,4.5,z);const b=new THREE.Mesh(new THREE.SphereGeometry(.7,8,6),new THREE.MeshBasicMaterial({color:0xffe2a8}));b.position.set(x,9.4,z);const L=new THREE.PointLight(0xffd9a0,.9,38);L.position.set(x,9,z);G.add(p,b,L)});
  if(k===0){for(let i=0;i<7;i++){const x=(rs()-.5)*80,z=(rs()-.5)*80,c=i%2?0x7a3b2e:0x2e5a7a;box(12,5,5,x,z,c);if(i%2)box(12,5,5,x,z,c,5)}
   box(10,2,10,0,0,0x888d96);[[-22,-22],[22,-22],[-22,22],[22,22]].forEach(([x,z])=>box(3,12,3,x,z,0x555a63));[[0,-44,14,2],[0,44,14,2],[-44,0,2,14],[44,0,2,14]].forEach(([x,z,w,d])=>box(w,3,d,x,z,0x6b5a3f))}
  if(k===1){box(22,12,16,-30,-28,0x8a2f2f);box(8,20,8,32,-30,0xb8bcc4);box(6,3,4,20,18,0x2e7d32);for(let i=0;i<7;i++)box(4,3,4,(rs()-.5)*80,(rs()-.5)*80,0xd9b84a);
   for(let i=0;i<8;i++){const x=-45+i*13;box(10,2,1,x,38,0x8a5a2b);box(10,2,1,x+3,-44,0x8a5a2b)}}
  if(k===2){[[-50,-30,-12,-30],[12,-30,50,-30],[-50,30,-12,30],[12,30,50,30],[-30,-50,-30,-12],[-30,12,-30,50],[30,-50,30,-12],[30,12,30,50]].forEach(([a,b,c,d])=>box(Math.max(2,Math.abs(c-a)),12,Math.max(2,Math.abs(d-b)),(a+c)/2,(b+d)/2,0x3a3f48));box(8,12,8,0,0,0x4a4f58)}
  if(k===3){for(let i=0;i<28;i++){const x=(rs()-.5)*100,z=(rs()-.5)*100;if(Math.abs(x)<8&&Math.abs(z)<8)continue;box(2,3,1,x,z,0x8a8f98)}box(16,8,12,0,-22,0x6b6f78);
   for(let i=0;i<10;i++){const x=(rs()-.5)*100,z=(rs()-.5)*100,t=new THREE.Mesh(new THREE.CylinderGeometry(.5,.8,9,6),lam(0x2a2018));t.position.set(x,4.5,z);G.add(t)}}},
 start(){
  baseScene(0x0b0f1a);showOver('');PMIN=-1.2;pitch=0;camera.fov=75;camera.updateProjectionMatrix();
  scene.children.forEach(o=>{if(o.isHemisphereLight){o.intensity=.62;o.color.setHex(0x9fb0e0);o.groundColor.setHex(0x2a2a3a)}});sun.intensity=.45;sun.color.setHex(0xa8b8ff);scene.add(camera);
  const fl=new THREE.SpotLight(0xfff1cf,1.7,85,Math.PI/5.5,.55,1.2);fl.position.set(.25,-.2,0);fl.target.position.set(0,0,-12);camera.add(fl);camera.add(fl.target);camera.add(new THREE.PointLight(0xfff2cc,.45,16));
  this.P=newP(0,0,0);this.P.g.visible=false;
  Object.assign(this,{Z:[],PU:[],wave:0,ph:'wait',tm:14,sq:0,sp:0,nid:1,ks:{},hk:{},hseq:{},pcs:{},hq:[],hs:0,pc:[0,0],pcq:0,zm:new Map(),pum:new Map(),pts:500,hp:100,hpm:100,dead:false,sl:[0,-1],cs:0,mag:[8,0,0,0,0,0],rsv:[80,0,0,0,0,0],rl:0,cdf:0,hc:0,rg:0,lw:-1,lks:0,lkh:0,host:false,wasH:false,pk:{jug:0,spd:0,dbl:0},ikT:0,dpT:0,ma:0,lma:null,mk:0,vote:-1,at:0,ads:0,pm:false,pf:false,pq:false,src:[],ik:false,dp:false,lx:0,lz:0,mv:0,mg:null,boss:false,vmw:-1,vm:null,rec:0});
  this.buildMap(0);
  const defs=[[-28,-8,'w',1],[28,-8,'w',2],[-8,28,'w',3],[8,28,'w',4],[0,-24,'box'],[-22,18,'perk','jug'],[22,18,'perk','spd'],[0,10,'perk','dbl']],col={w:0x3dd16a,box:0xb45cff,jug:0xe0352b,spd:0x3bb0ff,dbl:0xffd23a};
  this.pads=defs.map(([x,z,ty,a])=>{const m=new THREE.Mesh(new THREE.BoxGeometry(4,.6,4),new THREE.MeshBasicMaterial({color:col[ty==='perk'?a:ty]}));m.position.set(x,.3,z);scene.add(m);
   const nm=ty==='w'?this.ZW[a].n+' $'+this.ZW[a].c:ty==='box'?'Mystery Box $950':({jug:'Juggernog $2500',spd:'Speed Cola $3000',dbl:'Double Tap $2000'})[a],t=tag(nm);t.position.y=5;m.add(t);return{x,z,ty,wi:a,pk:a}});
  this.vu=voteUI(this.MN,i=>{if(this.ph==='wait'&&this.tm>5)this.vote=i});document.getElementById('xh').style.display='block'},
 update(dt){
  const P=this.P,W=this.ZW,peers=[...RM.values()],now=Date.now()/1000;
  this.host=[...RM.keys(),myId].sort()[0]===myId;
  if(this.host&&!this.wasH){this.wasH=true;const pv=peers.find(c=>c.q&&c.q.hz);if(pv){const h=pv.q.hz;Object.assign(this,{wave:h.w,ph:h.ph,tm:h.tm,ks:h.ks||{},hk:h.hk||{},ikT:h.ik||0,dpT:h.dp||0,ma:h.ma||0,mk:h.m>=0?h.m:0});this.Z=h.z.map(a=>({id:a[0],x:a[1],z:a[2],y:0,hp:a[3],ty:a[4]}));this.PU=(h.pu||[]).map(a=>({id:a[0],x:a[1],z:a[2],ty:a[3],life:20}));this.nid=Math.max(0,...this.Z.map(z=>z.id),...this.PU.map(p=>p.id))+1}}
  if(!this.host)this.wasH=false;
  const hz=this.host?null:(peers.map(c=>c.q&&c.q.hz).find(Boolean)||null),
   state=this.host?{w:this.wave,ph:this.ph,tm:this.tm,ks:this.ks,hk:this.hk,ik:this.ikT,dp:this.dpT,ma:this.ma,m:this.mk,pu:this.PU.map(p=>[p.id,p.x,p.z,p.ty])}:(hz||{w:0,ph:'wait',tm:0,ks:{},hk:{},ik:0,dp:0,ma:0,m:-1,pu:[]});
  if(state.ph!=='wait'&&state.m>=0&&state.m!==this.cm){this.buildMap(state.m);Object.assign(P,{x:(Math.random()-.5)*16,y:1,z:(Math.random()-.5)*16,vy:0})}
  if(this.host){
   const tg=[];if(!this.dead)tg.push(P);for(const c of peers)if(!c.dead)tg.push(c);
   if(this.ph==='wait'){this.tm-=dt;if(this.tm<=0){const c=tally(4,0,this.vote),mx=Math.max(...c),top=c.map((v,i)=>v===mx?i:-1).filter(i=>i>=0);this.mk=top[Math.floor(Math.random()*top.length)];this.wave=1;this.sq=6;this.boss=false;this.ph='wave'}}
   else if(this.ph==='wave'){this.sp-=dt;
    if(this.sq>0&&this.sp<=0&&this.Z.length<24){const g=this.gates[Math.floor(Math.random()*4)];let ty=this.wave>=7&&Math.random()<.12?2:this.wave>=3&&Math.random()<.28?1:0;if(this.wave%5===0&&!this.boss){this.boss=true;ty=3}
     this.Z.push({id:this.nid++,x:g[0]+(Math.random()-.5)*6,z:g[1]+(Math.random()-.5)*6,y:0,hp:[70,50,260,1500][ty]+this.wave*[26,16,70,400][ty],ty,sg:Math.random()<.5?1:-1});this.sq--;this.sp=Math.max(.45,1.3-this.wave*.07)}
    if(this.sq<=0&&!this.Z.length){this.ph='break';this.tm=10}
    if(!tg.length){this.ph='over';this.tm=7}}
   else if(this.ph==='break'){this.tm-=dt;if(this.tm<=0){this.wave++;this.sq=6+this.wave*4;this.boss=false;this.ph='wave'}}
   else if(this.ph==='over'){this.tm-=dt;if(this.tm<=0){this.wave=0;this.Z=[];this.PU=[];this.sq=0;this.ph='wait';this.tm=14;this.ks={};this.hk={};this.lks=0;this.lkh=0}}
   const sp0=[7.2,12.5,5.5,6.5];
   for(const z of this.Z){let best=null,bd=1e9;for(const c of tg){const d=Math.hypot(c.x-z.x,c.z-z.z);if(d<bd){bd=d;best=c}}
    if(best&&bd>1.5){const sp=Math.min(sp0[z.ty]+this.wave*.1,z.ty===1?16:10),ux=(best.x-z.x)/bd,uz=(best.z-z.z)/bd,bx=z.x,bz=z.z;z.x+=ux*sp*dt;z.z+=uz*sp*dt;pushOut(z,this.S);
     if((z.x-bx)*ux+(z.z-bz)*uz<sp*dt*.4){z.x+=-uz*z.sg*sp*dt;z.z+=ux*z.sg*sp*dt;pushOut(z,this.S)}}
    for(const o of this.Z)if(o!==z){const dx=z.x-o.x,dz=z.z-o.z,dd=Math.hypot(dx,dz);if(dd<1.8&&dd>.01){z.x+=dx/dd*3*dt;z.z+=dz/dd*3*dt}}
    z.x=Math.max(-60,Math.min(60,z.x));z.z=Math.max(-60,Math.min(60,z.z))}
   this.PU=this.PU.filter(p=>(p.life-=dt)>0);
   for(const c of peers){const q=c.q;if(!q)continue;if(Array.isArray(q.hq))for(const h of q.hq)if(h[0]>(this.hseq[c.pid]||0)){this.hseq[c.pid]=h[0];this.hitZ(h[1],h[2],c.pid,h[3])}
    if(Array.isArray(q.pc)&&q.pc[0]>(this.pcs[c.pid]||0)){this.pcs[c.pid]=q.pc[0];this.grab(q.pc[1])}}}
  const src=this.host?this.Z.map(z=>[z.id,z.x,z.z,z.hp,z.ty]):(hz?hz.z:[]),seen=new Set();this.src=src;this.ik=state.ik>now;this.dp=state.dp>now;
  for(const a of src){seen.add(a[0]);let c=this.zm.get(a[0]);
   if(!c){const sv=AV;AV=ZAVS[a[4]];c=newP(a[1],0,a[2]);AV=sv;c.g.scale.setScalar([1,.95,1.4,2][a[4]]);this.zm.set(a[0],c)}
   const dx=a[1]-c.x,dz=a[2]-c.z,mv=Math.hypot(dx,dz),k=this.host?1:Math.min(1,dt*14);c.x+=dx*k;c.z+=dz*k;if(mv>.04)c.yaw+=wr(Math.atan2(dx,dz)-c.yaw)*Math.min(1,dt*12);c.hs=mv>.05?16:0;c.gr=true;c.y=0;c.t+=dt;animate(c,dt);c.J.aL.rotation.x=c.J.aR.rotation.x=-1.45;c.J.aL.rotation.z=c.J.aR.rotation.z=0;if(c.g.parent!==scene)scene.add(c.g)}
  for(const [id,c] of this.zm)if(!seen.has(id)){explode(c,1);fxBurst(c.x,3,c.z,0x6fbf4a);scene.remove(c.g);this.zm.delete(id)}
  for(const a of state.pu){let m=this.pum.get(a[0]);if(!m){m=new THREE.Mesh(new THREE.OctahedronGeometry(.9),new THREE.MeshBasicMaterial({color:({ma:0x3dd16a,ik:0xff3b30,dp:0xffd23a})[a[3]]}));scene.add(m);this.pum.set(a[0],m)}
   m.position.set(a[1],2.2+Math.sin(now*3)*.3,a[2]);m.rotation.y+=dt*2;
   if(!this.dead&&Math.hypot(a[1]-P.x,a[2]-P.z)<3){if(this.host)this.grab(a[0]);else if(this.pc[1]!==a[0])this.pc=[++this.pcq,a[0]];snd(1000,.15,'sine',.12,1600)}}
  for(const [id,m] of this.pum)if(!state.pu.some(a=>a[0]===id)){scene.remove(m);this.pum.delete(id)}
  if(this.lma!==null&&state.ma>this.lma){this.sl.forEach(wi=>{if(wi>=0){this.mag[wi]=W[wi].m;this.rsv[wi]=W[wi].rs}});snd(700,.3,'sine',.14,1400)}this.lma=state.ma;
  if(state.w!==this.lw){const reset=state.w===0;this.lw=state.w;if(this.dead){this.dead=false;this.hp=this.hpm;P.dead=false;P.g.visible=true;clearDebris();Object.assign(P,{x:(Math.random()-.5)*16,y:1,z:(Math.random()-.5)*16,vy:0})}
   if(reset){this.pts=500;this.sl=[0,-1];this.cs=0;this.mag=[8,0,0,0,0,0];this.rsv=[80,0,0,0,0,0];this.pk={jug:0,spd:0,dbl:0};this.hpm=100;this.hp=100;this.vote=-1}else reveal('WAVE '+state.w,'#ff5252','Survive the horde')}
  if(!this.dead&&this.hp<=0){this.dead=true;P.dead=true;explode(P);P.g.visible=false;shk=1}
  let d={x:0,y:0,z:-1};
  if(this.dead){if(this.vm)this.vm.visible=false;if(!specCam()){camera.position.set(P.x,P.y+10,P.z+8);camera.lookAt(P.x,P.y+3,P.z)}}
  else{ctrl(P,dt,this.S);d=fpsCam(P);P.g.visible=false}
  const wi=this.sl[this.cs],w=W[wi];
  if(!this.vm||this.vmw!==wi){if(this.vm)camera.remove(this.vm);this.vm=vmake(w);this.vmw=wi;camera.add(this.vm)}
  this.vm.visible=!this.dead;
  this.cdf-=dt;this.rec=Math.max(0,this.rec-dt*8);this.ads+=((keys.Mouse2&&!this.dead?1:0)-this.ads)*Math.min(1,dt*12);
  const fv=75-this.ads*(wi===4?45:22);if(Math.abs(camera.fov-fv)>.2){camera.fov=fv;camera.updateProjectionMatrix()}
  this.mv=Math.hypot(P.x-this.lx,P.z-this.lz)/Math.max(dt,.001);this.lx=P.x;this.lz=P.z;
  this.vm.position.set(.3-.3*this.ads,-.28+.05*this.ads,-.6+this.rec*.9);this.vm.rotation.x=(this.rl>0?-.7:0)+this.rec*.3;this.vm.userData.fl.visible=this.rec>.6;
  this.hc-=dt;this.rg+=dt;
  if(!this.dead){for(const a of src){if(this.hc<=0&&Math.hypot(a[1]-P.x,a[2]-P.z)<2.4*[1,.95,1.4,2][a[4]]){this.hp-=[20,14,40,60][a[4]];this.hc=.7;this.rg=0;shk=.5;snd(180,.12,'square',.12,90)}}if(this.rg>4&&this.hp<this.hpm)this.hp=Math.min(this.hpm,this.hp+15*dt)}
  if(keys.KeyQ&&!this.pq)this.wheel(1);this.pq=!!keys.KeyQ;
  if(this.rl>0){this.rl-=dt;if(this.rl<=0){const need=w.m-this.mag[wi],tk=Math.min(need,this.rsv[wi]);this.mag[wi]+=tk;this.rsv[wi]-=tk}}
  else if(!this.dead){
   if(keys.KeyR&&this.mag[wi]<w.m&&this.rsv[wi]>0)this.rl=w.t*(this.pk.spd?.6:1);
   const trg=!!(keys.Mouse0||keys.KeyE),go=w.au?trg:(trg&&!this.pm);this.pm=trg;
   if(go&&this.cdf<=0){if(this.mag[wi]<=0){if(this.rsv[wi]>0)this.rl=w.t*(this.pk.spd?.6:1);else snd(200,.05,'square',.08,150)}
    else{this.mag[wi]--;this.cdf=w.r;this.at++;this.rec=1;pitch=Math.max(PMIN,pitch-w.k);yaw+=(Math.random()-.5)*w.k*.6;
     const sp=(w.sp+Math.min(.04,this.mv*.0012))*(1-this.ads*.7),o={x:camera.position.x,y:camera.position.y,z:camera.position.z},hits=new Map(),
      mz={x:o.x+d.x*1.4+Math.cos(yaw)*.3,y:o.y+d.y*1.4-.3,z:o.z+d.z*1.4-Math.sin(yaw)*.3};
     for(let k=0;k<w.p;k++){let dx=d.x+(Math.random()-.5)*2*sp,dy=d.y+(Math.random()-.5)*2*sp,dz=d.z+(Math.random()-.5)*2*sp;const L=Math.hypot(dx,dy,dz);dx/=L;dy/=L;dz/=L;const dir={x:dx,y:dy,z:dz};
      let tw=120;for(const sd of this.S)if(!sd.r){const t=rayBox(o,dir,sd);if(t<tw)tw=t}
      const hl=[];for(const a of src){const sc=[1,.95,1.4,2][a[4]],th=raySph(o,dir,a[1],4.7*sc,a[2],.8*sc),tb=raySph(o,dir,a[1],2.6*sc,a[2],1.5*sc),t=Math.min(th,tb);if(t<tw)hl.push({a,t,head:th<=tb})}
      hl.sort((p,q)=>p.t-q.t);const tk=w.pi?hl.slice(0,3):hl.slice(0,1);
      tk.forEach(h=>{const e=hits.get(h.a[0])||{a:h.a,dmg:0,head:false};e.dmg+=w.d*(h.head?2.2:1);e.head=e.head||h.head;hits.set(h.a[0],e)});
      if(k<3){const te=tk.length&&!w.pi?tk[0].t:tw;tracer(mz,{x:o.x+dx*te,y:o.y+dy*te,z:o.z+dz*te},w.ray?0x66ffaa:0xffe9a0)}}
     hits.forEach(e=>{let dmg=e.dmg*(this.pk.dbl?1.33:1);if(this.ik)dmg=99999;this.pts+=10*(this.dp?2:1);hitMark(false,e.head);const m=bm(new THREE.SphereGeometry(.3,6,6),0x7bd15a);m.position.set(e.a[1],e.head?4.7:2.6,e.a[2]);fxAdd(m,.25,null,6);
      if(this.host)this.hitZ(e.a[0],dmg,myId,e.head);else{this.hq.push([++this.hs,e.a[0],Math.round(dmg),e.head?1:0]);if(this.hq.length>6)this.hq.shift()}});
     snd(w.f[0],.1,'sawtooth',.14,w.f[1])}}}
  const kk=state.ks[myId]||0,hk=state.hk[myId]||0;if(kk>this.lks){this.pts+=(60*(kk-this.lks)+40*Math.max(0,hk-this.lkh))*(this.dp?2:1);hitMark(true,true);snd(1200,.08,'sine',.1,1800)}this.lks=kk;this.lkh=hk;
  let near=null;for(const p of this.pads)if(!this.dead&&Math.hypot(p.x-P.x,p.z-P.z)<5)near=p;
  const buy=keys.KeyF&&!this.pf;this.pf=!!keys.KeyF;let cost=0,label='';
  if(near){if(near.ty==='w'){const own=this.sl.includes(near.wi);cost=own?Math.floor(W[near.wi].c/2):W[near.wi].c;label=(own?'refill ':'buy ')+W[near.wi].n}else if(near.ty==='box'){cost=950;label='Mystery Box'}else{cost={jug:2500,spd:3000,dbl:2000}[near.pk];label=this.pk[near.pk]?'(owned)':({jug:'Juggernog (+50 HP)',spd:'Speed Cola (fast reload)',dbl:'Double Tap (+33% dmg)'})[near.pk]}
   if(buy&&!(near.ty==='perk'&&this.pk[near.pk])){if(this.pts>=cost){this.pts-=cost;snd(900,.15,'sine',.12,1300);
     if(near.ty==='w')this.give(near.wi,this.sl.includes(near.wi));else if(near.ty==='box'){const wi2=[1,2,3,4,5,5][Math.floor(Math.random()*6)];this.give(wi2,this.sl.includes(wi2));reveal(W[wi2].n,'#b45cff','Mystery Box')}else{this.pk[near.pk]=1;if(near.pk==='jug'){this.hpm=150;this.hp=150}}}else snd(150,.15,'square',.1,100)}}
  xhSet(Math.round(16+((w.sp+Math.min(.04,this.mv*.0012))*(1-this.ads*.7))*320));
  const ph=state.ph,wv=state.w;
  voteSet(this.vu,tally(4,0,this.vote),this.vote,ph==='wait'&&state.tm>5);
  setB(ph==='wait'?'Vote for a map \u2014 starting in '+Math.ceil(state.tm)+'s':ph==='over'?'GAME OVER \u2014 restarting...':ph==='break'?'Wave '+wv+' cleared! Next in '+Math.ceil(state.tm)+'s':near?'F: '+label+(near.ty==='perk'&&this.pk[near.pk]?'':' ($'+cost+')'):'Wave '+wv+(this.ik?' \u00b7 INSTA-KILL':'')+(this.dp?' \u00b7 2X POINTS':''));
  specUI(this.dead);setHP(this.hp/this.hpm*100);scoreEl.textContent='Wave '+wv+' \u00b7 $'+this.pts+' \u00b7 '+w.n+' '+(this.rl>0?'reloading':this.mag[wi]+'/'+this.rsv[wi])+' \u00b7 Zombies '+src.length}};
