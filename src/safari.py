# Mobile-Safari checks (in-browser, not Home Screen): reduced viewport heights from Safari's bars, rotation mid-play, no zoom/scroll/
# pull-to-refresh/selection, audio unlock on first tap.  Uses Playwright WebKit if installed, else Chrome with the iPhone UA.
#   usage: python3 src/safari.py [url]
import asyncio,sys,json
from playwright.async_api import async_playwright
BASE=sys.argv[1] if len(sys.argv)>1 else 'file:///workspace/alex-river-run/index.html'
OUT='/workspace/alex-river-run/shots/';ok=True
UA='Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1'
def chk(n,c,i=''):
    global ok;ok&=bool(c);print(('PASS ' if c else 'FAIL ')+n,i,flush=True)
async def main():
    async with async_playwright() as p:
        eng='chrome'
        try:b=await p.webkit.launch();eng='webkit'
        except Exception as e:b=await p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--autoplay-policy=no-user-gesture-required'])
        print('engine:',eng)
        for nm,vp in [('safari-landscape',{'width':844,'height':340}),('safari-portrait',{'width':390,'height':664})]:
            ctx=await b.new_context(viewport=vp,device_scale_factor=3,is_mobile=eng!='webkit' or True,has_touch=True,user_agent=UA);m=await ctx.new_page();E=m.evaluate;W=m.wait_for_timeout;errs=[]
            m.on('pageerror',lambda e:errs.append(str(e)))
            await m.goto(BASE+'?debug=1');await W(1000)
            g=await E('({cw:document.getElementById("c").getBoundingClientRect().width,ch:document.getElementById("c").getBoundingClientRect().height,iw:innerWidth,ih:innerHeight,sh:document.documentElement.scrollHeight,sw:document.documentElement.scrollWidth,ta:getComputedStyle(document.getElementById("c")).touchAction,us:getComputedStyle(document.body).webkitUserSelect||getComputedStyle(document.body).userSelect,vp:document.querySelector("meta[name=viewport]").content})')
            chk(f'[{nm}] canvas exactly fills the visible viewport, nothing scrolls',abs(g['cw']-g['iw'])<1 and abs(g['ch']-g['ih'])<1 and g['sh']<=g['ih'] and g['sw']<=g['iw'],json.dumps(g))
            chk(f'[{nm}] zoom off + touch-action none + no text selection',('user-scalable=no' in g['vp']) and g['ta']=='none' and g['us']=='none',json.dumps(g))
            pv=await E('''(()=>{const r={};for(const t of ['gesturestart','dblclick','selectstart','contextmenu']){const e=new Event(t,{cancelable:true,bubbles:true});document.body.dispatchEvent(e);r[t]=e.defaultPrevented}
              const tm=new TouchEvent('touchmove',{cancelable:true,bubbles:true,touches:[]});document.body.dispatchEvent(tm);r.touchmove=tm.defaultPrevented;return r})()''')
            chk(f'[{nm}] pinch (gesturestart), double-tap, long-press select/callout, pull-to-refresh (touchmove) all blocked',all(pv.values()),json.dumps(pv))
            await m.touchscreen.tap(vp['width']/2,8);await W(500);a=await E('({u:__A.audio.unlocked,s:__A.state})')
            chk(f'[{nm}] first tap unlocks audio (WebAudio + silent-switch-proof <audio> keepalive)',a['u'] and a['s']=='title',json.dumps(a))
            ui={u['id']:u for u in await E('__A.ui')};c=await E(f'__A.toClient({ui["play"]["x"]},{ui["play"]["y"]})')
            chk(f'[{nm}] PLAY button fully on screen',0<c['x']<vp['width'] and 0<c['y']<vp['height'],json.dumps(c))
            await m.touchscreen.tap(c['x'],c['y']);await W(400);await m.touchscreen.tap(vp['width']/2,vp['height']*0.4);await W(400)
            ct=await E('__A.ctl()');inside=all(0<=ct[k]['x']-ct[k]['r']*0 <=vp['width'] and 0<=ct[k]['y']<=vp['height'] for k in ('L','R'))
            chk(f'[{nm}] playing; LEFT/RIGHT buttons inside the visible area',await E('__A.state')=='play' and inside,json.dumps({k:ct[k] for k in ('L','R')}))
            await m.screenshot(path=OUT+f'{nm}.png')
            # hold a paddle, then rotate / Safari bar collapses (viewport resize) mid-play -> input cleared, layout follows
            cdp=await ctx.new_cdp_session(m) if eng!='webkit' else None
            await m.touchscreen.tap(ct['L']['x'],ct['L']['y'])
            nv={'width':vp['height'],'height':vp['width']} ;await m.set_viewport_size(nv);await E('dispatchEvent(new Event("orientationchange"))');await W(900)
            r=await E('({iw:innerWidth,ih:innerHeight,SW:__A.SW||0,por:__A.portrait,i:__A.inp,s:__A.state,cw:document.getElementById("c").getBoundingClientRect().width})')
            chk(f'[{nm}] rotate mid-play: canvas re-fits, inputs clear, still playing (or paused)',abs(r['cw']-r['iw'])<1 and r['i']=={'l':0,'r':0} and r['s']=='play',json.dumps(r))
            await m.set_viewport_size({'width':vp['width'],'height':vp['height']+50});await W(500)
            r2=await E('({iw:innerWidth,ih:innerHeight,ch:document.getElementById("c").getBoundingClientRect().height})')
            chk(f'[{nm}] Safari toolbar collapse (taller viewport) re-fits',abs(r2['ch']-r2['ih'])<1,json.dumps(r2))
            chk(f'[{nm}] no JS errors',not errs,str(errs[:3]));await ctx.close()
        await b.close()
    print('ALL OK' if ok else 'SOME FAILED');sys.exit(0 if ok else 1)
asyncio.run(main())
