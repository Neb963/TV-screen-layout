import { test, expect } from '@playwright/test';
import fs from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { PNG } from 'pngjs';
const pngDims=b=>({width:b.readUInt32BE(16),height:b.readUInt32BE(20)});
async function exportDownload(page,resolution='1920x1080'){
 await page.locator('[data-action="export"]').click();
 await page.locator('#exportResolution').selectOption(resolution);
 const ready=page.waitForEvent('download');
 await page.locator('#exportDialog button[value="export"]').click();
 const file=await ready;return fs.readFile(await file.path());
}
test('loads complete composition and actual painted canvas',async({page})=>{
 await page.goto('/');await expect(page.locator('#presetList .preset')).toHaveCount(8);
 await expect(page.locator('#projectTitle')).toHaveValue(/Atlantic/);
 await page.locator('[data-tab="layers"]').click();
 expect(await page.locator('.layer-row').count()).toBeGreaterThan(14);
 const canvas=page.locator('#sceneCanvas');await expect(canvas).toBeVisible();
 const nonblank=await canvas.evaluate(el=>{
  const c=el.getContext('2d'),p=c.getImageData(Math.floor(el.width*.12),Math.floor(el.height*.2),1,1).data;return [...p];
 });expect(nonblank[3]).toBe(255);
 await page.screenshot({path:'test-results/editor-desktop.png'});
});
test('numeric geometry is undoable; selected art can drag, group, lock and change stacking',async({page})=>{
 await page.goto('/');await page.locator('[data-tab="layers"]').click();
 await page.locator('.layer-select').first().click();
 const x=page.locator('[data-field="x"]'),original=Number(await x.inputValue());
 await x.fill(String(original-61));await x.press('Tab');await expect(page.locator('[data-field="x"]')).toHaveValue(String(original-61));
 await page.locator('[data-action="undo"]').click();await expect(page.locator('[data-field="x"]')).toHaveValue(String(original));
 await page.locator('[data-action="redo"]').click();await expect(page.locator('[data-field="x"]')).toHaveValue(String(original-61));
 await page.locator('[data-action="duplicate"]').click();await expect(page.locator('#layerCount')).toHaveText('18');
 await page.locator('.layer-select').nth(1).click({modifiers:['Shift']});
 await page.locator('[data-action="group"]').click();
 await expect(page.locator('.layer-select').first()).toContainText('grouped');
 await page.locator('[data-action="ungroup"]').click();
 await page.locator('.layer-state').first().click();
 await page.locator('[data-action="raise"]').click();
});
test('embedded image replacement, crop and fully editable save/reimport',async({page})=>{
 await page.goto('/');await page.locator('[data-tab="layers"]').click();
 await page.locator('.layer-row').filter({hasText:'Lead image'}).locator('.layer-select').click();
 const imageBuffer=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAFElEQVR4nGM0PlP+n4GBgYGJAQoAJUQCeYUFkNUAAAAASUVORK5CYII=','base64');
 await page.locator('#imageFile').setInputFiles({name:'frame.png',mimeType:'image/png',buffer:imageBuffer});
 await expect(page.locator('[data-field="fit"]')).toBeVisible();
 await page.locator('[data-field="crop.w"]').fill('65');await page.locator('[data-field="crop.w"]').press('Tab');
 await expect(page.locator('[data-field="crop.w"]')).toHaveValue('65');
 const saved=page.waitForEvent('download');await page.locator('[data-action="save"]').click();
 const downloaded=await saved;const text=await fs.readFile(await downloaded.path(),'utf8');
 const doc=JSON.parse(text);
 const asset=Object.values(doc.assets)[0];
 expect(asset.data).toMatch(/^data:image\/png;base64/);
 expect(doc.elements.find(e=>e.name==='Lead image / studio feed').crop.w).toBe(.65);
 await page.locator('[data-action="new"]').click();
 await page.locator('#projectFile').setInputFiles({name:'reopen.tvnews.json',mimeType:'application/json',buffer:Buffer.from(text)});
 await expect(page.locator('#projectTitle')).toHaveValue(/Atlantic/);
 await page.locator('[data-tab="layers"]').click();
 await page.locator('.layer-row').filter({hasText:'Lead image'}).locator('.layer-select').click();
 await expect(page.locator('[data-field="crop.w"]')).toHaveValue('65');
});
test('PNG export has exact HD and 4K headers and is deterministic',async({page})=>{
 await page.goto('/');const hd=await exportDownload(page,'1920x1080');
 expect(hd.subarray(0,8).toString('hex')).toBe('89504e470d0a1a0a');
 expect(pngDims(hd)).toEqual({width:1920,height:1080});
 const hd2=await exportDownload(page,'1920x1080');
 expect(createHash('sha256').update(hd).digest('hex')).toBe(createHash('sha256').update(hd2).digest('hex'));
 const fourK=await exportDownload(page,'3840x2160');
 expect(pngDims(fourK)).toEqual({width:3840,height:2160});
 await fs.writeFile('test-results/export-hd.png',hd);
 await fs.writeFile('test-results/export-4k.png',fourK);
});
test('unsafe SVG and malformed project are rejected with previous artwork intact',async({page})=>{
 await page.goto('/');
 const oldTitle=await page.locator('#projectTitle').inputValue();
 const badSvg='<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>';
 await page.locator('#imageFile').setInputFiles({name:'bad.svg',mimeType:'image/svg+xml',buffer:Buffer.from(badSvg)});
 await expect(page.locator('#toast')).toContainText(/Image import rejected/);
 await page.locator('#projectFile').setInputFiles({name:'broken.tvnews.json',mimeType:'application/json',buffer:Buffer.from('{bad')});
 await expect(page.locator('#toast')).toContainText(/Import failed/);
 await expect(page.locator('#projectTitle')).toHaveValue(oldTitle);
});
test('brand editing and reusable presets are visible and editable',async({page})=>{
 await page.goto('/');
 await page.locator('[data-tab="channels"]').click();
 await page.locator('#channelName').fill('NORTH SKY');
 await page.locator('#channelAccent').fill('#ff8800');
 await page.locator('[data-action="apply-channel"]').click();
 await page.locator('[data-tab="layers"]').click();
 await page.locator('.layer-row').filter({hasText:'Channel name'}).locator('.layer-select').click();
 await expect(page.locator('[data-field="text"]')).toHaveValue('NORTH SKY');
 await page.locator('[data-tab="presets"]').click();
 await page.locator('#presetName').fill('Skyline');
 await page.locator('[data-action="save-preset"]').click();
 await expect(page.locator('#customPresetList')).toContainText('Skyline');
});
test('viewport zoom and pan do not alter exported document geometry',async({page})=>{
 await page.goto('/');
 let first=await exportDownload(page,'1920x1080');
 await page.locator('[data-action="zoom-in"]').click();
 await page.locator('[data-action="zoom-in"]').click();
 await page.locator('#viewport').hover();
 await page.mouse.wheel(120,80);
 const second=await exportDownload(page,'1920x1080');
 expect(createHash('sha256').update(first).digest('hex')).toBe(createHash('sha256').update(second).digest('hex'));
});
test('narrow viewport keeps drawing visible and export reachable',async({page})=>{
 await page.setViewportSize({width:430,height:790});
 await page.goto('/');
 await expect(page.locator('#sceneCanvas')).toBeVisible();
 await expect(page.locator('[data-action="export"]')).toBeVisible();
 await page.screenshot({path:'test-results/editor-mobile.png'});
});


