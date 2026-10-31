/* Game: Natural Disaster Survival (id: survive) - destructible maps, lobby viewing deck, 7 disasters. */
GAMES.push({id:'survive',name:'Disaster Survival',tag:'Survival',e:'☄️',c:['#ff8a4f','#ff4f6a'],like:'91%',pl:'8.9K',hint:'You start in the lobby and watch the map. Vote for a map, then you are teleported in! Climb to a roof for floods and lava, hide inside for acid rain, dodge red rings (meteors, lightning), stay off cracks (earthquake) and run from tornadoes. Buildings break apart! WASD move, Space jump.'});
META.survive={c:'Survival',m:'Multiplayer',t:['Rounds','Map voting','Destruction']};
ENG.survive={d3:true,NAMES:['Meteor Shower','Flood','Tornado','Earthquake','Lightning Storm','Acid Rain','Lava Rise'],MN:['Suburban Street','Skyscrapers','Pirate Cove','Castle','Desert Outpost','Snowy Cabins','Harbor Docks','Industrial Yard'],
 LZ:-195,GE:{},MT:{},B:[],M:[],CR:[],LB:[],
 ex(){return{dd:this.dead?1:0,dc:this.cyc,v:this.vote,vc:this.cyc,mk:this.mk,mc:this.cyc}},
 rem(c,q){const d=!!(q.dd&&q.dc===this.cyc),n=performance.now();if(d&&!c.dd){explode(c);c.hid=n+1500}c.dd=d;c.dead=false;c.g.visible=!(c.hid&&n<c.hid)},
 toLobby(){const P=this.P;Object.assign(P,{x:(Math.random()-.5)*16,y:7,z:this.LZ+12+(Math.random()-.5)*6,vy:0,yaw:Math.PI});yaw=Math.PI;pitch=.3},
 clear(){this.M.forEach(o=>scene.remove(o.m,o.ring));this.M=[];this.CR.forEach(c=>scene.remove(c.m));this.CR=[];this.LB.forEach(b=>{scene.remove(b.m);if(b.bolt)scene.remove(b.bolt)});this.LB=[];this.tw.visible=false;this.fl.visible=false;this.rain.visible=false;clearDebris()},
 topAt(x,z){let t=0;for(const b of this.B)if(b.a&&b.p.top>t&&Math.abs(x-b.x)<b.w/2&&Math.abs(z-b.z)<b.d/2)t=b.p.top;return t},
 kill(b,v,q){if(!b.a)return;b.a=0;this.G.remove(b.m);const i=this.S.indexOf(b.p);if(i>=0)this.S.splice(i,1);
  if(!q&&DEB.length<90){const g=new THREE.Mesh(b.m.geometry,b.m.material);g.position.copy(b.m.position);scene.add(g);DEB.push({g,v:v||new THREE.Vector3((Math.random()-.5)*22,8+Math.random()*14,(Math.random()-.5)*22),w:new THREE.Vector3((Math.random()-.5)*8,(Math.random()-.5)*8,(Math.random()-.5)*8),life:7})}},
 blast(x,y,z,r){for(const b of this.B)if(b.a){const dx=b.x-x,dy=b.y+b.h/2-y,dz=b.z-z,dd=Math.hypot(dx,dy,dz);if(dd<r+2)this.kill(b,new THREE.Vector3(dx/(dd||1)*24,10+Math.random()*12,dz/(dd||1)*24))}
  if(y<4){const m=new THREE.Mesh(new THREE.CircleGeometry(r*.8,16),new THREE.MeshBasicMaterial({color:0x2a2018,transparent:true,opacity:.6}));m.rotation.x=-Math.PI/2;m.position.set(x,.12,z);this.G.add(m)}},
 above(b){for(const c of this.B)if(c.a&&c.y>=b.y+b.h-.5&&Math.abs(c.x-b.x)<(b.w+c.w)/2-.2&&Math.abs(c.z-b.z)<(b.d+c.d)/2-.2)this.kill(c,new THREE.Vector3((Math.random()-.5)*8,Math.random()*4,(Math.random()-.5)*8))},
 buildMap(k){
  const S=this.S;S.length=this.nb;if(this.mg)scene.remove(this.mg);const G=this.mg=new THREE.Group();scene.add(G);this.G=G;const B=this.B=[],rs=mulb(k*77+5),GE=this.GE,MT=this.MT;
  const mat=c=>MT[c]||(MT[c]=tmat(c)),geo=(w,h,d)=>{const q=w+'_'+h+'_'+d;return GE[q]||(GE[q]=new THREE.BoxGeometry(w,h,d))};
  const bk=(w,h,d,x,y,z,c)=>{const m=new THREE.Mesh(geo(w,h,d),mat(c));m.position.set(x,y+h/2,z);G.add(m);const p={x,z,hw:w/2,hd:d/2,top:y+h,bot:y};S.push(p);B.push({m,p,x,y,z,w,h,d,a:1})};
  /* building from 4x3x4 chunks: 2 rows per floor, slab between floors, a door gap on the ground floor */
  const bld=(cx,cz,nw,nd,fl,c,rc,dr)=>{const x0=cx-nw*2+2,z0=cz-nd*2+2,mi=nw>>1,mj=nd>>1;
   for(let f=0;f<fl;f++){const y=f*7;if(f>0)for(let i=0;i<nw;i++)for(let j=0;j<nd;j++)bk(4,1,4,x0+i*4,y-1,z0+j*4,rc);
    for(let i=0;i<nw;i++)for(let j=0;j<nd;j++){if(i&&j&&i<nw-1&&j<nd-1)continue;
     if(f===0&&((dr===0&&i===mi&&j===0)||(dr===1&&i===mi&&j===nd-1)||(dr===2&&i===0&&j===mj)||(dr===3&&i===nw-1&&j===mj)))continue;
     for(let r=0;r<2;r++)bk(4,3,4,x0+i*4,y+r*3,z0+j*4,c)}}
   for(let i=0;i<nw;i++)for(let j=0;j<nd;j++)bk(4,1,4,x0+i*4,fl*7-1,z0+j*4,rc)};
  const st=(x,z,dx,dz,H,c)=>{const n=Math.ceil(H/3.5),r=H/n;for(let i=0;i<n;i++)bk(dx?3:5,H-i*r,dx?5:3,x+dx*i*3,0,z+dz*i*3,c)};
  const ring=(n,R,f)=>{for(let i=0;i<n;i++){const a=i/n*6.283+.4;f(Math.cos(a)*R,Math.sin(a)*R,i,a)}};
  this.isl.material.color.setHex([0x9bc27a,0x6fae55,0x7a8088,0xe3cf9a,0x6b9a50,0xdcbf80,0xeaf2f8,0x9aa4ab,0x777b82][k+1]);
  let trees=k!==1&&k!==6&&k!==7;
  if(k===0){const rd=new THREE.Mesh(new THREE.PlaneGeometry(16,180),mat(0x3b3f45));rd.rotation.x=-Math.PI/2;rd.position.y=.06;G.add(rd);
   [[-27,-46],[-27,0],[-27,46],[27,-46],[27,0],[27,46]].forEach(([x,z],i)=>{const L=x<0;bld(x,z,3,3,2,[0xe9dcc3,0xd8c4a0,0xb9d1e8,0xe8b4a0][i%4],0xa0453a,L?3:2);st(x+(L?-7.5:7.5),z,L?-1:1,0,14,0xcdbb9a)})}
  if(k===1){[[-32,-32],[32,-32],[-32,32],[32,32]].forEach(([x,z],i)=>{bld(x,z,3,3,3,[0x9fb4c8,0xb8c4d0,0x8aa0b8,0xa8b8c8][i],0x6f8196,x<0?3:2);bk(2,9,2,x,21,z,0xcc3333);st(x+(x<0?-7.5:7.5),z,x<0?-1:1,0,21,0xc0c8d0)});
   bld(0,0,2,2,5,0x7f93a8,0x566a80,0);bk(2,10,2,0,35,0,0xcc3333);st(0,-5.5,0,-1,35,0xc0c8d0)}
  if(k===2){for(let i=0;i<3;i++)for(let j=0;j<6;j++){const x=-26+(i-1)*4,z=-6+(j-2.5)*4;bk(4,2,4,x,0,z,0x7a5230);if(i!==1||j===0||j===5){if(!(j===0&&i===1))bk(4,2,4,x,2,z,0x9a6a3a)}}
   [1,4].forEach(j=>{for(let h=0;h<4;h++)bk(2,4,2,-26,2+h*4,-6+(j-2.5)*4,0xb08a5a);bk(8,1,8,-26,18,-6+(j-2.5)*4,0x7a5230)});
   [[30,-30],[36,-8],[24,10]].forEach(([x,z],i)=>bld(x,z,2,2,1,0xcaa268,0x8b5a2b,i%4));for(let i=0;i<8;i++)bk(4,1.5,6,36+i*4,0,36,0x8a6a40)}
  if(k===3){bld(0,0,4,4,3,0xb6b6c4,0x8a8a98,1);st(9.5,0,1,0,21,0xa8a8b4);
   [[-40,-40],[40,-40],[-40,40],[40,40]].forEach(([x,z])=>{bld(x,z,2,2,4,0xa0a0b0,0x80808e,x<0?3:2);st(x+(x<0?-5.5:5.5),z,x<0?-1:1,0,28,0x9898a6)});
   for(let t=-28;t<=28;t+=4){bk(4,6,4,t,0,-40,0xb0b0be);bk(4,6,4,t,0,40,0xb0b0be);bk(4,6,4,-40,0,t,0xb0b0be);bk(4,6,4,40,0,t,0xb0b0be)}}
  if(k===4){for(let i=0;i<4;i++){const n=4-i;for(let a=0;a<n;a++)for(let b=0;b<n;b++)bk(8,4,8,(a-(n-1)/2)*8,i*4,-20+(b-(n-1)/2)*8,[0xe3c88a,0xd9b878,0xcfa96a,0xc29b5a][i])}
   bld(34,26,3,2,1,0xd9b878,0xb8935a,2);bld(-34,28,3,2,1,0xd9b878,0xb8935a,3);[[-30,-40],[30,-40],[-50,0],[50,0]].forEach(([x,z])=>{for(let h=0;h<3;h++)bk(3,5,3,x,h*5,z,0xc9a35f)})}
  if(k===5){ring(5,40,(x,z,i)=>{bld(x,z,3,2,1,0x8a5a2b,0xffffff,i%4);});bld(0,0,4,3,2,0x6b4a2b,0xf5f5f5,0);st(0,-7.5,0,-1,14,0x9a7a4a);for(let h=0;h<4;h++)bk(3,6,3,-30,h*6,48,0x8a8f98)}
  if(k===6){bld(-30,-30,4,3,1,0x8aa0b0,0x5a6a78,1);bld(30,-30,4,3,1,0x8aa0b0,0x5a6a78,1);
   [[-40,20],[-40,32],[0,36],[16,36],[40,20],[40,32]].forEach(([x,z],i)=>{for(let h=0;h<3;h++)bk(8,3,4,x,h*3,z,[0xd04a3a,0x3a7bd0,0xe0a830][(i+h)%3])});
   for(let h=0;h<5;h++)bk(4,6,4,0,h*6,0,0xe0a830);for(let i=1;i<7;i++)bk(4,3,4,i*4-12,30,0,0xe0a830);for(let i=0;i<8;i++)bk(4,1.5,10,-30+i*8,0,62,0x7a6a58)}
  if(k===7){bld(-28,-18,4,4,2,0x8a8f98,0x6a6f78,3);st(-28-9.5,-18,-1,0,14,0xe0a830);
   [-30,0,30].forEach(z=>{for(let h=0;h<4;h++)bk(6,5,6,30,h*5,z,[0xcfd3da,0xb8bcc4][h%2])});for(let h=0;h<5;h++)bk(4,6,4,-28,h*6,34,0xa0453a);for(let i=0;i<4;i++)bk(12,2,2,10,2+i*2,-52,0xe05050)}
  /* extra destructible props + cheap ground decor so the maps do not feel empty (kept clear of the middle where players land) */
  {const free=(x,z,r)=>{const d=Math.hypot(x,z);if(d<11||d>86)return false;for(const b of B)if(Math.abs(b.x-x)<b.w/2+r&&Math.abs(b.z-z)<b.d/2+r)return false;return true},
   pick=a=>a[Math.floor(rs()*a.length)],cc=[0xe53935,0x1e88e5,0xfdd835,0x43a047,0xeceff1,0x6d4c41,0xfb8c00];
   const PR={
    crate:(x,z)=>{bk(2.4,2.4,2.4,x,0,z,0x9a6a3a);if(rs()<.5)bk(2.2,2.2,2.2,x+.2,2.4,z,0x8a5a2b)},
    barrel:(x,z)=>{bk(1.7,2.4,1.7,x,0,z,pick([0x8a5a2b,0x3a6f9a,0xb03a2e]))},
    bench:(x,z)=>{bk(3.6,.5,1.2,x,1.1,z,0x8a5a2b);bk(.5,1.1,1,x-1.4,0,z,0x555a63);bk(.5,1.1,1,x+1.4,0,z,0x555a63);bk(3.6,1,.3,x,1.6,z-.6,0x8a5a2b)},
    lamp:(x,z)=>{bk(.5,6,.5,x,0,z,0x333a44);bk(1.5,.8,1.5,x,6,z,0xffe2a8)},
    fence:(x,z,o)=>{o=o===undefined?rs()<.5:o;for(let i=0;i<3;i++){const dx=o?i*4-4:0,dz=o?0:i*4-4;bk(.5,2.2,.5,x+dx,0,z+dz,0xe8e0d0);bk(o?4:.3,.5,o?.3:4,x+dx+(o?2:0),1.2,z+dz+(o?0:2),0xe8e0d0)}},
    car:(x,z,o)=>{o=o===undefined?rs()<.5:o;const c=pick(cc);bk(o?8.5:4.4,1.5,o?4.4:8.5,x,.4,z,c);bk(o?4.4:3.7,1.2,o?3.7:4.4,x,1.9,z,0x9fd3ff)},
    stall:(x,z)=>{[[-2,-1.5],[2,-1.5],[-2,1.5],[2,1.5]].forEach(([a,b])=>bk(.4,3.4,.4,x+a,0,z+b,0x6b4a2b));bk(5.4,.5,4.4,x,3.4,z,pick(cc));bk(4,1.2,1.5,x,0,z-1.2,0x8a5a2b)},
    shed:(x,z)=>{bk(5,3,5,x,0,z,pick([0x8a5a2b,0xb8935a,0xa0453a]));bk(5.8,.6,5.8,x,3,z,0x5a3d28)},
    rock:(x,z)=>{bk(3.4,2.4,3,x,0,z,0x8a8f98);bk(2.2,1.6,2,x+.3,2.4,z,0x9aa0a8)},
    snowman:(x,z)=>{bk(2.6,2.2,2.6,x,0,z,0xffffff);bk(1.9,1.7,1.9,x,2.2,z,0xffffff);bk(1.3,1.2,1.3,x,3.9,z,0xffffff)},
    cactus:(x,z)=>{bk(1.2,5,1.2,x,0,z,0x3f8f3f);bk(2.2,.9,.9,x+1.2,2.4,z,0x3f8f3f);bk(.9,2,.9,x+2.1,2.4,z,0x3f8f3f)},
    tent:(x,z)=>{bk(6,2.4,5,x,0,z,pick([0xd9b878,0xc9a35f,0xb8935a]));bk(4.4,1.6,4,x,2.4,z,0xd9b878)},
    cont:(x,z,o)=>{o=o===undefined?rs()<.5:o;bk(o?12:5,5,o?5:12,x,0,z,pick(cc))},
    tank:(x,z)=>{bk(5,7,5,x,0,z,0xcfd3da);bk(5.4,.6,5.4,x,7,z,0xa0a6ae)},
    pipe:(x,z,o)=>{o=o===undefined?rs()<.5:o;bk(o?12:1.2,1.2,o?1.2:12,x,0,z,0xe0a830);bk(1.4,3,1.4,x+(o?-6:0),0,z+(o?0:-6),0x777b82)},
    cone:(x,z)=>{bk(.9,1.4,.9,x,0,z,0xff7a1a)},
    well:(x,z)=>{for(let i=0;i<4;i++){const a=i*1.57;bk(1.6,1.6,1.6,x+Math.cos(a)*1.4,0,z+Math.sin(a)*1.4,0x8a8f98)}bk(.4,3.6,.4,x-1.8,1.6,z,0x6b4a2b);bk(.4,3.6,.4,x+1.8,1.6,z,0x6b4a2b);bk(4.4,.5,2.6,x,5,z,0x7a3b2e)},
    hay:(x,z)=>{bk(3.2,2.6,3.2,x,0,z,0xe3c060)},
    boat:(x,z)=>{bk(2.8,1.2,7,x,.3,z,0x8a5a2b);bk(.4,5,.4,x,1.5,z,0x6b4a2b);bk(.3,3.4,2.6,x+.3,2.2,z,0xf5f5f5)}};
   /* hand-placed layouts: 'name x z rot' (rot 1 = turned 90 deg). Only checked against the map structures, so rows and clusters can sit close together. */
   const n0=B.length,P=(nm,x,z,o)=>{if(!PR[nm]||Math.hypot(x,z)<10)return;const r=nm==='cont'||nm==='pipe'?5:nm==='car'||nm==='fence'?3.5:2.5;for(let i=0;i<n0;i++){const b=B[i];if(Math.abs(b.x-x)<b.w/2+r&&Math.abs(b.z-z)<b.d/2+r){if(window.__lay)window.__lay.push('skip '+nm+' '+x+' '+z);return}}PR[nm](x,z,o)},
    run=t=>t.split(';').forEach(q=>{const a=q.trim().split(' ');if(a[0])P(a[0],+a[1],+a[2],a[3]===undefined?undefined:a[3]==='1')});
   const LY=[
/*0 Suburban*/'car -5.2 -62 0;car 5.2 -38 0;car -5.2 -18 0;car 5.2 24 0;car -5.2 42 0;car 5.2 64 0;lamp -10 -72;lamp 10 -72;lamp -10 -48;lamp 10 -48;lamp -10 -24;lamp 10 -24;lamp -10 24;lamp 10 24;lamp -10 48;lamp 10 48;lamp -10 72;lamp 10 72;fence -16 -46 0;fence 16 -46 0;fence -16 0 0;fence 16 0 0;fence -16 46 0;fence 16 46 0;shed -42 -60;shed 42 -60;shed -42 60;shed 42 60;crate -44 -30;barrel -47 -30;crate 44 30;barrel 47 30;crate 44 -30;barrel 47 -30;stall -14 78;stall 14 78;crate -5 80;barrel 5 80;barrel 8 80;bench -14 -80;bench 14 -80;cone -8 -84;cone 8 -84',
/*1 Skyscrapers*/'car -12 -22 0;car 12 20 0;car -22 0 1;car 22 -2 1;car -14 -46 0;car 14 46 0;lamp -16 -16;lamp 16 -16;lamp -16 16;lamp 16 16;lamp -8 -62;lamp 8 -62;lamp -8 62;lamp 8 62;lamp -62 -8;lamp -62 8;lamp 62 -8;lamp 62 8;bench -12 -10;bench 12 10;bench -12 10;bench 12 -10;stall -20 -10;stall 20 10;cont 0 64 1;cont -16 72 1;crate 14 66;crate 17 66;cone -8 56;cone 0 55;cone 8 56;barrel -22 62;barrel 22 62;barrel -50 -20;crate -53 -20;barrel 50 20;crate 53 20',
/*2 Pirate Cove*/'boat -46 -22;boat -46 14;boat -54 -4;barrel -38 -14;barrel -38 -11;crate -38 -8;crate -38 6;barrel -36 9;crate -39 9;stall 12 22;stall 12 -6;crate 8 -24;barrel 11 -24;crate 8 -21;shed 18 -42;shed 46 -22;barrel 20 22;rock 8 58;rock 12 62;rock -6 56;rock -14 62;rock 50 -50;rock 54 -46;hay 48 26;crate 56 24;lamp 20 -16;lamp 16 6;lamp -14 30;lamp -14 -30;barrel -20 40;crate -17 40',
/*3 Castle*/'well -20 -22;stall -26 18;stall -26 27;hay 24 20;hay 28 22;hay 24 24;barrel 22 -24;barrel 25 -24;crate 28 -24;crate 22 -28;shed -28 -26;lamp -6 14;lamp 6 14;lamp -16 -12;lamp 16 -12;barrel -12 24;crate -9 24;bench -14 12;rock -62 -22;rock -66 -18;rock 62 22;rock 58 26;hay 56 -52;hay 60 -54;shed -56 52;barrel -60 52;crate -57 55;lamp 33 -33;lamp -33 33;rock 0 -66;rock 4 -68;hay 0 66;hay 4 68',
/*4 Desert Outpost*/'tent -9 30;tent 9 30;tent 0 42;barrel -3 36;crate 3 36;barrel 0 33;stall -24 12;stall 24 10;cactus -48 -22;cactus -52 -18;cactus 50 -24;cactus 46 -30;cactus -60 30;cactus 62 14;cactus 20 -56;cactus 14 -60;rock -22 -54;rock -26 -56;rock 56 40;rock 52 44;rock -50 52;rock -54 48;crate 20 40;barrel 23 40;tent 60 -6;tent -58 -6;cactus -16 70;cactus 18 72',
/*5 Snowy Cabins*/'@ring52;@ring27;snowman 14 9;snowman 17 11;fence 0 17 1;fence -14 20 1;crate 14 -14;barrel 17 -14;barrel 20 -14;rock 70 0;rock -70 10;rock 0 -70;rock 40 62;rock -50 -60;snowman -48 36;snowman -52 38;snowman 56 -8;shed -10 -40;crate 62 40;barrel 65 40',
/*6 Harbor Docks*/'cone -8 12;cone -4 14;cone 4 14;cone 8 12;lamp -30 52;lamp -15 52;lamp 0 52;lamp 15 52;lamp 30 52;boat -36 74;boat 0 74;boat 36 74;barrel -40 48;barrel -43 48;crate -46 50;cont -14 -50 1;cont 14 -52 1;cont 40 -50 0;crate 0 -22;crate 3 -22;barrel -6 -24;cont -52 -2 0;cont -60 8 0;crate 52 -2;crate 55 -2;barrel 52 2;lamp -22 -4;lamp 22 -4;lamp -22 24;lamp 22 22;stall 30 6',
/*7 Industrial Yard*/'cont -40 40 1;cont -40 47 1;cont -14 58 1;cont 10 64 1;tank -48 12;tank -48 -2;tank -14 14;tank -20 22;pipe 10 22 1;pipe 10 26 1;pipe -10 -36 1;pipe 12 -38 0;barrel -18 38;barrel -16 41;crate -16 36;cone -4 -44;cone 4 -44;cone 16 -46;cone 22 -46;lamp -12 -6;lamp 14 -10;lamp 14 12;lamp 44 -14;lamp 44 14;lamp -28 4;crate 52 -48;barrel 55 -48;crate 58 -46;stall 18 40;barrel 40 56;crate 43 56']
   if(k===5){ring(5,52,(x,z,i)=>P(i%2?'snowman':'shed',x,z));ring(5,27,(x,z)=>P('lamp',x,z))}
   run(LY[k].replace(/@ring\d+;?/g,''));
   const pts=(n,y,r,sc)=>{const o=[];for(let i=0;i<n*2&&o.length<n;i++){const a=rs()*6.283,d=8+rs()*80,x=Math.cos(a)*d,z=Math.sin(a)*d;if(Math.hypot(x,z)<86&&free(x,z,r))o.push([x,y,z,rs()*6.28,(sc||1)*(.7+rs()*.7)])}return o},
    inst=(geo,col,p)=>{if(!p.length)return;const m=new THREE.InstancedMesh(geo,new THREE.MeshLambertMaterial({color:col}),p.length),d=new THREE.Object3D();p.forEach((q,i)=>{d.position.set(q[0],q[1],q[2]);d.rotation.y=q[3];d.scale.setScalar(q[4]);d.updateMatrix();m.setMatrixAt(i,d.matrix)});m.instanceMatrix.needsUpdate=true;m.frustumCulled=false;G.add(m)};
   if(k===0||k===3){inst(new THREE.ConeGeometry(.35,1.3,4),0x3f9a3a,pts(160,.65,.3));inst(new THREE.SphereGeometry(.35,6,5),0xffd23a,pts(40,.35,.3));inst(new THREE.SphereGeometry(.35,6,5),0xff6fa8,pts(40,.35,.3))}
   if(k===1||k===6||k===7)inst(new THREE.CylinderGeometry(2.2,2.2,.05,10),0x2a3340,pts(30,.07,2.5));
   if(k===1||k===6)inst(new THREE.SphereGeometry(1.1,8,6),0x3f9a3a,pts(30,.6,1.2));
   if(k===2||k===3||k===4||k===7)inst(new THREE.DodecahedronGeometry(.9),0x8a8f98,pts(40,.5,1));
   if(k===4)inst(new THREE.SphereGeometry(.7,6,5),0x7a6a3a,pts(40,.4,.8));
   if(k===5){inst(new THREE.SphereGeometry(1.6,8,6),0xffffff,pts(50,.1,1.8));inst(new THREE.DodecahedronGeometry(.8),0x9aa4ab,pts(20,.4,1))}
   if(k===2)inst(new THREE.CylinderGeometry(.5,.5,.12,8),0xf0d9c0,pts(40,.07,.6))}
  if(trees)for(let i=0;i<14;i++){const a=rs()*6.283,r=66+rs()*28,x=Math.cos(a)*r,z=Math.sin(a)*r,pine=k===5,cac=k===4,pm=k===2;
   const tr=new THREE.Mesh(new THREE.CylinderGeometry(cac?1:.7,cac?1:.9,cac?7:pm?6:4,7),mat(cac?0x3f8f3f:0x7a5230));tr.position.set(x,cac?3.5:pm?3:2,z);G.add(tr);
   if(!cac){const lf=new THREE.Mesh(pine?new THREE.ConeGeometry(3.2,8,8):new THREE.SphereGeometry(3.4,10,8),mat(pine?0x2b5e3a:pm?0x3fa84a:0x4caf50));lf.position.set(x,pine?7:pm?7:6.2,z);G.add(lf)}}},
 start(){
  baseScene(0x87c7ff);showOver('');scene.fog.near=300;scene.fog.far=900;const LZ=this.LZ;
  const isl=new THREE.Mesh(new THREE.CylinderGeometry(100,100,4,64),tmat(0x9bc27a,'grass',36));isl.position.y=-2;isl.receiveShadow=true;scene.add(isl);this.isl=isl;
  const sea=new THREE.Mesh(new THREE.PlaneGeometry(1200,1200),new THREE.MeshBasicMaterial({color:0x2a7fd4}));sea.rotation.x=-Math.PI/2;sea.position.y=-6;scene.add(sea);
  /* lobby: raised viewing platform away from the map */
  const lb=new THREE.Mesh(new THREE.CylinderGeometry(32,35,12,40),tmat(0xb9a7e8,'stone',6));lb.position.set(0,0,LZ);lb.receiveShadow=true;scene.add(lb);
  const rg=new THREE.Mesh(new THREE.TorusGeometry(31,.4,8,64),new THREE.MeshBasicMaterial({color:0xf7890b}));rg.rotation.x=Math.PI/2;rg.position.set(0,6.4,LZ);scene.add(rg);
  for(let i=0;i<10;i++){const a=i/10*6.283,x=Math.cos(a)*29,z=LZ+Math.sin(a)*29,p=new THREE.Mesh(new THREE.CylinderGeometry(.35,.35,5,8),lam(0x555a66));p.position.set(x,8.5,z);scene.add(p);const l=new THREE.Mesh(new THREE.SphereGeometry(.8,10,8),new THREE.MeshBasicMaterial({color:0xfff2b0}));l.position.set(x,11.3,z);scene.add(l)}
  const cv=document.createElement('canvas');cv.width=512;cv.height=128;const x=cv.getContext('2d');x.fillStyle='#2a1749';x.fillRect(0,0,512,128);x.fillStyle='#ffb347';x.font='bold 46px system-ui';x.textAlign='center';x.fillText('DISASTER SURVIVAL',256,60);x.fillStyle='#fff';x.font='28px system-ui';x.fillText('Watch the round from the lobby',256,100);
  const sg=new THREE.Mesh(new THREE.PlaneGeometry(24,6),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(cv)}));sg.position.set(0,12,LZ-26);scene.add(sg);
  this.fl=new THREE.Mesh(new THREE.CylinderGeometry(115,115,1,48),new THREE.MeshBasicMaterial({color:0x3d8fe0,transparent:true,opacity:.6}));this.fl.visible=false;scene.add(this.fl);
  this.tw=new THREE.Group();for(let i=0;i<7;i++){const r=new THREE.Mesh(new THREE.CylinderGeometry(2.4+i*1.5,1.6+i*1.5,6,14,1,true),new THREE.MeshLambertMaterial({color:0x8a8f98,transparent:true,opacity:.75,side:THREE.DoubleSide}));r.position.y=3+i*5.5;this.tw.add(r)}this.tw.visible=false;scene.add(this.tw);
  const rp0=new Float32Array(900),rs0=mulb(9);for(let i=0;i<300;i++){rp0[i*3]=(rs0()-.5)*90;rp0[i*3+1]=rs0()*60;rp0[i*3+2]=(rs0()-.5)*90}const rgm=new THREE.BufferGeometry();rgm.setAttribute('position',new THREE.BufferAttribute(rp0,3));this.rain=new THREE.Points(rgm,new THREE.PointsMaterial({color:0x8aff6a,size:1.1}));this.rain.visible=false;this.rain.frustumCulled=false;scene.add(this.rain);
  this.S=[{x:0,z:0,r:100,top:0},{x:0,z:LZ,r:32,top:6}];this.nb=2;this.B=[];this.M=[];this.CR=[];this.LB=[];this.mg=null;this.sk=null;
  this.P=newP(0,7,LZ+12);this.cyc=-1;this.n=0;this.hp=100;this.dead=false;this.in=false;this.back=true;this.vote=-1;this.mk=-1;this.ts=performance.now();this.buildMap(-1);this.toLobby();
  if(this.vh)document.removeEventListener('visibilitychange',this.vh);this.hs=0;this.vh=()=>{if(document.hidden)this.hs=Date.now();else if(this.hs&&Date.now()-this.hs>3000){this.hs=0;this.cyc=-1;this.lk=false;this.ts=0}};document.addEventListener('visibilitychange',this.vh);
  this.vu=voteUI(this.MN,i=>{if(Date.now()/1000%60<9)this.vote=i})},
 update(dt){
  const P=this.P,T=Date.now()/1000,cyc=Math.floor(T/60),s=T-cyc*60,d=Math.floor(mulb(cyc)()*7),t=s-19,act=s>=19&&s<54&&this.lk,now=performance.now(),NM=this.MN.length,LZ=this.LZ;
  const hurt=a=>{if(!this.in||this.dead)return;this.hp-=a;if(this.hp<=0){this.hp=0;this.dead=true;this.in=false;this.back=false;this.rt=now+1500;shk=1;explode(P);P.g.visible=false}};
  if(cyc!==this.cyc){this.cyc=cyc;this.hp=100;this.dead=false;this.in=false;this.back=true;this.won=false;this.lk=false;this.vote=-1;this.mk=-1;this.elig=s<15;this.entered=false;P.g.visible=true;this.clear();this.buildMap(-1);this.toLobby()}
  if(s>=12&&!this.lk&&now-this.ts>2500){this.lk=true;this.mk=pickMap(NM,cyc,this.vote);this.buildMap(this.mk);snd(660,.15,'sine',.12,990)}
  if(this.lk&&this.elig&&!this.entered&&s>=15&&s<19&&!this.dead){this.entered=true;this.in=true;const sa=Math.random()*6.283;Object.assign(P,{x:Math.cos(sa)*80,y:1,z:Math.sin(sa)*80,vy:0});snd(660,.15,'sine',.12,990)}
  if(this.dead&&!this.back&&now>this.rt){this.back=true;P.g.visible=true;this.toLobby()}
  if(s>=57&&this.in){this.in=false;this.toLobby()}
  const sk=act?[0xd9763a,0x7c8fa3,0x6f7480,0x8a6f5a,0x3b3f58,0x7d9a6a,0x8a3a2a][d]:0x87c7ff;
  if(this.sk!==sk){this.sk=sk;scene.background.setHex(sk);scene.fog.color.setHex(sk)}
  if(this.dead&&!this.back)orbitCam(P);else ctrl(P,dt,this.S);
  if(!this.in&&!(this.dead&&!this.back)){const dx=P.x,dz=P.z-LZ,r=Math.hypot(dx,dz);if(r>30.5){P.x=dx/r*30.5;P.z=LZ+dz/r*30.5}if(P.y<-20)this.toLobby()}
  else if(this.in&&P.y<-20)hurt(999);
  const fld=(d===1||d===6)&&this.lk,lvl=fld?(act?-1+t/35*19:(s>=54?Math.max(-1,18-(s-54)/6*19):-1)):-1;
  this.fl.visible=lvl>-.5;this.fl.position.y=lvl;this.fl.material.color.setHex(d===6?0xff5a1a:0x3d8fe0);this.fl.material.opacity=d===6?.9:.6;
  if(this.in&&P.y<lvl-1)hurt((d===6?45:25)*dt);
  if(d===6&&lvl>0)for(const b of this.B)if(b.a&&b.y+b.h*.5<lvl)this.kill(b,null,1);
  this.tw.visible=act&&d===2;
  if(act&&d===2){const a=cyc+t*.3,cx=Math.cos(a)*45+Math.sin(a*2.3)*15,cz=Math.sin(a)*45;this.tw.position.set(cx,0,cz);this.tw.rotation.y+=dt*4;
   for(const b of this.B)if(b.a){const dd=Math.hypot(b.x-cx,b.z-cz);if(dd<7+b.y*.3){const an=Math.atan2(b.z-cz,b.x-cx)+1.6;this.kill(b,new THREE.Vector3(Math.cos(an)*28,16+Math.random()*16,Math.sin(an)*28))}}
   if(this.in&&!this.dead){const dx=cx-P.x,dz=cz-P.z,dd=Math.hypot(dx,dz)||1;if(dd<18){const f=(1-dd/18)*16;P.x+=(dx/dd*f-dz/dd*f*.6)*dt;P.z+=(dz/dd*f+dx/dd*f*.6)*dt;if(dd<8){P.vy+=260*dt;hurt(20*dt)}}}}
  if(act&&d===0){const wi=Math.floor(Date.now()/450);if(wi!==this.wi){this.wi=wi;const r0=mulb(wi),an=r0()*6.283,rr=Math.sqrt(r0())*88,x=Math.cos(an)*rr,z=Math.sin(an)*rr;
   const m=new THREE.Mesh(new THREE.SphereGeometry(4,12,12),new THREE.MeshBasicMaterial({color:0xff7a1a}));m.position.set(x,150,z);
   const ring=new THREE.Mesh(new THREE.RingGeometry(0,8,24),new THREE.MeshBasicMaterial({color:0xff2222,transparent:true,opacity:.45}));ring.rotation.x=-Math.PI/2;ring.position.set(x,.2,z);scene.add(m,ring);this.M.push({m,ring,x,z})}}
  this.M=this.M.filter(o=>{o.m.position.y-=100*dt;const ty=this.topAt(o.x,o.z);if(o.m.position.y<=ty+3){this.blast(o.x,ty,o.z,8);if(this.in&&Math.hypot(P.x-o.x,P.z-o.z)<9&&Math.abs(P.y-ty)<12){hurt(60);shk=.7}scene.remove(o.m,o.ring);snd(110,.2,'sawtooth',.15,40);return false}return true});
  if(act&&d===3){shk=Math.max(shk,.45);const wi=Math.floor(Date.now()/700);if(wi!==this.cw){this.cw=wi;const r1=mulb(wi+31),x=(r1()-.5)*170,z=(r1()-.5)*170;if(Math.hypot(x,z)<96){const m=new THREE.Mesh(new THREE.CircleGeometry(8,20),new THREE.MeshBasicMaterial({color:0x6b4a2b,transparent:true,opacity:.7}));m.rotation.x=-Math.PI/2;m.position.set(x,.15,z);scene.add(m);this.CR.push({m,x,z,t:0})}
    if(t>3&&this.B.length)for(let q=0;q<2;q++){const b=this.B[Math.floor(r1()*this.B.length)],ab=r1()<.55;if(b&&b.a){this.kill(b);if(ab)this.above(b)}}}}
  this.CR=this.CR.filter(c=>{c.t+=dt;if(c.t>1)c.m.material.color.setHex(0x111111);if(c.t>1&&this.in&&!this.dead&&P.y<3&&Math.hypot(P.x-c.x,P.z-c.z)<8)hurt(40*dt);if(c.t>3||!act){scene.remove(c.m);return false}return true});
  if(act&&d===4){const wi=Math.floor(Date.now()/600);if(wi!==this.lw){this.lw=wi;const r2=mulb(wi+77),a=r2()*6.283,rr=Math.sqrt(r2())*90,x=Math.cos(a)*rr,z=Math.sin(a)*rr,m=new THREE.Mesh(new THREE.RingGeometry(0,6,20),new THREE.MeshBasicMaterial({color:0xffffaa,transparent:true,opacity:.5}));m.rotation.x=-Math.PI/2;m.position.set(x,.25,z);scene.add(m);this.LB.push({m,x,z,t:0})}}
  this.LB=this.LB.filter(b=>{b.t+=dt;if(b.t>1&&!b.h){b.h=1;const ty=this.topAt(b.x,b.z),bolt=new THREE.Mesh(new THREE.BoxGeometry(1.2,120,1.2),new THREE.MeshBasicMaterial({color:0xffffff}));bolt.position.set(b.x,60,b.z);scene.add(bolt);b.bolt=bolt;shk=.6;snd(120,.3,'sawtooth',.2,40);this.blast(b.x,ty,b.z,5);if(this.in&&Math.hypot(P.x-b.x,P.z-b.z)<6&&Math.abs(P.y-ty)<10)hurt(70)}if(b.t>1.15||!act){scene.remove(b.m);if(b.bolt)scene.remove(b.bolt);return false}return true});
  this.rain.visible=act&&d===5;
  if(act&&d===5){const a=this.rain.geometry.attributes.position;for(let i=0;i<a.count;i++){let y=a.getY(i)-60*dt;if(y<0)y+=60;a.setY(i,y)}a.needsUpdate=true;this.rain.position.set(P.x,0,P.z);
   if(this.in&&!this.dead&&!this.S.some(sd=>!sd.r&&bt(sd)>=P.y+3&&Math.abs(P.x-sd.x)<sd.hw&&Math.abs(P.z-sd.z)<sd.hd))hurt(7*dt);
   const wi=Math.floor(Date.now()/350);if(wi!==this.aw&&this.B.length){this.aw=wi;const r3=mulb(wi+5);for(let q=0;q<4;q++){const b=this.B[Math.floor(r3()*this.B.length)];if(b&&b.a&&this.topAt(b.x,b.z)<=b.p.top+.1)this.kill(b,null,1)}}}
  if(s>=54&&!this.won&&this.in&&!this.dead){this.won=true;this.n++;snd(660,.2,'sine',.14,990)}
  voteSet(this.vu,tally(NM,cyc,this.vote),this.vote,s<12);
  const wat=!this.elig&&s>=15&&s<57,nm=this.NAMES[d];
  setB(s<9?'Lobby — vote for a map! '+Math.ceil(9-s)+'s':s<15?(this.mk>=0?'Map: '+this.MN[this.mk]:'Counting votes...')+' — '+(this.elig?'teleporting in ':'next round in ')+Math.ceil(15-s)+'s':s<19?'⚠ '+nm+' incoming!':act?(this.in?nm+' — ':'Watching: '+nm+' — ')+Math.ceil(54-s)+'s left':s<57?(this.in?'You survived! 🎉':this.dead?'You did not survive. Watching from the lobby...':wat?'Round over':'Round over'):'Returning to the lobby...');
  specUI(false);setHP(this.in?this.hp:null);scoreEl.textContent='Survived: '+this.n+' rounds'}};
