// ================= rendering: river world, characters, overlays =================
let dk=null;// cached half-res headlamp mask for tunnels (cheap on the A10)
function vis(y,m){return y>camY-(m||80)&&y<camY+VH+(m||80)}
function drawRiver(){const D=L.D,y0=camY-40,y1=camY+VH+40;X.fillStyle=D.bank;X.fillRect(camX-10,camY-10,VW+20,VH+20);
  // bank texture: soft patches + fallen leaves on the grass
  const g0=Math.floor(y0/90),gx0=Math.floor((camX-10)/90);for(let gy=g0;gy<g0+VH/90+3;gy++)for(let gx=gx0;gx<gx0+VW/90+2;gx++){const h=hsh(gx*31+gy*17);ell(gx*90+h*60,gy*90+hsh(gy*7+gx)*60,20+h*16,12+h*8,shade(D.bank,h<0.5?-0.08:0.08));
    if(h>0.55)dspr(leafSpr(((gx+gy)%5+5)%5),gx*90+h*80,gy*90+30,0.5,h*6)}
  const ys=[];for(let y=y0;y<=y1;y+=20)ys.push(y);ys.push(y1);
  X.beginPath();ys.forEach((y,i)=>{const x=riverC(y)-riverHW(y);i?X.lineTo(x,y):X.moveTo(x,y)});for(let i=ys.length-1;i>=0;i--){const y=ys[i];X.lineTo(riverC(y)+riverHW(y),y)}X.closePath();
  X.fillStyle=D.water;X.fill();X.strokeStyle=D.edge;X.lineWidth=D.style==='canal'?9:6;X.lineJoin='round';X.stroke();
  // sky reflection band (mirror-still water) + inner foam line
  X.beginPath();ys.forEach((y,i)=>{const x=riverC(y)-riverHW(y)*0.55+Math.sin(y*0.01)*12;i?X.lineTo(x,y):X.moveTo(x,y)});for(let i=ys.length-1;i>=0;i--){const y=ys[i];X.lineTo(riverC(y)+riverHW(y)*0.2+Math.sin(y*0.012)*16,y)}X.closePath();
  X.globalAlpha=0.22;X.fillStyle=D.water2;X.fill();X.globalAlpha=1;
  for(const s of [-1,1]){X.beginPath();ys.forEach((y,i)=>{const x=riverC(y)+s*(riverHW(y)-5);i?X.lineTo(x,y):X.moveTo(x,y)});X.strokeStyle='rgba(255,255,255,0.18)';X.lineWidth=2;X.stroke()}
  // tunnel walls (stone)
  for(const t of L.tunnels){if(t.y1>y1||t.y0<y0)continue;for(const s of [-1,1]){X.beginPath();for(let y=Math.min(y1,t.y0);y>=Math.max(y0,t.y1);y-=20){const x=riverC(y)+s*riverHW(y);X.lineTo(x,y)}X.strokeStyle='#5c5a57';X.lineWidth=18;X.stroke()}}
  // shimmer (gentle, or white-water streaks in the rapids)
  const rap=D.style==='rapids',n=rap?30:14;X.lineWidth=rap?2:1.4;X.strokeStyle=rap?'rgba(255,255,255,0.45)':'rgba(255,255,255,0.22)';X.beginPath();
  for(let i=0;i<n;i++){const wy=Math.floor(camY/120)*120+((i*67)%(VH+240))-60,yy=wy+(rap?(T*90)%120:0)-(rap?60:0),c=riverC(yy),hw=riverHW(yy),xx=c+(hsh(i*13+Math.floor(camY/120))*2-1)*hw*0.8;
    const ln=rap?18:10+Math.sin(T*1.5+i)*4;X.moveTo(xx-ln,yy);X.lineTo(xx+ln,yy)}X.stroke()}
function drawReflections(){if(L.D.style==='rapids')return;X.globalAlpha=0.2;for(const d of L.deco){if(!vis(d.y,120))continue;if(d.k!=='tree'&&d.k!=='willow'&&d.k!=='pine')continue;const c=riverC(d.y),edge=c+d.side*riverHW(d.y),dx=d.x-edge;if(Math.abs(dx)>110)continue;
    const s=reflSpr(d.k==='tree'?treeSpr(d.v):d.k==='pine'?pineSpr(d.v%3):willowSpr(d.v));const rx=edge-dx*0.7-d.side*10;X.save();X.translate(rx,d.y);X.scale(-0.8*d.s,0.8*d.s);X.drawImage(s.c,-s.w/2,-s.h/2,s.w,s.h);X.restore()}X.globalAlpha=1}
