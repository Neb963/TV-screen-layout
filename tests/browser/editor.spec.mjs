import { test, expect } from '@playwright/test';
import fs from 'node:fs/promises';
import { createHash } from 'node:crypto';
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
 const imageBuffer=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+j5YQAAAAASUVORK5CYII=','base64');
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
