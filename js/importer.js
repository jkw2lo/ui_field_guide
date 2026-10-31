// UI Field Guide · import a web page (bookmarklet capture) and the "Changes only" export.
/* ---------- import a web page: a bookmarklet captures the layout, the builder edits it, the export lists only changes ----------
   uifgCapture runs on the user's page (via the bookmarklet), so it must be self-contained: no outside names. */
function uifgCapture(G){
 var D=document,de=D.documentElement,VW=de.clientWidth||innerWidth,FT=VW>=1000?'desktop':VW>=600?'tablet':'mobile',FW={desktop:1280,tablet:834,mobile:390}[FT],k=FW/VW,out=[],used=new Set(),radios=new Set();
 var T=function(s){return (s||'').replace(/\s+/g,' ').trim()},cut=function(s,n){s=T(s);return s.length>n?s.slice(0,n-1)+'…':s};
 var bx=function(r,fixed){return {x:Math.max(0,Math.round(r.left*k)),y:Math.max(0,Math.round((r.top+(fixed?0:scrollY))*k)),w:Math.max(8,Math.round(r.width*k)),h:Math.max(8,Math.round(r.height*k))}};
 var add=function(type,el,r,t){if(out.length>=320)return;var cs=getComputedStyle(el),o=bx(r,cs.position==='fixed');o.type=type;if(t)o.t=t;out.push(o)};
 var items=function(el,sel,n){return [].slice.call(el.querySelectorAll(sel)).map(function(x){return cut(x.innerText||x.getAttribute('aria-label')||x.value,24)}).filter(Boolean).slice(0,n||8)};
 var lab=function(el){var l=el.id&&D.querySelector('label[for="'+CSS.escape(el.id)+'"]');l=l||el.closest('label');if(l)used.add(l);return cut((l&&l.innerText)||el.getAttribute('aria-label')||el.placeholder||el.name||'',40)};
 var union=function(a,b){if(!b||!b.width)return a;var l=Math.min(a.left,b.left),t=Math.min(a.top,b.top);return {left:l,top:t,width:Math.max(a.left+a.width,b.left+b.width)-l,height:Math.max(a.top+a.height,b.top+b.height)-t}};
 var rgb=function(c){var m=(c||'').match(/[\d.]+/g)||[];return {r:+m[0]||0,g:+m[1]||0,b:+m[2]||0,a:m[3]==null?1:+m[3]}};
 var btn=function(cs,text,r){if(!text||r.width<=r.height*1.3&&text.length<2)return 'act.icon';var bg=rgb(cs.backgroundColor),bw=parseFloat(cs.borderTopWidth)||0,clear=bg.a<.1;if(clear&&!bw)return 'act.text';if(clear||bg.r*.3+bg.g*.59+bg.b*.11>215)return 'act.secondary';if(bg.r>170&&bg.g<90&&bg.b<90)return 'act.danger';return parseFloat(cs.borderTopLeftRadius)>=r.height/2-1?'act.pill':'act.button'};
 var looksBtn=function(cs){var bg=rgb(cs.backgroundColor);return (bg.a>.1||parseFloat(cs.borderTopWidth)>0)&&(parseFloat(cs.paddingLeft)>=6)&&/inline-block|inline-flex|flex|block|grid/.test(cs.display)};
 var inlineOnly=function(el){return [].every.call(el.children,function(x){return /^inline/.test(getComputedStyle(x).display)&&!x.matches('img,svg,input,button,select,textarea,video,iframe')})};
 function walk(el,depth){
  for(var i=0;i<el.children.length&&out.length<320;i++){var c=el.children[i],tag=c.tagName.toLowerCase();
   if(/^(script|style|noscript|template|meta|link|br|head|title)$/.test(tag)||used.has(c))continue;
   var r=c.getBoundingClientRect(),cs=getComputedStyle(c);
   if(cs.display==='none'||cs.visibility==='hidden'||+cs.opacity<.05)continue;
   if(r.width<4||r.height<4){if(cs.display==='contents'||c.children.length)walk(c,depth+1);continue}
   var role=(c.getAttribute('role')||'').toLowerCase(),text=cut(c.innerText,80),wide=r.width>VW*.8,top=r.top+scrollY<140,tall=r.height>r.width*1.2;
   // whole pieces: recognised once, their insides are not walked
   if((tag==='header'||role==='banner')&&wide&&r.height<220){add(VW<600?'nav.appbar':'nav.topbar',c,r,cut((c.querySelector('img[alt]')||{}).alt||(c.querySelector('a,b,strong,h1,span')||{}).innerText,24));continue}
   if(tag==='nav'||role==='navigation'){var it=items(c,'a,button,[role=tab],[role=menuitem]');if(/breadcrumb/i.test((c.getAttribute('aria-label')||'')+' '+c.className)){add('nav.breadcrumbs',c,r,it.join(', '));continue}if(cs.position==='fixed'&&r.top>innerHeight*.7&&VW<600){add('nav.bottom',c,r,it.slice(0,5).join(', '));continue}if(tall){add('nav.sidebar',c,r,it.join(', '));continue}if(wide&&top){add(VW<600?'nav.appbar':'nav.topbar',c,r,it[0]||cut(D.title,20));continue}add(/pagination|pager/i.test(c.className+(c.getAttribute('aria-label')||''))?'nav.pagination':'nav.subnav',c,r,it.join(', '));continue}
   if(role==='tablist'){add('nav.tabs',c,r,items(c,'[role=tab]',6).join(', '));continue}
   var links=c.querySelectorAll('a[href]');
   if(links.length>=3&&(/^(ul|ol|div|aside)$/.test(tag))&&(/sidebar|side-?nav|drawer|menu|nav/i.test(String(c.className))||(tag!=='div'&&links.length>=c.children.length*.6))&&T(c.innerText).length/links.length<40&&!c.querySelector('h1,input,table,img[width],p')){var lk=items(c,'a[href]',8);if(tall&&r.left<VW*.4){add('nav.sidebar',c,r,lk.join(', '));continue}if(wide&&top){add(VW<600?'nav.appbar':'nav.topbar',c,r,lk[0]);continue}if(r.width>r.height*2.5){add('nav.subnav',c,r,lk.join(', '));continue}add('nav.menu',c,r,lk.slice(0,6).join(', '));continue}
   if((role==='group'||role==='toolbar'||/btn-group|button-group|segmented/i.test(String(c.className)))&&c.querySelectorAll('button,a,[role=button]').length>=2&&r.height<70){add(role==='toolbar'?'lay.toolbar':'act.group',c,r,items(c,'button,a,[role=button]',5).join(', '));continue}
   if(tag==='footer'||role==='contentinfo'){add('lay.footer',c,r,cut(D.title,20));continue}
   if((tag==='dialog'&&c.open)||role==='dialog'||role==='alertdialog'){add('ov.modal',c,r,cut((c.querySelector('h1,h2,h3')||{}).innerText||text,40));continue}
   if(tag==='table'||role==='grid'||role==='table'){add('data.table',c,r,items(c,'th,[role=columnheader]',6).join(', ')||'Name, Status, Date');continue}
   if(tag==='aside'&&tall&&c.querySelectorAll('a').length>3){add('nav.sidebar',c,r,items(c,'a').join(', '));continue}
   if(tag==='pre'||(tag==='code'&&cs.display==='block')){add('data.code',c,r);continue}
   if(tag==='input'){var ty=(c.type||'text').toLowerCase();if(ty==='hidden')continue;
    if(ty==='checkbox'){add(role==='switch'?'sel.switch':'sel.checkbox',c,union(r,(c.closest('label')||{getBoundingClientRect:function(){}}).getBoundingClientRect()),lab(c)||'Option');continue}
    if(ty==='radio'){if(radios.has(c.name))continue;radios.add(c.name);var grp=[].slice.call(D.querySelectorAll('input[type=radio][name="'+CSS.escape(c.name)+'"]')),rr=grp.reduce(function(a,x){var l=x.closest('label');return union(a,(l||x).getBoundingClientRect())},r);add('sel.radio',c,rr,grp.map(lab).filter(Boolean).slice(0,6).join(', '));continue}
    if(ty==='range'){add('sel.slider',c,r,lab(c)||'Value');continue}
    if(/^(submit|button|reset)$/.test(ty)){add(btn(cs,c.value,r),c,r,cut(c.value,30)||'Submit');continue}
    var l=lab(c),lr=null;D.querySelectorAll('label').forEach(function(x){if((x.htmlFor&&x.htmlFor===c.id)||x.contains(c))lr=x.getBoundingClientRect()});
    if(ty==='search'||/search/i.test((c.placeholder||'')+' '+(c.name||'')+' '+(c.getAttribute('aria-label')||''))){add('in.search',c,r,cut(c.placeholder||'Search',30));continue}
    add(ty==='password'?'in.password':'in.text',c,union(r,lr),l||cut(c.placeholder,30)||'Field');continue}
   if(tag==='textarea'){add('in.textarea',c,r,lab(c)||'Message');continue}
   if(tag==='select'||role==='combobox'||role==='listbox'){lab(c);add('sel.select',c,r,cut((c.options&&c.options[c.selectedIndex]||{}).text||c.innerText,30)||'Choose');continue}
   if(role==='switch'){add('sel.switch',c,r,lab(c)||text||'Setting');continue}
   if(role==='slider'){add('sel.slider',c,r,lab(c)||'Value');continue}
   if(tag==='progress'||role==='progressbar'){add('fb.progress',c,r,c.getAttribute('aria-label')||'Progress');continue}
   if((role==='alert'||role==='status')&&text){add('fb.alert',c,r,text);continue}
   if(tag==='button'||role==='button'||(tag==='a'&&looksBtn(cs))){add(btn(cs,text,r),c,r,cut(text||c.getAttribute('aria-label'),30));continue}
   if(tag==='hr'){add('lay.divider',c,r,'');continue}
   if(tag==='img'||tag==='picture'){if(r.width<24&&r.height<24)continue;var rad=parseFloat(cs.borderTopLeftRadius)||0;add(rad>=r.width/2-1&&r.width<=96?'data.avatar':'med.image',c,r,cut(c.alt||(c.querySelector&&(c.querySelector('img')||{}).alt),30)||(rad>=r.width/2-1?'AB':'Image'));continue}
   if(tag==='svg'){if(r.width>=120&&r.height>=80)add('med.image',c,r,'Illustration');continue}
   if(tag==='video'){add('med.video',c,r);continue}
   if(tag==='canvas'){if(r.width>=160&&r.height>=100)add('data.line',c,r,'Chart');continue}
   if(tag==='iframe'){var src=c.src||'';add(/map/i.test(src)?'med.map':/youtube|vimeo|video/i.test(src)?'med.video':'note.box',c,r,/map|youtube|vimeo|video/i.test(src)?'':'Embedded content');continue}
   if(/^h[1-6]$/.test(tag)&&text){var fs=parseFloat(cs.fontSize);add(fs>=36?'txt.display':fs>=20?'txt.heading':'txt.sub',c,r,text);continue}
   if(tag==='blockquote'&&text){add('txt.quote',c,r,cut(c.innerText,140));continue}
   if((tag==='ul'||tag==='ol')&&c.children.length&&!c.querySelector('img,input,button,a[href] img')&&[].every.call(c.children,function(li){return inlineOnly(li)})){add(tag==='ol'?'txt.numbered':'txt.list',c,r,items(c,'li',6).join(', '));continue}
   // cards: a raised or outlined box with an image or a heading, narrower than the page
   var bw=parseFloat(cs.borderTopWidth)||0,sh=cs.boxShadow&&cs.boxShadow!=='none',rad2=parseFloat(cs.borderTopLeftRadius)||0;
   if((sh||bw>0)&&rad2>=4&&r.width<VW*.6&&r.height>70&&c.querySelector('img,h2,h3,h4,h5')){add('lay.card',c,r,cut((c.querySelector('h2,h3,h4,h5,strong,b')||{}).innerText||text,40));continue}
   // text with no blocks inside it
   if(text&&(!c.children.length||inlineOnly(c))){var fs2=parseFloat(cs.fontSize),long=T(c.innerText).length>70;add(fs2>=24?'txt.heading':long?'txt.paragraph':fs2<=12.5?'txt.caption':'note.text',c,r,long?cut(c.innerText,240):text);continue}
   // big landmark areas become labelled regions behind their contents; then keep walking
   if(/^(main|section|article|aside)$/.test(tag)&&r.height>220&&!(r.width>VW*.95&&r.height>innerHeight*1.5)){var h=c.querySelector('h1,h2,h3');if(h)add('note.region',c,r,cut(h.innerText,30))}
   walk(c,depth+1)}}
 D.querySelectorAll('label[for]').forEach(function(l){if(D.getElementById(l.htmlFor))used.add(l)});
 walk(D.body,0);
 var reg=out.filter(function(e){return e.type==='note.region'}),rest=out.filter(function(e){return e.type!=='note.region'});
 return {app:'ui-field-guide',kind:'capture',v:1,url:location.href,title:cut(D.title,60)||location.host,frame:FT,vw:VW,at:Date.now(),els:reg.concat(rest)}}