function drawDeco(over){for(const d of L.deco){if(!vis(d.y,90))continue;const isW=d.k==='willow';if(isW!==!!over)continue;
  switch(d.k){case'tree':dspr(treeSpr(d.v),d.x,d.y,0.8*d.s);break;case'pine':dspr(pineSpr(d.v%3),d.x,d.y,0.9*d.s);break;case'willow':dspr(willowSpr(d.v),d.x,d.y,0.85*d.s,0,0.93);break;
    case'bush':dspr(bushSpr(d.v),d.x,d.y,d.s);break;case'reeds':dspr(reedsSpr(d.v%4),d.x,d.y,d.s);break;case'house':dspr(houseSpr(d.v),d.x+d.side*30,d.y,1);break;case'lamp':dspr(lampSpr(),d.x,d.y,1);break;
    case'bench':dspr(benchSpr(),d.x,d.y,1,d.side*Math.PI/2);break;case'boulder':dspr(boulderSpr(d.v%3),d.x,d.y,d.s);break;case'lodge':dspr(lodgeSpr(),d.x,d.y,1);break;case'heron':dspr(heronSpr(d.f),d.x,d.y-20,1.3);break;case'crane':dspr(craneSpr(d.f),d.x,d.y-20,1.3);break;case'deer':dspr(deerSpr(d.f),d.x,d.y-12,1.25);break;
    case'cabin':dspr(cabinSpr(d.v),d.x+d.side*30,d.y,1);break;case'mitten':dspr(mittenSpr(),d.x,d.y,1);break;case'sign':dspr(signSpr(d.t1,d.t2),d.x,d.y,1);break}}}
