/* =====================================================================
   core.js - shared engine: 3D setup, characters, controls, multiplayer,
   chat, friends, effects, lobby and the game loop.
   Each game lives in js/games/<name>.js and registers itself here.
   ===================================================================== */
const GAMES=[];
const META={};
const ST={sens:5,q:'auto',th:'auto',sh:'high',fps:false,cap:0,shake:true,hints:true,calm:false,vol:1,fav:[],rec:[]};try{Object.assign(ST,JSON.parse(localStorage.getItem('hubs')||'{}'))}catch(e){}
const saveS=()=>{try{localStorage.setItem('hubs',JSON.stringify(ST))}catch(e){}};
const pr=()=>ST.q==='low'?1:ST.q==='high'?2:Math.min(Math.max(devicePixelRatio,1.5),2);
if(ST.calm)document.documentElement.classList.add('calm');
let SENS=ST.sens*.0006;if(ST.th!=='auto')document.documentElement.dataset.theme=ST.th;
const modal=document.getElementById('modal'),view=document.getElementById('view'),petview=document.getElementById('petview'),
 scoreEl=document.getElementById('score'),hint=document.getElementById('hint'),over=document.getElementById('over'),touch=document.getElementById('touch');
const keys={};let cur=null,raf=0;
addEventListener('keydown',e=>{if(e.target.tagName==='INPUT')return;
 if(modal.classList.contains('on')&&['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code))e.preventDefault();
 keys[e.code]=true;
 if(cur&&cur.P&&!cur.P.dead&&!cur.noEmote){const em=EMK[e.code];if(em)cur.P.emote=em}if(e.code==='KeyR'&&cur&&cur.reset&&!(cur.P&&cur.P.dead))cur.reset();if(cur&&cur.vu&&cur.vu.style.display==='flex'&&/^Digit[1-9]$/.test(e.code)){const vb=cur.vu.querySelectorAll('button')[+e.code.slice(5)-1];if(vb)vb.click()}});
addEventListener('keyup',e=>keys[e.code]=false);
touch.querySelectorAll('button').forEach(b=>{const k=b.dataset.k;
 b.addEventListener('pointerdown',e=>{e.preventDefault();keys[k]=true});
 ['pointerup','pointerleave','pointercancel'].forEach(v=>b.addEventListener(v,()=>keys[k]=false))});
const F=()=>keys.KeyW||keys.ArrowUp,B=()=>keys.KeyS||keys.ArrowDown,L=()=>keys.KeyA||keys.ArrowLeft,R=()=>keys.KeyD||keys.ArrowRight;

/* ---------- 3D engine ---------- */
let renderer,scene,camera,sun,yaw=0,pitch=.45,dist=26;const clock=new THREE.Clock();
function resize(){if(!renderer)return;const w=view.clientWidth||700,h=view.clientHeight||420;renderer.setSize(w,h,false);if(camera){camera.aspect=w/h;camera.updateProjectionMatrix()}}
function applyGfx(){if(!renderer)return;const on=ST.sh!=='off';if(renderer.shadowMap.enabled!==on){renderer.shadowMap.enabled=on;if(scene)scene.traverse(o=>{if(o.material)[].concat(o.material).forEach(m=>m.needsUpdate=true)})}
 if(sun){sun.castShadow=on;const z=ST.sh==='low'?1024:2048;if(sun.shadow.mapSize.x!==z){sun.shadow.mapSize.set(z,z);if(sun.shadow.map){sun.shadow.map.dispose();sun.shadow.map=null}}}}
const fpsEl=document.createElement('div');fpsEl.id='fpsc';document.body.appendChild(fpsEl);let fpsN=0,fpsT=performance.now(),lastF=0;
function fpsTick(){if(!ST.fps){fpsEl.style.display='none';return}fpsEl.style.display='block';fpsN++;const n=performance.now();if(n-fpsT>=500){fpsEl.textContent=Math.round(fpsN*1000/(n-fpsT))+' FPS';fpsN=0;fpsT=n}}
addEventListener('resize',resize);
function initR(){
 if(renderer)return;
 renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});renderer.setPixelRatio(pr());renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;view.prepend(renderer.domElement);
 const c=renderer.domElement;let drag=false,lx=0,ly=0;
 c.style.touchAction='none';
 c.addEventListener('pointerdown',e=>{drag=true;lx=e.clientX;ly=e.clientY;c.setPointerCapture(e.pointerId)});
 c.addEventListener('pointermove',e=>{if(!drag||document.pointerLockElement)return;yaw-=(e.clientX-lx)*.008;pitch=Math.max(PMIN,Math.min(1.3,pitch+(e.clientY-ly)*.006));lx=e.clientX;ly=e.clientY});
 c.addEventListener('pointerup',()=>drag=false);
 c.addEventListener('wheel',e=>{dist=Math.max(10,Math.min(50,dist+e.deltaY*.03));e.preventDefault()},{passive:false});
}
function baseScene(sky){
 scene=new THREE.Scene();scene.background=new THREE.Color(sky);scene.fog=new THREE.Fog(sky,150,400);
 camera=new THREE.PerspectiveCamera(60,1/.6,.5,500);
 scene.add(new THREE.HemisphereLight(0xffffff,0xb8b4aa,.75));
 sun=new THREE.DirectionalLight(0xffffff,.5);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.bias=-.0006;sun.shadow.normalBias=.1;
 const s=sun.shadow.camera;s.left=s.bottom=-55;s.right=s.top=55;s.far=300;scene.add(sun,sun.target);applyGfx();resize();
}
function slab(w,h,d,x,y,z,col){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshLambertMaterial({color:col}));m.position.set(x,y,z);m.castShadow=m.receiveShadow=true;scene.add(m);return m}
const lam=c=>new THREE.MeshLambertMaterial({color:c});
const OPT={skin:[['Yellow',0xf5d02a],['Peach',0xffcba4],['Tan',0xc68642],['Brown',0x8d5524],['Pale',0xf1e4d3],['Green',0x7bc96f]],shirt:[['Blue',0x1a7fe0],['Red',0xe0352b],['Black',0x222222],['White',0xf0f0f0],['Purple',0x8a4fe0],['Orange',0xff8a1f]],pants:[['Green',0x4fb04f],['Navy',0x233c7a],['Black',0x222222],['Grey',0x8a8f98],['Khaki',0xc2b280]],face:[['Smile','smile'],['Grin','grin'],['Cool','cool'],['Wink','wink']],hat:[['None',''],['Cap','cap'],['Top hat','top'],['Crown','crown'],['Halo','halo'],['Headphones','phones'],['Party','party']],back:[['None',''],['Cape','cape'],['Backpack','pack'],['Wings','wings']]};
OPT.hat.push(['Beanie','beanie'],['Cowboy','cowboy'],['Wizard','wizard'],['Viking','viking'],['Bunny','bunny'],['Cat ears','cat'],['Chef','chef']);
Object.assign(OPT,{design:[['None',''],['Stripes','stripes'],['Heart','heart'],['Star','star'],['Bolt','bolt']],sleeves:[['Bare',0],['Short',1],['Long',1.6]],legs:[['Long',0],['Shorts',1]],shoes:[['None',''],['Black',0x222222],['Red',0xd03030],['White',0xf2f2f2],['Brown',0x7b4a2b]],glasses:[['None',''],['Round','round'],['Shades','shades'],['Mustache','stache']],neck:[['None',''],['Scarf','scarf'],['Bowtie','bow'],['Tie','tie']],hand:[['None',''],['Sword','sword'],['Balloon','balloon']]});
OPT.skin.push(['Lavender',0xc8b6ff],['Pink',0xffb3d1],['Dark',0x5c3a21]);
OPT.shirt.push(['Pink',0xff7eb6],['Teal',0x1fb5a8],['Yellow',0xffd23a],['Navy',0x1f2f66],['Gold',0xd4a017],['Lime',0x7ed957],['Magenta',0xd6247f],['Cyan',0x26c6da],['Maroon',0x7a1f2b],['Charcoal',0x3a3f47],['Peach',0xffb88a]);const PAT=['plaid','camo','hawaii','jersey','rainbow','flames'];
OPT.pants.push(['Brown',0x6b4a2b],['Red',0xb03030],['White',0xf2f2f2],['Purple',0x6a3fb5]);
OPT.shoes.push(['Pink',0xff7eb6],['Gold',0xd4a017]);
OPT.face.push(['Surprised','surprised'],['Angry','angry'],['Sleepy','sleepy'],['Tongue','tongue']);
OPT.design.push(['Smiley','smiley'],['Skull','skull'],['Diamond','diamond'],['Plaid','plaid'],['Camo','camo'],['Hawaiian','hawaii'],['Jersey 7','jersey'],['Rainbow','rainbow'],['Flames','flames'],['Tuxedo','tux'],['Hoodie','hoodie']);
OPT.hat.push(['Santa','santa'],['Pirate','pirate'],['Propeller','propeller'],['Grad cap','grad'],['Devil horns','devil'],['Mohawk','mohawk'],['Straw hat','straw']);
OPT.glasses.push(['3D','3d'],['Eyepatch','patch'],['Bandana','mask']);
OPT.neck.push(['Medal','medal']);
OPT.back.push(['Jetpack','jet'],['Angel wings','angel'],['Shield','shield']);
OPT.hand.push(['Torch','torch'],['Wand','wand'],['Umbrella','umb']);
Object.assign(OPT,{effect:[['None',''],['Sparkles','spark'],['Blue ring','ringb'],['Gold ring','ringg'],['Rainbow ring','ringr']]});
const ORDER=['skin','shirt','design','sleeves','pants','legs','shoes','face','glasses','hat','neck','back','hand','effect'];
let AV={skin:0,shirt:0,pants:0,face:0,hat:0,back:0,design:0,sleeves:0,legs:0,shoes:0,glasses:0,neck:0,hand:0,effect:0};try{Object.assign(AV,JSON.parse(localStorage.getItem('avatar')||'{}'))}catch(e){}
for(const k in OPT)if(!OPT[k][AV[k]])AV[k]=0;
function dress(C){
 const h=OPT.hat[AV.hat][1],b=OPT.back[AV.back][1],H=C.J.head;
 const add=(geo,col,x,y,z,par,basic)=>{const m=new THREE.Mesh(geo,basic?new THREE.MeshBasicMaterial({color:col}):lam(col));m.position.set(x,y,z);m.castShadow=true;(par||H).add(m);return m};
 if(h==='cap'){const d=add(new THREE.SphereGeometry(.7,20,12,0,Math.PI*2,0,Math.PI/2),0xe0352b,0,.3,0);d.scale.y=.65;add(new THREE.BoxGeometry(.9,.08,.6),0xb02a22,0,.32,.6)}
 if(h==='top'){add(new THREE.CylinderGeometry(.45,.45,.7,20),0x1a1a1a,0,.95,0);add(new THREE.CylinderGeometry(.8,.8,.08,24),0x1a1a1a,0,.62,0)}
 if(h==='crown'){add(new THREE.CylinderGeometry(.5,.45,.35,8),0xffcf33,0,.75,0);for(let i=0;i<5;i++){const a=i/5*Math.PI*2;add(new THREE.ConeGeometry(.1,.25,6),0xffcf33,Math.cos(a)*.45,1.05,Math.sin(a)*.45)}}
 if(h==='halo'){const m=add(new THREE.TorusGeometry(.5,.06,8,28),0xffe066,0,1.15,0,0,1);m.rotation.x=Math.PI/2;m.castShadow=false}
 if(h==='phones'){add(new THREE.TorusGeometry(.72,.07,8,24,Math.PI),0x333333,0,.05,0);[-1,1].forEach(s=>{const m=add(new THREE.CylinderGeometry(.3,.3,.22,16),0xe0352b,s*.74,.05,0);m.rotation.z=Math.PI/2})}
 if(h==='party')add(new THREE.ConeGeometry(.42,.95,16),0xff5fb0,0,1.05,0);
 if(b==='pack')add(new THREE.BoxGeometry(1.3,1.5,.5),0x8a5a2b,0,3.1,-.78,C.up);
 if(b==='wings')[-1,1].forEach(s=>{const m=add(new THREE.BoxGeometry(.1,2.2,1.3),0xffffff,s*.6,3.3,-.75,C.up);m.rotation.y=s*.5;m.rotation.z=s*.25});
 if(b==='cape'){const p=new THREE.Group();p.position.set(0,4,-.58);C.up.add(p);const m=new THREE.Mesh(new THREE.BoxGeometry(1.9,2.8,.08),lam(0xc0262c));m.position.y=-1.4;m.castShadow=true;p.add(m);C.cape=p}dress2(C,add,h,b);
}
function dress2(C,add,h,b){dress3(C,add,h,b);
 const J=C.J,U=C.up,fx=k=>OPT[k][AV[k]][1],sh=OPT.shirt[AV.shirt][1],sk=OPT.skin[AV.skin][1];
 if(h==='beanie'){const d=add(new THREE.SphereGeometry(.7,20,12,0,Math.PI*2,0,Math.PI/2),0x3b82f6,0,.25,0);d.scale.y=.75;add(new THREE.SphereGeometry(.13,10,8),0xffffff,0,.8,0)}
 if(h==='cowboy'){add(new THREE.CylinderGeometry(.4,.5,.5,16),0x8a5a2b,0,.85,0);add(new THREE.CylinderGeometry(.95,.95,.07,24),0x8a5a2b,0,.6,0)}
 if(h==='wizard'){add(new THREE.ConeGeometry(.55,1.5,16),0x4b2a9a,0,1.3,0);add(new THREE.CylinderGeometry(.9,.9,.06,24),0x4b2a9a,0,.6,0)}
 if(h==='viking'){add(new THREE.SphereGeometry(.68,18,10,0,Math.PI*2,0,Math.PI/2),0x9aa0aa,0,.28,0).scale.y=.6;[-1,1].forEach(s=>{const m=add(new THREE.ConeGeometry(.15,.7,8),0xf1e4d3,s*.7,.5,0);m.rotation.z=-s*.7})}
 if(h==='bunny')[-1,1].forEach(s=>add(new THREE.BoxGeometry(.2,.95,.12),0xffffff,s*.25,1.05,0));
 if(h==='cat')[-1,1].forEach(s=>add(new THREE.ConeGeometry(.2,.4,4),0x777777,s*.4,.8,0));
 if(h==='chef'){add(new THREE.CylinderGeometry(.5,.5,.5,18),0xffffff,0,.85,0);add(new THREE.SphereGeometry(.55,14,10),0xffffff,0,1.2,0)}
 const gl=fx('glasses');
 if(gl==='round')[-1,1].forEach(s=>add(new THREE.TorusGeometry(.1,.025,8,16),0x222222,s*.11,.04,.7));
 if(gl==='shades')add(new THREE.BoxGeometry(.6,.16,.04),0x111111,0,.04,.7);
 if(gl==='stache')add(new THREE.BoxGeometry(.45,.1,.06),0x3b2a1a,0,-.03,.7);
 const nk=fx('neck');
 if(nk==='scarf'){add(new THREE.BoxGeometry(2.1,.4,1.1),0xd03030,0,3.85,0,U);add(new THREE.BoxGeometry(.45,1.2,.1),0xd03030,.5,3.3,.58,U)}
 if(nk==='bow'){[-1,1].forEach(s=>add(new THREE.BoxGeometry(.4,.28,.12),0xd03030,s*.24,3.85,.55,U));add(new THREE.BoxGeometry(.16,.16,.14),0x8a1a1a,0,3.85,.56,U)}
 if(nk==='tie'){add(new THREE.BoxGeometry(.3,.3,.08),0xd03030,0,3.85,.54,U);add(new THREE.BoxGeometry(.3,1.1,.07),0xd03030,0,3.2,.54,U)}
 const dsg=fx('design');
 if(dsg){const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d');x.fillStyle='rgba(255,255,255,.9)';
  if(dsg==='stripes')for(let i=0;i<4;i++)x.fillRect(0,i*16+4,64,7);
  if(dsg==='heart'){x.fillStyle='#ff4f7a';x.beginPath();x.moveTo(32,54);x.bezierCurveTo(2,32,12,6,32,22);x.bezierCurveTo(52,6,62,32,32,54);x.fill()}
  if(dsg==='star'){x.fillStyle='#ffd84a';x.beginPath();for(let i=0;i<10;i++){const r=i%2?12:28,a=i*Math.PI/5-Math.PI/2;x.lineTo(32+Math.cos(a)*r,34+Math.sin(a)*r)}x.fill()}
  if(dsg==='bolt'){x.fillStyle='#ffe24a';x.beginPath();x.moveTo(38,4);x.lineTo(16,36);x.lineTo(30,36);x.lineTo(24,60);x.lineTo(48,26);x.lineTo(34,26);x.closePath();x.fill()}
  if(dsg==='smiley'){x.fillStyle='#ffd84a';x.beginPath();x.arc(32,32,24,0,7);x.fill();x.fillStyle='#111';x.beginPath();x.arc(24,26,3,0,7);x.moveTo(43,26);x.arc(40,26,3,0,7);x.fill();x.strokeStyle='#111';x.lineWidth=3;x.beginPath();x.arc(32,34,12,.2,Math.PI-.2);x.stroke()}
  if(dsg==='skull'){x.fillStyle='#f2f2f2';x.beginPath();x.arc(32,28,20,0,7);x.fill();x.fillRect(22,40,20,14);x.fillStyle='#111';x.beginPath();x.arc(24,28,6,0,7);x.moveTo(46,28);x.arc(40,28,6,0,7);x.fill();x.fillRect(30,36,4,5)}
  if(dsg==='diamond'){x.fillStyle='#6fe3ff';x.beginPath();x.moveTo(32,6);x.lineTo(56,28);x.lineTo(32,58);x.lineTo(8,28);x.closePath();x.fill()}
  if(dsg==='plaid'){x.fillStyle='rgba(0,0,0,.3)';for(let i=0;i<4;i++){x.fillRect(i*16+3,0,7,64);x.fillRect(0,i*16+3,64,7)}x.fillStyle='rgba(255,255,255,.5)';for(let i=0;i<4;i++){x.fillRect(i*16+12,0,2,64);x.fillRect(0,i*16+12,64,2)}}
  if(dsg==='camo'){const r=mulb(5),cs=['#4a5d23','#2f3b17','#7a6a3a'];for(let i=0;i<14;i++){x.fillStyle=cs[i%3];x.beginPath();x.ellipse(r()*64,r()*64,8+r()*8,5+r()*6,r()*3,0,7);x.fill()}}
  if(dsg==='hawaii'){x.fillStyle='#1f9d8f';x.fillRect(0,0,64,64);[[14,14],[46,12],[30,32],[12,50],[50,48]].forEach(([a,b])=>{x.fillStyle='#ff6fa8';for(let k=0;k<5;k++){x.beginPath();x.arc(a+Math.cos(k*1.256)*5,b+Math.sin(k*1.256)*5,4,0,7);x.fill()}x.fillStyle='#ffd23a';x.beginPath();x.arc(a,b,3,0,7);x.fill()})}
  if(dsg==='jersey'){x.fillStyle='#c1121f';x.fillRect(0,0,64,64);x.fillStyle='#fff';x.fillRect(0,0,64,5);x.fillRect(0,59,64,5);x.font='bold 44px system-ui';x.textAlign='center';x.fillText('7',32,48)}
  if(dsg==='rainbow')['#e63946','#f4a261','#f1fa3b','#2a9d8f','#3a86ff','#8338ec'].forEach((c2,i)=>{x.fillStyle=c2;x.fillRect(0,i*11,64,11)});
  if(dsg==='flames')for(let i=0;i<6;i++){x.fillStyle=i%2?'#ffd23a':'#ff7a1a';x.beginPath();x.moveTo(i*11,64);x.lineTo(i*11+6,64-(26+(i%3)*10));x.lineTo(i*11+12,64);x.fill()}
  if(dsg==='tux'){x.fillStyle='#f4f4f4';x.fillRect(18,0,28,64);x.fillStyle='#111';x.beginPath();x.moveTo(0,0);x.lineTo(24,0);x.lineTo(32,40);x.lineTo(0,64);x.fill();x.beginPath();x.moveTo(64,0);x.lineTo(40,0);x.lineTo(32,40);x.lineTo(64,64);x.fill();x.fillStyle='#d62828';x.fillRect(24,2,16,8)}
  if(dsg==='hoodie'){x.fillStyle='rgba(0,0,0,.25)';x.fillRect(10,38,44,20);x.fillStyle='#fff';x.fillRect(24,2,2,22);x.fillRect(38,2,2,22)}
  const p=new THREE.Mesh(new THREE.PlaneGeometry(2,2),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(c),transparent:true}));p.position.set(0,0,.52);J.torso.add(p);if(PAT.includes(dsg)){const p2=p.clone();p2.position.z=-.52;p2.rotation.y=Math.PI;J.torso.add(p2)}if(dsg==='hoodie')add(new THREE.BoxGeometry(1.7,1.1,.7),sh,0,4.35,-.75,U)}
 const sl=fx('sleeves');
 if(sl)[J.aL,J.aR].forEach(a=>{const m=new THREE.Mesh(rbox(1.06,sl+.04,1.06,.16),lam(sh));m.position.y=-sl/2+.02;m.castShadow=true;a.add(m)});
 const sc=fx('shoes'),lg=fx('legs');
 [J.lL,J.lR].forEach(l=>{if(lg){const m=new THREE.Mesh(rbox(1.04,1.04,1.04,.16),lam(sk));m.position.y=-1.52;l.add(m)}if(sc){const m=new THREE.Mesh(rbox(1.08,.5,1.3,.14),lam(sc));m.position.set(0,-1.77,.12);m.castShadow=true;l.add(m)}});
 const hd=fx('hand');
 if(hd==='sword'){add(new THREE.BoxGeometry(.12,.3,2.4),0xcfd5dc,0,-1.9,1.5,J.aR);add(new THREE.BoxGeometry(.16,.16,.6),0x6b4a2b,0,-1.9,.3,J.aR);add(new THREE.BoxGeometry(.14,.8,.12),0x9aa0aa,0,-1.9,.62,J.aR)}
 if(hd==='balloon'){add(new THREE.BoxGeometry(.03,4.6,.03),0xffffff,1.9,4.3,.3,U);const m=add(new THREE.SphereGeometry(.9,16,12),0xff4f6a,1.9,7.1,.3,U);m.scale.y=1.2}
}
function dress3(C,add,h,b){
 const J=C.J,U=C.up,fx=k=>OPT[k][AV[k]][1],cyl=(a,c,hh,sg)=>new THREE.CylinderGeometry(a,c,hh,sg||14);
 if(h==='santa'){const d=add(new THREE.ConeGeometry(.65,1.2,16),0xd62828,0,1.1,0);d.rotation.z=.25;add(new THREE.SphereGeometry(.16,10,8),0xffffff,.45,1.6,0);add(cyl(.7,.7,.2,20),0xffffff,0,.62,0)}
 if(h==='pirate'){add(new THREE.BoxGeometry(1.6,.5,1.1),0x1a1a1a,0,.8,0);add(new THREE.BoxGeometry(.3,.3,.04),0xffffff,0,.8,.56)}
 if(h==='propeller'){add(cyl(.5,.55,.3,16),0x3b82f6,0,.7,0);C.prop=add(new THREE.BoxGeometry(1.6,.05,.25),0xe0352b,0,.95,0)}
 if(h==='grad'){add(cyl(.55,.55,.35,16),0x1a1a1a,0,.7,0);add(new THREE.BoxGeometry(1.5,.08,1.5),0x1a1a1a,0,.92,0);add(new THREE.BoxGeometry(.05,.5,.05),0xffd23a,.7,.7,0)}
 if(h==='devil')[-1,1].forEach(s=>{const m=add(new THREE.ConeGeometry(.15,.6,8),0xc01818,s*.38,.8,0);m.rotation.z=-s*.25});
 if(h==='mohawk')for(let i=-2;i<=2;i++)add(new THREE.BoxGeometry(.12,.55-Math.abs(i)*.08,.35),0xe0357f,0,.65,i*.22);
 if(h==='straw'){add(cyl(.5,.5,.45,16),0xe6c36a,0,.8,0);add(cyl(1,1,.07,24),0xe6c36a,0,.6,0);add(cyl(.52,.52,.1,16),0xd04040,0,.65,0)}
 const gl=fx('glasses');
 if(gl==='3d'){add(new THREE.BoxGeometry(.3,.2,.04),0xff3b3b,-.17,.04,.7);add(new THREE.BoxGeometry(.3,.2,.04),0x3bd1ff,.17,.04,.7)}
 if(gl==='patch'){add(new THREE.BoxGeometry(.28,.24,.04),0x111111,.12,.04,.7);add(new THREE.BoxGeometry(1.35,.04,.04),0x111111,0,.16,.66)}
 if(gl==='mask')add(new THREE.BoxGeometry(1,.38,.1),0x161616,0,-.22,.66);
 if(fx('neck')==='medal'){add(new THREE.BoxGeometry(.06,1,.04),0xd03030,0,3.4,.55,U);const m=add(cyl(.28,.28,.06,16),0xffd23a,0,2.9,.57,U);m.rotation.x=Math.PI/2}
 if(b==='jet')[-1,1].forEach(s=>{add(cyl(.35,.35,1.6,12),0xaab2bd,s*.5,3.2,-.8,U);const f=add(new THREE.ConeGeometry(.25,.7,8),0xff8a1f,s*.5,2.1,-.8,U,1);f.rotation.x=Math.PI});
 if(b==='angel')[-1,1].forEach(s=>{const m=add(new THREE.BoxGeometry(.08,2.6,1.6),0xffffff,s*.9,3.6,-.8,U);m.rotation.z=s*.5;m.rotation.y=s*.4});
 if(b==='shield'){add(new THREE.BoxGeometry(1.8,2.2,.2),0x3b82f6,0,3.1,-.75,U);add(new THREE.BoxGeometry(.5,.9,.22),0xffd23a,0,3.1,-.76,U)}
 const hd=fx('hand');
 if(hd==='torch'){add(cyl(.1,.1,1.4,8),0x6b4a2b,0,-1.5,.45,J.aR);add(new THREE.ConeGeometry(.3,.7,8),0xff8a1f,0,-.6,.45,J.aR,1)}
 if(hd==='wand'){add(cyl(.05,.05,1.6,6),0x6b4a2b,0,-1.5,.45,J.aR);add(new THREE.SphereGeometry(.18,8,6),0xffe066,0,-.65,.45,J.aR,1)}
 if(hd==='umb'){add(cyl(.05,.05,2.4,6),0x333333,0,-1.1,.45,J.aR);add(new THREE.ConeGeometry(1.5,.7,16),0xe0352b,0,.2,.45,J.aR)}
 const ef=fx('effect');
 if(ef==='spark'){const sp=[];for(let i=0;i<8;i++)sp.push(add(new THREE.SphereGeometry(.14,6,6),0xffe066,0,0,0,C.g,1));C.fxu=t=>sp.forEach((m,i)=>{const a=t*1.6+i*.785;m.position.set(Math.cos(a)*2.4,2.5+Math.sin(t*2+i)*1.6+i*.25,Math.sin(a)*2.4)})}
 if(ef&&ef.startsWith('ring')){const col=ef==='ringb'?0x3bb0ff:ef==='ringg'?0xffd23a:0xffffff,r=add(new THREE.TorusGeometry(2.2,.12,8,32),col,0,.15,0,C.g,1);r.rotation.x=Math.PI/2;C.fxu=t=>{if(ef==='ringr')r.material.color.setHSL((t*.3)%1,.9,.6);r.rotation.z=t*2}}
}
const custom=document.getElementById('custom');
/* ---- SchoolBux: earn 10 every minute on the site; spend them in the Avatar Shop ---- */
const BX={b:0,own:{},acc:0};
try{const s=localStorage.getItem('hubbux');if(s)Object.assign(BX,JSON.parse(s));else{for(const k in AV)if(AV[k])BX.own[k+':'+AV[k]]=1}}catch(e){}
const saveBX=()=>{try{localStorage.setItem('hubbux',JSON.stringify(BX))}catch(e){}};saveBX();
const CLOTHES=['shirt','pants','design','sleeves','legs','shoes'];
const priceOf=k=>CLOTHES.includes(k)?5:k==='face'?20:50;
const owned=(k,i)=>i===0||!!BX.own[k+':'+i];
const CATN={skin:'Skin',shirt:'Shirt',design:'Shirt design',sleeves:'Sleeves',pants:'Pants',legs:'Legs',shoes:'Shoes',face:'Face',glasses:'Glasses',hat:'Hats',neck:'Neck',back:'Back',hand:'Hand',effect:'Effects'};
let CAT='hat';
function bxUpdate(){document.querySelectorAll('#bxn,.bxs').forEach(e=>e.textContent=BX.b);const t=document.getElementById('bxt');if(t)t.textContent=Math.max(1,Math.ceil(60-BX.acc))+'s'}
let bxLast=Date.now(),bxSave=0;
setInterval(()=>{const n=Date.now(),dt=Math.min(5,(n-bxLast)/1000);bxLast=n;if(document.hidden)return;BX.acc+=dt;
 if(BX.acc>=60){BX.acc-=60;BX.b+=10;saveBX();toast('+10 SchoolBux \uD83D\uDCB5');if(custom.style.display==='block')buildCustom()}
 else if(++bxSave%10===0)saveBX();bxUpdate()},1000);
