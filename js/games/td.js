/* Game: Tower Defense (id: td) - co-op, path-based tower defense with a floating-garden lobby.
   Lobby: physical Solo/Duo/Squad queue pads, Tower Shop (data-driven, see js/tdcore.js), leaderboard. Match: waves follow a path to the portal, towers are placed beside it.
   SCALE: the avatar is 5.2 studs tall and 4 wide, so the lobby group is built at K = 1.8 and match objects are built directly in studs (path is 12.6 wide = 3 avatars).
   MULTIPLAYER: players share positions through the normal presence channel; this game adds a few short fields via ex():
     qq/qa = queue type + how long I have been on the pad,  mm = match id,  tw = my towers,  ml/ms = lives/state (the host's copy is adopted),  ts = my stats. */
GAMES.push({id:'td',name:'Tower Defense',tag:'Co-op',e:'🌱',c:['#3fbf5a','#f0a020'],like:'New',pl:'New',hint:'Walk onto the Solo, Duo or Squad pad to queue. WASD move, Space jump. Browse the Tower Shop on the right (click a plant or press E). In a match pick a tower below, click the grass to place it (E), click your towers to upgrade (F).'});
META.td={c:'Casual',m:'Solo \u00b7 Co-op (up to 4)',t:['Tower defense','11 waves','Plant towers']};
ENG.td=(()=>{
const K=1.8,TL=26.4,MZ=380,PI=Math.PI,TAU=PI*2,DEG=PI/180;
const lerp=(a,b,u)=>a+(b-a)*u,frac=v=>v-Math.floor(v),pol=(a,r)=>[Math.cos(a*DEG)*r,Math.sin(a*DEG)*r],rot=(x,z,lx,lz,ry)=>[x+lx*Math.cos(ry)+lz*Math.sin(ry),z-lx*Math.sin(ry)+lz*Math.cos(ry)];
const QT={solo:{n:'Solo Queue',need:1,max:1,col:0x3aa0ff,css:'#3aa0ff',a:192,ic:'\uD83D\uDC64'},duo:{n:'Duo Queue',need:2,max:2,col:0xb060ff,css:'#b060ff',a:214,ic:'\uD83D\uDC65'},squad:{n:'Squad Queue',need:4,max:4,col:0xffa030,css:'#ffa030',a:236,ic:'\uD83D\uDC6A'}};
const SLOT={solo:[[0,0]],duo:[[-1.5,0],[1.5,0]],squad:[[-1.4,-1.3],[1.4,-1.3],[-1.4,1.3],[1.4,1.3]]};
let st=null;                                   /* everything for the current session lives in st (rebuilt by start, freed by stop) */
const $=id=>document.getElementById(id);
const mat=(c,e)=>new THREE.MeshLambertMaterial({color:c,emissive:e||0});

/* ---------- canvas signs (name, counts, leaderboard...) ---------- */
function sign(w,h,cw,ch){const c=document.createElement('canvas');c.width=cw;c.height=ch;const x=c.getContext('2d'),t=new THREE.CanvasTexture(c);t.anisotropy=4;const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:t,transparent:true}));st.disp.push(t,m.geometry,m.material);return{m,x,t,c,key:'',paint(key,fn){if(key===this.key)return;this.key=key;fn(x,cw,ch);t.needsUpdate=true}}}
const rr=(x,a,b,w,h,r)=>{x.beginPath();if(x.roundRect)x.roundRect(a,b,w,h,r);else x.rect(a,b,w,h)};
const woodBg=(x,w,h)=>{const g=x.createLinearGradient(0,0,0,h);g.addColorStop(0,'#7a4a2a');g.addColorStop(1,'#5a3320');x.fillStyle=g;rr(x,0,0,w,h,26);x.fill();x.strokeStyle='#3b2214';x.lineWidth=8;x.stroke();x.strokeStyle='rgba(0,0,0,.18)';x.lineWidth=2;for(let y=24;y<h;y+=30){x.beginPath();x.moveTo(10,y);x.lineTo(w-10,y);x.stroke()}};
const fit=(x,txt,px,max,font)=>{let s=px;x.font='bold '+s+'px '+font;while(x.measureText(txt).width>max&&s>14){s-=2;x.font='bold '+s+'px '+font}return s};
const FONT='system-ui, sans-serif';

/* =====================================================================================
   LOBBY
   ===================================================================================== */
