import {frontendUrl,assetUrl,contentImageUrl} from './paths.js';
import {seasonalAnnouncement,halloweenRecommendation,setupHalloween,configureHalloween,addHalloweenVisitor,syncSeasonToggle} from './halloween.js';
const icons = {
  home:'<path d="m3 10 9-7 9 7v10H3Z"/><path d="M9 20v-7h6v7"/>',
  movie:'<rect x="3" y="8" width="18" height="13" rx="2"/><path d="m3 8-1-5 18-2 1 5M7 2l3 4m4-5 3 4M3 12h18"/>',
  series:'<rect x="2" y="3" width="20" height="15" rx="2"/><path d="M8 22h8m-4-4v4"/>',
  genres:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
  user:'<circle cx="12" cy="7" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2Z"/>',
  plus:'<path d="M12 4v16M4 12h16"/>',check:'<path d="m4 12 5 5L20 6"/>',
  play:'<path d="m8 4 13 8-13 8Z" fill="currentColor" stroke="none"/>',
  left:'<path d="m14 5-7 7 7 7"/>',right:'<path d="m10 5 7 7-7 7"/>',close:'<path d="m5 5 14 14M19 5 5 19"/>',
  eye:'<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',
  menu:'<path d="M3 6h18M3 12h18M3 18h18"/>',logout:'<path d="M9 3H3v18h6M9 12h12m-4-4 4 4-4 4"/>',
  list:'<path d="M8 6h13M8 12h13M8 18h13M3 6h1M3 12h1M3 18h1"/>',
  admin:'<path d="m12 2 8 4v6c0 5-8 10-8 10S4 17 4 12V6Z"/><path d="m8 12 3 3 5-6"/>',
};
const svg = name => `<svg viewBox="0 0 24 24" aria-hidden="true">${icons[name] || icons.genres}</svg>`;
const $ = selector => document.querySelector(selector);
const esc = value => String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const state = { catalog:[], genres:[], list:[], progress:[], token:null, user:null, demo:false, query:'', genre:new URLSearchParams(location.search).get('genre')||'', slide:0, refresh:null, loaded:false, admin:[] };
let toastTimer, expiryTimer, progressTimer, activeVideoId;
function toast(message) { $('#toast').textContent=message;$('#toast').classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('visible'),4200); }
async function request(path,{method='GET',body,retry=true}={}) {
  let response=await fetch(`/api${path}`,{method,credentials:'same-origin',headers:{...(body?{'Content-Type':'application/json'}:{}),...(state.token?{Authorization:`Bearer ${state.token}`}:{})},...(body?{body:JSON.stringify(body)}:{})});
  if(response.status===401 && state.token && retry && !path.startsWith('/auth/')) {
    try {await refreshSession();return request(path,{method,body,retry:false});}catch{await clearSession();}
  }
  if(!response.ok) { let data;try{data=await response.json();}catch{} throw new Error(data?.message || (response.status===401?'Inicia sesión para continuar.':response.status===403?'No tienes permiso para realizar esta acción.':'No se pudo completar la solicitud.')); }
  if(response.status===204 || response.headers.get('content-length')==='0')return null;
  const text=await response.text();return text?JSON.parse(text):null;
}
function acceptSession(session) {
  state.token=session.accessToken;clearTimeout(expiryTimer);
  if(state.token) expiryTimer=setTimeout(()=>refreshSession().catch(()=>clearSession()),Math.max(30,session.expiresIn-60)*1000);
}
async function refreshSession() {
  if(!state.refresh) state.refresh=request('/auth/refresh',{method:'POST',retry:false}).then(acceptSession).finally(()=>state.refresh=null);
  await state.refresh;
}
async function loadUser() {
  state.user=await request('/auth/me');
  [state.list,state.progress]=await Promise.all([request('/me/list'),request('/me/progress')]);
  renderNavigation();
}
async function clearSession() {state.token=null;state.user=null;state.list=[];state.progress=[];clearTimeout(expiryTimer);renderNavigation();if(state.loaded)render();}
const route = () => location.hash.slice(1).split('?')[0] || document.body.dataset.page || 'home';
const pageFiles={home:'inicio',movies:'peliculas',series:'series',genres:'generos',list:'mi-lista',login:'login',register:'registro',admin:'panel-control'};
function pageLink(target){return frontendUrl(`pages/${pageFiles[target]||'inicio'}.html`);}
function linkPages(root=document){for(const link of root.querySelectorAll('a[href^="#"]')){const target=link.getAttribute('href').slice(1);if(pageFiles[target])link.href=pageLink(target);}}
function navigate(target) {if(route()===target)render();else location.assign(pageLink(target));}
function renderNavigation() {
  const r=route();
  let entries=[['home','Inicio','home'],['movies','Películas','movie'],['series','Series','series'],['genres','Géneros','genres']];
  $('#navigation').innerHTML=entries.map(([id,label,icon])=>`<a href="#${id}" class="nav-item ${r===id?'active':''}" ${r===id?'aria-current="page"':''}>${svg(icon)}<span>${label}</span></a>`).join('')+'<div class="nav-separator"></div><p class="nav-section">Mi cuenta</p>'+(
    state.user ? `<a href="#list" class="nav-item ${r==='list'?'active':''}">${svg('list')}Mi lista</a>${state.user.role==='ADMIN'?`<a href="#admin" class="nav-item ${r==='admin'?'active':''}">${svg('admin')}Panel de control</a>`:''}<button class="nav-item" style="width:100%;background:transparent" data-action="logout">${svg('logout')}Cerrar sesión</button>` : `<a href="#login" class="nav-item ${r==='login'?'active':''}">${svg('user')}Iniciar sesión</a><a href="#register" class="nav-item ${r==='register'?'active':''}">${svg('plus')}Registrarse</a>`);
  $('#account-actions').innerHTML=state.user ? `<a href="#list" class="button subtle"><span class="avatar">${esc(state.user.name[0]?.toUpperCase())}</span><span class="account-name">${esc(state.user.name.split(' ')[0])}</span></a>` : '<a href="#login" class="button outline">Iniciar sesión</a><a href="#register" class="button primary">Registrarse</a>';
  linkPages();
}
function syncTheme() {
  window.CabanaTheme.sync();
  syncSeasonToggle();
}
function applyTheme(theme){window.CabanaTheme.set(theme);}
function saved(id){return state.list.some(c=>c.id===id);}
function featuredItems(){return state.catalog.filter(c=>c.featured).sort((a,b)=>a.releaseYear-b.releaseYear);}
function meta(c){return `${c.releaseYear} · ${esc(c.genre)}${c.type==='SERIES'?` · ${c.seasons} ${c.seasons===1?'temporada':'temporadas'}`:` · ${c.durationMinutes} min`}`;}
function card(c,index=0,showProgress=false){
  const placeholder=c.imageUrl.includes('poster-placeholder');
  const progress=state.progress.find(p=>p.content.id===c.id);
  return `<article class="content-card tone-${index%6}"><button class="poster-button" data-detail="${c.id}" aria-label="Ver detalles de ${esc(c.title)}"><img src="${esc(contentImageUrl(c.imageUrl))}" alt="" loading="lazy">${placeholder?`<div class="poster-title"><span>${esc(c.title)}</span><small>CABAÑA · ${c.releaseYear}</small></div>`:''}<span class="card-play">${svg('play')}</span></button><h3>${esc(c.title)}</h3><p class="card-meta">${meta(c)}</p>${showProgress&&progress?`<div class="progress-bar"><span style="width:${Math.min(100,progress.seconds/(c.durationMinutes*60)*100)}%"></span></div>`:''}</article>`;
}
function section(title,icon,data,target){return `<section class="section"><div class="section-heading"><h2>${svg(icon)}${title}</h2><a class="see-all" href="#${target}">Ver todas ${svg('right')}</a></div><div class="card-grid">${data.slice(0,6).map((c,i)=>card(c,i)).join('')}</div></section>`;}
const genreColors=['#822927','#355168','#8e7024','#2e486b','#642838','#77475f','#203f90','#565049'];
function genreTiles(){return state.genres.map((g,i)=>`<button class="genre-tile" style="--tile:${genreColors[i%8]}" data-genre="${esc(g)}">${svg(['movie','genres','series','play'][i%4])}<span>${esc(g)}</span></button>`).join('');}
function hero(){
  const featured=featuredItems();if(!featured.length)return '';
  state.slide=((state.slide%featured.length)+featured.length)%featured.length;const c=featured[state.slide];
  return `<section class="hero" aria-label="Contenido destacado"><div class="hero-art" id="hero-art"></div><div class="hero-shade"></div><div class="hero-content"><span class="eyebrow">${c.type==='SERIES'?'Serie':'Película'} destacada</span><h1>${esc(c.title)}</h1><div class="hero-meta"><span>${c.releaseYear}</span><span class="rating">${esc(c.ageRating)}</span><span>${c.type==='SERIES'?`${c.seasons} temporadas`:`${c.durationMinutes} min`}</span><span>${esc(c.genre)}</span></div><p>${esc(c.description)}</p><div class="hero-buttons"><button class="button primary" data-play="${c.id}">${svg('play')}Ver ahora</button><button class="button outline" data-save="${c.id}">${svg(saved(c.id)?'check':'plus')}${saved(c.id)?'En mi lista':'Mi lista'}</button></div><div class="hero-dots">${featured.map((f,i)=>`<button class="hero-dot ${i===state.slide?'active':''}" data-slide="${i}" aria-label="Mostrar ${esc(f.title)}" aria-pressed="${i===state.slide}"></button>`).join('')}</div></div><span class="hero-bottom">TU PRÓXIMA HISTORIA ESTÁ AQUÍ</span><div class="hero-arrows"><button class="icon-button" data-step="-1" aria-label="Destacado anterior">${svg('left')}</button><button class="icon-button" data-step="1" aria-label="Siguiente destacado">${svg('right')}</button></div></section>`;
}
function home(){
  const continuing=state.progress.filter(p=>p.seconds>0).map(p=>p.content);
  return `<div class="welcome-line"><strong>${state.user?`Qué bueno verte, ${esc(state.user.name.split(' ')[0])}.`:'Bienvenido a tu próximo lugar favorito.'}</strong>${state.demo?'<span class="demo-tag">VISTA DE DEMOSTRACIÓN</span>':''}</div><section class="cabin-welcome" aria-label="Bienvenido a Cabaña"><div><h2>Quédate una historia más.</h2><p>Tu refugio para desconectar.</p></div></section>${seasonalAnnouncement()}${hero()}${halloweenRecommendation()}${continuing.length?section('Seguir viendo','play',continuing,'list'):''}${section('Películas','movie',state.catalog.filter(c=>c.type==='MOVIE'),'movies')}${section('Series','series',state.catalog.filter(c=>c.type==='SERIES'),'series')}<section class="section"><div class="section-heading"><h2>${svg('genres')}Géneros</h2><a class="see-all" href="#genres">Explorar ${svg('right')}</a></div><div class="genres-grid">${genreTiles()}</div></section>`;
}
function empty(title,message,link='home',label='Explorar catálogo'){return `<div class="empty-state">${svg('search')}<h2>${title}</h2><p>${message}</p><a href="#${link}" class="button primary">${label}</a></div>`;}
function browse(r){
  const titles={movies:'Películas',series:'Series',genres:'Encuentra tu género',list:'Mi lista'};
  const title=state.query?`Resultados para “${esc(state.query)}”`:titles[r]||'Explorar catálogo';
  const query=state.query.trim().toLocaleLowerCase('es');
  let data=r==='list'?state.list:state.catalog;
  data=data.filter(c=>(r!=='movies'||c.type==='MOVIE')&&(r!=='series'||c.type==='SERIES')&&(!state.genre||c.genre===state.genre)&&(!query||`${c.title} ${c.genre}`.toLocaleLowerCase('es').includes(query)));
  if(r==='list'&&!state.user)return `<div class="page-heading"><h1>Mi lista</h1></div>${empty('Tu lista te espera','Inicia sesión para guardar tus películas y series favoritas.','login','Iniciar sesión')}`;
  return `<div class="page-heading"><span class="eyebrow">CABAÑA · EXPLORA</span><h1>${title}</h1><p>${data.length} ${data.length===1?'historia':'historias'} para descubrir${state.genre?` · ${esc(state.genre)}`:''}</p></div>${r==='genres'&&!state.genre&&!query?`<div class="genres-grid section">${genreTiles()}</div>`:''}<div class="filter-row"><button class="chip ${!state.genre?'active':''}" data-filter="">Todos</button>${state.genres.map(g=>`<button class="chip ${state.genre===g?'active':''}" data-filter="${esc(g)}">${esc(g)}</button>`).join('')}</div>${data.length?`<div class="card-grid browse-grid">${data.map((c,i)=>card(c,i,r==='list')).join('')}</div>`:empty(r==='list'?'Aquí comienza tu colección':'No encontramos historias','Prueba otro género o busca un título diferente.')}`;
}
function authPage(register){
  const template=$('#auth-layout');
  if(template?.dataset.route===(register?'register':'login')){const wrapper=document.createElement('div');wrapper.innerHTML=template.innerHTML;const hint=wrapper.querySelector('[data-demo-hint]');if(hint)hint.hidden=!state.demo;return wrapper.innerHTML;}
  return `<section class="auth-page"><div class="auth-card"><img src="${assetUrl('logo.jpg')}" alt="Cabaña" class="auth-logo"><h1>${register?'Crea tu cuenta':'Bienvenido de nuevo'}</h1><p class="auth-intro">${register?'Haz de Cabaña tu lugar para descubrir historias.':'Tus historias favoritas te están esperando.'}</p><form id="auth-form" data-register="${register}">${register?'<div class="form-field"><label for="name">Tu nombre</label><input id="name" name="name" required maxlength="80" autocomplete="name" placeholder="¿Cómo te llamas?"></div>':''}<div class="form-field"><label for="email">Correo electrónico</label><input id="email" name="email" type="email" required maxlength="254" autocomplete="email" placeholder="tu@correo.com"></div><div class="form-field"><label for="password">Contraseña</label><div class="password-wrap"><input id="password" name="password" type="password" required minlength="8" maxlength="72" autocomplete="${register?'new-password':'current-password'}" placeholder="${register?'Mínimo 8 caracteres':'Tu contraseña'}"><button type="button" class="password-toggle" aria-label="Mostrar contraseña">${svg('eye')}</button></div></div><p class="form-error" id="auth-error" role="alert"></p><button type="submit" class="button primary">${register?'Crear cuenta':'Iniciar sesión'} ${svg('right')}</button></form><p class="auth-switch">${register?'¿Ya tienes cuenta? <a href="#login">Inicia sesión</a>':'¿Aún no tienes cuenta? <a href="#register">Regístrate</a>'}</p><div class="auth-divider">o</div><a href="#home" class="button outline">${svg('left')}Volver al inicio</a>${state.demo?'<p class="demo-help">Acceso de demostración al panel de control<br><strong>admin@cabana.demo</strong> · <strong>Cabana2026!</strong><br>Los datos de esta demostración se reinician al apagar el servidor.</p>':''}</div></section>`;
}
async function adminPage(){
  if(state.user?.role!=='ADMIN')return empty('Acceso al panel de control','Inicia sesión con una cuenta de administrador.','login','Iniciar sesión');
  state.admin=await request('/admin/catalog');
  return `<div class="admin-top"><div class="page-heading"><span class="eyebrow">ADMINISTRACIÓN</span><h1>Panel de control</h1><p>Gestiona las historias de Cabaña.</p></div><button class="button primary" data-edit="new">${svg('plus')}Nuevo contenido</button></div><div class="stats"><div class="stat"><strong>${state.catalog.length}</strong><span>Contenidos</span></div><div class="stat"><strong>${state.catalog.filter(c=>c.type==='MOVIE').length}</strong><span>Películas</span></div><div class="stat"><strong>${state.catalog.filter(c=>c.type==='SERIES').length}</strong><span>Series</span></div></div><div class="admin-table-wrap"><table><thead><tr><th>Título</th><th>Tipo</th><th>Género</th><th>Año</th><th>Acciones</th></tr></thead><tbody>${state.admin.map(c=>`<tr><td>${esc(c.title)}${c.featured?' ✦':''}</td><td>${c.type==='MOVIE'?'Película':'Serie'}</td><td>${esc(c.genre)}</td><td>${c.releaseYear}</td><td><button class="button subtle small" data-edit="${c.id}">Editar</button><button class="button danger small" data-delete="${c.id}">Eliminar</button></td></tr>`).join('')}</tbody></table></div>`;
}
let renderVersion=0;
async function render(){
  const version=++renderVersion;const r=route();renderNavigation();
  let html;
  try{html=r==='login'||r==='register'?authPage(r==='register'):r==='admin'?await adminPage():r==='home'&&!state.query?home():browse(r);}catch(e){html=empty('No pudimos cargar esta página',esc(e.message));}
  if(version!==renderVersion)return;
  $('#main').innerHTML=html;
  linkPages($('#main'));
  addHalloweenVisitor();
  const featured=featuredItems();if($('#hero-art')&&featured[state.slide])$('#hero-art').style.backgroundImage=`url("${contentImageUrl(featured[state.slide].imageUrl).replace(/["\\\n\r]/g,'')}")`;
  $('#search').disabled=['login','register','admin'].includes(r);
  $('#sidebar').classList.remove('open');$('#menu-toggle').setAttribute('aria-expanded','false');
}
function requireLogin(){if(state.user)return true;toast('Inicia sesión para guardar y ver tus historias.');navigate('login');return false;}
function showDetail(id){
  const c=state.catalog.find(c=>c.id===id);if(!c)return;
  const dialog=$('#detail-dialog');dialog.innerHTML=`<button class="icon-button dialog-close" data-close="detail-dialog" aria-label="Cerrar detalles">${svg('close')}</button><div class="detail-art"><img src="${esc(contentImageUrl(c.imageUrl))}" alt=""></div><div class="detail-body"><span class="eyebrow">${c.type==='MOVIE'?'Película':'Serie'}</span><h2>${esc(c.title)}</h2><div class="detail-meta"><span>${meta(c)}</span><span class="rating">${esc(c.ageRating)}</span></div><p>${esc(c.description)}</p><div class="dialog-actions"><button class="button primary" data-play="${c.id}">${svg('play')}Ver ahora</button><button class="button outline" data-save="${c.id}">${svg(saved(c.id)?'check':'plus')}${saved(c.id)?'Quitar de mi lista':'Añadir a mi lista'}</button></div></div>`;dialog.showModal();
}
async function toggleSave(id){
  if(!requireLogin()){$('#detail-dialog').close();return;}
  try{const wasSaved=saved(id);await request(`/me/list/${id}`,{method:wasSaved?'DELETE':'PUT'});state.list=await request('/me/list');toast(wasSaved?'Contenido eliminado de tu lista.':'Añadido a tu lista.');await render();if($('#detail-dialog').open){$('#detail-dialog').close();showDetail(id);}}catch(e){toast(e.message);}
}
async function savePosition(){const video=$('#player-dialog video');if(video&&activeVideoId&&state.user){try{await request(`/me/progress/${activeVideoId}`,{method:'PUT',body:{seconds:Math.floor(video.currentTime)}});}catch{}}}
async function play(id){
  $('#detail-dialog').close();if(!requireLogin())return;
  try{
    const result=await request(`/playback/${id}`);const c=state.catalog.find(c=>c.id===id);
    const d=$('#player-dialog');d.innerHTML=`<button class="icon-button dialog-close" data-close="player-dialog" aria-label="Cerrar reproductor">${svg('close')}</button><div class="player-heading"><h2>${esc(result.demo?'Video de demostración':c.title)}</h2></div><video controls playsinline preload="metadata"></video><p class="player-message">${esc(result.message)}</p>`;
    const video=d.querySelector('video');video.src=result.url;activeVideoId=id;
    video.addEventListener('loadedmetadata',()=>{const progress=state.progress.find(p=>p.content.id===id);if(progress&&progress.seconds<video.duration-5)video.currentTime=progress.seconds;},{once:true});
    video.addEventListener('error',()=>toast('No se pudo cargar el video. Verifica la conexión o la disponibilidad del archivo.'));
    d.showModal();clearInterval(progressTimer);progressTimer=setInterval(savePosition,10000);
  }catch(e){toast(e.message);}
}
async function reloadCatalog(){[state.catalog,state.genres]=await Promise.all([request('/catalog'),request('/genres')]);if(state.user)[state.list,state.progress]=await Promise.all([request('/me/list'),request('/me/progress')]);}
function editor(id){
  const c=id==='new'?{}:state.admin.find(c=>c.id===id);if(!c)return;
  const field=(name,label,type='text',extra='')=>`<div class="form-field"><label for="edit-${name}">${label}</label><input id="edit-${name}" name="${name}" type="${type}" value="${esc(c[name]??'')}" ${extra}></div>`;
  $('#editor-dialog').innerHTML=`<button class="icon-button dialog-close" data-close="editor-dialog" aria-label="Cerrar formulario">${svg('close')}</button><h2>${id==='new'?'Nuevo contenido':'Editar contenido'}</h2><form id="editor-form" data-id="${id}"><div class="form-grid"><div class="full">${field('title','Título','text','required maxlength="150"')}</div><div class="form-field full"><label for="edit-description">Descripción</label><textarea id="edit-description" name="description" required maxlength="2000">${esc(c.description??'')}</textarea></div><div class="form-field"><label for="edit-type">Tipo</label><select id="edit-type" name="type"><option value="MOVIE" ${c.type==='MOVIE'?'selected':''}>Película</option><option value="SERIES" ${c.type==='SERIES'?'selected':''}>Serie</option></select></div>${field('genre','Género','text','required maxlength="30"')}${field('releaseYear','Año','number','required min="1888" max="2100"')}${field('durationMinutes','Duración en minutos','number','required min="1" max="1500"')}${field('seasons','Temporadas (0 para películas)','number','required min="0" max="100"')}<div class="form-field"><label for="edit-ageRating">Clasificación</label><select id="edit-ageRating" name="ageRating">${['ATP','7+','13+','16+','18+'].map(r=>`<option ${c.ageRating===r?'selected':''}>${r}</option>`).join('')}</select></div><div class="full">${field('imageUrl','Imagen (URL HTTPS o /assets/)','text','required maxlength="1000"')}${field('videoPath','Ruta de video en Supabase (opcional)','text','maxlength="1000" placeholder="peliculas/mi-video.mp4"')}</div></div><label class="checkbox-field"><input name="featured" type="checkbox" ${c.featured?'checked':''}>Mostrar en destacados</label><p id="editor-error" class="form-error" role="alert"></p><button type="submit" class="button primary">Guardar contenido</button></form>`;
  $('#editor-dialog').showModal();
}
document.addEventListener('click',async event=>{
  const b=event.target.closest('button,a');if(!b)return;
  if(b.dataset.close)$('#'+b.dataset.close).close();
  if(b.dataset.detail)showDetail(b.dataset.detail);
  if(b.dataset.play)await play(b.dataset.play);
  if(b.dataset.save)await toggleSave(b.dataset.save);
  if(b.dataset.slide!==undefined){state.slide=Number(b.dataset.slide);render();}
  if(b.dataset.step){state.slide+=Number(b.dataset.step);render();}
  if(b.dataset.genre){location.assign(pageLink('genres')+'?genre='+encodeURIComponent(b.dataset.genre));}
  if(b.dataset.filter!==undefined){state.genre=b.dataset.filter;render();}
  if(b.dataset.edit)editor(b.dataset.edit);
  if(b.dataset.delete){const c=state.catalog.find(c=>c.id===b.dataset.delete);if(confirm(`¿Eliminar “${c.title}” del catálogo?`)){try{await request(`/admin/catalog/${c.id}`,{method:'DELETE'});await reloadCatalog();await render();toast('Contenido eliminado.');}catch(e){toast(e.message);}}}
  if(b.classList.contains('password-toggle')){const input=$('#password');input.type=input.type==='password'?'text':'password';b.setAttribute('aria-label',input.type==='password'?'Mostrar contraseña':'Ocultar contraseña');}
  if(b.dataset.action==='logout'){try{await request('/auth/logout',{method:'POST'});}finally{await clearSession();navigate('home');toast('Has cerrado sesión.');}}
});
document.addEventListener('submit',async event=>{
  const form=event.target;if(!['auth-form','editor-form'].includes(form.id))return;event.preventDefault();
  const submit=form.querySelector('[type=submit]');submit.disabled=true;const data=Object.fromEntries(new FormData(form));
  if(form.id==='auth-form'){
    $('#auth-error').textContent='';
    try{const session=await request(form.dataset.register==='true'?'/auth/register':'/auth/login',{method:'POST',body:data});acceptSession(session);if(session.accessToken){await loadUser();navigate('home');toast('Bienvenido a Cabaña.');}else{$('#auth-error').textContent=session.message;form.reset();}}catch(e){$('#auth-error').textContent=e.message;}finally{submit.disabled=false;}
  }else{
    $('#editor-error').textContent='';for(const k of ['releaseYear','durationMinutes','seasons'])data[k]=Number(data[k]);data.featured=form.elements.featured.checked;
    try{const id=form.dataset.id;await request(id==='new'?'/admin/catalog':`/admin/catalog/${id}`,{method:id==='new'?'POST':'PUT',body:data});$('#editor-dialog').close();await reloadCatalog();await render();toast('Contenido guardado.');}catch(e){$('#editor-error').textContent=e.message;}finally{submit.disabled=false;}
  }
});
$('#search-icon').innerHTML=svg('search');$('#menu-toggle').innerHTML=svg('menu');
$('#menu-toggle').addEventListener('click',()=>{const open=$('#sidebar').classList.toggle('open');$('#menu-toggle').setAttribute('aria-expanded',String(open));});
document.addEventListener('cabana:theme-change',()=>{syncTheme();if(state.loaded)render();});
$('#search').addEventListener('input',event=>{state.query=event.target.value;render();});
document.addEventListener('keydown',event=>{if(event.key==='/'&&!['INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName)){event.preventDefault();$('#search').focus();}});
window.addEventListener('hashchange',()=>{state.query='';state.genre=state.pendingGenre||'';state.pendingGenre=null;$('#search').value='';window.scrollTo(0,0);render();});
$('#player-dialog').addEventListener('close',async()=>{clearInterval(progressTimer);await savePosition();$('#player-dialog video')?.pause();if(state.user){try{state.progress=await request('/me/progress');await render();}catch{}}});
for(const d of document.querySelectorAll('dialog'))d.addEventListener('click',event=>{if(event.target===d){const rect=d.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)d.close();}});
setupHalloween({getCatalog:()=>state.catalog,applyTheme,render,showDetail,toast,esc,svg});
syncTheme();renderNavigation();
try{
  const config=await request('/config');state.demo=config.demo;configureHalloween(config);$('#mode-label').textContent=config.demo?'Demostración académica':'Cabaña · Streaming';
  await reloadCatalog();try{await refreshSession();await loadUser();}catch{await clearSession();}
  state.loaded=true;await render();
}catch(e){$('#main').innerHTML=empty('La Cabaña todavía no está encendida','Inicia el backend Java y vuelve a cargar esta página.');toast(e.message);}
