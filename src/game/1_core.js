// ================= core: canvas, layout, input, prefs =================
const cv=document.getElementById('c');let X=cv.getContext('2d',{alpha:false});const X0=X;
const DEBUG=/[?&]debug=1/.test(location.search),ICONMODE=/[?&]icon=1/.test(location.search),OGMODE=/[?&]og=1/.test(location.search);
const VERSION='1.0.0',FONT='"Arial Rounded MT Bold","Fredoka","Baloo 2","Trebuchet MS",system-ui,sans-serif';
let SW=0,SH=0,DPR=1,SC=1,VW=640,VH=400,OX=0,OY=0,portrait=false,INS={l:0,r:0,t:0,b:0},dprCap=2,CTL=null;
const insEl=document.createElement('div');insEl.style.cssText='position:fixed;left:0;top:0;width:0;height:0;padding:env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left);visibility:hidden;pointer-events:none';document.body.appendChild(insEl);
function resize(){const vv=window.visualViewport;SW=Math.round(vv&&vv.width||innerWidth);SH=Math.round(vv&&vv.height||innerHeight);if(vv&&vv.scale>1.01){SW=innerWidth;SH=innerHeight}DPR=Math.min(devicePixelRatio||1,dprCap);
  const cs=getComputedStyle(insEl);INS={t:parseFloat(cs.paddingTop)||0,r:parseFloat(cs.paddingRight)||0,b:parseFloat(cs.paddingBottom)||0,l:parseFloat(cs.paddingLeft)||0};
  portrait=SH>SW*1.1;
  if(!portrait){VH=Math.max(400,Math.round(640*SH/SW));SC=SH/VH;VW=SW/SC;OX=0;OY=0}
  else{VW=420;VH=400;SC=SW/VW;OX=0;OY=Math.round(Math.max(INS.t+6,(SH-VH*SC)*0.22))}
  cv.width=Math.round(SW*DPR);cv.height=Math.round(SH*DPR);cv.style.width=SW+'px';cv.style.height=SH+'px';CTL=null}
