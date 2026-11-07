/* Game: Cops & Robbers (id: jail) - card, menu info and game engine.
   Pick a team. Prisoners break out, rob places and escape in cars; police arrest and taser them.
   Bots fill in when there are not enough real players. Everything for this game lives in this file. */
GAMES.push({id:'jail',name:'Cops & Robbers',tag:'Action',e:'🚓',c:['#3b4a6b','#1b2336'],hint:'Pick a team. PRISONERS: your cell door unlocks after a few seconds. Escape (hold E at the gate keypad, or dig the tunnel), then rob the Bank, Jewelry Store, Gas Station and ATMs (hold E), and get away in a car (E). Every crime brings more cops. POLICE: press E next to a criminal to arrest them, F or right-click to taser them from afar, and drive the police cars. Bots fill in when nobody else is around.'});
META.jail={c:'Action',m:'Solo \u00b7 Teams',t:['Teams','Heists','Cars']};
ENG.jail=(()=>{
const SITES=[['bank','Bank Vault','🏦',45,-30,8,1200,3,100],['jewel','Jewelry Store','💎',90,-28,5,700,2,80],['gas','Gas Station','⛽',92,32,3,350,1,60],['atm1','ATM','🏧',-22,-12,2,120,0,30],['atm2','ATM','🏧',22,12,2,120,0,30],['atm3','ATM','🏧',-30,40,2,120,0,30]];
const WP=[[0,0],[0,-60],[0,60],[60,0],[-60,0],[100,0],[-100,0],[0,100],[0,-100],[40,-20],[-40,20],[60,60],[-60,-20]],YARD=[-114,-46,-114,-46];
const CARS=[[44,30,Math.PI,0x1b3a8a,1],[56,30,Math.PI,0x1b3a8a,1],[30,3,Math.PI/2,0xc62828,0],[-30,-3,-Math.PI/2,0xf2c200,0],[3,-40,0,0x2e7d32,0],[-3,50,Math.PI,0x6a1b9a,0]];
const RN=(a,b)=>a+Math.random()*(b-a),cl2=(v,a,b)=>Math.max(a,Math.min(b,v)),pickOf=a=>a[Math.floor(Math.random()*a.length)],$=id=>document.getElementById(id);
const mkB=(w,h,d,x,y,z,c,tr)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshLambertMaterial({color:c,transparent:!!tr,opacity:tr||1}));m.position.set(x,y,z);m.castShadow=m.receiveShadow=true;scene.add(m);return m};
function carMesh(col,cop){const g=new THREE.Group(),add=(w,h,d,x,y,z,c,e)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshLambertMaterial({color:c,emissive:e||0}));m.position.set(x,y,z);m.castShadow=true;g.add(m);return m};
 add(4.6,1.5,9.6,0,1.35,0,col);add(4,1.4,5,0,2.7,-.6,cop?0xf2f2f2:col===0xf2c200?0xe0b000:col);add(3.6,.9,1.2,0,2.7,1.9,0x9bd4ff,0x224466).scale.z=.5;add(3.6,.9,.2,0,2.8,-3.2,0x9bd4ff,0x224466);
 [[-1.4,3.2],[1.4,3.2],[-1.4,-3.2],[1.4,-3.2]].forEach(w=>{const m=new THREE.Mesh(new THREE.CylinderGeometry(.9,.9,.7,12),new THREE.MeshLambertMaterial({color:0x151515}));m.rotation.z=Math.PI/2;m.position.set(w[0]*1.2,.9,w[1]);g.add(m)});
 [-1.5,1.5].forEach(x=>{add(.9,.5,.2,x,1.5,4.85,0xfff3a0,0xaaaa55);add(.9,.5,.2,x,1.5,-4.85,0xc00000,0x660000)});
 if(cop){g.userData.l1=add(1.5,.45,.9,-1,3.6,-.6,0xff2222,0xff0000);g.userData.l2=add(1.5,.45,.9,1,3.6,-.6,0x2255ff,0x0033ff);add(4.7,.5,2,0,1.6,-2.4,0xf2f2f2)}
 scene.add(g);return g}