function drawLeaves(){const cur=L.cur;for(const f of L.leaves){const y=f.y;if(!vis(y,20))continue;const x=riverC(y)+f.x*(riverHW(y)/200);dspr(leafSpr(f.c),x+Math.sin(T*0.6+f.rot)*3,y,f.s*0.75,f.rot+T*f.vr)}}
function drawObjects(){const D=L.D;
  for(const o of L.obj){if(!vis(o.y,o.t==='dam'?60:70))continue;
    switch(o.t){
      case'lily':dspr(lilySpr(o.r>16?1:0),o.x,o.y,o.r/18,o.rot);if(o.fl){for(let i=0;i<6;i++){const a=i/6*TAU;ell(o.x+3+Math.cos(a)*3,o.y-2+Math.sin(a)*3,3,1.6,'#ffb3d9',a)}circ(o.x+3,o.y-2,1.6,'#ffe14d')}break;
      case'wave':{const k=(T*2+o.x)%1;X.strokeStyle='rgba(255,255,255,0.75)';X.lineWidth=3;X.beginPath();for(let i=0;i<=6;i++){const xx=o.x-o.w/2+i*o.w/6;X.lineTo(xx,o.y+Math.sin(i*1.4+T*6)*3)}X.stroke();ell(o.x,o.y+6,o.w/2,5,'rgba(255,255,255,0.2)');
        X.fillStyle='rgba(255,255,255,0.8)';for(let i=0;i<4;i++)circ(o.x+(hsh(i+o.x)-0.5)*o.w,o.y-2+((T*1.5+i/4)%1)*-6,1.6,'rgba(255,255,255,0.8)');break}
      case'rock':dspr(rockSpr((o.x|0)%4),o.x,o.y,o.r/18);if(D.style==='rapids'||D.cur>30){X.beginPath();X.arc(o.x,o.y+o.r*0.5,o.r+3+Math.sin(T*5+o.x)*1.5,0.2,Math.PI-0.2);X.strokeStyle='rgba(255,255,255,0.6)';X.lineWidth=2.4;X.stroke()}break;
      case'pillar':{X.fillStyle='rgba(0,20,30,0.3)';X.fillRect(o.x-o.r+3,o.y-o.r+3,o.r*2,o.r*2+4);X.fillStyle='#a9a7a1';X.fillRect(o.x-o.r,o.y-o.r,o.r*2,o.r*2);X.strokeStyle='#6f6d68';X.lineWidth=1.5;X.strokeRect(o.x-o.r,o.y-o.r,o.r*2,o.r*2);
        X.beginPath();X.arc(o.x,o.y+o.r,o.r+4,0.3,Math.PI-0.3);X.strokeStyle='rgba(255,255,255,0.45)';X.lineWidth=2;X.stroke();break}
      case'log':dspr(logSpr(),o.x,o.y,o.len/120,o.ang);break;
      case'dam':drawDam(o);break;
      case'cattail':for(let i=0;i<9;i++){const a=i/9*TAU,r=o.r*0.6*hsh(i+o.y);const x=o.x+Math.cos(a)*r,y=o.y+Math.sin(a)*r;line(x,y+5,x+1,y-6,'#6b8a34',2);ell(x+1,y-8,2.4,5.5,'#6b3e1e')}break;
      case'bear':drawBearObj(o);break;
      case'acorn':if(!o.got){if(o.pk)drawPetoskey(o.x,o.y,T);else drawAcorn(o.x,o.y,T)}break;
      case'friend':{const ox=o.on?o.on.x:o.x,oy=o.on?o.on.y:o.y,w=o.waved&&T-o.waved<2.5;if(o.k==='frog')drawFrog(ox,oy-1,w,T);else drawPainted(ox+(o.on?10:0),oy-(o.on?4:0),w,T,0.95);break}
      case'rduck':if(!o.got){drawRubberDuck(o.x,o.y,T);if((T%3)<0.25)circ(o.x+6,o.y-8,1.8+Math.sin(T*30),'rgba(255,255,255,0.9)')}break;
      case'fish':if(o.st==='warn'){const k=o.tt/0.75;X.beginPath();X.ellipse(o.x-o.dir*70,o.y,10+k*10,5+k*5,0,0,TAU);X.strokeStyle='rgba(255,255,255,'+(0.8-k*0.4)+')';X.lineWidth=2;X.stroke();ell(o.x-o.dir*70,o.y,6,3,'rgba(255,160,60,0.5)')}
        else if(o.st==='jump'){ell(o.fx,o.fy+2,10,4,'rgba(0,30,40,0.3)');drawFish(o.fx,o.fy,o.h,o.dir>0?Math.PI+(o.tt/1.05-0.5)*1.4:-(o.tt/1.05-0.5)*1.4,'#ff9a3c')}break;
      case'burp':{ell(o.x,o.y+1,16,9,'rgba(0,30,20,0.25)');ell(o.x,o.y,14,8,'#6f9a3a');circ(o.x-5,o.y-4,2.6,'#fff');circ(o.x-5,o.y-4,1.3,'#111');circ(o.x+5,o.y-4,2.6,'#fff');circ(o.x+5,o.y-4,1.3,'#111');
        const m=o.ring?3:1+Math.sin(T*3)*0.5;ell(o.x,o.y+3,4,m,'#3a2a2a');if(o.tt>2.3){circ(o.x+Math.sin(T*20)*2,o.y-12-(o.tt-2.3)*20,3,'rgba(220,255,220,0.7)')}
        if(o.ring){const k=o.ring/0.75,r=k*90;X.beginPath();X.arc(o.x,o.y,r,0,TAU);X.strokeStyle='rgba(210,255,200,'+(0.85-k*0.7)+')';X.lineWidth=7-k*4;X.stroke()}break}
      case'beaver':drawBeaver(o.x,o.y,T,Math.cos(o.ph*0.8)>0?Math.PI/2:-Math.PI/2);break}}
  for(const c of L.checks){if(!vis(c.y))continue;const x=riverC(c.y)+riverHW(c.y)-26;drawBuoy(x,c.y,c.hit)}
  const fy=L.finishY;if(vis(fy,90))drawFinish(fy)}
function drawBearObj(o){if(o.st==='carry')return;if(o.st==='float'){const bob=Math.sin(o.ph*2)*1.5;dspr(raftSpr(o.raft,o.col),o.x,o.y+bob,1,o.rot);drawBear(o.x+Math.cos(o.rot)*-2,o.y+bob-2+Math.sin(o.rot)*-2,o.rot,T*5+o.ph,0.95);
    if(Math.sin(T*3+o.ph)>0.6){txt('help!',o.x,o.y-20,9,'#fff',{sw:2.5})}}
  else{drawBear(o.x,o.y,o.rot,T*7,0.95);if(o.st==='safe'&&o.dt<4){o.dt+=1/60;txt('\u2665',o.x,o.y-14-o.dt*4,10,'#ff6fb5',{sw:0})}}}
function drawDam(o){X.save();X.fillStyle='rgba(60,38,20,0.6)';X.fillRect(o.x0,o.y-11,o.gx-o.gw/2-o.x0,22);X.fillRect(o.gx+o.gw/2,o.y-11,o.x1-o.gx-o.gw/2,22);for(let x=o.x0;x<o.x1;x+=9){if(Math.abs(x-o.gx)<o.gw/2-4)continue;for(let r=-1;r<=1;r++){const h=hsh(x*0.37+o.y+r*7.3);X.save();X.translate(x+r*3,o.y+r*8+(h-0.5)*6);X.rotate((h-0.5)*1.6);rrect(-13,-3,26,6,3);X.fillStyle=['#7a5230','#5e3c20','#94683c'][((x/9+r+3)|0)%3];X.fill();X.restore()}}
  
  // sparkle arrows marking the gap
  const a=0.5+0.5*Math.sin(T*5);txt('\u25BC',o.gx,o.y+28+Math.sin(T*5)*3,13,'rgba(255,255,255,'+a+')',{sw:0});X.restore()}
