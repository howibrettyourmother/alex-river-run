// ================= gameplay: paddling physics, hazards, rescues, Dad's dunks, boss =================
let state='title',T=0,stT=0,TS=1,lvI=0,paused=false,camX=0,camY=0,anchor=250,shake=0,parts=[],floats=[],banner=null,card=null;
let tut=null,hearts=3,score=0,acorns=0,stones=0,bearsLv=0,lvTime=0,runTime=0,runFull=false,run=null,boat=null,dad=null,carry=[],checkpoint=null,inv=0,geese=[],poops=[],smear=[],boss=null,flowers=[],flowerCarry=0;
let lvStats=null,endStats=null,clearInfo=null,oopsN=0,saidOnce={},cov={n:0,viol:0,ex:[]},hintT=0;
const MAXH=3,STROKE_REP=0.42,BOW=-38;
function newRun(i){runFull=i===0;run={score:0,bears:0,bearsTotal:0,acorns:0,stones:0,ducks:0,dunks:0,time:0,bonks:0,waves:0,levels:0};startLevel(i)}
function startLevel(i){lvI=i;buildLevel(i);L.stonesTotal=L.obj.filter(o=>o.t==='acorn'&&o.pk).length;const y0=-40;
  boat={x:riverC(y0),y:y0,vx:0,s:0,ang:0,side:-1,ph:1,dph:1,rhythm:0,lastStroke:-9,repT:0,brake:0,duck:0,spin:0,wave:0,cheer:0,turn:0,maxRhythm:0};
  dad={st:'boat',k:'',t:0,x:0,y:0,vx:0,vy:0,soggy:0,hat:1,lean:0,sneeze:0,reach:0,side:1,h:0};
  hearts=MAXH;score=0;acorns=0;stones=0;bearsLv=0;lvTime=0;carry=[];checkpoint={y:y0,x:boat.x};inv=0;geese=[];poops=[];smear=[];boss=null;flowers=[];flowerCarry=0;parts=[];floats=[];banner=null;saidOnce={};oopsN=0;
  lvStats={dunks:0,bonks:0,waves:0,duck:0};camY=boat.y-anchor;camX=boat.x-VW/2;
  state='card';stT=0;paused=false;card={t:0};clearInput();AUD.setTheme(L.D.music);setTimeout(()=>say('l'+(i+1),3),350);hintT=0;tut=i===0?{s:0,t:0,h:0}:null}
function startPlay(){if(state!=='card')return;state='play';stT=0;card=null;clearInput();if(tut)say('tut1',3);else say(lvI===4?'rapids':pick(['go','go2']),2)}
// ---------- particles / floating text ----------
function splash(x,y,n,sp,col){for(let i=0;i<n;i++){const a=rr(0,TAU),s=rr(0.3,1)*sp;parts.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:0,max:rr(0.35,0.8),sz:rr(1.5,3.5),col:col||'rgba(235,250,255,0.9)',k:'drop',g:0})}}
function ring(x,y,r0,r1,dur,col){parts.push({x,y,r0,r1,life:0,max:dur,k:'ring',col:col||'255,255,255'})}
function pop(x,y,col,n){ring(x,y,4,26,0.35,col||'255,240,160');for(let i=0;i<(n||8);i++){const a=i/(n||8)*TAU+R()*0.3,s=rr(60,110);parts.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:0,max:rr(0.3,0.5),sz:2.2,col:'rgba('+(col||'255,240,160')+',1)',k:'spark',g:0})}}
function floatTxt(s,x,y,col,sz){floats.push({s,x,y,col:col||'#fff',sz:sz||16,t:0})}
function showBanner(s,col,dur){banner={s,col:col||'#fff',t:0,dur:dur||2}}
function confetti(n,x,y){for(let i=0;i<n;i++)parts.push({x:x==null?camX+rr(0,VW):x,y:y==null?camY-10:y,vx:rr(-60,60),vy:rr(20,120),life:0,max:rr(2,3.5),sz:rr(3,5),col:pick(['#ff4d6d','#ffd23f','#52d66a','#4fc3f7','#b388ff','#ff8a3d']),k:'conf',rot:rr(0,6),vr:rr(-8,8),g:40})}
function firework(x,y){AUD.SFX.firework();setTimeout(()=>{const c=pick(['#ff4d6d','#ffd23f','#52d66a','#4fc3f7','#b388ff']);for(let i=0;i<30;i++){const a=i/30*TAU,s=rr(80,150);parts.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:0,max:rr(0.8,1.3),sz:2.6,col:i%3?c:'#fff',k:'spark',g:60})}},380)}
// ---------- canoe geometry ----------
function canoeCircles(){const c=Math.cos(boat.ang),s=Math.sin(boat.ang);return [-38,-14,12,36].map(d=>({x:boat.x-d*s,y:boat.y+d*c,r:d<-30||d>30?11:14}))}
function bowPos(){return {x:boat.x+Math.sin(boat.ang)*38,y:boat.y-Math.cos(boat.ang)*38}}
// ---------- paddling ----------
function stroke(btn){const side=steerMode==='arrow'?(btn==='l'?1:-1):(btn==='l'?-1:1);const mul=dad.st==='boat'?1:0.78;const dt=T-boat.lastStroke;
  if(side!==boat.side&&dt>0.1&&dt<0.95)boat.rhythm=Math.min(6,boat.rhythm+1);else if(side===boat.side)boat.rhythm=Math.max(0,boat.rhythm-1);
  boat.side=side;boat.lastStroke=T;boat.ph=0;boat.dph=0.15;boat.maxRhythm=Math.max(boat.maxRhythm,boat.rhythm);
  const smax=(112+boat.rhythm*21)*mul;boat.s=Math.min(smax,boat.s+(26+boat.rhythm*4)*mul);
  boat.vx+=-side*(boat.rhythm>=2?44:64)*(L.D.style==='rapids'?1.15:1);
  AUD.SFX.paddle();const c=Math.cos(boat.ang),sn=Math.sin(boat.ang);splash(boat.x+side*24*c,boat.y-20+side*24*sn,4,40);
  if(boat.rhythm===5&&!boat.brake)say('nice',1,25)}
