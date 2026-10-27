const {chromium}=require('playwright');const http=require('http'),fs=require('fs'),path=require('path');
const root='/home/claude/letter-desk-site';
const srv=http.createServer((q,r)=>{let f=path.join(root,q.url==='/'?'index.html':decodeURIComponent(q.url.split('?')[0]));if(!fs.existsSync(f)){r.writeHead(404);return r.end()}r.writeHead(200,{'Content-Type':{'.html':'text/html','.js':'application/javascript','.wasm':'application/wasm'}[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r)}).listen(8173);
let pass=0,fail=0;const ck=(l,ok,g)=>{if(ok)pass++;else{fail++;console.log('FAIL',l,JSON.stringify(g))}};
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1280,height:1000}})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.addInitScript(()=>{window.__FLD_DEBUG=1});await p.goto('http://localhost:8173/');
 await p.click('#btnExampleLA');await p.click('#view_letters');await p.evaluate(()=>document.getElementById('tab_care').click());
 await p.setInputFiles('#f_files',['../pdfs_hard/ord_a_fl404a_undertaking_scan.pdf','../pdfs_hard/ws_b_thirdperson_solicitor_scan.pdf']);
 await p.click('#btnRead');
 const seen=[];let barSeen=false,second=false,eta=false;
 for(let i=0;i<14;i++){await p.waitForTimeout(1500);const st=await p.innerText('#docStatus');seen.push(st.slice(0,150));if(await p.locator('#docProg').isVisible())barSeen=true;if(/Improving a poor/.test(st))second=true;if(/left\.|Nearly done/.test(st))eta=true;if(await p.locator('#btnStopRead').isVisible()&&i>=5)break}
 console.log(seen.slice(-3).join('\n'));
 ck('progress bar shown',barSeen,'');ck('status mentions scanned page x of y',seen.some(x=>/scanned page \d+ of \d+/.test(x)),seen.slice(0,3));
 console.log('second pass text seen',second,'eta seen',eta);
 await p.click('#btnStopRead');await p.waitForTimeout(2500);
 ck('stopped message',/Stopped/.test(await p.innerText('#docStatus')),await p.innerText('#docStatus'));
 ck('read button usable again',await p.locator('#btnRead').isEnabled(),'');ck('bar hidden after stop',!(await p.locator('#docProg').isVisible()),'');
 ck('no error issues',!/could not be read/.test(await p.innerText('#docStatus')),await p.innerText('#docStatus'));
 // run again to completion with a single easy file to make sure OCR still works after terminate
 await p.setInputFiles('#f_files',['../pdfs_real/ws_b_thirdperson_solicitor_scan.pdf']);await p.click('#btnRead');
 await p.waitForFunction(()=>{const r=document.getElementById('docResult');return r&&!r.hidden&&r.innerText.length>5},null,{timeout:200000});
 const S=await p.evaluate(()=>window.__FLD_API.getS());ck('OCR works after a stop',/Rahman/i.test(S.clientName||''),S.clientName);
 console.log('PASS',pass,'FAIL',fail,'errors',errs);await b.close();srv.close()})();
