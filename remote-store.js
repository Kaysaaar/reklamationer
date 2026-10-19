'use strict';
if(ClaimAuth.remote){
const local=ClaimStore;
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
  listPage:filters=>ClaimAuth.call('listCases',{...filters,paged:true}),
  list:(query='',status='')=>ClaimAuth.call('listCases',{query,status}),
  async load(id){const record=await ClaimAuth.call('getCase',{id});let next=0;await Promise.all(Array.from({length:Math.min(3,record.photos.length)},async()=>{while(next<record.photos.length){const i=next++;record.photos[i].data=await ClaimAuth.call('getPhoto',{caseId:id,photoId:record.photos[i].id});}}));return record;}
};
}
