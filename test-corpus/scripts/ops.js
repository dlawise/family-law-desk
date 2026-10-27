const {chromium}=require('playwright');const http=require('http'),fs=require('fs'),path=require('path');
const root='/home/claude/letter-desk-site';
const srv=http.createServer((q,r)=>{let f=path.join(root,q.url==='/'?'index.html':q.url.split('?')[0]);if(!fs.existsSync(f)){r.writeHead(404);return r.end()}r.writeHead(200,{'Content-Type':{'.html':'text/html','.js':'application/javascript'}[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r)}).listen(8160);
let pass=0,fail=0;const ck=(l,ok,g)=>{if(ok)pass++;else{fail++;console.log('FAIL',l,JSON.stringify(g)===undefined?'':JSON.stringify(g).slice(0,300))}};
(async()=>{
 const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1280,height:1000},acceptDownloads:true});const p=await ctx.newPage();
 const errs=[];p.on('pageerror',e=>{errs.push(e.message);console.log('PAGEERR',e.message)});p.on('crash',()=>console.log('PAGE CRASH'));p.on('close',()=>console.log('PAGE CLOSED'));p.on('console',m=>console.log('CONSOLE',m.type(),m.text().slice(0,200)));p.on('framenavigated',f=>console.log('NAV',f.url()));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
 await p.addInitScript(()=>{window.__FLD_DEBUG=1;window.D=n=>{const d=new Date();d.setDate(d.getDate()+n);return d.toLocaleDateString('en-CA')}});
 await p.goto('http://localhost:8160/');
 const A=(fn,arg)=>p.evaluate(fn,arg);
 /* ===== legal aid ===== */
 await p.click('#btnExampleLA');await p.click('#view_time');
 ck('LA tracker shown',await p.locator('summary:has-text("Legal aid tracker")').count()===1,'');
 await A(()=>{const A=window.__FLD_API,m=A.getCURM();m.S.laCostsLimit='1000';m.S.laStatus='Substantive certificate granted';m.time=[{id:'a',date:D(0),desc:'x',minutes:456,rate:100,chargeable:true}];m.la={scopeReviewed:D(-1)}});
 let al=await A(()=>window.__FLD_API.laAlerts(window.__FLD_API.getCURM()));ck('75% warn',al.some(x=>x.key==='limit75'&&x.level==='warn'),al.map(x=>x.key));
 await A(()=>{window.__FLD_API.getCURM().time[0].minutes=558});al=await A(()=>window.__FLD_API.laAlerts(window.__FLD_API.getCURM()));ck('90% warn',al.some(x=>x.key==='limit90'),al.map(x=>x.key));
 await A(()=>{window.__FLD_API.getCURM().time[0].minutes=612});al=await A(()=>window.__FLD_API.laAlerts(window.__FLD_API.getCURM()));ck('100% high',al.some(x=>x.key==='limit100'&&x.level==='high'),al.map(x=>x.key));
 await p.click('#view_dashboard');await p.click('#view_time');
 await p.fill('#la_extlimit','1500');await p.waitForTimeout(200);al=await A(()=>window.__FLD_API.laAlerts(window.__FLD_API.getCURM()));ck('extension raises limit',!al.some(x=>x.key==='limit100'),al.map(x=>x.key));
 await p.fill('#la_cdue',await A(()=>D(-3)));await p.fill('#la_camt','150');await p.waitForTimeout(200);
 ck('contribution overdue shown',/contribution.*was due/.test(await p.innerText('#laSummary')),await p.innerText('#laSummary'));
 await p.check('#la_cpaid');await p.waitForTimeout(200);ck('paid clears',!/contribution/.test(await p.innerText('#laSummary')),'');
 await p.fill('#la_emerg',await A(()=>D(5)));await p.waitForTimeout(200);ck('emergency expiry warns',/emergency certificate expires/i.test(await p.innerText('#laSummary')),await p.innerText('#laSummary'));
 await p.fill('#la_outside','Advice on property outside scope');await p.waitForTimeout(150);ck('outside scope noted',/outside the scope/i.test(await p.innerText('#laSummary')),'');
 await p.click('#view_dashboard');
 ck('dashboard LA section',await p.locator('summary:has-text("Legal aid matters")').count()===1,'');
 ck('attention has emergency',/emergency certificate/i.test(await p.innerText('body')),'');
 /* ===== reminders ===== */
 const rem=await A(()=>{const A=window.__FLD_API,m=A.getCURM();m.S.clientName='Ms Test';m.S.hearingDate=D(10);m.S.hearingType='Directions hearing';m.history=[];return A.remindersFor(m).map(r=>r.key+'|'+r.date)});
 ck('notice reminder',rem.some(x=>x.startsWith('notice:')),rem);
 await A(()=>{const m=window.__FLD_API.getCURM();m.history.push({id:'h1',type:'notice',label:'Notice',saved:Date.now(),sent:''})});
 ck('notice reminder gone after saving letter',!(await A(()=>window.__FLD_API.remindersFor(window.__FLD_API.getCURM()).some(r=>r.key.startsWith('notice:')))),'');
 await A(()=>{const m=window.__FLD_API.getCURM();m.S.hearingDate=D(-5);m.history=[]});
 ck('outcome reminder',await A(()=>window.__FLD_API.remindersFor(window.__FLD_API.getCURM()).some(r=>r.key.startsWith('outcome:'))),'');
 await A(()=>{const m=window.__FLD_API.getCURM();m.history=[{id:'h2',type:'outcome',label:'Outcome',saved:Date.now()-20*864e5,sent:''}]});
 let ks=await A(()=>window.__FLD_API.remindersFor(window.__FLD_API.getCURM()).map(r=>r.key.split(':')[0]));ck('closing reminder',ks.includes('closing'),ks);
 await A(()=>{const m=window.__FLD_API.getCURM();m.history=[];m.created=Date.now()-70*864e5});
 ks=await A(()=>window.__FLD_API.remindersFor(window.__FLD_API.getCURM()).map(r=>r.key.split(':')[0]));ck('progress reminder',ks.includes('progress'),ks);
 await p.click('#view_letters');await p.click('#view_dashboard');
 ck('nav badge',/Dashboard \(\d+\)/.test(await p.innerText('#view_dashboard')),await p.innerText('#view_dashboard'));
 ck('reminders section',await p.locator('#remSec').count()===1,'');
 const nBefore=await p.locator('#remSec .hrow').count();
 await p.locator('#remSec button:has-text("Dismiss")').first().click();await p.waitForTimeout(300);
 ck('dismiss removes one',await p.locator('#remSec .hrow').count()===nBefore-1,[nBefore,await p.locator('#remSec .hrow').count()]);
 await p.fill('#rem_t','Chase police for the log');await p.fill('#rem_d',await A(()=>D(0)));await p.click('#rem_add');await p.waitForTimeout(300);
 ck('custom reminder listed',/Chase police for the log/.test(await p.innerText('#remSec')),'');
 await p.locator('#remSec .hrow:has-text("Chase police") button:has-text("Done")').click();await p.waitForTimeout(300);
 ck('custom reminder done',!/Chase police for the log/.test(await p.innerText('#remSec')),'');
 let [dl]=await Promise.all([p.waitForEvent('download'),p.click('#rem_ics')]);await dl.saveAs('out3/rem.ics');let ics=fs.readFileSync('out3/rem.ics','utf8');
 ck('ics structure',/BEGIN:VCALENDAR/.test(ics)&&/BEGIN:VEVENT/.test(ics)&&/DTSTART;VALUE=DATE:\d{8}/.test(ics)&&/END:VCALENDAR/.test(ics),ics.slice(0,200));
 ck('ics hides client names by default',!/Example legal aid matter/.test(ics),ics.match(/SUMMARY:.*/g));
 await p.check('#rem_names');[dl]=await Promise.all([p.waitForEvent('download'),p.click('#rem_ics')]);await dl.saveAs('out3/rem2.ics');ics=fs.readFileSync('out3/rem2.ics','utf8');ck('ics names when asked',/Example legal aid matter/.test(ics),ics.match(/SUMMARY:.*/g));
 /* ===== users, owners, audit ===== */
 await p.click('#view_settings');await p.click('summary:has-text("Case workers")');
 await p.click('#u_add');await p.fill('#usersBox input[aria-label="Name of case worker 1"]','Amina Case');await p.click('#u_add');await p.fill('#usersBox input[aria-label="Name of case worker 2"]','Ben Worker');
 await p.selectOption('#u_me',{label:'Amina Case'});
 ck('current user sets firm case worker',await A(()=>window.__FLD_API.USERS.current!==''),'');
 await p.click('#view_dashboard');await p.click('button:has-text("New matter")');
 const own=await A(()=>({o:window.__FLD_API.getCURM().owner,u:window.__FLD_API.USERS.list[0].id}));ck('new matter owned by me',own.o===own.u,own);
 await A(()=>{const A=window.__FLD_API;A.auditDiff();A.setS({clientName:'Ms Audit',ourRef:'AUD/1'});A.auditDiff()});
 let au=await A(()=>window.__FLD_API.getCURM().audit.map(e=>e.u+': '+e.a));ck('audit created + edited',au.some(x=>/Matter created/.test(x))&&au.some(x=>/Edited: .*clientName/.test(x)&&/^Amina Case/.test(x)),au);
 ck('audit has no field values',!au.some(x=>/Ms Audit/.test(x)),au);
 await A(()=>{const m=window.__FLD_API.getCURM();m.history.push({id:'hx',type:'care',label:'Client care letter',saved:Date.now(),sent:''});window.__FLD_API.auditDiff()});
 au=await A(()=>window.__FLD_API.getCURM().audit.map(e=>e.a));ck('audit logs letter saved',au.some(x=>/Saved to matter file: Client care letter/.test(x)),au);
 await p.click('#view_file');await p.click('summary:has-text("Activity log")');
 ck('activity log table',(await p.locator('table.ledger tbody tr').count())>=2,'');
 [dl]=await Promise.all([p.waitForEvent('download'),p.click('#auditCsv')]);await dl.saveAs('out3/audit.csv');ck('audit csv',/Matter created/.test(fs.readFileSync('out3/audit.csv','utf8')),'');
 /* assign + filter */
 await p.click('#view_dashboard');
 const sel=p.locator('table.ledger select[aria-label^="Case worker for"]').first();await sel.selectOption({label:'Ben Worker'});await p.waitForTimeout(200);
 await p.selectOption('#d_who','mine');await p.waitForTimeout(300);
 const names1=await p.locator('table.ledger tbody tr').allInnerTexts();
 await p.selectOption('#d_who','all');await p.waitForTimeout(300);const n2=await p.locator('table.ledger tbody tr').count();
 ck('filter mine hides colleague matter',names1.length<n2,[names1.length,n2]);
 /* ===== merge ===== */
 await p.click('#view_settings');
 await p.click('summary:has-text("Merge matters from a colleague")');
 const stBefore=await A(()=>window.__FLD_API.getSTORE().matters.length);
 [dl]=await Promise.all([p.waitForEvent('download'),p.click('#mg_mine')]);await dl.saveAs('out3/mine.json');
 const exp=JSON.parse(fs.readFileSync('out3/mine.json','utf8'));ck('export my matters has app tag',exp.app==='family-letter-desk'&&exp.store.matters.length>=1,Object.keys(exp));
 // colleague edit: newer version of first matter + a brand new matter
 const first=exp.store.matters[0];const edited=JSON.parse(JSON.stringify(first));edited.updated=Date.now()+10000;edited.S.clientName='Colleague Changed';
 const brandNew=JSON.parse(JSON.stringify(first));brandNew.id='mNEW1';brandNew.S.clientName='Brand New';brandNew.name='Brand New';brandNew.autoName=false;
 fs.writeFileSync('out3/colleague.json',JSON.stringify({app:'family-letter-desk',v:2,encrypted:false,store:{v:2,current:edited.id,matters:[edited,brandNew]}}));
 await p.setInputFiles('#mg_file','out3/colleague.json');await p.click('#mg_btn');await p.waitForTimeout(500);
 const ms=await p.innerText('#mg_status');ck('merge report',/1 added, 1 updated/.test(ms),ms);
 const post=await A(()=>window.__FLD_API.getSTORE().matters.map(m=>m.name+'|'+m.S.clientName+'|'+m.status));
 ck('previous version kept closed',post.some(x=>/previous version/.test(x)&&/closed/.test(x)),post);ck('updated content present',post.some(x=>/Colleague Changed/.test(x)),post);ck('new matter added',post.some(x=>/Brand New/.test(x)),post);
 // older file: yours newer -> kept
 edited.updated=1;fs.writeFileSync('out3/old.json',JSON.stringify({app:'family-letter-desk',v:2,encrypted:false,store:{v:2,current:edited.id,matters:[edited]}}));
 await p.setInputFiles('#mg_file','out3/old.json');await p.click('#mg_btn');await p.waitForTimeout(400);ck('older file leaves yours',/1 left as they were/.test(await p.innerText('#mg_status')),await p.innerText('#mg_status'));
 /* ===== backups ===== */
 await A(()=>{const O=window.__FLD_API.OPTS;delete O.lastBackup;O.changes=0});
 await p.click('#view_dashboard');ck('backup banner when never backed up',await p.locator('#bkbar').count()===1,'');
 [dl]=await Promise.all([p.waitForEvent('download'),p.click('#bk_now')]);await dl.saveAs('out3/bk.json');ck('backup file valid',JSON.parse(fs.readFileSync('out3/bk.json','utf8')).app==='family-letter-desk','');
 await p.waitForTimeout(400);ck('banner gone after backup',await p.locator('#bkbar').count()===0,'');
 await p.click('#view_settings');await p.click('summary:has-text("Automatic backups and storage")');await p.waitForTimeout(300);
 ck('storage status text',/browser/i.test(await p.innerText('#persistStatus')),await p.innerText('#persistStatus'));
 /* folder backup using the real origin-private file system as the chosen folder */
 await A(async()=>{window.showDirectoryPicker=async()=>{const r=await navigator.storage.getDirectory();return await r.getDirectoryHandle('bk-test',{create:true})}});
 await A(()=>{const O=window.__FLD_API.OPTS;O.folderDelay=100;O.folderGap=0});
 await p.click('#bk_choose');await p.waitForTimeout(1200);
 ck('folder first backup status',/Automatic backups are on.*Last backup/.test(await p.innerText('#folderStatus')),await p.innerText('#folderStatus'));
 const files1=await A(async()=>{const d=await (await navigator.storage.getDirectory()).getDirectoryHandle('bk-test');const o=[];for await(const e of d.entries())o.push(e[0]);return o});
 ck('backup file written to folder',files1.length===1&&/^family-letter-desk-backup-\d{4}-\d{2}-\d{2}\.json$/.test(files1[0]),files1);
 // auto: change something, wait for debounce
 await A(()=>{const A=window.__FLD_API;A.setS({ourRef:'AUTO/77'});const m=A.getCURM();m.notes='auto backup marker';});
 await p.click('#view_file');await p.fill('#mf_notes','auto backup marker 2');await p.waitForTimeout(1800);
 const txt=await A(async()=>{const d=await (await navigator.storage.getDirectory()).getDirectoryHandle('bk-test');for await(const e of d.entries()){const f=await e[1].getFile();return await f.text()}});
 ck('automatic backup picked up the change',/auto backup marker 2/.test(txt),txt.length);
 // prune
 await A(async()=>{const d=await (await navigator.storage.getDirectory()).getDirectoryHandle('bk-test');for(let i=1;i<=16;i++){const fh=await d.getFileHandle('family-letter-desk-backup-2020-01-'+String(i).padStart(2,'0')+'.json',{create:true});const w=await fh.createWritable();await w.write('{}');await w.close()}});
 const r=await A(()=>window.__FLD_API.backupToFolder(true));const files2=await A(async()=>{const d=await (await navigator.storage.getDirectory()).getDirectoryHandle('bk-test');const o=[];for await(const e of d.entries())o.push(e[0]);return o});
 ck('prune keeps 14',r.ok&&files2.length===14,[r,files2.length]);ck('newest kept after prune',files2.some(f=>!/2020-01/.test(f)),files2);
 // encrypted backups
 await p.click('#view_settings');await p.click('summary:has-text("Security")');await p.fill('#sec_p1','correct horse battery');await p.fill('#sec_p2','correct horse battery');await p.click('button:has-text("Turn on encryption and lock")');await p.waitForTimeout(1500);
 const enc=await A(async()=>{const r=await window.__FLD_API.backupToFolder(true);const d=await (await navigator.storage.getDirectory()).getDirectoryHandle('bk-test');let t='';for await(const e of d.entries()){if(/\d{4}-\d{2}-\d{2}\.json$/.test(e[0])&&!/2020-01/.test(e[0])){t=await (await e[1].getFile()).text()}}const o=JSON.parse(t);return{ok:r.ok,encrypted:o.encrypted,leak:/Colleague Changed|Ms Audit|Brand New/.test(t)}});
 ck('folder backup encrypted, no names leaked',enc.ok&&enc.encrypted===true&&!enc.leak,enc);
 ck('no page errors',errs.length===0,errs);
 console.log('PASS',pass,'FAIL',fail);await b.close();srv.close();
})();