function buildLobby(){
 const tx=SBLobby.makeTex(),rnd=mulb(4242),rs=mulb(99);SBLobby.setK(K);
 const G=new THREE.Group();G.position.set(0,TL,0);G.scale.setScalar(K);scene.add(G);st.G=G;
 const M=SBLobby.Merger(0,rnd),COL=[],OBS=[],FP=[],GLOW=[],HOME=[];
 const ST='stone',WD='wood',LF='leaf',PL='plain',GL='glow',GD='ground',BR='brick';
 const gcol=[0x3f9d3f,0x4caf50,0x57b94a,0x3a9446,0x62c050],FL=[0xe8483c,0xffd23a,0xf5f5f0,0xff7fb5,0xa56bff,0xff9a2e,0x4fb7ff];
 const pick=a=>a[Math.floor(rnd()*a.length)];
 const colr=(x,z,hw,hd,top,bot)=>COL.push({x:x*K,z:z*K,hw:hw*K,hd:hd*K,top:TL+top*K,bot:TL+bot*K});
 const obs=(x,z,r,top)=>OBS.push([x*K,z*K,r*K,TL+top*K]);
 const fp=(n,x,z,r)=>FP.push({n,x,z,r}),glow=(x,y,z)=>GLOW.push([x,y,z]);
 const GAPS=[[90,14],[130,5.5],[50,5.5],[180,5.5]];
 const gapAt=a=>{a=((a%360)+360)%360;for(const g of GAPS){let d=Math.abs(a-g[0]);d=Math.min(d,360-d);if(d<g[1])return true}return false};
 const SPOKES=[{a:90,w:8,r1:31.5},{a:QT.solo.a,w:3.4,r1:21.5},{a:QT.duo.a,w:3.4,r1:21.5},{a:QT.squad.a,w:3.4,r1:21.5},{a:322,w:5,r1:21},{a:358,w:4,r1:25},{a:270,w:6,r1:25}];
 const waterMat=(rx,ry,op,color)=>{const t=tx.water.clone();t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(rx,ry);t.needsUpdate=true;st.disp.push(t);st.waterT.push(t);return new THREE.MeshBasicMaterial({map:t,color:color||0x6fc6ff,transparent:true,opacity:op||.9,depthWrite:false})};
 const flat=(geo,matl,x,y,z,rx)=>{const m=new THREE.Mesh(geo,matl);m.position.set(x,y,z);if(rx)m.rotation.x=rx;G.add(m);st.disp.push(geo,matl);return m};
 /* ---- island body (grass, rock wall tapering into the sea, curb + fence) ---- */
 M.disc(GD,31.9,0,0x7ad85c,56,4);
 const WL=[0xa8909a,0x98828c,0x9c7d57,0x886c4d,0x765d45,0x63513f,0x584739,0x4d3f35,0x44382f];
 for(let i=0;i<9;i++){const R=i<6?31.3-i*.95:25.6-(i-5)*5.2,n=Math.ceil(PI*2*R/3.3);for(let k=0;k<n;k++){const a=(k+(i%2)*.5)/n*TAU,r=R+(rnd()-.5)*.7;M.box(ST,TAU*R/n*1.12,3.1,3.3,Math.cos(a)*r,-3*i-3.05,Math.sin(a)*r,WL[i],PI/2-a,{j:.1,tile:3.4})}}
 for(let i=0;i<46;i++){const a=rnd()*TAU,ly=rnd()<.6?0:1,R=31.3-ly*.95+1.5,h=1.4+rnd()*3.2;if(gapAt(a/DEG))continue;M.box(LF,.9+rnd(),h,.7,Math.cos(a)*R,-3*ly-h+.3,Math.sin(a)*R,pick(gcol),PI/2-a,{j:.1})}
 {const n=96,R=30.9;for(let k=0;k<n;k++){const a=(k+.5)/n*TAU;if(gapAt(a/DEG))continue;M.box(ST,TAU*R/n*1.1,.55,1.1,Math.cos(a)*R,.05,Math.sin(a)*R,0xc8b4bc,PI/2-a,{j:.07})}
  const m=64;for(let k=0;k<m;k++){const a0=k/m*TAU,a1=(k+1)/m*TAU,am=(a0+a1)/2;if(gapAt(a0/DEG)||gapAt(a1/DEG))continue;M.box(WD,.34,1.7,.34,Math.cos(a0)*R,.6,Math.sin(a0)*R,0x6b4528,0,{j:.05});
   const ln=TAU*R/m*1.02;for(const hy of[.75,1.4])M.box(WD,ln,.2,.15,Math.cos(am)*R,.6+hy,Math.sin(am)*R,0x8a5a34,PI/2-am,{j:.05,tile:2})}}
 /* ---- plaza + paths ---- */
 M.ring(ST,8.6,9.3,.06,0xe3c27a,0xd9b56a,40,0,TAU,2);M.ring(ST,9.3,14,.07,0xcdb4ba,0xbda2aa,40,0,TAU,3);M.ring(ST,14,18.4,.07,0xd8c3bf,0xc8b2ae,72,0,TAU,3);M.ring(ST,18.4,18.9,.1,0x8d7a82,0x8d7a82,72,0,TAU,2);
 const spoke=sp=>{const a=sp.a*DEG,r0=18.4,len=sp.r1-r0,n=Math.ceil(len/2.2),ry=PI/2-a;for(let i=0;i<n;i++){const l0=r0+i*len/n,l1=r0+(i+1)*len/n,rm=(l0+l1)/2;M.box(ST,sp.w,.07,len/n,Math.cos(a)*rm,0,Math.sin(a)*rm,i%2?0xd5c4c4:0xc3b0b4,ry,{j:.03,tile:3})}
  for(const sd of[-1,1]){const off=sd*(sp.w/2+.16),cx=Math.cos(a)*(r0+len/2)-Math.sin(a)*off,cz=Math.sin(a)*(r0+len/2)+Math.cos(a)*off;M.box(ST,.32,.14,len,cx,0,cz,0x8d7a82,ry,{j:.04})}};
 SPOKES.forEach(spoke);
 /* front steps (flat bands, like the concept's wide stairs) */
 for(let i=0;i<5;i++)M.box(ST,12-i*.4,.12+(i%2)*.03,1.1,0,0,26.5+i*1.1,i%2?0xcfbcbc:0xbfaaae,0,{j:.03});
 for(const sx of[-1,1]){M.box(ST,2.4,.8,2.4,sx*7.2,0,29.6,0xa08b92);M.box(ST,1.8,4.8,1.8,sx*7.2,.8,29.6,0xbaa6ac,0,{tile:3});M.box(ST,2.3,.45,2.3,sx*7.2,5.6,29.6,0x8d7a82);M.box(GL,.9,1,.9,sx*7.2,6.05,29.6,0xffd58a,0,{j:0});glow(sx*7.2,6.5,29.6);M.cyl(PL,0,.75,.7,sx*7.2,7.05,29.6,0x353846,4,{j:0});obs(sx*7.2,29.6,1.3,8);
  for(let k=0;k<3;k++)M.box(LF,1.5,1.2,1.5,sx*(8.4+k*.5),.14,29.6+(k-1)*1.2,pick(gcol),rnd()*PI,{j:.1})}
 /* ---- small props (sized for the avatar: see ENG notes) ---- */
 function lamp(x,z,h){h=h||2.6;M.box(ST,.9,.5,.9,x,0,z,0x80838f);M.cyl(PL,.14,.18,h,x,.5,z,0x353846,6,{j:0});M.box(GL,.7,.8,.7,x,.5+h,z,0xffd58a,0,{j:0});M.box(PL,.98,.16,.98,x,1.3+h,z,0x353846,0,{j:0});M.cyl(PL,0,.62,.5,x,1.46+h,z,0x353846,4,{j:0});glow(x,.5+h+.4,z);obs(x,z,.5,5)}
 function bench(x,z,ry){const B=1.5,p=(lx,lz)=>rot(x,z,lx*B,lz*B,ry);let q=p(0,0);M.box(WD,3.2*B,.28*B,1.1*B,q[0],.55*B,q[1],0x9a6a3e,ry);q=p(0,-.5);M.box(WD,3.2*B,.85*B,.2*B,q[0],.83*B,q[1],0x8a5a34,ry);for(const sx of[-1.35,1.35]){q=p(sx,0);M.box(ST,.3*B,.55*B,.95*B,q[0],0,q[1],0x7b7e8c,ry)}}
 function tree(x,z,s,keep){s=s||1;const ry=rnd()*PI,c=()=>pick(gcol),Y=4.2*s;M.box(WD,1.5*s,5.2*s,1.5*s,x,0,z,0x7a5230,ry,{j:.05});M.box(WD,2.1*s,.9*s,2.1*s,x,0,z,0x6b4528,ry);M.box(LF,6.4*s,3*s,6.4*s,x,Y,z,c(),ry,{j:.08,tile:3});M.box(LF,4.6*s,2.4*s,4.6*s,x,Y+2.8*s,z,c(),ry+.3,{j:.08,tile:3});M.box(LF,2.8*s,1.6*s,2.8*s,x,Y+5*s,z,c(),ry+.7,{j:.08,tile:3});
  for(const[dx,dz,dy]of[[2.9,1.2,-.4],[-2.6,-1.6,-.2],[.9,-3.1,-.5],[-1.4,2.8,-.6]])M.box(LF,3.2*s,2*s,3.2*s,x+dx*s,Y+dy*s,z+dz*s,c(),ry+dx,{j:.08,tile:3});if(!keep){obs(x,z,.95*s,40);fp('tree',x,z,3.4*s)}HOME.push([x,Y+1.5*s,z])}
 function bush(x,z,s){s=s||1;const ry=rnd()*PI;M.box(LF,2*s,1.2*s,2*s,x,0,z,pick(gcol),ry,{j:.1,tile:2});M.box(LF,1.4*s,.9*s,1.4*s,x+.3*s,1*s,z-.2*s,pick(gcol),ry+.5,{j:.1,tile:2});if(rnd()<.6){M.box(PL,.38,.3,.38,x+.5*s,1.55*s,z+.4*s,pick(FL),0,{j:.05});M.box(PL,.38,.3,.38,x-.6*s,1.1*s,z-.3*s,pick(FL),0,{j:.05})}}
 function bed(x,z,w,d,ry){M.box(PL,w,.3,d,x,0,z,0x6a4a30,ry,{j:.04});for(const q of[[0,-d/2,w+.3,.28],[0,d/2,w+.3,.28],[-w/2,0,.28,d],[w/2,0,.28,d]]){const p=rot(x,z,q[0],q[1],ry);M.box(WD,q[2],.5,q[3],p[0],0,p[1],0x9a6a3e,ry,{j:.05,tile:2})}
  for(let ix=-w/2+.5;ix<=w/2-.4;ix+=.78)for(let iz=-d/2+.5;iz<=d/2-.4;iz+=.78){if(rnd()<.18)continue;const p=rot(x,z,ix+(rnd()-.5)*.25,iz+(rnd()-.5)*.25,ry),h=.45+rnd()*.5;M.box(LF,.1,h,.1,p[0],.3,p[1],0x3f9a3a,0,{j:.1});M.box(PL,.42,.3,.42,p[0],.3+h,p[1],pick(FL),rnd()*PI,{j:.08})}HOME.push([x,1.4,z])}
 const vines=(x,y,z,n,sp)=>{for(let i=0;i<n;i++)M.box(LF,.5,.9+rnd()*1.4,.4,x+(i-n/2)*sp,y-(.5+rnd()),z,pick(gcol),0,{j:.1})};
 /* ---- fountain + magical plant monument ---- */
 M.cyl(ST,8,8,.25,0,0,0,0x9fb7d6,32,{j:.02});
 {const n=32,R=8.5;for(let k=0;k<n;k++){const a=k/n*TAU;M.box(ST,TAU*R/n*1.08,1.2,1.1,Math.cos(a)*R,0,Math.sin(a)*R,k%2?0xc0aab4:0xd0bac2,PI/2-a,{j:.04,tile:2.5});M.box(ST,TAU*R/n*1.12,.2,1.4,Math.cos(a)*R,1.2,Math.sin(a)*R,0xe4d4da,PI/2-a,{j:.03,tile:2})}}
 M.cyl(ST,4.3,5.2,1.5,0,.1,0,0xa6909a,14,{j:.04});M.cyl(GD,4,4,.15,0,1.6,0,0x6fcf55,14,{j:.03});
 for(let k=0;k<10;k++){const a=k/10*TAU;M.box(PL,.5,.35,.5,Math.cos(a)*3.2,1.74,Math.sin(a)*3.2,pick(FL),0,{j:.06})}
 obs(0,0,9.1,1.6);fp('fountain',0,0,9.6);
 for(let k=0;k<4;k++){const a=k*PI/2+PI/4;lamp(Math.cos(a)*10.4,Math.sin(a)*10.4)}
 for(let k=0;k<20;k++){const a=k/20*TAU,x=Math.cos(a)*9.1,z=Math.sin(a)*9.1;M.box(GL,.2,.2,.2,x,1.55,z,k%3?0xffe7a0:0xa0ffd0,0,{j:0});glow(x,1.7,z)}
 /* ---- tall wooden title arch behind the monument ---- */
 {const az=-27,hw=11;for(const sx of[-1,1]){const x=sx*hw;M.box(ST,3.4,1.2,3.4,x,0,az,0x9a838a);M.box(WD,2,15,2,x,1.2,az,0x7a4a2a,0,{tile:2});M.box(ST,2.8,.6,2.8,x,16.2,az,0x8d7a82);vines(x,15,az+1.2,5,.4);for(let i=0;i<4;i++)M.box(LF,1.8,1.4,1.8,x+(i%2?.9:-.9)*sx,1.2+i*1.1,az+(i<2?1.5:-1.5),pick(gcol),rnd()*PI,{j:.1});obs(x,az,1.6,18);glow(x,13,az+1.6);M.box(GL,.7,.9,.7,x,12.6,az+1.6,0xffd58a,0,{j:0})}
  const seg=16;for(let i=0;i<seg;i++){const t0=PI*i/seg,t1=PI*(i+1)/seg,tm=(t0+t1)/2,cx=-Math.cos(tm)*hw,cy=15+Math.sin(tm)*6.5,len=hw*2*Math.sin(PI/seg/2+.0)*1.0+1.2;
   M.box(WD,len*.62,1.3,1.5,cx,cy,az,0x7a4a2a,0,{rz:tm-PI/2,tile:2,j:.05})}
  for(let i=0;i<14;i++){const t=PI*(i+.5)/14;M.box(LF,1.5,1.3,1.5,-Math.cos(t)*hw,15+Math.sin(t)*6.5+.6,az+(i%2?.5:-.5),pick(gcol),rnd()*PI,{j:.1})}}
 /* ---- queue portals (physical pads: walk onto them to join) ---- */
 const QS={};
 for(const k in QT){const q=QT[k],ry=-(PI/2+q.a*DEG),[px,pz]=pol(q.a,21.5),[fx,fz]=pol(q.a,26.3);q.px=px;q.pz=pz;fp('pad'+k,px,pz,3.8);fp('portal'+k,fx,fz,5);
  M.cyl(ST,3.7,3.7,.09,px,0,pz,0xcbbec4,24,{j:.03});M.cyl(GL,3.5,3.5,.12,px,0,pz,q.col,24,{j:.12});M.cyl(PL,3.15,3.15,.14,px,0,pz,0x2a2a3a,24,{j:0});
  for(const s of SLOT[k]){const p=rot(px,pz,s[0],s[1],ry);M.cyl(GL,.8,.8,.17,p[0],0,p[1],q.col,14,{j:0});M.cyl(PL,.58,.58,.19,p[0],0,p[1],0x303046,14,{j:0})}
  M.at(fx,fz,ry);
  for(const sx of[-1,1]){M.box(ST,2,.9,2,sx*3.2,0,0,0x9a838a);M.box(ST,1.6,8,1.6,sx*3.2,.9,0,0xb59fa6,0,{tile:3});M.box(ST,2,.6,2,sx*3.2,8.9,0,0x8d7a82);vines(sx*3.2,8.8,.9,4,.4);M.box(LF,1.5,1.2,1.5,sx*3.7,.9,1.2,pick(gcol),rnd()*PI,{j:.1});M.box(GL,.6,.8,.6,sx*3.2,6.2,1.2,0xffd58a,0,{j:0})}
  M.box(ST,8.6,1.4,2,0,8.9,0,0xa58f96,0,{tile:3});M.box(WD,9.2,.5,2.4,0,10.3,0,0x6b4528,0,{tile:2});M.box(GL,5.2,.14,.14,0,8.7,1.05,q.col,0,{j:0});
  M.at();
  const wp=rot(fx,fz,-3.2,1.2,ry),wq=rot(fx,fz,3.2,1.2,ry);glow(wp[0],6.6,wp[1]);glow(wq[0],6.6,wq[1]);obs(rot(fx,fz,-3.2,0,ry)[0],rot(fx,fz,-3.2,0,ry)[1],1.3,10);obs(rot(fx,fz,3.2,0,ry)[0],rot(fx,fz,3.2,0,ry)[1],1.3,10);
  /* portal glow + count sign are real meshes (animated / repainted) */
  const pc=document.createElement('canvas');pc.width=pc.height=128;const x=pc.getContext('2d'),gr=x.createRadialGradient(64,64,6,64,64,64);gr.addColorStop(0,'rgba(255,255,255,.95)');gr.addColorStop(.45,'rgba(255,255,255,.55)');gr.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=gr;x.fillRect(0,0,128,128);const pt=new THREE.CanvasTexture(pc);st.disp.push(pt);
  const pm=new THREE.Mesh(new THREE.PlaneGeometry(5.4,7.4),new THREE.MeshBasicMaterial({map:pt,color:q.col,transparent:true,opacity:.85,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}));st.disp.push(pm.geometry,pm.material);pm.position.set(fx,3.9,fz);pm.rotation.y=ry;G.add(pm);
  const sg=sign(8,2.7,512,172);sg.m.position.set(...(()=>{const p=rot(fx,fz,0,1.25,ry);return[p[0],12.1,p[1]]})());sg.m.rotation.y=ry;G.add(sg.m);
  const pring=flat(new THREE.RingGeometry(3.2,3.9,40),new THREE.MeshBasicMaterial({map:tx.soft,color:q.col,transparent:true,opacity:.5,blending:THREE.AdditiveBlending,depthWrite:false}),px,.2,pz,-PI/2);
  QS[k]={q,pm,sg,pring,fx,fz,ry,mem:0,txt:''};
  const[pa,pb]=[rot(fx,fz,-2.4,.6,ry),rot(fx,fz,2.4,.6,ry)];HOME.push([pa[0],3,pa[1]],[pb[0],3,pb[1]],[px,2.2,pz])}
 /* ---- rear path ends under the arch; benches, lamps along the spokes ---- */
 for(const sp of SPOKES){if(sp.a===90||sp.a===270)continue;for(const sd of[-1,1]){const a=sp.a*DEG,off=sd*(sp.w/2+1),r=19.8,x=Math.cos(a)*r-Math.sin(a)*off,z=Math.sin(a)*r+Math.cos(a)*off;if(sp.a===QT.solo.a||sp.a===QT.duo.a||sp.a===QT.squad.a)continue;lamp(x,z)}}
 for(const sd of[-1,1]){lamp(sd*5.4,21);lamp(sd*5.4,26)}
 for(const a of[60,120,150,12,300,250,285]){const[x,z]=pol(a,20.5);bench(x,z,-(PI/2+a*DEG));fp('bench',x,z,2)}
 /* ---- TOWER SHOP (right side): wooden market stall with striped awning, crates, lanterns and four display pedestals ---- */
 const SH={a:322,r:24.5};{const[sx,sz]=pol(SH.a,SH.r),ry=-(PI/2+SH.a*DEG);SH.x=sx;SH.z=sz;SH.ry=ry;fp('shop',sx,sz,10.5);M.at(sx,sz,ry);
  M.box(WD,19,.14,9,0,0,0,0xb48350,0,{j:.04,tile:2.5});M.box(ST,19.6,.5,.4,0,0,4.6,0x8d7a82);
  M.box(WD,19,9.5,.8,0,.14,-4.2,0x6b4528,0,{j:.05,tile:2});for(let i=0;i<4;i++)M.box(WD,19,.3,1.2,0,2+i*2.1,-3.6,0x8a5a34,0,{tile:2});
  for(const sx2 of[-1,1]){M.box(WD,.9,10.5,.9,sx2*9.4,.14,4.0,0x6b4528,0,{tile:2});M.box(WD,.9,10.5,.9,sx2*9.4,.14,-4.2,0x6b4528,0,{tile:2});M.box(WD,.8,.8,8.8,sx2*9.4,10.3,0,0x6b4528)}
  M.box(WD,19.8,.9,.9,0,10.1,4.0,0x6b4528,0,{tile:2});M.box(WD,19.8,.9,1,0,10.3,-4.2,0x6b4528,0,{tile:2});
  for(let i=0;i<10;i++)M.box(PL,2,.35,9.2,-9+i*2,8.4,-.1,i%2?0xf4f1ea:0xd8352e,0,{rx:-.3,j:0});
  for(const x of[-6.5,-2.2,2.2,6.5]){M.box(GL,.7,.9,.7,x,7.4,3.7,0xffd58a,0,{j:0});glow(...(()=>{const p=rot(sx,sz,x,3.7,ry);return[p[0],7.9,p[1]]})())}
  for(const[cx,cz,cs]of[[-8,-2.2,1.6],[-8,-.4,1.2],[-6.4,-2.6,1.3],[8,-2.4,1.5],[8.2,-.6,1.2],[6.4,-2.8,1.1]])M.box(WD,cs*1.5,cs*1.2,cs*1.5,cx,.14,cz,0x9a6a3e,cz*.3,{j:.06,tile:2});
  for(const x of[-8.4,8.4]){M.cyl(PL,.55,.42,.7,x,.14,2.7,0xb5653e,8);M.box(LF,1.1,.8,1.1,x,.84,2.7,pick(gcol),0,{j:.1});M.box(PL,.35,.3,.35,x,1.64,2.7,pick(FL))}
  M.at();obs(...rot(sx,sz,-9.4,4,ry),1.1,12);obs(...rot(sx,sz,9.4,4,ry),1.1,12);obs(...rot(sx,sz,-9.4,-4.2,ry),1.1,12);obs(...rot(sx,sz,9.4,-4.2,ry),1.1,12);
  const ss=sign(15,3.6,640,154);ss.m.position.set(...(()=>{const p=rot(sx,sz,0,4.75,ry);return[p[0],11.9,p[1]]})());ss.m.rotation.y=ry;G.add(ss.m);
  ss.paint('shop',(x,w,h)=>{woodBg(x,w,h);x.fillStyle='#fff3c8';fit(x,'Tower Shop',92,w-60,FONT);x.textAlign='center';x.shadowColor='rgba(0,0,0,.5)';x.shadowBlur=8;x.fillText('Tower Shop',w/2,h/2+30)});
  /* pedestals are built from the registry - adding a tower there adds a pedestal (up to the stall's 4 spots; extras can use shop page 2) */
  st.ped=[];const spots=[-6.5,-2.2,2.2,6.5];
  SH.spots=spots.map(lx=>{const p=rot(sx,sz,lx,.6,ry);return{lx,x:p[0],z:p[1]}});
  for(const sp of SH.spots){M.cyl(ST,2.3,2.7,2.1,sp.x,0,sp.z,0xb7a2aa,14,{j:.04,tile:3});M.cyl(ST,2.7,2.7,.3,sp.x,2.1,sp.z,0xe4d4da,14,{j:.03})}}
 /* ---- leaderboard board (beside the shop) ---- */
 const LBD={a:358,r:28};{const[lx,lz]=pol(LBD.a,LBD.r),ry=-(PI/2+LBD.a*DEG);LBD.x=lx;LBD.z=lz;fp('board',lx,lz,5.5);M.at(lx,lz,ry);
  for(const sx2 of[-1,1]){M.box(ST,1.6,1,1.6,sx2*5.6,0,0,0x9a838a);M.box(WD,1.1,15.5,1.1,sx2*5.6,1,0,0x6b4528,0,{tile:2});M.box(GL,.6,.7,.6,sx2*5.6,15,1,0xffd58a,0,{j:0});glow(...(()=>{const p=rot(lx,lz,sx2*5.6,1,ry);return[p[0],15.4,p[1]]})());obs(...rot(lx,lz,sx2*5.6,0,ry),1.1,16)}
  M.box(WD,12.4,13.4,.8,0,2,-.2,0x6b4528,0,{tile:2});M.box(WD,12.8,.7,1.1,0,15.4,0,0x7a4a2a,0,{tile:2});for(let i=0;i<5;i++)M.box(LF,1.6,1.1,1.2,-5+i*2.5,15.9,0,pick(gcol),rnd()*PI,{j:.1});vines(5.5,16,.5,6,.4);M.at();
  const lg=sign(11.6,12.6,512,556);lg.m.position.set(...(()=>{const p=rot(lx,lz,0,.25,ry);return[p[0],8.6,p[1]]})());lg.m.rotation.y=ry;G.add(lg.m);st.lbSign=lg}
 /* ---- ponds + waterfalls at the rim ---- */
 const FALLS=[];function pondFall(a){const[px,pz]=pol(a,27.6),ry=PI/2-a*DEG;fp('pond',px,pz,3.4);for(let k=0;k<14;k++){const t=k/14*TAU;M.box(ST,1.5,.62,.8,px+Math.cos(t)*3,0,pz+Math.sin(t)*3,k%2?0xb09aa2:0xc0aab2,PI/2-t,{tile:2,j:.05})}
  for(let k=0;k<3;k++){const t=rnd()*TAU,r2=rnd()*1.6;M.cyl(LF,.5,.5,.06,px+Math.cos(t)*r2,.36,pz+Math.sin(t)*r2,0x58b94a,8,{j:.08})}M.cyl(PL,.22,.22,.1,px+.5,.38,pz-.3,0xff8fb8,6,{j:0});
  for(const sd of[-1,1]){const q=rot(Math.cos(a*DEG)*31.8,Math.sin(a*DEG)*31.8,0,sd*1.9,ry);M.box(ST,2.6,.9,.8,q[0],0,q[1],0xa8929a,ry,{tile:2})}
  const ch=new THREE.Mesh(new THREE.PlaneGeometry(2.4,5.6),waterMat(1,1.5,.92,0x78ccff));ch.rotation.order='YXZ';ch.rotation.x=-PI/2;ch.rotation.y=ry;ch.position.set(Math.cos(a*DEG)*30.8,.2,Math.sin(a*DEG)*30.8);G.add(ch);st.disp.push(ch.geometry,ch.material);
  const pw=new THREE.Mesh(new THREE.CircleGeometry(2.55,24),waterMat(1.2,1.2,.92,0x78ccff));pw.rotation.x=-PI/2;pw.position.set(px,.42,pz);G.add(pw);st.disp.push(pw.geometry,pw.material);FALLS.push({a,w:2.4})}
 pondFall(130);pondFall(50);pondFall(180);
 /* ---- small cottage on the left, trees, gardens (placed so nothing overlaps) ---- */
 {const[hx,hz]=pol(158,26),ry=-(PI/2+158*DEG);fp('cottage',hx,hz,5);M.at(hx,hz,ry);M.box(ST,6.4,.8,5,0,0,0,0x9a838a);M.box(BR,6,4,4.6,0,.8,0,0xb0674f,0,{tile:2});M.box(WD,1.8,3,.3,0,.8,2.4,0x6b4528);M.cyl(WD,0,5.2,2.8,0,4.8,0,0xa9553a,4,{ry:PI/4,tile:3});for(const sx2 of[-1,1]){M.box(GL,1,1.2,.2,sx2*1.9,2.1,2.35,0xffe08a,0,{j:0})}M.box(ST,1,2,1,2,5,-1,0x8d7a82);M.at();obs(hx,hz,3.4,6);glow(...(()=>{const p=rot(hx,hz,0,2.7,ry);return[p[0],2.6,p[1]]})())}
 for(const t of[[110,29.4,1.1],[150,29.6,1.2],[203,29.4,1.1],[225,29.6,1.2],[258,29.8,1.1],[285,29.6,1.1],[298,29.8,1],[338,29.6,1.05],[22,29.6,1.1],[75,29.6,1]]){const[x,z]=pol(t[0],t[1]);tree(x,z,t[2])}
 const SP2=SPOKES.concat([{a:130,w:3,r1:34},{a:50,w:3,r1:34},{a:180,w:3,r1:34}]);
 const free=(x,z,s)=>{const r=Math.hypot(x,z);if(r<19.6+s||r>29.7-s)return false;for(const f of FP)if(Math.hypot(f.x-x,f.z-z)<f.r+s+.25)return false;const a=((Math.atan2(z,x)/DEG)+360)%360;for(const sp of SP2){let d=Math.abs(a-sp.a);d=Math.min(d,360-d);if(d<90&&r*Math.sin(d*DEG)<sp.w/2+s+.5&&r<sp.r1+s)return false}return true};
 const fill=(n,s,fn)=>{let k=0;for(let t=0;t<1200&&k<n;t++){const a=rs()*TAU,r=19.5+rs()*10.5,x=Math.cos(a)*r,z=Math.sin(a)*r;if(!free(x,z,s))continue;k++;fn(x,z)}};
 fill(8,2.3,(x,z)=>{bed(x,z,3.4,2.2,PI/2-Math.atan2(z,x)+(rs()<.5?0:PI/2));fp('bed',x,z,2.3)});fill(6,2.3,(x,z)=>{tree(x,z,.62)});fill(24,1.1,(x,z)=>{bush(x,z,.8+rs()*.5);fp('bush',x,z,1.1)});
 return{M,tx,COL,OBS,FP,GLOW,HOME,QS,SH,LBD,FALLS,ST,WD,LF,PL,GL,GD,BR,gcol,FL,pick,rnd,glow,tree,bush}}

