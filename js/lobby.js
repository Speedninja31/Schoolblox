/* Disaster Survival lobby: a floating island hangout.
   Static scenery is merged into a handful of meshes (very cheap to draw); effects are a few small point systems driven by
   formulas (no per-particle state), and everything is freed again by dispose(). Layout is in island-local metres:
   +z is the front (entrance + pier, facing the map), y is measured from the island's walking surface. */
const SBLobby=(()=>{
const T=THREE,TAU=Math.PI*2,PI=Math.PI,DEG=PI/180;
const rad=a=>a*DEG;
const lerp=(a,b,u)=>a+(b-a)*u;
const frac=v=>v-Math.floor(v);
const pol=(a,r)=>[Math.cos(rad(a))*r,Math.sin(rad(a))*r];   /* angle in degrees (0 = right, 90 = front), radius -> [x,z] */

/* ---------------- procedural textures (made once, shared) ---------------- */
let TX=null;
function makeTex(){
 if(TX)return TX;
 const cv=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c},tex=(c,rep)=>{const t=new T.CanvasTexture(c);if(rep){t.wrapS=t.wrapT=T.RepeatWrapping}return t};
 const r=mulb(31337);
 /* soft round particle */
 let c=cv(64,64),x=c.getContext('2d'),g=x.createRadialGradient(32,32,0,32,32,32);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.35,'rgba(255,255,255,.55)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(0,0,64,64);const soft=tex(c);
 /* crisp spark (4-point star) */
 c=cv(64,64);x=c.getContext('2d');g=x.createRadialGradient(32,32,0,32,32,10);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(0,0,64,64);x.fillStyle='rgba(255,255,255,.9)';x.beginPath();x.moveTo(32,2);x.lineTo(36,28);x.lineTo(62,32);x.lineTo(36,36);x.lineTo(32,62);x.lineTo(28,36);x.lineTo(2,32);x.lineTo(28,28);x.closePath();x.fill();const star=tex(c);
 /* water ripple (tiles) */
 c=cv(128,128);x=c.getContext('2d');x.fillStyle='#ffffff';x.fillRect(0,0,128,128);x.lineWidth=3;
 for(let i=0;i<14;i++){const px=r()*128,py=r()*128,w=10+r()*22;x.strokeStyle='rgba(150,205,255,'+(.35+r()*.4)+')';for(const ox of[-128,0,128])for(const oy of[-128,0,128]){x.beginPath();x.ellipse(px+ox,py+oy,w,w*.4,0,0,TAU);x.stroke()}}
 for(let i=0;i<60;i++){x.fillStyle='rgba(255,255,255,'+(.5+r()*.5)+')';x.fillRect(r()*128|0,r()*128|0,2,2)}
 const water=tex(c,1);
 /* falling water streaks (tiles vertically) */
 c=cv(64,256);x=c.getContext('2d');x.fillStyle='rgba(120,190,255,.9)';x.fillRect(0,0,64,256);
 for(let i=0;i<26;i++){const px=r()*64,h=40+r()*120,py=r()*256;x.fillStyle='rgba(255,255,255,'+(.35+r()*.5)+')';for(const oy of[-256,0,256])x.fillRect(px,py+oy,2+r()*4,h)}
 const fall=tex(c,1);
 /* sea */
 c=cv(256,256);x=c.getContext('2d');x.fillStyle='#ffffff';x.fillRect(0,0,256,256);
 for(let i=0;i<120;i++){const px=r()*256,py=r()*256,w=6+r()*18;x.strokeStyle='rgba(185,225,255,'+(.5+r()*.5)+')';x.lineWidth=2;for(const ox of[-256,0,256])for(const oy of[-256,0,256]){x.beginPath();x.moveTo(px+ox-w,py+oy);x.quadraticCurveTo(px+ox,py+oy-5,px+ox+w,py+oy);x.stroke()}}
 const sea=tex(c,1);sea.repeat.set(90,90);
 /* pixel-style Earth */
 c=cv(128,64);x=c.getContext('2d');x.fillStyle='#1f5fd0';x.fillRect(0,0,128,64);
 const land=(pts,col)=>{x.fillStyle=col;x.beginPath();pts.forEach((p,i)=>i?x.lineTo(p[0],p[1]):x.moveTo(p[0],p[1]));x.closePath();x.fill()};
 const L='#59b34a',L2='#8fae45',D='#3f8f3a',SN='#e8f0f6';
 land([[10,12],[24,8],[40,10],[44,18],[38,26],[30,34],[22,32],[16,24]],L);           /* north america */
 land([[30,36],[40,38],[46,48],[40,60],[34,54],[30,44]],L2);                          /* south america */
 land([[58,12],[72,10],[78,16],[70,22],[60,22]],D);                                   /* europe */
 land([[60,24],[74,24],[80,34],[74,50],[66,52],[60,40]],L2);                          /* africa */
 land([[74,10],[100,8],[118,14],[114,26],[100,32],[86,28],[76,20]],L);                /* asia */
 land([[100,44],[116,44],[118,54],[104,56]],L2);                                      /* australia */
 land([[44,2],[56,2],[54,8],[46,8]],SN);                                              /* greenland */
 x.fillStyle=SN;x.fillRect(0,0,128,3);x.fillRect(0,60,128,4);
 for(let i=0;i<380;i++){x.fillStyle='rgba(255,255,255,'+(r()*.10)+')';x.fillRect(r()*128|0,r()*64|0,1+r()*3|0,1)}
 for(let i=0;i<70;i++){x.fillStyle='rgba(255,255,255,.55)';x.fillRect(r()*128|0,r()*64|0,3+r()*5|0,1+r()*2|0)}
 const earth=tex(c);earth.magFilter=T.NearestFilter;earth.minFilter=T.LinearFilter;
 TX={soft,star,water,fall,sea,earth};return TX}

/* ---------------- mesh merger: many boxes/cylinders -> one draw call per material ---------------- */
function Merger(oy,rnd){
 const K={},tmpM=new T.Matrix4(),nM=new T.Matrix3(),v=new T.Vector3(),n=new T.Vector3(),col=new T.Color(),cache={};
 const get=k=>K[k]||(K[k]={p:[],n:[],c:[],u:[]});
 const rgb=(c,j)=>{col.setHex(c);const f=1+((rnd()-.5)*2)*(j||0);return[Math.min(1,col.r*f),Math.min(1,col.g*f),Math.min(1,col.b*f)]};
 const R={};let XF=null,nb=0;
 R.at=(x,z,ry)=>{XF=x===undefined?null:new T.Matrix4().makeRotationY(ry||0).setPosition(x,0,z)};
 /* generic: push a (non-indexed) geometry transformed by m */
 R.geo=(k,geo,m,c,j,su,sv)=>{const K1=get(k),g=geo.index?geo.toNonIndexed():geo,P=g.attributes.position,N=g.attributes.normal,U=g.attributes.uv,cl=rgb(c,j);nM.getNormalMatrix(m);
  for(let i=0;i<P.count;i++){v.fromBufferAttribute(P,i).applyMatrix4(m);K1.p.push(v.x,v.y,v.z);n.fromBufferAttribute(N,i).applyMatrix3(nM).normalize();K1.n.push(n.x,n.y,n.z);K1.c.push(cl[0],cl[1],cl[2]);K1.u.push(U?U.getX(i)*(su||1):0,U?U.getY(i)*(sv||1):0)}
  if(g!==geo)g.dispose()};
 const F=[ /* [nx,ny,nz, 4 corners (sx,sy,sz in half-extent units), uvDims] */
  [1,0,0,[[1,-1,1],[1,-1,-1],[1,1,-1],[1,1,1]],'dh'],[-1,0,0,[[-1,-1,-1],[-1,-1,1],[-1,1,1],[-1,1,-1]],'dh'],
  [0,1,0,[[-1,1,1],[1,1,1],[1,1,-1],[-1,1,-1]],'wd'],[0,0,1,[[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]],'wh'],[0,0,-1,[[1,-1,-1],[-1,-1,-1],[-1,1,-1],[1,1,-1]],'wh']];
 /* box: y is the BOTTOM; ry rotates about y; o={rx,rz,j,tile,bot} */
 R.box=(k,w,h,d,x,y,z,c,ry,o)=>{o=o||{};h+=((nb++)%5)*.004;const K1=get(k),tl=o.tile||4,hx=w/2,hy=h/2,hz=d/2,cl=rgb(c,o.j===undefined?.06:o.j);
  tmpM.makeRotationFromEuler(new T.Euler(o.rx||0,ry||0,o.rz||0,'YXZ'));tmpM.setPosition(x,y+oy+hy,z);if(XF)tmpM.premultiply(XF);nM.getNormalMatrix(tmpM);
  const faces=o.bot?F.concat([[0,-1,0,[[-1,-1,-1],[1,-1,-1],[1,-1,1],[-1,-1,1]],'wd']]):F;
  for(const f of faces){const dm={w,h,d},a=dm[f[4][0]]/tl,b=dm[f[4][1]]/tl,uv=[[0,0],[a,0],[a,b],[0,b]];
   n.set(f[0],f[1],f[2]).applyMatrix3(nM).normalize();
   const vs=f[3].map(q=>v.set(q[0]*hx,q[1]*hy,q[2]*hz).applyMatrix4(tmpM).toArray());
   for(const t of[0,1,2,0,2,3]){K1.p.push(vs[t][0],vs[t][1],vs[t][2]);K1.n.push(n.x,n.y,n.z);K1.c.push(cl[0],cl[1],cl[2]);K1.u.push(uv[t][0],uv[t][1])}}};
 /* cylinder / cone / frustum: y is the BOTTOM */
 R.cyl=(k,rt,rb,h,x,y,z,c,seg,o)=>{o=o||{};h+=((nb++)%5)*.004;const key='c'+rt+'_'+rb+'_'+h+'_'+seg,tl=o.tile||4;let g=cache[key];if(!g)g=cache[key]=new T.CylinderGeometry(rt,rb,h,seg||10,1,!!o.open);
  tmpM.makeRotationFromEuler(new T.Euler(o.rx||0,o.ry||0,o.rz||0,'YXZ'));tmpM.setPosition(x,y+oy+h/2,z);if(XF)tmpM.premultiply(XF);R.geo(k,g,tmpM,c,o.j===undefined?.05:o.j,Math.max(rt,rb)*TAU/tl/(1),h/tl)};
 R.sph=(k,r,x,y,z,c,o)=>{o=o||{};const sx=o.sx||1,sy=o.sy||1,sz=o.sz||1,key='s'+(o.ws||8)+'_'+(o.hs||6);let g=cache[key];if(!g)g=cache[key]=new T.SphereGeometry(1,o.ws||8,o.hs||6);
  tmpM.makeScale(r*sx,r*sy,r*sz);tmpM.setPosition(x,y+oy,z);if(XF)tmpM.premultiply(XF);R.geo(k,g,tmpM,c,o.j===undefined?.07:o.j,1,1)};
 /* flat rectangle on the ground (y = height above surface) */
 R.flat=(k,w,d,x,y,z,c,ry,o)=>R.box(k,w,.06,d,x,y-.06,z,c,ry,o);
 /* annulus sector made of alternating colour quads */
 R.ring=(k,r0,r1,y,c1,c2,seg,a0,a1,tile)=>{const K1=get(k),tl=tile||4;a0=a0===undefined?0:a0;a1=a1===undefined?TAU:a1;const cA=rgb(c1,.03),cB=rgb(c2===undefined?c1:c2,.03);
  for(let i=0;i<seg;i++){const t0=lerp(a0,a1,i/seg),t1=lerp(a0,a1,(i+1)/seg),cl=i%2?cB:cA,q=[[r0,t0],[r1,t0],[r1,t1],[r0,t1]].map(a=>[Math.cos(a[1])*a[0],y+oy,Math.sin(a[1])*a[0]]);
   for(const t of[0,3,2,0,2,1]){K1.p.push(q[t][0],q[t][1],q[t][2]);K1.n.push(0,1,0);K1.c.push(cl[0],cl[1],cl[2]);K1.u.push(q[t][0]/tl,q[t][2]/tl)}}};
 R.disc=(k,r,y,c,seg,tile)=>R.ring(k,0,r,y,c,c,seg||32,0,TAU,tile);
 R.finish=(grp,mats)=>{const out=[];for(const k in K){const d=K[k];if(!d.p.length)continue;const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(d.p,3));g.setAttribute('normal',new T.Float32BufferAttribute(d.n,3));g.setAttribute('color',new T.Float32BufferAttribute(d.c,3));g.setAttribute('uv',new T.Float32BufferAttribute(d.u,2));
   const m=new T.Mesh(g,mats[k]);m.castShadow=k!=='ground';m.receiveShadow=true;m.matrixAutoUpdate=false;grp.add(m);out.push(m)}
  for(const k in cache)cache[k].dispose();return out};
 return R}