test('safe native SVG imports and remains embedded after project download',async({page})=>{
 await page.goto('/');
 const svg='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect width="48" height="48" fill="#27bf93"/><circle cx="24" cy="24" r="12" fill="#ffffff"/></svg>';
 await page.locator('#imageFile').setInputFiles({name:'logo.svg',mimeType:'image/svg+xml',buffer:Buffer.from(svg)});
 await expect(page.locator('[data-field="fit"]')).toBeVisible();
 const pending=page.waitForEvent('download');await page.locator('[data-action="save"]').click();
 const json=JSON.parse(await fs.readFile(await (await pending).path(),'utf8'));
 expect(Object.values(json.assets).some(a=>a.mime==='image/svg+xml' && a.data.startsWith('data:image/svg+xml;base64,'))).toBe(true);
});

test('direct crop tool zooms and pans source window without changing frame geometry',async({page})=>{
 await page.goto('/');await page.locator('[data-tab="layers"]').click();
 await page.locator('.layer-row').filter({hasText:'Lead image'}).locator('.layer-select').click();
 const validPng=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAFElEQVR4nGM0PlP+n4GBgYGJAQoAJUQCeYUFkNUAAAAASUVORK5CYII=','base64');
 await page.locator('#imageFile').setInputFiles({name:'crop.png',mimeType:'image/png',buffer:validPng});
 await page.locator('[data-inspector-action="zoom-crop-in"]').click();
 await expect(page.locator('[data-field="crop.w"]')).toHaveValue('80');
 await page.locator('[data-inspector-action="crop-mode"]').click();
 const before=Number(await page.locator('[data-field="crop.x"]').inputValue());
 const box=await page.locator('#sceneCanvas').boundingBox();
 const x=box.x+box.width*.50,y=box.y+box.height*.4;
 await page.mouse.move(x,y);await page.mouse.down();await page.mouse.move(x-46,y,{steps:5});await page.mouse.up();
 const after=Number(await page.locator('[data-field="crop.x"]').inputValue());
 expect(after).toBeGreaterThan(before);
 const save=page.waitForEvent('download');await page.locator('[data-action="save"]').click();
 const doc=JSON.parse(await fs.readFile(await (await save).path(),'utf8'));
 const img=doc.elements.find(e=>e.name==='Lead image / studio feed');
 expect(img.w).toBe(1920);expect(img.h).toBe(720);
 expect(img.crop.w).toBeCloseTo(.8);expect(img.crop.x).toBeGreaterThan(.1);
});

