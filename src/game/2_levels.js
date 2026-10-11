// ================= levels: river geometry + procedural (seeded) layout =================
// World: canoe paddles "up" the screen (y decreases). y=0 start, finish at y=-len.
// A real fall trip down the Huron River: Proud Lake Recreation Area -> marshes -> beaver backwater -> the bridges and a stone tunnel ->
// downtown Milford (Central Park on the Mill Pond). Level 5's fast water is make-believe (the real river here is gentle).
const LEVELS=[
  {key:'proud',name:'Proud Lake',sub:'Proud Lake Recreation Area, Michigan',music:'willow',len:7200,cur:32,hw:170,amp:105,wl:2500,seed:23,
   water:'#3f7a6a',water2:'#6aa58c',bank:'#6f9a48',edge:'#7a6040',style:'willow',
   tunnels:[],bridges:[0.62],dams:[],dad:[[0.22,'hat'],[0.5,'turn'],[0.8,'sneeze']],
   w:{rocks:2,log:3,fish:1,burp:0,cattail:0,wave:0},geese:[0.36,0.82],bears:6,step:[118,180],gap:118},
  {key:'marsh',name:'Huron River Marsh',sub:'Cattails & tree-lined banks below Proud Lake',music:'marsh',len:7600,cur:30,hw:190,amp:80,wl:2800,seed:37,
   water:'#4a6f5c',water2:'#7b9b6f',bank:'#9a8f4a',edge:'#6d5a32',style:'marsh',
   tunnels:[],bridges:[0.45],dams:[],dad:[[0.22,'frog'],[0.52,'sneeze'],[0.8,'frog']],
   w:{rocks:1,log:2,fish:2,burp:3,cattail:3,wave:0},geese:[0.33,0.66,0.9],bears:8,step:[112,168],gap:112},
  {key:'pond',name:'Beaver Backwater',sub:'Busy Michigan beavers! Find the gaps',music:'pond',len:8000,cur:22,hw:200,amp:60,wl:3000,seed:41,
   water:'#356f86',water2:'#5d98ad',bank:'#5f8a44',edge:'#6b5232',style:'pond',
   tunnels:[],bridges:[],dams:[0.16,0.36,0.5,0.78,0.92],dad:[[0.24,'hat'],[0.44,'turn'],[0.7,'sneeze']],
   w:{rocks:2,log:5,fish:2,burp:2,cattail:1,wave:0},geese:[0.3,0.64,0.85],bears:8,step:[108,165],gap:106},
  {key:'canal',name:'Bridges into Milford',sub:'Five bridges & a dark stone tunnel',music:'canal',len:7600,cur:38,hw:168,amp:26,wl:2600,seed:11,
   water:'#3d7f8f',water2:'#5aa3ad',bank:'#7f9a52',edge:'#8d8a84',style:'canal',
   tunnels:[[0.25,700],[0.64,760]],bridges:[0.1,0.42,0.52,0.82,0.92],dams:[],dad:[[0.17,'hat'],[0.56,'sneeze'],[0.76,'frog']],
   w:{rocks:3,log:3,fish:2,burp:1,cattail:0,wave:0},geese:[0.36,0.88],bears:7,step:[112,172],gap:114},
  {key:'rapids',name:'Mill Pond Rush',sub:'Make-believe fast water to the Milford Mill Pond!',music:'rapids',len:7000,cur:80,hw:160,amp:85,wl:1900,seed:53,
   water:'#2f6f93',water2:'#7fc2d8',bank:'#5b7c45',edge:'#6f6f6f',style:'rapids',
   tunnels:[],bridges:[0.4],dams:[],dad:[[0.3,'turn'],[0.66,'hat']],
   w:{rocks:5,log:2,fish:2,burp:0,cattail:0,wave:4},geese:[0.5],bears:7,step:[96,145],gap:112,boss:true}
];
const ARENA_LEN=360,ARENA_HW=215,BS=0.72;
let L=null;
function riverC(y){const s=L.samp,f=clamp(-y/50,0,s.c.length-1.001),i=f|0,t=f-i;return s.c[i]+(s.c[i+1]-s.c[i])*t}
function riverHW(y){const s=L.samp,f=clamp(-y/50,0,s.c.length-1.001),i=f|0,t=f-i;return s.h[i]+(s.h[i+1]-s.h[i])*t}
function inTunnel(y){for(const t of L.tunnels)if(y<=t.y0&&y>=t.y1)return t;return null}
function buildLevel(i){const D=LEVELS[i];seed=D.seed*7919+13;const len=D.len,end=D.boss?len+ARENA_LEN+500:len+700;
  L={D,i,len,cur:D.cur,obj:[],deco:[],tunnels:[],bridges:[],dams:[],checks:[],dadEv:[],geese:[],bearsTotal:0,finishY:-len,samp:{c:[],h:[]},arena:null};
  // river centre-line & width samples every 50px
  const ph=srr(0,TAU);
  for(let d=0;d<=end+400;d+=50){const y=-d;let c=Math.sin(d/D.wl*TAU+ph)*D.amp+Math.sin(d/D.wl*TAU*2.3+1.7)*D.amp*0.25,h=D.hw+Math.sin(d/700+ph)*10;
    if(d<500){c*=d/500}
    if(D.style==='canal')h=D.hw;
    if(D.style==='rapids'&&d>len-150){const k=clamp((d-len+150)/300,0,1);h=lerp(h,ARENA_HW,ease(k));c=lerp(c,0,ease(k))}
    L.samp.c.push(c);L.samp.h.push(h)}
  // fix c: start straight (canoe starts at x=riverC(0))
  const reserved=[[-200,-560]];const resv=(y0,y1)=>reserved.push([y0,y1]);const free=(y,m)=>!reserved.some(r=>y<=r[0]+(m||0)&&y>=r[1]-(m||0));
  for(const [f,tl] of D.tunnels){const y0=-len*f;L.tunnels.push({y0,y1:y0-tl});resv(y0+160,y0-90);resv(y0-tl+80,y0-tl-120)}
  for(const f of D.bridges){const y=-len*f;L.bridges.push({y,h:46});resv(y+150,y-120);
    // pillars: split the river in 3 lanes
    const c=riverC(y),hw=riverHW(y);for(const k of [-0.36,0.36])L.obj.push({t:'pillar',x:c+hw*k,y:y-20,r:15,fixed:1})}
  for(const f of D.dams){const y=-len*f,c=riverC(y),hw=riverHW(y);const gw=D.gap+18,gx=c+srr(-hw+gw/2+30,hw-gw/2-30);
    const dm={t:'dam',y,x0:c-hw-30,x1:c+hw+30,gx,gw,h:26};L.dams.push(dm);L.obj.push(dm);resv(y+170,y-130);
    L.obj.push({t:'beaver',x:gx,y:y+40,ph:srand()*TAU,hx:gx})}
  for(const f of D.geese)L.geese.push({y:-len*f,done:0});
  L.checks=[1/3,2/3].map(f=>{let y=-len*f;while(!free(y,60))y-=80;resv(y+60,y-60);return {y,x:riverC(y),hit:0}});
  for(const [f,k] of D.dad){let y=-len*f;while(inTunnel(y)||inTunnel(y-500))y-=120;L.dadEv.push({y,k,done:0})}
  // ---- obstacle rows ----
  const W=D.w,wsum=Object.values(W).reduce((a,b)=>a+b,0);
  const blockers=[];// circles {x,y,r} used to keep pickups clear
  const addRock=(x,y,r)=>{L.obj.push({t:'rock',x,y,r});blockers.push({x,y,r})};
  let y=-620;const lastY=D.boss?-len+120:-len+260;
  while(y>lastY){const prog=-y/len,step=srr(D.step[0],D.step[1])*(1.15-prog*0.3);y-=step;if(!free(y,20))continue;
    const c=riverC(y),hw=riverHW(y);let r=srand()*wsum,kind='rocks';for(const k in W){r-=W[k];if(r<=0){kind=k;break}}
    const gw=D.gap*(1.12-prog*0.18),gx=c+srr(-hw+gw/2+14,hw-gw/2-14);// guaranteed gap centre
    if(kind==='rocks'||kind==='wave'&&srand()<0.5){const n=1+((srand()*(D.style==='rapids'?3.2:2.4))|0)+(prog>0.55?1:0);
      for(let k=0;k<n;k++){const rx=c+srr(-hw+10,hw-10),rad=srr(12,22);if(Math.abs(rx-gx)<gw/2+rad)continue;addRock(rx,y+srr(-24,24),rad)}}
    else if(kind==='log'){const ln=srr(90,150),side=gx>c?-1:1,lx=c+side*srr(hw*0.2,hw*0.55);
      const lg={t:'log',x:lx,y,len:ln,ang:srr(-0.5,0.5),r:10,vx:srr(6,16)*(srand()<0.5?-1:1),ph:srand()*TAU,x0:lx};L.obj.push(lg);blockers.push({x:lx,y,r:ln/2});
      if(srand()<0.35&&D.style!=='rapids')L.obj.push({t:'friend',k:'turtle',on:lg,x:lx,y,waved:0})}
    else if(kind==='fish'){L.obj.push({t:'fish',x:c+srr(-hw*0.5,hw*0.5),y,st:'wait',tt:0,dir:srand()<0.5?-1:1,jumps:0});y-=40}
    else if(kind==='burp'){const bx=c+srr(-hw*0.55,hw*0.55);L.obj.push({t:'burp',x:bx,y,tt:srr(0,2),ring:0,rr:0});blockers.push({x:bx,y,r:30})}
    else if(kind==='cattail'){const side=srand()<0.5?-1:1,cx=c+side*(hw-26);L.obj.push({t:'cattail',x:cx,y,r:26});blockers.push({x:cx,y,r:30})}
    else if(kind==='wave'){const wx=c+srr(-hw*0.6,hw*0.6);L.obj.push({t:'wave',x:wx,y,w:srr(60,110),push:srr(-60,60)});
      if(srand()<0.6){const rad=srr(13,20),rx=c+srr(-hw+12,hw-12);if(Math.abs(rx-gx)>gw/2+rad)addRock(rx,y-50,rad)}}
    // acorn trail through the gap
    if(srand()<0.5){const pk=srand()<0.3;for(let k=0;k<3;k++)L.obj.push({t:'acorn',x:gx+Math.sin(k)*8,y:y+50-k*34,pk:pk&&k===1?1:0})}}
  L.removed=ensurePassable(D);
  // marsh lily pads (decor, can hold frogs)
  if(D.style==='marsh'||D.style==='pond'||D.style==='willow'){for(let d=600;d<len;d+=srr(70,160)){const yy=-d,c=riverC(yy),hw=riverHW(yy),side=srand()<0.5?-1:1;
    const lx=c+side*(hw-srr(14,50));if(blockers.some(b=>dist2(b.x,b.y,lx,yy)<(b.r+30)**2))continue;L.obj.push({t:'lily',x:lx,y:yy,r:srr(12,20),rot:srand()*TAU,fl:srand()<0.25})}}
  // friends: frogs on lily pads / turtles on bank rocks
  let lilies=L.obj.filter(o=>o.t==='lily');for(let k=0;k<lilies.length;k+=4)L.obj.push({t:'friend',k:'frog',on:lilies[k],x:lilies[k].x,y:lilies[k].y,waved:0});
  for(let d=900;d<len-300;d+=srr(900,1400)){const yy=-d;if(!free(yy,0))continue;const c=riverC(yy),hw=riverHW(yy),side=srand()<0.5?-1:1;L.obj.push({t:'friend',k:srand()<0.5?'turtle':'frog',x:c+side*(hw-8),y:yy,waved:0,bank:side})}
  // woolly bears on floating leaves / sticks: spread evenly in open water
  const nb=D.bears;for(let k=0;k<nb;k++){let tries=0,bx,by;
    do{by=-len*(0.08+0.86*(k+srand()*0.6)/nb);const c=riverC(by),hw=riverHW(by);bx=c+srr(-hw*0.7,hw*0.7);tries++}
    while(tries<40&&(inTunnel(by)||blockers.some(b=>dist2(b.x,b.y,bx,by)<(b.r+52)**2)||L.dams.some(d=>Math.abs(d.y-by)<70)||L.bridges.some(b=>Math.abs(b.y-by)<80)));
    L.obj.push({t:'bear',x:bx,y:by,raft:srand()<0.65?'leaf':'stick',ph:srand()*TAU,st:'float',rot:srr(-0.6,0.6),col:spick(['#f2b631','#ef7d22','#e2552a','#f4cf3a'])});L.bearsTotal++}
  // hidden rubber duck: tucked against a bank (under a willow / behind cattails / near the dam / tunnel nook)
  {let dy=-len*({canal:0.29,proud:0.43,marsh:0.6,pond:0.88,rapids:0.56}[D.key]);if(D.key==='canal')dy=L.tunnels[0].y0-300;
    const c=riverC(dy),hw=riverHW(dy),side=D.key==='marsh'||D.key==='pond'?1:-1;L.obj.push({t:'rduck',x:c+side*(hw-16),y:dy,got:0});
    if(D.key==='marsh')L.obj.push({t:'cattail',x:c+side*(hw-4),y:dy+46,r:22,deco:1})}
  // bank decoration (trees, willows, lamps, houses, reeds)
  for(const side of [-1,1])for(let d=-200;d<end+300;d+=srr(36,70)){const yy=-d,c=riverC(yy),hw=riverHW(yy);const off=srr(16,230),x=c+side*(hw+off);
    let k;const s=D.style,q=srand();
    if(s==='canal')k=off<40?(q<0.5?'lamp':'bench'):q<0.35?'house':q<0.7?'tree':'bush';
    else if(s==='willow')k=off<60&&q<0.55?'willow':q<0.75?'tree':'bush';
    else if(s==='marsh')k=off<50?(q<0.6?'reeds':'bush'):q<0.6?'tree':'reeds';
    else if(s==='pond')k=q<0.45?'pine':q<0.75?'tree':off<50?'reeds':'bush';
    else k=q<0.5?'pine':q<0.75?'boulder':'tree';
    if(k==='willow'){L.deco.push({k,x:c+side*(hw+srr(4,26)),y:yy,side,s:srr(0.9,1.2),v:(srand()*4)|0})}
    else L.deco.push({k,x,y:yy,side,s:srr(0.75,1.25),v:(srand()*6)|0})}
  if(D.style==='pond')L.deco.push({k:'lodge',x:riverC(-len*0.52)+riverHW(-len*0.52)+70,y:-len*0.52,s:1,v:0,side:1});
  // Michigan wildlife & touches on the banks
  {const S=D.style,c0=riverC(-150),h0=riverHW(-150);const mx=c0-h0-48;L.deco=L.deco.filter(d=>dist2(d.x,d.y,mx,-150)>95*95);L.deco.push({k:'mitten',x:mx,y:-150,s:1,v:0,side:-1});
    const put=(k,n,off0,off1,f0,f1)=>{for(let i=0;i<n;i++){const yy=-len*srr(f0+(f1-f0)*i/n,f0+(f1-f0)*(i+0.8)/n);if(inTunnel(yy))continue;const side=srand()<0.5?-1:1,c=riverC(yy),hw=riverHW(yy);L.deco.push({k,x:c+side*(hw+srr(off0,off1)),y:yy,s:1,v:(srand()*3)|0,side,f:side<0?1:-1})}};
    if(S==='willow'||S==='marsh'){put('heron',3,-6,8,0.1,0.95);put('crane',2,60,150,0.15,0.9)}
    if(S==='willow'||S==='pond'||S==='rapids')put('deer',2,50,140,0.1,0.9);
    if(S==='pond'||S==='rapids'||S==='willow')put('cabin',S==='willow'?1:3,120,200,0.1,0.9);
    if(D.boss){const ya=-len-80-ARENA_LEN-60,ca=riverC(ya);L.deco.push({k:'sign',t1:'WELCOME TO',t2:'MILFORD',x:ca-ARENA_HW-80,y:ya,s:1,v:0,side:-1});L.deco.push({k:'sign',t1:'MILFORD',t2:'CENTRAL PARK',x:ca+ARENA_HW+80,y:ya-40,s:1,v:0,side:1})}}
  L.deco.sort((a,b)=>b.y-a.y);
  // floating fall leaves (decor)
  L.leaves=[];for(let k=0;k<60;k++)L.leaves.push({x:srr(-200,200),y:srr(0,-len),rot:srand()*TAU,vr:srr(-0.3,0.3),c:(srand()*5)|0,s:srr(0.6,1.1)});
  if(D.boss){const ay=-len-80;L.arena={y0:ay,y1:ay-ARENA_LEN,c:0,hw:ARENA_HW};L.finishY=ay-ARENA_LEN-300}
  // keep pickups away from the bridge deck & tunnel walls
  L.obj=L.obj.filter(o=>!(o.t==='acorn'&&(L.bridges.some(b=>Math.abs(b.y-o.y)<60)||blockers.some(b=>dist2(b.x,b.y,o.x,o.y)<(b.r+16)**2))));
  return L}
