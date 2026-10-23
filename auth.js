'use strict';
window.ClaimAuth=(()=>{
const config=window.CLAIMS_CONFIG||{},remote=!!config.endpoint;let session='',key=null,device=null,initialPage=null;
const expectedRole=location.pathname.endsWith('/office.html')?'office':'seller',appName=expectedRole==='office'?'Kontor':'Sælger',deviceKey='wallmann.claim.device.'+expectedRole,legacyKey='wallmann.claim.device';
function readDevice(name){try{const d=JSON.parse(localStorage.getItem(name));return d&&typeof d.id==='string'&&typeof d.secret==='string'?d:null;}catch(_){return null;}}
function selectedDevice(){const pending=readDevice(deviceKey+'.pending');if(pending)return pending;const own=readDevice(deviceKey);if(own)return own;const legacy=readDevice(legacyKey);return legacy&&(!legacy.role||legacy.role===expectedRole)?legacy:null;}
function rememberRole(user){if(!['seller','office'].includes(user.role))throw Error('Adgangstypen kunne ikke genkendes. Kontakt kontoret.');const entry={...device,role:user.role};localStorage.setItem('wallmann.claim.device.'+user.role,JSON.stringify(entry));const legacy=readDevice(legacyKey);if(legacy?.id===device.id)localStorage.setItem(legacyKey,JSON.stringify(entry));if(user.role!==expectedRole&&readDevice(deviceKey)?.id===device.id)localStorage.removeItem(deviceKey);if(readDevice(deviceKey+'.pending')?.id===device.id)localStorage.removeItem(deviceKey+'.pending');device=entry;}
function random(){return btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(32)))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=/g,'');}
// Receives an authenticated read function. Never retries a write.
async function attachmentTransfer(read,data){
 const hash=async bytes=>{const digest=new Uint8Array(await crypto.subtle.digest('SHA-256',bytes));return btoa(String.fromCharCode(...digest));};
 const decode=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
 const first=await read('getAttachmentPart',{...data,index:0});
 if(!Number.isInteger(first.size)||first.size<1||first.size>20*1024*1024||first.chunkSize!==1024*1024||first.parts!==Math.ceil(first.size/first.chunkSize))throw Error('Filens oplysninger kunne ikke bekræftes.');
 const bytes=new Uint8Array(first.size);
 const accept=async(part,index)=>{const chunk=decode(part.base64),length=Math.min(first.chunkSize,first.size-index*first.chunkSize);if(part.index!==index||part.parts!==first.parts||part.size!==first.size||part.name!==first.name||part.mime!==first.mime||chunk.length!==length||await hash(chunk)!==part.sha256)throw Error('Filen blev ikke hentet korrekt. Prøv igen.');bytes.set(chunk,index*first.chunkSize);};
 await accept(first,0);
 // One request at a time avoids multiplying the load when several people open files.
 for(let index=1;index<first.parts;index++)await accept(await read('getAttachmentPart',{...data,index}),index);
 if(await hash(bytes)!==first.fileHash)throw Error('Filen blev ændret under hentning. Prøv igen.');
 const pieces=[];for(let i=0;i<bytes.length;i+=32768)pieces.push(String.fromCharCode(...bytes.subarray(i,i+32768)));
 return {name:first.name,mime:first.mime,base64:btoa(pieces.join(''))};
}
const pendingReads=new Map(),readActions=new Set(['listCases','getCase','getPhoto','getTimeline','getRevision','getAttachment','getAttachmentPart','getSellers']);
function takeInitialPage(data){
 if(!initialPage)return null;
 if(initialPage.session!==session||Date.now()-initialPage.at>30000){initialPage=null;return null;}
 const allowed=new Set(['paged','includeClosed','limit','offset','attention','query','status','seller','from','to']);
 if(Object.keys(data).some(k=>!allowed.has(k))||data.paged!==true||Number(data.offset||0)!==0||['attention','query','status','seller','from','to'].some(k=>data[k])||Number(data.limit||50)!==(expectedRole==='seller'?5:50)||(expectedRole==='seller'&&data.includeClosed!==true)){initialPage=null;return null;}
 const page=initialPage.page;initialPage=null;return page;
}
function call(action,data={},authenticated=true){
 if(!readActions.has(action)){if(authenticated)initialPage=null;return request(action,data,authenticated);}
 if(action==='listCases'&&authenticated){const page=takeInitialPage(data);if(page)return Promise.resolve(page);}
 const id=JSON.stringify([action,data,authenticated?session:'']);
 if(!pendingReads.has(id)){const promise=(action==='getAttachment'?attachmentTransfer((a,d)=>request(a,d,authenticated),data):request(action,data,authenticated)).finally(()=>pendingReads.delete(id));pendingReads.set(id,promise);}
 return pendingReads.get(id);
}
// Cancellation is restricted to image downloads, never uploads or mutations.
function imageRead(action,data,signal){
 if(!['getPhoto','getAttachment'].includes(action))return Promise.reject(Error('Ugyldig billedhentning.'));
 return action==='getAttachment'?attachmentTransfer((a,d)=>request(a,d,true,signal),data):request(action,data,true,signal);
}
async function request(action,data={},authenticated=true,signal){
 const retryableRead=readActions.has(action);let last;
 for(let attempt=0;attempt<(retryableRead?2:1);attempt++){
  if(signal?.aborted)throw new DOMException('Billedhentningen er afbrudt.','AbortError');
  const controller=new AbortController(),abort=()=>controller.abort();signal?.addEventListener('abort',abort,{once:true});const timeout=setTimeout(()=>controller.abort(),retryableRead?45000:90000);
  try{
   const response=await fetch(config.endpoint,{method:'POST',redirect:'follow',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({action,data,session:authenticated?session:''}),signal:controller.signal});
   if(!response.ok){const e=Error('Serveren kunne ikke kontaktes.');e.transient=response.status>=500||response.status===429;throw e;}
   let result;try{result=await response.json();}catch(_){const e=Error('Serverens svar kunne ikke læses. Prøv igen i samme vindue.');e.transient=true;throw e;}
   if(!result.ok){const e=Error(result.error||'Handlingen kunne ikke udføres.');e.transient=result.retryable===true;throw e;}return result.data;
  }catch(error){if(signal?.aborted)throw new DOMException('Billedhentningen er afbrudt.','AbortError');last=error;if(!retryableRead||attempt||!(error.transient||error.name==='AbortError'||error instanceof TypeError))break;}
  finally{clearTimeout(timeout);signal?.removeEventListener('abort',abort);}
  await new Promise(resolve=>setTimeout(resolve,400));
 }
 if(last.name==='AbortError')throw Error('Serveren svarede ikke i tide. Prøv igen. Hvis du var ved at gemme, skal du bruge Prøv igen i samme vindue, så sagen ikke oprettes dobbelt.');
 if(last instanceof TypeError)throw Error('Forbindelsen til serveren blev afbrudt. Kontrollér internetforbindelsen, og prøv igen i samme vindue.');throw last;
}
async function importKey(raw){return crypto.subtle.importKey('raw',Uint8Array.from(atob(raw.replace(/-/g,'+').replace(/_/g,'/')),c=>c.charCodeAt(0)),{name:'AES-GCM'},false,['encrypt','decrypt']);}
async function encrypt(value){if(!key)throw Error('Åbn appen med din kode først.');const iv=crypto.getRandomValues(new Uint8Array(12)),bytes=new TextEncoder().encode(JSON.stringify(value));return {encrypted:true,iv:[...iv],data:await crypto.subtle.encrypt({name:'AES-GCM',iv},key,bytes)};}
async function decrypt(value){if(!value)return value;if(!key||!value.encrypted)throw Error('Kladden kunne ikke låses op.');const bytes=await crypto.subtle.decrypt({name:'AES-GCM',iv:new Uint8Array(value.iv)},key,value.data);return JSON.parse(new TextDecoder().decode(bytes));}
let resolveReady;const ready=new Promise(r=>resolveReady=r);
if(!remote){resolveReady(null);}else{
document.documentElement.classList.add('auth-locked');
window.addEventListener('DOMContentLoaded',()=>{
const panel=document.createElement('section');panel.className='auth-panel';const heading=document.createElement('h1');heading.textContent='Reklamationer · '+appName;const text=document.createElement('p');text.textContent='Brug din personlige 4-cifrede kode.';const form=document.createElement('form'),pin=document.createElement('input');pin.type='password';pin.inputMode='numeric';pin.pattern='[0-9]{4}';pin.maxLength=4;pin.minLength=4;pin.required=true;pin.autocomplete='current-password';pin.setAttribute('aria-label','Personlig 4-cifret kode');const button=document.createElement('button');button.className='primary';button.textContent='Åbn';const status=document.createElement('p');status.setAttribute('role','alert');const deviceLabel=document.createElement('label'),deviceName=document.createElement('input');deviceLabel.textContent='Navn på denne enhed';deviceName.type='text';deviceName.maxLength=80;deviceName.autocomplete='off';deviceName.placeholder='Fx Claus iPhone eller Claus iPad';deviceName.setAttribute('aria-label','Navn på denne enhed');deviceName.disabled=true;deviceLabel.hidden=true;deviceLabel.append(deviceName);const pinLabel=document.createElement('label');pinLabel.textContent='Personlig 4-cifret kode';pinLabel.append(pin);form.append(deviceLabel,pinLabel,button,status);panel.append(heading,text,form);const help=document.createElement('details'),summary=document.createElement('summary'),info=document.createElement('p');summary.textContent='Glemt kode?';info.textContent='Kontakt kontoret. Administratoren kan erstatte din gamle adgang og give dig et nyt aktiveringslink. Dine indsendte sager bevares. En lokal kladde kan ikke åbnes efter ny aktivering; kontakt kontoret, før du skifter adgang, hvis du har en kladde.';help.append(summary,info);panel.append(help);document.body.append(panel);
const standalone=!!navigator.standalone||!!window.matchMedia?.('(display-mode: standalone)').matches;
const phone=/iPhone|iPad|iPod|Android/i.test(navigator.userAgent||'')||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
let invitation=null,enrollment=null;
const activation=document.createElement('details'),activationTitle=document.createElement('summary'),activationText=document.createElement('p'),linkInput=document.createElement('input'),useLink=document.createElement('button'),activationStatus=document.createElement('p');
activationTitle.textContent='Aktivér appen med et link';activationText.textContent='Indsæt det personlige aktiveringslink fra kontoret. Dine gemte sager findes automatisk.';
linkInput.type='text';linkInput.autocomplete='off';linkInput.setAttribute('aria-label','Aktiveringslink');linkInput.placeholder='Indsæt aktiveringslink';useLink.type='button';useLink.textContent='Fortsæt';activationStatus.setAttribute('role','alert');activation.append(activationTitle,activationText,linkInput,useLink,activationStatus);panel.append(activation);
function beginActivation(value){const url=new URL(value);if(url.origin!==location.origin||!/^\/[a-zA-Z0-9/_-]*(?:index|office)\.html$/.test(url.pathname)&&url.pathname!==location.pathname)throw Error('Indsæt hele aktiveringslinket fra kontoret.');const role=url.pathname.endsWith('/office.html')?'office':'seller';if(role!==expectedRole)throw Error('Dette link er til '+(role==='office'?'kontorappen':'sælgerappen')+'. Åbn den app og indsæt linket dér.');const token=new URLSearchParams(url.hash.slice(1)).get('invitation');if(!/^[A-Za-z0-9_-]{43}$/.test(token||''))throw Error('Linket mangler aktivering. Kopiér hele linket fra kontoret.');invitation=token;enrollment=null;pin.value='';deviceLabel.hidden=false;deviceName.disabled=false;deviceName.required=true;deviceName.value=(new URLSearchParams(url.hash.slice(1)).get('deviceName')||'').replace(/\s+/g,' ').trim().slice(0,80);form.hidden=false;heading.textContent='Aktivér '+appName.toLowerCase()+'appen';text.textContent='Giv enheden et navn, og vælg din personlige 4-cifrede kode. Derefter åbner dine sager.';pin.autocomplete='new-password';button.textContent='Aktivér';activation.open=false;activationStatus.textContent='';linkInput.value='';}
useLink.onclick=()=>{try{beginActivation(linkInput.value.trim());}catch(e){activationStatus.textContent=e.message;}};
device=selectedDevice();if(!device){form.hidden=true;activation.open=true;text.textContent='Velkommen. Aktivér appen én gang med linket fra kontoret.';}
try{const pending=JSON.parse(localStorage.getItem(deviceKey+'.activation'));if(pending?.expectedRole===expectedRole){beginActivation(location.origin+location.pathname+'#invitation='+pending.invitation);enrollment=pending;deviceName.value=pending.label||'';}}catch(_){}
const incoming=new URLSearchParams(location.hash.slice(1)).get('invitation');
const fullLink=incoming?location.href:null;
if(incoming)history.replaceState(null,'',location.pathname+location.search);
if(phone&&!standalone&&(!device||incoming||enrollment)){
 form.hidden=true;activation.hidden=true;help.hidden=true;heading.textContent='Føj først appen til hjemmeskærmen';text.textContent='Vent med at aktivere, til du har åbnet appen fra dens ikon.';
 const guide=document.createElement('section'),steps=document.createElement('ol');guide.className='install-guide';
 for(const value of ['Vælg Del → Føj til hjemmeskærm på iPhone/iPad. På Android: Åbn browserens menu og vælg Installér app eller Føj til startskærm.','Luk browseren, og åbn Reklamationer fra det nye ikon.','Indsæt aktiveringslinket fra kontoret i appen. Giv enheden et navn, og vælg din 4-cifrede kode.']){const li=document.createElement('li');li.textContent=value;steps.append(li);}guide.append(steps);
 const note=document.createElement('p');note.textContent='Det gør du kun én gang. Nye versioner kommer via “Opdatering klar” og kræver ikke et nyt aktiveringslink.';guide.append(note);
 if(fullLink){const copy=document.createElement('button'),copyStatus=document.createElement('p');copy.type='button';copy.textContent='Kopiér aktiveringslink';copy.onclick=async()=>{try{await navigator.clipboard.writeText(fullLink);copyStatus.textContent='Kopieret. Indsæt linket i appen fra hjemmeskærmen.';}catch(_){copyStatus.textContent='Kopiér hele linket her:';const value=document.createElement('textarea');value.readOnly=true;value.value=fullLink;value.setAttribute('aria-label','Aktiveringslink til kopiering');copyStatus.append(value);}};guide.append(copy,copyStatus);}
 const alternative=document.createElement('details'),title=document.createElement('summary'),explain=document.createElement('p'),browserButton=document.createElement('button');title.textContent='Jeg vil bruge browseren i stedet';explain.textContent='Browseren får sin egen adgang. Den følger ikke nødvendigvis med over i appen på hjemmeskærmen.';browserButton.type='button';browserButton.textContent='Fortsæt med aktivering i browseren';browserButton.onclick=()=>{guide.remove();activation.hidden=false;activation.open=true;help.hidden=false;text.textContent='Indsæt dit personlige aktiveringslink.';heading.textContent='Reklamationer · '+appName;if(fullLink){try{beginActivation(fullLink);}catch(e){activationStatus.textContent=e.message;}}else if(enrollment){form.hidden=false;}};alternative.append(title,explain,browserButton);guide.append(alternative);panel.append(guide);
}else if(incoming){try{beginActivation(fullLink);}catch(e){activationStatus.textContent=e.message;activation.open=true;}}
if(standalone&&!device&&!incoming&&!enrollment){text.textContent='Du er nu i appen. Indsæt dit personlige aktiveringslink fra kontoret nedenfor. Det skal kun gøres én gang.';}
form.onsubmit=async event=>{event.preventDefault();button.disabled=true;status.textContent='Åbner…';try{if(invitation){const label=deviceName.value.trim().replace(/\s+/g,' ');if(!label)throw Error('Skriv et navn til enheden, fx Claus iPhone.');if(!enrollment){enrollment={invitation,secret:random(),key:random(),expectedRole,label};}localStorage.setItem(deviceKey+'.activation',JSON.stringify(enrollment));const enrolled=await call('enroll',{...enrollment,pin:pin.value},false);device={id:enrolled.id,secret:enrollment.secret};localStorage.setItem(deviceKey+'.pending',JSON.stringify(device));localStorage.removeItem(deviceKey+'.activation');invitation=null;deviceName.disabled=true;deviceLabel.hidden=true;}const nextSession=random();const user=await call('unlock',{deviceId:device.id,secret:device.secret,pin:pin.value,session:nextSession,home:!new URL(location.href).searchParams.has('case'),expectedRole},false);rememberRole(user);if(user.role!==expectedRole){pin.value='';form.hidden=true;text.textContent='Denne adgang er til '+(user.role==='office'?'kontorappen':'sælgerappen')+'. Du skal bruge et særskilt aktiveringslink til '+(expectedRole==='seller'?'sælgerappen':'kontorappen')+'. Dine gemte sager er bevaret.';const link=document.createElement('a');link.href=user.role==='office'?'office.html?v=1.9.12':'index.html?v=1.9.12';link.textContent=user.role==='office'?'Gå til kontorappen':'Gå til sælgerappen';panel.append(link);return;}session=nextSession;initialPage=user.startup?.page?{page:user.startup.page,session,at:Date.now()}:null;delete user.startup;key=await importKey(user.key);pin.value='';panel.remove();document.documentElement.classList.remove('auth-locked');const actions=document.createElement('div');actions.className='account-actions';if(user.role==='office'&&config.adminUrl){const admin=document.createElement('button');admin.type='button';admin.textContent='Administration';admin.onclick=()=>window.ClaimOfficeAdmin?.open();actions.prepend(admin);}document.querySelector('header').append(actions);resolveReady(user);}catch(error){pin.value='';status.textContent=error.message;}finally{button.disabled=false;}};
});}
return {remote,ready,call,imageRead,encrypt,decrypt};
})();
