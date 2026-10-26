/* Game: Avatar Shop (id: avatar) - card, menu info and game engine. */
GAMES.push({id:'avatar',name:'Avatar Shop',tag:'Shop',e:'🧢',c:['#26c6a2','#4f8cff'],like:'99%',pl:'Shop',hint:'Earn 10 SchoolBux every minute, then buy clothes (5), faces (20) and everything else (50). Your look is saved for all games. Keys 1 and 2 make your avatar wave or dance.'});
META.avatar={c:'Customize',m:'SchoolBux shop',t:['Hats','Outfits','Effects']};
ENG.avatar={d3:true,start(){baseScene(0xa8d8ff);showOver('');slab(40,1,40,0,-.5,0,0x9fb4c8);this.P=newP(0,0,0);this.P.gr=true;buildCustom();camera.position.set(0,6,16);camera.lookAt(0,3.2,0);sun.position.set(25,80,35);sun.target.position.set(0,0,0)},
 rebuild(){const o=this.P;scene.remove(o.g);const n=newP(0,0,0);n.gr=true;n.yaw=o.yaw;n.emote=o.emote;n.t=o.t;this.P=n},
 update(dt){const P=this.P;P.t+=dt;P.gr=true;P.hs=0;P.yaw+=dt*.5;animate(P,dt);scoreEl.textContent='💵 Earn 10 SchoolBux every minute'}};
