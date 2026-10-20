'use strict';
window.ClaimReportPreview=async function(file,host){
 const pdfjs=await import('./pdf.min.mjs');pdfjs.GlobalWorkerOptions.workerSrc=new URL('pdf.worker.min.mjs',location.href).href;
 const task=pdfjs.getDocument({data:new Uint8Array(await file.arrayBuffer()),isEvalSupported:false,useSystemFonts:true});
 const doc=await task.promise,wrap=document.createElement('section'),bar=document.createElement('div'),canvas=document.createElement('canvas'),prev=document.createElement('button'),next=document.createElement('button'),count=document.createElement('span');
 wrap.className='report-preview';bar.className='report-preview-nav';prev.textContent='‹ Forrige side';next.textContent='Næste side ›';prev.type=next.type='button';count.setAttribute('role','status');canvas.setAttribute('aria-label','Forhåndsvisning af PDF');bar.append(prev,count,next);wrap.append(bar,canvas);host.append(wrap);let page=1,disposed=false;
 async function render(){prev.disabled=next.disabled=true;try{const p=await doc.getPage(page),natural=p.getViewport({scale:1}),width=Math.min(1400,Math.max(500,(host.clientWidth||700)*Math.min(devicePixelRatio||1,2))),view=p.getViewport({scale:width/natural.width});canvas.width=Math.ceil(view.width);canvas.height=Math.ceil(view.height);await p.render({canvasContext:canvas.getContext('2d'),viewport:view}).promise;count.textContent=`Side ${page} af ${doc.numPages}`;p.cleanup();}finally{if(!disposed){prev.disabled=page===1;next.disabled=page===doc.numPages;}}}
 prev.onclick=async()=>{page--;await render();};next.onclick=async()=>{page++;await render();};try{await render();}catch(e){await doc.destroy();wrap.remove();throw e;}return ()=>{disposed=true;doc.destroy();wrap.remove();canvas.width=canvas.height=1;};
};
