const {chromium}=require('playwright');const http=require('http'),fs=require('fs'),path=require('path');
const root='/home/claude/letter-desk-site';
const srv=http.createServer((q,r)=>{let f=path.join(root,q.url==='/'?'index.html':q.url.split('?')[0]);if(!fs.existsSync(f)){r.writeHead(404);return r.end()}r.writeHead(200,{'Content-Type':{'.html':'text/html','.js':'application/javascript'}[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r)}).listen(8147);
(async()=>{
 const corpus=JSON.parse(fs.readFileSync(__dirname+'/corpus/corpus.json','utf8'));
 const b=await chromium.launch();const p=await (await b.newContext()).newPage();
 const errs=[];p.on('pageerror',e=>errs.push(String(e)));
 await p.addInitScript(()=>{window.__FLD_DEBUG=1});await p.goto('http://localhost:8147/');
 const res=await p.evaluate((corpus)=>{const A=window.__FLD_API;return corpus.map(d=>{try{return{name:d.name,m:A.summariseRules([{name:d.name,text:d.text}])}}catch(e){return{name:d.name,err:String(e)}}})},corpus);
 fs.writeFileSync(__dirname+'/sumres.json',JSON.stringify(res,null,1));
 for(const r of res){if(r.err){console.log('ERR',r.name,r.err);continue}const d=r.m.documents[0];console.log('\n##',r.name,'|',d.type,'|',d.date,'\n  S:',(d.summary||'').slice(0,300),'\n  P:',(d.points||[]).slice(0,3).map(x=>x.slice(0,110)).join(' || '),'\n  D:',(d.deadlines||[]).length)}
 console.log('page errors',errs);await b.close();srv.close();
})();
