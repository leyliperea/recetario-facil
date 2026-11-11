const recipes=[
{id:1,name:'Hot cakes de avena y plátano',category:'Desayunos',time:20,servings:2,image:'photo-1528207776546-365bb710ee93',ingredients:['1 plátano maduro','1 taza de avena','1 huevo','½ taza de leche','1 cucharadita de polvo para hornear','1 cucharadita de aceite'],steps:['Licúa el plátano, la avena, el huevo, la leche y el polvo para hornear hasta obtener una mezcla uniforme.','Calienta un sartén antiadherente a fuego medio y úntalo con un poco de aceite.','Vierte porciones pequeñas de mezcla. Cocina de 2 a 3 minutos, hasta que aparezcan burbujas y los bordes estén firmes.','Voltea y cocina otros 2 minutos o hasta que el centro esté bien cocido. Sirve con fruta.']},
{id:2,name:'Ensalada fresca con garbanzos',category:'Comidas',time:15,servings:2,image:'photo-1512621776951-a57141f2eefd',ingredients:['1 taza de garbanzos cocidos','1 pepino','2 jitomates','2 tazas de lechuga','1 limón','1 cucharada de aceite de oliva','Sal al gusto'],steps:['Lava y desinfecta las verduras. Escurre los garbanzos.','Corta el pepino y los jitomates en cubos y trocea la lechuga.','Mezcla todo en un recipiente.','Agrega el jugo de limón, el aceite y la sal. Mezcla y sirve.']},
{id:3,name:'Pasta cremosa con champiñones',category:'Comidas',time:30,servings:2,image:'photo-1473093295043-cdd812d0e601',ingredients:['200 g de pasta','200 g de champiñones','½ taza de crema','1 diente de ajo','1 cucharada de aceite','Sal y pimienta al gusto'],steps:['Cuece la pasta en agua hirviendo siguiendo el tiempo indicado en el paquete. Reserva media taza del agua y escurre.','Limpia y rebana los champiñones. Pica el ajo.','Calienta el aceite, sofríe el ajo durante 30 segundos y agrega los champiñones. Cocina de 6 a 8 minutos.','Baja el fuego, incorpora la crema y la pasta. Añade un poco del agua reservada si hace falta.','Sazona con sal y pimienta y cocina 2 minutos más.']},
{id:4,name:'Tostadas de aguacate',category:'Desayunos',time:10,servings:2,image:'photo-1541519227354-08fa5d50c44d',ingredients:['4 rebanadas de pan integral','1 aguacate','1 jitomate','½ limón','Sal y pimienta al gusto'],steps:['Tuesta las rebanadas de pan.','Machaca el aguacate con el jugo de limón, la sal y la pimienta.','Lava y corta el jitomate en rebanadas.','Unta el aguacate sobre el pan y agrega el jitomate. Sirve al momento.']},
{id:5,name:'Quesadillas de champiñones',category:'Cenas',time:20,servings:2,image:'photo-1618040996337-56904b7850b9',ingredients:['4 tortillas de maíz','150 g de queso Oaxaca','200 g de champiñones','¼ de cebolla','1 cucharadita de aceite','Sal al gusto'],steps:['Limpia y corta los champiñones y pica la cebolla.','Calienta el aceite y sofríe la cebolla 2 minutos. Añade los champiñones y cocina de 6 a 8 minutos. Agrega sal.','Calienta las tortillas en un comal y distribuye el queso y los champiñones.','Dobla y cocina por ambos lados hasta que el queso se derrita.']},
{id:6,name:'Vasitos de yogur con fruta',category:'Postres',time:10,servings:2,image:'photo-1488477181946-6428a0291777',ingredients:['1 taza de yogur natural','1 taza de fresas','1 plátano','½ taza de granola'],steps:['Lava y desinfecta las fresas. Retira sus hojas y córtalas en trozos.','Pela y rebana el plátano.','Distribuye la mitad del yogur en dos vasos.','Añade una capa de fruta y granola. Repite las capas con el yogur restante y sirve.']}
];
const read=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key))||fallback}catch{return fallback}};let favorites=read('rf-favorites',[]),shopping=read('rf-shopping',[]),page='all',category='Todas';const $=s=>document.querySelector(s);const save=()=>{try{localStorage.setItem('rf-favorites',JSON.stringify(favorites));localStorage.setItem('rf-shopping',JSON.stringify(shopping))}catch{toast('No se pudo guardar en este navegador.')}};const escapeHTML=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));const photo=r=>`https://images.unsplash.com/${r.image}?w=800&auto=format&fit=crop`;function toast(t){$('#toast').textContent=t;$('#toast').style.display='block';clearTimeout(window.toastTimer);window.toastTimer=setTimeout(()=>$('#toast').style.display='none',2600)}
function render(){document.querySelectorAll('[data-page]').forEach(b=>b.classList.toggle('active',b.dataset.page===page));$('#fav-count').textContent=favorites.length?`(${favorites.length})`:'';const isShopping=page==='shopping';$('#shopping').hidden=!isShopping;$('#grid').hidden=isShopping;$('#search').hidden=isShopping;$('#filters').hidden=isShopping;$('#section-title').textContent=isShopping?'Tu lista de compras':page==='favorites'?'Tus recetas favoritas':'¿Qué se te antoja hoy?';if(isShopping){$('#result-count').textContent=`${shopping.filter(x=>!x.done).length} ingredientes pendientes`;renderShopping();return}$('#filters').innerHTML=['Todas','Desayunos','Comidas','Cenas','Postres'].map(c=>`<button data-category="${c}" class="${category===c?'active':''}">${c}</button>`).join('');const normalize=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();const q=normalize($('#search').value);const list=recipes.filter(r=>(page!=='favorites'||favorites.includes(r.id))&&(category==='Todas'||r.category===category)&&normalize(r.name+' '+r.ingredients.join(' ')).includes(q));$('#result-count').textContent=`${list.length} recetas para inspirarte`;$('#grid').innerHTML=list.map(r=>`<article class="card"><div class="photo"><img src="${photo(r)}" alt="${r.name}" loading="lazy"><button class="heart" data-favorite="${r.id}" aria-label="${favorites.includes(r.id)?'Quitar de':'Agregar a'} favoritos" aria-pressed="${favorites.includes(r.id)}">${favorites.includes(r.id)?'♥':'♡'}</button></div><div class="card-body"><span class="tag">${r.category}</span><h3>${r.name}</h3><div class="meta"><span>◷ ${r.time} min</span><span>Para ${r.servings} personas</span></div><div class="card-bottom"><span class="difficulty">Fácil</span><button class="view" data-recipe="${r.id}">Ver receta ↗</button></div></div></article>`).join('')||'<div class="empty">'+(page==='favorites'?'Guarda tus recetas tocando el corazón.':'No encontramos recetas. Prueba con otro ingrediente o categoría.')+'</div>'}
function openRecipe(id){const r=recipes.find(r=>r.id===id);$('#recipe-detail').innerHTML=`<img class="dialog-img" src="${photo(r)}" alt="${r.name}"><div class="detail"><span class="tag">${r.category} · ${r.time} min · ${r.servings} porciones</span><h2>${r.name}</h2><button type="button" class="primary" data-share-recipe="${r.id}">Compartir imagen</button><p class="muted" id="share-recipe-status" role="status"></p><h4>Ingredientes</h4><ul>${r.ingredients.map(i=>`<li>${i}</li>`).join('')}</ul><button class="primary" data-add="${r.id}">Agregar ingredientes a mi lista</button><h4>Paso a paso</h4><ol>${r.steps.map(s=>`<li>${s}</li>`).join('')}</ol></div>`;$('#dialog').showModal()}
function renderShopping(){$('#shopping').innerHTML=`<div class="shopping"><form class="add-form" id="add-form"><input class="search" id="new-item" maxlength="150" placeholder="Agregar un ingrediente…" aria-label="Nuevo ingrediente" required><button class="primary">Agregar</button></form>${shopping.map((i,n)=>`<label class="item"><input type="checkbox" data-check="${n}" ${i.done?'checked':''}><span>${escapeHTML(i.name)}</span><button type="button" data-remove="${n}" aria-label="Eliminar ${escapeHTML(i.name)}">×</button></label>`).join('')||'<p class="empty">Agrega ingredientes desde una receta o escríbelos aquí.</p>'}${shopping.some(i=>i.done)?'<button id="clear-done">Eliminar los comprados</button>':''}</div>`;$('#add-form').onsubmit=e=>{e.preventDefault();const name=$('#new-item').value.trim();if(name){shopping.push({name,done:false});save();render();$('#new-item').focus()}}}
document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.page){page=b.dataset.page;category='Todas';$('#search').value='';render()}if(b.dataset.category){category=b.dataset.category;render()}if(b.dataset.favorite){const id=Number(b.dataset.favorite);favorites=favorites.includes(id)?favorites.filter(x=>x!==id):[...favorites,id];save();render()}if(b.dataset.recipe)openRecipe(Number(b.dataset.recipe));if(b.dataset.add){const r=recipes.find(r=>r.id===Number(b.dataset.add));r.ingredients.forEach(name=>{if(!shopping.some(i=>i.name===name))shopping.push({name,done:false})});save();toast('Ingredientes agregados a tu lista')}if(b.dataset.remove!==undefined){e.preventDefault();shopping.splice(Number(b.dataset.remove),1);save();render()}if(b.id==='clear-done'){shopping=shopping.filter(i=>!i.done);save();render()}});document.addEventListener('change',e=>{if(e.target.dataset.check!==undefined){shopping[Number(e.target.dataset.check)].done=e.target.checked;save();render()}});$('#search').addEventListener('input',render);$('.dialog-close').onclick=()=>$('#dialog').close();$('#dialog').addEventListener('click',e=>{if(e.target===$('#dialog'))$('#dialog').close()});$('#explore').onclick=()=>$('#recipes').scrollIntoView({behavior:'smooth'});let installPrompt;window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();installPrompt=e;$('#install').style.display='inline-block'});$('#install').onclick=async()=>{if(installPrompt){await installPrompt.prompt();installPrompt=null;$('#install').style.display='none'}};if('serviceWorker'in navigator)navigator.serviceWorker.register('sw.js');render();