function stepBoat(dt){const both=inp.l&&inp.r;
  while(pressQ.length){const b=pressQ.shift();if(!(inp.l&&inp.r))stroke(b);boat.repT=STROKE_REP}
  if(both){if(!boat.brake)AUD.SFX.brake();boat.brake=1;boat.s=approach(boat.s,-48,(boat.s>0?260:120)*dt);boat.vx*=Math.exp(-4*dt);boat.rhythm=0}
  else{boat.brake=0;if(inp.l||inp.r){boat.repT-=dt;if(boat.repT<=0){stroke(inp.l?'l':'r');boat.repT=STROKE_REP}}}
  if(T-boat.lastStroke>1.1&&boat.rhythm>0){boat.rhythm--;boat.lastStroke=T-0.6}
  boat.s-=boat.s*0.42*dt;boat.vx*=Math.exp(-1.9*dt);boat.vx=clamp(boat.vx,-160,160);
  boat.ph=Math.min(1,boat.ph+dt/0.45);boat.dph=Math.min(1,boat.dph+dt/0.45);
  if(boat.s>70&&parts.length<380&&R()<dt*boat.s*0.09){const c=Math.cos(boat.ang),sn=Math.sin(boat.ang),sd=R()<0.5?-1:1;parts.push({x:boat.x-sn*-40+sd*10*c,y:boat.y+40*c+sd*10*sn,vx:sd*rr(14,26)*c,vy:rr(10,24),life:0,max:rr(0.5,0.9),sz:rr(1.6,2.6),col:'rgba(235,250,255,0.75)',k:'drop',g:0})}
  const cur=curNow(boat.y);
  boat.y-=(boat.s+cur)*dt;boat.x+=boat.vx*dt;
  // banks (soft bounce, no damage)
  const c=riverC(boat.y),hw=(L.arena&&boat.y<L.arena.y0?L.arena.hw:riverHW(boat.y))-15;
  if(boat.x<c-hw){boat.x=c-hw;if(boat.vx<0)boat.vx=-boat.vx*0.35}if(boat.x>c+hw){boat.x=c+hw;if(boat.vx>0)boat.vx=-boat.vx*0.35}
  if(boss&&boss.st!=='happy'){boat.y=clamp(boat.y,L.arena.y1+165,L.arena.y1+camBase());if(boat.s<0&&boat.y>=L.arena.y1+camBase()-0.5)boat.s=0}
  if(dad.st!=='boat'&&boat.y<L.finishY+60){boat.y=L.finishY+60;boat.s=Math.min(boat.s,0);if(!banner)showBanner('Pick up Dad first!','#ffe14d',1.6)}
  const ta=clamp(Math.atan2(boat.vx,Math.max(70,boat.s+cur))*0.85,-0.5,0.5)+Math.sin(boat.spin*20)*boat.spin*0.6;boat.ang+=(ta-boat.ang)*Math.min(1,dt*8);boat.spin=Math.max(0,boat.spin-dt);
  const br=L.bridges.find(b=>Math.abs(b.y-boat.y)<75);boat.duck=approach(boat.duck,br?1:0,dt*5);
  boat.wave=Math.max(0,boat.wave-dt);boat.cheer=Math.max(0,boat.cheer-dt);boat.turn=approach(boat.turn,boat.wave>0?1:0,dt*6)}