/* ---------------- analytic particle system ---------------- */
let PSK=1;
function PS(n,size,map,col,fn,add,maxpx){
 const pos=new Float32Array(n*3),cl=new Float32Array(n*3),g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(pos,3));g.setAttribute('color',new T.BufferAttribute(cl,3));
 const m=new T.PointsMaterial({size:size*PSK,map,vertexColors:true,transparent:true,depthWrite:false,blending:add===false?T.NormalBlending:T.AdditiveBlending,sizeAttenuation:true});
 m.onBeforeCompile=sh=>{sh.vertexShader=sh.vertexShader.replace('gl_PointSize *= ( scale / - mvPosition.z );','gl_PointSize *= ( scale / - mvPosition.z );gl_PointSize=min(gl_PointSize,'+(maxpx||60).toFixed(1)+');')};
 const pts=new T.Points(g,m);pts.frustumCulled=false;const o={x:0,y:0,z:0,a:1},c=new T.Color(col);
 pts.step=(t)=>{for(let i=0;i<n;i++){o.a=1;fn(i,t,o);pos[i*3]=o.x;pos[i*3+1]=o.y;pos[i*3+2]=o.z;const a=Math.max(0,o.a);cl[i*3]=c.r*a;cl[i*3+1]=c.g*a;cl[i*3+2]=c.b*a}g.attributes.position.needsUpdate=true;g.attributes.color.needsUpdate=true};
 pts.step(0);return pts}

/* ---------------- the lobby ---------------- */
const NAMES_FALLBACK=['Meteor Shower','Flood','Tornado','Earthquake','Lightning Storm','Acid Rain','Lava Rise'];

