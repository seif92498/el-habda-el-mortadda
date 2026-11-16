const App = {
  role:null, myName:null, lastEvent:0, state:null, selectedColor:COLORS[0],

  init(){
    document.body.addEventListener("click",()=>Sounds.unlock(),{once:true});
    $("#catPick").innerHTML=CATEGORIES.map(c=>`<span class="chip on" data-c="${c}">${c}</span>`).join("");
    $("#catPick").onclick=e=>e.target.classList.contains("chip")&&e.target.classList.toggle("on");
    $("#colorPick").innerHTML=COLORS.map((c,i)=>`<span class="chip color ${i?"":"on"}" style="background:${c}" data-c="${c}"></span>`).join("");
    $("#colorPick").onclick=e=>{ if(!e.target.dataset.c) return; this.selectedColor=e.target.dataset.c; document.querySelectorAll("#colorPick .chip").forEach(x=>x.classList.toggle("on",x===e.target)); };
    $("#btnCreate").onclick=()=>this.create();
    $("#btnJoin").onclick=()=>this.join();
    $("#btnStart").onclick=()=>{ Game.start(); this.sync(); };
    $("#btnAgain").onclick=()=>location.reload();
    $("#btnManage").onclick=()=>{ Manage.render(); UI.show("screen-manage"); };
    $("#btnBackHome").onclick=()=>UI.show("screen-home");
    Manage.init();
    const p=new URLSearchParams(location.search); if(p.get("room")) $("#joinCode").value=p.get("room");
  },

  // ---- Host ----
  create(){
    const settings={ mode:$("#mode").value, rounds:+$("#setRounds").value||15, timer:+$("#setTimer").value||20, points:+$("#setPoints").value||1,
      categories:[...document.querySelectorAll("#catPick .chip.on")].map(x=>x.dataset.c) };
    if(!settings.categories.length) return UI.toast("اختار فئة واحدة على الأقل");
    Game.init(settings);
    if(!Game.bank.length) return UI.toast("مفيش أسئلة في الفئات دي!");
    this.role = settings.mode==="auto" ? "host-player" : "referee";
    Net.onMessage=(peer,d,t)=>this.onHostMsg(peer,d,t);
    Net.onPeerClose=peer=>{ Game.dropPlayer(peer); this.sync(); };
    Net.createRoom(code=>{
      $("#roomCode").textContent=code;
      const url=location.origin+location.pathname+"?room="+code;
      try{ new QRCode($("#qr"),{text:url,width:140,height:140}); }catch(e){}
      if(this.role==="host-player"){
        const name=prompt("اسمك (إنت اللاعب الأول والمضيف):")||"اللاعب 1";
        Game.addPlayer("self",name,this.selectedColor); this.myName=name;
      }
      UI.show("screen-lobby"); this.sync();
    },e=>UI.toast("مشكلة في الاتصال: "+e));
  },

  onHostMsg(peer,d,t){
    switch(d.type){
      case "join": { const r=Game.addPlayer(peer,d.name,d.color); Net.sendTo(peer,{type:"joined",...r,name:d.name}); break; }
      case "buzz": Game.buzz(Game.peerToName[peer],t); break;
      case "power": Game.usePower(Game.peerToName[peer],d.kind,d.target); break;
      case "answer": Game.autoAnswer(Game.peerToName[peer],d.idx); break;
    }
    this.sync();
  },

  sync(){ // ينبعت لكل الأجهزة
    Net.broadcast({type:"state",state:Game.publicState()});
    this.applyState(Game.state);
  },

  ref(action,arg){
    const cat=$("#nextCat")?.value||"";
    ({ reveal:()=>Game.reveal(), correct:()=>Game.correct(), wrong:()=>Game.wrong(), reopen:()=>Game.reopen(),
       next:()=>Game.nextQuestion(cat), undo:()=>Game.undo(), var:()=>Game.varReview(),
       yellow:()=>Game.card(arg,"yellow"), red:()=>Game.card(arg,"red") })[action]();
    this.sync();
  },

  // ---- Player ----
  join(){
    const code=$("#joinCode").value.trim().toUpperCase(), name=$("#joinName").value.trim();
    if(code.length!==4||!name) return UI.toast("اكتب الكود واسمك");
    this.role="player"; this.myName=name;
    Net.onMessage=(_,d)=>{
      if(d.type==="joined"){ if(!d.ok) { UI.toast(d.msg); return; } UI.toast(d.reconnect?"رجعت للماتش 👋":"دخلت الغرفة ✅"); }
      if(d.type==="state") this.applyState(d.state);
    };
    Net.onHostLost=()=>UI.toast("الاتصال بالحكم اتقطع! حاول تدخل تاني بنفس الاسم");
    UI.toast("بنوصّلك...");
    Net.join(code,()=>Net.send({type:"join",name,color:this.selectedColor}),e=>UI.toast("مش لاقيين الغرفة دي ❌ ("+e+")"));
  },

  buzz(){ if(Net.isHost) { Game.buzz(this.myName,performance.now()); this.sync(); } else Net.send({type:"buzz"}); },
  power(kind,target){ if(Net.isHost){ Game.usePower(this.myName,kind,target); this.sync(); } else Net.send({type:"power",kind,target}); },
  answer(idx){ if(Net.isHost){ Game.autoAnswer(this.myName,idx); this.sync(); } else Net.send({type:"answer",idx}); },
  pickFreeze(){
    const s=this.state; const others=s.order.filter(n=>n!==this.myName);
    UI.overlay(`<div class="modal"><h3>🧊 ثبّت مين؟</h3>${others.map(n=>`<button class="btn big" style="background:${s.players[n].color};color:#fff" onclick="App.power('freeze','${n}');UI.hideOverlay()">${n}</button>`).join("")}</div>`);
  },

  // ---- Render ----
  applyState(s){
    this.state=s;
    if(s.event&&s.event.id!==this.lastEvent){ this.lastEvent=s.event.id; UI.handleEvent(s.event,s); }
    if(s.phase==="lobby"){ UI.show("screen-lobby"); UI.renderLobby(s,Net.isHost); }
    else if(s.phase==="playing"){ UI.show("screen-game"); UI.renderGame(s,this.myName,this.role); }
    else if(s.phase==="results"){ UI.show("screen-results"); UI.renderResults(s); }
  }
};