// Guarantee a path: sweep down the river tracking the set of x positions a canoe (radius ~17) can reach, allowing a
// limited sideways drift per step. If the reachable set ever vanishes, delete the widest movable blocker there and retry.
function blockSpans(y,pad){const sp=[];for(const o of L.obj){if(o.t==='rock'||o.t==='pillar'||o.t==='cattail'&&!o.deco){const dy=Math.abs(o.y-y),r=o.r+pad;if(dy<r){const hw=Math.sqrt(r*r-dy*dy);sp.push([o.x-hw,o.x+hw,o])}}
    else if(o.t==='log'){const ca=Math.cos(o.ang)*o.len/2,sa=Math.sin(o.ang)*o.len/2,sw=Math.abs(o.vx)*2.2;const y0=Math.min(o.y-sa,o.y+sa)-o.r-pad,y1=Math.max(o.y-sa,o.y+sa)+o.r+pad;if(y<y0||y>y1)continue;
      const t=Math.abs(sa)<1?0.5:clamp((y-(o.y-sa))/(2*sa),0,1),cx=o.x-ca+2*ca*t,w=(Math.abs(sa)<1?Math.abs(ca):(o.r+pad)/Math.max(0.3,Math.abs(Math.sin(o.ang))))+o.r+pad;sp.push([cx-w-sw,cx+w+sw,o])}
    else if(o.t==='dam'&&Math.abs(o.y-y)<o.h/2+pad){sp.push([-1e5,o.gx-o.gw/2+pad,o]);sp.push([o.gx+o.gw/2-pad,1e5,o])}}return sp}
