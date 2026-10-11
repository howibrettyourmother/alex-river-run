# Headless checks + screenshots: iPad (gen 7) 1024x768 landscape, iPhone 844x390 landscape, iPhone 390x844 portrait.
# Touch via CDP multi-touch, synthetic TouchEvents for the "iOS dropped my touchend" case, keyboard, mouse,
# stuck-input guards (touchcancel / blur / visibilitychange / pagehide), controls-never-cover-the-action check,
# gameplay systems, and a 4x CPU-throttle performance run.   Usage: python3 src/test.py [url]
import asyncio,sys,json,os
from playwright.async_api import async_playwright
BASE=sys.argv[1] if len(sys.argv)>1 else 'file:///workspace/alex-river-run/index.html'
OUT='/workspace/alex-river-run/shots/';os.makedirs(OUT,exist_ok=True);ok=True;NCLIPS=len([l for l in open('/workspace/alex-river-run/src/lines.txt') if l.strip()])
RES=[]
def chk(n,c,i=''):
    global ok;ok&=bool(c);RES.append((n,bool(c)));print(('PASS ' if c else 'FAIL ')+n,i,flush=True)
async def touch(cdp,typ,pts):
    await cdp.send('Input.dispatchTouchEvent',{'type':typ,'touchPoints':[{'x':x,'y':y,'id':i} for i,(x,y) in pts]})
SYN='''(([typ,list,changed])=>{const cv=document.getElementById('c');const mk=([id,x,y])=>new Touch({identifier:id,target:cv,clientX:x,clientY:y});
  cv.dispatchEvent(new TouchEvent(typ,{touches:list.map(mk),changedTouches:changed.map(mk),targetTouches:list.map(mk),cancelable:true,bubbles:true}))})'''
DEV={'ipad':dict(viewport={'width':1024,'height':768},device_scale_factor=2,is_mobile=True,has_touch=True,user_agent='Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'),
     'iphone':dict(viewport={'width':844,'height':390},device_scale_factor=3,is_mobile=True,has_touch=True,user_agent='Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'),
     'portrait':dict(viewport={'width':390,'height':844},device_scale_factor=3,is_mobile=True,has_touch=True)}
