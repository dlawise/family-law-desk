const {chromium}=require('playwright');const http=require('http'),fs=require('fs'),path=require('path');
const root='/home/claude/letter-desk-site';
const srv=http.createServer((q,r)=>{let f=path.join(root,q.url==='/'?'index.html':q.url.split('?')[0]);if(!fs.existsSync(f)){r.writeHead(404);return r.end()}r.writeHead(200,{'Content-Type':{'.html':'text/html','.js':'application/javascript'}[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r)}).listen(8190);
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1280,height:1000}})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.addInitScript(()=>{window.__FLD_DEBUG=1});await p.goto('http://localhost:8190/');
 const rd=n=>fs.readFileSync(__dirname+'/'+n,'utf8');
 const items=[{name:'ws_nmo.txt',text:rd('ws_nmo.txt')},{name:'form_nmo.txt',text:rd('form_nmo.txt')},{name:'ord_nmo.txt',text:rd('ord_nmo.txt')},{name:'note_nmo.txt',text:rd('note_nmo.txt')}];
 await p.click('#btnExampleMatter').catch(()=>{});
 await p.evaluate(()=>{});
 // new blank matter
 await p.click('#view_letters');
 for(const tab of ['care','closing']){
  await p.evaluate(t=>document.getElementById('tab_'+t).click(),tab);await p.waitForTimeout(200);
  const filled=await p.evaluate(async(items)=>{const A=window.__FLD_API;A.setItems(items);const d=A.extractRules(items);d.care=A.extractCare(items);return A.applyExtract(d,true)},items);
  await p.waitForTimeout(400);
  const t=await p.evaluate(()=>document.getElementById('paper').innerText);
  console.log('=====',tab,'filled:',JSON.stringify(filled));
  console.log(tab==='care'?t.slice(t.indexOf('Re:'),t.indexOf('Our commitment')+10)+'\n...\n'+t.slice(t.indexOf('Your instructions'),t.indexOf('Our services to you')):t);
 }
 console.log('errors',errs);await b.close();srv.close()})();