// ---------- collisions ----------
function segDist(px,py,ax,ay,bx,by){const dx=bx-ax,dy=by-ay,l=dx*dx+dy*dy;let t=l?((px-ax)*dx+(py-ay)*dy)/l:0;t=clamp(t,0,1);const qx=ax+dx*t,qy=ay+dy*t;return {d:Math.hypot(px-qx,py-qy),qx,qy}}
function hitTest(o,cs){// returns {nx,ny} push normal or null
  if(o.t==='rock'||o.t==='pillar'||(o.t==='cattail'&&!o.deco)){for(const c of cs){const d=Math.hypot(c.x-o.x,c.y-o.y);if(d<c.r+o.r*0.92)return{nx:(c.x-o.x)/(d||1),ny:(c.y-o.y)/(d||1),pen:c.r+o.r*0.92-d}}}
  else if(o.t==='log'){const ca=Math.cos(o.ang)*o.len/2,sa=Math.sin(o.ang)*o.len/2;for(const c of cs){const s=segDist(c.x,c.y,o.x-ca,o.y-sa,o.x+ca,o.y+sa);if(s.d<c.r+o.r)return{nx:(c.x-s.qx)/(s.d||1),ny:(c.y-s.qy)/(s.d||1),pen:c.r+o.r-s.d}}}
  else if(o.t==='dam'){for(const c of cs){if(Math.abs(c.y-o.y)<o.h/2+c.r&&Math.abs(c.x-o.gx)>o.gw/2-c.r*0.6){const nx=0,ny=c.y>o.y?1:-1;return{nx,ny,pen:o.h/2+c.r-Math.abs(c.y-o.y)}}}}
  return null}
const bonkLog=[];function bonk(nx,ny,why){if(inv>0)return;bonkLog.push(why+'@'+Math.round(-boat.y)+'/lv'+lvI);hearts--;inv=1.7;lvStats.bonks++;run.bonks++;if(lvStats.bonks===1&&lvStats.bonkFree!==0){lvStats.bonkFree=0;floatTxt('No-bonk star lost',boat.x,boat.y+50,'#ffb3b3',11)}boat.s=-40;boat.vx+=nx*110;boat.spin=0.5;shake=0.35;AUD.SFX.bonk();
  const b=bowPos();floatTxt(pick(['BONK!','BOINK!','BONK!','OOF!']),b.x,b.y-20,'#ffe14d',22);splash(b.x,b.y,10,90);
  if(hearts<=0){state='oops';stT=0;oopsN++;AUD.SFX.hurt();say('oops',3);clearInput()}else say(pick(['bonk','bonk2']),2,6)}
function collide(){const cs=canoeCircles();
  for(const o of L.obj){if(o.y>boat.y+140||o.y<boat.y-140&&o.t!=='dam')continue;const h=hitTest(o,cs);if(h){boat.x+=h.nx*(h.pen+1);boat.y+=h.ny*(h.pen+1);if(o.t==='log'){o.x0-=h.nx*4}bonk(h.nx,h.ny,o.t)}}}