function drawBuoy(x,y,hit){const b=Math.sin(T*3+y)*1.5;ell(x+2,y+4,10,5,'rgba(0,30,40,0.3)');circ(x,y+b,9,'#fff');X.save();X.beginPath();X.arc(x,y+b,9,0,TAU);X.clip();X.fillStyle='#e53935';X.fillRect(x-9,y+b-3,18,6);X.restore();
  line(x,y+b,x,y+b-20,'#555',2);X.beginPath();X.moveTo(x,y+b-20);X.lineTo(x+12,y+b-16);X.lineTo(x,y+b-12);X.fillStyle=hit?'#52d66a':'#ffd23f';X.fill();if(!hit){circ(x,y+b-22,2.5+Math.sin(T*8),'rgba(255,255,160,0.9)')}}
function drawFinish(y){const c=riverC(y),hw=riverHW(y);for(let x=c-hw;x<c+hw;x+=16){const k=((x-c+hw)/16|0)%2;X.fillStyle=k?'#fff':'#222';X.fillRect(x,y-4,16,8)}
  for(const s of [-1,1]){const px=c+s*(hw+6);line(px,y+6,px,y-34,'#7b5233',4);}X.fillStyle='#ffd23f';rrect(c-60,y-44,120,22,8);X.fill();txt('FINISH',c,y-33,13,'#c0392b',{sw:0});
  X.fillStyle='#9a6a3a';X.fillRect(c+hw-4,y-70,60,46);for(let k=0;k<5;k++)line(c+hw-4,y-70+k*10,c+hw+56,y-70+k*10,'#7b5233',1.2)}
function drawBridges(){for(const b of L.bridges){if(!vis(b.y,60))continue;const under=Math.abs(boat.y-b.y)<b.h/2+50;X.globalAlpha=under?0.5:1;
  X.fillStyle='rgba(0,20,30,0.25)';X.fillRect(camX-10,b.y+b.h/2,VW+20,10);const g=X.createLinearGradient(0,b.y-b.h/2,0,b.y+b.h/2);g.addColorStop(0,'#c9c6bf');g.addColorStop(1,'#9c9991');X.fillStyle=g;X.fillRect(camX-10,b.y-b.h/2,VW+20,b.h);
  X.fillStyle='#7d7a73';X.fillRect(camX-10,b.y-b.h/2,VW+20,4);X.fillRect(camX-10,b.y+b.h/2-4,VW+20,4);X.fillStyle='rgba(0,0,0,0.12)';for(let x=Math.floor(camX/40)*40;x<camX+VW+40;x+=40)X.fillRect(x,b.y-b.h/2+4,2,b.h-8);
  line(camX-10,b.y,camX+VW+10,b.y,'rgba(255,230,120,0.5)',1.5);X.globalAlpha=1;if(!under&&boat.y>b.y&&boat.y-b.y<260)txt('LOW BRIDGE!',riverC(b.y),b.y,12,'#fff',{sw:3})}}
function drawTunnelArches(){for(const t of L.tunnels){for(const y of [t.y0,t.y1]){if(!vis(y,60))continue;const c=riverC(y),hw=riverHW(y);X.fillStyle='#6d6a64';X.fillRect(camX-10,y-16,VW+20,32);
    for(let x=Math.floor((camX-10)/22)*22;x<camX+VW+22;x+=22){X.fillStyle=((x/22)|0)%2?'#85817a':'#77736c';X.fillRect(x+1,y-15,20,14);X.fillRect(x+12,y+1,20,14)}
    X.fillStyle='rgba(10,10,20,0.55)';X.beginPath();X.ellipse(c,y+(y===t.y0?14:-14),hw*0.9,12,0,y===t.y0?0:Math.PI,y===t.y0?Math.PI:TAU);X.fill();
    if(y===t.y0&&boat.y>y)txt('TUNNEL',c,y,12,'#ffe9a0',{sw:3})}}}
