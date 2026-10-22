// One rendering implementation for editor preview and exported PNG pixels.
export function fillStyle(ctx, fill, w, h) {
  if (fill && typeof fill === 'object' && fill.type === 'linear') {
    const angle = (Number(fill.angle) || 0) * Math.PI / 180, c = Math.cos(angle), s = Math.sin(angle);
    const cx = w / 2, cy = h / 2, radius = (Math.abs(w*c) + Math.abs(h*s))/2;
    const gradient = ctx.createLinearGradient(cx-radius*c,cy-radius*s,cx+radius*c,cy+radius*s);
    (fill.colors || ['#ffffff','#000000']).forEach((color,i,arr)=>gradient.addColorStop(i/(arr.length-1 || 1),color));
    return gradient;
  }
  return fill || 'transparent';
}
export function wrapText(ctx, text, width, letterSpacing=0) {
  const result = [];
  function measure(s) { return ctx.measureText(s).width + Math.max(0, s.length-1)*letterSpacing; }
  for (const paragraph of String(text).split('\n')) {
    if (!paragraph) { result.push(''); continue; }
    let line = '';
    for (const word of paragraph.split(/(\s+)/)) {
      if (!word) continue;
      const next = line + word;
      if (measure(next) <= width) { line=next; continue; }
      if (line.trim()) { result.push(line.trimEnd()); line=''; }
      const candidate = word.trimStart();
      if (!candidate) continue;
      if (measure(candidate) <= width) { line=candidate; continue; }
      for (const char of candidate) {
        if (line && measure(line+char)>width) {result.push(line);line='';}
        line+=char;
      }
    }
    result.push(line.trimEnd());
  }
  return result;
}
function drawTracked(ctx, text, x, y, space, mode, outline) {
  if(!space) { if(outline)ctx.strokeText(text,x,y);ctx.fillText(text,x,y);return; }
  const glyphs=Array.from(text), widths=glyphs.map(c=>ctx.measureText(c).width);
  const full=widths.reduce((a,b)=>a+b,0)+space*Math.max(0,glyphs.length-1);
  let cur=mode==='center'?x-full/2:mode==='right'?x-full:x;
  ctx.textAlign='left';
  glyphs.forEach((g,i)=>{if(outline)ctx.strokeText(g,cur,y);ctx.fillText(g,cur,y);cur+=widths[i]+space;});
}
function drawText(ctx,e) {
  const fontSize=e.fontSize || 42, family=e.fontFamily || 'Arial', weight=e.fontWeight || 400;
  ctx.font = (e.italic?'italic ':'') + weight+' '+fontSize+'px "'+family.replace(/["\\]/g,'')+'"';
  ctx.textBaseline='alphabetic';ctx.textAlign=e.textAlign || 'left';
  const lineHeight=fontSize*(e.lineHeight || 1.1), space=Number(e.letterSpacing)||0;
  const lines=wrapText(ctx,e.text || '',Math.max(1,e.w-8),space);
  const fullHeight=lines.length*lineHeight;
  let top=0;
  if(e.verticalAlign==='middle')top=Math.max(0,(e.h-fullHeight)/2);
  if(e.verticalAlign==='bottom')top=Math.max(0,e.h-fullHeight);
  ctx.beginPath();ctx.rect(0,0,e.w,e.h);ctx.clip();
  ctx.fillStyle=e.color || '#ffffff';
  ctx.lineJoin='round';ctx.lineWidth=(e.outlineWidth||0)*2;ctx.strokeStyle=e.outlineColor || '#000000';
  const align=e.textAlign || 'left', x=align==='center'?e.w/2:align==='right'?e.w-4:4;
  for(let i=0;i<lines.length;i++){
    const y=top+fontSize*.84+i*lineHeight;
    if(y > e.h+fontSize)break;
    drawTracked(ctx,lines[i],x,y,space,align,(e.outlineWidth||0)>0);
  }
}
function pathShape(ctx,e) {
  ctx.beginPath();
  if(e.type==='ellipse')ctx.ellipse(0,0,e.w/2,e.h/2,0,0,Math.PI*2);
  else ctx.rect(-e.w/2,-e.h/2,e.w,e.h);
}
function drawMedia(ctx,e,resources) {
  const image=resources?.images?.get(e.assetId);
  if(!image || !image.naturalWidth){ drawPlaceholder(ctx,e,'MEDIA NOT LOADED');return; }
  const c=e.crop || {x:0,y:0,w:1,h:1};
  let sx=c.x*image.naturalWidth,sy=c.y*image.naturalHeight,sw=c.w*image.naturalWidth,sh=c.h*image.naturalHeight;
  ctx.beginPath();ctx.rect(-e.w/2,-e.h/2,e.w,e.h);ctx.clip();
  const sourceAR=sw/sh,destAR=e.w/e.h;
  let dx=-e.w/2,dy=-e.h/2,dw=e.w,dh=e.h;
  if(e.fit==='contain'){
    if(sourceAR>destAR){dh=e.w/sourceAR;dy=-dh/2;}else{dw=e.h*sourceAR;dx=-dw/2;}
  }else if(e.fit !== 'stretch'){
    if(sourceAR>destAR){const width=sh*destAR;sx+=(sw-width)/2;sw=width;}
    else {const height=sw/destAR;sy+=(sh-height)/2;sh=height;}
  }
  ctx.drawImage(image,sx,sy,sw,sh,dx,dy,dw,dh);
  if(e.borderWidth>0) {ctx.strokeStyle=e.borderColor||'#ffffff';ctx.lineWidth=e.borderWidth;ctx.strokeRect(-e.w/2,-e.h/2,e.w,e.h);}
}
function drawPlaceholder(ctx,e,label='DROP IMAGE HERE'){
  const x=-e.w/2,y=-e.h/2;
  ctx.fillStyle=fillStyle(ctx,e.fill,e.w,e.h);ctx.fillRect(x,y,e.w,e.h);
  ctx.strokeStyle=e.borderColor || '#6ce3b1';ctx.lineWidth=Math.max(2,e.borderWidth||2);ctx.setLineDash([14,10]);ctx.strokeRect(x+8,y+8,e.w-16,e.h-16);ctx.setLineDash([]);
  const size=Math.max(15,Math.min(30,e.w/14));ctx.font='600 '+size+'px Arial';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#c8ffe9';
  ctx.fillText(label,0,0,Math.max(25,e.w-30));
}
export function drawScene(ctx,doc,resources={images:new Map()}) {
  ctx.save();
  ctx.fillStyle=doc.background || '#111827';ctx.fillRect(0,0,doc.width,doc.height);
  for(const e of doc.elements){
    if(e.hidden)continue;
    ctx.save();
    const cx=e.x+e.w/2,cy=e.y+e.h/2;
    ctx.translate(cx,cy);ctx.rotate((e.rotation||0)*Math.PI/180);
    ctx.globalAlpha=Number.isFinite(e.opacity)?e.opacity:1;
    ctx.shadowColor=e.shadowColor||'transparent';ctx.shadowBlur=Math.max(0,e.shadowBlur||0);
    ctx.shadowOffsetX=e.shadowX||0;ctx.shadowOffsetY=e.shadowY||0;
    if(e.type==='text'){
      ctx.translate(-e.w/2,-e.h/2);
      drawText(ctx,e);
    }else if(e.type==='image'){
      drawMedia(ctx,e,resources);
    }else if(e.type==='placeholder'){
      drawPlaceholder(ctx,e);
    }else{
      pathShape(ctx,e);
      ctx.fillStyle=fillStyle(ctx,e.fill,e.w,e.h);ctx.fill();
      if(e.borderWidth>0){ctx.lineWidth=e.borderWidth;ctx.strokeStyle=e.borderColor||'#ffffff';ctx.stroke();}
    }
    ctx.restore();
  }
  ctx.restore();
}
export function drawOverlay(ctx,doc,selected=[],scale=1,guides=true) {
  ctx.save();ctx.lineWidth=Math.max(1,2/scale);ctx.strokeStyle='#6eb0ff';
  const radius=5/scale;
  for(const e of doc.elements.filter(e=>selected.includes(e.id) && !e.hidden)){
    ctx.save();ctx.translate(e.x+e.w/2,e.y+e.h/2);ctx.rotate((e.rotation||0)*Math.PI/180);
    ctx.strokeRect(-e.w/2,-e.h/2,e.w,e.h);
    ctx.fillStyle=e.locked?'#fbbf24':'#e8f5ff';
    for(const [x,y] of handlePoints(e)){
      ctx.fillRect(x-radius,y-radius,radius*2,radius*2);ctx.strokeRect(x-radius,y-radius,radius*2,radius*2);
    }
    if(!e.locked){
      ctx.beginPath();ctx.moveTo(0,-e.h/2);ctx.lineTo(0,-e.h/2-32/scale);ctx.stroke();
      ctx.beginPath();ctx.arc(0,-e.h/2-32/scale,7/scale,0,Math.PI*2);ctx.fill();ctx.stroke();
    }
    ctx.restore();
  }
  if(guides){
    ctx.strokeStyle='rgba(128,182,255,.35)';ctx.setLineDash([10/scale,8/scale]);ctx.lineWidth=1/scale;
    ctx.beginPath();ctx.moveTo(doc.width/2,0);ctx.lineTo(doc.width/2,doc.height);ctx.moveTo(0,doc.height/2);ctx.lineTo(doc.width,doc.height/2);ctx.stroke();
  }
  ctx.restore();
}
export function handlePoints(e) {
  const x=e.w/2,y=e.h/2;
  return [[-x,-y],[0,-y],[x,-y],[x,0],[x,y],[0,y],[-x,y],[-x,0]];
}
export function renderAt(ctx,doc,resources,pixelW,pixelH,overlays=null){
  ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,pixelW,pixelH);
  ctx.setTransform(pixelW/doc.width,0,0,pixelH/doc.height,0,0);
  drawScene(ctx,doc,resources);
  if(overlays)drawOverlay(ctx,doc,overlays.ids,overlays.scale,overlays.guides);
  ctx.setTransform(1,0,0,1,0,0);
}
export async function exportPng(doc,resources,width,height){
  if(!Number.isInteger(width)||!Number.isInteger(height)||width<1||height<1||width>10000||height>10000||width*height>100_000_000)throw Error('Unsupported export dimensions');
  const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
  const ctx=canvas.getContext('2d');if(!ctx)throw Error('Canvas rendering unavailable');
  renderAt(ctx,doc,resources,width,height);
  const blob=await new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(Error('PNG encoding failed')),'image/png'));
  canvas.width=0;canvas.height=0;return blob;
}
