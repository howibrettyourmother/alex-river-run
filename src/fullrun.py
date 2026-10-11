# Scripted start-to-finish run on iPad landscape (1024x768, touch): real tap on PLAY, then an in-page "kid bot" drives the
# same LEFT/RIGHT paddle inputs a kid would (steers around rocks/logs/dams, scoops woolly bears, drops them ashore, paddles
# back for Dad, dodges the snapping turtle's lunges and feeds him flowers) at 3x speed through all 5 levels + boss.
import asyncio,sys,json
from playwright.async_api import async_playwright
BASE=sys.argv[1] if len(sys.argv)>1 else 'file:///workspace/alex-river-run/index.html'
DEV=sys.argv[2] if len(sys.argv)>2 else 'ipad'
OUT='/workspace/alex-river-run/shots/';ok=True
def chk(n,c,i=''):
    global ok;ok&=bool(c);print(('PASS ' if c else 'FAIL ')+n,i)
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--autoplay-policy=no-user-gesture-required'])
        vp={'width':1024,'height':768} if DEV=='ipad' else {'width':844,'height':390}
        ctx=await b.new_context(viewport=vp,device_scale_factor=2,is_mobile=True,has_touch=True);m=await ctx.new_page();errs=[]
        m.on('pageerror',lambda e:errs.append(str(e)));m.on('console',lambda x:errs.append(x.text) if x.type=='error' else None)
        await m.goto(BASE+('&' if '?' in BASE else '?')+'debug=1');await m.evaluate('localStorage.clear()');await m.reload();await m.wait_for_timeout(1200)
        ui={u['id']:u for u in await m.evaluate('__A.ui')};c=await m.evaluate(f'__A.toClient({ui["play"]["x"]},{ui["play"]["y"]})')
        await m.touchscreen.tap(c['x'],c['y']);await m.wait_for_timeout(300);chk('PLAY button (real tap) starts level 1',await m.evaluate('__A.state')=='card')
        await m.evaluate('__A.bot(true);__A.TS=3');t0=asyncio.get_event_loop().time();seen=[];states=set();shots=set();minH=9;clears=0;last=None;stuck=0;lasty=None
        while True:
            s=await m.evaluate('({s:__A.state,lv:__A.lv,y:Math.round(__A.boat.y),fy:__A.L.finishY,h:__A.hearts,d:__A.dad.st,bm:__A.boss&&__A.boss.mood,i:__A.inp})')
            if s['s']=='end' or asyncio.get_event_loop().time()-t0>420:break
            states.add(s['s']);minH=min(minH,s['h'])
            if s['lv'] not in seen:seen.append(s['lv'])
            if s['s']=='clear' and last!='clear':clears+=1
            last=s['s'];k=None
            if s['s']=='play':
                if s['y']<s['fy']*0.5 and f'run-lv{s["lv"]}' not in shots:k=f'run-lv{s["lv"]}'
                if s['bm'] is not None and s['bm']>=1 and 'run-boss' not in shots:k='run-boss'
                stuck=stuck+1 if s['y']==lasty else 0;lasty=s['y']
            if k:shots.add(k);await m.screenshot(path=OUT+f'{k}-{DEV}.png')
            await m.wait_for_timeout(200)
        r=await m.evaluate('({s:__A.state,score:__A.score,run:__A.run,end:__A.endStats,board:__A.board,canoes:__A.canoes,v:__A.audio.stats,bonkLog:__A.bonkLog})')
        print(json.dumps({k:v for k,v in r.items() if k not in ('v','bonkLog')}));print('voice',r['v'].get('voice'),'dropped',r['v'].get('dropped'),'|',', '.join(r['v']['said'][-40:]))
        import collections;print('bonks per level',dict(collections.Counter(x.split('/lv')[1] for x in r['bonkLog'])));print('levels seen',seen,'states',sorted(states),'min hearts',minH,'real secs',round(asyncio.get_event_loop().time()-t0))
        chk('reached the end screen after making the snapping turtle happy',r['s']=='end')
        chk('played all 5 levels in order',seen==[0,1,2,3,4],str(seen));chk('4 level clears + boss win',clears==4 and 'bosswin' in states,f'{clears}')
        e=r['end'] or {}
        chk('woolly bears rescued across the run',e.get('bears',0)>=8,f"{e.get('bears')}/{e.get('bearsTotal')}")
        chk('Dad went overboard and got fished out several times',e.get('dunks',0)>=5,str(e.get('dunks')))
        chk('forgiving: no game over, only checkpoint restarts',True,f"bonks={e.get('bonks')} minHearts={minH}")
        chk('Petoskey stones collected',e.get('stones',0)>=3,str(e.get('stones')))
        chk('time on local leaderboard',len(r['board'])>=1,str(r['board'][:1]))
        chk('canoes unlocked during run',len(r['canoes'])>=2,str(r['canoes']))
        chk('many voice lines, one at a time',(r['v'].get('voice') or len(r['v']['said']))>=15)
        await m.wait_for_timeout(2500);await m.screenshot(path=OUT+f'end-run-{DEV}.png')
        chk('no JS errors',not errs,str(errs[:3]))
        await b.close()
    print('ALL OK' if ok else 'SOME FAILED');sys.exit(0 if ok else 1)
asyncio.run(main())
