(() => {
const $ = id => document.getElementById(id);
const DB_KEY = "medshorts-library-v1";
let entries = [];
const fields = ["title","url","subject","topic","creator","priority","status","reviewDate","takeaway","keyPoints","reasoning","pearls","questions","source","tags"];
const today = () => new Date().toISOString().slice(0,10);
const uid = () => (crypto.randomUUID ? crypto.randomUUID() : Date.now()+"-"+Math.random().toString(16).slice(2));
function load(){try{entries=JSON.parse(localStorage.getItem(DB_KEY)||"[]");if(!Array.isArray(entries))entries=[];}catch{entries=[];}render();}
function persist(){localStorage.setItem(DB_KEY,JSON.stringify(entries));render();}
function escapeHtml(s=""){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function due(e){return e.reviewDate && e.reviewDate<=today() && e.status!=="Reviewed";}
function render(){
 const q=$("search").value.toLowerCase().trim(), sub=$("subjectFilter").value, st=$("statusFilter").value;
 $("totalCount").textContent=entries.length;$("inboxCount").textContent=entries.filter(e=>e.status==="Inbox").length;
 $("dueCount").textContent=entries.filter(due).length;$("reviewedCount").textContent=entries.filter(e=>e.status==="Reviewed").length;
 const subjects=[...new Set(entries.map(e=>e.subject).filter(Boolean))].sort(), old=$("subjectFilter").value;
 $("subjectFilter").innerHTML='<option value="">All subjects</option>'+subjects.map(s=>`<option>${escapeHtml(s)}</option>`).join("");
 $("subjectFilter").value=subjects.includes(old)?old:"";
 const filtered=entries.filter(e=>(!q||fields.some(k=>String(e[k]||"").toLowerCase().includes(q)))&&(!$("subjectFilter").value||e.subject===$("subjectFilter").value)&&(!st||e.status===st)).sort((a,b)=>(b.updatedAt||"").localeCompare(a.updatedAt||""));
 $("resultCount").textContent=`${filtered.length} entr${filtered.length===1?"y":"ies"}`;
 $("videoList").innerHTML=filtered.map(e=>`<article class="video-card">
 <div class="card-top"><div><h3 class="card-title">${escapeHtml(e.title||"Untitled video")}</h3><div class="meta">${escapeHtml(e.subject||"Other")}${e.topic?" · "+escapeHtml(e.topic):""}${e.creator?" · "+escapeHtml(e.creator):""}</div></div></div>
 <div class="pills"><span class="pill">${escapeHtml(e.status||"Inbox")}</span><span class="pill ${e.priority==="High"?"high":""}">${escapeHtml(e.priority||"Medium")} priority</span>${due(e)?'<span class="pill due">Review due</span>':""}${(e.tags||"").split(",").filter(Boolean).slice(0,4).map(t=>`<span class="pill">#${escapeHtml(t.trim())}</span>`).join("")}</div>
 ${e.takeaway?`<p class="takeaway"><b>Takeaway:</b> ${escapeHtml(e.takeaway)}</p>`:""}
 ${e.keyPoints?`<details><summary>Key learning points</summary><p>${escapeHtml(e.keyPoints).replace(/\n/g,"<br>")}</p></details>`:""}
 ${e.reasoning?`<details><summary>Mechanism / clinical reasoning</summary><p>${escapeHtml(e.reasoning).replace(/\n/g,"<br>")}</p></details>`:""}
 ${e.pearls?`<details><summary>Exam pearls</summary><p>${escapeHtml(e.pearls).replace(/\n/g,"<br>")}</p></details>`:""}
 ${e.questions?`<details><summary>Active recall questions</summary><p>${escapeHtml(e.questions).replace(/\n/g,"<br>")}</p></details>`:""}
 ${e.source?`<details><summary>Verification / source</summary><p>${escapeHtml(e.source).replace(/\n/g,"<br>")}</p></details>`:""}
 <div class="card-actions"><a href="${safeUrl(e.url)}" target="_blank" rel="noopener noreferrer">▶ Open video</a><button class="secondary" data-edit="${e.id}">Edit note</button><button class="secondary" data-review="${e.id}">Mark reviewed</button></div></article>`).join("");
 $("emptyState").classList.toggle("show",filtered.length===0);
 $("storageNote").textContent=`${entries.length} entries saved in this browser. Export JSON backups regularly.`;
}
function safeUrl(raw){try{const u=new URL(raw);return ["https:","http:"].includes(u.protocol)?escapeHtml(u.href):"#";}catch{return "#";}}
function openEditor(e=null){
 $("videoForm").reset();$("entryId").value=e?.id||"";
 $("formTitle").textContent=e?"Edit video":"Add a Short";
 $("deleteBtn").classList.toggle("hidden",!e);
 fields.forEach(k=>{if($(k))$(k).value=e?.[k]||"";});
 if(!e){$("status").value="Inbox";$("priority").value="Medium";$("reviewDate").value="";}
 $("editor").showModal();
}
$("newBtn").onclick=()=>openEditor();$("emptyAdd").onclick=()=>openEditor();$("closeModal").onclick=()=>$("editor").close();$("cancelBtn").onclick=()=>$("editor").close();
$("videoForm").addEventListener("submit",ev=>{ev.preventDefault();const id=$("entryId").value||uid();const prior=entries.find(e=>e.id===id)||{};const obj={...prior,id,createdAt:prior.createdAt||new Date().toISOString(),updatedAt:new Date().toISOString()};fields.forEach(k=>obj[k]=$(k).value.trim());if(!/^https?:\/\//i.test(obj.url)){alert("Please enter a valid http(s) YouTube URL.");return;}const idx=entries.findIndex(e=>e.id===id);if(idx>=0)entries[idx]=obj;else entries.unshift(obj);persist();$("editor").close();});
$("deleteBtn").onclick=()=>{const id=$("entryId").value;if(id&&confirm("Delete this entry? Export a backup first if you may need it.")){entries=entries.filter(e=>e.id!==id);persist();$("editor").close();}};
$("videoList").addEventListener("click",ev=>{const edit=ev.target.closest("[data-edit]"),rev=ev.target.closest("[data-review]");if(edit)openEditor(entries.find(e=>e.id===edit.dataset.edit));if(rev){const e=entries.find(x=>x.id===rev.dataset.review);if(e){e.status="Reviewed";e.updatedAt=new Date().toISOString();persist();}}});
$("search").addEventListener("input",render);$("statusFilter").addEventListener("change",render);$("subjectFilter").addEventListener("change",render);
$("exportBtn").onclick=()=>{const blob=new Blob([JSON.stringify({app:"MedShorts",version:1,exportedAt:new Date().toISOString(),entries},null,2)],{type:"application/json"});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="medshorts-backup-"+today()+".json";a.click();URL.revokeObjectURL(a.href);};
$("importFile").onchange=async ev=>{const f=ev.target.files[0];if(!f)return;try{const data=JSON.parse(await f.text());const incoming=Array.isArray(data)?data:data.entries;if(!Array.isArray(incoming))throw Error("This file does not contain a MedShorts entry list.");if(!confirm(`Import ${incoming.length} entries? Existing entries with matching IDs will be replaced; other entries are retained.`))return;const map=new Map(entries.map(e=>[e.id,e]));incoming.forEach(e=>{if(e&&e.id)map.set(e.id,{...e});});entries=[...map.values()];persist();alert("Import complete.");}catch(err){alert("Import failed: "+err.message);}finally{ev.target.value="";}};
$("sampleBtn").onclick=()=>{if(entries.length&&!confirm("Add example entries to your existing library?"))return;const samples=[
{title:"Why JVP rises in cardiac tamponade",url:"https://www.youtube.com/",subject:"Medicine",topic:"Cardiology",creator:"Example entry",priority:"High",status:"To revise",reviewDate:today(),takeaway:"Impaired cardiac filling raises systemic venous pressure.",keyPoints:"Raised intrapericardial pressure limits diastolic filling.\nSystemic venous pressure rises and JVP becomes elevated.",reasoning:"The heart cannot expand normally during diastole, so venous return backs up. Interpret alongside clinical findings and haemodynamic context.",pearls:"Correlate with hypotension, tachycardia and other signs; do not diagnose from JVP alone.",questions:"Why does JVP rise?\nWhat other findings support tamponade?",source:"Example only — verify with a current medicine textbook or guideline.",tags:"cardiology,mechanism"},
{title:"B12 versus folate deficiency",url:"https://www.youtube.com/",subject:"Medicine",topic:"Hematology",creator:"Example entry",priority:"High",status:"Inbox",reviewDate:"",takeaway:"Both can cause megaloblastic anemia; B12 deficiency may cause neurological manifestations.",keyPoints:"Macrocytosis and megaloblastic changes may occur in both.\nNeurological findings point toward B12 deficiency but require clinical assessment.",reasoning:"B12 is needed for methionine synthase and methylmalonyl-CoA mutase; folate participates in one-carbon transfer reactions.",pearls:"Confirm with appropriate investigations; interpret B12 and folate results in context.",questions:"Which metabolite rises in B12 deficiency but not isolated folate deficiency?\nWhy can folate treatment mask hematologic findings of B12 deficiency?",source:"Example only — verify with a current hematology reference.",tags:"hematology,high-yield"}];
samples.forEach(s=>entries.unshift({...s,id:uid(),createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()}));persist();};
if("serviceWorker" in navigator && location.protocol.startsWith("http"))navigator.serviceWorker.register("sw.js").catch(()=>{});
load();
})();