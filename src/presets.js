import { createDocument, makeElement, deepCopy, uuid } from './model.js';

function rect(name,x,y,w,h,fill,extra={}) { return makeElement('rect',{name,x,y,w,h,fill,...extra}); }
function txt(name,text,x,y,w,h,size=44,color='#ffffff',extra={}) { return makeElement('text',{name,text,x,y,w,h,fill:'transparent',fontSize:size,color,...extra}); }
function placeholder(name,x,y,w,h,extra={}) { return makeElement('placeholder',{name,x,y,w,h,fill:'#12584c', borderWidth:3,borderColor:'#41d6a4',...extra}); }
const ch=(name,primary,accent,dark,light='#ffffff')=>({name,primary,accent,dark,light,fontFamily:'Arial',logoAssetId:null});

function atlantic() {
  const channel=ch('ATLANTIC NEWS','#104aa5','#e62436','#09204f');
  const elements=[
    rect('Studio backdrop',0,0,1920,1080,{type:'linear',colors:['#071329','#27456e'],angle:0}),
    placeholder('Lead image / studio feed',0,0,1920,720),
    rect('Image tint',0,0,1920,720,'#071c44',{opacity:.18,locked:true}),
    rect('Top brand bar',0,0,1920,98,channel.dark),
    rect('Accent underline',0,94,1920,6,channel.accent),
    txt('Channel name','ATLANTIC',44,9,525,78,63,'#ffffff',{role:'logo',fontWeight:900,letterSpacing:2}),
    rect('LIVE capsule',1584,22,288,56,channel.accent,{role:'accent'}),
    txt('Live label','LIVE  •  WASHINGTON',1600,30,255,36,21,'#ffffff',{textAlign:'center',fontWeight:900}),
    rect('Lower third dark',0,720,1920,260,channel.dark,{role:'dark'}),
    rect('Lower third red keyline',0,716,1920,8,channel.accent,{role:'accent'}),
    rect('Breaking marker',0,760,450,157,channel.accent,{role:'accent'}),
    txt('Breaking headline','BREAKING',25,793,408,90,66,'#ffffff',{textAlign:'center',fontWeight:900}),
    txt('Headline','GLOBAL MARKETS BRACE FOR MAJOR POLICY SHIFT',487,745,1370,160,67,'#ffffff',{fontWeight:900,lineHeight:1.08}),
    rect('Ticker floor',0,976,1920,104,channel.primary,{role:'primary'}),
    txt('Ticker label','HEADLINES',34,993,292,70,36,'#ffffff',{fontWeight:900}),
    txt('Ticker text','DEVELOPING STORY   •   THE LATEST UPDATES   •   STUDIO ANALYSIS',352,988,1350,80,39,'#ffffff',{fontWeight:600}),
    txt('Clock','08:42 ET',1725,996,166,62,35,'#ffffff',{textAlign:'right',fontWeight:900})
  ];
  return createDocument({title:'Atlantic • Breaking News',channel,elements});
}
function metro() {
 const channel=ch('METRO NOW','#0a3c82','#f6b700','#061b3d');
 const elements=[
 rect('Gradient base',0,0,1920,1080,{type:'linear',colors:['#0e1f42','#173d75'],angle:90}),
 rect('Left broadcast panel',46,135,1160,688,'#0c2b55'),
 placeholder('Main presenter',55,144,1142,670),
 rect('Right column frame',1230,135,645,688,'#062a56'),
 placeholder('Remote guest',1240,145,625,675),
 rect('Top graphic line',0,0,1920,120,channel.dark),
 txt('Brand','METRO / NOW',43,16,720,90,69,'#ffffff',{role:'logo',fontWeight:900}),
 rect('On-air marker',1600,22,270,72,channel.accent,{role:'accent'}),
 txt('LIVE','LIVE',1610,29,250,55,45,'#061b3d',{textAlign:'center',fontWeight:900}),
 rect('Split caption 1',55,768,1142,57,channel.primary),
 txt('Presenter','IN STUDIO  •  NEW YORK',77,776,1080,40,31),
 rect('Split caption 2',1240,768,625,57,channel.primary),
 txt('Correspondent','ON THE GROUND',1260,776,588,40,30),
 rect('Headline panel',0,840,1920,154,'#ffffff'),
 rect('Headline accent',0,840,24,154,channel.accent,{role:'accent'}),
 txt('Top story','WORLD LEADERS MEET FOR EMERGENCY SUMMIT',52,859,1787,118,70,'#0c2853',{fontWeight:900}),
 rect('Ticker',0,994,1920,86,channel.dark),
 txt('Ticker','METRO NOW   /   DEVELOPING    •    POLICY    •    BUSINESS    •    INTERNATIONAL',48,1008,1585,59,34),
 txt('Time','21:08',1740,1008,133,58,39,'#f6b700',{textAlign:'right',fontWeight:900})
 ];return createDocument({title:'Metro • Two Way',channel,elements});
}
function world() {
 const channel=ch('WORLD REPORT','#ef4a33','#0aa0d1','#092137');
 const elements=[
 rect('Background',0,0,1920,1080,{type:'linear',colors:['#061a28','#16425c'],angle:30}),
 rect('World panel',0,0,1920,820,'#184266'),
 placeholder('Panoramic footage',0,0,1920,812,{fill:'#215a63'}),
 rect('Header tint',0,0,1920,115,channel.dark,{opacity:.95}),
 txt('Logo','WORLD / REPORT',52,13,900,90,67,'#ffffff',{role:'logo',fontWeight:900,letterSpacing:1}),
 rect('LIVE bar',1538,24,330,68,channel.accent,{role:'accent'}),
 txt('Live location','LIVE  LONDON',1558,36,290,47,38,'#ffffff',{fontWeight:900,textAlign:'center'}),
 rect('Breaking line',0,812,1920,7,channel.accent),
 rect('Headline ground',0,819,1920,173,channel.dark),
 txt('Top headline','THE WORLD AT A CROSSROADS',72,839,1740,145,83,'#ffffff',{fontWeight:900}),
 rect('Bottom newsbar',0,992,1920,88,channel.accent,{role:'accent'}),
 txt('Ticker','LATEST   •   GLOBAL AFFAIRS   •   FINANCIAL UPDATE   •   SPECIAL COVERAGE',46,1007,1620,58,35,'#ffffff',{fontWeight:750}),
 txt('Time','06:30 GMT',1700,1011,175,50,27,'#ffffff',{textAlign:'right',fontWeight:900})
 ];return createDocument({title:'World Report • Full Frame',channel,elements});
}
function finance() {
 const channel=ch('MARKET WATCH','#17423e','#b4e548','#112b2c');
 const elements=[
 rect('Backdrop',0,0,1920,1080,'#0c1e22'),
 rect('Top bar',0,0,1920,124,channel.dark),
 txt('Logo','MARKET / WATCH',50,13,1000,100,67,'#edf9e2',{role:'logo',fontWeight:900}),
 txt('Edition','THE OPENING BELL',1320,34,535,70,43,'#b4e548',{textAlign:'right',fontWeight:800}),
 placeholder('Market floor',44,159,1215,648),
 rect('Data frame',1300,159,574,648,'#17343a'),
 txt('Index header','GLOBAL INDEX SNAPSHOT',1321,190,540,66,42,'#b4e548',{fontWeight:900}),
 txt('Indices','S&P 500     +1.14%\nNASDAQ      +0.86%\nDOW JONES   +0.42%',1334,294,500,368,52,'#ffffff',{lineHeight:2.2,fontWeight:700}),
 rect('Lower third',0,829,1920,180,channel.primary),
 txt('Headline','INVESTORS REACT TO CENTRAL BANK DECISION',46,851,1815,144,72,'#ffffff',{fontWeight:900}),
 rect('Ticker ground',0,1009,1920,71,channel.accent),
 txt('Ticker','MARKETS     •     ECONOMY     •     EARNINGS     •     TECHNOLOGY',40,1015,1610,58,35,channel.dark,{fontWeight:900}),
 txt('Clock','09:35 ET',1710,1015,173,56,31,channel.dark,{textAlign:'right',fontWeight:900})
 ];return createDocument({title:'Market Watch • Financial Desk',channel,elements});
}
function studio() {
 const channel=ch('CIVIC NEWS','#5937aa','#f59e0b','#24134b');
 const elements=[
 rect('Canvas',0,0,1920,1080,{type:'linear',colors:['#0d1633','#51468f'],angle:0}),
 placeholder('Left scene',34,32,1180,720),
 placeholder('Right scene',1234,32,650,720),
 rect('Image frame',0,760,1920,3,channel.accent),
 rect('Brand badge',0,763,445,235,channel.dark),
 txt('Logo','CIVIC',48,798,363,130,100,'#ffffff',{role:'logo',fontWeight:900}),
 rect('Primary story',445,763,1475,235,'#ffffff'),
 txt('Headline','A NEW CHAPTER FOR THE CITY',490,792,1375,156,83,'#21183e',{fontWeight:900}),
 rect('Footer',0,998,1920,82,channel.primary),
 txt('Footer ticker','CITY HALL   /   TRANSIT   /   COMMUNITY   /   ELECTIONS',40,1012,1470,58,36,'#ffffff',{fontWeight:800}),
 rect('Live indicator',1615,1012,262,55,channel.accent,{role:'accent'}),
 txt('LIVE','LIVE',1635,1018,220,45,31,'#20113e',{textAlign:'center',fontWeight:900})
 ];return createDocument({title:'Civic • Magazine Split',channel,elements});
}
export const BUILT_INS = [
 {id:'atlantic',label:'Atlantic Breaking',description:'Fox-inspired high-contrast breaking-news composition',make:atlantic},
 {id:'metro',label:'Metro Two-Way',description:'Split-screen live interview',make:metro},
 {id:'world',label:'World Report',description:'Panoramic international bulletin',make:world},
 {id:'finance',label:'Market Watch',description:'Financial newsroom and index table',make:finance},
 {id:'studio',label:'Civic Magazine',description:'Contemporary editorial split view',make:studio}
];
export function instantiatePreset(id) {
 const p=BUILT_INS.find(p => p.id === id); if(!p) throw Error('Unknown preset');
 const scene=p.make(); const ids=new Map();
 scene.elements.forEach(e => { const old=e.id; e.id=uuid(); ids.set(old,e.id); });
 return scene;
}
export function instantiateCustomPreset(saved) {
 const doc=deepCopy(saved); doc.elements.forEach(e => e.id=uuid()); return doc;
}
