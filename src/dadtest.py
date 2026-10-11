# Dad-overboard rescue checks with the REAL touch controls (CDP multi-touch on the LEFT/RIGHT buttons), iPad + iPhone landscape.
# In every level (plus a tunnel, the fast water, right before the finish, and the boss pond): Dad lands ahead/beside the canoe and
# stays on screen, the "Paddle to Dad!" helper shows, a kid steering with the buttons scoops him up, and if nobody does, Dad
# doggy-paddles over by himself after ~10s (no softlock).   usage: python3 src/dadtest.py [ipad|iphone|all] [levels e.g. 01234]
import asyncio,sys,json
from playwright.async_api import async_playwright
sys.path.insert(0,'/workspace/alex-river-run/src');from test import DEV,touch,BASE
WHO=sys.argv[1] if len(sys.argv)>1 else 'all';LVS=[int(c) for c in (sys.argv[2] if len(sys.argv)>2 else '01234')]
OUT='/workspace/alex-river-run/shots/';ok=True
def chk(n,c,i=''):
    global ok;ok&=bool(c);print(('PASS ' if c else 'FAIL ')+n,i,flush=True)
async def one(b,name):
    ctx=await b.new_context(**DEV[name]);m=await ctx.new_page();cdp=await ctx.new_cdp_session(m);E=m.evaluate;W=m.wait_for_timeout;errs=[]
    m.on('pageerror',lambda e:errs.append(str(e)))
    await m.goto(BASE+'?debug=1');await W(800);await m.touchscreen.tap(400,10);await W(300)
    c=await E('__A.ctl()');P={'l':(c['L']['x'],c['L']['y']),'r':(c['R']['x'],c['R']['y'])}
    for lv in LVS:
        await E(f'__A.unlockLv=5;__A.newRun({lv})');await W(300);await E('__A.startPlay();__A.L.dadEv.forEach(e=>e.done=1);__A.L.geese.forEach(g=>g.done=1)');nm=await E('__A.L.D.name')
        sc=[('mid','-__A.L.len*0.42')]
        if await E('__A.L.tunnels.length'):sc.append(('tunnel','(__A.L.tunnels[0].y0*0.6+__A.L.tunnels[0].y1*0.4)'))
        sc.append(('finish','__A.L.D.boss?__A.L.arena.y0+260:__A.L.finishY+330'))
        if await E('!!__A.L.D.boss'):sc.append(('boss pond','__A.L.arena.y0-60'))
        for k,(where,yexpr) in enumerate(sc):
            for mode in (['drive','idle'] if where=='mid' else ['drive']):
                await E(f'__A.inv=99;__A.hearts=3;__A.tele({yexpr});__A.dad.st="boat";__A.dad.self=0');await W(250)
                await E('__A.dunk("sneeze")');await W(4100)
                s=await E('({st:__A.dad.st,dx:__A.dad.x-__A.cam.x,dy:__A.dad.y-__A.cam.y,ah:__A.boat.y-__A.dad.y,VW:__A.VW,VH:__A.VH})')
                tag=f'[{name}] {nm} / {where}'
                chk(f'{tag}: Dad lands in the water ahead of / beside the canoe, on screen',s['st']=='water' and 0<s['dx']<s['VW'] and 0<s['dy']<s['VH'] and s['ah']>=15,json.dumps(s))
                if where=='mid' and mode=='drive' and lv==LVS[0]:await m.screenshot(path=OUT+f'dad-rescue-indicator-{name}.png')
                held=set();lastT=0;lastS=0;onscr=True;res=None
                for i in range(110):
                    d=await E('({st:__A.dad.st,x:__A.dad.x,y:__A.dad.y,bx:__A.boat.x,by:__A.boat.y,t:__A.dad.t,self:__A.dad.self,sx:__A.dad.x-__A.cam.x,sy:__A.dad.y-__A.cam.y,VW:__A.VW,VH:__A.VH})')
                    if d['st']!='water':res=dict(d,t=lastT,self=lastS);break
                    lastT=d['t'];lastS=d['self']
                    if not(-20<d['sx']<d['VW']+20 and -20<d['sy']<d['VH']+20):onscr=False
                    if mode=='drive':
                        dx=d['x']-d['bx'];want={'l'} if dx<-16 else {'r'} if dx>16 else ({'l'} if i%2 else {'r'})
                        for s_ in list(held-want):await touch(cdp,'touchEnd',[(1 if s_=='r' else 0,P[s_])]);held.discard(s_)
                        for s_ in want-held:await touch(cdp,'touchStart',[(1 if s_=='r' else 0,P[s_])]);held.add(s_)
                    await W(130)
                for s_ in list(held):await touch(cdp,'touchEnd',[(1 if s_=='r' else 0,P[s_])])
                await W(900);inp=await E('__A.inp');fin=await E('({st:__A.dad.st,self:__A.dad.self,t:__A.dad.t})')
                chk(f'{tag}: Dad stays on screen while swimming',onscr)
                if mode=='drive':chk(f'{tag}: kid steers with LEFT/RIGHT and scoops Dad up (no auto-swim)',res is not None and res['t']<10 and not res['self'],json.dumps(res))
                else:chk(f'{tag}: no input -> Dad doggy-paddles over and grabs the canoe himself (~10s)',res is not None and res['t']>=9.9 and res['t']<14 and res['self'],json.dumps(res))
                chk(f'{tag}: Dad back in the canoe, controls released',fin['st'] in('climb','boat') and inp=={'l':0,'r':0},f'{fin} {inp}')
    chk(f'[{name}] no JS errors',not errs,str(errs[:3]))
    await ctx.close()
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--autoplay-policy=no-user-gesture-required'])
        for n in (['ipad','iphone'] if WHO=='all' else [WHO]):await one(b,n)
        await b.close()
    print('ALL OK' if ok else 'SOME FAILED');sys.exit(0 if ok else 1)
asyncio.run(main())
