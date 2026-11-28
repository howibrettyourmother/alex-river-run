// ================= art: generated (GenerateImage) textures + kawaii top-down sprites, embedded as webp data URIs =================
const ART={};
(function(){const D=typeof ARTD!=='undefined'?ARTD:{};for(const k in D){const i=new Image();i.onload=()=>{i._ok=1;if(typeof SP==='object')for(const q in SP)delete SP[q]};i.src=D[k];ART[k]=i}})();
const art=k=>{const i=ART[k];return i&&i._ok?i:null};
// mirror-tiled world-space texture (seamless in both axes at any scroll)
function texFill(im,ts,x0,y0,x1,y1,ox,oy){const c0=Math.floor((x0-ox)/ts),r0=Math.floor((y0-oy)/ts),c1=Math.floor((x1-ox)/ts),r1=Math.floor((y1-oy)/ts);
  for(let r=r0;r<=r1;r++)for(let c=c0;c<=c1;c++){const fx=c&1,fy=r&1;X.save();X.translate(ox+c*ts+(fx?ts:0),oy+r*ts+(fy?ts:0));X.scale(fx?-1:1,fy?-1:1);X.drawImage(im,0,0,ts,ts);X.restore()}}
// draw a generated sprite centred at (0,0) with width w (height from aspect)
function artImg(k,w,hOverride){const i=art(k);if(!i)return false;const h=hOverride||w*i.naturalHeight/i.naturalWidth;X.drawImage(i,-w/2,-h/2,w,h);return true}
