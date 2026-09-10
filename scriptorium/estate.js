'use strict';
// Room navigation reuses the existing desk/page transition and keeps each practice's draft.
const practiceStates = new Map();
let practiceId = 'scriptorium', roomChangeToken = 0, animaticTimer = null;
let playing = false, selectedFrame = 0, marketFilter = 'All', selectedStudy = 'threshold';
let selectedRuns = 'both';
const makerKey = 'seitiate-makers-demo-v1';
let maker = {version:1, collected:[], frames:[
 {studyId:'threshold',caption:'A place is waiting.',duration:3},
 {studyId:'light',caption:'Someone begins to make something.',duration:3},
 {studyId:'evening',caption:'An idea finds its next conversation.',duration:3}
]};
try {
 const saved=JSON.parse(localStorage.getItem(makerKey)||'null');
 if(saved?.version===1 && Array.isArray(saved.frames) && saved.frames.length){
   const valid=saved.frames.filter(f=>studyCatalog.some(s=>s.id===f.studyId)&&typeof f.caption==='string'&&Number.isFinite(f.duration)&&f.duration>=2&&f.duration<=8);
   if(valid.length) maker={version:1,frames:valid,collected:Array.isArray(saved.collected)?saved.collected.filter(id=>studyCatalog.some(s=>s.id===id)):[]};
 }
} catch { /* A fresh maker sketch is still available if browser storage is unavailable. */ }
const studyById=id=>studyCatalog.find(s=>s.id===id)||studyCatalog[0];
const special=document.createElement('section');special.id='specialSurface';special.hidden=true;
$('.desk-layout').after(special);
const researchFigure=document.createElement('section');researchFigure.id='researchFigure';researchFigure.hidden=true;
$('#editor').before(researchFigure);
const specialSave=document.createElement('span');specialSave.id='specialSave';specialSave.hidden=true;
$('#saveState').after(specialSave);

