// ================= art: procedural canvas sprites & characters (all original) =================
function rrect(x,y,w,h,r){r=Math.max(0,Math.min(r,w/2,h/2));X.beginPath();X.moveTo(x+r,y);X.arcTo(x+w,y,x+w,y+h,r);X.arcTo(x+w,y+h,x,y+h,r);X.arcTo(x,y+h,x,y,r);X.arcTo(x,y,x+w,y,r);X.closePath()}
function txt(s,x,y,sz,fill,o){o=o||{};X.font=(o.w||'bold ')+sz+'px '+FONT;X.textAlign=o.a||'center';X.textBaseline=o.b||'middle';
  if(o.sw!==0){X.lineJoin='round';X.lineWidth=o.sw||Math.max(3,sz*0.18);X.strokeStyle=o.st||'#1d3b4a';X.strokeText(s,x,y)}X.fillStyle=fill;X.fillText(s,x,y)}
const hsh=i=>{const s=Math.sin(i*127.1+311.7)*43758.5453;return s-Math.floor(s)};
function circ(x,y,r,f){X.beginPath();X.arc(x,y,Math.max(0.1,r),0,TAU);X.fillStyle=f;X.fill()}
function ell(x,y,rx,ry,f,rot){X.beginPath();X.ellipse(x,y,Math.max(0.1,rx),Math.max(0.1,ry),rot||0,0,TAU);X.fillStyle=f;X.fill()}
function line(x1,y1,x2,y2,c,w){X.beginPath();X.moveTo(x1,y1);X.lineTo(x2,y2);X.strokeStyle=c;X.lineWidth=w;X.lineCap='round';X.stroke()}
function shade(hex,k){const n=parseInt(hex.slice(1),16);let r=n>>16,g=(n>>8)&255,b=n&255;const f=v=>Math.round(clamp(k<0?v*(1+k):v+(255-v)*k,0,255));return'#'+((1<<24)|(f(r)<<16)|(f(g)<<8)|f(b)).toString(16).slice(1)}
// ---------- sprite cache: draw once into an offscreen canvas (3x), then drawImage (fast on the A10) ----------
const SPR=3,SP={};
function spr(key,w,h,fn){let s=SP[key];if(s)return s;const c=document.createElement('canvas');c.width=Math.ceil(w*SPR);c.height=Math.ceil(h*SPR);const g=c.getContext('2d');
  const save=X;X=g;X.setTransform(SPR,0,0,SPR,w*SPR/2,h*SPR/2);try{fn()}finally{X=save}s={c,w,h};SP[key]=s;return s}
function dspr(s,x,y,sc,rot,a){if(a!==undefined&&a<1)X.globalAlpha=a;if(rot){X.save();X.translate(x,y);X.rotate(rot);X.drawImage(s.c,-s.w*sc/2,-s.h*sc/2,s.w*sc,s.h*sc);X.restore()}
  else X.drawImage(s.c,x-s.w*sc/2,y-s.h*sc/2,s.w*sc,s.h*sc);if(a!==undefined&&a<1)X.globalAlpha=1}
// ---------- canoe hulls (pointing up) ----------
const CL=104,CW=32;
function hullPath(l,w){X.beginPath();X.moveTo(0,-l/2);X.bezierCurveTo(w*0.62,-l*0.36,w*0.56,l*0.32,0,l/2);X.bezierCurveTo(-w*0.56,l*0.32,-w*0.62,-l*0.36,0,-l/2);X.closePath()}
function canoeSpr(id){return spr('canoe_'+id,CW+16,CL+30,()=>{
  ell(3,4,CW*0.55,CL*0.5,'rgba(0,30,40,0.28)');
  if(id==='silver'){hullPath(CL,CW);const g=X.createLinearGradient(-CW/2,0,CW/2,0);g.addColorStop(0,'#8e979e');g.addColorStop(0.28,'#e9eef2');g.addColorStop(0.5,'#cfd7dd');g.addColorStop(1,'#7c858c');X.fillStyle=g;X.fill();
    X.lineWidth=2.4;X.strokeStyle='#5d666d';X.stroke();hullPath(CL-10,CW-9);X.fillStyle='#b3bcc3';X.fill();hullPath(CL-10,CW-9);X.strokeStyle='#8a939a';X.lineWidth=1;X.stroke();
    X.fillStyle='rgba(255,255,255,0.55)';for(let k=-4;k<=4;k++){X.fillRect(-CW*0.42+1,k*10,1.4,1.4);X.fillRect(CW*0.42-2.4,k*10,1.4,1.4)}
    for(let k=-3;k<=3;k++)line(-CW*0.34,k*12,CW*0.34,k*12,'rgba(120,130,138,0.5)',0.8);
    line(0,-CL*0.42,0,CL*0.42,'rgba(255,255,255,0.35)',1.2)}
  else if(id==='rocket'){hullPath(CL,CW);const g=X.createLinearGradient(-CW/2,0,CW/2,0);g.addColorStop(0,'#a0141c');g.addColorStop(0.35,'#ff5a4e');g.addColorStop(1,'#8c1018');X.fillStyle=g;X.fill();X.lineWidth=2.4;X.strokeStyle='#5a0a10';X.stroke();
    X.save();hullPath(CL,CW);X.clip();X.fillStyle='#dfe6ec';X.fillRect(-CW,-CL/2,CW*2,18);X.fillStyle='#fff';X.fillRect(-3,-CL/2+18,6,CL-30);X.restore();
    hullPath(CL-12,CW-10);X.fillStyle='#c62828';X.fill();
    for(const s of [-1,1]){X.beginPath();X.moveTo(s*CW*0.36,CL*0.22);X.lineTo(s*(CW*0.36+9),CL*0.44);X.lineTo(s*CW*0.2,CL*0.4);X.closePath();X.fillStyle='#ffca28';X.fill();X.strokeStyle='#5a0a10';X.lineWidth=1.5;X.stroke()}
    circ(0,-CL*0.2,4.5,'#4fc3f7');X.strokeStyle='#fff';X.lineWidth=1.5;X.stroke()}
  else if(id==='pirate'){hullPath(CL,CW);const g=X.createLinearGradient(-CW/2,0,CW/2,0);g.addColorStop(0,'#4a2a14');g.addColorStop(0.4,'#9a6235');g.addColorStop(1,'#4a2a14');X.fillStyle=g;X.fill();
    X.save();hullPath(CL,CW);X.clip();for(let k=-3;k<=3;k++)line(k*5,-CL/2,k*5,CL/2,'rgba(40,20,8,0.5)',1);X.restore();X.lineWidth=3;X.strokeStyle='#d9a628';hullPath(CL,CW);X.stroke();
    hullPath(CL-12,CW-10);X.fillStyle='#6d4322';X.fill();circ(0,6,6,'#f5f0e1');circ(-2,5,1.3,'#222');circ(2,5,1.3,'#222');line(-6,12,6,16,'#f5f0e1',2);line(6,12,-6,16,'#f5f0e1',2)}
  else if(id==='hotdog'){hullPath(CL+4,CW+6);const g=X.createLinearGradient(-CW/2,0,CW/2,0);g.addColorStop(0,'#b9772f');g.addColorStop(0.35,'#f0b867');g.addColorStop(1,'#a8682a');X.fillStyle=g;X.fill();X.strokeStyle='#7a4a1a';X.lineWidth=2;X.stroke();
    ell(0,0,CW*0.3,CL*0.52,'#c0442a');ell(-2,0,CW*0.12,CL*0.48,'rgba(255,170,140,0.5)');
    X.beginPath();for(let k=0;k<=14;k++){const yy=-CL*0.44+k*CL*0.88/14;X.lineTo((k%2?4:-4),yy)}X.strokeStyle='#ffd31a';X.lineWidth=3;X.lineJoin='round';X.stroke()}
  // seats / thwarts
  const sc=id==='hotdog'?'#e6c79a':'#7b5233';rrect(-CW*0.4,-CL*0.3,CW*0.8,7,2);X.fillStyle=sc;X.fill();rrect(-CW*0.38,CL*0.27,CW*0.76,7,2);X.fill();
  if(id!=='hotdog')line(-CW*0.43,0,CW*0.43,0,'#6a6f74',2)})}
