// ================= UI: HUD, controls, screens, flow, main loop =================
let UI=[],HUDB=[],fwT=0,newUnlocks=[],titleMsg=null;
const insL=()=>INS.l/SC,insR=()=>INS.r/SC;
function btn(id,x,y,w,h){UI.push({id,x,y,w,h})}
function bigBtn(id,label,cx,cy,w,h,c1,c2,sz){rrect(cx-w/2,cy-h/2+4,w,h,h/2);X.fillStyle='rgba(0,0,0,0.25)';X.fill();rrect(cx-w/2,cy-h/2,w,h,h/2);const g=X.createLinearGradient(0,cy-h/2,0,cy+h/2);g.addColorStop(0,c1);g.addColorStop(1,c2);X.fillStyle=g;X.fill();X.strokeStyle='#fff';X.lineWidth=3;X.stroke();
  txt(label,cx,cy+1,sz||Math.round(h*0.42),'#fff',{sw:Math.max(3,h*0.09)});btn(id,cx-w/2,cy-h/2,w,h)}
function panel(w,h,y,c){const x=VW/2-w/2;rrect(x,y+6,w,h,22);X.fillStyle='rgba(0,20,30,0.35)';X.fill();rrect(x,y,w,h,22);const g=X.createLinearGradient(0,y,0,y+h);g.addColorStop(0,'#fffaf0');g.addColorStop(1,c||'#ffe7c2');X.fillStyle=g;X.fill();X.strokeStyle='#e8762b';X.lineWidth=4;X.stroke();return x}
function heart(x,y,s,c){X.save();X.translate(x,y);X.scale(s/10,s/10);X.beginPath();X.moveTo(0,4);X.bezierCurveTo(-10,-4,-6,-12,0,-6);X.bezierCurveTo(6,-12,10,-4,0,4);X.fillStyle=c;X.fill();X.restore()}
function star(x,y,r,c){X.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,rr2=i%2?r*0.45:r;X.lineTo(x+Math.cos(a)*rr2,y+Math.sin(a)*rr2)}X.closePath();X.fillStyle=c;X.fill();X.strokeStyle='#b8860b';X.lineWidth=1.5;X.stroke()}
function dim(a){X.fillStyle='rgba(0,15,25,'+a+')';X.fillRect(0,0,VW,VH)}
function fmtT(s){s=Math.max(0,s);const m=Math.floor(s/60),ss=Math.floor(s%60),t=Math.floor(s*10)%10;return m+':'+String(ss).padStart(2,'0')+'.'+t}
function roundIcon(id,cx,cy,r,fn){circ(cx,cy+2,r,'rgba(0,0,0,0.25)');circ(cx,cy,r,'rgba(10,40,55,0.6)');X.strokeStyle='#fff';X.lineWidth=2;X.stroke();fn(cx,cy,r);btn(id,cx-r-6,cy-r-6,2*r+12,2*r+12)}
function muteIcon(cx,cy,r){X.fillStyle='#fff';X.beginPath();X.moveTo(cx-r*0.5,cy-r*0.2);X.lineTo(cx-r*0.2,cy-r*0.2);X.lineTo(cx+r*0.15,cy-r*0.5);X.lineTo(cx+r*0.15,cy+r*0.5);X.lineTo(cx-r*0.2,cy+r*0.2);X.lineTo(cx-r*0.5,cy+r*0.2);X.fill();
  if(AUD.muted){line(cx+r*0.3,cy-r*0.25,cx+r*0.6,cy+r*0.25,'#ff5252',2.5);line(cx+r*0.6,cy-r*0.25,cx+r*0.3,cy+r*0.25,'#ff5252',2.5)}else{X.beginPath();X.arc(cx+r*0.15,cy,r*0.45,-0.8,0.8);X.strokeStyle='#fff';X.lineWidth=2;X.stroke()}}
// ---------- HUD ----------
function drawHUD(){HUDB=[];const l=10+insL(),r=VW-10-insR();
  rrect(l,8,196,58,14);X.fillStyle='rgba(10,40,55,0.5)';X.fill();
  for(let i=0;i<MAXH;i++)heart(l+18+i*24,24,13,i<hearts?'#ff4d6d':'rgba(255,255,255,0.25)');
  drawBear(l+92,23,0,T*4,0.8);txt(bearsLv+'/'+L.bearsTotal,l+118,24,13,'#ffcc80',{sw:3});
  drawAcorn(l+16,48,T);txt(''+acorns,l+30,48,11,'#ffe14d',{a:'left',sw:3});dspr(petoskeySpr(),l+160,24,0.85);txt(''+stones,l+174,24,12,'#e0e0e0',{a:'left',sw:3});
  txt('POWER',l+74,48,8,'rgba(255,255,255,0.7)',{sw:0});for(let i=0;i<6;i++)circ(l+92+i*10,48,3.6,i<boat.rhythm?(i<3?'#7cff6b':i<5?'#ffd23f':'#ff6a1f'):'rgba(255,255,255,0.22)');
  const px=r-18;circ(px,26,17,'rgba(10,40,55,0.55)');X.strokeStyle='#fff';X.lineWidth=2;X.stroke();X.fillStyle='#fff';X.fillRect(px-6,18,4,16);X.fillRect(px+2,18,4,16);HUDB.push({id:'pause',x:px-26,y:0,w:52,h:52});
  rrect(px-104,12,76,28,14);X.fillStyle='rgba(10,40,55,0.5)';X.fill();txt(fmtT(lvTime),px-66,26,13,'#fff',{sw:0});
  if(lvStats.duck)drawRubberDuck(px-118,26,T);
  if(banner){const k=banner.t/banner.dur,a=k<0.1?k*10:k>0.8?(1-k)*5:1;X.globalAlpha=clamp(a,0,1);txt(banner.s,VW/2,86,20,banner.col,{sw:5});X.globalAlpha=1}
  // Dad off-screen pointer
  if(dadOut()){const sy=dad.y-camY,sx=dad.x-camX;if(sy>VH-20||sy<10||sx<0||sx>VW){const ax=clamp(sx,40,VW-40),ay=clamp(sy,96,(ctl().mode==='corner'?ctl().topL:VH)-30);
    rrect(ax-30,ay-12,60,24,12);X.fillStyle='rgba(255,140,30,0.9)';X.fill();txt(sy>VH-20?'DAD \u25BC':sy<10?'DAD \u25B2':'DAD!',ax,ay+1,12,'#fff',{sw:3})}}}