function saveMaker(){
 try{localStorage.setItem(makerKey,JSON.stringify(maker));$('#specialSave').textContent='Saved on this device';}
 catch{$('#specialSave').textContent='Not saved · export to keep this sketch';}
}
function rememberPractice(){practiceStates.set(practiceId,{docs,activeId,savedAt,saveAvailable});persist();}
function usePractice(id){
 if(id===practiceId)return;
 rememberPractice();practiceId=id;storageKey=id==='laboratory'?'seitiate-laboratory-demo-v1':'estate-scriptorium-demo-v1';
 const remembered=practiceStates.get(id);
 if(remembered){({docs,activeId,savedAt,saveAvailable}=remembered);}
 else {
  const originals=id==='laboratory'?researchDocs:initialDocs;
  docs=structuredClone(originals);activeId='chapter-1';savedAt=null;saveAvailable=true;
  try{const saved=JSON.parse(localStorage.getItem(storageKey)||'null');if(saved?.version===1&&Array.isArray(saved.docs)){
   docs=originals.map(d=>{const s=saved.docs.find(x=>x.id===d.id);return s&&typeof s.text==='string'&&typeof s.suggestion==='string'?{...d,text:s.text,suggestion:s.suggestion,disposition:['pending','accepted','dismissed'].includes(s.disposition)?s.disposition:'pending'}:{...d};});savedAt=saved.savedAt;
  }}catch{saveAvailable=false;}
 }
 renderDocument();
}
function refreshPractice(){
 const lab=roomId==='laboratory';
 $('.manuscript-eyebrow').textContent=lab?'RESEARCH NOTEBOOK · SYNTHETIC DATA':'THE UNFINISHED CITY';
 $('.binder-section-label').textContent=lab?'RESEARCH NOTEBOOK':'MANUSCRIPT';
 $('.studio-eyebrow').textContent=lab?'INTERPRETATION & NEXT STEPS':'A SCENE TO THINK WITH';
 $('.result-label').textContent=lab?'A POSSIBLE NEXT STEP':'A POSSIBLE ENDING';
 $('.studio-pane .pane-title').innerHTML=lab?'Analysis <span>02</span>':'Studio <span>02</span>';
 $('[data-resource="sources"] small').textContent=lab?'0':'2';
 $('[data-resource="evidence"] small').textContent=lab?'2':'—';
 $('#heroStudyButton').hidden=lab;$('.study-thumbnails').hidden=lab;
 researchFigure.hidden=!lab;if(lab)renderResearchFigure();
}
function prepareSurface(){
 const r=currentRoom(),isSpecial=roomId==='makers'||roomId==='marketplace';
 workspace.classList.remove('focus-mode');$('#focusButton').textContent='Focus';$('#focusButton').setAttribute('aria-pressed','false');
 workspace.classList.toggle('special-mode',isSpecial);
 $('.desk-layout').hidden=isSpecial;$('.mobile-tabs').hidden=isSpecial;
 special.hidden=!isSpecial;$('#focusButton').hidden=isSpecial;$('#resetButton').hidden=isSpecial;
 $('#wordCount').hidden=isSpecial;$('#saveState').hidden=isSpecial;specialSave.hidden=!isSpecial;
 $('.rail-privacy').textContent=isSpecial?'◇ Local collection':'◇ Private draft';
 $('#downloadButton').hidden=roomId==='marketplace';
 $('.desk-identity').innerHTML=`<span class="emblem">✳</span><span>${esc(r.station)}<small>${esc(r.name)}</small></span>`;
 workspace.setAttribute('aria-label',r.station);
 if(isSpecial){specialSave.textContent='This collection stays on this device';if(roomId==='makers')renderMaker();else renderMarket();}
 else{usePractice(roomId);refreshPractice();}
}
const originalExport=$('#downloadButton').onclick;
$('#downloadButton').onclick=()=>{
 if(roomId!=='makers'){originalExport();return;}
 stopTour();stopAnimatic();
 const text=maker.frames.map((f,i)=>`${i+1}. ${studyById(f.studyId).title} · ${f.duration}s\n${f.caption}`).join('\n\n');
 const url=URL.createObjectURL(new Blob(['# A Place to Begin\n\nStill-frame storyboard\n\n'+text],{type:'text/markdown'}));
 const a=document.createElement('a');a.href=url;a.download='seitiate-storyboard.md';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
};
function renderRoomLabels(){
 const r=currentRoom();document.body.dataset.place=roomId;
 $('#worldCaption h1').textContent=r.name;$('#worldCaption .eyebrow').textContent=r.practice.toUpperCase()+' · SEITIATE';
 $('#sceneDescription').textContent=r.description;world.setAttribute('aria-label',r.name);
 $('#deskHotspot').setAttribute('aria-label','Approach '+r.station.toLowerCase());
 $('#deskHotspot .hotspot-label').innerHTML=esc(r.station)+'<span>Approach ↗</span>';
 $('#openPageButton').innerHTML=esc(r.action)+' <span>↗</span>';$('#deskPrompt > span').textContent=r.invitation;
 $('[data-go="page"]').innerHTML='<span>03</span> '+esc(r.page);
 $('#previousRoom').innerHTML=`<span>← ${esc(rooms[r.previous].short)}</span><small>Through the previous doorway</small>`;
 $('#nextRoom').innerHTML=`<span>${esc(rooms[r.next].short)} →</span><small>${esc(r.passage)}</small>`;
 $('#previousRoom').onclick=()=>enterRoom(r.previous);$('#nextRoom').onclick=()=>enterRoom(r.next);
 $('#placesGrid').innerHTML=Object.entries(rooms).map(([id,p])=>`<button class="place-card ${id===roomId?'current':''}" data-place="${id}" ${id===roomId?'aria-current="location"':''}><img src="assets/${p.image}" alt=""><span><small>${p.practice}</small><strong>${p.short}</strong><em>${id===roomId?'You are here':p.description}</em></span></button>`).join('');
 $$('#placesGrid button[data-place]').forEach(b=>b.onclick=async()=>{$('#placesDialog').close();await enterRoom(b.dataset.place);});
 updateNavigation();
}
function preloadRoom(r){
 return new Promise((resolve,reject)=>{const img=new Image();const timer=setTimeout(()=>reject(new Error('Image load timed out')),15000);img.onload=()=>{clearTimeout(timer);resolve();};img.onerror=()=>{clearTimeout(timer);reject(new Error('Image failed to load'));};img.src='assets/'+r.image;});
}
async function enterRoom(id,fromTour=false){
 if(!Object.hasOwn(rooms,id)||document.documentElement.classList.contains('gated'))return;
 if(!fromTour)stopTour();
 stopAnimatic();$('#placesDialog').close();
 if(document.body.classList.contains('changing-room'))return;
 const token=++roomChangeToken;
 if(view!=='room')await go('room',fromTour);
 if(fromTour&&!touring)return;
 if(roomId===id){renderRoomLabels();return;}
 document.body.classList.add('changing-room');$('#roomTransition span').textContent=rooms[id].name;
 try {
  await Promise.all([preloadRoom(rooms[id]),delay(reduced?0:550)]);
  if(token!==roomChangeToken||(fromTour&&!touring))return;
  persist();roomId=id;travel=0;targetTravel=0;lookX=0;lookY=0;targetLookX=0;targetLookY=0;
  $('#roomImage').src='assets/'+currentRoom().image;$('#roomImage').alt=currentRoom().alt;
  $('#seatedCamera').style.opacity=0;renderRoomLabels();wake();
  if(id==='scriptorium'||id==='laboratory')usePractice(id);
  await delay(reduced?0:120);
 }catch{if(fromTour)stopTour();toast('This room could not load. Please try the doorway again.');}
 finally{document.body.classList.remove('changing-room');if(!fromTour)$('#deskHotspot').focus({preventScroll:true});}
}
$('#placesButton').onclick=()=>{stopTour();$('#placesDialog').showModal();};
$('#closePlaces').onclick=()=>$('#placesDialog').close();
$('#placesDialog').addEventListener('click',e=>{if(e.target===$('#placesDialog'))$('#placesDialog').close();});

