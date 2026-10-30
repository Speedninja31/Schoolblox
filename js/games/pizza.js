/* Game: Work at a Pizza Place (id: pizza) - pick a job and run the pizzeria: cashier, cook, boxer, delivery, supplier. */
GAMES.push({id:'pizza',name:'Work at a Pizza Place',tag:'Roleplay',e:'🍕',c:['#ff7043','#ffca28'],like:'95%',pl:'28.4K',hint:'Pick a job with the buttons or keys 1-5 (Cashier, Cook, Boxer, Delivery, Supplier). Customers walk in or phone in orders. Cashier takes the order, the Cook makes the pizza (dough, sauce and cheese, toppings that match the ticket, oven - do not burn it!), the Boxer boxes it, Delivery drives it to the house and the Supplier restocks the bins. Press E at stations. Do your own job for double pay in SchoolBux. Trash bad pizzas in the bin. Press E next to a car to drive it (W/S gas and brake, A/D steer, E to get out) - deliver pizzas by car!'});
META.pizza={c:'Casual',m:'Solo · Social',t:['Jobs','Teamwork','Pizza'],n:1};
ENG.pizza={d3:true,noEmote:1,
 TOP:[['Pepperoni','🍕',0xc0392b],['Sausage','🌭',0xb5651d],['Mushroom','🍄',0xd7ccc8],['Pineapple','🍍',0xfdd835],['Olives','🫒',0x2e3b2a],['Peppers','🫑',0x43a047]],
 JOBS:[['cashier','🧾','Cashier'],['cook','👨‍🍳','Cook'],['boxer','📦','Boxer'],['delivery','🛵','Delivery'],['supplier','🚚','Supplier']],
 NAMES:['Alex','Sam','Jordan','Taylor','Casey','Riley','Morgan','Jamie','Avery','Quinn','Drew','Skyler'],
 SK:['flour','sauce','cheese','t0','t1','t2','t3','t4','t5'],
 reset(){Object.assign(this.P,{x:0,y:1,z:16,vy:0});this.setHold(null)},
 ld(){let d={};try{d=JSON.parse(localStorage.getItem('hubpizza')||'{}')}catch(e){}this.D=Object.assign({job:'cook',served:0,earn:0,best:0},d)},
 sv(){try{localStorage.setItem('hubpizza',JSON.stringify(this.D))}catch(e){}},
 css(){if(document.getElementById('pzx'))return;const s=document.createElement('style');s.id='pzx';s.textContent='#pzhud{position:absolute;inset:0;pointer-events:none;z-index:30;font:700 13px system-ui;color:#fff}#pzhud .pn{background:rgba(20,16,30,.82);border:1px solid rgba(255,255,255,.18);border-radius:14px;padding:10px 12px;box-shadow:0 6px 18px rgba(0,0,0,.35)}#pzj{position:absolute;top:54px;left:50%;transform:translateX(-50%);display:flex;gap:6px;pointer-events:auto}#pzj button{background:rgba(20,16,30,.85);color:#fff;border:2px solid rgba(255,255,255,.2);border-radius:12px;padding:6px 10px;font:700 12px system-ui;cursor:pointer}#pzj button.on{border-color:#ffd23a;background:#7a4a10;box-shadow:0 0 14px rgba(255,210,58,.5)}#pzo{position:absolute;right:12px;top:110px;width:230px;max-height:55vh;overflow:hidden}#pzo .tk{margin:6px 0;padding:6px 8px;border-radius:10px;background:rgba(255,255,255,.09)}#pzo .tk small{display:block;opacity:.8;font-weight:600}#pzs{position:absolute;left:12px;bottom:120px;width:150px}#pzs div{display:flex;justify-content:space-between;margin:2px 0}#pzs .lo{color:#ff8a80}#pzp{position:absolute;left:50%;bottom:92px;transform:translateX(-50%);text-align:center;max-width:70vw}#pzm{position:absolute;left:50%;top:96px;transform:translateX(-50%);background:rgba(255,210,58,.95);color:#2a1a00;border-radius:12px;padding:7px 14px;display:none}';document.head.appendChild(s)},
 msg(t){this.mt=3;const m=document.getElementById('pzm');if(m){m.textContent=t;m.style.display='block'}},
 pay(base,job){const own=this.job===job;this.acc+=base*(own?2:1);const w=Math.floor(this.acc);if(w>=1){this.acc-=w;BX.b+=w;saveBX();this.D.earn+=w;this.msg('+'+w+' SchoolBux 💵'+(own?' (your job, 2x!)':''))}},
 setJob(j){this.job=j;this.D.job=j;this.sv();this.hud(1)},
 setHold(h){this.hold=h;const P=this.P;if(this.hm){P.J.aR.remove(this.hm);this.hm=null}if(!h)return;const g=new THREE.Group(),L=c=>new THREE.MeshLambertMaterial({color:c});
  if(h.k==='dough'){const m=new THREE.Mesh(new THREE.SphereGeometry(.6,10,8),L(0xf3e3b5));m.scale.y=.7;g.add(m)}
  else if(h.k==='raw'||h.k==='pizza'){const base=new THREE.Mesh(new THREE.CylinderGeometry(1.1,1.1,.14,20),L(h.k==='pizza'?(h.burnt?0x2a1a10:0xe0a83a):0xf3d9a0));g.add(base);if(h.k==='raw')g.add(Object.assign(new THREE.Mesh(new THREE.CylinderGeometry(.95,.95,.16,20),L(0xd9402a)),{}));(h.t||[]).forEach((t,i)=>{const d=new THREE.Mesh(new THREE.SphereGeometry(.22,6,5),L(this.TOP[t][2]));d.position.set(Math.cos(i*2.1)*.5,.16,Math.sin(i*2.1)*.5);g.add(d)})}
  else if(h.k==='boxed'){g.add(new THREE.Mesh(new THREE.BoxGeometry(1.8,.3,1.8),L(0xb08850)))}
  else{g.add(new THREE.Mesh(new THREE.BoxGeometry(1.3,1.3,1.3),L(0x8a5a2b)))}
  g.position.set(0,-2,.9);P.J.aR.add(g);this.hm=g},
 /* ---- cars ---- */
 CC:[0xe53935,0x1e88e5,0xfdd835,0x43a047,0xfb8c00,0x8e24aa,0xeceff1,0x212121],
 mkCar(col,sign){const g=new THREE.Group(),L=(c,e)=>new THREE.MeshLambertMaterial({color:c,emissive:e||0}),add=(geo,m,x,y,z)=>{const o=new THREE.Mesh(geo,m);o.position.set(x,y,z);o.castShadow=true;g.add(o);return o};
  add(new THREE.BoxGeometry(4.4,1.3,9),L(col),0,1.35,0);add(new THREE.BoxGeometry(3.7,1.2,4.4),L(0x9fd3ff),0,2.5,-.5);add(new THREE.BoxGeometry(3.9,.28,4.7),L(col),0,3.2,-.5);
  [[-2.3,3],[2.3,3],[-2.3,-3],[2.3,-3]].forEach(([x,z])=>{const w=add(new THREE.CylinderGeometry(.95,.95,.7,14),L(0x1a1a1a),x,.95,z);w.rotation.z=Math.PI/2;const hc=add(new THREE.CylinderGeometry(.45,.45,.74,10),L(0xbdbdbd),x,.95,z);hc.rotation.z=Math.PI/2});
  [-1.4,1.4].forEach(x=>{add(new THREE.BoxGeometry(.8,.45,.2),L(0xfff3b0,0xffe066),x,1.5,4.55);add(new THREE.BoxGeometry(.8,.4,.2),L(0xb71c1c,0x7a0000),x,1.5,-4.55)});add(new THREE.BoxGeometry(4.6,.4,.5),L(0x2a2a2a),0,.8,4.6);add(new THREE.BoxGeometry(4.6,.4,.5),L(0x2a2a2a),0,.8,-4.6);
  if(sign){add(new THREE.BoxGeometry(2.2,.7,.8),L(0xe0352b,0x550000),0,3.75,-.5);const t=tag('🍕');t.scale.set(3,.75,1);t.position.set(0,4.7,-.5);g.add(t)}
  return g},
 enter(c){this.drv=c;this.P.g.visible=false;this.setHold(this.hold);snd(300,.2,'sawtooth',.08,120);this.msg('🚗 W/S gas & brake · A/D steer · E to get out')},
 exit(){const c=this.drv,P=this.P;P.x=c.x+Math.cos(c.yaw)*4.6;P.z=c.z-Math.sin(c.yaw)*4.6;P.y=1;P.vy=0;P.g.visible=true;c.v=0;this.drv=null;this.setHold(this.hold)},
 drive(dt){const c=this.drv,P=this.P,f=(F()?1:0)-(B()?1:0),st=(L()?1:0)-(R()?1:0);
  if(f>0)c.v=Math.min(40,c.v+30*dt);else if(f<0)c.v=c.v>0?Math.max(0,c.v-62*dt):Math.max(-14,c.v-22*dt);else c.v-=Math.sign(c.v)*Math.min(Math.abs(c.v),12*dt);
  c.yaw+=st*1.9*Math.min(1,Math.abs(c.v)/12)*dt*(c.v>=0?1:-1);c.x+=Math.sin(c.yaw)*c.v*dt;c.z+=Math.cos(c.yaw)*c.v*dt;
  for(const b of this.S.concat(this.CB)){if(b.hw===undefined||b.top<1.2)continue;const nx=Math.max(b.x-b.hw,Math.min(c.x,b.x+b.hw)),nz=Math.max(b.z-b.hd,Math.min(c.z,b.z+b.hd)),dx=c.x-nx,dz=c.z-nz,d=Math.hypot(dx,dz);if(d<3.5){if(d>1e-4){c.x+=dx/d*(3.5-d);c.z+=dz/d*(3.5-d)}else c.x+=3.5;if(Math.abs(c.v)>10)snd(120,.1,'square',.1,60);c.v*=.45}}
  const rr=Math.hypot(c.x,c.z);if(rr>222){c.x*=222/rr;c.z*=222/rr;c.v*=.6}
  for(const t of this.tf){const d=Math.hypot(c.x-t.g.position.x,c.z-t.g.position.z);if(d<5.6&&d>.01){const k=(5.6-d)/d;c.x+=(c.x-t.g.position.x)*k;c.z+=(c.z-t.g.position.z)*k;c.v*=.6}}
  c.g.position.set(c.x,0,c.z);c.g.rotation.y=c.yaw;P.x=c.x;P.z=c.z;P.y=0;P.vy=0;P.hs=0;
  let d=c.yaw+Math.PI-yaw;d=Math.atan2(Math.sin(d),Math.cos(d));if(Math.abs(c.v)>3)yaw+=d*Math.min(1,dt*2.2);orbitCam(P)},
 traffic(dt){const P=this.P;for(const t of this.tf){t.a+=t.dir*(16/t.r)*dt;t.g.position.set(Math.cos(t.a)*t.r,0,Math.sin(t.a)*t.r);t.g.rotation.y=t.dir>0?-t.a:Math.PI-t.a;
   if(!this.drv){const d=Math.hypot(P.x-t.g.position.x,P.z-t.g.position.z);if(d<4.4&&d>.01){const k=(4.4-d)/d;P.x+=(P.x-t.g.position.x)*k;P.z+=(P.z-t.g.position.z)*k;if(!this.tw||this.t-this.tw>3){this.tw=this.t;this.msg('🚗 Watch out for traffic!')}}}}},
 ex(){const c=this.drv;return c?{cr:[Math.round(c.x*10)/10,Math.round(c.z*10)/10,Math.round(c.yaw*100)/100,c.ci]}:{cr:0}},
 rem(c,q){const r=q.cr;if(Array.isArray(r)&&r.length===4&&r.every(Number.isFinite)){const ci=((r[3]|0)%8+8)%8;if(!c.cm||c.cmc!==ci){if(c.cm)scene.remove(c.cm);c.cm=this.mkCar(this.CC[ci],true);c.cmc=ci;scene.add(c.cm)}c.cm.position.set(r[0],0,r[1]);c.cm.rotation.y=r[2];c.g.visible=false}else{if(c.cm){scene.remove(c.cm);c.cm=null}c.g.visible=true}},
 /* ---- orders ---- */
 same(a,b){return a.length===b.length&&a.every((v,i)=>v===b[i])},
 mkCust(){const a={};for(const k in OPT)a[k]=0;const r=Math.random;a.skin=Math.floor(r()*6);a.hair=1+Math.floor(r()*(OPT.hair.length-1));a.shirt=Math.floor(r()*OPT.shirt.length);if(r()<.4)a.jacket=1+Math.floor(r()*(OPT.jacket.length-1));a.face=Math.floor(r()*3);const sv=AV;AV=a;const n=newP(0,0,26);AV=sv;if(n.g.parent!==scene)scene.add(n.g);return n},
 /* walk an NPC along waypoints; true when it has arrived */
 cw(n,wp,dt){const t=wp[0];if(!t)return true;const dx=t[0]-n.x,dz=t[1]-n.z,d=Math.hypot(dx,dz);if(d<.6){wp.shift();return !wp.length}const st=Math.min(9*dt,d);n.x+=dx/d*st;n.z+=dz/d*st;n.yaw=Math.atan2(dx,dz);n.hs=12;n.gr=true;n.vy=0;n.t+=dt;animate(n,dt);return false},
 mkOrder(){if(this.tk.length>=5)return;const n=1+Math.floor(Math.random()*3),t=[];while(t.length<n){const i=Math.floor(Math.random()*6);if(!t.includes(i))t.push(i)}t.sort();
  let kind=Math.random()<.5?'dine':'deliver';if(kind==='dine'&&this.cust)kind='deliver';
  const od={id:++this.oid,name:this.NAMES[Math.floor(Math.random()*this.NAMES.length)],t,kind,h:Math.floor(Math.random()*this.HS.length),st:kind==='dine'?'wait':'taken',age:0};this.tk.push(od);
  if(kind==='dine'){this.cust=od;od.n=this.mkCust();od.wp=[[0,-16],[-12,-24.5]];const l=tag('🍕 '+od.name);l.scale.set(6,1.6,1);l.position.y=7;od.n.g.add(l);this.msg('🔔 A customer walked in - take their order at the Register!')}else this.msg('📞 Phone order for '+od.name+' - check the tickets!')},
 drop(od,why){const i=this.tk.indexOf(od);if(i>=0)this.tk.splice(i,1);if(od.n){scene.remove(od.n.g)}if(this.cust===od)this.cust=null;const j=this.shelf.indexOf(od.id);if(j>=0)this.shelf.splice(j,1);if(why){this.D.lost=(this.D.lost||0)+1;this.msg(why)}},
 /* ---- stations ---- */
 act(id){const H=this.hold,St=this.stock,A=this.ST[id];if(!A)return;
  const crate=(k)=>{if(H&&H.k==='crate'&&H.i===k){St[k]+=10;this.setHold(null);this.pay(1,'supplier');snd(700,.1,'sine',.12,900);return true}return false};
  if(id==='reg'){if(H&&H.k==='boxed'){const o=this.tk.find(x=>x.id===H.oid);if(o&&o.kind==='dine'&&o===this.cust){this.D.served++;this.pay(2,'cashier');if(o.n){this.lv.push({n:o.n,wp:[[0,-16],[0,8],[0,60]]});o.n=null}this.drop(o);this.setHold(null);this.msg('😋 Happy customer! +1 served');snd(900,.2,'sine',.14,1400)}else{this.msg(o?'That order is for a delivery - take it to the house':'That order expired');if(!o)this.setHold(null)}return}
   if(!H&&this.cust&&this.cust.st==='wait'&&this.cust.wp&&this.cust.wp.length){this.msg('The customer is still walking in...')}else if(!H&&this.cust&&this.cust.st==='wait'){const o=this.cust;o.st='taken';o.age=0;this.pay(1,'cashier');this.msg('🧾 Order taken: '+o.t.map(i=>this.TOP[i][1]).join(' '));snd(600,.1,'square',.1,800)}else if(!H)this.msg('No customer waiting');return}
  if(id==='dough'){if(crate('flour'))return;if(!H){if(St.flour>0){St.flour--;this.setHold({k:'dough'})}else this.msg('Out of flour! Ask the Supplier 🚚')}return}
  if(id==='sc'){if(crate('sauce')||crate('cheese'))return;if(H&&H.k==='dough'){if(St.sauce>0&&St.cheese>0){St.sauce--;St.cheese--;this.setHold({k:'raw',t:[]});snd(500,.08,'sine',.1,700)}else this.msg('Out of sauce or cheese!')}else this.msg('Bring dough here first');return}
  if(id[0]==='t'&&id.length===2){const i=+id[1];if(crate(id))return;if(H&&H.k==='raw'){if(H.t.length>=3)this.msg('Max 3 toppings');else if(H.t.includes(i))this.msg('Already has '+this.TOP[i][0]);else if(St[id]<=0)this.msg('Out of '+this.TOP[i][0]+'!');else{St[id]--;H.t.push(i);H.t.sort();this.setHold(H);snd(650,.06,'square',.08,800)}}else this.msg('You need a raw pizza (dough + sauce) first');return}
  if(id[0]==='o'){const o=this.ov[+id[4]];if(H&&H.k==='raw'){if(o.st==='idle'){o.st='cook';o.t=0;o.pz=H;this.setHold(null);snd(300,.1,'sawtooth',.08,200)}else this.msg('Oven is busy')}else if(!H&&o.st==='done'){this.setHold({k:'pizza',t:o.pz.t.slice(),burnt:o.burnt});o.st='idle';o.pz=null;o.burnt=false;this.pay(.5,'cook')}else if(!H)this.msg(o.st==='cook'?'Still baking...':'Empty oven');return}
  if(id==='box'){if(!H){this.boxes+=3;this.msg('📦 Folded 3 boxes ('+this.boxes+')')}else if(H.k==='pizza'){if(H.burnt){this.msg('🔥 Burnt! Put it in the trash')}else if(this.boxes<=0)this.msg('No boxes! Fold some first (E with empty hands)');else{const tk=this.tk.find(o=>o.st==='taken'&&this.same(o.t,H.t));if(!tk)this.msg('No ticket matches this pizza - trash it');else{this.boxes--;tk.st='boxed';this.setHold({k:'boxed',oid:tk.id});this.pay(1,'boxer');this.msg('Boxed for '+tk.name+(tk.kind==='dine'?' (at the counter)':' (delivery)'))}}}return}
  if(id==='shelf'){if(H&&H.k==='boxed'){this.shelf.push(H.oid);this.setHold(null)}else if(!H){if(this.shelf.length)this.setHold({k:'boxed',oid:this.shelf.shift()});else this.msg('Shelf is empty')}return}
  if(id==='trash'){if(H){this.setHold(null);snd(200,.1,'square',.08,100)}return}
  if(id==='truck'){if(!H){let b='flour',r=9;this.SK.forEach(k=>{const q=St[k]/(k[0]==='t'&&k.length===2?12:20);if(q<r){r=q;b=k}});this.setHold({k:'crate',i:b});this.msg('Crate of '+(b[0]==='t'&&b.length===2?this.TOP[+b[1]][0]:b)+' - bring it to its bin')}else this.setHold(null)}},
 deliver(){const H=this.hold;if(!H||H.k!=='boxed')return false;const o=this.tk.find(x=>x.id===H.oid);if(!o||o.kind!=='deliver')return false;const h=this.HS[o.h];if(Math.hypot(this.P.x-h.dx,this.P.z-h.dz)>(this.drv?11:6))return false;
  const fast=o.age<70,tip=fast?1:0;this.D.served++;this.pay(2+tip,'delivery');this.drop(o);this.setHold(null);this.msg('🏠 Delivered to '+o.name+(fast?' - fast delivery tip!':''));snd(900,.2,'sine',.14,1400);return true},
 guide(){const H=this.hold,j=this.job,w=this.cust&&this.cust.st==='wait',tk=this.tk.filter(o=>o.st==='taken');
  if(H){if(H.k==='dough')return 'Add sauce and cheese at the Sauce station';if(H.k==='raw')return H.t.length?'Add toppings that match a ticket, then bake it in an oven':'Add toppings that match a ticket';if(H.k==='pizza')return H.burnt?'Burnt! Trash it':'Take it to the Box station';
   if(H.k==='boxed'){const o=this.tk.find(x=>x.id===H.oid);return o?(o.kind==='dine'?'Hand it to the customer at the Register':'Deliver to '+o.name+' - follow the yellow beam'):'That order expired - trash it'}return 'Bring the crate to the matching bin'}
  if(j==='cashier')return w?'Take the customer\'s order at the Register':'Waiting for customers...';if(j==='cook')return tk.length?'Grab dough from the Dough table':'Waiting for orders...';
  if(j==='boxer')return 'Fold boxes at the Box station, then box cooked pizzas';if(j==='delivery')return this.shelf.length?'Pick up a boxed pizza from the Shelf':'Waiting for boxed pizzas...';return 'Take a crate from the truck and restock low bins'},
 hud(force){const h=document.getElementById('pzhud');if(!h)return;const q=s=>h.querySelector(s),St=this.stock;
  q('#pzj').innerHTML=this.JOBS.map((j,i)=>`<button data-j="${j[0]}" class="${this.job===j[0]?'on':''}">${j[1]} ${j[2]} <small>${i+1}</small></button>`).join('');
  q('#pzo').innerHTML='<b>🧾 Orders</b>'+(this.tk.length?this.tk.map(o=>`<div class="tk">${o.kind==='dine'?'🧍':'📞'} <b>${o.name}</b> ${o.st==='wait'?'<small>Customer at the register!</small>':o.t.map(i=>this.TOP[i][1]).join(' ')+'<small>'+(o.st==='boxed'?'Boxed - '+(o.kind==='dine'?'hand over at register':'deliver it'):'Cook it!')+' · '+Math.max(0,Math.round((o.st==='wait'?55:o.kind==='dine'?110:150)-o.age))+'s</small>'}</div>`).join(''):'<div class="tk"><small>No orders yet...</small></div>')+`<small>Served: ${this.D.served} · Earned: ${this.D.earn} 💵 · Boxes ${this.boxes} · Shelf ${this.shelf.length}</small>`;
  const row=(n,v,lo)=>`<div><span>${n}</span><span class="${v<lo?'lo':''}">${v}</span></div>`;
  q('#pzs').innerHTML='<b>📦 Stock</b>'+row('Flour',St.flour,5)+row('Sauce',St.sauce,5)+row('Cheese',St.cheese,5)+this.TOP.map((t,i)=>row(t[1]+' '+t[0],St['t'+i],4)).join('')},
 /* ---- scene ---- */
 start(){this.css();this.ld();baseScene(0x87c7ff);showOver('');this.job=this.D.job;this.acc=0;this.oid=0;this.tk=[];this.cust=null;this.shelf=[];this.boxes=6;this.hold=null;this.hm=null;this.sp=4;this.t=0;this.lv=[];this.dn=[];this.roof=[];this.mt=0;this.pe=false;this.hu=0;this.pk={};
  this.stock={flour:24,sauce:20,cheese:20,t0:12,t1:12,t2:12,t3:12,t4:12,t5:12};this.ov=[{st:'idle',t:0,pz:null,burnt:false},{st:'idle',t:0,pz:null,burnt:false}];
  const G=this.G=new THREE.Group();scene.add(G);const S=this.S=[{x:0,z:0,r:230,top:0}],rs=mulb(515);
  const box=(w,h,d,x,z,c,y0,kd,solid)=>{y0=y0||0;const m=slab(w,h,d,x,y0+h/2,z,c);m.material=tmat(c,kd);G.add(m);if(solid!==false)S.push({x,z,hw:w/2,hd:d/2,top:y0+h,bot:y0});return m},
   dec=(geo,c,x,y,z,kd)=>{const m=new THREE.Mesh(geo,kd===undefined?lam(c):tmat(c,kd));m.position.set(x,y,z);m.castShadow=true;G.add(m);return m},lab=(t,x,y,z,w)=>{const l=tag(t);l.scale.set(w||8,2,1);l.position.set(x,y,z);G.add(l)},
   cvT=(w,h,fn,rep)=>{const c=document.createElement('canvas');c.width=w;c.height=h;fn(c.getContext('2d'));const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;if(rep)t.repeat.set(rep[0],rep[1]);return t},
   glass=(w,h,d,x,y,z)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshLambertMaterial({color:0x9fd3ff,transparent:true,opacity:.22,depthWrite:false}));m.position.set(x,y,z);G.add(m);S.push({x,z,hw:w/2,hd:d/2,top:y+h/2,bot:0})};
  const gr=new THREE.Mesh(new THREE.CylinderGeometry(230,230,6,64),tmat(0x78c850,'grass',90));gr.position.y=-3;gr.receiveShadow=true;G.add(gr);
  const road=(g,x,z,w,d)=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(w,d),tmat(0x3a3d44,'stone',1));m.rotation.x=-Math.PI/2;m.position.set(x,.06,z);G.add(m)};
  const rd=new THREE.Mesh(new THREE.RingGeometry(110,130,96),tmat(0x3a3d44,'stone',1));rd.rotation.x=-Math.PI/2;rd.position.y=.06;G.add(rd);road(0,0,64,16,110);
  for(let i=0;i<20;i++){const a=i/20*6.283,m=new THREE.Mesh(new THREE.PlaneGeometry(.6,5),new THREE.MeshBasicMaterial({color:0xf5e9a8}));m.rotation.x=-Math.PI/2;m.rotation.z=-a;m.position.set(Math.cos(a)*120,.08,Math.sin(a)*120);G.add(m)}
  const pl=new THREE.Mesh(new THREE.CylinderGeometry(15,15,.14,40),tmat(0xd9d2c0,'stone',4));pl.position.set(0,.07,10);G.add(pl);box(70,.3,6,0,-4,0xd9d2c0,0,'stone',false);
  /* ===== the pizzeria: brick walls, glass storefront, striped awning, pitched roof, dining room + open kitchen ===== */
  box(64,.3,52,0,-36,0xe8d9b0,0,'stone',false);
  const ck=(w,d,cx,cz,a,b)=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(w,d),new THREE.MeshLambertMaterial({map:cvT(64,64,x=>{x.fillStyle=a;x.fillRect(0,0,64,64);x.fillStyle=b;x.fillRect(0,0,32,32);x.fillRect(32,32,32,32)},[w/8,d/8])}));m.rotation.x=-Math.PI/2;m.position.set(cx,.32,cz);G.add(m)};
  ck(64,18,0,-19,'#f4f0e6','#c62828');ck(64,34,0,-45,'#eceff1','#90a4ae');
  const BR=0xb5523b,wl=(w,h,d,x,z,y0)=>box(w,h,d,x,z,BR,y0,'brick');
  wl(64,12,1.5,0,-62);wl(1.5,12,52,32,-36);wl(1.5,12,10,-32,-57);wl(1.5,12,34,-32,-27);wl(1.5,2.5,8,-32,-48,9.5);
  [[-18,-4],[18,4]].forEach(([cx],i)=>{const sg=i?1:-1;wl(28,3,1.4,cx,-10);wl(28,2.5,1.4,cx,-10,9.5);wl(2,12,1.4,sg*31,-10);wl(2,12,1.4,sg*18,-10);wl(1,12,1.4,sg*4.5,-10);glass(11,6.5,.5,sg*24.5,6.25,-10);glass(12.5,6.5,.5,sg*11.25,6.25,-10)});
  wl(8,2.5,1.4,0,-10,9.5);
  /* pitched roof (fades when you walk inside) + gables, awning, rotating pizza sign */
  this.roof=[];const rf=(z,a)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(68,.8,29.6),new THREE.MeshLambertMaterial({map:texOf('brick',6),color:0x8a2f25,transparent:true,opacity:1}));m.position.set(0,16.4,z);m.rotation.x=a;m.castShadow=true;G.add(m);this.roof.push(m)};rf(-22,.298);rf(-50,-.298);
  const gb=new THREE.Shape();gb.moveTo(62,12);gb.lineTo(10,12);gb.lineTo(36,20.4);gb.lineTo(62,12);[-32.6,31.2].forEach(x=>{const g=new THREE.ExtrudeGeometry(gb,{depth:1.4,bevelEnabled:false});g.rotateY(Math.PI/2);const m=new THREE.Mesh(g,tmat(BR,'brick'));m.position.x=x;G.add(m)});
  const aw=new THREE.Mesh(new THREE.BoxGeometry(66,.35,6.5),new THREE.MeshLambertMaterial({map:cvT(128,16,x=>{for(let i=0;i<8;i++){x.fillStyle=i%2?'#ffffff':'#d32f2f';x.fillRect(i*16,0,16,16)}},[4,1])}));aw.position.set(0,10.3,-6.6);aw.rotation.x=.4;aw.castShadow=true;G.add(aw);
  this.pizzaSign=new THREE.Group();const dk=dec(new THREE.CylinderGeometry(5,5,.8,32),0xe8a838,0,0,0);dk.rotation.x=Math.PI/2;this.pizzaSign.add(dk);const cz2=dec(new THREE.CylinderGeometry(4.4,4.4,.9,32),0xf6d36b,0,0,0);cz2.rotation.x=Math.PI/2;this.pizzaSign.add(cz2);for(let i=0;i<7;i++){const a=i/7*6.283,pp=dec(new THREE.CylinderGeometry(.8,.8,1,12),0xc0392b,Math.cos(a)*2.6,Math.sin(a)*2.6,0);pp.rotation.x=Math.PI/2;this.pizzaSign.add(pp)}this.pizzaSign.position.set(0,24,-9);G.add(this.pizzaSign);lab('PIZZA PLACE',0,17.5,-6.2,24);
  box(6,2,.3,22,-9.2,0xff3b30,6,'',false).material=new THREE.MeshBasicMaterial({color:0xff5a4d});lab('OPEN',22,7,-8.6,5);
  /* dining room: tables, chairs, booths, menu board, hanging lights */
  const table=(x,z)=>{box(4.2,3,4.2,x,z,0xf3e9d2,0,'wood');[[-3.4,0],[3.4,0],[0,-3.4],[0,3.4]].forEach(([a,b])=>box(1.6,2,1.6,x+a,z+b,0xc62828,0,'',false))};
  [[-25,-24],[-25,-16],[16,-24],[26,-16]].forEach(([x,z])=>table(x,z));
  [-1,1].forEach(q=>{box(4,2,10,q*29.2,-18,0xc62828,0,'',false);box(1.2,5,10,q*31,-18,0xa51c1c,0,'',false)});
  const menu=new THREE.Mesh(new THREE.PlaneGeometry(10,6),new THREE.MeshBasicMaterial({map:cvT(256,154,x=>{x.fillStyle='#1b1b1b';x.fillRect(0,0,256,154);x.fillStyle='#ffd23a';x.font='bold 26px system-ui';x.textAlign='center';x.fillText('MENU',128,32);x.fillStyle='#fff';x.font='16px system-ui';['Cheese  🍕','Pepperoni  🍕','Sausage & Mushroom','Pineapple Party','Veggie Supreme','Fresh Garlic Knots'].forEach((t,i)=>x.fillText(t,128,62+i*18))})}));menu.rotation.y=Math.PI/2;menu.position.set(-31.1,6.5,-35);G.add(menu);
  [[-20,-16],[20,-16],[-20,-44],[20,-44],[0,-36]].forEach(([x,z])=>{const l=new THREE.Mesh(new THREE.SphereGeometry(.9,10,8),new THREE.MeshBasicMaterial({color:0xfff0b0}));l.position.set(x,10.8,z);G.add(l)});
  /* counter between the dining room and the kitchen (staff door in the middle) */
  box(40,3.6,2,-12,-28,0x8a5a2b,0,'wood');box(16,3.6,2,24,-28,0x8a5a2b,0,'wood');
  const cs=dec(new THREE.BoxGeometry(8,2.2,2.6),0xd0e8f5,-27,4.7,-28);cs.material=new THREE.MeshLambertMaterial({color:0xbfe3ff,transparent:true,opacity:.45});[-1,0,1].forEach(i=>{const pz=dec(new THREE.CylinderGeometry(1.1,1.1,.3,14),0xe8a838,-27+i*2.4,4.2,-28)});
  lab('Staff Only',12,5.5,-28,6);
  this.ST={};const stn=(id,x,z,w,d,h,c,k,name,sym)=>{box(w,h,d,x,z,c,0,k);lab(sym+' '+name,x,h+3.2,z,Math.max(7,name.length*.9+3));this.ST[id]={x,z,r:Math.max(w,d)/2+3.4,name,sym}};
  stn('reg',-14,-28,5,2.6,4.6,0x37474f,'metal','Register','🧾');stn('box',21,-28,5,2.6,4.4,0xd7b57a,'wood','Box Station','📦');stn('shelf',27,-28,5,2.6,4.4,0x90a4ae,'metal','Pickup Shelf','🛵');
  box(24,3,6,-21.5,-44,0xb0bec5,0,'metal');stn('dough',-26,-44,6,4.4,3.6,0xf0e6c8,'stone','Dough','🥖');stn('sc',-17,-44,6,4.4,3.6,0xd9402a,'stone','Sauce & Cheese','🧀');
  this.TOP.forEach((t,i)=>stn('t'+i,-26+i*9,-59.5,5.5,3,3.2,t[2],'stone',t[0],t[1]));
  stn('oven0',27.5,-52,5,6.5,7,0x6d3b2a,'brick','Brick Oven 1','🔥');stn('oven1',27.5,-42,5,6.5,7,0x6d3b2a,'brick','Brick Oven 2','🔥');box(2.4,12,2.4,27.5,-52,0x5a2a1e,7,'brick',false);box(2.4,12,2.4,27.5,-42,0x5a2a1e,7,'brick',false);
  stn('trash',4,-44,3,3,3.4,0x546e7a,'metal','Trash','🗑️');box(5,8,4,13,-59.5,0xeceff1,0,'metal');
  this.ob=[];[-52,-42].forEach((z,i)=>{const b=dec(new THREE.BoxGeometry(4,.5,.2),0x666666,24.8,4.2,z);b.rotation.y=Math.PI/2;b.material=new THREE.MeshBasicMaterial({color:0x666666});this.ob.push(b)});
  /* supply truck by the back door */
  box(14,6,7,-50,-48,0xeceff1,0,'metal');box(4.4,4.4,7,-41.5,-48,0x1e88e5,0,'metal');lab('🚚 Supply Truck',-50,9.5,-48,10);this.ST.truck={x:-46,z:-48,r:10,name:'Supply Truck',sym:'🚚'};
  /* town: houses, plaza fountain, planters, park, pond, trees, hills */
  this.HS=[];const hc=[0xd9b878,0xb8c9a5,0xc99a8a,0x9fb8d0,0xe3c88a,0xd0a0a0,0xa9c0d6,0xcfb38a],HX=[];
  const house=(x,z,i)=>{const a=Math.atan2(z,x);box(14,8,12,x,z,hc[i%8],0,'stone');box(15.6,1.5,13.6,x,z,0x7a3b2e,8,'brick',false);const dx=x-Math.cos(a)*9,dz=z-Math.sin(a)*9;dec(new THREE.BoxGeometry(2.6,4.4,.5),0x6b4a2b,dx,2.2,dz,'wood');dec(new THREE.BoxGeometry(.4,2.2,.4),0x5a3d28,dx+3,1.1,dz);dec(new THREE.BoxGeometry(1.4,1,.9),0x3b82f6,dx+3,2.4,dz);this.HS.push({x,z,dx,dz,i});HX.push([x,z])};
  for(let i=0;i<12;i++){const a=i/12*6.283+.2;house(Math.cos(a)*152,Math.sin(a)*152,i)}
  for(let i=0;i<8;i++){const a=i/8*6.283+.5,x=Math.cos(a)*84,z=Math.sin(a)*84;if(Math.abs(x)<50&&z<24&&z>-76)continue;house(x,z,i+3)}
  box(8,2.4,8,-26,18,0x9aa4ab,0,'stone');dec(new THREE.CylinderGeometry(2.6,3,5,12),0xcfd8dc,-26,4.5,18,'stone');const wt=dec(new THREE.CylinderGeometry(3.6,3.6,.2,24),0x4aa8ff,-26,2.5,18,'');wt.material=new THREE.MeshLambertMaterial({color:0x4aa8ff,transparent:true,opacity:.75});lab('⛲ Town Fountain',-26,9,18,10);
  for(let i=0;i<4;i++){box(5,1.6,2,24-6+i*4.4,16,0x8a5a2b,0,'wood');dec(new THREE.SphereGeometry(1.1,8,6),i%2?0xff6fa8:0xffd23a,24-6+i*4.4,2.4,16,'')}
  [-14,14].forEach(x=>{dec(new THREE.CylinderGeometry(.25,.3,8,6),0x333a44,x,4,0);dec(new THREE.SphereGeometry(.8,10,8),0xffe2a8,x,8.4,0,'').material=new THREE.MeshBasicMaterial({color:0xffe2a8})});
  const pond=dec(new THREE.CylinderGeometry(22,22,.1,32),0x2f7fd4,110,.07,-70,'');pond.material=new THREE.MeshLambertMaterial({color:0x2f7fd4,transparent:true,opacity:.85});lab('🏞️ Duck Pond',110,5,-70,10);
  for(let i=0;i<8;i++){const a=i/8*6.283+.4,m=dec(new THREE.ConeGeometry(34+i*4,40+i*7,8),i%2?0x5a8a4a:0x7a8a7a,Math.cos(a)*212,(40+i*7)/2-2,Math.sin(a)*212,'grass')}
  const tfree=(x,z)=>{if(Math.abs(x)<48&&z>-74&&z<14)return false;if(Math.abs(Math.hypot(x,z)-120)<14)return false;if(Math.abs(x)<12&&z>0)return false;if(HX.some(h=>Math.hypot(h[0]-x,h[1]-z)<16))return false;if(Math.hypot(x-110,z+70)<26)return false;if(Math.hypot(x+26,z-18)<10)return false;return true};
  for(let i=0;i<110;i++){const a=rs()*6.283,r=24+rs()*184,x=Math.cos(a)*r,z=Math.sin(a)*r;if(!tfree(x,z))continue;dec(new THREE.CylinderGeometry(.6,.9,5,6),0x5a3d28,x,2.5,z);dec(new THREE.SphereGeometry(3.6,10,8),0x3fa34d,x,7,z,'grass')}
  this.bm=dec(new THREE.CylinderGeometry(.7,.7,60,10),0xffd23a,0,30,0);this.bm.material=new THREE.MeshBasicMaterial({color:0xffd23a,transparent:true,opacity:.45});this.bm.visible=false;
  /* people already in the restaurant */
  this.dn=[];[[-28.2,-24,Math.PI/2],[-21.8,-16,-Math.PI/2],[19.2,-24,-Math.PI/2],[29.2,-16,-Math.PI/2]].forEach(([x,z,yw])=>{const n=this.mkCust();n.x=x;n.z=z;n.y=0;this.dn.push({n,yaw:yw})});
  /* cars must stay out of the building: bollards across the door and plaza */
  this.CB=[{x:0,z:-6.5,hw:7,hd:.8,top:3}];for(let x=-6;x<=6;x+=3)dec(new THREE.CylinderGeometry(.35,.35,2.2,8),0xffd23a,x,1.1,-6.5);
  this.cars=[];this.drv=null;[[-18,26],[-18,38],[18,26],[18,38]].forEach(([x,z],i)=>{const g=this.mkCar(this.CC[i],true);g.position.set(x,0,z);scene.add(g);this.cars.push({g,x,z,yaw:0,v:0,ci:i})});
  this.tf=[];for(let i=0;i<8;i++){const dir=i%2?-1:1,r=dir>0?124:116,g=this.mkCar(this.CC[(i+3)%8],false);scene.add(g);this.tf.push({g,a:i*.8,dir,r})}
  this.lv=[];
  this.P=newP(0,0,16);
  const old=document.getElementById('pzhud');if(old)old.remove();const h=document.createElement('div');h.id='pzhud';h.innerHTML='<div id="pzj"></div><div id="pzm"></div><div id="pzo" class="pn"></div><div id="pzs" class="pn"></div><div id="pzp" class="pn"></div>';(document.querySelector('#modal .win')||document.body).appendChild(h);
  h.querySelector('#pzj').onclick=e=>{const b=e.target.closest('[data-j]');if(b)this.setJob(b.dataset.j)};
  this.hud(1);this.msg('Welcome! Pick a job above (or press 1-5), then work the stations with E.')},
 update(dt){const P=this.P,S=this.S;this.t+=dt;this.hu+=dt;if(this.drv)this.drive(dt);else{const px=P.x,pz=P.z;ctrl(P,dt,S);if(this.job==='delivery'){P.x+=(P.x-px)*.6;P.z+=(P.z-pz)*.6;pushOut(P,S)}if(this.hold)P.J.aR.rotation.x=-1.15}
  this.traffic(dt);
  ['Digit1','Digit2','Digit3','Digit4','Digit5'].forEach((k,i)=>{if(keys[k]&&!this.pk[k])this.setJob(this.JOBS[i][0]);this.pk[k]=!!keys[k]});
  if(this.mt>0){this.mt-=dt;if(this.mt<=0){const m=document.getElementById('pzm');if(m)m.style.display='none'}}
  /* orders come in; they expire if ignored */
  this.sp-=dt;if(this.sp<=0){this.sp=Math.max(9,22-this.D.served*.3)+Math.random()*8;this.mkOrder()}
  for(const o of this.tk.slice()){o.age+=dt;const lim=o.st==='wait'?55:o.kind==='dine'?110:150;if(o.age>lim)this.drop(o,o.name+'\'s order expired 😞')}
  if(this.cust&&this.cust.n){if(this.cust.wp&&this.cust.wp.length)this.cw(this.cust.n,this.cust.wp,dt);else npcTick(this.cust.n,P,dt)}
  for(let i=this.lv.length-1;i>=0;i--){const l=this.lv[i];if(this.cw(l.n,l.wp,dt)){scene.remove(l.n.g);this.lv.splice(i,1)}}
  for(const d of this.dn){const n=d.n;n.gr=true;n.vy=0;n.hs=0;n.t+=dt;n.yaw=d.yaw;animate(n,dt)}
  if(this.pizzaSign)this.pizzaSign.rotation.z+=dt*.6;
  {const inn=Math.abs(P.x)<34&&P.z>-64&&P.z<-8,tg=inn?.1:1;for(const m of this.roof){m.material.opacity+=(tg-m.material.opacity)*Math.min(1,dt*5)}}
  /* ovens */
  this.ov.forEach((o,i)=>{if(o.st==='cook'){o.t+=dt;if(o.t>=10){o.st='done';o.t=0;snd(1000,.2,'triangle',.12,1400);this.msg('🍕 Oven '+(i+1)+' is ready!')}}else if(o.st==='done'){o.t+=dt;if(o.t>9&&!o.burnt){o.burnt=true;this.msg('🔥 A pizza is burning!')}}
   const b=this.ob[i];b.visible=o.st!=='idle';const f=o.st==='cook'?o.t/10:1;b.scale.x=Math.max(.02,f);b.material.color.setHex(o.st==='cook'?0xffa000:o.burnt?0x222222:0x43a047)});
  /* beam to the delivery address */
  const H=this.hold,ho=H&&H.k==='boxed'?this.tk.find(x=>x.id===H.oid):null;if(ho&&ho.kind==='deliver'){const hs=this.HS[ho.h];this.bm.visible=true;this.bm.position.set(hs.dx,30,hs.dz)}else this.bm.visible=false;
  /* nearest station + prompt */
  let ns=null,nd=1e9;for(const id in this.ST){if(this.drv)break;const s=this.ST[id],d=Math.hypot(P.x-s.x,P.z-s.z);if(d<s.r&&d<nd){nd=d;ns=id}}
  const dl=ho&&ho.kind==='deliver'&&Math.hypot(P.x-this.HS[ho.h].dx,P.z-this.HS[ho.h].dz)<(this.drv?11:6),e=keys.KeyE&&!this.pe,nc=this.drv?null:this.cars.find(c=>Math.hypot(P.x-c.x,P.z-c.z)<7);this.pe=!!keys.KeyE;
  const pr=document.getElementById('pzp');if(pr){pr.innerHTML=(dl?'<b>E: Deliver pizza 🏠</b><br>':this.drv?'<b>E: Exit car</b> · W/S drive · A/D steer<br>':!ns&&nc?'<b>E: Drive 🚗</b><br>':ns?'<b>E: '+this.ST[ns].sym+' '+this.ST[ns].name+'</b><br>':'')+'<small>'+this.guide()+'</small>'+(this.hold?'<br><small>Holding: '+({dough:'🥖 dough',raw:'🍕 raw pizza '+(this.hold.t||[]).map(i=>this.TOP[i][1]).join(''),pizza:(this.hold.burnt?'🔥 burnt':'🍕 baked')+' pizza '+(this.hold.t||[]).map(i=>this.TOP[i][1]).join(''),boxed:'📦 boxed pizza',crate:'📦 crate'})[this.hold.k]+'</small>':'')}
  if(e){if(dl)this.deliver();else if(this.drv)this.exit();else if(ns)this.act(ns);else if(nc)this.enter(nc)}
  if(this.hu>=.4){this.hu=0;this.hud();if(!this.sv0||this.t-this.sv0>8){this.sv0=this.t;this.sv()}}
  scoreEl.textContent='🍕 Served '+this.D.served+' · 💵 '+this.D.earn+' earned'}};
setInterval(()=>{const h=document.getElementById('pzhud');if(h)h.style.display=(typeof cur!=='undefined'&&cur===ENG.pizza)?'':'none'},250);