function headMask(){if(dk)return dk;const len=290,sp=0.46,S=len*2,k=0.5,c=document.createElement('canvas');c.width=c.height=S*k;const g=c.getContext('2d');g.scale(k,k);
  g.fillStyle='rgba(4,6,16,0.93)';g.fillRect(0,0,S,S);g.globalCompositeOperation='destination-out';const ax=len,ay=len,a=-Math.PI/2;
  const gr=g.createRadialGradient(ax,ay,10,ax,ay,len);gr.addColorStop(0,'rgba(0,0,0,1)');gr.addColorStop(0.7,'rgba(0,0,0,0.85)');gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.beginPath();g.moveTo(ax,ay);g.arc(ax,ay,len-2,a-sp,a+sp);g.closePath();g.fill();
  const g2=g.createRadialGradient(ax,ay+20,10,ax,ay+20,95);g2.addColorStop(0,'rgba(0,0,0,0.85)');g2.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=g2;g.fillRect(ax-100,ay-80,200,200);
  g.globalCompositeOperation='source-over';g.globalAlpha=0.1;g.fillStyle='#fff3a0';g.beginPath();g.moveTo(ax,ay);g.arc(ax,ay,len*0.8,a-sp*0.8,a+sp*0.8);g.closePath();g.fill();
  dk={c,len};return dk}
// tunnel darkness: one cached half-res headlamp mask (cone + glow) rotated with the canoe; the rest is a single dark fill (no per-frame offscreen compositing)
function drawDarkness(){let t=null;for(const q of L.tunnels)if(q.y1<camY+VH&&q.y0>camY){t=q;break}if(!t)return;
  const top=Math.max(camY,t.y1+14),bot=Math.min(camY+VH,t.y0-14);if(bot<=top)return;const m=headMask(),len=m.len;
  const ax=boat.x+Math.sin(boat.ang)*20,ay=boat.y-Math.cos(boat.ang)*20;
  X.save();X.beginPath();X.rect(camX-2,top,VW+4,bot-top);X.clip();X.translate(ax,ay);X.rotate(boat.ang);X.drawImage(m.c,-len,-len,len*2,len*2);
  const B=2400,e=len-1.5;X.fillStyle='rgba(4,6,16,0.93)';X.beginPath();X.rect(-B,-B,2*B,2*B);X.rect(-e,-e,2*e,2*e);X.fill('evenodd');X.restore();
  if(dadOut()&&dad.y>top&&dad.y<bot){X.globalAlpha=0.35;circ(dad.x,dad.y,30,'#fff3a0');X.globalAlpha=1;drawDadSwim(dad.x,dad.y,T,dad.soggy)}
  for(const o of L.obj)if(o.t==='acorn'&&!o.got&&o.y>top&&o.y<bot&&vis(o.y)){X.globalAlpha=0.5+0.3*Math.sin(T*6+o.x);circ(o.x,o.y,5,o.pk?'#cfd8dc':'#ffd23f');X.globalAlpha=1}}
function drawWake(){const sp=boat.s+L.cur;if(sp<20)return;const a=clamp(sp/250,0,0.6),c=Math.cos(boat.ang),s=Math.sin(boat.ang),bx=boat.x+s*40,by=boat.y-c*40;
  X.strokeStyle='rgba(255,255,255,'+a+')';X.lineWidth=2;for(const k of [-1,1]){X.beginPath();X.moveTo(bx,by);X.lineTo(boat.x+k*34-s*80,boat.y+c*90);X.stroke()}
  for(let i=0;i<3;i++){const k=((T*1.4+i/3)%1);ell(boat.x-s*(50+k*40),boat.y+c*(50+k*40),10+k*16,4+k*4,'rgba(255,255,255,'+(a*0.5*(1-k))+')')}}