// ---------- characters (seen from behind, 3/4 above, so we look over their shoulders down the river) ----------
const SKIN='#f2c29b',SKIN2='#d9a27c';
// paddle: side -1 left / +1 right, ph 0..1 stroke phase (blade sweeps front->back while in water), brace=brake
function paddle(cx,cy,side,ph,blade,brace,len){len=len||1;let by,inW;
  if(brace){by=cy+10;inW=1}else if(ph<0.55){by=cy-22*len+ph/0.55*40*len;inW=1}else{const k=(ph-0.55)/0.45;by=cy+18*len-k*40*len;inW=0}
  const bx=cx+side*22*len,hx=cx+side*5,hy=cy-2;
  line(cx-side*7,cy-14*len,bx,by,'#8a5a2b',2.6);
  if(inW){ell(bx,by+3,9,4,'rgba(255,255,255,0.35)')}
  ell(bx,by,4.5,inW?9:8,blade,0);X.strokeStyle='rgba(0,0,0,0.35)';X.lineWidth=1;X.stroke();
  circ(hx,hy-2,3.4,SKIN);circ(cx-side*5,cy-11,3.4,SKIN)}
function drawAlex(x,y,o){// o: {side,ph,brace,duck,wave,cheer,lamp,turn}
  X.save();X.translate(x,y);const sq=1-(o.duck||0)*0.35;X.scale(1,sq);
  // shorts + legs (tan) forward of the seat
  ell(-4,-9,4,6,'#c9ab7a');ell(4,-9,4,6,'#c9ab7a');
  // body: green shirt arms + red life vest with white straps
  const wv=o.wave?Math.sin(T*14)*0.5:0;
  if(o.cheer){line(-8,0,-15,-16,'#3fa34d',5);line(8,0,15,-16,'#3fa34d',5);circ(-15,-17,3.4,SKIN);circ(15,-17,3.4,SKIN)}
  else if(o.wave){line(-8,0,-12,6,'#3fa34d',5);line(8,-1,18,-10+wv*8,'#3fa34d',5);circ(19,-12+wv*8,3.6,SKIN)}
  else{line(-8,-1,-6,-9,'#3fa34d',5);line(8,-1,6,-9,'#3fa34d',5)}
  rrect(-10,-6,20,17,6);X.fillStyle='#d8322f';X.fill();X.strokeStyle='#8f1c1a';X.lineWidth=1.2;X.stroke();
  line(-4.5,-6,-4.5,11,'#fff',2);line(4.5,-6,4.5,11,'#fff',2);line(-9,5,9,5,'#fff',1.8);rrect(-2,3,4,4,1);X.fillStyle='#222';X.fill();
  ell(0,-7,5,2.4,'#3fa34d');
  // head: short dark brown hair (back of head), ears, a peek of cheek when turned
  const tr=(o.turn||0)*3;circ(-7.4+tr*0.3,-12,2.2,SKIN);circ(7.4+tr*0.3,-12,2.2,SKIN);
  if(tr){ell(tr*2.2,-12.5,6,6.5,SKIN)}
  circ(0,-13,7.2,'#4a2c1a');ell(-1.5,-16,3.5,2,'#6b432a');
  if(o.lamp){rrect(-6,-20,12,3,1.5);X.fillStyle='#333';X.fill();circ(0,-20.5,2.4,'#fff8c0')}
  X.restore();
  if(!o.cheer&&!o.wave)paddle(x,y,o.side,o.ph,'#3fbf4a',o.brace,1)}