function researchChart(){
 const sets=[{id:'a',label:'Run A',color:'#b87539',values:[0,.34,.63,.79,.89,.93]},{id:'b',label:'Run B',color:'#397d89',values:[0,.13,.31,.49,.60,.68]}];
 const visible=sets.filter(s=>selectedRuns==='both'||s.id===selectedRuns);
 return `<svg viewBox="0 0 540 215" role="img" aria-label="Synthetic response curves over 25 minutes. Run A rises faster and ends at 0.93 arbitrary units; Run B ends at 0.68."><g stroke="#d4ded4" stroke-width="1">${[0,.5,1].map(v=>`<path d="M48 ${170-v*140}H518"/>`).join('')}</g><g fill="#6d807b" font-size="12" font-family="Arial">${[0,.5,1].map(v=>`<text x="15" y="${174-v*140}">${v}</text>`).join('')}${[0,5,10,15,20,25].map((v,i)=>`<text x="${45+i*90}" y="192">${v}</text>`).join('')}<text x="445" y="212">Time (min)</text><text x="48" y="18">Response (a.u.)</text></g>${visible.map(s=>`<polyline fill="none" stroke="${s.color}" stroke-width="3" points="${s.values.map((v,i)=>`${48+i*90},${170-v*140}`).join(' ')}"/>${s.values.map((v,i)=>`<circle cx="${48+i*90}" cy="${170-v*140}" r="4" fill="${s.color}"/>`).join('')}`).join('')}</svg>`;
}
function renderResearchFigure(){
 researchFigure.innerHTML=`<div class="figure-heading"><span>SYNTHETIC RESPONSE CURVES</span><div class="run-switch" role="group" aria-label="Visible sample runs">${[['both','Both'],['a','Run A'],['b','Run B']].map(([id,label])=>`<button data-run="${id}" aria-pressed="${selectedRuns===id}">${label}</button>`).join('')}</div></div>${researchChart()}<p>Illustrative data · no uncertainty estimates · no real experiment</p>`;
 $$('[data-run]').forEach(b=>b.onclick=()=>{stopTour();selectedRuns=b.dataset.run;renderResearchFigure();});
}
function openResearchResource(type){
 if(type==='evidence')openModal('The sample runs',`<p>These values are synthetic, in arbitrary units.</p><table class="data-table"><thead><tr><th>Minute</th><th>Run A</th><th>Run B</th></tr></thead><tbody>${[0,5,10,15,20,25].map((m,i)=>`<tr><td>${m}</td><td>${[0,.34,.63,.79,.89,.93][i]}</td><td>${[0,.13,.31,.49,.60,.68][i]}</td></tr>`).join('')}</tbody></table><p>No instrument, research database or live agent is connected.</p>`);
 else if(type==='sources')openModal('Notebook references','<p>This demonstration has no external scientific sources. The curves and notebook are fictional material for trying the research desk.</p>');
 else openModal('The laboratory study','<img class="large-study" src="assets/laboratory.png" alt="The researcher’s writing desk inside the laboratory"><p class="modal-note">Generated architectural concept artwork.</p>');
}