bxUpdate();
function buildCustom(){
 const k=CAT,pr=priceOf(k);
 const tabs=ORDER.map(c=>`<button class="tab${c===k?' on':''}" data-t="${c}">${CATN[c]}</button>`).join('');
 const items=OPT[k].map((o,i)=>{const own=owned(k,i),on=AV[k]===i,sw=typeof o[1]==='number'&&o[1]>255?`<i class="sw" style="background:#${o[1].toString(16).padStart(6,'0')}"></i>`:`<i class="sw n">${i===0?'\u2715':'\u2605'}</i>`;
  const st=on?'<em>Wearing</em>':own?'<em>Owned</em>':`<em class="pc${BX.b<pr?' no':''}">\uD83D\uDCB5 ${pr}</em>`;
  return `<button class="ic${on?' on':''}${own?'':' lock'}" data-i="${i}">${sw}<span>${o[0]}</span>${st}</button>`}).join('');
 custom.innerHTML=`<div class="sh-top"><div class="sh-bal">\uD83D\uDCB5 <b class="bxs">${BX.b}</b> SchoolBux</div><div class="sh-nx">Next +10 in <b id="bxt">${Math.max(1,Math.ceil(60-BX.acc))}s</b></div></div><div class="sh-tabs">${tabs}</div><div class="sh-note">${CATN[k]} \u00b7 ${pr} SchoolBux each \u00b7 you earn 10 every minute you're on the site</div><div class="sh-grid">${items}</div>`;
 custom.querySelectorAll('.tab').forEach(b=>b.onclick=()=>{CAT=b.dataset.t;buildCustom()});
 custom.querySelectorAll('.ic').forEach(b=>b.onclick=()=>{const i=+b.dataset.i;let nb=false;
  if(!owned(k,i)){if(BX.b<pr){toast('Not enough SchoolBux \u2013 you need '+(pr-BX.b)+' more');return}BX.b-=pr;BX.own[k+':'+i]=1;nb=true;toast('Bought '+OPT[k][i][0]+'!')}
  AV[k]=i;try{localStorage.setItem('avatar',JSON.stringify(AV))}catch(e){}saveBX();buildCustom();if(nb){const e=custom.querySelector('.ic.on');if(e)e.classList.add('pop')}bxUpdate();ENG.avatar.rebuild()})}

