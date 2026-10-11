import {contentImageUrl} from '../paths.js';
import {rasterFormat,compatibleCover} from './image-format.js';

export const imageUploadMarkup = `<section class="image-upload" aria-labelledby="image-upload-title"><h3 id="image-upload-title">Portada del contenido</h3><div class="image-dropzone"><span class="image-upload-symbol" aria-hidden="true">↑</span><strong>Arrastra una imagen aquí</strong><span>o elígela desde tu computadora</span><button type="button" class="button outline" id="choose-image">Subir archivo</button><input id="edit-imageFile" type="file" accept="image/jpeg,image/png,image/webp,image/avif,.jpg,.jpeg,.png,.webp,.avif" hidden><small>Una portada · JPG, PNG, WebP o AVIF · Máximo 5 MB</small></div><div class="image-preview" hidden><img alt="Vista previa de la portada"><div><strong class="image-filename"></strong><span class="image-file-size"></span><button type="button" class="button subtle small" id="remove-image" hidden>Quitar archivo</button></div></div><p class="image-upload-status" role="status" aria-live="polite"></p></section>`;

export function setupImageUpload(form,request) {
  const input=form.querySelector('#edit-imageFile'),field=form.querySelector('#edit-imageUrl');
  const zone=form.querySelector('.image-dropzone'),preview=form.querySelector('.image-preview');
  const status=form.querySelector('.image-upload-status'),remove=form.querySelector('#remove-image');
  let selected=null,objectUrl=null,disposed=false,selection=0,pending=Promise.resolve(),busy=false;
  function revoke(){if(objectUrl)URL.revokeObjectURL(objectUrl);objectUrl=null;}
  function current(){
    preview.hidden=!field.value.trim();remove.hidden=true;
    if(!preview.hidden){preview.querySelector('img').src=contentImageUrl(field.value.trim());preview.querySelector('.image-filename').textContent='Portada seleccionada';preview.querySelector('.image-file-size').textContent='Puedes conservarla o elegir otra imagen.';}
  }
  function reset(){selection++;selected=null;input.value='';revoke();current();status.textContent='';status.classList.remove('error');}
  async function select(files){
    if(busy||disposed)return;
    selected=null;revoke();current();
    const id=++selection;
    status.classList.remove('error');
    if(files.length!==1){status.textContent='Elige una sola imagen para la portada.';status.classList.add('error');return;}
    const file=files[0];
    if(file.size>5*1024*1024){status.textContent='La imagen supera el máximo de 5 MB.';status.classList.add('error');input.value='';return;}
    let url;
    try {
      status.textContent='Preparando imagen…';
      const format=await rasterFormat(file);
      if(!format)throw new Error('No se pudo leer la imagen. Elige un archivo JPG, PNG, WebP o AVIF válido.');
      if(disposed||id!==selection)return;
      url=URL.createObjectURL(new Blob([file],{type:`image/${format}`}));
      const image=new Image();image.src=url;
      try{await image.decode();}catch{throw new Error('Tu navegador no pudo abrir esta imagen. Prueba con una versión JPG o PNG.');}
      if(disposed||id!==selection){URL.revokeObjectURL(url);return;}
      if(image.naturalWidth>6000||image.naturalHeight>6000||image.naturalWidth*image.naturalHeight>24000000)throw new Error('La imagen es demasiado grande. Elige una portada de hasta 6000 px y 24 megapíxeles.');
      const prepared=await compatibleCover(file,image,format);
      if(disposed||id!==selection){URL.revokeObjectURL(url);return;}
      if(prepared.file.size>5*1024*1024)throw new Error('La imagen preparada supera el máximo de 5 MB. Elige una más pequeña.');
      if(prepared.converted){URL.revokeObjectURL(url);url=URL.createObjectURL(prepared.file);}
      revoke();objectUrl=url;selected=prepared.file;preview.hidden=false;remove.hidden=false;
      preview.querySelector('img').src=url;preview.querySelector('.image-filename').textContent=file.name;
      preview.querySelector('.image-file-size').textContent=selected.size<1024*1024?`${Math.max(1,Math.round(selected.size/1024))} KB`:`${(selected.size/1024/1024).toFixed(1)} MB`;
      status.textContent=prepared.converted?`Imagen lista. Se convirtió a ${selected.type==='image/png'?'PNG':'JPG'} para subirla al guardar.`:'Imagen lista. Se subirá al guardar el contenido.';
    }catch(error){
      if(url)URL.revokeObjectURL(url);
      if(!disposed&&id===selection){input.value='';status.textContent=error.message;status.classList.add('error');}
    }
  }
  form.querySelector('#choose-image').addEventListener('click',()=>input.click());
  input.addEventListener('change',()=>{pending=select(input.files);});
  remove.addEventListener('click',reset);
  field.addEventListener('input',reset);
  for(const event of ['dragenter','dragover'])zone.addEventListener(event,e=>{e.preventDefault();zone.classList.add('dragging');});
  zone.addEventListener('dragleave',e=>{if(!zone.contains(e.relatedTarget))zone.classList.remove('dragging');});
  zone.addEventListener('drop',e=>{e.preventDefault();zone.classList.remove('dragging');pending=select(e.dataTransfer.files);});
  current();
  return {
    useExisting(path){field.value=path;reset();},
    async upload(){
      await pending;busy=true;
      if(!selected){if(!field.value.trim())throw new Error('Elige una portada antes de guardar.');return field.value.trim();}
      status.classList.remove('error');status.textContent='Subiendo portada…';
      const body=new FormData();body.append('file',selected);
      try {
        const result=await request('/admin/images',{method:'POST',body,timeout:60000});
        field.value=result.imageUrl;selected=null;input.value='';revoke();current();
        status.textContent='Portada subida. Guardando el contenido…';return result.imageUrl;
      }catch(error){status.textContent=error.message;status.classList.add('error');throw error;}
    },
    release(){busy=false;},
    dispose(){disposed=true;selection++;revoke();}
  };
}
