const {chromium}=require('playwright');const http=require('http'),fs=require('fs'),path=require('path');
const root='/home/claude/letter-desk-site';
const srv=http.createServer((q,r)=>{let f=path.join(root,q.url==='/'?'index.html':q.url.split('?')[0]);if(!fs.existsSync(f)){r.writeHead(404);return r.end()}r.writeHead(200,{'Content-Type':'text/html'});fs.createReadStream(f).pipe(r)}).listen(8193);
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1280,height:1000}})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.addInitScript(()=>{window.__FLD_DEBUG=1});await p.goto('http://localhost:8193/');
 const rd=n=>fs.readFileSync(__dirname+'/'+n,'utf8');
 for(const [f,title] of [['ws_nmo.txt','Witness statement: non-molestation order, without notice (version 1)'],['ws_ten.txt','Witness statement: transfer of tenancy']]){
  await p.click('#btnExampleMatter');await p.click('#view_letters');await p.evaluate(()=>document.getElementById('tab_care').click());
  await p.evaluate(async(items)=>{const A=window.__FLD_API;const sv=A.getS();Object.keys(sv).forEach(k=>{if(/^(clientName|clientAddress|otherParty|abuseSummary|daEvidence|childrenInfo|childLiveWith|relationship|relDates|lastIncident|abuseTypes|impactOnClient|propertyAddress|tenancyType|clientDob)$/.test(k))sv[k]=''});const d=A.extractRules(items);d.care=A.extractCare(items);A.applyExtract(d,true)},[{name:f,text:rd(f)}]);
  await p.click('#view_templates');await p.waitForTimeout(300);
  const n=await p.evaluate(()=>Array.from(document.querySelectorAll('.hmain')).filter(e=>e.textContent.startsWith('Witness statement')||e.textContent.startsWith('Exhibit')).length);
  await p.click('.hrow:has-text("'+title+'") button');await p.waitForTimeout(500);
  const t=await p.evaluate(()=>document.getElementById('tplPaper').innerText);
  const gaps=await p.evaluate(()=>document.querySelectorAll('#tplPaper .gap').length);
  console.log('=====',f,'ws templates',n,'gaps',gaps,'len',t.length);
  console.log(t.slice(0,1800).replace(/\n\n+/g,'\n'));
  console.log('panel fields:',await p.evaluate(()=>Array.from(document.querySelectorAll('[id^="tpf_"]')).map(e=>e.id.slice(4)+'='+e.value.slice(0,25)).join(' | ')));
 }
 console.log('errors',errs);await b.close();srv.close()})();
