/* Export / import all saved data (SchoolBux, avatar, owned items, pets, garden, pizza, settings, friends).
   Browser storage belongs to the website address, so a new address starts empty - use this to carry your progress over. */
(()=>{const $=id=>document.getElementById(id);if(!$('dxp'))return;
 const OK=/^(hub[a-z0-9]*|avatar|tbest)$/,note=t=>{const n=$('dmsg');if(n)n.textContent=t};
 const collect=incl=>{const d={};for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(OK.test(k)||(incl&&k==='sbadminkey'))d[k]=localStorage.getItem(k)}return d};
 const pack=incl=>JSON.stringify({app:'schoolblox',v:1,ts:Date.now(),data:collect(incl)});
 $('dxp').onclick=()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([pack($('dkey').checked)],{type:'application/json'}));a.download='schoolblox-data-'+new Date().toISOString().slice(0,10)+'.json';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),2000);note('✅ File saved. Keep it somewhere safe.')};
 $('dcp').onclick=async()=>{const code=btoa(unescape(encodeURIComponent(pack($('dkey').checked))));try{await navigator.clipboard.writeText(code);note('✅ Code copied ('+code.length+' characters). Paste it into the Import box on the new site.')}catch(e){$('dtx').value=code;$('dtx').select();note('Copy the code from the box.')}};
 const parse=t=>{t=String(t).trim();if(!t)throw 'Nothing to import yet';let o;try{o=JSON.parse(t)}catch(e){try{o=JSON.parse(decodeURIComponent(escape(atob(t))))}catch(e2){throw 'That is not a SchoolBlox data code or file'}}
  const d=(o&&o.app==='schoolblox'&&o.data)?o.data:o;if(!d||typeof d!=='object'||Array.isArray(d))throw 'That is not a SchoolBlox data code or file';
  const out={};for(const k in d)if((OK.test(k)||k==='sbadminkey')&&typeof d[k]==='string'&&d[k].length<2e6)out[k]=d[k];if(!Object.keys(out).length)throw 'No SchoolBlox data found in that';return out};
 const imp=t=>{try{const d=parse(t),ks=Object.keys(d);if(!confirm('Import '+ks.length+' saved items? This replaces your current SchoolBux, avatar, pets, garden and settings on this site.'))return;ks.forEach(k=>localStorage.setItem(k,d[k]));note('✅ Imported! Reloading...');setTimeout(()=>location.reload(),300)}catch(e){note('⚠️ '+e)}};
 $('dim').onclick=()=>imp($('dtx').value);
 $('dfl').onchange=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>imp(r.result);r.readAsText(f);e.target.value=''};
 window.SBDATA={pack,parse,imp,collect}})();