addEventListener('resize',resize);addEventListener('orientationchange',()=>{clearInput&&clearInput();[100,300,700].forEach(d=>setTimeout(resize,d))});if(window.visualViewport){visualViewport.addEventListener('resize',resize);visualViewport.addEventListener('scroll',()=>{if(scrollY)scrollTo(0,0)})}resize();
// mobile Safari: no pinch/double-tap zoom, no pull-to-refresh, no long-press selection/callout
['gesturestart','gesturechange','gestureend','dblclick','selectstart'].forEach(ev=>document.addEventListener(ev,e=>e.preventDefault(),{passive:false}));
document.addEventListener('touchmove',e=>{if(e.cancelable)e.preventDefault()},{passive:false});
let lastTE=0;document.addEventListener('touchend',e=>{const n=Date.now();if(n-lastTE<350&&e.cancelable&&e.target!==cv)e.preventDefault();lastTE=n},{passive:false});
const R=Math.random,rr=(a,b)=>a+R()*(b-a),pick=a=>a[(R()*a.length)|0],clamp=(v,a,b)=>v<a?a:v>b?b:v,lerp=(a,b,t)=>a+(b-a)*t,TAU=Math.PI*2;
const ease=t=>t<0?0:t>1?1:1-Math.pow(1-t,3),easeB=t=>{t=clamp(t,0,1);const c=1.70158;return 1+(c+1)*Math.pow(t-1,3)+c*Math.pow(t-1,2)};
let seed=1;const srand=()=>{seed=(seed*16807)%2147483647;return (seed-1)/2147483646},srr=(a,b)=>a+srand()*(b-a),spick=a=>a[(srand()*a.length)|0];
const approach=(v,t,d)=>v<t?Math.min(v+d,t):Math.max(v-d,t);
const dist2=(ax,ay,bx,by)=>(ax-bx)*(ax-bx)+(ay-by)*(ay-by);
// ---------- persistent prefs (all local) ----------
const LS={get(k,d){try{const v=localStorage.getItem('arr_'+k);return v==null?d:JSON.parse(v)}catch(e){return d}},set(k,v){try{localStorage.setItem('arr_'+k,JSON.stringify(v))}catch(e){}}};
const CANOES=[{id:'silver',name:'Silver Canoe',need:'Ready to go!'},{id:'rocket',name:'Rocket Canoe',need:'Clear Willow Bend'},{id:'pirate',name:'Pirate Canoe',need:'Find 3 rubber ducks'},{id:'hotdog',name:'Hot Dog Canoe',need:'Make the turtle happy'}];
let unlockLv=LS.get('unlock',1),bestT=LS.get('best',{}),canoesOwned=LS.get('canoes',['silver']),canoeSel=LS.get('canoe','silver'),ducksFound=LS.get('ducks',[]),steerMode=LS.get('steer2','arrow'),board=LS.get('board',[]),lifeBears=LS.get('bears',0);
if(!canoesOwned.includes(canoeSel))canoeSel='silver';
// ---------- on-screen controls layout (CSS px) ----------
// Landscape: big round paddle buttons on the river banks (side mode) when the bank is wide enough (iPhone),
// otherwise in the bottom corners (iPad 4:3) and the camera keeps Alex, Dad and everything upcoming ABOVE them.
const RIVER_VIEW=440;
function ctl(){if(CTL)return CTL;let c;
  if(!portrait){const k=clamp(SH/390,1,1.7),r=48*k,pad=10*k;const bank=(SW-RIVER_VIEW*SC)/2;
    const side=bank>=Math.max(INS.l,INS.r)+2*r+pad*1.5;
    const y=side?SH*0.62:SH-INS.b*0.6-pad-r;
    c={k,mode:side?'side':'corner',L:{x:INS.l+pad+r,y,r},R:{x:SW-INS.r-pad-r,y,r}}}
  else{const top=OY+VH*SC,bot=SH-INS.b,k=clamp(SW/390,1,1.6),r=Math.min(62*k,(bot-top)*0.38),y=top+(bot-top)*0.5;
    c={k,mode:'below',L:{x:SW*0.26,y,r},R:{x:SW*0.74,y,r},top}}
  c.topL=(Math.min(c.L.y,c.R.y)-c.L.r-OY)/SC;return CTL=c}
// screen-space rectangles (logical units) the buttons occupy: used by the camera + the coverage self-check
function ctlRects(){const c=ctl();return [c.L,c.R].map(b=>({x:(b.x-b.r-OX)/SC,y:(b.y-b.r-OY)/SC,w:2*b.r/SC,h:2*b.r/SC}))}
// ---------- input ----------
// Touches are tracked per Touch.identifier ('t'+id); mouse/pen via Pointer Events ('p'+id).
// iOS can drop a touchend (app switch, notification, Control Center, multitasking gesture), which in Floor Is Lava left
// a finger "held" forever. So every touch event reconciles against e.touches (fingers really on the glass), an empty
// e.touches always clears all touch fingers, and touchcancel / blur / pagehide / visibilitychange clear ALL input.
const inp={l:0,r:0},keys={},ptrs=new Map(),pressQ=[];let lastInp={l:0,r:0},inputGen=0;
const bot={on:false,l:0,r:0};
function zoneFor(px,py){if(portrait&&py<OY+40)return null;return px<SW/2?'l':'r'}
function syncInp(){let l=0,r=0;for(const z of ptrs.values()){if(z==='l')l=1;if(z==='r')r=1}
  const kb=keys.ArrowDown||keys.KeyS||keys.Space;
  inp.l=(l||keys.ArrowLeft||keys.KeyA||kb||bot.l)?1:0;inp.r=(r||keys.ArrowRight||keys.KeyD||kb||bot.r)?1:0;
  if(inp.l&&!lastInp.l)pressQ.push('l');if(inp.r&&!lastInp.r)pressQ.push('r');if(pressQ.length>8)pressQ.splice(0,pressQ.length-8);
  lastInp={l:inp.l,r:inp.r}}
