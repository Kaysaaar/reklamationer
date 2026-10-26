'use strict';
window.ClaimWorkflow=(()=>{
 let sequence=0;
 const resolutions=['Kunden accepterer forklaringen','Aftalt løsning uden retur','Retur oprettet i BC','Anden løsning'];
 const normalize=s=>['Ny','Under behandling','Afventer','Afventer oplysninger'].includes(s)?'Åben':s;
 function editor(record,onChange=()=>{}){
  const el=claimEl,box=el('section','summary-card workflow-editor'),state=record.workflow||{status:normalize(record.status)==='Afsluttet'?'Afsluttet':'Åben',nextAction:record.nextAction||'',actionOwnerId:record.actionOwnerId||record.sellerId||'office',followupDate:record.followupDate||'',resolution:record.resolution||'',resolutionNote:record.resolutionNote||'',firstContactDate:record.firstContactDate||'',customerInformedDate:record.customerInformedDate||'',waitingFor:record.waitingFor||'',cause:record.cause||''};state.status=normalize(state.status);record.workflow=state;
  box.append(el('h3','','Hvad skal der ske med sagen?'));
  const status=claimField(['workflowStatus','Sagens status','select',['Åben','Afsluttet']],{workflowStatus:state.status},(_,v)=>{state.status=v;sync();onChange();});
  const reopening=normalize(record.status)==='Afsluttet';const reason=claimField(['reopenReason','Hvorfor genåbnes sagen?','textarea'],{},(_,v)=>{state.reason=v;onChange();});
  const next=claimField(['nextAction','Næste handling / hvad afventer vi?','textarea'],state,(k,v)=>{state[k]=v;onChange();});
  const owner=claimField(['actionOwnerId','Ansvarlig for næste handling','select',[]],{},(k,v)=>{state[k]=v;onChange();}),ownerControl=owner.querySelector('select');ownerControl.replaceChildren();for(const person of [{id:'office',name:'Kontoret'},...(record.sellerId?[{id:record.sellerId,name:record.seller}]:[]),...(record.team||[])]){const o=el('option','',person.name);o.value=person.id;ownerControl.append(o);}if(state.actionOwnerId&&!Array.from(ownerControl.options).some(o=>o.value===state.actionOwnerId)){const o=el('option','',record.actionOwnerName||'Tidligere ansvarlig');o.value=state.actionOwnerId;ownerControl.append(o);}ownerControl.value=state.actionOwnerId||record.sellerId||'office';
 const due=claimField(['followupDate','Opfølgningsdato (valgfri)','date'],state,(k,v)=>{state[k]=v;onChange();});
 const resolution=claimField(['resolution','Hvordan blev sagen løst?','select',resolutions],state,(k,v)=>{state[k]=v;sync();onChange();});
  const number=claimField(['workflowReturnOrder','Returordrenummer i BC','text'],{workflowReturnOrder:record.values.returnOrder||''},(_,v)=>{record.values.returnOrder=v;onChange();});
  const note=claimField(['resolutionNote','Aftale / resultat af gennemgangen','textarea'],state,(k,v)=>{state[k]=v;onChange();});
  const firstContact=claimField(['firstContactDate','Kunden kontaktet første gang (dato)','date'],state,(k,v)=>{state[k]=v;onChange();});
 const informed=claimField(['customerInformedDate','Kunden orienteret om resultatet (dato)','date'],state,(k,v)=>{state[k]=v;onChange();});
 for(const [field,key] of [[firstContact,'firstContactDate'],[informed,'customerInformedDate']]){field.querySelector('input').max=today();field.querySelector('input').dataset.process=key;}
 const waitingHint=el('div','workflow-waiting-hint');waitingHint.setAttribute('role','status');
 const waiting=claimField(['waitingFor','Hvem afventer vi? (valgfri)','select',['Kunden','Leverandøren','Wallmann']],state,(k,v)=>{state[k]=v;syncWaiting();onChange();});
 const cause=claimField(['cause','Vurderet årsag (valgfri)','select',['Produktionsfejl','Monteringsforhold','Transportskade','Brug / vedligehold','Ingen fejl konstateret','Uafklaret','Andet']],state,(k,v)=>{state[k]=v;onChange();});
 const contactHelp=el('p','subtle','Registrér kun kontakt, der faktisk har fundet sted. At åbne telefon, mail eller PDF tæller ikke som en sendt besked.');
 const reopenHelp=el('p','subtle','Tidligere afslutning og bilag bevares i historikken. Registreringen af orientering nulstilles, så det nye resultat kan følges op.');
 const info=el('p','subtle','BC overtager arbejdet ved retur. Sagen kan afsluttes her, når gennemgangen er færdig.');
  const review=el('section','workflow-review');
 function focusControl(field){const c=field.querySelector('input,select,textarea');c.scrollIntoView({block:'center',behavior:'smooth'});c.focus({preventScroll:true});}
 function syncWaiting(){waitingHint.replaceChildren();waitingHint.hidden=state.status==='Afsluttet'||!state.waitingFor||!!state.followupDate;if(!waitingHint.hidden){waitingHint.append(el('p','','Aftal en opfølgningsdato, så sagen ikke bliver glemt.'));const b=el('button','','Vælg opfølgningsdato');b.type='button';b.onclick=()=>focusControl(due);waitingHint.append(b);}}
 function syncReview(){review.hidden=state.status!=='Afsluttet';review.replaceChildren(el('h4','','Kontrol før afslutning'),el('p','subtle','Vejledende kontrol. En hurtig sag kan stadig afsluttes uden at udfylde alt.'));
 for(const [ok,text,field] of [[state.resolution,'Hvordan blev sagen løst?',resolution],[state.resolutionNote?.trim(),'Hvad blev aftalt, og hvem gør hvad?',note],[state.customerInformedDate,'Er kunden orienteret om resultatet?',informed]]){const row=el('div','review-row');row.append(el('span','',ok?'Registreret · '+text:'Kontrollér · '+text));const b=el('button','text-button',ok?'Se / ret':'Udfyld');b.type='button';b.onclick=()=>focusControl(field);row.append(b);review.append(row);}}
 box.addEventListener('input',()=>{syncWaiting();syncReview();});box.addEventListener('change',()=>{syncWaiting();syncReview();});
 const input=number.querySelector('input');input.inputMode='numeric';input.pattern='[0-9]{4}';input.maxLength=4;input.title='4 cifre, fx 0123';
  function sync(){const closed=state.status==='Afsluttet',bc=state.resolution==='Retur oprettet i BC';reason.hidden=!reopening||closed;reason.querySelector('textarea').required=reopening&&!closed;reopenHelp.hidden=!reopening||closed;waiting.hidden=closed;informed.hidden=!closed;informed.querySelector('input').disabled=!closed;cause.hidden=!closed;next.hidden=owner.hidden=due.hidden=closed;next.querySelector('textarea').required=false;resolution.hidden=note.hidden=!closed;resolution.querySelector('select').required=false;note.querySelector('textarea').required=false;number.hidden=closed&&!!state.resolution&&!bc&&!input.value;input.required=false;info.hidden=!(closed&&bc);syncWaiting();syncReview();}
  box.append(el('p','subtle','Gemning ændrer kun oplysningerne. Vælg Afsluttet, når arbejdet med sagen er færdigt.'),status,reason,reopenHelp,firstContact,contactHelp,next,waiting,owner,due,waitingHint,review,resolution,cause,number,note,informed,info);const prefix='workflow-'+(++sequence)+'-';for(const label of box.querySelectorAll('label')){const control=label.parentElement.querySelector('input,select,textarea');if(control){control.id=prefix+control.id;label.htmlFor=control.id;}}sync();
  return {element:box,value:()=>({...state,returnOrder:record.values.returnOrder||''}),valid:()=>{for(const c of box.querySelectorAll('input,select,textarea'))if(!c.closest('[hidden]')&&!c.reportValidity())return false;return true;}};
 }
 function summary(r,area){const section=claimEl('section','summary-card');section.append(claimEl('h3','',normalize(r.status)==='Afsluttet'?'Afslutning':'Hvad skal der ske?'));const fields=[['nextAction','Næste handling'],['actionOwnerName','Ansvarlig'],['followupDate','Opfølgning'],['resolution','Løsning'],['resolutionNote','Aftale / resultat'],['closedBy','Afsluttet af'],['firstContactDate','Første kundekontakt'],['waitingFor','Afventer'],['customerInformedDate','Kunden orienteret om resultatet'],['cause','Vurderet årsag']];const dl=claimEl('dl');for(const[k,label]of fields)if(r[k])dl.append(claimEl('dt','',label),claimEl('dd',k==='followupDate'&&overdue(r)?'overdue':'',k==='followupDate'?dateLabel(r):['firstContactDate','customerInformedDate'].includes(k)?r[k].split('-').reverse().join('.'):r[k]));if(r.closedAt)dl.append(claimEl('dt','','Afsluttet'),claimEl('dd','',new Date(r.closedAt).toLocaleString('da-DK')));section.append(dl);if(!dl.children.length&&!area)section.append(claimEl('p','subtle',normalize(r.status)==='Afsluttet'?'Afsluttet før den nye arbejdsgang.':'Ingen næste handling angivet.'));const v=r.values||{},contacts=claimEl('div','case-quick-contacts');for(const [title,name,phone,email]of [['Slutkunde',v.contact||v.endCustomer,v.phone,v.email],['Forhandler',v.dealerContact||v.customer,v.dealerPhone,v.dealerEmail]]){if(!phone&&!email)continue;const row=claimEl('div');row.append(claimEl('strong','',title+(name?' · '+name:'')));const actions=claimEl('div','contact-actions');for(const [label,value,prefix]of [['Ring',phone,'tel:'],['Mail',email,'mailto:']])if(value){const a=claimEl('a','contact-action',label+' · '+value);a.href=prefix+(prefix==='tel:'?String(value).replace(/[^+0-9]/g,''):encodeURIComponent(value));actions.append(a);}row.append(actions);contacts.append(row);}if(v.address){const a=claimEl('a','contact-action','Åbn navigation');a.href='https://www.google.com/maps/search/?api=1&query='+encodeURIComponent([v.address,v.postcode,v.city].filter(Boolean).join(', '));a.target='_blank';a.rel='noopener';contacts.append(a);}if(contacts.children.length)section.append(contacts);if(area){section.dataset.caseNumber=r.caseNumber||r.id;shortcuts(r,area,section);window.ClaimHelpers?.mount(r,section,target=>goTo(area,target));}return section;}
 function suggestion(r){const v=r.values||{};
  if(normalize(r.status)==='Afsluttet')return {label:'Eksportér PDF',target:'pdf',help:'Sagen er afsluttet. Lav kundens rapport, og send den efter gennemgang. Eksport sender ikke automatisk rapporten til kunden.'};
  if(r.waitingFor)return {label:'Følg op på næste handling',target:'followup',help:'Sagen afventer '+r.waitingFor.toLocaleLowerCase('da')+'. '+(r.followupDate?'Brug den aftalte opfølgningsdato til at holde sagen i gang.':'Aftal en opfølgningsdato, så sagen ikke bliver glemt.')};
  if(!v.customer&&!v.endCustomer)return {label:'Udfyld kundeoplysninger',target:'customer',help:'Tilføj kunden og kontaktoplysningerne.'};
  if(![v.phone,v.email,v.dealerPhone,v.dealerEmail].some(value=>String(value||'').trim()))return {label:'Tilføj kontaktoplysninger',target:'contact',help:'Der mangler telefon og mail til både kunde og forhandler. Tilføj en kontakt, så næste medarbejder kan komme videre.'};
  if(v.inspectionPlace==='Uden besøg')return {label:v.assessment?.trim()&&v.proposal?.trim()?'Afrund sagen':'Dokumentér vurderingen',target:v.assessment?.trim()&&v.proposal?.trim()?'finish':'document',help:'Sagen behandles uden besøg. Registrér vurderingen ud fra telefon, mail og billeder. Aftal derefter løsningen med kunden.'};
  if(!v.visitDate)return {label:'Planlæg besigtigelse',target:'date',help:'Kontakt kunden og aftal en dato. Sagen kan også løses uden besøg.'};
  if(v.visitDate>today())return {label:'Forbered besigtigelse',target:'document',help:'Besøget er planlagt. Gennemgå sagen og aftalen med kunden. En besøgsdato betyder ikke, at besøget er gennemført.'};
  if(v.assessment?.trim()&&v.proposal?.trim())return {label:'Afrund sagen',target:'finish',help:'Observationer og forslag er udfyldt. Kontrollér, om sagen er klar til afrunding.'};
  if(v.visitDate<today())return {label:'Følg op på besigtigelse',target:'document',help:'Besøgsdatoen er passeret. Tilføj den manglende dokumentation, eller ret datoen, hvis besøget er flyttet.'};
  return {label:'Dokumentér besigtigelse',target:'document',help:'Registrér observationer og målinger, og tilføj billeder, når besøget gennemføres.'};
 }
 function shortcuts(r,area,section){const v=r.values||{},choice=suggestion(r),box=claimEl('div','case-next-shortcuts');
  if(v.visitDate&&v.inspectionPlace!=='Uden besøg')box.append(claimEl('p','subtle','Besigtigelse: '+v.visitDate.split('-').reverse().join('.')));
  if(overdue(r))box.append(claimEl('p','overdue','Opfølgningen er overskredet. Kontrollér næste handling og aftal en ny opfølgningsdato.'));
  box.append(claimEl('p','subtle',choice.help));
  const go=target=>goTo(area,target);
  const actions=claimEl('div','contact-actions');const button=(label,target,primary)=>{const b=claimEl('button',primary?'primary':'',label);b.type='button';b.onclick=()=>go(target);actions.append(b);};button(choice.label,choice.target,true);
  if(!r.firstContactDate&&choice.target!=='pdf')button('Registrér kundekontakt','contactLog',false);
  if(choice.target==='pdf'&&!r.customerInformedDate)button('Registrér orientering til kunden','informed',false);
  if(v.visitDate&&choice.target!=='pdf')button('Ret besøgsdato','date',false);
  if(choice.target!=='pdf')button(v.inspectionPlace==='Uden besøg'?'Ændr gennemgang':'Besøg ikke nødvendigt','visitMode',false);
  box.append(actions);section.insertBefore(box,section.querySelector('.case-quick-contacts')); 
 }
 function goTo(area,target){
 const ids={customer:'customer',contact:'phone',date:'visitDate',document:'assessment',visitMode:'inspectionPlace',product:'product',batch:'batch'};
 if(ids[target]){const details=area.querySelector('.case-edit');if(!details)return;const focus=()=>{const f=details.querySelector('#edit-'+ids[target]);if(f){f.scrollIntoView({block:'center',behavior:'smooth'});f.focus({preventScroll:true});}};if(details.open)focus();else{details.addEventListener('toggle',()=>requestAnimationFrame(focus),{once:true});details.open=true;}return;}
 const selectors={followup:'.workflow-editor textarea[id$=nextAction]',contactLog:'.workflow-editor [data-process=firstContactDate]',informed:'.workflow-editor [data-process=customerInformedDate]',pdf:'.case-save-actions button:last-child',finish:'.workflow-editor select'};
 const f=area.querySelector(selectors[target]||selectors.finish);if(f){f.scrollIntoView({block:'center',behavior:'smooth'});f.focus({preventScroll:true});}
 }
 function today(){return new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Copenhagen',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());}
 function overdue(r){return r.status!=='Afsluttet'&&r.followupDate&&r.followupDate<today();}
 function dateLabel(r){const d=r.followupDate;if(!d||r.status==='Afsluttet')return '';return (overdue(r)?'Overskredet · ':d===today()?'I dag · ':'')+d.split('-').reverse().join('.');}
 function compact(r){return [r.actionOwnerName,dateLabel(r)].filter(Boolean).join(' · ');}
 return {editor,summary,suggestion,normalize,overdue,dateLabel,compact};
})();