// ---------- world objects ----------
function stepObjects(dt){const cs=canoeCircles(),bw=bowPos();
  for(const o of L.obj){if(o.y>boat.y+500||o.y<boat.y-700)continue;
    if(o.t==='log'){o.x=o.x0+Math.sin(T*0.35+o.ph)*o.vx*2.2;o.ang+=Math.sin(T*0.2+o.ph)*0.02*dt}
    else if(o.t==='acorn'&&!o.got){for(const c of cs)if(dist2(c.x,c.y,o.x,o.y)<(c.r+12)**2){o.got=1;if(o.pk){stones++;run.stones++;score+=25;AUD.SFX.acorn();setTimeout(()=>AUD.SFX.acorn(),90);floatTxt('Petoskey stone! +25',o.x,o.y-12,'#e0e0e0',14);pop(o.x,o.y,'230,230,240',10);if(!saidOnce.stone){saidOnce.stone=1;say('stone',1)}}else{acorns++;run.acorns++;score+=10;AUD.SFX.acorn();floatTxt('+10',o.x,o.y-10,'#ffe14d',14);pop(o.x,o.y,'255,225,77',6)}break}}
    else if(o.t==='friend'&&!o.waved){if(Math.abs(o.y-boat.y)<50&&Math.abs(o.x-boat.x)<130){o.waved=T;boat.wave=1.1;score+=25;lvStats.waves++;run.waves++;AUD.SFX.wave();floatTxt('Hi! +25',o.x,o.y-16,'#b2ff59',13);say(o.k,1,9)}}
    else if(o.t==='bear'){if(o.st==='float'){o.ph+=dt;if(dist2(bw.x,bw.y,o.x,o.y)<38*38||dist2(boat.x,boat.y,o.x,o.y)<30*30){o.st='carry';carry.push(o);AUD.SFX.scoop();floatTxt('Scooped!',o.x,o.y-14,'#ffcc80',16);pop(o.x,o.y,'255,180,100',10);
        if(!saidOnce.scoop){saidOnce.scoop=1;say('scoop',2)}else if(!saidOnce.shore&&carry.length>=2){saidOnce.shore=1;say('shore',1)}}}
      else if(o.st==='drop'){o.dt+=dt;const k=ease(o.dt/1.1);o.x=lerp(o.sx,o.tx,k);o.y=lerp(o.sy,o.ty,k)-Math.sin(k*Math.PI)*12;if(o.dt>1.1)o.st='safe'}}
    else if(o.t==='rduck'&&!o.got){if(dist2(bw.x,bw.y,o.x,o.y)<36*36||dist2(boat.x,boat.y,o.x,o.y)<30*30){o.got=1;score+=500;lvStats.duck=1;run.ducks++;if(!ducksFound.includes(lvI)){ducksFound.push(lvI);LS.set('ducks',ducksFound)}
        AUD.SFX.squeak();say('rubber',3);floatTxt('RUBBER DUCK! +500',o.x,o.y-18,'#ffe14d',18);confetti(20,o.x,o.y-20);boat.cheer=1.2;checkUnlocks()}}
    else if(o.t==='fish'){o.tt+=dt;const dy=boat.y-o.y;
      if(o.st==='wait'&&dy>110&&dy<330&&o.jumps<2){o.st='warn';o.tt=0;o.dir=boat.x>o.x?-1:1;ring(o.x,o.y,4,26,0.7)}
      else if(o.st==='warn'&&o.tt>0.75){o.st='jump';o.tt=0;AUD.SFX.fish();splash(o.x-o.dir*70,o.y,8,60)}
      else if(o.st==='jump'){const k=o.tt/1.05;o.fx=o.x-o.dir*70+o.dir*140*k;o.fy=o.y;o.h=Math.sin(k*Math.PI)*42;
        if(o.h<34&&cs.some(c=>dist2(c.x,c.y,o.fx,o.fy)<(c.r+12)**2)){o.st='wait';o.jumps++;splash(o.fx,o.fy,10,80);floatTxt('SLAP!',o.fx,o.fy-20,'#ffcc80',18);bonk(boat.x>o.fx?1:-1,0,'fish')}
        if(k>=1){o.st='wait';o.jumps++;o.tt=0;splash(o.fx,o.fy,8,60);ring(o.fx,o.fy,4,30,0.6);AUD.SFX.fish()}}}
    else if(o.t==='burp'){o.tt+=dt;if(o.tt>2.9){o.tt=0;o.ring=0.001;AUD.SFX.burp();floatTxt('BUUURP!',o.x,o.y-26,'#c5e1a5',16);for(let i=0;i<8;i++)parts.push({x:o.x+rr(-10,10),y:o.y+rr(-6,6),vx:rr(-20,20),vy:rr(-50,-20),life:0,max:rr(0.8,1.4),sz:rr(3,7),k:'bub',g:0});o.hitDone=0;if(Math.abs(o.y-boat.y)<160)say('burp',1,12)}
      if(o.ring){o.ring+=dt;const r=o.ring/0.75*90;if(o.ring>0.75)o.ring=0;else if(!o.hitDone){const d=Math.hypot(boat.x-o.x,boat.y-o.y);if(Math.abs(d-r)<26){o.hitDone=1;const nx=(boat.x-o.x)/(d||1);boat.vx+=nx*150;boat.s*=0.6;shake=0.15;AUD.SFX.boing()}}}}
    else if(o.t==='wave'){if(Math.abs(o.y-boat.y)<22&&Math.abs(o.x-boat.x)<o.w/2+10){boat.vx+=o.push*dt*3;if(R()<dt*20)splash(boat.x+rr(-15,15),boat.y-30,2,50)}}
    else if(o.t==='beaver'){o.ph+=dt;o.x=o.hx+Math.sin(o.ph*0.8)*40}}
  // drop woolly bears on the shore
  if(carry.length){const c=riverC(boat.y),hw=riverHW(boat.y),side=boat.x<c?-1:1;if(Math.abs(boat.x-c)>hw-44&&!inTunnel(boat.y))dropBears(side)}}
function dropBears(side){const c=riverC(boat.y),hw=riverHW(boat.y);carry.forEach((o,i)=>{o.st='drop';o.dt=-i*0.25;o.sx=boat.x;o.sy=boat.y-10;o.tx=c+side*(hw+26+i*14);o.ty=boat.y-14+i*10;o.x=o.sx;o.y=o.sy;o.rot=side>0?0:Math.PI;
  bearsLv++;run.bears++;lifeBears++;score+=100});LS.set('bears',lifeBears);
  const n=carry.length;carry=[];AUD.SFX.drop();pop(boat.x,boat.y-10,'255,204,128',14);confetti(10,boat.x,boat.y-60);setTimeout(()=>AUD.SFX.cheer(),200);boat.cheer=1.4;floatTxt(n>1?n+' WOOLLY BEARS SAVED!':'WOOLLY BEAR SAVED!',boat.x,boat.y-60,'#ffcc80',18);
  showBanner('WOOLLY BEAR HERO '+bearsLv+'/'+L.bearsTotal,'#ffcc80',1.8);say(bearsLv===1?'wb':pick(['wb','wb2','wb3']),3)}