/* parts = [[kind,w,h,d,cx,cy,color]] describing ONE blade in its own frame; this builds 4 rotated copies + a hub as merged meshes inside group g */
function bladeMesh(g,mats,parts,seed){const mm=SBLobby.Merger(0,mulb(seed+3));for(let i=0;i<4;i++){const an=i*PI/2,c=Math.cos(an),sn=Math.sin(an);for(const p of parts){const x=p[4]*c-p[5]*sn,y=p[4]*sn+p[5]*c;mm.box(p[0],p[1],p[2],p[3],x,y-p[2]/2,0,p[6],0,{rz:an,j:.02,tile:2})}}
 mm.sph('wood',.9,0,0,.3,0x6b4528,{ws:8,hs:6,j:0});mm.finish(g,mats).forEach(q=>q.castShadow=false)}
/* merge a small multi-mesh model into ONE mesh (used for the shop display plants: they only spin, they don't animate parts) */
function bake(g){g.updateMatrixWorld(true);const P=[],N=[],C=[],v=new THREE.Vector3(),n=new THREE.Vector3(),nm=new THREE.Matrix3(),c=new THREE.Color();
 g.traverse(o=>{if(!o.isMesh)return;const geo=o.geometry.index?o.geometry.toNonIndexed():o.geometry,pa=geo.attributes.position,na=geo.attributes.normal,m=o.material;nm.getNormalMatrix(o.matrixWorld);c.set(1,1,1);if(m&&m.color)c.copy(m.color);if(m&&m.emissive)c.setRGB(Math.min(1,c.r+m.emissive.r*.9),Math.min(1,c.g+m.emissive.g*.9),Math.min(1,c.b+m.emissive.b*.9));
  for(let i=0;i<pa.count;i++){v.fromBufferAttribute(pa,i).applyMatrix4(o.matrixWorld);P.push(v.x,v.y,v.z);n.fromBufferAttribute(na,i).applyMatrix3(nm).normalize();N.push(n.x,n.y,n.z);C.push(c.r,c.g,c.b)}if(geo!==o.geometry)geo.dispose()});
 g.traverse(o=>{if(o.geometry)o.geometry.dispose()});const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(P,3));geo.setAttribute('normal',new THREE.Float32BufferAttribute(N,3));geo.setAttribute('color',new THREE.Float32BufferAttribute(C,3));
 const mat2=new THREE.MeshLambertMaterial({vertexColors:true}),mesh=new THREE.Mesh(geo,mat2);mesh.castShadow=true;const out=new THREE.Group();out.add(mesh);st.disp.push(geo,mat2);return out}
function finishLobby(B){
 const{M,tx,SH,LBD,QS,FALLS,GLOW,HOME,ST,WD,LF,PL,GL,GD,BR,gcol,FL,pick,rnd}=B,G=st.G,SEA=(-6-TL)/K,add=o=>{G.add(o);return o};
 const mats={stone:mat(0xffffff),wood:mat(0xffffff),brick:mat(0xffffff),ground:mat(0xffffff),leaf:mat(0xffffff),plain:mat(0xffffff)};
 const MK={stone:'stone',wood:'wood',brick:'brick',ground:'grass',leaf:'grass'};
 for(const k in mats){mats[k]=new THREE.MeshLambertMaterial({vertexColors:true,map:MK[k]?texOf(MK[k]):null})}mats.glow=new THREE.MeshBasicMaterial({vertexColors:true});Object.values(mats).forEach(m=>st.disp.push(m));
 const mk=(geo,m,x,y,z)=>{const o=new THREE.Mesh(geo,m);o.position.set(x,y,z);st.disp.push(geo,m);return o};
 /* fountain water + glow */
 const pw=add(mk(new THREE.CircleGeometry(8.05,40),new THREE.MeshBasicMaterial({map:(()=>{const t=tx.water.clone();t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(4,4);t.needsUpdate=true;st.waterT.push(t);st.disp.push(t);return t})(),color:0x5fc3ff,transparent:true,opacity:.9,depthWrite:false}),0,.95,0));pw.rotation.x=-PI/2;
 const pg=add(mk(new THREE.CircleGeometry(8,32),new THREE.MeshBasicMaterial({map:tx.soft,color:0x55e0ff,transparent:true,opacity:.3,blending:THREE.AdditiveBlending,depthWrite:false}),0,1,0));pg.rotation.x=-PI/2;
 /* ---- the magical plant monument (sways, glows, has orbiting light rings) ---- */
 const mon=add(new THREE.Group());mon.position.set(0,1.7,0);const top=new THREE.Group();top.position.set(0,10,0);mon.add(top);
 {const mM=SBLobby.Merger(0,mulb(7)),tM=SBLobby.Merger(0,mulb(8));mM.cyl(PL,.5,.9,10,0,0,0,0x3f9a3a,7,{j:.04});
  for(let i=0;i<7;i++){const th=i/7*TAU,al=-.5-(i%3)*.15,L=7+(i%3)*1.2,zc=L/2,yc=-zc*Math.sin(al),zz=zc*Math.cos(al),z2=6.9+(i%3);
   tM.box(PL,2.8-(i%2)*.7,.28,L,Math.sin(th)*zz,yc-.14,Math.cos(th)*zz,i%2?0x55c24a:0x3f9d3f,th,{rx:al,j:.04});tM.box(PL,1.4,.22,3.2,Math.sin(th)*z2,-.01,Math.cos(th)*z2,0x7fe070,th,{rx:-.9,j:.04})}
  for(let i=0;i<2;i++){const th=i*PI+.4,base=3+i*2.2,al=-1.0-i*.2,zc=3.2;mM.box(PL,3.6,.28,6.4,Math.sin(th)*zc*Math.cos(al),base-zc*Math.sin(al)-.14,Math.cos(th)*zc*Math.cos(al),0x62d052,th,{rx:al,j:.04})}
  mM.finish(mon,mats);tM.finish(top,mats)}
 const leaves=[];
 const core=mk(new THREE.SphereGeometry(1.5,12,9),new THREE.MeshBasicMaterial({color:0xb8ffb0}),0,1.2,0);top.add(core);
 const halo=new THREE.Sprite(new THREE.SpriteMaterial({map:tx.soft,color:0xa8ffc8,transparent:true,opacity:.6,blending:THREE.AdditiveBlending,depthWrite:false}));halo.scale.set(12,12,1);halo.position.set(0,10.5,0);mon.add(halo);st.disp.push(halo.material);
 const rings=[[5.2,0x6fffd0,.5,.35],[7,0xffe27a,.9,-.28],[8.6,0x8fd8ff,.2,.22]].map(r=>{const m=mk(new THREE.TorusGeometry(r[0],.14,6,60),new THREE.MeshBasicMaterial({color:r[1],transparent:true,opacity:.8,blending:THREE.AdditiveBlending,depthWrite:false}),0,10.5,0);m.rotation.x=PI/2+r[2];mon.add(m);return{m,sp:r[3],t:r[2]}});
 /* ---- waterfalls ---- */
 const fallT=[],fs=[];for(const f of FALLS){const a=f.a*DEG,h=.35-SEA-.2,x=Math.cos(a)*33.7,z=Math.sin(a)*33.7,t=tx.fall.clone();t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(1,Math.round(h/4));t.needsUpdate=true;st.disp.push(t);fallT.push(t);
  const m=add(mk(new THREE.PlaneGeometry(f.w,h),new THREE.MeshBasicMaterial({map:t,color:0xcfeaff,transparent:true,opacity:.88,side:THREE.DoubleSide,depthWrite:false}),x,.35-h/2,z));m.rotation.y=PI/2-a;
  const foam=add(mk(new THREE.CircleGeometry(3.4,20),new THREE.MeshBasicMaterial({map:tx.soft,color:0xffffff,transparent:true,opacity:.55,blending:THREE.AdditiveBlending,depthWrite:false}),Math.cos(a)*34.4,SEA+.12,Math.sin(a)*34.4));foam.rotation.x=-PI/2;f.foam=foam;
  for(let k=0;k<2;k++){const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:tx.soft,color:0xffffff,transparent:true,opacity:.22,blending:THREE.AdditiveBlending,depthWrite:false}));sp.position.set(Math.cos(a)*34.6,SEA+2.4+k*1.6,Math.sin(a)*34.6);sp.scale.set(8,8,1);add(sp);st.disp.push(sp.material);fs.push({sp,k,a:f.a})}}
 const bf=add(mk(new THREE.RingGeometry(24,29.5,48),new THREE.MeshBasicMaterial({map:tx.soft,color:0xffffff,transparent:true,opacity:.4,blending:THREE.AdditiveBlending,depthWrite:false}),0,SEA+.1,0));bf.rotation.x=-PI/2;
 /* ---- shop pedestals (built from the tower registry; call st.buildPedestals() again after registering more towers) ---- */
 const pedG=add(new THREE.Group());st.pick=[];
 st.buildPedestals=()=>{while(pedG.children.length){const c=pedG.children.pop();c.traverse(o=>{if(o.geometry)o.geometry.dispose()})}st.pick.length=0;st.ped=[];const L=SBTD.list();
  SH.spots.forEach((sp,i)=>{const t=L[i];const g=new THREE.Group();g.position.set(sp.x,0,sp.z);g.rotation.y=SH.ry;pedG.add(g);
   
   const ring=new THREE.Mesh(new THREE.RingGeometry(2.8,3.4,28),new THREE.MeshBasicMaterial({map:tx.soft,color:0x9fffa0,transparent:true,opacity:.0,blending:THREE.AdditiveBlending,depthWrite:false}));ring.rotation.x=-PI/2;ring.position.y=.12;g.add(ring);
   const lb=sign(4.6,1.5,320,104);lb.m.position.set(0,.7,3.3);lb.m.rotation.x=-.35;g.add(lb.m);const e={t,g,lb,ring,model:null,x:sp.x,z:sp.z};
   if(t){const mdl=bake(t.model?t.model():new THREE.Group());mdl.scale.setScalar(1.6/K);mdl.position.y=2.55;g.add(mdl);e.model=mdl;
    const pk=new THREE.Mesh(new THREE.BoxGeometry(5.6,8,5.6),new THREE.MeshBasicMaterial({visible:false}));pk.position.y=4;pk.userData.tid=t.id;g.add(pk);st.pick.push(pk)}
   st.ped.push(e)})};
 st.buildPedestals();
 /* ---- leaderboard sign ---- */
 st.rank=[];
 st.paintBoard=force=>{const rows=st.rank,key=force?Math.random():rows.map(r=>r.name+r.w+r.k).join('|')+(st.rankSrc||'');st.lbSign.paint(key,(x,w,h)=>{woodBg(x,w,h);x.textAlign='center';x.fillStyle='#ffd24a';x.font='bold 54px '+FONT;x.shadowColor='rgba(0,0,0,.6)';x.shadowBlur=8;x.fillText('\uD83D\uDC51 Top Players',w/2,70);x.shadowBlur=0;x.font='bold 22px '+FONT;x.fillStyle='#d8c0a0';x.fillText(st.rankSrc||'',w/2,100);
   x.textAlign='left';x.font='bold 24px '+FONT;x.fillStyle='#caa880';x.fillText('#  Player',34,140);x.textAlign='right';x.fillText('Wins',w-190,140);x.fillText('Defeated',w-34,140);
   if(!rows.length){x.textAlign='center';x.fillStyle='#e8d8c0';x.font='bold 30px '+FONT;x.fillText('No wins recorded yet',w/2,300);x.font='24px '+FONT;x.fillText('Win a match to appear here!',w/2,340)}
   rows.slice(0,8).forEach((r,i)=>{const y=190+i*44;x.fillStyle=r.me?'rgba(255,230,140,.2)':'rgba(0,0,0,.18)';rr(x,24,y-30,w-48,38,10);x.fill();x.textAlign='left';x.fillStyle=r.me?'#ffe27a':'#fff';x.font='bold 28px '+FONT;x.fillText((i+1)+'.  '+String(r.name).slice(0,12),34,y);x.textAlign='right';x.fillText(String(r.w),w-190,y);x.fillText(fmtN(r.k),w-34,y)})})};
 st.paintBoard(true);
 /* ---- decorative islets: windmill + water tower + rocks (static rock, animated blades) ---- */
 const islets=[];const mats2=mats;
 function islet(a,r,y,seed,kind){const X=Math.cos(a*DEG)*r,Z=Math.sin(a*DEG)*r,m={cyl:(k,rt,rb,h,x,yy,z,...q)=>M.cyl(k,rt,rb,h,X+x,y+yy,Z+z,...q),box:(k,w,h,d,x,yy,z,...q)=>M.box(k,w,h,d,X+x,y+yy,Z+z,...q)},ls=[[5.6,4.9,1.8,-1.8,0x9a8890],[4.9,3.8,1.8,-3.6,0x93754f],[3.8,2.3,1.8,-5.4,0x7a6048],[2.3,.7,1.6,-7,0x5f4d40]];
  for(const l of ls)m.cyl(ST,l[0],l[1],l[2],0,l[3],0,l[4],9,{j:.07,tile:3});m.cyl(GD,5.8,5.8,.4,0,-.4,0,0x7ad85c,10,{j:.05,tile:4});const lf=(x,y2,z,w,h,d)=>m.box(LF,w,h,d,x,y2,z,pick(gcol),rnd()*PI,{j:.1,tile:3});
  if(kind==='tree'){m.box(WD,1.2,4,1.2,0,0,0,0x7a5230);lf(0,3.2,0,5,2.4,5);lf(0,5.4,0,3.2,1.8,3.2)}
  if(kind==='wind'){m.cyl(ST,2.2,3.2,8,0,0,0,0xcdb68a,8,{j:.05,tile:3});m.cyl(WD,0,3.4,2.4,0,8,0,0xa9553a,8,{j:.04,tile:3});m.box(WD,1.4,2.4,.3,0,0,3.1,0x6b4528);m.box(WD,1.6,1.6,1.6,0,6,1.9,0xb48350);for(let i=0;i<5;i++)m.box(PL,.4,.3,.4,Math.cos(i*1.3)*3.8,0,Math.sin(i*1.3)*3.8,pick(FL));
   const bl=new THREE.Group();bl.position.set(X,y+8,Z+3.2);G.add(bl);bladeMesh(bl,mats,[['wood',.5,9.6,.3,0,4.4,0x7a4a2a],['plain',2.4,6.2,.2,1.35,5.7,0xf3ecd2],['wood',2.6,.3,.34,1.35,4.75,0x7a4a2a],['wood',2.6,.3,.34,1.35,2.75,0x7a4a2a]],seed);islets.push({blades:bl})}
  if(kind==='tank'){for(const[sx,sz]of[[-1.6,-1.6],[1.6,-1.6],[-1.6,1.6],[1.6,1.6]])m.box(WD,.5,6,.5,sx,0,sz,0x7a4a2a);m.cyl(WD,2.8,2.8,3.2,0,6,0,0x9a6a3e,10,{j:.04,tile:3});m.cyl(ST,0,3,1.6,0,9.2,0,0x6a7a90,10,{j:.04});m.box(WD,.2,6,.2,3,0,0,0x6b4528)}
  if(kind==='rock'){lf(-1,0,0,2.2,1.2,2.2);lf(1.4,0,.8,1.6,1,1.6);m.box(PL,.4,.3,.4,-1,1.3,0,pick(FL))}
  for(let k=0;k<5;k++){const aa=rnd()*TAU,r2=2+rnd()*2.4;m.box(PL,.34,.26,.34,Math.cos(aa)*r2,0,Math.sin(aa)*r2,pick(FL),0,{j:.05})}}
 islet(282,62,3,11,'wind');islet(238,60,2,12,'tank');islet(22,56,-1,13,'tree');islet(160,60,2,14,'rock');islet(100,66,4,15,'tree');islet(330,64,-2,16,'rock');
 B.meshes=M.finish(G,mats);
 const cm=SBLobby.Merger(0,mulb(99)),cg=new THREE.Group();for(let i=0;i<14;i++){const a=rnd()*TAU,r=80+rnd()*95,y=24+rnd()*46,cx=Math.cos(a)*r,cz=Math.sin(a)*r,n=4+Math.floor(rnd()*4);for(let k=0;k<n;k++)cm.box(PL,6+rnd()*8,2.4+rnd()*1.8,5+rnd()*5,cx+(k-n/2)*5+rnd()*2,y+(k%2)*1.1,cz+(rnd()-.5)*5,0xffffff,0,{j:.02})}
 st.mats=mats;const cMat=new THREE.MeshBasicMaterial({vertexColors:true,fog:false,transparent:true,opacity:.93});st.disp.push(cMat);cm.finish(cg,{plain:cMat}).forEach(q=>q.castShadow=false);G.add(cg);
 const sunDir=new THREE.Vector3(25,80,35).normalize();st.sun=[[0xfff2c0,70,.9],[0xffe6a0,170,.35]].map(q=>{const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:tx.soft,color:q[0],transparent:true,opacity:q[2],blending:THREE.AdditiveBlending,depthWrite:false,fog:false}));sp.position.set(sunDir.x*380,sunDir.y*380,sunDir.z*380);sp.scale.set(q[1],q[1],1);sp.renderOrder=-1;scene.add(sp);st.disp.push(sp.material);return sp});
 /* ---- particles (formula-driven: no per-particle state) ---- */
 const sys=[],ps=p=>{add(p);st.disp.push(p.geometry,p.material);sys.push(p);return p},PSf=SBLobby.PS;
 ps(PSf(70,1.1,tx.soft,0xb8ffc8,(i,t,o)=>{const ph=frac(i*.37+t*.12),a=i*2.4+t*.3,r=2+ph*8;o.x=Math.cos(a)*r;o.z=Math.sin(a)*r;o.y=2+ph*13+Math.sin(t+i)*.4;o.a=Math.sin(PI*ph)*.9}));
 ps(PSf(40,.9,tx.star,0xfff2c0,(i,t,o)=>{const ph=frac(t*.28+i*.137),a=i*2.4+t*.08,r=3+((i*37)%70)/10;o.x=Math.cos(a)*r;o.z=Math.sin(a)*r;o.y=3+((i*53)%120)/10+ph*1.6;o.a=Math.pow(Math.sin(PI*ph),2)}));
 ps(PSf(64,1.0,tx.soft,0x9fdcff,(i,t,o)=>{const j=i>>3,k=i&7,aj=j*TAU/8+.39,u=frac(t*.7+k/8+j*.11),rr=lerp(7.4,3.6,u);o.x=Math.cos(aj)*rr;o.z=Math.sin(aj)*rr;o.y=lerp(1.7,1.0,u)+3.2*4*u*(1-u);o.a=.35+.65*Math.sin(PI*u)}));
 ps(PSf(32,1.2,tx.soft,0xdff4ff,(i,t,o)=>{const j=i>>2,aj=j*TAU/8+.39,u=frac(t*1.5+i*.31),rr=3.6+(frac(i*.37)-.5)*1.4;o.x=Math.cos(aj)*rr;o.z=Math.sin(aj)*rr;o.y=1.0+.6*4*u*(1-u);o.a=.7*(1-u*.7)}));
 for(const k in QS){const q=QS[k],c=q.q.col;ps(PSf(26,1.1,tx.soft,c,(i,t,o)=>{const ph=frac(i*.31+t*.35),a=i*2.1;o.x=q.fx+Math.cos(q.ry)*(Math.cos(a)*2.4)+Math.sin(q.ry)*1.2;o.z=q.fz-Math.sin(q.ry)*(Math.cos(a)*2.4)+Math.cos(q.ry)*1.2;o.y=.5+ph*7.5;o.a=Math.sin(PI*ph)}));
  ps(PSf(18,1.0,tx.soft,c,(i,t,o)=>{const a=i/18*TAU+t*.8,r=3.3;o.x=q.q.px+Math.cos(a)*r;o.z=q.q.pz+Math.sin(a)*r;o.y=.5+Math.sin(t*2+i)*.35+((i%3)*.5);o.a=.6+.4*Math.sin(t*3+i)}))}
 ps(PSf(34,.7,tx.soft,0xd6ff72,(i,t,o)=>{const h=HOME[i%Math.max(1,HOME.length)]||[0,3,0];o.x=h[0]+Math.sin(t*.4+i)*1.8+Math.sin(t*.9+i*3)*.5;o.z=h[2]+Math.cos(t*.37+i*1.3)*1.8;o.y=h[1]+Math.sin(t*.7+i*2)*.8;o.a=Math.pow(.5+.5*Math.sin(t*1.7+i*5),3)}));
 ps(PSf(48,.55,tx.soft,0xfff1c0,(i,t,o)=>{const ph=frac(i*.377+t*.03);o.x=Math.cos(i*2.1)*(6+frac(i*.713)*22)+Math.sin(t*.1+i)*1.2;o.z=Math.sin(i*2.1)*(6+frac(i*.713)*22)+Math.cos(t*.12+i)*1.2;o.y=.8+ph*11;o.a=Math.sin(PI*ph)*.55}));
 ps(PSf(14,.7,tx.soft,0xffa8c8,(i,t,o)=>{const ph=frac(i*.213+t*.045);o.x=Math.cos(i*3.3)*(14+frac(i*.51)*13)+Math.sin(t*.5+i)*1.4;o.z=Math.sin(i*3.3)*(14+frac(i*.51)*13)+Math.cos(t*.4+i)*1.4;o.y=10-ph*9.2;o.a=Math.sin(PI*ph)*.8}));
 ps(PSf(Math.max(1,GLOW.length),6,tx.soft,0xffb85a,(i,t,o)=>{const g=GLOW[i]||[0,-50,0];o.x=g[0];o.y=g[1];o.z=g[2];o.a=.5+.08*Math.sin(t*3+i*1.9)},true,70));
 ps(PSf(Math.max(1,FALLS.length)*40,1.1,tx.soft,0xeaf7ff,(i,t,o)=>{const w=(i/40)|0,k=i%40,f=FALLS[w];if(!f){o.a=0;o.y=-50;return}const a=f.a*DEG,tg=[-Math.sin(a),Math.cos(a)],cx=Math.cos(a),cz=Math.sin(a);let rr=33.6,y,off=((k*7)%10/10-.5)*f.w*.9,al=.8;
  if(k<18){const u=frac(t*1.15+k*.137);y=.3-u*(.3-SEA-.3);rr=33.6+u*.25}else if(k<30){const u=frac(t*1.7+k*.19);y=SEA+.2+1.6*4*u*(1-u);rr=34.2+Math.sin(k)*1.1*u+u*.8;off*=1.5;al=.9*(1-u*.8)}else{const u=frac(t*.9+k*.21);rr=33.2+u*2.6;y=.35-u*u*10;al=.7*(1-u*.8)}
  o.x=cx*rr+tg[0]*off;o.z=cz*rr+tg[1]*off;o.y=y;o.a=al}));
 st.dyn={mon,leaves,rings,top,core,halo,pw,pg,fallT,fs,bf,islets,cg,sys,fxLv:[2,2,3,3,2,2,2,2,2,2,1,1,1,3,2]};
 /* effect levels: 0 = everything, 1 = no ambient specks / big glows, 2 = no particle fountains/portals, 3 = bare scenery. Picks a start level from the quality setting and adapts to the measured frame rate. */
 st.fx=(typeof ST!=='undefined'&&ST&&ST.q==='low')?1:0;st.fxBase=st.fx;
 st.applyFx=()=>{const D=st.dyn,f=st.fx;D.sys.forEach((p,i)=>{p.visible=f<(D.fxLv[i]||9)});D.halo.visible=f<1;D.fs.forEach(o=>{o.sp.visible=f<1});D.pg.visible=f<2;D.bf.visible=f<2;D.rings.forEach(r=>{r.m.visible=f<3});D.cg.visible=f<3;
  for(const k in st.B.QS)st.B.QS[k].pring.visible=f<2;for(const fl of st.B.FALLS)fl.foam.visible=f<2;if(st.mapPS)st.mapPS.forEach((p,i)=>{p.visible=f<([2,2,1][i]||9)})};
}
const fmtN=n=>n>=1e6?(n/1e6).toFixed(1)+'M':n>=1e4?(n/1e3).toFixed(1)+'K':String(n|0);

