/* ====== ACCOUNTS (username + password, cloud-saved progress) ======
   Uses Supabase Auth. The username becomes a hidden login "name@schoolblox.app" (no real email is collected) and Supabase stores only a
   salted hash of the password. Progress (SchoolBux, avatar, pets, garden, pizza, settings, friends) is copied to the `saves` table
   (see supabase-setup.sql) and restored on any device. Guests still work: their progress just stays in this browser.
   This file loads BEFORE core.js so that cloud progress is put into localStorage before the game reads it. */
const SBACC=(()=>{
 const OK=/^(hub[a-z0-9]*|avatar|tbest)$/,DOM='@schoolblox.app';
 const collect=()=>{const d={};for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(OK.test(k)){const v=localStorage.getItem(k);if(v!=null)d[k]=v}}return d};
 const canon=d=>{const o={};Object.keys(d).sort().forEach(k=>o[k]=d[k]);return JSON.stringify(o)};
 const hash=s=>{let h=5381;for(let i=0;i<s.length;i++)h=((h<<5)+h+s.charCodeAt(i))|0;return h+':'+s.length};
 const mark=()=>{try{return JSON.parse(localStorage.getItem('sbsync')||'null')}catch(e){return null}};
 const setMark=m=>{try{localStorage.setItem('sbsync',JSON.stringify(m))}catch(e){}};
 /* 1) cloud progress waiting from before a page reload: put it in place before anything reads localStorage */
 try{const pj=sessionStorage.getItem('sbpend');if(pj){sessionStorage.removeItem('sbpend');const o=JSON.parse(pj);
  for(let i=localStorage.length-1;i>=0;i--){const k=localStorage.key(i);if(OK.test(k))localStorage.removeItem(k)}
  const d=(o&&o.d)||{};for(const k in d)if(OK.test(k)&&typeof d[k]==='string')localStorage.setItem(k,d[k]);
  if(o&&o.m)setMark(o.m);else localStorage.removeItem('sbsync')}}catch(e){}
 /* what this browser held before the game started touching it (used to tell "changed here" from "changed on another device") */
 let H0='';try{H0=hash(canon(collect()))}catch(e){}

 const $=id=>document.getElementById(id),RES=String(typeof ADMIN_ACCOUNT!=='undefined'?ADMIN_ACCOUNT:'').toLowerCase();
 let user=null,uname='',verified=false,mode='login',forced=false,syncing=false,lastSave=0,started=false,reload=()=>location.reload();
 const cli=()=>{try{return typeof sbGet==='function'?sbGet():null}catch(e){return null}};
 const say=m=>{if(typeof toast==='function')toast(m)};
 const hasProg=d=>Object.keys(d).some(k=>k!=='hubp'&&k!=='hubcode');
 const nameOf=u=>{const nm=String((u&&u.email)||'').split('@')[0].toLowerCase(),meta=String((u&&u.user_metadata&&u.user_metadata.name)||'');return meta.toLowerCase()===nm?meta:nm};
 const badName=(v,acct)=>{v=String(v||'').trim();if(v.length<3||v.length>14)return'Use 3 to 14 characters.';
  if(!(acct?/^[A-Za-z0-9_]+$/:/^[A-Za-z0-9_ ]+$/).test(v))return acct?'Letters, numbers and _ only.':'Letters, numbers, spaces and _ only.';
  if(/^player\d{4}$/i.test(v))return'Please pick your own name.';if(typeof chatCheck==='function'&&chatCheck(v).any)return'Please choose a different name.';return''};
 const isAdmin=()=>!!(RES&&user&&verified&&uname.toLowerCase()===RES);

 /* ---------- cloud ---------- */
 async function pull(){const r=await cli().from('saves').select('data,updated_at').eq('user_id',user.id).maybeSingle();if(r.error)throw r.error;return r.data}
 async function push(force){if(!user||syncing)return false;const c=cli();if(!c)return false;const d=collect(),s=canon(d),m=mark();
  if(!force&&m&&m.u===user.id&&m.h===hash(s))return true;if(s.length>1400000){say('Your save is too big to store online.');return false}
  syncing=true;try{const r=await c.from('saves').upsert({user_id:user.id,name:uname,data:d},{onConflict:'user_id'}).select('updated_at').single();if(r.error)throw r.error;
   setMark({u:user.id,h:hash(s),t:Date.parse(r.data&&r.data.updated_at)||Date.now()});lastSave=Date.now();draw();return true}
  catch(e){console.warn('cloud save failed',e);if(!push.warned){push.warned=1;say('☁️ Could not save to your account yet. Check your connection (or ask the site owner to finish setup).')}return false}finally{syncing=false}}
 /* replace this browser's progress with the account's, then reload so every game reads it */
 const clean=d=>{const o={};if(d&&typeof d==='object')for(const k in d)if(OK.test(k)&&typeof d[k]==='string'&&d[k].length<2e6)o[k]=d[k];return o};
 function applyRow(row){const d=clean(row.data);try{sessionStorage.setItem('sbpend',JSON.stringify({d,m:{u:user.id,h:hash(canon(d)),t:Date.parse(row.updated_at)||Date.now()}}))}catch(e){return false}reload();return true}
 function wipeLocal(m){try{sessionStorage.setItem('sbpend',JSON.stringify({d:{},m:m||null}))}catch(e){}reload()}

 /* ---------- session ---------- */
 function setUser(u,v){user=u||null;verified=!!(u&&v);uname=u?nameOf(u):'';applyNick();draw();try{if(window.SBADM)SBADM.sync()}catch(e){}}
 function applyNick(){const nk=$('nick');if(!nk)return;if(user){nk.readOnly=true;nk.title='Your account name';if(nk.value!==uname){nk.value=uname;nk.dispatchEvent(new Event('change'));nk.dispatchEvent(new Event('input'))}}else{nk.readOnly=false;nk.title=''}}
 function startAuto(){if(started)return;started=true;setInterval(()=>{if(user)push()},15000);addEventListener('online',()=>{if(user)push()});
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&user)push()});addEventListener('pagehide',()=>{if(user)push()})}
 async function restore(){const c=cli();if(!c)return;let ss=null;try{const r=await c.auth.getSession();ss=r&&r.data&&r.data.session}catch(e){}
  if(!ss||!ss.user){setUser(null);return}
  setUser(ss.user,false);startAuto();
  try{const r=await c.auth.getUser();if(r.error){const m=String(r.error.message||'').toLowerCase(),st=r.error.status;if(st===401||st===403||st===404||/jwt|token|session|not found|invalid/.test(m)){try{await c.auth.signOut({scope:'local'})}catch(e){}setUser(null);return}}
   else if(r.data&&r.data.user){setUser(r.data.user,true)}}catch(e){/* offline: keep playing with the saved session, just not verified */}
  try{const row=await pull(),m=mark();
   if(!row){await push(true)}
   else if(!m||m.u!==user.id){applyRow(row)}
   else if(H0===m.h){if(Date.parse(row.updated_at)>m.t+1500)applyRow(row)}
   else await push(true)}
  catch(e){console.warn('cloud sync problem',e);if(!restore.w){restore.w=1;say('☁️ Cloud saving is not set up yet. Your progress is still saved in this browser.')}}
  draw()}

 /* ---------- log in / create account ---------- */
 const msgOf=e=>{const m=String((e&&e.message)||'').toLowerCase();
  if(/already|exists|registered/.test(m))return'That username is taken. Try another one, or log in.';
  if(/invalid login|invalid credentials/.test(m))return'Wrong username or password.';
  if(/rate|too many|seconds/.test(m))return'Too many tries. Wait a minute and try again.';
  if(/password/.test(m))return'Password must be at least 6 characters.';
  if(/signups? (are )?(not allowed|disabled)/.test(m))return'New accounts are switched off right now.';
  if(/network|fetch|failed/.test(m))return'Could not reach the server. Check your internet and try again.';
  return'Something went wrong. Please try again.'};
 const err=t=>{const e=$('uge');if(e)e.textContent=t||''};
 const busy=b=>{const x=$('ugb');if(x){x.disabled=!!b;x.style.opacity=b?.6:1}};
 function closeGate(){const g=$('ugate');if(g)g.classList.remove('on');forced=false}
 async function go(){const n=($('ugi').value||'').trim().replace(/\s+/g,' '),p=$('agpw').value||'';err('');
  if(mode==='guest'){let m=badName(n,false);if(!m&&RES&&n.toLowerCase()===RES)m='That name is reserved.';if(m)return err(m);const nk=$('nick');nk.value=n;nk.dispatchEvent(new Event('change'));nk.dispatchEvent(new Event('input'));closeGate();return}
  let m=badName(n,true);if(m)return err(m);if(p.length<6)return err('Password must be at least 6 characters.');if(p.length>72)return err('Password is too long.');
  const c=cli();if(!c)return err('Accounts need the online connection, which is not set up on this site.');
  busy(true);try{
   if(mode==='signup'){const keep=hasProg(collect())?confirm('Save the progress already on this browser (SchoolBux, avatar, pets...) to your new account?\n\nOK = keep it\nCancel = start the new account fresh'):true;
    const r=await c.auth.signUp({email:n.toLowerCase()+DOM,password:p,options:{data:{name:n}}});if(r.error)return err(msgOf(r.error));
    if(!r.data||!r.data.session){err('Account created, but this site still requires email confirmation. The site owner must turn "Confirm email" off in Supabase.');return}
    setUser(r.data.session.user,true);startAuto();closeGate();
    if(keep){await push(true);say('✅ Account created! Your progress now saves online.')}else wipeLocal({u:user.id,h:hash('{}'),t:Date.now()});return}
   const r=await c.auth.signInWithPassword({email:n.toLowerCase()+DOM,password:p});if(r.error)return err(msgOf(r.error));
   setUser(r.data.user||r.data.session.user,true);startAuto();
   let row=null;try{row=await pull()}catch(e){console.warn(e);say('☁️ Cloud saving is not set up yet. Ask the site owner.')}
   const local=collect();
   if(row){if(canon(local)===canon(clean(row.data))){setMark({u:user.id,h:hash(canon(local)),t:Date.parse(row.updated_at)||Date.now()});closeGate();say('✅ Logged in as '+uname)}
    else{if(hasProg(local)&&!confirm('Log in as '+uname+'?\n\nThis browser\'s current progress will be replaced by the progress saved on that account.')){try{await c.auth.signOut()}catch(e){}setUser(null);return err('Login cancelled.')}
     closeGate();applyRow(row)}}
   else{closeGate();await push(true);say('✅ Logged in as '+uname)}
  }catch(e){console.warn(e);err(msgOf(e))}finally{busy(false)}}
 async function logout(){if(!user)return;if(!confirm('Log out of '+uname+'?\n\nYour progress is saved to your account. This browser will go back to a fresh guest.'))return;
  const ok=await push(false);if(!ok&&!confirm('Your latest progress could not be saved online. Logging out will erase it from this browser. Log out anyway?'))return;
  try{await cli().auth.signOut()}catch(e){}user=null;verified=false;wipeLocal(null)}

 /* ---------- screens ---------- */
 function tabs(m){mode=m;['login','signup','guest'].forEach((k,i)=>{const b=$('agt'+(i+1));if(b)b.classList.toggle('on',k===m)});
  $('agpw').style.display=m==='guest'?'none':'';$('agpw').autocomplete=m==='signup'?'new-password':'current-password';
  $('agp').textContent={login:'Log in to load your saved progress.',signup:'Pick a username and a password. Your progress will save to your account and follow you to any device. There is no password reset, so remember it!',guest:'Play without an account. Your progress only saves in this browser.'}[m];
  $('ugb').textContent={login:'Log in',signup:'Create account',guest:'Continue as guest'}[m];err('');setTimeout(()=>{try{$('ugi').focus()}catch(e){}},50)}
 function show(m,canClose){const g=$('ugate');if(!g)return;forced=!canClose;g.classList.add('on');$('ugi').value='';$('agpw').value='';tabs(m||'login');const x=$('agx');if(x)x.style.display=canClose?'':'none'}
 const need=()=>{const nk=$('nick');if(!nk)return false;if(user)return false;const v=nk.value.trim();return !!badName(v,false)||!!(RES&&v.toLowerCase()===RES)};
 function draw(){const b=$('accbox');if(!b)return;
  if(user){const ago=lastSave?Math.max(1,Math.round((Date.now()-lastSave)/1000)):0,st=lastSave?'Saved just now'+(ago>5?' ('+ago+'s ago)':''):'Saves automatically every few seconds';
   b.innerHTML='<span>✅ Signed in as <b></b>. Your progress saves to your account, so you can play on any device. '+(isAdmin()?'🛡️ Admin account.':'')+'</span><span class="accst" style="opacity:.8;font-size:12px">'+st+'</span><div style="display:flex;gap:6px;flex-wrap:wrap"><button id="accsv">💾 Save now</button><button id="acclo">🚪 Log out</button></div>';
   b.querySelector('b').textContent=uname;$('accsv').onclick=async()=>{say(await push(true)?'💾 Saved to your account':'Could not save right now')};$('acclo').onclick=logout}
  else{b.innerHTML='<span>You are playing as a guest. Your progress only lives in this browser. Create an account so you never lose it.</span><div style="display:flex;gap:6px;flex-wrap:wrap"><button id="accsu">✨ Create account</button><button id="acclg">🔑 Log in</button></div>';
   $('accsu').onclick=()=>show('signup',true);$('acclg').onclick=()=>show('login',true)}}
 function boot(){const g=$('ugate');if(!g||!$('agt1'))return;
  $('agt1').onclick=()=>tabs('login');$('agt2').onclick=()=>tabs('signup');$('agt3').onclick=()=>tabs('guest');
  $('ugb').onclick=go;[$('ugi'),$('agpw')].forEach(i=>i.onkeydown=ev=>{ev.stopPropagation();if(ev.key==='Enter')go()});
  const x=$('agx');if(x)x.onclick=closeGate;
  const nk=$('nick');if(nk)nk.addEventListener('change',()=>{if(need()&&!g.classList.contains('on'))show('guest',false)});
  draw();
  const done=()=>{if(boot.d)return;boot.d=1;if(need())show('login',false)};
  Promise.race([restore().catch(e=>console.warn(e)),new Promise(r=>setTimeout(r,1800))]).then(done)}
 if(typeof document!=='undefined'){if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot()}
 return{isAdmin,user:()=>user&&{id:user.id,name:uname},name:()=>uname,loggedIn:()=>!!user,open:show,saveNow:()=>push(true),logout,badName,
  _:{collect,canon,hash,mark,push,pull,restore,go,tabs,show,need,H0:()=>H0,setReload:f=>{reload=f},state:()=>({user,uname,verified,mode,forced})}}})();
window.SBACC=SBACC;
