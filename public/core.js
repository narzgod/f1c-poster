/* fRacing Legends - shared data & helpers */
let S;try{S=JSON.parse(localStorage.getItem('f1c-mm'))}catch(e){}
S=S||{ev:[],dr:[],tm:[],rc:[]};['ev','dr','tm','rc'].forEach(k=>S[k]=S[k]||[]);
const ADMIN=location.pathname.indexOf('/owner')==0;let SYNC='local',BASE=0,pushT;
const loc=()=>{try{localStorage.setItem('f1c-mm',JSON.stringify(S));localStorage.setItem('f1c-hub',JSON.stringify(hub()))}catch(e){}};
const save=()=>{loc();if(ADMIN&&SYNC=='cloud'){clearTimeout(pushT);pushT=setTimeout(doPush,300)}};
async function doPush(){try{const r=await fetch('/api/state',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({s:S,base:BASE})});
if(r.status==401)return say('Session expired. Open the owner menu again and enter the code.');if(!r.ok)return say('Could not save to the shared database. Try again.');
const j=await r.json();BASE=j.ts;if(j.merged){S=j.s;loc();if(typeof render=='function')render()}}catch(e){say('No connection. Changes are saved only in this browser for now.')}}
async function load(){try{const r=await fetch('/api/state',{cache:'no-store',credentials:'same-origin'});if(!r.ok)return;const j=await r.json();SYNC='cloud';BASE=j.ts;
if(j.s){S=j.s;['ev','dr','tm','rc'].forEach(k=>S[k]=S[k]||[]);loc()}else if(ADMIN&&(S.ev.length||S.dr.length||S.tm.length||S.rc.length))await doPush()}catch(e){}}
const READY=load();
const $=s=>document.querySelector(s),say=t=>{const m=$('#msg');if(m)m.textContent=t};
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const CL=['ROOKIE CLASS','CLASS D','CLASS C','CLASS B','CLASS A','CLASS PRO'],TY=['Soft','Medium','Hard','Inter','Wet'];
const NM={q0:'Qualifying 1',q1:'Qualifying 2',q2:'Qualifying 3',sp:'Sprint Race',fe:'Race'};
const PF=[25,18,15,12,10,8,6,4,2,1],PS=[8,7,6,5,4,3,2,1],SL=[['d1','Driver 1'],['d2','Driver 2'],['r1','Reserve 1'],['r2','Reserve 2']];
const SC=[['r','Races','RACES'],['po','Pole','POLE'],['w','Wins','WINS'],['pd','Podium','PODIUM'],['dr','Driver of the Race','DOTR'],['gp','Gained Position','GAINED'],['sp','Sprint','SPRINT'],['sw','Sprint Wins','S.WINS'],['dnf','DNF','DNF'],['dsq','DSQ','DSQ'],['dns','DNS','DNS'],['fl','Fastest Lap','FL'],['p','Points','PTS'],['t','Title','TITLE']];
const uid=()=>Math.random().toString(36).slice(2,8);
const contrast=h=>{const n=parseInt((h||'#000').slice(1),16);return((n>>16)*.3+(n>>8&255)*.59+(n&255)*.11)>150?'#111':'#fff'};
const dn=d=>(S.dr.find(x=>x.did==d)||{}).name||'';
const nmLabel=d=>S.dr.filter(x=>x.name.toLowerCase()==d.name.toLowerCase()).length>1?d.name+' ('+d.did+')':d.name;
const sn=n=>{const p=(n||'').split(' ');return p.length>1?p[0]+' '+p[p.length-1][0]+'.':n};
const fcode=c=>{c=String(c||'').trim();const m=[...c].map(ch=>ch.codePointAt(0)).filter(x=>x>=127462&&x<=127487);return m.length==2?m.map(x=>String.fromCharCode(x-127397)).join('').toLowerCase():c.toLowerCase()};
/* flat flag image, scaled to the country's own width:height ratio and fitted inside a mw x mh box */
const flagImg=(c,mw,mh)=>{mw=mw||64;mh=mh||44;const k=fcode(c),f=typeof FLAGS!=='undefined'&&FLAGS[k];if(!f)return`<span class=fb0>${esc(c||'')}</span>`;let h=mh,w=h*f[0];if(w>mw){w=mw;h=w/f[0]}return`<img class=flag src="/flags/${k}.svg" width="${Math.round(w)}" height="${Math.round(h)}" alt="${esc(f[1])}">`};
const fl=c=>flagImg(c,32,22);
const evT=e=>S.tm.filter(t=>t.ev==e.id),evD=e=>[...new Set(evT(e).flatMap(t=>t.d.filter(Boolean)))];
const isOpen=e=>e.reg!==false,isFull=e=>evT(e).length>=e.quota;
const regTxt=e=>!isOpen(e)?'Registration Closed':isFull(e)?'Registration Full':'Registration Open';
const tmO=(e,d)=>evT(e).find(t=>t.d.includes(d))||{},tc=(e,d)=>tmO(e,d).col||'#8b93a7',noOf=(e,d)=>(tmO(e,d).num||{})[d]||'-';
const get=(r,s)=>s[0]=='q'?r.q[+s[1]]:r[s];
const lastQ=r=>{const q=r.q.filter(a=>a.length);return q.length?q[q.length-1]:[]};
const opt=(a,sel)=>a.map(([v,t])=>`<option value="${esc(v)}" ${v==sel?'selected':''}>${esc(t)}</option>`).join('');
const chips=a=>`<div class=ch>${a.map(([t,h,on])=>`<a href="${h}" class="${on?'on':''}">${t}</a>`).join('')}</div>`;
const tbl=(h,rows)=>`<div class=sc><table><tr>${h.map(x=>`<th>${x}</th>`).join('')}</tr>${rows.map(r=>`<tr>${r.map(x=>`<td>${x}</td>`).join('')}</tr>`).join('')}</table></div>`;
const hx=v=>{v=(v||'').trim().replace(/^#/,'');if(/^[0-9a-f]{3}$/i.test(v))v=v.split('').map(c=>c+c).join('');return /^[0-9a-f]{6}$/i.test(v)?'#'+v.toLowerCase():''};
const colorField=(id,label,val)=>`<label>${label}</label><div class=cp><input id=${id} type=color value="${val}" oninput="$('#${id}_h').value=this.value"><input id=${id}_h value="${val}" placeholder="#E10600" maxlength=7 oninput="const c=hx(this.value);if(c)$('#${id}').value=c"></div>`;
const colorVal=id=>hx(($('#'+id+'_h')||{value:''}).value);
const normWA=v=>{let s=(v||'').trim();const pl=s.startsWith('+');s=s.replace(/\D/g,'');if(!s)return'';if(pl)s='+'+s;else if(s.startsWith('00'))s='+'+s.slice(2);else if(s.startsWith('0'))s='+62'+s.slice(1);else if(s.startsWith('62'))s='+'+s;else s='+62'+s;const n=s.replace(/\D/g,'').length;return n>=8&&n<=15?s:''};
const waLink=n=>n?`<a href="https://wa.me/${n.replace(/\D/g,'')}" target=_blank rel=noopener style="text-decoration:underline">${esc(n)}</a>`:'-';
function mount(T,bk,tabs,body,A){A=A||'#e10600';const r=document.documentElement.style;r.setProperty('--a',A);r.setProperty('--ac',contrast(A));
$('#tb').innerHTML=(bk?`<a class=bk href="${bk}">&larr;</a>`:'')+(T?`<h1>${esc(T)}</h1>`:'<div class=br>fRacing <b>LEGENDS</b></div>');
$('#bar').innerHTML=tabs?tabs.map(([n,h,on])=>`<a href="${h}" class="${on?'on':''}">${n}</a>`).join(''):'';$('#bar').style.display=tabs?'flex':'none';$('#app').innerHTML=body}
/* in-page tab links replace history so Back never "undoes" a tab tap */
document.addEventListener('click',e=>{const a=e.target.closest&&e.target.closest('a[href^="#"]');if(a){e.preventDefault();location.replace(a.getAttribute('href'))}});
const Z=()=>({r:0,po:0,w:0,pd:0,dr:0,gp:0,sp:0,sw:0,dnf:0,dsq:0,dns:0,fl:0,p:0,t:0});
const addAll=(a,b,noT)=>{Object.keys(a).forEach(k=>{if(!(noT&&k=='t'))a[k]+=b[k]||0})};
function stats(e){const m={},g=d=>m[d]=m[d]||Z();evD(e).forEach(g);
S.rc.filter(r=>r.ev==e.id).forEach(r=>{const q=lastQ(r),seen=new Set();if(q[0])g(q[0].did).po++;
[['sp',PS],['fe',PF]].forEach(([k,P])=>{r[k].forEach((x,i)=>{const s=g(x.did);seen.add(x.did);if(k=='sp')s.sp++;
if(x.st){const f=x.st.toLowerCase();if(f in s)s[f]++}else{s.p+=P[i]||0;if(k=='fe'){if(!i)s.w++;if(i<3)s.pd++}else if(!i)s.sw++;const gi=q.findIndex(y=>y.did==x.did)+1;if(gi)s.gp+=gi-(i+1)}});
if(r.fl[k])g(r.fl[k]).fl++;if(r.dr[k])g(r.dr[k]).dr++});seen.forEach(d=>g(d).r++)});
if(e.done){const t=Object.keys(m).sort((a,b)=>m[b].p-m[a].p||m[b].w-m[a].w)[0];if(t&&m[t].p>0)m[t].t=1}return m}
function dItems(e){const m=stats(e);return Object.keys(m).map(d=>({k:d,n:dn(d),t:tmO(e,d).name||'-',c:tc(e,d),c2:tmO(e,d).col2||'',v:m[d]}))}
function tItems(e){const m=stats(e),o={};evT(e).forEach(t=>o[t.id]={n:t.name,t:'',c:t.col||'#8b93a7',c2:t.col2||'',v:Z()});
Object.keys(m).forEach(d=>{const t=tmO(e,d);if(t.id)addAll(o[t.id].v,m[d],1)});
if(e.done){const top=Object.values(o).sort((a,b)=>b.v.p-a.v.p||b.v.w-a.v.w)[0];if(top&&top.v.p>0)top.v.t=1}return Object.values(o)}
function board(){const d={},t={};S.ev.forEach(e=>{dItems(e).forEach(x=>{const a=d[x.k]=d[x.k]||{n:x.n,t:'-',c:x.c,c2:x.c2,v:Z(),ev:0};addAll(a.v,x.v);a.ev++;if(x.t!='-'){a.t=x.t;a.c=x.c;a.c2=x.c2}});
tItems(e).forEach(x=>{const k=x.n.toLowerCase(),a=t[k]=t[k]||{n:x.n,t:'',c:x.c,c2:x.c2,v:Z()};addAll(a.v,x.v);a.c=x.c;a.c2=x.c2})});return{d:Object.values(d),t:Object.values(t)}}
function hub(){const B=board(),by=(a,b)=>b.v.p-a.v.p;return{t:Date.now(),teams:B.t.sort(by).map(x=>({name:x.n,col:x.c,col2:x.c2,pts:x.v.p})),drivers:B.d.sort(by).map(x=>({name:x.n,team:x.t,col:x.c,col2:x.c2,pts:x.v.p}))}}
function chkLic(n,d,w){n=n.trim().replace(/\s+/g,' ');d=d.trim();const k=n.split(' ').length,wa=normWA(w);
if(!n||k<2||k>3)return{err:'Name must be 2 to 3 words.'};if(!/^\d{4}$/.test(d))return{err:'DID must be exactly 4 digits.'};if(S.dr.some(x=>x.did==d))return{err:'This DID is already taken.'};
if(!wa)return{err:'Enter a valid WhatsApp number (e.g. 0812-3456-7890 or +62 812 3456 7890).'};return{item:{did:d,name:n,wa}}}
function addLic(n,d,w){const c=chkLic(n,d,w);if(c.err)return c.err;S.dr.push(c.item);save();return''}
async function sendReg(kind,item){try{const r=await fetch('/api/register',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({kind,item})});const j=await r.json().catch(()=>({}));if(r.ok)return'';return j.err||'Could not send. Try again.'}catch(e){return'No connection. Try again.'}}
async function addLicP(n,d,w){await READY;const c=chkLic(n,d,w);if(c.err)return c.err;
if(SYNC!='cloud'){S.dr.push(c.item);save();return''}const e=await sendReg('driver',c.item);await load();return e}
let TF=null;
function teamForm(e,t){TF={e,t:t||null,prev:{}};const x=t||{},V=k=>esc(x[k]||'');
return`<div class=f><label>Team name</label><input id=tn value="${V('name')}">${e.soc?`<label>Team social account</label><input id=ts value="${V('soc')}">`:''}<label>Team Principal name</label><input id=tp value="${V('tp')}"><label>Team Principal WhatsApp</label><input id=tpw inputmode=tel placeholder="0812-3456-7890" value="${V('tpw')}"><label>Team Owner name</label><input id=ow value="${V('ow')}"><label>Team Owner WhatsApp</label><input id=oww inputmode=tel placeholder="0812-3456-7890" value="${V('oww')}">${colorField('tcl','Main Color',x.col||'#e10600')}${colorField('tcl2','Second Color',x.col2||'#ffffff')}${SL.map(([id,l])=>`<label>${l}${id[0]=='r'?' (optional)':''}</label><div class=pk><input id=q_${id} placeholder="Search name or DID" oninput=pfAll()><select id=${id} onchange=pfAll()></select><input id=n_${id} inputmode=numeric maxlength=2 placeholder="Race number (1-99) - required" hidden></div>`).join('')}</div>`}
function pfAll(init){const e=TF.e,cur={};SL.forEach(([id],i)=>{const s=$('#'+id);cur[id]=init?((TF.t&&TF.t.d[i])||''):(s?s.value:'')});
const taken=new Set(S.tm.filter(t=>t.ev==e.id&&(!TF.t||t.id!=TF.t.id)).flatMap(t=>t.d));
SL.forEach(([id])=>{const q=($('#q_'+id).value||'').trim().toLowerCase(),used=new Set(SL.filter(([k])=>k!=id).map(([k])=>cur[k]).filter(Boolean));
const L=S.dr.filter(d=>d.did==cur[id]||(!taken.has(d.did)&&!used.has(d.did)&&(!q||d.name.toLowerCase().includes(q)||d.did.includes(q))));
if(!cur[id]&&/^\d{4}$/.test(q)&&L.length==1)cur[id]=L[0].did;
$('#'+id).innerHTML=opt([['','Select driver']].concat(L.map(d=>[d.did,nmLabel(d)])),cur[id]);
const n=$('#n_'+id);n.hidden=!cur[id];if(TF.prev[id]!==cur[id]){n.value=(init&&cur[id]&&TF.t&&TF.t.num&&TF.t.num[cur[id]])||'';TF.prev[id]=cur[id]}})}
function saveTeam(admin){const e=TF.e,old=TF.t,v=i=>($('#'+i)||{value:''}).value.trim(),d=SL.map(([id])=>$('#'+id).value),num={},er=m=>{say(m);return false};
if(!v('tn')||!v('tp')||!v('ow'))return er('Fill in team name, Team Principal and Team Owner.');
const w1=normWA(v('tpw')),w2=normWA(v('oww'));if(!w1||!w2)return er('Enter valid WhatsApp numbers for Team Principal and Team Owner.');
const c1=colorVal('tcl'),c2=colorVal('tcl2');if(!c1||!c2)return er('Enter valid hex colors, e.g. #E10600.');
if(!d[0]||!d[1])return er('Driver 1 and Driver 2 are required.');
const f=d.filter(Boolean);if(new Set(f).size<f.length)return er('A driver cannot be selected twice.');
const others=S.tm.filter(t=>t.ev==e.id&&(!old||t.id!=old.id));
if(f.some(x=>others.some(t=>t.d.includes(x))))return er('Some drivers are already in another team.');
if(others.some(t=>t.name.toLowerCase()==v('tn').toLowerCase()))return er('Team name is already taken.');
const used=new Set(others.flatMap(t=>Object.values(t.num||{})));
for(const [id,l] of SL){const dd=$('#'+id).value,val=$('#n_'+id).value.trim();if(!dd)continue;
if(!/^\d{1,2}$/.test(val)||+val<1)return er('Race number (1-99) is required for '+l+'.');if(used.has(String(+val)))return er('Race number '+(+val)+' is already taken.');used.add(String(+val));num[dd]=String(+val)}
if(!admin){if(!isOpen(e))return er('Registration is closed.');if(!old&&isFull(e))return er('Team slots are full.')}
const o={id:old?old.id:uid(),ev:e.id,name:v('tn'),soc:v('ts'),tp:v('tp'),tpw:w1,ow:v('ow'),oww:w2,col:c1,col2:c2,d,num};
if(!admin&&!old&&SYNC=='cloud')return sendReg('team',o).then(async m=>{await load();if(m){say(m);return false}return true});
if(old)Object.assign(old,o);else S.tm.push(o);save();return true}

/* tyre stock: 1 tyre per calendar race, set separately for Qualifying (q) and Race (r) */
const TC=['Soft','Medium','Hard'];
const calN=e=>+e.cal||10;
const defAl=n=>{const h=Math.floor(n/3);return{Soft:n-2*h,Medium:h,Hard:h}};
const alloc=e=>({q:e.tq||defAl(calN(e)),r:e.tr||defAl(calN(e))});
const extra=(e,d,k,c)=>((((e.ty||{})[d]||{})[k]||{})[c])||0;
const tyTot=(e,d,k,c)=>(alloc(e)[k][c]||0)+extra(e,d,k,c);
const qMode=(e,r)=>r.qm||e.qm||'one';
function tyUsed(e,d){const u={q:{Soft:0,Medium:0,Hard:0},r:{Soft:0,Medium:0,Hard:0}};
S.rc.filter(r=>r.ev==e.id).forEach(r=>{const f=r.fe.find(x=>x.did==d);if(f&&f.st!='DNS'&&f.tyre in u.r)u.r[f.tyre]++;
const ts=r.q.map(s=>s.find(x=>x.did==d)).filter(Boolean).map(x=>x.tyre).filter(t=>t in u.q);
if(qMode(e,r)=='each')ts.forEach(t=>u.q[t]++);else if(ts.length)u.q[ts[ts.length-1]]++});return u}
function tyCheck(e,dids,k){for(const d of dids){const u=tyUsed(e,d);for(const c of TC)if(u[k][c]>tyTot(e,d,k,c))return dn(d)+' has no '+c+' tyres left for '+(k=='q'?'Qualifying':'Race')+'. Add supply in the Tyres tab.'}return''}
