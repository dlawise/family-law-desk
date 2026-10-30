const {chromium}=require('playwright');const http=require('http'),fs=require('fs'),path=require('path');
const root='/home/claude/letter-desk-site';
const srv=http.createServer((q,r)=>{let f=path.join(root,q.url==='/'?'index.html':q.url.split('?')[0]);if(!fs.existsSync(f)){r.writeHead(404);return r.end()}r.writeHead(200,{'Content-Type':'text/html'});fs.createReadStream(f).pipe(r)}).listen(8192);
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1280,height:1000}})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.addInitScript(()=>{window.__FLD_DEBUG=1});await p.goto('http://localhost:8192/');
 for(const f of ['ws_cao.txt','ws_ten.txt']){
  await p.click('#btnExampleMatter');await p.click('#view_letters');await p.evaluate(()=>document.getElementById('tab_care').click());
  const items=[{name:f,text:fs.readFileSync(__dirname+'/'+f,'utf8')}];
  const filled=await p.evaluate(async(items)=>{const A=window.__FLD_API;const sv=A.getS();Object.keys(sv).forEach(k=>{if(/^(clientName|clientAddress|otherParty|abuseSummary|daEvidence|childrenInfo|childLiveWith|relationship|matterType|o_nmo|o_occ|o_cao|o_pso|o_sio|o_nmo_wn|careInstructions)$/.test(k))sv[k]=(typeof sv[k]==='boolean')?false:''});const d=A.extractRules(items);d.care=A.extractCare(items);return A.applyExtract(d,true)},items);
  await p.waitForTimeout(400);
  const t=await p.evaluate(()=>document.getElementById('paper').innerText);
  console.log('=====',f,JSON.stringify(filled.slice(-14)));
  console.log(t.slice(t.indexOf('Re:'),t.indexOf('Re:')+160));
  console.log(t.slice(t.indexOf('Your instructions'),t.indexOf('Our services to you')).slice(0,3200));
 }
 console.log('errors',errs);await b.close();srv.close()})();