/* =====================================================================================
   MATCH MAP (windmill farm) - built in studs, ground at y=0, centred at z=MZ
   ===================================================================================== */
const PW=4.2;                                                /* half path width: 8.4 studs = about two avatars side by side */
const mx=px=>(px-860)*.14,mz=py=>MZ+(py-500)*.14;
const RA=[[225,262],[228,330],[228,440],[270,380],[315,345],[380,340],[1130,340],[1215,360],[1225,455],[1330,458],[1440,440],[1480,395]].map(p=>[mx(p[0]),mz(p[1])]);
const RB=[[225,262],[228,330],[228,440],[250,510],[330,520],[335,640],[340,730],[1500,735],[1580,690],[1580,560],[1540,480],[1495,420],[1480,395]].map(p=>[mx(p[0]),mz(p[1])]);
const ROUTES=[RA,RB].map(r=>{const c=[0];for(let i=1;i<r.length;i++)c.push(c[i-1]+Math.hypot(r[i][0]-r[i-1][0],r[i][1]-r[i-1][1]));return{p:r,c,len:c[c.length-1]}});
const posAt=(R,d)=>{d=Math.max(0,Math.min(R.len,d));let i=1;while(i<R.c.length-1&&R.c[i]<d)i++;const u=(d-R.c[i-1])/Math.max(.001,R.c[i]-R.c[i-1]);return[lerp(R.p[i-1][0],R.p[i][0],u),lerp(R.p[i-1][1],R.p[i][1],u)]};
const segDist=(x,z,a,b)=>{const dx=b[0]-a[0],dz=b[1]-a[1],t=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/(dx*dx+dz*dz||1)));return Math.hypot(x-(a[0]+dx*t),z-(a[1]+dz*t))};
const pathDist=(x,z)=>{let m=1e9;for(const R of ROUTES)for(let i=1;i<R.p.length;i++)m=Math.min(m,segDist(x,z,R.p[i-1],R.p[i]));return m};
const DECOR=[[1.4,MZ-46,9],[52,MZ-40,12],[mx(215),mz(255),11],[mx(1480),mz(380),12],[mx(100),mz(570),4],[mx(660),mz(620),4.5],[mx(1400),mz(630),4.5],[mx(740),mz(250),4],[mx(110),mz(780),5],[mx(1070),mz(790),4]];
const BND={x0:-104,x1:106,z0:MZ-46,z1:MZ+46};
const canPlace=(x,z)=>{if(x<BND.x0||x>BND.x1||z<BND.z0||z>BND.z1)return false;if(pathDist(x,z)<PW+3.6)return false;for(const d of DECOR)if(Math.hypot(x-d[0],z-d[1])<d[2])return false;for(const t of st.sim.towers)if(Math.hypot(x-t.x,z-t.z)<6.2)return false;return true};

