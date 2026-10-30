const {chromium}=require('playwright');const http=require('http'),fs=require('fs');
const srv=http.createServer((q,r)=>{r.writeHead(200,{'Content-Type':'text/html'});fs.createReadStream('/home/claude/letter-desk-site/index.html').pipe(r)}).listen(8200);
(async()=>{const b=await chromium.launch();const p=await (await b.newContext()).newPage();
 await p.addInitScript(()=>{window.__FLD_DEBUG=1});await p.goto('http://localhost:8200/');
 const it=[{name:'x.txt',text:fs.readFileSync('ord_n_directions.txt','utf8')}];
 console.log(JSON.stringify(await p.evaluate(it=>{const s=window.__FLD_API.summariseRules(it).documents[0].summary;const s=window.__FLD_API.summariseRules(it).documents[0].summary;return JSON.stringify([s.slice(-60),/\bCosts: [^.]*\.?$/.test(s),s.length,s.indexOf("Costs were reserved")])},it)));
 await b.close();srv.close()})();