/* Roblox-style blocky character (R6 proportions, 5 studs tall) */
function faceTex(kind){const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d');
 x.clearRect(0,0,64,64);x.fillStyle='#111';x.beginPath();x.arc(22,24,3.4,0,7);x.moveTo(45.4,24);x.arc(42,24,3.4,0,7);x.fill();
 x.lineWidth=3.5;x.lineCap='round';x.strokeStyle='#111';x.beginPath();x.arc(32,30,15,.35,Math.PI-.35);x.stroke();if(kind==='grin'){x.fillStyle='#fff';x.beginPath();x.arc(32,31,15,.1,Math.PI-.1);x.closePath();x.fill();x.stroke()}if(kind==='cool'){x.fillStyle='#111';x.fillRect(10,18,20,11);x.fillRect(34,18,20,11);x.fillRect(28,21,8,3)}if(kind==='wink'){x.clearRect(36,18,14,12);x.beginPath();x.moveTo(37,26);x.lineTo(49,22);x.stroke()}if(kind==='surprised'||kind==='angry'||kind==='sleepy'||kind==='tongue'){x.clearRect(0,0,64,64);x.fillStyle='#111';x.strokeStyle='#111';x.lineWidth=3.5;x.lineCap='round';
 if(kind==='surprised'){x.beginPath();x.arc(22,24,5,0,7);x.moveTo(47,24);x.arc(42,24,5,0,7);x.fill();x.beginPath();x.ellipse(32,42,6,8,0,0,7);x.stroke()}
 if(kind==='angry'){x.beginPath();x.arc(22,28,3.4,0,7);x.moveTo(45.4,28);x.arc(42,28,3.4,0,7);x.fill();x.beginPath();x.moveTo(14,18);x.lineTo(28,24);x.moveTo(50,18);x.lineTo(36,24);x.moveTo(22,46);x.quadraticCurveTo(32,38,42,46);x.stroke()}
 if(kind==='sleepy'){x.beginPath();x.moveTo(16,26);x.lineTo(28,26);x.moveTo(36,26);x.lineTo(48,26);x.moveTo(26,42);x.lineTo(38,42);x.stroke()}
 if(kind==='tongue'){x.beginPath();x.arc(22,24,3.4,0,7);x.moveTo(45.4,24);x.arc(42,24,3.4,0,7);x.fill();x.beginPath();x.arc(32,32,15,.35,Math.PI-.35);x.stroke();x.fillStyle='#e8556d';x.beginPath();x.ellipse(36,48,5,7,0,0,7);x.fill()}}
return new THREE.CanvasTexture(c)}
const RBC=new Map();
function rbox(w,h,d,r){const key=[w,h,d,r].join();let g=RBC.get(key);if(g)return g;
 r=Math.min(r,w/2-.02,h/2-.02,d/2-.02);const r0=.02,a=w/2-r-r0,b=h/2-r-r0,sh=new THREE.Shape();
 sh.moveTo(-a,-b-r0);sh.lineTo(a,-b-r0);sh.absarc(a,-b,r0,-Math.PI/2,0,false);sh.lineTo(a+r0,b);sh.absarc(a,b,r0,0,Math.PI/2,false);sh.lineTo(-a,b+r0);sh.absarc(-a,b,r0,Math.PI/2,Math.PI,false);sh.lineTo(-a-r0,-b);sh.absarc(-a,-b,r0,Math.PI,Math.PI*1.5,false);
 g=new THREE.ExtrudeGeometry(sh,{depth:Math.max(.001,d-2*r),bevelEnabled:true,bevelThickness:r,bevelSize:r,bevelSegments:4,curveSegments:5});g.translate(0,0,-(d-2*r)/2);
 g.computeVertexNormals();const p=g.attributes.position,n=g.attributes.normal,m=new Map(),kf=i=>p.getX(i).toFixed(3)+','+p.getY(i).toFixed(3)+','+p.getZ(i).toFixed(3);
 for(let i=0;i<p.count;i++){const k=kf(i);let e=m.get(k);if(!e){e=[0,0,0];m.set(k,e)}e[0]+=n.getX(i);e[1]+=n.getY(i);e[2]+=n.getZ(i)}
 for(let i=0;i<p.count;i++){const e=m.get(kf(i)),l=Math.hypot(e[0],e[1],e[2])||1;n.setXYZ(i,e[0]/l,e[1]/l,e[2]/l)}
 RBC.set(key,g);return g}
