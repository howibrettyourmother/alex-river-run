# Render the Home Screen icon + og image from the game itself (?icon=1 / ?og=1), then resize with PIL.
import asyncio
from playwright.async_api import async_playwright
from PIL import Image
R='/workspace/alex-river-run/'
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(executable_path='/usr/bin/google-chrome')
    pg=await b.new_page(viewport={'width':512,'height':512},device_scale_factor=2)
    await pg.goto('file://'+R+'index.html?icon=1');await pg.wait_for_timeout(1500);await pg.screenshot(path=R+'src/icon-master.png')
    pg=await b.new_page(viewport={'width':1200,'height':630},device_scale_factor=1)
    await pg.goto('file://'+R+'index.html?og=1');await pg.wait_for_timeout(1500);await pg.screenshot(path=R+'og.png')
    await b.close()
  im=Image.open(R+'src/icon-master.png').convert('RGB')
  for n,s in [('apple-touch-icon.png',180),('apple-touch-icon-167.png',167),('apple-touch-icon-152.png',152),('apple-touch-icon-120.png',120),('icon-192.png',192),('icon-512.png',512),('favicon-32.png',32)]:
    im.resize((s,s),Image.LANCZOS).save(R+n,optimize=True)
  print('icons ok')
asyncio.run(main())
