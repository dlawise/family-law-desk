const {chromium}=require('playwright');const http=require('http'),fs=require('fs');
const srv=http.createServer((q,r)=>{r.writeHead(200,{'Content-Type':'text/html'});fs.createReadStream('/home/claude/letter-desk-site/index.html').pipe(r)}).listen(8198);
(async()=>{const b=await chromium.launch();const p=await (await b.newContext()).newPage();p.on('pageerror',e=>console.log('ERR',e.message));
 await p.addInitScript(()=>{window.__FLD_DEBUG=1});await p.goto('http://localhost:8198/');
 const it=[{name:'x.txt',text:fs.readFileSync(__dirname+'/ws_b_nmo_oo.txt','utf8')}];
 console.log(await p.evaluate(it=>{const o=window.__FLD_API.extractCare(it);return JSON.stringify(o.tuneDbg2)},it));
 await b.close();srv.close()})();
