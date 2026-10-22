import test from 'node:test';
import assert from 'node:assert/strict';
import { createDocument, makeElement, duplicate, group, ungroup, translate, alignElements, bounds, hitTest, createHistory, serializeProject, parseProject, validateDocument } from '../src/model.js';
import { BUILT_INS, instantiatePreset, instantiateCustomPreset } from '../src/presets.js';
import { wrapText } from '../src/renderer.js';
test('eight distinct fully native presets with editable broadcast components',()=>{
 assert.ok(BUILT_INS.length >= 8);
 const names=new Set();
 for(const p of BUILT_INS){
  const d=instantiatePreset(p.id);validateDocument(d);assert.equal(d.width,1920);assert.equal(d.height,1080);
  assert.ok(d.elements.length>=12,p.id);assert.ok(d.elements.some(e=>e.type==='placeholder'),p.id);
  assert.ok(d.elements.some(e=>e.type==='text' && /LIVE|CLOCK|TIME|TICKER|HEADLINES|ATLANTIC|WORLD|MARKET|METRO|CIVIC/i.test(e.name+' '+e.text)),p.id);
  assert.ok(d.elements.every(e=>typeof e.id==='string'&&e.id.length));names.add(d.title);
 }
 assert.equal(names.size,BUILT_INS.length);
});
test('all preset instances are independent native documents',()=>{
 const a=instantiatePreset('atlantic'),b=instantiatePreset('atlantic');
 assert.notEqual(a.elements[0].id,b.elements[0].id);
 a.elements[0].x=999;assert.notEqual(a.elements[0].x,b.elements[0].x);
 const custom=instantiateCustomPreset(a);assert.equal(custom.elements[0].x,999);assert.notEqual(custom.elements[0].id,a.elements[0].id);
});
test('project format roundtrip and deterministic serializer',()=>{
 const d=instantiatePreset('world'),serialized=serializeProject(d);
 assert.deepEqual(parseProject(serialized),d);assert.equal(serializeProject(parseProject(serialized)),serialized);
});
test('malformed, oversized, unsupported or duplicate IDs fail closed',()=>{
 assert.throws(()=>parseProject('not json'),/Invalid JSON/);
 const a=instantiatePreset('atlantic');
 assert.throws(()=>parseProject(JSON.stringify({...a,version:2})),/Unsupported/);
 assert.throws(()=>parseProject(JSON.stringify({...a,width:10001})),/Invalid canvas/);
 a.elements[1].id=a.elements[0].id;assert.throws(()=>validateDocument(a),/repeated ID/);
});
test('missing asset, invalid crop and invalid embedded MIME fail validation',()=>{
 const d=createDocument();d.elements=[makeElement('image',{assetId:'unknown'})];assert.throws(()=>validateDocument(d),/Missing/);
 d.assets.unknown={data:'https://example.com/not-embedded.png'};assert.throws(()=>validateDocument(d),/Unsupported/);
 d.assets.unknown={data:'data:image/png;base64,aGVsbG8='};d.elements[0].crop={x:.8,y:0,w:.5,h:1};
 assert.throws(()=>validateDocument(d),/Invalid crop/);
});
test('history is bounded, undo/redo transaction preserves selection-compatible IDs',()=>{
 const init=instantiatePreset('metro'),h=createHistory(init,2);
 const one=structuredClone(init);one.elements[0].x=99;assert.equal(h.commit(one),true);
 const two=structuredClone(one);two.elements[0].x=198;h.commit(two);
 const three=structuredClone(two);three.elements[0].x=297;h.commit(three);
 assert.equal(h.undo(),true);assert.equal(h.value.elements[0].x,198);
 assert.equal(h.undo(),true);assert.equal(h.value.elements[0].x,99);
 assert.equal(h.undo(),false);
 assert.equal(h.redo(),true);assert.equal(h.value.elements[0].x,198);
});
test('hit testing honors lock, invisibility and z-order',()=>{
 const a=makeElement('rect',{x:0,y:0,w:100,h:100});
 const b=makeElement('rect',{x:0,y:0,w:100,h:100});
 const d=createDocument({elements:[a,b]});assert.equal(hitTest(d,50,50),b.id);
 b.locked=true;assert.equal(hitTest(d,50,50),a.id);
 b.locked=false;b.hidden=true;assert.equal(hitTest(d,50,50),a.id);
});
test('group translation duplicate and ungroup preserve independent children',()=>{
 const a=makeElement('rect',{x:0,y:0,w:100,h:100}),b=makeElement('text',{x:120,y:0,w:100,h:100});
 const d=createDocument({elements:[a,b]});const groupId=group(d,[a.id,b.id]);
 assert.ok(groupId);assert.equal(a.groupId,b.groupId);
 translate(d,[a.id,b.id],12,18);assert.equal(a.x,12);assert.equal(b.y,18);
 const ids=duplicate(d,[a.id,b.id]);assert.equal(ids.length,2);assert.notEqual(d.elements[2].groupId,groupId);
 ungroup(d,ids);assert.equal(d.elements[2].groupId,null);
});
test('align and distribute operate on numeric source pixel units',()=>{
 const a=makeElement('rect',{x:0,y:0,w:100,h:100}),b=makeElement('rect',{x:100,y:20,w:40,h:10}),c=makeElement('rect',{x:400,y:60,w:100,h:40});
 const d=createDocument({elements:[a,b,c]});alignElements(d,[a.id,b.id,c.id],'top');
 assert.deepEqual(d.elements.map(e=>e.y),[0,0,0]);
 alignElements(d,[a.id,b.id,c.id],'distribute-x');
 assert.equal(d.elements[0].x,0);assert.equal(d.elements[2].x,400);assert.equal(d.elements[1].x,230);
});
test('text wrap splits at explicit newlines and narrow widths',()=>{
 const ctx={measureText:s=>({width:s.length*10})};
 assert.deepEqual(wrapText(ctx,'ONE TWO',100),['ONE TWO']);
 assert.deepEqual(wrapText(ctx,'ONE\nTWO',100),['ONE','TWO']);
 assert.deepEqual(wrapText(ctx,'ABCDE',20),['AB','CD','E']);
});


test('prototype-derived names are not accepted as embedded image asset IDs',()=>{
 const d=createDocument({elements:[makeElement('image',{assetId:'constructor'})]});
 assert.throws(()=>validateDocument(d),/Missing embedded image/);
});
