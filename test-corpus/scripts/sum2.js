const {chromium}=require('playwright');const http=require('http'),fs=require('fs'),path=require('path');
const root='/home/claude/letter-desk-site';
const srv=http.createServer((q,r)=>{let f=path.join(root,q.url==='/'?'index.html':q.url.split('?')[0]);if(!fs.existsSync(f)){r.writeHead(404);return r.end()}r.writeHead(200,{'Content-Type':{'.html':'text/html'}[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r)}).listen(8148);
(async()=>{
 const corpus=JSON.parse(fs.readFileSync(__dirname+'/corpus/corpus.json','utf8'));
 const pick=n=>corpus.filter(d=>n.test(d.name)).map(d=>({name:d.name,text:d.text}));
 const b=await chromium.launch();const p=await (await b.newContext()).newPage();const errs=[];p.on('pageerror',e=>errs.push(String(e)));
 await p.addInitScript(()=>{window.__FLD_DEBUG=1});await p.goto('http://localhost:8148/');
 const m=await p.evaluate(items=>window.__FLD_API.summariseRules(items),pick(/ws_b|ord_a|note_b|ord_e|note_a/));
 console.log(m.overview);console.log('UPCOMING',JSON.stringify(m.upcoming.map(u=>u.date+' '+u.text.slice(0,60))));console.log('TIMELINE');m.timeline.forEach(e=>console.log(' ',e.date,e.event.slice(0,110)));
 // empty / junk inputs must not throw
 const j=await p.evaluate(()=>{const out=[];for(const t of ['','hello','Dear Ms X,\nThank you for your letter of 3 March 2026. We will write again by 1 December 2026.\nYours sincerely','ORDER\n\n'])try{out.push(window.__FLD_API.summariseRules([{name:'x.txt',text:t}]).documents[0].type)}catch(e){out.push('ERR '+e)}return out});
 console.log('junk',j,'errors',errs);await b.close();srv.close();
})();
