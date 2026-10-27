const {chromium}=require('playwright');const http=require('http'),fs=require('fs'),path=require('path');
const root='/home/claude/letter-desk-site';const axeSrc=fs.readFileSync('../axe/node_modules/axe-core/axe.min.js','utf8');
const srv=http.createServer((q,r)=>{let f=path.join(root,q.url==='/'?'index.html':q.url.split('?')[0]);if(!fs.existsSync(f)){r.writeHead(404);return r.end()}r.writeHead(200,{'Content-Type':{'.html':'text/html','.js':'application/javascript'}[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r)}).listen(8170);
const scheme=process.argv[2]||'light',width=+(process.argv[3]||1280);
(async()=>{
 const b=await chromium.launch();const ctx=await b.newContext({viewport:{width,height:900},colorScheme:scheme});const p=await ctx.newPage();
 const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.addInitScript(()=>{window.__FLD_DEBUG=1});await p.goto('http://localhost:8170/');
 const all={};
 async function audit(label){
  await p.evaluate(()=>document.querySelectorAll('details').forEach(d=>d.open=true));await p.waitForTimeout(700);
  await p.addScriptTag({content:axeSrc}).catch(()=>{});
  const r=await p.evaluate(async()=>await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa','best-practice']},resultTypes:['violations']}));
  r.violations.forEach(v=>{const k=v.id;all[k]=all[k]||{impact:v.impact,help:v.help,where:{},sample:null};all[k].where[label]=(all[k].where[label]||0)+v.nodes.length;if(!all[k].sample)all[k].sample=v.nodes.slice(0,4).map(n=>n.target.join(' ')).join(' ;; ')+' :: '+v.nodes[0].target.join(' ')+' :: '+(v.nodes[0].failureSummary||'').split('\n').slice(0,3).join(' ').slice(0,200)});
 }
 await p.click('#btnExampleLA');
 await audit('letters-care');
 for(const t of ['closing','note','notice']){await p.evaluate(id=>{const e=document.getElementById('tab_'+id);if(e)e.click()},t);await audit('letters-'+t)}
 await p.evaluate(()=>document.getElementById('tab_care').click());
 await p.waitForTimeout(300);if(await p.locator('#f_paste').isVisible()){await p.fill('#f_paste',fs.readFileSync('docs/ws.txt','utf8'));await p.click('#btnRead');await p.waitForTimeout(800);await audit('letters-after-read');await p.click('#btnSum');await p.waitForTimeout(800);await audit('letters-summary')}else console.log('paste box hidden');
 for(const v of ['dashboard','documents','templates','forms','contacts','time','checks','file','settings']){await p.click('#view_'+v);await p.waitForTimeout(250);await audit(v)}
 await p.click('#view_documents');await p.setInputFiles('#docUp',['docs/ws.txt','docs/order1.txt','docs/note1.txt']).catch(()=>{});await p.waitForTimeout(800);await audit('documents-with-files');
 await p.click('#view_forms');const fb=p.locator('button:has-text("Open")').first();if(await fb.count()){await fb.click().catch(()=>{});await audit('forms-open')}
 await p.click('#view_templates');const tb=p.locator('button:has-text("Use")').first();if(await tb.count()){await tb.click().catch(()=>{});await audit('templates-open')}
 // email modal
 await p.click('#view_letters');if(await p.locator('#btnEmail').count()){await p.click('#btnEmail').catch(()=>{});await audit('email-modal');await p.keyboard.press('Escape')}
 console.log(JSON.stringify(all,null,1));console.log('errors',errs);await b.close();srv.close();
})();
