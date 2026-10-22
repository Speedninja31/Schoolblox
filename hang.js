/* Game: Plaza Hangout (id: hang) - card, menu info and game engine. */
GAMES.push({id:'hang',name:'Plaza Hangout',tag:'Social',e:'🏙️',c:['#4fc3f7','#7e57c2'],like:'97%',pl:'20.1K',hint:'Hang out with friends. Enter = chat, 1-7 or the Emotes button for emotes, explore the plaza, fountain and stage.'});
META.hang={c:'Social',m:'Multiplayer',t:['Chat','Emotes']};
ENG.hang={d3:true,reset(){Object.assign(this.P,{x:0,y:1,z:12,vy:0})},
 start(){
  baseScene(0xaee0ff);showOver('');
  const rs=mulb(4242),S=this.S=[{x:0,z:0,r:75,top:0}];
  const gr=new THREE.Mesh(new THREE.CylinderGeometry(75,75,4,48),lam(0xcfd8c0));gr.position.y=-2;gr.receiveShadow=true;scene.add(gr);
  const sea=new THREE.Mesh(new THREE.PlaneGeometry(900,900),new THREE.MeshBasicMaterial({color:0x2a7fd4}));sea.rotation.x=-Math.PI/2;sea.position.y=-6;scene.add(sea);
  const fb=new THREE.Mesh(new THREE.CylinderGeometry(7,7,1.6,28),lam(0xb8bcc4));fb.position.y=.8;fb.castShadow=fb.receiveShadow=true;scene.add(fb);S.push({x:0,z:0,hw:6,hd:6,top:1.6,bot:0});
  const fw=new THREE.Mesh(new THREE.CylinderGeometry(5.6,5.6,.3,28),new THREE.MeshBasicMaterial({color:0x4aa8ff}));fw.position.y=1.6;scene.add(fw);
  slab(26,2,12,0,1,-45,0x7a4fd0);S.push({x:0,z:-45,hw:13,hd:6,top:2,bot:0});
  slab(8,1,3,0,.5,-37,0x9a6fe0);S.push({x:0,z:-37,hw:4,hd:1.5,top:1,bot:0});
  for(let i=0;i<6;i++){const a=i*1.047,b=slab(6,1,1.6,Math.cos(a)*20,.5,Math.sin(a)*20,0x8a5a2b);b.rotation.y=-a+Math.PI/2}
  for(let i=0;i<16;i++){const a=rs()*6.283,r=28+rs()*40,x=Math.cos(a)*r,z=Math.sin(a)*r;if(Math.abs(z+45)<12&&Math.abs(x)<18)continue;
   const tr=new THREE.Mesh(new THREE.CylinderGeometry(.8,1,5,8),lam(0x7a5230));tr.position.set(x,2.5,z);tr.castShadow=true;scene.add(tr);
   const lf=new THREE.Mesh(new THREE.SphereGeometry(4,12,10),lam(0x4caf50));lf.position.set(x,7,z);lf.castShadow=true;scene.add(lf)}
  this.P=newP(0,0,12)},
 update(dt){ctrl(this.P,dt,this.S);scoreEl.textContent='Plaza Hangout'}};
