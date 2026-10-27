const {chromium}=require('playwright');const http=require('http'),fs=require('fs'),path=require('path');
const root='/home/claude/letter-desk-site';
const srv=http.createServer((q,r)=>{let f=path.join(root,q.url==='/'?'index.html':q.url.split('?')[0]);if(!fs.existsSync(f)){r.writeHead(404);return r.end()}r.writeHead(200,{'Content-Type':{'.html':'text/html','.js':'application/javascript'}[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r)}).listen(8146);
(async()=>{
 const corpus=JSON.parse(fs.readFileSync('corpus/corpus.json','utf8'));
 const b=await chromium.launch();const p=await (await b.newContext()).newPage();
 await p.addInitScript(()=>{window.__FLD_DEBUG=1});await p.goto('http://localhost:8146/');
 const res=await p.evaluate((corpus)=>{const A=window.__FLD_API;return corpus.map(d=>{const it=[{name:d.name,text:d.text}];let care=null,rules=null;try{care=A.extractCare(it)}catch(e){care={err:String(e)}}try{rules=A.extractRules(it)}catch(e){rules={err:String(e)}}return{name:d.name,exp:d.exp,care,rules}})},corpus);
 let pass=0,fail=0;const out=[];
 const chk=(n,label,ok,got)=>{if(ok)pass++;else{fail++;out.push(`FAIL ${n} :: ${label} :: got ${JSON.stringify(got)}`)}};
 for(const r of res){const e=r.exp,c=r.care,u=r.rules,n=r.name;
  if(n.startsWith('ws_')){
   if(e.clientName)chk(n,'clientName',(c.clientName||'')===e.clientName,c.clientName);
   if(e.otherParty)chk(n,'otherParty',(c.otherParty||'')===e.otherParty,c.otherParty);
   if(e.orders)chk(n,'orders',JSON.stringify([...c.orders].sort())===JSON.stringify([...e.orders].sort()),c.orders);
   if(e.withoutNotice)chk(n,'withoutNotice',c.withoutNotice===true,c.withoutNotice);
   if(e.children){for(const k of e.children)chk(n,'child '+k,(c.children||[]).some(x=>x.startsWith(k)),c.children)}
   if(e.incidentHas)chk(n,'incident '+e.incidentHas,(c.incidents||[]).join(' ').toLowerCase().includes(e.incidentHas),c.incidents);
   if(e.policeHas)chk(n,'police',(c.policeRef||'').includes(e.policeHas),c.policeRef);
   if(e.safeHas)chk(n,'safe',(c.safeContact||'').includes(e.safeHas),c.safeContact);
   if(e.addrHas)chk(n,'addr',(c.clientAddress||'').includes(e.addrHas),c.clientAddress);
   if(e.relationship)chk(n,'relationship',(c.relationship||'').includes(e.relationship),c.relationship);
  }else if(n.startsWith('ord_')){
   const h=(u.hearings||[])[0]||{};
   chk(n,'recognised as order',(u.hearings||[]).length>0,u.notes);
   if(e.date)chk(n,'date',h.date===e.date,h.date);
   if(e.judge)chk(n,'judge',(h.judge||'')===e.judge,h.judge);
   if(e.caseNumber)chk(n,'caseNumber',u.caseNumber===e.caseNumber,u.caseNumber);
   if(e.court)chk(n,'court',(u.court||'').includes(e.court),u.court);
   if(e.nextDate)chk(n,'nextDate',(u.nextHearing&&u.nextHearing.date)===e.nextDate,u.nextHearing);
   if(e.hasPenal)chk(n,'penal',!!(h.extra&&h.extra.length),h.extra);
   if(e.orderCount)chk(n,'orderCount',(h.orders||[]).length===e.orderCount,(h.orders||[]).length);
   if(e.hearingDate)chk(n,'hearingDate',h.date===e.hearingDate,h.date);
  }else{
   const a=(u.attendanceNotes||[])[0]||{};
   chk(n,'recognised as note',(u.attendanceNotes||[]).length>0,u.notes);
   if(e.date)chk(n,'date',a.date===e.date,a.date);
   if(e.type)chk(n,'type',a.type===e.type,a.type);
   if(e.start)chk(n,'start',a.start===e.start,a.start);
   if(e.end)chk(n,'end',a.end===e.end,a.end);
   if(e.counsel)chk(n,'counsel',/counsel/i.test((a.present||'')+(a.summary||'')),a.present);
  }}
 console.log('PASS',pass,'FAIL',fail);console.log(out.join('\n'));
 if(process.argv[2]){const x=res.find(r=>r.name===process.argv[2]);console.log(JSON.stringify(x,null,1).slice(0,3500))}
 await b.close();srv.close();
})();