function drawCanoe(){const b=boat;if(inv>0&&Math.floor(T*12)%2&&state==='play'){X.globalAlpha=0.55}
  drawWake();X.save();X.translate(b.x,b.y);X.rotate(b.ang);
  if(canoeSel==='rocket'&&(b.rhythm>=2||b.s>120)){for(let i=0;i<3;i++){const k=R();ell(0,CL/2+8+k*14,5-k*3,8+k*8,i?'#ffd23f':'#ff6a1f')}}
  const s=canoeSpr(canoeSel);X.drawImage(s.c,-s.w/2,-s.h/2,s.w,s.h);
  if(canoeSel==='pirate'){line(0,-10,0,-40,'#4a2a14',2.4);X.beginPath();X.moveTo(0,-40);X.lineTo(16+Math.sin(T*6)*2,-35);X.lineTo(0,-29);X.fillStyle='#222';X.fill();circ(5,-35,1.8,'#fff')}
  if(b.poop){for(let i=0;i<Math.min(3,b.poop);i++)ell(-6+i*7,8-i*14,4,3,'rgba(240,244,228,0.95)')}
  // cargo on the bow: rescued woolly bears & a flower for the turtle
  carry.forEach((o,i)=>drawBear(-5+i*5,-42+i*5,0.4-i*0.6,T*6+i,0.7));if(flowerCarry)drawFlower(0,-40,T,0.55);
  const dk2=inTunnel(b.y);
  const dadIn=dad.st==='boat'||dad.st==='wind';
  if(dadIn)drawDad(0,24,{side:-b.side,ph:b.dph,brace:b.brake,duck:b.duck,soggy:dad.soggy,hat:dad.hat,lean:dad.lean,sneeze:dad.sneeze,reach:dad.reach});
  else if(dad.st==='climb'){const k=dad.t/0.75;X.restore();X.save();const x=lerp(dad.cx,b.x,k),y=lerp(dad.cy,b.y+24,k);drawDadSwim(x,y,T,dad.soggy);X.restore();X.save();X.translate(b.x,b.y);X.rotate(b.ang)}
  drawAlex(0,-20,{side:b.side,ph:b.ph,brace:b.brake,duck:b.duck,wave:b.wave>0,cheer:b.cheer>0||state==='clear'||state==='bosswin',lamp:!!dk2,turn:b.turn});
  if(inv>0&&b.spin>0){for(let i=0;i<3;i++){const a=T*8+i*2.1;txt('\u2605',Math.cos(a)*10,-34+Math.sin(a)*4,8,'#ffe14d',{sw:0})}}
  X.restore();X.globalAlpha=1;
  if(dad.st==='fly'){const k=Math.min(1,dad.t/0.6);ell(dad.fx,dad.fy+4,12,5,'rgba(0,30,40,0.3)');X.save();X.translate(dad.fx,dad.fy-dad.h);X.rotate(k*5*dad.side);drawDad(0,0,{side:1,ph:1,soggy:dad.soggy,hat:dad.hat,reach:1});X.restore()}
  if(dad.st==='water')drawDadSwim(dad.x,dad.y,T,dad.soggy);
  if(dad.frog){const f=dad.frog,h=f.hop?Math.min(1,f.hop):0;drawFrog(f.x+h*40*dad.side,f.y-Math.sin(h*Math.PI)*24,false,T)}
  // shore hint while carrying
  if(carry.length&&state==='play'){const c=riverC(b.y),side=b.x<c?-1:1,hx=c+side*(riverHW(b.y)+4),a=0.6+0.4*Math.sin(T*6);txt(side<0?'\u25C0 SHORE':'SHORE \u25B6',hx-side*44,b.y-8,11,'rgba(255,220,150,'+a+')',{sw:3})}}
function drawGeese(){for(const p of poops){const k=Math.min(1,p.t/0.6);if(p.t<0.6){X.beginPath();X.arc(p.x,p.y,30-k*12,0,TAU);X.strokeStyle='rgba(255,255,255,'+(0.4+k*0.5)+')';X.lineWidth=2.5;X.setLineDash([5,4]);X.stroke();X.setLineDash([]);ell(p.x,p.y,8*k,5*k,'rgba(0,0,0,0.25)');
      circ(p.x,p.y-(1-k)*90,4+k*2,'rgba(245,248,235,0.95)')}}
  for(const g of geese){ell(g.x+20,g.y+40,16,8,'rgba(0,20,30,0.22)')}
  for(const g of geese){const dir=Math.atan2(g.vy,g.vx)+Math.PI/2;drawGoose(g.x,g.y,g.flap,dir,g.kind==='hat'&&g.got)}
  for(const g of geese)if(g.kind==='poop'&&!g.dropped){X.beginPath();X.arc(g.tx,g.ty,30,0,TAU);X.strokeStyle='rgba(255,255,255,0.35)';X.lineWidth=2;X.setLineDash([4,5]);X.stroke();X.setLineDash([]);txt('!',g.tx,g.ty,14,'rgba(255,255,255,0.7)',{sw:0})}}
