const API = "https://www.dnd5eapi.co/api/2014";
const CLASS_INFO = {
 barbarian:["Barbarian","A fierce martial class; no standard spell list in 2014 rules."],
 bard:["Bard","Versatile magic combining support, control, utility and enchantment."],
 cleric:["Cleric","Divine spellcasting with healing, support, control and potent damage."],
 druid:["Druid","Nature magic with control, exploration, healing and transformation."],
 fighter:["Fighter","Martial class; Eldritch Knight spellcasting is added through personal/subclass data."],
 monk:["Monk","Martial class; Way of the Four Elements uses a distinct subclass system."],
 paladin:["Paladin","Half-caster built around support, protection, smites and battlefield presence."],
 ranger:["Ranger","Half-caster focused on exploration, utility, control and combat support."],
 rogue:["Rogue","Martial class; Arcane Trickster spellcasting is added through personal/subclass data."],
 sorcerer:["Sorcerer","Spontaneous arcane caster whose flexibility comes from Metamagic."],
 warlock:["Warlock","Pact magic: fewer slots, strong spell impact and short-rest recovery."],
 wizard:["Wizard","Broadest traditional arcane spellbook with exceptional utility and control."]
};

const curated = {
 // Community-informed anchors. Scores are deliberately broad; they are not official ratings.
 "shield":98,"absorb-elements":97,"find-familiar":96,"detect-magic":95,"sleep":94,"magic-missile":92,
 "mage-armor":91,"silvery-barbs":96,"bless":97,"healing-word":96,"guidance":95,"sanctuary":92,
 "spiritual-weapon":90,"spirit-guardians":99,"revivify":99,"counterspell":99,"dispel-magic":96,
 "fireball":94,"hypnotic-pattern":98,"slow":96,"web":98,"misty-step":97,"suggestion":96,
 "pass-without-trace":99,"goodberry":93,"entangle":91,"conjure-animals":98,"polymorph":99,
 "banishment":95,"dimension-door":94,"wall-of-force":99,"greater-invisibility":95,
 "freedom-of-movement":90,"death-ward":93,"synaptic-static":96,"forcecage":99,
 "teleport":97,"mass-suggestion":99,"maze":98,"foresight":100,"wish":100,
 "eldritch-blast":97,"hex":91,"hunger-of-hadar":90,"armor-of-agathys":93,
 "find-steed":98,"aura-of-vitality":96,"revivify":99,"hunter's-mark":89
};
const utilityKeywords = {
 ritual:7, concentration:-5, reaction:5, bonus_action:4, damage:2, healing:7,
 teleport:8, summon:8, control:9, utility:7, defensive:8, divination:6
};

let selectedClass=null, spells=[], customSpells=[], cache={};

const $=s=>document.querySelector(s);
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));

function slug(s){return s.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,"");}

function scoreSpell(s){
  const key=slug(s.name);
  if(curated[key]!==undefined) return curated[key];
  let score=50;
  const text=(s.desc||"").toLowerCase();
  if(s.level===0) score+=5;
  if(s.ritual) score+=utilityKeywords.ritual;
  if(s.concentration) score+=utilityKeywords.concentration;
  if(text.includes("reaction")) score+=utilityKeywords.reaction;
  if(text.includes("bonus action")) score+=utilityKeywords.bonus_action;
  if(/heal|hit point|restore/.test(text)) score+=utilityKeywords.healing;
  if(/teleport|dimension|plane of existence|travel/.test(text)) score+=utilityKeywords.teleport;
  if(/summon|conjure|companion/.test(text)) score+=utilityKeywords.summon;
  if(/restrain|paraly|stun|incapacitat|frightened|charmed|blinded|prone|slow|wall|area/.test(text)) score+=utilityKeywords.control;
  if(/advantage|disadvantage|resistance|immunity|ac\b|saving throw/.test(text)) score+=utilityKeywords.defensive;
  if(/damage|attack roll/.test(text)) score+=utilityKeywords.damage;
  if(/detect|reveal|scry|locate|identify|message|communicate/.test(text)) score+=utilityKeywords.divination;
  if(/1 minute|10 minutes|1 hour|8 hours|24 hours/.test(text)) score+=3;
  if(/self|touch/.test(text)) score-=2;
  if(/only|must|requires|worth at least/.test(text)) score-=2;
  return Math.max(1,Math.min(100,Math.round(score)));
}

function reason(s){
  const key=slug(s.name);
  if(curated[key]>=98) return "Widely regarded as a high-impact option with broad practical value.";
  if(curated[key]>=94) return "Strong general-purpose utility; often appears in experienced-player spell recommendations.";
  if(curated[key]>=90) return "A solid option whose value is usually easy to realise in a normal adventuring day.";
  if(s.ritual) return "Ritual casting adds utility when time permits, reducing pressure on spell slots.";
  if(s.concentration) return "Powerful effects are balanced by the opportunity cost of concentration.";
  return "Useful in the right circumstances; its position is a broad community-informed estimate rather than an official rating.";
}

function levelName(n){return n===0?"Cantrips":`${n}${["th","st","nd","rd"][n]||"th"} level`}

