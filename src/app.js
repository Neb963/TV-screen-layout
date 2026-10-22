import { createDocument, makeElement, deepCopy, uuid, clamp, bounds, localPoint, hitTest, selectionIds, translate, duplicate, group, ungroup, alignElements, validateDocument, parseProject, serializeProject, createHistory } from './model.js';
import { BUILT_INS, instantiatePreset, instantiateCustomPreset } from './presets.js';
import { renderAt, exportPng, handlePoints, selectionFrame } from './renderer.js';
import { importImage, importFont, loadResources } from './assets.js';

const $=id=>document.getElementById(id);
const canvas=$('sceneCanvas'),viewport=$('viewport'),stage=$('stage'),inspector=$('inspector');
const leftSidebar=$('leftSidebar'),rightSidebar=$('rightSidebar');
const defaults=['Arial','Arial Narrow','Helvetica','Verdana','Georgia','Times New Roman','Trebuchet MS','Impact','Tahoma','Courier New'];
const STORAGE='framecraft-autosave-v1', PRESETS='framecraft-custom-presets-v1', CHANNELS='framecraft-channels-v1';
const html=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const num=(v,fallback=0)=>Number.isFinite(Number(v))?Number(v):fallback;
const fld=(label,key,val,{min=-100000,max=100000,step='any',disabled=false}={})=>'<div class="field"><label>'+html(label)+'<input data-field="'+html(key)+'" type="number" value="'+html(val)+'" min="'+min+'" max="'+max+'" step="'+step+'" '+(disabled?'disabled':'')+'></label></div>';
const txtfld=(label,key,val,disabled=false)=>'<div class="field"><label>'+html(label)+'<input data-field="'+html(key)+'" value="'+html(val)+'" '+(disabled?'disabled':'')+'></label></div>';
const colorfld=(label,key,val,disabled=false)=>'<div class="field"><label>'+html(label)+'<input type="color" data-field="'+html(key)+'" value="'+html(/^#[a-f0-9]{6}$/i.test(val)?val:'#ffffff')+'" '+(disabled?'disabled':'')+'></label></div>';
const selectfld=(label,key,val,values,disabled=false)=>'<div class="field"><label>'+html(label)+'<select data-field="'+html(key)+'" '+(disabled?'disabled':'')+'>'+values.map(([v,t])=>'<option value="'+html(v)+'" '+(v===String(val)?'selected':'')+'>'+html(t)+'</option>').join('')+'</select></label></div>';
const announce=(message,error=false)=>{const t=$('toast');t.textContent=message;t.classList.toggle('error',error);t.hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.hidden=true,4300);$('statusText').textContent=message;};
let toastTimer,autosaveTimer,raf=0;
let scene=instantiatePreset('atlantic'),history=createHistory(scene),resources={images:new Map()},selected=[],clipboard=[];
let viewportState={zoom:1,panX:0,panY:0,fit:1},activeTool='select',spaceDown=false,pointer=null,dirty=false;
let sceneReplacementEpoch=0;
let cropMode=false;
let customPresets=readCatalog(PRESETS),savedChannels=readCatalog(CHANNELS);