const requestedRecipe = Number(new URLSearchParams(location.search).get('receta'));
if (recipes.some(r => r.id === requestedRecipe)) openRecipe(requestedRecipe);

// Personalization is local to this browser and survives reopening the app.
let appearance=read('rf-appearance',{theme:'lila',dark:false,large:false});
function applyAppearance(){
  const allowed=['lila','verde','durazno'];
  if(!allowed.includes(appearance.theme))appearance.theme='lila';
  document.body.dataset.theme=appearance.theme;
  document.body.dataset.dark=String(!!appearance.dark);
  document.body.dataset.large=String(!!appearance.large);
  document.querySelectorAll('[data-theme-choice]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.themeChoice===appearance.theme)));
  $('#toggle-dark').setAttribute('aria-pressed',String(!!appearance.dark));
  const darkLabel=appearance.dark?'Modo claro':'Modo oscuro';
  $('#toggle-dark').setAttribute('aria-label',darkLabel);
  $('#toggle-dark').setAttribute('title',darkLabel);
  $('#toggle-dark').dataset.tip=darkLabel;
  $('#toggle-large').setAttribute('aria-pressed',String(!!appearance.large));
  $('#toggle-large').textContent=appearance.large?'Texto normal':'Texto grande';
  try{localStorage.setItem('rf-appearance',JSON.stringify(appearance))}catch{}
}
document.querySelectorAll('[data-theme-choice]').forEach(button=>button.addEventListener('click',()=>{appearance.theme=button.dataset.themeChoice;applyAppearance()}));
$('#toggle-dark').addEventListener('click',()=>{appearance.dark=!appearance.dark;applyAppearance()});
$('#toggle-large').addEventListener('click',()=>{appearance.large=!appearance.large;applyAppearance()});
let lastSurprise=0;
$('#random-recipe').addEventListener('click',()=>{const options=recipes.filter(r=>r.id!==lastSurprise);const recipe=options[Math.floor(Math.random()*options.length)];lastSurprise=recipe.id;openRecipe(recipe.id)});
$('#reset-appearance').addEventListener('click',()=>{appearance={theme:'lila',dark:false,large:false};applyAppearance();toast('Apariencia original restaurada')});
applyAppearance();

function openToolPage(next){page=next;category='Todas';$('#search').value='';render();$('#recipes').scrollIntoView({behavior:'smooth'});}
$('#tool-search').addEventListener('click',()=>{openToolPage('all');$('#search').focus({preventScroll:true})});
$('#tool-favorites').addEventListener('click',()=>openToolPage('favorites'));
$('#tool-shopping').addEventListener('click',()=>openToolPage('shopping'));
function closeAppearance(){ $('#appearance-panel').hidden=true;$('#tool-appearance').setAttribute('aria-expanded','false'); }
$('#tool-appearance').addEventListener('click',()=>{const panel=$('#appearance-panel');panel.hidden=!panel.hidden;$('#tool-appearance').setAttribute('aria-expanded',String(!panel.hidden))});
document.addEventListener('click',event=>{if(!event.target.closest('.recipe-tools'))closeAppearance()});
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!$('#appearance-panel').hidden){closeAppearance();$('#tool-appearance').focus()}});


