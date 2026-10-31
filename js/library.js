// UI Field Guide · shared helpers, your own elements, mode switching, the library, and Help me choose.
const EM=Object.fromEntries(E.map(e=>[e.id,e]));
const catName=id=>CATS.find(c=>c.id===id)?.name||id;
const render=(id,t)=>{const e=EM[id];return e?e.h(esc(t??e.t)):''};
Object.assign(IP,{cols:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M9 4v16M15 4v16"/>',flow:'<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/><path d="M10 6.5h3.5a2 2 0 012 2V14"/>',wand:'<path d="M4 20L15 9"/><path d="M15 3v3M18.5 4.5l-2 2M21 9h-3M12 6l1 1M18 12l-1-1"/>',save:'<path d="M5 3h11l3 3v15H5z"/><path d="M8 3v5h7V3M8 21v-7h8v7"/>',download:'<path d="M12 4v12M7 11l5 5 5-5M4 20h16"/>'});
const short=(t,n=28)=>{t=String(t??'').trim();return t.length>n?t.slice(0,n-1)+'…':t};
const firstSentence=s=>String(s||'').split(/(?<=\.)\s/)[0];

/* ---------- storage helpers ---------- */
// set returns false when the browser refuses to store (usually because storage is full)
const LS={get(k,d){try{const v=localStorage.getItem(k);return v?JSON.parse(v):d}catch{return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v));return true}catch(e){if(/quota/i.test(e?.name+e?.message))storageTrouble();return false}}};
/* storage health: browsers give each site about 5 MB here. Warn before it fills, say so when a save fails,
   and remind people to back up, since saved mockups live only in this browser. */
var appReady=false,storeFull=false;
const STORE_LIMIT=5e6,DAY=864e5;
const storeUsed=()=>{let n=0;try{for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);n+=k.length+(localStorage.getItem(k)||'').length}}catch{}return n};
const mb=n=>(n/1e6).toFixed(n<1e6?2:1)+' MB';
function storageTrouble(){storeFull=true;if(appReady)drawStoreBar()}
function drawStoreBar(){const b=$('#storeBar');if(!b||!appReady)return;const used=storeUsed(),pct=used/STORE_LIMIT,last=LS.get('uifg.lastBackup',0),now=Date.now(),meter=`<span class="meter" title="${mb(used)} of about ${mb(STORE_LIMIT)}"><i style="width:${Math.min(100,Math.round(pct*100))}%"></i></span>`,acts='<button class="b sm pri" data-sb="backup">Download backup</button><button class="b sm" data-sb="open">Manage mockups</button>';let html='',cls='';
 if(storeFull||pct>=.9){cls='urgent';html=`${meter}<span class="msg"><b>${storeFull?'Your latest changes aren’t being saved':'This browser’s storage is almost full'}.</b> ${mb(used)} of about ${mb(STORE_LIMIT)} is used. Download a backup, then delete mockups you no longer need.</span>${acts}`}
 else if(pct>=.75&&now-LS.get('uifg.storeSnooze',0)>DAY){html=`${meter}<span class="msg">Storage is getting full: ${mb(used)} of about ${mb(STORE_LIMIT)} used.</span>${acts}<button class="b sm" data-sb="later">Hide</button>`}
 else if(!db&&localSaved().length&&(!last||now-last>14*DAY)&&now-LS.get('uifg.backupSnooze',0)>7*DAY){cls='soft';html=`<span class="msg">Your saved mockups live only in this browser, and ${last?`your last backup was ${Math.round((now-last)/DAY)} days ago`:'you haven’t backed them up yet'}. A backup file keeps them safe if browser data is cleared.</span><button class="b sm pri" data-sb="backup">Download backup</button><button class="b sm" data-sb="snooze">Later</button>`}
 b.className='storebar '+cls;b.innerHTML=html;b.hidden=!html}
document.getElementById('storeBar').addEventListener('click',ev=>{const a=ev.target.closest('[data-sb]')?.dataset.sb;if(a==='backup')downloadBackup();if(a==='open'){setMode('builder');$('#openBtn').click()}if(a==='later')LS.set('uifg.storeSnooze',Date.now());if(a==='snooze')LS.set('uifg.backupSnooze',Date.now());drawStoreBar()});
const $=s=>document.querySelector(s);
function toast(msg){document.querySelectorAll('.toast').forEach(t=>t.remove());const t=document.createElement('div');t.className='toast';t.textContent=msg;document.body.appendChild(t);setTimeout(()=>t.remove(),2600)}

