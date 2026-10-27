const {chromium}=require('playwright');const http=require('http'),fs=require('fs'),path=require('path');
const root='/home/claude/letter-desk-site';
const srv=http.createServer((q,r)=>{let f=path.join(root,q.url==='/'?'index.html':q.url.split('?')[0]);if(!fs.existsSync(f)){r.writeHead(404);return r.end()}r.writeHead(200,{'Content-Type':{'.html':'text/html'}[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r)}).listen(8150);
let pass=0,fail=0;const ck=(l,ok,g)=>{if(ok)pass++;else{fail++;console.log('FAIL',l,JSON.stringify(g))}};
const D1=`CASE FILE RECORD\nApplicant: Rina Patel\nOpponent: Barry Cole\nCourt: Tameside Justice Hub\nCase No: MA26F01234\n\nI, Rina Patel, of 4 Oak Lane, Stockport SK1 2AB, make this statement in support of my application for a non-molestation order. Barry Cole has been abusive.`;
const D2=`CASE FILE RECORD\nApplicant: Dee Roy\nOpponent: Zed Young\nCourt: Tameside Justice Hub\n\nI, Dee Roy, of 9 Mill Road, Stockport SK2 3CD, make this statement in support of my application for a non-molestation order.`;
const N1=`CLIENT CONTACT RECORD\n12 October 2026\nSpoke to Mrs Patel by telephone 10:00 - 10:20.\nShe confirmed that she wants to proceed. I advised her to keep her evidence safe. Next steps: send draft statement.`;
const ACT=`CASE ACTIVITY SHEET\n14 October 2026\nSpoke to the client by telephone.\nShe said the respondent called twice. I advised her to call the police if he comes to the house.`;
(async()=>{
 const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1280,height:1000},acceptDownloads:true});const p=await ctx.newPage();
 const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
 await p.addInitScript(()=>{window.__FLD_DEBUG=1});await p.goto('http://localhost:8150/');
 // --- vocabulary (API level)
 const base=await p.evaluate(n=>{const A=window.__FLD_API;return{note:A.extractRules([{name:'a.txt',text:n}]).attendanceNotes.length}},N1);
 ck('note unrecognised before vocab',base.note===0,base);
 await p.click('#btnExampleLA');await p.click('#view_settings');await p.click('summary:has-text("Teach the reader")');
 await p.fill('#voc_noteHeads','Client contact record');await p.fill('#voc_courts','Tameside Justice Hub');await p.fill('#voc_judges','District Judge Okonkwo-Reid');
 const r1=await p.evaluate(n=>{const A=window.__FLD_API;const x=A.extractRules([{name:'a.txt',text:n}]);const o=A.extractRules([{name:'o.txt',text:'IN THE FAMILY COURT AT SOMEWHERE\nORDER\nMade by District Judge Okonkwo-Reid on 5 October 2026\nUPON hearing counsel IT IS ORDERED:\n1. The respondent must not contact the applicant.\n2. No order for costs.'}]);return{note:x.attendanceNotes.length,court:A.extractRules([{name:'c.txt',text:'Hearing at Tameside Justice Hub on 1 September 2026'}]).court,judge:(o.hearings[0]||{}).judge}},N1);
 ck('note recognised after vocab',r1.note===1,r1);ck('court from vocab',r1.court==='Tameside Justice Hub',r1);ck('judge from vocab',r1.judge==='District Judge Okonkwo-Reid',r1);
 // persists over reload
 await p.reload();const pv=await p.evaluate(()=>localStorage.getItem('fld-vocab-v1'));ck('vocab persisted',/Tameside/.test(pv||''),pv);
 // --- correction UI
 await p.click('#btnExampleLA');await p.click('#view_dashboard');await p.click('button:has-text("New matter")');await p.click('#view_letters');
 await p.fill('#f_paste',D1);await p.click('#btnRead');await p.waitForTimeout(800);
 ck('teach panel visible',await p.locator('#teachBtn').count()===1,'');
 await p.click('summary:has-text("Something wrong?")');
 await p.selectOption('#teachField','otherParty');await p.fill('#teachValue','Barry Cole');await p.click('#teachBtn');await p.waitForTimeout(300);
 let L=await p.evaluate(()=>JSON.parse(localStorage.getItem('fld-learn-v1')||'{}'));
 ck('label learned',(L.labels||[]).some(l=>l.field==='otherParty'&&l.label==='Opponent'),L);
 // second doc: learned label must fill
 await p.fill('#f_paste',D2);await p.click('#btnRead');await p.waitForTimeout(800);
 const s2=await p.evaluate(()=>window.__FLD_API.getS().otherParty);ck('learned label used',s2==='Zed Young',s2);
 // block: wrong value never used
 await p.click('summary:has-text("Something wrong?")');await p.selectOption('#teachField','clientName');await p.fill('#teachValue','Dee Roy');await p.click('#teachBtn');await p.waitForTimeout(200);
 L=await p.evaluate(()=>JSON.parse(localStorage.getItem('fld-learn-v1')||'{}'));console.log('blocks',JSON.stringify(L.blocks),'labels',JSON.stringify(L.labels));
 // --- kind learning via summary
 await p.fill('#f_paste',ACT);await p.click('#btnSum');await p.waitForTimeout(800);
 let ty=await p.locator('#sumOut summary').first().innerText();ck('unknown type before teaching',!/Attendance note/.test(ty),ty);
 await p.locator('#sumOut summary').first().click();await p.selectOption('.kindsel','Attendance note');await p.waitForTimeout(400);
 ty=await p.locator('#sumOut summary').first().innerText();ck('type after teaching',/Attendance note/.test(ty),ty);
 // survives reload and applies to another doc with same heading
 await p.reload();const k=await p.evaluate(a=>{const A=window.__FLD_API;return A.summariseRules([{name:'z.txt',text:a.replace('14 October','20 October')}]).documents[0].type},ACT);ck('kind persisted',/Attendance note/.test(k),k);
 // hide point
 await p.click('#btnExampleLA');await p.click('#view_dashboard');await p.click('button:has-text("New matter")');await p.click('#view_letters');
 await p.fill('#f_paste',ACT);await p.click('#btnSum');await p.waitForTimeout(600);await p.locator('#sumOut summary').first().click();
 const n0=await p.locator('#sumOut .hidept').count();if(n0){await p.locator('#sumOut .hidept').first().click();await p.waitForTimeout(200);ck('point hidden',await p.locator('#sumOut .hidept').count()===n0-1,n0)}else ck('has points',false,n0);
 // settings list, export, forget
 await p.click('#view_settings');await p.click('summary:has-text("Teach the reader")');const lt=await p.innerText('#learnList');ck('learned list shows',/Opponent/.test(lt)&&/summary point/.test(lt),lt.slice(0,300));
 const [dl]=await Promise.all([p.waitForEvent('download'),p.click('#learnExport')]);await dl.saveAs('out3/reader-rules.json');const ex=JSON.parse(fs.readFileSync('out3/reader-rules.json','utf8'));ck('export has rules',ex.learned.labels.length>0&&ex.vocab.courts.length===1,Object.keys(ex));
 p.once('dialog',d=>d.accept());await p.click('#learnClear');await p.waitForTimeout(200);L=await p.evaluate(()=>JSON.parse(localStorage.getItem('fld-learn-v1')||'{}'));ck('cleared',!(L.labels||[]).length&&!(L.kinds||[]).length,L);
 await p.setInputFiles('#learnImport','out3/reader-rules.json');await p.waitForTimeout(500);L=await p.evaluate(()=>JSON.parse(localStorage.getItem('fld-learn-v1')||'{}'));ck('imported',(L.labels||[]).length>0,L);
 const hs=await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth);ck('no hscroll',!hs,hs);
 console.log('PASS',pass,'FAIL',fail,'errors',errs);await b.close();srv.close();
})();