function drawDad(x,y,o){// o: {side,ph,brace,duck,soggy,hat,lean,sneeze,reach}
  X.save();X.translate(x,y);X.rotate(o.lean||0);const sq=1-(o.duck||0)*0.35;X.scale(1.15,1.15*sq);
  ell(-5,-10,4.6,7,'#55606e');ell(5,-10,4.6,7,'#55606e');
  if(o.reach){line(-9,0,-14,-20,'#3a63b8',5.5);line(9,0,14,-22,'#3a63b8',5.5);circ(-14,-21,3.6,SKIN);circ(14,-23,3.6,SKIN)}
  else{line(-9,-1,-7,-10,'#3a63b8',5.5);line(9,-1,7,-10,'#3a63b8',5.5)}
  rrect(-11,-7,22,19,6);X.fillStyle='#f39c1f';X.fill();X.strokeStyle='#a55f0b';X.lineWidth=1.2;X.stroke();line(-5,-7,-5,12,'#333',1.8);line(5,-7,5,12,'#333',1.8);
  ell(0,-8,6,2.6,'#3a63b8');
  circ(-8,-13,2.3,SKIN);circ(8,-13,2.3,SKIN);circ(0,-14,7.8,'#6b4a2e');
  const sg=o.soggy||0;
  if(sg>=1){X.strokeStyle='rgba(70,130,200,0.9)';X.lineWidth=1.3;for(let i=-2;i<=2;i++){X.beginPath();X.moveTo(i*3,-8);X.lineTo(i*3+0.5,-5);X.stroke()}ell(-2,-18,3.5,1.5,'rgba(255,255,255,0.35)')}
  if(o.hat&&sg<3){ell(0,-15,10.5,9,'#7d8a4e');ell(0,-16,7,6,'#96a35e');X.strokeStyle='#5d6a36';X.lineWidth=1;X.stroke()}
  if(sg>=2){X.save();X.translate(1,-19);X.rotate(Math.sin(T*9)*0.35);ell(0,0,7,3.4,'#ff8a3d');X.beginPath();X.moveTo(6,0);X.lineTo(11,-4);X.lineTo(11,4);X.closePath();X.fillStyle='#ff8a3d';X.fill();circ(-4,-1,1,'#222');X.restore()}
  if(sg>=3){X.beginPath();X.arc(0,-17,11,0.35,TAU-0.05);X.lineTo(0,-17);X.closePath();X.fillStyle='#3f9b3a';X.fill();X.strokeStyle='#2a6b26';X.lineWidth=1;X.stroke();for(let i=0;i<5;i++){const a=i/5*TAU;ell(-3+Math.cos(a)*2.6,-21+Math.sin(a)*2.6,2.2,1.4,'#ff8fc8',a)}circ(-3,-21,1.6,'#ffe14d')}
  if(o.sneeze){const k=o.sneeze;for(let i=0;i<5;i++)circ(Math.cos(i)*k*14,-28-k*20-i*3,1.5+i*0.3,'rgba(220,240,255,0.8)')}
  X.restore();
  if(!o.reach)paddle(x,y+2,o.side,o.ph,'#a0703a',o.brace,1.12)}
function drawDadSwim(x,y,t,sg,ang){// floating in his life vest, flailing & sputtering (silly, never scary)
  const bob=Math.sin(t*5)*1.5;ell(x,y+2,24,15,'rgba(255,255,255,0.28)');X.save();X.translate(x,y+bob);
  for(let i=0;i<3;i++){const k=((t*1.2+i/3)%1);X.beginPath();X.ellipse(0,4,14+k*26,8+k*14,0,0,TAU);X.strokeStyle='rgba(255,255,255,'+(0.5*(1-k))+')';X.lineWidth=1.5;X.stroke()}
  const fl=Math.sin(t*16);line(-9,0,-20,-12+fl*7,'#3a63b8',5);line(9,0,20,-12-fl*7,'#3a63b8',5);circ(-21,-13+fl*7,3.6,SKIN);circ(21,-13-fl*7,3.6,SKIN);
  rrect(-12,-4,24,13,6);X.fillStyle='#f39c1f';X.fill();
  circ(0,-9,8.5,SKIN);ell(0,-15,8,4,'#6b4a2e');circ(-3,-10,1.5,'#222');circ(3,-10,1.5,'#222');ell(0,-5,2.4,2.8,'#7a2e2e');
  if(sg>=2){X.save();X.translate(2,-17);X.rotate(Math.sin(t*9)*0.4);ell(0,0,6,3,'#ff8a3d');X.restore()}
  if(sg>=3){ell(0,-17,10,5,'#3f9b3a')}
  X.restore();const sp=(t*2)%1;for(let i=0;i<4;i++)circ(x+Math.sin(i*2+t*3)*5,y-16-sp*16-i*5,1.6,'rgba(200,235,255,'+(1-sp)+')')}
// ---------- woolly bear caterpillar (fuzzy, black ends, rusty-orange middle) ----------
function drawBear(x,y,rot,wig,sc){X.save();X.translate(x,y);X.rotate(rot||0);sc=sc||1;X.scale(sc,sc);const n=9;
  for(let i=0;i<n;i++){const px=(i-(n-1)/2)*3.1,py=Math.sin(i*0.9+(wig||0))*1.3,col=(i<2||i>n-3)?'#1b1410':'#b5521c';
    X.strokeStyle=col;X.lineWidth=0.8;for(let a=0;a<6;a++){const an=a/6*TAU+i;X.beginPath();X.moveTo(px,py);X.lineTo(px+Math.cos(an)*4.4,py+Math.sin(an)*4.4);X.stroke()}
    circ(px,py,3,col)}
  circ(-(n-1)/2*3.1-2.6,Math.sin(wig||0)*1.3,2.2,'#2a201a');circ(-(n-1)/2*3.1-3.4,-1,0.7,'#fff');X.restore()}