async def run(b,name,full):
    errs=[];ctx=await b.new_context(**DEV[name]);m=await ctx.new_page();cdp=await ctx.new_cdp_session(m)
    m.on('pageerror',lambda e:errs.append(str(e)));m.on('console',lambda x:errs.append(x.text) if x.type=='error' and 'ERR_FILE' not in x.text else None)
    E=m.evaluate;W=m.wait_for_timeout
    await m.goto(BASE);await W(500);chk(f'[{name}] public build has no debug hook',await E('typeof window.__A')=='undefined')
    await m.goto(BASE+('&' if '?' in BASE else '?')+'debug=1');await E('localStorage.clear()');await m.reload();await W(700)
    vp=await E('[innerWidth,innerHeight]');por=await E('__A.portrait');c=await E('__A.ctl()')
    chk(f'[{name}] layout {"portrait" if por else "landscape"} {vp}, controls mode={c["mode"]}',por==(vp[1]>vp[0]*1.1) and c['mode']==({'ipad':'corner','iphone':'side','portrait':'below'}[name]))
    if por: chk(f'[{name}] portrait: paddle buttons sit below the game view',c['L']['y']-c['L']['r']>=await E('__A.toClient(0,__A.VH).y')-1)
    await m.touchscreen.tap(vp[0]*0.5,vp[1]*0.02+8);await W(1300)
    a=await E('({u:__A.audio.unlocked,r:__A.audio.running,c:__A.audio.clipCount,s:__A.state})')
    chk(f'[{name}] first tap unlocks audio',a['u'] and a['r'] and a['s']=='title',str(a));chk(f'[{name}] {NCLIPS} voice clips decoded',a['c']==NCLIPS,str(a['c']))
    async def U():return {u['id']:u for u in await E('__A.ui')}
    async def tapL(id):
        u=await U();cc=await E(f'__A.toClient({u[id]["x"]},{u[id]["y"]})');await m.touchscreen.tap(cc['x'],cc['y']);await W(260)
    await tapL('steer');s1=await E('__A.steer');await tapL('steer');chk(f'[{name}] "Real paddling" toggle (default OFF = arrows), ON <-> OFF',s1=='canoe' and await E('__A.steer')=='arrow')
    await tapL('lv3');chk(f'[{name}] locked level stays locked',await E('__A.state')=='title')
    await tapL('cn1');chk(f'[{name}] locked canoe not selectable',await E('__A.canoeSel')=='silver')
    await tapL('records');chk(f'[{name}] records screen',await E('__A.state')=='records')
    if full: await m.screenshot(path=OUT+f'records-{name}.png')
    await tapL('back');await W(400)
    if full: await m.screenshot(path=OUT+f'title-{name}.png')
    await tapL('play');await W(900);chk(f'[{name}] PLAY -> Town Canal card',await E('__A.state==="card"&&__A.lv===0'))
    await m.touchscreen.tap(vp[0]*0.5,vp[1]*0.4);await W(300);chk(f'[{name}] tap card -> paddling',await E('__A.state')=='play')
    await E('__A.inv=99;__A.tele(-700)');await W(100)
    L=(c['L']['x'],c['L']['y']);R=(c['R']['x'],c['R']['y'])
    # --- touch: hold LEFT -> canoe steers LEFT, hold RIGHT -> steers RIGHT (intuitive default)
    x0=await E('__A.boat.x');await touch(cdp,'touchStart',[(0,L)]);await W(150);i1=await E('__A.inp');await W(500)
    x1=await E('__A.boat.x');await touch(cdp,'touchEnd',[]);await W(80);i2=await E('__A.inp')
    chk(f'[{name}] touch LEFT button: pressed while held, released after',i1['l']==1 and i1['r']==0 and i2['l']==0 and i2['r']==0,f'{i1} {i2}')
    chk(f'[{name}] LEFT button steers the canoe left',x1-x0<-12,f'{x0:.0f}->{x1:.0f}')
    await E('__A.inv=99;__A.tele(-700)');await W(100)
    x0=await E('__A.boat.x');await touch(cdp,'touchStart',[(0,R)]);await W(650);x1=await E('__A.boat.x');await touch(cdp,'touchEnd',[]);await W(80)
    chk(f'[{name}] RIGHT button steers the canoe right',x1-x0>12,f'{x0:.0f}->{x1:.0f}')
    await E('__A.tele(-700)');await W(100);x0=await E('__A.boat.x');await m.keyboard.down('ArrowRight');await W(650);await m.keyboard.up('ArrowRight');x1=await E('__A.boat.x')
    chk(f'[{name}] keyboard Right arrow steers right',x1-x0>12,f'{x0:.0f}->{x1:.0f}')
    await E('__A.steerSet("canoe");__A.tele(-700)');await W(100);x0=await E('__A.boat.x');await touch(cdp,'touchStart',[(0,L)]);await W(650);x1=await E('__A.boat.x');await touch(cdp,'touchEnd',[]);await W(80);await E('__A.steerSet("arrow");__A.tele(-700)')
    chk(f'[{name}] Real paddling ON: LEFT paddle turns the canoe right',x1-x0>12,f'{x0:.0f}->{x1:.0f}')
    # --- alternating rhythm builds speed
    await E('__A.boat.s=0');sides=[L,R]
    for k in range(10):
        await touch(cdp,'touchStart',[(k%2,sides[k%2])]);await W(70);await touch(cdp,'touchEnd',[]);await W(190)
    rs=await E('({r:__A.boat.rhythm,s:__A.boat.s})');chk(f'[{name}] alternating L/R taps build rhythm + speed',rs['r']>=4 and rs['s']>150,str(rs))
    # --- hold both = brake (two fingers)
    await E('__A.boat.s=120');await touch(cdp,'touchStart',[(0,L)]);await touch(cdp,'touchStart',[(0,L),(1,R)]);await W(1000)
    bk=await E('({b:__A.boat.brake,s:__A.boat.s,i:__A.inp})');chk(f'[{name}] two-finger hold = brake/back-paddle',bk['b']==1 and bk['s']<0,str(bk))
    # --- lift one finger of two: only that side releases (tracked by identifier)
    await touch(cdp,'touchEnd',[(0,L)]);await W(120);i3=await E('({i:__A.inp,n:__A.nptrs})')
    await touch(cdp,'touchEnd',[]);await W(80);i4=await E('({i:__A.inp,n:__A.nptrs})')
    chk(f'[{name}] multi-touch by identifier: lifting LEFT keeps RIGHT, then all clear',i3['i']=={'l':0,'r':1} and i3['n']==1 and i4['i']=={'l':0,'r':0} and i4['n']==0,f'{i3} {i4}')
    # --- slide a finger across the middle: switches side, never sticks on both
    await touch(cdp,'touchStart',[(0,L)]);await touch(cdp,'touchMove',[(0,(vp[0]*0.75,L[1]))]);await W(80);i5=await E('__A.inp');await touch(cdp,'touchEnd',[]);await W(60)
    chk(f'[{name}] finger slide L->R switches paddle side',i5=={'l':0,'r':1} and await E('__A.inp')=={'l':0,'r':0},str(i5))
    # --- iOS dropped touchend: finger A vanishes without touchend; next touch event reconciles
    await E(SYN,['touchstart',[[7,L[0],L[1]]],[[7,L[0],L[1]]]]);await W(60);d1=await E('__A.inp')
    await E(SYN,['touchstart',[[8,R[0],R[1]]],[[8,R[0],R[1]]]]);await W(60);d2=await E('({i:__A.inp,n:__A.nptrs})')
    await E(SYN,['touchend',[],[[8,R[0],R[1]]]]);await W(60);d3=await E('({i:__A.inp,n:__A.nptrs})')
    chk(f'[{name}] dropped touchend (iOS) is reconciled: no stuck LEFT',d1['l']==1 and d2['i']=={'l':0,'r':1} and d2['n']==1 and d3['i']=={'l':0,'r':0} and d3['n']==0,f'{d1} {d2} {d3}')
    # --- touchcancel / blur / pagehide / visibilitychange clear everything
    for ev,js in [('touchcancel',None),('blur',"dispatchEvent(new Event('blur'))"),('pagehide',"dispatchEvent(new Event('pagehide'))"),
                  ('visibilitychange',"Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'));Object.defineProperty(document,'hidden',{configurable:true,get:()=>false})")]:
        await touch(cdp,'touchStart',[(0,L)]);await W(60);before=await E('__A.inp')
        if ev=='touchcancel': await E(SYN,['touchcancel',[],[[0,L[0],L[1]]]])
        else: await E(js)
        await W(60);aft=await E('({i:__A.inp,n:__A.nptrs,p:__A.paused})');await touch(cdp,'touchEnd',[]);await W(40)
        chk(f'[{name}] {ev} clears held paddle',before['l']==1 and aft['i']=={'l':0,'r':0} and aft['n']==0,f'{before} {aft}')
        if aft['p']: await E('__A.state');await m.keyboard.press('Escape');await W(100)
    chk(f'[{name}] visibilitychange pauses, resume clears input',not await E('__A.paused') and await E('__A.inp')=={'l':0,'r':0})
    # --- keyboard: arrows paddle, both/Down brake, keys clear on blur
    await m.keyboard.down('ArrowLeft');await W(120);k1=await E('__A.inp');await m.keyboard.down('ArrowRight');await W(500);k2=await E('({i:__A.inp,b:__A.boat.brake})')
    await m.keyboard.up('ArrowLeft');await m.keyboard.up('ArrowRight');await W(60);k3=await E('__A.inp')
    await m.keyboard.down('ArrowDown');await W(200);k4=await E('__A.boat.brake');await E("dispatchEvent(new Event('blur'))");await W(60);k5=await E('__A.inp');await m.keyboard.up('ArrowDown')
    chk(f'[{name}] keyboard: arrows paddle, both/Down brake, blur un-sticks keys',k1=={'l':1,'r':0} and k2['b']==1 and k3=={'l':0,'r':0} and k4==1 and k5=={'l':0,'r':0},f'{k1} {k2} {k3} {k4} {k5}')
    # --- mouse (pointer events) path
    await m.mouse.move(L[0],L[1]);await m.mouse.down();await W(80);mo1=await E('__A.inp');await m.mouse.up();await W(60);mo2=await E('({i:__A.inp,n:__A.nptrs})')
    chk(f'[{name}] mouse press/release on paddle',mo1['l']==1 and mo2['i']=={'l':0,'r':0} and mo2['n']==0,f'{mo1} {mo2}')
    # --- pause button + resume clears input
    hud={u['id']:u for u in await E('__A.hud')};pc=await E(f'__A.toClient({hud["pause"]["x"]},{hud["pause"]["y"]})');await m.touchscreen.tap(pc['x'],pc['y']);await W(250)
    chk(f'[{name}] pause button',await E('__A.paused'));await tapL('resume');chk(f'[{name}] resume',not await E('__A.paused') and await E('__A.nptrs')==0)
    # --- woolly bear: scoop with the bow, then drop it on the shore
    await E('(()=>{const b=__A.L.obj.find(o=>o.t==="bear"&&o.st==="float");__A.tele(b.y+70,b.x);__A.boat.s=60})()');await W(1200)
    sc=await E('__A.carry');await E('(()=>{const B=__A.boat;B.x=__A.riverC(B.y)+__A.riverHW(B.y)-60})()')
    await touch(cdp,'touchStart',[(0,L)]);await W(900);await touch(cdp,'touchEnd',[]);await W(500)
    if full: await m.screenshot(path=OUT+f'woolly-bear-{name}.png')
    sv=await E('({c:__A.carry,b:__A.bearsLv})');await W(2600);said=(await E('__A.audio.stats'))['said']
    chk(f'[{name}] scoop a woolly bear, drop it on the shore -> Woolly Bear Hero +1',sc==1 and sv=={'c':0,'b':1},f'{sc} {sv}')
    chk(f'[{name}] voice "Woolly bear saved! Great job, Alex!"',any(k in said for k in('wb','wb2','wb3')),','.join(said[-6:]))
    # --- bonk: costs a heart, funny bonk, keeps playing
    await E('__A.inv=0;__A.hearts=3;(()=>{const r=__A.L.obj.find(o=>o.t==="rock");__A.tele(r.y+75,r.x);__A.boat.s=140})()');await W(900)
    bn=await E('({h:__A.hearts,s:__A.state})');chk(f'[{name}] hitting a rock costs one heart (no game over)',bn=={'h':2,'s':'play'},str(bn))
    await E('__A.inv=0;__A.hearts=1;(()=>{const r=__A.L.obj.filter(o=>o.t==="rock")[1];__A.tele(r.y+75,r.x);__A.boat.s=140})()');await W(900)
    oo=await E('__A.state');await W(2600);rp=await E('({s:__A.state,h:__A.hearts,y:__A.boat.y})')
    chk(f'[{name}] out of hearts -> "Oopsie!" -> restart at checkpoint buoy with full hearts',oo=='oops' and rp['s']=='play' and rp['h']==3,f'{oo} {rp}')
    # --- tunnel headlamp + low bridge duck
    await E('__A.inv=99;__A.tele(__A.L.tunnels[0].y0-160)');await W(500)
    if full: await m.screenshot(path=OUT+f'tunnel-{name}.png')
    await E('__A.tele(__A.L.bridges[1].y+6)');await W(450);chk(f'[{name}] auto-duck under low bridge',await E('__A.boat.duck')>0.8)
    # --- goose poop splat smears the view
    await E('__A.tele(__A.L.tunnels[1].y1-300);__A.spawnGoose()');await W(2100);gp=await E('({sm:__A.smear,said:__A.audio.stats.said.slice(-4)})')
    chk(f'[{name}] goose dive-bomb poop splat smears the view',gp['sm']>0,str(gp))
    # --- Dad falls overboard, Alex paddles back to pick him up
    await E('__A.L.dadEv.forEach(e=>e.done=1)');await W(1500);await E('__A.dad.st="boat";__A.dad.soggy=0');await E('__A.dunk("sneeze")');await W(2900);d=await E('__A.dad.st')
    if full: await m.screenshot(path=OUT+f'dad-overboard-{name}.png')
    await E('__A.bot(true)');
    for i in range(30):
        await W(400)
        if await E('__A.dad.st')=='boat':break
    await E('__A.bot(false)');ds=await E('({st:__A.dad.st,sg:__A.dad.soggy})');chk(f'[{name}] Dad splashes in, gets scooped back up, soggier',d=='water' and ds=={'st':'boat','sg':1},f'{d} {ds}')
    # --- rubber duck
    await E('(()=>{const d=__A.L.obj.find(o=>o.t==="rduck");__A.tele(d.y+40,d.x)})()');await W(700);chk(f'[{name}] hidden rubber duck found',0 in await E('__A.ducks'))
    # --- coverage self-check so far
    cv=await E('__A.cov');chk(f'[{name}] paddle buttons never covered Alex/Dad/upcoming hazards ({cv["n"]} frames)',por or (cv['n']>100 and cv['viol']==0),json.dumps(cv))
    # --- level clear
    await E('__A.tele(__A.L.finishY+40)');await W(1500);fs=await E('({s:__A.state,d:__A.dad.st,k:__A.dad.k,ev:JSON.stringify(__A.L.dadEv),y:__A.boat.y-__A.L.finishY})');chk(f'[{name}] finish line -> level clear',fs['s']=='clear',str(fs));await W(1200)
    if full: await m.screenshot(path=OUT+f'level-clear-{name}.png')
    # --- boss: dodge snaps, feed flowers while he's dizzy -> happy turtle -> end screen
    await E('__A.unlockLv=5;__A.newRun(4)');await W(300);await E('__A.startPlay();__A.inv=99;__A.tele(__A.L.arena.y0-40)');await W(4500)
    chk(f'[{name}] giant grumpy snapping turtle appears',await E('!!__A.boss&&__A.boss.mood===0'))
    if full: await m.screenshot(path=OUT+f'boss-{name}.png')
    await E('__A.bot(true)')
    for i in range(120):
        await W(500)
        if await E('__A.state')!='play':break
    await E('__A.bot(false)');bs=await E('({s:__A.state,m:__A.boss.mood})');chk(f'[{name}] autopilot outmaneuvers the turtle and feeds him 3 flowers -> happy',bs['m']==3 and bs['s'] in ('bosswin','end'),str(bs))
    await W(2500)
    if full: await m.screenshot(path=OUT+f'boss-happy-{name}.png')
    for i in range(20):
        await W(500)
        if await E('__A.state')=='end':break
    await W(1800);es=await E('__A.endStats')
    chk(f'[{name}] end screen celebrates woolly bears',await E('__A.state')=='end' and es and 'bears' in es,json.dumps(es))
    if full: await m.screenshot(path=OUT+f'end-{name}.png')
    chk(f'[{name}] hot dog canoe unlocked by making the turtle happy','hotdog' in await E('__A.canoes'))
    vs=await E('__A.audio.stats');chk(f'[{name}] voice lines played one at a time',vs['voice']>=10,json.dumps({k:vs[k] for k in ('voice','dropped','sfx')}))
    chk(f'[{name}] no JS errors',not errs,str(errs[:3]))
    await ctx.close()