function buildMap(){
 const rnd=mulb(777),M=SBLobby.Merger(0,rnd),pick=a=>a[Math.floor(rnd()*a.length)],gcol=[0x3f9d3f,0x4caf50,0x57b94a,0x3a9446,0x62c050],FL=[0xe8483c,0xffd23a,0xf5f5f0,0xff7fb5,0xa56bff,0xff9a2e,0x4fb7ff];
 const GM=new THREE.Group();scene.add(GM);st.GM=GM;
 /* floating island: grass top + stepped rock underneath */
 M.box('ground',224,3,108,0,-3,MZ,0x79d457,0,{tile:5,j:.03});
 const rk=[[218,102,0x9a8890],[206,92,0x93754f],[184,78,0x7a6048],[150,60,0x5f4d40]];rk.forEach((r,i)=>M.box('stone',r[0],4,r[1],0,-7-i*4,MZ,r[2],0,{j:.06,tile:5}));
 /* path: painted onto ONE ground texture (no overlapping boxes => no z-fighting), with cobbles and arrows that show which way enemies walk */
 {const CW=2048,CH=1024,sx=CW/224,sz=CH/108,wc=(x,z)=>[(x+112)*sx,(z-(MZ-54))*sz],cv=document.createElement('canvas');cv.width=CW;cv.height=CH;const c=cv.getContext('2d'),r2=mulb(4141);
  c.lineJoin='round';c.lineCap='round';const trace=R=>{c.beginPath();R.p.forEach((p,i)=>{const q=wc(p[0],p[1]);i?c.lineTo(q[0],q[1]):c.moveTo(q[0],q[1])});c.stroke()};
  c.strokeStyle='#9a6a40';c.lineWidth=(PW*2+1.5)*sx;ROUTES.forEach(trace);c.strokeStyle='#dba76a';c.lineWidth=PW*2*sx;ROUTES.forEach(trace);
  c.globalCompositeOperation='source-atop';for(let gy=0,row=0;gy<CH;gy+=20,row++)for(let gx=(row%2)*17-17;gx<CW;gx+=34){const v=r2();c.fillStyle=v<.5?'rgba(255,238,200,'+(.05+r2()*.1)+')':'rgba(110,70,30,'+(.05+r2()*.1)+')';c.beginPath();if(c.roundRect)c.roundRect(gx+1.5,gy+1.5,30,16,5);else c.rect(gx+1.5,gy+1.5,30,16);c.fill()}
  c.globalCompositeOperation='source-over';
  /* direction arrows every ~13 studs; the shared first stretch is drawn once, then each branch gets its own */
  const arrows=(R,from)=>{let d=from,tot=R.len;for(d=from+7;d<tot-9;d+=13){const a=posAt(R,d),b=posAt(R,d+1.2),q=wc(a[0],a[1]),ang=Math.atan2(b[1]-a[1],b[0]-a[0]);c.save();c.translate(q[0],q[1]);c.rotate(ang);c.lineWidth=1.05*sx;c.strokeStyle='rgba(120,70,30,.55)';c.beginPath();c.moveTo(-1.2*sx,-1.7*sx);c.lineTo(.9*sx,0);c.lineTo(-1.2*sx,1.7*sx);c.stroke();c.lineWidth=.62*sx;c.strokeStyle='rgba(255,246,214,.95)';c.stroke();c.restore()}};
  const shared=ROUTES[0].c[2];arrows(ROUTES[0],0);arrows(ROUTES[1],shared);
  const tex=new THREE.CanvasTexture(cv);tex.anisotropy=4;st.disp.push(tex);const pm=new THREE.Mesh(new THREE.PlaneGeometry(224,108),new THREE.MeshLambertMaterial({map:tex,transparent:true,depthWrite:false}));pm.rotation.x=-PI/2;pm.position.set(0,.04,MZ);pm.receiveShadow=true;GM.add(pm);st.disp.push(pm.geometry,pm.material)}
 const onPath=(x,z,m)=>pathDist(x,z)<PW+(m||2.4);
 /* scenery */
 const tree=(x,z,s)=>{s=s||1;const ry=rnd()*PI,c=()=>pick(gcol);M.box('wood',2*s,7*s,2*s,x,0,z,0x7a5230,ry);M.box('leaf',8*s,4*s,8*s,x,6*s,z,c(),ry,{j:.08,tile:4});M.box('leaf',5.6*s,3*s,5.6*s,x,9.6*s,z,c(),ry+.4,{j:.08,tile:4});for(const[dx,dz]of[[3.4,1.6],[-3,-2],[1,-3.6]])M.box('leaf',4*s,2.6*s,4*s,x+dx*s,5.4*s,z+dz*s,c(),ry+dx,{j:.08,tile:4})};
 const bush=(x,z,s)=>{M.box('leaf',3.2*s,2*s,3.2*s,x,0,z,pick(gcol),rnd()*PI,{j:.1,tile:3});M.box('leaf',2.2*s,1.5*s,2.2*s,x+.5*s,1.6*s,z,pick(gcol),rnd()*PI,{j:.1,tile:3})};
 const flowers=(x,z,n)=>{for(let i=0;i<n;i++){const fx=x+(rnd()-.5)*5,fz=z+(rnd()-.5)*5;if(onPath(fx,fz,1.5))continue;M.box('leaf',.14,.8,.14,fx,0,fz,0x3f9a3a,0,{j:.1});M.box('plain',.7,.5,.7,fx,.8,fz,pick(FL),rnd()*PI,{j:.08})}};
 const rock=(x,z,s)=>{M.box('stone',4.2*s,3.2*s,3.4*s,x,0,z,0x9a9ca6,rnd()*PI,{j:.08,tile:3});M.box('stone',2.6*s,2*s,2.4*s,x+1*s,2.6*s*.9,z,0xaeb0ba,rnd()*PI,{j:.08,tile:3})};
 for(let x=-104;x<=106;x+=8){for(const zz of[BND.z0-3.5,BND.z1+3.5]){if(rnd()<.7)bush(x+rnd()*3,zz+(rnd()-.5)*2,1+rnd()*.5);if(rnd()<.3)tree(x+rnd()*4,zz+(zz<MZ?-3:3),.85+rnd()*.4)}}
 for(let z=BND.z0;z<=BND.z1;z+=8)for(const xx of[BND.x0-4,BND.x1+4]){if(rnd()<.75)bush(xx+(rnd()-.5)*2,z+rnd()*3,1+rnd()*.5);if(rnd()<.35)tree(xx+(xx<0?-3:3),z+rnd()*3,.9)}
 for(let x=-100;x<=104;x+=6){M.box('wood',.7,3.2,.7,x,0,BND.z1+.5,0x6b4528,0,{j:.05});M.box('wood',6.1,.45,.35,x+3,1.0,BND.z1+.5,0x8a5a34,0,{tile:2});M.box('wood',6.1,.45,.35,x+3,2.2,BND.z1+.5,0x8a5a34,0,{tile:2})}
 for(let x=-60;x<=60;x+=6){if(Math.abs(x-1.4)<10)continue;M.box('wood',.7,3.2,.7,x,0,BND.z0-.5,0x6b4528,0,{j:.05});M.box('wood',6.1,.45,.35,x+3,1.0,BND.z0-.5,0x8a5a34,0,{tile:2});M.box('wood',6.1,.45,.35,x+3,2.2,BND.z0-.5,0x8a5a34,0,{tile:2})}
 for(const d of DECOR.slice(4))rock(d[0],d[1],d[2]/4.5);
 for(let i=0;i<46;i++){const x=lerp(-98,100,rnd()),z=lerp(BND.z0+2,BND.z1-2,rnd());if(onPath(x,z,3)||DECOR.some(d=>Math.hypot(x-d[0],z-d[1])<d[2]))continue;flowers(x,z,3+Math.floor(rnd()*4))}
 for(let i=0;i<14;i++){const x=lerp(-98,100,rnd()),z=lerp(BND.z0+3,BND.z1-3,rnd());if(onPath(x,z,4)||DECOR.some(d=>Math.hypot(x-d[0],z-d[1])<d[2]+3))continue;if(rnd()<.5)bush(x,z,1);else tree(x,z,.8)}
 /* windmill (blades animate) */
 const wx=1.4,wz=MZ-46;M.cyl('stone',5,7,18,wx,0,wz,0xd2b98a,8,{j:.05,tile:4});M.cyl('wood',0,7.6,6,wx,18,wz,0xa9553a,8,{j:.04,tile:3});M.box('wood',3.4,6,.5,wx,0,wz+6.4,0x6b4528);M.box('wood',4,3,3,wx,12,wz+5.2,0xb48350,0,{tile:2});M.box('stone',4.4,.6,4.4,wx,0,wz+7.2,0x9a9ca6);
 const bl=new THREE.Group();bl.position.set(wx,15,wz+7.4);GM.add(bl);bladeMesh(bl,st.mats,[['wood',1,22,.5,0,10,0x7a4a2a],['plain',5.4,14,.3,3.1,13,0xf3ecd2],['wood',5.8,.6,.6,3.1,13.3,0x7a4a2a],['wood',5.8,.6,.6,3.1,6.3,0x7a4a2a]],5);st.blades=bl;
 /* barn */
 const bx=52,bz=MZ-40;M.box('brick',18,10,12,bx,0,bz,0xb8342c,0,{tile:4});M.box('wood',7,8,.6,bx,0,bz+6.2,0xc9a46a,0,{tile:2});M.box('wood',.5,8.2,.7,bx,0,bz+6.3,0x6b4528);for(const sx of[-1,1]){M.box('plain',3,3,.4,bx+sx*6,4.4,bz+6.1,0xf5f0e6,0,{j:0});M.box('wood',18.6,.6,7.4,bx,10,bz+sx*3.2,0xa9553a,0,{rx:sx*.62,tile:3,j:.04})}
 M.box('wood',3,3,3,bx+13,0,bz+3,0x9a6a3e,.4,{tile:2});M.box('wood',3,3,3,bx+14,0,bz+6,0x9a6a3e,0,{tile:2});M.box('stone',1.6,5,1.6,bx+5,10,bz,0x8d7a82);
 /* cave (enemy start) and glowing portal (the goal you defend) */
 const cx=mx(215),cz=mz(255);M.box('stone',17,13,5,cx,0,cz-5,0x8a8c96,0,{tile:3});for(const sx of[-1,1])M.box('stone',4,12,5,cx+sx*6.5,0,cz-2.6,0x9a9ca6,0,{tile:3});M.box('stone',17,3.5,5,cx,9.5,cz-2.6,0xa6a8b2,0,{tile:3});M.box('plain',9,9,1,cx,0,cz-6,0x120c12,0,{j:0});
 const gx=mx(1480),gz=mz(380);for(const sx of[-1,1]){M.box('stone',4,13,5,gx+sx*6.5,0,gz-2,0x9a9ca6,0,{tile:3});M.box('wood',.7,16,.7,gx+sx*11,0,gz+3,0x6b4528);M.box('plain',3,6,.3,gx+sx*11+sx*1.7,8,gz+3,0xd8352e,0,{j:0});M.box('glow',1.4,1.4,.1,gx+sx*11+sx*1.7,10,gz+3.2,0xffd24a,0,{j:0})}M.box('stone',17,3.5,5,gx,10,gz-2,0xa6a8b2,0,{tile:3});
 st.goal={x:gx,z:gz+2,cx,cz};
 M.finish(GM,st.mats);
 const pm=new THREE.Mesh(new THREE.PlaneGeometry(9,10),new THREE.MeshBasicMaterial({map:st.tx.soft,color:0xff3a4a,transparent:true,opacity:.85,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}));pm.position.set(gx,5.4,gz+.3);GM.add(pm);st.goalM=pm;st.disp.push(pm.geometry,pm.material);
 const gp=SBLobby.PS(30,1.6,st.tx.soft,0xff6a6a,(i,t,o)=>{const ph=frac(i*.31+t*.4);o.x=gx+Math.cos(i*2.3)*3.4;o.z=gz+1+Math.sin(i*1.7)*1.2;o.y=.5+ph*10;o.a=Math.sin(PI*ph)});GM.add(gp);st.mapPS=[gp];st.disp.push(gp.geometry,gp.material);
 const cp=SBLobby.PS(22,1.4,st.tx.soft,0xb0a0ff,(i,t,o)=>{const ph=frac(i*.27+t*.25);o.x=cx+Math.cos(i*2.1)*3.2;o.z=cz-3.4;o.y=.5+ph*8;o.a=Math.sin(PI*ph)*.7});GM.add(cp);st.mapPS.push(cp);st.disp.push(cp.geometry,cp.material);
 const pol2=SBLobby.PS(60,.8,st.tx.soft,0xfff1c0,(i,t,o)=>{const ph=frac(i*.377+t*.03);o.x=Math.cos(i*2.1)*(10+frac(i*.713)*90)+Math.sin(t*.1+i);o.z=MZ+Math.sin(i*2.9)*(5+frac(i*.51)*42);o.y=.8+ph*9;o.a=Math.sin(PI*ph)*.55});GM.add(pol2);st.mapPS.push(pol2);st.disp.push(pol2.geometry,pol2.material);
 st.mapColl=[{x:wx,z:wz,hw:6.5,hd:6.5,top:30,bot:0},{x:bx,z:bz,hw:9.6,hd:6.4,top:12,bot:0},{x:cx,z:cz-4,hw:9,hd:3,top:14,bot:0},{x:gx,z:gz-2,hw:9,hd:3,top:14,bot:0}];
 /* the invisible tap-target for placing towers */
 st.ground=new THREE.Mesh(new THREE.PlaneGeometry(240,120),new THREE.MeshBasicMaterial({visible:false}));st.ground.rotation.x=-PI/2;st.ground.position.set(0,0,MZ);GM.add(st.ground);st.disp.push(st.ground.geometry,st.ground.material);
}

/* =====================================================================================
   MATCH SIMULATION (every client runs the same deterministic wave schedule; the host's lives/result are adopted by teammates)
   ===================================================================================== */
const PREP=12,WGAP=30,MAXLV=3,LIVES=20;
const tStat=(t)=>{const s=t.def.stats,l=t.lv-1;return{dmg:s.dmg*(1+.55*l),rate:s.rate*(1+.12*l),range:s.range*(1+.06*l)}};
const upCost=t=>Math.round(t.def.cost*(.75+.35*t.lv));
const sellVal=t=>Math.floor(t.spent*.6);
function hostId(){const ids=[myId];for(const[id,v]of PEERS){if(Date.now()-v.t<4000&&v.s&&v.s.g==='td'&&st.match&&v.s.mm===st.match.id)ids.push(id)}ids.sort();return ids[0]}
const teamSize=()=>{let n=1;for(const[id,v]of PEERS)if(Date.now()-v.t<4000&&v.s&&v.s.g==='td'&&st.match&&v.s.mm===st.match.id)n++;return n};
/* ---------- zombies: ONE instanced mesh per type and walk pose (2 poses = shuffling legs / swinging arms) + 2 instanced health bars.
   That is ~12 draw calls however many zombies are on screen. Models are original blocky "avatar-sized" zombies (a Shambler is 5.3 tall). ---------- */
function zGeo(type,pose){const D=SBTD.ENEMY[type],M=SBLobby.Merger(0,mulb(31+pose*7)),K='plain',sk=D.skin,sh=D.top,lg=D.legs,sw=pose?1:-1,big=type==='tank'||type==='boss',tw=big?2.9:2.1,aw=big?1.15:.85;
 const box=(w,h,d,x,y,z,c,rx)=>M.box(K,w,h,d,x,y-h/2,z,c,0,{rx:rx||0,j:.035});
 const limb=(x,hy,w,L,d,c,a)=>box(w,L,d,x,hy-(L/2)*Math.cos(a),-(L/2)*Math.sin(a),c,a);
 const eye=type==='boss'?0xffe14a:type==='runner'?0xffd02a:0xe8302a;
 limb(-.55,2.0,big?1.2:.95,2.0,big?1.2:.95,lg,.5*sw);limb(.55,2.0,big?1.2:.95,2.0,big?1.2:.95,lg,-.5*sw);
 box(big?1.35:1.05,.35,big?1.35:1.05,-.55,.18,.1,0x2a2a2a);box(big?1.35:1.05,.35,big?1.35:1.05,.55,.18,.1,0x2a2a2a);
 box(tw,2.0,1.15,0,3.0,0,sh);box(.7,.55,.2,-.5,2.3,.62,sk);box(.5,.45,.2,.6,3.5,.62,sk);box(.9,.3,.2,.3,2.15,.62,lg);
 limb(-(tw/2+aw/2),3.85,aw,1.9,aw,sk,-1.3+.2*sw);limb(tw/2+aw/2,3.85,aw,1.9,aw,sk,-1.3-.2*sw);
 box(aw+.12,.75,aw+.12,-(tw/2+aw/2),3.55,0,sh);box(aw+.12,.75,aw+.12,tw/2+aw/2,3.55,0,sh);
 box(1.35,1.35,1.35,0,4.7,.12,sk);box(.3,.28,.1,-.34,4.78,.82,eye);box(.3,.28,.1,.34,4.78,.82,eye);box(.74,.2,.1,0,4.28,.82,0x2a1010);for(const x of[-.22,.04,.28])box(.14,.17,.1,x,4.34,.86,0xf0ecd8);
 box(1.05,.25,1.0,-.1,5.5,.05,0x2a2218);box(.3,.9,.3,-.52,5.25,-.2,0x2a2218);
 if(type==='runner'){box(1.6,.7,1.0,0,5.25,-.3,sh);box(tw+.15,.5,.5,0,3.9,-.4,sh)}
 if(type==='tank'){for(const sx of[-1,1]){box(1.7,.5,1.7,sx*(tw/2+aw/2),4.15,0,0x8a8f9c);box(.34,.5,.34,sx*(tw/2+aw/2),4.55,0,0xb0b5c2);box(.28,.7,.28,sx*(tw/2+aw/2+.3),4.8,.3,0xb0b5c2)}box(2.5,1.5,.3,0,3.15,.7,0x7a8090);for(const x of[-.8,0,.8])box(.22,.22,.12,x,3.4,.88,0xc8ccd6);box(1.7,.35,1.7,0,5.55,.1,0x6a6f7e)}
 if(type==='boss'){box(2.6,3.2,.25,0,3.0,-.78,0x8a1f2f);for(let i=-2;i<=2;i++)box(.28,.7+(i%2?0:.35),.28,i*.3,5.65+(i%2?0:.15),.12,0xffd24a);box(1.7,.28,1.5,0,5.35,.12,0xe8b83a);for(const sx of[-1,1])box(1.5,.45,1.5,sx*(tw/2+aw/2),4.1,0,0xe8b83a)}
 const g=new THREE.Group();const meshes=M.finish(g,{plain:new THREE.MeshBasicMaterial()});const geo=meshes[0].geometry;return geo}