function hudTap(p){for(const b of HUDB)if(p.x>=b.x&&p.x<=b.x+b.w&&p.y>=b.y&&p.y<=b.y+b.h){if(b.id==='pause'){paused=true;clearInput();AUD.SFX.click()}return true}return false}
// ---------- paddle buttons (drawn in CSS px) ----------
function drawControls(){const c=ctl();X.setTransform(DPR,0,0,DPR,0,0);
  if(c.mode==='below'){const g=X.createLinearGradient(0,c.top,0,SH);g.addColorStop(0,'#1d4a3a');g.addColorStop(1,'#12302a');X.fillStyle=g;X.fillRect(0,c.top,SW,SH-c.top);X.fillStyle='rgba(255,255,255,0.08)';X.fillRect(0,c.top,SW,3);
    X.save();X.scale(c.k,c.k);txt('Tap LEFT & RIGHT in turn to go fast  \u2022  hold both to brake',SW/2/c.k,(SH-INS.b-12)/c.k,10,'rgba(255,255,255,0.7)',{sw:0});X.restore()}
  const both=inp.l&&inp.r,hint=boat&&boat.rhythm>=1&&!both?(boat.side<0?(steerMode==='arrow'?'l':'r'):(steerMode==='arrow'?'r':'l')):null;
  for(const k of ['l','r']){const b=c[k.toUpperCase()],on=inp[k],r=b.r*(on?0.94:1);X.save();X.translate(b.x,b.y);
    if(hint===k){X.beginPath();X.arc(0,0,r+6+Math.sin(T*10)*2,0,TAU);X.strokeStyle='rgba(255,230,120,0.7)';X.lineWidth=4;X.stroke()}
    X.beginPath();X.arc(0,0,r,0,TAU);X.fillStyle=both?'rgba(255,82,82,0.6)':on?'rgba(124,255,107,0.55)':'rgba(10,40,55,0.42)';X.fill();X.strokeStyle='rgba(255,255,255,0.9)';X.lineWidth=3;X.stroke();
    const s=r/48,side=k==='l'?-1:1;X.scale(s,s);
    // paddle icon on that side
    X.save();X.rotate(side*0.5);line(0,-28,0,14,'#c58a4a',5);ell(0,22,9,15,'#3fbf4a');X.strokeStyle='#1f7a2a';X.lineWidth=2;X.stroke();X.restore();
    // arrow: which way the canoe turns
    const dir=steerMode==='arrow'?side:-side;X.fillStyle='#fff';X.beginPath();X.moveTo(dir*30,-12);X.lineTo(dir*16,-22);X.lineTo(dir*16,-2);X.closePath();X.fill();line(dir*4,-12,dir*18,-12,'#fff',5);
    txt(both?'BRAKE':k==='l'?'LEFT':'RIGHT',0,34,12,both?'#ffcdd2':'#fff',{sw:3});X.restore()}
  if(both&&c.mode==='below'){const x=SW/2,y=c.L.y;X.save();X.translate(x,y);X.scale(c.k,c.k);rrect(-40,-13,80,26,13);X.fillStyle='rgba(255,82,82,0.85)';X.fill();txt('BRAKE',0,1,14,'#fff',{sw:0});X.restore()}}
// ---------- screens ----------
let demo=null;
function titleStep(dt){if(!L||L.i!==demo){buildLevel(0);demo=0;boat={x:riverC(-40),y:-40,vx:0,s:60,ang:0,side:-1,ph:1,dph:1,rhythm:2,lastStroke:0,repT:0,brake:0,duck:0,spin:0,wave:0,cheer:0,turn:0};dad={st:'boat',soggy:0,hat:1,lean:0,sneeze:0,reach:0,t:0};carry=[];flowerCarry=0;boss=null;geese=[];poops=[]}
  boat.ph=Math.min(1,boat.ph+dt/0.45);boat.dph=Math.min(1,boat.dph+dt/0.45);if(boat.ph>=1&&R()<dt*3){boat.side=-boat.side;boat.ph=0;boat.dph=0.15}
  boat.y-=70*dt;if(boat.y<-L.len*0.9)boat.y=-40;boat.x+=(riverC(boat.y-100)-boat.x)*dt*0.8;boat.ang=clamp((riverC(boat.y-100)-boat.x)*0.004,-0.3,0.3);
  const br=L.bridges.find(b=>Math.abs(b.y-boat.y)<75);boat.duck=approach(boat.duck,br?1:0,dt*5);for(const o of L.obj)if(o.t==='log')o.x=o.x0+Math.sin(T*0.35+o.ph)*o.vx*2.2;camUpdate(dt,false)}
