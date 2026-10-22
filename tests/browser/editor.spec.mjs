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
 await page.goto('/');await expect(page.locator('#presetList .preset')).toHaveCount(5);
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