function drawBoss(){const b=boss;if(!b)return;const happy=b.st==='happy',rise=b.st==='intro'?ease(b.t/1.6):1,neck={x:b.x,y:b.y+62*BS};
  X.save();X.globalAlpha=0.35+0.65*rise;const hx=b.hx,hy=b.hy;X.lineCap='round';line(neck.x,neck.y,hx,hy,'#5f6d30',20);line(neck.x,neck.y,hx,hy,'#7f8d48',12);
  X.save();X.translate(b.x,b.y);X.scale(BS,BS);X.translate(-b.x,-b.y);
  ell(b.x+6,b.y+10,100,84,'rgba(0,30,30,0.3)');
  // legs/flippers
  for(const [dx,dy,r] of [[-82,-40,-0.6],[82,-40,0.6],[-74,52,0.5],[74,52,-0.5]]){const w=Math.sin(T*3+dx)*0.2;ell(b.x+dx,b.y+dy,24,12,'#6f7d3a',r+w)}
  ell(b.x,b.y-90,12,26,'#6f7d3a');
  // shell with spiky ridges
  ell(b.x,b.y,92,80,happy?'#6a7a32':'#4a5226');X.strokeStyle='#2c3214';X.lineWidth=3;X.stroke();
  for(const [dx,dy] of [[0,-40],[-42,-14],[42,-14],[0,6],[-36,32],[36,32],[0,48]]){X.beginPath();for(let i=0;i<6;i++){const a=i/6*TAU;X.lineTo(b.x+dx+Math.cos(a)*22,b.y+dy+Math.sin(a)*20)}X.closePath();X.fillStyle=happy?'#87973f':'#5d6a2c';X.fill();X.strokeStyle='#2c3214';X.lineWidth=2;X.stroke();
    X.beginPath();X.moveTo(b.x+dx-6,b.y+dy+4);X.lineTo(b.x+dx,b.y+dy-10);X.lineTo(b.x+dx+6,b.y+dy+4);X.fillStyle='#3a4218';X.fill()}
  if(b.mood>0||happy){const n=happy?14:b.mood*3;for(let i=0;i<n;i++){const a=hsh(i)*TAU,r=hsh(i*3)*60;drawFlower(b.x+Math.cos(a)*r,b.y+Math.sin(a)*r*0.8,T*0.3+i,0.45)}}
  X.restore();
  // head
  X.save();X.translate(hx,hy);const ang=Math.atan2(hy-neck.y,hx-neck.x)-Math.PI/2;X.rotate(ang);X.scale(0.85,0.85);
  ell(0,0,26,22,'#7f8d48');X.strokeStyle='#4a5226';X.lineWidth=2;X.stroke();
  const open=b.st==='lunge'||b.st==='dizzy'||b.st==='warn'&&Math.sin(T*30)>0;
  X.beginPath();X.moveTo(-14,12);X.quadraticCurveTo(0,30,14,12);X.lineTo(0,24);X.closePath();X.fillStyle='#c9b27a';X.fill();
  if(open){ell(0,16,10,7,'#7a2e2e')}if(happy){X.beginPath();X.arc(0,8,10,0.2,Math.PI-0.2);X.strokeStyle='#3a2a10';X.lineWidth=2.5;X.stroke()}
  const ey=-2,warn=b.st==='warn';for(const s of [-1,1]){circ(s*11,ey,6.5,'#fff');circ(s*11+(happy?0:s*-1),ey+1,3.4,warn?'#d32f2f':'#222');
    if(!happy){line(s*5,ey-7+(b.mood*1.5),s*17,ey-11-(b.mood*0.5)+(b.mood>=2?3:0),'#2c3214',3)}else{X.beginPath();X.arc(s*11,ey-3,6,Math.PI+0.3,TAU-0.3);X.strokeStyle='#2c3214';X.lineWidth=2;X.stroke()}}
  if(happy||b.mood>=2){ell(-16,8,4,2.5,'rgba(255,120,150,0.6)');ell(16,8,4,2.5,'rgba(255,120,150,0.6)')}
  X.restore();
  if(b.st==='dizzy'){for(let i=0;i<4;i++){const a=T*6+i*TAU/4;txt('\u2605',hx+Math.cos(a)*24,hy-26+Math.sin(a)*8,12,'#ffe14d',{sw:2})}if(flowerCarry)txt('FEED ME!',hx,hy-48,12,'#ff9bd0',{sw:3})}
  if(b.st==='warn'||b.st==='lunge'){const k=b.st==='warn'?(Math.sin(T*18)*0.5+0.5):1;X.beginPath();X.arc(b.tx,b.ty,34,0,TAU);X.strokeStyle='rgba(255,60,60,'+(0.5+0.5*k)+')';X.lineWidth=4;X.setLineDash([8,6]);X.stroke();X.setLineDash([]);line(b.tx-12,b.ty,b.tx+12,b.ty,'rgba(255,60,60,0.8)',3);line(b.tx,b.ty-12,b.tx,b.ty+12,'rgba(255,60,60,0.8)',3);if(b.st==='warn')txt('SNAP!',b.tx,b.ty-44,13,'#ff5252',{sw:3})}
  X.restore();
  for(const f of flowers){drawFlower(f.x,f.y+Math.sin(T*2+f.x)*2,T,0.9);if(!flowerCarry)txt('\u25BC',f.x,f.y-22+Math.sin(T*6)*3,10,'#ff9bd0',{sw:2})}
  // mood meter
  if(state==='play'||state==='bosswin'){const x0=b.x-60,y0=Math.max(camY+70,b.y-60);rrect(x0,y0,120,16,8);X.fillStyle='rgba(0,0,0,0.4)';X.fill();for(let i=0;i<3;i++){txt('\u2665',x0+30+i*30,y0+8,14,i<b.mood?'#ff6fb5':'rgba(255,255,255,0.35)',{sw:0})}
    txt(happy?'HAPPY OLD MOSSBACK!':'OLD MOSSBACK (GRUMPY)',b.x,y0-10,11,'#fff',{sw:3})}}
