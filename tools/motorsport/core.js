/* fRacing Legends - data & fungsi bersama */
let S;try{S=JSON.parse(localStorage.getItem('f1c-mm'))}catch(e){}
S=S||{ev:[],dr:[],tm:[],rc:[],code:'ADMIN2026'};['ev','dr','tm','rc'].forEach(k=>S[k]=S[k]||[]);
const save=()=>{try{localStorage.setItem('f1c-mm',JSON.stringify(S));localStorage.setItem('f1c-hub',JSON.stringify(hub()))}catch(e){}};
const $=s=>document.querySelector(s),say=t=>{const m=$('#msg');if(m)m.textContent=t};
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const CL=['ROOKIE CLASS','CLASS D','CLASS C','CLASS B','CLASS A','CLASS PRO'],TY=['Soft','Medium','Hard','Inter','Wet'];
const NM={q0:'Qualify 1',q1:'Qualify 2',q2:'Qualify 3',sp:'Sprint Race',fe:'Race'};
const PF=[25,18,15,12,10,8,6,4,2,1],PS=[8,7,6,5,4,3,2,1],SL=[['d1','Driver 1'],['d2','Driver 2'],['r1','Reserve 1'],['r2','Reserve 2']];
const uid=()=>Math.random().toString(36).slice(2,8);
const contrast=h=>{const n=parseInt((h||'#000').slice(1),16);return((n>>16)*.3+(n>>8&255)*.59+(n&255)*.11)>150?'#111':'#fff'};
const dn=d=>(S.dr.find(x=>x.did==d)||{}).name||'';
const nmLabel=d=>S.dr.filter(x=>x.name.toLowerCase()==d.name.toLowerCase()).length>1?d.name+' ('+d.did+')':d.name;
const sn=n=>{const p=(n||'').split(' ');return p.length>1?p[0]+' '+p[p.length-1][0]+'.':n};
const fl=c=>/^[a-z]{2}$/i.test(c||'')?String.fromCodePoint(...c.toUpperCase().split('').map(x=>127397+x.charCodeAt(0))):esc(c);
const isOpen=e=>e.reg!==false,isFull=e=>evT(e).length>=e.quota;
const evT=e=>S.tm.filter(t=>t.ev==e.id),evD=e=>[...new Set(evT(e).flatMap(t=>t.d.filter(Boolean)))];
const tmO=(e,d)=>evT(e).find(t=>t.d.includes(d))||{},tc=(e,d)=>tmO(e,d).col||'#8b93a7',noOf=(e,d)=>(tmO(e,d).num||{})[d]||'-';
const get=(r,s)=>s[0]=='q'?r.q[+s[1]]:r[s];
const lastQ=r=>{const q=r.q.filter(a=>a.length);return q.length?q[q.length-1]:[]};
const opt=(a,sel)=>a.map(([v,t])=>`<option value="${esc(v)}" ${v==sel?'selected':''}>${esc(t)}</option>`).join('');
const chips=a=>`<div class=ch>${a.map(([t,h,on])=>`<a href="${h}" class="${on?'on':''}">${t}</a>`).join('')}</div>`;
const tbl=(h,rows)=>`<div class=sc><table><tr>${h.map(x=>`<th>${x}</th>`).join('')}</tr>${rows.map(r=>`<tr>${r.map(x=>`<td>${x}</td>`).join('')}</tr>`).join('')}</table></div>`;
const lk=(n,l)=>l?`<a href="${esc(l)}" target=_blank rel=noopener style="text-decoration:underline">${esc(n)}</a>`:esc(n);
function mount(T,bk,tabs,body,A){A=A||'#e10600';const r=document.documentElement.style;r.setProperty('--a',A);r.setProperty('--ac',contrast(A));
$('#tb').innerHTML=(bk?`<a class=bk href="${bk}">&larr;</a>`:'')+(T?`<h1>${esc(T)}</h1>`:'<div class=br>fRacing <b>LEGENDS</b></div>');
$('#bar').innerHTML=tabs?tabs.map(([n,h,on])=>`<a href="${h}" class="${on?'on':''}">${n}</a>`).join(''):'';$('#bar').style.display=tabs?'flex':'none';$('#app').innerHTML=body}
function stats(e){const m={},g=d=>m[d]=m[d]||{p:0,w:0,po:0,pd:0,fl:0,dr:0};evD(e).forEach(g);
S.rc.filter(r=>r.ev==e.id).forEach(r=>{const q=lastQ(r);if(q[0])g(q[0].did).po++;
[['sp',PS],['fe',PF]].forEach(([k,P])=>{r[k].forEach((x,i)=>{const s=g(x.did);if(x.st)return;s.p+=P[i]||0;if(!i)s.w++;if(i<3)s.pd++});if(r.fl[k])g(r.fl[k]).fl++;if(r.dr[k])g(r.dr[k]).dr++})});return m}
function allStats(){const d={},t={};S.ev.forEach(e=>{const m=stats(e);Object.keys(m).forEach(k=>{const a=d[k]=d[k]||{p:0,w:0,po:0,pd:0,fl:0,dr:0,ev:0,tm:'-',col:'#8b93a7'},x=m[k];['p','w','po','pd','fl','dr'].forEach(f=>a[f]+=x[f]);a.ev++;const o=tmO(e,k);if(o.name){a.tm=o.name;a.col=o.col||a.col;const q=t[o.name.toLowerCase()]=t[o.name.toLowerCase()]||{name:o.name,col:'#8b93a7',p:0};q.p+=x.p;q.col=o.col||q.col}})});return{d,t}}
function hub(){const A=allStats();return{t:Date.now(),teams:Object.values(A.t).map(x=>({name:x.name,col:x.col,pts:x.p})).sort((a,b)=>b.pts-a.pts),drivers:Object.keys(A.d).map(k=>({did:k,name:dn(k),team:A.d[k].tm,col:A.d[k].col,pts:A.d[k].p})).sort((a,b)=>b.pts-a.pts)}}
function addLic(n,d){n=n.trim().replace(/\s+/g,' ');d=d.trim();const w=n.split(' ').length;
if(!n||w<2||w>3)return'Nama harus 2 sampai 3 kata.';if(!/^\d{4}$/.test(d))return'DID harus tepat 4 angka.';if(S.dr.some(x=>x.did==d))return'DID sudah dipakai.';S.dr.push({did:d,name:n});save();return''}
/* formulir tim + pemilih driver (dipakai halaman pendaftaran & admin) */
let TF=null;
function teamForm(e,t){TF={e,t:t||null,prev:{}};const x=t||{},V=k=>esc(x[k]||'');
return`<div class=f><label>Nama tim</label><input id=tn value="${V('name')}">${e.soc?`<label>Akun sosial tim</label><input id=ts value="${V('soc')}">`:''}<label>Nama Team Principal</label><input id=tp value="${V('tp')}"><label>Link sosmed Team Principal</label><input id=tpl placeholder="https://" value="${V('tpl')}"><label>Nama Team Owner</label><input id=ow value="${V('ow')}"><label>Link sosmed Team Owner</label><input id=owl placeholder="https://" value="${V('owl')}"><label>Warna tim</label><input id=tcl type=color value="${x.col||'#e10600'}">${SL.map(([id,l])=>`<label>${l}${id[0]=='r'?' (opsional)':''}</label><div class=pk><input id=q_${id} placeholder="Cari nama atau DID" oninput=pfAll()><select id=${id} onchange=pfAll()></select><input id=n_${id} inputmode=numeric maxlength=2 placeholder="Nomor balap (opsional)" hidden></div>`).join('')}</div>`}
function pfAll(init){const e=TF.e,cur={};SL.forEach(([id],i)=>{const s=$('#'+id);cur[id]=init?((TF.t&&TF.t.d[i])||''):(s?s.value:'')});
const taken=new Set(S.tm.filter(t=>t.ev==e.id&&(!TF.t||t.id!=TF.t.id)).flatMap(t=>t.d));
SL.forEach(([id])=>{const q=($('#q_'+id).value||'').trim().toLowerCase(),used=new Set(SL.filter(([k])=>k!=id).map(([k])=>cur[k]).filter(Boolean));
const L=S.dr.filter(d=>d.did==cur[id]||(!taken.has(d.did)&&!used.has(d.did)&&(!q||d.name.toLowerCase().includes(q)||d.did.includes(q))));
if(!cur[id]&&/^\d{4}$/.test(q)&&L.length==1)cur[id]=L[0].did;
$('#'+id).innerHTML=opt([['','Pilih driver']].concat(L.map(d=>[d.did,nmLabel(d)])),cur[id]);
const n=$('#n_'+id);n.hidden=!cur[id];if(TF.prev[id]!==cur[id]){n.value=(init&&cur[id]&&TF.t&&TF.t.num&&TF.t.num[cur[id]])||'';TF.prev[id]=cur[id]}})}
function saveTeam(admin){const e=TF.e,old=TF.t,v=i=>($('#'+i)||{value:''}).value.trim(),d=SL.map(([id])=>$('#'+id).value),num={};
const er=m=>{say(m);return false};
if(!v('tn')||!v('tp')||!v('ow'))return er('Isi nama tim, team principal, dan team owner.');
if(!d[0]||!d[1])return er('Driver 1 dan Driver 2 wajib dipilih.');
for(const l of['tpl','owl'])if(v(l)&&!/^https?:\/\//.test(v(l)))return er('Link harus diawali https://');
const f=d.filter(Boolean);if(new Set(f).size<f.length)return er('Satu driver tidak boleh dipilih dua kali.');
const others=S.tm.filter(t=>t.ev==e.id&&(!old||t.id!=old.id));
if(f.some(x=>others.some(t=>t.d.includes(x))))return er('Ada driver yang sudah masuk tim lain.');
if(others.some(t=>t.name.toLowerCase()==v('tn').toLowerCase()))return er('Nama tim sudah dipakai.');
const used=new Set(others.flatMap(t=>Object.values(t.num||{})));
for(const [id] of SL){const dd=$('#'+id).value,val=$('#n_'+id).value.trim();if(dd&&val){if(!/^\d{1,2}$/.test(val)||+val<1)return er('Nomor balap harus 1 sampai 99.');if(used.has(String(+val)))return er('Nomor balap '+(+val)+' sudah dipakai tim lain.');used.add(String(+val));num[dd]=String(+val)}}
if(!admin){if(!isOpen(e))return er('Pendaftaran ditutup.');if(!old&&isFull(e))return er('Kuota tim sudah penuh.')}
const o={id:old?old.id:uid(),ev:e.id,name:v('tn'),soc:v('ts'),tp:v('tp'),tpl:v('tpl'),ow:v('ow'),owl:v('owl'),col:v('tcl'),d,num};
if(old)Object.assign(old,o);else S.tm.push(o);save();return true}
