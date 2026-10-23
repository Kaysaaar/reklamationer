'use strict';
if(ClaimAuth.remote){
const local=ClaimStore,photoRequests=new Map();let runningPhotos=0;const photoQueue=[];
function pumpPhotos(){while(runningPhotos<3&&photoQueue.length){const task=photoQueue.shift();runningPhotos++;task().finally(()=>{runningPhotos--;pumpPhotos();});}}
function queuedPhoto(task){return new Promise((resolve,reject)=>{photoQueue.push(async()=>{try{resolve(await task());}catch(e){reject(e);}});pumpPhotos();});}
window.ClaimStore={
  async get(key){return ClaimAuth.decrypt(await local.get('encrypted:'+key));},
  async put(key,value){return local.put('encrypted:'+key,await ClaimAuth.encrypt(value));},
  async remove(key){return local.remove('encrypted:'+key);},
  async save(record){
    const user=await ClaimAuth.ready;if(user.role==='office'){const updated=await ClaimAuth.call('followup',{id:record.id,status:record.status,officeNotes:record.officeNotes,revision:record.revision});return {...updated,photos:record.photos};}
    const metadata=structuredClone(record);metadata.photos=record.photos.map(p=>({id:p.id,width:p.width,height:p.height}));
    await ClaimAuth.call('beginCase',{record:metadata});
    for(const photo of record.photos)await ClaimAuth.call('putPhoto',{caseId:record.id,photo:{id:photo.id,data:photo.data}});
    return ClaimAuth.call('finishCase',{id:record.id});
  },
  async followup(record,workflow){const updated=await ClaimAuth.call('followup',{id:record.id,revision:record.revision,...workflow,officeNotes:record.officeNotes});return {...updated,photos:record.photos};},
  listPage:filters=>ClaimAuth.call('listCases',{...filters,paged:true}),
  list:(query='',status='')=>ClaimAuth.call('listCases',{query,status}),
  async photo(record,index){const p=record.photos[index];if(!p)throw Error('Billedet blev ikke fundet.');if(p.data)return p.data;const id=record.id+':'+p.id;if(!photoRequests.has(id)){if(photoRequests.size>=20)photoRequests.delete(photoRequests.keys().next().value);photoRequests.set(id,queuedPhoto(()=>ClaimAuth.call('getPhoto',{caseId:record.id,photoId:p.id})).catch(e=>{photoRequests.delete(id);throw e;}));}p.data=await photoRequests.get(id);return p.data;},
  imageAttachment:(record,attachment)=>queuedPhoto(()=>ClaimAuth.call('getAttachment',{id:record.id,attachmentId:attachment.id})),
  async load(id){return ClaimAuth.call('getCase',{id});}
};
}
