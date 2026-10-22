// Canonical document state. No DOM dependencies: Node tests exercise this module.
export const FORMAT = 'tv-screen-layout';
export const VERSION = 1;
export const LIMITS = Object.freeze({ elements: 500, assets: 120, fonts: 24, projectBytes: 45_000_000, dimension: 10000 });
const TYPES = new Set(['rect', 'ellipse', 'text', 'image', 'placeholder']);
export const uuid = () => typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'el-' + Math.random().toString(36).slice(2) + Date.now().toString(36);
export const deepCopy = value => JSON.parse(JSON.stringify(value));
export const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
export const finite = (v, fallback = 0) => Number.isFinite(Number(v)) ? Number(v) : fallback;

export function makeElement(type, opts = {}) {
  if (!TYPES.has(type)) throw new Error('Unsupported element type');
  return {
    id: uuid(), type, name: type[0].toUpperCase() + type.slice(1),
    x: 100, y: 100, w: 300, h: 120, rotation: 0, opacity: 1,
    hidden: false, locked: false, groupId: null,
    fill: '#293b59', borderColor: '#ffffff', borderWidth: 0,
    shadowColor: '#000000', shadowBlur: 0, shadowX: 0, shadowY: 0,
    text: 'Edit text', color: '#ffffff', fontFamily: 'Arial',
    fontSize: 48, fontWeight: 700, italic: false, lineHeight: 1.08,
    letterSpacing: 0, textAlign: 'left', verticalAlign: 'middle',
    outlineColor: '#000000', outlineWidth: 0,
    assetId: null, fit: 'cover', crop: { x: 0, y: 0, w: 1, h: 1 },
    ...opts
  };
}
export function createDocument(options = {}) {
  return {
    format: FORMAT, version: VERSION, title: 'Untitled broadcast',
    width: 1920, height: 1080, background: '#101727',
    channel: { name: 'NORTHLINE', primary: '#1948ad', accent: '#ed233b', dark: '#071638', light: '#ffffff', fontFamily: 'Arial', logoAssetId: null },
    assets: {}, fonts: {}, elements: [], ...options
  };
}
export function bounds(e) {
  // Actual axis-aligned bounds of a centered rotated rectangle, in document pixels.
  const cx=e.x+e.w/2,cy=e.y+e.h/2,r=(e.rotation||0)*Math.PI/180;
  const c=Math.abs(Math.cos(r)),sin=Math.abs(Math.sin(r));
  const w=e.w*c+e.h*sin,h=e.w*sin+e.h*c;
  return {left:cx-w/2,top:cy-h/2,right:cx+w/2,bottom:cy+h/2,cx,cy,w,h};
}
export function localPoint(e, x, y) {
  const cx = e.x + e.w / 2, cy = e.y + e.h / 2, r = -(e.rotation || 0) * Math.PI / 180;
  const dx = x - cx, dy = y - cy;
  return { x: dx * Math.cos(r) - dy * Math.sin(r) + e.w / 2, y: dx * Math.sin(r) + dy * Math.cos(r) + e.h / 2 };
}
export function hitTest(scene, x, y, includeLocked = false) {
  for (let i = scene.elements.length - 1; i >= 0; i--) {
    const e = scene.elements[i];
    if (e.hidden || (e.locked && !includeLocked)) continue;
    const p = localPoint(e, x, y);
    if (p.x >= 0 && p.y >= 0 && p.x <= e.w && p.y <= e.h) return e.id;
  }
  return null;
}
export function selectionIds(scene, id) {
  const e = scene.elements.find(a => a.id === id);
  if (!e || e.locked || e.hidden) return [];
  return e.groupId ? scene.elements.filter(a => a.groupId === e.groupId && !a.locked && !a.hidden).map(a => a.id) : [id];
}
export function translate(scene, ids, dx, dy) {
  for (const e of scene.elements) if (ids.includes(e.id) && !e.locked) { e.x += dx; e.y += dy; }
}
export function duplicate(scene, ids) {
  const groupMap = new Map(), selected = scene.elements.filter(e => ids.includes(e.id) && !e.locked);
  const copies = selected.map(e => {
    const item = deepCopy(e); item.id = uuid(); item.x += 24; item.y += 24;
    if (item.groupId) { if (!groupMap.has(item.groupId)) groupMap.set(item.groupId, uuid()); item.groupId = groupMap.get(item.groupId); }
    return item;
  });
  scene.elements.push(...copies);
  return copies.map(e => e.id);
}
export function group(scene, ids) {
  const members = scene.elements.filter(e => ids.includes(e.id) && !e.locked);
  if (members.length < 2) return null;
  const id = uuid(); members.forEach(e => { e.groupId = id; }); return id;
}
export function ungroup(scene, ids) {
  const groups = new Set(scene.elements.filter(e => ids.includes(e.id)).map(e => e.groupId).filter(Boolean));
  scene.elements.forEach(e => { if (groups.has(e.groupId) && !e.locked) e.groupId = null; });
}
export function alignElements(scene, ids, mode) {
  const items=scene.elements.filter(e=>ids.includes(e.id)&&!e.locked&&!e.hidden);
  if(!items.length)return;
  // One object aligns to the artboard; multiple objects align their visible bounds.
  const boxes=items.map(e=>({e,b:bounds(e)}));
  const single=items.length===1;
  const left=single?0:Math.min(...boxes.map(x=>x.b.left));
  const right=single?scene.width:Math.max(...boxes.map(x=>x.b.right));
  const top=single?0:Math.min(...boxes.map(x=>x.b.top));
  const bottom=single?scene.height:Math.max(...boxes.map(x=>x.b.bottom));
  if(mode==='distribute-x'||mode==='distribute-y'){
    if(items.length<3)return;
    const horizontal=mode==='distribute-x';
    const edge=horizontal?'left':'top',extent=horizontal?'right':'bottom',len=horizontal?'w':'h';
    const ordered=boxes.sort((a,b)=>a.b[edge]-b.b[edge]);
    const start=ordered[0].b[edge],end=Math.max(...ordered.map(x=>x.b[extent]));
    const gap=(end-start-ordered.reduce((total,x)=>total+x.b[len],0))/(items.length-1);
    let cursor=start;
    for(const {e,b} of ordered){
      if(horizontal)e.x+=cursor-b.left;else e.y+=cursor-b.top;
      cursor+=b[len]+gap;
    }
    return;
  }
  for(const {e,b} of boxes){
    if(mode==='left')e.x+=left-b.left;
    if(mode==='right')e.x+=right-b.right;
    if(mode==='hcenter')e.x+=(left+right)/2-b.cx;
    if(mode==='top')e.y+=top-b.top;
    if(mode==='bottom')e.y+=bottom-b.bottom;
    if(mode==='vcenter')e.y+=(top+bottom)/2-b.cy;
  }
}
export function validateDocument(doc) {
  if (!doc || typeof doc !== 'object' || Array.isArray(doc)) throw Error('Project must be a JSON object');
  if (doc.format !== FORMAT || doc.version !== VERSION) throw Error('Unsupported project format/version. Expected ' + FORMAT + ' v' + VERSION);
  if (!Number.isInteger(doc.width) || !Number.isInteger(doc.height) || doc.width < 1 || doc.height < 1 || doc.width > LIMITS.dimension || doc.height > LIMITS.dimension) throw Error('Invalid canvas dimensions');
  if (!Array.isArray(doc.elements) || doc.elements.length > LIMITS.elements) throw Error('Invalid or excessive element count');
  if (!doc.assets || typeof doc.assets !== 'object' || Array.isArray(doc.assets) || Object.keys(doc.assets).length > LIMITS.assets) throw Error('Invalid assets');
  if (!doc.fonts || typeof doc.fonts !== 'object' || Array.isArray(doc.fonts) || Object.keys(doc.fonts).length > LIMITS.fonts) throw Error('Invalid fonts');
  if (!doc.channel || typeof doc.channel !== 'object' || typeof doc.title !== 'string' || doc.title.length > 200) throw Error('Invalid project metadata');
  if(typeof doc.background!=='string'||doc.background.length>100)throw Error('Invalid background fill');
  if(typeof doc.channel.name!=='string'||doc.channel.name.length>80||
     typeof doc.channel.fontFamily!=='string'||doc.channel.fontFamily.length>180)throw Error('Invalid channel identity');
  for(const key of ['primary','accent','dark','light']){
    if(typeof doc.channel[key]!=='string'||doc.channel[key].length>100)throw Error('Invalid channel palette');
  }
  if(doc.channel.logoAssetId!==null && doc.channel.logoAssetId!==undefined &&
     !Object.hasOwn(doc.assets,doc.channel.logoAssetId))throw Error('Missing embedded channel logo');
  const ids = new Set();
  for (const e of doc.elements) {
    if (!e || !TYPES.has(e.type) || typeof e.id !== 'string' || !e.id || ids.has(e.id)) throw Error('Unsupported element, missing or repeated ID');
    ids.add(e.id);
    for (const field of ['x','y','w','h','rotation','opacity','borderWidth','shadowBlur','shadowX','shadowY','fontSize','lineHeight','letterSpacing','outlineWidth']) {
      if (e[field] !== undefined && (!Number.isFinite(e[field]) || Math.abs(e[field]) > 1e6)) throw Error('Invalid numeric field: ' + field);
    }
    if (e.w <= 0 || e.h <= 0 || e.opacity < 0 || e.opacity > 1) throw Error('Invalid element geometry/opacity');
    if (typeof e.text !== 'string' || e.text.length > 30000) throw Error('Invalid text');
    if(typeof e.name!=='string'||e.name.length>200)throw Error('Invalid layer name');
    if(e.groupId!==null && e.groupId!==undefined && (typeof e.groupId!=='string'||e.groupId.length>200))throw Error('Invalid group ID');
    if(typeof e.locked!=='boolean'||typeof e.hidden!=='boolean')throw Error('Invalid lock/visibility state');
    for(const key of ['color','borderColor','shadowColor','outlineColor']){
      if(e[key]!==undefined&&(typeof e[key]!=='string'||e[key].length>100))throw Error('Invalid paint style: '+key);
    }
    if(typeof e.fill==='object'&&e.fill!==null){
      if(e.fill.type!=='linear'||!Array.isArray(e.fill.colors)||e.fill.colors.length<2||e.fill.colors.length>16||
         e.fill.colors.some(c=>typeof c!=='string'||c.length>100)||
         !Number.isFinite(e.fill.angle)||Math.abs(e.fill.angle)>3600)throw Error('Invalid gradient fill');
    }else if(typeof e.fill!=='string'||e.fill.length>100)throw Error('Invalid solid fill');
    if(e.borderWidth<0||e.outlineWidth<0||e.shadowBlur<0||e.fontSize<=0||e.lineHeight<=0)throw Error('Invalid style dimensions');
    if(typeof e.fontFamily!=='string'||e.fontFamily.length>180||
       !['left','center','right'].includes(e.textAlign)||
       !['top','middle','bottom'].includes(e.verticalAlign))throw Error('Invalid text style');
    if(!['cover','contain','stretch'].includes(e.fit))throw Error('Invalid image fit mode');
    if ((e.type === 'image' || e.assetId) && (!e.assetId || !Object.hasOwn(doc.assets,e.assetId))) throw Error('Missing embedded image for ' + e.name);
    if (e.crop && (!['x','y','w','h'].every(k => Number.isFinite(e.crop[k])) || e.crop.w <= 0 || e.crop.h <= 0 || e.crop.x < 0 || e.crop.y < 0 || e.crop.x + e.crop.w > 1.00001 || e.crop.y + e.crop.h > 1.00001)) throw Error('Invalid crop');
  }
  for (const asset of Object.values(doc.assets)) {
    if (!asset || typeof asset.data !== 'string' || !/^data:image\/(png|jpeg|svg\+xml);base64,[a-zA-Z0-9+/=]+$/.test(asset.data)) throw Error('Unsupported or missing embedded image');
  }
  for (const font of Object.values(doc.fonts)) {
    if (!font || typeof font.family !== 'string' || !/^data:font\/(woff2?|ttf|otf);base64,[a-zA-Z0-9+/=]+$/.test(font.data || '')) throw Error('Invalid embedded font');
  }
  return doc;
}
export function parseProject(text) {
  if (new TextEncoder().encode(text).byteLength > LIMITS.projectBytes) throw Error('Project exceeds 45MB limit');
  let doc; try { doc = JSON.parse(text); } catch { throw Error('Invalid JSON project'); }
  return deepCopy(validateDocument(doc));
}
export function serializeProject(scene) { validateDocument(scene); return JSON.stringify(scene, null, 2); }
export function createHistory(initial, limit = 80) {
  let past = [], future = [], present = deepCopy(initial);
  return {
    get value() { return present; },
    get canUndo() { return past.length > 0; },
    get canRedo() { return future.length > 0; },
    commit(next) { const value = deepCopy(next); if (JSON.stringify(value) === JSON.stringify(present)) return false; past.push(present); if (past.length > limit) past.shift(); present = value; future = []; return true; },
    undo() { if (!past.length) return false; future.push(present); present = past.pop(); return true; },
    redo() { if (!future.length) return false; past.push(present); present = future.pop(); return true; },
    reset(next) { present = deepCopy(next); past = []; future = []; }
  };
}
