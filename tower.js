/* Game: Sky Tower (id: tower) - card, menu info and game engine. */
GAMES.push({id:'tower',name:'Sky Tower',tag:'Obby',e:'🗼',c:['#4f8cff','#7a5cff'],like:'94%',pl:'12.4K',hint:'Climb 6 themed stages to the summit: bounce pads, moving platforms, crumbling floors, lava decoys and a low-gravity space finish. WASD move, Space jump, drag to turn the camera, R respawns at your last checkpoint. Beat your best time!'});
META.tower={c:'Casual',m:'Solo \u00b7 Co-op',t:['Obby','6 stages','Best time']};
ENG.tower={d3:true,
 STG:[['Meadow',0x8fd3ff,0x6fbf4a,8],['Candy Land',0xffc4e6,0xff7eb6,7],['Frozen Peaks',0xbfe6ff,0x7ec8ff,7],['Crumble Canyon',0xf0b07a,0xd08a4a,6],['Lava Heights',0x4a1f26,0xe0452a,5],['Cosmos',0x120a2e,0x8a6bff,5]],
 reset(){this.res(false)},
 res(fx){const c=this.cp;Object.assign(this.P,{x:c.x,y:c.y+2.5,z:c.z,vy:0});if(fx){snd(200,.2,'square',.1,80);shk=.3}},
 sign(txt,x,y,z){const cv=document.createElement('canvas');cv.width=512;cv.height=96;const c=cv.getContext('2d');c.fillStyle='rgba(10,12,18,.65)';c.fillRect(0,0,512,96);c.fillStyle='#fff';c.font='bold 42px system-ui';c.textAlign='center';c.fillText(txt,256,64);
  const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(cv),depthTest:false}));sp.scale.set(16,3,1);sp.position.set(x,y,z);return sp},
 start(){
  baseScene(0x8fd3ff);showOver('');
  const S=this.S=[{x:0,z:0,hw:20,hd:20,top:0}],G=new THREE.Group(),R=26;scene.add(G);G.add(slab(40,1,40,0,-.5,0,0x6fbf4a));
  this.mv=[];this.cr=[];this.ys=[];this.cp={x:-14,y:0,z:8};this.cpi=0;this.won=false;this.bn=0;this.t0=0;this.msg=0;this.col=new THREE.Color();this.c2=new THREE.Color();
  const plat=(x,z,size,top,col,o)=>{const m=new THREE.Mesh(rbox(size,1,size,.3),lam(col));m.position.set(x,top-.5,z);m.castShadow=m.receiveShadow=true;G.add(m);const p=Object.assign({x,z,hw:size/2,hd:size/2,top,bot:top-1,m},o||{});S.push(p);return p};
  let a=0,y=0;
  for(let i=1;i<=60;i++){const st=Math.floor((i-1)/10),D=[13,13,13,12,12,17][st],pst=Math.floor((i-2)/10),after=i>1&&st===1&&pst===1&&(i-2)%3===2;
   a+=2*Math.asin(D/(2*R));y+=st===5?7:after?15:4.5;
   const x=Math.cos(a)*R,z=Math.sin(a)*R,cpl=i%10===0&&i<60,top=i===60,size=top?14:cpl?12:this.STG[st][3],col=top||cpl?0xffd23a:new THREE.Color(this.STG[st][2]).offsetHSL(((i*37)%10-5)/100,0,(i%2)*.06).getHex();
   const o={};if(cpl)o.cpi=i/10;if(top)o.win=1;
   if(!cpl&&!top){if(st===1&&(i-1)%3===2){o.bounce=1}if(st===3)o.crumble=1}
   const p=plat(x,z,size,y,o.bounce?0xffffff:col,o);
   if(i%10===1){this.ys[st]=y;G.add(this.sign('Stage '+(st+1)+': '+this.STG[st][0],x,y+9,z))}
   if(o.bounce){const sp=new THREE.Mesh(new THREE.CylinderGeometry(1.4,1.8,.5,16),lam(0xff4f9a));sp.position.set(x,y+.25,z);G.add(sp)}
   if(st===2&&!cpl&&!top){p.bx=x;p.bz=z;p.mvp={tx:-Math.sin(a),tz:Math.cos(a),amp:4,ph:i};this.mv.push(p)}
   if(o.crumble)this.cr.push(p);
   if(st===4&&!cpl){const out=i%2?R+10:R-10,k=plat(Math.cos(a)*out,Math.sin(a)*out,5,y,0xff2a2a,{kill:1});k.m.material.emissive.setHex(0x771111)}
   if(cpl){const pole=new THREE.Mesh(new THREE.CylinderGeometry(.15,.15,6,8),lam(0xdddddd));pole.position.set(x,y+3,z);const fl=new THREE.Mesh(new THREE.BoxGeometry(3,1.6,.1),lam(0xe0352b));fl.position.set(x+1.5,y+5.2,z);G.add(pole,fl);p.flag=fl}
   if(top){const b=new THREE.Mesh(new THREE.CylinderGeometry(1.4,1.8,1,12),lam(0xb8860b)),g=new THREE.Mesh(new THREE.SphereGeometry(1.5,16,12),new THREE.MeshLambertMaterial({color:0xffd23a,emissive:0x886600}));b.position.set(x,y+.5,z);g.position.set(x,y+3,z);G.add(b,g);this.tr=g}}
  const H=y+30;const pil=new THREE.Mesh(new THREE.CylinderGeometry(6,8,H,28),lam(0xdde6f5));pil.position.y=H/2;pil.castShadow=pil.receiveShadow=true;G.add(pil);S.push({x:0,z:0,hw:6,hd:6,top:H,bot:0});
  this.clouds=[];const rs=mulb(77);for(let i=0;i<16;i++){const c=new THREE.Group();for(let j=0;j<4;j++){const m=new THREE.Mesh(new THREE.SphereGeometry(5+rs()*4,10,8),new THREE.MeshLambertMaterial({color:0xffffff,emissive:0x555555}));m.position.set(j*6-9,rs()*3,rs()*4);c.add(m)}c.position.set((rs()-.5)*260,15+rs()*(y+40),(rs()-.5)*260);scene.add(c);this.clouds.push(c)}
  const sp=new Float32Array(1500);for(let i=0;i<500;i++){const u=rs()*6.283,v=Math.acos(2*rs()-1);sp[i*3]=Math.sin(v)*Math.cos(u)*320;sp[i*3+1]=Math.abs(Math.cos(v))*320;sp[i*3+2]=Math.sin(v)*Math.sin(u)*320}
  const sg=new THREE.BufferGeometry();sg.setAttribute('position',new THREE.BufferAttribute(sp,3));this.stars=new THREE.Points(sg,new THREE.PointsMaterial({color:0xffffff,size:2.2,fog:false}));this.stars.visible=false;this.stars.frustumCulled=false;scene.add(this.stars);
  this.P=newP(this.cp.x,0,this.cp.z);this.P.gr=true;let b=0;try{b=+localStorage.getItem('tbest')||0}catch(e){}this.best=b},
 update(dt){
  const P=this.P,T=Date.now()/1000,STG=this.STG,fmt=t=>Math.floor(t/60)+':'+String(Math.floor(t%60)).padStart(2,'0');
  for(const s of this.mv){const q=s.mvp,o=Math.sin(T*1.3+q.ph)*q.amp,nx=s.bx+q.tx*o,nz=s.bz+q.tz*o;if(P.land===s&&P.gr){P.x+=nx-s.x;P.z+=nz-s.z}s.x=nx;s.z=nz;s.m.position.x=nx;s.m.position.z=nz}
  for(const s of this.cr){if(s.t0===undefined)continue;const e=T-s.t0;if(e<.8)s.m.position.x=s.x+(Math.random()-.5)*.3;else if(!s.off){s.off=true;s.tp=s.top;s.bt=s.bot;s.top=-1e4;s.bot=-1e4-1;s.m.visible=false;fxBurst(s.x,s.tp,s.z,0xd08a4a);snd(150,.2,'square',.08,60)}if(e>4){s.top=s.tp;s.bot=s.bt;s.off=false;s.t0=undefined;s.m.visible=true;s.m.position.x=s.x}}
  P.gs=P.y>this.ys[5]-8?.5:1;ctrl(P,dt,this.S);
  const L=P.gr?P.land:null;this.bn-=dt;
  if(L){if(L.crumble&&L.t0===undefined)L.t0=T;
   if(L.bounce&&this.bn<=0){P.vy=108;P.gr=false;this.bn=.4;snd(500,.25,'sine',.14,1100);fxBurst(L.x,L.top,L.z,0xff4f9a)}
   if(L.kill)this.res(true);
   if(L.cpi&&L.cpi>this.cpi){this.cpi=L.cpi;this.cp={x:L.x,y:L.top,z:L.z};L.flag.material.color.setHex(0x3ddc84);snd(880,.2,'sine',.14,1320);this.msg=T+2.5}
   if(L.win&&!this.won){this.won=true;this.tw=T-(this.t0||T);let nb=false;if(!this.best||this.tw<this.best){this.best=this.tw;nb=true;try{localStorage.setItem('tbest',String(this.tw))}catch(e){}}
    reveal('SUMMIT!','#ffd23a','Time '+fmt(this.tw)+(nb?' \u00b7 New best!':''));snd(660,.5,'sine',.16,1320);for(let i=0;i<14;i++)setTimeout(()=>{if(cur===this)fxBurst(P.x+(Math.random()-.5)*10,P.y+3+Math.random()*6,P.z+(Math.random()-.5)*10,[0xff5252,0xffd23a,0x3ddc84,0x3bb0ff,0xb45cff][i%5])},i*120)}}
  if(!this.t0&&P.y>1)this.t0=T;
  if(P.y<this.cp.y-45)this.res(true);
  const ys=this.ys;let k=0;while(k<5&&P.y>ys[k+1])k++;const t=k<5?Math.max(0,Math.min(1,(P.y-ys[k])/(ys[k+1]-ys[k]))):1;
  this.col.setHex(STG[k][1]).lerp(this.c2.setHex(STG[Math.min(5,k+1)][1]),t*.9);scene.background.copy(this.col);scene.fog.color.copy(this.col);
  this.stars.visible=P.y>ys[4];this.stars.position.set(P.x,0,P.z);if(this.tr)this.tr.rotation.y+=dt*2;
  for(const c of this.clouds){c.position.x+=dt*1.5;if(c.position.x>150)c.position.x=-150}
  const el=this.won?this.tw:(this.t0?T-this.t0:0);setB(T<this.msg?'Checkpoint '+this.cpi+'/5 reached!':'');
  scoreEl.textContent='Stage '+(k+1)+'/6 \u00b7 '+STG[k][0]+' \u00b7 '+Math.floor(P.y)+' studs \u00b7 \u23f1 '+fmt(el)+(this.best?' \u00b7 Best '+fmt(this.best):'')}};
