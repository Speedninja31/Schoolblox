/* ====== SPECIAL WEATHER + SHOW EFFECTS (works in every game) ======
   A full-screen 2D overlay drawn on top of the game view, so the same weather works in all games, 3D or not.
   Started by an admin (signed broadcast from js/admin.js) or locally from the admin panel.
   API: SBWX.start(kind, seconds) / SBWX.stop(kind) / SBWX.stopAll() / SBWX.fireworks() / SBWX.confetti() / SBWX.countdown(n) */
const SBWX=(()=>{
 const TYPES={
  rain:{n:'Rain',e:'☔',t:[40,70,130,.16]},
  storm:{n:'Thunderstorm',e:'⛈️',t:[12,16,34,.38],fog:[20,170]},
  blizzard:{n:'Blizzard',e:'❄️',t:[215,232,255,.3],fog:[10,110]},
  meteor:{n:'Meteor Shower',e:'☄️',t:[30,10,50,.24]},
  aurora:{n:'Aurora',e:'🌌',t:[5,14,40,.3]},
  blood:{n:'Blood Moon',e:'🩸',t:[120,0,10,.34]},
  disco:{n:'Disco Party',e:'🪩',t:[0,0,0,0]},
  gold:{n:'Gold Rush',e:'💰',t:[255,190,40,.16]},
  tornado:{n:'Tornado',e:'🌪️',t:[60,60,66,.36],fog:[20,150]},
  fog:{n:'Dense Fog',e:'🌫️',t:[210,214,222,.36],fog:[5,80]},
  heat:{n:'Heatwave',e:'🔥',t:[255,120,20,.2]},
  candy:{n:'Candy Rain',e:'🍬',t:[255,120,200,.1]},
  eclipse:{n:'Eclipse',e:'🌑',t:[0,0,10,.5]},
  starfall:{n:'Starfall',e:'✨',t:[10,10,40,.2]}};
 const act={},P={},fw=[],cf=[];let cv=null,cx=null,W=0,H=0,T0=performance.now(),cd=null,flash=0,bolt=null,boltT=0,nextBolt=3,mt=0,view=null;
 const R=(a,b)=>a+Math.random()*(b-a),now=()=>performance.now()/1000,hue=h=>'hsl('+(h%360)+',90%,60%)';
 function mount(){view=document.getElementById('view');if(!view)return false;if(cv&&cv.parentNode===view)return true;if(!cv){cv=document.createElement('canvas');cv.id='wxo';cv.style.cssText='position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:0';cx=cv.getContext('2d')}const rc=typeof renderer!=='undefined'&&renderer&&renderer.domElement;if(rc&&rc.parentNode===view)view.insertBefore(cv,rc.nextSibling);else view.prepend(cv);return true}
 function size(){const w=view.clientWidth||innerWidth,h=view.clientHeight||innerHeight,d=Math.min(1.5,window.devicePixelRatio||1);if(cv.width!==Math.round(w*d)||cv.height!==Math.round(h*d)){cv.width=Math.round(w*d);cv.height=Math.round(h*d)}W=cv.width;H=cv.height;return d}
 const pool=(k,n,mk)=>{const a=P[k]||(P[k]=[]);while(a.length<n)a.push(mk());if(a.length>n)a.length=n;return a};
 function start(k,sec){if(!TYPES[k])return false;sec=Math.max(5,Math.min(900,+sec||60));const t=now();act[k]={t0:t,until:t+sec};P[k]=null;if(k==='storm')nextBolt=1.5;return true}
 function stop(k){if(act[k]){act[k].until=now()+1.2}}
 function stopAll(){for(const k in act)stop(k)}
 const list=()=>Object.keys(act).map(k=>({k,n:TYPES[k].n,e:TYPES[k].e,left:Math.max(0,Math.round(act[k].until-now()))}));
 const lvl=k=>{const a=act[k],t=now();return Math.max(0,Math.min(1,(t-a.t0)/2.5,(a.until-t)/1.2))};
 const sh=v=>{try{if(typeof shk!=='undefined')shk=Math.max(shk,v)}catch(e){}};
 const snd2=(f,d,ty,v,e)=>{try{if(typeof snd==='function')snd(f,d,ty,v,e)}catch(x){}};
 function drops(a,dt,o){const arr=pool('d'+o.id,Math.round(Math.min(o.n,W*H/o.den)*a),()=>({x:R(0,W),y:R(0,H),v:R(.8,1.2)}));cx.strokeStyle=o.c;cx.lineWidth=o.w*(W/900+.5);cx.beginPath();for(const p of arr){p.y+=o.vy*p.v*dt*H;p.x+=o.vx*p.v*dt*H;if(p.y>H){p.y=-20;p.x=R(0,W)}if(p.x>W)p.x=0;if(p.x<0)p.x=W;cx.moveTo(p.x,p.y);cx.lineTo(p.x-o.vx*o.len*H,p.y-o.vy*o.len*H)}cx.stroke()}
 function flakes(a,dt,id,n,sp,sz){const arr=pool(id,Math.round(n*a),()=>({x:R(0,W),y:R(0,H),v:R(.5,1.3),ph:R(0,6.3)}));cx.fillStyle='rgba(255,255,255,.85)';for(const p of arr){p.y+=sp*p.v*dt*H;p.ph+=dt*2;p.x+=Math.sin(p.ph)*dt*30*p.v+sp*60*dt;if(p.y>H){p.y=-8;p.x=R(0,W)}if(p.x>W)p.x=0;cx.beginPath();cx.arc(p.x,p.y,sz*p.v*(W/900+.6),0,6.3);cx.fill()}}
 function fall(a,dt,id,n,draw,sp){const arr=pool(id,Math.round(n*a),()=>({x:R(0,W),y:R(-H,H),v:R(.6,1.3),ph:R(0,6.3),c:Math.floor(R(0,5))}));for(const p of arr){p.y+=sp*p.v*dt*H;p.ph+=dt*(3+p.v*3);p.x+=Math.sin(p.ph*.5)*dt*40;if(p.y>H+20){p.y=-20;p.x=R(0,W)}draw(p)}}
 const grad=(x0,y0,x1,y1,st)=>{const g=cx.createLinearGradient(x0,y0,x1,y1);st.forEach(s=>g.addColorStop(s[0],s[1]));return g};
 function lightning(dt){nextBolt-=dt;if(nextBolt<=0){nextBolt=R(3,8);flash=1;boltT=.3;const pts=[],x0=R(.15,.85)*W;let x=x0,y=0;while(y<H*R(.5,.8)){pts.push([x,y]);x+=R(-.05,.05)*W;y+=R(.05,.09)*H}bolt=pts;setTimeout(()=>{snd2(70,1.1,'sawtooth',.22,28);sh(.5)},R(250,900))}
  if(flash>0){cx.fillStyle='rgba(235,240,255,'+(flash*.55)+')';cx.fillRect(0,0,W,H);flash=Math.max(0,flash-dt*3)}
  if(bolt&&boltT>0){boltT-=dt;cx.strokeStyle='rgba(255,255,255,'+Math.min(1,boltT*5)+')';cx.lineWidth=3*(W/900+.5);cx.shadowColor='#9bbcff';cx.shadowBlur=18;cx.beginPath();bolt.forEach((p,i)=>i?cx.lineTo(p[0],p[1]):cx.moveTo(p[0],p[1]));cx.stroke();cx.shadowBlur=0}}
 function meteors(a,dt){const arr=P.m||(P.m=[]);if(Math.random()<dt*2.2*a)arr.push({x:R(.2,1.2)*W,y:-30,vx:-R(.5,.9)*W,vy:R(.45,.8)*H,l:R(.1,.2),big:Math.random()<.18});
  for(let i=arr.length-1;i>=0;i--){const m=arr[i];m.x+=m.vx*dt*.9;m.y+=m.vy*dt*.9;const tx=m.x-m.vx*m.l,ty=m.y-m.vy*m.l;cx.strokeStyle=grad(m.x,m.y,tx,ty,[[0,'rgba(255,240,200,1)'],[.3,'rgba(255,150,40,.8)'],[1,'rgba(255,60,0,0)']]);cx.lineWidth=(m.big?7:3)*(W/900+.5);cx.lineCap='round';cx.beginPath();cx.moveTo(m.x,m.y);cx.lineTo(tx,ty);cx.stroke();
   if(m.y>H*.92||m.x<-60){if(m.big&&m.y>H*.85){flash=.5;sh(.7);snd2(110,.5,'sawtooth',.18,40)}arr.splice(i,1)}}}
 function aurora(a,t){const cols=[[60,255,150],[40,200,255],[170,90,255]];cols.forEach((c,i)=>{cx.beginPath();cx.moveTo(0,0);for(let x=0;x<=W;x+=W/36){const y=H*(.16+.07*i)+Math.sin(x/W*5+t*(.5+i*.2)+i*2)*H*.07+Math.sin(x/W*11-t*.8)*H*.025;cx.lineTo(x,y)}cx.lineTo(W,0);cx.closePath();cx.fillStyle=grad(0,0,0,H*.5,[[0,'rgba('+c+',0)'],[.55,'rgba('+c+','+(.3*a)+')'],[1,'rgba('+c+',0)']]);cx.globalCompositeOperation='lighter';cx.fill();cx.globalCompositeOperation='source-over'})}
 function disco(a,t,dt){const h=t*70;cx.fillStyle='hsla('+(h%360)+',90%,55%,'+(.17*a)+')';cx.fillRect(0,0,W,H);cx.globalCompositeOperation='lighter';for(let i=0;i<6;i++){const ang=t*.8+i*1.05,x=W/2+Math.sin(t*.5+i)*W*.35;cx.fillStyle='hsla('+((h+i*60)%360)+',100%,60%,'+(.1*a)+')';cx.beginPath();cx.moveTo(x,-10);cx.lineTo(x+Math.sin(ang)*W*.6-W*.07,H);cx.lineTo(x+Math.sin(ang)*W*.6+W*.07,H);cx.closePath();cx.fill()}cx.globalCompositeOperation='source-over';
  fall(a,dt,'disco',50,p=>{cx.fillStyle=hue(p.ph*40+p.c*70);cx.fillRect(p.x,p.y,5*(W/900+.5),9*(W/900+.5)*Math.abs(Math.sin(p.ph)))},.35)}
 function gold(a,dt){fall(a,dt,'gold',46,p=>{const r=(9+p.v*6)*(W/900+.5),sq=Math.abs(Math.cos(p.ph));cx.fillStyle='#ffc933';cx.strokeStyle='#b8860b';cx.lineWidth=2;cx.beginPath();cx.ellipse(p.x,p.y,Math.max(1.5,r*sq),r,0,0,6.3);cx.fill();cx.stroke();if(sq>.6){cx.fillStyle='#b8860b';cx.font='bold '+Math.round(r)+'px system-ui';cx.textAlign='center';cx.fillText('$',p.x,p.y+r*.35)}},.28)}
 function candy(a,dt){const C=['#ff5fa2','#5fd0ff','#ffd23a','#9bff6a','#b45cff'];fall(a,dt,'candy',44,p=>{const r=(8+p.v*6)*(W/900+.5);cx.fillStyle=C[p.c];cx.beginPath();cx.arc(p.x,p.y,r,0,6.3);cx.fill();cx.strokeStyle='rgba(255,255,255,.85)';cx.lineWidth=2.5;cx.beginPath();cx.arc(p.x,p.y,r*.6,p.ph,p.ph+2.4);cx.stroke()},.3)}
 function tornado(a,dt,t){const arr=pool('tor',Math.round(90*a),()=>({a:R(0,6.3),r:R(.05,.6),y:R(0,1),s:R(.8,2),c:Math.floor(R(0,3))})),cxm=W*(.5+.18*Math.sin(t*.4));for(const p of arr){p.a+=dt*p.s*2.2;p.y-=dt*.15;if(p.y<0){p.y=1;p.r=R(.05,.6)}const rr=(.06+p.y*.5)*W*p.r*1.3,x=cxm+Math.cos(p.a)*rr,y=H*(1-p.y*.95)+Math.sin(p.a)*rr*.15;cx.fillStyle=['#3a3a40','#6b5a48','#8a8f98'][p.c];cx.fillRect(x,y,7*(W/900+.5),4*(W/900+.5))}
  cx.fillStyle=grad(0,H,0,0,[[0,'rgba(40,40,46,'+(.55*a)+')'],[1,'rgba(40,40,46,0)']]);cx.beginPath();cx.moveTo(cxm-W*.02,0);cx.lineTo(cxm+W*.02,0);cx.lineTo(cxm+W*.16,H);cx.lineTo(cxm-W*.16,H);cx.closePath();cx.fill();sh(.12*a)}
 function fogLayer(a,t){for(let i=0;i<5;i++){const x=((t*14*(i+1)+i*W*.4)%(W*1.6))-W*.3,y=H*(.25+.14*i),g=cx.createRadialGradient(x,y,0,x,y,W*.5);g.addColorStop(0,'rgba(225,228,236,'+(.34*a)+')');g.addColorStop(1,'rgba(225,228,236,0)');cx.fillStyle=g;cx.fillRect(0,0,W,H)}}
 function heat(a,dt,t){const arr=pool('ember',Math.round(34*a),()=>({x:R(0,W),y:R(0,H),v:R(.6,1.4),ph:R(0,6.3)}));for(const p of arr){p.y-=p.v*dt*H*.14;p.ph+=dt*3;p.x+=Math.sin(p.ph)*dt*22;if(p.y<-10){p.y=H+10;p.x=R(0,W)}cx.fillStyle='rgba(255,'+Math.round(120+p.v*60)+',40,.8)';cx.beginPath();cx.arc(p.x,p.y,2.2*p.v*(W/900+.5),0,6.3);cx.fill()}
  for(let i=0;i<6;i++){cx.fillStyle='rgba(255,170,60,'+(.045*a)+')';cx.fillRect(0,H*.55+i*H*.075+Math.sin(t*2+i)*8,W,H*.04)}}
 function moon(c,a){const x=W*.22,y=H*.2,r=Math.min(W,H)*.13,g=cx.createRadialGradient(x,y,r*.4,x,y,r*2.2);g.addColorStop(0,'rgba('+c+','+(.5*a)+')');g.addColorStop(1,'rgba('+c+',0)');cx.fillStyle=g;cx.fillRect(0,0,W,H);cx.fillStyle='rgba('+c+','+a+')';cx.beginPath();cx.arc(x,y,r,0,6.3);cx.fill()}
 function eclipse(a,t){const x=W*.5,y=H*.2,r=Math.min(W,H)*.12,g=cx.createRadialGradient(x,y,r*.9,x,y,r*2.6);g.addColorStop(0,'rgba(255,230,160,'+(.9*a)+')');g.addColorStop(1,'rgba(255,200,120,0)');cx.fillStyle=g;cx.fillRect(0,0,W,H);cx.fillStyle='#000';cx.beginPath();cx.arc(x,y,r,0,6.3);cx.fill()}
 function fireworks(n){n=Math.min(12,n||6);for(let i=0;i<n;i++)setTimeout(()=>{if(!mount())return;size();const x=R(.15,.85)*W,y0=R(.2,.5)*H;fw.push({x,y:H,ty:y0,ph:0,c:R(0,360),p:[]});snd2(500,.3,'triangle',.1,160)},i*420+R(0,200))}
 function confetti(){for(let i=0;i<120;i++)cf.push({x:R(0,1),y:R(-.3,0),vx:R(-.15,.15),vy:R(.15,.45),c:R(0,360),r:R(0,6.3),w:R(5,10)});snd2(900,.3,'sine',.1,1500)}
 function countdown(n){cd={n:Math.min(30,Math.max(1,n|0)),t0:now()}}
 function tick(dt){if(!mount())return;const t=now(),keys=Object.keys(act);
  for(const k of keys)if(t>act[k].until){delete act[k];delete P[k]}
  if(!keys.length&&!fw.length&&!cf.length&&!cd){if(cv.style.display!=='none'){cx.clearRect(0,0,W,H);cv.style.display='none'}return}
  cv.style.display='block';size();cx.setTransform(1,0,0,1,0,0);cx.clearRect(0,0,W,H);cx.lineCap='round';
  let fog=null;
  for(const k in act){const a=lvl(k),ty=TYPES[k],tt=ty.t;if(tt[3]){cx.fillStyle='rgba('+tt[0]+','+tt[1]+','+tt[2]+','+(tt[3]*a)+')';cx.fillRect(0,0,W,H)}if(ty.fog&&a>.05)fog=ty.fog;
   if(k==='rain')drops(a,dt,{id:'r',n:240,den:7500,c:'rgba(190,215,255,.55)',w:1.3,vx:.12,vy:1.1,len:.025});
   else if(k==='storm'){drops(a,dt,{id:'s',n:420,den:4500,c:'rgba(200,220,255,.6)',w:1.5,vx:.28,vy:1.5,len:.03});lightning(dt)}
   else if(k==='blizzard'){flakes(a,dt,'bz',260,.45,3.2);cx.fillStyle='rgba(255,255,255,'+(.12*a)+')';cx.fillRect(0,0,W,H)}
   else if(k==='meteor')meteors(a,dt);
   else if(k==='aurora')aurora(a,t);
   else if(k==='blood')moon('230,30,30',a);
   else if(k==='disco')disco(a,t,dt);
   else if(k==='gold')gold(a,dt);
   else if(k==='candy')candy(a,dt);
   else if(k==='tornado')tornado(a,dt,t);
   else if(k==='fog')fogLayer(a,t);
   else if(k==='heat')heat(a,dt,t);
   else if(k==='eclipse')eclipse(a,t);
   else if(k==='starfall'){meteors(a*.6,dt);flakes(a,dt,'sf',40,.18,2)}}
  /* show effects */
  for(let i=fw.length-1;i>=0;i--){const f=fw[i];if(!f.ph){f.y-=H*.9*dt;cx.fillStyle='#fff';cx.fillRect(f.x,f.y,3,10);if(f.y<=f.ty){f.ph=1;const n=46;for(let j=0;j<n;j++){const a=j/n*6.283,s=R(.1,.38)*H;f.p.push({x:f.x,y:f.y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,l:1,h:f.c+R(-25,25)})}snd2(180,.4,'sawtooth',.14,60)}}
   else{let live=0;for(const p of f.p){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=H*.25*dt;p.vx*=.985;p.l-=dt*.75;if(p.l>0){live++;cx.fillStyle='hsla('+p.h+',100%,62%,'+p.l+')';cx.beginPath();cx.arc(p.x,p.y,2.8*(W/900+.5)*p.l+.6,0,6.3);cx.fill()}}if(!live)fw.splice(i,1)}}
  for(let i=cf.length-1;i>=0;i--){const c=cf[i];c.x+=c.vx*dt;c.y+=c.vy*dt;c.r+=dt*6;if(c.y>1.1){cf.splice(i,1);continue}cx.save();cx.translate(c.x*W,c.y*H);cx.rotate(c.r);cx.fillStyle=hue(c.c);cx.fillRect(-c.w/2,-c.w/4,c.w*(W/900+.5),c.w/2*Math.abs(Math.cos(c.r*2)));cx.restore()}
  if(cd){const left=cd.n-Math.floor(t-cd.t0);if(left<=0){cx.fillStyle='#fff';cx.font='900 '+Math.round(H*.16)+'px system-ui';cx.textAlign='center';cx.fillText('GO!',W/2,H*.4);if(t-cd.t0>cd.n+1.2)cd=null}else{if(cd.last!==left){cd.last=left;snd2(left<=3?880:520,.15,'sine',.12,left<=3?880:520)}const f=1-((t-cd.t0)%1);cx.fillStyle='rgba(255,255,255,'+(.5+.5*f)+')';cx.strokeStyle='#000';cx.lineWidth=8;cx.font='900 '+Math.round(H*(.14+.04*f))+'px system-ui';cx.textAlign='center';cx.strokeText(left,W/2,H*.4);cx.fillText(left,W/2,H*.4)}}
  /* 3D fog for the scenes that use one */
  try{if(fog&&typeof scene!=='undefined'&&scene&&scene.fog){scene.fog.near=Math.min(scene.fog.near,fog[0]);scene.fog.far=Math.min(scene.fog.far,fog[1])}}catch(e){}}
 return{TYPES,start,stop,stopAll,list,tick,fireworks,confetti,countdown,active:()=>Object.keys(act).length>0}})();
window.SBWX=SBWX;