// ---------- geese & goose poop ----------
function stepGeese(dt){for(const g of L.geese){if(!g.done&&boat.y<g.y+200&&dad.st==='boat'&&!inTunnel(boat.y)){g.done=1;spawnGoose(false)}}
  for(const g of geese){g.t+=dt;g.flap+=dt*(g.kind==='hat'?16:12);g.x+=g.vx*dt;g.y+=g.vy*dt;
    if(g.kind==='poop'&&!g.dropped&&g.t>=g.tt){g.dropped=1;poops.push({x:g.x,y:g.y,t:0});AUD.SFX.whoosh()}
    if(g.kind==='hat'){const ds={x:boat.x,y:boat.y+34};if(!g.got){const dx=ds.x-g.x,dy=ds.y-g.y,d=Math.hypot(dx,dy);const sp=260;g.vx=dx/d*sp+boat.vx;g.vy=dy/d*sp-(boat.s+L.cur);if(d<12){g.got=1;dad.hat=0;AUD.SFX.honk();g.vx=g.side*-220;g.vy=-200}}}}
  geese=geese.filter(g=>g.t<6);
  for(const p of poops){p.t+=dt;if(p.t>=0.6&&!p.done){p.done=1;const hit=canoeCircles().some(c=>dist2(c.x,c.y,p.x,p.y)<34*34);
      if(hit){AUD.SFX.splat();boat.s*=0.5;say(pick(['poop','poop2']),2,4);floatTxt('SPLAT!',p.x,p.y-20,'#f0f4c3',22);boat.poop=(boat.poop||0)+1;
        for(let i=0;i<4;i++)smear.push({x:rr(0.15,0.85)*VW,y:rr(0.1,0.6)*VH,s:rr(0.9,1.6),v:i%3,t:0,dr:rr(10,22)})}
      else{splash(p.x,p.y,8,60,'rgba(240,244,220,0.9)');ring(p.x,p.y,4,26,0.6);floatTxt('Missed me!',p.x,p.y-18,'#fff',13)}}}
  poops=poops.filter(p=>p.t<1.5);for(const s of smear)s.t+=dt;smear=smear.filter(s=>s.t<2.6)}
function spawnGoose(hat){const side=R()<0.5?-1:1;const lead=1.35,tx=boat.x+boat.vx*0.6,ty=boat.y-(boat.s+L.cur)*lead;
  const sx=camX+(side<0?-50:VW+50),sy=ty-180;
  if(hat){geese.push({kind:'hat',x:sx,y:boat.y-120,vx:0,vy:0,t:0,flap:0,side});AUD.SFX.honk();return}
  geese.push({kind:'poop',x:sx,y:sy,vx:(tx-sx)/lead,vy:(ty-sy)/lead,tt:lead,t:0,flap:0,tx,ty,side});AUD.SFX.honk()}
