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
 function summary(r){const section=claimEl('section','summary-card');section.append(claimEl('h3','',normalize(r.status)==='Afsluttet'?'Afslutning':'Næste handling'));const fields=[['nextAction','Næste handling'],['actionOwnerName','Ansvarlig'],['followupDate','Opfølgning'],['resolution','Løsning'],['resolutionNote','Aftale / resultat'],['closedBy','Afsluttet af']];const dl=claimEl('dl');for(const[k,label]of fields)if(r[k])dl.append(claimEl('dt','',label),claimEl('dd',k==='followupDate'&&overdue(r)?'overdue':'',k==='followupDate'?dateLabel(r):r[k]));if(r.closedAt)dl.append(claimEl('dt','','Afsluttet'),claimEl('dd','',new Date(r.closedAt).toLocaleString('da-DK')));section.append(dl);if(!dl.children.length)section.append(claimEl('p','subtle',normalize(r.status)==='Afsluttet'?'Afsluttet før den nye arbejdsgang.':'Ingen næste handling angivet.'));return section;}
 function today(){return new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Copenhagen',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());}
 function overdue(r){return r.status!=='Afsluttet'&&r.followupDate&&r.followupDate<today();}
 function dateLabel(r){const d=r.followupDate;if(!d||r.status==='Afsluttet')return '';return (overdue(r)?'Overskredet · ':d===today()?'I dag · ':'')+d.split('-').reverse().join('.');}
 function compact(r){return [r.actionOwnerName,dateLabel(r)].filter(Boolean).join(' · ');}
 return {editor,summary,normalize,overdue,dateLabel,compact};
})();
