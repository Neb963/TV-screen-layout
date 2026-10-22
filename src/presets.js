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
 txt('Index header','GLOBAL INDEX SNAPSHOT',1321,190,540,92,36,'#b4e548',{fontWeight:900}),
 txt('Indices','S&P 500     +1.14%\nNASDAQ      +0.86%\nDOW JONES   +0.42%',1334,294,500,368,38,'#ffffff',{lineHeight:1.65,fontWeight:700}),
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

function election() {
 const channel=ch('ELECTION CENTER','#1c3877','#e33240','#0c1c3b');
 const elements=[
 rect('Election backdrop',0,0,1920,1080,{type:'linear',colors:['#081325','#203a68'],angle:30}),
 rect('Masthead',0,0,1920,128,channel.dark,{role:'dark'}),
 rect('Masthead accent',0,125,1920,5,channel.accent,{role:'accent'}),
 txt('Network','ELECTION / CENTER',42,22,1050,83,69,'#ffffff',{role:'logo',fontWeight:900}),
 rect('Coverage marker',1542,27,327,66,channel.accent,{role:'accent'}),
 txt('Live coverage','LIVE COVERAGE',1558,38,296,47,31,'#ffffff',{fontWeight:900,textAlign:'center'}),
 placeholder('State map graphics',45,166,1050,641),
 rect('Results side panel',1128,166,748,641,'#102f57'),
 rect('Results title bar',1128,166,748,110,channel.primary,{role:'primary'}),
 txt('Results header','LATEST RESULTS',1165,185,660,72,51,'#ffffff',{fontWeight:900}),
 rect('Candidate blue',1162,312,140,128,'#2555a3'),
 rect('Candidate red',1162,478,140,128,channel.accent,{role:'accent'}),
 txt('Candidate One','CANDIDATE A',1320,326,515,88,55,'#ffffff',{fontWeight:800}),
 txt('Candidate Two','CANDIDATE B',1320,495,515,88,55,'#ffffff',{fontWeight:800}),
 txt('Result One','51.8%',1455,400,333,53,45,'#b5d5ff',{fontWeight:900,textAlign:'right'}),
 txt('Result Two','46.2%',1455,570,333,53,45,'#ffb8bf',{fontWeight:900,textAlign:'right'}),
 rect('Headline strip',0,834,1920,160,channel.dark,{role:'dark'}),
 rect('Election tag',0,834,445,160,channel.accent,{role:'accent'}),
 txt('Tag','ELECTION NIGHT',36,873,380,79,58,'#ffffff',{fontWeight:900}),
 txt('Headline','COUNTING CONTINUES IN KEY STATES',486,851,1360,125,71,'#ffffff',{fontWeight:900}),
 rect('Ticker strip',0,994,1920,86,channel.primary,{role:'primary'}),
 txt('Ticker','LIVE UPDATES     •     POLLS     •     RACES     •     ANALYSIS',42,1010,1526,54,35,'#ffffff',{fontWeight:800}),
 txt('Clock','22:18 ET',1691,1010,191,54,31,'#ffffff',{textAlign:'right',fontWeight:900})
 ];
 return createDocument({title:'Election Center • Results',channel,elements});
}
function weather() {
 const channel=ch('SKYCAST','#1368b8','#ffae38','#082b54');
 const elements=[
 rect('Blue storm background',0,0,1920,1080,{type:'linear',colors:['#081b39','#12417b'],angle:0}),
 rect('Top frame',0,0,1920,120,channel.dark,{role:'dark'}),
 txt('Skycast logo','SKYCAST',38,16,704,94,77,'#ffffff',{role:'logo',fontWeight:900}),
 rect('Alert capsule',1495,22,381,76,channel.accent,{role:'accent'}),
 txt('Alert','WEATHER ALERT',1510,36,354,54,38,'#082b54',{fontWeight:900,textAlign:'center'}),
 placeholder('Weather radar map',40,156,1203,650,{fill:'#155d73'}),
 rect('Forecast board',1268,156,612,650,'#153b64'),
 rect('Forecast title',1268,156,612,110,channel.primary,{role:'primary'}),
 txt('Forecast label','NEXT 24 HOURS',1295,180,551,68,48,'#ffffff',{fontWeight:900}),
 txt('Forecast line 1','TODAY        24°C',1300,313,548,78,51,'#ffffff',{fontWeight:800}),
 txt('Forecast line 2','TONIGHT     17°C',1300,444,548,78,51,'#ffffff',{fontWeight:800}),
 txt('Forecast line 3','TOMORROW    21°C',1300,575,548,78,51,'#ffffff',{fontWeight:800}),
 rect('Weather headline',0,832,1920,166,'#ffffff'),
 rect('Left attention bar',0,832,23,166,channel.accent,{role:'accent'}),
 txt('Weather headline text','SEVERE STORMS EXPECTED ACROSS THE REGION',56,854,1790,130,71,'#102949',{fontWeight:900}),
 rect('Weather ticker',0,998,1920,82,channel.primary,{role:'primary'}),
 txt('Ticker','LOCAL CONDITIONS     •     SATELLITE     •     WIND     •     ADVISORIES',40,1011,1560,57,35,'#ffffff',{fontWeight:800}),
 txt('Clock','07:45',1717,1011,156,57,36,'#ffffff',{fontWeight:900,textAlign:'right'})
 ];
 return createDocument({title:'Skycast • Weather Alert',channel,elements});
}
function sports() {
 const channel=ch('SPORTLINE','#142f59','#f3cb39','#071327');
 const elements=[
 rect('Stadium ground',0,0,1920,1080,'#0d1b2f'),
 placeholder('Live stadium field',0,0,1920,770,{fill:'#105a4b'}),
 rect('Topline',0,0,1920,113,channel.dark,{role:'dark'}),
 txt('Sportsline brand','SPORTLINE',41,10,790,87,73,'#ffffff',{role:'logo',fontWeight:900}),
 rect('Sports live capsule',1644,26,227,61,channel.accent,{role:'accent'}),
 txt('Live','LIVE',1661,32,193,49,39,'#071327',{fontWeight:900,textAlign:'center'}),
 rect('Scoreboard',70,567,1780,190,'#0a2445',{opacity:.96}),
 rect('Team left accent',70,567,24,190,channel.accent,{role:'accent'}),
 txt('Team home','NORTH',123,601,498,115,79,'#ffffff',{fontWeight:900}),
 txt('Home score','3',700,597,139,115,90,'#ffffff',{fontWeight:900,textAlign:'center'}),
 txt('Score divider','—',898,612,91,88,60,'#a5bcdb',{textAlign:'center'}),
 txt('Away score','2',1084,597,139,115,90,'#ffffff',{fontWeight:900,textAlign:'center'}),
 txt('Team away','SOUTH',1287,601,465,115,79,'#ffffff',{fontWeight:900}),
 rect('News strip',0,785,1920,209,channel.dark,{role:'dark'}),
 rect('News top keyline',0,782,1920,7,channel.accent,{role:'accent'}),
 txt('Sports headline','LATE GOAL SEALS DRAMATIC VICTORY',55,812,1809,152,88,'#ffffff',{fontWeight:900}),
 rect('Sports crawl',0,994,1920,86,channel.primary,{role:'primary'}),
 txt('Ticker','FULL TIME     •     MATCH REPORT     •     HIGHLIGHTS     •     UPCOMING',40,1006,1500,60,37,'#ffffff',{fontWeight:800}),
 txt('Clock','90 + 4',1665,1008,219,56,34,'#f3cb39',{textAlign:'right',fontWeight:900})
 ];
 return createDocument({title:'Sportline • Final Score',channel,elements});
}

export const BUILT_INS = [
 {id:'atlantic',label:'Atlantic Breaking',description:'Fox-inspired high-contrast breaking-news composition',make:atlantic},
 {id:'metro',label:'Metro Two-Way',description:'Split-screen live interview',make:metro},
 {id:'world',label:'World Report',description:'Panoramic international bulletin',make:world},
 {id:'finance',label:'Market Watch',description:'Financial newsroom and index table',make:finance},
 {id:'studio',label:'Civic Magazine',description:'Contemporary editorial split view',make:studio},
 {id:'election',label:'Election Center',description:'Results graphics with live map and candidates',make:election},
 {id:'weather',label:'Skycast Weather',description:'Severe-weather radar and forecast bulletin',make:weather},
 {id:'sports',label:'Sportline Final',description:'Sporting-event scoreboard and final result',make:sports}
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
