const {chromium}=require('playwright');const http=require('http'),fs=require('fs'),path=require('path');
const root='/home/claude/letter-desk-site';
const srv=http.createServer((q,r)=>{let f=path.join(root,q.url==='/'?'index.html':q.url.split('?')[0]);if(!fs.existsSync(f)){r.writeHead(404);return r.end()}r.writeHead(200,{'Content-Type':{'.html':'text/html','.js':'application/javascript'}[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r)}).listen(8174);
let pass=0,fail=0;const ck=(l,ok,g)=>{if(ok)pass++;else{fail++;console.log('FAIL',l,JSON.stringify(g))}};
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1280,height:1000}})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.addInitScript(()=>{window.__FLD_DEBUG=1;window.D=n=>{const d=new Date();d.setDate(d.getDate()+n);return d.toLocaleDateString('en-CA')}});await p.goto('http://localhost:8174/');
 const A=(f,a)=>p.evaluate(f,a);const keys=()=>A(()=>window.__FLD_API.remindersFor(window.__FLD_API.getCURM()).map(r=>r.key.split(':')[0]));
 await p.click('#btnExampleLA');
 await A(()=>{const m=window.__FLD_API.getCURM();m.S.clientName='Ms Rule';m.S.hearingDate=D(40);m.S.hearingType='Directions hearing';m.S.nextHearing='';m.history=[];m.created=Date.now()-30*864e5;m.S.laStatus='Substantive certificate granted';m.la={scopeReviewed:D(-1)};m.time=[];});
 let k=await keys();ck('default: notice not yet due at 40 days',!k.includes('notice'),k);
 await p.click('#view_settings');await p.click('summary:has-text("Reminder rules")');
 await p.fill('#rr_days_notice','30');await p.waitForTimeout(150);k=await keys();ck('notice window follows setting',k.includes('notice'),k);
 await p.uncheck('#rr_on_notice');k=await keys();ck('notice off',!k.includes('notice'),k);await p.check('#rr_on_notice');
 // progress: created 30 days ago, LA matter
 k=await keys();ck('no progress reminder at 30 days by default',!k.includes('progress'),k);
 await p.fill('#rr_days_progress','20');k=await keys();ck('progress interval shorter',k.includes('progress'),k);
 await p.fill('#rr_days_progressLA','45');k=await keys();ck('legal aid progress interval overrides',!k.includes('progress'),k);
 await p.fill('#rr_days_progressLA','0');await p.uncheck('#rr_on_progress');k=await keys();ck('progress off',!k.includes('progress'),k);await p.check('#rr_on_progress');
 // outcome + closing
 await A(()=>{const m=window.__FLD_API.getCURM();m.S.hearingDate=D(-1);m.history=[]});
 await p.fill('#rr_days_outcome','0');const o=await A(()=>window.__FLD_API.remindersFor(window.__FLD_API.getCURM()).filter(r=>r.key.startsWith('outcome')).map(r=>r.date));ck('outcome due date uses days',o.length===1&&o[0]===(await A(()=>D(-1))),o);
 await A(()=>{const m=window.__FLD_API.getCURM();m.history=[{id:'o',type:'outcome',label:'Outcome',saved:Date.now()-5*864e5,sent:''}]});
 k=await keys();ck('closing not yet due at 5 days (default 14)',!k.includes('closing'),k);await p.fill('#rr_days_closing','3');k=await keys();ck('closing follows setting',k.includes('closing'),k);
 // LA thresholds
 await A(()=>{const m=window.__FLD_API.getCURM();m.S.laCostsLimit='1000';m.time=[{id:'a',date:D(0),desc:'x',minutes:360,rate:100,chargeable:true}];m.history=[]});
 let al=await A(()=>window.__FLD_API.laAlerts(window.__FLD_API.getCURM()).map(x=>x.key));ck('60% no limit warning by default',!al.some(x=>/limit/.test(x)),al);
 await p.fill('#rr_days_limitWarn','50');al=await A(()=>window.__FLD_API.laAlerts(window.__FLD_API.getCURM()).map(x=>x.key));ck('limit warning at 50%',al.includes('limit75'),al);
 await p.uncheck('#rr_on_limitWarn');al=await A(()=>window.__FLD_API.laAlerts(window.__FLD_API.getCURM()).map(x=>x.key));ck('limit warning switched off',!al.includes('limit75'),al);await p.check('#rr_on_limitWarn');
 await p.fill('#rr_days_scope','0');await A(()=>{window.__FLD_API.getCURM().la.scopeReviewed=D(-2)});al=await A(()=>window.__FLD_API.laAlerts(window.__FLD_API.getCURM()).map(x=>x.key));ck('scope review interval',al.includes('scope'),al);
 // la off
 await p.uncheck('#rr_on_la');k=await keys();ck('legal aid reminders off',!k.includes('la'),k);
 await p.click('#view_dashboard');ck('attention hides legal aid when off',!/legal aid costs limit|scope of the certificate/i.test(await p.innerText('body')),'');
 // persistence + reset
 await p.reload();const saved=await A(()=>JSON.parse(localStorage.getItem('fld-opts-v2')).remRules);ck('rules persisted',saved&&saved.notice&&saved.notice.days===30,saved);
 await p.click('#view_settings');await p.click('summary:has-text("Reminder rules")');await p.click('#rr_reset');
 ck('reset restores defaults',(await p.inputValue('#rr_days_closing'))==='14'&&(await p.inputValue('#rr_days_progress'))==='56'&&await p.isChecked('#rr_on_la'),'');
 console.log('PASS',pass,'FAIL',fail,'errors',errs);await b.close();srv.close()})();