function leafPath(s,maple){X.beginPath();if(maple){const P=[[0,-1],[0.25,-0.55],[0.62,-0.72],[0.5,-0.25],[0.95,-0.1],[0.55,0.2],[0.6,0.55],[0.2,0.38],[0.05,0.8],[-0.05,0.8],[-0.2,0.38],[-0.6,0.55],[-0.55,0.2],[-0.95,-0.1],[-0.5,-0.25],[-0.62,-0.72],[-0.25,-0.55]];P.forEach(([x,y],i)=>i?X.lineTo(x*s,y*s):X.moveTo(x*s,y*s))}
  else{X.moveTo(0,-s);X.quadraticCurveTo(s*0.75,-s*0.1,0,s*0.8);X.quadraticCurveTo(-s*0.75,-s*0.1,0,-s)}X.closePath()}
const LEAFC=['#f2b631','#ef7d22','#e2552a','#f4cf3a','#c94a1f'];
function leafSpr(c){return spr('leaf'+c,26,26,()=>{leafPath(11,c%2===0);X.fillStyle=LEAFC[c];X.fill();X.strokeStyle=shade(LEAFC[c],-0.3);X.lineWidth=0.8;X.stroke();line(0,10,0,-8,shade(LEAFC[c],-0.35),0.8)})}
function raftSpr(kind,col){return spr('raft'+kind+col,64,40,()=>{
  ell(2,3,26,13,'rgba(0,30,40,0.25)');
  if(kind==='leaf'){X.save();X.rotate(Math.PI/2);X.scale(1,1.45);leafPath(18,true);X.restore();X.fillStyle=col;X.fill();X.strokeStyle=shade(col,-0.3);X.lineWidth=1;X.stroke();line(-22,0,22,0,shade(col,-0.35),1);for(const s of [-1,1])for(let k=-2;k<=2;k++)line(k*7,0,k*7+5,s*7,shade(col,-0.25),0.7)}
  else{rrect(-26,-5,52,10,5);X.fillStyle='#8b5a2e';X.fill();X.strokeStyle='#5a3818';X.lineWidth=1;X.stroke();line(-20,-1,18,-1,'#a8743e',1);line(8,-4,16,-12,'#8b5a2e',3);ell(18,-13,4,2.2,'#e9a23b',0.4)}})}
// ---------- critters ----------
function drawFrog(x,y,wave,t){X.save();X.translate(x,y);ell(-6,6,4,6,'#3c8a2c',0.5);ell(6,6,4,6,'#3c8a2c',-0.5);ell(0,1,8,9,'#56b23e');ell(0,3,5,5,'#8fdc6a');
  circ(-4,-6,3.4,'#56b23e');circ(4,-6,3.4,'#56b23e');circ(-4,-6.5,1.8,'#fff');circ(4,-6.5,1.8,'#fff');circ(-4,-6.3,1,'#111');circ(4,-6.3,1,'#111');
  if(wave){const w=Math.sin(t*14)*4;line(7,0,13,-7+w,'#56b23e',2.6);circ(13,-8+w,2,'#8fdc6a')}else ell(8,-1,2.5,4,'#3c8a2c',0.4);X.restore()}
function drawTurtle(x,y,wave,t,sc){X.save();X.translate(x,y);X.scale(sc||1,sc||1);ell(0,-11,4,4.5,'#7fae4b');circ(-1.6,-12.5,0.9,'#111');circ(1.6,-12.5,0.9,'#111');
  const w=wave?Math.sin(t*14)*5:0;ell(-8,-5,4,2.4,'#7fae4b',-0.6);ell(9+(wave?3:0),-5+w*0.8,4,2.4,'#7fae4b',0.6+w*0.1);ell(-7,7,3,2,'#7fae4b',0.6);ell(7,7,3,2,'#7fae4b',-0.6);
  ell(0,0,9,10,'#4d7a2c');X.strokeStyle='#2f5218';X.lineWidth=1;X.stroke();for(const [a,b] of [[0,-4],[-4,2],[4,2],[0,5]])circ(a,b,2.4,'#6a9a3c');X.restore()}
function drawGoose(x,y,flap,dir,hat){X.save();X.translate(x,y);X.rotate(dir);const f=Math.sin(flap);
  for(const s of [-1,1]){X.beginPath();X.moveTo(s*4,-4);X.quadraticCurveTo(s*(22+f*4),-2-f*6,s*(30+f*3),8+f*8);X.quadraticCurveTo(s*14,10,s*4,8);X.closePath();X.fillStyle='#7d6a58';X.fill();X.strokeStyle='#4a3c30';X.lineWidth=1;X.stroke()}
  ell(0,4,7,13,'#8d7a66');ell(0,12,4,4,'#f2f0ea');rrect(-2.5,-18,5,14,2.5);X.fillStyle='#1d1d1d';X.fill();ell(0,-20,4,5,'#1d1d1d');ell(0,-18.5,3.6,1.6,'#fff');ell(0,-26,1.8,3,'#222');
  if(hat){ell(0,-29,7,6,'#7d8a4e');ell(0,-29.5,4.5,4,'#96a35e')}X.restore()}
function drawFish(x,y,h,ang,col){X.save();X.translate(x,y-h);X.rotate(ang);X.scale(1+h/90,1+h/90);ell(0,0,11,5,col);X.beginPath();X.moveTo(9,0);X.lineTo(17,-6);X.lineTo(17,6);X.closePath();X.fillStyle=col;X.fill();
  ell(-2,-1,7,2,'rgba(255,255,255,0.4)');circ(-6,-1.5,1.4,'#fff');circ(-6.3,-1.5,0.7,'#111');X.restore()}
