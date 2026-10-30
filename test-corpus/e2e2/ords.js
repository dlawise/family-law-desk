const {chromium}=require('playwright');const http=require('http'),fs=require('fs');
const srv=http.createServer((q,r)=>{r.writeHead(200,{'Content-Type':'text/html'});fs.createReadStream('/home/claude/letter-desk-site/index.html').pipe(r)}).listen(8199);
(async()=>{const b=await chromium.launch();const p=await (await b.newContext()).newPage();
 await p.addInitScript(()=>{window.__FLD_DEBUG=1});await p.goto('http://localhost:8199/');
 for(const f of fs.readdirSync('.').filter(f=>/^ord_/.test(f))){const it=[{name:f,text:fs.readFileSync(f,'utf8')}];
  const r=await p.evaluate(it=>{const d=window.__FLD_API.extractRules(it);return d.hearings.map(h=>h.orders)},it);console.log('##',f);console.log(JSON.stringify(r,null,1).slice(0,1800))}
 await b.close();srv.close()})();