function makeChar(){
 const g=new THREE.Group(),rig=new THREE.Group();g.add(rig);const J={};const up=new THREE.Group();rig.add(up);
 const part=(w,h,d,col,mat)=>{const m=new THREE.Mesh(rbox(w,h,d,.17),mat||lam(col));m.material.emissive.copy(m.material.color).multiplyScalar(.18);m.castShadow=true;return m};
 const hm=lam(OPT.skin[AV.skin][1]);hm.emissive.copy(hm.color).multiplyScalar(.18);
 const hp=[[0,-.6],[.3,-.6],[.45,-.58],[.56,-.5],[.62,-.4],[.65,-.28],[.65,.15]];for(let i=1;i<=14;i++){const a=i/14*Math.PI/2;hp.push([.65*Math.cos(a),.15+.45*Math.sin(a)])}J.head=new THREE.Mesh(new THREE.LatheGeometry(hp.map(p=>new THREE.Vector2(p[0],p[1])),48),hm);J.head.castShadow=true;J.head.position.y=4.6;const fc=new THREE.Mesh(new THREE.PlaneGeometry(.7,.7),new THREE.MeshBasicMaterial({map:faceTex(OPT.face[AV.face][1]),transparent:true}));fc.position.set(0,-.05,.655);J.head.add(fc);
 J.torso=part(2,2,1,OPT.shirt[AV.shirt][1]);J.torso.position.y=3;
 up.add(J.head,J.torso);
 const limb=(x,y,col,u)=>{const p=new THREE.Group();p.position.set(x,y,0);const m=part(1,2,1,col);m.position.y=-1;p.add(m);(u?up:rig).add(p);return p};
 const SK=OPT.skin[AV.skin][1],PN=OPT.pants[AV.pants][1];J.aL=limb(-1.5,4,SK,1);J.aR=limb(1.5,4,SK,1);J.lL=limb(-.5,2,PN);J.lR=limb(.5,2,PN);
 const C={g,rig,up,J,ph:0,t:0,hs:0,emote:null,vy:0,gr:false,yaw:0,x:0,y:0,z:0};dress(C);scene.add(g);return C
}
function animate(c,dt){
 const J=c.J,sp=c.hs/16,t=c.t;
 const T={aLx:0,aLz:-.14,aRx:0,aRz:.14,lLx:0,lRx:0,ty:0,by:0,hy:0};
 if(!c.gr){ // jump / fall
  if(c.vy>0){T.aLx=T.aRx=-2.6;T.aLz=-.3;T.aRz=.3;T.lLx=.3;T.lRx=-.2}
  else{T.aLx=T.aRx=-2;T.aLz=-1.1;T.aRz=1.1;T.lLx=-.4;T.lRx=.4}
 }else if(sp>.05){ // walk
  c.ph+=dt*14;const s=Math.sin(c.ph)*.9;
  T.lLx=s;T.lRx=-s;T.aLx=-s*.9;T.aRx=s*.9;T.by=Math.abs(Math.cos(c.ph))*.25;T.ty=-s*.15;
 }else if(c.emote==='wave'){T.aRx=-3.1;T.aRz=.3+Math.sin(t*10)*.6;T.hy=.2;T.by=Math.sin(t*1.8)*.05}
 else if(c.emote==='dance'){const s=Math.sin(t*8);
  T.aLx=-2.8*(s>0?1:.3);T.aRx=-2.8*(s>0?.3:1);T.lLx=s*.5;T.lRx=-s*.5;T.ty=Math.sin(t*4)*.5;T.by=Math.abs(s)*.4;T.hy=Math.sin(t*4)*.4}
 else if(c.emote==='cheer'){T.aLx=T.aRx=-3.1;T.aLz=-.35;T.aRz=.35;T.by=Math.abs(Math.sin(t*7))*.7}else if(c.emote==='point'){T.aRx=-1.57;T.aRz=0;T.hy=.25}else if(c.emote==='laugh'){const l=Math.sin(t*22);T.hx=-.35+l*.12;T.by=l*.08;T.aLx=T.aRx=-.5}else if(c.emote==='sit'){T.ry=-1.5;T.lLx=T.lRx=-1.55;T.aLx=T.aRx=-.5}else if(c.emote==='shrug'){T.aLz=-1.2;T.aRz=1.2;T.aLx=T.aRx=-.6;T.hx=.12;T.hy=Math.sin(t*3)*.2}else{const b=Math.sin(t*2);T.aLx=Math.sin(t*1.1)*.07;T.aRx=-Math.sin(t*1.1)*.07;T.aLz=-.13-b*.04;T.aRz=.13+b*.04;T.hx=Math.sin(t*.9)*.07;T.by=Math.sin(t*1.8)*.06;T.hy=Math.sin(t*.7)*.35} // idle
 const k=1-Math.exp(-16*dt),lr=(o,p,v)=>o[p]+=(v-o[p])*k;
 lr(J.aL.rotation,'x',T.aLx);lr(J.aL.rotation,'z',T.aLz);lr(J.aR.rotation,'x',T.aRx);lr(J.aR.rotation,'z',T.aRz);
 lr(J.lL.rotation,'x',T.lLx);lr(J.lR.rotation,'x',T.lRx);lr(c.up.rotation,'y',T.ty);lr(J.head.rotation,'y',T.hy);lr(J.head.rotation,'x',T.hx||0);lr(c.up.position,'y',T.by);lr(c.rig.position,'y',T.ry||0);if(c.cape)lr(c.cape.rotation,'x',.08+sp*.45+(c.gr?0:.5));
 c.g.position.set(c.x,c.y,c.z);c.g.rotation.y=c.yaw;if(c.fxu)c.fxu(c.t);if(c.prop)c.prop.rotation.y=c.t*20;
}
function newP(x,y,z){return Object.assign(makeChar(),{x,y,z})}
function ctrl(P,dt,S){
 const f=(F()?1:0)-(B()?1:0),r=(R()?1:0)-(L()?1:0),sy=Math.sin(yaw),cy=Math.cos(yaw);
 let dx=-sy*f+cy*r,dz=-cy*f-sy*r;const m=Math.hypot(dx,dz);
 if(m>0){dx/=m;dz/=m;P.emote=null;P.hs=16;P.x+=dx*16*dt;P.z+=dz*16*dt;
  let d=Math.atan2(dx,dz)-P.yaw;d=Math.atan2(Math.sin(d),Math.cos(d));P.yaw+=d*Math.min(1,dt*14)}else P.hs=0;
 if(P.gr&&keys.Space){P.vy=53;P.gr=false;P.emote=null}
 const py=P.y;P.vy-=196*(P.gs||1)*dt;P.y+=P.vy*dt;P.gr=false;
 for(const s of S){
  const inside=s.r?Math.hypot(P.x-s.x,P.z-s.z)<s.r:Math.abs(P.x-s.x)<s.hw+.6&&Math.abs(P.z-s.z)<s.hd+.6;
  if(inside&&P.vy<=0&&py>=s.top-.05&&P.y<=s.top){P.y=s.top;P.vy=0;P.gr=true;P.land=s}}
 for(const s of S){if(s.r)continue;const ex=s.hw+.6,ez=s.hd+.6,dx=P.x-s.x,dz=P.z-s.z;if(Math.abs(dx)<ex&&Math.abs(dz)<ez&&P.y<s.top-.05&&P.y+5>bt(s)){if(P.vy>0&&py+5<=bt(s)+.5){P.y=bt(s)-5;P.vy=0}else if(ex-Math.abs(dx)<ez-Math.abs(dz))P.x=s.x+(dx<0?-ex:ex);else P.z=s.z+(dz<0?-ez:ez)}}
 P.t+=dt;animate(P,dt);
 const cp=Math.cos(pitch);
 {const ox=P.x,oy=P.y+4,oz=P.z,ax=Math.sin(yaw)*cp*dist,ay=Math.sin(pitch)*dist,az=Math.cos(yaw)*cp*dist;let tt=1;for(const s of S){if(s.r)continue;let t0=0,t1=1;for(const w of [[ox,ax,s.x-s.hw,s.x+s.hw],[oy,ay,bt(s),s.top],[oz,az,s.z-s.hd,s.z+s.hd]]){const o=w[0],d=w[1];if(Math.abs(d)<1e-6){if(o<w[2]||o>w[3]){t0=2;break}}else{let a=(w[2]-o)/d,b=(w[3]-o)/d;if(a>b){const q=a;a=b;b=q}t0=Math.max(t0,a);t1=Math.min(t1,b);if(t0>t1){t0=2;break}}}if(t0<=1&&t0<tt)tt=t0}const f=tt<1?Math.max(.15,tt-.05):1;camera.position.set(ox+ax*f,oy+ay*f,oz+az*f)}
 camera.lookAt(P.x,P.y+4,P.z);
 sunFollow(P.x,P.y,P.z);
}
const setB=t=>{const b=document.getElementById('banner');b.textContent=t||'';b.style.display=t?'block':'none'};const showOver=t=>{if(!t)setB('');over.textContent=t||'';over.style.display=t?'flex':'none'};

