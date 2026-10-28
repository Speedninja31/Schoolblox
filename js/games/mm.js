/* Game: Murder Mystery (id: mm) - card, menu info and game engine. */
GAMES.push({id:'mm',name:'Murder Mystery',tag:'Mystery',e:'🔪',c:['#444','#111'],like:'93%',pl:'15.8K',hint:'Real players only (2+ needed). A new lobby opens every 50 seconds: one murderer, one sheriff, everyone else innocent. Your weapon is a tool in your hotbar: press 1 (or click the slot) to pull it out or put it away. Murderer: E or click to stab, F or right-click to throw the knife. Sheriff: E or click to shoot (shooting an innocent kills you). You aim where your camera looks. Enter = chat.'});
META.mm={c:'Mystery',m:'2+ players',t:['Social deduction']};
ENG.mm={d3:true,MMN:['Warehouse','Mansion','Subway Station','Carnival'],
 RMS:{m:['MURDERER','#e53935','1 knife · E/click stab · F/right-click throw'],s:['SHERIFF','#1e88e5','1 gun · E/click shoot the murderer (shooting an innocent kills you)'],i:['INNOCENT','#43a047','Survive and grab coins']},
 ex(){return{j:this.j,dd:this.P.dead?1:0,dc:this.cyc,kl:this.kl,kc:this.cyc,v:this.vote,vc:this.cyc,mk:this.mk,mc:this.cyc,at:this.at,ak:this.ak,eq:this.eq||'',ad:Math.round(this.ad||0)}},

 rem(c,q,dt){const d=!!(q.dd&&q.dc===this.cyc);if(d&&!c.dead)explode(c);c.dead=d;c.g.visible=!d;
  const k=q.eq==='m'?'m':q.eq==='g'?'s':'';if(k!==c.wk){if(c.w){c.J.aR.remove(c.w);c.w=null}if(k)wpn(c,k);c.wk=k}if(c.w)c.w.visible=!!k&&!d;
  if(typeof q.at==='number'&&q.at!==c.lat){if(c.lat!==undefined&&q.ak){c.att=.35;c.ak=q.ak;const L=Math.max(4,Math.min(80,+q.ad||60));if(q.ak==='g'){muzzle(c);fxTrace(c,L)}else if(q.ak==='t')this.knife(c,L,c.yaw)}c.lat=q.at}
  c.att=Math.max(0,(c.att||0)-dt);if(c.att>0)c.J.aR.rotation.x=c.ak==='m'?-2.3+(1-c.att/.35)*1.3:c.ak==='t'?-2.4+(1-c.att/.35)*1.6:-1.5;else if(k)c.J.aR.rotation.x=k==='m'?-1.15:-1.4},
 /* where does a ray from (x,z) first hit a wall? (so shots and knives cannot pass through walls) */
 wallD(x,z,fx,fz,max){let best=max;for(const b of this.S){if(b.top<1.5||(b.bot||0)>3.8)continue;let t0=0,t1=best,ok=true;for(const [o,dd,lo,hi] of [[x,fx,b.x-b.hw,b.x+b.hw],[z,fz,b.z-b.hd,b.z+b.hd]]){if(Math.abs(dd)<1e-6){if(o<lo||o>hi){ok=false;break}}else{let a=(lo-o)/dd,e=(hi-o)/dd;if(a>e){const t=a;a=e;e=t}t0=Math.max(t0,a);t1=Math.min(t1,e);if(t0>t1){ok=false;break}}}if(ok&&t0<best)best=t0}return best},
 /* aim: the nearest player inside a corridor of half-width rad along the camera direction, with no wall in between */
 aimT(P,list,range,rad,ay){const fx=Math.sin(ay),fz=Math.cos(ay);let best=null,bt=1e9;for(const c of list){if(c.dead)continue;const dx=c.x-P.x,dz=c.z-P.z,al=dx*fx+dz*fz;if(al<.3||al>range||al>=bt)continue;if(Math.abs(dx*fz-dz*fx)>rad)continue;if(this.wallD(P.x,P.z,fx,fz,al)<al-.8)continue;bt=al;best=c}return best},
 knife(c,L,yw){const g=new THREE.Group(),sp=new THREE.Group(),m=(w,h,d,col,z,e)=>{const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshLambertMaterial({color:col,emissive:e||0}));o.position.z=z;sp.add(o)};m(.3,.08,1.5,0xe6ecf2,-.3,0x445566);m(.55,.12,.14,0xd4a017,.5);m(.18,.2,.7,0x3a2a22,.9);g.add(sp);g.position.set(c.x+Math.sin(yw)*2,c.y+3.8,c.z+Math.cos(yw)*2);g.rotation.y=yw;scene.add(g);this.pr.push({g,sp,vx:Math.sin(yw)*110,vz:Math.cos(yw)*110,left:L})},
 pClear(){for(const o of this.pr)scene.remove(o.g);this.pr=[]},
 tog(){if(!this.role||this.role==='i'||this.P.dead)return;this.eq=this.eq?'':(this.role==='m'?'m':'g');snd(this.eq?720:430,.07,'sine',.09,this.eq?960:330)},
 buildArena(k){
  if(this.mg)scene.remove(this.mg);const G=this.mg=new THREE.Group();scene.add(G);
  const R0=k<0?30:70,F=1.45,R=R0*F,rec=[],S=(this.S=[{x:0,z:0,hw:R,hd:R,top:0}]),rs=mulb(k*131+777),rp=a=>(rs()-.5)*a,sky=[0xbfd4f0,0x9fb4c8,0x3a2f3f,0x1f2a38,0xffc27a][k+1];
  this.R=R;const box=(w,h,d,x,z,c,y0)=>{y0=y0||0;const m=slab(w,h,d,x,y0+h/2,z,c);G.add(m);const p={x,z,hw:w/2,hd:d/2,top:y0+h,bot:y0};S.push(p);rec.push([m,p])};
  G.add(slab(R*2,1,R*2,0,-.5,0,[0xc9d4e4,0x7d8c9a,0xb08a64,0x6b7280,0x6aa84f][k+1]));scene.background.setHex(sky);scene.fog.color.setHex(sky);
  [[0,-R0-1,R0+2,1],[0,R0+1,R0+2,1],[-R0-1,0,1,R0+2],[R0+1,0,1,R0+2]].forEach(([x,z,hw,hd])=>box(hw*2,12,hd*2,x,z,[0xe8eef6,0x56606b,0x4a3426,0x2e3440,0xf5a3b8][k+1]));
  if(k===-1){[[-12,-12],[12,-12],[-12,12],[12,12]].forEach(([x,z])=>box(8,2,3,x,z,0xd0a060));box(6,1,6,0,0,0xffffff)}
  const wcol=[0xe8eef6,0x56606b,0x4a3426,0x2e3440,0xf5a3b8][k+1],wl=(x0,z0,x1,z1,c)=>box(Math.max(2,Math.abs(x1-x0)),16,Math.max(2,Math.abs(z1-z0)),(x0+x1)/2,(z0+z1)/2,c||wcol);
  if(k===0){for(let i=0;i<8;i++){let x,z;do{x=rp(100);z=rp(100)}while(Math.abs(x)<9&&Math.abs(z)<9);box(6,5,6,x,z,0x8a6a3a);if(i%3===0)box(5,4,5,x,z,0x9a7a4a,5)}
   wl(-45,-62,-45,-14);wl(-45,14,-45,62);wl(45,-62,45,-14);wl(45,14,45,62);wl(-28,-22,-8,-22);wl(8,-22,28,-22);wl(-28,22,-8,22);wl(8,22,28,22)}
  if(k===1){[[-70,-40],[-28,-6],[6,28],[40,70]].forEach(([a,b])=>{wl(-22,a,-22,b);wl(22,a,22,b)});
   [-1,1].forEach(sx=>{wl(sx*70,30,sx*40,30);wl(sx*28,30,sx*22,30);wl(sx*70,-30,sx*40,-30);wl(sx*28,-30,sx*22,-30)});wl(-22,-18,-8,-18);wl(8,-18,22,-18);wl(-22,18,-8,18);wl(8,18,22,18);
   for(let i=0;i<12;i++)box(6,3,4,rp(110),rp(110),[0x7b3f3f,0x3f5f7b,0x6b5a3f][i%3])}
  if(k===2){box(140,3,14,0,-60,0x9aa0aa);box(140,3,14,0,60,0x9aa0aa);for(let i=-3;i<=3;i++){box(3,12,3,i*20,-46,0x777e88);box(3,12,3,i*20,46,0x777e88)}box(40,6,10,-26,0,0x2980b9);box(40,6,10,26,0,0xc0392b);
   wl(-35,-46,-35,-12);wl(-35,12,-35,46);wl(35,-46,35,-12);wl(35,12,35,46);wl(-70,-20,-44,-20);wl(44,-20,70,-20);wl(-70,20,-44,20);wl(44,20,70,20)}
  if(k===3){box(10,22,10,0,0,0xff5d8f);for(let i=1;i<=4;i++)box(6,1,6,Math.cos(i)*9,Math.sin(i)*9,0xffd23a,5*i-1);
   for(let i=0;i<6;i++){const a=i*1.047,x=Math.cos(a)*42,z=Math.sin(a)*42,c=[0xe74c3c,0xf1c40f,0x3498db][i%3];box(10,6,10,x,z,c);const cn=new THREE.Mesh(new THREE.ConeGeometry(8,5,4),lam(c));cn.position.set(x,8.5,z);cn.rotation.y=.785;G.add(cn)}
   [[-60,-30,-30,-30],[30,-30,60,-30],[-60,30,-30,30],[30,30,60,30],[-20,-60,-20,-34],[20,-60,20,-34],[-20,34,-20,60],[20,34,20,60]].forEach(([a,b,c,d])=>wl(a,b,c,d,0x2e7d32))}
  rec.forEach(([m,p])=>{p.x*=F;p.z*=F;p.hw*=F;p.hd*=F;m.position.x*=F;m.position.z*=F;m.scale.x=F;m.scale.z=F});G.children.forEach(c=>{if(!rec.some(r=>r[0]===c)){c.position.x*=F;c.position.z*=F}});
  this.cs=[];for(let i=0;i<22;i++){const m=new THREE.Mesh(new THREE.CylinderGeometry(.8,.8,.2,16),new THREE.MeshBasicMaterial({color:0xffd23a}));m.rotation.x=Math.PI/2;m.position.set(rp(R*1.6),2.5,rp(R*1.6));G.add(m);this.cs.push(m)}},
 start(){
  baseScene(0xbfd4f0);showOver('');
  this.P=newP(0,0,0);this.cyc=-1;this.hold=null;this.spo=0;this.cn=0;this.kl=[];this.role=null;this.pl=[];this.rl={};this.res='';this.j=-1;this.vote=-1;this.mk=-1;this.at=0;this.ak='';this.eq='';this.ad=0;this.pr=[];this.noEmote=true;this.pm0=false;this.pm2=false;this.p1=false;this.pend=[];this.cd=0;this.cdm=1;this.ts=performance.now();this.mg=null;
  this.ar=new THREE.Mesh(new THREE.RingGeometry(1.4,2,24),new THREE.MeshBasicMaterial({color:0xff3b30,transparent:true,opacity:.8,side:THREE.DoubleSide}));this.ar.rotation.x=-Math.PI/2;this.ar.visible=false;scene.add(this.ar);
  if(!document.getElementById('mmx')){const st=document.createElement('style');st.id='mmx';st.textContent='#mmslot{display:flex;flex-direction:column;align-items:center;gap:4px;margin:8px auto 0;width:78px;padding:6px 4px;border-radius:12px;background:rgba(18,20,28,.82);border:2px solid rgba(255,255,255,.22);cursor:pointer;position:relative;transition:transform .12s,border-color .12s,box-shadow .12s}#mmslot b{position:absolute;left:6px;top:3px;font:800 12px system-ui;opacity:.8}#mmslot .ic{font-size:30px;line-height:1.1;filter:grayscale(.6) brightness(.8)}#mmslot small{font:700 11px system-ui;opacity:.85}#mmslot.on{border-color:#ffd23a;box-shadow:0 0 18px rgba(255,210,58,.6);transform:translateY(-6px) scale(1.06)}#mmslot.on .ic{filter:none}#mmhint{font:600 11px system-ui;opacity:.85;margin-top:2px}';document.head.appendChild(st)}
  {const rb=document.getElementById('role');let sl=document.getElementById('mmslot');if(!sl){sl=document.createElement('div');sl.id='mmslot';rb.appendChild(sl);const h=document.createElement('div');h.id='mmhint';rb.appendChild(h)}sl.onclick=ev=>{ev.stopPropagation();this.tog()};this.sl=sl;this.sk=''}
  this.buildArena(-1);
  this.vu=voteUI(this.MMN,i=>{if(Date.now()/1000-this.cyc*50<12&&!this.P.dead)this.vote=i})},
 update(dt){
  const P=this.P,T=Date.now()/1000,cyc=(this.hold!=null&&T<this.hold)?this.cyc:Math.floor(T/50),s=T-cyc*50,peers=[...RM.values()];
  if(cyc!==this.cyc){this.cyc=cyc;Object.assign(this,{kl:[],role:null,pl:[],rl:{},res:'',lk:false,lk0:false,pe:false,pf:false,cd:0,cn:0,vote:-1,mk:-1,pend:[],hold:null,spo:0,eq:'',ad:0});this.pClear();
   P.att=0;P.dead=false;P.ex=0;P.g.visible=true;clearDebris();P.g.rotation.x=0;if(P.w){P.J.aR.remove(P.w);P.w=null}if(P.rr){P.g.remove(P.rr);P.rr=null}if(P.bd){P.up.remove(P.bd);P.bd=null}
   showOver('');this.buildArena(-1);Object.assign(P,{x:(Math.random()-.5)*30,y:1,z:(Math.random()-.5)*30,vy:0})}
  if(s>=17&&!this.lk0&&performance.now()-this.ts>2500){this.lk0=true;this.mk=pickMap(4,cyc,this.vote);this.buildArena(this.mk);Object.assign(P,{x:(Math.random()-.5)*this.R*1.3,y:1,z:(Math.random()-.5)*this.R*1.3,vy:0});snd(660,.15,'sine',.12,990)}
  if(s<18)this.j=cyc;
  if(s>=20&&this.lk0&&!this.lk){this.lk=true;const ids=[];if(this.j===cyc)ids.push(myId);for(const [id,c] of RM)if(c.q&&c.q.j===cyc)ids.push(id);ids.sort();
   if(ids.length>=2){const rn=mulb(cyc),a=ids.slice();for(let i=a.length-1;i>0;i--){const k=Math.floor(rn()*(i+1));[a[i],a[k]]=[a[k],a[i]]}
    this.hold=Infinity;this.pl=ids;a.forEach((id,i)=>this.rl[id]=i===0?'m':i===1?'s':'i');this.role=this.rl[myId]||null;
    if(this.role){const R=this.RMS[this.role];reveal(R[0],R[1],R[2]);this.cdm=this.role==='m'?.6:1.5;
     if(this.role!=='i'){wpn(P,this.role);P.w.visible=false;const rr=new THREE.Mesh(new THREE.TorusGeometry(2.4,.1,6,32),new THREE.MeshBasicMaterial({color:this.role==='m'?0xff3b30:0x3b9bff}));rr.rotation.x=Math.PI/2;rr.position.y=.2;P.g.add(rr);P.rr=rr}
     if(this.role==='s'){const st=new THREE.Mesh(new THREE.CylinderGeometry(.3,.3,.05,5),new THREE.MeshBasicMaterial({color:0xffd23a}));st.rotation.x=Math.PI/2;st.position.set(-.5,3.5,.54);P.up.add(st);P.bd=st}}}}
  if(P.dead){if(!P.ex){P.ex=1;explode(P);P.g.visible=false;shk=1}if(!specCam())orbitCam(P)}else if(this.pl.length>=2&&s>=20&&!this.role){P.y=-300;P.vy=0;P.g.visible=false;if(!this.spo){this.spo=1;SP.on=true;SP.k=null}if(!specCam())orbitCam({x:0,y:40,z:0})}else ctrl(P,dt,this.S);
  P.att=Math.max(0,P.att-dt);if(P.w)P.w.visible=!!this.eq&&!P.dead;if(!P.dead){if(P.att>0)P.J.aR.rotation.x=this.ak==='m'?-2.3+(1-P.att/.35)*1.3:this.ak==='t'?-2.4+(1-P.att/.35)*1.6:-1.5;else if(this.eq)P.J.aR.rotation.x=this.eq==='m'?-1.15:-1.4}
  for(let i=this.pr.length-1;i>=0;i--){const o=this.pr[i];o.g.position.x+=o.vx*dt;o.g.position.z+=o.vz*dt;o.sp.rotation.x+=26*dt;o.left-=110*dt;if(o.left<=0){scene.remove(o.g);this.pr.splice(i,1)}}
  {const m0=keys.Mouse0&&!this.pm0,m2=keys.Mouse2&&!this.pm2;this.pm0=!!keys.Mouse0;this.pm2=!!keys.Mouse2;this.mc0=m0;this.mc2=m2;if(keys.Digit1&&!this.p1)this.tog();this.p1=!!keys.Digit1}
  const inR=this.pl.length>=2,live=inR&&s>=20&&s<140&&!this.res,e=(keys.KeyE&&!this.pe)||this.mc0,f=(keys.KeyF&&!this.pf)||this.mc2;this.pe=!!keys.KeyE;this.pf=!!keys.KeyF;this.cd-=dt;
  const L=peers.filter(c=>this.pl.includes(c.pid)&&!c.dead),kill=c=>{if(!this.kl.includes(c.pid))this.kl.push(c.pid);fxBurst(c.x,c.y+3,c.z,0xff3b30);snd(260,.25,'square',.15,90)};
  this.pend=this.pend.filter(o=>{o.t-=dt;if(o.t<=0){kill(o.c);if(o.self)P.dead=true;return false}return true});
  if(live&&this.role&&!P.dead){
   for(const c of peers){const q=c.q;if(q&&q.kc===cyc&&Array.isArray(q.kl)&&q.kl.includes(myId)&&this.pl.includes(c.pid))P.dead=true}
   if(!P.dead&&this.cd<=0&&this.eq&&(e||f)){const ay=yaw+Math.PI,fx=Math.sin(ay),fz=Math.cos(ay);P.yaw=ay;
    if(this.role==='m'&&e){const tg=this.aimT(P,L,6.5,3.4,ay);P.att=.35;this.cd=.6;this.cdm=.6;this.at++;this.ak='m';fxSlash(P);snd(520,.1,'sawtooth',.15,140);if(tg){shk=.6;this.pend.push({t:.08,c:tg})}}
    else if(this.role==='m'&&f){const tg=this.aimT(P,L,70,2.3,ay),dv=tg?Math.hypot(tg.x-P.x,tg.z-P.z):this.wallD(P.x,P.z,fx,fz,70);P.att=.35;this.cd=3;this.cdm=3;this.at++;this.ak='t';this.ad=dv;snd(700,.15,'triangle',.12,300);this.knife(P,dv,ay);if(tg)this.pend.push({t:dv/110,c:tg})}
    else if(this.role==='s'&&e){const tg=this.aimT(P,L,90,2.2,ay),dv=tg?Math.hypot(tg.x-P.x,tg.z-P.z):this.wallD(P.x,P.z,fx,fz,90);P.att=.3;this.cd=1.5;this.cdm=1.5;this.at++;this.ak='g';this.ad=dv;fxTrace(P,dv);snd(900,.14,'sawtooth',.2,60);shk=.35;if(tg)this.pend.push({t:.06,c:tg,self:this.rl[tg.pid]!=='m'})}}}
  const tg0=live&&this.role&&!P.dead&&this.eq?this.aimT(P,L,this.role==='m'?6.5:90,this.role==='m'?3.4:2.2,yaw+Math.PI):null;this.ar.visible=!!tg0;if(tg0)this.ar.position.set(tg0.x,.2,tg0.z);
  const dd=id=>id===myId?P.dead:(!RM.has(id)||RM.get(id).dead);
  if(live||(inR&&s>=140&&!this.res)){
   const mid=Object.keys(this.rl).find(id=>this.rl[id]==='m'),md=dd(mid),inn=this.pl.filter(id=>id!==mid&&!dd(id)).length;let m='';
   if(md)m='The murderer was stopped!';else if(inn===0)m='The murderer got everyone!';else if(s>=140)m='Time is up \u2014 the innocents survive!';
   if(m){const mw=!md&&inn===0,win=(this.role==='m')===mw;this.res=(this.role?(win?'\ud83c\udfc6 You win!':'You lost'):'Round over')+'\n'+m;this.hold=Math.ceil((T+8)/50)*50;showOver(this.res+'\nNext lobby soon...');snd(win?880:200,.4,'sine',.15,win?1320:120)}}
  this.cs.forEach((m,i)=>{if(!m.visible)return;m.position.y=2.5+Math.sin(T*3+i)*.4;if(!P.dead&&Math.hypot(P.x-m.position.x,P.z-m.position.z)<3&&P.y<6){m.visible=false;this.cn++;snd(1200,.08,'sine',.1,1800)}});
  const rb=document.getElementById('role');
  if(this.role&&s>=20&&s<140){const R=this.RMS[this.role];rb.style.display='block';const rt=document.getElementById('rt');rt.textContent=R[0]+' \u00b7 '+R[2];rt.style.color=R[1];document.getElementById('rcd').style.width=Math.min(100,100*(1-Math.max(0,this.cd)/(this.cdm||1)))+'%';
   if(this.sl){const key=this.role+'|'+(this.eq?1:0);if(key!==this.sk){this.sk=key;this.sl.style.display=this.role==='i'?'none':'flex';this.sl.className=this.eq?'on':'';this.sl.innerHTML='<b>1</b><span class="ic">'+(this.role==='m'?'🔪':'🔫')+'</span><small>'+(this.role==='m'?'Knife':'Gun')+'</small>'}document.getElementById('mmhint').textContent=this.role==='i'?'':this.eq?(this.role==='m'?'E/click stab · F/right-click throw':'E/click shoot'):'Press 1 to pull out your '+(this.role==='m'?'knife':'gun')}}else rb.style.display='none';
  voteSet(this.vu,tally(4,cyc,this.vote),this.vote,s<17);
  const alive=this.pl.filter(id=>!dd(id)).length;
  setB(s<20?(s<12?'Lobby \u2014 vote for a map \u2014 '+Math.ceil(12-s)+'s':(this.mk>=0?'Map: '+this.MMN[this.mk]:'Counting votes...')+' \u2014 round in '+Math.ceil(20-s)+'s')+' ('+(1+peers.length)+' here, need 2+)':this.pl.length<2?'Not enough players \u2014 retrying in '+Math.ceil(50-s)+'s':!this.role?'Round in progress \u2014 spectating until the next lobby':s<24?'':'Alive: '+alive+(P.dead?' \u2014 you are out':''));
  specUI(P.dead||(this.pl.length>=2&&s>=20&&!this.role));scoreEl.textContent=(this.role?({m:'Murderer',s:'Sheriff',i:'Innocent'})[this.role]:'Waiting')+' \u00b7 \ud83e\ude99 '+this.cn}};