function drawRubberDuck(x,y,t){X.save();X.translate(x,y+Math.sin(t*3)*1);ell(1,2,9,7,'rgba(0,40,40,0.25)');ell(0,1,8.5,7,'#ffd51e');circ(0,-5,5,'#ffdf3a');ell(0,-10,2.6,1.8,'#ff8a1e');circ(-2,-6,0.9,'#111');circ(2,-6,0.9,'#111');ell(-3,1,2.5,4,'#f2c200',0.3);X.restore()}
function drawAcorn(x,y,t){const g=0.6+0.4*Math.sin(t*4+x);X.save();X.translate(x,y+Math.sin(t*2.5+x)*1.5);ell(0,8,7,3,'rgba(0,40,40,0.2)');ell(0,2,6,7,'#f2b51c');ell(-2,0,2,4,'#ffe58a');
  X.beginPath();X.arc(0,-2,7,Math.PI,0);X.fillStyle='#9a6a22';X.fill();line(0,-9,2,-12,'#6a4818',2);circ(3,-1,1.3,'rgba(255,255,255,'+g+')');X.restore()}
function drawBeaver(x,y,t,dir){X.save();X.translate(x,y);X.rotate(dir);ell(0,10,6,8,'#5a3a22');ell(0,0,8,10,'#8a5a32');circ(0,-9,5.5,'#8a5a32');circ(-3,-11,1,'#111');circ(3,-11,1,'#111');rrect(-1.6,-6,3.2,3,0.6);X.fillStyle='#fff';X.fill();
  const k=(t*1.5)%1;X.restore();X.beginPath();X.moveTo(x-6-k*14,y+6+k*20);X.lineTo(x,y-4);X.lineTo(x+6+k*14,y+6+k*20);X.strokeStyle='rgba(255,255,255,'+(0.6-k*0.5)+')';X.lineWidth=1.4;X.stroke()}
function drawFlower(x,y,t,sc){X.save();X.translate(x,y);X.scale(sc||1,sc||1);X.rotate(t*0.3);ell(0,0,14,12,'#3f9b3a');for(let i=0;i<8;i++){const a=i/8*TAU;ell(Math.cos(a)*6,Math.sin(a)*6,5,2.6,i%2?'#ff9bd0':'#ff6fb5',a)}circ(0,0,3.5,'#ffe14d');X.restore()}
// ---------- bank scenery sprites ----------
const TREEC=[['#e8762b','#f2a33a','#c94a1f'],['#f2c12e','#f7dc5a','#d99a1a'],['#d23d2a','#ef6b3a','#a52a1a'],['#c9a227','#e4c84a','#9a7a1a'],['#7aa33a','#a3c64e','#5a7f24'],['#e85a2a','#f7b23a','#b8381a']];
function treeSpr(v){return spr('tree'+v,96,96,()=>{const c=TREEC[v%6];ell(6,8,40,34,'rgba(0,30,10,0.25)');for(let i=0;i<9;i++){const a=i/9*TAU,r=hsh(i+v*13)*14+16;circ(Math.cos(a)*r*0.9,Math.sin(a)*r*0.8,18+hsh(i*3+v)*8,c[2])}
  for(let i=0;i<8;i++){const a=i/8*TAU+0.4;circ(Math.cos(a)*14,Math.sin(a)*12-2,15+hsh(i*7+v)*6,c[0])}for(let i=0;i<6;i++){const a=i/6*TAU;circ(Math.cos(a)*9-5,Math.sin(a)*7-8,9,c[1])}})}
function pineSpr(v){return spr('pine'+v,70,70,()=>{ell(5,6,26,24,'rgba(0,30,10,0.25)');for(let k=0;k<3;k++){const r=28-k*8;X.beginPath();for(let i=0;i<=16;i++){const a=i/16*TAU,rr2=(i%2?0.7:1)*r;X.lineTo(Math.cos(a)*rr2,Math.sin(a)*rr2)}X.closePath();X.fillStyle=['#24502e','#2f6a3a','#3d8247'][k];X.fill()}})}
function willowSpr(v){return spr('willow'+v,150,150,()=>{ell(8,10,60,52,'rgba(0,30,10,0.22)');for(let i=0;i<12;i++){const a=i/12*TAU;circ(Math.cos(a)*30,Math.sin(a)*26,30,'#8aa83a')}
  for(let i=0;i<10;i++){const a=i/10*TAU+0.3;circ(Math.cos(a)*18,Math.sin(a)*16-4,24,'#a9c24a')}circ(-8,-12,18,'#c8d866');
  X.strokeStyle='rgba(110,140,40,0.85)';X.lineWidth=1.6;for(let i=0;i<70;i++){const a=hsh(i+v)*TAU,r=40+hsh(i*5)*24;const x0=Math.cos(a)*r*0.8,y0=Math.sin(a)*r*0.7;X.beginPath();X.moveTo(x0,y0);X.quadraticCurveTo(x0*1.1,y0*1.1+6,x0*1.15,y0*1.15+12);X.stroke()}})}
function bushSpr(v){return spr('bush'+v,44,44,()=>{const c=TREEC[(v+2)%6];ell(3,4,17,14,'rgba(0,30,10,0.25)');for(let i=0;i<6;i++){const a=i/6*TAU;circ(Math.cos(a)*8,Math.sin(a)*6,9,c[2])}circ(-2,-2,9,c[0]);circ(-5,-5,5,c[1])})}
function reedsSpr(v){return spr('reeds'+v,40,40,()=>{for(let i=0;i<12;i++){const x=(hsh(i+v)-0.5)*28,y=(hsh(i*3+v)-0.5)*24;line(x,y+6,x+2,y-8,'#6b8a34',2);if(i%3===0)ell(x+2,y-9,2,5,'#6b3e1e')}})}
function rockSpr(v){return spr('rock'+v,52,52,()=>{ell(3,5,22,18,'rgba(0,30,40,0.3)');X.beginPath();for(let i=0;i<9;i++){const a=i/9*TAU,r=20*(0.82+hsh(i+v*9)*0.25);X.lineTo(Math.cos(a)*r,Math.sin(a)*r*0.9)}X.closePath();
  const g=X.createLinearGradient(-20,-20,20,20);g.addColorStop(0,'#b9b4aa');g.addColorStop(1,'#6c6862');X.fillStyle=g;X.fill();X.strokeStyle='#4f4b46';X.lineWidth=1.5;X.stroke();ell(-6,-7,7,4,'rgba(255,255,255,0.3)',-0.5);if(v%2)ell(5,5,6,3,'rgba(90,130,60,0.5)',0.3)})}