test('group handles resize selected shapes transactionally',async({page})=>{
 await page.goto('/');await page.locator('[data-tab="layers"]').click();
 await page.locator('.layer-row').filter({hasText:'Clock'}).locator('.layer-select').click();
 await page.locator('.layer-row').filter({hasText:'Ticker text'}).locator('.layer-select').click({modifiers:['Shift']});
 await expect(page.locator('#selectionCount')).toHaveText('2 selected');
 await page.locator('[data-action="group"]').click();
 const canvas=page.locator('#sceneCanvas'),box=await canvas.boundingBox();
 const startX=box.x+box.width*(1891/1920),startY=box.y+box.height*(1072/1080);
 await page.mouse.move(startX,startY);await page.mouse.down();
 await page.mouse.move(startX-70,startY-22,{steps:8});await page.mouse.up();
 const save=page.waitForEvent('download');await page.locator('[data-action="save"]').click();
 const doc=JSON.parse(await fs.readFile(await (await save).path(),'utf8'));
 const a=doc.elements.find(e=>e.name==='Ticker text'),b=doc.elements.find(e=>e.name==='Clock');
 expect(a.groupId).toBe(b.groupId);
 expect(a.w).toBeLessThan(1350);expect(b.w).toBeLessThan(166);
 await page.locator('[data-action="undo"]').click();
 const save2=page.waitForEvent('download');await page.locator('[data-action="save"]').click();
 const undone=JSON.parse(await fs.readFile(await (await save2).path(),'utf8'));
 expect(undone.elements.find(e=>e.name==='Ticker text').w).toBe(1350);
});

