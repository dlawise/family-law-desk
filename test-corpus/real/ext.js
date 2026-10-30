const {chromium}=require('playwright');const http=require('http'),fs=require('fs'),path=require('path');
const root='/home/claude/letter-desk-site';
const srv=http.createServer((q,r)=>{let f=path.join(root,q.url==='/'?'index.html':q.url.split('?')[0]);if(!fs.existsSync(f)){r.writeHead(404);return r.end()}r.writeHead(200,{'Content-Type':'text/html'});fs.createReadStream(f).pipe(r)}).listen(8195);
(async()=>{const b=await chromium.launch();const p=await (await b.newContext()).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.addInitScript(()=>{window.__FLD_DEBUG=1});await p.goto('http://localhost:8195/');
 const files=fs.readdirSync(__dirname).filter(f=>/^(ws|ord|note)_.*\.txt$/.test(f));
 for(const f of files){
  const it=[{name:f,text:fs.readFileSync(__dirname+'/'+f,'utf8')}];
  const r=await p.evaluate(it=>{const A=window.__FLD_API;const kind=A.kindOf(it[0].name,it[0].text);const d=A.extractRules(it);const c=A.extractCare(it);const sm=A.summariseRules(it).documents[0];return{kind,sumType:sm.type,sumDate:sm.date,summary:sm.summary,points:sm.points,d:{matterType:d.matterType,court:d.court,caseNumber:d.caseNumber,client:d.client,otherParty:d.otherParty,hearings:(d.hearings||[]).map(h=>({date:h.date,time:h.time,type:h.type,judge:h.judge,court:h.court,orders:(h.orders||[]).length,sum:h.summary})),nextHearing:d.nextHearing,finalOrders:d.finalOrders,courtOrders:d.courtOrders,outcome:d.outcomeSummary},c}},it);
  console.log('\n######',f);
  const c=r.c,d=r.d;
  if(/^ws_/.test(f)){console.log(' kind',r.kind,'| sum',r.sumType,r.sumDate);console.log(' client',c.clientName,'|',(c.clientAddress||'').replace(/\n/g,', '),'| resp',c.otherParty,'| rel',c.relationship,'| orders',c.orders,'wn',c.withoutNotice);console.log(' children',JSON.stringify(c.children),'live',c.liveWith,'| police',c.policeRef,'| dob',c.clientDob,c.respondentDob,'| prop',c.propertyAddress,'|',c.tenancyType,'| respAddr',c.respondentAddress);console.log(' relDates',c.relDates,'| types',c.abuseTypes,'| last',c.lastIncident,'| impact',c.impactOnClient,'| appStatus',c.appStatus,'| other',c.otherType);console.log(' incidents',JSON.stringify(c.incidents).slice(0,400));console.log(' SUMMARY',r.summary)}
  else{console.log(' kind',r.kind,'| sum',r.sumType,r.sumDate);console.log(' summary:',r.summary);console.log(' court',d.court,'| case',d.caseNumber,'| client',JSON.stringify(d.client),'| other',d.otherParty,'| mt',d.matterType);console.log(' hearings',JSON.stringify(d.hearings));console.log(' next',JSON.stringify(d.nextHearing),'| final',JSON.stringify(d.finalOrders).slice(0,500),'| outcome',d.outcome)}
 }
 console.log('errors',errs);await b.close();srv.close()})();
