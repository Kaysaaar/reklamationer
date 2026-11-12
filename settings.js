 'use strict';
(async()=>{const user=await ClaimAuth.ready;if(!user)return;
const button=document.createElement('button');button.type='button';button.className='settings-button';button.textContent='Min adgang';
const dialog=document.createElement('dialog');dialog.className='settings-dialog';dialog.setAttribute('aria-label','Min adgang');
const title=document.createElement('h2');title.textContent='Min adgang';const person=document.createElement('p');person.textContent=user.sellerName||'';
const label=document.createElement('p');label.textContent=user.label||'Denne enhed';const info=document.createElement('p');info.textContent='Appen åbner med din private enhedsadgang. Kontoret kan tilbagekalde adgangen, hvis du mister enheden.';
const close=document.createElement('button');close.type='button';close.textContent='Luk';close.onclick=()=>dialog.close();dialog.append(title,person,label,info,close);document.body.append(dialog);
(document.querySelector('.account-actions')||document.querySelector('header')).append(button);button.onclick=()=>dialog.showModal();})();