function lilySpr(v){return spr('lily'+v,44,44,()=>{X.beginPath();X.arc(0,0,19,0.3,TAU-0.1);X.lineTo(0,0);X.closePath();X.fillStyle=v%2?'#4a9a3a':'#5aae44';X.fill();X.strokeStyle='#2f6b26';X.lineWidth=1;X.stroke();for(let i=0;i<6;i++){const a=0.6+i;line(0,0,Math.cos(a)*15,Math.sin(a)*15,'rgba(40,90,30,0.6)',0.8)}})}
function logSpr(){return spr('log',130,30,()=>{ell(2,5,62,11,'rgba(0,30,40,0.3)');rrect(-60,-10,120,20,10);const g=X.createLinearGradient(0,-10,0,10);g.addColorStop(0,'#a8743e');g.addColorStop(0.5,'#8b5a2e');g.addColorStop(1,'#5e3a1a');X.fillStyle=g;X.fill();X.strokeStyle='#4a2c12';X.lineWidth=1.5;X.stroke();
  ell(56,0,5,9,'#d9b07a');X.strokeStyle='#8b5a2e';X.lineWidth=0.8;X.beginPath();X.ellipse(56,0,2.6,5,0,0,TAU);X.stroke();for(let k=0;k<5;k++)line(-48+k*20,-4+(k%2)*6,-36+k*20,-4+(k%2)*6,'#5e3a1a',1);line(-20,-10,-26,-18,'#7a4e26',3);ell(-27,-19,3,2,'#e2552a')})}
function houseSpr(v){return spr('house'+v,90,90,()=>{const c=['#b5483a','#4a6a8a','#6a5a4a','#3a7a5a'][v%4];X.fillStyle='rgba(0,0,0,0.25)';X.fillRect(-34,-30,76,70);X.fillStyle=c;X.fillRect(-38,-34,76,68);X.fillStyle=shade(c,0.2);X.fillRect(-38,-34,38,68);
  line(0,-34,0,34,shade(c,-0.3),2);X.fillStyle='#8a8a8a';X.fillRect(10,-24,10,10)})}
function lampSpr(){return spr('lamp',24,24,()=>{circ(1,2,6,'rgba(0,0,0,0.25)');circ(0,0,5,'#2a2a2a');circ(0,0,3,'#ffe9a0')})}
function benchSpr(){return spr('bench',34,20,()=>{X.fillStyle='rgba(0,0,0,0.2)';X.fillRect(-13,-4,30,12);X.fillStyle='#8a5a2e';for(let k=0;k<3;k++)X.fillRect(-15,-6+k*4,30,3)})}
function boulderSpr(v){return spr('boulder'+v,60,60,()=>{ell(4,6,24,20,'rgba(0,0,0,0.25)');circ(0,0,22,'#8d8a84');circ(-6,-6,12,'#a8a49c');circ(8,6,8,'#77736d')})}
function lodgeSpr(){return spr('lodge',120,100,()=>{ell(6,8,52,40,'rgba(0,0,0,0.25)');for(let i=0;i<90;i++){const a=hsh(i)*TAU,r=hsh(i*3)*44;const x=Math.cos(a)*r,y=Math.sin(a)*r*0.75;X.save();X.translate(x,y);X.rotate(hsh(i*7)*3);rrect(-14,-2.5,28,5,2.5);X.fillStyle=['#7a5230','#5e3c20','#94683c'][i%3];X.fill();X.restore()}})}
function poopSpr(v){return spr('poop'+v,120,120,()=>{X.fillStyle='rgba(240,244,228,0.95)';X.beginPath();for(let i=0;i<14;i++){const a=i/14*TAU,r=(i%2?28:44)+hsh(i+v*5)*12;X.lineTo(Math.cos(a)*r,Math.sin(a)*r)}X.closePath();X.fill();
  circ(-10,-6,14,'rgba(150,170,90,0.85)');circ(8,10,9,'rgba(120,140,70,0.8)');circ(14,-14,6,'rgba(255,255,255,0.9)');circ(-20,18,5,'rgba(255,255,255,0.9)')})}
// reflection version of a scenery sprite: blurred-ish, lightened, no drop shadow (so it never reads as a hazard)
const RF=new Map();function reflSpr(s){let r=RF.get(s);if(r)return r;const c=document.createElement('canvas');c.width=Math.ceil(s.c.width/3);c.height=Math.ceil(s.c.height/3);const g=c.getContext('2d');
  g.drawImage(s.c,0,0,c.width,c.height);g.globalCompositeOperation='source-atop';g.fillStyle='rgba(255,255,255,0.45)';g.fillRect(0,0,c.width,c.height);r={c,w:s.w,h:s.h};RF.set(s,r);return r}
