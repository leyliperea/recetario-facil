import {createHash,timingSafeEqual} from 'node:crypto';
export function createAdminHandler({read,write,send,password}) {
  const attempts=new Map();
  setInterval(()=>attempts.clear(),60000).unref();
  let sending=false;
  return async function admin(req,res) {
    const reply=(code,data)=>{res.writeHead(code);res.end(JSON.stringify(data));};
    const ip=req.socket.remoteAddress;
    const count=(attempts.get(ip)||0)+1;attempts.set(ip,count);
    if(count>10)return reply(429,{error:'Espera un minuto antes de volver a intentarlo.'});
    if(!password || password.length<16)return reply(503,{error:'Configura ADMIN_PASSWORD en Render con al menos 16 caracteres.'});
    const provided=(req.headers.authorization||'').replace(/^Bearer /,'');
    const hash=s=>createHash('sha256').update(s).digest();
    if(!timingSafeEqual(hash(provided),hash(password)))return reply(401,{error:'Contraseña incorrecta.'});
    if(req.method==='GET' && req.url==='/admin/status')return reply(200,{subscribers:Object.keys(read()).length});
    if(req.method!=='POST' || req.url!=='/admin/send')return reply(404,{error:'Ruta no encontrada'});
    if(!req.headers['content-type']?.startsWith('application/json'))return reply(415,{error:'Se requiere JSON'});
    let payload;
    try {
      let body='';for await(const chunk of req){body+=chunk;if(Buffer.byteLength(body)>4096)return reply(413,{error:'Mensaje demasiado grande'});}
      payload=JSON.parse(body);
    }catch{return reply(400,{error:'Mensaje inválido'});}
    const {title,body}=payload;
    if(typeof title!=='string'||!title.trim()||title.length>100||typeof body!=='string'||!body.trim()||body.length>500)return reply(400,{error:'Escribe un título de hasta 100 caracteres y un mensaje de hasta 500.'});
    if(sending)return reply(409,{error:'Hay otro envío en curso. Espera a que termine.'});
    const entries=Object.entries(read());
    if(!entries.length)return reply(409,{error:'No hay usuarios suscritos. Abre el recetario y pulsa Activar push.'});
    sending=true;let accepted=0,expired=0,failed=0;
    try {
      for(let offset=0;offset<entries.length;offset+=10){
        await Promise.all(entries.slice(offset,offset+10).map(async([key,subscription])=>{
          try{await send(subscription,JSON.stringify({title:title.trim(),body:body.trim()}),{TTL:3600,timeout:10000});accepted++;}
          catch(error){if([404,410].includes(error.statusCode)){const current=read();delete current[key];write(current);expired++;}else failed++;}
        }));
      }
      reply(200,{accepted,expired,failed,total:entries.length});
    }catch{reply(500,{error:'No se pudo completar el envío. Revisa los registros antes de repetirlo.'});}
    finally{sending=false;}
  };
}
