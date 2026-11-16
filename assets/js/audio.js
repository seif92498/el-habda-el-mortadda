// أصوات مولّدة بـ WebAudio — تشتغل أوفلاين بدون ملفات
const Sounds = (() => {
  let ctx;
  const ac = () => (ctx ||= new (window.AudioContext||window.webkitAudioContext)());
  const tone = (f, d=0.15, type="sine", t=0, vol=.3) => {
    const c=ac(), o=c.createOscillator(), g=c.createGain();
    o.type=type; o.frequency.value=f; g.gain.value=vol;
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime+t+d);
    o.connect(g).connect(c.destination); o.start(c.currentTime+t); o.stop(c.currentTime+t+d);
  };
  return {
    unlock(){ try{ac().resume();}catch(e){} },
    buzz(){ tone(880,.4,"square",0,.25); tone(1320,.3,"square",.05,.15); },
    correct(){ [523,659,784,1047].forEach((f,i)=>tone(f,.2,"triangle",i*.1)); },
    wrong(){ tone(200,.4,"sawtooth"); tone(150,.4,"sawtooth",.15); },
    whistle(){ tone(2600,.25,"square",0,.2); tone(2800,.45,"square",.3,.2); },
    timeout(){ tone(300,.3,"triangle"); tone(220,.5,"triangle",.3); },
    var(){ [600,800,600,800].forEach((f,i)=>tone(f,.15,"sine",i*.18)); },
    freeze(){ tone(1500,.6,"sine",0,.15); tone(1200,.6,"sine",.1,.15); },
    heartbeat(){ tone(60,.12,"sine",0,.5); tone(60,.12,"sine",.25,.5); },
    win(){ [523,659,784,1047,784,1047,1319].forEach((f,i)=>tone(f,.25,"triangle",i*.15,.35)); }
  };
})();