function drawTitle(){dim(0.2);const W=VW,narrow=W<600,cx=W/2;UI=[];
  const ts=narrow?32:42;X.save();X.translate(cx,52);X.rotate(-0.02);txt("Alex's River Run",0,0,ts,'#ffe14d',{st:'#7a2e0e',sw:ts*0.22});X.restore();
  txt('A canoe adventure with Dad \u2022 save the woolly bears!',cx,52+ts*0.75,narrow?11:13,'#fff',{sw:3});
  drawBear(cx-ts*4.4,50,0.2,T*5,1.4);drawBear(cx+ts*4.4,50,-0.2,T*5+2,1.4);
  bigBtn('play','\u25B6 PLAY',cx,132,narrow?190:220,narrow?50:56,'#7cff6b','#2fa84a');
  // levels
  const n=LEVELS.length,bw=Math.min(118,(W-30-insL()-insR())/n-6),y=196;
  LEVELS.forEach((D,i)=>{const x=cx+(i-(n-1)/2)*(bw+6),locked=i>=unlockLv;rrect(x-bw/2,y,bw,58,12);X.fillStyle=locked?'rgba(30,40,50,0.65)':'rgba(10,70,90,0.75)';X.fill();X.strokeStyle=locked?'rgba(255,255,255,0.3)':'#fff';X.lineWidth=2;X.stroke();
    txt(''+(i+1),x,y+15,16,locked?'#889':'#ffe14d',{sw:3});txt(locked?'\uD83D\uDD12':D.name,x,y+33,bw<90?8.5:10,'#fff',{sw:0});
    if(!locked){const bt=bestT[i];txt(bt?'\u23F1 '+fmtT(bt):'\u2014',x,y+48,9,'#b3e5fc',{sw:0});if(ducksFound.includes(i))drawRubberDuck(x+bw/2-10,y+10,T)}btn('lv'+i,x-bw/2,y,bw,58)});
  // canoes
  const cy=narrow?VH-108:VH-48,cx0=narrow?cx-2*58+29:10+insL()+34;
  CANOES.forEach((C,i)=>{const x=cx0+i*58,own=canoesOwned.includes(C.id),sel=C.id===canoeSel;rrect(x-26,cy-26,52,52,12);X.fillStyle=sel?'rgba(255,225,77,0.85)':'rgba(10,40,55,0.6)';X.fill();X.strokeStyle='#fff';X.lineWidth=sel?3:1.5;X.stroke();
    const s=canoeSpr(C.id);X.save();X.translate(x,cy);X.rotate(Math.PI/2);X.globalAlpha=own?1:0.35;X.drawImage(s.c,-s.w*0.22,-s.h*0.22,s.w*0.44,s.h*0.44);X.restore();X.globalAlpha=1;if(!own)txt('\uD83D\uDD12',x,cy,16,'#fff',{sw:0});btn('cn'+i,x-26,cy-26,52,52)});
  txt(narrow?'':'CANOES',cx0+87,cy-34,10,'#fff',{sw:3});
  const ry=narrow?VH-44:VH-48,rx=narrow?cx:W-10-insR();
  const sl=steerMode==='canoe'?'REAL PADDLING: ON':'REAL PADDLING: OFF';
  if(narrow){bigBtn('steer',sl,cx-78,ry,150,38,'#4fc3f7','#1e88e5',11);bigBtn('records','\uD83C\uDFC6 RECORDS',cx+86,ry,130,38,'#ffd54f','#ff8f00',12)}
  else{bigBtn('steer',sl,rx-235,ry,170,40,'#4fc3f7','#1e88e5',12);bigBtn('records','\uD83C\uDFC6 RECORDS',rx-70,ry,136,40,'#ffd54f','#ff8f00',13)}
  roundIcon('mute',W-10-insR()-20,26,18,muteIcon);txt('v'+VERSION,W-10-insR()-20,52,8,'rgba(255,255,255,0.6)',{sw:0});
  rrect(10+insL(),12,narrow?120:150,28,14);X.fillStyle='rgba(10,40,55,0.55)';X.fill();drawBear(26+insL(),26,0,T*4,0.7);txt((narrow?'':'Saved: ')+lifeBears,44+insL(),27,12,'#ffcc80',{a:'left',sw:0});
  if(titleMsg&&T-titleMsg.t<2.5){rrect(cx-150,cy-80,300,32,16);X.fillStyle='rgba(0,0,0,0.75)';X.fill();txt(titleMsg.s,cx,cy-64,13,'#ffe14d',{sw:0})}}
function drawRecords(){dim(0.55);UI=[];const w=Math.min(560,VW-30),x=panel(w,VH-40,20,'#d9f2ff');txt('\uD83C\uDFC6 RECORDS',VW/2,46,24,'#fff',{st:'#1e88e5',sw:6});
  txt('Best times',x+w*0.27,76,13,'#1d3b4a',{sw:0});LEVELS.forEach((D,i)=>{txt((i+1)+'. '+D.name,x+20,98+i*22,11,'#1d3b4a',{a:'left',sw:0});txt(bestT[i]?fmtT(bestT[i]):'\u2014',x+w*0.47,98+i*22,11,'#1e6aa5',{a:'right',sw:0});if(ducksFound.includes(i))drawRubberDuck(x+w*0.47+12,98+i*22,T)});
  txt('Full adventure leaderboard',x+w*0.74,76,13,'#1d3b4a',{sw:0});
  if(!board.length)txt('Finish all 5 levels to get on the board!',x+w*0.74,110,10,'#557',{sw:0});
  board.slice(0,5).forEach((e,i)=>{const yy=98+i*22;txt((i+1)+'.',x+w*0.53,yy,11,'#c0392b',{a:'left',sw:0});txt(e.score+' pts',x+w*0.58,yy,11,'#1d3b4a',{a:'left',sw:0});txt(fmtT(e.time),x+w*0.8,yy,10,'#1e6aa5',{sw:0});drawBear(x+w*0.9,yy,0,0,0.55);txt(''+e.bears,x+w*0.95,yy,10,'#b5521c',{sw:0})});
  txt('Lifetime woolly bears saved: '+lifeBears+'   \u2022   Rubber ducks: '+ducksFound.length+'/5',VW/2,226,12,'#1d3b4a',{sw:0});
  bigBtn('back','BACK',VW/2,VH-56,150,44,'#7cff6b','#2fa84a')}
