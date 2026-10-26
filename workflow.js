'use strict';
window.ClaimWorkflow=(()=>{
 let sequence=0;
 const resolutions=['Kunden accepterer forklaringen','Aftalt løsning uden retur','Retur oprettet i BC','Anden løsning'];
 const normalize=s=>['Ny','Under behandling','Afventer','Afventer oplysninger'].includes(s)?'Åben':s;
 function editor(record,onChange=()=>{}){
  const el=claimEl,box=el('section','summary-card workflow-editor'),state=record.workflow||{status:normalize(record.status)==='Afsluttet'?'Afsluttet':'Åben',nextAction:record.nextAction||'',actionOwnerId:record.actionOwnerId||record.sellerId||'office',followupDate:record.followupDate||'',resolution:record.resolution||'',resolutionNote:record.resolutionNote||''};state.status=normalize(state.status);record.workflow=state;
  box.append(el('h3','','Hvad skal der ske med sagen?'));
  const status=claimField(['workflowStatus','Sagens status','select',['Åben','Afsluttet']],{workflowStatus:state.status},(_,v)=>{state.status=v;sync();onChange();});
  const reopening=normalize(record.status)==='Afsluttet';const reason=claimField(['reopenReason','Hvorfor genåbnes sagen?','textarea'],{},(_,v)=>{state.reason=v;onChange();});
  const next=claimField(['nextAction','Næste handling / hvad afventer vi?','textarea'],state,(k,v)=>{state[k]=v;onChange();});
  const owner=claimField(['actionOwnerId','Ansvarlig for næste handling','select',[]],{},(k,v)=>{state[k]=v;onChange();}),ownerControl=owner.querySelector('select');ownerControl.replaceChildren();for(const person of [{id:'office',name:'Kontoret'},...(record.sellerId?[{id:record.sellerId,name:record.seller}]:[]),...(record.team||[])]){const o=el('option','',person.name);o.value=person.id;ownerControl.append(o);}if(state.actionOwnerId&&!Array.from(ownerControl.options).some(o=>o.value===state.actionOwnerId)){const o=el('option','',record.actionOwnerName||'Tidligere ansvarlig');o.value=state.actionOwnerId;ownerControl.append(o);}ownerControl.value=state.actionOwnerId||record.sellerId||'office';
 const due=claimField(['followupDate','Opfølgningsdato (valgfri)','date'],state,(k,v)=>{state[k]=v;onChange();});
 const resolution=claimField(['resolution','Hvordan blev sagen løst?','select',resolutions],state,(k,v)=>{state[k]=v;sync();onChange();});
  const number=claimField(['workflowReturnOrder','Returordrenummer i BC','text'],{workflowReturnOrder:record.values.returnOrder||''},(_,v)=>{record.values.returnOrder=v;onChange();});
  const note=claimField(['resolutionNote','Aftale / resultat af gennemgangen','textarea'],state,(k,v)=>{state[k]=v;onChange();});
  const info=el('p','subtle','BC overtager arbejdet ved retur. Sagen kan afsluttes her, når gennemgangen er færdig.');
  const input=number.querySelector('input');input.inputMode='numeric';input.pattern='[0-9]{4}';input.maxLength=4;input.title='4 cifre, fx 0123';
  function sync(){const closed=state.status==='Afsluttet',bc=state.resolution==='Retur oprettet i BC';reason.hidden=!reopening||closed;reason.querySelector('textarea').required=false;next.hidden=owner.hidden=due.hidden=closed;next.querySelector('textarea').required=false;resolution.hidden=note.hidden=!closed;resolution.querySelector('select').required=false;note.querySelector('textarea').required=false;number.hidden=closed&&!!state.resolution&&!bc&&!input.value;input.required=false;info.hidden=!(closed&&bc);}
  box.append(el('p','subtle','Gemning ændrer kun oplysningerne. Vælg Afsluttet, når arbejdet med sagen er færdigt.'),status,reason,next,owner,due,resolution,number,note,info);const prefix='workflow-'+(++sequence)+'-';for(const label of box.querySelectorAll('label')){const control=label.parentElement.querySelector('input,select,textarea');if(control){control.id=prefix+control.id;label.htmlFor=control.id;}}sync();
  return {element:box,value:()=>({...state,returnOrder:record.values.returnOrder||''}),valid:()=>{for(const c of box.querySelectorAll('input,select,textarea'))if(!c.closest('[hidden]')&&!c.reportValidity())return false;return true;}};
 }
 function summary(r,area){const section=claimEl('section','summary-card');section.append(claimEl('h3','',normalize(r.status)==='Afsluttet'?'Afslutning':'Hvad skal der ske?'));const fields=[['nextAction','Næste handling'],['actionOwnerName','Ansvarlig'],['followupDate','Opfølgning'],['resolution','Løsning'],['resolutionNote','Aftale / resultat'],['closedBy','Afsluttet af']];const dl=claimEl('dl');for(const[k,label]of fields)if(r[k])dl.append(claimEl('dt','',label),claimEl('dd',k==='followupDate'&&overdue(r)?'overdue':'',k==='followupDate'?dateLabel(r):r[k]));if(r.closedAt)dl.append(claimEl('dt','','Afsluttet'),claimEl('dd','',new Date(r.closedAt).toLocaleString('da-DK')));section.append(dl);if(!dl.children.length&&!area)section.append(claimEl('p','subtle',normalize(r.status)==='Afsluttet'?'Afsluttet før den nye arbejdsgang.':'Ingen næste handling angivet.'));const v=r.values||{},contacts=claimEl('div','case-quick-contacts');for(const [title,name,phone,email]of [['Slutkunde',v.contact||v.endCustomer,v.phone,v.email],['Forhandler',v.dealerContact||v.customer,v.dealerPhone,v.dealerEmail]]){if(!phone&&!email)continue;const row=claimEl('div');row.append(claimEl('strong','',title+(name?' · '+name:'')));const actions=claimEl('div','contact-actions');for(const [label,value,prefix]of [['Ring',phone,'tel:'],['Mail',email,'mailto:']])if(value){const a=claimEl('a','contact-action',label+' · '+value);a.href=prefix+(prefix==='tel:'?String(value).replace(/[^+0-9]/g,''):encodeURIComponent(value));actions.append(a);}row.append(actions);contacts.append(row);}if(v.address){const a=claimEl('a','contact-action','Åbn navigation');a.href='https://www.google.com/maps/search/?api=1&query='+encodeURIComponent([v.address,v.postcode,v.city].filter(Boolean).join(', '));a.target='_blank';a.rel='noopener';contacts.append(a);}if(contacts.children.length)section.append(contacts);if(area)shortcuts(r,area,section);return section;}
 function suggestion(r){const v=r.values||{};
  if(normalize(r.status)==='Afsluttet')return {label:'Eksportér PDF',target:'pdf',help:'Sagen er afsluttet. Gå til rapportvalget nederst.'};
  if(!v.customer&&!v.endCustomer)return {label:'Udfyld kundeoplysninger',target:'customer',help:'Tilføj kunden og kontaktoplysningerne.'};
  if(!v.visitDate)return {label:'Planlæg besigtigelse',target:'date',help:'Kontakt kunden og aftal en dato. Sagen kan også løses uden besøg.'};
  if(v.assessment?.trim()&&v.proposal?.trim())return {label:'Afrund sagen',target:'finish',help:'Observationer og forslag er udfyldt. Kontrollér, om sagen er klar til afrunding.'};
  return {label:'Dokumentér besigtigelse',target:'document',help:'Registrér observationer og målinger, og tilføj billeder, når besøget gennemføres.'};
 }
 function shortcuts(r,area,section){const v=r.values||{},choice=suggestion(r),box=claimEl('div','case-next-shortcuts');
  if(v.visitDate)box.append(claimEl('p','subtle','Besigtigelse: '+v.visitDate.split('-').reverse().join('.')));
  box.append(claimEl('p','subtle',choice.help));
  const go=target=>{let field;
   if(['customer','date','document'].includes(target)){const details=area.querySelector('.case-edit');if(!details)return;const focus=()=>{field=details.querySelector(target==='date'?'#edit-visitDate':target==='document'?'#edit-assessment':'#edit-customer');if(field){field.scrollIntoView({block:'center',behavior:'smooth'});field.focus({preventScroll:true});}};if(details.open)focus();else{details.addEventListener('toggle',()=>requestAnimationFrame(focus),{once:true});details.open=true;}}
   else {field=area.querySelector(target==='pdf'?'.case-save-actions button:last-child':'.workflow-editor select');if(field){field.scrollIntoView({block:'center',behavior:'smooth'});field.focus({preventScroll:true});}}
  };
  const actions=claimEl('div','contact-actions');const button=(label,target,primary)=>{const b=claimEl('button',primary?'primary':'',label);b.type='button';b.onclick=()=>go(target);actions.append(b);};button(choice.label,choice.target,true);
  if(v.visitDate&&choice.target!=='pdf')button('Ret besøgsdato','date',false);
  if(!v.visitDate&&choice.target!=='pdf')button('Afrund uden besøg','finish',false);
  box.append(actions);section.insertBefore(box,section.querySelector('.case-quick-contacts')); 
 }
 function today(){return new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Copenhagen',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());}
 function overdue(r){return r.status!=='Afsluttet'&&r.followupDate&&r.followupDate<today();}
 function dateLabel(r){const d=r.followupDate;if(!d||r.status==='Afsluttet')return '';return (overdue(r)?'Overskredet · ':d===today()?'I dag · ':'')+d.split('-').reverse().join('.');}
 function compact(r){return [r.actionOwnerName,dateLabel(r)].filter(Boolean).join(' · ');}
 return {editor,summary,suggestion,normalize,overdue,dateLabel,compact};
})();