// ---------- Michigan touches (all original procedural art) ----------
// painted turtle: dark shell with a red-orange rim, yellow-striped head
function drawPainted(x,y,wave,t,sc){X.save();X.translate(x,y);X.scale(sc||1,sc||1);const w=wave?Math.sin(t*14)*5:0;
  for(const [a,b,r] of [[-8,-5,-0.6],[9+(wave?3:0),-5+w*0.8,0.6+w*0.1],[-7,7,0.6],[7,7,-0.6]])ell(a,b,4,2.4,'#3d4a2a',r);
  ell(0,-11,4,4.6,'#34402a');line(-1.6,-14.5,-1.6,-7,'#ffd23f',0.9);line(1.6,-14.5,1.6,-7,'#ffd23f',0.9);circ(-2.3,-12.5,0.8,'#111');circ(2.3,-12.5,0.8,'#111');
  ell(0,0,10,11,'#d4502a');ell(0,0,8.6,9.6,'#2f3a24');X.strokeStyle='#59683e';X.lineWidth=0.8;for(const yy of [-3.5,3.5])line(-8,yy,8,yy,'#59683e',0.8);line(0,-9,0,9,'#59683e',0.8);X.restore()}
// Petoskey stone (Michigan's state stone, a fossil coral): rounded grey stone with six-sided "eyes"
function petoskeySpr(){return spr('petoskey',30,26,()=>{ell(1,3,12,8,'rgba(0,40,40,0.25)');ell(0,0,12,9,'#9a9488');ell(-2,-2,9,6,'#aaa498');
  for(let i=0;i<7;i++){const a=i*1.1,r=i?6:0,x=Math.cos(a)*r*1.2,y=Math.sin(a)*r*0.75;X.beginPath();for(let k=0;k<6;k++){const q=k/6*TAU;X[k?'lineTo':'moveTo'](x+Math.cos(q)*3,y+Math.sin(q)*2.4)}X.closePath();X.strokeStyle='#6a6458';X.lineWidth=0.8;X.stroke();circ(x,y,0.9,'#5a5448')}
  ell(-5,-4,3,1.4,'rgba(255,255,255,0.55)',-0.4)})}
function drawPetoskey(x,y,t){const g=0.5+0.5*Math.sin(t*4+x);dspr(petoskeySpr(),x,y+Math.sin(t*2.5+x)*1.5,1);circ(x+6,y-5,1.4,'rgba(255,255,255,'+g+')')}
// great blue heron (side view, standing in the shallows)
function heronSpr(fv){return spr('heron'+fv,44,56,()=>{const fr=Math.abs(fv)>1,f=Math.sign(fv);X.scale(f,1);ell(0,22,9,3,'rgba(0,40,60,0.25)');line(-2,8,-3,22,'#6a5a3a',1.2);line(2,8,3,22,'#6a5a3a',1.2);
  ell(0,4,9,6,'#7d93ad',-0.3);ell(-5,6,6,3,'#5f7590',-0.2);
  if(!fr){X.beginPath();X.moveTo(5,1);X.quadraticCurveTo(12,-6,6,-12);X.quadraticCurveTo(2,-17,7,-20);X.strokeStyle='#8fa3bb';X.lineWidth=3;X.stroke();
    circ(7.5,-20.5,2.8,'#e8ecef');line(6,-21.5,10,-23,'#1d1d1d',1);X.beginPath();X.moveTo(9.5,-21);X.lineTo(17,-19.6);X.lineTo(9.5,-19.4);X.closePath();X.fillStyle='#f2b51c';X.fill();circ(8.5,-21,0.7,'#111')}
  else{// head down: caught a little fish!
    X.beginPath();X.moveTo(6,2);X.quadraticCurveTo(14,2,16,12);X.strokeStyle='#8fa3bb';X.lineWidth=3;X.stroke();circ(16.5,13,2.8,'#e8ecef');X.beginPath();X.moveTo(17,14.5);X.lineTo(19,21);X.lineTo(15.5,15);X.closePath();X.fillStyle='#f2b51c';X.fill();
    ell(19,20,4,1.8,'#c0c8cc',0.3);X.beginPath();X.moveTo(22,21);X.lineTo(25,19);X.lineTo(25,23);X.closePath();X.fillStyle='#c0c8cc';X.fill();circ(17.5,12.5,0.7,'#111')}})}
// sandhill crane (grey, red forehead)
function craneSpr(f){return spr('crane'+f,40,56,()=>{X.scale(f,1);ell(0,23,8,2.6,'rgba(0,0,0,0.2)');line(-2,8,-3,23,'#333',1.2);line(2,8,2,23,'#333',1.2);
  ell(0,4,9,6.5,'#9a958c',-0.2);ell(-7,6,5,4,'#7f7a70',0.3);X.beginPath();X.moveTo(5,0);X.quadraticCurveTo(9,-10,7,-19);X.strokeStyle='#a9a49a';X.lineWidth=2.6;X.stroke();
  circ(7.2,-20,2.6,'#d9d6cf');ell(7.4,-21.6,1.8,1.1,'#d62f2f');X.beginPath();X.moveTo(9,-20.5);X.lineTo(15,-19.5);X.lineTo(9,-19);X.closePath();X.fillStyle='#444';X.fill();circ(8,-20.4,0.6,'#111')})}
// white-tailed deer on the bank (frame 2: head down, drinking)
function deerSpr(fv){return spr('deer'+fv,60,52,()=>{const fr=Math.abs(fv)>1,f=Math.sign(fv);X.scale(f,1);ell(0,20,16,3,'rgba(0,0,0,0.2)');for(const lx of [-10,-6,7,11])line(lx,4,lx,19,'#7a5232',2);
  ell(0,2,15,7,'#a8713f');ell(-14,-1,3,3.6,'#fff');ell(-15,-2,2,2.2,'#a8713f');ell(12,2,3,4,'#f2e6d6');
  if(!fr){X.beginPath();X.moveTo(10,0);X.lineTo(15,-12);X.lineTo(19,-11);X.lineTo(15,2);X.closePath();X.fillStyle='#a8713f';X.fill();
    ell(18,-13,5,3.4,'#a8713f',0.3);ell(22,-12,2,1.6,'#3a2a1a');ell(15,-17,1.6,3.4,'#8a5a32',-0.4);ell(19,-18,1.6,3.4,'#8a5a32',0.3);circ(18.5,-14,0.9,'#111')}
  else{X.beginPath();X.moveTo(10,-2);X.lineTo(22,8);X.lineTo(20,12);X.lineTo(9,4);X.closePath();X.fillStyle='#a8713f';X.fill();
    ell(24,12,5,3.2,'#a8713f',0.6);ell(27,15,2,1.5,'#3a2a1a');ell(20,6,1.6,3.4,'#8a5a32',-0.9);ell(23,5,1.6,3.4,'#8a5a32',-0.4);circ(23.5,10.5,0.9,'#111')}})}
