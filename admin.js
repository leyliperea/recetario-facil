(() => {
  const form=document.querySelector('#admin-form'), result=document.querySelector('#result'), send=document.querySelector('#send-message'), check=document.querySelector('#check-admin');
  const base=(window.RECETARIO_PUSH_API||'').replace(/\/$/,'');
  async function request(path,payload) {
    const password=document.querySelector('#admin-password').value;
    if(password.length<16)throw new Error('Escribe tu contraseña de administrador de al menos 16 caracteres.');
    result.textContent='Conectando con el servidor… Puede tardar un minuto si estaba en reposo.';
    const response=await fetch(base+path,{method:payload?'POST':'GET',cache:'no-store',signal:AbortSignal.timeout(120000),headers:{Authorization:'Bearer '+password,...(payload?{'Content-Type':'application/json'}:{})},body:payload?JSON.stringify(payload):undefined});
    const data=await response.json();if(!response.ok)throw new Error(data.error||'No se pudo completar la operación');
    return data;
  }
  check.addEventListener('click',async()=>{
    check.disabled=true;
    try{const data=await request('/admin/status');result.textContent=data.subscribers+' dispositivos suscritos.';}
    catch(error){result.textContent=error.message;}
    finally{check.disabled=false;}
  });
  form.addEventListener('submit',async event=>{
    event.preventDefault();
    if(!form.reportValidity())return;
    const title=document.querySelector('#message-title').value.trim(),body=document.querySelector('#message-body').value.trim();
    if(!confirm('¿Enviar este aviso a todos los dispositivos suscritos?\n\n'+title+'\n'+body))return;
    send.disabled=true;check.disabled=true;
    try{const data=await request('/admin/send',{title,body});result.textContent='Avisos aceptados por el servicio push: '+data.accepted+' de '+data.total+'.\nSuscripciones caducadas: '+data.expired+'. Fallos: '+data.failed+'.\nLa aceptación no confirma que cada usuario haya visto el aviso.';}
    catch(error){result.textContent=error.name==='TimeoutError'?'Se agotó el tiempo de espera. Comprueba los registros del servidor antes de repetir el envío para evitar duplicados.':error.message;}
    finally{send.disabled=false;check.disabled=false;}
  });
})();