function initZombies(){const zm=st.zm={m:{},cap:90,mat:new THREE.MeshLambertMaterial({vertexColors:true}),dum:new THREE.Object3D(),col:new THREE.Color(),white:new THREE.Color(1,1,1),slow:new THREE.Color(.62,.82,1)};zm.dum.rotation.order='YXZ';st.disp.push(zm.mat);
 for(const type in SBTD.ENEMY){zm.m[type]=[0,1].map(p=>{const geo=zGeo(type,p),im=new THREE.InstancedMesh(geo,zm.mat,zm.cap);im.frustumCulled=false;im.castShadow=true;im.instanceColor=new THREE.InstancedBufferAttribute(new Float32Array(zm.cap*3).fill(1),3);im.instanceColor.setUsage(THREE.DynamicDrawUsage);im.instanceMatrix.setUsage(THREE.DynamicDrawUsage);im.count=0;scene.add(im);st.disp.push(geo,im);return im})}
 const bg=new THREE.PlaneGeometry(1,1),bm=new THREE.MeshBasicMaterial({depthWrite:false,transparent:true,opacity:.85,side:THREE.DoubleSide});zm.bg=new THREE.InstancedMesh(bg,bm,zm.cap);zm.fg=new THREE.InstancedMesh(bg,bm,zm.cap);
 for(const b of[zm.bg,zm.fg]){b.frustumCulled=false;b.instanceColor=new THREE.InstancedBufferAttribute(new Float32Array(zm.cap*3).fill(1),3);b.instanceColor.setUsage(THREE.DynamicDrawUsage);b.instanceMatrix.setUsage(THREE.DynamicDrawUsage);b.count=0;scene.add(b)}zm.bg.renderOrder=8;zm.fg.renderOrder=9;st.disp.push(bg,bm,zm.bg,zm.fg)}
function drawZombies(){const zm=st.zm,S=st.sim;if(!zm)return;const d=zm.dum;const n={};for(const t in zm.m){n[t]=[0,0]}let nb=0;const cx=camera.position.x,cz=camera.position.z;
 for(const e of S.en){if(e.dead)continue;const D=e.D,ph=(S.mt*D.spd*.55/Math.sqrt(D.sz)+e.ph*.37),pose=Math.floor(ph)&1,c=n[e.type];if(c[pose]>=zm.cap)continue;const sl=e.slowT>0,x=e.g.position.x,z=e.g.position.z;
  d.position.set(x,Math.abs(Math.sin(ph*PI))*.22*D.sz,z);d.rotation.set(e.type==='swarm'?.75:e.type==='runner'?.22:.08,e.g.rotation.y,0);d.scale.setScalar(D.sz);d.updateMatrix();
  const im=zm.m[e.type][pose];im.setMatrixAt(c[pose],d.matrix);im.setColorAt(c[pose],sl?zm.slow:zm.white);c[pose]++;
  if(nb<zm.cap&&(e.hp<e.max||e.type==='tank'||e.type==='boss')){const w=3.4*Math.pow(D.sz,.75),y=5.9*D.sz+1.3,yaw=Math.atan2(cx-x,cz-z),r=Math.max(0,e.hp/e.max);d.rotation.set(0,yaw,0);d.scale.set(w,.55,1);d.position.set(x,y,z);d.updateMatrix();zm.bg.setMatrixAt(nb,d.matrix);zm.col.setRGB(.08,.08,.08);zm.bg.setColorAt(nb,zm.col);
   const wf=Math.max(.02,w*r),off=-(w-wf)/2;d.scale.set(wf,.4,1);d.position.set(x+Math.cos(yaw)*off,y+.01,z-Math.sin(yaw)*off);d.updateMatrix();zm.fg.setMatrixAt(nb,d.matrix);zm.col.setHSL(.33*r,.8,.5);zm.fg.setColorAt(nb,zm.col);nb++}}
 for(const t in zm.m)for(let p=0;p<2;p++){const im=zm.m[t][p];im.count=n[t][p];im.instanceMatrix.needsUpdate=true;if(im.instanceColor)im.instanceColor.needsUpdate=true}
 for(const b of[zm.bg,zm.fg]){b.count=nb;b.instanceMatrix.needsUpdate=true;if(b.instanceColor)b.instanceColor.needsUpdate=true}}
function mkEnemy(type,wv,uid){const D=SBTD.ENEMY[type],R=ROUTES[uid%2],mult=(1+.14*(wv-1))*(1+.3*(teamSize()-1)),hp=Math.round(D.hp*mult),p0=posAt(R,0);
 return{uid,type,D,R,d:0,hp,max:hp,g:{position:{x:p0[0],y:0,z:p0[1]},rotation:{y:0}},slowT:0,slowF:1,dead:false,ph:(uid*.7)%6.28,wv}}
function addTower(def,x,z,owner,uid,lv,mine){const g=def.model();g.position.set(x,0,z);scene.add(g);const pk=new THREE.Mesh(new THREE.BoxGeometry(6,8,6),new THREE.MeshBasicMaterial({visible:false}));pk.position.set(x,4,z);scene.add(pk);
 const t={uid,def,x,z,lv:lv||1,owner,mine,g,pk,head:g.userData.head||null,mz:g.userData.muzzle||{x:0,y:4,z:2},cd:.3+Math.random()*.4,spent:def.cost,bite:0};pk.userData.tw=t;g.scale.setScalar(1+.08*(t.lv-1));st.sim.towers.push(t);return t}
function rmTower(t){scene.remove(t.g,t.pk);t.g.traverse(o=>{if(o.geometry)o.geometry.dispose()});t.pk.geometry.dispose();const i=st.sim.towers.indexOf(t);if(i>=0)st.sim.towers.splice(i,1);if(st.sim.sel===t)st.sim.sel=null}
function hitEnemy(e,amt,t){if(e.dead)return;e.hp-=amt;if(e.hp<=0){e.dead=true;fxBurst(e.g.position.x,2.4*e.D.sz,e.g.position.z,e.D.skin);const S=st.sim;if(t&&t.mine){S.cash+=Math.round(e.D.rw*(1+.03*e.wv));S.kills++;SBTD.addKills(1);if(!S.kt||performance.now()-S.kt>120){S.kt=performance.now();snd(520+Math.random()*120,.06,'triangle',.05,300)}}}}
function leak(e){e.dead=true;const S=st.sim,dm=e.type==='boss'?12:e.type==='tank'?3:1;if(hostId()===myId)S.lives=Math.max(0,S.lives-dm);S.flash=.5;snd(180,.2,'sawtooth',.08,90)}
function shoot(t,e,k){const P=st.proj.find(p=>!p.on)||(()=>{const m=new THREE.Mesh(st.sm.pg,st.sm.pm1);scene.add(m);const p={m,on:false};st.proj.push(p);return p})();
 const mp=t.head?new THREE.Vector3(t.mz.x,t.mz.y,t.mz.z).applyEuler(new THREE.Euler(0,t.head.rotation.y,0)).add(new THREE.Vector3(t.x,0,t.z)):new THREE.Vector3(t.x,4,t.z);
 P.on=true;P.e=e;P.dmg=k.dmg;P.sp=t.def.stats.speed||70;P.t=t;P.m.material=t.def.stats.type==='thorn'?st.sm.pm2:st.sm.pm1;P.m.scale.setScalar(t.def.stats.type==='thorn'?1.6:1);P.m.position.copy(mp);P.m.visible=true;P.lx=e.g.position.x;P.lz=e.g.position.z}
function towerTick(t,dt){const S=st.sim,k=tStat(t),st2=t.def.stats;t.cd-=dt;let best=null,bd=-1;const px=t.x,pz=t.z,r2=k.range*k.range;
 for(const e of S.en){if(e.dead)continue;const dx=e.g.position.x-px,dz=e.g.position.z-pz;if(dx*dx+dz*dz<=r2&&e.d>bd){bd=e.d;best=e}}
 if(best&&t.head&&st2.type!=='frost'){const tgt=Math.atan2(best.g.position.x-px,best.g.position.z-pz);let d=tgt-t.head.rotation.y;d=Math.atan2(Math.sin(d),Math.cos(d));t.head.rotation.y+=d*Math.min(1,dt*10)}
 if(t.bite>0){t.bite-=dt*4;if(t.head)t.head.scale.setScalar(1+Math.max(0,t.bite)*.22)}
 if(t.cd>0||!best)return;t.cd=1/k.rate;
 if(st2.type==='shooter'||st2.type==='thorn'){shoot(t,best,k);if(!S.sw||performance.now()-S.sw>90){S.sw=performance.now();snd(st2.type==='thorn'?300:720,.05,'square',.03,240)}}
 else if(st2.type==='chomper'){const b=st2.bonus&&st2.bonus[best.type]||1;hitEnemy(best,k.dmg*b,t);t.bite=1;fxBurst(best.g.position.x,2.2,best.g.position.z,0xc060ff)}
 else if(st2.type==='frost'){for(const e of S.en){if(e.dead)continue;const dx=e.g.position.x-px,dz=e.g.position.z-pz;if(dx*dx+dz*dz<=r2){e.slowT=st2.slowTime||2;e.slowF=1-(st2.slow||.4);hitEnemy(e,k.dmg,t)}}fxBurst(px,1.5,pz,0x8fd8ff);t.bite=1}}
function matchStep(dt){const S=st.sim;S.mt+=dt;
 /* spawn */
 while(S.ei<S.ev.length&&S.ev[S.ei].t<=S.mt){const v=S.ev[S.ei++];S.en.push(mkEnemy(v.type,v.n,v.uid));if(v.first){S.wave=v.n;S.cash+=40+6*v.n;S.waveT=2.5;toastBan('Wave '+v.n+(v.n===SBTD.WAVES?' - BOSS!':''),2200)}}
 /* enemies */
 for(const e of S.en){if(e.dead)continue;e.slowT-=dt;const sp=e.D.spd*(e.slowT>0?e.slowF:1);e.d+=sp*dt;if(e.d>=e.R.len){leak(e);continue}const p=posAt(e.R,e.d),q=posAt(e.R,e.d+1.5);e.g.position.x=p[0];e.g.position.z=p[1];e.g.rotation.y=Math.atan2(q[0]-p[0],q[1]-p[1])}
 S.en=S.en.filter(e=>!e.dead);drawZombies();
 for(const t of S.towers)towerTick(t,dt);
 /* projectiles */
 for(const p of st.proj){if(!p.on)continue;const e=p.e;let tx=p.lx,tz=p.lz,ty=3;if(e&&!e.dead){tx=e.g.position.x;tz=e.g.position.z;p.lx=tx;p.lz=tz}const dx=tx-p.m.position.x,dy=ty-p.m.position.y,dz=tz-p.m.position.z,d=Math.hypot(dx,dy,dz),stp=p.sp*dt;
  if(d<=stp+.8){p.on=false;p.m.visible=false;if(e&&!e.dead)hitEnemy(e,p.dmg,p.t)}else{p.m.position.x+=dx/d*stp;p.m.position.y+=dy/d*stp;p.m.position.z+=dz/d*stp}}
 /* win / lose (host decides; teammates adopt) */
 if(S.state===0){const host=hostId()===myId;
  if(!host){let hv=null;for(const[id,v]of PEERS)if(id===hostId()&&v.s&&v.s.mm===st.match.id)hv=v.s;if(hv){if(typeof hv.ml==='number')S.lives=hv.ml;if(hv.ms===1||hv.ms===2)finish(hv.ms===1)}}
  else{if(S.lives<=0)finish(false);else if(S.ei>=S.ev.length&&!S.en.length)finish(true)}}}
function finish(won){const S=st.sim;if(S.state)return;S.state=won?1:2;S.endAt=performance.now()+7500;const n=teamSize(),pet=won?60+15*(n-1):Math.min(25,Math.floor(S.wave*3));
 SBTD.endMatch(won);if(pet)SBTD.addPetals(pet);
 toastBan(won?'\uD83C\uDF89 VICTORY! +'+pet+' Petals \uD83C\uDF38':'\uD83E\uDDDF Overrun on wave '+S.wave+(pet?' (+'+pet+' Petals)':''),7000);snd(won?880:160,.5,won?'sine':'sawtooth',.12,won?1320:80)}
function syncTeam(){const S=st.sim,seen=new Set();for(const[id,v]of PEERS){if(Date.now()-v.t>4000||!v.s||v.s.g!=='td'||v.s.mm!==st.match.id||!Array.isArray(v.s.tw))continue;
  for(const a of v.s.tw){if(!Array.isArray(a))continue;const uid=String(a[0]);seen.add(uid);let t=S.towers.find(q=>q.uid===uid);const def=SBTD.get(a[3]);if(!def)continue;
   if(!t){const x=num(a[1]),z=num(a[2]);if(Math.abs(x)<130&&Math.abs(z-MZ)<70)addTower(def,x,z,id,uid,Math.max(1,Math.min(MAXLV,num(a[4])|0)),false)}
   else if(!t.mine&&t.lv!==a[4]){t.lv=Math.max(1,Math.min(MAXLV,num(a[4])|0));t.g.scale.setScalar(1+.08*(t.lv-1))}}}
 for(const t of S.towers.slice())if(!t.mine&&!seen.has(t.uid))rmTower(t)}

/* =====================================================================================
   UI (DOM overlay inside the game modal)
   ===================================================================================== */
const CSS=`#tdui{position:absolute;inset:0;pointer-events:none;font-family:system-ui,sans-serif;color:#fff;z-index:7}
#tdui .b{pointer-events:auto;cursor:pointer;border:0;border-radius:12px;padding:8px 14px;font-weight:800;font-size:14px;color:#fff;background:linear-gradient(#3fbf5a,#2a9a44);box-shadow:0 3px 0 #1c6e30,0 6px 14px rgba(0,0,0,.35)}
#tdui .b:active{transform:translateY(2px)}#tdui .b.o{background:linear-gradient(#ffb43a,#e08a10);box-shadow:0 3px 0 #9a5a08,0 6px 14px rgba(0,0,0,.35)}#tdui .b.r{background:linear-gradient(#ee5a4a,#c23a2c);box-shadow:0 3px 0 #7a2018,0 6px 14px rgba(0,0,0,.35)}#tdui .b.g{background:#555d6a;box-shadow:0 3px 0 #333840;cursor:default}
#tdui .box{position:absolute;background:rgba(18,26,20,.78);border:2px solid rgba(255,255,255,.18);border-radius:14px;padding:8px 14px;font-weight:800}
#tdPanel{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);pointer-events:auto;background:linear-gradient(#3b2a1c,#2a1d14);border:4px solid #7a4a2a;border-radius:20px;padding:16px;width:min(640px,94vw);max-height:90%;overflow:auto;box-shadow:0 20px 60px rgba(0,0,0,.55);display:none}
#tdPanel h2{margin:0 0 4px;font-size:22px;color:#ffe9b8}#tdPanel .row{display:flex;gap:14px;flex-wrap:wrap}#tdPanel canvas{width:200px;height:200px;border-radius:14px;background:radial-gradient(#8fd0ff,#4a90d0)}
.tdst{margin:6px 0}.tdst i{display:block;height:9px;border-radius:5px;background:#1a120c;overflow:hidden}.tdst i b{display:block;height:100%;background:linear-gradient(90deg,#7ee060,#e8f060)}
.tdchip{display:inline-block;padding:2px 9px;border-radius:99px;font-size:12px;font-weight:800;margin-right:5px}
.tdgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:10px}.tdcard{background:#4a3524;border:2px solid #7a5a3a;border-radius:14px;padding:10px;cursor:pointer}.tdcard:hover{border-color:#ffd24a}`;
const chip=(t,c)=>`<span class="tdchip" style="background:${c}">${t}</span>`;
function mkUI(){if(!$('tdcss')){const s=document.createElement('style');s.id='tdcss';s.textContent=CSS;document.head.appendChild(s)}
 const r=document.createElement('div');r.id='tdui';r.innerHTML=`<div id="tdTop" class="box" style="top:58px;left:50%;transform:translateX(-50%);display:none;white-space:nowrap;font-size:15px"></div>
 <div id="tdBan" style="position:absolute;top:22%;left:50%;transform:translateX(-50%);font-size:34px;font-weight:900;text-shadow:0 3px 0 #000,0 0 18px #000;opacity:0;transition:opacity .3s;text-align:center;white-space:nowrap"></div>
 <div id="tdPrompt" class="box" style="bottom:128px;left:50%;transform:translateX(-50%);display:none;font-size:15px"></div>
 <div id="tdBal" class="box" style="left:10px;top:64px;font-size:15px"></div>
 <div id="tdQ" class="box" style="top:104px;left:50%;transform:translateX(-50%);display:none;font-size:15px;text-align:center"></div>
 <div id="tdBar" style="position:absolute;bottom:62px;left:50%;transform:translateX(-50%);display:none;gap:8px"></div>
 <div id="tdSel" class="box" style="right:10px;bottom:150px;display:none;min-width:190px"></div>
 <div style="position:absolute;left:10px;bottom:150px;display:flex;flex-direction:column;gap:8px"><button class="b" data-act="inv">\uD83C\uDF31 My Towers</button><button class="b r" id="tdLeave" data-act="leave" style="display:none">Leave match</button></div>
 <div id="tdPanel"></div>`;
 modal.appendChild(r);st.ui=r;r.onclick=e=>{const b=e.target.closest('[data-act]');if(b)act(b.dataset.act,b.dataset.id)}}