/* ---------- Games ---------- */
/* ---------- Multiplayer (room presence) ---------- */
let room=null,usr=null,lastSend=0,curId='';
const RM=new Map(),nick='Player'+(1000+Math.floor(Math.random()*9000)),online=document.getElementById('online');
const num=v=>typeof v==='number'&&isFinite(v)?v:0;
function mulb(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function tag(txt){const c=document.createElement('canvas');c.width=256;c.height=64;const x=c.getContext('2d');x.font='bold 30px system-ui';x.textAlign='center';x.fillStyle='rgba(0,0,0,.55)';x.fillRect(0,8,256,48);x.fillStyle='#fff';x.fillText(String(txt).slice(0,16),128,43);const s=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(c),depthTest:false}));s.scale.set(5,1.25,1);s.position.y=7.6;return s}
let sb=null,ch=null,mine={};const PEERS=new Map(),myId=(window.crypto&&crypto.randomUUID)?crypto.randomUUID():String(Math.random()).slice(2);
function leaveRoom(){
 if(ch){try{ch.send({type:'broadcast',event:'bye',payload:{id:myId}})}catch(e){}try{sb.removeChannel(ch)}catch(e){}}
 ch=null;room=null;PEERS.clear();online.textContent='';
}
function joinRoom(code){
 leaveRoom();
 if(!SB_URL||!SB_KEY||!window.supabase){online.textContent=SB_URL?'':'(multiplayer not set up)';return}
 try{
  sb=sb||supabase.createClient(SB_URL,SB_KEY);
  const c=sb.channel('hub-'+code,{config:{broadcast:{self:false}}});
  c.on('broadcast',{event:'p'},m=>{const p=m&&m.payload;if(!p||typeof p.id!=='string'||p.id===myId||typeof p.s!=='object'||!p.s)return;PEERS.set(p.id,{t:Date.now(),s:p.s})})
   .on('broadcast',{event:'bye'},m=>{if(m&&m.payload)PEERS.delete(m.payload.id)})
   .on('broadcast',{event:'c'},m=>{const p=m&&m.payload;if(p&&typeof p.t==='string'&&typeof p.id==='string'&&p.id!==myId)gotChat(p.id,p.t,p.n)})
   .subscribe();
  ch=c;
  room={
   presence(o){mine=o;return c.send({type:'broadcast',event:'p',payload:{id:myId,s:o}})},
   peers(){const now=Date.now(),out=[];for(const [id,v] of PEERS){if(now-v.t>4000){PEERS.delete(id);continue}out.push({peer:id,sameTab:false,kind:'viewer',by:null,isMe:false,presence:v.s,updatedAt:v.t})}return out}
  };
 }catch(e){console.warn('multiplayer failed',e);ch=null;room=null}
}
setInterval(()=>{if(room){const n=room.peers().length+1;online.textContent=n>1?'\ud83d\udfe2 '+n+' online':'\ud83d\udfe2 connected'}},1000);
addEventListener('beforeunload',leaveRoom);
function mpTick(dt,id){
 if(!room||!cur||!cur.P)return;
 const P=cur.P,now=performance.now();
 if(now-lastSend>80){lastSend=now;const r=v=>Math.round(v*10)/10;room.presence(Object.assign({g:id,x:r(P.x),y:r(P.y),z:r(P.z),yaw:r(P.yaw),hs:P.hs?1:0,gr:P.gr?1:0,vy:Math.round(P.vy||0),em:P.emote||'',av:AV,n:(document.getElementById('nick').value||nick)},cur.ex?cur.ex():{})).catch(()=>{})}
 const seen=new Set(),k=1-Math.exp(-12*dt);
 for(const p of room.peers()){
  const q=p.presence;if(p.sameTab||p.kind!=='viewer'||q.g!==id||typeof q.x!=='number')continue;
  seen.add(p.peer);let c=RM.get(p.peer);
  if(!c){const av={},sv=AV;for(const f in OPT){const i=q.av&&q.av[f];av[f]=Number.isInteger(i)&&OPT[f][i]?i:0}
   AV=av;c=newP(num(q.x),num(q.y),num(q.z));AV=sv;c.yaw=num(q.yaw);c.pid=p.peer;RM.set(p.peer,c)}
  if(c.g.parent!==scene)scene.add(c.g);
  c.x+=(num(q.x)-c.x)*k;c.y+=(num(q.y)-c.y)*k;c.z+=(num(q.z)-c.z)*k;
  let d=num(q.yaw)-c.yaw;d=Math.atan2(Math.sin(d),Math.cos(d));c.yaw+=d*k;
  c.hs=q.hs?16:0;c.gr=!!q.gr;c.vy=num(q.vy);c.emote=Object.values(EMK).includes(q.em)?q.em:null;c.t+=dt;animate(c,dt);c.q=q;if(cur.rem)cur.rem(c,q,dt);
  if(!c.nm){c.nm=1;(async()=>{let nm=String(q.n||'Player').replace(/[^\w ]/g,'').slice(0,16)||'Player';try{if(p.by&&usr&&usr.profiles){const ps=await usr.profiles([p.by]);nm=(ps[p.by]&&ps[p.by].name)||nm}}catch(e){}if(c.tag)c.g.remove(c.tag);c.tag=tag(nm);c.g.add(c.tag)})()}
 }
 for(const [pk,c] of RM)if(!seen.has(pk)){scene.remove(c.g);RM.delete(pk)}
 scoreEl.textContent+=' · 👥 '+(seen.size+1)
}
const EMK={Digit1:'wave',Digit2:'dance',Digit3:'cheer',Digit4:'point',Digit5:'laugh',Digit6:'sit',Digit7:'shrug'};
const EMN=[['wave','\ud83d\udc4b Wave'],['dance','\ud83d\udc83 Dance'],['cheer','\ud83d\ude4c Cheer'],['point','\ud83d\udc49 Point'],['laugh','\ud83d\ude02 Laugh'],['sit','\ud83e\ude91 Sit'],['shrug','\ud83e\udd37 Shrug']];
const emp=document.getElementById('emp'),emb=document.getElementById('emb'),chatin=document.getElementById('chatin'),clog=document.getElementById('clog'),lobby=document.getElementById('lobby');
EMN.forEach(([k,l],i)=>{const b=document.createElement('button');b.textContent=(i+1)+'  '+l;b.onclick=()=>{if(cur&&cur.P&&!cur.P.dead)cur.P.emote=k;emp.style.display='none'};emp.appendChild(b)});
emb.onclick=()=>{emp.style.display=emp.style.display==='flex'?'none':'flex'};
document.getElementById('fs').onclick=()=>{const d=document.documentElement;if(document.fullscreenElement)document.exitFullscreen();else if(d.requestFullscreen)d.requestFullscreen().catch(()=>{})};
let lastHp=100;
function setHP(v){const h=document.getElementById('hp');if(v==null){h.style.display='none';return}h.style.display='block';const f=document.getElementById('hpf');f.style.width=Math.max(0,v)+'%';f.style.background='hsl('+(v*1.2)+',70%,45%)';document.getElementById('hpt').textContent=Math.ceil(v);
 if(v<lastHp-.05){const u=document.getElementById('hurt');u.style.transition='none';u.style.opacity=.5;requestAnimationFrame(()=>{u.style.transition='opacity .5s';u.style.opacity=0})}lastHp=v}
/* Roblox-style break apart: every body part (and hat) flies off */
const DEB=[];
function explode(c,q){if(!q)snd(260,.25,'square',.15,90);
 const J=c.J,pw=new THREE.Vector3(),pq=new THREE.Quaternion();
 const add=src=>{
  src.getWorldPosition(pw);src.getWorldQuaternion(pq);
  const g=new THREE.Group(),cl=(ch,dy)=>{const k=new THREE.Mesh(ch.geometry,ch.material);k.position.copy(ch.position);k.quaternion.copy(ch.quaternion);k.scale.copy(ch.scale);k.position.y+=dy;k.castShadow=true;g.add(k)};
  if(src.isMesh){const k=new THREE.Mesh(src.geometry,src.material);k.castShadow=true;g.add(k);src.children.forEach(ch=>{if(ch.isMesh)cl(ch,0)})}
  else src.children.forEach(ch=>{if(ch.isMesh)cl(ch,1)});
  g.position.copy(pw).add(new THREE.Vector3(0,src.isMesh?0:-1,0).applyQuaternion(pq));g.quaternion.copy(pq);scene.add(g);
  DEB.push({g,v:new THREE.Vector3((Math.random()-.5)*28,14+Math.random()*22,(Math.random()-.5)*28),w:new THREE.Vector3((Math.random()-.5)*14,(Math.random()-.5)*14,(Math.random()-.5)*14),life:14})};
 [J.head,J.torso,J.aL,J.aR,J.lL,J.lR].forEach(add)}