// ---------- Dad's funny dunks ----------
function stepDad(dt){dad.t+=dt;const D=dad;
  if(D.st==='boat'){D.lean=approach(D.lean,0,dt*2);D.sneeze=0;D.reach=0;
    if(state==='play'&&!L.arena||state==='play'&&boat.y>L.arena.y0+300)for(const ev of L.dadEv){if(!ev.done&&boat.y<ev.y&&boat.y>L.finishY+450&&!inTunnel(boat.y)&&!L.bridges.some(b=>Math.abs(b.y-boat.y)<260)&&!L.dams.some(d=>d.y<boat.y&&boat.y-d.y<260)){ev.done=1;D.st='wind';D.k=ev.k;D.t=0;D.side=R()<0.5?-1:1;
      if(ev.k==='hat'){spawnGoose(true);say('dadhat',3)}else if(ev.k==='frog'){say('dadfrog',3);const fy=boat.y+10,fx=boat.x+D.side*62;L.obj.push({t:'lily',x:fx,y:fy,r:16,rot:0,fl:1,temp:1});D.frog={x:fx,y:fy,hop:0}}
      else if(ev.k==='turn'){say('dadturn',3);D.side=boat.vx>0?1:-1;if(Math.abs(boat.vx)<20)boat.vx+=D.side*60}else if(ev.k==='sneeze'){say('dadsneeze',3);setTimeout(()=>AUD.SFX.sneeze(),700)}break}}}
  else if(D.st==='wind'){const k=D.k,dur=k==='sneeze'?1.85:k==='hat'?1.7:1.5;
    if(k==='hat'){D.reach=D.t>0.9?1:0;D.lean=D.t>0.9?D.side*0.25:0}else if(k==='frog'){D.reach=D.t>0.5?1:0;D.lean=D.side*Math.min(0.35,D.t*0.3)}
    else if(k==='turn'){D.lean=D.side*Math.min(0.55,D.t*0.45)+Math.sin(D.t*18)*0.08}else if(k==='sneeze'){D.sneeze=D.t>1.2?clamp((D.t-1.2)*3,0,1):0;D.lean=D.t>1.2?D.side*0.3:-0.05*Math.sin(D.t*8)}
    if(D.t>dur){D.st='fly';D.t=0;const b=boat;D.x=b.x+Math.sin(b.ang)*-34;D.y=b.y+34;boat.vx-=D.side*50;shake=0.2;AUD.SFX.whoosh();if(k==='hat')geese.forEach(g=>{if(g.kind==='hat'){g.vx=D.side*240;g.vy=-180}})}}
  else if(D.st==='fly'){// lands AHEAD of and beside the canoe (target follows the canoe so he never ends up behind it)
    const k=Math.min(1,D.t/0.6);D.h=Math.sin(k*Math.PI)*40;const p=dadSpot(D.side);D.tx=p.x;D.ty=p.y;const fx=lerp(D.x,D.tx,ease(k)),fy=lerp(D.y,D.ty,ease(k));D.fx=fx;D.fy=fy;
    if(k>=1){D.st='water';D.t=0;D.x=D.tx;D.y=D.ty;D.ph=R()*6;D.soggy=Math.min(3,D.soggy+1);lvStats.dunks++;run.dunks++;AUD.SFX.splash();shake=0.4;splash(D.x,D.y,26,140);ring(D.x,D.y,6,50,0.8);ring(D.x,D.y,6,80,1.1);
      floatTxt('SPLOOSH!',D.x,D.y-30,'#e1f5fe',24);setTimeout(()=>{if(dad.st==='water')say('dadhelp',2)},900);if(D.frog)D.frog.hop=1}}
  else if(D.st==='water'){if(R()<dt*2)AUD.SFX.sputter();const cur=curNow(D.y);D.ph+=dt;
    // drift gently with the (slowed) current, bobbing side to side; stay on screen ahead of / beside the canoe, never behind it
    D.y-=cur*dt;D.x+=Math.sin(D.ph*1.3)*14*dt;const ahead=boat.y-D.y,maxA=Math.min(300,camBase()-70);
    if(ahead<25)D.y=approach(D.y,boat.y-25,Math.max(60,boat.s+40)*dt);else if(ahead>maxA)D.y=approach(D.y,boat.y-maxA,(ahead-maxA+40)*dt*2);
    if(L.arena&&boat.y<L.arena.y0+200)D.y=Math.max(D.y,L.arena.y1+70);
    // after ~10s Dad doggy-paddles over and grabs the canoe himself (never a softlock)
    if(D.t>10){if(!D.self){D.self=1;say('dadswim',3);floatTxt('Doggy paddle!',D.x,D.y-26,'#fff',14)}const dx=boat.x-D.x,dy=boat.y-D.y,d=Math.hypot(dx,dy)||1;D.x+=dx/d*150*dt;D.y+=dy/d*150*dt}
    const c=riverC(D.y),hw=(L.arena&&D.y<L.arena.y0?L.arena.hw:riverHW(D.y))-16;D.x=clamp(D.x,c-hw,c+hw);
    if(canoeCircles().some(q=>dist2(q.x,q.y,D.x,D.y)<(q.r+DAD_GRAB)**2)){D.st='climb';D.t=0;D.cx=D.x;D.cy=D.y;AUD.SFX.scoop();if(!D.self){score+=50;floatTxt('GOT DAD! +50',D.x,D.y-24,'#b2ff59',16);say('gotdad',2)}else floatTxt('Dad grabbed on!',D.x,D.y-24,'#b2ff59',15);D.self=0;boat.s*=0.4}}
  else if(D.st==='climb'){if(D.t>0.75){D.st='boat';D.t=0;D.lean=0;boat.cheer=0.8;const ln=D.soggy===2?'dadfish':D.soggy===3?'dadpad':'dadsaved';setTimeout(()=>say(ln,2),1300);splash(boat.x,boat.y+30,10,50,'rgba(150,200,255,0.9)')}}
  if(D.frog&&D.frog.hop){D.frog.hop+=dt;if(D.frog.hop>2.2)D.frog=null}
  if(D.soggy&&D.st==='boat'&&R()<dt*D.soggy*3)parts.push({x:boat.x+rr(-6,6),y:boat.y+30+rr(-4,4),vx:0,vy:rr(10,30),life:0,max:0.5,sz:1.8,col:'rgba(120,180,255,0.9)',k:'drop',g:60})}