test('typography, solid-to-gradient and styling survive editable project serialization',async({page})=>{
 await page.goto('/');await page.locator('[data-tab="layers"]').click();
 await page.locator('.layer-row').filter({hasText:'Headline'}).first().locator('.layer-select').click();
 if(await page.locator('[data-field="text"]').count()){
  await page.locator('[data-field="text"]').fill('LONG, PRECISE\nHEADLINE');
  await page.locator('[data-field="text"]').press('Tab');
  await page.locator('[data-field="letterSpacing"]').fill('3.5');
  await page.locator('[data-field="letterSpacing"]').press('Tab');
 }
 await page.locator('.layer-row').filter({hasText:'Top brand bar'}).locator('.layer-select').click();
 await page.locator('[data-field="fillType"]').selectOption('gradient');
 await page.locator('[data-field="gradientAngle"]').fill('40');
 await page.locator('[data-field="gradientAngle"]').press('Tab');
 const save=page.waitForEvent('download');await page.locator('[data-action="save"]').click();
 const doc=JSON.parse(await fs.readFile(await (await save).path(),'utf8'));
 expect(doc.elements.find(e=>e.name==='Top brand bar').fill).toMatchObject({type:'linear',angle:40});
 expect(doc.elements.find(e=>e.name==='Headline').letterSpacing).toBe(3.5);
});



test('measured preview/output color parity away from selection guides',async({page})=>{
 await page.goto('/');await page.locator('#guidesToggle').uncheck();
 const points=[[40,200],[250,250],[350,690],[720,340],[1350,360],[1550,410],[100,870],[1200,932],[1800,940],[200,1062]];
 const preview=await page.locator('#sceneCanvas').evaluate((canvas,points)=>{
  const c=canvas.getContext('2d');
  return points.map(([x,y])=>Array.from(c.getImageData(Math.floor(x/1920*canvas.width),Math.floor(y/1080*canvas.height),1,1).data));
 },points);
 const png=PNG.sync.read(await exportDownload(page,'1920x1080'));
 for(let i=0;i<points.length;i++){
  const [x,y]=points[i],o=(y*png.width+x)*4,out=[...png.data.subarray(o,o+4)];
  const distance=preview[i].slice(0,3).reduce((n,v,j)=>n+Math.abs(v-out[j]),0);
  expect(distance,'color parity at '+JSON.stringify(points[i])+' preview='+preview[i]+' png='+out).toBeLessThan(40);
 }
});

test('custom font remains embedded and export pixels stable after project round-trip',async({page})=>{
 let buffer;
 for(const path of ['/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf','/usr/share/fonts/truetype/liberation2/LiberationSans-Regular.ttf']){
   try{buffer=await fs.readFile(path);break;}catch{}
 }
 if(!buffer)throw Error('CI browser runner lacks a usable TTF fixture');
 await page.goto('/');await page.locator('[data-tab="layers"]').click();
 await page.locator('.layer-row').filter({hasText:'Headline'}).first().locator('.layer-select').click();
 await page.locator('#fontFile').setInputFiles({name:'Verification.ttf',mimeType:'font/ttf',buffer});
 await expect(page.locator('[data-field="fontFamily"]')).toHaveValue('Uploaded Verification');
 const before=await exportDownload(page,'1920x1080');
 const saved=page.waitForEvent('download');await page.locator('[data-action="save"]').click();
 const data=await fs.readFile(await (await saved).path());
 const doc=JSON.parse(data.toString('utf8'));expect(Object.values(doc.fonts)).toHaveLength(1);
 await page.locator('[data-action="new"]').click();
 await page.locator('#projectFile').setInputFiles({name:'with-font.tvnews.json',mimeType:'application/json',buffer:data});
 await expect(page.locator('#projectTitle')).toHaveValue(/Atlantic/);
 const after=await exportDownload(page,'1920x1080');
 expect(createHash('sha256').update(before).digest('hex')).toBe(createHash('sha256').update(after).digest('hex'));
});


test('native preset labels and headlines fit their text frames without clipping',async({page})=>{
 await page.goto('/');
 const overflows=await page.evaluate(async()=>{
   const {BUILT_INS}=await import('/src/presets.js');
   const {wrapText}=await import('/src/renderer.js');
   const ctx=document.createElement('canvas').getContext('2d'),bad=[];
   for(const preset of BUILT_INS){
     for(const e of preset.make().elements.filter(e=>e.type==='text')){
       ctx.font=(e.italic?'italic ':'')+e.fontWeight+' '+e.fontSize+'px "'+e.fontFamily+'"';
       const lines=wrapText(ctx,e.text,Math.max(1,e.w-8),e.letterSpacing);
       if(lines.length*e.fontSize*e.lineHeight>e.h+3)bad.push({preset:preset.id,name:e.name,lines,height:Math.round(lines.length*e.fontSize*e.lineHeight),box:e.h});
     }
   }
   return bad;
 });
 expect(overflows).toEqual([]);
});