function debrisTick(dt){
 const S=cur&&cur.S,R=.6;
 for(let i=DEB.length-1;i>=0;i--){const d=DEB[i],p=d.g.position,py=p.y,land=()=>{d.v.y*=-.4;if(Math.abs(d.v.y)<5)d.v.y=0;d.v.x*=.75;d.v.z*=.75;d.w.multiplyScalar(.6)};
  d.v.y-=70*dt;p.addScaledVector(d.v,dt);d.g.rotation.x+=d.w.x*dt;d.g.rotation.y+=d.w.y*dt;d.g.rotation.z+=d.w.z*dt;
  if(S){for(const sd of S){
    const dx=p.x-sd.x,dz=p.z-sd.z,tp=sd.top+R;
    if(sd.r){if(Math.hypot(dx,dz)<sd.r&&p.y<tp&&p.y>-4){p.y=tp;land()}continue}
    const ex=sd.hw+R,ez=sd.hd+R,bo=bt(sd);
    if(Math.abs(dx)>=ex||Math.abs(dz)>=ez||p.y>=tp||p.y<=bo-R)continue;
    if(py>=tp-.01&&d.v.y<=0){p.y=tp;land()}
    else if(py<=bo-R+.01&&d.v.y>0){p.y=bo-R;d.v.y*=-.3}
    else if(ex-Math.abs(dx)<ez-Math.abs(dz)){p.x=sd.x+(dx<0?-ex:ex);d.v.x*=-.4}
    else{p.z=sd.z+(dz<0?-ez:ez);d.v.z*=-.4}}}
  else if(p.y<.6){p.y=.6;land()}
  if(p.y<-12)d.life=0;
  d.life-=dt;if(d.life<=0){if(scene)scene.remove(d.g);DEB.splice(i,1)}}}
function clearDebris(){DEB.forEach(d=>{if(scene)scene.remove(d.g)});DEB.length=0}
const roomCode=()=>(document.getElementById('roomcode').value||'public').trim().toLowerCase().replace(/[^a-z0-9_-]/g,'').slice(0,20)||'public';
const myName=()=>String(document.getElementById('nick').value||nick).replace(/[^\w ]/g,'').slice(0,16)||'Player';
function bubble(c,txt){if(!c)return;if(c.bub)c.g.remove(c.bub);const cv=document.createElement('canvas');cv.width=512;cv.height=64;const x=cv.getContext('2d');x.font='bold 26px system-ui';x.textAlign='center';x.fillStyle='rgba(255,255,255,.92)';x.fillRect(0,6,512,48);x.fillStyle='#111';x.fillText(txt.slice(0,34),256,41);const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(cv),depthTest:false}));sp.scale.set(10,1.25,1);sp.position.y=9;c.g.add(sp);c.bub=sp;setTimeout(()=>{if(c.bub===sp){c.g.remove(sp);c.bub=null}},6000)}
function logChat(n,t){const d=document.createElement('div');d.textContent=n+': '+t;clog.appendChild(d);while(clog.children.length>6)clog.removeChild(clog.firstChild);setTimeout(()=>d.remove(),15000)}
function gotChat(id,t,n){t=String(t).slice(0,80);n=String(n||'Player').replace(/[^\w ]/g,'').slice(0,16)||'Player';logChat(n,t);if(cur&&RM.has(id))bubble(RM.get(id),t)}
function sendChat(t){t=t.slice(0,80);logChat(myName(),t);if(cur&&cur.P)bubble(cur.P,t);if(ch)ch.send({type:'broadcast',event:'c',payload:{id:myId,t,n:myName()}}).catch(()=>{})}
addEventListener('keydown',e=>{if(e.code!=='Enter'||!cur||!cur.d3||!modal.classList.contains('on')||lobby.style.display==='flex')return;
 if(document.activeElement===chatin){const t=chatin.value.trim();chatin.value='';chatin.blur();if(t)sendChat(t)}else{if(document.pointerLockElement)document.exitPointerLock();chatin.focus();e.preventDefault()}});
let lobbyT=0,pendG=null;
function lobbyTick(){if(!pendG)return;const names=[myName()+' (you)'];
 if(room){room.presence({g:pendG.id,lb:1,n:myName()}).catch(()=>{});for(const p of room.peers())if(p.presence.g===pendG.id)names.push(String(p.presence.n||'Player').replace(/[^\w ]/g,'').slice(0,16)||'Player')}
 document.getElementById('lbl').innerHTML='<div style="margin-bottom:4px">Players here ('+names.length+')</div>'+names.map(n=>'<span class="pc">👤 '+n+'</span>').join('')}
function showLobby(g){pendG=g;lobby.style.display='flex';const m=META[g.id]||{},a=document.getElementById('lba');a.style.background=bgOf(g);a.textContent=g.e;
 document.getElementById('lbt').textContent=g.name;document.getElementById('lbtg').innerHTML=[catOf(g),m.m].concat(m.t||[]).filter(Boolean).map(t=>'<span>'+t+'</span>').join('');document.getElementById('lbh').textContent=g.hint||'';
 document.getElementById('lbc').textContent='Room: '+roomCode()+(room?'':' \u00b7 offline (solo)')+(g.id==='mm'?' \u00b7 needs 2+ players':'');
 document.getElementById('lbcp').onclick=function(){const u=location.origin+location.pathname+'?room='+roomCode()+'&game='+g.id;(navigator.clipboard?navigator.clipboard.writeText(u):Promise.reject()).then(()=>{this.textContent='Copied!'}).catch(()=>prompt('Copy this invite link',u));setTimeout(()=>{this.textContent='\ud83d\udd17 Copy invite'},1800)};
 document.getElementById('lbback').onclick=()=>document.getElementById('close').click();lobbyT=setInterval(lobbyTick,700);lobbyTick()}
document.getElementById('lbgo').onclick=()=>{clearInterval(lobbyT);lobby.style.display='none';pendG=null;startGame();lockMouse()};document.getElementById('hlp').onclick=()=>hint.classList.toggle('on');
let AC=null,mute=false;
function snd(f,d,t,v,e){if(mute)return;try{AC=AC||new (window.AudioContext||window.webkitAudioContext)();AC.resume();const o=AC.createOscillator(),g=AC.createGain(),n=AC.currentTime;o.type=t||'square';o.frequency.setValueAtTime(f,n);if(e)o.frequency.exponentialRampToValueAtTime(e,n+d);g.gain.setValueAtTime((v||.12)*(ST.vol==null?1:ST.vol),n);g.gain.exponentialRampToValueAtTime(.001,n+d);o.connect(g);g.connect(AC.destination);o.start();o.stop(n+d)}catch(x){}}
const FXL=[];let shk=0;
function fxAdd(m,life,v,grow){scene.add(m);FXL.push({m,life,max:life,v:v||null,grow:grow||0})}
function fxTick(dt){for(let i=FXL.length-1;i>=0;i--){const f=FXL[i];f.life-=dt;if(f.v)f.m.position.addScaledVector(f.v,dt);if(f.grow)f.m.scale.addScalar(f.grow*dt);f.m.material.opacity=Math.max(0,f.life/f.max);if(f.life<=0){if(scene)scene.remove(f.m);FXL.splice(i,1)}}}
const bm=(g,c)=>new THREE.Mesh(g,new THREE.MeshBasicMaterial({color:c,transparent:true}));
function fxBurst(x,y,z,c){const m=bm(new THREE.SphereGeometry(1,10,8),c);m.position.set(x,y,z);fxAdd(m,.35,null,10)}
function fxSlash(p){const m=bm(new THREE.BoxGeometry(.25,4,.25),0xffffff);m.position.set(p.x+Math.sin(p.yaw)*2.6,p.y+3.4,p.z+Math.cos(p.yaw)*2.6);m.rotation.set(0,p.yaw,.9);fxAdd(m,.18,null,0)}
function muzzle(p){const m=bm(new THREE.SphereGeometry(.5,8,6),0xffd54a);m.position.set(p.x+Math.sin(p.yaw)*3.8,p.y+3.8,p.z+Math.cos(p.yaw)*3.8);fxAdd(m,.09,null,0)}
function fxTrace(p,L){const m=bm(new THREE.BoxGeometry(.15,.15,L),0xffe066);m.position.set(p.x+Math.sin(p.yaw)*L/2,p.y+3.8,p.z+Math.cos(p.yaw)*L/2);m.rotation.y=p.yaw;fxAdd(m,.14,null,0);muzzle(p)}
function fxKnife(p,L){const m=bm(new THREE.BoxGeometry(.2,.2,1.6),0xe6ecf2);m.position.set(p.x+Math.sin(p.yaw)*2,p.y+3.8,p.z+Math.cos(p.yaw)*2);m.rotation.y=p.yaw;fxAdd(m,Math.max(.1,L/110),new THREE.Vector3(Math.sin(p.yaw)*110,0,Math.cos(p.yaw)*110),0)}
function reveal(t,c,sub){const r=document.getElementById('rev');r.innerHTML='<span style="color:'+c+'">'+t+'</span><small>'+sub+'</small>';r.classList.remove('on');void r.offsetWidth;r.classList.add('on');snd(220,.4,'sawtooth',.14,440)}
function tally(n,cyc,my){const c=Array(n).fill(0);if(my>=0)c[my]++;for(const ch of RM.values()){const q=ch.q;if(q&&q.vc===cyc&&Number.isInteger(q.v)&&q.v>=0&&q.v<n)c[q.v]++}return c}
function pickMap(n,cyc,my){const pk=[];for(const ch of RM.values()){const q=ch.q;if(q&&q.mc===cyc&&Number.isInteger(q.mk)&&q.mk>=0&&q.mk<n)pk.push(q.mk)}
 if(pk.length)return pk.sort((a,b)=>pk.filter(v=>v===b).length-pk.filter(v=>v===a).length)[0];
 const c=tally(n,cyc,my),mx=Math.max(...c),top=c.map((v,i)=>v===mx?i:-1).filter(i=>i>=0);return top[Math.floor(mulb(cyc+900)()*top.length)]}
function voteUI(names,pick){const el=document.getElementById('vote');el.innerHTML='<b>Vote for the next map (press its number)</b>'+names.map((n,i)=>'<button data-i="'+i+'"><span>'+(i+1)+'. '+n+'</span><em>0</em></button>').join('')+'<small></small>';el.querySelectorAll('button').forEach(b=>b.onclick=()=>pick(+b.dataset.i));return el}
function voteSet(el,counts,mine,on){el.style.display=on?'flex':'none';if(!on)return;el.querySelectorAll('button').forEach((b,i)=>{b.lastChild.textContent=counts[i]||0;b.classList.toggle('on',i===mine)});
 const nm=[myName()+' (you)'];for(const c of RM.values())nm.push(String(c.q&&c.q.n||'Player').replace(/[^\w ]/g,'').slice(0,14));el.lastChild.textContent='Players here ('+nm.length+'): '+nm.join(', ')}
(()=>{let p={};try{p=JSON.parse(localStorage.getItem('hubp')||'{}')}catch(e){}
 const q=new URLSearchParams(location.search).get('room'),n=document.getElementById('nick'),r=document.getElementById('roomcode'),mt=document.getElementById('mt');
 if(p.n)n.value=p.n;if(q)r.value=q.slice(0,20);else if(p.r)r.value=p.r;if(p.m){mute=true;mt.textContent='\ud83d\udd07'}
 const sv=()=>{try{localStorage.setItem('hubp',JSON.stringify({n:n.value,r:r.value,m:mute}))}catch(e){}};n.onchange=sv;r.onchange=sv;
 mt.onclick=()=>{mute=!mute;mt.textContent=mute?'\ud83d\udd07':'\ud83d\udd0a';sv()};
 document.getElementById('inv').onclick=function(){const u=location.origin+location.pathname+'?room='+roomCode();(navigator.clipboard?navigator.clipboard.writeText(u):Promise.reject()).then(()=>{this.textContent='Copied!'}).catch(()=>prompt('Copy this link',u));setTimeout(()=>{this.textContent='\ud83d\udd17 Invite Friends'},2000)}})();
