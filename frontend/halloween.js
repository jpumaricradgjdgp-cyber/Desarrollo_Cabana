import {assetUrl} from './paths.js';
let app;
let season=false,year=0,dismissed=false;
const active=()=>document.documentElement.dataset.theme==='halloween';
const dialog=()=>document.querySelector('#halloween-dialog');
const recommendation=()=>app.getCatalog().find(c=>c.title==='Viernes 13, parte 2')||app.getCatalog().find(c=>c.genre==='Terror');
export function configureHalloween(config){
  season=config.halloweenSeason===true;year=config.seasonYear;
  try{dismissed=localStorage.getItem(`cabana-halloween-dismissed-${year}`)==='true';}catch{}
}
export function syncSeasonToggle(){
  const button=document.querySelector('#halloween-toggle');
  document.querySelector('#halloween-icon').src=assetUrl(active()?'jason-movie.png':'ghost.png');
  const label=active()?'Salir del modo Halloween':'Abrir especial de Halloween';
  button.setAttribute('aria-label',label);button.title=label;button.setAttribute('aria-pressed',String(active()));
  const theme=document.documentElement.dataset.theme;
  document.querySelector('meta[name="theme-color"]').content=active()?'#110d18':theme==='light'?'#f4f6fb':'#0b101c';
}
export function seasonalAnnouncement(){
  if(!season||dismissed)return '';
  const c=recommendation();
  return `<aside class="season-announcement" aria-label="Semana del terror"><img class="season-ghost" src="${assetUrl('ghost.png')}" alt=""><div class="season-message"><span>OCTUBRE EN CABAÑA</span><h2>${active()?'La cabaña tiene visita.':'¿Una noche de terror en la cabaña?'}</h2><p>${active()?'Jason se queda. Tú decides cuándo volver a tu tema.':'Prueba un ambiente de Halloween, solo si te apetece.'}</p></div><div class="season-actions"><button class="button season-cta" data-halloween="${active()?'exit':'open'}">${active()?'Volver a mi tema':'Descubrir modo Halloween'}</button>${c?`<button class="season-link" data-detail="${c.id}">Nuestra recomendación ${app.svg('right')}</button>`:''}</div><button class="season-dismiss" data-halloween="dismiss" aria-label="Ocultar anuncio de Halloween">${app.svg('close')}</button></aside>`;
}
export function halloweenRecommendation(){
  if(!active())return '';
  const c=recommendation();if(!c)return '';
  return `<section class="horror-recommendation" aria-labelledby="horror-title"><div class="horror-avatar"><img src="${assetUrl('jason-movie.png')}" alt="Jason Voorhees"></div><div class="horror-copy"><span class="eyebrow">PARA UNA NOCHE EN LA CABAÑA</span><h2 id="horror-title">${app.esc(c.title)}</h2><p>${app.esc(c.description)}</p><span class="card-meta">${c.releaseYear} · ${app.esc(c.genre)} · ${c.durationMinutes} min · ${app.esc(c.ageRating)}</span></div><button class="button outline" data-detail="${c.id}">Ver recomendación ${app.svg('right')}</button></section>`;
}
export function addHalloweenVisitor(){
  const hero=document.querySelector('.hero');if(active()&&hero)hero.insertAdjacentHTML('beforeend',`<img class="hero-visitor" src="${assetUrl('jason-outline.png')}" alt="">`);
}
function activate(){
  const previous=document.documentElement.dataset.theme;
  if(previous!=='halloween'){try{localStorage.setItem('cabana-base-theme',previous);}catch{}}
  dialog().close();app.applyTheme('halloween');app.toast('Jason llegó a la Cabaña. Puedes volver a tu tema cuando quieras.');
}
function exit(){
  let previous='dark';try{previous=localStorage.getItem('cabana-base-theme')||'dark';}catch{}
  app.applyTheme(previous==='light'?'light':'dark');app.toast('Volviste a tu tema habitual.');
}
function open(){
  dialog().innerHTML=`<button class="icon-button dialog-close" data-close="halloween-dialog" aria-label="Cerrar anuncio">${app.svg('close')}</button><div class="halloween-dialog-art"><div class="halloween-moon"></div><img class="halloween-jason" src="${assetUrl('jason-outline.png')}" alt="Ilustración de Jason Voorhees"><img class="halloween-ghost" src="${assetUrl('ghost.png')}" alt=""></div><div class="halloween-dialog-body"><span class="eyebrow">SEMANA DEL TERROR · CABAÑA</span><h2 id="halloween-title">Hay alguien<br>fuera de la cabaña.</h2><p>Luces cálidas, sombras violetas y una visita de Jason. ¿Quieres darle un toque de Halloween a tus próximas historias?</p><div class="halloween-choice"><button class="button primary" data-halloween="activate">Activar modo Halloween ${app.svg('right')}</button><button class="button outline" data-close="halloween-dialog">Seguir con mi tema</button></div><small>Es opcional. Puedes volver a Azul noche o Claro desde la fogata.</small></div>`;
  dialog().showModal();
}
export function setupHalloween(context){
  app=context;
  document.querySelector('#halloween-toggle').addEventListener('click',()=>active()?exit():open());
  document.addEventListener('click',event=>{
    const action=event.target.closest('[data-halloween]')?.dataset.halloween;
    if(action==='open')open();if(action==='activate')activate();if(action==='exit')exit();
    if(action==='dismiss'){dismissed=true;try{localStorage.setItem(`cabana-halloween-dismissed-${year}`,'true');}catch{}app.render();}
  });
}
