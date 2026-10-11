// UI Field Guide · start-up. Loaded last: the other files define things and wire events; this draws the app.
/* ---------- boot ---------- */
booted=true;buildRail();drawLibSty();drawLib();drawTray();drawPal();pullLinked();drawGroupsBar();setFlow(false);
$('#tabAI').innerHTML=I('sparkle',14)+'Design with AI';
const startHash=location.hash.replace('#','');setMode(startHash==='design'?'ai':startHash==='builder'||startHash==='library'?startHash:(LS.get('uifg.mode','library')));
