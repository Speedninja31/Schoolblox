/* Game: Murder Mystery (id: mm) - card, menu info and game engine. */
GAMES.push({id:'mm',name:'Murder Mystery',tag:'Mystery',e:'🔪',c:['#444','#111'],like:'93%',pl:'15.8K',hint:'Real players only (2+ needed). A new lobby opens every 50 seconds: one murderer, one sheriff, everyone else innocent. Murderer: E stab, F throw knife. Sheriff: E shoot (shooting an innocent kills you). Face your target. Enter = chat.'});
META.mm={c:'Mystery',m:'2+ players',t:['Social deduction']};
ENG.mm={d3:true,MMN:['Warehouse','Mansion','Subway Station','Carnival'],
 RMS:{m:['MURDERER','#e53935','E stab \u00b7 F throw knife \u2014 eliminate everyone'],s:['SHERIFF','#1e88e5','E shoot the murderer \u2014 shooting an innocent kills you'],i:['INNOCENT','#43a047','Survive and grab coins']},
 ex(){return{j:this.j,dd:this.P.dead?1:0,dc:this.cyc,kl:this.kl,kc:this.cyc,v:this.vote,vc:this.cyc,mk:this.mk,mc:this.cyc,at:this.at,ak:this.ak}},
 rem(c,q,dt){const d=!!(q.dd&&q.dc===this.cyc);if(d&&!c.dead)explode(c);c.dead=d;c.g.visible=!d;
  if(typeof q.at==='number'&&q.at!==c.lat){if(c.lat!==undefined&&q.ak){c.att=.35;const k=q.ak==='g'?'s':'m';if(c.wk!==k){if(c.w)c.J.aR.remove(c.w);wpn(c,k);c.wk=k}if(q.ak==='g')muzzle(c)}c.lat=q.at}
  if(c.att>0){c.att-=dt;c.J.aR.rotation.x=-1.5;if(c.w)c.w.visible=true}else if(c.w)c.w.visible=false},
 buildArena(k){
  if(this.mg)scene.remove(this.mg);const G=this.mg=new THREE.Group();scene.add(G);
  const R=k<0?30:70,S=this.S=[{x:0,z:0,hw:R,hd:R,top:0}],rs=mulb(k*131+777),rp=a=>(rs()-.5)*a,sky=[0xbfd4f0,0x9fb4c8,0x3a2f3f,0x1f2a38,0xffc27a][k+1];
  const box=(w,h,d,x,z,c,y0)=>{y0=y0||0;const m=slab(w,h,d,x,y0+h/2,z,c);G.add(m);S.push({x,z,hw:w/2,hd:d/2,top:y0+h,bot:y0})};
  G.add(slab(R*2,1,R*2,0,-.5,0,[0xc9d4e4,0x7d8c9a,0xb08a64,0x6b7280,0x6aa84f][k+1]));scene.background.setHex(sky);scene.fog.color.setHex(sky);
  [[0,-R-1,R+2,1],[0,R+1,R+2,1],[-R-1,0,1,R+2],[R+1,0,1,R+2]].forEach(([x,z,hw,hd])=>box(hw*2,12,hd*2,x,z,[0xe8eef6,0x56606b,0x4a3426,0x2e3440,0xf5a3b8][k+1]));
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
  this.cs=[];for(let i=0;i<14;i++){const m=new THREE.Mesh(new THREE.CylinderGeometry(.8,.8,.2,16),new THREE.MeshBasicMaterial({color:0xffd23a}));m.rotation.x=Math.PI/2;m.position.set(rp(R*1.6),2.5,rp(R*1.6));G.add(m);this.cs.push(m)}},
 start(){
  baseScene(0xbfd4f0);showOver('');
  this.P=newP(0,0,0);this.cyc=-1;this.hold=null;this.spo=0;this.cn=0;this.kl=[];this.role=null;this.pl=[];this.rl={};this.res='';this.j=-1;this.vote=-1;this.mk=-1;this.at=0;this.ak='';this.pend=[];this.cd=0;this.cdm=1;this.ts=performance.now();this.mg=null;
  this.ar=new THREE.Mesh(new THREE.RingGeometry(1.4,2,24),new THREE.MeshBasicMaterial({color:0xff3b30,transparent:true,opacity:.8,side:THREE.DoubleSide}));this.ar.rotation.x=-Math.PI/2;this.ar.visible=false;scene.add(this.ar);
  this.buildArena(-1);
  this.vu=voteUI(this.MMN,i=>{if(Date.now()/1000%150<12&&!this.P.dead)this.vote=i})},
 update(dt){
  const P=this.P,T=Date.now()/1000,cyc=(this.hold!=null&&T<this.hold)?this.cyc:Math.floor(T/50),s=T-cyc*50,peers=[...RM.values()];
  if(cyc!==this.cyc){this.cyc=cyc;Object.assign(this,{kl:[],role:null,pl:[],rl:{},res:'',lk:false,lk0:false,pe:false,pf:false,cd:0,cn:0,vote:-1,mk:-1,pend:[],hold:null,spo:0});
   P.att=0;P.dead=false;P.ex=0;P.g.visible=true;clearDebris();P.g.rotation.x=0;if(P.w){P.J.aR.remove(P.w);P.w=null}if(P.rr){P.g.remove(P.rr);P.rr=null}if(P.bd){P.up.remove(P.bd);P.bd=null}
   showOver('');this.buildArena(-1);Object.assign(P,{x:(Math.random()-.5)*30,y:1,z:(Math.random()-.5)*30,vy:0})}
  if(s>=17&&!this.lk0&&performance.now()-this.ts>2500){this.lk0=true;this.mk=pickMap(4,cyc,this.vote);this.buildArena(this.mk);Object.assign(P,{x:(Math.random()-.5)*80,y:1,z:(Math.random()-.5)*80,vy:0});snd(660,.15,'sine',.12,990)}
  if(s<18)this.j=cyc;
  if(s>=20&&this.lk0&&!this.lk){this.lk=true;const ids=[];if(this.j===cyc)ids.push(myId);for(const [id,c] of RM)if(c.q&&c.q.j===cyc)ids.push(id);ids.sort();
   if(ids.length>=2){const rn=mulb(cyc),a=ids.slice();for(let i=a.length-1;i>0;i--){const k=Math.floor(rn()*(i+1));[a[i],a[k]]=[a[k],a[i]]}
    this.hold=Infinity;this.pl=ids;a.forEach((id,i)=>this.rl[id]=i===0?'m':i===1?'s':'i');this.role=this.rl[myId]||null;
    if(this.role){const R=this.RMS[this.role];reveal(R[0],R[1],R[2]);this.cdm=this.role==='m'?.6:1.5;
     if(this.role!=='i'){wpn(P,this.role);P.w.visible=true;const rr=new THREE.Mesh(new THREE.TorusGeometry(2.4,.1,6,32),new THREE.MeshBasicMaterial({color:this.role==='m'?0xff3b30:0x3b9bff}));rr.rotation.x=Math.PI/2;rr.position.y=.2;P.g.add(rr);P.rr=rr}
     if(this.role==='s'){const st=new THREE.Mesh(new THREE.CylinderGeometry(.3,.3,.05,5),new THREE.MeshBasicMaterial({color:0xffd23a}));st.rotation.x=Math.PI/2;st.position.set(-.5,3.5,.54);P.up.add(st);P.bd=st}}}}
  if(P.dead){if(!P.ex){P.ex=1;explode(P);P.g.visible=false;shk=1}if(!specCam())orbitCam(P)}else if(this.pl.length>=2&&s>=20&&!this.role){P.y=-300;P.vy=0;P.g.visible=false;if(!this.spo){this.spo=1;SP.on=true;SP.k=null}if(!specCam())orbitCam({x:0,y:40,z:0})}else ctrl(P,dt,this.S);
  P.att=Math.max(0,P.att-dt);if(P.att>0&&!P.dead)P.J.aR.rotation.x=this.ak==='m'?-2.3+(1-P.att/.35)*1.3:-1.5;
  const inR=this.pl.length>=2,live=inR&&s>=20&&s<140&&!this.res,e=keys.KeyE&&!this.pe,f=keys.KeyF&&!this.pf;this.pe=!!keys.KeyE;this.pf=!!keys.KeyF;this.cd-=dt;
  const L=peers.filter(c=>this.pl.includes(c.pid)&&!c.dead),kill=c=>{if(!this.kl.includes(c.pid))this.kl.push(c.pid);fxBurst(c.x,c.y+3,c.z,0xff3b30);snd(260,.25,'square',.15,90)};
  this.pend=this.pend.filter(o=>{o.t-=dt;if(o.t<=0){kill(o.c);if(o.self)P.dead=true;return false}return true});
  if(live&&this.role&&!P.dead){
   for(const c of peers){const q=c.q;if(q&&q.kc===cyc&&Array.isArray(q.kl)&&q.kl.includes(myId)&&this.pl.includes(c.pid))P.dead=true}
   if(!P.dead&&this.cd<=0&&(e||f)){
    if(this.role==='m'&&e){const tg=aim(P,L,6.5,1.1);P.att=.35;this.cd=.6;this.cdm=.6;this.at++;this.ak='m';fxSlash(P);snd(520,.1,'sawtooth',.15,140);if(tg){shk=.6;this.pend.push({t:.08,c:tg})}}
    else if(this.role==='m'&&f){const tg=aim(P,L,60,.25),dv=tg?Math.hypot(tg.x-P.x,tg.z-P.z):60;P.att=.35;this.cd=3;this.cdm=3;this.at++;this.ak='t';snd(700,.15,'triangle',.12,300);fxKnife(P,dv);if(tg)this.pend.push({t:dv/110,c:tg})}
    else if(this.role==='s'&&e){const tg=aim(P,L,70,.3),dv=tg?Math.hypot(tg.x-P.x,tg.z-P.z):70;P.att=.3;this.cd=1.5;this.cdm=1.5;this.at++;this.ak='g';fxTrace(P,dv);snd(900,.14,'sawtooth',.2,60);shk=.35;if(tg)this.pend.push({t:.06,c:tg,self:this.rl[tg.pid]!=='m'})}}}
  const tg0=live&&this.role&&!P.dead&&this.role!=='i'?aim(P,L,this.role==='m'?6.5:70,this.role==='m'?1.1:.3):null;this.ar.visible=!!tg0;if(tg0)this.ar.position.set(tg0.x,.2,tg0.z);
  const dd=id=>id===myId?P.dead:(!RM.has(id)||RM.get(id).dead);
  if(live||(inR&&s>=140&&!this.res)){
   const mid=Object.keys(this.rl).find(id=>this.rl[id]==='m'),md=dd(mid),inn=this.pl.filter(id=>id!==mid&&!dd(id)).length;let m='';
   if(md)m='The murderer was stopped!';else if(inn===0)m='The murderer got everyone!';else if(s>=140)m='Time is up \u2014 the innocents survive!';
   if(m){const mw=!md&&inn===0,win=(this.role==='m')===mw;this.res=(this.role?(win?'\ud83c\udfc6 You win!':'You lost'):'Round over')+'\n'+m;this.hold=Math.ceil((T+8)/50)*50;showOver(this.res+'\nNext lobby soon...');snd(win?880:200,.4,'sine',.15,win?1320:120)}}
  this.cs.forEach((m,i)=>{if(!m.visible)return;m.position.y=2.5+Math.sin(T*3+i)*.4;if(!P.dead&&Math.hypot(P.x-m.position.x,P.z-m.position.z)<3&&P.y<6){m.visible=false;this.cn++;snd(1200,.08,'sine',.1,1800)}});
  const rb=document.getElementById('role');
  if(this.role&&s>=20&&s<140){const R=this.RMS[this.role];rb.style.display='block';const rt=document.getElementById('rt');rt.textContent=R[0]+' \u00b7 '+R[2];rt.style.color=R[1];document.getElementById('rcd').style.width=Math.min(100,100*(1-Math.max(0,this.cd)/(this.cdm||1)))+'%'}else rb.style.display='none';
  voteSet(this.vu,tally(4,cyc,this.vote),this.vote,s<17);
  const alive=this.pl.filter(id=>!dd(id)).length;
  setB(s<20?(s<12?'Lobby \u2014 vote for a map \u2014 '+Math.ceil(12-s)+'s':(this.mk>=0?'Map: '+this.MMN[this.mk]:'Counting votes...')+' \u2014 round in '+Math.ceil(20-s)+'s')+' ('+(1+peers.length)+' here, need 2+)':this.pl.length<2?'Not enough players \u2014 retrying in '+Math.ceil(50-s)+'s':!this.role?'Round in progress \u2014 spectating until the next lobby':s<24?'':'Alive: '+alive+(P.dead?' \u2014 you are out':''));
  specUI(P.dead||(this.pl.length>=2&&s>=20&&!this.role));scoreEl.textContent=(this.role?({m:'Murderer',s:'Sheriff',i:'Innocent'})[this.role]:'Waiting')+' \u00b7 \ud83e\ude99 '+this.cn}};
