// Embedded assets only: no network-dependent project media and no executable SVG.
import { LIMITS, uuid } from './model.js';
const IMG_LIMIT=15*1024*1024, SVG_LIMIT=2*1024*1024, FONT_LIMIT=6*1024*1024;
const SVG_TAGS=new Set(['svg','g','path','rect','circle','ellipse','line','polyline','polygon','defs','linearGradient','radialGradient','stop','clipPath','text','tspan']);
const ATTRS=new Set(['xmlns','viewBox','width','height','x','y','x1','y1','x2','y2','cx','cy','r','rx','ry','d','points','transform','fill','stroke','stroke-width','stroke-linecap','stroke-linejoin','fill-rule','clip-rule','clip-path','opacity','fill-opacity','stroke-opacity','offset','stop-color','stop-opacity','gradientUnits','gradientTransform','id','font-family','font-size','font-weight','text-anchor','preserveAspectRatio']);
export function sanitizeSvg(source) {
  if(source.length>SVG_LIMIT*2)throw Error('SVG exceeds size limit');
  if(/<!DOCTYPE|<!ENTITY/i.test(source))throw Error('DTD and entities are prohibited');
  const xml=new DOMParser().parseFromString(source,'image/svg+xml');
  if(xml.querySelector('parsererror')||xml.documentElement.localName!=='svg')throw Error('Malformed SVG');
  const walk=node=>{
    if(!SVG_TAGS.has(node.localName))throw Error('Unsupported or active SVG element: '+node.localName);
    for(const attr of [...node.attributes]){
      if(attr.namespaceURI && attr.namespaceURI!=='http://www.w3.org/2000/svg' && !(attr.name==='xmlns' && attr.namespaceURI==='http://www.w3.org/2000/xmlns/'))throw Error('Namespaced SVG attributes are prohibited');
      if(!ATTRS.has(attr.name))throw Error('Unsupported SVG attribute: '+attr.name);
      if(/url\s*\(/i.test(attr.value)&&!/^url\(\s*#[A-Za-z0-9_-]+\s*\)$/.test(attr.value))throw Error('External SVG reference prohibited');
      if(/javascript:|data:|@import|expression\s*\(/i.test(attr.value))throw Error('Unsafe SVG attribute');
    }
    for(const child of [...node.childNodes]){
      if(child.nodeType===1)walk(child);
      else if(child.nodeType===8||child.nodeType===7)node.removeChild(child);
      else if(child.nodeType!==3)throw Error('Unsupported SVG node');
    }
  };
  walk(xml.documentElement);
  xml.documentElement.setAttribute('xmlns','http://www.w3.org/2000/svg');
  return new XMLSerializer().serializeToString(xml.documentElement);
}
const fileToDataURL=file=>new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(Error('Could not read file'));reader.readAsDataURL(file);});
function sniffImage(bytes) {
  if(bytes[0]===0x89 && bytes[1]===0x50 && bytes[2]===0x4e && bytes[3]===0x47)return 'image/png';
  if(bytes[0]===0xff && bytes[1]===0xd8 && bytes[2]===0xff)return 'image/jpeg';
  return null;
}
export async function importImage(file) {
  if(!file || !file.size)throw Error('Select a non-empty image');
  if(file.size>IMG_LIMIT)throw Error('Image exceeds 15MB limit');
  const bytes=new Uint8Array(await file.slice(0,16).arrayBuffer());let mime=sniffImage(bytes);let data;
  if(mime) {
    data=await fileToDataURL(file);
    data=data.replace(/^data:[^;]*;base64,/,'data:'+mime+';base64,');
  }else{
    if(file.size>SVG_LIMIT)throw Error('SVG exceeds 2MB limit');
    const source=await file.text();
    if(!/^\s*(?:<\?xml[^>]*>\s*)?<svg[\s>]/i.test(source))throw Error('Only PNG, JPEG and SVG are supported');
    const cleaned=sanitizeSvg(source);mime='image/svg+xml';data=await fileToDataURL(new Blob([cleaned],{type:mime}));
  }
  const asset={id:uuid(),name:file.name || 'Clipboard image',mime,data};
  await loadImage(asset);return asset;
}
export function loadImage(asset) {
  return new Promise((resolve,reject)=>{
    const image=new Image();
    image.onload=()=>image.naturalWidth && image.naturalHeight ? resolve(image) : reject(Error('Image has zero dimensions'));
    image.onerror=()=>reject(Error('Image could not be decoded'));
    image.src=asset.data;
  });
}
export async function importFont(file) {
  if(!file||!file.size||file.size>FONT_LIMIT)throw Error('Font must be 1–6MB');
  const ext=(file.name.match(/\.(woff2?|ttf|otf)$/i)||[])[1]?.toLowerCase();
  const mime=({woff:'font/woff',woff2:'font/woff2',ttf:'font/ttf',otf:'font/otf'})[ext];
  if(!mime)throw Error('Only WOFF, WOFF2, TTF and OTF fonts are supported');
  const data=(await fileToDataURL(file)).replace(/^data:[^;]*;base64,/,'data:'+mime+';base64,');
  const family='Uploaded '+file.name.replace(/\.[^.]+$/,'').replace(/[^\w -]/g,'').slice(0,55);
  const font={id:uuid(),family,name:file.name,data};
  await loadFont(font);return font;
}
export async function loadFont(font) {
  const face=new FontFace(font.family,'url("'+font.data+'")');await face.load();document.fonts.add(face);return face;
}
export async function loadResources(doc) {
  if(Object.keys(doc.assets).length>LIMITS.assets||Object.keys(doc.fonts).length>LIMITS.fonts)throw Error('Too many embedded resources');
  const images=new Map();
  await Promise.all(Object.entries(doc.assets).map(async ([id,a])=>{
    const mime=a.data.slice(5,a.data.indexOf(';base64,'));
    if(a.mime!==mime)throw Error('Embedded image MIME does not match its data');
    if(mime==='image/svg+xml'){
      let source;
      try {
        const bytes=Uint8Array.from(atob(a.data.split(',')[1]),ch=>ch.charCodeAt(0));
        source=new TextDecoder('utf-8',{fatal:true}).decode(bytes);
      }catch{throw Error('Invalid encoded SVG asset');}
      sanitizeSvg(source); // Required even when SVG arrived in a project, not a file upload.
    }
    images.set(id,await loadImage(a));
  }));
  await Promise.all(Object.values(doc.fonts).map(loadFont));
  await document.fonts.ready;
  return {images};
}
