/*KFX-BEGIN*/
/* kfx.js v1 - recorded sound effects for the Wilson kids' games.
   One AAC sprite (audio/fx/fx.m4a + fx.json) of CC0 recordings (Kenney, OpenGameArt, Freesound CC0; see CREDITS-AUDIO.md).
   KFX.init({ctx:()=>AudioContext, out:()=>node, base:'audio/fx/', v:'ver', muted:()=>bool, duck:(depth,ms)=>{}})
   KFX.play('coin',{vol,rate})   KFX.bind(SFX,{gameName:'bankName'|['bankName',{opts}]|fn(args)->spec},{ok:fn})
   Keeps polyphony low (global + per-sound caps), gaps repeated triggers, varies pitch a little and never repeats the same take twice. */
(function(W){'use strict';
var K=W.KFX={stats:{play:0,drop:0,steal:0,decoded:0,err:0},ready:false};
var cfg={max:6},C=null,bus=null,ab=null,buf=null,idx=null,idxP=null,fetching=false,decoding=false,live=[],tlast={},lastI={},unlockedOnce=false;
var TONAL={chime:1,bell:1,star:1,correct:1,sparkle:1,magic:1,gem:1,coin:1,coins:1,pickup:1,power:1,shield:1,drip:1};
var JING={win:1,fanfare:1,levelup:1,sting:1,sad:1,fail:1,cheer:1,wow:1,airhorn:1,boom:1,roar:1,firework:1,rumble:1,stomp:1};
function prof(n){
  if(JING[n])return{gap:350,conc:1,jit:n==='boom'||n==='roar'||n==='stomp'?0.04:0,duck:n==='boom'||n==='stomp'||n==='rumble'?0.55:0.45,pri:3};
  if(TONAL[n])return{gap:70,conc:n==='coin'?3:2,jit:0.025,pri:2};
  if(n==='click'||n==='tap'||n==='tick'||n==='back'||n==='toggle'||n==='swipe'||n==='pop'||n==='squeak'||n==='pat'||n==='rustle')return{gap:55,conc:2,jit:0.06,pri:1};
  return{gap:80,conc:2,jit:0.05,pri:2};
}
function getC(){var c=null;try{c=cfg.ctx&&cfg.ctx()}catch(e){}if(c!==C){C=c;bus=null}return C}
function mkBus(){
  if(bus||!C)return bus;
  try{
    bus=C.createGain();bus.gain.value=cfg.gain==null?0.9:cfg.gain;
    var comp=C.createDynamicsCompressor();comp.threshold.value=-14;comp.knee.value=8;comp.ratio.value=6;comp.attack.value=0.003;comp.release.value=0.14;
    bus.connect(comp);var o=typeof cfg.out==='function'?cfg.out():cfg.out;comp.connect(o||C.destination);
  }catch(e){bus=null}
  return bus;
}
function fetchSprite(){
  if(fetching||!cfg.base)return;fetching=true;var q=cfg.v?('?v='+cfg.v):'';
  try{
    fetch(cfg.base+'fx.json'+q).then(function(r){return r.json()}).then(function(j){idx=j}).catch(function(){K.stats.err++});
    fetch(cfg.base+'fx.m4a'+q).then(function(r){return r.arrayBuffer()}).then(function(a){ab=a;K.warm()}).catch(function(){K.stats.err++});
  }catch(e){K.stats.err++}
}
K.warm=function(){
  getC();if(!C||buf||decoding||!ab)return;decoding=true;
  var done=function(b){decoding=false;if(b){buf=b;K.ready=true;K.stats.decoded=1}else K.stats.err++};
  try{var p=C.decodeAudioData(ab.slice(0),done,function(){done(null)});if(p&&p.catch)p.catch(function(){})}catch(e){decoding=false}
};
K.init=function(o){
  for(var k in o)cfg[k]=o[k];
  fetchSprite();
  if(!unlockedOnce){unlockedOnce=true;
    ['pointerdown','touchend','click','keydown'].forEach(function(ev){W.addEventListener(ev,K.kick,{capture:true,passive:true})});
    document.addEventListener('visibilitychange',function(){if(!document.hidden)setTimeout(K.kick,60)});
    W.addEventListener('pageshow',function(){setTimeout(K.kick,60)});
  }
};
/* gesture/visibility: make sure the context is running and the sprite is decoded (iOS needs resume() inside a tap) */
K.kick=function(){getC();if(!C)return;try{if(C.state!=='running'&&!document.hidden){var p=C.resume();p&&p.catch&&p.catch(function(){})}}catch(e){}K.warm()};
function pick(n,len){
  if(len<2)return 0;var i,t=0;do{i=(Math.random()*len)|0}while(i===lastI[n]&&++t<6);lastI[n]=i;return i}
K.play=function(name,o){
  o=o||{};getC();
  if(!C||C.state!=='running'||document.hidden)return false;
  if(cfg.muted&&cfg.muted())return false;
  if(!buf||!idx){K.warm();return false}
  var v=idx[name];if(!v||!v.length){K.stats.miss=(K.stats.miss||0)+1;return false}
  mkBus();if(!bus)return false;
  var P=prof(name),t=C.currentTime;
  if(t-(tlast[name]||-9)<P.gap/1000){K.stats.drop++;return false}
  live=live.filter(function(x){return x.end>t});
  var same=live.filter(function(x){return x.name===name});
  if(same.length>=P.conc)steal(same[0],t);
  if(live.length>=(cfg.max||6)){var lo=live[0];for(var i=1;i<live.length;i++)if(live[i].pri<lo.pri||(live[i].pri===lo.pri&&live[i].t0<lo.t0))lo=live[i];
    if(lo.pri>P.pri){K.stats.drop++;return false}steal(lo,t)}
  var seg=v[pick(name,v.length)],rate=(o.rate||1)*(1+(Math.random()*2-1)*(o.jit==null?P.jit:o.jit));
  var s=C.createBufferSource(),g=C.createGain();s.buffer=buf;s.playbackRate.value=rate;
  g.gain.value=(o.vol==null?1:o.vol);s.connect(g);g.connect(bus);
  try{s.start(t,seg[0],seg[1])}catch(e){return false}
  var rec={name:name,s:s,g:g,t0:t,end:t+seg[1]/rate+0.03,pri:P.pri};live.push(rec);
  s.onended=function(){try{g.disconnect()}catch(e){}};
  tlast[name]=t;K.stats.play++;
  if(P.duck&&cfg.duck&&!o.noduck){try{cfg.duck(P.duck,seg[1]/rate*1000)}catch(e){}}
  return true;
};
function steal(x,t){try{x.g.gain.cancelScheduledValues(t);x.g.gain.setTargetAtTime(0,t,0.008);x.s.stop(t+0.05)}catch(e){}x.end=t;K.stats.steal++}
/* bind(SFX, MAP, {ok}) - replace the game's synth effects with recordings; unmapped names keep their old behavior */
K.bind=function(SFX,MAP,opt){
  opt=opt||{};var bound=[];
  Object.keys(MAP).forEach(function(k){
    if(!(k in SFX))return;var m=MAP[k];
    SFX[k]=function(){
      try{
        if(opt.ok&&!opt.ok())return;
        var spec=typeof m==='function'?m.apply(null,arguments):m;if(!spec)return;
        if(typeof spec==='string')K.play(spec);
        else if(spec instanceof Array)K.play(spec[0],spec[1]);
        else if(spec.n)K.play(spec.n,spec);
      }catch(e){}
    };bound.push(k);
  });
  K.bound=(K.bound||[]).concat(bound);return bound;
};
})(window);

