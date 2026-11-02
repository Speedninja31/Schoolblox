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
 kill(b,v,q){if(!b.a)return;b.a=0;if(!q)sfx('glass',.5);this.G.remove(b.m);const i=this.S.indexOf(b.p);if(i>=0)this.S.splice(i,1);
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
  /* flat ground layers (roads, paths, water): one mesh per call, each layer sits a little higher and has its own depth offset so nothing can flicker */
  const FL=this.FL=[];let FID=0;
  const flat=(rc,c,lay)=>{const pos=[],idx=[],y=.03+lay*.03,id=++FID;rc.forEach(([cx,cz,w,d],i)=>{const x0=cx-w/2,x1=cx+w/2,z0=cz-d/2,z1=cz+d/2;pos.push(x0,y,z0,x1,y,z0,x1,y,z1,x0,y,z1);idx.push(i*4,i*4+2,i*4+1,i*4,i*4+3,i*4+2);FL.push([cx,cz,w,d,lay,id])});
   const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setIndex(idx);g.computeVertexNormals();
   const m=new THREE.Mesh(g,new THREE.MeshLambertMaterial({color:c,polygonOffset:true,polygonOffsetFactor:-lay,polygonOffsetUnits:-lay}));m.receiveShadow=true;G.add(m)};
  const tree=(x,z,s=1)=>{bk(1.2*s,4*s,1.2*s,x,0,z,0x7a5230);bk(5*s,4*s,5*s,x,4*s,z,0x4caf50)};
  const pine=(x,z)=>{bk(1.2,2.5,1.2,x,0,z,0x6b4a2b);bk(5.6,3,5.6,x,2.5,z,0x2b5e3a);bk(3.8,3,3.8,x,5.5,z,0x2f6b43);bk(1.8,2.4,1.8,x,8.5,z,0x2b5e3a)};
  const palm=(x,z)=>{bk(1,7,1,x,0,z,0x9a7a4a);bk(7,.8,1.8,x,7,z,0x3fa84a);bk(1.8,.8,7,x,7.8,z,0x3fa84a);bk(2,1,2,x,8.6,z,0x2f8f3a)};
  const cactus=(x,z)=>{bk(1.2,5,1.2,x,0,z,0x3f8f3f);bk(2.2,.9,.9,x+1.7,2.4,z,0x3f8f3f);bk(.9,2,.9,x+2.3,3.3,z,0x3f8f3f)};
  const fountain=(x,z)=>{bk(8,1,8,x,0,z,0xa8adb5);bk(6,1,6,x,1,z,0x8fc7e8);bk(1.6,3.2,1.6,x,2,z,0xcfd3da);bk(3.6,.8,3.6,x,5.2,z,0xa8adb5)};
  const gazebo=(x,z)=>{bk(9,.6,9,x,0,z,0xcdbb9a);[[-3.6,-3.6],[3.6,-3.6],[-3.6,3.6],[3.6,3.6]].forEach(([a,b])=>bk(.8,6.4,.8,x+a,.6,z+b,0xf0ebe0));bk(10,1,10,x,7,z,0x8a3b2e);bk(6,1.4,6,x,8,z,0x7a3328)};
  const mstall=(x,z,c)=>{[[-2.2,-1.6],[2.2,-1.6],[-2.2,1.6],[2.2,1.6]].forEach(([a,b])=>bk(.4,4.6,.4,x+a,0,z+b,0x6b4a2b));bk(6,.6,4.6,x,4.6,z,c);bk(3.6,1.4,1.6,x,0,z-1.2,0x8a5a2b)};
  const mound=(x,z,w,d,n,c)=>{for(let i=0;i<n;i++)bk(w*(1-i/n*.7),1.8,d*(1-i/n*.7),x,i*1.8,z,c)};
  const pyr=(x,z,n,sz,c)=>{for(let i=0;i<n;i++){const m=n-i;for(let a=0;a<m;a++)for(let b=0;b<m;b++)bk(sz,sz/2,sz,x+(a-(m-1)/2)*sz,i*sz/2,z+(b-(m-1)/2)*sz,c)}};
  const lighthouse=(x,z)=>{bk(9,3,9,x,0,z,0xd9d0c0);bk(7,10,7,x,3,z,0xf2f2f2);bk(6,6,6,x,13,z,0xc0392b);bk(5.4,6,5.4,x,19,z,0xf2f2f2);bk(4,3,4,x,25,z,0xffe28a);bk(5.4,1,5.4,x,28,z,0x333a44)};
  const cliff=(x,z)=>{bk(10,6,8,x,0,z,0x7a7f86);bk(7,5,6,x+1,6,z,0x8a8f98);bk(4,4,4,x+1.5,11,z,0x9aa0a8)};
  const tank=(x,z)=>{bk(8,10,8,x,0,z,0xcfd3da);bk(8.6,.8,8.6,x,10,z,0xa0a6ae)};
  const igloo=(x,z)=>{bk(7,2.4,7,x,0,z,0xf0f6fa);bk(5,2.2,5,x,2.4,z,0xe6eef4);bk(2.6,1.8,2.6,x,4.6,z,0xf0f6fa);bk(2.4,2,2,x,0,z+4.6,0xf0f6fa)};
  const gantry=(x,z,c)=>{bk(2.4,18,2.4,x-8,0,z,c);bk(2.4,18,2.4,x+8,0,z,c);bk(20,2,3,x,18,z,c)};
  const ship=(x,z)=>{bk(9,3,24,x,0,z,0x6a3a2a);bk(7,3,8,x,3,z-6,0xe8e0d0);bk(2,4,2,x,6,z-6,0xc0392b);bk(6,2.5,4,x,3,z+6,0xd04a3a);bk(6,2.5,4,x,3,z+1.5,0x3a7bd0)};
  this.isl.material.color.setHex([0x9bc27a,0x6fae55,0x7a8088,0xe3cf9a,0x6b9a50,0xdcbf80,0xeaf2f8,0x9aa4ab,0x777b82][k+1]);
  let trees=k!==1&&k!==6&&k!==7;
  if(k===0){flat([[0,0,16,180]],0x3b3f45,1);
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
  /* ---- hand-placed map features (parks, roads, water, landmarks) instead of random scatter ---- */
  const FM=B.length;
  if(k===0){const dz=[],cw=[];for(let z=-84;z<=84;z+=12)if(Math.abs(Math.abs(z)-22)>7)dz.push([0,z,.5,5]);for(let i=0;i<8;i++)cw.push([-7+i*2,22,1,5],[-7+i*2,-22,1,5]);
   flat([[-9,0,2,180],[9,0,2,180],[-15.5,-46,11,3],[15.5,-46,11,3],[-15.5,0,11,3],[15.5,0,11,3],[-15.5,46,11,3],[15.5,46,11,3]],0xc9c2b4,2);flat(dz,0xf2c200,3);flat(cw,0xffffff,3);
   [-76,-60,-30,30,60,76].forEach(z=>{tree(12.5,z);tree(-12.5,z)});
   bld(27,76,3,3,1,0xd8c4a0,0xa0453a,2);bld(-27,76,3,3,1,0xb9d1e8,0xa0453a,3);bld(27,-76,3,3,1,0xe8d0b0,0x8a3b2e,2);bld(-27,-76,3,3,1,0xc9d8b0,0x8a3b2e,3);
   bld(-66,0,5,3,2,0xe8c97a,0xa0453a,3);st(-66,-7.5,0,-1,14,0xb8935a);bk(.6,16,.6,-52,0,9,0xcfd3da);bk(3,2,.2,-50.2,14,9,0xc0392b);
   flat([[-66,26,22,13]],0x5b7fa8,1);flat([[-66,26,.4,13],[-66,26,22,.4]],0xffffff,2);
   flat([[66,0,25,17]],0x9a9ea6,1);flat([[66,0,21,13]],0x3f8fd0,2);flat([[66,24,14,14]],0xcdbb9a,1);gazebo(66,-24);fountain(66,24);
   [[54,-12],[78,-12],[54,12],[78,12],[56,-36],[76,-36],[56,36],[76,36],[66,-42],[66,42]].forEach(([x,z])=>tree(x,z));
   flat([[28,22,20,18],[14.5,22,13,6]],0x4a4f55,1);[[22.5,17.5],[22.5,26.5],[33.5,17.5],[33.5,26.5]].forEach(([x,z])=>bk(1,7,1,x,0,z,0xf0ebe0));bk(14,1,12,28,7,22,0xe05050);bk(1.4,4,1.4,25,0,22,0xcfd3da);bk(1.4,4,1.4,31,0,22,0xcfd3da);bld(46,22,2,2,1,0xe8e0d0,0xc0392b,2)}
  if(k===1){const dsh=[];for(let j=0;j<9;j++){const t=20+j*8;dsh.push([0,t,.5,3],[0,-t,.5,3],[t,0,3,.5],[-t,0,3,.5])}
   flat([[0,0,12,180],[-48,0,84,12],[48,0,84,12]],0x2f3338,1);flat([[0,0,30,30]],0x8a909a,2);flat(dsh,0xf2c200,3);
   const lots=[[52,56],[-52,56],[52,-56],[-52,-56]],str=[];lots.forEach(([cx,cz])=>{for(let i=0;i<9;i++)str.push([cx-12+i*3,cz,.35,12])});flat(lots.map(([x,z])=>[x,z,30,18]),0x3a3f45,1);flat(str,0xffffff,2);
   bk(52,1,4,0,13,-32,0x6f8196);bk(52,1,4,0,13,32,0x6f8196);bk(4,1,52,-32,13,0,0x6f8196);bk(4,1,52,32,13,0,0x6f8196);
   bld(26,66,3,2,2,0x9fb4c8,0x6f8196,2);bld(-26,66,3,2,2,0xb4a58c,0x6f8196,3);bld(26,-66,3,2,2,0xb4a58c,0x6f8196,2);bld(-26,-66,3,2,2,0x9fb4c8,0x6f8196,3);bld(68,0,2,3,2,0xc8b89a,0x6f8196,2);bld(-68,0,2,3,2,0x9fb4c8,0x6f8196,3);
   [[18,-82,0xe05050],[-18,-82,0x3a7bd0],[18,82,0xe0a830],[-18,82,0x43a047]].forEach(([x,z,c])=>{bk(.8,8,.8,x-3.5,0,z,0x555a63);bk(.8,8,.8,x+3.5,0,z,0x555a63);bk(11,5,.8,x,8,z,c)});
   [[11,11],[-11,11],[11,-11],[-11,-11]].forEach(([x,z])=>tree(x,z))}
  if(k===2){lighthouse(62,-56);for(let i=0;i<8;i++)bk(4,1.5,6,-44+i*4,0,64,0x8a6a40);
   [[-26,-66],[6,-66],[-26,-52],[6,-52]].forEach(([x,z])=>{bk(6,8,6,x,0,z,0x9a8f78);bk(6.6,1,6.6,x,8,z,0x8a7f68)});bk(26,5,2,-10,0,-66,0xb0a58a);bk(10,5,2,-18,0,-52,0xb0a58a);bk(10,5,2,-3,0,-52,0xb0a58a);bk(2,5,8,-26,0,-59,0xb0a58a);bk(2,5,8,6,0,-59,0xb0a58a);
   [[-18,-60],[-8,-60],[-1,-58]].forEach(([x,z])=>bk(1.6,1.6,4.5,x,0,z,0x2a2a2a));
   flat([[-70,10,32,50]],0xefe0b0,1);flat([[-70,10,26,44]],0x2f86c8,2);flat([[-22,-42,7,1.4],[-22,-42,1.4,7]],0x8a1c1c,3);
   [[-52,-20],[-52,40],[-84,-8],[-84,28],[-70,-28],[-70,48],[40,48],[28,52],[54,50],[8,48]].forEach(([x,z])=>palm(x,z));
   cliff(-62,-46);cliff(70,-30);cliff(-40,-64);cliff(20,-74)}
  if(k===3){for(let t=-28;t<=28;t+=8){bk(2,2,2,t,6,-40,0x8a8a98);bk(2,2,2,t,6,40,0x8a8a98);bk(2,2,2,-40,6,t,0x8a8a98);bk(2,2,2,40,6,t,0x8a8a98)}
   flat([[0,0,72,72]],0x9b9588,1);flat([[0,24,6,32]],0xbfb7a2,2);flat([[33,56,6,34],[-33,56,6,34],[33,-56,6,34],[-33,-56,6,34],[56,33,34,6],[56,-33,34,6],[-56,33,34,6],[-56,-33,34,6]],0xb89a6a,1);
   bld(-22,-24,3,2,1,0x8a8a98,0x6a3a2e,1);bld(22,-24,3,2,1,0xa08a6a,0x5a3d28,1);fountain(0,28);mstall(-26,10,0xc0392b);mstall(-26,20,0x2e7d32);mstall(-26,30,0xf9a825);
   bld(62,-26,2,2,1,0xc9b79a,0x7a3b2e,2);bld(62,26,2,2,1,0xc9b79a,0x7a3b2e,2);bld(-62,-26,2,2,1,0xb8a88a,0x7a3b2e,3);bld(-62,26,2,2,1,0xb8a88a,0x7a3b2e,3);
   [[58,58],[50,64],[-58,58],[-50,64],[58,-58],[50,-64],[-58,-58],[-50,-64]].forEach(([x,z])=>tree(x,z))}
  if(k===4){flat([[-56,-44,22,16]],0x9a8f5a,1);flat([[-56,-44,18,12]],0x2f86c8,2);[[-70,-44],[-42,-44],[-56,-58],[-56,-30],[-66,-54],[-46,-54]].forEach(([x,z])=>palm(x,z));
   bk(8,5,16,0,0,-62,0xcfa96a);bk(5,5,5,0,5,-68.5,0xd9b878);bk(7,2,6,0,10,-68.5,0x3a6fb0);bk(2.4,2.4,5,-2.5,0,-73,0xcfa96a);bk(2.4,2.4,5,2.5,0,-73,0xcfa96a);
   pyr(58,-54,3,6,0xcfa96a);pyr(-70,-20,3,6,0xc29b5a);
   [-15,-5,5,15].forEach((x,i)=>mstall(x,16,[0xc0392b,0x1e88e5,0xf9a825,0x43a047][i]));
   [[-58,10],[60,36],[-30,64],[34,76],[-62,60],[66,-14]].forEach(([x,z])=>mound(x,z,16,12,2,0xe8cf94));
   [[44,60],[-44,56]].forEach(([x,z])=>{bk(10,4,2,x,0,z,0xc9a35f);bk(2,6,2,x-4,0,z+3,0xc9a35f);bk(2,3,2,x+3,0,z+4,0xc9a35f)});
   [[-20,-50],[20,-50]].forEach(([x,z])=>{bk(2,10,2,x,0,z,0xc9a35f);bk(1.4,1.5,1.4,x,10,z,0xe0c070)});
   [[-48,10],[50,-20],[-30,52],[30,56],[70,10],[-72,30],[18,-56],[-18,-56]].forEach(([x,z])=>cactus(x,z))}
  if(k===5){const pth=[];ring(5,40,(x,z)=>{pth.push([x/2,0,Math.abs(x),3],[x,z/2,3,Math.abs(z)])});flat(pth,0xc9c3b6,1);flat([[62,-18,26,20]],0xbfe3f2,1);
   igloo(-56,-20);igloo(52,48);igloo(-16,-56);[[-70,-50],[-62,-58],[-66,-44],[66,60],[60,66],[-60,56],[-66,62],[72,-50],[66,-58]].forEach(([x,z])=>pine(x,z));
   [[66,38],[-50,-40],[-20,60],[76,2]].forEach(([x,z])=>mound(x,z,16,12,2,0xffffff));
   [[2.4,0],[-2.4,0],[0,2.4],[0,-2.4],[1.7,1.7],[-1.7,1.7],[1.7,-1.7],[-1.7,-1.7]].forEach(([a,b])=>bk(1.3,1,1.3,18+a,0,10+b,0x8a8f98));bk(1.2,1.6,1.2,18,0,10,0xff7a1a);[[0,7],[0,-7],[7,0],[-7,0]].forEach(([a,b])=>bk(a?1:3,.9,a?3:1,18+a,0,10+b,0x6b4a2b))}
  if(k===6){const dsh=[];for(let x=-50;x<=50;x+=8)dsh.push([x,8,3,.4]);
   flat([[0,10,110,62]],0x4a4f55,1);flat([[0,-11,120,4]],0x8a8478,2);flat([[0,-12,120,.8],[0,-10,120,.8]],0x2a2a2a,3);flat(dsh,0xf2c200,3);
   flat([[0,71,120,6],[0,77,108,6],[0,83,90,6],[0,89,64,6],[0,94,36,4]],0x2f86c8,1);ship(-26,82);ship(26,82);lighthouse(44,64);
   bld(0,-62,4,3,1,0x8aa0b0,0x5a6a78,1);gantry(-56,-54,0xe0a830);gantry(56,-54,0xe0a830);
   [[-40,-50],[-30,-50],[-20,-50],[20,-50],[30,-50],[40,-50],[56,-8],[56,0],[-56,-8],[-56,0]].forEach(([x,z],i)=>{for(let h=0;h<2;h++)bk(8,3,4,x,h*3,z,[0xd04a3a,0x3a7bd0,0xe0a830,0x43a047][(i+h)%4])})}
  if(k===7){const dsh=[];for(let x=-80;x<=80;x+=10)if(x<8||x>20)dsh.push([x,6,4,.4]);for(let z=-80;z<=80;z+=10)if(z<-2||z>14)dsh.push([14,z,.4,4]);
   flat([[0,6,170,10],[14,-43,10,88],[14,48.5,10,75]],0x3a3f45,1);flat(dsh,0xf2c200,2);
   bk(46,1.2,2.4,3,14.5,-18,0xe0a830);[-12,0,12,22].forEach(x=>bk(1.2,14.5,1.2,x,0,-18,0x777b82));
   for(let i=0;i<4;i++){bk(1.2,8,1.2,70,0,-72+i*10+0,0x777b82)}
   bk(1.4,1.4,30,68,8,-60,0xe0a830);bk(1.4,1.4,30,72,8,-60,0x4a8fd0);
   [[56,-56],[-50,-62]].forEach(([x,z])=>{bk(14,4,14,x,0,z,0xc8ccd2);bk(11,6,11,x,4,z,0xd4d8de);bk(9,8,9,x,10,z,0xc8ccd2);bk(12,3,12,x,18,z,0xb8bcc4)});
   [[50,30],[62,30],[50,44],[62,44]].forEach(([x,z])=>tank(x,z));bld(-30,-58,4,2,1,0x8a8f98,0x6a6f78,1);bld(40,62,3,3,1,0x8a8f98,0x6a6f78,2);gantry(-6,62,0xe0a830);
   for(let h=0;h<5;h++)bk(4,6,4,66,h*6,10,0xa0453a)}
  if(k===2){flat([[0,71,120,6],[0,77,108,6],[0,83,90,6],[0,89,64,6],[0,94,36,4]],0x2f86c8,1);ship(-30,82);ship(10,84);
   bld(8,38,4,2,2,0x8a5a2b,0x5a3d28,0);st(17.5,38,1,0,14,0x9a7a4a);flat([[6,22,26,14]],0xb8a98a,1);fountain(6,22);
   bld(-44,-36,2,2,1,0xb8935a,0xe0c070,3);bld(-44,26,2,2,1,0xb8935a,0xe0c070,3);bld(48,-46,2,2,1,0xb8935a,0xe0c070,2);bld(56,12,2,2,1,0xb8935a,0xe0c070,2)}
  if(k===4){bld(0,64,4,2,2,0xcfa96a,0xb8935a,0);st(9.5,64,1,0,14,0xcfa96a);[-12,-6,6,12].forEach(x=>{bk(2,8,2,x,0,48,0xe3c88a);bk(2.6,1,2.6,x,8,48,0xcfa96a)});
   bld(58,12,2,2,1,0xd9b878,0xb8935a,3);bld(-62,40,2,2,1,0xd9b878,0xb8935a,2);bld(-58,-4,2,2,1,0xd9b878,0xb8935a,2);bld(60,-34,2,2,1,0xd9b878,0xb8935a,3);
   flat([[0,36,50,22]],0xd6bf8a,1);flat([[0,16,44,3]],0xc8ad78,2)}
  if(k===5){ring(5,68,(x,z,i)=>bld(x,z,2,2,1,0x6b4a2b,0xf5f5f5,i%4));[[58,-18],[68,-12]].forEach(([x,z])=>{bk(4,3.4,4,x,0,z,0x8a5a2b);bk(4.8,.6,4.8,x,3.4,z,0xf5f5f5)});mound(-80,-12,24,22,4,0xffffff)}
  if(k===6){bld(-70,30,2,2,1,0x8aa0b0,0x5a6a78,3);[[-60,46],[-50,46],[-60,57],[-50,57]].forEach(([x,z])=>tank(x,z));
   flat([[-55,50,22,14]],0x8a8478,1);bld(70,30,2,2,1,0x8aa0b0,0x5a6a78,2);[[-68,-30],[68,-30]].forEach(([x,z])=>{for(let h=0;h<2;h++)bk(8,3,4,x,h*3,z,[0xd04a3a,0x3a7bd0][h])})}
  if(k===7){bld(-56,12,3,3,1,0x8a8f98,0x6a6f78,3);for(let i=0;i<3;i++)for(let j=0;j<2;j++){bk(4,5,3,-64+i*7,0,42+j*7,0x5a6a78);bk(.8,3,.8,-64+i*7,5,42+j*7,0xe0a830)}
   for(let h=0;h<5;h++)bk(4,6,4,-60,h*6,-34,0xa0453a);[[-3,-3],[3,-3],[-3,3],[3,3]].forEach(([a,b])=>bk(1,12,1,72+a,0,-14+b,0x777b82));bk(7,6,7,72,12.8,-14,0xcfd3da);bk(8,.8,8,72,12,-14,0x777b82);
   flat([[-64,45,26,18]],0x4a4f55,1)}
  for(let i=FM;i<B.length;i++)B[i].f=1;
  /* ground decor so the maps do not feel empty (kept clear of the middle where players land) */
  {const free=(x,z,r)=>{const d=Math.hypot(x,z);if(d<11||d>86)return false;for(const f of FL)if(Math.abs(f[0]-x)<f[2]/2+r&&Math.abs(f[1]-z)<f[3]/2+r)return false;for(const b of B)if(Math.abs(b.x-x)<b.w/2+r&&Math.abs(b.z-z)<b.d/2+r)return false;return true},
   pick=a=>a[Math.floor(rs()*a.length)],cc=[0xe53935,0x1e88e5,0xfdd835,0x43a047,0xeceff1,0x6d4c41,0xfb8c00];
   const pts=(n,y,r,sc)=>{const o=[];for(let i=0;i<n*2&&o.length<n;i++){const a=rs()*6.283,d=8+rs()*80,x=Math.cos(a)*d,z=Math.sin(a)*d;if(Math.hypot(x,z)<86&&free(x,z,r))o.push([x,y,z,rs()*6.28,(sc||1)*(.7+rs()*.7)])}return o},
    inst=(geo,col,p)=>{if(!p.length)return;const m=new THREE.InstancedMesh(geo,new THREE.MeshLambertMaterial({color:col}),p.length),d=new THREE.Object3D();p.forEach((q,i)=>{d.position.set(q[0],q[1],q[2]);d.rotation.y=q[3];d.scale.setScalar(q[4]);d.updateMatrix();m.setMatrixAt(i,d.matrix)});m.instanceMatrix.needsUpdate=true;m.frustumCulled=false;G.add(m)};
   if(k===0||k===3){inst(new THREE.ConeGeometry(.35,1.3,4),0x3f9a3a,pts(160,.65,.3));inst(new THREE.SphereGeometry(.35,6,5),0xffd23a,pts(40,.35,.3));inst(new THREE.SphereGeometry(.35,6,5),0xff6fa8,pts(40,.35,.3))}
   if(k===1||k===6||k===7)inst(new THREE.CylinderGeometry(2.2,2.2,.05,10),0x2a3340,pts(30,.07,2.5));
   if(k===1||k===6)inst(new THREE.SphereGeometry(1.1,8,6),0x3f9a3a,pts(30,.6,1.2));
   if(k===2||k===3||k===4||k===7)inst(new THREE.DodecahedronGeometry(.9),0x8a8f98,pts(40,.5,1));
   if(k===4)inst(new THREE.SphereGeometry(.7,6,5),0x7a6a3a,pts(40,.4,.8));
   if(k===5){inst(new THREE.SphereGeometry(1.6,8,6),0xffffff,pts(50,.1,1.8));inst(new THREE.DodecahedronGeometry(.8),0x9aa4ab,pts(20,.4,1))}
   if(k===2)inst(new THREE.CylinderGeometry(.5,.5,.12,8),0xf0d9c0,pts(40,.07,.6))}
  if(trees)for(let i=0;i<14;i++){const a=rs()*6.283,r=66+rs()*28,x=Math.cos(a)*r,z=Math.sin(a)*r,pine=k===5,cac=k===4,pm=k===2;if(B.some(b=>Math.abs(b.x-x)<b.w/2+5&&Math.abs(b.z-z)<b.d/2+5)||FL.some(f=>Math.abs(f[0]-x)<f[2]/2+4&&Math.abs(f[1]-z)<f[3]/2+4))continue;
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
  if(this.lk&&this.elig&&!this.entered&&s>=15&&s<19&&!this.dead){this.entered=true;this.in=true;const sa=Math.random()*6.283;Object.assign(P,{x:Math.cos(sa)*80,y:1,z:Math.sin(sa)*80,vy:0});sfx('spawn',1);snd(660,.15,'sine',.12,990)}
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
  this.LB=this.LB.filter(b=>{b.t+=dt;if(b.t>1&&!b.h){b.h=1;sfx('thunder',.85);const ty=this.topAt(b.x,b.z),bolt=new THREE.Mesh(new THREE.BoxGeometry(1.2,120,1.2),new THREE.MeshBasicMaterial({color:0xffffff}));bolt.position.set(b.x,60,b.z);scene.add(bolt);b.bolt=bolt;shk=.6;snd(120,.3,'sawtooth',.2,40);this.blast(b.x,ty,b.z,5);if(this.in&&Math.hypot(P.x-b.x,P.z-b.z)<6&&Math.abs(P.y-ty)<10)hurt(70)}if(b.t>1.15||!act){scene.remove(b.m);if(b.bolt)scene.remove(b.bolt);return false}return true});
  this.rain.visible=act&&d===5;
  if(act&&d===5){const a=this.rain.geometry.attributes.position;for(let i=0;i<a.count;i++){let y=a.getY(i)-60*dt;if(y<0)y+=60;a.setY(i,y)}a.needsUpdate=true;this.rain.position.set(P.x,0,P.z);
   if(this.in&&!this.dead&&!this.S.some(sd=>!sd.r&&bt(sd)>=P.y+3&&Math.abs(P.x-sd.x)<sd.hw&&Math.abs(P.z-sd.z)<sd.hd))hurt(7*dt);
   const wi=Math.floor(Date.now()/350);if(wi!==this.aw&&this.B.length){this.aw=wi;const r3=mulb(wi+5);for(let q=0;q<4;q++){const b=this.B[Math.floor(r3()*this.B.length)];if(b&&b.a&&this.topAt(b.x,b.z)<=b.p.top+.1)this.kill(b,null,1)}}}
  if(s>=54&&!this.won&&this.in&&!this.dead){this.won=true;this.n++;snd(660,.2,'sine',.14,990);sfx('victory',1)}
  voteSet(this.vu,tally(NM,cyc,this.vote),this.vote,s<12);
  const wat=!this.elig&&s>=15&&s<57,nm=this.NAMES[d];
  setB(s<9?'Lobby — vote for a map! '+Math.ceil(9-s)+'s':s<15?(this.mk>=0?'Map: '+this.MN[this.mk]:'Counting votes...')+' — '+(this.elig?'teleporting in ':'next round in ')+Math.ceil(15-s)+'s':s<19?'⚠ '+nm+' incoming!':act?(this.in?nm+' — ':'Watching: '+nm+' — ')+Math.ceil(54-s)+'s left':s<57?(this.in?'You survived! 🎉':this.dead?'You did not survive. Watching from the lobby...':wat?'Round over':'Round over'):'Returning to the lobby...');
  specUI(false);setHP(this.in?this.hp:null);scoreEl.textContent='Survived: '+this.n+' rounds'}};
