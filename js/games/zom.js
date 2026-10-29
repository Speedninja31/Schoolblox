/* Game: Zombie Siege (id: zom) - card, menu info and game engine. */
GAMES.push({id:'zom',name:'Zombie Siege',tag:'Co-op FPS',e:'🧟',c:['#3a5f2a','#1b2a14'],like:'95%',pl:'18.3K',hint:'First-person zombie survival. The mouse locks when you press Play. WASD move, mouse aim, click to shoot, right-click to aim down sights, R reload, Q or wheel swap guns, F buys guns, perks and the Mystery Box. Headshots do double damage. Grab power-ups the zombies drop. Like COD Zombies, enemies spawn behind boarded-up windows and tear the boards off before climbing in; hold E near a window to repair it (+10 points per board). Rotting colonial-era zombies flank, lunge and charge. Vote for a map in the lobby (8 maps, day and night). Friends can see the gun you hold and every shot.'});
META.zom={c:'Shooter',m:'Co-op',t:['FPS','Waves'],n:1};
ENG.zom={d3:true,fps:true,MN:['Abandoned Compound','Farmstead','Bunker','Graveyard','Frostbite Base','Desert Ruins','Suburban Siege','Toxic Swamp'],
 ENV:[{gr:0x3a3d44,gk:"stone",wl:0x25282e,wk:"stone",sky:0x141b2e,hs:[.62,0x9fb0e0,0x2a2a3a],sun:[.45,0xa8b8ff],fl:1,fog:[26,140],lamp:1},{gr:0x4b5a35,gk:"grass",wl:0x5a3d28,wk:"wood",sky:0xe08a5c,hs:[.85,0xffc79a,0x4a3a30],sun:[.95,0xffa860],fl:.15,fog:[45,220],lamp:1},{gr:0x2c2f36,gk:"stone",wl:0x1f2228,wk:"stone",sky:0x241414,hs:[.5,0xb07070,0x2a1a1a],sun:[.2,0xff8a6a],fl:1,fog:[22,110],lamp:1},{gr:0x2f3a30,gk:"grass",wl:0x2a2d2a,wk:"stone",sky:0x142018,hs:[.5,0x8fd0a8,0x1a2a20],sun:[.25,0x9ad8b8],fl:1,fog:[18,95],lamp:1},{gr:0xeef6ff,gk:"snow",wl:0xcfd8e3,wk:"stone",sky:0xbfd9ee,hs:[1.05,0xffffff,0x8aa0b8],sun:[1.1,0xfff2d8],fl:0,fog:[80,280],lamp:0},{gr:0xd9b878,gk:"sand",wl:0xc9a35f,wk:"sand",sky:0x8fd0ff,hs:[1,0xfff0d0,0xb08a4a],sun:[1.3,0xffe9b0],fl:0,fog:[90,320],lamp:0},{gr:0x6a8a5a,gk:"grass",wl:0x8a8f98,wk:"stone",sky:0xa9b9c9,hs:[.95,0xdde6f0,0x6a7a68],sun:[.8,0xffffff],fl:0,fog:[60,230],lamp:0},{gr:0x2f4a2a,gk:"grass",wl:0x3a3022,wk:"wood",sky:0x2d3b22,hs:[.55,0x9ad08a,0x203018],sun:[.35,0xc8ffa0],fl:.6,fog:[14,80],lamp:0}],
 ZW:[{n:'M1911',d:34,r:.28,m:8,rs:80,t:1.4,p:1,sp:.012,au:0,c:0,k:.014,col:0x3a3f47,len:.3,f:[900,70]},{n:'MP5',d:22,r:.075,m:30,rs:240,t:1.7,p:1,sp:.03,au:1,c:1000,k:.008,col:0x2b2f36,len:.45,f:[1100,90]},{n:'M16',d:38,r:.11,m:30,rs:210,t:2,p:1,sp:.018,au:1,c:1500,k:.012,col:0x30343c,len:.8,long:1,f:[800,60]},{n:'SPAS-12',d:15,r:.75,m:8,rs:56,t:2.4,p:9,sp:.085,au:0,c:1200,k:.05,col:0x4a3a2a,len:.7,long:1,f:[500,50]},{n:'Kar98',d:150,r:1.1,m:5,rs:35,t:2.6,p:1,sp:.002,au:0,c:2000,k:.06,col:0x5a4630,len:1.1,long:1,pi:1,f:[300,40]},{n:'Ray Gun',d:160,r:.4,m:20,rs:160,t:2.2,p:1,sp:.01,au:0,c:0,k:.02,col:0x35c46a,len:.5,ray:1,f:[1500,300]}],
 ex(){const o={hq:this.hq,pc:this.pc,rp:this.rp,dd:this.dead?1:0,v:this.vote,vc:0,at:this.at,wi:this.sl?this.sl[this.cs]:0};if(this.host)o.hz={z:this.Z.map(z=>[z.id,Math.round(z.x*10)/10,Math.round(z.z*10)/10,Math.round(z.hp),z.ty]),w:this.wave,ph:this.ph,tm:Math.ceil(this.tm),ks:this.ks,hk:this.hk,ik:Math.round(this.ikT),dp:Math.round(this.dpT),ma:this.ma,m:this.mk,bd:this.bd.slice(),pu:this.PU.map(p=>[p.id,Math.round(p.x),Math.round(p.z),p.ty])};return o},

 rem(c,q,dt){const d=!!q.dd;if(d&&!c.dead)explode(c);c.dead=d;c.g.visible=!d;
  const wi=Number.isInteger(q.wi)&&q.wi>=0&&q.wi<6?q.wi:0;
  if(c.wi!==wi||!c.w){if(c.w)c.J.aR.remove(c.w);c.w=this.gm(wi,1);c.J.aR.add(c.w);c.wi=wi}c.w.visible=!d;
  if(typeof q.at==='number'&&q.at!==c.lat){if(c.lat!==undefined){c.att=.16;fxTrace(c,70)}c.lat=q.at}
  c.att=Math.max(0,(c.att||0)-dt);const kk=c.att>0?.22:0;
  c.J.aR.rotation.x=-1.5-kk;c.J.aR.rotation.z=-.08;c.J.aL.rotation.x=-1.38-kk;c.J.aL.rotation.z=.4},
 /* detailed gun models (barrel points -z, grip at the origin); tp=1 is the third-person copy that friends see */
 gm(wi,tp){const g=new THREE.Group(),L=(c,e)=>new THREE.MeshLambertMaterial({color:c,emissive:e||0}),
  P=(a,b,c,col,x,y,z,e,rx)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(a,b,c),L(col,e));m.position.set(x,y,z);if(rx)m.rotation.x=rx;m.castShadow=!!tp;g.add(m);return m},
  C=(r,len,col,x,y,z,e)=>{const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,len,10),L(col,e));m.rotation.x=Math.PI/2;m.position.set(x,y,z);g.add(m);return m},
  S=(r,col,x,y,z,e)=>{const m=new THREE.Mesh(new THREE.SphereGeometry(r,10,8),L(col,e));m.position.set(x,y,z);g.add(m);return m},
  GM=0x30343c,DK=0x1b1e24,ST=0x9aa3b0,WD=0x7a4e2b,SK=0xf1c27d;let mz=-.5,hd=[0,-.07,.02,0,-.04,-.28];
  if(wi===0){P(.07,.06,.3,GM,0,.025,-.15);P(.075,.085,.36,ST,0,.09,-.17,.08);P(.082,.07,.07,0x6a727e,0,.09,-.06);C(.022,.05,0x222831,0,.09,-.375);P(.075,.2,.095,GM,0,-.1,.01,0,.16);P(.082,.15,.07,WD,0,-.1,.01,0,.16);P(.02,.05,.1,GM,0,-.012,-.1);P(.012,.04,.012,0x15171b,0,-.01,-.07);P(.014,.025,.014,0x15171b,0,.145,-.33);P(.03,.02,.02,0x15171b,0,.14,-.02);mz=-.42;hd[5]=-.12}
  else if(wi===1){P(.08,.1,.45,0x2b2f36,0,.04,-.25);P(.09,.085,.22,DK,0,.02,-.58);C(.018,.18,0x15171b,0,.04,-.78);C(.03,.05,DK,0,.04,-.88);P(.05,.22,.07,DK,0,-.15,-.32,0,.12);P(.06,.17,.07,DK,0,-.12,-.02,0,.25);P(.05,.07,.24,DK,0,.02,.22);P(.06,.13,.03,0x15171b,0,.0,.35);P(.03,.04,.03,0x15171b,0,.1,-.9);P(.045,.05,.05,0x15171b,0,.115,-.05);P(.02,.05,.1,DK,0,-.04,-.14);mz=-.92;hd[5]=-.55}
  else if(wi===2){P(.08,.09,.5,GM,0,.05,-.3);P(.04,.07,.32,GM,0,.13,-.3);P(.03,.03,.03,0x15171b,0,.175,-.15);P(.075,.08,.36,0x2a2d33,0,-.01,-.26);C(.045,.45,DK,0,.045,-.78);C(.015,.4,0x15171b,0,.045,-1.15);C(.026,.08,DK,0,.045,-1.4);P(.015,.07,.015,0x15171b,0,.1,-1.02);P(.06,.2,.1,DK,0,-.15,-.3,0,.1);P(.06,.15,.07,DK,0,-.12,-.05,0,.3);P(.06,.1,.3,DK,0,.0,.3);P(.065,.13,.03,0x15171b,0,-.01,.46);P(.02,.05,.1,DK,0,-.04,-.16);mz=-1.46;hd[5]=-.7}
  else if(wi===3){P(.085,.11,.46,0x2a2a2e,0,.03,-.2);C(.03,.7,0x1c1c20,0,.07,-.78);C(.028,.66,0x303036,0,.012,-.74);P(.09,.075,.22,0x4a3a2a,0,.004,-.62);C(.036,.04,0x15171b,0,.07,-1.16);P(.06,.03,.5,0x555a63,0,.125,-.6);P(.05,.12,.4,0x4a3a2a,0,-.01,.3);P(.06,.16,.07,0x2a2a2e,0,-.12,-.02,0,.25);P(.02,.05,.1,0x2a2a2e,0,-.04,-.12);S(.015,0xffd23a,0,.15,-1.1,.3);mz=-1.24;hd[5]=-.62}
  else if(wi===4){P(.06,.12,.95,WD,0,-.015,-.2);P(.066,.19,.26,WD,0,-.05,.42);P(.07,.03,.3,0x15171b,0,.02,.6);C(.016,.75,0x2a2e35,0,.06,-1.0);P(.07,.02,.45,0x2a2e35,0,.05,-.25);C(.03,.42,0x1a1c20,0,.17,-.38);C(.036,.05,0x15171b,0,.17,-.18);C(.036,.05,0x15171b,0,.17,-.58);S(.028,0x4aa8ff,0,.17,-.61,.35);P(.03,.05,.03,0x2a2e35,0,.12,-.3);P(.03,.05,.03,0x2a2e35,0,.12,-.46);P(.02,.02,.1,ST,.06,.06,.0);S(.025,ST,.11,.06,.05);mz=-1.4;hd[5]=-.7}
  else{P(.1,.12,.36,0xd8d0c0,0,.03,-.2);S(.07,0x66ffaa,0,.1,-.12,.8);P(.02,.14,.16,0x3dd16a,.06,.1,-.26,.35,.3);P(.02,.14,.16,0x3dd16a,-.06,.1,-.26,.35,.3);P(.02,.14,.16,0x3dd16a,0,.17,-.26,.35);P(.07,.2,.09,0x35c46a,0,-.12,.0,.2,.2);const e=new THREE.Mesh(new THREE.ConeGeometry(.1,.2,12,1,true),L(0xaee8c8,.4));e.rotation.x=-Math.PI/2;e.position.set(0,.03,-.5);g.add(e);C(.045,.12,0x2a6a42,0,.03,-.6,.5);S(.055,0x66ffaa,0,.03,-.67,1);C(.07,.025,0x66ffaa,0,.03,-.35,.9);mz=-.74;hd[5]=-.3}
  const fl=new THREE.Mesh(new THREE.SphereGeometry(wi===5?.2:.13,8,6),new THREE.MeshBasicMaterial({color:wi===5?0x66ffaa:0xffdd55}));fl.position.set(0,.05,mz-.1);fl.visible=false;g.add(fl);g.userData.fl=fl;
  if(tp){g.scale.setScalar(2.2);g.rotation.set(-Math.PI/2,0,Math.PI);g.position.set(0,-1.75,.05)}
  else{P(.085,.085,.1,SK,0,-.07,.04);P(.07,.07,.1,SK,0,-.04,hd[5]);P(.1,.1,.55,0x2a3550,0,-.13,.38,0,.12);P(.09,.09,.45,0x2a3550,-.05,-.1,hd[5]+.3,0,.3)}
  return g},
 /* zombie face drawn straight onto the face texture so the glowing eyes sit exactly in the eye sockets */
 zf(ty,v){const key=ty+'_'+v;this.FT=this.FT||{};if(this.FT[key])return this.FT[key];const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d'),gl=['#ff3b2b','#ffe14a','#ff8a1a','#ff1744'][ty];
  x.fillStyle='rgba(18,6,6,.92)';[22,42].forEach(ex=>{x.beginPath();x.ellipse(ex,24,6.2,5.2,0,0,7);x.fill()});
  [22,42].forEach((ex,i)=>{if(v===1&&i===1){x.fillStyle='#000';x.beginPath();x.arc(ex,24,3,0,7);x.fill();return}const g=x.createRadialGradient(ex,24,.5,ex,24,5);g.addColorStop(0,'#fff');g.addColorStop(.3,gl);g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.beginPath();x.arc(ex,24,5,0,7);x.fill()});
  x.fillStyle='rgba(20,8,8,.8)';x.fillRect(30,32,2,3);x.fillRect(34,32,2,3);
  x.fillStyle='#1a0505';x.beginPath();x.ellipse(32,45,10,v===2?8:5,0,0,7);x.fill();x.fillStyle='#d9d4bd';for(let i=0;i<5;i++){x.beginPath();x.moveTo(24+i*4,41);x.lineTo(26+i*4,46);x.lineTo(28+i*4,41);x.fill()}
  if(v===3){x.fillStyle='#d8d2b8';x.beginPath();x.ellipse(47,38,6,7,0,0,7);x.fill();x.strokeStyle='#6a6450';x.lineWidth=1;x.beginPath();x.moveTo(43,34);x.lineTo(48,40);x.lineTo(46,45);x.stroke()}
  x.strokeStyle='#4a2a1a';x.lineWidth=1.2;x.beginPath();x.moveTo(12,36);x.lineTo(20,40);for(let i=0;i<3;i++){x.moveTo(14+i*3,35+i);x.lineTo(15+i*3,42+i)}x.stroke();
  return this.FT[key]=new THREE.CanvasTexture(c)},
 zv(id,ty,x,z){const sv=AV,H=n=>OPT.hair.findIndex(h=>h[1]===n),Jx=n=>OPT.jacket.findIndex(h=>h[1]===n),rr=mulb(id*97+ty+3),pick=a=>a[Math.floor(rr()*a.length)];
  const soldier=ty===0&&rr()<.5,coat=soldier||ty===3||(ty===0&&rr()<.3),hat=ty===2?'morion':ty===3?'bicorne':soldier&&rr()<.6?'tricorn':'',hair=hat?0:pick([H('messy'),H('shortbk'),H('longbk'),0,H('curly')]),jk=(ty===0&&!coat)?pick([0,Jx('cardi'),0]):0;
  AV=Object.assign({},ZAVS[ty],{hair,jacket:jk});const c=newP(x,0,z);AV=sv;c.g.scale.setScalar([1,.95,1.4,2][ty]);
  const sk=OPT.skin[ZAVS[ty].skin][1],rot=[[0x7f9168,0x8a9a78,0x6f8a6a,0x93a07f][Math.floor(rr()*4)],0xb2bfa2,0x6d7d62,0x5b6a5b][ty];
  c.g.traverse(o=>{if(o.isMesh&&o.material&&o.material.color&&o.material.color.getHex()===sk){o.material=o.material.clone();o.material.color.setHex(rot)}});
  const fc=c.J.head.children.find(o=>o.geometry&&o.geometry.type==='PlaneGeometry');if(fc)fc.material=new THREE.MeshBasicMaterial({map:this.zf(ty,Math.floor(rr()*4)),transparent:true});
  const mat=(col,em)=>new THREE.MeshLambertMaterial({color:col,emissive:em||0}),dm=(col,em)=>new THREE.MeshLambertMaterial({color:col,emissive:em||0,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2}),
   add=(geo,m,px,py,pz,par)=>{const o=new THREE.Mesh(geo,m);o.position.set(px,py,pz);(par||c.up).add(o);return o},bx=(w,h,d)=>new THREE.BoxGeometry(w,h,d);
  const fz=coat?.59:ty===2?.62:.53;
  if(coat){const cc=ty===3?0x2a1a22:soldier?pick([0x8a2a2a,0x2a3a5a]):0x6b5a3f;add(bx(2.12,2.1,1.12),mat(cc),0,3,0);for(let i=0;i<6;i++)add(bx(.34,.4+rr()*.45,1.12),mat(cc),-.88+i*.35,1.78-rr()*.1,0);
   [c.J.aL,c.J.aR].forEach(a=>{add(bx(1.1,1.15,1.1),mat(cc),0,-.58,0,a);add(bx(1.1,.22,1.1),mat(0x2a2a2a),0,-1.18,0,a)});
   if(soldier){[.62,-.62].forEach(rz=>{const bl=add(bx(.26,2.7,.04),dm(0xd8d2bd),0,3,.585);bl.rotation.z=rz});[-.35,0,.35].forEach(dy=>add(bx(.14,.14,.04),dm(0xd4a017),.55,3+dy*1.6,fz))}
   if(ty===3){[-1,1].forEach(q=>add(bx(.95,.16,.95),mat(0xd4a017),q*1.1,4.07,0));add(bx(2.0,2.9,.1),mat(0x5a1010),0,2.9,-.66)}}
  if(ty===1)for(let i=0;i<4;i++)add(bx(1.4,.08,.04),dm(0xe2dcc6),0,3.5-i*.35,fz);
  if(ty===2){add(bx(2.15,1.6,1.15),mat(0x5a5f68),0,3.15,0);[-.7,.7].forEach(px=>[3.6,2.7].forEach(py=>add(bx(.16,.16,.05),dm(0xc0c6cc),px,py,.6)));[-1,1].forEach(q=>add(new THREE.ConeGeometry(.28,.9,5),mat(0x555a63),q*1.5,4.5,0))}
  const bl=dm(0x7a1111);add(bx(.7,.5,.04),bl,-.3,3.2,fz);add(bx(.35,.9,.04),bl,.45,2.7,fz);if(rr()<.6)add(bx(.6,.4,.04),bl,.2,3.6,-fz);
  [c.J.aL,c.J.aR].forEach(a=>[-.3,0,.3].forEach(dx=>{const k=add(new THREE.ConeGeometry(.07,.45,4),mat(0xdde0c8),dx,-2.2,.1,a);k.rotation.x=Math.PI}));
  if(hat==='tricorn'){add(new THREE.CylinderGeometry(1.05,1.05,.08,3),mat(0x1c1c22),0,.52,0,c.J.head);add(new THREE.CylinderGeometry(.5,.58,.38,10),mat(0x1c1c22),0,.78,0,c.J.head);add(new THREE.CylinderGeometry(.52,.52,.07,10),mat(0xd4a017),0,.66,0,c.J.head)}
  if(hat==='morion'){const cp=add(new THREE.SphereGeometry(.74,16,10,0,6.283,0,1.57),mat(0x6a707a),0,.1,0,c.J.head);cp.scale.y=.85;add(new THREE.CylinderGeometry(.92,.92,.07,16),mat(0x6a707a),0,.1,0,c.J.head);add(bx(.12,.28,1.2),mat(0x555a63),0,.78,0,c.J.head)}
  if(hat==='bicorne'){add(bx(1.9,.34,.8),mat(0x1c1c22),0,.78,0,c.J.head);add(bx(1.95,.08,.85),mat(0xd4a017),0,.6,0,c.J.head)}
  return c},
 hitZ(id,dmg,pid,head){const z=this.Z.find(o=>o.id===id);if(!z)return;z.hp-=dmg;if(z.hp<=0){this.Z=this.Z.filter(o=>o!==z);this.ks[pid]=(this.ks[pid]||0)+1;if(head)this.hk[pid]=(this.hk[pid]||0)+1;if(Math.random()<.07)this.PU.push({id:this.nid++,x:z.x,z:z.z,ty:['ma','ik','dp'][Math.floor(Math.random()*3)],life:25})}},
 grab(id){const i=this.PU.findIndex(p=>p.id===id);if(i<0)return;const p=this.PU.splice(i,1)[0],n=Date.now()/1000;if(p.ty==='ma')this.ma++;else if(p.ty==='ik')this.ikT=n+20;else this.dpT=n+20},
 give(wi,own){const w=this.ZW[wi];this.mag[wi]=w.m;this.rsv[wi]=w.rs;this.rl=0;if(!own){if(this.sl[1]<0){this.sl[1]=wi;this.cs=1}else this.sl[this.cs]=wi}},
 wheel(d){if(this.sl[1]>=0&&!this.dead){this.cs=1-this.cs;this.rl=0;snd(500,.05,'square',.06,300)}},

 bset(g,n){const b=this.BR[g];if(!b)return;n=Math.max(0,Math.min(5,n));const old=this.bd[g];this.bd[g]=n;b.pl.forEach((m,i)=>{m.visible=i<n});const has=this.S.includes(b.s);if(n>0&&!has)this.S.push(b.s);else if(n===0&&has)this.S.splice(this.S.indexOf(b.s),1);
  if(n<old){fxBurst(b.x,2,b.z,0x8a5a2b);snd(160,.12,'square',.12,90)}else if(n>old)snd(420,.08,'square',.1,520);if((n===0)!==(old===0)){this.nav();this.nvT=0}},
 repair(g){if(!Number.isInteger(g)||g<0||g>3)return;const b=this.BR[g];if(!b||this.bd[g]>=5)return;if(this.Z.some(z=>Math.hypot(z.x-b.x,z.z-b.z)<3.2))return;this.bset(g,this.bd[g]+1)},
 nav(){const N=62,B=new Uint8Array(N*N);this.NV={N,B,D:new Int16Array(N*N),Q:new Int16Array(N*N)};
  for(const s of this.S){if(s.hw>=60&&s.hd>=60||s.top<1.2)continue;const i0=Math.max(0,Math.floor((s.x-s.hw-1+62)/2)),i1=Math.min(N-1,Math.floor((s.x+s.hw+1+62)/2)),j0=Math.max(0,Math.floor((s.z-s.hd-1+62)/2)),j1=Math.min(N-1,Math.floor((s.z+s.hd+1+62)/2));for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++)B[j*N+i]=1}},
 fld(tg){const V=this.NV,N=V.N,D=V.D,Q=V.Q;D.fill(-1);let h=0,t=0;for(const c of tg){const i=Math.max(0,Math.min(N-1,Math.floor((c.x+62)/2))),j=Math.max(0,Math.min(N-1,Math.floor((c.z+62)/2))),k=j*N+i;if(!V.B[k]){if(D[k]<0){D[k]=0;Q[t++]=k}}else for(let b=-5;b<=5;b++)for(let a=-5;a<=5;a++){const ni=i+a,nj=j+b;if(ni<0||nj<0||ni>=N||nj>=N)continue;const nk=nj*N+ni;if(!V.B[nk]&&D[nk]<0){D[nk]=0;Q[t++]=nk}}}
  while(h<t){const k=Q[h++],i=k%N,j=(k-i)/N,d=D[k]+1;for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){if(!a&&!b)continue;const ni=i+a,nj=j+b;if(ni<0||nj<0||ni>=N||nj>=N)continue;const nk=nj*N+ni;if(D[nk]>=0||V.B[nk])continue;if(a&&b&&(V.B[j*N+ni]||V.B[nj*N+i]))continue;D[nk]=d;Q[t++]=nk}}},
 clr(x0,z0,x1,z1){const V=this.NV,n=Math.ceil(Math.hypot(x1-x0,z1-z0)/1.2);for(let s=1;s<n;s++){const t=s/n,i=Math.floor((x0+(x1-x0)*t+62)/2),j=Math.floor((z0+(z1-z0)*t+62)/2);if(i<0||j<0||i>=V.N||j>=V.N||V.B[j*V.N+i])return false}return true},
 step(z){const V=this.NV,N=V.N,D=V.D,i=Math.max(0,Math.min(N-1,Math.floor((z.x+62)/2))),j=Math.max(0,Math.min(N-1,Math.floor((z.z+62)/2)));let cur=D[j*N+i];if(cur<0)cur=1e9;let bk=null,bv=cur;
  for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){if(!a&&!b)continue;const ni=i+a,nj=j+b;if(ni<0||nj<0||ni>=N||nj>=N)continue;const nk=nj*N+ni,dv=D[nk];if(dv<0||V.B[nk])continue;if(a&&b&&(V.B[j*N+ni]||V.B[nj*N+i]))continue;if(dv<bv){bv=dv;bk=[ni*2-61,nj*2-61]}}return bk},
 buildMap(k){
  if(this.mg)scene.remove(this.mg);const G=this.mg=new THREE.Group();scene.add(G);this.cm=k;
  const E=this.ENV[k],S=this.S=[{x:0,z:0,hw:62,hd:62,top:0}],rs=mulb(k*53+9),PD=[[-28,-8],[28,-8],[-8,28],[8,28],[0,-24],[-22,18],[22,18],[0,10]],PL=[];
  scene.background.setHex(E.sky);scene.fog.color.setHex(E.sky);scene.fog.near=E.fog[0];scene.fog.far=E.fog[1];
  if(this.hemi){this.hemi.intensity=E.hs[0];this.hemi.color.setHex(E.hs[1]);this.hemi.groundColor.setHex(E.hs[2])}sun.intensity=E.sun[0];sun.color.setHex(E.sun[1]);if(this.fl){this.fl.intensity=1.7*E.fl;this.fpl.intensity=E.fl?.45:.05}
  let KEEP=true;const reg=[],box=(w,h,d,x,z,c,y0,kd)=>{y0=y0||0;const m=slab(w,h,d,x,y0+h/2,z,c);m.material=tmat(c,kd);G.add(m);const e={x,z,hw:w/2,hd:d/2,top:y0+h,bot:y0};S.push(e);reg.push({m,e,k:KEEP});return m},
   dec=(geo,c,x,y,z,kd)=>{const m=new THREE.Mesh(geo,kd===undefined?lam(c):tmat(c,kd));m.position.set(x,y,z);m.castShadow=true;G.add(m);return m},
   rp=r=>{for(let i=0;i<40;i++){const x=(rs()-.5)*108,z=(rs()-.5)*108;if(Math.hypot(x,z)>r+10&&PD.every(q=>Math.hypot(q[0]-x,q[1]-z)>r+4)&&PL.every(q=>Math.hypot(q[0]-x,q[1]-z)>r+q[2])){PL.push([x,z,r]);return[x,z]}}return[(rs()-.5)*100,50]},
   tree=(x,z,c)=>{dec(new THREE.CylinderGeometry(.5,.8,5,6),0x5a3d28,x,2.5,z);dec(new THREE.ConeGeometry(3.4,6,8),c,x,7,z,'grass');dec(new THREE.ConeGeometry(2.4,5,8),c,x,10,z,'grass')};
  const fl=slab(124,1,124,0,-.5,0,E.gr||0x3a3d44);fl.material=tmat(E.gr,E.gk,30);G.add(fl);
  [[0,-63,64,1],[0,63,64,1],[-63,0,1,64],[63,0,1,64]].forEach(([x,z,hw,hd])=>box(hw*2,12,hd*2,x,z,E.wl,0,E.wk));
  this.gates=[[0,-56],[0,56],[-56,0],[56,0]];this.BR=[];this.bd=[5,5,5,5];
  [[0,-1],[0,1],[-1,0],[1,0]].forEach(([ux,uz],gi)=>{const zx=uz!==0,gx=ux*49.5,gz=uz*49.5,wc=ux*55.8,wz=uz*55.8;PL.push([ux*56,uz*56,14]);
   if(zx){box(1.4,7,12.6,-12,wz,E.wl,0,E.wk);box(1.4,7,12.6,12,wz,E.wl,0,E.wk);box(8,7,1.2,-8,gz,E.wl,0,E.wk);box(8,7,1.2,8,gz,E.wl,0,E.wk)}else{box(12.6,7,1.4,wc,-12,E.wl,0,E.wk);box(12.6,7,1.4,wc,12,E.wl,0,E.wk);box(1.2,7,8,gx,-8,E.wl,0,E.wk);box(1.2,7,8,gx,8,E.wl,0,E.wk)}
   const sb={x:gx,z:gz,hw:zx?4:.7,hd:zx?.7:4,top:8,bot:0},pl=[];S.push(sb);
   for(let i=0;i<5;i++){const m=new THREE.Mesh(new THREE.BoxGeometry(zx?8.6:.5,.75,zx?.5:8.6),tmat(0x8a5a2b,'wood'));m.position.set(gx+(zx?(rs()-.5)*.3:0),1.1+i*1.35,gz+(zx?0:(rs()-.5)*.3));if(zx)m.rotation.z=(rs()-.5)*.1;else m.rotation.x=(rs()-.5)*.1;m.castShadow=true;G.add(m);pl.push(m)}
   const bm=new THREE.Mesh(new THREE.BoxGeometry(zx?9:1.3,1.2,zx?1.3:9),tmat(0x5a3d28,'wood'));bm.position.set(gx,7.6,gz);G.add(bm);this.BR.push({x:gx,z:gz,s:sb,pl,ux,uz})});KEEP=false;

  if(E.lamp)[[-30,-30],[30,-30],[-30,30],[30,30]].forEach(([x,z])=>{const p=new THREE.Mesh(new THREE.CylinderGeometry(.25,.3,9,6),lam(0x333a44));p.position.set(x,4.5,z);const b=new THREE.Mesh(new THREE.SphereGeometry(.7,8,6),new THREE.MeshBasicMaterial({color:0xffe2a8}));b.position.set(x,9.4,z);const Lt=new THREE.PointLight(0xffd9a0,.9,38);Lt.position.set(x,9,z);G.add(p,b,Lt)});
  if(k===0){for(let i=0;i<7;i++){const x=(rs()-.5)*80,z=(rs()-.5)*80,c=i%2?0x7a3b2e:0x2e5a7a;box(12,5,5,x,z,c);if(i%2)box(12,5,5,x,z,c,5)}
   box(10,2,10,0,0,0x888d96);[[-22,-22],[22,-22],[-22,22],[22,22]].forEach(([x,z])=>box(3,12,3,x,z,0x555a63));[[0,-44,14,2],[0,44,14,2],[-44,0,2,14],[44,0,2,14]].forEach(([x,z,w,d])=>box(w,3,d,x,z,0x6b5a3f));
   for(let i=0;i<8;i++){const[x,z]=rp(2);dec(new THREE.CylinderGeometry(1,1,2.4,10),i%2?0xb03a2e:0x3a6f9a,x,1.2,z,'metal')}}
  if(k===1){box(22,12,16,-30,-28,0x8a2f2f,0,'brick');box(8,20,8,32,-30,0xb8bcc4);box(6,3,4,20,18,0x2e7d32);for(let i=0;i<7;i++)box(4,3,4,(rs()-.5)*80,(rs()-.5)*80,0xd9b84a,0,'wood');
   for(let i=0;i<8;i++){const x=-45+i*13;box(10,2,1,x,38,0x8a5a2b);box(10,2,1,x+3,-44,0x8a5a2b)}
   for(let i=0;i<9;i++){const[x,z]=rp(2.5);dec(new THREE.CylinderGeometry(1.8,1.8,2.2,12),0xe0c060,x,1.1,z,'sand').rotation.z=1.57*(i%2)}for(let i=0;i<10;i++){const[x,z]=rp(3);tree(x,z,0x3f7a3a)}}
  if(k===2){[[-50,-30,-12,-30],[12,-30,50,-30],[-50,30,-12,30],[12,30,50,30],[-30,-50,-30,-12],[-30,12,-30,50],[30,-50,30,-12],[30,12,30,50]].forEach(([a,b,c,d])=>box(Math.max(2,Math.abs(c-a)),12,Math.max(2,Math.abs(d-b)),(a+c)/2,(b+d)/2,0x3a3f48,0,'stone'));box(8,12,8,0,0,0x4a4f58);
   for(let i=0;i<10;i++){const[x,z]=rp(2);box(3,3,3,x,z,0x6b5a3f,0,'wood')}}
  if(k===3){for(let i=0;i<28;i++){const x=(rs()-.5)*100,z=(rs()-.5)*100;if(Math.abs(x)<8&&Math.abs(z)<8)continue;box(2,3,1,x,z,0x8a8f98)}box(16,8,12,0,-22,0x6b6f78);
   for(let i=0;i<10;i++){const x=(rs()-.5)*100,z=(rs()-.5)*100;dec(new THREE.CylinderGeometry(.5,.8,9,6),0x2a2018,x,4.5,z)}
   for(let i=0;i<6;i++){const[x,z]=rp(2);dec(new THREE.CylinderGeometry(.4,.4,1.4,6),0xcfd6dc,x,.7,z);dec(new THREE.BoxGeometry(1.6,.3,.3),0xcfd6dc,x,1.1,z)}}
  if(k===4){const cc=[0x3b82f6,0xe0352b,0x4caf50,0xffa000];for(let i=0;i<10;i++){const[x,z]=rp(6),a=rs()<.5,col=cc[i%4];box(a?12:5,5,a?5:12,x,z,col,0,'metal');if(rs()<.5)box(a?12:5,5,a?5:12,x,z,cc[(i+1)%4],5,'metal')}
   box(18,7,14,0,-36,0xcfd8e3,0,'stone');box(14,1,10,0,-36,0x8a5a2b,7,'wood');box(5,16,5,42,-40,0x8a5a2b,0,'wood');box(10,1,10,42,-40,0x8a5a2b,16,'wood');
   for(let i=0;i<24;i++){const[x,z]=rp(2.5);tree(x,z,0x2f6b3a)}for(let i=0;i<5;i++){const[x,z]=rp(2);[[1.6,1.8],[4.3,1.3],[6.3,.9]].forEach(([y,r])=>dec(new THREE.SphereGeometry(r,10,8),0xffffff,x,y,z,'snow'))}
   for(let i=0;i<5;i++){const[x,z]=rp(5);dec(new THREE.BoxGeometry(10,.1,10),0xb9e4ff,x,.05,z,'snow')}}
  if(k===5){[20,14,8].forEach((w,i)=>box(w,3,w,0,-36,0xd9b878,i*3,'sand'));box(5,4,5,0,-30,0x7a5230,0,'wood');
   for(let i=0;i<8;i++){const a=i/8*6.283,x=Math.cos(a)*24,z=Math.sin(a)*24;if(Math.hypot(x-PD[7][0],z-PD[7][1])>6)box(2.4,i%3?9:5,2.4,x,z,0xc9a35f,0,'sand')}
   for(let i=0;i<9;i++){const[x,z]=rp(6),a=i%2;box(a?10:1.6,4,a?1.6:10,x,z,0xd9b878,0,'sand')}box(10,4,8,34,24,0xb8935a,0,'wood');
   for(let i=0;i<16;i++){const[x,z]=rp(2);dec(new THREE.CylinderGeometry(.5,.6,4,8),0x3f9e4a,x,2,z);dec(new THREE.CylinderGeometry(.3,.3,1.6,6),0x3f9e4a,x+.9,2.6,z).rotation.z=1.2}
   for(let i=0;i<10;i++){const[x,z]=rp(2.5),m=dec(new THREE.DodecahedronGeometry(1.8+rs()*1.4),0x9a8a6a,x,1,z,'stone');m.scale.y=.7}}
  if(k===6){dec(new THREE.BoxGeometry(124,.06,12),0x3a3d44,0,.03,0,'stone');for(let i=-6;i<=6;i++)dec(new THREE.BoxGeometry(4,.07,.4),0xf5f5f5,i*9,.05,0);
   const hc=[0xd9b878,0xb8c9a5,0xc99a8a,0x9fb8d0,0xe3c88a,0xd0a0a0];for(let i=0;i<6;i++){const[x,z]=rp(9);box(14,7,12,x,z,hc[i],0,'stone');box(15.6,1.4,13.6,x,z,0x7a3b2e,7,'brick');box(3,5,.4,x,z+6.3,0x6b4a2b,0,'wood')}
   const cc=[0xe0352b,0x3b82f6,0xffd23a,0x4caf50,0xeeeeee,0x222222];for(let i=0;i<7;i++){const[x,z]=rp(3.5);box(6,2.2,3,x,z,cc[i%6],0,'metal');box(3,1.5,2.8,x,z,cc[i%6],2.2,'metal')}
   for(let i=0;i<8;i++){const[x,z]=rp(4),a=i%2;box(a?9:.5,1.7,a?.5:9,x,z,0xe8e0d0,0,'wood')}for(let i=0;i<14;i++){const[x,z]=rp(2.5);dec(new THREE.CylinderGeometry(.5,.7,4,6),0x5a3d28,x,2,z);dec(new THREE.SphereGeometry(3,10,8),0x3fa34d,x,6,z,'grass')}}
  if(k===7){for(let i=0;i<6;i++){const[x,z]=rp(9),m=dec(new THREE.CylinderGeometry(5+rs()*5,5+rs()*5,.12,18),0x2f5a4a,x,.06,z,'');m.material.transparent=true;m.material.opacity=.85;m.material.emissive.setHex(0x0a2a1a);m.castShadow=false}
   box(12,5,9,-32,-32,0x5a3d28,0,'wood');box(14,1,11,-32,-32,0x3a2a1a,5,'wood');for(let i=0;i<8;i++){const[x,z]=rp(4),a=i%2;box(a?8:1.6,1.6,a?1.6:8,x,z,0x5a3d28,0,'wood')}for(let i=0;i<8;i++){const[x,z]=rp(2.5);box(3,2,3,x,z,0x5a6a5a,0,'stone')}
   for(let i=0;i<24;i++){const[x,z]=rp(2);dec(new THREE.CylinderGeometry(.3,.6,9,6),0x2a2018,x,4.5,z);dec(new THREE.BoxGeometry(.2,3,.2),0x2a2018,x+1,8,z).rotation.z=-.7;dec(new THREE.BoxGeometry(.2,2.5,.2),0x2a2018,x-.9,7,z).rotation.z=.7}
   for(let i=0;i<16;i++){const[x,z]=rp(1);dec(new THREE.SphereGeometry(.45,8,6),i%2?0x66ffaa:0xb06cff,x,.5,z,'').material=new THREE.MeshBasicMaterial({color:i%2?0x66ffaa:0xb06cff})}}
  /* keep the approach to every window clear: remove any prop that would wall it off */
  reg.forEach(o=>{if(o.k)return;const e=o.e;for(const [ux,uz] of [[0,-1],[0,1],[-1,0],[1,0]]){const zx=uz!==0,a0=37,a1=49.5,lo=zx?(uz<0?-a1:a0):(ux<0?-a1:a0),hi=lo+(a1-a0),ox=zx?[-10,10]:[lo,hi],oz=zx?[lo,hi]:[-10,10];
   if(e.x+e.hw>ox[0]&&e.x-e.hw<ox[1]&&e.z+e.hd>oz[0]&&e.z-e.hd<oz[1]){G.remove(o.m);const i=S.indexOf(e);if(i>=0)S.splice(i,1);break}}});
  this.nav()},
 start(){
  baseScene(0x0b0f1a);showOver('');PMIN=-1.2;pitch=0;camera.fov=75;camera.updateProjectionMatrix();
  scene.children.forEach(o=>{if(o.isHemisphereLight){o.intensity=.62;o.color.setHex(0x9fb0e0);o.groundColor.setHex(0x2a2a3a)}});sun.intensity=.45;sun.color.setHex(0xa8b8ff);scene.add(camera);this.hemi=scene.children.find(o=>o.isHemisphereLight);
  const fl=new THREE.SpotLight(0xfff1cf,1.7,85,Math.PI/5.5,.55,1.2);fl.position.set(.25,-.2,0);fl.target.position.set(0,0,-12);camera.add(fl);camera.add(fl.target);this.fl=fl;this.fpl=new THREE.PointLight(0xfff2cc,.45,16);camera.add(this.fpl);
  this.P=newP(0,0,0);this.P.g.visible=false;
  Object.assign(this,{Z:[],PU:[],wave:0,ph:'wait',tm:14,sq:0,sp:0,nid:1,ks:{},hk:{},hseq:{},pcs:{},rcs:{},rp:[0,0],rpq:0,rcd:0,bd:[5,5,5,5],BR:[],hq:[],hs:0,pc:[0,0],pcq:0,zm:new Map(),pum:new Map(),pts:500,hp:100,hpm:100,dead:false,sl:[0,-1],cs:0,mag:[8,0,0,0,0,0],rsv:[80,0,0,0,0,0],rl:0,cdf:0,hc:0,rg:0,lw:-1,lks:0,lkh:0,host:false,wasH:false,pk:{jug:0,spd:0,dbl:0},ikT:0,dpT:0,ma:0,lma:null,mk:0,vote:-1,at:0,ads:0,pm:false,pf:false,pq:false,src:[],ik:false,dp:false,lx:0,lz:0,mv:0,mg:null,boss:false,vmw:-1,vm:null,rec:0});
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
  if(state.ph!=='wait'&&state.m>=0&&state.m<this.MN.length&&state.m!==this.cm){this.buildMap(state.m);Object.assign(P,{x:(Math.random()-.5)*16,y:1,z:(Math.random()-.5)*16,vy:0})}
  if(this.host){
   const tg=[];if(!this.dead)tg.push(P);for(const c of peers)if(!c.dead)tg.push(c);
   if(this.ph==='wait'){this.tm-=dt;if(this.tm<=0){const c=tally(this.MN.length,0,this.vote),mx=Math.max(...c),top=c.map((v,i)=>v===mx?i:-1).filter(i=>i>=0);this.mk=top[Math.floor(Math.random()*top.length)];this.wave=1;this.sq=6;this.boss=false;this.ph='wave'}}
   else if(this.ph==='wave'){this.sp-=dt;
    if(this.sq>0&&this.sp<=0&&this.Z.length<24){const gi=Math.floor(Math.random()*4),g=this.gates[gi];let ty=this.wave>=7&&Math.random()<.12?2:this.wave>=3&&Math.random()<.28?1:0;if(this.wave%5===0&&!this.boss){this.boss=true;ty=3}
     this.Z.push({id:this.nid++,x:g[0]+(Math.random()-.5)*6,z:g[1]+(Math.random()-.5)*6,y:0,hp:[70,50,260,1500][ty]+this.wave*[26,16,70,400][ty],ty,sg:Math.random()<.5?1:-1});{const zz=this.Z[this.Z.length-1];zz.hm=zz.hp;zz.gt=gi;zz.ex=false;zz.at=1.2;zz.lc=2+Math.random()*2;zz.lg=0;zz.vx=0;zz.vz=0;zz.sk=0;zz.tr=null}this.sq--;this.sp=Math.max(.45,1.3-this.wave*.07)}
    if(this.sq<=0&&!this.Z.length){this.ph='break';this.tm=10}
    if(!tg.length){this.ph='over';this.tm=7}}
   else if(this.ph==='break'){this.tm-=dt;if(this.tm<=0){this.wave++;this.sq=6+this.wave*4;this.boss=false;this.ph='wave'}}
   else if(this.ph==='over'){this.tm-=dt;if(this.tm<=0){this.wave=0;this.Z=[];this.PU=[];this.sq=0;this.ph='wait';this.tm=14;for(let g=0;g<4;g++)this.bset(g,5);this.ks={};this.hk={};this.lks=0;this.lkh=0}}
   const sp0=[7.2,12.5,5.5,6.5];this.nvT=(this.nvT||0)-dt;if(this.NV&&this.nvT<=0&&tg.length){this.nvT=.3;this.fld(tg)}
   for(const z of this.Z){let held=false;
    if(z.gt!==undefined&&!z.ex){const b=this.BR[z.gt];if(Math.abs(z.gt<2?z.z:z.x)<48.5)z.ex=true;else if(this.bd[z.gt]>0){held=true;const ix=b.x+b.ux*2.2,iz=b.z+b.uz*2.2,dx=ix-z.x,dz=iz-z.z,dl=Math.hypot(dx,dz);
      if(dl>1.1){const sp=Math.min(sp0[z.ty]+this.wave*.1,z.ty===1?16:10);z.x+=dx/dl*sp*dt;z.z+=dz/dl*sp*dt;pushOut(z,this.S)}else{z.at-=dt;if(z.at<=0){z.at=1.7;this.bset(z.gt,this.bd[z.gt]-1)}}}}
    if(!held){let best=null,bd=1e9;
    for(const c of tg){const d=Math.hypot(c.x-z.x,c.z-z.z)*(c===z.tr?.7:1);if(d<bd){bd=d;best=c}}z.tr=best;if(best)bd=Math.hypot(best.x-z.x,best.z-z.z);
    if(best){let sp=Math.min(sp0[z.ty]+this.wave*.1,z.ty===1?16:10);const vis=bd<18&&this.clr(z.x,z.z,best.x,best.z);
     z.lc-=dt;if(z.ty===1&&vis&&bd<11&&bd>3&&z.lc<=0){z.lg=.55;z.lc=3.5+Math.random()*2}if(z.lg>0){z.lg-=dt;sp*=1.8}
     if(z.ty===3&&z.hp<z.hm*.4)sp*=1.3;if(z.ty===2&&vis&&bd<14)sp*=1.15;
     let tx=best.x,tz=best.z;
     if(this.NV&&(bd>9||!vis)){const n=this.step(z);if(n){tx=n[0];tz=n[1]}}
     else if(bd>6){let near=0;for(const o of this.Z)if(o!==z&&o.tr===best&&Math.hypot(o.x-z.x,o.z-z.z)<7)near++;if(near>=1){const px=-(tz-z.z),pz=tx-z.x,pl=Math.hypot(px,pz)||1,off=Math.min(5,bd*.4)*z.sg;tx+=px/pl*off;tz+=pz/pl*off}}
     const dx=tx-z.x,dz=tz-z.z,dl=Math.hypot(dx,dz)||1;
     if(bd>1.5){const k=Math.min(1,dt*9);z.vx+=(dx/dl*sp-z.vx)*k;z.vz+=(dz/dl*sp-z.vz)*k;const bx=z.x,bz=z.z;z.x+=z.vx*dt;z.z+=z.vz*dt;pushOut(z,this.S);
      const mv=Math.hypot(z.x-bx,z.z-bz);if(mv<sp*dt*.25){z.sk+=dt;if(z.sk>.5){z.sg=-z.sg;z.sk=0;z.vx=-dz/dl*sp;z.vz=dx/dl*sp}}else z.sk=Math.max(0,z.sk-dt)}}}
    for(const o of this.Z)if(o!==z){const dx=z.x-o.x,dz=z.z-o.z,dd=Math.hypot(dx,dz);if(dd<2.4&&dd>.01){const f=(2.4-dd)*4;z.x+=dx/dd*f*dt;z.z+=dz/dd*f*dt}}
    z.x=Math.max(-60,Math.min(60,z.x));z.z=Math.max(-60,Math.min(60,z.z))}
   this.PU=this.PU.filter(p=>(p.life-=dt)>0);
   for(const c of peers){const q=c.q;if(!q)continue;if(Array.isArray(q.hq))for(const h of q.hq)if(h[0]>(this.hseq[c.pid]||0)){this.hseq[c.pid]=h[0];this.hitZ(h[1],h[2],c.pid,h[3])}
    if(Array.isArray(q.pc)&&q.pc[0]>(this.pcs[c.pid]||0)){this.pcs[c.pid]=q.pc[0];this.grab(q.pc[1])}
    if(Array.isArray(q.rp)&&q.rp[0]>(this.rcs[c.pid]||0)){this.rcs[c.pid]=q.rp[0];this.repair(q.rp[1])}}}
  const src=this.host?this.Z.map(z=>[z.id,z.x,z.z,z.hp,z.ty]):(hz?hz.z:[]),seen=new Set();this.src=src;if(hz&&Array.isArray(hz.bd))hz.bd.forEach((n,g)=>{if(g<4&&Number.isInteger(n)&&n>=0&&n<=5&&n!==this.bd[g])this.bset(g,n)});this.ik=state.ik>now;this.dp=state.dp>now;
  for(const a of src){seen.add(a[0]);let c=this.zm.get(a[0]);
   if(!c){c=this.zv(a[0],a[4],a[1],a[2]);this.zm.set(a[0],c)}
   const dx=a[1]-c.x,dz=a[2]-c.z,mv=Math.hypot(dx,dz),k=this.host?1:Math.min(1,dt*14);c.x+=dx*k;c.z+=dz*k;if(mv>.04)c.yaw+=wr(Math.atan2(dx,dz)-c.yaw)*Math.min(1,dt*12);c.hs=mv>.05?16:0;c.gr=true;c.y=0;c.t+=dt;animate(c,dt);c.J.aL.rotation.x=c.J.aR.rotation.x=-1.45+Math.sin(c.t*5+a[0])*.1;c.J.aL.rotation.z=Math.sin(c.t*3+a[0])*.1;c.J.aR.rotation.z=-Math.sin(c.t*3.4+a[0])*.1;c.J.head.rotation.z=Math.sin(c.t*2+a[0])*.14;c.J.head.rotation.x=a[4]===1?.3:.08;if(c.g.parent!==scene)scene.add(c.g)}
  {this.rcd-=dt;let ng=-1;if(!this.dead)this.BR.forEach((b,g)=>{if(Math.hypot(P.x-b.x,P.z-b.z)<7&&(b.uz?Math.abs(P.z):Math.abs(P.x))<49.2)ng=g});
   const rb=document.getElementById('role'),rt=document.getElementById('rt');
   if(ng>=0){const b=this.BR[ng];rb.style.display='block';rt.style.color='#ffd23a';rt.textContent=this.bd[ng]>=5?'Window barricade intact':'Hold E: repair window ('+this.bd[ng]+'/5)';document.getElementById('rcd').style.width=Math.max(0,Math.min(100,100*(1-this.rcd/.9)))+'%';
    if(keys.KeyE&&this.bd[ng]<5&&this.rcd<=0&&!src.some(a=>Math.hypot(a[1]-b.x,a[2]-b.z)<3.2)){this.rcd=.9;this.pts+=10;this.rpq++;this.rp=[this.rpq,ng];snd(380,.07,'square',.1,500);if(this.host)this.repair(ng)}}
   else rb.style.display='none'}
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
  if(!this.vm||this.vmw!==wi){if(this.vm)camera.remove(this.vm);this.vm=this.gm(wi,0);this.vmw=wi;camera.add(this.vm)}
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
      const hl=[];for(const a of src){const sc=[1,.95,1.4,2][a[4]],vc=this.zm.get(a[0]),zx=vc?vc.x:a[1],zz=vc?vc.z:a[2],th=raySph(o,dir,zx,4.6*sc,zz,.78*sc),tb=Math.min(raySph(o,dir,zx,3.1*sc,zz,1.15*sc),raySph(o,dir,zx,1.2*sc,zz,1.05*sc)),t=Math.min(th,tb);if(t<tw)hl.push({a,t,head:th<=tb})}
      hl.sort((p,q)=>p.t-q.t);const tk=w.pi?hl.slice(0,3):hl.slice(0,1);
      tk.forEach(h=>{const e=hits.get(h.a[0])||{a:h.a,dmg:0,head:false};e.dmg+=w.d*(h.head?2.2:1);e.head=e.head||h.head;hits.set(h.a[0],e)});
      if(k<3){const te=tk.length&&!w.pi?tk[0].t:tw;tracer(mz,{x:o.x+dx*te,y:o.y+dy*te,z:o.z+dz*te},w.ray?0x66ffaa:0xffe9a0)}}
     hits.forEach(e=>{let dmg=e.dmg*(this.pk.dbl?1.33:1);if(this.ik)dmg=99999;this.pts+=10*(this.dp?2:1);hitMark(false,e.head);const m=bm(new THREE.SphereGeometry(.3,6,6),0x7bd15a);{const vz=this.zm.get(e.a[0]);m.position.set(vz?vz.x:e.a[1],e.head?4.6:2.6,vz?vz.z:e.a[2])}fxAdd(m,.25,null,6);
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
  voteSet(this.vu,tally(this.MN.length,0,this.vote),this.vote,ph==='wait'&&state.tm>5);
  setB(ph==='wait'?'Vote for a map \u2014 starting in '+Math.ceil(state.tm)+'s':ph==='over'?'GAME OVER \u2014 restarting...':ph==='break'?'Wave '+wv+' cleared! Next in '+Math.ceil(state.tm)+'s':near?'F: '+label+(near.ty==='perk'&&this.pk[near.pk]?'':' ($'+cost+')'):'Wave '+wv+(this.ik?' \u00b7 INSTA-KILL':'')+(this.dp?' \u00b7 2X POINTS':''));
  specUI(this.dead);setHP(this.hp/this.hpm*100);scoreEl.textContent='Wave '+wv+' \u00b7 $'+this.pts+' \u00b7 '+w.n+' '+(this.rl>0?'reloading':this.mag[wi]+'/'+this.rsv[wi])+' \u00b7 Zombies '+src.length}};