const TIPS=['Tap LEFT and RIGHT in turn to go fast! Hold one to steer that way.','Burping fish push you around. Can you spot a great blue heron?','Beaver dams: find the gap! Watch out for Canada geese.','Everyone ducks under the low bridges. Headlamp on in the tunnel!','Fast water! Dodge the rocks, then cheer up Old Mossback.'];
function drawCard(){const t=card.t;dim(Math.min(0.45,t));const w=Math.min(470,VW-30),y=VH/2-104;X.save();X.translate(VW/2,y+104);const s=easeB(Math.min(1,t*2.5));X.scale(s,s);X.translate(-VW/2,-y-104);
  const x=panel(w,208,y);txt('LEVEL '+(lvI+1),VW/2,y+30,16,'#e8762b',{sw:0});txt(L.D.name,VW/2,y+64,30,'#fff',{st:'#1e6aa5',sw:7});txt(L.D.sub,VW/2,y+96,13,'#1d3b4a',{sw:0});
  const tip=TIPS[lvI],words=tip.split(' ');let l1='',l2='';for(const wd of words){if((l1+' '+wd).length<46&&!l2)l1+=(l1?' ':'')+wd;else l2+=(l2?' ':'')+wd}txt(l1,VW/2,y+124,11.5,'#5a4a3a',{sw:0});txt(l2,VW/2,y+142,11.5,'#5a4a3a',{sw:0});
  drawBear(VW/2-40,y+170,0,T*5,1.1);txt('x '+L.bearsTotal+' to save!',VW/2+20,y+170,13,'#b5521c',{sw:0});
  if(t>0.6)txt('TAP TO PADDLE!',VW/2,y+196+Math.sin(T*6)*2,13,'#2fa84a',{sw:0});X.restore()}
function drawOops(){dim(Math.min(0.5,stT));const y=VH/2-70,w=320;panel(w,130,y);txt('Oopsie!',VW/2,y+34,30,'#fff',{st:'#c0392b',sw:7});txt('Back to the buoy \u2014 hearts refilled!',VW/2,y+72,13,'#5a3a1a',{sw:0});
  for(let i=0;i<MAXH;i++){const on=stT>0.4+i*0.3;heart(VW/2+(i-1)*34,y+104,on?15:11,on?'#ff4d6d':'#e8c8a8')}}
function drawPaused(){dim(0.55);UI=[];const y=VH/2-120;panel(300,240,y);txt('PAUSED',VW/2,y+32,26,'#fff',{st:'#1e6aa5',sw:6});bigBtn('resume','PADDLE ON!',VW/2,y+86,210,50,'#7cff6b','#2fa84a');
  bigBtn('steer',steerMode==='canoe'?'REAL PADDLING: ON':'REAL PADDLING: OFF',VW/2,y+146,210,38,'#4fc3f7','#1e88e5',12);bigBtn('home','HOME',VW/2,y+200,150,40,'#ffd54f','#ff8f00')}
function drawClear(){const t=stT,ci=clearInfo;dim(Math.min(0.4,t*0.5));UI=[];const w=Math.min(440,VW-30),y=VH/2-128;X.save();const s=easeB(Math.min(1,t*2));X.translate(VW/2,y+128);X.scale(s,s);X.translate(-VW/2,-y-128);
  panel(w,256,y);txt('LEVEL CLEAR!',VW/2,y+32,28,'#fff',{st:'#2fa84a',sw:7});for(let i=0;i<3;i++){const on=t>0.5+i*0.3&&i<ci.stars;star(VW/2+(i-1)*44,y+70,on?17:13,on?'#ffd23f':'#e8d8c0')}
  const n=L.bearsTotal,bx0=VW/2-(n-1)*13;for(let i=0;i<n;i++){const ok=i<bearsLv;X.globalAlpha=ok?1:0.25;drawBear(bx0+i*26,y+104,0,T*6+i,ok?1:0.9);X.globalAlpha=1}
  txt('Woolly Bear Hero: '+bearsLv+' / '+n,VW/2,y+128,15,'#b5521c',{sw:0});
  txt('Time '+fmtT(lvTime)+(ci.newBest?'  NEW BEST!':''),VW/2,y+152,13,ci.newBest?'#e53935':'#1d3b4a',{sw:0});
  txt('Acorns '+acorns+'   \u2022   Petoskey stones '+stones+'   \u2022   Waves '+lvStats.waves+'   \u2022   Dad dunks '+lvStats.dunks+(lvStats.duck?'   \u2022   \uD83E\uDD86 found!':''),VW/2,y+174,11,'#5a4a3a',{sw:0});
  txt('Score '+score+'  (+'+(hearts*100)+' hearts bonus)',VW/2,y+196,12,'#1e6aa5',{sw:0});
  if(ci.unlock)txt('NEW CANOE: '+ci.unlock+'!',VW/2,y+218,13,'#e8762b',{sw:0});
  if(t>1.5)txt('TAP FOR NEXT LEVEL!',VW/2,y+240+Math.sin(T*6)*2,14,'#2fa84a',{sw:0});X.restore()}
