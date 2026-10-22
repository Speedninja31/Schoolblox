/* Game: Snowball Fight (id: snow) - card, menu info and game engine. */
GAMES.push({id:'snow',name:'Snowball Fight',tag:'FPS',e:'⛄',c:['#7ec8ff','#d6ecff'],like:'96%',pl:'13.7K',hint:'First-person snowball fight in timed matches. The mouse locks when you press Play. WASD move, Space jump, click or E throws, R packs more snow. 3 hits freeze you; headshots hurt more. Vote for a map in the lobby.'});
META.snow={c:'Shooter',m:'Multiplayer',t:['FPS','Matches'],n:1};
ENG.snow={d3:true,fps:true,MN:['Snow Fort','Ice Palace','Pine Forest','Frozen Lake'],
 ex(){return{sh:this.sh,th:this.th,dd:this.dead?1:0,dn:this.dn,kb:this.kb,kc:this.kc,v:this.vote,vc:this.cyc,mk:this.mk,mc:this.cyc}},
 ball(x,y,z,vx,vy,vz,own){const m=new THREE.Mesh(new THREE.SphereGeometry(.5,8,6),new THREE.MeshBasicMaterial({color:0xffffff}));m.position.set(x,y,z);scene.add(m);this.B.push({m,v:new THREE.Vector3(vx,vy,vz),own,life:3})},
 hit(d,by){if(this.dead||this.inv>0||!this.live)return;this.hp-=d;shk=.6;snd(300,.12,'square',.12,120);if(this.hp<=0){this.hp=0;this.dead=true;this.dn++;this.kb=by;this.P.dead=true;explode(this.P,1);fxBurst(this.P.x,3,this.P.z,0xbfe8ff);this.rt=3}},
 rem(c,q){const d=!!q.dd;if(d&&!c.dead)explode(c,1);c.dead=d;c.g.visible=!d;
  if(Array.isArray(q.th))for(const t of q.th)if(t[0]>(c.lt||0)){c.lt=t[0];if(c.lt0)this.ball(t[1],t[2],t[3],t[4],t[5],t[6],false)}c.lt0=1;
  if(Array.isArray(q.sh))for(const h of q.sh)if(h[0]>(c.ls||0)){c.ls=h[0];if(c.ls0&&h[1]===myId)this.hit(h[2],c.pid)}c.ls0=1;
  if(c.ld===undefined&&typeof q.dn==='number')c.ld=q.dn;if(typeof q.dn==='number'&&q.dn>c.ld){if(q.kb===myId){this.kc++;snd(900,.1,'sine',.12,1400);hitMark(true,true)}c.ld=q.dn}},
 buildMap(k){
  if(this.mg)scene.remove(this.mg);const G=this.mg=new THREE.Group();scene.add(G);
  const S=this.S=[{x:0,z:0,hw:65,hd:65,top:0}],rs=mulb(k*61+2024),sky=[0xcfe8ff,0xcfe8ff,0xbfdcf5,0x9fb8c8,0xd8ecff][k+1];
  scene.background.setHex(sky);scene.fog.color.setHex(sky);
  const box=(w,h,d,x,z,c,y0)=>{y0=y0||0;const m=slab(w,h,d,x,y0+h/2,z,c);G.add(m);S.push({x,z,hw:w/2,hd:d/2,top:y0+h,bot:y0})};
  G.add(slab(130,1,130,0,-.5,0,[0xeef6ff,0xeef6ff,0xd6eaff,0xe8f0f4,0xa9d6f5][k+1]));
  [[0,-66,67,1],[0,66,67,1],[-66,0,1,67],[66,0,1,67]].forEach(([x,z,hw,hd])=>box(hw*2,8,hd*2,x,z,0xdfeaf5));
  const man=(x,z)=>[[1.6,1.8],[4.3,1.3],[6.3,.9]].forEach(([y,r])=>{const m=new THREE.Mesh(new THREE.SphereGeometry(r,10,8),lam(0xffffff));m.position.set(x,y,z);G.add(m)});
  if(k<=0){for(let i=0;i<5;i++)man((rs()-.5)*40,(rs()-.5)*40)}
  if(k===0){for(let i=0;i<16;i++){const w=i%2?8:2,d=i%2?2:8;box(w,4,d,(rs()-.5)*110,(rs()-.5)*110,0xcfe0f0)}for(let i=0;i<4;i++)box(10,6,10,(i<2?-1:1)*38,(i%2?-1:1)*38,0xf5faff);for(let i=0;i<10;i++)man((rs()-.5)*110,(rs()-.5)*110)}
  if(k===1){for(let i=-2;i<=2;i++)for(let j=-2;j<=2;j++)if(Math.abs(i)+Math.abs(j)>1)box(4,14,4,i*24,j*24,0xbfe6ff);box(20,18,20,0,0,0xdff3ff);[[22,4],[17,8],[12,12]].forEach(([x,t])=>box(5,t,8,x,0,0xcdeaff));[[-40,-10,-40,10],[40,-10,40,10]].forEach(([a,b,c,d])=>box(Math.max(2,Math.abs(c-a)),8,Math.max(2,Math.abs(d-b)),a,(b+d)/2,0xbfe6ff))}
  if(k===2){for(let i=0;i<40;i++){const x=(rs()-.5)*120,z=(rs()-.5)*120;if(Math.hypot(x,z)<6)continue;box(2,12,2,x,z,0x5a3d28);const c=new THREE.Mesh(new THREE.ConeGeometry(5,11,8),lam(0x2f6b3a));c.position.set(x,15,z);G.add(c)}
   for(let i=0;i<3;i++){const x=-35+i*35,z=(i%2?1:-1)*35;box(14,7,12,x,z,0x8a5a2b);box(16,1,14,x,z,0xffffff,7)}for(let i=0;i<8;i++)box(8,2,2,(rs()-.5)*100,(rs()-.5)*100,0x6b4a2b)}
  if(k===3){for(let i=0;i<6;i++){const a=i*1.047,x=Math.cos(a)*36,z=Math.sin(a)*36;box(16,2,16,x,z,0xeef6ff);man(x,z)}[[30,3],[20,6],[10,9]].forEach(([w,t])=>box(w,t,w,0,0,0xf5faff));
   for(let i=0;i<4;i++){const x=Math.cos(i*1.57+.8)*52,z=Math.sin(i*1.57+.8)*52;box(8,5,8,x,z,0xf0f8ff);const dm=new THREE.Mesh(new THREE.SphereGeometry(4.5,12,8,0,6.283,0,1.57),lam(0xf0f8ff));dm.position.set(x,5,z);G.add(dm)}}},
 start(){
  baseScene(0xcfe8ff);showOver('');PMIN=-1.2;pitch=0;camera.fov=75;camera.updateProjectionMatrix();scene.add(camera);
  this.hand=new THREE.Mesh(new THREE.SphereGeometry(.35,10,8),new THREE.MeshBasicMaterial({color:0xffffff}));this.hand.position.set(.55,-.5,-1.1);camera.add(this.hand);
  this.P=newP(0,0,0);this.P.g.visible=false;Object.assign(this,{B:[],hp:100,dead:false,inv:2,ammo:12,pk:0,cdf:0,sq:0,sh:[],th:[],dn:0,kb:'',kc:0,rt:0,rc:0,cyc:-1,vote:-1,mk:-1,lk:false,live:false,mg:null,ts:performance.now()});
  this.buildMap(-1);this.vu=voteUI(this.MN,i=>{if(Date.now()/1000%200<9)this.vote=i});document.getElementById('xh').style.display='block'},
 update(dt){
  const P=this.P,peers=[...RM.values()],T=Date.now()/1000,cyc=Math.floor(T/200),s=T-cyc*200;
  if(cyc!==this.cyc){this.cyc=cyc;Object.assign(this,{kc:0,vote:-1,mk:-1,lk:false,hp:100,ammo:12,pk:0,dead:false});P.dead=false;clearDebris();this.buildMap(-1);Object.assign(P,{x:(Math.random()-.5)*20,y:1,z:(Math.random()-.5)*20,vy:0})}
  if(s>=12&&!this.lk&&performance.now()-this.ts>2500){this.lk=true;this.mk=pickMap(4,cyc,this.vote);this.buildMap(this.mk);const a=Math.random()*6.283;Object.assign(P,{x:Math.cos(a)*50,y:1,z:Math.sin(a)*50,vy:0});snd(660,.15,'sine',.12,990)}
  this.live=s>=15&&s<195;this.cdf-=dt;this.inv-=dt;
  if(this.dead){this.rt-=dt;camera.position.set(P.x,P.y+9,P.z+10);camera.lookAt(P.x,P.y+3,P.z);if(this.rt<=0){this.hp=100;this.dead=false;P.dead=false;this.inv=2;this.ammo=12;this.pk=0;clearDebris();const a=Math.random()*6.283;Object.assign(P,{x:Math.cos(a)*50,y:1,z:Math.sin(a)*50,vy:0})}}
  else{ctrl(P,dt,this.S);P.g.visible=false;const d=fpsCam(P),ey=camera.position.y;
   if(this.pk>0){this.pk-=dt;if(this.pk<=0)this.ammo=12}
   else if(keys.KeyR&&this.ammo<12)this.pk=1.3;
   else if((keys.Mouse0||keys.KeyE)&&this.cdf<=0){if(this.ammo<=0)this.pk=1.3;else{this.ammo--;this.cdf=.4;snd(400,.08,'triangle',.1,200);const v=[d.x*85,d.y*85+4,d.z*85],r1=n=>Math.round(n*10)/10;this.ball(P.x+d.x*1.2,ey+d.y*1.2,P.z+d.z*1.2,v[0],v[1],v[2],true);this.th.push([++this.sq,r1(P.x),r1(ey),r1(P.z),Math.round(v[0]),Math.round(v[1]),Math.round(v[2])]);if(this.th.length>3)this.th.shift();this.hand.position.z=-.7}}
   this.hand.position.z+=(-1.1-this.hand.position.z)*Math.min(1,dt*10)}
  this.B=this.B.filter(b=>{const p=b.m.position;b.v.y-=18*dt;p.addScaledVector(b.v,dt);b.life-=dt;let gone=b.life<=0||p.y<0;
   if(!gone)for(const sd of this.S){if(!sd.r&&Math.abs(p.x-sd.x)<sd.hw&&Math.abs(p.z-sd.z)<sd.hd&&p.y<sd.top&&p.y>bt(sd)){gone=true;break}}
   if(!gone&&b.own&&this.live)for(const c of peers){if(c.dead)continue;if(Math.hypot(p.x-c.x,p.z-c.z)<1.7&&p.y>c.y&&p.y<c.y+5.6){gone=true;const hs=p.y>c.y+4;this.sh.push([++this.rc,c.pid,hs?50:34]);if(this.sh.length>6)this.sh.shift();hitMark(false,hs);snd(hs?1100:800,.08,'sine',.12,500);break}}
   if(gone){fxBurst(p.x,Math.max(.3,p.y),p.z,0xffffff);scene.remove(b.m);return false}return true});
  const all=peers.filter(c=>c.q&&typeof c.q.kc==='number').map(c=>({n:String(c.q.n||'Player').replace(/[^\w ]/g,'').slice(0,10),k:c.q.kc}));all.push({n:'You',k:this.kc});all.sort((a,b)=>b.k-a.k);
  xhSet(14);setHP(this.hp);
  setB(s<9?'Lobby \u2014 vote for a map! '+Math.ceil(9-s)+'s':s<15?(this.mk>=0?'Map: '+this.MN[this.mk]:'Counting votes...')+' \u2014 match starts in '+Math.ceil(15-s)+'s':s>=195?'Match over! Winner: '+all[0].n+' ('+all[0].k+' kills)':Math.ceil(195-s)+'s left');
  voteSet(this.vu,tally(4,cyc,this.vote),this.vote,s<12);
  scoreEl.textContent='Kills '+this.kc+' \u00b7 \u2744 '+(this.pk>0?'packing...':this.ammo+'/12')+' \u00b7 Top: '+all.slice(0,3).map(a=>a.n+' '+a.k).join(', ')}};