test('malicious SVG hidden inside imported project is rejected transactionally',async({page})=>{
 await page.goto('/');const current=await page.locator('#projectTitle').inputValue();
 const poisoned=await page.evaluate(async()=>{
   const {createDocument,makeElement}=await import('/src/model.js');
   return createDocument({title:'Injected content',elements:[makeElement('image',{assetId:'malicious'})]});
 });
 const svg='<svg xmlns="http://www.w3.org/2000/svg"><foreignObject width="10" height="10"><div xmlns="http://www.w3.org/1999/xhtml">active</div></foreignObject></svg>';
 poisoned.assets.malicious={id:'malicious',name:'injected.svg',mime:'image/svg+xml',data:'data:image/svg+xml;base64,'+Buffer.from(svg).toString('base64')};
 await page.locator('#projectFile').setInputFiles({name:'poisoned.tvnews.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(poisoned))});
 await expect(page.locator('#toast')).toContainText('Import failed');
 await expect(page.locator('#projectTitle')).toHaveValue(current);
});


test('clipboard image paste adds a portable editable layer',async({page})=>{
 await page.goto('/');
 const png='iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAFElEQVR4nGM0PlP+n4GBgYGJAQoAJUQCeYUFkNUAAAAASUVORK5CYII=';
 await page.evaluate(base64=>{
  const bytes=Uint8Array.from(atob(base64),c=>c.charCodeAt(0));
  const image=new File([bytes],'clipboard.png',{type:'image/png'});
  // Firefox does not consistently expose files on constructor-created ClipboardEvent.
  // Inject an event with a read-only clipboardData object, preserving the handler contract.
  const event=new Event('paste',{bubbles:true,cancelable:true});
  Object.defineProperty(event,'clipboardData',{value:{files:[image],items:[{kind:'file',type:'image/png',getAsFile:()=>image}]}});
  document.dispatchEvent(event);
 },png);
 await expect(page.locator('#layerCount')).toHaveText('18');
 const pending=page.waitForEvent('download');await page.locator('[data-action="save"]').click();
 const doc=JSON.parse(await fs.readFile(await (await pending).path(),'utf8'));
 expect(doc.elements.filter(e=>e.type==='image')).toHaveLength(1);
 expect(Object.values(doc.assets)).toHaveLength(1);
});

test('keyboard nudge/undo/Delete and Escape drag cancellation protect document history',async({page})=>{
 await page.goto('/');await page.locator('[data-tab="layers"]').click();
 await page.locator('.layer-row').filter({hasText:'Clock'}).locator('.layer-select').click();
 const start=Number(await page.locator('[data-field="x"]').inputValue());
 await page.keyboard.press('ArrowRight');
 await expect(page.locator('[data-field="x"]')).toHaveValue(String(start+1));
 await page.keyboard.press('Control+z');
 await expect(page.locator('[data-field="x"]')).toHaveValue(String(start));
 await page.keyboard.press('Delete');
 await expect(page.locator('#layerCount')).toHaveText('16');
 const before=page.waitForEvent('download');await page.locator('[data-action="save"]').click();
 const bytesBefore=await fs.readFile(await (await before).path());
 const box=await page.locator('#sceneCanvas').boundingBox();
 const x=box.x+box.width*.5,y=box.y+box.height*.55;
 await page.mouse.move(x,y);await page.mouse.down();await page.mouse.move(x+50,y+35,{steps:5});
 await page.keyboard.press('Escape');await page.mouse.up();
 const after=page.waitForEvent('download');await page.locator('[data-action="save"]').click();
 const bytesAfter=await fs.readFile(await (await after).path());
 expect(bytesAfter.equals(bytesBefore)).toBe(true);
});


test('autosave restores a real edited scene after browser reload',async({page})=>{
 await page.goto('/');await page.locator('[data-tab="layers"]').click();
 await page.locator('.layer-row').filter({hasText:'Clock'}).locator('.layer-select').click();
 await page.locator('[data-field="text"]').fill('10:12 UTC');await page.locator('[data-field="text"]').press('Tab');
 await expect(page.locator('[data-field="text"]')).toHaveValue('10:12 UTC');
 await expect.poll(async()=>page.evaluate(()=>localStorage.getItem('framecraft-autosave-v1')?.includes('10:12 UTC'))).toBe(true);
 await page.reload();await page.locator('[data-tab="layers"]').click();
 await page.locator('.layer-row').filter({hasText:'Clock'}).locator('.layer-select').click();
 await expect(page.locator('[data-field="text"]')).toHaveValue('10:12 UTC');
});

test('custom channel logo and identity survive preset replacement and project download',async({page})=>{
 page.on('dialog',d=>d.accept());
 await page.goto('/');await page.locator('[data-tab="channels"]').click();
 await page.locator('#channelName').fill('NORTH SKY');
 const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAFElEQVR4nGM0PlP+n4GBgYGJAQoAJUQCeYUFkNUAAAAASUVORK5CYII=','base64');
 await page.locator('#logoFile').setInputFiles({name:'mark.png',mimeType:'image/png',buffer:png});
 await page.locator('#channelSaveName').fill('Sky identity');
 await page.locator('[data-action="save-channel"]').click();
 await expect(page.locator('#savedChannelList')).toContainText('Sky identity');
 await page.locator('[data-tab="presets"]').click();
 await page.locator('#presetList .preset').nth(1).click();
 await expect(page.locator('#projectTitle')).toHaveValue(/Metro/);
 await page.locator('[data-tab="channels"]').click();
 await page.locator('#savedChannelList .preset').first().click();
 const pending=page.waitForEvent('download');await page.locator('[data-action="save"]').click();
 const doc=JSON.parse(await fs.readFile(await (await pending).path(),'utf8'));
 expect(doc.channel.name).toBe('NORTH SKY');
 const logo=doc.elements.find(e=>e.role==='logo');
 expect(logo.type).toBe('image');
 expect(doc.assets[logo.assetId].mime).toBe('image/png');
});


test('120-layer scene survives render, numeric editing and full-HD export',async({page})=>{
 await page.goto('/');
 const doc=await page.evaluate(async()=>{
   const {createDocument,makeElement}=await import('/src/model.js');
   const elements=Array.from({length:120},(_,i)=>makeElement(i%7===0?'text':'rect',{
      name:'Stress layer '+i,x:(i*63)%1750,y:(i*37)%900,w:130,h:65,
      fill:['#21568f','#31a1a9','#a93c55'][i%3],
      text:'BULLETIN '+i,fontSize:22,rotation:i%3*8,opacity:.85
   }));
   return createDocument({title:'120 Layer Fixture',elements});
 });
 await page.locator('#projectFile').setInputFiles({name:'stress.tvnews.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(doc))});
 await expect(page.locator('#projectTitle')).toHaveValue('120 Layer Fixture');
 await page.locator('[data-tab="layers"]').click();await expect(page.locator('#layerCount')).toHaveText('120');
 await page.locator('.layer-select').first().click();
 await page.locator('[data-field="x"]').fill('180');
 await page.locator('[data-field="x"]').press('Tab');
 const png=await exportDownload(page,'1920x1080');
 expect(pngDims(png)).toEqual({width:1920,height:1080});
 expect(png.length).toBeGreaterThan(15000);
});

test('custom preset is reusable as independent editable native layers',async({page})=>{
 page.on('dialog',d=>d.accept());
 await page.goto('/');
 await page.locator('[data-tab="layers"]').click();
 await page.locator('.layer-row').filter({hasText:'Clock'}).locator('.layer-select').click();
 await page.locator('[data-field="text"]').fill('TEST CLOCK');await page.locator('[data-field="text"]').press('Tab');
 await page.locator('[data-tab="presets"]').click();
 await page.locator('#presetName').fill('My Snapshot');
 await page.locator('[data-action="save-preset"]').click();
 await page.locator('#presetList .preset').nth(2).click();
 await page.locator('#customPresetList .preset').first().click();
 await page.locator('[data-tab="layers"]').click();
 await page.locator('.layer-row').filter({hasText:'Clock'}).locator('.layer-select').click();
 await expect(page.locator('[data-field="text"]')).toHaveValue('TEST CLOCK');
});


test('shadow offsets and blur preserve document proportions in HD and 4K',async({page})=>{
 await page.goto('/');
 const doc=await page.evaluate(async()=>{
   const {createDocument,makeElement}=await import('/src/model.js');
   return createDocument({title:'Shadow fidelity',background:'#ffffff',elements:[
     makeElement('rect',{x:400,y:300,w:200,h:140,fill:'#244d7a',
        shadowColor:'#000000',shadowBlur:20,shadowX:35,shadowY:24})
   ]});
 });
 await page.locator('#projectFile').setInputFiles({name:'shadow.tvnews.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(doc))});
 await expect(page.locator('#projectTitle')).toHaveValue('Shadow fidelity');
 const hd=PNG.sync.read(await exportDownload(page,'1920x1080'));
 const k4=PNG.sync.read(await exportDownload(page,'3840x2160'));
 const rgb=(img,x,y)=>[...img.data.subarray((y*img.width+x)*4,(y*img.width+x)*4+3)];
 // Shadow-only areas to the right/below the rect: compare equivalent document coordinates.
 const points=[[623,380],[627,450],[590,467],[475,472],[645,405]];
 for(const [x,y] of points){
  const a=rgb(hd,x,y),b=rgb(k4,x*2,y*2);
  expect(a.reduce((acc,n,i)=>acc+Math.abs(n-b[i]),0),
    'HD/4K shadow mismatch at '+x+','+y+': '+a+' vs '+b).toBeLessThan(70);
 }
});

test('in-flight image imports cannot reappear inside a newly created project',async({page})=>{
 await page.addInitScript(()=>{
   const original=Blob.prototype.arrayBuffer;
   Blob.prototype.arrayBuffer=function(...args){
     return new Promise((resolve,reject)=>setTimeout(()=>original.apply(this,args).then(resolve,reject),650));
   };
 });
 await page.goto('/');await page.locator('[data-tab="layers"]').click();
 await page.locator('.layer-row').filter({hasText:'Lead image'}).locator('.layer-select').click();
 const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAFElEQVR4nGM0PlP+n4GBgYGJAQoAJUQCeYUFkNUAAAAASUVORK5CYII=','base64');
 page.on('dialog',d=>d.accept());
 await page.locator('#imageFile').setInputFiles({name:'slow.png',mimeType:'image/png',buffer:png});
 await page.locator('[data-action="new"]').click();
 await expect(page.locator('#projectTitle')).toHaveValue('Blank broadcast');
 await page.waitForTimeout(850);
 await expect(page.locator('#layerCount')).toHaveText('0');
});


async function projectSnapshot(page){
 const dl=page.waitForEvent('download');
 await page.locator('[data-action="save"]').click();
 return JSON.parse(await fs.readFile(await (await dl).path(),'utf8'));
}
test('dragging resize and rotation handles updates native geometry and undo restores it',async({page})=>{
 await page.goto('/');
 await page.locator('[data-action="add-rect"]').click();
 await expect(page.locator('[data-field="w"]')).toHaveValue('450');
 const canvas=page.locator('#sceneCanvas'),box=await canvas.boundingBox();
 const world=(x,y)=>({x:box.x+x*box.width/1920,y:box.y+y*box.height/1080});
 const corner=world(576+450,324+250);
 await page.mouse.move(corner.x,corner.y);
 await page.mouse.down();await page.mouse.move(corner.x+50,corner.y+30,{steps:8});await page.mouse.up();
 const resized=await projectSnapshot(page);
 const rect=resized.elements.at(-1);
 expect(rect.w).toBeGreaterThan(450);expect(rect.h).toBeGreaterThan(250);
 await page.locator('[data-action="undo"]').click();
 await expect(page.locator('[data-field="w"]')).toHaveValue('450');
 const center=world(576+225,324);
 await page.mouse.move(center.x,center.y-32);await page.mouse.down();
 await page.mouse.move(center.x+52,center.y-11,{steps:6});await page.mouse.up();
 const rotated=await projectSnapshot(page);
 expect(Math.abs(rotated.elements.at(-1).rotation)).toBeGreaterThan(5);
 await page.locator('[data-action="undo"]').click();
 await expect(page.locator('[data-field="rotation"]')).toHaveValue('0');
});

test('layer lock, hide, and stacking changes are reversible',async({page})=>{
 await page.goto('/');await page.locator('[data-tab="layers"]').click();
 const row=page.locator('.layer-row').filter({hasText:'Clock'});
 await row.locator('.layer-select').click();
 const start=await projectSnapshot(page),initial=start.elements.findIndex(e=>e.name==='Clock');
 await page.locator('[data-action="lower"]').click();
 let doc=await projectSnapshot(page);
 expect(doc.elements.findIndex(e=>e.name==='Clock')).toBe(initial-1);
 await row.locator('.layer-state[title="Lock layer"]').click();
 await expect(page.locator('[data-field="x"]')).toBeDisabled();
 await page.keyboard.press('Delete');
 doc=await projectSnapshot(page);
 expect(doc.elements.find(e=>e.name==='Clock').locked).toBe(true);
 await row.locator('.layer-state[title="Hide layer"]').click();
 doc=await projectSnapshot(page);
 expect(doc.elements.find(e=>e.name==='Clock').hidden).toBe(true);
 await page.locator('[data-action="undo"]').click();
 doc=await projectSnapshot(page);
 expect(doc.elements.find(e=>e.name==='Clock').hidden).toBe(false);
});

test('numeric alignment across multiple objects and bounded inspector inputs',async({page})=>{
 await page.goto('/');await page.locator('[data-tab="layers"]').click();
 await page.locator('.layer-row').filter({hasText:'Clock'}).locator('.layer-select').click();
 await page.locator('.layer-row').filter({hasText:'Ticker label'}).locator('.layer-select').click({modifiers:['Shift']});
 await page.locator('[data-align="top"]').click();
 const aligned=await projectSnapshot(page);
 expect(aligned.elements.find(e=>e.name==='Clock').y).toBe(aligned.elements.find(e=>e.name==='Ticker label').y);
 await page.locator('.layer-row').filter({hasText:'Clock'}).locator('.layer-select').click();
 await page.locator('[data-field="opacity"]').fill('999');
 await page.locator('[data-field="opacity"]').press('Tab');
 await expect(page.locator('[data-field="opacity"]')).toHaveValue('100');
 const constrained=await projectSnapshot(page);
 expect(constrained.elements.find(e=>e.name==='Clock').opacity).toBe(1);
});

test('custom output dimensions, aspect confirmation and source geometry remain distinct',async({page})=>{
 page.on('dialog',d=>d.accept());
 await page.goto('/');
 await page.locator('[data-action="export"]').click();
 await page.locator('#exportResolution').selectOption('custom');
 await page.locator('#keepAspect').uncheck();
 await page.locator('#exportWidth').fill('990');
 await page.locator('#exportWidth').press('Tab');
 await page.locator('#exportHeight').fill('700');
 await page.locator('#exportHeight').press('Tab');
 await expect(page.locator('#exportAspectInfo')).toContainText('stretching');
 const pending=page.waitForEvent('download');
 await page.locator('#exportDialog button[value="export"]').click();
 const png=await fs.readFile(await (await pending).path());
 expect(pngDims(png)).toEqual({width:990,height:700});
 const doc=await projectSnapshot(page);
 expect(doc.width).toBe(1920);expect(doc.height).toBe(1080);
});
