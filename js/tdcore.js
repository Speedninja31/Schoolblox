/* ====== Tower Defense: data + registry (no rendering of the lobby/match here) ======
   Everything about a tower lives in ONE registry entry, so adding or replacing towers never touches the shop or the match code:
     SBTD.register({id,name,model,price,cost,stats:{type,dmg,rate,range,...},desc,unlock,avail})
   - id      unique id, saved in the player's data
   - model   a function () => THREE.Group built at world scale (avatar = 5.2 tall). To swap in a finished plant, just change this one function
             (or call SBTD.setModel('ph1', myBuilder)). The group may expose userData.head (turns toward targets) and userData.muzzle ({x,y,z}).
   - price   Petals (this game's own currency) to own it (0 = free starter)      cost  Sun (in-match cash) needed to place it
   - stats   dmg / rate (shots per second) / range (studs); plus type-specific extras (slow, splash, bonus ...)
   - unlock  null or {wins:n,matches:n}  (shown as a lock until reached)      avail  false hides a tower from the shop (coming soon)
   Ownership / equipped slots / personal stats are saved in localStorage 'hubtd' (matches the cloud-save pattern, so it follows the account). */
const SBTD=(()=>{
 const KEY='hubtd',MAXEQ=5,REG={},ORDER=[];
 let D={own:{ph1:1},eq:['ph1'],w:0,k:0,m:0,p:120};   /* p = Petals, this game's own currency (starter gift of 120). It is NOT SchoolBux and never touches the global balance. */
 try{const s=JSON.parse(localStorage.getItem(KEY)||'null');if(s&&typeof s==='object'){D=Object.assign(D,s);if(!D.own||typeof D.own!=='object')D.own={ph1:1};if(typeof D.p!=='number'||!isFinite(D.p)||D.p<0)D.p=s.p===undefined?120:0;if(!Array.isArray(D.eq))D.eq=['ph1']}}catch(e){}
 const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(D))}catch(e){}};
 const num=v=>typeof v==='number'&&isFinite(v)?v:0;
 /* ---------- registry ---------- */
 function register(def){if(!def||!def.id)return;if(!REG[def.id])ORDER.push(def.id);REG[def.id]=Object.assign({avail:true,price:0,cost:100,unlock:null,desc:'',stats:{}},def)}
 const get=id=>REG[id]||null,list=()=>ORDER.map(i=>REG[i]).filter(t=>t.avail);
 const setModel=(id,fn)=>{if(REG[id])REG[id].model=fn};
 const owned=id=>!!D.own[id]||(REG[id]&&REG[id].price===0&&!REG[id].unlock);
 const lockInfo=id=>{const t=REG[id];if(!t||!t.unlock)return null;const u=t.unlock,miss=[];if(u.wins&&D.w<u.wins)miss.push('Win '+u.wins+' match'+(u.wins>1?'es':'')+' ('+D.w+'/'+u.wins+')');if(u.matches&&D.m<u.matches)miss.push('Play '+u.matches+' matches ('+D.m+'/'+u.matches+')');return miss.length?miss.join(' · '):null};
 const equipped=()=>D.eq.filter(id=>REG[id]&&owned(id)).slice(0,MAXEQ);
 const bal=()=>Math.floor(D.p);
 const CUR={name:'Petals',icon:'\uD83C\uDF38'},fmtP=n=>CUR.icon+' '+n;
 function addPetals(n){n=Math.max(0,Math.floor(n)||0);D.p+=n;save();return n}
 function buy(id){const t=REG[id];if(!t||!t.avail)return{ok:false,msg:'Not available yet'};if(owned(id))return{ok:false,msg:'You already own this'};const lk=lockInfo(id);if(lk)return{ok:false,msg:'Locked: '+lk};
  if(bal()<t.price)return{ok:false,msg:'Need '+(t.price-bal())+' more Petals'};D.p-=t.price;D.own[id]=1;if(D.eq.length<MAXEQ&&!D.eq.includes(id))D.eq.push(id);save();return{ok:true,msg:'Purchased '+t.name+'!'}}
 function equip(id){if(!owned(id))return{ok:false,msg:'You do not own this tower'};if(D.eq.includes(id))return{ok:true,msg:'Already equipped'};if(D.eq.length>=MAXEQ)return{ok:false,msg:'All '+MAXEQ+' slots are full - unequip one first'};D.eq.push(id);save();return{ok:true,msg:'Equipped '+REG[id].name}}
 function unequip(id){D.eq=D.eq.filter(i=>i!==id);save();return{ok:true,msg:'Unequipped'}}
 /* ---------- personal stats ---------- */
 const stats=()=>({w:D.w,k:D.k,m:D.m});
 function addKills(n){D.k+=n}
 function endMatch(won){D.m++;if(won)D.w++;save();pushScore()}
 /* optional global leaderboard (see supabase-td-leaderboard.sql). Silently does nothing if the table isn't there. */
 async function pushScore(){try{const c=typeof sbGet==='function'?sbGet():null,u=window.SBACC&&SBACC.user?SBACC.user():null;if(!c||!u)return;await c.from('td_scores').upsert({user_id:u.id,name:u.name,wins:D.w,kills:D.k,matches:D.m},{onConflict:'user_id'})}catch(e){}}
 async function fetchTop(){try{const c=typeof sbGet==='function'?sbGet():null;if(!c)return null;const r=await c.from('td_scores').select('name,wins,kills,matches').order('wins',{ascending:false}).order('kills',{ascending:false}).limit(8);return r.error||!r.data?null:r.data}catch(e){return null}}
 /* ---------- enemies + waves (shared by every client, fully deterministic) ---------- */
 const ENEMY={grunt:{n:'Shambler',hp:34,spd:7.5,rw:7,sz:1,skin:0x7fb069,top:0x6a5a4a,legs:0x3a4a6a},runner:{n:'Sprinter',hp:20,spd:12.5,rw:6,sz:.88,skin:0x8fc46a,top:0xd9822b,legs:0x2e2e38},tank:{n:'Brute',hp:150,spd:4.6,rw:20,sz:1.4,skin:0x6a9455,top:0x5a5f6e,legs:0x44464f},swarm:{n:'Crawler',hp:9,spd:10,rw:3,sz:.62,skin:0x92b858,top:0x7a4a4a,legs:0x4a4a3a},boss:{n:'Zombie King',hp:1700,spd:3.6,rw:300,sz:2.1,skin:0x6a8f5a,top:0x5a2f7a,legs:0x2a1f3a}};
 const WAVES=11;
 /* returns a list of {t:type,at:secondsAfterWaveStart} */
 function wave(n){const L=[],add=(t,c,gap,d)=>{for(let i=0;i<c;i++)L.push({t,at:(d||0)+i*gap})};
  if(n===1){add('grunt',8,1.6)}else if(n===2){add('grunt',10,1.3);add('runner',4,1.5,6)}else if(n===3){add('swarm',18,.55);add('grunt',6,1.4,6)}else if(n===4){add('runner',10,.9);add('tank',2,4,5)}
  else if(n===5){add('grunt',14,1);add('tank',4,3,4);add('swarm',10,.5,12)}else if(n===6){add('runner',14,.7);add('swarm',24,.4,5)}else if(n===7){add('tank',8,2.4);add('grunt',16,.9,3)}
  else if(n===8){add('runner',20,.6);add('tank',6,2,4);add('swarm',24,.35,10)}else if(n===9){add('tank',12,1.8);add('grunt',24,.7,4);add('runner',12,.8,10)}else if(n===10){add('swarm',50,.3);add('tank',10,1.6,6);add('runner',20,.6,12)}
  else if(n===11){add('boss',1,1,2);add('grunt',20,.9,6);add('tank',8,2.2,8)}
  return L.sort((a,b)=>a.at-b.at)}
 /* ---------- placeholder plant models (TEMPORARY - replace via setModel) ---------- */
 const mat=(c,e)=>new THREE.MeshLambertMaterial({color:c,emissive:e||0x000000});
 const mk=(geo,m,x,y,z)=>{const o=new THREE.Mesh(geo,m);o.position.set(x,y,z);o.castShadow=true;return o};
 function pot(g,c){g.add(mk(new THREE.CylinderGeometry(1.5,1.2,1.3,10),mat(c||0xb5653e),0,.65,0));g.add(mk(new THREE.CylinderGeometry(1.6,1.6,.25,10),mat(0x8a4a2e),0,1.35,0))}
 function eyes(h,y,z,r){for(const s of[-1,1]){h.add(mk(new THREE.SphereGeometry(r,8,6),mat(0xffffff),s*r*1.6,y,z));h.add(mk(new THREE.SphereGeometry(r*.5,6,5),mat(0x111111),s*r*1.6,y,z+r*.7))}}
 const MODELS={
  ph1(){const g=new THREE.Group();pot(g);g.add(mk(new THREE.CylinderGeometry(.35,.45,2.4,7),mat(0x3f9a3a),0,2.6,0));const h=new THREE.Group();h.position.set(0,4.4,0);g.add(h);h.add(mk(new THREE.SphereGeometry(1.5,12,9),mat(0x57c24a),0,0,0));const b=mk(new THREE.CylinderGeometry(.6,.7,2,9),mat(0x2f7f35),0,-.1,1.7);b.rotation.x=PI2;h.add(b);eyes(h,.55,1.15,.34);h.add(mk(new THREE.BoxGeometry(2.8,.25,1.2),mat(0x3f9a3a),0,.4,-.4));g.userData={head:h,muzzle:{x:0,y:4.3,z:3}};return g},
  ph2(){const g=new THREE.Group();pot(g,0x7a4a8a);g.add(mk(new THREE.CylinderGeometry(.45,.55,2,7),mat(0x3f9a3a),0,2.3,0));const h=new THREE.Group();h.position.set(0,4.1,0);g.add(h);h.add(mk(new THREE.SphereGeometry(2,12,9),mat(0x8a3fb0),0,0,0));
   const jaw=mk(new THREE.BoxGeometry(2.6,.5,1.8),mat(0x5a1f7a),0,-.8,1.1);h.add(jaw);for(let i=-2;i<=2;i++)h.add(mk(new THREE.ConeGeometry(.22,.55,5),mat(0xffffff),i*.5,-.45,1.9));h.add(mk(new THREE.BoxGeometry(1.1,.2,1),mat(0xe0405a),0,-.65,1.4));eyes(h,.9,1.6,.38);
   for(const s of[-1,1]){const l=mk(new THREE.BoxGeometry(2.4,.2,.9),mat(0x3f9a3a),s*1.6,1.2,-.4);l.rotation.z=s*.5;g.add(l)}g.userData={head:h,muzzle:{x:0,y:4,z:2.4}};return g},
  ph3(){const g=new THREE.Group();pot(g,0x4a7ab5);g.add(mk(new THREE.CylinderGeometry(.35,.45,2.2,7),mat(0x3f9a8a),0,2.5,0));const h=new THREE.Group();h.position.set(0,4.2,0);g.add(h);
   for(let i=0;i<6;i++){const a=i/6*Math.PI*2,p=mk(new THREE.BoxGeometry(.8,.15,2.4),mat(0x8fd8ff,0x103050),Math.cos(a)*1.4,0,Math.sin(a)*1.4);p.rotation.y=-a+PI2;p.rotation.z=.25;h.add(p)}h.add(mk(new THREE.SphereGeometry(.95,10,8),mat(0xdff6ff,0x4090c0),0,.3,0));g.userData={head:h,muzzle:{x:0,y:4.4,z:0}};return g},
  ph4(){const g=new THREE.Group();pot(g,0x9a7a2e);g.add(mk(new THREE.CylinderGeometry(.5,.8,3,8),mat(0x8aa83a),0,2.9,0));const h=new THREE.Group();h.position.set(0,5.2,0);g.add(h);h.add(mk(new THREE.SphereGeometry(1.2,10,8),mat(0xc8d84a),0,0,0));
   for(let i=0;i<8;i++){const a=i/8*Math.PI*2,s=mk(new THREE.ConeGeometry(.28,1.1,5),mat(0xf2e870),Math.cos(a)*1.05,.1,Math.sin(a)*1.05);s.rotation.z=-Math.cos(a)*1.2;s.rotation.x=Math.sin(a)*1.2;h.add(s)}
   const b=mk(new THREE.ConeGeometry(.45,3.6,6),mat(0xe8dc60),0,0,2.3);b.rotation.x=PI2;h.add(b);eyes(h,.4,1.0,.3);g.userData={head:h,muzzle:{x:0,y:5.2,z:4.1}};return g}};
 const PI2=Math.PI/2;
 /* ---------- the four temporary example towers ---------- */
 register({id:'ph1',name:'Placeholder Tower 1',model:MODELS.ph1,price:0,cost:100,desc:'Temporary starter plant. Fires seeds at the first enemy in range. Balanced and affordable.',stats:{type:'shooter',dmg:9,rate:1.8,range:36,speed:70}});
 register({id:'ph2',name:'Placeholder Tower 2',model:MODELS.ph2,price:120,cost:150,desc:'Temporary close-range chomper. Bites hard, slowly, and shrugs off armored enemies.',stats:{type:'chomper',dmg:58,rate:.72,range:15,bonus:{tank:1.6,boss:1.25}}});
 register({id:'ph3',name:'Placeholder Tower 3',model:MODELS.ph3,price:250,cost:170,desc:'Temporary frost bloom. Chills everything nearby so your other towers get more shots.',stats:{type:'frost',dmg:3,rate:1,range:28,slow:.5,slowTime:2.2}});
 register({id:'ph4',name:'Placeholder Tower 4',model:MODELS.ph4,price:450,cost:250,unlock:{wins:1},desc:'Temporary long-range thorn spire. Slow, but its spikes hit very hard from far away.',stats:{type:'thorn',dmg:78,rate:.45,range:62,speed:130}});
 return{CUR,fmtP,addPetals,register,get,list,setModel,owned,lockInfo,equipped,buy,equip,unequip,stats,addKills,endMatch,fetchTop,pushScore,MAXEQ,ENEMY,WAVES,wave,save,data:()=>D,bal}})();