// The bookmarklet: capture, copy as a backup, then open the Field Guide and hand the capture over once it says it's ready.
function uifgBookmarklet(G){var d=uifgCapture(G),j=JSON.stringify(d);try{navigator.clipboard.writeText(j).catch(function(){})}catch(e){}var w=window.open(G+'#import','_blank');var got=false,on=function(e){if(e.source===w&&e.data&&e.data.type==='uifg-ready'){got=true;w.postMessage({type:'uifg-capture',data:d},'*');removeEventListener('message',on)}};addEventListener('message',on);setTimeout(function(){if(!got)alert('UI Field Guide couldn’t receive the page directly. The layout ('+d.els.length+' elements) is on your clipboard: in the Field Guide, open Open → Import a web page → Paste.')},8000)}
const capHome=location.origin+location.pathname;
const bookmarkletHref=()=>'javascript:'+encodeURIComponent(`(function(){${uifgCapture};(${uifgBookmarklet})(${JSON.stringify(capHome)})})()`);

/* receiving a capture */
function cleanCapture(d){if(!d||d.kind!=='capture'||!Array.isArray(d.els))return null;const frame=FR[d.frame]?d.frame:'desktop',W=FR[frame][0],num=(v,lo,hi)=>Math.max(lo,Math.min(hi,Math.round(+v||0)));const els=d.els.filter(e=>e&&(EM[e.type]||CODE_RE.test(String(e.type)))).slice(0,400).map(e=>({type:e.type,x:num(e.x,0,W-8),y:num(e.y,0,30000),w:num(e.w,8,W),h:num(e.h,8,30000),...(e.t!=null&&e.t!==''?{t:String(e.t).slice(0,300)}:{})}));return {title:String(d.title||'Imported page').slice(0,80),url:/^https?:\/\//.test(d.url||'')?String(d.url).slice(0,500):'',frame,at:+d.at||Date.now(),els}}
function capScreen(c){const s=blankScreen(short(c.title,40),c.frame);s.els=c.els.filter(ensureType).map(e=>({...e,uid:uid(),bid:uid()}));s.base={title:c.title,url:c.url,at:c.at,els:s.els.map(({uid,...e})=>({...e}))};return s}
function receiveCapture(raw){const c=cleanCapture(raw);if(!c)return toast('That isn’t a captured page from UI Field Guide');setMode('builder');importDefs(raw?.elements);const kinds=[...new Set(c.els.map(e=>EM[e.type]?.n||humanCode(e.type)))];showModal('Import a web page',`<p class="mlead"><b>${esc(c.title)}</b>${c.url?` · <span class="k">${esc(short(c.url,70))}</span>`:''}</p><p class="mlead">${c.els.length} elements recognised on a ${FR[c.frame][2].toLowerCase()} page, including ${esc(kinds.slice(0,8).join(', '))}${kinds.length>8?' and more':''}. Names are matched automatically, so check anything that looks off and use <b>Replace with…</b> to fix it.</p><p class="mlead">The original is kept, so <b>Copy for Claude</b> can describe only what you change.</p><div class="btnrow"><button class="b pri" id="capNew">${I('plus',14)}Open as a new mockup</button>${P.example?'':`<button class="b" id="capAdd">Add as a screen to “${esc(short(P.name,24))}”</button>`}<button class="b" data-close>Cancel</button></div>`);
 const go=asNew=>{const s=capScreen(c);pushUndo();if(asNew)loadProject({name:c.title,screens:[s]});else{P.screens.push(s);useScreen(s.sid)}P.example=false;clearSel();closeOverlay();setFlow(false);toast(`Imported “${c.title}”. Edit away; Copy for Claude will list only your changes.`)};
 $('#capNew').onclick=()=>go(true);$('#capAdd')&&($('#capAdd').onclick=()=>go(false))}
function pasteCapture(){showModal('Paste a captured page',`<p class="mlead">If the bookmark couldn’t open this tab, it copied the page layout to your clipboard. Paste it here.</p><textarea class="inp" id="capTxt" rows="8" placeholder="Paste here…" style="font:12px var(--f-mono)"></textarea><div class="btnrow"><button class="b pri" id="capGo">Import</button><button class="b" data-close>Cancel</button></div>`);setTimeout(()=>$('#capTxt')?.focus(),0);$('#capGo').onclick=()=>{let d;try{d=JSON.parse($('#capTxt').value)}catch{return toast('That doesn’t look like a captured page')}receiveCapture(d)}}
function openImportHelp(){const m=showModal('Import a web page',`<p class="mlead">Turn a page you’re working on into an editable mockup. Recognised parts become Field Guide elements at their real positions, and Copy for Claude then lists only what you change.</p><div class="dlsec"><h4>1 · Add the bookmark</h4><p class="mlead">Drag this button to your browser’s bookmarks bar:</p><div class="btnrow"><a class="b pri bmlet" id="bmLink" href="${esc(bookmarkletHref())}" title="Drag me to your bookmarks bar">${I('sparkle',14)}Send to UI Field Guide</a></div></div><div class="dlsec"><h4>2 · Use it on your page</h4><p class="mlead">Open the page (localhost and pages you’re signed in to work), scroll to the top, and click the bookmark. A new tab opens here with the page ready to import. The layout is read in your own browser; nothing is uploaded.</p></div><div class="dlsec"><h4>Didn’t open?</h4><p class="mlead">Some sites block new tabs. The bookmark also copies the layout, so you can paste it.</p><div class="btnrow"><button class="b" id="capPaste">${I('copy',14)}Paste a captured page</button></div></div>`,'wide');$('#bmLink').onclick=ev=>{ev.preventDefault();toast('Drag this button to your bookmarks bar, then click it on your own page')};$('#capPaste').onclick=pasteCapture}
// opened by the bookmarklet: say we're ready, then accept one capture
if(location.hash==='#import'&&window.opener){addEventListener('message',ev=>{if(ev.data?.type==='uifg-capture')receiveCapture(ev.data.data)});setTimeout(()=>{try{window.opener.postMessage({type:'uifg-ready'},'*')}catch{}},0)}

/* changes since import */
function changesOf(s){if(!s.base)return null;const B=new Map(s.base.els.map(e=>[e.bid,e])),seen=new Set(),c={replace:[],remove:[],move:[],relabel:[],add:[],note:[],link:[]};
 s.els.forEach(e=>{const b=e.bid&&B.get(e.bid);if(!b){c.add.push(e);return}seen.add(e.bid);if(e.type!==b.type)c.replace.push([b,e]);if((e.t??'')!==(b.t??''))c.relabel.push([b,e]);if(['x','y','w','h'].some(k=>Math.abs(e[k]-b[k])>6))c.move.push([b,e]);if((e.note||'')!==(b.note||''))c.note.push(e);if(e.link&&scrName(e.link))c.link.push(e)});
 s.base.els.forEach(b=>{if(!seen.has(b.bid))c.remove.push(b)});return c}
const changeCount=c=>c?Object.values(c).reduce((a,v)=>a+v.length,0):0;
function describeChanges(s,head){const c=changesOf(s),[fw,fh]=frameSize(s),nm=e=>`${EM[e.type]?.n||e.type} [${e.type}]${e.t?` "${short(e.t,60)}"`:''}`,where=e=>`${panelOf(e,s)?`in ${panelOf(e,s)}`:region(e,fw,fh)} (x ${e.x}, y ${e.y}, ${e.w}×${e.h}px)`,L=[];
 let t=`${head}\nThis page already exists: ${s.base.title}${s.base.url?` (${s.base.url})`:''}, captured ${new Date(s.base.at).toLocaleDateString()}.\nKeep everything that isn’t listed below as it is. Positions are px in a ${FR[s.frame][2].toLowerCase()} frame ${fw}px wide.\n`;
 if(s.notes)t+=`Goal: ${s.notes}\n`;if(P.style?.s||okHex(P.style?.a))t+=`Visual style: ${styName(P.style).n}${okHex(P.style?.a)?`, accent ${P.style.a}`:''}\n`;
 const sec=(title,list,fmt)=>{if(list.length)L.push(`\n${title}:\n`+list.map(x=>'- '+fmt(x)).join('\n'))};
 sec('Replace',c.replace,([b,e])=>`${nm(b)} ${where(b)} → ${EM[e.type].n} [${e.type}]${e.t?` "${short(e.t,60)}"`:''}`);
 sec('Remove',c.remove,b=>`${nm(b)} ${where(b)}`);
 sec('Move or resize',c.move,([b,e])=>`${nm(e)}: from ${where(b)} to ${where(e)}`);
 sec('Change text',c.relabel,([b,e])=>`${EM[e.type].n} [${e.type}]: "${short(b.t||'',60)}" → "${short(e.t||'',60)}"`);
 sec('Add',c.add,e=>`${nm(e)} ${where(e)}${e.note?`. Note: ${e.note}`:''}${e.link&&scrName(e.link)?`. When clicked: ${e.link==='@back'?'go back':`open "${scrName(e.link)}"`}`:''}`);
 sec('Notes',c.note,e=>`${nm(e)}: ${e.note||'(note removed)'}`);
 sec('Links',c.link.filter(e=>!c.add.includes(e)),e=>`${nm(e)} → ${e.link==='@back'?'goes back':`opens "${scrName(e.link)}"`}`);
 t+=L.length?L.join('\n')+'\n':'\nNo changes yet.\n';
 const pick=e=>({type:e.type,name:EM[e.type]?.n,label:e.t,x:e.x,y:e.y,w:e.w,h:e.h,...(e.note?{note:e.note}:{})});
 return {text:t,data:{page:s.name,existing:{title:s.base.title,url:s.base.url},frame:{type:s.frame,width:fw},changes:{replace:c.replace.map(([b,e])=>({from:pick(b),to:pick(e)})),remove:c.remove.map(pick),move:c.move.map(([b,e])=>({element:pick(e),from:{x:b.x,y:b.y,w:b.w,h:b.h}})),relabel:c.relabel.map(([b,e])=>({element:pick(e),from:b.t})),add:c.add.map(pick),notes:c.note.map(e=>({element:pick(e),note:e.note||''})),links:c.link.map(e=>({element:pick(e),to:e.link==='@back'?'(back)':scrName(e.link)}))}}}}
// changes for imported pages, full descriptions for new ones
function describeDelta(...a){return withCustoms(describeDeltaBase(...a),P.screens)}
function describeDeltaBase(){const parts=P.screens.map((s,i)=>s.base?describeChanges(s,`PAGE ${i+1} of ${P.screens.length}: "${s.name}" (existing page: changes only)`):describeScreen(s,`PAGE ${i+1} of ${P.screens.length}: "${s.name}" (new page: build it)`));const fl=flowList();let t=`CHANGES TO "${P.name}"\n${P.screens.filter(s=>s.base).length} existing page${P.screens.filter(s=>s.base).length===1?'':'s'} to update${P.screens.some(s=>!s.base)?`, ${P.screens.filter(s=>!s.base).length} new`:''}.\n`;if(fl.length)t+=`\nFLOW:\n`+fl.map(f=>`- ${f.from} › ${f.element} → ${f.to}`).join('\n')+'\n';t+=parts.map(p=>`\n${'='.repeat(48)}\n${p.text}`).join('');return {text:t,json:JSON.stringify({name:P.name,pages:parts.map(p=>p.data),flow:fl},null,1)}}
function restoreOriginal(e){const b=M.base?.els.find(x=>x.bid===e.bid);if(!b)return;pushUndo();Object.assign(e,{type:b.type,x:b.x,y:b.y,w:b.w,h:b.h});if(b.t!=null)e.t=b.t;else delete e.t;if(b.note)e.note=b.note;else delete e.note;drawAll();toast('Restored to the original')}
function restoreRemoved(bid){const b=M.base?.els.find(x=>x.bid===bid);if(!b)return;pushUndo();M.els.push({...JSON.parse(JSON.stringify(b)),uid:uid()});drawAll();toast(`${EM[b.type].n} is back`)}
// Replace with…: keep the place, size and label, change what it is
function openReplace(e){const d=EM[e.type],fam=E.filter(x=>x.id!==e.type&&(x.v===(d.v||d.id)||x.id===d.v)).map(x=>x.id),near=[...new Set([...fam,...(d.x||[]),...E.filter(x=>x.c===d.c).map(x=>x.id)])].filter(id=>id!==e.type&&EM[id]);const m=showModal(`Replace “${d.n}”`,`<p class="mlead">Pick what this should be instead. It keeps its place, size, label and links.</p><input class="inp" id="rpQ" type="search" placeholder="Search all ${E.length} elements…" autocomplete="off"><div class="rpgrid" id="rpList"></div>`,'wide');
 const draw=()=>{const q=$('#rpQ').value.trim();const ids=q?E.filter(x=>x.id!==e.type&&match(x,q)).map(x=>x.id):near;$('#rpList').innerHTML=ids.slice(0,48).map(id=>{const x=EM[id];return `<button class="rp" data-rp="${id}"><div class="stage">${specHTML(x,180,96)}</div><b>${x.n}</b><span class="k">${x.id}</span></button>`}).join('')||'<p class="mlead">No matches</p>'};draw();$('#rpQ').oninput=draw;setTimeout(()=>$('#rpQ')?.focus(),0);
 m.addEventListener('click',ev=>{const b=ev.target.closest('[data-rp]');if(!b)return;pushUndo();const was=EM[e.type].n;e.type=b.dataset.rp;closeOverlay();syncLinked([e]);drawAll();toast(`${was} → ${EM[e.type].n}`)})}
