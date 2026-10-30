const {chromium}=require('playwright');const http=require('http'),fs=require('fs'),path=require('path');
const root='/home/claude/letter-desk-site';
const srv=http.createServer((q,r)=>{let f=path.join(root,'index.html');r.writeHead(200,{'Content-Type':'text/html'});fs.createReadStream(f).pipe(r)}).listen(8197);
const SC=JSON.parse(process.argv[2]||'["A"]');
const S={A:['ws_a_nmo_v1.txt','ord_a_undertakings_liberty.txt','note_a_nmo_undertakings.txt'],B:['ws_b_nmo_oo.txt','ord_e_final_nmo.txt'],C:['ws_c_oo_only.txt','ord_c_interim_oo.txt'],D:['ws_d_tenancy.txt','ord_d_transfer_tenancy.txt','note_b_tenancy.txt'],E:['ws_e_nmo_v2_form.txt','ord_f_dismissed.txt'],F:['ws_b_nmo_oo.txt','ord_b_withdrawn.txt'],G:['ws_b_nmo_oo.txt','ord_j_final_nmo_oo.txt'],H:['ws_d_tenancy.txt','ord_m_consent_tenancy.txt'],I:['ws_c_oo_only.txt','ord_l_consent_oo.txt'],R1:['ws_carter_nmo.txt','ord_carter_nmo.txt'],R2:['ws_turner_nmooo.txt','ord_turner_interim_nmo.txt','ord_turner_final_nmooo.txt']};
(async()=>{const b=await chromium.launch();
 for(const k of SC){
  const p=await (await b.newContext({viewport:{width:1280,height:1000}})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
  await p.clock.install({time:new Date('2026-12-20T10:00:00Z')});
  await p.addInitScript(()=>{window.__FLD_DEBUG=1});await p.goto('http://localhost:8197/');
  const items=S[k].map(f=>({name:f,text:fs.readFileSync(__dirname+'/'+f,'utf8')}));
  await p.click('#btnExampleMatter').catch(()=>{});await p.click('#view_letters');
  for(const tab of ['care','closing']){
   await p.evaluate(t=>document.getElementById('tab_'+t).click(),tab);await p.waitForTimeout(200);
   await p.evaluate(async(items)=>{const A=window.__FLD_API;const sv=A.getS();Object.keys(sv).forEach(k=>{if(/^(clientName|clientAddress|otherParty|court|caseNumber|abuseSummary|childrenInfo|childLiveWith|relationship|relDates|lastIncident|abuseTypes|impactOnClient|propertyAddress|tenancyType|c_outcome|c_represent|c_meaning|finalOrders|closeReason|concludedDate)$/.test(k))sv[k]=""});A.setS&&A.setS(sv);A.setItems(items);const d=A.extractRules(items);d.care=A.extractCare(items);return A.applyExtract(d,true)},items);
   await p.waitForTimeout(400);
   const t=await p.evaluate(()=>document.getElementById('paper').innerText);
   console.log('\n===== SCENARIO',k,tab,'gaps',await p.evaluate(()=>document.querySelectorAll('#paper .gap').length));
   if(tab==='care'){const a=t.indexOf('Re:');console.log(t.slice(a,a+400));const i=t.indexOf('Your instructions');console.log(t.slice(i,i+1800))}
   else console.log(t.slice(0,3800));
  }
  console.log('errors',errs);await p.close();
 }
 await b.close();srv.close()})();