function readCatalog(key){try{const value=JSON.parse(localStorage.getItem(key)||'[]');return Array.isArray(value)?value:[];}catch{return [];}}
function writeCatalog(key,value){try{localStorage.setItem(key,JSON.stringify(value));return true;}catch(err){announce('Local storage full; export the project to keep your work: '+err.message,true);return false;}}
function scheduleSave(){clearTimeout(autosaveTimer);autosaveTimer=setTimeout(()=>{try{localStorage.setItem(STORAGE,serializeProject(scene));}catch(err){announce('Autosave unavailable (storage limit). Download your project to preserve it.',true);}},600);}
function commit(next,{refresh=true}={}){
  validateDocument(next);
  const changed=history.commit(next);if(!changed)return false;
  scene=history.value;dirty=true;scheduleSave();if(refresh)updateUI();else requestDraw();
  return true;
}
function change(fn,refresh=true){const next=deepCopy(scene);fn(next);return commit(next,{refresh});}
function afterHistory(){scene=history.value;selected=selected.filter(id=>scene.elements.some(e=>e.id===id));dirty=true;updateUI();scheduleSave();}
function undo(){if(history.undo())afterHistory();}
function redo(){if(history.redo())afterHistory();}
function clearSelection(){selected=[];updateUI();}
function setSelection(ids){cropMode=false;selected=[...new Set(ids)].filter(id=>scene.elements.some(e=>e.id===id));updateUI();}
function onlySelected(){return scene.elements.find(e=>e.id===selected[0]);}
function localToWorld(e,x,y){const r=e.rotation*Math.PI/180,cx=e.x+e.w/2,cy=e.y+e.h/2;return {x:cx+x*Math.cos(r)-y*Math.sin(r),y:cy+x*Math.sin(r)+y*Math.cos(r)};}
function scaled(){return viewportState.fit*viewportState.zoom;}
function computeFit(){viewportState.fit=Math.max(.05,Math.min((viewport.clientWidth-74)/scene.width,(viewport.clientHeight-74)/scene.height));}
function draw(){
  raf=0;const scale=scaled(),w=Math.max(1,scene.width*scale),h=Math.max(1,scene.height*scale),dpr=Math.min(devicePixelRatio||1,2);
  stage.style.width=w+'px';stage.style.height=h+'px';
  stage.style.transform='translate(-50%,-50%) translate('+viewportState.panX+'px,'+viewportState.panY+'px)';
  const pw=Math.max(1,Math.round(w*dpr)),ph=Math.max(1,Math.round(h*dpr));
  if(canvas.width!==pw)canvas.width=pw;if(canvas.height!==ph)canvas.height=ph;
  canvas.style.width=w+'px';canvas.style.height=h+'px';
  const ctx=canvas.getContext('2d');if(!ctx){announce('Canvas 2D context unavailable',true);return;}
  renderAt(ctx,scene,resources,pw,ph,{ids:selected,scale,guides:$('guidesToggle').checked});
  $('zoomLabel').textContent=Math.round(100*scale)+'%';
  $('canvasSize').textContent=scene.width+' × '+scene.height;
  $('emptyState').hidden=scene.elements.length!==0;
}
function requestDraw(){if(!raf)raf=requestAnimationFrame(draw);}
function centerView(){viewportState.zoom=1;viewportState.panX=0;viewportState.panY=0;computeFit();requestDraw();}
function zoomBy(factor){viewportState.zoom=clamp(viewportState.zoom*factor,.1,8);requestDraw();}
function screenPoint(ev){const box=canvas.getBoundingClientRect();return {x:(ev.clientX-box.left)*scene.width/box.width,y:(ev.clientY-box.top)*scene.height/box.height};}
function status(){const count=selected.length;$('selectionCount').textContent=count?count+' selected':'No selection';$('statusText').textContent=count?count+' element'+(count===1?'':'s')+' selected · '+scene.elements.length+' total':'Select an element to edit · '+scene.elements.length+' layers';}
function updateUI(){renderLayers();renderInspector();renderChannelPanel();$('projectTitle').value=scene.title;status();for(const act of ['undo','redo']){const b=document.querySelector('[data-action="'+act+'"]');b.disabled=act==='undo'?!history.canUndo:!history.canRedo;}requestDraw();}
function optionsFonts(){return [...new Set([...defaults,...Object.values(scene.fonts).map(f=>f.family)])].map(f=>[f,f]);}
function renderPresets(){
 const list=$('presetList');list.replaceChildren();
 for(const p of BUILT_INS){const item=document.createElement('button');item.className='preset';const theme=p.make().channel;
   item.innerHTML='<div class="preset-swatch" style="--pcolor:'+html(theme.primary)+';--acol:'+html(theme.accent)+'"><i></i><b></b><em></em></div><span class="preset-copy"><strong>'+html(p.label)+'</strong><small>'+html(p.description)+'</small></span>';
   item.addEventListener('click',async()=>{if(!confirmReplacement())return;await replaceScene(instantiatePreset(p.id));announce('Loaded '+p.label);});
   list.append(item);
 }
 renderCustomPresets();
}
function renderCustomPresets(){
 const list=$('customPresetList');list.replaceChildren();
 for(let i=0;i<customPresets.length;i++){const p=customPresets[i],wrap=document.createElement('div');wrap.className='stack-inline';
 const use=document.createElement('button');use.className='preset';use.textContent=p.name;use.addEventListener('click',async()=>{if(!confirmReplacement())return;try{await replaceScene(instantiateCustomPreset(p.scene));announce('Loaded custom preset');}catch(err){announce(err.message,true);}});
 const del=document.createElement('button');del.className='preset-delete';del.textContent='×';del.title='Delete saved preset';del.addEventListener('click',()=>{if(confirm('Delete saved preset "'+p.name+'"?')){customPresets.splice(i,1);writeCatalog(PRESETS,customPresets);renderCustomPresets();}});
 wrap.append(use,del);list.append(wrap);
 }
}
function renderLayers(){
 const list=$('layerList');list.replaceChildren();$('layerCount').textContent=scene.elements.length;
 for(const e of [...scene.elements].reverse()){
  const row=document.createElement('div');row.className='layer-row'+(selected.includes(e.id)?' selected':'');
  const icon=document.createElement('span');icon.className='layer-icon';icon.textContent=({text:'T',image:'▧',placeholder:'▣',rect:'▭',ellipse:'◯'})[e.type];
  const choice=document.createElement('button');choice.className='layer-select';choice.title=e.name;choice.innerHTML='<span>'+html(e.name)+'</span><small>'+html(e.type)+(e.groupId?' · grouped':'')+'</small>';
  choice.addEventListener('click',ev=>{const ids=selectionIds(scene,e.id);setSelection(ev.shiftKey?[...selected.filter(id=>!ids.includes(id)),...(!ids.every(id=>selected.includes(id))?ids:[])]:ids);});
  const eye=document.createElement('button');eye.className='layer-state';eye.title=e.hidden?'Show layer':'Hide layer';eye.setAttribute('aria-label',eye.title);eye.textContent=e.hidden?'◌':'◉';eye.addEventListener('click',()=>change(d=>{d.elements.find(x=>x.id===e.id).hidden=!e.hidden;}));
  const lock=document.createElement('button');lock.className='layer-state';lock.title=e.locked?'Unlock layer':'Lock layer';lock.setAttribute('aria-label',lock.title);lock.textContent=e.locked?'▣':'♧';lock.addEventListener('click',()=>change(d=>{d.elements.find(x=>x.id===e.id).locked=!e.locked;}));
  row.append(icon,choice,eye,lock);list.append(row);
 }
}
function renderInspector(){
 const e=selected.length===1?onlySelected():null;
 if(!e){inspector.innerHTML='<div class="inspector-placeholder"><div class="inspector-symbol">◎</div><h3>'+ (selected.length?'Multiple layers selected':'Select an element')+'</h3><p>'+(selected.length?'Move, align, group or duplicate this selection. Select one element to inspect its detailed properties.':'Choose a layer or click the composition to edit geometry, media, and style.')+'</p></div>';return;}
 const disabled=e.locked;
 let out='<div class="inspector-section"><h3>Layer</h3>'+txtfld('Name','name',e.name,disabled)+
 '<div class="inspector-button-row"><button data-inspector-action="toggle-lock">'+(e.locked?'Unlock':'Lock')+'</button><button data-inspector-action="duplicate">Duplicate</button></div></div>';
 out+='<div class="inspector-section"><h3>Geometry · source pixels</h3><div class="field-grid">'+
 fld('X','x',round(e.x),{disabled})+fld('Y','y',round(e.y),{disabled})+fld('Width','w',round(e.w),{min:1,disabled})+
 fld('Height','h',round(e.h),{min:1,disabled})+fld('Rotation (°)','rotation',round(e.rotation),{min:-3600,max:3600,disabled})+
 fld('Opacity (%)','opacity',round(e.opacity*100),{min:0,max:100,disabled})+'</div></div>';
 if(e.type==='text'){
  out+='<div class="inspector-section"><h3>Typography</h3><div class="field"><label>Text content<textarea data-field="text" rows="4" '+(disabled?'disabled':'')+'>'+html(e.text)+'</textarea></label></div>'+
  selectfld('Typeface','fontFamily',e.fontFamily,optionsFonts(),disabled)+
  '<button data-inspector-action="font" class="wide">Import a font</button><div class="field-grid">'+
  fld('Font size','fontSize',round(e.fontSize),{min:1,max:500,disabled})+
  fld('Font weight','fontWeight',e.fontWeight,{min:100,max:900,step:100,disabled})+
  fld('Line height','lineHeight',e.lineHeight,{min:.1,max:5,step:.01,disabled})+
  fld('Letter spacing','letterSpacing',e.letterSpacing,{min:-20,max:100,disabled})+'</div>'+
  selectfld('Horizontal align','textAlign',e.textAlign,[['left','Left'],['center','Center'],['right','Right']],disabled)+
  selectfld('Vertical align','verticalAlign',e.verticalAlign,[['top','Top'],['middle','Middle'],['bottom','Bottom']],disabled)+
  '<label class="compact-toggle"><input data-field="italic" type="checkbox" '+(e.italic?'checked':'')+' '+(disabled?'disabled':'')+'> Italic</label><div class="field-grid">'+
  colorfld('Text color','color',e.color,disabled)+colorfld('Outline color','outlineColor',e.outlineColor,disabled)+
  fld('Outline width','outlineWidth',e.outlineWidth,{min:0,max:50,disabled})+'</div></div>';
 }
 if(e.type==='image'||e.type==='placeholder'){
  out+='<div class="inspector-section"><h3>Image content</h3><button data-inspector-action="replace-image" class="wide" '+(disabled?'disabled':'')+'>'+(e.type==='placeholder'?'Fill image frame':'Replace image')+'</button>';
  if(e.type==='image'){
   out+='<div class="inspector-button-row"><button data-inspector-action="crop-mode" '+(cropMode?'class="active" ':'')+'title="Drag within image to reposition its crop window">'+(cropMode?'Exit crop mode':'Drag crop')+'</button><button data-inspector-action="zoom-crop-in" title="Zoom in within original image">Zoom +</button><button data-inspector-action="zoom-crop-out" title="Zoom out within original image">Zoom −</button></div>'+selectfld('Image fit','fit',e.fit,[['cover','Cover (crop to frame)'],['contain','Contain (letterbox)'],['stretch','Stretch to frame']],disabled)+
    '<div class="select-hint">Crop is a normalized source-image window. Cover crops further to fit the frame.</div><div class="field-grid">'+
    fld('Crop left (%)','crop.x',round(e.crop.x*100),{min:0,max:99,disabled})+
    fld('Crop top (%)','crop.y',round(e.crop.y*100),{min:0,max:99,disabled})+
    fld('Crop width (%)','crop.w',round(e.crop.w*100),{min:1,max:100,disabled})+
    fld('Crop height (%)','crop.h',round(e.crop.h*100),{min:1,max:100,disabled})+'</div>';
  }out+='</div>';
 }
 if(e.type==='rect'||e.type==='ellipse'||e.type==='placeholder'){
  const gradient=e.fill&&typeof e.fill==='object'&&e.fill.type==='linear';
  out+='<div class="inspector-section"><h3>Appearance</h3>'+
  selectfld('Fill style','fillType',gradient?'gradient':'solid',[['solid','Solid'],['gradient','Linear gradient']],disabled);
  if(gradient)out+='<div class="field-grid">'+colorfld('Start','gradient0',e.fill.colors[0],disabled)+colorfld('End','gradient1',e.fill.colors.at(-1),disabled)+fld('Angle (°)','gradientAngle',e.fill.angle||0,{disabled})+'</div>';
  else out+=colorfld('Fill color','fill',e.fill,disabled);
  out+='</div>';
 }
 out+='<div class="inspector-section"><h3>Stroke and shadow</h3><div class="field-grid">'+
  colorfld('Stroke color','borderColor',e.borderColor,disabled)+fld('Stroke width','borderWidth',e.borderWidth,{min:0,max:100,disabled})+
  colorfld('Shadow color','shadowColor',e.shadowColor,disabled)+fld('Shadow blur','shadowBlur',e.shadowBlur,{min:0,max:200,disabled})+
  fld('Shadow X','shadowX',e.shadowX,{disabled})+fld('Shadow Y','shadowY',e.shadowY,{disabled})+'</div></div>';
 inspector.innerHTML=out;
}
const round=v=>Math.round(v*100)/100;
function renderChannelPanel(){
 const c=scene.channel;
 $('channelName').value=c.name||'';$('channelPrimary').value=c.primary||'#1948ad';$('channelAccent').value=c.accent||'#ed233b';$('channelDark').value=c.dark||'#071638';$('channelLight').value=c.light||'#ffffff';
 $('channelFont').innerHTML=optionsFonts().map(([v,t])=>'<option value="'+html(v)+'" '+(v===c.fontFamily?'selected':'')+'>'+html(t)+'</option>').join('');
 const list=$('savedChannelList');list.replaceChildren();
 savedChannels.forEach((item,i)=>{
  const row=document.createElement('div');row.className='stack-inline';
  const use=document.createElement('button');use.className='preset';use.textContent=item.name;use.addEventListener('click',async()=>{
   try{await useChannel(item);announce('Applied '+item.name);}catch(err){announce(err.message,true);}
  });
  const del=document.createElement('button');del.textContent='×';del.title='Delete identity';del.addEventListener('click',()=>{if(confirm('Delete identity "'+item.name+'"?')){savedChannels.splice(i,1);writeCatalog(CHANNELS,savedChannels);renderChannelPanel();}});
  row.append(use,del);list.append(row);
 });
}
function applyChannel(doc,channel){
 doc.channel=deepCopy(channel);
 for(const e of doc.elements){
   if(['primary','accent','dark','light'].includes(e.role))e.fill=channel[e.role];
   if(e.role==='logo'){
     if(channel.logoAssetId){e.type='image';e.assetId=channel.logoAssetId;e.fit='contain';}
     else{e.type='text';e.assetId=null;e.text=channel.name;e.color=channel.light;}
   }
   if(e.type==='text')e.fontFamily=channel.fontFamily || 'Arial';
 }
}
async function useChannel(item){
 let channel=deepCopy(item.channel),logo=null,font=null;
 if(item.logo){logo=deepCopy(item.logo);logo.id=uuid();channel.logoAssetId=logo.id;}
 if(item.font){font=deepCopy(item.font);font.id=uuid();}
 const next=deepCopy(scene);
 if(logo)next.assets[logo.id]=logo;
 if(font)next.fonts[font.id]=font;
 applyChannel(next,channel);
 const newRes=await loadResources(next);resources=newRes;commit(next);
}
function readChannelForm(){return {...deepCopy(scene.channel),name:$('channelName').value.trim()||'UNTITLED',primary:$('channelPrimary').value,accent:$('channelAccent').value,dark:$('channelDark').value,light:$('channelLight').value,fontFamily:$('channelFont').value};}
function confirmReplacement(){return !dirty || confirm('Replace your current design? Download an editable project first if you need to keep your changes.');}
async function replaceScene(next){
 validateDocument(next);
 const requestEpoch=++sceneReplacementEpoch;
 const loaded=await loadResources(next);
 // A later New/Open/Preset action must always win, regardless of decoding speed.
 if(requestEpoch!==sceneReplacementEpoch)return;
 resources=loaded;scene=deepCopy(next);history.reset(scene);selected=[];dirty=false;
 centerView();updateUI();scheduleSave();
}
function applyPresetTab(tab){
 for(const button of document.querySelectorAll('[data-tab]')){const active=button.dataset.tab===tab;button.classList.toggle('active',active);button.setAttribute('aria-selected',active);}
 for(const t of ['presets','layers','channels'])$(t+'Panel').hidden=t!==tab;
}
function download(blob,name){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);}
function fileName(){return (scene.title.trim()||'broadcast').replace(/[^a-z0-9._ -]/gi,'').replace(/\s+/g,'-').slice(0,90)||'broadcast';}
function saveProject(){try{const json=serializeProject(scene);download(new Blob([json],{type:'application/json'}),fileName()+'.tvnews.json');dirty=false;announce('Editable project downloaded');}catch(err){announce('Save failed: '+err.message,true);}}
async function openProject(file){if(!file)return;if(!confirmReplacement())return;try{if(file.size>45_000_000)throw Error('Project exceeds 45MB limit');const next=parseProject(await file.text());await replaceScene(next);announce('Project opened; all layers and resources retained');}catch(err){announce('Import failed; previous project preserved: '+err.message,true);}}
async function addImage(file,logo=false){
 if(!file)return;
 const initialEpoch=sceneReplacementEpoch, originalTarget=selected.length===1?selected[0]:null;
 try{
 const asset=await importImage(file);
 if(sceneReplacementEpoch!==initialEpoch)return;
 const next=deepCopy(scene);next.assets[asset.id]=asset;
 let ids=[];
 if(logo){
  const draft=readChannelForm();draft.logoAssetId=asset.id;applyChannel(next,draft);
 }else{
  const target=originalTarget?next.elements.find(e=>e.id===originalTarget):null;
  if(target&&!target.locked&&(target.type==='image'||target.type==='placeholder')){
   target.type='image';target.assetId=asset.id;target.crop={x:0,y:0,w:1,h:1};target.fit='cover';ids=[target.id];
  }else{
   const item=makeElement('image',{name:file.name||'Imported image',x:220,y:170,w:900,h:510,assetId:asset.id});
   next.elements.push(item);ids=[item.id];
  }
 }
 const loaded=await loadResources(next);
 if(sceneReplacementEpoch!==initialEpoch)return;
 resources=loaded;commit(next);if(ids.length)setSelection(ids);announce(logo?'Channel logo embedded in project':'Image imported and embedded');
 }catch(err){announce('Image import rejected: '+err.message,true);}
}
async function addFont(file){
 if(!file)return;
 const initialEpoch=sceneReplacementEpoch, originalTarget=selected.length===1?selected[0]:null;
 try{const font=await importFont(file);
  if(sceneReplacementEpoch!==initialEpoch)return;
  const next=deepCopy(scene);next.fonts[font.id]=font;
  const target=originalTarget?next.elements.find(e=>e.id===originalTarget):null;
  if(target&&target.type==='text'&&!target.locked)target.fontFamily=font.family;
  commit(next);announce('Embedded font '+font.family);
 }catch(err){announce('Font import failed: '+err.message,true);}
}
function addElement(type){
 const item=makeElement(type,{
  name:({text:'New headline',rect:'Rectangle',ellipse:'Ellipse',placeholder:'Image region'})[type],
  x:Math.round(scene.width*.3),y:Math.round(scene.height*.3),
  ...(type==='text'?{w:790,h:135,text:'YOUR HEADLINE',fontSize:67,color:'#ffffff',fill:'transparent'}:
     type==='placeholder'?{w:720,h:410}:{w:450,h:250,fill:'#2564b4'})
 });
 change(doc=>doc.elements.push(item));setSelection([item.id]);applyPresetTab('layers');
}
function activateTool(tool){activeTool=tool;viewport.classList.toggle('pan-mode',tool==='pan');for(const t of ['select','pan']){const b=document.querySelector('[data-action="tool-'+t+'"]');b.classList.toggle('active',tool===t);b.setAttribute('aria-pressed',String(tool===t));}}
function reorder(direction){
 if(!selected.length)return;
 change(doc=>{
  if(direction>0)for(let i=doc.elements.length-2;i>=0;i--){if(selected.includes(doc.elements[i].id)&&!selected.includes(doc.elements[i+1].id))[doc.elements[i],doc.elements[i+1]]=[doc.elements[i+1],doc.elements[i]];}
  else for(let i=1;i<doc.elements.length;i++){if(selected.includes(doc.elements[i].id)&&!selected.includes(doc.elements[i-1].id))[doc.elements[i],doc.elements[i-1]]=[doc.elements[i-1],doc.elements[i]];}
 });
}
function removeSelected(){if(!selected.length)return;change(doc=>{doc.elements=doc.elements.filter(e=>!selected.includes(e.id)||e.locked);});setSelection([]);}
function duplicateSelected(){if(!selected.length)return;let result=[];change(doc=>result=duplicate(doc,selected));setSelection(result);}
function groupSelected(){if(selected.length<2)return;change(doc=>group(doc,selected));announce('Elements grouped');}
function ungroupSelected(){if(!selected.length)return;change(doc=>ungroup(doc,selected));announce('Group dissolved');}
function align(mode){
 if(!selected.length)return;
 change(doc=>alignElements(doc,selected,mode));
}
function snapOffset(doc,ids,dx,dy,alt=false){
 if(!$('snapToggle').checked||alt)return {dx,dy};
 const items=doc.elements.filter(e=>ids.includes(e.id));if(!items.length)return {dx,dy};
 const boxes=items.map(bounds);
 const minx=Math.min(...boxes.map(b=>b.left)),maxx=Math.max(...boxes.map(b=>b.right));
 const miny=Math.min(...boxes.map(b=>b.top)),maxy=Math.max(...boxes.map(b=>b.bottom));
 let outx=Math.round((minx+dx)/10)*10-minx,outy=Math.round((miny+dy)/10)*10-miny;
 const cx=(minx+maxx)/2,cy=(miny+maxy)/2;
 for(const [where,delta,set] of [[0,dx,'x'],[doc.width/2,dx,'x'],[doc.width,dx,'x'],[0,dy,'y'],[doc.height/2,dy,'y'],[doc.height,dy,'y']]){
  const isx=set==='x',points=isx?[minx,cx,maxx]:[miny,cy,maxy];
  for(const p of points)if(Math.abs(p+delta-where)<8){if(isx)outx=where-p;else outy=where-p;break;}
 }
 return {dx:outx,dy:outy};
}
function handleHit(doc,e,x,y){
 if(e.locked)return null;
 const p=localPoint(e,x,y),scale=scaled(),rad=10/scale;
 const points=handlePoints(e).map(([a,b])=>[a+e.w/2,b+e.h/2]);
 for(let i=0;i<points.length;i++)if(Math.hypot(points[i][0]-p.x,points[i][1]-p.y)<rad)return i;
 if(Math.hypot(p.x-e.w/2,p.y+32/scale)<rad*1.5)return 'rotate';
 return null;
}
function startPointer(ev){
 if(ev.button>1)return;
 const panMode=activeTool==='pan'||spaceDown||ev.button===1;
 if(!panMode && !canvas.contains(ev.target)){if(ev.target===viewport)clearSelection();return;}
 const start=panMode?null:screenPoint(ev);
 let handle=null,id=null;
 if(!panMode){
  if(cropMode&&selected.length===1&&onlySelected()?.type==='image'&&hitTest(scene,start.x,start.y)===selected[0])handle='crop';
  else if(selected.length===1){const obj=onlySelected();if(obj)handle=handleHit(scene,obj,start.x,start.y);}
  else if(selected.length>1){const frame=selectionFrame(scene.elements.filter(e=>selected.includes(e.id) && !e.hidden && !e.locked));if(frame)handle=handleHit(scene,frame,start.x,start.y);}
  if(handle===null)id=hitTest(scene,start.x,start.y);
  if(handle===null){
   if(!id){if(!ev.shiftKey)clearSelection();return;}
   const ids=selectionIds(scene,id);
   if(ev.shiftKey){const selectedAlready=ids.every(x=>selected.includes(x));setSelection(selectedAlready?selected.filter(x=>!ids.includes(x)):[...selected,...ids]);return;}
   if(!selected.includes(id))setSelection(ids);
  }
 }
 pointer={id:ev.pointerId,mode:panMode?'pan':handle===null?'drag':handle==='rotate'?'rotate':handle==='crop'?'crop':'resize',start,startClient:{x:ev.clientX,y:ev.clientY},oldPan:{x:viewportState.panX,y:viewportState.panY},
  before:deepCopy(scene),ids:[...selected],handle,moved:false,previousUI:scene};
 viewport.setPointerCapture(ev.pointerId);viewport.classList.toggle('panning',panMode);
 ev.preventDefault();
}
function updatePointer(ev){
 if(!pointer||ev.pointerId!==pointer.id)return;
 const dxClient=ev.clientX-pointer.startClient.x,dyClient=ev.clientY-pointer.startClient.y;
 if(Math.hypot(dxClient,dyClient)>2)pointer.moved=true;
 if(pointer.mode==='pan'){viewportState.panX=pointer.oldPan.x+dxClient;viewportState.panY=pointer.oldPan.y+dyClient;requestDraw();return;}
 const doc={...pointer.before,elements:pointer.before.elements.map(e=>({...e,crop:e.crop?{...e.crop}:e.crop}))},now=screenPoint(ev),dx=now.x-pointer.start.x,dy=now.y-pointer.start.y;
 if(pointer.mode==='drag'){
  const d=snapOffset(doc,pointer.ids,dx,dy,ev.altKey);translate(doc,pointer.ids,d.dx,d.dy);
 }else if(pointer.mode==='crop'){
  const e=doc.elements.find(e=>e.id===pointer.ids[0]),start=pointer.before.elements.find(e=>e.id===pointer.ids[0]);
  if(e?.type==='image'&&!e.locked){
    const p0=localPoint(start,pointer.start.x,pointer.start.y),p1=localPoint(start,now.x,now.y),c=e.crop;
    c.x=clamp(c.x-(p1.x-p0.x)/e.w*c.w,0,1-c.w);
    c.y=clamp(c.y-(p1.y-p0.y)/e.h*c.h,0,1-c.h);
  }
 }else if(pointer.ids.length>1){
  const beforeMembers=pointer.before.elements.filter(e=>pointer.ids.includes(e.id) && !e.locked);
  const frame=selectionFrame(beforeMembers);if(!frame)return;
  const cx=frame.x+frame.w/2,cy=frame.y+frame.h/2;
  if(pointer.mode==='rotate'){
    const a=Math.atan2(pointer.start.y-cy,pointer.start.x-cx),b=Math.atan2(now.y-cy,now.x-cx);
    let diff=(b-a)*180/Math.PI;if(ev.shiftKey)diff=Math.round(diff/15)*15;
    const r=diff*Math.PI/180;
    for(const e of doc.elements.filter(e=>pointer.ids.includes(e.id) && !e.locked)){
      const ex=e.x+e.w/2-cx,ey=e.y+e.h/2-cy;
      e.x=cx+ex*Math.cos(r)-ey*Math.sin(r)-e.w/2;
      e.y=cy+ex*Math.sin(r)+ey*Math.cos(r)-e.h/2;
      e.rotation+=diff;
    }
  }else{
    const pts=handlePoints(frame),idx=pointer.handle,opp=pts[(idx+4)%8];
    const ax=cx+opp[0],ay=cy+opp[1],px=now.x-cx,py=now.y-cy;
    let w=frame.w,h=frame.h;
    if(pts[idx][0]!==0)w=Math.max(10,pts[idx][0]<0?opp[0]-px:px-opp[0]);
    if(pts[idx][1]!==0)h=Math.max(10,pts[idx][1]<0?opp[1]-py:py-opp[1]);
    if(ev.shiftKey&&pts[idx][0]!==0&&pts[idx][1]!==0){
      const ratio=frame.w/frame.h;if(w/h>ratio)w=h*ratio;else h=w/ratio;
    }
    const sx=w/frame.w,sy=h/frame.h,scaleFont=Math.sqrt(sx*sy);
    for(const e of doc.elements.filter(e=>pointer.ids.includes(e.id) && !e.locked)){
      e.x=ax+(e.x-ax)*sx;e.y=ay+(e.y-ay)*sy;
      e.w=Math.max(1,e.w*sx);e.h=Math.max(1,e.h*sy);
      if(e.type==='text')e.fontSize=Math.max(1,e.fontSize*scaleFont);
      e.borderWidth*=scaleFont;e.outlineWidth*=scaleFont;
    }
  }
 }else{
  const e=doc.elements.find(el=>el.id===pointer.ids[0]);if(!e||e.locked)return;
  if(pointer.mode==='rotate'){
   const cx=e.x+e.w/2,cy=e.y+e.h/2;
   const a=Math.atan2(pointer.start.y-cy,pointer.start.x-cx),b=Math.atan2(now.y-cy,now.x-cx);
   e.rotation=Math.round((e.rotation+(b-a)*180/Math.PI)*(ev.shiftKey?.0666667:10))/(ev.shiftKey?.0666667:10);
   if(ev.shiftKey)e.rotation=Math.round(e.rotation/15)*15;
  }else{
   const idx=pointer.handle,pts=handlePoints(e),opp=pts[(idx+4)%8],anchor=localToWorld(e,opp[0],opp[1]),p=localPoint(e,now.x,now.y);
   const px=p.x-e.w/2,py=p.y-e.h/2;let w=e.w,h=e.h;
   if(pts[idx][0]!==0)w=Math.max(10,pts[idx][0]<0?opp[0]-px:px-opp[0]);
   if(pts[idx][1]!==0)h=Math.max(10,pts[idx][1]<0?opp[1]-py:py-opp[1]);
   if(ev.shiftKey&&pts[idx][0]!==0&&pts[idx][1]!==0){const ratio=e.w/e.h;if(w/h>ratio)w=h*ratio;else h=w/ratio;}
   const newOppX=opp[0]>0?w/2:opp[0]<0?-w/2:0,newOppY=opp[1]>0?h/2:opp[1]<0?-h/2:0;
   const r=e.rotation*Math.PI/180;
   const cx=anchor.x-(newOppX*Math.cos(r)-newOppY*Math.sin(r)),cy=anchor.y-(newOppX*Math.sin(r)+newOppY*Math.cos(r));
   e.w=w;e.h=h;e.x=cx-w/2;e.y=cy-h/2;
  }
 }
 scene=doc;requestDraw();
}
function finishPointer(ev,cancel=false){
 if(!pointer||ev.pointerId!==pointer.id)return;
 const before=pointer.before,moved=pointer.moved,mode=pointer.mode;
 if(viewport.hasPointerCapture(ev.pointerId))viewport.releasePointerCapture(ev.pointerId);
 viewport.classList.remove('panning');pointer=null;
 if(cancel){scene=before;requestDraw();announce('Transform cancelled');return;}
 if(moved&&mode!=='pan'){const next=scene;scene=before;commit(next);}
 else if(mode!=='pan'){scene=before;requestDraw();}
}
function setInspectorField(e,key,raw,input){
 if(key==='name'||key==='text'||key==='fontFamily'||key==='textAlign'||key==='verticalAlign'||key==='fit')e[key]=raw;
 else if(key==='italic')e.italic=input.checked;
 else if(['color','fill','borderColor','outlineColor','shadowColor'].includes(key))e[key]=raw;
 else if(key==='fillType')e.fill=raw==='gradient'?{type:'linear',angle:0,colors:['#175fa7','#c42352']}:'#255eaa';
 else if(key.startsWith('gradient')){
  const fill=e.fill&&typeof e.fill==='object'?e.fill:{type:'linear',colors:['#175fa7','#c42352'],angle:0};
  if(key==='gradient0')fill.colors[0]=raw;else if(key==='gradient1')fill.colors[1]=raw;else fill.angle=num(raw);
  e.fill=fill;
 }else if(key.startsWith('crop.')){
  const k=key.split('.')[1],c=e.crop||{x:0,y:0,w:1,h:1};c[k]=clamp(num(raw)/100,k==='w'||k==='h'?.01:0,1);
  if(c.x+c.w>1)c.x=1-c.w;if(c.y+c.h>1)c.y=1-c.h;e.crop=c;
 }else if(key==='opacity')e.opacity=clamp(num(raw)/100,0,1);
 else if(['x','y','w','h','rotation','fontSize','fontWeight','lineHeight','letterSpacing','borderWidth','outlineWidth','shadowX','shadowY','shadowBlur'].includes(key)){
  const min=({w:1,h:1,fontSize:1,fontWeight:100,lineHeight:.1,borderWidth:0,outlineWidth:0,shadowBlur:0})[key]??-100000;
  const max=({fontSize:500,fontWeight:900,lineHeight:5,borderWidth:100,outlineWidth:50,shadowBlur:200})[key]??100000;
  e[key]=clamp(num(raw,e[key]),min,max);
 }
}
inspector.addEventListener('change',ev=>{
 const input=ev.target.closest('[data-field]');if(!input||selected.length!==1)return;
 const key=input.dataset.field,id=selected[0];
 try{
   const changed=change(doc=>{const e=doc.elements.find(e=>e.id===id);if(!e||e.locked)throw Error('Layer is locked');setInspectorField(e,key,input.value,input);});
   // Even if clamping yields the previous document value, reject the stale text
   // displayed by the HTML input (e.g. typing 999 into a 0..100 percent field).
   if(!changed)renderInspector();
 }
 catch(err){announce('Invalid property: '+err.message,true);renderInspector();}
});
inspector.addEventListener('click',ev=>{
 const button=ev.target.closest('[data-inspector-action]');if(!button)return;
 switch(button.dataset.inspectorAction){
  case 'toggle-lock':change(doc=>{const e=doc.elements.find(e=>e.id===selected[0]);e.locked=!e.locked;});break;
  case 'duplicate':duplicateSelected();break;
  case 'replace-image':$('imageFile').click();break;
  case 'font':$('fontFile').click();break;
  case 'crop-mode':cropMode=!cropMode;renderInspector();announce(cropMode?'Crop mode: drag image to pan its crop window. Use Zoom + first to reveal movable margins.':'Crop mode disabled');break;
  case 'zoom-crop-in':case 'zoom-crop-out':{
   const factor=button.dataset.inspectorAction==='zoom-crop-in'?.8:1.25;
   change(doc=>{const e=doc.elements.find(e=>e.id===selected[0]);if(!e||e.type!=='image'||e.locked)return;
     const c=e.crop,ww=clamp(c.w*factor,.05,1),hh=clamp(c.h*factor,.05,1);
     c.x=clamp(c.x+c.w/2-ww/2,0,1-ww);c.y=clamp(c.y+c.h/2-hh/2,0,1-hh);c.w=ww;c.h=hh;
   });break;
  }
 }
});
async function handleAction(action){
 switch(action){
  case 'new':if(confirmReplacement())await replaceScene(createDocument({title:'Blank broadcast'}));break;
  case 'open':$('projectFile').click();break;
  case 'save':saveProject();break;
  case 'undo':undo();break;case 'redo':redo();break;
  case 'duplicate':duplicateSelected();break;case 'delete':removeSelected();break;
  case 'add-text':addElement('text');break;case 'add-rect':addElement('rect');break;
  case 'add-ellipse':addElement('ellipse');break;case 'add-placeholder':addElement('placeholder');break;
  case 'upload-image':$('imageFile').click();break;case 'tool-select':activateTool('select');break;
  case 'tool-pan':activateTool('pan');break;
  case 'zoom-in':zoomBy(1.25);break;case 'zoom-out':zoomBy(.8);break;case 'zoom-fit':centerView();break;
  case 'raise':reorder(1);break;case 'lower':reorder(-1);break;
  case 'group':groupSelected();break;case 'ungroup':ungroupSelected();break;
  case 'save-preset':{
   const name=$('presetName').value.trim();if(!name){announce('Enter a preset name',true);break;}
   const next=[...customPresets,{name,scene:deepCopy(scene)}];if(writeCatalog(PRESETS,next)){customPresets=next;renderCustomPresets();$('presetName').value='';announce('Reusable editable preset saved');}break;
  }
  case 'apply-channel':{
    const channel=readChannelForm();change(doc=>applyChannel(doc,channel));announce('Identity applied');break;
  }
  case 'channel-logo':$('logoFile').click();break;
  case 'save-channel':{
   const name=$('channelSaveName').value.trim()||scene.channel.name;
   const c=deepCopy(scene.channel);const logo=c.logoAssetId?scene.assets[c.logoAssetId]:null;const font=Object.values(scene.fonts).find(f=>f.family===c.fontFamily);
   const next=[...savedChannels,{name,channel:c,logo:logo?deepCopy(logo):null,font:font?deepCopy(font):null}];
   if(writeCatalog(CHANNELS,next)){savedChannels=next;$('channelSaveName').value='';renderChannelPanel();announce('Channel identity saved');}break;
  }
  case 'export':{
    $('exportWidth').value=scene.width;$('exportHeight').value=scene.height;
    $('exportResolution').value=['1920x1080','3840x2160','1280x720'].includes(scene.width+'x'+scene.height)?scene.width+'x'+scene.height:'custom';
    $('keepAspect').checked=true;updateExportInfo();$('exportDialog').showModal();break;
  }
 }
}
document.addEventListener('click',ev=>{
 const b=ev.target.closest('button[data-action]');if(b)handleAction(b.dataset.action).catch(err=>announce(err.message,true));
 const a=ev.target.closest('button[data-align]');if(a)align(a.dataset.align);
 const tab=ev.target.closest('button[data-tab]');if(tab)applyPresetTab(tab.dataset.tab);
});
$('projectTitle').addEventListener('change',ev=>change(doc=>doc.title=ev.target.value.slice(0,200)));
$('imageFile').addEventListener('change',async ev=>{const f=ev.target.files[0];ev.target.value='';await addImage(f);});
$('logoFile').addEventListener('change',async ev=>{const f=ev.target.files[0];ev.target.value='';await addImage(f,true);});
$('fontFile').addEventListener('change',async ev=>{const f=ev.target.files[0];ev.target.value='';await addFont(f);});
$('projectFile').addEventListener('change',async ev=>{const f=ev.target.files[0];ev.target.value='';await openProject(f);});
$('guidesToggle').addEventListener('change',requestDraw);
viewport.addEventListener('pointerdown',startPointer);
viewport.addEventListener('pointermove',updatePointer);
viewport.addEventListener('pointerup',ev=>finishPointer(ev));
viewport.addEventListener('pointercancel',ev=>finishPointer(ev,true));
viewport.addEventListener('lostpointercapture',ev=>{if(pointer&&pointer.id===ev.pointerId)finishPointer(ev,true);});
viewport.addEventListener('wheel',ev=>{ev.preventDefault();if(ev.ctrlKey||ev.metaKey)zoomBy(ev.deltaY<0?1.1:1/1.1);else{viewportState.panX-=ev.deltaX;viewportState.panY-=ev.deltaY;requestDraw();}},{passive:false});
document.addEventListener('keydown',ev=>{
 const editing=ev.target.closest('input,textarea,select,[contenteditable="true"]'),mod=ev.ctrlKey||ev.metaKey;
 if(!editing&&ev.code==='Space'){spaceDown=true;viewport.classList.add('pan-mode');ev.preventDefault();return;}
 if(editing)return;
 const k=ev.key.toLowerCase();
 if(mod&&['z','y','d','s','o','c','g'].includes(k)){
   ev.preventDefault();
   if(k==='z'){ev.shiftKey?redo():undo();return;}
   if(k==='y'){redo();return;}
   if(k==='d'){duplicateSelected();return;}
   if(k==='s'){saveProject();return;}
   if(k==='o'){$('projectFile').click();return;}
   if(k==='g'){ev.shiftKey?ungroupSelected():groupSelected();return;}
   if(k==='c'){clipboard=deepCopy(scene.elements.filter(e=>selected.includes(e.id)));return;}

 }
 if(k==='delete'||k==='backspace'){ev.preventDefault();removeSelected();return;}
 if(k==='escape'){if(pointer)finishPointer({pointerId:pointer.id},true);else if(cropMode){cropMode=false;renderInspector();}else clearSelection();return;}
 if(['arrowleft','arrowright','arrowup','arrowdown'].includes(k)&&selected.length){
   ev.preventDefault();const amount=ev.shiftKey?10:1;change(doc=>translate(doc,selected,k==='arrowleft'?-amount:k==='arrowright'?amount:0,k==='arrowup'?-amount:k==='arrowdown'?amount:0));return;
 }
 if(k==='0'){centerView();return;}
});
document.addEventListener('keyup',ev=>{if(ev.code==='Space'){spaceDown=false;viewport.classList.toggle('pan-mode',activeTool==='pan');}});
window.addEventListener('blur',()=>{spaceDown=false;if(pointer)finishPointer({pointerId:pointer.id},true);});
document.addEventListener('paste',async ev=>{
 if(ev.target instanceof Element && ev.target.closest('input,textarea,[contenteditable]'))return;
 const transfer=ev.clipboardData;
 const file=[...(transfer?.files||[])].find(f=>f.type?.startsWith('image/'))
   || [...(transfer?.items||[])].filter(item=>item.kind==='file'&&item.type?.startsWith('image/')).map(item=>item.getAsFile?.()).find(Boolean);
 if(file){ev.preventDefault();await addImage(file);return;}
 if(clipboard.length){
   // A genuine pasted bitmap wins over previously copied scene elements.
   ev.preventDefault();
   const copies=deepCopy(clipboard),groupIds=new Map();
   change(doc=>{
     for(const item of copies){
       item.id=uuid();item.x+=30;item.y+=30;
       if(item.groupId){
         if(!groupIds.has(item.groupId))groupIds.set(item.groupId,uuid());
         item.groupId=groupIds.get(item.groupId);
       }
       doc.elements.push(item);
     }
   });
   setSelection(copies.map(item=>item.id));
 }
});
function updateExportInfo(){
 const w=Math.round(num($('exportWidth').value)),h=Math.round(num($('exportHeight').value));
 $('exportAspectInfo').textContent=round(scene.width/scene.height)+':1 source · '+(Math.abs(w/h-scene.width/scene.height)<.00001?'Proportional scaling':'Non-proportional stretching (aspect mismatch)');
}
$('exportResolution').addEventListener('change',()=>{
 const size=$('exportResolution').value;if(size!=='custom'){const [w,h]=size.split('x').map(Number);$('exportWidth').value=w;$('exportHeight').value=h;}
 updateExportInfo();
});
$('exportWidth').addEventListener('change',()=>{
 if($('keepAspect').checked)$('exportHeight').value=Math.round(num($('exportWidth').value)*scene.height/scene.width);
 $('exportResolution').value='custom';updateExportInfo();
});
$('exportHeight').addEventListener('change',()=>{
 if($('keepAspect').checked)$('exportWidth').value=Math.round(num($('exportHeight').value)*scene.width/scene.height);
 $('exportResolution').value='custom';updateExportInfo();
});
$('keepAspect').addEventListener('change',updateExportInfo);
$('exportDialog').addEventListener('close',async()=>{
 if($('exportDialog').returnValue!=='export')return;
 const w=Math.round(num($('exportWidth').value)),h=Math.round(num($('exportHeight').value));
 try{
  if(w<1||h<1||w>10000||h>10000||w*h>100_000_000)throw Error('Output must be 1–10,000 px/side and ≤100 MP');
  if(Math.abs(w/h-scene.width/scene.height)>.00001&&!confirm('This size changes the document aspect ratio. Stretch scene to '+w+' × '+h+'?'))return;
  announce('Rendering '+w+' × '+h+' PNG…');
  resources=await loadResources(scene);
  const blob=await exportPng(scene,resources,w,h);
  download(blob,fileName()+'-'+w+'x'+h+'.png');announce('PNG exported at '+w+' × '+h);
 }catch(err){announce('Export failed; project unchanged: '+err.message,true);}
});
new ResizeObserver(()=>{computeFit();requestDraw();}).observe(viewport);
$('sidebarToggle').addEventListener('click',()=>{
 const open=leftSidebar.classList.toggle('open');
 rightSidebar.classList.remove('open');
 $('sidebarToggle').setAttribute('aria-expanded',String(open));
 $('inspectorToggle').setAttribute('aria-expanded','false');
});
$('inspectorToggle').addEventListener('click',()=>{
 const open=rightSidebar.classList.toggle('open');
 leftSidebar.classList.remove('open');
 $('inspectorToggle').setAttribute('aria-expanded',String(open));
 $('sidebarToggle').setAttribute('aria-expanded','false');
});
function init(){
 renderPresets();applyPresetTab('presets');updateUI();
 try{
  const saved=localStorage.getItem(STORAGE);
  if(saved){
    const doc=parseProject(saved), recoveryEpoch=sceneReplacementEpoch, baseline=scene;
    loadResources(doc).then(res=>{
      if(sceneReplacementEpoch!==recoveryEpoch||scene!==baseline)return;
      scene=doc;history.reset(doc);resources=res;dirty=true;centerView();updateUI();
      announce('Recovered your last autosaved project');
    }).catch(err=>announce('Autosave could not be restored: '+err.message,true));
  }
 }catch(err){announce('Autosave is invalid; starting with built-in preset: '+err.message,true);}
 computeFit();requestDraw();
}
init();
