const {chromium}=require('playwright');const http=require('http'),fs=require('fs'),path=require('path');
const root='/home/claude/letter-desk-site';
const srv=http.createServer((q,r)=>{let f=path.join(root,q.url==='/'?'index.html':q.url.split('?')[0]);if(!fs.existsSync(f)){r.writeHead(404);return r.end()}r.writeHead(200,{'Content-Type':{'.html':'text/html','.js':'application/javascript'}[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r)}).listen(8172);
let pass=0,fail=0;const ck=(l,ok,g)=>{if(ok)pass++;else{fail++;console.log('FAIL',l,JSON.stringify(g))}};
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1280,height:900}})).newPage();
 await p.goto('http://localhost:8172/');await p.click('#btnExampleLA');await p.click('#view_letters');
 // skip link
 await p.reload();await p.waitForTimeout(300);await p.keyboard.press('Tab');ck('first tab stop is skip link',await p.evaluate(()=>document.activeElement.className)==='skip','');
 const ring=await p.evaluate(()=>{const s=getComputedStyle(document.activeElement);return s.outlineStyle+'/'+s.outlineWidth+'/'+s.boxShadow.slice(0,30)});console.log('skip link focus ring:',ring);await p.keyboard.press('Enter');ck('skip moves focus to main',await p.evaluate(()=>document.activeElement.id)==='main',await p.evaluate(()=>document.activeElement.id));
 // email modal: focus trap, Escape, focus return
 await p.click('#view_letters');await p.focus('#btnEmail');await p.keyboard.press('Enter');await p.waitForTimeout(200);
 ck('modal focuses first field',await p.evaluate(()=>document.activeElement.id)==='em_to','');
 for(let i=0;i<8;i++)await p.keyboard.press('Tab');
 ck('focus stays inside modal',await p.evaluate(()=>!!document.activeElement.closest('.modal')),await p.evaluate(()=>document.activeElement.outerHTML.slice(0,80)));
 await p.keyboard.press('Shift+Tab');ck('shift-tab stays inside',await p.evaluate(()=>!!document.activeElement.closest('.modal')),'');
 await p.keyboard.press('Escape');await p.waitForTimeout(100);
 ck('escape closes modal',await p.locator('.modal').count()===0,'');ck('focus returns to opener',await p.evaluate(()=>document.activeElement.id)==='btnEmail',await p.evaluate(()=>document.activeElement.id));
 // view tabs reachable and operable by keyboard
 await p.focus('#view_documents');await p.keyboard.press('Enter');await p.waitForTimeout(200);ck('keyboard opens a view',await p.locator('#vOther h2').first().innerText()!=='','');
 await p.focus('#view_documents');await p.keyboard.press('ArrowRight');ck('arrow key moves along tabs',await p.evaluate(()=>document.activeElement.id)==='view_templates',await p.evaluate(()=>document.activeElement.id));await p.keyboard.press('End');ck('End goes to last tab',await p.evaluate(()=>document.activeElement.id)==='view_settings','');await p.keyboard.press('Home');ck('Home goes to first tab',await p.evaluate(()=>document.activeElement.id)==='view_dashboard','');
 // aria-selected state follows
 ck('selected tab announced',await p.getAttribute('#view_documents','aria-selected')==='true','');
 // every button has an accessible name
 for(const v of ['dashboard','settings','time','file','checks','forms','templates','contacts']){await p.click('#view_'+v);await p.evaluate(()=>document.querySelectorAll('details').forEach(d=>d.open=true));
  const bad=await p.evaluate(()=>[...document.querySelectorAll('button,input,select,textarea,a[href]')].filter(e=>e.offsetParent!==null&&e.type!=='hidden'&&!(e.getAttribute('aria-label')||e.getAttribute('aria-labelledby')||(e.labels&&e.labels.length)||e.textContent.trim()||e.title||e.type==='file'&&e.getAttribute('aria-label'))).map(e=>e.outerHTML.slice(0,90)));
  ck('unnamed controls in '+v,bad.length===0,bad.slice(0,3));}
 // reduced motion respected
 await p.emulateMedia({reducedMotion:'reduce'});const tr=await p.evaluate(()=>getComputedStyle(document.getElementById('toast')).transitionDuration);console.log('toast transition under reduced motion:',tr);
 // focus visible style present
 await p.click('#view_dashboard');await p.focus('#view_letters');const ol=await p.evaluate(()=>{const s=getComputedStyle(document.activeElement);return s.outlineStyle+' '+s.outlineWidth+' '+s.boxShadow.slice(0,40)});console.log('focus style:',ol);
 console.log('PASS',pass,'FAIL',fail);await b.close();srv.close()})();