function drawEnd(){const t=stT,e=endStats;dim(0.35);UI=[];const w=Math.min(600,VW-24),h=Math.min(VH-24,380),y=(VH-h)/2;const x=panel(w,h,y,'#fff1c9');
  txt('WOOLLY BEAR HERO!',VW/2,y+34,Math.min(32,w/15),'#ffcc80',{st:'#7a2e0e',sw:7});if(w>440){drawCider(x+34,y+40,1.1);drawDonut(x+w-52,y+44,1.2,1);drawDonut(x+w-30,y+34,1.05,0)}
  txt('Welcome to Milford! Cider & donuts at Central Park!',VW/2,y+56,11,'#7a3a10',{sw:0});
  const n=Math.min(e.bears,Math.floor((w-40)/22));const march=(T*30)%22;for(let i=0;i<n;i++){const bx=x+24+((i*22+march)%(w-48));drawBear(bx,y+75,0,T*8+i,0.95)}
  txt('You saved '+e.bears+' of '+e.bearsTotal+' woolly bears, Alex!',VW/2,y+96,15,'#b5521c',{sw:0});
  txt('Time '+fmtT(e.time)+'   \u2022   Score '+e.score+'   \u2022   Acorns '+e.acorns+'   \u2022   Petoskey stones '+(e.stones||0),VW/2,y+120,12,'#1d3b4a',{sw:0});
  txt('Dad went swimming '+e.dunks+' times! \uD83D\uDCA6   \u2022   Rubber ducks '+e.ducks+'   \u2022   Bonks '+e.bonks,VW/2,y+140,11,'#1e6aa5',{sw:0});
  if(e.unlocks.length)txt('Unlocked: '+e.unlocks.join(', ')+'!',VW/2,y+160,12,'#e8762b',{sw:0});
  txt(e.full?'LEADERBOARD':'Practice run (start at level 1 for the leaderboard)',VW/2,y+182,12,'#c0392b',{sw:0});
  board.slice(0,5).forEach((b,i)=>{const yy=y+202+i*17,me=e.rank===i;if(me){rrect(VW/2-150,yy-8,300,16,8);X.fillStyle='rgba(255,210,63,0.6)';X.fill()}txt((i+1)+'.  '+b.score+' pts   '+fmtT(b.time)+'   \uD83D\uDC1B '+b.bears,VW/2,yy,11,'#1d3b4a',{sw:0})});
  if(t>1.5){bigBtn('again','PLAY AGAIN',VW/2-90,y+h-30,160,40,'#7cff6b','#2fa84a',14);bigBtn('home','HOME',VW/2+90,y+h-30,130,40,'#ffd54f','#ff8f00',14)}}
// ---------- flow ----------
function checkUnlocks(){const add=id=>{if(!canoesOwned.includes(id)){canoesOwned.push(id);LS.set('canoes',canoesOwned);const nm=CANOES.find(c=>c.id===id).name;newUnlocks.push(nm);showBanner('NEW CANOE: '+nm.toUpperCase()+'!','#ffe14d',2.5);AUD.SFX.power();setTimeout(()=>say('unlock',2),800);return nm}return null};
  let u=null;if(unlockLv>=3)u=add('rocket')||u;if(ducksFound.length>=3)u=add('pirate')||u;if(LS.get('beat',0))u=add('hotdog')||u;return u}
function levelClear(){if(carry.length)dropBears(1);state='clear';stT=0;clearInput();const r=L.bearsTotal?bearsLv/L.bearsTotal:1;const stars=r>=1?3:r>=0.6?2:1;score+=hearts*100;
  const nb=!bestT[lvI]||lvTime<bestT[lvI];if(nb){bestT[lvI]=lvTime;LS.set('best',bestT)}unlockLv=Math.max(unlockLv,Math.min(LEVELS.length,lvI+2));LS.set('unlock',unlockLv);
  run.score+=score;run.time+=lvTime;run.bearsTotal+=L.bearsTotal;run.levels++;const u=checkUnlocks();clearInfo={stars,newBest:nb,unlock:u};AUD.setTheme('win');AUD.SFX.fanfare();setTimeout(()=>AUD.SFX.cheer(),500);say('clear',3)}
function nextLevel(){if(lvI<LEVELS.length-1)startLevel(lvI+1);else finish()}
function finish(){if(state==='end')return;LS.set('beat',1);const nb=!bestT[lvI]||lvTime<bestT[lvI];if(nb){bestT[lvI]=lvTime;LS.set('best',bestT)}
  run.score+=score+hearts*100;run.time+=lvTime;run.bearsTotal+=L.bearsTotal;run.levels++;checkUnlocks();
  let rank=-1;if(runFull){const ent={score:run.score,time:run.time,bears:run.bears,d:Date.now()};board.push(ent);board.sort((a,b)=>b.score-a.score||a.time-b.time);board=board.slice(0,5);rank=board.indexOf(ent);LS.set('board',board)}
  endStats={bears:run.bears,bearsTotal:run.bearsTotal,time:run.time,score:run.score,acorns:run.acorns,stones:run.stones,dunks:run.dunks,ducks:run.ducks,bonks:run.bonks,unlocks:newUnlocks.slice(),full:runFull,rank};newUnlocks=[];
  state='end';stT=0;clearInput();AUD.setTheme('win');AUD.SFX.fanfare();setTimeout(()=>AUD.SFX.cheer(),600);say('did',3);fwT=0}
function toTitle(){clearInput();state='title';stT=0;paused=false;boss=null;demo=null;AUD.setTheme('title');parts=[];floats=[];banner=null;smear=[]}
function setSteer(){steerMode=steerMode==='canoe'?'arrow':'canoe';LS.set('steer2',steerMode);AUD.SFX.click()}
function uiKey(k){if(k==='pause'){if(state==='play'){paused=!paused;clearInput();AUD.SFX.click()}return}
  if(paused){paused=false;clearInput();return}
  if(state==='title'){AUD.SFX.click();newRun(0)}else if(state==='card'&&card.t>0.4)startPlay();else if(state==='clear'&&stT>1.5)nextLevel();else if(state==='end'&&stT>1.5)newRun(0);else if(state==='records')state='title'}
