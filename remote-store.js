'use strict';
if(ClaimAuth.remote){
const local=ClaimStore,photoRequests=new Map();let runningPhotos=0;const photoQueue=[],photoJobs=new Set();
function cancelled(){return new DOMException('Billedhentningen er afbrudt.','AbortError');}
function pumpPhotos(){while(runningPhotos<3&&photoQueue.length){const job=photoQueue.shift();if(job.controller.signal.aborted)continue;runningPhotos++;Promise.resolve().then(()=>{if(job.controller.signal.aborted)throw cancelled();return job.task(job.controller.signal);}).then(job.resolve,job.reject).finally(()=>{photoJobs.delete(job);runningPhotos--;pumpPhotos();});}}
function queuedPhoto(caseId,task){return new Promise((resolve,reject)=>{const job={caseId,task,resolve,reject,controller:new AbortController()};photoJobs.add(job);photoQueue.push(job);pumpPhotos();});}
function cancelPhotoDownloads(caseId){
 for(const job of photoJobs)if(job.caseId===caseId){job.controller.abort();job.reject(cancelled());photoJobs.delete(job);}
 for(let i=photoQueue.length-1;i>=0;i--)if(photoQueue[i].caseId===caseId)photoQueue.splice(i,1);
 for(const id of photoRequests.keys())if(id.startsWith(caseId+':'))photoRequests.delete(id);
}
window.ClaimStore={
  cancelPhotoDownloads,
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
  async photo(record,index){const p=record.photos[index];if(!p)throw Error('Billedet blev ikke fundet.');if(p.data)return p.data;const id=record.id+':'+p.id;if(!photoRequests.has(id)){if(photoRequests.size>=20)photoRequests.delete(photoRequests.keys().next().value);const promise=queuedPhoto(record.id,signal=>ClaimAuth.imageRead('getPhoto',{caseId:record.id,photoId:p.id},signal)).catch(e=>{if(photoRequests.get(id)===promise)photoRequests.delete(id);throw e;});photoRequests.set(id,promise);}p.data=await photoRequests.get(id);return p.data;},
  imageAttachment:(record,attachment)=>queuedPhoto(record.id,signal=>ClaimAuth.imageRead('getAttachment',{id:record.id,attachmentId:attachment.id},signal)),
  async load(id){return ClaimAuth.call('getCase',{id});}
};
}
