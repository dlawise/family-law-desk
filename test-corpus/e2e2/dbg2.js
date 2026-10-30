const {chromium}=require('playwright');const http=require('http'),fs=require('fs'),path=require('path');
const root='/home/claude/letter-desk-site';
const srv=http.createServer((q,r)=>{let f=path.join(root,'index.html');r.writeHead(200,{'Content-Type':'text/html'});fs.createReadStream(f).pipe(r)}).listen(8196);
(async()=>{const b=await chromium.launch();const p=await (await b.newContext()).newPage();
 await p.addInitScript(()=>{window.__FLD_DEBUG=1});await p.goto('http://localhost:8196/');
 const it=[{name:'x.txt',text:fs.readFileSync(__dirname+'/'+process.argv[2],'utf8')}];
 const r=await p.evaluate(it=>window.__FLD_API.extractCare(it).incidents.map(s=>JSON.stringify(s)),it);console.log(r.join('\n'));await b.close();srv.close()})();