/* ---------- your elements: entries you add, merged into the catalogue and kept like groups ---------- */
// Stored as plain data ({id, n, c, aka, d, u, t, s, shape, html, x}); asEntry() turns one into a catalogue entry,
// so the library, palette, builder, Replace with…, Help me choose and Copy for Claude treat it like a built-in element.
CATS.push({id:'mine',name:'Your elements',b:'Elements you have added. Open one to edit or delete it, and export them as a library file to back them up or move them to another browser.'});
let custom=LS.get('uifg.custom',[]),booted=false;
const CODE_RE=/^[a-z][a-z0-9]*\.[a-z0-9][a-z0-9-]*$/;
const plain=s=>String(s??'').replace(/[<>]/g,'').replace(/"/g,'”').trim();
const SHAPES=[['box','Labelled box'],['button','Button'],['field','Text field'],['card','Card'],['list','List of items'],['chips','Chips'],['tabs','Tabs'],['slider','Slider'],['toggle','Switch'],['chart','Chart'],['image','Image'],['heading','Heading'],['text','Text']];
const MULTI_SHAPES=['list','chips','tabs'];
function wireframe(shape,t){const items=sp(t);switch(shape){
 case 'button':return `<div class="u c"><b class="btn">${t}</b></div>`;
 case 'field':return `<div class="u c" style="padding:4px"><div class="field" style="flex:1"><span class="ph">${t}</span></div></div>`;
 case 'card':return `<div class="u colf as box" style="padding:12px;gap:8px;justify-content:flex-start"><b class="lbl">${t}</b>${L('90%')}${L('75%')}${L('82%')}</div>`;
 case 'list':return `<div class="u colf as" style="padding:6px 8px;gap:8px;justify-content:flex-start">${(items.length?items:[t]).slice(0,8).map(x=>`<div class="row" style="gap:8px;width:100%"><i class="dot"></i><span>${x}</span></div>`).join('')}</div>`;
 case 'chips':return `<div class="u" style="flex-wrap:wrap;gap:6px;padding:4px;align-content:center">${(items.length?items:[t]).map(x=>`<span class="chip">${x}</span>`).join('')}</div>`;
 case 'tabs':return `<div class="u bar" style="gap:18px">${(items.length?items:[t]).map((x,i)=>`<span class="navl" style="${i?'':'color:var(--ink);font-weight:600;border-bottom:2px solid var(--w-accent);padding:6px 0'}">${x}</span>`).join('')}</div>`;
 case 'slider':return `<div class="u" style="gap:10px;padding:0 6px"><span class="lbl">${t}</span><div class="track"><i class="thumb" style="left:55%"></i></div></div>`;
 case 'toggle':return `<div class="u" style="gap:10px;padding:0 6px"><span class="sw" style="background:var(--w-accent)"></span><span>${t}</span></div>`;
 case 'chart':return `<div class="u colf as box" style="padding:10px;gap:6px"><b class="lbl">${t}</b><svg viewBox="0 0 100 50" preserveAspectRatio="none" style="flex:1;width:100%;min-height:0">${[18,32,24,44,36,28].map((h,i)=>`<rect x="${i*17+2}" y="${50-h}" width="12" height="${h}" rx="2" fill="var(--w-accent)" opacity="${(.45+i*.09).toFixed(2)}"/>`).join('')}</svg></div>`;
 case 'image':return `<div class="u colf" style="gap:6px">${IMG('flex:1;width:100%;border-radius:var(--w-r,6px)')}<span class="lbl">${t}</span></div>`;
 case 'heading':return `<div class="u"><b class="h2">${t}</b></div>`;
 case 'text':return `<div class="u as" style="padding:2px">${t}</div>`;
 default:return `<div class="u c box" style="text-align:center;padding:8px;border-style:dashed"><span class="lbl">${t}</span></div>`}}
// Previews render inside this page, so snippets lose scripts, event handlers, style tags and javascript: links.
function cleanHTML(html){const d=new DOMParser().parseFromString(`<div>${html}</div>`,'text/html');d.querySelectorAll('script,style,iframe,object,embed,link,meta,base,form,noscript').forEach(n=>n.remove());
 d.querySelectorAll('*').forEach(n=>[...n.attributes].forEach(a=>{if(/^on/i.test(a.name)||/^\s*javascript:/i.test(a.value)||((a.name==='src'||a.name==='href')&&!/^(data:image\/|https?:|#)/i.test(a.value.trim())))n.removeAttribute(a.name)}));return d.body.firstChild.innerHTML}
function asEntry(d){const html=d.html?cleanHTML(d.html):'';const shape=SHAPES.some(x=>x[0]===d.shape)?d.shape:'box';
 return {id:d.id,c:CATS.some(c=>c.id===d.c)?d.c:'mine',n:plain(d.n)||d.id,aka:(d.aka||[]).map(plain).filter(Boolean),s:[Math.max(16,Math.round(+d.s?.[0]||200)),Math.max(16,Math.round(+d.s?.[1]||80))],t:String(d.t??''),d:plain(d.d),u:plain(d.u),x:(d.x||[]).filter(x=>x!==d.id&&CODE_RE.test(x)),custom:true,stub:!!d.stub,shape,hasHTML:!!html,...(MULTI_SHAPES.includes(shape)&&!html?{multi:1}:{}),
  h:t=>html?`<div class="u">${html.split('{label}').join(t)}</div>`:wireframe(shape,t)}}
function regCustom(d){if(!d||!CODE_RE.test(d.id||''))return false;const i=E.findIndex(x=>x.id===d.id);if(i>=0&&!E[i].custom)return false;const e=asEntry(d);i>=0?E[i]=e:E.push(e);EM[d.id]=e;return true}
custom=custom.filter(regCustom);
function customsChanged(){if(!booted)return;buildRail();drawLib();drawPal.k=null;if(!$('#vBld').hidden)drawPal();$('#countLbl').textContent=`${E.length} elements · ${CATS.length} groups`;if(!$('#vBld').hidden)drawAll()}
async function putCustom(d,quiet){d={...d,updatedAt:d.updatedAt||Date.now()};if(!regCustom(d))return false;const i=custom.findIndex(x=>x.id===d.id);i<0?custom.push(d):custom[i]=d;LS.set('uifg.custom',custom);customsChanged();
 if(db){const {id,...doc}=d;try{await db.doc('elements/'+id).set(doc)}catch{if(!quiet)toast('Could not save to the shared store. Saved in this browser instead.')}}return true}
// Elements defined in a file: add the ones that are new, newer, or fill in a placeholder
function importDefs(list){let n=0;(Array.isArray(list)?list:[]).forEach(d=>{if(!d||!CODE_RE.test(d.id||''))return;const have=custom.find(x=>x.id===d.id);if(EM[d.id]&&!EM[d.id].custom)return;if(have&&!have.stub&&(have.updatedAt||0)>=(d.updatedAt||0))return;putCustom({...d},true);n++});return n}
// A code that is not in the library (from a file, a captured page, or a deleted element) becomes a placeholder entry instead of disappearing
const humanCode=id=>{const w=id.split('.').pop().replace(/[-_]+/g,' ');return w.charAt(0).toUpperCase()+w.slice(1)};
let stubbed=[];
function ensureType(e){if(!e)return false;if(EM[e.type])return true;if(typeof e.type!=='string'||!CODE_RE.test(e.type))return false;
 putCustom({id:e.type,n:humanCode(e.type),c:'mine',s:[e.w||200,e.h||80],t:e.t||'',d:'Came in with a mockup or a captured page. Describe what it is so it reads well in Copy for Claude.',shape:'box',stub:true},true);stubbed.push(e.type);
 clearTimeout(ensureType.t);ensureType.t=setTimeout(()=>{const ids=[...new Set(stubbed)];stubbed=[];if(booted&&ids.length)toast(`Added ${ids.length} new element${ids.length>1?'s':''} to Your elements: ${ids.map(id=>EM[id]?.n||id).slice(0,4).join(', ')}${ids.length>4?'…':''}. Describe ${ids.length>1?'them':'it'} in the library.`)},500);return true}
async function dropCustom(id){const e=EM[id];if(!e?.custom)return;custom=custom.filter(x=>x.id!==id);LS.set('uifg.custom',custom);const i=E.findIndex(x=>x.id===id);if(i>=0)E.splice(i,1);delete EM[id];
 // copies already placed (and imported originals) keep their spot as a labelled placeholder box
 let n=0;const swap=x=>{if(x.type===id){x.type='note.box';x.note=[x.note,`Was “${e.n}” (${id}), which you deleted from your elements.`].filter(Boolean).join(' ');return 1}return 0};
 P.screens.forEach(s=>{s.els.forEach(x=>n+=swap(x));s.base?.els?.forEach(swap)});if(n)saveDraft();
 pick=pick.filter(x=>x!==id);LS.set('uifg.pick',pick);if(db){try{await db.doc('elements/'+id).delete()}catch{}}customsChanged();drawTray();toast(`Deleted “${e.n}”${n?`. ${n} placed cop${n>1?'ies are':'y is'} now placeholder boxes`:''}`)}
const usedCustoms=screens=>custom.filter(c=>screens.some(s=>s.els.some(e=>e.type===c.id)||s.base?.els?.some(e=>e.type===c.id)));
function exportLibrary(){if(!custom.length)return toast('You have not added any elements yet');saveJSON({app:'ui-field-guide',kind:'elements',version:1,exportedAt:Date.now(),elements:custom},`ui-field-guide-elements-${new Date().toISOString().slice(0,10)}.json`)}
function importLibraryFile(){const i=document.createElement('input');i.type='file';i.accept='application/json,.json';i.onchange=async()=>{const f=i.files[0];if(!f)return;try{const d=JSON.parse(await f.text());const n=importDefs(d.elements);toast(n?`Added or updated ${n} element${n>1?'s':''}`:'Nothing new in that file')}catch{toast('That file is not a UI Field Guide library')}};i.click()}

/* the editor: new elements, edits, your own versions of built-ins, and elements saved from the canvas */
const codeFrom=n=>'my.'+(String(n||'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,32)||'element');
function openEditor(id,pre={}){const ex=id&&custom.find(x=>x.id===id);const d={c:'mine',shape:'box',s:[220,80],aka:[],...(ex||pre)};const isNew=!ex||!!ex.stub;let codeTouched=!!ex||!!pre.id;
 const m=showModal(ex?.stub?'Describe this element':ex?`Edit “${esc(plain(d.n))}”`:'New element',`<p class="mlead">${ex?.stub?'It came in with a mockup or a captured page. Give it a name and a description so it reads well everywhere.':ex?'Changes apply to every mockup that uses it.':'Adds an element to Your elements. It works everywhere the built-in ones do: search, the palette, Replace with…, the builder and Copy for Claude.'}</p>
  <div class="ce"><div class="ce-f">
   <div class="fld"><label for="ceN">Name</label><input class="inp" id="ceN" value="${esc(plain(d.n))}" placeholder="Brew timer card"></div>
   <div class="fld"><label for="ceId">Code</label><input class="inp" id="ceId" value="${esc(d.id||codeFrom(d.n))}" ${ex?'disabled':''} spellcheck="false" style="font-family:var(--f-mono)"><span class="hint">Lowercase, with one dot, like <span class="k">tea.timer</span>. It’s how mockups and Claude refer to it.</span></div>
   <div class="fld"><label for="ceC">Group</label><select class="inp" id="ceC">${CATS.map(c=>`<option value="${c.id}" ${c.id===d.c?'selected':''}>${esc(c.name)}</option>`).join('')}</select></div>
   <div class="fld"><label for="ceA">Also called</label><input class="inp" id="ceA" value="${esc((d.aka||[]).join(', '))}" placeholder="Other names, separated by commas"></div>
   <div class="fld"><label for="ceD">What it is</label><textarea class="inp" id="ceD" rows="2">${esc(ex?.stub?'':plain(d.d))}</textarea></div>
   <div class="fld"><label for="ceU">When to use it</label><textarea class="inp" id="ceU" rows="2">${esc(plain(d.u))}</textarea></div>
   <div class="fld"><label for="ceT">Default label</label><input class="inp" id="ceT" value="${esc(d.t??'')}"><span class="hint">For lists, chips and tabs, separate items with commas.</span></div>
   <div class="fld"><label>Default size</label><div class="row" style="gap:8px"><input class="inp" id="ceW" type="number" min="16" value="${d.s[0]}" aria-label="Width" style="width:90px"><span class="k">×</span><input class="inp" id="ceH" type="number" min="16" value="${d.s[1]}" aria-label="Height" style="width:90px"><span class="k">px</span></div></div>
  </div><div class="ce-p">
   <div class="fld"><label for="ceS">Preview</label><select class="inp" id="ceS">${SHAPES.map(([k,n])=>`<option value="${k}" ${k===d.shape?'selected':''}>Wireframe: ${n}</option>`).join('')}</select></div>
   <div class="ce-stage stage" id="ceStage"></div>
   <div class="fld"><label for="ceHtml">Or your own HTML <span class="k">(optional)</span></label><textarea class="inp" id="ceHtml" rows="6" spellcheck="false" style="font:12px/1.45 var(--f-mono)" placeholder="&lt;div class=&quot;box&quot; style=&quot;padding:12px&quot;&gt;{label}&lt;/div&gt;">${esc(d.html||'')}</textarea><span class="hint">Replaces the wireframe. Write <span class="k">{label}</span> where the label goes. Inline styles and the library’s classes (box, btn, field, chip, ln…) work; scripts and style tags are removed.</span></div>
  </div></div>
  <div class="btnrow"><button class="b pri" id="ceGo">${I('save',14)}${ex&&!ex.stub?'Save changes':'Add to library'}</button><button class="b" data-close>Cancel</button><span class="hint" id="ceErr" style="color:var(--danger)"></span></div>`,'wide');
 const read=()=>({...d,id:$('#ceId').value.trim(),n:$('#ceN').value.trim(),c:$('#ceC').value,aka:$('#ceA').value.split(',').map(x=>x.trim()).filter(Boolean),d:$('#ceD').value.trim(),u:$('#ceU').value.trim(),t:$('#ceT').value,s:[+$('#ceW').value||200,+$('#ceH').value||80],shape:$('#ceS').value,html:$('#ceHtml').value.trim(),stub:false});
 const pv=()=>{const r=read();const e=asEntry({...r,id:CODE_RE.test(r.id)?r.id:'my.preview'});const box=$('#ceStage');const [w,h]=e.s;const k=Math.min(1,(box.clientWidth-20)/w,(box.clientHeight-20)/h);const st=styOf();
  box.innerHTML=`<div class="spec${styCls(st)}" style="${styVars(st)}width:${w}px;height:${h}px;transform:translate(-50%,-50%) scale(${k})">${e.h(esc(r.t||r.n||'Label'))}</div>`;$('#ceS').disabled=!!r.html};
 m.addEventListener('input',ev=>{if(ev.target.id==='ceId')codeTouched=true;if(ev.target.id==='ceN'&&!codeTouched&&!$('#ceId').disabled)$('#ceId').value=codeFrom(ev.target.value);pv()});m.addEventListener('change',pv);requestAnimationFrame(pv);
 $('#ceGo').onclick=async()=>{const r=read();const err=t=>{$('#ceErr').textContent=t};if(!r.n)return err('Give it a name.');if(!CODE_RE.test(r.id))return err('The code needs lowercase letters, one dot and no spaces, like tea.timer.');
  if(EM[r.id]&&!EM[r.id].custom)return err(`${r.id} is a built-in element. Choose another code.`);if(!ex&&custom.some(x=>x.id===r.id))return err(`You already have an element called ${r.id}.`);
  r.updatedAt=Date.now();await putCustom(r);closeOverlay();toast(`${isNew?'Added':'Saved'} “${plain(r.n)}”`);openDetail(r.id)};
 setTimeout(()=>$('#ceN').focus(),30)}
// Save what's selected on the canvas as an element: one piece keeps its look, several become one composite
function saveSelToLibrary(S){if(!S.length)return;if(S.length===1){const e=S[0],b=EM[e.type];openEditor(null,{n:e.t&&!b.multi?short(e.t,40):`${b.n} (mine)`,c:'mine',t:e.t??b.t,s:[e.w,e.h],d:e.note||(b.custom?b.d:`Based on ${b.n}.`),u:b.u||'',x:[e.type],shape:b.custom?b.shape:'box',html:b.custom?(custom.find(x=>x.id===b.id)?.html||''):render(e.type,'{label}')});return}
 const x0=Math.min(...S.map(e=>e.x)),y0=Math.min(...S.map(e=>e.y)),W=Math.max(...S.map(e=>e.x+e.w))-x0,H=Math.max(...S.map(e=>e.y+e.h))-y0;const pc=v=>Math.round(v*1000)/10;
 const html=`<div style="position:relative;width:100%;height:100%">${[...S].sort((a,b)=>a.y-b.y||a.x-b.x).map(e=>`<div style="position:absolute;left:${pc((e.x-x0)/W)}%;top:${pc((e.y-y0)/H)}%;width:${pc(e.w/W)}%;height:${pc(e.h/H)}%">${render(e.type,e.t)}</div>`).join('')}</div>`;
 openEditor(null,{n:S[0].gn&&S.every(e=>e.g===S[0].g)?S[0].gn:'My block',c:'mine',t:'',s:[W,H],d:`Made of ${S.map(e=>EM[e.type].n).join(', ')}.`,x:[...new Set(S.map(e=>e.type))].slice(0,6),html})}

/* ---------- mode switching ---------- */
function setMode(m){m=m==='builder'||m==='ai'?m:'library';$('#vLib').hidden=m!=='library';$('#vBld').hidden=m!=='builder';$('#vAI').hidden=m!=='ai';$('#tabLib').setAttribute('aria-selected',m==='library');$('#tabBld').setAttribute('aria-selected',m==='builder');$('#tabAI').setAttribute('aria-selected',m==='ai');try{history.replaceState(null,'','#'+(m==='ai'?'design':m))}catch{};if(m==='builder')layoutFrame();if(m==='ai')drawSketch();LS.set('uifg.mode',m)}
$('#tabAI').onclick=()=>setMode('ai');$('#tabLib').onclick=()=>setMode('library');$('#tabBld').onclick=()=>setMode('builder');
$('#countLbl').textContent=`${E.length} elements · ${CATS.length} groups`;

/* ---------- library ---------- */
$('#sIco').innerHTML=I('search',15);
/* visual styles: the library has its own, each mockup keeps one */
const STYLES=[{id:'',n:'Default',d:'clean, neutral product UI'},{id:'rounded',n:'Rounded',d:'soft, friendly and generously rounded'},{id:'sharp',n:'Sharp',d:'square corners and thin lines, corporate and dense'},{id:'brutal',n:'Brutalist',d:'thick black outlines, square corners, hard offset shadows and a mono font'},{id:'glass',n:'Glass',d:'frosted, translucent panels over a colourful backdrop'},{id:'soft',n:'Soft UI',d:'neumorphic: raised and inset surfaces lit from the top left'},{id:'dark',n:'Dark',d:'dark surfaces with light text'}];
const ACCENTS=['#2E4BD8','#7C5CFF','#D6409F','#E5484D','#F76B15','#E8B730','#1E9A61','#0F9BB0','#111111'];
let libSty=LS.get('uifg.libStyle',{s:'',a:''});
const okHex=a=>/^#[0-9a-f]{6}$/i.test(a||'');
const styOf=()=>$('#vBld').hidden?libSty:(P.style||{});
const styCls=st=>st?.s&&STYLES.some(x=>x.id===st.s)?` sty-${st.s}`:'';
// readable text colour on top of the chosen accent
const onColor=a=>{const n=parseInt(a.slice(1),16),l=(.299*(n>>16)+.587*(n>>8&255)+.114*(n&255))/255;return l>.62?'#111':'#fff'};
const styVars=st=>okHex(st?.a)?`--w-accent:${st.a};--w-soft:color-mix(in srgb,${st.a} 16%,var(--w-surface));--w-on:${onColor(st.a)};`:'';
function applySty(el,st){el.className=el.className.replace(/\s?sty-[a-z]+/g,'')+styCls(st);['--w-accent','--w-soft','--w-on'].forEach(k=>el.style.removeProperty(k));if(okHex(st?.a)){el.style.setProperty('--w-accent',st.a);el.style.setProperty('--w-soft',`color-mix(in srgb,${st.a} 16%,var(--w-surface))`);el.style.setProperty('--w-on',onColor(st.a))}}
const styName=st=>STYLES.find(x=>x.id===(st?.s||''))||STYLES[0];
function styPicker(st,id){return `<div class="stypick" id="${id}"><div class="stychips">${STYLES.map(x=>`<button class="stychip${(st?.s||'')===x.id?' on':''}" data-sty="${x.id}" title="${x.n}: ${x.d}"><span class="stydemo${styCls({s:x.id})}" style="${styVars(st)}"><b class="btn">Aa</b></span>${x.n}</button>`).join('')}</div><div class="accs" style="margin-top:8px"><span class="cap" style="margin-right:2px">Accent</span><button class="accdot${!okHex(st?.a)?' on':''}" data-acc="" title="The style’s own colour">✕</button>${ACCENTS.map(c=>`<button class="accdot${st?.a===c?' on':''}" data-acc="${c}" style="background:${c}" title="${c}"></button>`).join('')}<label class="accdot custom${okHex(st?.a)&&!ACCENTS.includes(st.a)?' on':''}" title="Pick any colour"><input type="color" data-accin value="${okHex(st?.a)?st.a:'#2E4BD8'}"></label></div></div>`}
// one handler for both pickers: calls set({s,a}) with the new style
function wireStyPicker(host,get,set){host.addEventListener('click',ev=>{const b=ev.target.closest('[data-sty]');if(b)return set({...get(),s:b.dataset.sty});const a=ev.target.closest('[data-acc]');if(a)set({...get(),a:a.dataset.acc})});host.addEventListener('change',ev=>{if(ev.target.matches('[data-accin]'))set({...get(),a:ev.target.value})})}
function specHTML(e,boxW,boxH){const [w,h]=e.s;const k=Math.min(1,(boxW-20)/w,(boxH-20)/h);const st=styOf();return `<div class="spec${styCls(st)}" style="${styVars(st)}width:${w}px;height:${h}px;transform:translate(-50%,-50%) scale(${k})">${render(e.id)}</div>`}
function buildRail(){const r=$('#rail');r.querySelectorAll('a,.tip').forEach(n=>n.remove());CATS.forEach(c=>{const a=document.createElement('a');a.href='#';a.dataset.cat=c.id;a.innerHTML=`<span>${c.name}</span><span class="k">${E.filter(e=>e.c===c.id).length}</span>`;a.onclick=ev=>{ev.preventDefault();$('#q').value='';drawLib();document.getElementById('sec-'+c.id)?.scrollIntoView({behavior:'smooth'});r.querySelectorAll('a').forEach(x=>x.classList.toggle('on',x===a))};r.appendChild(a)});const tip=document.createElement('div');tip.className='tip';tip.innerHTML='Tip: search finds nicknames too, so "snackbar", "kebab" or "CTA" all work.';r.appendChild(tip)}
function match(e,q){if(!q)return true;q=q.toLowerCase();return [e.n,e.id,...e.aka,e.d,catName(e.c)].join(' ').toLowerCase().includes(q)}
function drawLib(){const q=$('#q').value.trim();const host=$('#secs');let html='';let total=0;CATS.forEach(c=>{const items=E.filter(e=>e.c===c.id&&match(e,q));const mine=c.id==='mine';if(!items.length&&!(mine&&!q))return;total+=items.length||1;html+=`<section class="lsec" id="sec-${c.id}"><h2>${c.name}<span class="k">${items.length}</span></h2><p>${c.b}</p>${mine?`<div class="btnrow" style="margin:-4px 0 14px"><button class="b pri sm" data-newel>${I('plus',13)}New element</button><button class="b sm" data-explib ${custom.length?'':'disabled'}>${I('download',13)}Export library</button><button class="b sm" data-implib>Import library</button></div>${items.length?'':'<p class="hint" style="margin:0 0 8px">Nothing here yet. Add one, use “Save to library” on anything in the builder, or open a mockup or captured page that uses codes the library doesn’t know.</p>'}`:''}<div class="cards">${items.map(e=>{const pk=pick.includes(e.id);return `<div class="card${pk?' picked':''}" role="button" tabindex="0" data-id="${e.id}"><div class="stage">${specHTML(e,244,150)}</div><div class="meta"><b>${e.n}</b><span class="k">${e.id}</span>${e.v&&EM[e.v]?`<span class="var">Variation of ${EM[e.v].n}</span>`:''}${e.custom?`<span class="var">${e.stub?'Needs a description':'Yours'}</span>`:''}<span class="aka">${e.aka.join(' · ')}</span></div><button class="b icon add" data-pick="${e.id}" aria-pressed="${pk}" title="${pk?'Picked. Click to remove':'Pick for mockup'}" aria-label="Pick ${e.n} for mockup">${I(pk?'check':'plus',15)}</button></div>`}).join('')}</div></section>`});host.innerHTML=total?html:`<div class="empty-lib">Nothing matches “${esc(q)}”. Try a broader word like “menu”, “input” or “loading”, or use Help me choose.</div>`}
$('#q').addEventListener('input',drawLib);
$('#newEl').onclick=()=>openEditor(null);
$('#secs').addEventListener('click',ev=>{if(ev.target.closest('[data-newel]')){ev.stopPropagation();openEditor(null)}else if(ev.target.closest('[data-explib]')){ev.stopPropagation();exportLibrary()}else if(ev.target.closest('[data-implib]')){ev.stopPropagation();importLibraryFile()}},true);
$('#secs').addEventListener('click',ev=>{const pk=ev.target.closest('[data-pick]');if(pk){ev.stopPropagation();togglePick(pk.dataset.pick);return}const c=ev.target.closest('.card');if(!c)return;if(ev.shiftKey||ev.metaKey||ev.ctrlKey){togglePick(c.dataset.id);return}openDetail(c.dataset.id)});
$('#secs').addEventListener('keydown',ev=>{if((ev.key==='Enter'||ev.key===' ')&&ev.target.classList.contains('card')){ev.preventDefault();openDetail(ev.target.dataset.id)}});
function pickBtn(id,cls=''){const pk=pick.includes(id);return `<button class="b ${pk?'':'pri'} ${cls}" data-pick="${id}">${pk?I('check',14)+' Picked':I('plus',14)+' Pick for mockup'}</button>`}
function openDetail(id){const e=EM[id];closeOverlay();const inB=!$('#vBld').hidden;const s=document.createElement('div');s.className='scrim';s.id='ovl';s.innerHTML=`<div class="drawer" role="dialog" aria-label="${e.n}"><div class="dhead"><div style="flex:1;min-width:0"><span class="eyebrow">${catName(e.c)}</span><h3>${e.n}</h3><span class="k">${e.id}</span></div><button class="b icon" data-close aria-label="Close">${I('x',16)}</button></div><div class="stage">${specHTML(e,476,240)}</div><div><h4>Also called</h4><div class="akas">${e.aka.map(a=>`<span>${a}</span>`).join('')}</div></div><div><h4>What it is</h4><p>${e.d}</p></div><div><h4>When to use it</h4><p>${e.u}</p></div>${(()=>{const base=e.v||e.id;const fam=E.filter(x=>x.id!==e.id&&(x.id===base||x.v===base));return fam.length?`<div><h4>Variations</h4><div class="confused">${fam.map(x=>`<button data-go="${x.id}">${x.n}</button>`).join('')}</div></div>`:''})()}${e.x?.length?`<div><h4>Often confused with</h4><div class="confused">${e.x.filter(x=>EM[x]).map(x=>`<button data-go="${x}">${EM[x].n}</button>`).join('')}</div></div>`:''}<div><h4>How to ask for it</h4><p class="k" style="font-size:12.5px;line-height:1.6">“Add a ${e.n.toLowerCase()} (${e.id}) …”</p></div><div class="dactions">${inB?`<button class="b pri" data-add="${e.id}">${I('plus',14)} Add to mockup</button>`:`${pickBtn(e.id)}<button class="b" data-add="${e.id}">Add now</button>`}<button class="b" data-copy="${e.n} (${e.id})">${I('copy',14)} Copy name</button>${e.custom?`<button class="b" data-edit="${e.id}">${e.stub?'Describe it':'Edit'}</button><button class="b danger" data-delc="${e.id}">${I('trash',14)}Delete</button>`:`<button class="b" data-vary="${e.id}" title="Start a new element of your own from this one">Make my own version</button>`}</div></div>`;s.addEventListener('click',ev=>{if(ev.target===s||ev.target.closest('[data-close]'))closeOverlay();const g=ev.target.closest('[data-go]');if(g)openDetail(g.dataset.go);const pk=ev.target.closest('[data-pick]');if(pk){togglePick(pk.dataset.pick);pk.outerHTML=pickBtn(pk.dataset.pick)}const a=ev.target.closest('[data-add]');if(a){closeOverlay();addToMockup(a.dataset.add)}const cp=ev.target.closest('[data-copy]');if(cp)copyText(cp.dataset.copy,'Name copied');const ed=ev.target.closest('[data-edit]');if(ed)openEditor(ed.dataset.edit);
 const vy=ev.target.closest('[data-vary]');if(vy){const b=EM[vy.dataset.vary];openEditor(null,{n:`My ${b.n.toLowerCase()}`,c:b.c,aka:[],t:b.t,s:[...b.s],d:b.d,u:b.u,x:[b.id],html:render(b.id,'{label}')})}
 const dc=ev.target.closest('[data-delc]');if(dc){if(dc.dataset.confirm){closeOverlay();dropCustom(dc.dataset.delc)}else{dc.dataset.confirm='1';dc.innerHTML='Delete? Click again'}}});document.body.appendChild(s);s.querySelector('[data-close]').focus()}
function closeOverlay(){document.getElementById('ovl')?.remove()}
async function copyText(txt,msg,fallbackEl){try{await navigator.clipboard.writeText(txt);toast(msg||'Copied')}catch{if(fallbackEl){fallbackEl.focus();fallbackEl.select?.();toast('Press Ctrl/⌘+C to copy the selected text')}else toast('Copy blocked here. Select the text and copy it manually.')}}

/* picked tray: collect several elements, then add them all at once */
let pick=LS.get('uifg.pick',[]).filter(id=>EM[id]);
function markCard(c){const on=pick.includes(c.dataset.id);c.classList.toggle('picked',on);const b=c.querySelector('[data-pick]');if(b){b.innerHTML=I(on?'check':'plus',15);b.setAttribute('aria-pressed',on);b.title=on?'Picked. Click to remove':'Pick for mockup'}}
function setPick(ids){const changed=[...new Set([...pick,...ids])];pick=ids;LS.set('uifg.pick',pick);drawTray();changed.forEach(id=>document.querySelectorAll(`.card[data-id="${id}"]`).forEach(markCard))}
function togglePick(id){setPick(pick.includes(id)?pick.filter(x=>x!==id):[...pick,id])}
function drawTray(){const t=$('#tray');t.hidden=!pick.length;if(!pick.length)return;t.innerHTML=`<b class="tn">${pick.length} picked</b><div class="tchips">${pick.map(id=>`<button class="tchip" data-un="${id}" title="Remove ${EM[id].n}">${EM[id].n}${I('x',11,2.5)}</button>`).join('')}</div><button class="b" data-clear>Clear</button><button class="b pri" data-addall>Add ${pick.length===1?'it':`all ${pick.length}`} to mockup${I('right',14)}</button>`}
$('#tray').addEventListener('click',ev=>{const u=ev.target.closest('[data-un]');if(u)return togglePick(u.dataset.un);if(ev.target.closest('[data-clear]'))return setPick([]);if(ev.target.closest('[data-addall]')){const ids=[...pick];setPick([]);setMode('builder');addMany(ids);toast(`${ids.length} element${ids.length>1?'s':''} added to “${M.name}”`)}});

/* ---------- help me choose ---------- */
// [id, one|many, fewest options, most options, tier (1 best, 2 also works, 3 special look), why]
const OPTS=[
 ['sel.switch','one',2,2,1,'An on/off setting that takes effect right away'],
 ['sel.segmented','one',2,5,1,'Short options side by side; switches instantly'],
 ['sel.radio','one',2,7,1,'Every option visible, with room for a description'],
 ['sel.select','one',5,40,1,'Compact; best when people already know the options'],
 ['sel.searchable','one',8,999,1,'A long list people can filter by typing'],
 ['in.combobox','one',16,999,1,'Type to narrow a very long list'],
 ['sel.checkbox','one',2,2,2,'A single yes/no that is sent with a form'],
 ['sel.cards','one',2,4,2,'Options that need a price, picture or description'],
 ['sel.chips','one',3,10,2,'Quick filters above a list'],
 ['sel.listbox','one',4,12,2,'An always-open list when there is room'],
 ['sel.stepped','one',3,7,2,'An ordered scale, low to high'],
 ['sel.cycler','one',3,12,2,'Step through options with arrows in a tight space'],
 ['sel.size','one',3,8,2,'Short codes such as clothing sizes'],
 ['sel.swatch','one',3,10,2,'Visual options such as colours or finishes'],
 ['sel.rating','one',5,5,2,'A 1–5 star score'],
 ['sel.thumbs','one',2,2,3,'Quick thumbs up or down'],
 ['sel.daynight','one',2,2,3,'A playful two-state toggle such as light/dark'],
 ['sel.labelswitch','one',2,2,3,'A switch that spells out both states'],
 ['ctl.rotary','one',3,8,3,'Hardware-style mode selector'],
 ['ctl.pianokeys','one',3,6,3,'Retro push-button selector'],
 ['ctl.wheel','one',8,999,3,'Scroll wheel for times and numbers'],
 ['sel.likert','one',5,7,2,'An agree–disagree survey scale'],
 ['sel.emojirate','one',5,5,2,'Faces from unhappy to delighted'],
 ['sel.nps','one',10,11,2,'A 0–10 “how likely” survey scale'],
 ['sel.checkgroup','many',2,8,1,'All options visible; tick any combination'],
 ['sel.tiles','many',3,12,1,'Tiles with icons, great for picking interests'],
 ['sel.chips','many',3,12,1,'Tap several filters to combine them'],
 ['sel.multi','many',6,999,1,'A dropdown that keeps the choices as chips'],
 ['in.tags','many',8,999,1,'Type to add from a long list, or create new ones'],
 ['act.toggle','many',2,5,2,'Toolbar on/off buttons such as Bold / Italic'],
 ['lay.settings','many',2,8,2,'A list of independent on/off settings'],
 ['sel.listbox','many',4,15,2,'An open list with several rows selected'],
 ['sel.transfer','many',8,999,2,'Move items between Available and Selected'],
 ['ctl.switchpanel','many',3,6,3,'A row of rocker switches'],
 ['ctl.dip','many',4,8,3,'A bank of hardware switches'],
 ['ctl.padgrid','many',8,999,3,'A light-up grid of pads']];
const wv=(path,k)=>path.find(p=>p.k===k)?.v;
function optRes(path){const n=wv(path,'n'),m=wv(path,'m');const hit=OPTS.filter(o=>o[1]===m&&n>=o[2]&&n<=o[3]);return ['Best fit','Also works','For a special look'].map((h,i)=>({h,items:hit.filter(o=>o[4]===i+1).map(o=>[o[0],o[5]])})).filter(g=>g.items.length)}
function navRes(path){const n=wv(path,'n'),mob=wv(path,'d')==='mob';const T=mob?{4:[['nav.bottom','Thumb-friendly tabs for 3–5 sections'],['nav.bottomfab','Tabs with a raised button for the main action'],['nav.appbar','Title bar with back and actions'],['nav.tabs','Swipeable tabs under the app bar']],7:[['nav.bottom','Show the top four and a “More” tab'],['nav.hamburger','Tuck the rest behind a menu button'],['ov.drawer','A slide-out list of every section']],12:[['nav.hamburger','A menu button that opens the full list'],['ov.drawer','A scrollable list grouped under headings'],['in.search','Let people search instead of scroll']]}:{4:[['nav.topbar','Links across the top; fits a handful of sections'],['nav.floating','A floating pill-shaped bar over the page'],['nav.sidebar','Room to grow, and shows where you are'],['nav.rail','Icon rail when screen space matters']],7:[['nav.sidebar','Lists every section without crowding'],['nav.topbar','Keep the top four or five and put the rest under “More”'],['nav.mega','Groups many links under a few headings'],['nav.rail','Compact icons with labels']],12:[['nav.sidebar','Group sections under headings that collapse'],['nav.mega','Big menu panels in columns'],['data.tree','Nested sections that expand and collapse'],['nav.command','Let people type to jump anywhere']]};return [{h:'Good fits',items:T[n]}]}
function viewRes(path){const n=wv(path,'n');const T={3:[['sel.segmented','Two or three short views that switch in place'],['nav.tabs','Classic tabs under a header'],['nav.pills','Softer, rounded tabs']],5:[['nav.tabs','Up to about six labelled tabs'],['nav.tabscount','Tabs that show how many items each holds'],['nav.pills','Rounded tabs that can wrap'],['nav.subnav','A strip of section links under the main nav'],['nav.boxtabs','Folder-style tabs, like open files']],8:[['nav.vtabs','Stacked tabs on the left fit long lists'],['nav.sidetabs','Side tabs next to the content'],['nav.toc','Jump links down a long page'],['sel.select','A dropdown on small screens']]};return [{h:'Good fits',items:T[n]}]}
const WZ={q:'What should this part of the screen do?',a:[
 {l:'Choose from options',d:'Pick one or several from a set',next:{q:'How many options are there?',k:'n',n:1,a:['2','3','4','5','6–7','8–15','16+'].map((l,i)=>({l,v:[2,3,4,5,6,10,20][i]})),next:{q:'Can people pick more than one?',k:'m',a:[{l:'Just one',d:'Picking one replaces the last',v:'one'},{l:'Several',d:'Any combination',v:'many'}],res:optRes}}},
 {l:'Type or enter a value',d:'Text, numbers, dates, files…',next:{q:'What kind of value?',a:[
  {l:'Short text',d:'Name, title, email',res:['in.text','in.floating','in.filled','in.underline','in.clear','in.prefix','in.inline']},
  {l:'Long text',d:'Messages, descriptions',res:['in.textarea','in.counter','in.rich','in.composer']},
  {l:'Sign in or password',res:['in.password','in.text','fb.strength','act.social','lay.form']},
  {l:'A number or amount',res:['in.number','in.currency','sel.slider','sel.range','sel.stepped','ctl.knob','ctl.keypad']},
  {l:'A date or time',res:['in.date','in.daterange','in.time','sel.timeslots','ctl.wheel','data.calendar']},
  {l:'A search',res:['in.search','in.searchrecent','in.search2','in.combobox','nav.command']},
  {l:'A file or photo',res:['in.file','med.avatarup','fb.upload']},
  {l:'A colour',res:['in.color','sel.swatch','ctl.colorwheel']},
  {l:'Phone, card or code',res:['in.phone','in.card','in.otp']},
  {l:'Several tags or people',res:['in.tags','in.mention','sel.multi','sel.transfer']},
  {l:'An address',res:['in.address','med.map']},
  {l:'A signature',res:['in.signature']}]}},
 {l:'Do an action',d:'Buttons, menus, shortcuts',next:{q:'What kind of action?',a:[
  {l:'The main action',d:'One per screen or section',res:['act.button','act.pill','act.gradient','act.pressable','act.withicon','lay.stickybar','act.fabext']},
  {l:'A less important action',res:['act.secondary','act.outline','act.text','act.link','act.icon']},
  {l:'Something destructive',d:'Delete, cancel, pay',res:['act.danger','ov.confirm','act.hold','act.slide']},
  {l:'A few related actions',d:'Two or three side by side',res:['act.group','act.split','act.toggle','lay.toolbar']},
  {l:'Many actions',d:'Four or more',res:['nav.menu','ov.context','lay.toolbar','ov.sheet','ctl.radial']},
  {l:'Always within reach',d:'Floats over the content',res:['act.fab','act.fabext','act.edgetab','act.totop']},
  {l:'Quick reactions',res:['act.like','sel.reactions','in.emoji','sel.thumbs','act.copy']},
  {l:'A row of quick actions',res:['act.iconlabel','lay.toolbar','nav.dock']}]}},
 {l:'Move around',d:'Navigation between pages and sections',next:{q:'What kind of navigation?',a:[
  {l:'Main app navigation',d:'The top-level sections',next:{q:'How many main sections?',k:'n',n:1,a:[{l:'2–5',v:4},{l:'6–9',v:7},{l:'10+',v:12}],next:{q:'Which screen size?',k:'d',a:[{l:'Desktop or web',v:'wide'},{l:'Mobile',v:'mob'}],res:navRes}}},
  {l:'Switch views on one page',d:'Same page, different panels',next:{q:'How many views?',k:'n',n:1,a:[{l:'2–3',v:3},{l:'4–6',v:5},{l:'7+',v:8}],res:viewRes}},
  {l:'Step by step',d:'Checkout, onboarding',res:['nav.stepper','fb.progress','nav.dots','nav.back']},
  {l:'Show where I am',res:['nav.breadcrumbs','nav.back','nav.toc']},
  {l:'Pages of results',res:['nav.pagination','nav.loadmore','nav.dots']},
  {l:'Jump anywhere fast',res:['nav.command','in.search','nav.hamburger']}]}},
 {l:'Show information',d:'Numbers, lists, charts, people',next:{q:'What are you showing?',a:[
  {l:'One key number',res:['data.stat','lay.stats','data.gauge','fb.ring','data.countdown']},
  {l:'A trend over time',res:['data.line','data.area','data.sparkline','data.bar','data.heatmap']},
  {l:'Compare amounts',res:['data.bar','data.hbar','data.stacked','data.radar','data.compare','data.table','data.scatter']},
  {l:'Parts of a whole',res:['data.donut','data.treemap','data.funnel','fb.progress','ctl.rings']},
  {l:'Records with many fields',res:['data.table','lay.list','data.dl','lay.split']},
  {l:'Items to browse',res:['lay.grid','lay.masonry','lay.cardh','lay.cardoverlay','data.filegrid','lay.card','lay.product','lay.list','med.gallery']},
  {l:'Events in order',res:['data.timeline','data.inbox','data.notifications','data.comment','data.chat']},
  {l:'Dates and schedules',res:['data.calendar','data.week','data.gantt','sel.timeslots','data.kanban']},
  {l:'People',res:['data.avatar','data.avatarstatus','data.orgchart','lay.team','data.avatars','data.user','lay.profile']},
  {l:'Status',res:['data.tag','fb.status','data.badge','ctl.leds']}]}},
 {l:'Ratings, reviews & scores',d:'Stars, surveys, leaderboards',next:{q:'What do you need?',a:[
  {l:'Let people rate something',res:['sel.rateinput','sel.rating','sel.emojirate','sel.iconrating','sel.thumbs']},
  {l:'A survey question',res:['sel.nps','sel.likert','fb.csat','sel.emojirate']},
  {l:'Show an average rating',res:['data.ratingsum','data.ratinginline','data.ratingbadge','data.score','data.attrrating']},
  {l:'Show reviews',res:['data.review','data.reviewphotos','data.reviewreply','data.reviewfilter','data.proscons','lay.testimonial']},
  {l:'Scores and results',res:['data.scorecard','data.gauge','fb.ring','data.stat','data.scoreboard']},
  {l:'Rankings and rewards',res:['data.leaderboard','data.xp','data.achieve']}]}},
 {l:'AI & chat',d:'Prompts, answers, agents',next:{q:'Which part of the AI experience?',a:[
  {l:'Where people type',res:['ai.prompt','ai.attach','ai.suggest','ai.welcome']},
  {l:'The conversation',res:['ai.thread','ai.answer','ai.citation','ai.actions']},
  {l:'While it works',res:['ai.thinking','ai.agent','fb.dots']},
  {l:'Models and history',res:['ai.model','ai.chatlist']},
  {l:'Editing with AI',res:['ai.canvas','ai.diff']},
  {l:'Voice',res:['ai.voice','med.waveform']}]}},
 {l:'Sell something',d:'Products, cart, checkout',next:{q:'Which part of shopping?',a:[
  {l:'Browsing products',res:['shop.results','shop.filters','lay.product','shop.badges']},
  {l:'A product page',res:['shop.gallery','shop.variant','shop.qty','shop.price','shop.stock','shop.bundle','shop.subscribe']},
  {l:'The cart',res:['shop.minicart','shop.cartitem','shop.promo']},
  {l:'Checkout',res:['shop.shipping','shop.paymethod','in.card','lay.summary']},
  {l:'After buying',res:['shop.receipt','shop.track','data.ratingsum']}]}},
 {l:'Give feedback',d:'Success, errors, loading',next:{q:'What is happening?',a:[
  {l:'Something worked',res:['fb.toast','fb.toastundo','fb.confetti','fb.success','fb.alert']},
  {l:'Something went wrong',res:['fb.error','fb.alert','fb.404']},
  {l:'A short wait',res:['fb.spinner','fb.dots','act.loading','fb.typing']},
  {l:'Content is loading',res:['fb.skeleton','fb.progress','fb.spinner']},
  {l:'Progress I can measure',res:['fb.progress','fb.segprogress','fb.checklist','fb.ring','fb.upload','nav.stepper']},
  {l:'An announcement',res:['fb.banner','fb.alerts','fb.offline','fb.alert','fb.push','ov.modal']},
  {l:'Nothing here yet',res:['fb.empty']},
  {l:'First-time tips',res:['fb.coach','ov.spotlight','ov.onboarding','fb.checklist','ov.welcome','ov.tooltip']}]}},
 {l:'Show something on top',d:'Dialogs, drawers, popovers',next:{q:'What is it for?',a:[
  {l:'Confirm a decision',res:['ov.confirm','ov.modal','act.hold']},
  {l:'A focused task or form',res:['ov.modal','ov.fullscreen','ov.drawer','ov.sheet']},
  {l:'Filters or settings',res:['ov.drawer','ov.sheet','ov.popover']},
  {l:'A small hint',res:['ov.tooltip','ov.popover','ov.hovercard','fb.coach']},
  {l:'Share something',res:['ov.share','act.copy']},
  {l:'Edit a photo',res:['ov.cropper','med.avatarup']},
  {l:'Live help',res:['ov.chatwidget','data.chat']},
  {l:'A list of actions',res:['nav.menu','ov.context','ov.sheet','ctl.radial']},
  {l:'View images large',res:['ov.lightbox','med.carousel','med.gallery']},
  {l:'Consent or legal',res:['ov.cookie','fb.banner']}]}},
 {l:'Lay out a page',d:'Headers, sections, footers',next:{q:'Which part of the page?',a:[
  {l:'Top of the page',res:['nav.topbar','nav.floating','lay.herosplit','lay.heroapp','nav.appbar','lay.hero','fb.banner']},
  {l:'Group related content',res:['lay.card','lay.panel','lay.accordion','nav.tabs','lay.divider']},
  {l:'Marketing sections',res:['lay.hero','lay.bento','lay.newsletter','lay.team','lay.feature','lay.steps','lay.logos','lay.stats','lay.testimonial','lay.pricing','lay.cta']},
  {l:'App screen structure',res:['lay.dashboard','lay.split','nav.sidebar','lay.toolbar']},
  {l:'Bottom of the page',res:['lay.footer','lay.stickybar','nav.bottom']},
  {l:'Forms and settings',res:['lay.form','lay.authsplit','lay.settings','lay.summary']}]}},
 {l:'Show media',d:'Images, video, audio, maps',next:{q:'What kind of media?',a:[
  {l:'Photos',res:['med.image','med.hotspot','med.gallery','med.carousel','ov.lightbox','med.compare']},
  {l:'Video',res:['med.video','med.call','med.vthumb','ctl.media','med.stories']},
  {l:'Audio',res:['med.audio','med.waveform','med.podcast','med.playlist','ctl.nowplaying','med.voice','ctl.media']},
  {l:'A location',res:['med.map']},
  {l:'Documents',res:['med.doc','data.file']},
  {l:'Brand or identity',res:['med.logo','med.icon','data.avatar','med.qr']}]}},
 {l:'Physical controls',d:'Dials, switches, panels',next:{q:'What does it control?',a:[
  {l:'Set a level',res:['ctl.knob','ctl.dimmer','ctl.vslider','ctl.faders','ctl.thermostat','ctl.arcrange']},
  {l:'Turn on or off',res:['ctl.lightswitch','ctl.flip','ctl.rocker','ctl.power','ctl.slide','ctl.guarded']},
  {l:'Choose a mode',res:['ctl.rotary','ctl.chicken','ctl.pianokeys','ctl.thumbwheel','ctl.keyswitch']},
  {l:'Read a value',res:['ctl.lcd','ctl.vu','ctl.battery','ctl.leds','data.gauge']},
  {l:'Play media',res:['ctl.media','ctl.seek','ctl.nowplaying','ctl.clickwheel']}]}}
]};
let wzA=[];
function wzWalk(){let node=WZ,res=null;const path=[];for(const i of wzA){const a=node.a[i];path.push({k:node.k,v:a.v,l:a.l});const nx=a.next||(a.res?null:node.next);if(nx)node=nx;else{res=a.res||node.res;break}}return {node,res,path}}
function openWizard(){wzA=[];const m=showModal('Help me choose','<div class="wz" id="wz"></div>','wide');drawWz();m.addEventListener('click',ev=>{const b=ev.target.closest('[data-wz],[data-wzto],[data-wzadd],[data-pick],[data-wzinfo]');if(!b)return;const d=b.dataset;if(d.wz!=null)wzA.push(+d.wz);else if(d.wzto!=null)wzA=wzA.slice(0,+d.wzto);else if(d.wzadd){addEl(d.wzadd);toast(`${EM[d.wzadd].n} added. Keep adding, or close when you're done.`);return}else if(d.pick){togglePick(d.pick)}else if(d.wzinfo)return openDetail(d.wzinfo);drawWz();if(d.wz!=null||d.wzto!=null)$('#wz').querySelector('button')?.focus()})}
function drawWz(){const host=$('#wz');if(!host)return;const {node,res,path}=wzWalk();const inB=!$('#vBld').hidden;let h=`<div class="wzcrumb"><button class="lnkbtn" data-wzto="0">Start</button>${path.map((p,i)=>`${I('right',12)}<button class="lnkbtn" data-wzto="${i+1}">${esc(p.l)}</button>`).join('')}</div>`;
 if(!res)h+=`<h3 class="wzq">${node.q}</h3><div class="wzopts${node.n?' n':''}">${node.a.map((a,i)=>`<button class="wzopt" data-wz="${i}"><b>${esc(a.l)}</b>${a.d?`<span>${esc(a.d)}</span>`:''}</button>`).join('')}</div>`;
 else{const groups=typeof res==='function'?res(path):[{h:'Good fits',items:res.map(id=>[id,firstSentence(EM[id]?.u)])}];h+=`<h3 class="wzq">Try these</h3>`+groups.map(g=>`<h4 class="wzh">${g.h}</h4><div class="wzres">${g.items.filter(([id])=>EM[id]).map(([id,why])=>{const e=EM[id];return `<div class="wzr"><div class="stage">${specHTML(e,230,110)}</div><div class="m"><b>${e.n}</b><span class="k">${e.id}</span><p>${esc(why)}</p><div class="btnrow">${inB?`<button class="b pri sm" data-wzadd="${id}">${I('plus',13)}Add</button>`:pickBtn(id,'sm')}<button class="b sm" data-wzinfo="${id}">Details</button></div></div></div>`}).join('')}</div>`).join('')+`<p class="mlead">${inB?`Each Add drops the element on “${esc(M.name)}”. Add as many as you like, then close this.`:'Picked elements collect in the tray at the bottom of the library, ready to add to the builder together.'}</p>`}
 host.innerHTML=h}
function drawLibSty(){$('#libSty').innerHTML=styPicker(libSty,'libStyPick')}
wireStyPicker($('#libSty'),()=>libSty,st=>{libSty={s:st.s||'',a:okHex(st.a)?st.a:''};LS.set('uifg.libStyle',libSty);drawLibSty();drawLib()});
$('#helpLib').innerHTML=I('wand',14)+'Help me choose';$('#helpLib').onclick=openWizard;$('#helpIntro').onclick=openWizard;