/*KFX-END*/
const AUD=(()=>{
  let C=null,master,musicBus,musicDuck,sfxBus,voiceBus,noiseBuf,unlocked=false,silentEl=null,clips={},loading=false;
  let muted=localStorage.getItem('arr_muted')==='1';
  const R=Math.random,rr=(a,b)=>a+R()*(b-a);
  const now=()=>C?C.currentTime:0;const stats={voice:0,last:'',dropped:0,sfx:0,said:[]};
  try{if(navigator.audioSession)navigator.audioSession.type='playback'}catch(e){}
  function build(){const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;C=new AC();
    master=C.createGain();master.gain.value=muted?0:0.9;const comp=C.createDynamicsCompressor();comp.threshold.value=-12;comp.ratio.value=4;
    master.connect(comp);comp.connect(C.destination);
    const bus=v=>{const g=C.createGain();g.gain.value=v;g.connect(master);return g};
    musicBus=bus(0.3);musicDuck=C.createGain();musicDuck.connect(musicBus);sfxBus=bus(0.62);voiceBus=bus(1.2);
    const sr=C.sampleRate;noiseBuf=C.createBuffer(1,sr*2,sr);const d=noiseBuf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=R()*2-1;
    /* synth disabled */0;}
  function unlock(){try{if(!C)build();if(!C)return;try{if(navigator.audioSession)navigator.audioSession.type='playback'}catch(e){}
      if(C.state!=='running')C.resume().catch(()=>{});
      const s=C.createBufferSource();s.buffer=C.createBuffer(1,1,22050);s.connect(C.destination);s.start(0);
      // looping near-silent <audio> => 'playback' audio session so sound works even with the iPhone ringer/silent switch on
      if(!silentEl){silentEl=document.createElement('audio');silentEl.setAttribute('playsinline','');silentEl.setAttribute('webkit-playsinline','');silentEl.setAttribute('x-webkit-airplay','deny');silentEl.preload='auto';silentEl.loop=true;silentEl.src=SILENT_MP3;silentEl.volume=0.01}
      if(silentEl.paused&&!document.hidden){const p=silentEl.play();p&&p.catch&&p.catch(()=>{})}
      if(!unlocked){unlocked=true;loadClips()}}catch(e){console.warn('unlock',e)}}
  ['touchstart','touchend','pointerdown','mousedown','click','keydown'].forEach(ev=>window.addEventListener(ev,unlock,{capture:true,passive:true}));
  document.addEventListener('visibilitychange',()=>{if(!C)return;if(document.hidden){C.suspend&&C.suspend().catch(()=>{});silentEl&&silentEl.pause()}
    else if(unlocked){C.resume().catch(()=>{});if(silentEl){const p=silentEl.play();p&&p.catch&&p.catch(()=>{})}}});
  function loadClips(){if(loading)return;loading=true;for(const k in CLIPS){try{const b=atob(CLIPS[k]),u=new Uint8Array(b.length);for(let i=0;i<b.length;i++)u[i]=b.charCodeAt(i);
    const p=C.decodeAudioData(u.buffer,x=>{clips[k]=x},()=>{});p&&p.catch&&p.catch(()=>{})}catch(e){}}}
  const ok=()=>C&&!muted&&C.state==='running';
  const safe=fn=>function(){try{if(!sfxOK())return;if(!ok())return;stats.sfx++;return fn.apply(null,arguments)}catch(e){}};
  function g(v,out){const x=C.createGain();x.gain.value=v;x.connect(out);return x}
  function env(x,t,a,h,r,v){x.gain.setValueAtTime(0.0001,t);x.gain.linearRampToValueAtTime(v,t+a);x.gain.setValueAtTime(v,t+a+h);x.gain.exponentialRampToValueAtTime(0.0001,t+a+h+r)}
  function o(type,f,t,d,out){const x=C.createOscillator();x.type=type;x.frequency.setValueAtTime(f,t);x.connect(out);x.start(t);x.stop(t+d+0.05);return x}
  function f(type,fr,q,out){const x=C.createBiquadFilter();x.type=type;x.frequency.value=fr;x.Q.value=q||0.7;x.connect(out);return x}
  function n(t,d,out){const s=C.createBufferSource();s.buffer=noiseBuf;s.loop=true;s.connect(out);s.start(t,R());s.stop(t+d+0.05);return s}
  const mtof=m=>440*Math.pow(2,(m-69)/12);
  const blip=(type,f0,f1,t,d,v,out)=>{const G=g(0,out||sfxBus);env(G,t,0.004,d*0.3,d*0.7,v);const x=o(type,f0,t,d,f('lowpass',5000,0.7,G));x.frequency.exponentialRampToValueAtTime(f1,t+d);return x};
  // ---------- SFX (all original synth) ----------
  let starN=0;
  const SFX={
    sparkle:safe(()=>{const t=now();blip('sine',1760,2640,t,0.14,0.05);blip('triangle',2349,3136,t+0.05,0.12,0.035)}),
    star:safe(function(k){const t=now(),f=[659,784,988,1319][Math.min(3,(k|0)%4)];blip('triangle',f,f,t,0.42,0.16);blip('sine',f*2,f*2,t+0.02,0.5,0.07);blip('sine',f*3,f*3,t+0.04,0.3,0.04)}),
    paddle:safe(()=>{const t=now(),G=g(0,sfxBus);env(G,t,0.01,0.03,0.16,0.16);const F=f('bandpass',rr(700,1000),1.2,G);n(t,0.22,F);F.frequency.exponentialRampToValueAtTime(320,t+0.2);
      const G2=g(0,sfxBus);env(G2,t,0.003,0.01,0.08,0.06);const x=o('sine',rr(170,210),t,0.12,G2);x.frequency.exponentialRampToValueAtTime(110,t+0.1)}),
    brake:safe(()=>{const t=now(),G=g(0,sfxBus);env(G,t,0.04,0.12,0.2,0.08);n(t,0.4,f('lowpass',600,0.8,G))}),
    splash:safe(()=>{const t=now(),G=g(0,sfxBus);env(G,t,0.005,0.15,0.7,0.34);const F=f('lowpass',2400,0.7,G);n(t,0.95,F);F.frequency.exponentialRampToValueAtTime(300,t+0.9);
      blip('sine',520,70,t,0.35,0.2);for(let i=0;i<10;i++){const s=t+0.15+rr(0,0.6),B=g(0,sfxBus);env(B,s,0.002,0.01,0.05,rr(0.03,0.07));o('sine',rr(500,1100),s,0.06,B)}}),
    sputter:safe(()=>{const t=now();for(let i=0;i<6;i++){const s=t+i*0.11+rr(0,0.04);blip('sine',rr(160,240),rr(420,600),s,0.08,0.12)}}),
    bonk:safe(()=>{const t=now();blip('triangle',320,110,t,0.14,0.2);blip('square',640,260,t,0.06,0.07);const G=g(0,sfxBus);env(G,t,0.001,0.01,0.06,0.2);n(t,0.07,f('bandpass',500,1.5,G));
      setTimeout(()=>{try{SFX.boing()}catch(e){}},90)}),
    boing:safe(()=>{const t=now(),G=g(0,sfxBus);env(G,t,0.005,0.15,0.3,0.14);const x=o('sine',180,t,0.45,G);const L=C.createOscillator(),LG=C.createGain();L.frequency.value=16;LG.gain.value=50;L.connect(LG);LG.connect(x.frequency);L.start(t);L.stop(t+0.5);x.frequency.exponentialRampToValueAtTime(620,t+0.4)}),
    honk:safe(()=>{const t=now();[0,0.2].forEach(d=>{const G=g(0,sfxBus);env(G,t+d,0.01,0.08,0.06,0.13);const F=f('bandpass',1100,3,G);const x=o('sawtooth',440,t+d,0.16,F);x.frequency.linearRampToValueAtTime(360,t+d+0.15);o('square',220,t+d,0.15,f('lowpass',900,1,g(0.35,G)))})}),
    whoosh:safe(()=>{const t=now(),G=g(0,sfxBus);env(G,t,0.08,0.08,0.25,0.15);const F=f('bandpass',500,1.5,G);n(t,0.45,F);F.frequency.exponentialRampToValueAtTime(3000,t+0.4)}),
    splat:safe(()=>{const t=now(),G=g(0,sfxBus);env(G,t,0.002,0.03,0.18,0.35);n(t,0.22,f('lowpass',900,1.5,G));blip('sine',340,55,t,0.22,0.22);setTimeout(()=>{try{blip('sine',200,90,now(),0.12,0.1)}catch(e){}},160)}),
    squeak:safe(()=>{const t=now();[0,0.18].forEach(d=>{const G=g(0,sfxBus);env(G,t+d,0.005,0.05,0.07,0.12);const x=o('sine',1300,t+d,0.14,G);x.frequency.linearRampToValueAtTime(1900,t+d+0.05);x.frequency.linearRampToValueAtTime(1350,t+d+0.13);o('square',2600,t+d,0.12,f('bandpass',2600,4,g(0.05,G)))})}),
    acorn:safe(()=>{const t=now();[[1568,0],[2093,0.06]].forEach(([fr,d])=>{const G=g(0,sfxBus);env(G,t+d,0.002,0.04,0.22,0.08);o('square',fr,t+d,0.28,f('lowpass',5000,0.7,G))})}),
    wave:safe(()=>{const t=now();[[76,0],[81,0.09],[88,0.18]].forEach(([m,d])=>{const G=g(0,sfxBus);env(G,t+d,0.004,0.03,0.15,0.08);o('triangle',mtof(m),t+d,0.2,G)})}),
    burp:safe(()=>{const t=now(),G=g(0,sfxBus);env(G,t,0.02,0.3,0.2,0.32);const F=f('lowpass',520,2,G);const x=o('sawtooth',95,t,0.55,F);x.frequency.linearRampToValueAtTime(62,t+0.5);
      const A=C.createOscillator(),AG=C.createGain();A.frequency.value=23;AG.gain.value=0.5;A.connect(AG);AG.connect(G.gain);A.start(t);A.stop(t+0.6)}),
    bubble:safe(()=>{const t=now();for(let i=0;i<4;i++){const s=t+i*0.07;blip('sine',300+i*120,900+i*200,s,0.09,0.11)}}),
    scoop:safe(()=>{const t=now();[67,71,74,79].forEach((m,i)=>blip('square',mtof(m),mtof(m+2),t+i*0.05,0.07,0.06))}),
    drop:safe(()=>{const t=now();[76,83,88,91,95].forEach((m,i)=>{const G=g(0,sfxBus);env(G,t+i*0.05,0.002,0.02,0.4,0.08);o('triangle',mtof(m),t+i*0.05,0.45,G);const G2=g(0,sfxBus);env(G2,t+i*0.05,0.002,0.01,0.2,0.03);o('sine',mtof(m)*3,t+i*0.05,0.25,G2)})}),
    check:safe(()=>{const t=now();[72,76,79,84].forEach((m,i)=>{const G=g(0,sfxBus);env(G,t+i*0.08,0.002,0.03,0.5,0.08);o('triangle',mtof(m),t+i*0.08,0.6,G);o('sine',mtof(m+12),t+i*0.08,0.4,g(0.3,G))})}),
    snap:safe(()=>{const t=now();blip('square',260,70,t,0.16,0.16);const G=g(0,sfxBus);env(G,t,0.001,0.01,0.07,0.32);n(t,0.09,f('highpass',1800,0.8,G))}),
    grumble:safe(()=>{const t=now();for(let k=0;k<3;k++){const s=t+k*0.14,G=g(0,sfxBus);env(G,s,0.02,0.06,0.08,0.13);const F=f('bandpass',500,3,G);const x=o('sawtooth',110-k*8,s,0.18,F);x.frequency.linearRampToValueAtTime(80,s+0.16)}}),
    sneeze:safe(()=>{const t=now(),G=g(0,sfxBus);env(G,t,0.4,0.1,0.05,0.06);const F=f('bandpass',600,3,G);n(t,0.6,F);F.frequency.exponentialRampToValueAtTime(1600,t+0.55);
      const s=t+0.6,G2=g(0,sfxBus);env(G2,s,0.003,0.06,0.2,0.32);n(s,0.3,f('highpass',1500,0.7,G2))}),
    fish:safe(()=>{const t=now(),G=g(0,sfxBus);env(G,t,0.002,0.02,0.12,0.18);n(t,0.15,f('highpass',900,0.7,G));blip('sine',700,1200,t,0.1,0.06)}),
    yum:safe(()=>{const t=now();[0,0.16,0.32].forEach((d,i)=>blip('sine',380+i*60,720+i*80,t+d,0.12,0.13))}),
    hurt:safe(()=>{const t=now();blip('square',600,200,t,0.25,0.08);blip('triangle',300,100,t,0.25,0.1)}),
    power:safe(()=>{const t=now();[60,64,67,72,67,72,76,79,84].forEach((m,i)=>{blip('square',mtof(m),mtof(m),t+i*0.055,0.07,0.06);blip('triangle',mtof(m-12),mtof(m-12),t+i*0.055,0.07,0.07)})}),
    firework:safe(()=>{const t=now();blip('sine',300,1400,t,0.35,0.05);const s=t+0.38,G=g(0,sfxBus);env(G,s,0.001,0.02,0.5,0.3);n(s,0.6,f('lowpass',2500,0.7,G));
      for(let i=0;i<14;i++){const c=s+0.1+rr(0,0.6),B=g(0,sfxBus);env(B,c,0.001,0.003,0.03,rr(0.04,0.1));n(c,0.04,f('highpass',3000,0.7,B))}}),
    cheer:safe(()=>{const t=now();for(let k=0;k<10;k++){const s=t+rr(0,0.5),G=g(0,sfxBus),d=rr(0.4,0.8);env(G,s,0.06,d*0.5,d*0.5,0.03);const F=f('bandpass',rr(900,1500),2,G);const x=o('sawtooth',rr(330,520),s,d,F);x.frequency.linearRampToValueAtTime(rr(450,700),s+d*0.6)}
      for(let i=0;i<24;i++){const s=t+rr(0.05,1.4),G=g(0,sfxBus);env(G,s,0.001,0.005,0.03,rr(0.05,0.12));n(s,0.05,f('bandpass',rr(1000,2400),1.2,G))}}),
    fanfare:safe(()=>{const t=now();[[67,0],[72,0.12],[76,0.24],[79,0.36],[76,0.54],[79,0.66],[84,0.8]].forEach(([m,d],i)=>{const G=g(0,sfxBus);env(G,t+d,0.01,i==6?0.5:0.08,0.3,0.09);o('square',mtof(m),t+d,0.9,f('lowpass',3200,0.7,G));const G2=g(0,sfxBus);env(G2,t+d,0.005,0.02,0.6,0.07);o('triangle',mtof(m-12),t+d,0.8,G2)})}),
    click:safe(()=>{const t=now();blip('square',900,1300,t,0.05,0.07)})
  };
  /*KFX-BIND*/try{KFX.init({ctx:()=>C,out:()=>sfxBus,muted:()=>muted,base:'audio/fx/',v:'20261128audio',gain:1.3,duck:(d,ms)=>{try{if(window.BGM&&BGM.duck)BGM.duck(d,ms)}catch(e){}}});
  KFX.bind(SFX,{
 /* ---- shared across Fry / Bee / Doodle / Adventure ---- */
 shoot:['bloop',{vol:.7}], pop:'pop', zap:'zap', honey:function(b){return b?'gem':'coin'}, power:'power', shield:'shield', shieldPop:['pop',{rate:.72}],
 hurt:'hurt', heart:'chime', check:'correct', bossHit:'thud', bossDown:'boom', warn:'bell', whoosh:'whoosh', squawk:['quack',{rate:1.3}], puff:'swipe', beep:'tick',
 roar:'roar', boing:'boing', firework:'firework', cheer:'cheer', fanfare:'fanfare', splat:'splat', plop:'plop', munch:'yum', whistle:'whistle', honk:'honk',
 fart:'fart', wet:'squish', mega:'boom', charge:'power', click:'click', star:'star', win:'win', tap:'tap', collect:'coin', thud:'thud', back:'back', open:'open', close:'close',
 /* ---- Doodle & Zoe / Alex & Doodle ---- */
 meow:'meow', purr:'purr', chime:'chime', treat:'coin', hop:['jump',{vol:.8}], hop2:['jump',{vol:.8,rate:1.12}], land:'land', knock:'knock', quack:'quack', squeak:'squeak', pat:'pat',
 rustle:'rustle', sticker:'star', shutter:'shutter', hoot:['bloop',{rate:.62,jit:.02}], crackle:'rustle', plane:'whoosh',
 note:function(m){return {n:'bellnote',rate:Math.pow(2,(((m-60)%24+24)%24-12)/12),jit:0,vol:.9}},
 /* ---- Lava ---- */
 jump:'jump', rocket:'rocket', coin:'coin', gem:'gem', stomp:'stomp', bump:'thud', appear:'sparkle', bubble:'bubble', hot:['rumble',{vol:.7}], blorp:'bloop', rumble:'rumble',
 grumble:'grumble', spit:'splat',
 /* ---- River Run ---- */
 paddle:['splash',{vol:.38,rate:1.3}], brake:['whoosh',{vol:.5,rate:.8}], splash:'splash', sputter:'bloop', bonk:'bonk', acorn:'gem', wave:'chime', burp:'burp', scoop:'pickup',
 drop:'coins', snap:['bonk',{rate:1.3}], sneeze:'sneeze', fish:['splash',{vol:.6,rate:1.35}], yum:'yum',
 /* ---- Unicorn ---- */
 sparkle:'sparkle', boop:'bloop', magic:'magic', drip:'drip', oops:'oops', giggle:'giggle', neigh:'whistle', flap:'swipe', clap:['pat',{rate:1.5}],
 /* ---- Pirates ---- */
 squirt:['splash',{vol:.5,rate:1.4}], toss:'whoosh', ribbit:'ribbit', laughMan:['giggle',{rate:.8}], stamp:'stomp', rewind:'scratch', laughTrack:'giggle',
 streak:function(lv){return {n:'chime',rate:Math.pow(2,Math.min(12,Math.max(0,lv|0))/12),jit:0}}, superOn:'power', superOff:['power',{rate:.72}], toot:function(b){return b?'fart':'toot'},
 cloudPop:['pop',{rate:.8}], horn:'honk', hose:['drip',{vol:.5}], parade:'levelup'
},{ok:()=>C&&!muted&&C.state==='running'&&sfxOK()})}catch(e){console.warn('kfx',e)}
  // ---------- one voice at a time, with ducking ----------
  let curEnd=0,curPrio=0,queue=[];
  /*vguard*/let _vk='',_vt=0,_sx=[];function sfxOK(){const n=Date.now();_sx=_sx.filter(x=>n-x<350);if(_sx.length>=3)return false;_sx.push(n);return true}
  function say(k,prio,fromQ){const n=Date.now();if(k===_vk&&n-_vt<4000)return false;if((prio||1)<3&&C&&now()<curEnd-0.05)return false;const r=say0(k,prio);queue.length=0;if(r){_vk=k;_vt=n}return r}
  function say0(k,prio,fromQ){prio=prio||1;if(!ok())return false;const b=clips[k];if(!b)return false;const t=now();
    if(t<curEnd||queue.length&&!fromQ){if(prio>=2&&!queue.some(q=>q.k===k)){if(queue.length>=2){const lo=queue.reduce((a,q,i)=>q.prio<queue[a].prio?i:a,0);if(queue[lo].prio<=prio&&prio<3)queue.splice(lo,1);else if(prio>=3&&queue.length<3){}else{stats.dropped++;return false}}queue.push({k,prio});queue.sort((a,b)=>b.prio-a.prio);return true}stats.dropped++;return false}
    const s=C.createBufferSource();s.buffer=b;s.connect(voiceBus);s.start(t+0.02);curEnd=t+0.02+b.duration+0.2;curPrio=prio;stats.voice++;stats.last=k;stats.said.push(k);
    musicDuck.gain.cancelScheduledValues(t);musicDuck.gain.setTargetAtTime(0.28,t,0.04);musicDuck.gain.setTargetAtTime(1,curEnd,0.2);
    sfxBus.gain.cancelScheduledValues(t);sfxBus.gain.setTargetAtTime(0.38,t,0.04);sfxBus.gain.setTargetAtTime(0.62,curEnd,0.2);return true}
  setInterval(()=>{if(queue.length&&C&&now()>=curEnd){const q=queue.shift();say(q.k,q.prio,true)}},60);
  // ---------- music: original chiptune themes (8 bars, 8th-note melodies) ----------
  const NN={c:0,'c#':1,d:2,'d#':3,e:4,f:5,'f#':6,g:7,'g#':8,a:9,'a#':10,b:11};
  const P=s=>s.trim().split(/\s+/).map(x=>x==='.'?0:x==='-'?-1:(NN[x.slice(0,-1)]+12*(+x.slice(-1)+1)));
  const CH={C:[48,52,55],F:[53,57,60],G:[55,59,62],Am:[57,60,64],Dm:[50,53,57],Bb:[46,50,53],A:[57,61,64],E:[52,56,59],Em:[52,55,59],D:[50,54,57],B:[47,51,54],Gm:[55,58,62]};
  const TH={
    title:{bpm:118,prog:'C Am F G C Em Dm C',dr:'pop',lead:'tri',mel:P(`g4 . c5 . e5 . g5 .  a5 . g5 e5 . d5 c5 .  f5 . a5 . c6 - a5 .  g5 - - . e5 . d5 .
      c5 . e5 . g5 . c6 .  b5 . a5 g5 . e5 g5 .  a5 . f5 . d5 . g5 .  c5 - - . . . . .`)},
    canal:{bpm:132,prog:'F Gm F C F Gm C F',dr:'pop',lead:'sq',mel:P(`c5 f5 a5 . c6 . a5 f5  d5 g5 a#5 . d6 . a#5 .  c6 . a5 . f5 . a5 c6  g5 - - . e5 f5 g5 .
      a5 . c6 . f6 . c6 .  a#5 . g5 . d6 . a#5 .  a5 . c6 . g5 . e5 .  f5 - - . . . c5 .`)},
    willow:{bpm:108,prog:'G C D G Em C D G',dr:'soft',lead:'tri',mel:P(`b4 . d5 . g5 - f#5 .  e5 . g5 . c6 - b5 .  a5 . f#5 . d5 . a5 .  g5 - - . . . d5 .
      e5 . g5 . b5 - a5 .  g5 . e5 . c5 . e5 .  d5 . f#5 . a5 . c6 .  b5 - - . . . . .`)},
    marsh:{bpm:116,prog:'Am Dm C G Am F E Am',dr:'tom',lead:'sq',mel:P(`a4 . c5 a4 e5 . d5 c5  d5 . f5 d5 a5 . g5 f5  e5 . g5 e5 c6 . b5 a5  g5 - e5 . g5 . . .
      a5 . a5 g5 e5 . g5 a5  c6 . a5 . f5 . d5 .  e5 . g#5 . b5 . e6 .  a5 - - . . . . .`)},
    pond:{bpm:124,prog:'D G D A D G A D',dr:'tom',lead:'tri',mel:P(`d5 . f#5 . a5 . f#5 .  g5 . b5 . d6 . b5 .  a5 . f#5 . e5 . d5 .  e5 - - . a4 . . .
      d5 . f#5 . a5 . d6 .  e6 . d6 . b5 . g5 .  f#5 . a5 . e5 . c#5 .  d5 - - . . . . .`)},
    rapids:{bpm:156,prog:'Em Em C B Em C D B',dr:'volcano',lead:'sq',mel:P(`e5 e5 . g5 . b5 . e6  d6 . b5 . a5 . g5 .  c6 . c6 b5 a5 . g5 a5  b5 - f#5 - d#5 - b4 .
      e5 . g5 . e5 . b5 .  c6 . b5 . a5 . e5 .  f#5 . a5 . d6 . c6 b5  b5 - - - b4 - - .`)},
    boss:{bpm:148,prog:'Dm C Bb A Dm C Bb A',dr:'volcano',lead:'sq',mel:P(`d5 . d5 f5 . a5 . d5  c5 . c5 e5 . g5 . c5  a#4 . d5 f5 a#5 . a5 g5  a5 - - . c#5 . e5 .
      d6 . a5 . f5 . d5 .  c6 . g5 . e5 . c5 .  a#5 . f5 . d5 . a#4 .  a4 . c#5 . e5 . a5 .`)},
    win:{bpm:116,prog:'C F G C Am F G C',dr:'pop',lead:'tri',mel:P(`c5 . e5 . g5 . c6 -  a5 - f5 . c6 . a5 .  b5 . g5 . d6 . b5 .  c6 - - . g5 . c6 .
      e6 - c6 . a5 . c6 .  f6 - c6 . a5 . f5 .  g5 . b5 . d6 . f6 .  e6 - - . c6 - - .`)}
  };
  for(const k in TH)if(TH[k].mel.length!==64)console.warn('theme length',k,TH[k].mel.length);
  for(const k in TH)TH[k].prog=TH[k].prog.split(' ');
  let theme='off',step=0,nextT=0;
  function setTheme(th){if(th===theme)return;theme=th;step=0;if(C)nextT=now()+0.12}
  function lead(m,t,d,v,kind){const G=g(0,musicDuck);env(G,t,0.005,d*0.55,d*0.4,v);
    if(kind==='sq'){const F=f('lowpass',3400,0.8,G);const x=o('square',mtof(m),t,d+0.05,F);const L=C.createOscillator(),LG=C.createGain();L.frequency.value=5.5;LG.gain.value=mtof(m)*0.006;L.connect(LG);LG.connect(x.frequency);L.start(t);L.stop(t+d+0.06)}
    else{o('triangle',mtof(m),t,d+0.05,G);const G2=g(0,musicDuck);env(G2,t,0.002,0.01,0.25,v*0.35);o('sine',mtof(m)*2,t,0.3,G2)}}
  function bass(m,t,d,v){const G=g(0,musicDuck);env(G,t,0.004,d*0.5,d*0.4,v);o('triangle',mtof(m),t,d+0.05,G);const G2=g(0,musicDuck);env(G2,t,0.004,0.02,0.06,v*0.25);o('square',mtof(m),t,0.1,f('lowpass',700,0.7,G2))}
  function arp(m,t,v){const G=g(0,musicDuck);env(G,t,0.002,0.01,0.07,v);o('square',mtof(m),t,0.1,f('lowpass',2400,0.7,G))}
  function kick(t,v){const G=g(0,musicDuck);env(G,t,0.002,0.02,0.16,v);const x=o('sine',150,t,0.2,G);x.frequency.exponentialRampToValueAtTime(45,t+0.15)}
  function snare(t,v){const G=g(0,musicDuck);env(G,t,0.002,0.01,0.12,v);n(t,0.15,f('bandpass',1900,0.9,G));const G2=g(0,musicDuck);env(G2,t,0.002,0.01,0.06,v*0.5);o('triangle',220,t,0.08,G2)}
  function hat(t,v){const G=g(0,musicDuck);env(G,t,0.001,0.005,0.03,v);n(t,0.05,f('highpass',7000,0.7,G))}
  function tom(t,fr,v){const G=g(0,musicDuck);env(G,t,0.002,0.03,0.18,v);const x=o('sine',fr,t,0.22,G);x.frequency.exponentialRampToValueAtTime(fr*0.55,t+0.18)}
  function drums(kind,s16,bar,t){
    if(kind==='pop'){if(s16%8===0)kick(t,0.5);if(s16%8===4)snare(t,0.22);if(s16%2===0)hat(t,0.05)}
    else if(kind==='tom'){if(s16===0||s16===6||s16===8)kick(t,0.45);if(s16===4||s16===12)snare(t,0.18);if(s16===10)tom(t,200,0.3);if(s16===11)tom(t,170,0.28);if(s16===14)tom(t,140,0.3);hat(t,s16%2?0.02:0.04)}
    else if(kind==='soft'){if(s16===0||s16===10)kick(t,0.35);if(s16===4||s16===12)snare(t,0.1);if(s16%4===2)hat(t,0.04)}
    else{/* volcano groove: boom-boom-ta with tumbling toms */ if(s16===0||s16===3||s16===8||s16===11)kick(t,0.5);if(s16===4||s16===12)snare(t,0.24);if(s16%2===0)hat(t,0.05);
      if(bar%4===3&&s16>=12)tom(t,[220,190,160,130][s16-12],0.32);else if(s16===14)tom(t,150,0.22)}}
  function schedule(){return;if(!C||theme==='off')return;const th=TH[theme];if(!th)return;const sx=60/th.bpm/4;if(nextT<now())nextT=now()+0.05;
    while(nextT<now()+0.15){const t=nextT,i=step%128,bar=(i/16)|0,s16=i%16,ch=CH[th.prog[bar]];
      if(s16%2===0){const m=th.mel[i/2];if(m>0){let d=1;while(i/2+d<64&&th.mel[i/2+d]===-1)d++;lead(m,t,sx*2*d*0.92,th.lead==='sq'?0.07:0.11,th.lead);
        if(theme==='boss'||theme==='rapids')lead(m-12,t,sx*2*d*0.9,0.03,'tri')}}
      if(s16%4===0)bass(ch[0]-12+(s16===8?7:0)-(s16===8&&theme==='marsh'?7:0),t,sx*3.2,0.2);else if(s16%4===2&&th.dr!=='soft')bass(ch[0]-12+12,t,sx*1.2,0.07);
      arp(ch[s16%3]+12+(s16>=8?12:0),t,th.dr==='soft'?0.02:0.025);
      drums(th.dr,s16,bar,t);step++;nextT+=sx}}
  function setMuted(m){muted=m;localStorage.setItem('arr_muted',m?'1':'0');if(C)master.gain.setTargetAtTime(m?0:0.9,now(),0.03)}
  return{unlock,SFX,say,setTheme,setMuted,get muted(){return muted},get unlocked(){return unlocked&&!!C},get running(){return !!C&&C.state==='running'},get clipCount(){return Object.keys(clips).length},get theme(){return theme},stats,get speaking(){return C&&now()<curEnd}};
})();