/* Avatar is 5.2 studs tall / 4 wide, so the whole lobby is built at K x the size I first drew it (props get extra scaling below). */
function build(scene,LZ,TOP,K){
 K=K||1.8;PSK=K;
 const tx=makeTex(),rnd=mulb(2024),rs=mulb(515);
 const G=new T.Group();G.position.set(0,TOP,LZ);G.scale.setScalar(K);scene.add(G);
 const M=Merger(0,rnd);
 const COL=[],OBS=[],FP=[],GLOW=[],HOME=[],DYN={},DISP=[];
 const colr=(x,z,hw,hd,top,bot)=>COL.push({x:x*K,z:LZ+z*K,hw:hw*K,hd:hd*K,top:TOP+top*K,bot:TOP+bot*K});
 const obs=(x,z,r,top)=>OBS.push([x*K,LZ+z*K,r*K,TOP+top*K]);
 const fp=(n,x,z,r)=>FP.push({n,x,z,r});
 const glow=(x,y,z)=>GLOW.push([x,y,z]);
 const ST='stone',WD='wood',LF='leaf',PL='plain',GL='glow',GD='ground',BR='brick';
 const gcol=[0x3f9d3f,0x4caf50,0x57b94a,0x3a9446,0x62c050];
 const pick=a=>a[Math.floor(rnd()*a.length)];
 const FL=[0xe8483c,0xffd23a,0xf5f5f0,0xff7fb5,0xa56bff,0xff9a2e,0x4fb7ff];
 const GAPS=[[90,15],[108,5.5],[178,5.5],[255,5.5],[305,5.5],[232,5]];
 const gapAt=a=>{a=((a%360)+360)%360;for(const g of GAPS){let d=Math.abs(a-g[0]);d=Math.min(d,360-d);if(d<g[1])return true}return false};
 const SPOKES=[{a:90,w:7,r1:31.5},{a:150,w:4.4,r1:21},{a:213,w:4.4,r1:22},{a:270,w:4.6,r1:26},{a:335,w:4.4,r1:21},{a:62,w:4.2,r1:23}];

 /* ===== island body: grass top, stone rim, layered rock wall tapering into the sea ===== */
 M.disc(GD,31.9,0,0x7ad85c,56,4);
 const WL=[0xa0a6b2,0x9096a4,0x9c7d57,0x886c4d,0x765d45,0x63513f,0x584739,0x4d3f35,0x44382f];
 for(let i=0;i<9;i++){const R=i<6?31.3-i*.95:25.6-(i-5)*5.2,n=Math.ceil(TAU*R/3.3);
  for(let k=0;k<n;k++){const a=(k+(i%2)*.5)/n*TAU,rr=R+(rnd()-.5)*.7;
   M.box(ST,TAU*R/n*1.12,3.1,3.3,Math.cos(a)*rr,-3*i-3.05+.0,Math.sin(a)*rr,WL[i],PI/2-a,{j:.1,tile:3.4})}}
 for(let i=0;i<40;i++){const a=rnd()*TAU,layer=rnd()<.6?0:1,R=31.3-layer*.95+1.5,h=1.4+rnd()*3.2;if(gapAt(a/DEG))continue;
  M.box(LF,.9+rnd(),h,.7,Math.cos(a)*R,-3*layer-h+.3,Math.sin(a)*R,pick(gcol),PI/2-a,{j:.1})}
 /* curb + wooden fence around the rim (open at the pier and at every waterfall) */
 {const n=96,R=30.9;for(let k=0;k<n;k++){const a=(k+.5)/n*TAU;if(gapAt(a/DEG))continue;M.box(ST,TAU*R/n*1.1,.55,1.1,Math.cos(a)*R,.05,Math.sin(a)*R,0xb9bbc6,PI/2-a,{j:.07})}
  const m=64;for(let k=0;k<m;k++){const a0=k/m*TAU,a1=(k+1)/m*TAU,am=(a0+a1)/2;if(gapAt(a0/DEG)||gapAt(a1/DEG))continue;
   M.box(WD,.34,1.7,.34,Math.cos(a0)*R,.6,Math.sin(a0)*R,0x6b4528,0,{j:.05});
   const ln=TAU*R/m*1.02;for(const hy of[.75,1.4])M.box(WD,ln,.2,.15,Math.cos(am)*R,.6+hy,Math.sin(am)*R,0x8a5a34,PI/2-am,{j:.05,tile:2})}}

 /* ===== plaza, stone paths ===== */
 M.ring(ST,11.2,12.0,.06,0xe3c27a,0xd9b56a,48,0,TAU,2);
 M.ring(ST,12.0,14.7,.07,0xc3bdd2,0xb1abc4,36,0,TAU,3);
 M.ring(ST,14.7,17.6,.07,0xd3cfc1,0xc1bcad,72,0,TAU,3);
 M.ring(ST,17.6,18.1,.1,0x8d8798,0x8d8798,72,0,TAU,2);
 const spoke=(sp)=>{const a=rad(sp.a),r0=17.6,len=sp.r1-r0,n=Math.ceil(len/2.2),ry=PI/2-a;
  for(let i=0;i<n;i++){const l0=r0+i*len/n,l1=r0+(i+1)*len/n,rm=(l0+l1)/2;M.box(ST,sp.w,.07,len/n,Math.cos(a)*rm,0,Math.sin(a)*rm,i%2?0xcdc8d8:0xbab4cb,ry,{j:.03,tile:3})}
  for(const sd of[-1,1]){const off=sd*(sp.w/2+.16),cx=Math.cos(a)*(r0+len/2)-Math.sin(a)*off,cz=Math.sin(a)*(r0+len/2)+Math.cos(a)*off;M.box(ST,.32,.14,len,cx,0,cz,0x8d8798,ry,{j:.04})}};
 SPOKES.forEach(spoke);

 /* ===== fountain pool + pedestal ===== */
 M.cyl(ST,10.2,10.2,.25,0,0,0,0x9fb7d6,40,{j:.02});                      /* pool floor (under the water) */
 {const n=40,R=10.75;for(let k=0;k<n;k++){const a=k/n*TAU;M.box(ST,TAU*R/n*1.08,1.5,1.2,Math.cos(a)*R,.0,Math.sin(a)*R,k%2?0xb3b7c4:0xc4c7d2,PI/2-a,{j:.04,tile:2.5});
   M.box(ST,TAU*R/n*1.12,.22,1.5,Math.cos(a)*R,1.5,Math.sin(a)*R,0xd9dbe4,PI/2-a,{j:.03,tile:2})}}
 M.cyl(ST,5.3,5.9,1.5,0,.1,0,0xa6aab8,16,{j:.04});M.cyl(ST,4.5,4.9,1.0,0,1.5,0,0xb7bac6,16,{j:.04});
 for(let k=0;k<8;k++){const a=k*PI/4+PI/8,x=Math.cos(a)*3.7,z=Math.sin(a)*3.7;M.box(ST,.9,.35,.9,x,2.5,z,0x8e93a3);M.box(ST,.62,2.4,.62,x,2.85,z,0xc9ccd8);M.box(ST,.95,.35,.95,x,5.2,z,0x8e93a3);
  const b=(k+1)*PI/4+PI/8,x2=Math.cos(b)*3.7,z2=Math.sin(b)*3.7,mx=(x+x2)/2,mz=(z+z2)/2,ln=Math.hypot(x2-x,z2-z);M.box(ST,ln,.2,.2,mx,3.5,mz,0xb7bac6,-Math.atan2(z2-z,x2-x),{tile:2});M.box(ST,ln,.2,.2,mx,4.4,mz,0xb7bac6,-Math.atan2(z2-z,x2-x),{tile:2})}
 M.cyl(ST,4.9,4.9,.6,0,5.3,0,0xc4c7d3,16,{j:.03});M.cyl(ST,4.5,4.5,.1,0,5.9,0,0x6d7388,16);
 M.ring(GL,3.1,3.45,5.97,0xffd24a,0xffe08a,32,0,TAU,2);
 obs(0,0,11.4,1.8);fp('pool',0,0,11.6);
 for(let k=0;k<4;k++){const a=k*PI/2+PI/4,x=Math.cos(a)*12.1,z=Math.sin(a)*12.1;lamp(x,z)}

 /* ===== small building blocks ===== */
 const rot=(x,z,lx,lz,ry)=>[x+lx*Math.cos(ry)+lz*Math.sin(ry),z-lx*Math.sin(ry)+lz*Math.cos(ry)];
 function lamp(x,z,h){h=h||2.6;M.box(ST,.9,.5,.9,x,0,z,0x80838f);M.cyl(PL,.14,.18,h,x,.5,z,0x353846,6,{j:0});M.box(GL,.7,.8,.7,x,.5+h,z,0xffd58a,0,{j:0});M.box(PL,.98,.16,.98,x,1.3+h,z,0x353846,0,{j:0});M.cyl(PL,0,.62,.5,x,1.46+h,z,0x353846,4,{j:0});glow(x,.5+h+.4,z);obs(x,z,.5,5)}
 function bench(x,z,ry){const B=1.5,p=(lx,lz)=>rot(x,z,lx*B,lz*B,ry);let q=p(0,0);M.box(WD,3.2*B,.28*B,1.1*B,q[0],.55*B,q[1],0x9a6a3e,ry);q=p(0,-.5);M.box(WD,3.2*B,.85*B,.2*B,q[0],.83*B,q[1],0x8a5a34,ry);
  for(const sx of[-1.35,1.35]){q=p(sx,0);M.box(ST,.3*B,.55*B,.95*B,q[0],0,q[1],0x7b7e8c,ry)}}
 function tree(x,z,s,keep){s=s||1;const ry=rnd()*PI;M.box(WD,1.5*s,5.2*s,1.5*s,x,0,z,0x7a5230,ry,{j:.05});M.box(WD,2.1*s,.9*s,2.1*s,x,0,z,0x6b4528,ry);
  const c=()=>pick(gcol),Y=4.2*s;M.box(LF,6.4*s,3*s,6.4*s,x,Y,z,c(),ry,{j:.08,tile:3});M.box(LF,4.6*s,2.4*s,4.6*s,x,Y+2.8*s,z,c(),ry+.3,{j:.08,tile:3});M.box(LF,2.8*s,1.6*s,2.8*s,x,Y+5*s,z,c(),ry+.7,{j:.08,tile:3});
  for(const [dx,dz,dy] of[[2.9,1.2,-.4],[-2.6,-1.6,-.2],[.9,-3.1,-.5],[-1.4,2.8,-.6]])M.box(LF,3.2*s,2*s,3.2*s,x+dx*s,Y+dy*s,z+dz*s,c(),ry+dx,{j:.08,tile:3});
  if(!keep){obs(x,z,.95*s,40);fp('tree',x,z,3.4*s)}HOME.push([x,Y+1.5*s,z])}
 function bush(x,z,s){s=s||1;const ry=rnd()*PI;M.box(LF,2*s,1.2*s,2*s,x,0,z,pick(gcol),ry,{j:.1,tile:2});M.box(LF,1.4*s,.9*s,1.4*s,x+.3*s,1*s,z-.2*s,pick(gcol),ry+.5,{j:.1,tile:2});
  if(rnd()<.6){const c=pick(FL);M.box(PL,.38,.3,.38,x+.5*s,1.55*s,z+.4*s,c,0,{j:.05});M.box(PL,.38,.3,.38,x-.6*s,1.1*s,z-.3*s,pick(FL),0,{j:.05})}}
 function bed(x,z,w,d,ry){const parts=[[0,-d/2,w+.3,.28],[0,d/2,w+.3,.28],[-w/2,0,.28,d],[w/2,0,.28,d]];M.box(PL,w,.3,d,x,0,z,0x6a4a30,ry,{j:.04});
  for(const q of parts){const p=rot(x,z,q[0],q[1],ry);M.box(WD,q[2],.5,q[3],p[0],0,p[1],0x9a6a3e,ry,{j:.05,tile:2})}
  for(let ix=-w/2+.5;ix<=w/2-.4;ix+=.78)for(let iz=-d/2+.5;iz<=d/2-.4;iz+=.78){if(rnd()<.18)continue;const p=rot(x,z,ix+(rnd()-.5)*.25,iz+(rnd()-.5)*.25,ry),h=.45+rnd()*.5;M.box(LF,.1,h,.1,p[0],.3,p[1],0x3f9a3a,0,{j:.1});M.box(PL,.42,.3,.42,p[0],.3+h,p[1],pick(FL),rnd()*PI,{j:.08})}
  HOME.push([x,1.4,z])}
 function chessBoard(x,y,z){const C=.34;for(let i=0;i<8;i++)for(let j=0;j<8;j++)M.box(PL,C,.05,C,x+(i-3.5)*C,y,z+(j-3.5)*C,(i+j)%2?0x3a2a22:0xf3ead2,0,{j:0});
  const piece=(i,j,wh,h)=>{h*=1.7;const c=wh?0xf7f4ea:0x2c2c34,px=x+(i-3.5)*C,pz=z+(j-3.5)*C;M.cyl(PL,.07,.12,h,px,y+.05,pz,c,6,{j:0});M.sph(PL,.1,px,y+.05+h,pz,c,{ws:6,hs:4,j:0})};
  const row=[.28,.24,.26,.34,.38,.26,.24,.28];for(let i=0;i<8;i++){piece(i,0,1,row[i]);piece(i,1,1,.2);piece(i,7,0,row[i]);piece(i,6,0,.2)}}
 function table(x,z,s,chess){const H=1.45;M.box(WD,s,.24,s,x,H,z,0x7a4f2c,0,{tile:2});for(const sx of[-1,1])for(const sz of[-1,1])M.box(WD,.28,H,.28,x+sx*(s/2-.22),0,z+sz*(s/2-.22),0x5a3a20,0,{j:.03});if(chess)chessBoard(x,H+.24,z)}
 function stool(x,z){M.cyl(WD,.62,.52,.95,x,0,z,0x8a5a34,8,{j:.05})}

 /* ===== gazebos (A: dining + checkers, B: chess club) ===== */
 function gazebo(a,r,variant){const[gx,gz]=pol(a,r);fp('gazebo'+variant,gx,gz,7.6);M.at(gx,gz,0);
  M.cyl(ST,7.1,7.1,.1,0,0,0,0xaaa5b8,24,{j:.04});M.cyl(WD,6.5,6.5,.14,0,0,0,0xb48350,24,{j:.04,tile:3});
  const ke=(()=>{const phi=Math.atan2(-gx,-gz);let best=0,bd=9;for(let k=0;k<8;k++){let d=Math.abs(((k+.5)*PI/4-phi+3*PI)%TAU-PI);if(d<bd){bd=d;best=k}}return best})();
  for(let k=0;k<8;k++){const ph=k*PI/4,px=Math.sin(ph)*5.3,pz=Math.cos(ph)*5.3;M.box(ST,1,.45,1,px,.14,pz,0x8d8a98);M.box(WD,.6,5.9,.6,px,.55,pz,0x6b4528,0,{j:.04});obs(gx+px,gz+pz,.62,8);
   const pm=(k+.5)*PI/4,mx=Math.sin(pm)*4.9,mz=Math.cos(pm)*4.9;M.box(WD,4.6,.5,.5,mx,5.5,mz,0x7a4f2c,pm,{j:.04});
   if(k!==ke){M.box(WD,4.2,.18,.16,mx,1.0,mz,0x8a5a34,pm);M.box(WD,4.2,.18,.16,mx,1.8,mz,0x8a5a34,pm);for(const o of[-1.4,0,1.4]){const q=rot(mx,mz,o,0,pm);M.box(WD,.16,1.6,.16,q[0],.2,q[1],0x8a5a34,pm)}}
   if(k%2===0){M.box(GL,.5,.6,.5,px*.92,4.45,pz*.92,0xffd58a,0,{j:0});glow(gx+px*.92,4.75,gz+pz*.92);HOME.push([gx+px,3.2,gz+pz])}}
  M.cyl(WD,4.6,8.0,1.7,0,5.85,0,0xa9553a,8,{j:.04,tile:3});M.cyl(WD,2.2,4.6,1.6,0,7.5,0,0xb9633f,8,{j:.04,tile:3});M.cyl(WD,.5,2.2,1.3,0,9.05,0,0xa9553a,8,{j:.04,tile:3});M.cyl(PL,.1,.1,1.2,0,10.3,0,0x4a3a2a,5);M.sph(PL,.38,0,11.5,0,0xffd24a,{ws:8,hs:6,j:0});
  M.box(GL,.7,.8,.7,0,4.2,0,0xffd58a,0,{j:0});glow(gx,4.6,gz);HOME.push([gx,5,gz]);
  if(variant===0){table(0,0,3.4,false);for(let k=0;k<4;k++){const aa=k*PI/2+PI/4;stool(Math.cos(aa)*3.0,Math.sin(aa)*3.0)}obs(gx,gz,2.1,1.6);
   table(-3.4,-.2,2.0,false);for(let i=0;i<4;i++)for(let j=0;j<4;j++)M.box(PL,.4,.05,.4,-3.4+(i-1.5)*.4,1.7,-.2+(j-1.5)*.4,(i+j)%2?0xd33a2c:0x2a2a30,0,{j:0});
   for(let i=0;i<5;i++)M.cyl(PL,.12,.12,.08,-3.7+(i%3)*.35,1.75,-.4+(i>>1)*.35,i%2?0xf2f2f2:0xe23a2c,8,{j:0});stool(-3.4,-2.0);stool(-3.4,1.7);
   [[1,3],[3,5]].forEach(q=>{const aa=(q[0]+.5)*PI/4;if(q[0]!==ke&&((q[0]+1)%8)!==ke)bench(Math.sin(aa)*3.6,Math.cos(aa)*3.6,aa+PI)})}
  else{table(-2.7,.2,3.2,true);table(2.7,.2,3.2,true);stool(-2.7,2.5);stool(-2.7,-2.1);stool(2.7,2.5);stool(2.7,-2.1);obs(gx-2.7,gz+.2,2.0,1.7);obs(gx+2.7,gz+.2,2.0,1.7);
   const aa=(((ke+4)%8)+.5)*PI/4;bench(Math.sin(aa)*3.3,Math.cos(aa)*3.3,aa+PI)}
  M.at();
  const pm=(ke+.5)*PI/4,ex=gx+Math.sin(pm)*8.4,ez=gz+Math.cos(pm)*8.4;lamp(ex+Math.cos(pm)*2.4,ez-Math.sin(pm)*2.4);lamp(ex-Math.cos(pm)*2.4,ez+Math.sin(pm)*2.4);
  /* two pots by the entrance */
  for(const sd of[-1,1]){const px=gx+Math.sin(pm)*6.9+Math.cos(pm)*sd*1.7,pz=gz+Math.cos(pm)*6.9-Math.sin(pm)*sd*1.7;M.cyl(PL,.55,.42,.7,px,0,pz,0xb5653e,8);M.box(LF,1.1,.8,1.1,px,.7,pz,pick(gcol),0,{j:.1});M.box(PL,.35,.3,.35,px+.2,1.4,pz,pick(FL),0)}}
 gazebo(150,21.5,0);gazebo(335,22,1);

 /* ===== billboard ===== */
 const BB={a:213,r:25.5};{const[bx,bz]=pol(BB.a,BB.r),ry=-(PI/2+rad(BB.a));BB.x=bx;BB.z=bz;BB.ry=ry;fp('billboard',bx,bz,9.6);M.at(bx,bz,ry);
  for(const sx of[-1,1]){const x=sx*8.6;M.box(BR,2.2,2,2.2,x,0,0,0x8d5846,0,{tile:2});M.box(BR,1.8,10.2,1.8,x,1.9,0,0xa0634f,0,{tile:2});M.box(ST,2.2,.5,2.2,x,11.9,0,0xaeb0bc);for(const by of[5.6,11])M.box(WD,1.2,.55,.8,sx*8.0,by,0,0x6b4528,0,{tile:2});for(const q of[[-.5,.4],[.5,-.3]])M.box(LF,1.4,1.1,1.4,x+q[0],12.4,q[1],pick(gcol),rnd()*PI,{j:.1})}
  M.box(WD,15.2,.7,.9,0,12.8,0,0x6b4528,0,{tile:2});M.box(WD,15.2,.7,.9,0,4.8,0,0x6b4528,0,{tile:2});for(const sx of[-1,1])M.box(WD,.7,8.7,.9,sx*7.25,4.8,0,0x6b4528,0,{tile:2});
  M.box(PL,14.3,7.4,.5,0,5.3,-.2,0x1b2236,0,{j:0});
  M.box(WD,15.8,.45,1.9,0,13.5,.3,0x7a4f2c,0,{tile:2});
  for(let i=-6;i<=6;i+=2){M.box(GL,.38,.3,.38,i,13.1,.95,0xfff0b8,0,{j:0});glow(bx+Math.cos(ry)*i+Math.sin(ry)*.95,13.1,bz-Math.sin(ry)*i+Math.cos(ry)*.95)}
  for(const sx of[-1,1]){M.box(WD,.4,9.6,.4,sx*3.4,.2,-3.4,0x5a3a20,0,{rx:.55});M.box(WD,.4,9.6,.4,sx*3.4,.2,-3.4,0x5a3a20,0,{rx:.55,j:0})}
  M.box(WD,.22,8,.22,-5.2,1.8,-1.2,0x9a6a3e);M.box(WD,.22,8,.22,-4.4,1.8,-1.2,0x9a6a3e);for(let y=2.4;y<9.6;y+=.8)M.box(WD,.9,.14,.16,-4.8,y,-1.2,0x9a6a3e);
  M.at();obs(bx+Math.cos(ry)*8.6,bz-Math.sin(ry)*8.6,1.6,15);obs(bx-Math.cos(ry)*8.6,bz+Math.sin(ry)*8.6,1.6,15);
  lamp(...rot(bx,bz,-11.8,3.2,ry));lamp(...rot(bx,bz,11.8,3.2,ry))}

 /* ===== front gate + pier (decorative walkway out to the edge, with a bell) ===== */
 const waterMeshes=[],fallMeshes=[];
 const cloneTex=(t,rx,ry)=>{const c=t.clone();c.wrapS=c.wrapT=T.RepeatWrapping;c.repeat.set(rx,ry);c.needsUpdate=true;DISP.push(c);return c};
 const flatMesh=(geo,mat,x,y,z)=>{const m=new T.Mesh(geo,mat);m.position.set(x,y,z);G.add(m);DISP.push(geo,mat);return m};
 function waterMat(rx,ry,op,color){const t=cloneTex(tx.water,rx,ry);waterMeshes.push(t);return new T.MeshBasicMaterial({map:t,color:color||0x6fc6ff,transparent:true,opacity:op||.9,depthWrite:false})}
 const BELL={x:0,z:38.4};
 {for(let z=31.4;z<40;z+=.95)M.box(WD,6.4,.12,.9,0,0,z,((z*3)|0)%2?0xb08050:0xa07040,0,{j:.05,tile:2});
  for(const sx of[-1,1]){for(let z=32.5;z<40;z+=2.5){M.box(WD,.5,4.6,.5,sx*3.2,-3.6,z,0x5a3a20,0,{tile:2});M.box(WD,.34,1.3,.34,sx*3.2,.12,z,0x6b4528)}
   M.box(WD,.22,.22,8.6,sx*3.2,1.0,35.8,0x8a5a34);M.box(WD,.2,.2,8.6,sx*3.2,.55,35.8,0x8a5a34);M.box(WD,.5,3,8.8,sx*2.6,-3.2,35.8,0x6b4528,0,{tile:2})}
  M.box(WD,6.8,.22,.22,0,1.0,40,0x8a5a34);lamp(-2.8,39.4,3);lamp(2.8,39.4,3);
  for(const sx of[-1,1]){M.box(WD,.28,4.4,.28,sx*1.3,.12,BELL.z,0x6b4528);}M.box(WD,3.0,.28,.34,0,4.5,BELL.z,0x6b4528);
  for(const sx of[-1.9,1.9]){M.cyl(PL,.1,.14,1.6,sx,.12,36.4,0x44464f,6);M.box(PL,.34,.34,1.0,sx,1.65,36.5,0x2f3038,0,{rx:-.4});M.box(GL,.2,.2,.1,sx-.1,1.72,36.0,0x9fe3ff,0,{j:0});M.box(GL,.2,.2,.1,sx+.1,1.72,36.0,0x9fe3ff,0,{j:0})}
  colr(0,35.7,3.3,4.4,0,-1.5);fp('pier',0,35.6,4.8);
  /* gate: two stone pillars joined by a beam with a hanging sign */
  for(const sx of[-1,1]){M.box(ST,1.9,.6,1.9,sx*4.7,0,30.3,0x9a9cab);M.box(ST,1.5,8.2,1.5,sx*4.7,.6,30.3,0xb3b5c3,0,{tile:3});M.box(ST,2,.5,2,sx*4.7,8.8,30.3,0x8f91a0);M.box(GL,.8,.9,.8,sx*4.7,9.3,30.3,0xffd58a,0,{j:0});glow(sx*4.7,9.75,30.3);M.cyl(PL,0,.7,.6,sx*4.7,10.2,30.3,0x353846,4,{j:0});obs(sx*4.7,30.3,1.1,10)}
  M.box(WD,10.4,.6,.7,0,7.8,30.3,0x6b4528,0,{tile:2});M.box(WD,.1,.9,.1,-3.6,6.9,30.3,0x4a3a2a);M.box(WD,.1,.9,.1,3.6,6.9,30.3,0x4a3a2a);
  for(const sx of[-1,1])for(const sz of[0,1.5])M.box(LF,1.5,1.3,1.5,sx*4.7+(sz?sx*.6:0),.6+sz*0,30.3+sz*0+(sz?1.4:-1.2),pick(gcol),rnd()*PI,{j:.1})}

 /* ===== market stall, well, rear arch ===== */
 {const[sx,sz]=pol(74,20.2);fp('stall',sx,sz,2.9);const ry=-(PI/2+rad(74));M.at(sx,sz,ry);
  M.box(WD,3.4,1.4,1.9,0,0,0,0xf1ece0,0,{tile:2});M.box(WD,3.8,.18,2.3,0,1.4,.05,0xb48350);
  for(let i=0;i<6;i++)M.box(PL,.62,.14,2.6,-1.55+i*.62,3.1-.0,.1,i%2?0xf3efe6:0xe0483c,0,{rx:.0,j:0});
  for(const x of[-1.7,1.7])M.box(WD,.16,1.7,.16,x,1.4,.9,0x6b4528);
  M.box(PL,.5,.5,.5,-.9,1.58,.1,0xffc0d6);M.sph(PL,.38,-.9,2.25,.1,0xffe3ef,{j:.02});M.box(PL,.5,.5,.5,0,1.58,.1,0xb08050);M.sph(PL,.38,0,2.25,.1,0x8a5a34,{j:.02});M.box(PL,.5,.5,.5,.9,1.58,.1,0xcdeab0);M.sph(PL,.38,.9,2.25,.1,0xa5e07a,{j:.02});
  for(const x of[-1.4,1.4]){M.cyl(PL,.5,.5,.14,x,0,-.6,0x2b2d36,10,{rz:PI/2,j:0})}
  M.at();obs(sx,sz,1.9,4)}
 {const[wx,wz]=pol(128,24.2);fp('well',wx,wz,2.3);M.cyl(ST,1.6,1.7,1.3,wx,0,wz,0xb3b6c3,10,{tile:2});M.cyl(PL,1.25,1.25,.05,wx,1.28,wz,0x2a5a9a,10,{j:0});
  for(const sx of[-1,1]){M.box(WD,.28,3.3,.28,wx+sx*1.45,1.3,wz,0x6b4528)}M.box(WD,.22,.22,3.2,wx,4.0,wz,0x7a4f2c,PI/2);M.cyl(WD,0,2.2,1.4,wx,4.5,wz,0xa9553a,4,{ry:PI/4,tile:3});M.box(PL,.5,.5,.5,wx,2.4,wz,0x8a5a34,0,{j:.05});obs(wx,wz,1.8,4)}
 {const x=0,z=-26.3;fp('arch',x,z,3.6);for(const sx of[-1,1]){M.box(ST,2,.7,2,sx*3.4,0,z,0x9a9cab);M.box(ST,1.6,7,1.6,sx*3.4,.7,z,0xb5b7c5,0,{tile:3});M.box(ST,2,.5,2,sx*3.4,7.7,z,0x8f91a0);M.box(LF,1.5,2.2,1.5,sx*3.4+sx*.3,.7,z+.9,pick(gcol),rnd()*PI,{j:.1});obs(sx*3.4,z,1.1,8)}
  M.box(ST,9,1.1,1.8,0,8.2,z,0xa9abba,0,{tile:3});M.box(ST,3.2,.9,1.6,0,9.3,z,0xc0c2d0);M.box(GL,.7,.8,.7,0,10.2,z,0xffd58a,0,{j:0});glow(0,10.6,z);
  for(let i=-3;i<=3;i++)M.box(LF,.5,.9+rnd()*1.2,.4,i*1.1,7.2-(.5+rnd()),z-.2,pick(gcol),0,{j:.1});
  M.cyl(ST,4.3,4.5,.12,0,0,z-3.4,0xb6b1c6,16,{tile:3});for(const sx of[-1,1]){M.cyl(PL,.55,.42,.7,sx*3.0,0,z-3.4,0xb5653e,8);M.box(LF,1.1,.8,1.1,sx*3.0,.7,z-3.4,pick(gcol),0,{j:.1});M.box(PL,.35,.3,.35,sx*3.0,1.5,z-3.4,pick(FL))}
  M.cyl(PL,.1,.14,1.6,0,.1,z-4.4,0x44464f,6);M.box(PL,.34,.34,1.2,0,1.75,z-4.4,0x2f3038,0,{rx:.35});}

 /* ===== water: spring, stream, bridge, ponds + waterfalls ===== */
 const FALLS=[];
 function streamPts(){const p=[];for(let a=240;a<=305;a+=5){const q=pol(a,20);p.push(q)}for(let r=21.5;r<=33.6;r+=1.5){const q=pol(305,r);p.push(q)}return p}
 {const[spx,spz]=pol(240,19.4);fp('spring',spx,spz,3);const ry=-(PI/2+rad(240));M.at(spx,spz,ry);M.box(ST,4,1.3,2.6,0,0,0,0x9b9eac);M.box(ST,3.2,1.3,2.1,0,1.3,-.2,0xa9acba);M.box(ST,2.2,1.3,1.6,0,2.6,-.4,0xb6b9c7);M.box(LF,1.4,.8,1.2,-1.2,3.9,-.4,pick(gcol),0,{j:.1});M.box(LF,1.2,.6,1,1.0,2.6,.8,pick(gcol),0,{j:.1});
  const fm=new T.Mesh(new T.PlaneGeometry(1.4,3),new T.MeshBasicMaterial({map:cloneTex(tx.fall,1,1),transparent:true,opacity:.9,color:0xd8f0ff,side:T.DoubleSide,depthWrite:false}));fm.position.set(0,2.7,.95);fm.rotation.x=-.12;
  const hold=new T.Group();hold.position.set(spx,0,spz);hold.rotation.y=ry;hold.add(fm);G.add(hold);fallMeshes.push(fm.material.map);DISP.push(fm.geometry,fm.material);M.at()}
 {const pts=streamPts(),pos=[],uv=[],idx=[],W2=1.3;let dist=0;
  pts.forEach((p,i)=>{const q=pts[Math.min(i+1,pts.length-1)],o=pts[Math.max(i-1,0)],dx=q[0]-o[0],dz=q[1]-o[1],l=Math.hypot(dx,dz)||1,nx=-dz/l,nz=dx/l;if(i)dist+=Math.hypot(p[0]-pts[i-1][0],p[1]-pts[i-1][1]);
   pos.push(p[0]+nx*W2,.14,p[1]+nz*W2,p[0]-nx*W2,.14,p[1]-nz*W2);uv.push(0,dist/3,1,dist/3);
   if(i){const b=i*2;idx.push(b-2,b,b-1,b-1,b,b+1)}
   for(const sd of[-1,1]){M.box(ST,.55,.42,Math.hypot(q[0]-p[0],q[1]-p[1])+.35+.3,p[0]+nx*(W2+.3)*sd,.0,p[1]+nz*(W2+.3)*sd,0xa4a7b6,Math.atan2(q[0]-p[0],q[1]-p[1]),{tile:2,j:.05})}});
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();
  /* flip winding if the strip faces down */
  const nrm=g.attributes.normal;if(nrm.getY(0)<0){for(let i=0;i<idx.length;i+=3){const t=idx[i+1];idx[i+1]=idx[i+2];idx[i+2]=t}g.setIndex(idx)}
  flatMesh(g,waterMat(1,1,.92,0x78ccff),0,0,0);
  /* stone sills where the stream spills off the island + the waterfall sheet */
  FALLS.push({a:305,w:2.8})}
 {/* wooden bridge over the stream at the rear path */
  const bz=-20;fp('bridge',0,bz,3.2);for(let z=bz-3.2;z<=bz+3.2;z+=.8)M.box(WD,4.6,.16,.74,0,.1,z,((z*5)|0)%2?0xb08050:0xa07040,0,{j:.05});
  for(const sx of[-1,1]){M.box(WD,.34,.6,7.2,sx*2.15,-.2,bz,0x6b4528);for(const dz of[-3.2,-1.1,1.1,3.2]){M.box(WD,.3,1.7,.3,sx*2.15,.1,bz+dz,0x6b4528)}M.box(WD,.22,.22,7,sx*2.15,1.35,bz,0x8a5a34);M.box(WD,.2,.2,7,sx*2.15,.75,bz,0x8a5a34)}
  M.box(WD,.5,.5,.5,-2.15,1.9,bz-3.2,0x6b4528);M.box(WD,.5,.5,.5,2.15,1.9,bz-3.2,0x6b4528);M.box(GL,.4,.45,.4,-2.15,2.4,bz-3.2,0xffd58a,0,{j:0});M.box(GL,.4,.45,.4,2.15,2.4,bz+3.2,0xffd58a,0,{j:0});glow(-2.15,2.7,bz-3.2);glow(2.15,2.7,bz+3.2)}
 function pondFall(a){const[px,pz]=pol(a,27.6),ry=PI/2-rad(a);fp('pond',px,pz,3.4);
  for(let k=0;k<14;k++){const t=k/14*TAU;M.box(ST,1.5,.62,.8,px+Math.cos(t)*3.0,0,pz+Math.sin(t)*3.0,k%2?0xa4a7b6:0xb4b7c5,PI/2-t,{tile:2,j:.05})}
  for(let k=0;k<3;k++){const t=rnd()*TAU,rr=rnd()*1.6;M.cyl(LF,.5,.5,.06,px+Math.cos(t)*rr,.36,pz+Math.sin(t)*rr,0x58b94a,8,{j:.08});}
  M.cyl(PL,.22,.22,.1,px+.5,.38,pz-.3,0xff8fb8,6,{j:0});
  for(const sd of[-1,1]){const q=rot(Math.cos(rad(a))*31.8,Math.sin(rad(a))*31.8,0,sd*1.9,ry);M.box(ST,2.6,.9,.8,q[0],0,q[1],0x9b9eac,ry,{tile:2})}
  const ch=new T.Mesh(new T.PlaneGeometry(2.4,5.6),waterMat(1,1.5,.92,0x78ccff));ch.rotation.x=-PI/2;ch.rotation.z=0;const cx=Math.cos(rad(a))*30.8,cz=Math.sin(rad(a))*30.8;ch.position.set(cx,.2,cz);ch.rotation.order='YXZ';ch.rotation.y=ry;G.add(ch);DISP.push(ch.geometry,ch.material);
  const pw=new T.Mesh(new T.CircleGeometry(2.55,24),waterMat(1.2,1.2,.92,0x78ccff));pw.rotation.x=-PI/2;pw.position.set(px,.42,pz);G.add(pw);DISP.push(pw.geometry,pw.material);
  FALLS.push({a,w:2.4})}
 pondFall(108);pondFall(178);pondFall(255);

 /* ===== parkour (optional): stone pillars climbing round the right-hand edge to a flag lookout ===== */
 const PK=[];
 for(let i=0;i<7;i++){const[x,z]=pol(62-i*10,25.5),last=i===6,hw=last?2.6:1.3,h=2.3*(i+1)+(last?.4:0);PK.push({x,z,h,hw});fp('pad'+i,x,z,hw+.5);
  M.box(ST,hw*2,h-.3,hw*2,x,0,z,[0x8f94a8,0x9a93b3,0xa38ebd,0xad8ac6,0xb786c8,0xc182c3,0xd09a6a][i],0,{j:.05,tile:2.5});M.box(WD,hw*2+.4,.3,hw*2+.4,x,h-.3,z,0xb48350,0,{j:.04,tile:2});
  M.box(GL,hw*2+.5,.08,.16,x,h-.34,z+hw+.2,[0x6fd0ff,0x6fffb0,0xfff06f,0xffb06f,0xff6f9f,0xc08fff,0xffd24a][i],0,{j:0});
  colr(x,z,hw+.2,hw+.2,h,0);if(i%2===0)HOME.push([x,h+1.2,z])}
 {const[px,pz]=pol(62,23),ry=PI/2-rad(62);M.box(ST,4.2,.07,2,px,0,pz,0xbab4cb,ry,{tile:3});}
 {const L=PK[6];M.cyl(PL,.12,.14,8.4,L.x,L.h,L.z-1.4,0xd6d9e4,6,{j:0});M.sph(PL,.28,L.x,L.h+8.5,L.z-1.4,0xffd24a,{ws:6,hs:4,j:0});
  for(const sx of[-1,1])for(const sz of[-1,1]){M.box(WD,.22,1.3,.22,L.x+sx*2.4,L.h,L.z+sz*2.4,0x6b4528)}for(const sx of[-1,1]){M.box(WD,.16,.16,4.8,L.x+sx*2.4,L.h+1.0,L.z,0x8a5a34);M.box(WD,4.8,.16,.16,L.x,L.h+1.0,L.z+sx*2.4,0x8a5a34)}
  glow(L.x,L.h+3,L.z)}

 /* ===== lamps, benches, trees ===== */
 for(const sp of SPOKES){if(sp.a===90)continue;for(const sd of[-1,1]){const a=rad(sp.a),off=sd*(sp.w/2+1.0),r=18.6,x=Math.cos(a)*r-Math.sin(a)*off,z=Math.sin(a)*r+Math.cos(a)*off;lamp(x,z)}}
 for(const sd of[-1,1]){lamp(sd*4.9,19.5);lamp(sd*4.9,26.2)}
 for(const a of[355,55,118,180,243,298]){const[x,z]=pol(a,19.5);bench(x,z,-(PI/2+rad(a)));fp('bench',x,z,1.9)}
 for(const t of[[135,29.5,1.1],[160,29.6,1.2],[190,28.8,1.0],[244,29.6,1.0],[283,28.6,1.1],[296,29.6,1.0],[352,28.6,1.0],[40,29.4,1.05]]){const[x,z]=pol(t[0],t[1]);tree(x,z,t[2])}

 /* ===== random-but-deterministic fill: gardens, bushes, small trees, bounce pads ===== */
 const SP2=SPOKES.concat([{a:305,w:2.8,r1:34},{a:108,w:3,r1:34},{a:178,w:3,r1:34},{a:255,w:3,r1:34}]);
 const free=(x,z,s)=>{const r=Math.hypot(x,z);if(r<18.9+s||r>29.7-s)return false;for(const f of FP)if(Math.hypot(f.x-x,f.z-z)<f.r+s+.25)return false;
  const a=((Math.atan2(z,x)/DEG)+360)%360;for(const sp of SP2){let d=Math.abs(a-sp.a);d=Math.min(d,360-d);if(d<90&&r*Math.sin(d*DEG)<sp.w/2+s+.5&&r<sp.r1+s)return false}
  if(a>232&&a<312&&Math.abs(r-20)<s+2.4)return false;return true};
 const fill=(n,s,fn)=>{let k=0;for(let t=0;t<900&&k<n;t++){const a=rs()*TAU,r=19+rs()*10.5,x=Math.cos(a)*r,z=Math.sin(a)*r;if(!free(x,z,s))continue;k++;fn(x,z)}};
 fill(8,2.3,(x,z)=>{const a=Math.atan2(z,x),ry=PI/2-a+(rs()<.5?0:PI/2);bed(x,z,3.4,2.2,ry);fp('bed',x,z,2.3)});
 const PADS=[];fill(3,1.9,(x,z)=>{PADS.push({x,z});fp('padb',x,z,1.9)});
 fill(7,2.3,(x,z)=>{tree(x,z,.62);});
 fill(26,1.1,(x,z)=>{bush(x,z,.8+rs()*.5);fp('bush',x,z,1.1)});
 return finishBuild();

 /* =====================================================================
    finishing: bake meshes, then globe, water, waterfalls, particles, billboard, islets, clouds, sun
    ===================================================================== */
 function finishBuild(){
  const SEA=(-6-TOP)/K,GY=TOP>0?5.9+1.4+6.4:13.7,GP=new T.Vector3(0,GY,0);
  const mats={stone:new T.MeshLambertMaterial({vertexColors:true,map:texOf('stone')}),wood:new T.MeshLambertMaterial({vertexColors:true,map:texOf('wood')}),brick:new T.MeshLambertMaterial({vertexColors:true,map:texOf('brick')}),
   ground:new T.MeshLambertMaterial({vertexColors:true,map:texOf('grass')}),leaf:new T.MeshLambertMaterial({vertexColors:true,map:texOf('grass')}),plain:new T.MeshLambertMaterial({vertexColors:true}),glow:new T.MeshBasicMaterial({vertexColors:true})};
  Object.values(mats).forEach(m=>DISP.push(m));
  const add=(m)=>{G.add(m);return m};
  /* rope bridge out to the small island at the back-left */
  {const a=rad(232),n=11,x0=Math.cos(a)*32.4,z0=Math.sin(a)*32.4,x1=Math.cos(a)*42.4,z1=Math.sin(a)*42.4;
   for(let i=0;i<=n;i++){const u=i/n,x=lerp(x0,x1,u),z=lerp(z0,z1,u),y=-Math.sin(u*PI)*1.1+.0;M.box(WD,3,.12,.62,x,y-.05,z,i%2?0xb08050:0xa07040,PI/2-a,{tile:2});
    for(const sd of[-1,1]){const o=rot(x,z,sd*1.55,0,PI/2-a);if(i%3===0)M.box(WD,.2,1.4,.2,o[0],y,o[1],0x6b4528);M.box(PL,.08,.08,10/n+.1,o[0],y+1.3,o[1],0xd8c28a,PI/2-a-Math.PI/2*0,{j:0})}}}
  /* decorative fairy lights around the monument */
  for(let k=0;k<24;k++){const a=k/24*TAU,x=Math.cos(a)*11.4,z=Math.sin(a)*11.4;M.box(GL,.22,.22,.22,x,2.05,z,k%3?0xffe7a0:0xffb86a,0,{j:0});glow(x,2.2,z)}
  const meshes=M.finish(G,mats);
  const mk=(geo,mat,x,y,z)=>{const m=new T.Mesh(geo,mat);m.position.set(x,y,z);DISP.push(geo,mat);return m};

  /* ----- pool water + glow ----- */
  const poolW=add(mk(new T.CircleGeometry(10.25,48),waterMat(5,5,.9,0x5fbfff),0,.95,0));poolW.rotation.x=-PI/2;
  const poolG=add(mk(new T.CircleGeometry(10.2,32),new T.MeshBasicMaterial({map:tx.soft,color:0x45c4ff,transparent:true,opacity:.28,blending:T.AdditiveBlending,depthWrite:false}),0,1.0,0));poolG.rotation.x=-PI/2;
  for(let k=0;k<8;k++){const a=k*PI/4+PI/8;const sp=mk(new T.BoxGeometry(.5,.5,.5),new T.MeshLambertMaterial({color:0xd9dbe4}),Math.cos(a)*10.5,1.25,Math.sin(a)*10.5);void sp}

  /* ----- globe, ring, glow ----- */
  const globeG=add(new T.Group());globeG.position.copy(GP);
  const globe=mk(new T.SphereGeometry(6.4,28,18),new T.MeshLambertMaterial({map:tx.earth,emissive:0x0a2a55,emissiveIntensity:.55}),0,0,0);globe.castShadow=true;globeG.add(globe);
  const atmos=mk(new T.SphereGeometry(6.95,20,14),new T.MeshBasicMaterial({color:0x7fd0ff,transparent:true,opacity:.16,side:T.BackSide,blending:T.AdditiveBlending,depthWrite:false}),0,0,0);globeG.add(atmos);
  const halo=new T.Sprite(new T.SpriteMaterial({map:tx.soft,color:0x9fdcff,transparent:true,opacity:.5,blending:T.AdditiveBlending,depthWrite:false}));halo.scale.set(30,30,1);globeG.add(halo);DISP.push(halo.material);
  const ringG=add(new T.Group());ringG.position.copy(GP);
  const ring=mk(new T.TorusGeometry(10.6,.3,8,72),new T.MeshBasicMaterial({color:0xffc533}),0,0,0);ring.rotation.x=PI/2;ringG.add(ring);
  const ringGl=mk(new T.TorusGeometry(10.6,.8,8,72),new T.MeshBasicMaterial({color:0xffb020,transparent:true,opacity:.2,blending:T.AdditiveBlending,depthWrite:false}),0,0,0);ringGl.rotation.x=PI/2;ringG.add(ringGl);
  const sats=[0,1].map(()=>{const m=mk(new T.BoxGeometry(1,1,1),new T.MeshBasicMaterial({color:0xffe27a}),0,0,0);ringG.add(m);return m});
  ringG.rotation.set(.34,0,-.22);
  const base=new T.Sprite(new T.SpriteMaterial({map:tx.soft,color:0xffd070,transparent:true,opacity:.65,blending:T.AdditiveBlending,depthWrite:false}));base.scale.set(14,5,1);base.position.set(0,6.2,0);add(base);DISP.push(base.material);
  const beam=mk(new T.CylinderGeometry(2.3,3.1,GY-6.5,18,1,true),new T.MeshBasicMaterial({color:0xfff0b0,transparent:true,opacity:.07,blending:T.AdditiveBlending,depthWrite:false,side:T.DoubleSide}),0,(GY+6.5)/2,0);add(beam);

  /* ----- waterfalls (animated sheets + foam + mist) ----- */
  const fallSprites=[];
  for(const f of FALLS){const a=rad(f.a),h=.35-SEA-.2,x=Math.cos(a)*33.7,z=Math.sin(a)*33.7;
   const m=mk(new T.PlaneGeometry(f.w,h),new T.MeshBasicMaterial({map:cloneTex(tx.fall,1,Math.round(h/4)),color:0xcfeaff,transparent:true,opacity:.88,side:T.DoubleSide,depthWrite:false}),x,.35-h/2,z);m.rotation.y=PI/2-a;add(m);fallMeshes.push(m.material.map);
   const foam=mk(new T.CircleGeometry(3.4,20),new T.MeshBasicMaterial({map:tx.soft,color:0xffffff,transparent:true,opacity:.55,blending:T.AdditiveBlending,depthWrite:false}),Math.cos(a)*34.4,SEA+.12,Math.sin(a)*34.4);foam.rotation.x=-PI/2;add(foam);
   for(let k=0;k<2;k++){const sp=new T.Sprite(new T.SpriteMaterial({map:tx.soft,color:0xffffff,transparent:true,opacity:.22,blending:T.AdditiveBlending,depthWrite:false}));sp.position.set(Math.cos(a)*34.6,SEA+2.4+k*1.6,Math.sin(a)*34.6);sp.scale.set(8,8,1);add(sp);DISP.push(sp.material);fallSprites.push({sp,k,a})}
   f.foam=foam}
  /* sea glints around the island base */
  const baseFoam=mk(new T.RingGeometry(24,29.5,48),new T.MeshBasicMaterial({map:tx.soft,color:0xffffff,transparent:true,opacity:.4,blending:T.AdditiveBlending,depthWrite:false}),0,SEA+.1,0);baseFoam.rotation.x=-PI/2;add(baseFoam);

  /* ----- billboard screen ----- */
  const bc=document.createElement('canvas');bc.width=768;bc.height=432;const bg=bc.getContext('2d'),btex=new T.CanvasTexture(bc);btex.anisotropy=4;DISP.push(btex);
  const screen=mk(new T.PlaneGeometry(13.9,7.6),new T.MeshBasicMaterial({map:btex}),0,9.1,.2);const bgrp=new T.Group();bgrp.position.set(BB.x,0,BB.z);bgrp.rotation.y=BB.ry;bgrp.add(screen);add(bgrp);
  const prev=[];const NM=info=>info&&info.names||NAMES_FALLBACK;
  function drawPreview(x,i,w,h){const sk=[['#f6a95e','#ffe0a8'],['#5fb2ee','#cfeeff'],['#7d6fa0','#c7bde0'],['#c9a77a','#f1dfb8'],['#2c3558','#5a6a9a'],['#8fc060','#d4eba0'],['#c2412c','#ffb070']][i],g=x.createLinearGradient(0,0,0,h);g.addColorStop(0,sk[0]);g.addColorStop(1,sk[1]);x.fillStyle=g;x.fillRect(0,0,w,h);
   const gy=h*.72,house=(hx,hy,hw,hh,c)=>{x.fillStyle=c;x.fillRect(hx,hy-hh,hw,hh);x.fillStyle='#7a3b2c';x.beginPath();x.moveTo(hx-3,hy-hh);x.lineTo(hx+hw/2,hy-hh-hw*.4);x.lineTo(hx+hw+3,hy-hh);x.fill()};
   x.fillStyle=i===6?'#3a2a2a':i===1?'#2f6fb8':'#6a8f4a';x.fillRect(0,gy,w,h-gy);
   if(i===0){for(const m of[[.2,.1],[.55,.25],[.8,.05]]){x.strokeStyle='rgba(255,170,60,.7)';x.lineWidth=8;x.beginPath();x.moveTo(w*m[0]-40,h*m[1]-40);x.lineTo(w*m[0],h*m[1]+h*.15);x.stroke();x.fillStyle='#ff6a1a';x.beginPath();x.arc(w*m[0],h*m[1]+h*.15,12,0,TAU);x.fill();x.fillStyle='#ffd070';x.beginPath();x.arc(w*m[0]-2,h*m[1]+h*.15-2,6,0,TAU);x.fill()}house(w*.15,gy,50,34,'#e8dcc3');house(w*.62,gy,56,40,'#cfc2a6')}
   if(i===1){house(w*.18,gy,48,30,'#e8dcc3');house(w*.62,gy,52,36,'#cfc2a6');x.fillStyle='rgba(30,100,190,.92)';x.beginPath();x.moveTo(0,h);x.lineTo(0,h*.62);for(let k=0;k<=24;k++)x.lineTo(k/24*w,h*.62+Math.sin(k*.9)*7);x.lineTo(w,h);x.fill()}
   if(i===2){for(let k=0;k<9;k++){const t=k/8,ww=18+t*58,yy=gy-t*gy*.95,xx=w*.5+Math.sin(k*1.1)*10*(1-t*.3);x.fillStyle='rgba(70,64,92,'+(.95-t*.2)+')';x.beginPath();x.ellipse(xx,yy,ww,9,0,0,TAU);x.fill()}x.fillStyle='#4a4660';for(let k=0;k<14;k++)x.fillRect(w*.5+Math.sin(k*2.3)*70,gy*(.2+(k*.37%.7)),5,5);house(w*.1,gy,44,30,'#e8dcc3')}
   if(i===3){house(w*.12,gy,50,38,'#d8c9a6');x.save();x.translate(w*.62,gy);x.rotate(.12);x.fillStyle='#c9b58a';x.fillRect(0,-50,54,50);x.restore();x.strokeStyle='#1c1410';x.lineWidth=5;x.beginPath();x.moveTo(w*.4,gy);for(let k=1;k<7;k++)x.lineTo(w*.4+Math.sin(k*2.1)*22+k*10,gy+k*(h-gy)/6);x.stroke()}
   if(i===4){x.fillStyle='#6b7390';for(let k=0;k<5;k++){x.beginPath();x.ellipse(w*(.1+k*.2),h*.16,46,22,0,0,TAU);x.fill()}x.strokeStyle='#fff5a0';x.lineWidth=7;x.beginPath();x.moveTo(w*.55,h*.2);x.lineTo(w*.46,h*.42);x.lineTo(w*.58,h*.44);x.lineTo(w*.48,gy);x.stroke();x.fillStyle='rgba(255,255,200,.18)';x.fillRect(0,0,w,h);house(w*.7,gy,46,32,'#bfb59a')}
   if(i===5){x.fillStyle='#7d9a56';for(let k=0;k<5;k++){x.beginPath();x.ellipse(w*(.1+k*.2),h*.14,46,20,0,0,TAU);x.fill()}x.strokeStyle='rgba(150,255,80,.75)';x.lineWidth=2.5;for(let k=0;k<26;k++){const rx=(k*53%w),ry=h*.2+(k*29%(h*.5));x.beginPath();x.moveTo(rx,ry);x.lineTo(rx-6,ry+16);x.stroke()}house(w*.16,gy,52,34,'#d8d0b8');house(w*.6,gy,48,30,'#cfc2a6')}
   if(i===6){const lg=x.createLinearGradient(0,gy-8,0,h);lg.addColorStop(0,'#ffcf4a');lg.addColorStop(1,'#e8421a');x.fillStyle=lg;x.fillRect(0,gy-8,w,h-gy+8);x.fillStyle='#2a1f1f';for(let k=0;k<4;k++)x.fillRect(w*(.1+k*.24),gy-26-k%2*10,36,36);x.fillStyle='#ffe08a';for(let k=0;k<12;k++)x.fillRect(k*w/12+((k*17)%9),h*.2+(k*31)%(h*.4),3,3)}}
  const NMS=['Meteor Shower','Flood','Tornado','Earthquake','Lightning Storm','Acid Rain','Lava Rise'];
  function paintBoard(label,idx,secs,sub,names){const w=768,h=432,g=bg.createLinearGradient(0,0,0,h);g.addColorStop(0,'#16213f');g.addColorStop(1,'#0a1021');bg.fillStyle=g;bg.fillRect(0,0,w,h);bg.strokeStyle='#ffb12e';bg.lineWidth=6;bg.strokeRect(8,8,w-16,h-16);
   if(!prev[idx]){const pc=document.createElement('canvas');pc.width=340;pc.height=300;drawPreview(pc.getContext('2d'),idx,340,300);prev[idx]=pc}
   bg.save();bg.beginPath();bg.rect(34,34,340,300);bg.clip();bg.drawImage(prev[idx],34,34);bg.restore();bg.strokeStyle='#e8edff';bg.lineWidth=4;bg.strokeRect(34,34,340,300);
   bg.fillStyle='#9fb6e8';bg.font='bold 40px system-ui, sans-serif';bg.textAlign='left';bg.fillText(label,406,88);
   const nm=names[idx]||'';let fs=76;bg.font='bold '+fs+'px system-ui, sans-serif';while(bg.measureText(nm).width>330&&fs>30){fs-=3;bg.font='bold '+fs+'px system-ui, sans-serif'}bg.fillStyle='#ffb12e';bg.fillText(nm,406,176);
   const mm=Math.floor(secs/60),ss=secs%60;bg.fillStyle='#ffffff';bg.font='bold 124px system-ui, sans-serif';bg.fillText((mm<10?'0':'')+mm+':'+(ss<10?'0':'')+ss,398,306);
   bg.fillStyle='#b8c6ee';bg.font='bold 30px system-ui, sans-serif';bg.fillText(sub,40,386);btex.needsUpdate=true}
  paintBoard('Next Disaster:',2,45,'Vote for a map and get ready!',NMS);

  /* ----- particles ----- */
  const sys=[];const ps=(p)=>{add(p);DISP.push(p.geometry,p.material);sys.push(p);return p};
  const jets=ps(PS(96,1.0,tx.soft,0x9fdcff,(i,t,o)=>{if(i<64){const j=i>>3,k=i&7,aj=j*TAU/8+.39,u=frac(t*.7+k/8+j*.11),rr=lerp(9.5,6.7,u);o.x=Math.cos(aj)*rr;o.z=Math.sin(aj)*rr;o.y=lerp(1.7,1.0,u)+3.6*4*u*(1-u);o.a=.35+.65*Math.sin(PI*u)}
    else{const q=i-64,m=q>>3,k=q&7,am=m*TAU/4+.78,u=frac(t*.8+k/8+m*.2),rr=lerp(5.5,7.9,u);o.x=Math.cos(am)*rr;o.z=Math.sin(am)*rr;o.y=lerp(2.7,1.0,u)+3.4*4*u*(1-u);o.a=.3+.7*Math.sin(PI*u)}}));
  const splash=ps(PS(40,1.2,tx.soft,0xdff4ff,(i,t,o)=>{const j=i>>2,aj=j*TAU/8+.39,u=frac(t*1.5+i*.31),rr=6.7+(frac(i*.37)-.5)*1.6;o.x=Math.cos(aj)*rr;o.z=Math.sin(aj)*rr;o.y=1.0+.7*4*u*(1-u);o.a=.7*(1-u*.7)}));
  const glints=ps(PS(24,.9,tx.star,0xffffff,(i,t,o)=>{const a=frac(i*.618)*TAU,r=7+frac(i*.37)*3;o.x=Math.cos(a)*r;o.z=Math.sin(a)*r;o.y=1.05;o.a=Math.pow(Math.max(0,Math.sin(t*2+i*1.7)),6)}));
  const orbit=PS(40,.9,tx.soft,0xaeeaff,(i,t,o)=>{const R=8.0+(i%3)*.7,w=(.32+(i%4)*.06)*(i%2?1:-1),a=t*w+i*1.7,tilt=(i%5)*.42-.84,x=Math.cos(a)*R,y0=Math.sin(a)*R;o.x=x;o.y=y0*Math.sin(tilt);o.z=y0*Math.cos(tilt);o.a=.5+.5*Math.sin(t*2+i)});globeG.add(orbit);DISP.push(orbit.geometry,orbit.material);sys.push(orbit);
  const trail=PS(30,1.3,tx.soft,0xffc83a,(i,t,o)=>{const sat=i<15?0:1,k=i%15,a=t*.6+(sat?PI:0)-k*.09;o.x=Math.cos(a)*10.6;o.z=Math.sin(a)*10.6;o.y=Math.sin(k*3.1+i)*.25;o.a=Math.pow(1-k/15,1.6)*.95});ringG.add(trail);DISP.push(trail.geometry,trail.material);sys.push(trail);
  const sparkle=ps(PS(30,1.0,tx.star,0xfff2c0,(i,t,o)=>{const ph=frac(t*.28+i*.137),a=i*2.4+t*.08,r=3+((i*37)%90)/10;o.x=Math.cos(a)*r;o.z=Math.sin(a)*r;o.y=3+((i*53)%150)/10+ph*1.6;o.a=Math.pow(Math.sin(PI*ph),2)}));
  const fly=ps(PS(36,.7,tx.soft,0xd6ff72,(i,t,o)=>{const h=HOME[i%Math.max(1,HOME.length)]||[0,3,0];o.x=h[0]+Math.sin(t*.4+i)*1.8+Math.sin(t*.9+i*3)*.5;o.z=h[2]+Math.cos(t*.37+i*1.3)*1.8;o.y=h[1]+Math.sin(t*.7+i*2)*.8;o.a=Math.pow(.5+.5*Math.sin(t*1.7+i*5),3)}));
  const motes=ps(PS(48,.55,tx.soft,0xfff1c0,(i,t,o)=>{const ph=frac(i*.377+t*.03);o.x=Math.cos(i*2.1)*(6+frac(i*.713)*22)+Math.sin(t*.1+i)*1.2;o.z=Math.sin(i*2.1)*(6+frac(i*.713)*22)+Math.cos(t*.12+i)*1.2;o.y=.8+ph*11;o.a=Math.sin(PI*ph)*.55}));
  const petals=ps(PS(14,.7,tx.soft,0xffa8c8,(i,t,o)=>{const ph=frac(i*.213+t*.045);o.x=Math.cos(i*3.3)*(14+frac(i*.51)*13)+Math.sin(t*.5+i)*1.4;o.z=Math.sin(i*3.3)*(14+frac(i*.51)*13)+Math.cos(t*.4+i)*1.4;o.y=10-ph*9.2;o.a=Math.sin(PI*ph)*.8}));
  const GN=Math.max(1,GLOW.length),lamps=ps(PS(GN,6,tx.soft,0xffb85a,(i,t,o)=>{const g=GLOW[i]||[0,-50,0];o.x=g[0];o.y=g[1];o.z=g[2];o.a=.5+.08*Math.sin(t*3+i*1.9)},true,70));
  const WFN=Math.max(1,FALLS.length)*40,wf=ps(PS(WFN,1.1,tx.soft,0xeaf7ff,(i,t,o)=>{const w=(i/40)|0,k=i%40,f=FALLS[w];if(!f){o.a=0;o.y=-50;return}const a=rad(f.a),tx_=-Math.sin(a),tz=Math.cos(a),cx=Math.cos(a),cz=Math.sin(a);let rr=33.6,y,off=((k*7)%10/10-.5)*f.w*.9,al=.8;
    if(k<18){const u=frac(t*1.15+k*.137);y=.3-u*(.3-SEA-.3);rr=33.6+u*.25}else if(k<30){const u=frac(t*1.7+k*.19);y=SEA+.2+1.6*4*u*(1-u);rr=34.2+Math.sin(k)*1.1*u+u*.8;off*=1.5;al=.9*(1-u*.8)}else{const u=frac(t*.9+k*.21);rr=33.2+u*2.6;y=.35-u*u*(10);al=.7*(1-u*.8)}
    o.x=cx*rr+tx_*off;o.z=cz*rr+tz*off;o.y=y;o.a=al}));
  const mist=[];for(let k=0;k<3;k++){const sp=new T.Sprite(new T.SpriteMaterial({map:tx.soft,color:0xcfeaff,transparent:true,opacity:.12,blending:T.AdditiveBlending,depthWrite:false}));sp.position.set(0,3.2+k*.5,0);sp.scale.set(10,4,1);add(sp);DISP.push(sp.material);mist.push(sp)}

  /* ----- sun, sea ----- */
  const sunDir=new T.Vector3(25,80,35).normalize(),sunS=[[0xfff2c0,70,.9],[0xffe6a0,170,.35]].map(q=>{const sp=new T.Sprite(new T.SpriteMaterial({map:tx.soft,color:q[0],transparent:true,opacity:q[2],blending:T.AdditiveBlending,depthWrite:false,fog:false}));sp.position.set(sunDir.x*380,sunDir.z*0+sunDir.y*380,LZ+sunDir.z*380);sp.scale.set(q[1],q[1],1);sp.renderOrder=-1;scene.add(sp);DISP.push(sp.material);return sp});

  /* ----- islets, clouds ----- */
  const islets=[];
  function islet(a,r,y,seed,kind,bob){const m=Merger(0,mulb(seed)),g=new T.Group(),X=0,Z=0,ls=[[5.2,4.6,1.8,-1.8,0x8a8d9c],[4.6,3.6,1.8,-3.6,0x93754f],[3.6,2.2,1.8,-5.4,0x7a6048],[2.2,.7,1.6,-7.0,0x5f4d40]];
   for(const l of ls)m.cyl(ST,l[0],l[1],l[2],X,l[3],Z,l[4],9,{j:.07,tile:3});m.cyl(GD,5.5,5.5,.4,X,-.4,Z,0x7ad85c,10,{j:.05,tile:4});
   const lf=(x,y2,z,w,h,d)=>m.box(LF,w,h,d,x,y2,z,pick(gcol),rnd()*PI,{j:.1,tile:3});
   if(kind==='tree'||kind==='two'){const tr=(x,z,s)=>{m.box(WD,1.2*s,4*s,1.2*s,x,0,z,0x7a5230);lf(x,3.2*s,z,5*s,2.4*s,5*s);lf(x,5.4*s,z,3.2*s,1.8*s,3.2*s)};tr(kind==='two'?-1.6:0,0,.9);if(kind==='two')tr(2.2,1.2,.7)}
   if(kind==='hut'){m.box(WD,3.4,2.2,3,0,0,0,0xb48350,0,{tile:2});m.cyl(WD,0,2.8,1.6,0,2.2,0,0xa9553a,4,{ry:PI/4,tile:3});m.box(GL,.5,.5,.1,0,.9,1.52,0xffd58a,0,{j:0})}
   if(kind==='bush'){lf(-1,0,0,2.2,1.2,2.2);lf(1.4,0,.8,1.6,1,1.6);m.box(PL,.4,.3,.4,-1,1.3,0,pick(FL))}
   for(let k=0;k<5;k++){const aa=rnd()*TAU,rr=2+rnd()*2.2;m.box(PL,.34,.26,.34,Math.cos(aa)*rr,0,Math.sin(aa)*rr,pick(FL),0,{j:.05})}
   const out=m.finish(g,mats);out.forEach(q=>q.castShadow=false);g.position.set(Math.cos(rad(a))*r,y,Math.sin(rad(a))*r);G.add(g);islets.push({g,y,bob:bob===undefined?1:bob,ph:seed})}
  islet(232,47.5,.0,11,'two',0);islet(300,56,2,12,'tree');islet(18,53,-1,13,'hut');islet(80,60,3,14,'bush');islet(150,57,1,15,'tree');islet(195,64,-2,16,'two');
  const cm=Merger(0,mulb(99)),cg=new T.Group();for(let i=0;i<14;i++){const a=rnd()*TAU,r=80+rnd()*95,y=24+rnd()*46,cx=Math.cos(a)*r,cz=Math.sin(a)*r,n=4+Math.floor(rnd()*4);for(let k=0;k<n;k++){const w=6+rnd()*8,d=5+rnd()*5;cm.box(PL,w,2.4+rnd()*1.8,d,cx+(k-n/2)*5+rnd()*2,y+(k%2)*1.1,cz+(rnd()-.5)*5,0xffffff,0,{j:.02})}}
  const cMat=new T.MeshBasicMaterial({vertexColors:true,fog:false,transparent:true,opacity:.93});DISP.push(cMat);cm.finish(cg,{plain:cMat}).forEach(q=>q.castShadow=false);G.add(cg);

  /* ----- small interactive things: bounce pads, bell, flag, trophy ----- */
  const padM=PADS.map(p=>{const grp=new T.Group();grp.position.set(p.x,0,p.z);const b=mk(new T.CylinderGeometry(1.5,1.7,.5,12),new T.MeshLambertMaterial({color:0x7a4f2c}),0,.25,0),c=mk(new T.SphereGeometry(1.45,12,6,0,TAU,0,PI/2),new T.MeshLambertMaterial({color:0xe8483c,emissive:0x501010}),0,.45,0);grp.add(b,c);
   for(let k=0;k<5;k++){const aa=k*TAU/5,d=mk(new T.CylinderGeometry(.2,.2,.05,8),new T.MeshBasicMaterial({color:0xffffff}),Math.cos(aa)*.8,.45+Math.sqrt(Math.max(0,1.45*1.45-.64))*.9,Math.sin(aa)*.8);void d}
   add(grp);return{p,grp,cap:c,sq:0}});
  const bell=new T.Group();bell.position.set(BELL.x,4.5,BELL.z);const bm=mk(new T.CylinderGeometry(.35,.9,1.1,10),new T.MeshLambertMaterial({color:0xd9a521,emissive:0x503800}),0,-.7,0);bell.add(bm);add(bell);
  const PL6=PK[6],flag=mk(new T.PlaneGeometry(2.7,1.5,8,1),new T.MeshLambertMaterial({color:0xe03a2c,side:T.DoubleSide,emissive:0x400808}),PL6.x+1.5,PL6.h+7.2,PL6.z-1.4);add(flag);const fp0=flag.geometry.attributes.position.array.slice();
  const trophy=mk(new T.OctahedronGeometry(.9),new T.MeshBasicMaterial({color:0xffd24a}),PL6.x,PL6.h+2.3,PL6.z+.6);add(trophy);

  /* ----- per-frame ----- */
  let tt=0,padCd=0,bellT=0,bellCd=0,boardKey='',lastCyc=-9,nd=0,d0=0;
  const wmat=waterMeshes,fmat=fallMeshes;
  function tick(dt,info){const P=info.P;if(!P)return;tx.sea.offset.x+=dt*.003;tx.sea.offset.y+=dt*.002;
   const lx=P.x,lz=P.z-LZ;if(lx*lx+lz*lz>110*K*110*K)return;tt+=dt;
   for(const t of wmat){t.offset.x+=dt*.012;t.offset.y+=dt*.02}for(const t of fmat)t.offset.y+=dt*1.25;
   globe.rotation.y+=dt*.16;globeG.position.y=GY+Math.sin(tt*.8)*.25;ringG.position.y=globeG.position.y;ringG.rotation.y+=dt*.09;ringG.rotation.x=.34+Math.sin(tt*.3)*.05;
   sats.forEach((s,i)=>{const a=tt*.6+i*PI;s.position.set(Math.cos(a)*10.6,0,Math.sin(a)*10.6);s.rotation.set(a,a*.7,0)});
   halo.material.opacity=.45+.08*Math.sin(tt*1.3);poolG.material.opacity=.26+.06*Math.sin(tt*1.7);
   for(const p of sys)p.step(tt);
   mist.forEach((sp,k)=>{sp.position.y=3.2+k*.6+Math.sin(tt*.5+k)*.3;sp.position.x=Math.sin(tt*.2+k*2)*5;sp.position.z=Math.cos(tt*.17+k*2)*5;sp.material.opacity=.09+.03*Math.sin(tt+k)});
   fallSprites.forEach(o=>{o.sp.position.y=SEA+2.4+o.k*1.6+Math.sin(tt*1.1+o.k+o.a)*.4;o.sp.material.opacity=.2+.07*Math.sin(tt*1.6+o.a)});
   for(const f of FALLS)f.foam.scale.setScalar(1+.12*Math.sin(tt*2.2+f.a));baseFoam.scale.setScalar(1+.015*Math.sin(tt*.9));
   for(const o of islets)if(o.bob)o.g.position.y=o.y+Math.sin(tt*.6+o.ph)*.35;cg.rotation.y+=dt*.004;
   trophy.rotation.y+=dt*1.6;trophy.position.y=PL6.h+2.3+Math.sin(tt*2)*.18;
   {const a=flag.geometry.attributes.position,s=fp0;for(let i=0;i<a.count;i++){const x0=s[i*3]+1.35;a.setZ(i,Math.sin(x0*2.2-tt*5)*.12*x0)}a.needsUpdate=true}
   /* billboard follows the round clock */
   const cyc=info.cyc,s=info.s;if(cyc!==lastCyc){lastCyc=cyc;d0=Math.floor(mulb(cyc)()*7);nd=Math.floor(mulb(cyc+1)()*7)}
   let label,idx,secs,sub;const names=NM(info);
   if(s<19){label='Next Disaster:';idx=d0;secs=Math.max(0,Math.ceil(19-s));sub=s<9?'Vote for a map now!':s<15?'Map locked - get ready!':'Incoming! Find shelter!'}
   else if(s<54){label='Disaster Now:';idx=d0;secs=Math.max(0,Math.ceil(54-s));sub='Next up: '+(names[nd]||'')}
   else{label='Next Disaster:';idx=nd;secs=Math.max(0,Math.ceil(79-s));sub='Round over - back to the lobby'}
   const key=label+idx+secs+sub;if(key!==boardKey){boardKey=key;paintBoard(label,idx,secs,sub,names)}
   if(!info.inLobby)return;
   /* things that react to the player */
   for(const o of OBS){const dx=P.x-o[0],dz2=P.z-o[1],dd=Math.hypot(dx,dz2),rr=o[2]+.6;if(dd<rr&&P.y<o[3]-.3){const k=rr/(dd||.001);P.x=o[0]+dx*k;P.z=o[1]+dz2*k;if(!dd)P.x+=rr}}
   padCd-=dt;for(const q of padM){q.sq=Math.max(0,q.sq-dt*3);q.cap.scale.y=1-q.sq*.45;q.cap.scale.x=q.cap.scale.z=1+q.sq*.2;
    if(padCd<=0&&P.y<TOP+1.5*K&&P.vy<=0&&Math.hypot(P.x-q.p.x*K,P.z-(LZ+q.p.z*K))<1.8*K){P.vy=112;P.gr=false;padCd=.45;q.sq=1;if(typeof snd==='function')snd(380,.18,'sine',.12,900)}}
   bellCd-=dt;if(bellCd<=0&&Math.hypot(P.x-BELL.x*K,P.z-(LZ+BELL.z*K))<3*K&&P.y<TOP+3*K){bellT=1.6;bellCd=2.2;if(typeof snd==='function'){snd(880,.7,'sine',.14,840);snd(1320,.5,'sine',.06,1290)}}
   bellT=Math.max(0,bellT-dt);bell.rotation.z=Math.sin(tt*16)*bellT*.45}

  /* keep players inside the island, with a corridor out onto the pier */
  function clamp(P){const dx=P.x,dz=P.z-LZ,r=Math.hypot(dx,dz);if(dz>26*K&&Math.abs(dx)<3.1*K){if(dz>39.2*K)P.z=LZ+39.2*K;return}
   if(r>30.5*K){P.x=dx/r*30.5*K;P.z=LZ+dz/r*30.5*K}}
  function dispose(){scene.remove(G);sunS.forEach(sp=>scene.remove(sp));DISP.forEach(o=>{try{o.dispose()}catch(e){}});meshes.forEach(m=>m.geometry.dispose());sys.length=0}
  return{group:G,colliders:COL,obstacles:OBS,tick,clamp,dispose,seaTex:tx.sea,foot:FP,topY:TOP,scale:K,floorR:32*K,spawn:()=>[(Math.random()-.5)*6*K,LZ+(14.6+Math.random()*2)*K]}
 }
}

return{build,Merger,PS,makeTex,setK:k=>{PSK=k}}})();