function dadOut(){return dad.st==='water'||dad.st==='fly'}
const DAD_GRAB=40;// generous pickup radius around the canoe
function dadSpot(side){const c=riverC(boat.y-110),hw=riverHW(boat.y-110)-30;return {x:clamp(boat.x+side*72,c-hw,c+hw),y:boat.y-110}}
// current is halved while Dad is swimming so the rescue is calm even in the rapids
function curNow(y){return (L.arena&&y<L.arena.y0+60?0:L.cur)*(dadOut()?0.5:1)}
// ---------- checkpoints / tunnels / finish ----------
function stepMarkers(dt){for(const c of L.checks)if(!c.hit&&boat.y<c.y){c.hit=1;checkpoint={y:c.y-20,x:c.x};AUD.SFX.check();say('check',2);showBanner('CHECKPOINT!','#ff8a80',1.5);if(hearts<MAXH){hearts=MAXH;floatTxt('Hearts refilled!',boat.x,boat.y-60,'#ff8a80',14)}}
  const tn=inTunnel(boat.y-60);if(tn&&!tn.said){tn.said=1;say('tunnel',2)}
  for(const b of L.bridges)if(!b.said&&boat.y-b.y<230&&boat.y>b.y){b.said=1;say('duck',2)}
  for(const d of L.dams)if(!d.said&&boat.y-d.y<300&&boat.y>d.y){d.said=1;if(!saidOnce.dam){saidOnce.dam=1;say('dam',2)}}
  if(!L.D.boss&&boat.y<L.finishY&&dad.st==='wind'){dad.st='boat';dad.t=0}
  if(!L.D.boss&&boat.y<L.finishY&&dad.st==='boat')levelClear();
  if(L.D.boss&&!boss&&boat.y<L.arena.y0-20)startBoss();
  hintT+=dt;if(tut)stepTut(dt)}
// ---------- first-30-seconds tutorial (level 1): paddle rhythm -> steer -> scoop a woolly bear -> drop it ashore ----------
function stepTut(dt){const t=tut;t.t+=dt;
  if(t.s===0){if(t.t>9&&t.t-dt<=9)say('tut1',2);if(boat.maxRhythm>=3){t.s=1;t.t=0;AUD.SFX.check();say('tut2',3)}}
  else if(t.s===1){if((inp.l^inp.r)&&!bot.on)t.h+=dt;else if(bot.on)t.h+=dt*0.5;if(t.h>0.6||t.t>9){t.s=2;t.t=0;AUD.SFX.check()}}
  else if(t.s===2){const b=tutBear();if(b&&!t.said&&boat.y-b.y<420){t.said=1;say('tut3',3)}if(carry.length){t.s=3;t.t=0}}
  else if(t.s===3){if(t.t>0.3&&!t.said3){t.said3=1;say('shore',3)}if(bearsLv>=1){t.s=4;t.t=0;setTimeout(()=>say('tut4',2),2600)}}
  else if(t.s===4&&t.t>5.5){tut=null;setTimeout(()=>{if(state==='play'&&lvI===0)say('michigan',1)},1500)}}
function tutBear(){let best=null;for(const o of L.obj)if(o.t==='bear'&&o.st==='float'&&o.y<boat.y+20&&(!best||o.y>best.y))best=o;return best}
function respawn(){const cp=checkpoint;boat.x=cp.x;boat.y=cp.y;boat.s=0;boat.vx=0;boat.ang=0;boat.rhythm=0;hearts=MAXH;inv=2.5;geese=[];poops=[];smear=[];
  if(dad.st!=='boat'){dad.st='boat';dad.t=0}dad.lean=0;dad.reach=0;dad.sneeze=0;for(const o of L.obj)if(o.t==='fish'){o.st='wait';o.jumps=0}
  if(boss&&boss.st!=='happy'){boss.st='idle';boss.t=0;boss.hx=boss.x;boss.hy=boss.y+70}state='play';stT=0;clearInput()}