// Up North-style log cabin (roof view, like the houses) with a stone chimney
function cabinSpr(v){return spr('cabin'+v,92,80,()=>{X.fillStyle='rgba(0,0,0,0.25)';X.fillRect(-36,-24,78,56);const c=['#7a4a26','#6a4020','#845432'][v%3];X.fillStyle=c;X.fillRect(-40,-28,80,54);
  X.fillStyle=shade(c,0.18);X.fillRect(-40,-28,80,27);for(let i=0;i<6;i++)line(-40,-28+i*9,40,-28+i*9,shade(c,-0.3),1);line(-40,-1,40,-1,shade(c,-0.45),2);
  X.fillStyle='#8a8580';X.fillRect(18,-24,12,12);X.fillStyle='#6a655f';X.fillRect(18,-24,12,3);X.fillStyle='#b98a52';X.fillRect(-30,26,60,8);for(let i=0;i<6;i++)line(-30+i*12,26,-30+i*12,34,'#8a6234',1)})}
// mitten sign: "You are here" on the Lower Peninsula (Milford is in the southeast, near the base of the palm)
function mittenSpr(){return spr('mitten2',110,112,()=>{line(-26,44,-26,18,'#6a4a2a',5);line(26,44,26,18,'#6a4a2a',5);ell(0,46,34,5,'rgba(0,0,0,0.2)');
  rrect(-48,-50,96,74,10);X.fillStyle='#2f6fa3';X.fill();X.strokeStyle='#f2e6c9';X.lineWidth=3;X.stroke();txt('MICHIGAN',0,-41,8.5,'#ffe14d',{sw:0});
  // Lower Peninsula ("the mitten"): thumb on the east side, Saginaw Bay between thumb and fingers
  const P=[[0.02,1],[0.7,1],[0.76,0.93],[0.8,0.82],[0.86,0.66],[0.93,0.5],[0.96,0.42],[0.9,0.37],[0.79,0.45],[0.7,0.5],[0.66,0.42],[0.71,0.3],[0.73,0.17],[0.66,0.04],[0.52,-0.04],[0.4,-0.02],[0.3,0.06],[0.26,0.17],[0.2,0.13],[0.16,0.2],[0.13,0.34],[0.1,0.5],[0.05,0.66],[0.01,0.84]];
  const ox=-24,oy=-30,sx=48,sy=46;X.beginPath();P.forEach(([px,py],i)=>X[i?'lineTo':'moveTo'](ox+px*sx,oy+py*sy));X.closePath();X.fillStyle='#fff';X.fill();X.strokeStyle='#cfe3f2';X.lineWidth=1;X.stroke();
  const mx=ox+0.66*sx,my=oy+0.86*sy;circ(mx,my,3.2,'#e53935');X.strokeStyle='#fff';X.lineWidth=1;X.stroke();txt('YOU ARE HERE',0,19,7,'#ffe14d',{sw:0});
  X.beginPath();X.moveTo(mx+4,my+2);X.lineTo(22,14);X.strokeStyle='#ffe14d';X.lineWidth=1;X.stroke()})}
// cider jug + donuts (Michigan cider mill tradition) for the finish
function drawCider(x,y,s){X.save();X.translate(x,y);X.scale(s,s);ell(2,24,18,4,'rgba(0,0,0,0.2)');rrect(-11,-8,22,32,7);X.fillStyle='#c46a1e';X.fill();rrect(-11,-8,22,32,7);X.strokeStyle='rgba(255,255,255,0.5)';X.lineWidth=1.2;X.stroke();
  rrect(-5,-18,10,11,3);X.fillStyle='#e8d9b5';X.fill();X.beginPath();X.arc(11,4,6,-1.2,1.2);X.strokeStyle='#c46a1e';X.lineWidth=3;X.stroke();rrect(-8,2,16,10,3);X.fillStyle='#fff3d6';X.fill();txt('CIDER',0,7,4.6,'#7a3a10',{sw:0});X.restore()}
function drawDonut(x,y,s,sp){X.save();X.translate(x,y);X.scale(s,s);ell(1,3,11,5,'rgba(0,0,0,0.2)');ell(0,0,11,8,'#c98a4a');ell(0,-1,9.5,6.5,'#e2b07a');ell(0,-1,3.5,2.4,'#6a4420');
  if(sp)for(let i=0;i<8;i++){const a=i/8*TAU;ell(Math.cos(a)*6.5,-1+Math.sin(a)*4.4,0.9,0.5,'#f7f1e3',a)}X.restore()}
// wooden welcome sign
function signSpr(t1,t2){return spr('sign'+t1+t2,140,70,()=>{line(-38,30,-38,8,'#6a4a2a',4);line(38,30,38,8,'#6a4a2a',4);rrect(-62,-28,124,40,8);X.fillStyle='#2e6b3f';X.fill();X.strokeStyle='#f2e6c9';X.lineWidth=2.5;X.stroke();
  txt(t1,0,-15,10,'#fff',{sw:0});txt(t2,0,1,13,'#ffe14d',{sw:0})})}
