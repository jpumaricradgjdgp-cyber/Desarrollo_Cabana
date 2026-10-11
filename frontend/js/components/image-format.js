// Inspect raster signatures instead of trusting a downloaded file's extension.
export async function rasterFormat(file) {
  const bytes=new Uint8Array(await file.slice(0,512).arrayBuffer());
  const text=(start,end)=>String.fromCharCode(...bytes.slice(start,end));
  if(bytes.length>=3&&bytes[0]===255&&bytes[1]===216&&bytes[2]===255)return 'jpeg';
  if([137,80,78,71,13,10,26,10].every((b,i)=>bytes[i]===b))return 'png';
  if(text(0,4)==='RIFF'&&text(8,12)==='WEBP')return 'webp';
  if(bytes.length>=16&&text(4,8)==='ftyp') {
    const end=Math.min(new DataView(bytes.buffer).getUint32(0),bytes.length);
    for(let offset=8;offset+4<=end;offset+=4) {
      if(offset===12)continue; // Minor version is not a compatible brand.
      if(['avif','avis'].includes(text(offset,offset+4)))return 'avif';
    }
  }
  return null;
}

export async function compatibleCover(file,image,format) {
  if(format==='jpeg'||format==='png')return {file,converted:false};
  const scale=Math.min(1,1920/Math.max(image.naturalWidth,image.naturalHeight));
  const canvas=document.createElement('canvas');
  canvas.width=Math.max(1,Math.round(image.naturalWidth*scale));
  canvas.height=Math.max(1,Math.round(image.naturalHeight*scale));
  const context=canvas.getContext('2d');
  if(!context)throw new Error('No se pudo preparar la imagen. Prueba con otro archivo.');
  context.fillStyle='#fff';context.fillRect(0,0,canvas.width,canvas.height);
  context.drawImage(image,0,0,canvas.width,canvas.height);
  const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/jpeg',0.92));
  if(!blob)throw new Error('No se pudo convertir la imagen. Prueba con otro archivo.');
  const png=blob.type==='image/png';
  const name=(file.name.replace(/\.[^.]+$/,'')||'portada')+(png?'.png':'.jpg');
  return {file:new File([blob],name,{type:blob.type}),converted:true};
}