function drawParts(){for(const p of parts){const k=p.life/p.max;
  if(p.k==='ring'){const r=lerp(p.r0,p.r1,k);X.beginPath();X.ellipse(p.x,p.y,r,r*0.6,0,0,TAU);X.strokeStyle='rgba('+p.col+','+(0.8*(1-k))+')';X.lineWidth=2;X.stroke()}
  else if(p.k==='conf'){X.save();X.translate(p.x,p.y);X.rotate(p.rot);X.fillStyle=p.col;X.fillRect(-p.sz/2,-p.sz/4,p.sz,p.sz/2);X.restore()}
  else if(p.k==='bub'){X.beginPath();X.arc(p.x,p.y,p.sz*(0.6+k*0.6),0,TAU);X.strokeStyle='rgba(220,255,220,'+(1-k)+')';X.lineWidth=1.4;X.stroke()}
  else if(p.k==='heart'){txt('\u2665',p.x,p.y,p.sz*2.4,p.col,{sw:0})}
  else{X.globalAlpha=1-k;circ(p.x,p.y,p.sz,p.col);X.globalAlpha=1}}}
function drawFloats(){for(const f of floats){const k=f.t/1.4;X.globalAlpha=1-k*k;txt(f.s,f.x,f.y-k*30,f.sz,f.col,{sw:Math.max(3,f.sz*0.2)});X.globalAlpha=1}}
function drawSmear(){for(const s of smear){const a=s.t<0.1?s.t*10:s.t>1.8?1-(s.t-1.8)/0.8:1;dspr(poopSpr(s.v),s.x,s.y+s.t*s.dr,s.s,0,clamp(a,0,1)*0.92)}}
function drawWorld(){const sx=shake>0?rr(-1,1)*shake*10:0,sy=shake>0?rr(-1,1)*shake*10:0;X.save();X.translate(-camX+sx,-camY+sy);
  drawRiver();drawReflections();drawLeaves();drawDeco(false);drawObjects();drawBoss();
  for(const g of geese)ell(g.x+18,g.y+38,0,0,'#000');
  drawCanoe();drawDeco(true);drawBridges();drawTunnelArches();drawGeese();drawParts();drawFloats();
  drawDarkness();drawDadHint();
  X.restore();drawSmear()}
// "Paddle to Dad!" helper: pulsing pickup ring around Dad + an arrow from the canoe pointing at him
function drawDadHint(){if(dad.st!=='water'||state!=='play')return;const dx=dad.x-boat.x,dy=dad.y-boat.y,d=Math.hypot(dx,dy)||1,p=0.5+0.5*Math.sin(T*7);
  X.lineWidth=3;X.strokeStyle='rgba(255,225,77,'+(0.55+0.4*p)+')';X.setLineDash([8,6]);X.beginPath();X.arc(dad.x,dad.y,26+DAD_GRAB*0.5+p*4,0,TAU);X.stroke();X.setLineDash([]);
  if(dad.t>1.3||dad.self)txt(dad.self?'Doggy paddle!':'Paddle to Dad!',dad.x,dad.y-46-p*3,14,'#ffe14d',{st:'#5a2a00',sw:4});
  if(d>70){const ux=dx/d,uy=dy/d,r0=46,ax=boat.x+ux*r0,ay=boat.y+uy*r0,L2=Math.min(46,d-60);X.save();X.translate(ax,ay);X.rotate(Math.atan2(uy,ux));X.globalAlpha=0.75+0.25*p;
    X.fillStyle='#ffe14d';X.strokeStyle='#5a2a00';X.lineWidth=3;X.beginPath();X.moveTo(0,-5);X.lineTo(L2,-5);X.lineTo(L2,-13);X.lineTo(L2+18,0);X.lineTo(L2,13);X.lineTo(L2,5);X.lineTo(0,5);X.closePath();X.stroke();X.fill();X.restore()}
  if(dad.self===undefined||!dad.self){const left=Math.max(0,10-dad.t);if(left<4){txt('Dad swims over in '+Math.ceil(left)+'...',dad.x,dad.y+62,11,'#fff',{sw:3})}}}
