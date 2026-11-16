// طبقة الشبكة: PeerJS (WebRTC) بدون سيرفر
const Net = {
  peer:null, conns:{}, hostConn:null, isHost:false, code:null,
  onMessage:null, onPeerConnect:null, onPeerClose:null, onHostLost:null,
  PREFIX:"habda-",
  genCode(){ const a="ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; return Array.from({length:4},()=>a[Math.floor(Math.random()*a.length)]).join(""); },

  createRoom(cb, onErr){
    this.isHost=true; this.code=this.genCode();
    this.peer=new Peer(this.PREFIX+this.code);
    this.peer.on("open",()=>cb(this.code));
    this.peer.on("error",e=>{ if(e.type==="unavailable-id") return this.createRoom(cb,onErr); onErr&&onErr(e); });
    this.peer.on("connection",c=>{
      c.on("open",()=>{ this.conns[c.peer]=c; this.onPeerConnect&&this.onPeerConnect(c.peer); });
      c.on("data",d=>this.onMessage&&this.onMessage(c.peer,d,performance.now()));
      c.on("close",()=>{ delete this.conns[c.peer]; this.onPeerClose&&this.onPeerClose(c.peer); });
    });
  },

  join(code, cb, onErr){
    this.isHost=false; this.code=code.toUpperCase();
    this.peer=new Peer();
    this.peer.on("open",()=>{
      const c=this.peer.connect(this.PREFIX+this.code,{reliable:true});
      const t=setTimeout(()=>onErr&&onErr("timeout"),8000);
      c.on("open",()=>{ clearTimeout(t); this.hostConn=c; cb(); });
      c.on("data",d=>this.onMessage&&this.onMessage("host",d));
      c.on("close",()=>this.onHostLost&&this.onHostLost());
    });
    this.peer.on("error",e=>onErr&&onErr(e.type));
  },

  send(d){ this.hostConn&&this.hostConn.open&&this.hostConn.send(d); },
  sendTo(id,d){ const c=this.conns[id]; c&&c.open&&c.send(d); },
  broadcast(d){ Object.values(this.conns).forEach(c=>c.open&&c.send(d)); }
};