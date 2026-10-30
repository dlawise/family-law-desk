const {chromium}=require('playwright');const http=require('http'),fs=require('fs'),path=require('path');
const root='/home/claude/letter-desk-site';
const srv=http.createServer((q,r)=>{let f=path.join(root,q.url==='/'?'index.html':q.url.split('?')[0]);if(!fs.existsSync(f)){r.writeHead(404);return r.end()}r.writeHead(200,{'Content-Type':'text/html'});fs.createReadStream(f).pipe(r)}).listen(8194);
(async()=>{const b=await chromium.launch();const p=await (await b.newContext()).newPage();p.on('pageerror',e=>console.log('PAGEERR',e.message));p.on('console',m=>{if(m.type()==='error')console.log('CONSOLE',m.text())});
 await p.goto('http://localhost:8194/');await p.waitForTimeout(800);console.log('has btn',await p.evaluate(()=>!!document.getElementById('btnExampleMatter')+' '+!!document.getElementById('view_letters')));await b.close();srv.close()})();