function uiTap(p){let hit=null;for(let i=UI.length-1;i>=0;i--){const b=UI[i];if(p.x>=b.x&&p.x<=b.x+b.w&&p.y>=b.y&&p.y<=b.y+b.h){hit=b.id;break}}
  if(paused){if(hit==='resume'){paused=false;clearInput();AUD.SFX.click()}else if(hit==='home'){AUD.SFX.click();toTitle()}else if(hit==='steer')setSteer();return}
  if(state==='title'){if(hit==='play'){AUD.SFX.click();newRun(0)}else if(hit&&hit.startsWith('lv')){const i=+hit.slice(2);if(i<unlockLv){AUD.SFX.click();newRun(i)}else{AUD.SFX.bonk();titleMsg={s:'Clear level '+i+' to unlock!',t:T}}}
    else if(hit&&hit.startsWith('cn')){const C=CANOES[+hit.slice(2)];if(canoesOwned.includes(C.id)){canoeSel=C.id;LS.set('canoe',canoeSel);AUD.SFX.boing()}else{AUD.SFX.bonk();titleMsg={s:C.name+': '+C.need,t:T}}}
    else if(hit==='steer')setSteer();else if(hit==='records'){AUD.SFX.click();state='records'}else if(hit==='mute')toggleMute();return}
  if(state==='records'){if(hit==='back'||!hit){AUD.SFX.click();state='title'}return}
  if(state==='card'){if(card.t>0.4)startPlay();return}if(state==='clear'){if(stT>1.5)nextLevel();return}
  if(state==='end'){if(hit==='again'){AUD.SFX.click();newRun(0)}else if(hit==='home'){AUD.SFX.click();toTitle()}}}
// ---------- camera ----------
function camBase(){const c=ctl();let base=VH*0.64;if(c.mode==='corner')base=Math.min(base,c.topL-60);return base}
function camUpdate(dt,snap){const c=ctl(),base=camBase();let tgt=base;
  if(dadOut()&&dad.y>boat.y-40){const lim=(c.mode==='corner'?c.topL-28:VH-40);tgt=Math.max(110,Math.min(base,lim-(dad.y-boat.y)))}
  anchor=snap?tgt:approach(anchor,tgt,240*dt);let cy=boat.y-anchor;
  if(boss&&boss.st!=='happy'){const lock=L.arena.y1;camY=snap?lock:camY+(lock-camY)*Math.min(1,dt*4);if(boat.y-camY>base)camY=boat.y-base}else camY=cy;
  const tx=(boss?L.arena.c:riverC(boat.y-120)*0.65+boat.x*0.35)-VW/2;camX=snap?tx:camX+(tx-camX)*Math.min(1,dt*5)}
// ---------- autopilot (debug only: drives the SAME button inputs for the scripted full playthrough) ----------
const AP={next:0,hold:0,mode:''};
function hazardCost(x,y0,y1,near){let c=0;for(const o of L.obj){if(o.y>y0+30||o.y<y1)continue;let d;
    if(o.t==='rock'||o.t==='pillar'||o.t==='cattail'&&!o.deco)d=Math.abs(x-o.x)-o.r;else if(o.t==='log'){const ca=Math.abs(Math.cos(o.ang))*o.len/2;d=Math.abs(x-o.x)-ca-12}else if(o.t==='dam'){d=o.gw/2-Math.abs(x-o.gx);d=d>18?99:-40}
    else if(o.t==='burp'){d=Math.abs(x-o.x)-60}else if(o.t==='fish'){if(o.jumps>=2)continue;d=Math.abs(x-o.x)-85}else continue;
    const k=clamp((y0-o.y)/(y0-y1),0,1),w=near?1:1.6-k*1.2;if(d<30)c+=(30-d)*10*w}
  for(const p of poops)if(p.t<0.6&&Math.abs(p.y-boat.y)<120){const d=Math.abs(x-p.x)-38;if(d<0)c+=-d*6}
  for(const g of geese)if(g.kind==='poop'&&!g.dropped){const d=Math.abs(x-g.tx)-40;if(d<0)c+=-d*6}
  return c}
function autopilot(dt){if(!bot.on||state!=='play'){if(bot.l||bot.r){bot.l=bot.r=0;syncInp()}return}
  const sp=Math.max(40,boat.s+L.cur),look=Math.max(200,sp*1.6),look0=boat.y-20,look1=boat.y-look,c=riverC(boat.y-80),hw=(L.arena&&boat.y<L.arena.y0?L.arena.hw:riverHW(boat.y-80))-28;let tx=boat.x,best=1e9,wantBrake=false,cruise=150;
  let goal=null;if(dadOut())goal={x:dad.x,y:dad.y,w:5};
  else if(boss&&boss.st!=='intro'){if(boss.st==='dizzy'&&flowerCarry)goal={x:boss.hx,y:boss.hy,w:8};else if(!flowerCarry&&flowers.length){const f=flowers.reduce((a,b)=>dist2(b.x,b.y,boat.x,boat.y)<dist2(a.x,a.y,boat.x,boat.y)?b:a);goal={x:f.x,y:f.y,w:6}}else goal={x:boat.x,y:boss.y+300,w:0}}
  else{const bears=L.obj.filter(o=>o.t==='bear'&&o.st==='float'&&o.y<boat.y-20&&o.y>boat.y-320);if(bears.length)goal={x:bears[0].x,y:bears[0].y,w:3};
    else if(carry.length){goal={x:c+(boat.x<c?-1:1)*(hw+24),y:boat.y-100,w:2.5}}
    else{const d=L.obj.find(o=>o.t==='rduck'&&!o.got&&o.y<boat.y&&o.y>boat.y-320);if(d)goal={x:d.x,y:d.y,w:3}}}
  for(let x=c-hw;x<=c+hw;x+=6){let cost=hazardCost(x,look0,look1)+Math.abs(x-boat.x)*0.08;if(goal)cost+=Math.abs(x-goal.x)*goal.w*0.25;if(boss&&(boss.st==='warn'||boss.st==='lunge'))cost-=Math.abs(x-boss.hx)*2;if(cost<best){best=cost;tx=x}}
  const nearBlocked=hazardCost(boat.x,boat.y-30,boat.y-110,true)>40;
  if(dadOut()&&dad.y>boat.y-30)wantBrake=true;
  if(boss){cruise=goal&&goal.y<boat.y-12?110:0;if(goal&&goal.y>boat.y+14)wantBrake=true;
    if(boss.st==='warn'||boss.st==='lunge'){wantBrake=false;const A=L.arena;let sd=boat.x<boss.tx?-1:1;if(Math.abs(boat.x+sd*90-A.c)>A.hw-40)sd=-sd;tx=boss.tx+sd*110;cruise=0}}
  else if(nearBlocked&&Math.abs(tx-boat.x)>24&&boat.s>40)wantBrake=true;
  if(goal&&!dadOut()&&!boss&&goal.y<boat.y&&boat.y-goal.y<140&&Math.abs(goal.x-boat.x)>50)cruise=60;
  // never brake forever: braking kills sideways motion, so alternate with steering strokes
  if(wantBrake){AP.bt=(AP.bt||0)+dt;if(AP.bt>1.0&&Math.abs(tx-boat.x)>20){wantBrake=false;if(AP.bt>1.5)AP.bt=0}}else AP.bt=0;
  AP.mode=wantBrake?'brake':'go';
  if(wantBrake){if(!(bot.l&&bot.r)){bot.l=bot.r=1;syncInp()}AP.next=T+0.05;return}
  if(bot.l||bot.r){bot.l=bot.r=0;syncInp();return}
  if(T<AP.next)return;const want=clamp((tx-boat.x)*2.6,-150,150),err=want-boat.vx;let btnSide=null;
  const R_=steerMode==='arrow'?'r':'l',L_=steerMode==='arrow'?'l':'r';
  if(err>18)btnSide=R_;else if(err<-18)btnSide=L_;else if(boat.s<cruise)btnSide=boat.side<0?L_:R_;
  if(btnSide){bot[btnSide]=1;syncInp()}AP.next=T+0.22}