// ---------- boss: the giant grumpy snapping turtle ----------
function startBoss(){const A=L.arena;checkpoint={y:A.y1+camBase()-20,x:A.c};boss={x:A.c,y:A.y1+52,st:'intro',t:0,mood:0,hx:A.c,hy:A.y1+180,tx:0,ty:0,snaps:0,dbl:0};AUD.setTheme('boss');AUD.SFX.grumble();say('boss',3);setTimeout(()=>say('bosstip',3),3200);spawnFlower();spawnFlower()}
// he aims at where the canoe's bow is RIGHT NOW and shows a red target ring, so a quick paddle sideways always dodges
function aimBoss(b,neck){const bw=bowPos();b.tx=bw.x;b.ty=bw.y+8;const dx=b.tx-neck.x,dy=b.ty-neck.y,d=Math.hypot(dx,dy),mx=300;if(d>mx){b.tx=neck.x+dx/d*mx;b.ty=neck.y+dy/d*mx}}
function spawnFlower(){const A=L.arena;let x,y,tries=0;do{x=A.c+rr(-A.hw+40,A.hw-40);y=rr(A.y1+190,A.y1+camBase()-10);tries++}while(tries<20&&dist2(x,y,boat.x,boat.y)<120*120);flowers.push({x,y,t:0})}
function stepBoss(dt){const b=boss;if(!b)return;b.t+=dt;const A=L.arena,neck={x:b.x,y:b.y+62*BS},bw=bowPos();
  for(const f of flowers){f.t+=dt;if(!flowerCarry&&dist2(bw.x,bw.y,f.x,f.y)<34*34||!flowerCarry&&dist2(boat.x,boat.y,f.x,f.y)<26*26){f.got=1;flowerCarry=1;AUD.SFX.scoop();floatTxt('Flower!',f.x,f.y-14,'#ff9bd0',15)}}
  flowers=flowers.filter(f=>!f.got);if(flowers.length<(flowerCarry?1:2)&&b.st!=='happy')spawnFlower();
  const toward=(tx,ty,k)=>{b.hx+=(tx-b.hx)*Math.min(1,dt*k);b.hy+=(ty-b.hy)*Math.min(1,dt*k)};
  const sp=1+b.mood*0.22;
  if(b.st==='intro'){toward(neck.x,neck.y+16,4);if(b.t>3.6){b.st='idle';b.t=0}}
  else if(b.st==='idle'){b.x+=clamp(boat.x-b.x,-1,1)*(28+b.mood*14)*dt;b.x=clamp(b.x,A.c-A.hw+70,A.c+A.hw-70);toward(neck.x+(boat.x-b.x)*0.15,neck.y+16,5);
    if(b.t>(2.0-b.mood*0.45)){b.st='warn';b.t=0;AUD.SFX.grumble();aimBoss(b,neck)}}
  else if(b.st==='warn'){toward(neck.x+Math.sin(b.t*40)*3,neck.y+8,8);if(b.t>0.95/sp){b.st='lunge';b.t=0;b.sx=b.hx;b.sy=b.hy}}
  else if(b.st==='lunge'){const k=Math.min(1,b.t/(0.36/sp));b.hx=lerp(b.sx,b.tx,ease(k));b.hy=lerp(b.sy,b.ty,ease(k));
    if(canoeCircles().some(c=>dist2(c.x,c.y,b.hx,b.hy)<(c.r+18)**2)){AUD.SFX.snap();b.st='retract';b.t=0;const nx=boat.x>b.hx?1:-1;bonk(nx,1,'boss');boat.y+=20}
    else if(k>=1){AUD.SFX.snap();splash(b.hx,b.hy,12,80);ring(b.hx,b.hy,6,40,0.6);b.snaps++;
      if(b.mood>=1&&!b.dbl){b.dbl=1;b.st='warn';b.t=0.95/sp*0.35;aimBoss(b,neck)}else{b.dbl=0;b.st='dizzy';b.t=0;floatTxt('MISSED! He\'s dizzy!',b.hx,b.hy-30,'#ffe14d',15)}}}
  else if(b.st==='dizzy'){if(flowerCarry&&(dist2(bw.x,bw.y,b.hx,b.hy)<46*46||dist2(boat.x,boat.y,b.hx,b.hy)<40*40)){flowerCarry=0;b.mood++;AUD.SFX.yum();score+=300;
      for(let i=0;i<10;i++)parts.push({x:b.hx,y:b.hy,vx:rr(-60,60),vy:rr(-90,-30),life:0,max:1.2,sz:5,col:'#ff6fb5',k:'heart',g:20});
      if(b.mood>=3){b.st='happy';b.t=0;AUD.SFX.fanfare();setTimeout(()=>say('happy',3),400);state='bosswin';stT=0;clearInput()}else{say(b.mood===2?'yum2':'yum',3);floatTxt('YUM! '+'\u2665'.repeat(b.mood),b.hx,b.hy-30,'#ff9bd0',20);b.st='retract';b.t=0}}
    else if(b.t>2.8/Math.sqrt(sp)){b.st='retract';b.t=0}}
  else if(b.st==='retract'){toward(neck.x,neck.y+16,5);if(b.t>0.7){b.st='idle';b.t=0}}
  else if(b.st==='happy'){toward(neck.x,neck.y+20,3)}
  // turtle body is solid
  if(b.st!=='happy'){const cs=canoeCircles();for(const c of cs){const d=Math.hypot(c.x-b.x,c.y-b.y);if(d<c.r+64){const nx=(c.x-b.x)/d,ny=(c.y-b.y)/d;boat.x+=nx*(c.r+64-d);boat.y+=ny*(c.r+64-d);bonk(nx,ny,'shell');break}}}}