// Draw the complete recipe locally, without depending on remote images or fonts.
function recipeImage(r) {
  const canvas = document.createElement('canvas');
  canvas.width = 960;
  const ctx = canvas.getContext('2d');
  const rows = [];
  let y = 74;
  function add(value, font, color, lineHeight, x = 72) {
    ctx.font = font;
    let line = '';
    for (const word of value.split(/\s+/)) {
      const candidate = line ? line + ' ' + word : word;
      if (line && ctx.measureText(candidate).width > canvas.width - x - 72) {
        rows.push({line, font, color, x, y});
        y += lineHeight;
        line = word;
      } else line = candidate;
    }
    rows.push({line, font, color, x, y});
    y += lineHeight;
  }
  add('RECETARIO FÁCIL', 'bold 23px sans-serif', '#674b86', 52);
  add(r.name, 'bold 58px Georgia', '#30233e', 66);
  add(r.category + '  ·  ' + r.time + ' min  ·  ' + r.servings + ' porciones', '28px sans-serif', '#5d4b6b', 46);
  y += 30;
  const divider = y - 10;
  add('Ingredientes', 'bold 37px Georgia', '#5c3c7a', 58);
  for (const ingredient of r.ingredients) {
    add('•  ' + ingredient, '30px sans-serif', '#302c35', 42, 84);
  }
  y += 28;
  add('Paso a paso', 'bold 37px Georgia', '#5c3c7a', 58);
  r.steps.forEach((step, i) => {
    add((i + 1) + '.  ' + step, '30px sans-serif', '#302c35', 43, 84);
    y += 12;
  });
  canvas.height = y + 52;
  ctx.fillStyle = '#fcf9f5';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#eee5f5';
  ctx.fillRect(0, 0, canvas.width, divider);
  ctx.fillStyle = '#74569b';
  ctx.fillRect(0, 0, canvas.width, 12);
  ctx.textBaseline = 'top';
  for (const row of rows) {
    ctx.font = row.font;
    ctx.fillStyle = row.color;
    ctx.fillText(row.line, row.x, row.y);
  }
  const bytes = Uint8Array.from(atob(canvas.toDataURL('image/png').split(',')[1]), c => c.charCodeAt(0));
  const slug = r.name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return new File([bytes], slug + '.png', {type: 'image/png'});
}

$('#recipe-detail').addEventListener('click', async event => {
  const button = event.target.closest('[data-share-recipe]');
  if (!button) return;
  const status = $('#share-recipe-status');
  const recipe = recipes.find(r => r.id === Number(button.dataset.shareRecipe));
  if (!recipe) return;
  button.disabled = true;
  status.textContent = '';
  try {
    const file = recipeImage(recipe);
    if (navigator.share && navigator.canShare?.({files: [file]})) {
      try {
        await navigator.share({files: [file]});
        return;
      } catch (error) {
        if (error.name === 'AbortError') return;
      }
    }
    const url = URL.createObjectURL(file);
    const link = document.createElement('a');
    link.href = url;
    link.download = file.name;
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 30000);
    status.textContent = 'Imagen descargada. Adjunta el PNG en tu chat de WhatsApp.';
  } catch {
    status.textContent = 'No se pudo crear la imagen. Inténtalo de nuevo.';
  } finally {
    button.disabled = false;
  }
});
