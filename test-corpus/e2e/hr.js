const {chromium}=require('playwright');const http=require('http'),fs=require('fs'),path=require('path');
const root='/home/claude/letter-desk-site';
const srv=http.createServer((q,r)=>{let f=path.join(root,q.url==='/'?'index.html':q.url.split('?')[0]);if(!fs.existsSync(f)){r.writeHead(404);return r.end()}r.writeHead(200,{'Content-Type':'text/html'});fs.createReadStream(f).pipe(r)}).listen(8191);
(async()=>{const b=await chromium.launch();const p=await (await b.newContext()).newPage();
 await p.addInitScript(()=>{window.__FLD_DEBUG=1});await p.goto('http://localhost:8191/');
 const rd=n=>fs.readFileSync(__dirname+'/'+n,'utf8');
 const items=['ord_nmo.txt','note_nmo.txt'].map(n=>({name:n,text:rd(n)}));
 const d=await p.evaluate(it=>JSON.stringify(window.__FLD_API.extractRules(it).hearings),items);console.log(d);await b.close();srv.close()})();