addEventListener('keydown',e=>{if(e.code==='Escape'){emp.style.display='none';if(lobby.style.display==='flex')document.getElementById('close').click()}});
let PMIN=.05;
const ZAVS=[0,1,2,3].map(ty=>{const a={};for(const k in OPT)a[k]=0;a.skin=[5,4,3,8][ty];a.shirt=[2,0,1,2][ty];a.pants=1;a.face=ty===1?4:5;return a});
function pushOut(c,S){for(const s of S){if(s.r)continue;const ex=s.hw+.6,ez=s.hd+.6,dx=c.x-s.x,dz=c.z-s.z;if(Math.abs(dx)<ex&&Math.abs(dz)<ez&&c.y<s.top-.05){if(ex-Math.abs(dx)<ez-Math.abs(dz))c.x=s.x+(dx<0?-ex:ex);else c.z=s.z+(dz<0?-ez:ez)}}}
addEventListener('mousedown',e=>{if(document.pointerLockElement){if(e.button===0)keys.Mouse0=true;if(e.button===2)keys.Mouse2=true}});addEventListener('mouseup',e=>{if(e.button===0)keys.Mouse0=false;if(e.button===2)keys.Mouse2=false});addEventListener('contextmenu',e=>{if(cur&&cur.fps)e.preventDefault()});addEventListener('wheel',e=>{if(cur&&cur.wheel&&document.pointerLockElement)cur.wheel(e.deltaY>0?1:-1)},{passive:true});
document.addEventListener('mousemove',e=>{if(document.pointerLockElement){yaw-=e.movementX*SENS;pitch=Math.max(PMIN,Math.min(1.3,pitch+e.movementY*SENS))}});
document.addEventListener('click',e=>{if(cur&&cur.fps&&view.contains(e.target)&&!['BUTTON','INPUT'].includes(e.target.tagName)&&lobby.style.display!=='flex')lockMouse()});
/* sun follows the player but snaps to shadow-map texels so shadows never shimmer */
const SUNO=new THREE.Vector3(25,80,35),SZ=SUNO.clone().normalize(),SX=new THREE.Vector3(0,1,0).cross(SZ).normalize(),SY=SZ.clone().cross(SX);
function sunFollow(x,y,z){if(!sun)return;const T=2*sun.shadow.camera.right/sun.shadow.mapSize.x,px=Math.round((x*SX.x+y*SX.y+z*SX.z)/T)*T,py=Math.round((x*SY.x+y*SY.y+z*SY.z)/T)*T,pz=x*SZ.x+y*SZ.y+z*SZ.z;
 const t=SX.clone().multiplyScalar(px).add(SY.clone().multiplyScalar(py)).add(SZ.clone().multiplyScalar(pz));sun.position.copy(t).add(SUNO);sun.target.position.copy(t)}
function gw(html){const d=document.createElement('div');d.className='gw';d.innerHTML=html;view.appendChild(d);return d}
const fm=n=>n>=1e6?(n/1e6).toFixed(2)+'M':n>=1e4?(n/1e3).toFixed(1)+'K':String(Math.floor(n));
let lockErr='';
function lockMouse(){if(!(renderer&&cur&&cur.fps)||document.pointerLockElement)return;
 try{const r=renderer.domElement.requestPointerLock();if(r&&r.then)r.then(()=>{lockErr=''},e=>{lockErr=(e&&e.name||'Error')+': '+(e&&e.message||'blocked')})}catch(e){lockErr=String(e&&e.message||e)}}
document.addEventListener('pointerlockerror',()=>{lockErr=lockErr||'The browser refused to lock the mouse'});
document.addEventListener('pointerlockchange',()=>{if(document.pointerLockElement)lockErr=''});
document.addEventListener('mousedown',e=>{if(cur&&cur.fps&&view.contains(e.target)&&!['BUTTON','INPUT'].includes(e.target.tagName)&&lobby.style.display!=='flex')lockMouse()},true);
function lockUI(){const on=!!(cur&&cur.fps&&!document.pointerLockElement&&lobby.style.display!=='flex'),k=on+'|'+lockErr;if(k!==lockUI.s){lockUI.s=k;const m=document.getElementById('lockmsg');m.style.display=on?'block':'none';m.textContent='\ud83d\uddb1 Click to lock your mouse (Esc releases it)'+(lockErr?'\n'+lockErr+'\nFallback: drag to look, press E to fire':'')}}
function hitMark(kill,head){const h=document.getElementById('hm');h.style.color=kill?'#ff3b30':head?'#ffd23a':'#fff';h.style.transition='none';h.style.opacity=1;h.style.transform='translate(-50%,-50%) scale(1.5)';requestAnimationFrame(()=>{h.style.transition='opacity .25s,transform .25s';h.style.opacity=0;h.style.transform='translate(-50%,-50%) scale(1)'})}
function xhSet(px){const x=document.getElementById('xh');x.style.width=x.style.height=px+'px';x.style.margin=(-px/2)+'px'}
function fpsCam(P){const ey=P.y+4.6,cp=Math.cos(pitch),d={x:-Math.sin(yaw)*cp,y:-Math.sin(pitch),z:-Math.cos(yaw)*cp};camera.position.set(P.x,ey,P.z);camera.lookAt(P.x+d.x,ey+d.y,P.z+d.z);P.yaw=yaw+Math.PI;return d}
function rayBox(o,d,s){const lo=[s.x-s.hw,bt(s),s.z-s.hd],hi=[s.x+s.hw,s.top,s.z+s.hd],oo=[o.x,o.y,o.z],dd=[d.x,d.y,d.z];let t0=0,t1=1e9;
 for(let i=0;i<3;i++){if(Math.abs(dd[i])<1e-6){if(oo[i]<lo[i]||oo[i]>hi[i])return Infinity}else{let a=(lo[i]-oo[i])/dd[i],b=(hi[i]-oo[i])/dd[i];if(a>b){const q=a;a=b;b=q}t0=Math.max(t0,a);t1=Math.min(t1,b);if(t0>t1)return Infinity}}return t0}
function raySph(o,d,cx,cy,cz,r){const ox=o.x-cx,oy=o.y-cy,oz=o.z-cz,b=ox*d.x+oy*d.y+oz*d.z,c=ox*ox+oy*oy+oz*oz-r*r,h=b*b-c;if(h<0)return Infinity;const t=-b-Math.sqrt(h);return t>0?t:Infinity}
function tracer(a,b,col){const L=Math.hypot(b.x-a.x,b.y-a.y,b.z-a.z);if(L<.5)return;const m=bm(new THREE.BoxGeometry(.07,.07,L),col||0xffe9a0);m.position.set((a.x+b.x)/2,(a.y+b.y)/2,(a.z+b.z)/2);m.lookAt(b.x,b.y,b.z);fxAdd(m,.12,null,0)}
function vmake(w){const g=new THREE.Group(),m=(a,b,c,col,x,y,z,em)=>{const k=new THREE.Mesh(new THREE.BoxGeometry(a,b,c),new THREE.MeshLambertMaterial({color:col,emissive:em||0x111111}));k.position.set(x,y,z);g.add(k)};
 m(.14,.18,.7,w.col,0,0,-.35,w.ray?0x228844:0x111111);m(.07,.07,w.len,0x222831,0,.04,-.7-w.len/2);m(.1,.26,.14,0x4a3a2a,0,-.2,-.1);if(w.long)m(.1,.16,.5,0x4a3a2a,0,-.02,.15);
 const fl=new THREE.Mesh(new THREE.SphereGeometry(.14,8,6),new THREE.MeshBasicMaterial({color:w.ray?0x66ffaa:0xffdd55}));fl.position.set(0,.04,-.7-w.len-.1);fl.visible=false;g.add(fl);g.userData.fl=fl;return g}
const cl=v=>String(v==null?'':v).replace(/[^\w -]/g,'').slice(0,20);
const myCode=(()=>{let c=null;try{c=localStorage.getItem('hubcode')}catch(e){}if(!c||!/^[a-z0-9]{8}$/.test(c)){c='';while(c.length<8)c+=Math.random().toString(36).slice(2);c=c.slice(0,8);try{localStorage.setItem('hubcode',c)}catch(e){}}return c})();
let FRS={};try{FRS=JSON.parse(localStorage.getItem('hubf')||'{}')}catch(e){}
const SEEN={},FCH=new Map(),frp=document.getElementById('frp'),saveF=()=>{try{localStorage.setItem('hubf',JSON.stringify(FRS))}catch(e){}};
function sbGet(){if(!SB_URL||!SB_KEY||!window.supabase)return null;try{sb=sb||supabase.createClient(SB_URL,SB_KEY)}catch(e){}return sb}
function fsend(code,ev,p){if(!sbGet())return;let c=FCH.get(code);if(!c){c={ch:sb.channel('u-'+code),ok:false,q:[]};c.ch.subscribe(st=>{if(st==='SUBSCRIBED'){c.ok=true;c.q.splice(0).forEach(m=>c.ch.send(m))}});FCH.set(code,c)}const m={type:'broadcast',event:ev,payload:p};if(c.ok)c.ch.send(m);else c.q.push(m)}
function toast(txt,btns){const t=document.createElement('div');t.className='toast';const sp=document.createElement('span');sp.textContent=txt;t.appendChild(sp);(btns||[]).forEach(([l,f])=>{const b=document.createElement('button');b.textContent=l;b.onclick=()=>{f();t.remove()};t.appendChild(b)});const x=document.createElement('button');x.textContent='\u2715';x.onclick=()=>t.remove();t.appendChild(x);document.getElementById('toasts').appendChild(t);setTimeout(()=>t.remove(),25000)}
const gameName=id=>{const g=GAMES.find(x=>x.id===id);return g?g.name:''};
function addFriend(code,name,silent){code=String(code||'').trim().toLowerCase();if(!/^[a-z0-9]{8}$/.test(code)||code===myCode){if(!silent)toast('That friend code is not valid.');return}
 if(!FRS[code]){FRS[code]=cl(name)||'Friend';saveF();fsend(code,'fr',{from:myCode,n:myName()});if(!silent)toast('Friend added! They will see you when they are online.')}renderFriends()}
function joinFriend(code){const s=SEEN[code];if(!s||!s.r)return;const r=document.getElementById('roomcode');r.value=s.r;r.dispatchEvent(new Event('change'));const gm=GAMES.find(x=>x.id===s.g);frp.classList.remove('on');
 if(gm){if(modal.classList.contains('on'))document.getElementById('close').click();openGame(gm)}else toast('Room set to '+s.r+'. Pick a game to join them!')}
