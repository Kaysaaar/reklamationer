'use strict';
window.ClaimWorkflow=(()=>{
 let sequence=0;
 const resolutions=['Kunden accepterer forklaringen','Aftalt løsning uden retur','Retur oprettet i BC','Anden løsning'];
 const normalize=s=>s==='Ny'||s==='Under behandling'?'Åben':s==='Afventer oplysninger'?'Afventer':s;
 function editor(record,onChange=()=>{}){
  const el=claimEl,box=el('section','summary-card workflow-editor'),state=record.workflow||{status:normalize(record.status)==='Afsluttet'?'Afsluttet':normalize(record.status)==='Afventer'?'Afventer':'Åben',nextAction:record.nextAction||'',resolution:record.resolution||'',resolutionNote:record.resolutionNote||''};record.workflow=state;
  box.append(el('h3','','Hvad skal der ske med sagen?'));
  const status=claimField(['workflowStatus','Gem sagen som','select',['Åben','Afventer','Afsluttet']],{workflowStatus:state.status},(_,v)=>{state.status=v;sync();onChange();});
  const next=claimField(['nextAction','Næste handling / hvad afventer vi?','textarea'],state,(k,v)=>{state[k]=v;onChange();});
  const resolution=claimField(['resolution','Hvordan blev sagen løst?','select',resolutions],state,(k,v)=>{state[k]=v;sync();onChange();});
  const number=claimField(['workflowReturnOrder','Returordrenummer i BC','text'],{workflowReturnOrder:record.values.returnOrder||''},(_,v)=>{record.values.returnOrder=v;onChange();});
  const note=claimField(['resolutionNote','Aftale / resultat af gennemgangen','textarea'],state,(k,v)=>{state[k]=v;onChange();});
  const info=el('p','subtle','BC overtager arbejdet ved retur. Sagen kan afsluttes her, når gennemgangen er færdig.');
  const input=number.querySelector('input');input.inputMode='numeric';input.pattern='[0-9]{4}';input.maxLength=4;input.title='4 cifre, fx 0123';
  function sync(){const closed=state.status==='Afsluttet',bc=state.resolution==='Retur oprettet i BC';next.hidden=closed;next.querySelector('textarea').required=state.status==='Afventer';resolution.hidden=note.hidden=!closed;resolution.querySelector('select').required=closed;note.querySelector('textarea').required=closed;input.required=closed&&bc;info.hidden=!(closed&&bc);}
  box.append(status,next,resolution,number,note,info);const prefix='workflow-'+(++sequence)+'-';for(const label of box.querySelectorAll('label')){const control=label.parentElement.querySelector('input,select,textarea');if(control){control.id=prefix+control.id;label.htmlFor=control.id;}}sync();
  return {element:box,value:()=>({...state,returnOrder:record.values.returnOrder||''}),valid:()=>{for(const c of box.querySelectorAll('input,select,textarea'))if(!c.closest('[hidden]')&&!c.reportValidity())return false;return true;}};
 }
 function summary(r){const section=claimEl('section','summary-card');section.append(claimEl('h3','',normalize(r.status)==='Afsluttet'?'Afslutning':'Næste handling'));const fields=[['nextAction','Næste handling'],['resolution','Løsning'],['resolutionNote','Aftale / resultat'],['closedBy','Afsluttet af']];const dl=claimEl('dl');for(const[k,label]of fields)if(r[k])dl.append(claimEl('dt','',label),claimEl('dd','',r[k]));if(r.closedAt)dl.append(claimEl('dt','','Afsluttet'),claimEl('dd','',new Date(r.closedAt).toLocaleString('da-DK')));section.append(dl);if(!dl.children.length)section.append(claimEl('p','subtle',normalize(r.status)==='Afsluttet'?'Afsluttet før den nye arbejdsgang.':'Ingen næste handling angivet.'));return section;}
 return {editor,summary,normalize};
})();
