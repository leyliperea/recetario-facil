(() => {
  const $=id=>document.getElementById(id);
  const base=(window.RECETARIO_PUSH_API||'').replace(/\/$/,'');
  let password='';
  const message=text=>{$('result').textContent=text;};
  async function request(path,payload,credential=password) {
    if(credential.length<16)throw new Error('Escribe tu contraseña de administrador de al menos 16 caracteres.');
    if(!base)throw new Error('Falta conectar el servidor de avisos.');
    const response=await fetch(base+path,{method:payload?'POST':'GET',cache:'no-store',signal:AbortSignal.timeout(120000),headers:{Authorization:'Bearer '+credential,...(payload?{'Content-Type':'application/json'}:{})},body:payload?JSON.stringify(payload):undefined});
    let data;try{data=await response.json();}catch{throw new Error('El servidor está iniciando. Espera un minuto e inténtalo nuevamente.');}
    if(!response.ok) {
      if(response.status===401){password='';$('admin-dashboard').hidden=true;$('login-section').hidden=false;}
      throw new Error(data.error||'No se pudo completar la operación.');
    }
    return data;
  }
  $('login-form').addEventListener('submit',async event=>{
    event.preventDefault();if(!$('login-form').reportValidity())return;
    $('login-button').disabled=true;
    message('Comprobando acceso… El servidor puede tardar un minuto en iniciar.');
    try {
      const candidate=$('admin-password').value;
      const data=await request('/admin/status',undefined,candidate);
      password=candidate;$('admin-password').value='';
      $('subscriber-count').textContent=data.subscribers;
      $('login-section').hidden=true;$('admin-dashboard').hidden=false;
      message('Sesión de administrador iniciada. Escribe tu aviso.');
    }catch(error){message(error.message);}
    finally{$('login-button').disabled=false;}
  });
  $('logout').addEventListener('click',()=>{
    password='';$('admin-password').value='';$('message-body').value='';
    $('admin-dashboard').hidden=true;$('login-section').hidden=false;
    message('Sesión cerrada.');$('admin-password').focus();
  });
  $('check-admin').addEventListener('click',async()=>{
    $('check-admin').disabled=true;message('Actualizando usuarios…');
    try{const data=await request('/admin/status');$('subscriber-count').textContent=data.subscribers;message(data.subscribers+' dispositivos suscritos.');}
    catch(error){message(error.message);}
    finally{$('check-admin').disabled=false;}
  });
  $('admin-form').addEventListener('submit',async event=>{
    event.preventDefault();if(!$('admin-form').reportValidity())return;
    const title=$('message-title').value.trim(),body=$('message-body').value.trim();
    if(!confirm('¿Enviar este aviso a los usuarios suscritos?\n\n'+title+'\n'+body))return;
    $('send-message').disabled=true;$('check-admin').disabled=true;
    message('Enviando aviso…');
    try{const data=await request('/admin/send',{title,body});message('Avisos aceptados: '+data.accepted+' de '+data.total+'. Caducados: '+data.expired+'. Fallos: '+data.failed+'.');}
    catch(error){message(error.name==='TimeoutError'?'Se agotó el tiempo. Revisa el servidor antes de repetir para evitar duplicados.':error.message);}
    finally{$('send-message').disabled=false;$('check-admin').disabled=false;}
  });
})();