const setTxt=(el,h)=>{if(el&&el._h!==h){el._h=h;el.innerHTML=h}};
function toastBan(m,ms){const b=$('tdBan');if(!b)return;b.textContent=m;b.style.opacity=1;clearTimeout(b._t);b._t=setTimeout(()=>{b.style.opacity=0},ms||2000)}
const money=()=>SBTD.bal();
function closePv(){if(st.pv){try{st.pv.r.dispose();st.pv.r.forceContextLoss&&st.pv.r.forceContextLoss();st.pv.mdl.traverse(o=>{if(o.geometry)o.geometry.dispose()})}catch(e){}st.pv=null}}
function closePanel(){closePv();const p=$('tdPanel');if(p){p.style.display='none';p.innerHTML=''}st.panel=null}
function bar(v,max,label){return`<div class="tdst"><div style="display:flex;justify-content:space-between;font-size:13px;font-weight:700"><span>${label[0]}</span><span>${label[1]}</span></div><i><b style="width:${Math.min(100,v/max*100)}%"></b></i></div>`}
function openInfo(id,msg){const t=SBTD.get(id);if(!t)return;closePv();st.panel={k:'info',id};const own=SBTD.owned(id),eq=SBTD.equipped().includes(id),lk=SBTD.lockInfo(id),s=t.stats,p=$('tdPanel');
 const bt=!own?(lk?`<button class="b g">\uD83D\uDD12 ${lk}</button>`:`<button class="b o" data-act="buy" data-id="${id}">Purchase \u00b7 ${t.price} Petals</button>`):eq?`<button class="b r" data-act="unequip" data-id="${id}">Unequip</button>`:`<button class="b" data-act="equip" data-id="${id}">Equip</button>`;
 p.innerHTML=`<div class="row"><div><canvas id="tdPv" width="400" height="400"></canvas><div style="text-align:center;font-size:12px;opacity:.7;margin-top:4px">Preview (temporary model)</div></div>
 <div style="flex:1;min-width:230px"><h2>${t.name}</h2><div style="margin-bottom:6px">${own?chip('Owned','#2f9a48'):chip(t.price?t.price+' Petals':'Free','#c8861c')}${eq?chip('Equipped','#3a7ad0'):''}${lk&&!own?chip('Locked','#8a3a3a'):''}${chip('Match cost \u2600'+t.cost,'#555d6a')}</div>
 ${bar(s.dmg,100,['Damage',s.dmg])}${bar(s.rate,2.5,['Attack speed',s.rate+' / sec'])}${bar(s.range,70,['Range',s.range+' studs'])}
 <p style="font-size:14px;line-height:1.4;color:#e8d8c0;margin:8px 0">${t.desc}</p><div style="font-size:13px;opacity:.8;margin-bottom:8px">You have \uD83C\uDF38 ${money()} Petals</div>
 <div style="display:flex;gap:8px;flex-wrap:wrap">${bt}<button class="b g" data-act="close" style="cursor:pointer">Close</button></div><div id="tdMsg" style="margin-top:8px;font-weight:700;color:#ffd24a;min-height:20px">${msg||''}</div></div></div>`;
 p.style.display='block';
 try{const cv=$('tdPv'),r=new THREE.WebGLRenderer({canvas:cv,alpha:true,antialias:true});r.setSize(400,400,false);const sc=new THREE.Scene();sc.add(new THREE.HemisphereLight(0xffffff,0x9a9a8a,.95));const dl=new THREE.DirectionalLight(0xffffff,.8);dl.position.set(4,8,6);sc.add(dl);const m=t.model?t.model():new THREE.Group();sc.add(m);const cam=new THREE.PerspectiveCamera(38,1,.1,100);cam.position.set(0,5.5,14);cam.lookAt(0,3.2,0);st.pv={r,sc,cam,mdl:m}}catch(e){st.pv=null}}
function openInv(){closePv();st.panel={k:'inv'};const p=$('tdPanel'),L=SBTD.list(),eq=SBTD.equipped();
 p.innerHTML=`<h2>\uD83C\uDF31 My Towers</h2><div style="font-size:13px;opacity:.8;margin-bottom:8px">Equipped ${eq.length}/${SBTD.MAXEQ} \u00b7 \uD83C\uDF38 ${money()} Petals \u00b7 ${SBTD.stats().w} wins</div>
 <div class="tdgrid">${L.map(t=>{const own=SBTD.owned(t.id),isq=eq.includes(t.id),lk=SBTD.lockInfo(t.id);return`<div class="tdcard" data-act="info" data-id="${t.id}"><b>${t.name}</b><div style="margin:5px 0">${own?chip('Owned','#2f9a48'):lk?chip('\uD83D\uDD12 Locked','#8a3a3a'):chip(t.price+' Petals','#c8861c')}${isq?chip('Equipped','#3a7ad0'):''}</div><div style="font-size:12px;opacity:.85">Dmg ${t.stats.dmg} \u00b7 ${t.stats.rate}/s \u00b7 Range ${t.stats.range}</div></div>`}).join('')}</div>
 <div style="margin-top:12px"><button class="b g" data-act="close" style="cursor:pointer">Close</button></div>`;p.style.display='block'}
function act(a,id){if(a==='close')closePanel();else if(a==='inv')openInv();else if(a==='info')openInfo(id);
 else if(a==='buy'||a==='equip'||a==='unequip'){const r=a==='buy'?SBTD.buy(id):a==='equip'?SBTD.equip(id):SBTD.unequip(id);if(a==='buy'&&r.ok){const e=SBTD.equip(id)}snd(r.ok?660:200,.1,'sine',.1,r.ok?990:120);openInfo(id,r.msg);st.pedKey='';buildBar()}
 else if(a==='sel'){const S=st.sim;if(S&&st.mode==='match'){S.placeId=S.placeId===id?null:id;S.sel=null;setGhost();buildBar();selPanel()}}
 else if(a==='up')upgrade();else if(a==='sell')sell();else if(a==='leave'){if(st.mode==='match')toLobbyFromMatch(true)}}
function buildBar(){const el=$('tdBar');if(!el)return;const S=st.sim,on=st.mode==='match'&&S;el.style.display=on?'flex':'none';if(!on)return;
 setTxt(el,SBTD.equipped().map(id=>{const t=SBTD.get(id),sel=S.placeId===id,can=S.cash>=t.cost;return`<button class="b ${sel?'o':''}" data-act="sel" data-id="${id}" style="opacity:${can?1:.55};min-width:120px;line-height:1.15">${t.name.replace('Placeholder ','P.')}<br><small>\u2600${t.cost}</small></button>`}).join('')||'<div class="box" style="position:static">No towers equipped - open My Towers</div>')}