return{d3:true,
 load(){let d={};try{d=JSON.parse(localStorage.getItem('hubjail')||'{}')}catch(e){}this.D=Object.assign({cash:0,ar:0,rb:0,es:0,tm:-1},d)},save(){try{localStorage.setItem('hubjail',JSON.stringify(this.D))}catch(e){}},
 ex(){return{tm:this.tm,cd:this.carI,sn:this.stun>0?1:0,st:this.stt,ar:this.ar,sz:this.sz,al:this.al,cs:Math.round(this.cash)}},
 rem(c,q,dt){const tm=q.tm|0;if(!c.jr){c.jr=new THREE.Mesh(new THREE.TorusGeometry(2.4,.12,6,28),new THREE.MeshBasicMaterial({color:0x3b9bff}));c.jr.rotation.x=Math.PI/2;c.jr.position.y=.2;c.g.add(c.jr)}c.jr.material.color.setHex(tm===0?0x3b9bff:0xff8a1f);
  const car=typeof q.cd==='number'&&q.cd>=0?this.cars[q.cd]:null;c.g.visible=!car;if(car){car.rp=c.pid;car.x=c.x;car.z=c.z;car.yaw=c.yaw;car.v=0;car.g.position.set(car.x,0,car.z);car.g.rotation.y=car.yaw}
  c.g.rotation.x=q.sn?-1.3:0;if(this.rm)this.rm.add(c);
  if(Array.isArray(q.ar)&&q.ar[0]===myId&&q.ar[1]!==c.lar){c.lar=q.ar[1];if(this.tm===1&&this.stt===0&&this.carI<0)this.jailMe('Arrested by a cop!')}
  if(Array.isArray(q.sz)&&q.sz[0]===myId&&q.sz[1]!==c.lsz){c.lsz=q.sz[1];if(this.tm===1&&this.stt===0)this.stunMe(2.5)}
  if(Array.isArray(q.al)&&q.al[0]!==c.lal){const f=c.lal!==undefined;c.lal=q.al[0];if(f&&this.tm===0){this.ping={s:q.al[1],t:Date.now()/1000};sysChat('🚨 Robbery in progress: '+SITES[q.al[1]][1]+'!')}}},
 blk(x,z,m){if(Math.abs(x)>124||Math.abs(z)>124)return true;for(const s of this.S){if(s.r||s.top<2||(s.bot||0)>3)continue;if(Math.abs(x-s.x)<s.hw+m&&Math.abs(z-s.z)<s.hd+m)return true}return false},
 build(){const S=this.S,add=(w,h,d,x,z,c,y0,solid)=>{y0=y0||0;const m=mkB(w,h,d,x,y0+h/2,z,c);if(solid!==false)S.push({x,z,hw:w/2,hd:d/2,top:y0+h,bot:y0});return m},lbl=(t,x,y,z)=>{const s=tag(t);s.scale.set(14,3.5,1);s.position.set(x,y,z);scene.add(s)};
  mkB(260,1,260,0,-.5,0,0x6a9a50).receiveShadow=true;S.push({x:0,z:0,hw:130,hd:130,top:0,bot:-1});
  const road=(w,d,x,z)=>mkB(w,.04,d,x,.02,z,0x3a3f46);road(260,16,0,0);road(16,260,0,0);road(8,40,-80,-27);road(8,26,52,22);
  for(let i=-6;i<=6;i++){if(Math.abs(i)<1)continue;mkB(7,.05,.5,i*20,.045,0,0xf2c200);mkB(.5,.05,7,0,.045,i*20,0xf2c200)}
  [[-1,0],[1,0],[0,-1],[0,1]].forEach(([a,b])=>add(a?2:264,14,b?2:264,a*131,b*131,0x59606b));
  /* prison */
  const WL=0x8a8f98;add(72,10,2,-80,-115,WL);add(2,10,72,-115,-80,WL);add(2,10,72,-45,-80,WL);add(31,10,2,-99.5,-45,WL);add(31,10,2,-60.5,-45,WL);
  this.gate=add(8,10,2,-80,-45,0x8a2b2b);this.gateS=S[S.length-1];this.gateOpen=0;mkB(2,13,2,-84,6.5,-44,0x555555);mkB(2,13,2,-76,6.5,-44,0x555555);
  for(let j=0;j<=6;j++)add(1,7,12,-112+j*6,-107,0x6b7280);mkB(37,1,13,-94,7.5,-107,0x4a4f58);this.doors=[];
  for(let i=0;i<6;i++){const cx=-109+i*6,m=mkB(5,7,.5,cx,3.5,-101,0x7a9ac0,.55),s={x:cx,z:-101,hw:2.5,hd:.4,top:7,bot:0};S.push(s);this.doors.push({m,s,cx,open:0,t:0})}
  add(6,16,6,-50,-110,0x6b7280);mkB(8,2,8,-50,17,-110,0x2b2f36);[[-100,-70],[-60,-60],[-95,-90]].forEach(p=>add(6,1.2,2,p[0],p[1],0x9a6a38));
  lbl('PRISON',-80,16,-48);const kp=mkB(1.2,2.2,.5,-80,1.6,-47.4,0x222222);mkB(.7,.7,.2,-80,2,-47.1,0x3ddc84).material.emissive.setHex(0x1a8a4a);this.kp=kp;
  mkB(2,.3,2,-112,.15,-60,0x6a4a2b);lbl('TUNNEL',-112,5,-60);
  /* bank, jewelry, gas, police, houses */
  add(26,12,22,45,-45,0x9aa7b8);add(28,1,24,45,-45,0x6b7a90,12);lbl('BANK',45,16,-34);add(16,9,14,90,-40,0xc08a9a);lbl('JEWELRY',90,12,-32);
  add(14,7,10,98,50,0xd9d9d9);add(12,.8,8,88,40,0xe05a2b,6);[[84,40],[92,40]].forEach(p=>add(1.4,4,1.4,p[0],p[1],0xe05a2b));lbl('GAS',92,9,34);
  add(30,12,22,50,55,0x2f4f9a);add(32,1,24,50,55,0x1b2f66,12);lbl('POLICE',50,16,43);[[0xff2222,41],[0x2255ff,59]].forEach(p=>mkB(1.6,.8,1.6,p[1],12.9,44,p[0]).material.emissive.setHex(p[0]));
  for(let i=0;i<7;i++){const x=-110+(i%4)*32,z=40+Math.floor(i/4)*44+(i%2)*6;add(14,8,12,x,z,pickOf([0xd9c9a8,0xc9d9e8,0xe8c9c9]));const r=new THREE.Mesh(new THREE.ConeGeometry(11,5,4),new THREE.MeshLambertMaterial({color:0x8a3b2b}));r.rotation.y=Math.PI/4;r.position.set(x,10.5,z);r.scale.set(1,1,.85);scene.add(r)}
  const rs=mulb(77);for(let i=0;i<34;i++){const x=(rs()-.5)*240,z=(rs()-.5)*240;if(Math.abs(x)<14||Math.abs(z)<14||(x<-40&&x>-120&&z<-40&&z>-120)||this.blk(x,z,6))continue;mkB(1,4,1,x,2,z,0x6b4a2b);const f=new THREE.Mesh(new THREE.SphereGeometry(3,8,6),new THREE.MeshLambertMaterial({color:0x3f8f3a}));f.position.set(x,6,z);scene.add(f);S.push({x,z,hw:.6,hd:.6,top:4,bot:0})}
  for(let i=-5;i<=5;i++){if(!i)continue;[[i*22,10],[i*22,-10],[10,i*22],[-10,i*22]].forEach(p=>{mkB(.4,6,.4,p[0],3,p[1],0x333333);const l=new THREE.Mesh(new THREE.SphereGeometry(.8,6,4),new THREE.MeshBasicMaterial({color:0xfff0a0}));l.position.set(p[0],6.4,p[1]);scene.add(l)})}
  /* robbery pads */
  this.sites=SITES.map((s,i)=>{const pad=new THREE.Mesh(new THREE.CylinderGeometry(2.6,2.6,.2,24),new THREE.MeshBasicMaterial({color:s[7]>=2?0xffd23a:0x3ddc84,transparent:true,opacity:.75}));pad.position.set(s[3],.15,s[4]);scene.add(pad);const t=tag(s[2]+' '+s[1]);t.scale.set(12,3,1);t.position.set(s[3],5,s[4]);scene.add(t);return{d:s,i,pad,until:0}});
  /* cars */
  this.cars=CARS.map((c,i)=>{const g=carMesh(c[3],c[4]);g.position.set(c[0],0,c[1]);g.rotation.y=c[2];return{g,x:c[0],z:c[1],yaw:c[2],v:0,cop:c[4],i,rp:null,home:c}})},
 /* ---- hold-E actions ---- */
 acts(){const E=this;return[
  {x:-80,z:-49,r:5,t:'Hack the gate keypad',time:4,can:()=>!E.gateOpen,done:()=>{E.openGate();E.crime(2,-1,'Prison gate hacked!')}},
  {x:-112,z:-60,r:4,t:'Dig the escape tunnel',time:8,can:()=>true,done:()=>{E.P.x=-125;E.P.z=-62;E.P.vy=0;E.D.es++;E.crime(2,-1,'You escaped through the tunnel!');E.bux(2)}}
 ].concat(this.sites.map(s=>({x:s.d[3],z:s.d[4],r:4.2,t:'Rob the '+s.d[1],time:s.d[5],can:()=>Date.now()/1000>s.until,done:()=>{const T=Date.now()/1000;s.until=T+s.d[8];E.cash+=s.d[6];E.D.cash+=s.d[6];E.D.rb++;E.rbc++;E.crime(s.d[7],s.i,'You got $'+s.d[6]+' from the '+s.d[1]+'!');E.bux(s.d[7]>=3?3:1);sfx('victory',.6)}})))},
 bux(n){if(typeof BX!=='undefined'){BX.b=(+BX.b||0)+n;try{saveBX()}catch(e){}try{bxUpdate()}catch(e){}}this.save()},
 crime(h,site,msg){this.stars=Math.min(5,this.stars+h);this.lastCrime=Date.now()/1000;if(h>0){this.alr++;this.al=[this.alr,Math.max(0,site)]}reveal(msg,'#ffd23a','Wanted level '+'⭐'.repeat(Math.ceil(this.stars)));snd(900,.3,'sine',.14,1400);fxBurst(this.P.x,this.P.y+4,this.P.z,0xffd23a)},
 openGate(){this.gateOpen=Date.now()/1000+45;const i=this.S.indexOf(this.gateS);if(i>=0)this.S.splice(i,1);snd(200,.5,'sawtooth',.12,90)},
 cellOf(id){let h=0;for(const ch of String(id))h=(h*31+ch.charCodeAt(0))|0;return Math.abs(h)%6},
 jailMe(msg,first){const P=this.P;if(this.carI>=0)this.exitCar(true);this.stt=1;this.stars=0;if(!first)this.cash=Math.floor(this.cash*.8);const d=this.doors[this.cellOf(myId||'solo')];P.x=d.cx;P.z=-106;P.y=1;P.vy=0;this.jt=first?10:18;this.stun=0;d.open=0;if(this.S.indexOf(d.s)<0)this.S.push(d.s);d.m.visible=true;this.myDoor=d;if(msg)reveal('ARRESTED','#ff5252',msg);snd(180,.4,'sawtooth',.14,70)},
 stunMe(s){if(this.stun>0)return;this.stun=s;this.prog=0;snd(700,.3,'square',.14,200);shk=.5},
 setTeam(t){this.tm=t;this.D.tm=t;this.save();const P=this.P;this.stars=0;this.stt=0;this.stun=0;this.prog=0;if(this.carI>=0)this.exitCar(true);P.g.rotation.x=0;if(P.__ring){P.g.remove(P.__ring);P.__ring=null}
  const r=new THREE.Mesh(new THREE.TorusGeometry(2.4,.12,6,28),new THREE.MeshBasicMaterial({color:t===0?0x3b9bff:0xff8a1f}));r.rotation.x=Math.PI/2;r.position.y=.2;P.g.add(r);P.__ring=r;
  if(t===0){Object.assign(P,{x:50,y:1,z:28,vy:0});reveal('POLICE','#3b9bff','E arrest · F taser · hop in a car')}else{this.jailMe(null,true);reveal('PRISONER','#ff8a1f','Wait for your door, then escape!')}
  $('jsel').style.display='none'},
 /* ---- cars ---- */
 enterCar(c){const P=this.P;if(c.rp)return;this.carI=c.i;P.g.visible=false;P.hs=0;P.emote=null;snd(300,.15,'square',.1,200)},
 exitCar(q){const c=this.cars[this.carI];this.carI=-1;const P=this.P;P.g.visible=true;if(c){P.x=c.x+Math.cos(c.yaw)*4;P.z=c.z-Math.sin(c.yaw)*4;P.y=0;P.vy=0;c.v=0}if(!q)snd(250,.1,'square',.08,180)},
 carStep(c,dt){const f=(F()?1:0)-(B()?1:0),s=(L()?1:0)-(R()?1:0),mx=c.cop?46:40;c.v+=f*(f>0?(c.v<0?70:34):30)*dt;if(!f)c.v*=1-.9*dt;if(keys.Space)c.v*=1-4*dt;c.v=cl2(c.v,-16,mx);c.yaw+=s*1.9*dt*cl2(c.v/12,-1,1);
  const nx=c.x+Math.sin(c.yaw)*c.v*dt,nz=c.z+Math.cos(c.yaw)*c.v*dt;let hit=false;if(!this.blk(nx,c.z,2.8))c.x=nx;else hit=true;if(!this.blk(c.x,nz,2.8))c.z=nz;else hit=true;if(hit){if(Math.abs(c.v)>12){shk=.5;snd(120,.2,'square',.14,50)}c.v*=-.25}
  c.g.position.set(c.x,0,c.z);c.g.rotation.y=c.yaw;c.g.rotation.z=-s*.04*cl2(c.v/20,-1,1)},
 /* ---- targets for cops ---- */
 targets(range,front){const P=this.P,out=[],ay=P.yaw,fx=Math.sin(ay),fz=Math.cos(ay);
  const ok=(x,z)=>{const dx=x-P.x,dz=z-P.z,d=Math.hypot(dx,dz);if(d>range||d<.01)return false;return!front||(dx*fx+dz*fz)/d>.35};
  for(const c of RM.values())if(c.q&&c.q.tm===1&&c.q.st===0&&!(c.q.cd>=0)&&ok(c.x,c.z))out.push({r:c,x:c.x,z:c.z,d:Math.hypot(c.x-P.x,c.z-P.z)});
  for(const b of this.bots)if(b.role==='crim'&&b.st==='go'&&ok(b.c.x,b.c.z))out.push({b,x:b.c.x,z:b.c.z,d:Math.hypot(b.c.x-P.x,b.c.z-P.z)});return out.sort((a,b)=>a.d-b.d)},
 copArrest(){const t=this.targets(5.5,true)[0]||this.targets(3.5,false)[0];if(!t)return false;if(t.r){this.ar=[t.r.pid,++this.as]}else this.botJail(t.b);this.D.ar++;this.arc++;const r=100+Math.round(RN(0,60));this.cash+=r;this.D.cash+=r;fxBurst(t.x,4,t.z,0x3b9bff);reveal('ARREST!','#3b9bff','+$'+r);this.bux(2);sfx('victory',.5);return true},
 taser(){const P=this.P,t=this.targets(34,true)[0];this.tz=4;P.yaw=yaw+Math.PI;fxTrace(P,t?t.d:30);snd(900,.1,'sawtooth',.16,120);if(!t)return;if(t.r)this.sz=[t.r.pid,++this.zs];else{t.b.st='stun';t.b.t=3}},
 /* ---- bots ---- */
 mkBots(){this.bots=[];const add=(role,x,z,home)=>{const sv=AV;AV=Object.assign({},AV,{shirt:role==='crim'?3:0,hat:0});const c=newP(x,0,z);AV=sv;const r=new THREE.Mesh(new THREE.TorusGeometry(2.4,.12,6,24),new THREE.MeshBasicMaterial({color:role==='crim'?0xff8a1f:0x3b9bff}));r.rotation.x=Math.PI/2;r.position.y=.2;c.g.add(r);const nt=tag(role==='crim'?'Robber':'Cop');nt.scale.set(6,1.5,1);nt.position.y=7;c.g.add(nt);this.bots.push({c,role,st:'go',t:0,wp:pickOf(WP),cd:0,home,sp:role==='crim'?10:11})};
  add('cop',50,20);add('cop',-20,-30);add('cop',20,30);add('cop',-100,-70,1);add('cop',-62,-58,1);add('crim',-30,10);add('crim',30,-14);add('crim',80,0);add('crim',-70,60)},
 botJail(b){b.st='jail';b.t=20;b.c.g.visible=false;b.c.x=-90;b.c.z=-106;snd(250,.2,'sine',.1,120)},
 botTick(b,dt,T){const c=b.c,P=this.P;c.t+=dt;b.cd-=dt;if(b.st==='jail'){b.t-=dt;if(b.t<=0){b.st='go';c.g.visible=true;const w=pickOf(WP);c.x=w[0];c.z=w[1]+10}c.hs=0;animate(c,dt);return}
  if(b.st==='stun'){b.t-=dt;c.g.rotation.x=-1.3;c.hs=0;animate(c,dt);if(b.t<=0){b.st='go';c.g.rotation.x=0}return}
  let tx=null,tz=null,sp=b.sp,chase=0;const pm=this.stt===0&&this.tm===1&&this.stars>0&&this.stun<=0,pd=Math.hypot(P.x-c.x,P.z-c.z);
  if(b.role==='cop'){sp=b.home?10:Math.min(15.5,10.5+this.stars*1.2);let tg=null;
   if(pm&&pd<(b.home?40:70)&&(!b.home||(P.x>YARD[0]&&P.x<YARD[1]&&P.z>YARD[2]&&P.z<YARD[3])))tg={x:P.x,z:P.z,me:1,d:pd};
   else for(const o of this.bots)if(o.role==='crim'&&o.st==='go'&&Math.hypot(o.c.x-c.x,o.c.z-c.z)<22&&Math.random()<.02){tg={x:o.c.x,z:o.c.z,o,d:Math.hypot(o.c.x-c.x,o.c.z-c.z)};break}
   if(tg){tx=tg.x;tz=tg.z;chase=1;if(tg.d<3.4){if(tg.me&&this.carI<0&&this.stun<=0)this.jailMe('A cop caught you!');else if(tg.o)this.botJail(tg.o)}else if(tg.me&&tg.d<17&&b.cd<=0&&this.carI<0){b.cd=5;fxTrace(c,tg.d);this.stunMe(2.2)}}
   if(!chase){if(!b.tw||Math.hypot(c.x-b.tw[0],c.z-b.tw[1])<4){b.tw=b.home?[RN(-108,-52),RN(-108,-52)]:pickOf(WP)}tx=b.tw[0];tz=b.tw[1];sp=7}}
  else{let fl=0;if(this.tm===0&&pd<30){tx=c.x+(c.x-P.x);tz=c.z+(c.z-P.z);sp=14;fl=1}if(!fl){if(!b.tw||Math.hypot(c.x-b.tw[0],c.z-b.tw[1])<4||Math.random()<.003)b.tw=pickOf(WP);tx=b.tw[0];tz=b.tw[1]}}
  const dx=tx-c.x,dz=tz-c.z,d=Math.hypot(dx,dz)||1;let mv=sp;if(d<1.5)mv=0;const nx=c.x+dx/d*mv*dt,nz=c.z+dz/d*mv*dt;let ok=0;if(!this.blk(nx,c.z,1.2)){c.x=nx;ok=1}if(!this.blk(c.x,nz,1.2)){c.z=nz;ok=1}if(!ok)b.tw=null;
  let dy=Math.atan2(dx,dz)-c.yaw;dy=Math.atan2(Math.sin(dy),Math.cos(dy));c.yaw+=dy*Math.min(1,dt*10);c.hs=mv>0?16:0;c.gr=true;c.y=0;c.g.rotation.x=0;animate(c,dt)},
 /* ---- minimap + HUD ---- */
 map(T){const g=this.mx;if(!g)return;const S=140,k=S/280,tx=x=>(x+140)*k,ty=z=>(z+140)*k;g.clearRect(0,0,S,S);g.fillStyle='rgba(20,24,34,.85)';g.fillRect(0,0,S,S);g.fillStyle='#3a3f46';g.fillRect(0,ty(-8),S,16*k);g.fillRect(tx(-8),0,16*k,S);g.fillStyle='rgba(138,143,152,.6)';g.fillRect(tx(-115),ty(-115),70*k,70*k);
  this.sites.forEach(s=>{g.fillStyle=Date.now()/1000>s.until?(s.d[7]>=2?'#ffd23a':'#3ddc84'):'#666';g.fillRect(tx(s.d[3])-2.5,ty(s.d[4])-2.5,5,5)});
  if(this.ping&&T-this.ping.t<10){const s=SITES[this.ping.s];g.strokeStyle='rgba(255,60,60,'+(.5+.5*Math.sin(T*8))+')';g.lineWidth=2;g.beginPath();g.arc(tx(s[3]),ty(s[4]),7+3*Math.sin(T*5),0,6.3);g.stroke()}
  const dot=(x,z,c,r)=>{g.fillStyle=c;g.beginPath();g.arc(tx(x),ty(z),r||2.6,0,6.3);g.fill()};this.cars.forEach(c=>dot(c.x,c.z,'#aaa',1.8));for(const b of this.bots)if(b.st==='go'||b.st==='stun')dot(b.c.x,b.c.z,b.role==='crim'?'#ff8a1f':'#3b9bff');for(const c of RM.values())if(c.q)dot(c.x,c.z,c.q.tm===0?'#7fc0ff':'#ffb060',3.2);
  const P=this.P;g.save();g.translate(tx(P.x),ty(P.z));g.rotate(-P.yaw+Math.PI);g.fillStyle='#fff';g.beginPath();g.moveTo(0,-5);g.lineTo(4,4);g.lineTo(-4,4);g.closePath();g.fill();g.restore()},
 start(){this.load();baseScene(0x9ed0ff);showOver('');scene.fog.near=200;scene.fog.far=420;yaw=Math.PI;this.S=[];this.rm=new Set();
  this.tm=-1;this.stt=0;this.stun=0;this.jt=0;this.cash=0;this.stars=0;this.lastCrime=0;this.carI=-1;this.prog=0;this.pe=false;this.pf=false;this.pm2=false;this.tz=0;this.ar=[0,0];this.as=0;this.sz=[0,0];this.zs=0;this.al=[0,0];this.alr=0;this.ping=null;this.rbc=0;this.arc=0;this.myDoor=null;this.mt=0;this.mi=0;
  this.build();this.P=newP(50,1,28);this.mkBots();this.act=this.acts();
  this.w=gw('<div id="jhd"><b id="jtm">-</b><span id="jcash">$0</span><span id="jst"></span><button id="jsw">⇄ Team</button></div><canvas id="jmap" width="140" height="140"></canvas><div id="jpr"><div id="jpt"></div><div id="jpb"><i></i></div></div><div id="jsel"><div class="jbox"><h2>🚓 Cops &amp; Robbers</h2><p>Choose your team</p><div><button id="jcop">🚓 Police<small>Arrest criminals</small></button><button id="jrob">🔓 Prisoner<small>Break out and rob</small></button></div></div></div><button id="jact">E</button><button id="jtz">⚡</button>');
  this.mx=$('jmap').getContext('2d');$('jcop').onclick=()=>this.setTeam(0);$('jrob').onclick=()=>this.setTeam(1);$('jsw').onclick=()=>{$('jsel').style.display='flex'};
  const hold=(id,code)=>{const b=$(id);b.onpointerdown=e=>{e.preventDefault();keys[code]=true};['pointerup','pointerleave','pointercancel'].forEach(v=>b.addEventListener(v,()=>{keys[code]=false}))};hold('jact','KeyE');hold('jtz','KeyF');
  if(this.D.tm>=0)this.setTeam(this.D.tm);else $('jsel').style.display='flex'},
 update(dt){const P=this.P,T=Date.now()/1000;
  if(this.tm<0){P.t+=dt;animate(P,dt);orbitCam(P);return}
  /* timers */
  this.stun=Math.max(0,this.stun-dt);this.tz=Math.max(0,this.tz-dt);if(this.stars>0&&T-this.lastCrime>40){this.stars=Math.max(0,this.stars-dt/25)}
  if(this.gateOpen&&T>this.gateOpen&&Math.hypot(P.x+80,P.z+45)>8){this.gateOpen=0;if(this.S.indexOf(this.gateS)<0)this.S.push(this.gateS)}
  this.gate.position.y+=((this.gateOpen?-5.5:5)-this.gate.position.y)*Math.min(1,dt*3);
  if(this.stt===1){this.jt-=dt;if(this.jt<=0){this.stt=0;const d=this.myDoor;if(d){d.open=T;d.m.visible=false;const i=this.S.indexOf(d.s);if(i>=0)this.S.splice(i,1)}reveal('DOOR UNLOCKED','#3ddc84','Now escape the prison!');snd(600,.3,'sine',.12,900)}}
  for(const d of this.doors)if(d.open&&T-d.open>40&&d!==this.myDoor&&Math.hypot(P.x-d.cx,P.z+106)>6){d.open=0;d.m.visible=true;if(this.S.indexOf(d.s)<0)this.S.push(d.s)}
  /* input edges */
  const eD=!!keys.KeyE,eP=eD&&!this.pe,fD=!!keys.KeyF||!!keys.Mouse2,fP=fD&&!this.pf;this.pe=eD;this.pf=fD;
  /* movement */
  const car=this.carI>=0?this.cars[this.carI]:null;
  if(car){this.carStep(car,dt);P.x=car.x;P.z=car.z;P.y=0;P.yaw=car.yaw;P.hs=0;P.vy=0;orbitCam({x:car.x,y:1,z:car.z});if(eP)this.exitCar()}
  else if(this.stun>0){P.hs=0;P.t+=dt;animate(P,dt);P.g.rotation.x=-1.3;orbitCam(P)}
  else{P.g.rotation.x=0;ctrl(P,dt,this.S);if(P.y<-8){P.y=1;P.vy=0}}
  /* actions */
  let near=null,nd=1e9;if(this.tm===1&&this.stt===0&&!car&&this.stun<=0)for(const a of this.act){const d=Math.hypot(P.x-a.x,P.z-a.z);if(d<a.r&&d<nd&&a.can()){near=a;nd=d}}
  let ncar=null;if(!car&&!near&&this.stun<=0){let bd=7;for(const c of this.cars){const d=Math.hypot(P.x-c.x,P.z-c.z);if(d<bd&&!c.rp){bd=d;ncar=c}}}
  if(near){if(eD){this.prog+=dt/near.time;if(this.prog>=1){this.prog=0;near.done()}}else this.prog=0}else this.prog=0;
  let did=false;if(this.tm===0&&!car&&this.stun<=0){if(eP)did=this.copArrest();if(fP&&this.tz<=0)this.taser()}
  if(ncar&&eP&&!did)this.enterCar(ncar);
  /* cars sync/cosmetics */
  for(const c of this.cars){if(c.rp&&![...RM.values()].some(r=>r.pid===c.rp&&r.q&&r.q.cd===c.i))c.rp=null;if(c.cop&&c.g.userData.l1){const f=Math.floor(T*4)%2;c.g.userData.l1.material.emissive.setHex(f?0xff0000:0x220000);c.g.userData.l2.material.emissive.setHex(f?0x000022:0x0033ff)}}
  /* bots */
  for(const b of this.bots)this.botTick(b,dt,T);
  /* HUD */
  const tm=this.tm;$('jtm').textContent=tm===0?'🚓 Police':this.stt===1?'🔒 In jail':'🔓 Prisoner';$('jtm').style.color=tm===0?'#7fc0ff':'#ffb060';$('jcash').textContent='$'+fm(this.cash);$('jst').textContent=tm===1?'⭐'.repeat(Math.ceil(this.stars))||'':'';
  const pr=$('jpr'),pt=near?near.t+' (hold E)':ncar?'E: drive':car?'E: get out · WASD drive · Space brake':this.stt===1?'Door unlocks in '+Math.ceil(this.jt)+'s':this.stun>0?'Stunned!':tm===0?(this.targets(5.5,true)[0]?'E: ARREST':this.tz>0?'':'F / right-click: taser'):'';
  if(pt!==this.pt0){this.pt0=pt;$('jpt').textContent=pt;pr.style.display=pt?'block':'none'}$('jpb').style.display=near&&this.prog>0?'block':'none';$('jpb').firstChild.style.width=(this.prog*100)+'%';
  if((this.mi++)%3===0)this.map(T);scoreEl.textContent=(tm===0?'Police':'Prisoner')+' \u00b7 $'+fm(this.cash)+(tm===1&&this.stars>0?' \u00b7 '+'⭐'.repeat(Math.ceil(this.stars)):'')}};
})();
