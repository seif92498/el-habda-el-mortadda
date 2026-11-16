const $ = s=>document.querySelector(s);
const UI = {
  show(id){ document.querySelectorAll(".screen").forEach(e=>e.classList.remove("active")); $("#"+id).classList.add("active"); window.scrollTo(0,0); },
  toast(m){ const t=$("#toast"); t.textContent=m; t.classList.add("show"); clearTimeout(t._t); t._t=setTimeout(()=>t.classList.remove("show"),2200); },
  overlay(html,ms){ const o=$("#overlay"); o.innerHTML=html; o.classList.remove("hidden"); clearTimeout(o._t); if(ms) o._t=setTimeout(()=>o.classList.add("hidden"),ms); o.onclick=()=>{ if(!o.dataset.sticky) o.classList.add("hidden"); }; },
  hideOverlay(){ $("#overlay").classList.add("hidden"); delete $("#overlay").dataset.sticky; },
  confetti(){ for(let i=0;i<40;i++){ const e=document.createElement("div"); e.className="confetti"; e.textContent=["🎉","⚽","🏆","✨"][i%4]; e.style.left=Math.random()*100+"vw"; e.style.animationDelay=Math.random()*1.5+"s"; document.body.appendChild(e); setTimeout(()=>e.remove(),4500);} },

  renderLobby(s, isHost){
    $("#lobbyPlayers").innerHTML = s.order.length ? s.order.map(n=>{const p=s.players[n];return `<div class="prow"><span class="dot" style="background:${p.color}"></span>${p.name} ${p.online?"🟢":"🔴"}</div>`;}).join("") : "<p class='hint'>مستنيين اللاعبين...</p>";
    const need = s.settings.mode==="auto"?2:1;
    if(isHost){ $("#btnStart").classList.toggle("hidden", s.order.length<need); }
    $("#lobbyMsg").textContent = isHost ? "" : "استنى الحكم يبدأ الماتش...";
  },

  renderBoard(el,s){
    const list=s.order.map(n=>s.players[n]).sort((a,b)=>b.score-a.score);
    el.innerHTML=list.map((p,i)=>`<div class="brow ${p.suspended?"suspended":""}"><span>${["🥇","🥈","🥉","4️⃣"][i]}</span><span class="dot" style="background:${p.color}"></span>
      <span>${p.name} <small>✅${p.correct} 🟨${p.yellow} 🟥${p.red}</small></span><span class="sc">${p.score}</span></div>`).join("");
  },

  renderGame(s, me, role){
    const c=s.current; if(!c) return;
    $("#banner").classList.toggle("hidden",!c.stoppage); $("#banner").textContent="⏱ +90 وقت بدل ضائع — كل إجابة صح بـ نقطتين!";
    $("#qCounter").textContent=`سؤال ${s.qIndex}/${s.total}`; $("#catName").textContent=c.q.category;
    const t=$("#timer"); t.textContent=c.timeLeft; t.classList.toggle("low",c.timeLeft<=5);
    const img=c.q.image?`<img src="questions_images/${c.q.image}" onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22300%22 height=%22200%22><rect width=%22100%25%22 height=%22100%25%22 fill=%22%23ddd%22/><text x=%2250%25%22 y=%2250%25%22 font-size=%2240%22 text-anchor=%22middle%22>🖼️❓</text></svg>'">`:"";
    const rev=c.display?`<span class="reversed">${c.display}</span>`:"";
    const ans=(c.revealed||role==="referee")&&c.q.answer?`<div class="answer">✅ ${c.q.answer}${role==="referee"&&!c.revealed?" <small>(أنت بس شايفها)</small>":""}</div>`:"";
    $("#question").innerHTML=`<div class="diff">${c.q.difficulty||""}</div>${c.q.question}${rev}${img}${ans}`;
    const act=$("#active");
    if(c.active){ const p=s.players[c.active]; act.innerHTML=`<span style="color:${p.color}">🔔 ${p.name}</span> داس الأول! جاوب يا بطل`; }
    else if(c.timeLeft<=0) act.textContent="⏰ الوقت خلص!"; else if(c.wrongCount) act.textContent="🔥 الجرس اتفتح تاني — فرصة هبدة مرتدة!"; else act.textContent="";

    // منطقة اللاعب
    const pa=$("#playerArea"); pa.innerHTML="";
    if(me&&s.players[me]){
      const p=s.players[me]; const locked=!!c.active||c.locked.includes(me)||p.suspended||c.paused;
      let msg=p.suspended?"🚫 موقوف السؤال ده بسبب الطرد!":c.locked.includes(me)?"❌ جاوبت غلط — اقعد الدور ده":c.active&&c.active!==me?`اتقفل! ${c.active} داس الأول`:c.active===me?"إنت اللي داست! جاوب":"دوس!";
      pa.innerHTML=`<button class="buzzer ${locked&&c.active!==me?"locked":""} ${c.active===me?"mine":""}" style="background:${p.color}" ${locked?"disabled":""} onclick="App.buzz()">${msg}</button>
        <div class="powerups">
          <button class="btn yel" ${!p.power.captain||c.active?"disabled":""} onclick="App.power('captain')">©️ كابتن ×2 ${p.captainOn?"(مفعّل)":""}</button>
          <button class="btn blue" ${!p.power.freeze?"disabled":""} onclick="App.pickFreeze()">🧊 تثبيت خصم</button>
        </div>`;
      if(s.settings.mode==="auto"&&c.active===me&&c.options&&!c.answered){
        pa.innerHTML+=`<div class="options">${c.options.map((o,i)=>`<button class="btn" onclick="App.answer(${i})">${o}</button>`).join("")}</div>`;
      }
    }

    // لوحة الحكم
    const ra=$("#refArea");
    const canControl = role==="referee" || (role==="host-player");
    ra.classList.toggle("hidden",!canControl);
    if(canControl){
      const isRef=role==="referee";
      ra.innerHTML=`<div class="card"><h3>🧑‍⚖️ لوحة التحكم</h3><div class="refgrid">
        ${isRef?`<button class="btn" onclick="App.ref('reveal')">👁 إظهار الإجابة</button>
        <button class="btn blue" onclick="App.ref('var')">📺 VAR</button>
        <button class="btn green" ${!c.active?"disabled":""} onclick="App.ref('correct')">✅ إجابة صح</button>
        <button class="btn red" ${!c.active?"disabled":""} onclick="App.ref('wrong')">❌ إجابة غلط</button>`:""}
        <button class="btn" onclick="App.ref('reopen')">🔔 إعادة فتح الجرس</button>
        <button class="btn" onclick="App.ref('undo')">↩ تراجع</button>
        <button class="btn green wide" onclick="App.ref('next')">⏭ السؤال اللي بعده</button>
        <select class="wide" id="nextCat"><option value="">🎲 فئة عشوائية</option>${s.settings.categories.map(x=>`<option>${x}</option>`).join("")}</select>
        </div>
        ${isRef?`<h3 style="margin-top:10px">🟨🟥 كروت</h3><div class="plist cards-panel">${s.order.map(n=>{const p=s.players[n];return `<div class="prow"><span class="dot" style="background:${p.color}"></span><span style="flex:1">${p.name}</span>
          <button class="btn yel" onclick="App.ref('yellow','${n}')">🟨</button><button class="btn red" onclick="App.ref('red','${n}')">🟥</button></div>`;}).join("")}</div>`:""}
      </div>`;
    }
    this.renderBoard($("#board"),s);
  },

  renderResults(s){
    const list=s.order.map(n=>s.players[n]).sort((a,b)=>b.score-a.score);
    $("#winner").innerHTML=list[0]?`🏆 الفايز: <span style="color:${list[0].color}">${list[0].name}</span> بـ ${list[0].score} نقطة!`:"";
    this.renderBoard($("#finalBoard"),s); this.confetti();
  },

  // أحداث (صوت + أنيميشن)
  handleEvent(e,s){
    switch(e.type){
      case "buzz": Sounds.buzz(); break;
      case "correct": Sounds.correct(); this.overlay(`<h2>✅ ${e.data.name} جاوب صح!</h2><h1>+${e.data.pts}</h1><p>${e.data.tags.join(" · ")}</p>`,1800); break;
      case "wrong": Sounds.wrong(); this.toast(`❌ ${e.data.name} جاوب غلط${e.data.captain?" (-1 كابتن)":""}`); break;
      case "yellow": Sounds.whistle(); this.overlay(`<div class="bigcard yellow"></div><h2>🟨 كرت أصفر لـ ${e.data.name}</h2>`,1800); break;
      case "red": Sounds.whistle(); this.overlay(`<div class="bigcard red"></div><h2>🟥 كرت أحمر لـ ${e.data.name}</h2>${e.data.auto?"<p>أصفرين = أحمر! موقوف السؤال الجاي</p>":""}`,2200); break;
      case "timeout": Sounds.timeout(); this.toast("⏰ الوقت خلص!"); break;
      case "freeze": Sounds.freeze(); if(App.myName===e.data.target) this.overlay(`<div class="ice">🧊</div><h2>${e.data.name} ثبّتك 3 ثواني!</h2>`,3000); else this.toast(`🧊 ${e.data.name} ثبّت ${e.data.target}`); break;
      case "captain": this.toast(`©️ ${e.data.name} فعّل كابتن الفريق ×2`); break;
      case "question": if(e.data.stoppage) Sounds.heartbeat(); this.hideOverlay(); break;
      case "undo": this.toast("↩ تم التراجع"); break;
      case "var": Sounds.var(); const b=s.varData?.buzzes||[]; let rows=b.length?b.map((x,i)=>`${i+1}. ${x.name} — ${(x.t/1000).toFixed(3)}s${i>0?` (متأخر ${((x.t-b[0].t)/1000).toFixed(3)}s)`:""}`).join("<br>"):"محدش داس";
        this.overlay(`<div class="varbox"><h2>📺 VAR REVIEW</h2>${rows}</div>`,5000); break;
      case "win": Sounds.win(); break;
    }
  }
};