// ---------- update ----------
function update(dt){T+=dt;stT+=dt;shake=Math.max(0,shake-dt*1.5);
  for(const p of parts){p.life+=dt;p.vy+=(p.g||0)*dt;p.x+=p.vx*dt||0;p.y+=p.vy*dt||0;if(p.k==='conf')p.rot+=p.vr*dt}parts=parts.filter(p=>p.life<p.max);if(parts.length>500)parts.splice(0,parts.length-500);
  for(const f of floats)f.t+=dt;floats=floats.filter(f=>f.t<1.4);if(banner){banner.t+=dt;if(banner.t>banner.dur)banner=null}
  if(state==='title'||state==='records'){titleStep(dt);return}
  if(state==='end'){fwT-=dt;if(fwT<=0){fwT=rr(0.6,1.0);firework(camX+rr(60,VW-60),camY+rr(40,140))}if(R()<dt*5)confetti(2);return}
  if(paused)return;
  if(state==='card'){card.t+=dt;camUpdate(dt,card.t<0.05);if(card.t>3.8)startPlay();return}
  if(state==='play'){lvTime+=dt;inv=Math.max(0,inv-dt);autopilot(dt);stepBoat(dt);collide();stepObjects(dt);stepGeese(dt);stepDad(dt);if(state==='play')stepMarkers(dt);stepBoss(dt);camUpdate(dt);if(DEBUG)coverCheck()}
  else if(state==='oops'){camUpdate(dt);if(stT>2.3)respawn()}
  else if(state==='clear'){boat.s=approach(boat.s,30,dt*60);boat.y-=(boat.s+L.cur*0.3)*dt;boat.cheer=1;stepDad(dt);camUpdate(dt);boat.ph=Math.min(1,boat.ph+dt/0.45);if(stT>7)nextLevel()}
  else if(state==='bosswin'){lvTime+=dt;stepBoss(dt);stepDad(dt);boat.cheer=1;boat.s=approach(boat.s,0,dt*80);boat.vx*=0.95;if(stT>3){boat.y-=50*dt;boss.y-=50*dt;boss.hy-=50*dt}
    if(stT>2.6&&!saidOnce.milford){saidOnce.milford=1;showBanner('WELCOME TO MILFORD!','#ffe14d',3.5);say('milford',3)}
    camUpdate(dt);fwT-=dt;if(fwT<=0&&stT>0.6){fwT=0.5;firework(boss.x+rr(-90,90),boss.y-rr(40,120));confetti(10,boss.x,boss.y-80)}if(stT>8.5)finish()}}
// self-check (debug): paddle buttons must never cover Alex, Dad, or hazards ahead of the canoe
function coverCheck(){if(portrait)return;const rs=ctlRects();const ov=(x,y,r)=>rs.some(b=>x+r>b.x&&x-r<b.x+b.w&&y+r>b.y&&y-r<b.y+b.h);cov.n++;const by=boat.y-camY,bx=boat.x-camX;
  const add=(w,x,y)=>{cov.viol++;if(cov.ex.length<8)cov.ex.push(w+'@'+Math.round(x)+','+Math.round(y)+' lv'+lvI)};
  for(const c of canoeCircles())if(ov(c.x-camX,c.y-camY,c.r+6)){add('canoe',c.x-camX,c.y-camY);break}
  if(dadOut()&&ov(dad.x-camX,dad.y-camY,22))add('dad',dad.x-camX,dad.y-camY);
  for(const o of L.obj){const sy=o.y-camY;if(sy<0||sy>by-50)continue;if(!['rock','log','pillar','fish','burp','cattail'].includes(o.t))continue;const r=o.t==='log'?o.len/2:o.r||20;if(ov(o.x-camX,sy,r))add(o.t,o.x-camX,sy)}}
// ---------- render ----------
function render(){X.setTransform(DPR,0,0,DPR,0,0);X.fillStyle='#12302a';X.fillRect(0,0,SW,SH);
  X.setTransform(DPR*SC,0,0,DPR*SC,OX*DPR,OY*DPR);if(portrait){X.save();X.beginPath();X.rect(0,0,VW,VH);X.clip()}UI=[];
  if(ICONMODE||OGMODE){drawIcon();if(portrait)X.restore();return}
  if(L)drawWorld();
  if(state==='title')drawTitle();else if(state==='records')drawRecords();
  else{if(state==='play'||state==='oops'||state==='bosswin')drawHUD();if(state==='card')drawCard();if(state==='oops')drawOops();if(state==='clear')drawClear();if(state==='end')drawEnd();if(paused)drawPaused()}
  if(portrait)X.restore();
  if((state==='play'||state==='card')&&!paused)drawControls()}