function selPanel(){const el=$('tdSel');if(!el)return;const S=st.sim,t=S&&S.sel;if(!t||st.mode!=='match'){el.style.display='none';return}el.style.display='block';const k=tStat(t),mx2=t.lv>=MAXLV;
 setTxt(el,`<div style="font-size:16px">${t.def.name.replace('Placeholder ','P.')} <span style="color:#ffd24a">Lv ${t.lv}</span></div><div style="font-size:13px;opacity:.85;margin:4px 0">Dmg ${k.dmg.toFixed(0)} \u00b7 ${k.rate.toFixed(2)}/s \u00b7 Range ${k.range.toFixed(0)}</div>${t.mine?`<div style="display:flex;gap:6px;margin-top:6px">${mx2?'<button class="b g">Max level</button>':`<button class="b" data-act="up" style="opacity:${S.cash>=upCost(t)?1:.55}">Upgrade \u2600${upCost(t)} (F)</button>`}<button class="b r" data-act="sell">Sell +\u2600${sellVal(t)}</button></div>`:`<div style="opacity:.7;font-size:12px">Teammate's tower</div>`}`)}
function upgrade(){const S=st.sim,t=S&&S.sel;if(!t||!t.mine||t.lv>=MAXLV)return;const c=upCost(t);if(S.cash<c){toastBan('Not enough cash',900);return}S.cash-=c;t.spent+=c;t.lv++;t.g.scale.setScalar(1+.08*(t.lv-1));snd(700,.15,'sine',.1,1100);fxBurst(t.x,5,t.z,0xffe27a);showRange(t);selPanel();buildBar()}
function sell(){const S=st.sim,t=S&&S.sel;if(!t||!t.mine)return;S.cash+=sellVal(t);rmTower(t);snd(300,.12,'triangle',.1,200);S.sel=null;st.rangeM.visible=false;selPanel();buildBar()}
function showRange(t,ok){const m=st.rangeM;if(!t){m.visible=false;return}m.visible=true;const r=t.range||tStat(t).range;m.scale.setScalar(r);m.position.set(t.x,.35,t.z);m.material.color.setHex(ok===false?0xff4a4a:0x6fff8a)}
function setGhost(){const S=st.sim;if(st.ghost){scene.remove(st.ghost);st.ghost.traverse(o=>{if(o.geometry)o.geometry.dispose()});st.ghost=null}if(!S||!S.placeId){st.rangeM.visible=false;return}
 const def=SBTD.get(S.placeId);if(!def)return;const g=def.model();g.traverse(o=>{if(o.material){o.material=o.material.clone();o.material.transparent=true;o.material.opacity=.55;o.castShadow=false}});g.position.set(0,0,MZ+40);scene.add(g);st.ghost=g;st.ghostDef=def}
function updateGhost(){const S=st.sim;if(!st.ghost||!st.hover)return;const x=st.hover.x,z=st.hover.z,ok=canPlace(x,z)&&S.cash>=st.ghostDef.cost;st.ghost.position.set(x,0,z);showRange({x,z,range:st.ghostDef.stats.range},ok);st.ghostOk=ok}
function place(){const S=st.sim;if(!S||S.state||!S.placeId||!st.ghost)return;const def=SBTD.get(S.placeId),x=st.ghost.position.x,z=st.ghost.position.z;if(S.cash<def.cost){toastBan('Need \u2600'+(def.cost-S.cash)+' more',1000);return}if(!canPlace(x,z)){toastBan('Can\'t build there',900);return}
 S.cash-=def.cost;const t=addTower(def,Math.round(x*10)/10,Math.round(z*10)/10,myId,myId.slice(0,6)+(S.uidn++),1,true);snd(560,.12,'triangle',.1,900);fxBurst(t.x,2,t.z,0x7ee060);S.sel=t;showRange(t);selPanel();buildBar()}

/* =====================================================================================
   QUEUES + LOBBY LOGIC
   ===================================================================================== */
const me=()=>ENG.td.P;
function qMembers(k){const out=[],now=Date.now();if(st.myQ===k)out.push({id:myId,age:now-st.myQT,x:me().x,z:me().z});
 for(const[id,v]of PEERS){const s=v.s;if(now-v.t>2500||!s||s.g!=='td'||s.qq!==k)continue;out.push({id,age:num(s.qa)+(now-v.t),x:num(s.x),z:num(s.z)})}return out}
function queueTick(dt){const P=me(),now=Date.now();let inQ=null;
 if(st.mode==='lobby'&&P.y<TL+5&&!P.dead)for(const k in QT){const q=QT[k];if(Math.hypot(P.x-q.px*K,P.z-q.pz*K)<3.5*K)inQ=k}
 if(inQ!==st.myQ){const was=st.myQ;st.myQ=inQ;if(inQ){st.myQT=now;const q=QT[inQ],ry=-(PI/2+q.a*DEG),mem=qMembers(inQ).filter(m=>m.id!==myId);
   for(const s of SLOT[inQ]){const p=rot(q.px,q.pz,s[0],s[1],ry),wx=p[0]*K,wz=p[1]*K;if(!mem.some(m=>Math.hypot(m.x-wx,m.z-wz)<3.4)){P.x=wx;P.z=wz;break}}snd(520,.12,'sine',.1,780);toastBan('Joined '+q.n,1200)}else if(was)snd(300,.08,'sine',.08,220)}
 const lines=[];let launch=null;
 for(const k in QT){const q=QT[k],mem=qMembers(k),n=mem.length;let txt,rem=null;
  if(!n)txt='Walk onto the pad';else{const age=Math.min(...mem.map(m=>m.age));
   if(n>=q.need){rem=Math.max(0,(k==='solo'?3000:4500)-age);txt='Starting in '+Math.ceil(rem/1000)+'s'}
   else if(k==='squad'&&n>=2){rem=Math.max(0,20000-age);txt='Starting in '+Math.ceil(rem/1000)+'s (waiting for more)'}
   else txt='Waiting for players...'}
  const S=st.B.QS[k];S.sg.paint(k+n+txt,(x,w,h)=>{woodBg(x,w,h);x.textAlign='center';x.fillStyle=q.css;x.font='bold 50px '+FONT;x.fillText(q.ic+' '+q.n,w/2,66);x.fillStyle='#fff';x.font='bold 44px '+FONT;x.fillText(n+' / '+q.max+' players',w/2,116);x.fillStyle='#ffe9b8';x.font='bold 26px '+FONT;x.fillText(txt,w/2,152)});
  S.mem=n;if(st.myQ===k){lines.push(q.n+': '+n+'/'+q.max+' \u00b7 '+txt);if(rem!==null&&rem<=0&&n>=1)launch={k,mem}}}
 const qel=$('tdQ');if(qel){if(st.myQ){qel.style.display='block';setTxt(qel,lines.join('<br>')+'<div style="font-size:12px;opacity:.75;margin-top:3px">Step off the pad to leave the queue</div>')}else qel.style.display='none'}
 if(launch){const ids=launch.mem.map(m=>m.id).sort();startMatch(launch.k,ids)}}
function lobbyAnim(dt){const D=st.dyn,t=st.tt;
 D.mon.rotation.y=Math.sin(t*.2)*.15;D.leaves.forEach(l=>{l.piv.rotation.x=Math.sin(t*.9+l.ph)*.06;l.piv.children[0]&&0});D.rings.forEach((r,i)=>{r.m.rotation.z+=dt*r.sp;r.m.rotation.x=PI/2+r.t+Math.sin(t*.4+i)*.12});D.core.scale.setScalar(1+.08*Math.sin(t*2.2));D.halo.material.opacity=.5+.12*Math.sin(t*1.4);D.pg.material.opacity=.28+.06*Math.sin(t*1.7);
 st.waterT.forEach(w=>{w.offset.x+=dt*.012;w.offset.y+=dt*.02});D.fallT.forEach(f=>f.offset.y+=dt*1.25);D.fs.forEach(o=>{o.sp.position.y=(-6-TL)/K+2.4+o.k*1.6+Math.sin(t*1.1+o.k+o.a)*.4;o.sp.material.opacity=.2+.07*Math.sin(t*1.6+o.a)});for(const f of B_().FALLS)f.foam.scale.setScalar(1+.12*Math.sin(t*2.2+f.a));
 D.islets.forEach(o=>{if(o.blades)o.blades.rotation.z+=dt*.7});D.top.rotation.x=Math.sin(t*.9)*.035;D.top.rotation.z=Math.sin(t*.7+1)*.035;D.cg.rotation.y+=dt*.004;
 for(const k in st.B.QS){const q=st.B.QS[k];q.pm.material.opacity=.7+.2*Math.sin(t*2.4+q.q.a);q.pm.scale.y=1+.04*Math.sin(t*3+q.q.a);q.pring.material.opacity=(st.myQ===k?.9:.45)+.12*Math.sin(t*3);q.pring.scale.setScalar(1+.04*Math.sin(t*2))}
 for(const p of D.sys)if(p.visible)p.step(t)}
const B_=()=>st.B;
function pedTick(dt){const P=me();let near=null,nd=1e9;
 st.ped.forEach(e=>{if(!e.t)return;const d=Math.hypot(P.x-e.x*K,P.z-e.z*K);if(e.model){e.model.rotation.y+=dt*.5;e.model.position.y=2.55+Math.sin(st.tt*1.6+e.x)*.06}if(d<nd){nd=d;near=e}});
 const key=st.ped.map(e=>e.t?e.t.id+SBTD.owned(e.t.id)+SBTD.equipped().includes(e.t.id)+(SBTD.lockInfo(e.t.id)?1:0):'-').join(',');
 if(key!==st.pedKey){st.pedKey=key;st.ped.forEach(e=>{if(!e.t)return;const t=e.t,own=SBTD.owned(t.id),eq=SBTD.equipped().includes(t.id),lk=SBTD.lockInfo(t.id);e.lb.paint(t.id+own+eq+!!lk,(x,w,h)=>{woodBg(x,w,h);x.textAlign='center';x.fillStyle='#fff3c8';const sz=fit(x,t.name,34,w-30,FONT);x.fillText(t.name,w/2,46);x.font='bold 30px '+FONT;x.fillStyle=eq?'#7ab8ff':own?'#7ee060':lk?'#ff8a7a':'#ffd24a';x.fillText(eq?'Equipped':own?'Owned':lk?'\uD83D\uDD12 Locked':(t.price?'\uD83C\uDF38 '+t.price:'Free'),w/2,88)})})}
 const shown=near&&nd<10*K?near:null;st.nearPed=shown;st.ped.forEach(e=>{e.ring.material.opacity=e===shown?.8:0});
 const pr=$('tdPrompt');if(pr){if(shown&&!st.panel){pr.style.display='block';setTxt(pr,'<b>E</b> \u00b7 Inspect '+shown.t.name)}else pr.style.display='none'}}
function rankTick(dt){st.rt=(st.rt||0)-dt;if(st.rt>0)return;st.rt=2;const D=SBTD.stats(),rows=[],nm=($('nick').value||nick);rows.push({name:nm,w:D.w,k:D.k,me:true});
 for(const[id,v]of PEERS){const s=v.s;if(Date.now()-v.t>4000||!s||s.g!=='td'||!Array.isArray(s.ts))continue;rows.push({name:String(s.n||'Player').replace(/[^\w ]/g,'').slice(0,12),w:num(s.ts[0]),k:num(s.ts[1])})}
 let list=rows.filter(r=>r.w>0||r.k>0);list.sort((a,b)=>b.w-a.w||b.k-a.k);st.rankSrc='Players in this lobby';
 if(st.glob&&st.glob.length){list=st.glob.map(g=>({name:g.name,w:g.wins,k:g.kills,me:String(g.name).toLowerCase()===String(nm).toLowerCase()}));st.rankSrc='All-time (online)'}
 st.rank=list;st.paintBoard()}
function globTick(dt){st.gt=(st.gt||0)-dt;if(st.gt>0)return;st.gt=60;SBTD.fetchTop().then(r=>{if(r&&st.B)st.glob=r})}
/* ---------- match start / end ---------- */
function startMatch(k,ids){const P=me();st.myQ=null;st.match={id:k+':'+ids.join(','),type:k};st.mode='match';st.G.visible=false;st.GM.visible=true;const S=st.sim=newSim();S.cash=300;S.lives=LIVES;
 for(let n=1;n<=SBTD.WAVES;n++){const L=SBTD.wave(n),t0=PREP+(n-1)*WGAP;L.forEach((e,i)=>S.ev.push({t:t0+e.at,type:e.t,n,uid:n*1000+i,first:i===0}))}S.ev.sort((a,b)=>a.t-b.t||a.uid-b.uid);
 const idx=Math.max(0,ids.indexOf(myId));Object.assign(P,{x:st.goal.cx+14+idx*6,y:2,z:st.goal.cz+14,vy:0,yaw:PI});ENG.td.S=st.matchS;yaw=-PI/2;pitch=.6;dist=48;
 $('tdLeave').style.display='block';$('tdTop').style.display='block';$('tdQ').style.display='none';$('tdBal').style.display='none';buildBar();selPanel();closePanel();snd(660,.2,'sine',.12,990);toastBan('Defend the portal! Pick a tower, click the grass to build',3200)}
function newSim(){return{towers:[],en:[],ei:0,ev:[],mt:0,cash:0,lives:LIVES,wave:0,state:0,kills:0,sel:null,placeId:null,uidn:0,flash:0,endAt:0}}
function clearSim(){const S=st.sim;if(!S)return;S.en=[];if(st.zm)drawZombies();for(const t of S.towers.slice())rmTower(t);for(const p of st.proj){p.on=false;p.m.visible=false}setGhost();st.rangeM.visible=false;st.sim=newSim()}
function toLobbyFromMatch(){const P=me();clearSim();st.match=null;st.mode='lobby';st.G.visible=true;st.GM.visible=false;ENG.td.S=st.lobbyS;spawnLobby();$('tdLeave').style.display='none';$('tdTop').style.display='none';$('tdBal').style.display='block';buildBar();selPanel();yaw=0;pitch=.3;dist=26}
function spawnLobby(){const P=me();Object.assign(P,{x:(Math.random()-.5)*5*K,y:TL+1,z:(19+Math.random()*2)*K,vy:0,yaw:PI})}
function matchTick(dt){const S=st.sim,P=me();
 matchStepWrap(dt);
 /* keep inside the farm */
 P.x=Math.max(BND.x0-8,Math.min(BND.x1+8,P.x));P.z=Math.max(BND.z0-8,Math.min(BND.z1+8,P.z));if(P.y<-20)Object.assign(P,{x:st.goal.cx+14,y:2,z:st.goal.cz+14,vy:0});
 const nextW=S.wave<SBTD.WAVES?Math.max(0,Math.ceil(PREP+S.wave*WGAP-S.mt)):0;
 setTxt($('tdTop'),`\uD83C\uDF0A Wave <b>${Math.max(1,S.wave)}</b>/${SBTD.WAVES} &nbsp; \u2764\uFE0F <b>${S.lives}</b> &nbsp; \u2600\uFE0F <b>\u2600${S.cash}</b> &nbsp; \u2694\uFE0F <b>${S.kills}</b> &nbsp; \uD83D\uDC65 ${teamSize()}${S.state?'':(nextW?' &nbsp; \u23F1 next wave '+nextW+'s':'')}`);
 buildBar();if(st.sim.sel)selPanel();updateGhost();
 if(S.flash>0){S.flash-=dt;shk=Math.max(shk,.25)}
 if(S.state&&performance.now()>S.endAt)toLobbyFromMatch()}
function matchStepWrap(dt){const S=st.sim;if(S.state)return;matchStep(dt);syncTeam()}

/* =====================================================================================
   ENGINE HOOKS
   ===================================================================================== */
const rc=new THREE.Raycaster(),nd=new THREE.Vector2();
const ndc=e=>{const r=view.getBoundingClientRect();nd.set((e.clientX-r.left)/r.width*2-1,-((e.clientY-r.top)/r.height)*2+1);rc.setFromCamera(nd,camera)};
function clickAt(){const S=st.sim;
 if(st.mode==='lobby'){const h=rc.intersectObjects(st.pick,false)[0];if(h)openInfo(h.object.userData.tid);return}
 if(S.placeId){const h=rc.intersectObject(st.ground)[0];if(h){st.hover=h.point;updateGhost();place()}return}
 const h=rc.intersectObjects(S.towers.map(t=>t.pk),false)[0];if(h){const t=h.object.userData.tw;S.sel=t;showRange(t);selPanel()}else{S.sel=null;st.rangeM.visible=false;selPanel()}}
const OBJ={d3:true,
 start(){
  baseScene(0x87c7ff);showOver('');
  st={mode:'lobby',disp:[],waterT:[],ped:[],pick:[],tt:0,proj:[],myQ:null,myQT:0,hover:null,panel:null,pedKey:'',rankSrc:'',glob:null};st.sim=newSim();
  st.sm={bg:new THREE.SpriteMaterial({color:0x1b1b1b,depthTest:false}),fg:new THREE.SpriteMaterial({color:0x4cd964,depthTest:false}),pg:new THREE.SphereGeometry(.5,6,5),pm1:new THREE.MeshBasicMaterial({color:0xfff08a}),pm2:new THREE.MeshBasicMaterial({color:0xff7ad0})};st.disp.push(st.sm.bg,st.sm.fg,st.sm.pg,st.sm.pm1,st.sm.pm2);
  const B=buildLobby();st.B=B;st.tx=B.tx;finishLobby(B);buildMap();initZombies();st.GM.visible=false;st.applyFx();
  const sea=new THREE.Mesh(new THREE.PlaneGeometry(1800,1800),new THREE.MeshBasicMaterial({color:0x4aa6ee,map:B.tx.sea}));sea.rotation.x=-PI/2;sea.position.set(0,-6,MZ/2);scene.add(sea);st.disp.push(sea.geometry,sea.material);
  st.rangeM=new THREE.Mesh(new THREE.RingGeometry(.97,1,64),new THREE.MeshBasicMaterial({color:0x6fff8a,transparent:true,opacity:.75,side:THREE.DoubleSide,depthWrite:false}));st.rangeM.rotation.x=-PI/2;st.rangeM.visible=false;scene.add(st.rangeM);st.disp.push(st.rangeM.geometry,st.rangeM.material);
  st.lobbyS=[{x:0,z:0,r:31.9*K,top:TL}];st.matchS=[{x:0,z:MZ,hw:112,hd:54,top:0}].concat(st.mapColl);this.S=st.lobbyS;
  this.P=newP(0,TL+1,19*K);spawnLobby();
  mkUI();buildBar();
  let pd=null;
  st.onDown=e=>{pd={x:e.clientX,y:e.clientY,t:performance.now()}};
  st.onMove=e=>{if(st.mode==='match'&&st.sim.placeId){ndc(e);const h=rc.intersectObject(st.ground)[0];if(h)st.hover=h.point}};
  st.onUp=e=>{if(!pd)return;const mv=Math.hypot(e.clientX-pd.x,e.clientY-pd.y),t=performance.now()-pd.t;pd=null;if(mv>7||t>500||st.panel)return;ndc(e);clickAt()};
  st.onKey=e=>{if(/INPUT|TEXTAREA/.test((document.activeElement||{}).tagName||''))return;const c=e.code,S=st.sim;
   if(c==='KeyE'){if(st.mode==='lobby'&&st.nearPed&&!st.panel)openInfo(st.nearPed.t.id);else if(st.mode==='match')place()}
   else if(c==='KeyF'&&st.mode==='match')upgrade();
   else if(c==='KeyQ'&&st.mode==='match'){S.placeId=null;S.sel=null;setGhost();selPanel();buildBar()}
   else if(c==='KeyV'&&st.mode==='match'){const q=SBTD.equipped();if(q.length){S.placeId=q[(q.indexOf(S.placeId)+1)%q.length];S.sel=null;setGhost();buildBar();selPanel()}}
   else if(c==='KeyB')openInv();else if(c==='Escape')closePanel()};
  view.addEventListener('pointerdown',st.onDown);view.addEventListener('pointermove',st.onMove);view.addEventListener('pointerup',st.onUp);document.addEventListener('keydown',st.onKey);
  scoreEl.textContent='';globTick(0);rankTick(0);
 },
 update(dt){if(!st)return;const P=this.P;st.tt+=dt;
  {const nw=performance.now();st.fa=(st.fa||0)+(nw-(st.lt||nw));st.lt=nw;st.fn=(st.fn||0)+1;if(st.fa>=1500){const fps=st.fn*1000/st.fa,want=(typeof ST!=='undefined'&&ST&&ST.cap>0)?Math.min(ST.cap,60):60;st.fa=0;st.fn=0;
   if(fps<want*.72&&st.fx<3){st.fx++;st.good=0;st.applyFx()}else if(fps>want*.93){if(++st.good>=4&&st.fx>st.fxBase){st.fx--;st.good=0;st.applyFx()}}else st.good=0}}
  if(st.mode==='lobby'){setTxt($('tdBal'),'\uD83C\uDF38 <b>'+SBTD.bal()+'</b> Petals');queueTick(dt);lobbyAnim(dt);pedTick(dt);rankTick(dt);globTick(dt)}
  else{matchTick(dt);if(st.blades)st.blades.rotation.z+=dt*.8;if(st.goalM)st.goalM.material.opacity=.75+.15*Math.sin(st.tt*3);for(const p of st.mapPS)if(p.visible)p.step(st.tt)}
  ctrl(P,dt,this.S);
  if(st.mode==='lobby'){
   for(const o of st.B.OBS){const dx=P.x-o[0],dz=P.z-o[1],d=Math.hypot(dx,dz),rr=o[2]+.6;if(d<rr&&P.y<o[3]-.3){const k=rr/(d||.001);P.x=o[0]+dx*k;P.z=o[1]+dz*k;if(!d)P.x+=rr}}
   const r=Math.hypot(P.x,P.z);if(r>30.5*K){P.x=P.x/r*30.5*K;P.z=P.z/r*30.5*K}if(P.y<-20)spawnLobby()}
  if(st.pv){st.pv.mdl.rotation.y+=dt*.9;st.pv.r.render(st.pv.sc,st.pv.cam)}
  const ht=st.mode==='lobby'?'Walk onto a queue pad to play \u00b7 E / click a plant in the Tower Shop \u00b7 B = My Towers':'Pick a tower, click the grass to build (E) \u00b7 click a tower to upgrade (F) \u00b7 Q cancels';if(st.ht!==ht){st.ht=ht;hint.textContent=ht}},
 ex(){const D=SBTD.stats(),o={ts:[D.w,D.k]};if(!st)return o;if(st.myQ){o.qq=st.myQ;o.qa=Date.now()-st.myQT}
  if(st.match&&st.sim){const S=st.sim;o.mm=st.match.id;o.tw=S.towers.filter(t=>t.mine).map(t=>[t.uid,t.x,t.z,t.def.id,t.lv]);o.ml=S.lives;o.ms=S.state;o.mw=S.wave}return o},
 rem(c,q){},
 /* instances: you only see (and are seen by) people in the same space - everyone in the lobby, or only your own squad inside a match. Other matches are completely hidden from you. */
 seen(q){const mm=st&&st.match?st.match.id:null;return (q.mm||null)===mm},
 debug:()=>({st,act,canPlace,place,QT,K,TL,MZ,openInfo,hostId,zGeo}),
 reset(){if(st&&st.mode==='lobby')spawnLobby()},
 stop(){if(!st)return;try{view.removeEventListener('pointerdown',st.onDown);view.removeEventListener('pointermove',st.onMove);view.removeEventListener('pointerup',st.onUp);document.removeEventListener('keydown',st.onKey)}catch(e){}
  closePv();if(st.ui&&st.ui.parentNode)st.ui.parentNode.removeChild(st.ui);if(st.sun)st.sun.forEach(sp=>scene&&scene.remove(sp));
  try{st.disp.forEach(o=>{try{o.dispose()}catch(e){}})}catch(e){}st=null}};
return OBJ})();