function renderFriends(){const L=document.getElementById('frl');if(!L)return;L.innerHTML='';let n=0;
 for(const c of Object.keys(FRS)){const s=SEEN[c],on=!!(s&&Date.now()-s.t<20000);if(on)n++;
  const row=document.createElement('div');row.className='frr'+(on?' on':'');const d=document.createElement('span');d.className='dot';row.appendChild(d);
  const nm=document.createElement('div');nm.className='nm';nm.textContent=FRS[c];const sm=document.createElement('small');sm.textContent=on?(s.g?'Playing '+(gameName(s.g)||'a game')+' \u00b7 room '+s.r:'In the menu'):'Offline';nm.appendChild(sm);row.appendChild(nm);
  const mk=(l,f)=>{const b=document.createElement('button');b.textContent=l;b.onclick=f;row.appendChild(b)};
  if(on)mk('Join',()=>joinFriend(c));if(on)mk('Invite',()=>{fsend(c,'inv',{from:myCode,n:myName(),r:roomCode(),g:(cur&&modal.classList.contains('on'))?curId:''});toast('Invite sent to '+FRS[c])});
  mk('\u2715',()=>{delete FRS[c];saveF();renderFriends()});L.appendChild(row)}
 if(!Object.keys(FRS).length){const e=document.createElement('small');e.textContent='No friends yet. Share your link or code, or type a friend\u2019s code above.';L.appendChild(e)}
 document.getElementById('frb').textContent='\ud83d\udc65 Friends'+(n?' ('+n+')':'');document.getElementById('frn').textContent=sbGet()?'':'Friends need multiplayer to be set up.'}
function hb(){if(!sbGet())return;const p={id:myCode,n:myName(),r:roomCode(),g:(cur&&modal.classList.contains('on'))?curId:''};for(const c in FRS)fsend(c,'hb',p)}
function fmeInit(){const c=sbGet();if(!c||fmeInit.d)return;fmeInit.d=1;
 c.channel('u-'+myCode)
  .on('broadcast',{event:'hb'},m=>{const p=m&&m.payload;if(!p||typeof p.id!=='string'||!FRS[p.id])return;SEEN[p.id]={t:Date.now(),n:cl(p.n),r:cl(p.r),g:cl(p.g)};if(SEEN[p.id].n&&FRS[p.id]!==SEEN[p.id].n){FRS[p.id]=SEEN[p.id].n;saveF()}renderFriends()})
  .on('broadcast',{event:'fr'},m=>{const p=m&&m.payload;if(p&&typeof p.from==='string'&&/^[a-z0-9]{8}$/.test(p.from)&&p.from!==myCode&&!FRS[p.from])toast(cl(p.n)+' added you as a friend.',[['Add back',()=>addFriend(p.from,p.n,false)]])})
  .on('broadcast',{event:'inv'},m=>{const p=m&&m.payload;if(p&&FRS[p.from])toast(cl(p.n)+' invited you to '+(gameName(cl(p.g))||'a room')+' (room '+cl(p.r)+')',[['Join',()=>{SEEN[p.from]={t:Date.now(),n:cl(p.n),r:cl(p.r),g:cl(p.g)};joinFriend(p.from)}]])})
  .subscribe();
 for(const k in FRS)fsend(k,'hb',{id:myCode,n:myName(),r:roomCode(),g:''});setInterval(hb,8000);setTimeout(hb,2500)}
const openFr=()=>{frp.classList.toggle('on');if(frp.classList.contains('on')){if(document.pointerLockElement)document.exitPointerLock();document.getElementById('myc').textContent=myCode;renderFriends()}};
document.getElementById('frb').onclick=openFr;document.getElementById('frb2').onclick=openFr;document.getElementById('frx').onclick=()=>frp.classList.remove('on');
document.getElementById('cpc').onclick=function(){const u=location.origin+location.pathname+'?add='+myCode;(navigator.clipboard?navigator.clipboard.writeText(u):Promise.reject()).then(()=>{this.textContent='Copied!'}).catch(()=>prompt('Copy this friend link',u));setTimeout(()=>{this.textContent='Copy link'},2000)};
document.getElementById('addb').onclick=()=>{const i=document.getElementById('addc');addFriend(i.value);i.value=''};
document.getElementById('addc').addEventListener('keydown',e=>{if(e.key==='Enter')document.getElementById('addb').click()});
setInterval(()=>{if(frp.classList.contains('on'))renderFriends()},4000);
(()=>{const a=new URLSearchParams(location.search).get('add');if(a)addFriend(a,'Friend',false)})();
renderFriends();fmeInit();
const SP={on:false,i:0,k:null};
function orbitCam(c){sunFollow(c.x,c.y,c.z);const cp=Math.cos(pitch);camera.position.set(c.x+Math.sin(yaw)*cp*dist,c.y+4+Math.sin(pitch)*dist,c.z+Math.cos(yaw)*cp*dist);camera.lookAt(c.x,c.y+4,c.z)}
function specCam(){const L=[...RM.values()].filter(c=>!c.dead&&c.g.visible);if(!SP.on||!L.length)return false;SP.i=((SP.i%L.length)+L.length)%L.length;const c=L[SP.i];orbitCam(c);document.getElementById('spn').textContent=String(c.q&&c.q.n||'Player').replace(/[^\w ]/g,'').slice(0,14);return true}
function specUI(dead){const key=dead+'|'+SP.on;if(SP.k===key)return;SP.k=key;if(!dead)SP.on=false;document.getElementById('spec').style.display=dead?'flex':'none';document.getElementById('spc').style.display=SP.on?'inline':'none';document.getElementById('spt').textContent=SP.on?'\ud83d\udc41 Stop':'\ud83d\udc41 Spectate'}
document.getElementById('spt').onclick=()=>{SP.on=!SP.on;SP.k=null};
document.getElementById('spp').onclick=()=>{SP.i--};document.getElementById('spx').onclick=()=>{SP.i++};
const bt=s=>s.bot===undefined?s.top-1:s.bot;
const wr=a=>Math.atan2(Math.sin(a),Math.cos(a));
function aim(src,list,range,cone){let best=null,bd=1e9;for(const c of list){if(c===src||c.dead)continue;const dx=c.x-src.x,dz=c.z-src.z,d=Math.hypot(dx,dz);if(d>range||d>=bd)continue;if(Math.abs(wr(Math.atan2(dx,dz)-src.yaw))<cone){bd=d;best=c}}return best}
function wpn(c,k){const g=new THREE.Group(),p=(geo,col,x,y,z,e)=>{const m=new THREE.Mesh(geo,new THREE.MeshLambertMaterial({color:col,emissive:e||0}));m.position.set(x,y,z);m.castShadow=true;g.add(m);return m};
 if(k==='m'){p(new THREE.BoxGeometry(.18,.6,.18),0x3a2a22,0,-1.9,0);p(new THREE.BoxGeometry(.55,.1,.16),0xd4a017,0,-2.25,0);p(new THREE.BoxGeometry(.28,1.4,.05),0xe6ecf2,0,-3,0,0x445566);const t=p(new THREE.ConeGeometry(.14,.4,4),0xe6ecf2,0,-3.9,0,0x445566);t.rotation.z=Math.PI}
 else{p(new THREE.BoxGeometry(.26,.7,.3),0x5a3a22,0,-1.95,-.1);p(new THREE.BoxGeometry(.3,.9,.34),0x2b2f36,0,-2.55,0);p(new THREE.BoxGeometry(.16,.9,.16),0x8d96a3,0,-3.3,0,0x222a33)}
 c.J.aR.add(g);g.visible=false;c.w=g}
const ENG={};
function loop(){if(ST.cap){const n=performance.now();if(n-lastF<1000/ST.cap-3){raf=requestAnimationFrame(loop);return}lastF=n}fpsTick();const dt=Math.min(clock.getDelta(),.05);cur.update(dt);debrisTick(dt);fxTick(dt);lockUI();if(cur.d3&&curId!=='avatar')mpTick(dt,curId);if(shk>0&&camera){if(ST.shake!==false){camera.position.x+=(Math.random()-.5)*shk;camera.position.y+=(Math.random()-.5)*shk}shk=Math.max(0,shk-dt*3)}if(cur.d3)renderer.render(scene,camera);raf=requestAnimationFrame(loop)}
function openGame(g){noteRecent(g.id);
 cur=ENG[g.id];curId=g.id;RM.clear();if(g.id!=='avatar'&&g.id!=='pets')joinRoom(roomCode());document.getElementById('gtitle').textContent=g.name;hint.textContent=g.hint;scoreEl.textContent='';
 document.getElementById('rev').classList.remove('on');modal.classList.add('on');modal.classList.toggle('shop',g.id==='avatar');
 view.style.display=cur.d3?'block':'none';petview.style.display=cur.d3?'none':'block';touch.classList.toggle('on',cur.d3&&g.id!=='avatar');custom.style.display=g.id==='avatar'?'block':'none';emb.style.display=cur.d3?'block':'none';chatin.style.display=cur.d3&&g.id!=='avatar'?'block':'none';emp.style.display='none';setHP(null);document.getElementById('mmb').style.display=['mm','zom','snow','fish','garden'].includes(g.id)?'contents':'none';
 if(cur.d3){if(typeof THREE==='undefined'){hint.textContent='3D library failed to load. Check your connection and reload.';return}initR();yaw=0;pitch=.45;dist=26}
 if(g.id==='avatar'||g.id==='pets')startGame();else showLobby(g)}
function startGame(){if(ST.hints!==false)hint.classList.add('on');clearTimeout(hint.t);hint.t=setTimeout(()=>hint.classList.remove('on'),7000);setTimeout(hb,400);PMIN=.05;DEB.length=0;FXL.length=0;shk=0;['vote','role','spec','xh','hm','lockmsg'].forEach(i=>document.getElementById(i).style.display='none');SP.on=false;SP.k=null;document.querySelectorAll('.gw').forEach(e=>e.remove());document.getElementById('rev').classList.remove('on');if(document.pointerLockElement)document.exitPointerLock();PMIN=.05;cur.start();resize();clock.getDelta();cancelAnimationFrame(raf);raf=requestAnimationFrame(loop)}
document.getElementById('close').onclick=()=>{hint.classList.remove('on');modal.classList.remove('on');setTimeout(hb,400);cancelAnimationFrame(raf);if(room)room.presence({g:null}).catch(()=>{});RM.clear();DEB.length=0;FXL.length=0;setHP(null);['vote','role','spec','xh','hm','lockmsg'].forEach(i=>document.getElementById(i).style.display='none');SP.on=false;SP.k=null;document.querySelectorAll('.gw').forEach(e=>e.remove());document.getElementById('rev').classList.remove('on');if(document.pointerLockElement)document.exitPointerLock();PMIN=.05;leaveRoom();clearInterval(lobbyT);lobby.style.display='none';pendG=null;cur=null;scene=null;showOver('')};