function drawIcon(){const W=VW,H=VH;if(!L){buildLevel(0)}const g=X.createLinearGradient(0,0,W,H);g.addColorStop(0,'#5ab3c2');g.addColorStop(1,'#2a6272');X.fillStyle=g;X.fillRect(0,0,W,H);
  X.save();X.translate(W/2,H/2);const s=Math.min(W,H)/400;X.scale(s,s);
  for(let i=0;i<5;i++){X.beginPath();X.ellipse(30,40,60+i*38,36+i*24,0.6,0,TAU);X.strokeStyle='rgba(255,255,255,'+(0.16-i*0.025)+')';X.lineWidth=4;X.stroke()}
  for(const [x,y,c] of [[-175,-175,0],[185,-170,1],[190,185,2]])dspr(treeSpr(c),x,y,1.5);
  for(let i=0;i<7;i++)dspr(leafSpr(i%5),Math.cos(i*2.3)*150,Math.sin(i*1.7)*140,1.4,i);
  X.save();X.translate(20,-10);X.rotate(0.62);X.scale(2.45,2.45);const cs=canoeSpr('silver');X.drawImage(cs.c,-cs.w/2,-cs.h/2,cs.w,cs.h);drawDad(0,24,{side:1,ph:0.3,hat:1});drawAlex(0,-20,{side:-1,ph:0.25});X.restore();
  dspr(raftSpr('leaf','#ef7d22'),-118,118,2.3,-0.4);drawBear(-120,112,-0.4,1,2.3);X.restore();
  if(OGMODE){txt("Alex's River Run",W/2,H*0.12,Math.min(W,H)*0.1,'#ffe14d',{st:'#7a2e0e',sw:12});txt('Paddle • rescue woolly bears • fish Dad out of the river!',W/2,H*0.93,Math.min(W,H)*0.045,'#fff',{sw:6})}}
// ---------- main loop with adaptive resolution (keeps the A10 iPad smooth) ----------
let last=performance.now(),acc=0,ema=16,slowN=0,fpsN=0,fpsT=0,fps=60,work=4,workMax=0;
function frame(now){const raw=now-last,dt=Math.min(0.05,Math.max(0,raw/1000));last=now;acc+=dt*TS;const STEP=1/60;let n=0;
  const w0=performance.now();try{while(acc>=STEP&&n<5){update(STEP);acc-=STEP;n++}if(n>=5)acc=0;render()}catch(e){console.error(e&&e.stack||e)}const wk=performance.now()-w0;work=work*0.95+wk*0.05;workMax=Math.max(workMax,wk);
  ema=ema*0.95+raw*0.05;fpsN++;fpsT+=raw;if(fpsT>=1000){fps=fpsN*1000/fpsT;fpsN=0;fpsT=0}
  if(state==='play'&&!paused&&!document.hidden){if(ema>22)slowN+=raw;else slowN=Math.max(0,slowN-raw*0.5);if(slowN>1100&&dprCap>1){dprCap=Math.max(1,dprCap-0.25);slowN=0;ema=16;resize()}}
  requestAnimationFrame(frame)}
AUD.setTheme('title');requestAnimationFrame(frame);
if(DEBUG)window.__A={get state(){return state},set state(v){state=v},get boat(){return boat},get dad(){return dad},get L(){return L},get hearts(){return hearts},set hearts(v){hearts=v},get score(){return score},get bearsLv(){return bearsLv},get carry(){return carry.length},
  get boss(){return boss},get lv(){return lvI},get run(){return run},get paused(){return paused},get stT(){return stT},set stT(v){stT=v},get card(){return card},get endStats(){return endStats},get clearInfo(){return clearInfo},get inv(){return inv},set inv(v){inv=v},
  get inp(){return {l:inp.l,r:inp.r}},get nptrs(){return ptrs.size},get pressQ(){return pressQ.length},get cov(){return cov},get fps(){return fps},get work(){return work},get workMax(){return workMax},resetPerf(){workMax=0},get ema(){return ema},get dprCap(){return dprCap},get DPR(){return DPR},get smear(){return smear.length},get geese(){return geese.length},get flowerCarry(){return flowerCarry},
  get canoes(){return canoesOwned},get canoeSel(){return canoeSel},get steer(){return steerMode},get cam(){return {x:camX,y:camY}},steerSet(v){steerMode=v},get board(){return board},get bestT(){return bestT},get unlockLv(){return unlockLv},set unlockLv(v){unlockLv=v},get ducks(){return ducksFound},get lvTime(){return lvTime},get AP(){return AP.mode},
  audio:AUD,newRun,startPlay,startLevel,finish,set TS(v){TS=v},get TS(){return TS},bot(on){bot.on=on;bot.l=bot.r=0;syncInp()},
  tele(y,x){boat.y=y;boat.x=x==null?riverC(y):x;boat.vx=0;boat.s=0;camUpdate(0,true)},spawnGoose(){spawnGoose(false)},dunk(k){dad.st='wind';dad.k=k;dad.t=0;dad.side=R()<0.5?-1:1;if(k==='sneeze'){say('dadsneeze',3);setTimeout(()=>AUD.SFX.sneeze(),700)}},
  toClient:(x,y)=>({x:x*SC+OX,y:y*SC+OY}),ctl,ctlRects,get VW(){return VW},get VH(){return VH},get portrait(){return portrait},get ui(){return UI.map(b=>({id:b.id,x:b.x+b.w/2,y:b.y+b.h/2}))},get hud(){return HUDB.map(b=>({id:b.id,x:b.x+b.w/2,y:b.y+b.h/2}))},
  riverC,riverHW,canoeCircles,bonkLog,get version(){return VERSION}};
