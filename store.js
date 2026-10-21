'use strict';
window.ClaimStore = (()=>{
  let connection;
  function db(){return connection||(connection=new Promise((resolve,reject)=>{const request=indexedDB.open('wallmann-claims',1);request.onupgradeneeded=()=>{request.result.createObjectStore('records');};request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);}));}
  async function operation(mode,action){const database=await db();return new Promise((resolve,reject)=>{const transaction=database.transaction('records',mode);const store=transaction.objectStore('records');let request;try{request=action(store);}catch(e){reject(e);return;}transaction.oncomplete=()=>resolve(request?.result);transaction.onerror=()=>reject(transaction.error);transaction.onabort=()=>reject(transaction.error||new Error('Lagringen blev afbrudt.'));});}
  return {get:key=>operation('readonly',s=>s.get(key)),put:(key,value)=>operation('readwrite',s=>s.put(value,key)),remove:key=>operation('readwrite',s=>s.delete(key)),all:()=>operation('readonly',s=>s.getAll()),
    async list(){return (await this.all()).filter(x=>x&&x.recordType==='case').sort((a,b)=>b.savedAt.localeCompare(a.savedAt));},
    async save(record){const copy=structuredClone(record);copy.recordType='case';copy.savedAt=new Date().toISOString();copy.status=copy.status||'Ny';await this.put('case:'+copy.id,copy);return copy;}
  };
})();
window.claimEl=(tag,className,text)=>{const e=document.createElement(tag);if(className)e.className=className;if(text!==undefined)e.textContent=text;return e;};
window.claimById=id=>document.getElementById(id);
window.claimField=(definition,values,onChange)=>{
  const [key,label,type,option]=definition,wrapper=claimEl('div','field'),caption=claimEl('label','',label+(option===true?' *':''));caption.htmlFor=key;const control=document.createElement(type==='textarea'?'textarea':type==='select'?'select':'input');control.id=key;control.name=key;
  if(type==='select'){const blank=claimEl('option','','Vælg…');blank.value='';control.append(blank);for(const value of option){const item=claimEl('option','',value);item.value=value;control.append(item);}}else if(type!=='textarea'){control.type=type;if(type==='number'){control.step='any';control.inputMode='decimal';}}
  if(option===true)control.required=true;control.value=values[key]??'';control.addEventListener('input',()=>onChange(key,control.value));wrapper.dataset.field=key;const category=ClaimsSchema.categoryFields?.[key];if(category){wrapper.dataset.category=category;wrapper.hidden=values.productGroup!==category&&!values[key];}if(key==='productGroup')control.addEventListener('input',()=>claimCategorySync(wrapper.closest('form')||wrapper.parentElement,values));wrapper.append(caption,control);return wrapper;
};
window.claimDetails=(title,definitions,values)=>{const section=claimEl('section','summary-card');section.append(claimEl('h3','',title));const dl=claimEl('dl');for(const [key,label] of definitions){if(values[key]!==undefined&&values[key]!==''){dl.append(claimEl('dt','',label),claimEl('dd','',String(values[key])));}}if(!dl.children.length)section.append(claimEl('p','subtle','Ingen oplysninger'));else section.append(dl);return section;};

window.claimCustomerHeading=(key,target)=>{const title={customer:'Forhandler',endCustomer:'Slutkunde / besigtigelsessted',inspectionPlace:'Gennemgang og referencer'}[key];if(title)target.append(claimEl('h3','field-group-title',title));};

window.claimCategorySync=(root,values)=>{root.querySelectorAll("[data-category]").forEach(w=>w.hidden=w.dataset.category!==values.productGroup&&!values[w.dataset.field]);};
