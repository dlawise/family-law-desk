const {chromium}=require('playwright');const http=require('http'),fs=require('fs'),path=require('path');
const root='/home/claude/letter-desk-site';const PD=path.resolve(__dirname,'../pdfs');
const srv=http.createServer((q,r)=>{let f=path.join(root,q.url==='/'?'index.html':decodeURIComponent(q.url.split('?')[0]));if(!fs.existsSync(f)){r.writeHead(404);return r.end()}r.writeHead(200,{'Content-Type':{'.html':'text/html','.js':'application/javascript','.wasm':'application/wasm'}[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r)}).listen(8151);
const corpus=JSON.parse(fs.readFileSync(__dirname+'/corpus/corpus.json','utf8'));const E={};corpus.forEach(d=>E[d.name.replace('.txt','')]=d.exp);
const only=process.argv[2]?new RegExp(process.argv[2]):null;
(async()=>{
 const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1280,height:1000}});const p=await ctx.newPage();
 const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.addInitScript(()=>{window.__FLD_DEBUG=1});await p.goto('http://localhost:8151/');
 await p.click('#btnExampleLA');await p.click('#view_dashboard');await p.click('button:has-text("New matter")');await p.click('#view_letters');
 const files=fs.readdirSync(PD).filter(f=>/\.(pdf|jpg)$/.test(f)&&(!only||only.test(f))).sort();
 let pass=0,fail=0;
 for(const f of files){
  const base=f.replace(/_(text|scan|photo)\.(pdf|jpg)$/,'');const mode=/_text/.test(f)?'text':/_scan/.test(f)?'scan':'photo';const e=E[base]||{};
  await p.reload();await p.click('#view_dashboard');await p.click('button:has-text("New matter")');await p.click('#view_letters');
  await p.setInputFiles('#f_files',path.join(PD,f));const t0=Date.now();
  await p.click('#btnRead');
  try{await p.waitForFunction(()=>{const r=document.getElementById('docResult');return r&&!r.hidden&&r.innerText.length>5},null,{timeout:240000})}catch(x){console.log('TIMEOUT',f)}
  const S=await p.evaluate(()=>window.__FLD_API.getS());const res=await p.innerText('#docResult');
  const bad=[];const low=x=>String(x||'').toLowerCase();
  if(e.clientName&&low(S.clientName).indexOf(low(e.clientName).replace(/^(mrs?|ms|miss|dr) /,''))<0)bad.push('client '+S.clientName);
  if(e.otherParty&&low(S.otherParty).indexOf(low(e.otherParty).replace(/^(mrs?|ms|miss|dr) /,''))<0)bad.push('other '+S.otherParty);
  if(e.date&&S.hearingDate!==e.date&&!/^note/.test(base))bad.push('date '+S.hearingDate+' vs '+e.date);
  if(e.caseNumber&&S.caseNumber!==e.caseNumber)bad.push('case '+S.caseNumber);
  if(e.judge&&low(S.judgeName).indexOf(low(e.judge).replace(/^.*judge /,''))<0)bad.push('judge '+S.judgeName);
  if(/^note/.test(base)&&e.date&&!/Filled in:.*(attendance|discussion)/i.test(res))bad.push('note not filled: '+res.slice(0,80).replace(/\n/g,' '));
  const ok=!bad.length;ok?pass++:fail++;
  console.log((ok?'OK  ':'FAIL')+' '+f.padEnd(46)+((Date.now()-t0)/1000).toFixed(0)+'s '+bad.join(' | '));
 }
 console.log('PASS',pass,'FAIL',fail,'errors',errs);await b.close();srv.close();
})();
