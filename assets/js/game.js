// منطق اللعبة — بيتنفذ بس على جهاز الـ Host (الحكم أو اللاعب 1)
const COLORS = ["#e63946","#1d6fd6","#f77f00","#8338ec","#06a77d","#ff006e"];

const Game = {
  state:null, bank:[], timerInt:null, eventId:0, history:[], peerToName:{},

  init(settings){
    this.bank = QuestionStore.load().filter(q=>settings.categories.includes(q.category));
    this.state = {
      phase:"lobby", settings, players:{}, order:[], used:[], qIndex:0,
      total: Math.min(settings.rounds, this.bank.length), current:null, event:null, varData:null
    };
  },

  // ---- اللاعبين ----
  addPlayer(peerId,name,color){
    const s=this.state; const existing=s.players[name];
    if(existing){ existing.online=true; this.peerToName[peerId]=name; return {ok:true,reconnect:true}; }
    if(s.order.length>=4) return {ok:false,msg:"الغرفة كاملة! 4 لاعبين بس"};
    if(s.phase!=="lobby") return {ok:false,msg:"الماتش بدأ خلاص"};
    if(Object.values(s.players).some(p=>p.color===color)) color=COLORS.find(c=>!Object.values(s.players).some(p=>p.color===c));
    s.players[name]={name,color,score:0,correct:0,yellow:0,red:0,online:true,suspended:false,suspendNext:false,
      power:{captain:true,freeze:true},captainOn:false,frozenUntil:0};
    s.order.push(name); this.peerToName[peerId]=name; return {ok:true};
  },
  dropPlayer(peerId){ const n=this.peerToName[peerId]; if(n&&this.state.players[n]) this.state.players[n].online=false; },

  // ---- السير ----
  fire(type,data){ this.state.event={id:++this.eventId,type,data,at:Date.now()}; },
  snapshot(){ this.history.push(JSON.stringify({players:this.state.players,current:this.state.current,qIndex:this.state.qIndex,used:this.state.used})); if(this.history.length>20) this.history.shift(); },
  undo(){ const h=this.history.pop(); if(!h) return; Object.assign(this.state, JSON.parse(h)); this.fire("undo"); },

  start(){ this.state.phase="playing"; this.nextQuestion(); },

  pickQuestion(cat){
    const pool=this.bank.filter(q=>!this.state.used.includes(q.id)&&(!cat||q.category===cat));
    if(!pool.length) return null;
    return pool[Math.floor(Math.random()*pool.length)];
  },

  nextQuestion(cat){
    const s=this.state;
    if(s.qIndex>=s.total) return this.finish();
    const q=this.pickQuestion(cat)||this.pickQuestion();
    if(!q) return this.finish();
    s.used.push(q.id); s.qIndex++;
    Object.values(s.players).forEach(p=>{ p.suspended=p.suspendNext; p.suspendNext=false; p.captainOn=false; p.frozenUntil=0; });
    const display = q.reverse ? reverseWord(q.word) : null;
    s.current={ q, display, revealed:false, buzzes:[], locked:[], active:null, wrongCount:0,
      timeLeft:s.settings.timer, paused:false, startedAt:performance.now(),
      options: s.settings.mode==="auto" ? this.makeOptions(q) : null,
      stoppage: s.qIndex > s.total-3 };
    this.fire("question",{stoppage:s.current.stoppage});
    this.startTimer();
  },

  makeOptions(q){
    const others=this.bank.filter(x=>x.id!==q.id&&x.answer!==q.answer);
    const same=others.filter(x=>x.category===q.category);
    const pool=[...new Set((same.length>=3?same:others).map(x=>x.answer))].sort(()=>Math.random()-.5).slice(0,3);
    return [q.answer,...pool].sort(()=>Math.random()-.5);
  },

  startTimer(){
    clearInterval(this.timerInt);
    this.timerInt=setInterval(()=>{
      const c=this.state.current; if(!c||c.paused) return;
      c.timeLeft--;
      if(c.timeLeft<=0){ clearInterval(this.timerInt); c.timeLeft=0; c.paused=true; this.fire("timeout"); }
      App.sync();
    },1000);
  },

  // ---- الجرس (Host-authoritative timestamp) ----
  buzz(name, hostTime){
    const s=this.state,c=s.current,p=s.players[name]; if(!c||!p) return;
    if(c.paused&&c.timeLeft<=0) return;
    if(c.locked.includes(name)||p.suspended) return;
    if(hostTime<p.frozenUntil) return;
    c.buzzes.push({name,t:+(hostTime-c.startedAt).toFixed(1)});
    if(c.active) return;                       // حد داس قبله
    c.active=name; c.paused=true; this.fire("buzz",{name});
  },

  calcPoints(name){
    const s=this.state,c=s.current,p=s.players[name];
    let pts=s.settings.points, tags=[];
    if(c.wrongCount>0){ pts=2; tags.push("🔥 هبدة مرتدة!"); }
    if(c.stoppage){ pts*=2; tags.push("⏱ وقت بدل ضائع"); }
    if(p.captainOn){ pts*=2; tags.push("©️ كابتن"); }
    return {pts,tags};
  },

  correct(){
    const s=this.state,c=s.current; if(!c||!c.active) return;
    this.snapshot(); const p=s.players[c.active]; const {pts,tags}=this.calcPoints(c.active);
    p.score+=pts; p.correct++; c.revealed=true; c.answered=true;
    this.fire("correct",{name:c.active,pts,tags});
  },
  wrong(){
    const s=this.state,c=s.current; if(!c||!c.active) return;
    this.snapshot(); const p=s.players[c.active];
    if(p.captainOn){ p.score-=1; }
    c.locked.push(c.active); c.wrongCount++;
    this.fire("wrong",{name:c.active,captain:p.captainOn});
    c.active=null;
    const free=s.order.filter(n=>!c.locked.includes(n)&&!s.players[n].suspended);
    if(free.length&&c.timeLeft>0) c.paused=false; else c.paused=true;
  },
  autoAnswer(name,idx){ const c=this.state.current; if(c.active!==name) return; (c.options[idx]===c.q.answer)?this.correct():this.wrong(); },
  reopen(){ const c=this.state.current; if(!c) return; c.active=null; c.paused=false; if(c.timeLeft<=0) c.timeLeft=5; this.startTimer(); this.fire("reopen"); },
  reveal(){ if(this.state.current){ this.state.current.revealed=true; this.state.current.paused=true; } },

  card(name,kind){
    const p=this.state.players[name]; if(!p) return; this.snapshot();
    if(kind==="yellow"){
      p.yellow++; p.score-=1;
      if(p.yellow%2===0){ p.red++; p.score-=3; p.suspendNext=true; this.fire("red",{name,auto:true}); }
      else this.fire("yellow",{name});
    } else { p.red++; p.score-=3; p.suspendNext=true; this.fire("red",{name}); }
  },

  usePower(name,kind,target){
    const s=this.state,p=s.players[name],c=s.current; if(!p||!c||!p.power[kind]) return;
    if(kind==="captain"){ if(c.active) return; p.power.captain=false; p.captainOn=true; this.fire("captain",{name}); }
    if(kind==="freeze"){ const t=s.players[target]; if(!t||target===name) return; p.power.freeze=false; t.frozenUntil=performance.now()+3000; this.fire("freeze",{name,target}); }
  },

  varReview(){ const c=this.state.current; if(!c) return; this.state.varData={buzzes:c.buzzes.slice().sort((a,b)=>a.t-b.t),id:Date.now()}; this.fire("var"); },

  finish(){ clearInterval(this.timerInt); this.state.phase="results"; this.state.current=null; this.fire("win"); },

  // نسخة اللاعبين (بدون الإجابة لو لسه مش ظاهرة)
  publicState(){
    const s=JSON.parse(JSON.stringify(this.state));
    if(s.current&&!s.current.revealed&&s.settings.mode!=="auto") delete s.current.q.answer;
    return s;
  },
  ranking(){ return this.state.order.map(n=>this.state.players[n]).sort((a,b)=>b.score-a.score); }
};