function renderMaker(){
 selectedFrame=Math.min(selectedFrame,maker.frames.length-1);
 const f=maker.frames[selectedFrame],study=studyById(f.studyId);
 special.innerHTML=`<div class="maker-layout"><aside class="maker-materials"><div class="pane-title">Materials <span>${studyCatalog.length}</span></div><p class="material-help">Choose a study to add a frame.</p><div class="material-list">${studyCatalog.map(s=>`<button data-add-study="${s.id}"><img src="assets/${s.image}" alt=""><span>${esc(s.title)}<small>${maker.collected.includes(s.id)?'From your market collection':'Concept study'} · Add +</small></span></button>`).join('')}</div><button class="outline-button full-width" id="visitMarket">Find something in the market ↗</button></aside><section class="maker-center"><div class="maker-title"><div><span class="studio-eyebrow">A STILL-FRAME STORYBOARD</span><h2>A Place to Begin</h2></div><span class="frame-count">${maker.frames.length} frames · ${maker.frames.reduce((n,f)=>n+f.duration,0)}s</span></div><div class="animatic-stage"><img id="animaticImage" src="assets/${study.image}" alt="${esc(study.title)}"><div id="animaticCaption">${esc(f.caption)}</div><span class="animatic-label">Animatic · still images · no audio</span></div><div class="playback-bar"><button class="amber-button" id="playAnimatic">▷ Play sequence</button><label for="frameScrubber">Frame <span id="currentFrame">${selectedFrame+1}</span></label><input type="range" id="frameScrubber" min="0" max="${maker.frames.length-1}" value="${selectedFrame}" aria-label="Select storyboard frame"></div><div class="timeline" aria-label="Storyboard frames">${maker.frames.map((f,i)=>`<button data-frame="${i}" aria-pressed="${i===selectedFrame}"><img src="assets/${studyById(f.studyId).image}" alt=""><span>${String(i+1).padStart(2,'0')} <small>${f.duration}s</small></span></button>`).join('')}</div></section><aside class="frame-inspector"><div class="pane-title">Frame notes <span>${String(selectedFrame+1).padStart(2,'0')}</span></div><h3>${esc(study.title)}</h3><label for="frameCaption">Words on this frame</label><textarea id="frameCaption" rows="5">${esc(f.caption)}</textarea><label for="frameDuration">Time to linger</label><select id="frameDuration">${[2,3,4,5,6,7,8].map(n=>`<option value="${n}" ${n===f.duration?'selected':''}>${n} seconds</option>`).join('')}</select><div class="reorder-controls"><button id="frameEarlier" class="outline-button" ${selectedFrame===0?'disabled':''}>← Earlier</button><button id="frameLater" class="outline-button" ${selectedFrame===maker.frames.length-1?'disabled':''}>Later →</button></div><button id="removeFrame" class="text-button" ${maker.frames.length===1?'disabled':''}>Remove this frame</button><p class="material-help">Arrange the images, shape the captions, and try the rhythm. Your sequence saves on this device.</p></aside></div>`;
 $$('[data-add-study]').forEach(b=>b.onclick=()=>{stopTour();stopAnimatic();maker.frames.push({studyId:b.dataset.addStudy,caption:studyById(b.dataset.addStudy).note,duration:3});selectedFrame=maker.frames.length-1;saveMaker();renderMaker();});
 $$('[data-frame]').forEach(b=>b.onclick=()=>selectFrame(Number(b.dataset.frame)));
 $('#frameScrubber').oninput=e=>selectFrame(Number(e.target.value));
 $('#frameCaption').oninput=e=>{stopTour();stopAnimatic();maker.frames[selectedFrame].caption=e.target.value;$('#animaticCaption').textContent=e.target.value;saveMaker();};
 $('#frameDuration').onchange=e=>{stopTour();stopAnimatic();maker.frames[selectedFrame].duration=Number(e.target.value);saveMaker();renderMaker();};
 $('#frameEarlier').onclick=()=>moveFrame(-1);$('#frameLater').onclick=()=>moveFrame(1);
 $('#removeFrame').onclick=()=>{if(maker.frames.length===1)return;stopTour();stopAnimatic();maker.frames.splice(selectedFrame,1);selectedFrame=Math.max(0,selectedFrame-1);saveMaker();renderMaker();};
 $('#playAnimatic').onclick=()=>{stopTour();if(playing)stopAnimatic();else startAnimatic();};
 $('#visitMarket').onclick=()=>enterRoom('marketplace');
}
function selectFrame(i){stopTour();stopAnimatic();selectedFrame=Math.max(0,Math.min(maker.frames.length-1,i));renderMaker();}
function moveFrame(delta){const next=selectedFrame+delta;if(next<0||next>=maker.frames.length)return;stopTour();stopAnimatic();[maker.frames[selectedFrame],maker.frames[next]]=[maker.frames[next],maker.frames[selectedFrame]];selectedFrame=next;saveMaker();renderMaker();}
function stopAnimatic(){clearTimeout(animaticTimer);animaticTimer=null;playing=false;special.classList.remove('preview-playing');if($('#playAnimatic'))$('#playAnimatic').textContent='▷ Play sequence';}
function startAnimatic(){
 selectedFrame=0;playing=true;
 const tick=()=>{
  if(!playing||view!=='page'||roomId!=='makers'){stopAnimatic();return;}
  renderMaker();special.classList.add('preview-playing');$('#playAnimatic').textContent='Ⅱ Pause';
  animaticTimer=setTimeout(()=>{if(selectedFrame>=maker.frames.length-1){stopAnimatic();return;}selectedFrame++;tick();},maker.frames[selectedFrame].duration*1000);
 };tick();
}
function renderMarket(){
 const selected=studyById(selectedStudy),collected=maker.collected.includes(selected.id);
 const filtered=studyCatalog.filter(s=>marketFilter==='All'||s.category===marketFilter);
 special.innerHTML=`<div class="market-layout"><section class="market-gallery"><div class="market-heading"><span class="studio-eyebrow">THE EVENING COLLECTION</span><h2>Something to take home.</h2><p>A few visual studies from around the estate. Collect a possibility, then make something of it.</p></div><div class="market-filters" role="group" aria-label="Filter studies">${['All','Spaces','Making','Gathering'].map(c=>`<button data-filter="${c}" aria-pressed="${marketFilter===c}">${c}</button>`).join('')}</div><div class="market-cards">${filtered.map(s=>`<button data-market-study="${s.id}" aria-pressed="${s.id===selectedStudy}"><img src="assets/${s.image}" alt=""><span><small>${s.category}${maker.collected.includes(s.id)?' · Collected ✓':''}</small><strong>${esc(s.title)}</strong></span></button>`).join('')}</div></section><aside class="market-detail"><img src="assets/${selected.image}" alt="${esc(selected.title)}"><span class="studio-eyebrow">${selected.category.toUpperCase()} · CONCEPT ARTWORK</span><h3>${esc(selected.title)}</h3><p>${esc(selected.note)}</p><button id="collectStudy" class="amber-button full-width" ${collected?'disabled':''}>${collected?'In your studio materials ✓':'Collect for your studio +'}</button><button id="takeToStudio" class="outline-button full-width">Go to your makers’ bench ↗</button><p class="market-footnote">A local concept collection. No purchase, message or transaction takes place.</p></aside></div>`;
 $$('[data-filter]').forEach(b=>b.onclick=()=>{stopTour();marketFilter=b.dataset.filter;renderMarket();});
 $$('[data-market-study]').forEach(b=>b.onclick=()=>{stopTour();selectedStudy=b.dataset.marketStudy;renderMarket();});
 $('#collectStudy').onclick=()=>{stopTour();if(!maker.collected.includes(selected.id))maker.collected.push(selected.id);saveMaker();renderMarket();toast('Added to your studio materials.');};
 $('#takeToStudio').onclick=async()=>{await enterRoom('makers');await go('desk');};
}
window.addEventListener('pagehide',stopAnimatic);
document.addEventListener('visibilitychange',()=>{if(document.hidden)stopAnimatic();});
renderRoomLabels();refreshPractice();
// Optional agent navigation uses the same visible doorway action.
if(document.modelContext?.registerTool){try{Promise.resolve(document.modelContext.registerTool({name:'visit_estate_room',title:'Visit an estate room',description:'Travel to the Scriptorium, laboratory, makers studio or marketplace. Preserves locally saved work.',inputSchema:{type:'object',properties:{room:{type:'string',enum:Object.keys(rooms)}},required:['room'],additionalProperties:false},async execute(input){if(!input||Object.keys(input).some(k=>k!=='room')||!Object.hasOwn(rooms,input.room))throw new Error('Choose an available estate room.');await enterRoom(input.room);return{room:roomId};}})).catch(()=>{});}catch{}}