// ---- إدارة الأسئلة ----
const Manage = {
  list:[],
  init(){
    $("#btnAddQ").onclick=()=>this.edit(null);
    $("#btnDownloadQ").onclick=()=>{ const a=document.createElement("a"); a.href=URL.createObjectURL(new Blob([JSON.stringify(this.list,null,2)],{type:"application/json"})); a.download="questions.json"; a.click(); };
    $("#btnResetQ").onclick=()=>{ if(confirm("ترجع البنك الافتراضي؟")){ QuestionStore.reset(); this.render(); } };
    $("#fileQ").onchange=e=>{ const f=e.target.files[0]; if(!f) return; const r=new FileReader(); r.onload=()=>{ try{ const j=JSON.parse(r.result); if(!Array.isArray(j)) throw 0; this.list=j; QuestionStore.save(j); this.render(); UI.toast("اتحمّل "+j.length+" سؤال ✅"); }catch(err){ UI.toast("ملف JSON غلط ❌"); } }; r.readAsText(f); };
    $("#filterCat").onchange=()=>this.render();
  },
  render(){
    this.list=QuestionStore.load();
    const f=$("#filterCat"); if(!f.options.length) f.innerHTML=`<option value="">كل الفئات</option>`+CATEGORIES.map(c=>`<option>${c}</option>`).join("");
    const cat=f.value;
    $("#qList").innerHTML=this.list.filter(q=>!cat||q.category===cat).map((q,i)=>`<div class="qitem"><b>${q.id}</b><span>${q.question.slice(0,50)}… <small>(${q.answer})</small></span>
      <button class="btn" onclick="Manage.edit('${q.id}')">✏️</button><button class="btn red" onclick="Manage.del('${q.id}')">🗑</button></div>`).join("")||"<p class='hint'>مفيش أسئلة</p>";
  },
  edit(id){
    const q=this.list.find(x=>x.id===id)||{id:"q"+Date.now().toString(36),category:CATEGORIES[0],question:"",answer:"",difficulty:"سهل",image:"",word:"",reverse:false};
    $("#overlay").dataset.sticky=1;
    UI.overlay(`<div class="modal" onclick="event.stopPropagation()"><h3>${id?"تعديل":"إضافة"} سؤال</h3>
      <label>ID</label><input id="eId" value="${q.id}" ${id?"readonly":""}>
      <label>الفئة</label><select id="eCat">${CATEGORIES.map(c=>`<option ${c===q.category?"selected":""}>${c}</option>`).join("")}</select>
      <label>السؤال</label><textarea id="eQ" rows="3">${q.question}</textarea>
      <label>الإجابة</label><input id="eA" value="${q.answer}">
      <label>الصعوبة</label><select id="eD">${["سهل","متوسط","صعب"].map(d=>`<option ${d===q.difficulty?"selected":""}>${d}</option>`).join("")}</select>
      <label>مسار الصورة (اختياري) مثال players/p001.jpg</label><input id="eI" value="${q.image||""}">
      <label>كلمة معكوسة؟ (الكود بيعكسها لوحده)</label><input type="checkbox" id="eR" ${q.reverse?"checked":""}> <input id="eW" placeholder="الكلمة الأصلية" value="${q.word||""}">
      <div class="row" style="margin-top:10px"><button class="btn green" onclick="Manage.save('${id||""}')">💾 حفظ</button><button class="btn ghost" style="color:#143;border-color:#143;width:auto" onclick="UI.hideOverlay()">إلغاء</button></div></div>`);
  },
  save(id){
    const q={id:$("#eId").value.trim(),category:$("#eCat").value,question:$("#eQ").value.trim(),answer:$("#eA").value.trim(),difficulty:$("#eD").value};
    if($("#eI").value.trim()) q.image=$("#eI").value.trim();
    if($("#eR").checked){ q.reverse=true; q.word=$("#eW").value.trim()||q.answer; }
    if(!q.id||!q.question||!q.answer) return UI.toast("كمّل البيانات");
    const i=this.list.findIndex(x=>x.id===(id||q.id)); if(i>=0) this.list[i]=q; else this.list.push(q);
    QuestionStore.save(this.list); UI.hideOverlay(); this.render(); UI.toast("اتحفظ ✅");
  },
  del(id){ if(!confirm("تمسح السؤال؟")) return; this.list=this.list.filter(x=>x.id!==id); QuestionStore.save(this.list); this.render(); }
};

window.addEventListener("DOMContentLoaded",()=>App.init());