function ensurePassable(D){const pad=17,end=D.boss?-D.len-60:-D.len;let guard=0;
  for(;guard<80;guard++){let lo=riverC(-100)-20,hi=riverC(-100)+20,fail=null;
    for(let y=-100;y>end;y-=8){const c=riverC(y),hw=riverHW(y)-pad;const spans=blockSpans(y,pad);
      // free intervals across the river
      let free=[[c-hw,c+hw]];for(const [a,b] of spans){const nf=[];for(const [p,q] of free){if(b<=p||a>=q){nf.push([p,q]);continue}if(a>p)nf.push([p,a]);if(b<q)nf.push([b,q])}free=nf}
      const slack=5;const reach=free.filter(([p,q])=>q>lo-slack&&p<hi+slack);
      if(!reach.length){fail={y,spans};break}
      lo=Math.max(Math.min(...reach.map(r=>r[0])),-1e9);hi=Math.min(Math.max(...reach.map(r=>r[1])),1e9);
      // keep a contiguous estimate: widest reachable interval
      const w=reach.reduce((a,b)=>(b[1]-b[0])>(a[1]-a[0])?b:a);lo=w[0];hi=w[1];if(reach.length>1){lo=Math.min(...reach.map(r=>r[0]));hi=Math.max(...reach.map(r=>r[1]))}}
    if(!fail)return guard;
    const mov=fail.spans.filter(s=>s[2].t==='rock'||s[2].t==='log'||s[2].t==='cattail');if(!mov.length){console.warn('unpassable at',fail.y);return -1}
    const victim=mov.reduce((a,b)=>(b[1]-b[0])>(a[1]-a[0])?b:a)[2];L.obj.splice(L.obj.indexOf(victim),1)}
  return guard}