function clearInput(){ptrs.clear();for(const k in keys)keys[k]=0;pressQ.length=0;inputGen++;syncInp()}
const toL=(px,py)=>({x:(px-OX)/SC,y:(py-OY)/SC});
function press(id,cx,cy){const p=toL(cx,cy);
  if(state==='play'&&!paused){if(hudTap(p))return;const z=zoneFor(cx,cy);if(z){ptrs.set(id,z);syncInp();return}}
  uiTap(p)}
function slide(id,cx,cy){const z=ptrs.get(id);if(z!=='l'&&z!=='r')return;const n=zoneFor(cx,cy);if((n==='l'||n==='r')&&n!==z){ptrs.set(id,n);syncInp()}}
function release(id){if(ptrs.delete(id))syncInp()}
function reconcile(e){const live=new Set();for(let i=0;i<e.touches.length;i++)live.add('t'+e.touches[i].identifier);let ch=false;
  for(const k of [...ptrs.keys()])if(k[0]==='t'&&!live.has(k)){ptrs.delete(k);ch=true}if(ch)syncInp()}
const each=(e,fn)=>{for(let i=0;i<e.changedTouches.length;i++){const t=e.changedTouches[i];fn('t'+t.identifier,t.clientX,t.clientY)}};
cv.addEventListener('touchstart',e=>{e.preventDefault();reconcile(e);each(e,press)},{passive:false});
cv.addEventListener('touchmove',e=>{e.preventDefault();reconcile(e);each(e,slide)},{passive:false});
cv.addEventListener('touchend',e=>{e.preventDefault();each(e,release);reconcile(e)},{passive:false});
cv.addEventListener('touchcancel',()=>clearInput());
const isT=e=>e.pointerType==='touch';
cv.addEventListener('pointerdown',e=>{if(isT(e))return;e.preventDefault();try{cv.setPointerCapture(e.pointerId)}catch(_){}press('p'+e.pointerId,e.clientX,e.clientY)},{passive:false});
cv.addEventListener('pointermove',e=>{if(!isT(e))slide('p'+e.pointerId,e.clientX,e.clientY)});
['pointerup','lostpointercapture'].forEach(ev=>addEventListener(ev,e=>{if(!isT(e))release('p'+e.pointerId)}));
addEventListener('pointercancel',()=>clearInput());
addEventListener('blur',clearInput);addEventListener('pagehide',clearInput);
document.addEventListener('visibilitychange',()=>{clearInput();if(document.hidden&&state==='play')paused=true});
addEventListener('contextmenu',e=>e.preventDefault());
const GAMEKEYS=['ArrowLeft','ArrowRight','ArrowDown','ArrowUp','KeyA','KeyD','KeyS','KeyW','Space'];
addEventListener('keydown',e=>{if(GAMEKEYS.includes(e.code))e.preventDefault();if(e.repeat)return;
  if(state!=='play'||paused){if(e.code==='Enter'||e.code==='Space'||e.code==='ArrowUp'||e.code==='KeyW'){uiKey('go');return}}
  if(e.code==='Enter')uiKey('go');if(e.code==='KeyP'||e.code==='Escape')uiKey('pause');if(e.code==='KeyM')toggleMute();
  keys[e.code]=1;syncInp()});
addEventListener('keyup',e=>{keys[e.code]=0;syncInp()});
function toggleMute(){AUD.setMuted(!AUD.muted);AUD.SFX.click()}
let lastSay=-99;function say(k,prio,minGap){if(minGap&&T-lastSay<minGap)return false;const r=AUD.say(k,prio||1);if(r)lastSay=T;return r}