function render(){
  const q=$("#search").value.trim().toLowerCase();
  const lf=$("#levelFilter").value, sf=$("#sourceFilter").value;
  const all=[...spells.map(x=>({...x,source:"SRD"})),...customSpells.filter(x=>!selectedClass || (x.classes||[]).map(c=>c.toLowerCase()).includes(selectedClass)).map(x=>({...x,source:"Personal"}))];
  const filtered=all.filter(s=>(lf==="all"||String(s.level)===lf)&&(sf==="all"||s.source===sf)&&(!q||s.name.toLowerCase().includes(q)||(s.desc||"").toLowerCase().includes(q)));
  filtered.sort((a,b)=>b._score-a._score||a.level-b.level||a.name.localeCompare(b.name));
  const groups=new Map();
  filtered.forEach(s=>{if(!groups.has(s.level))groups.set(s.level,[]);groups.get(s.level).push(s)});
  let html="";
  [...groups.keys()].sort((a,b)=>a-b).forEach(level=>{
    html+=`<div class="level-heading">${levelName(level)}</div>`;
    groups.get(level).forEach((s,i)=>{
      const rank=i+1;
      html+=`<article class="spell-card">
        <details>
          <summary class="spell-head">
            <span class="rank">${rank}</span>
            <span><span class="spell-name">${esc(s.name)}</span><br><span class="badge">${esc(s.school||"Magic")}</span></span>
            <span class="chev">⌄</span>
          </summary>
          <div class="spell-body">
            <div class="tags">
              <span class="tag">Rank #${rank} at this level</span>
              ${s.ritual?'<span class="tag">Ritual</span>':''}
              ${s.concentration?'<span class="tag">Concentration</span>':''}
              ${s.casting_time?`<span class="tag">${esc(s.casting_time)}</span>`:''}
              ${s.range?`<span class="tag">${esc(s.range)}</span>`:''}
            </div>
            <div class="desc">${esc(s.desc||"No description supplied.").replace(/\n/g,"<br>")}</div>
            <div class="reason">${esc(reason(s))}</div>
            <div class="source">${esc(s.source)}${s.source==="Personal"?" — imported locally by you.":""}</div>
          </div>
        </details>
      </article>`;
    });
  });
  $("#spellList").innerHTML=html||'<div class="panel">No spells match those filters.</div>';
  $("#status").textContent=`${filtered.length} spells • ordered by community-informed usefulness`;
}

async function fetchJson(url){
  const r=await fetch(url); if(!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}
async function loadClass(cls){
  selectedClass=cls;
  $("#setup").classList.add("hidden"); $("#book").classList.remove("hidden");
  $("#classTitle").textContent=CLASS_INFO[cls]?.[0]||cls;
  $("#classBlurb").textContent=CLASS_INFO[cls]?.[1]||"";
  $("#status").textContent="Opening the grimoire…";
  try{
    const list=await fetchJson(`${API}/classes/${cls}/spells`);
    const results=list.results||[];
    const details=await Promise.all(results.map(x=>fetchJson(`${API}/spells/${x.index}`)));
    spells=details.map(s=>({
      name:s.name, level:s.level, school:s.school?.name||"",
      desc:(s.desc||[]).join("\n\n"), ritual:!!s.ritual, concentration:(s.duration||"").toLowerCase().includes("concentration"),
      casting_time:s.casting_time, range:s.range, classes:[cls]
    })).map(s=>({...s,_score:scoreSpell(s)}));
    localStorage.setItem("spellLoreClass",cls);
    render();
  }catch(e){
    $("#spellList").innerHTML=`<div class="panel"><strong>The scribe could not reach the public SRD index.</strong><p>Check your connection and reload. The app intentionally does not bundle non-SRD book text.</p><small>${esc(e.message)}</small></div>`;
    $("#status").textContent="Offline / API unavailable";
  }
}
function loadCustom(){
  try{customSpells=JSON.parse(localStorage.getItem("spellLoreCustom")||"[]").map(s=>({...s,_score:scoreSpell(s)}));}catch{customSpells=[]}
}
function setup(){
  const sel=$("#classSelect");
  Object.entries(CLASS_INFO).forEach(([k,v])=>{
    const o=document.createElement("option");o.value=k;o.textContent=v[0];sel.appendChild(o);
  });
  loadCustom();
  const saved=localStorage.getItem("spellLoreClass");
  if(saved && CLASS_INFO[saved]){sel.value=saved;loadClass(saved)}
  sel.addEventListener("change",()=>loadClass(sel.value));
  ["search","levelFilter","sourceFilter"].forEach(id=>$( "#"+id).addEventListener("input",render));
  $("#changeClass").onclick=()=>{$("#book").classList.add("hidden");$("#setup").classList.remove("hidden")};
  $("#themeBtn").onclick=()=>document.body.classList.toggle("night");
  $("#importBtn").onclick=()=>$("#fileInput").click();
  $("#fileInput").onchange=async e=>{
    const f=e.target.files[0]; if(!f)return;
    try{
      const data=JSON.parse(await f.text());
      const arr=Array.isArray(data)?data:(data.spells||[]);
      const normal=arr.map(s=>({...s,source:"Personal",_score:scoreSpell(s)}));
      customSpells=[...customSpells,...normal];
      localStorage.setItem("spellLoreCustom",JSON.stringify(customSpells.map(({source,_score,...s})=>s)));
      render(); alert(`Imported ${normal.length} personal spells.`);
    }catch(err){alert("That file could not be imported: "+err.message)}
  };
}
setup();

if ("serviceWorker" in navigator) navigator.serviceWorker.register("./service-worker.js").catch(()=>{});