async def perf(b):
    ctx=await b.new_context(**DEV['ipad']);m=await ctx.new_page();cdp=await ctx.new_cdp_session(m);E=m.evaluate;W=m.wait_for_timeout
    await m.goto(BASE+('&' if '?' in BASE else '?')+'debug=1');await W(600);await m.touchscreen.tap(500,10);await W(300)
    await cdp.send('Emulation.setCPUThrottlingRate',{'rate':4})
    out={}
    for nm,lv,js in [('canal tunnel',0,'__A.tele(__A.L.tunnels[0].y0+60)'),('marsh',2,'__A.tele(-3000)'),('rapids',4,'__A.tele(-2500)'),('boss',4,'__A.tele(__A.L.arena.y0-40)')]:
        await E(f'__A.unlockLv=5;__A.newRun({lv})');await W(300);await E('__A.startPlay();__A.inv=99');await E(js);await E('__A.bot(true)');await W(1500);await E('__A.resetPerf()');await W(5000)
        out[nm]=await E('({fps:Math.round(__A.fps),work:+__A.work.toFixed(2),max:+__A.workMax.toFixed(1),dpr:__A.DPR})');await E('__A.bot(false)')
    print('PERF (iPad 1024x768 @2x, CPU throttled 4x):',json.dumps(out),flush=True)
    chk('[perf] 4x CPU throttle: average frame work < 12ms in every scene (60fps budget 16.7ms)',all(v['work']<12 for v in out.values()),json.dumps(out))
    chk('[perf] adaptive resolution steps down when frames run slow (keeps A10 smooth)',all(v['dpr']<2 for v in out.values()),json.dumps({k:v['dpr'] for k,v in out.items()}))
    print('INFO [perf] headless fps uses SwiftShader software rasterization (no GPU), so fps here is a floor, not an iPad number:',json.dumps({k:v['fps'] for k,v in out.items()}))
    await ctx.close()
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--autoplay-policy=no-user-gesture-required'])
        only=os.environ.get('ONLY')
        for n in ['ipad','iphone','portrait']:
            if not only or only==n: await run(b,n,True)
        if not only or only=='perf': await perf(b)
        await b.close()
    print(f'{sum(1 for r in RES if r[1])}/{len(RES)} passed');print('ALL OK' if ok else 'SOME FAILED');sys.exit(0 if ok else 1)
asyncio.run(main())
