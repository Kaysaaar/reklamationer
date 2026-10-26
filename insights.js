'use strict';
window.ClaimInsights=(()=>{
 function mount(target){
  const button=claimEl('button','text-button','Erfaringer fra sager');button.type='button';target.append(button);
  button.onclick=async()=>{const el=claimEl,d=el('dialog','case-insights'),close=el('button','','Luk'),content=el('div'),status=el('p','','Henter overblik…');close.type='button';close.onclick=()=>d.close();d.addEventListener('close',()=>d.remove(),{once:true});status.setAttribute('role','status');d.append(close,el('h2','','Erfaringer fra sager'),el('p','subtle','Alle registrerede sager, både åbne og afsluttede. Gentagelser er et signal til undersøgelse og viser ikke i sig selv, at produktet har en fejl.'),status,content);document.body.append(d);d.showModal();
   async function load(){status.textContent='Henter overblik…';content.replaceChildren();try{const result=await ClaimAuth.call('listCases',{insights:true,includeClosed:true});if(!d.isConnected)return;if(!Array.isArray(result.causes))throw Error('Serveren skal opdateres, før erfaringsoversigten kan vises.');status.textContent=result.total+' sager · '+result.closed+' afsluttede';
    for(const [title,rows,note]of [['Produkter · 10 hyppigste',result.products,'Antal sager, ikke antal fejlbehæftede varer.'],['Gentagne produkt / batch-kombinationer',result.batches,'Kun kombinationer med mindst to sager og både produkt og batch udfyldt.'],['Vurderede årsager',result.causes,'Medarbejdernes registrering. Ikke registreret er ikke det samme som ingen fejl.'],['Løsninger',result.resolutions,'Ikke registreret omfatter også sager, der endnu er åbne.']]){const section=el('section','summary-card');section.append(el('h3','',title),el('p','subtle',note));if(!rows.length)section.append(el('p','','Ingen gentagelser registreret.'));else{const table=el('table'),head=el('thead'),hr=el('tr'),body=el('tbody');for(const label of ['Registrering','Sager']){const th=el('th','',label);th.scope='col';hr.append(th);}head.append(hr);for(const row of rows){const tr=el('tr');tr.append(el('td','',row.label),el('td','',String(row.count)));body.append(tr);}table.append(head,body);section.append(table);}content.append(section);}
   }catch(error){if(!d.isConnected)return;status.textContent=error.message||'Overblikket kunne ikke hentes.';const retry=el('button','','Prøv igen');retry.type='button';retry.onclick=load;content.append(retry);}}
   await load();
  };
 }
 return {mount};
})();
