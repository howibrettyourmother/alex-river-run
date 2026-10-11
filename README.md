# Alex's River Run 🛶 — a canoe adventure for Alex

A top-down canoeing game made for Alex (almost 7), inspired by a real fall day paddling a calm Michigan river with Dad: a dark stone arch tunnel, a concrete bridge, weeping willows, mirror-still water and yellow and orange leaves, a silver aluminum canoe, and one very lucky woolly bear caterpillar.

**Play:** https://howibrettyourmother.github.io/alex-river-run/ (landscape on iPad or iPhone; Share → Add to Home Screen gives the "River Run" icon)

- **Paddling:** big LEFT / RIGHT paddle buttons (multi-touch). Paddling on one side turns the canoe the other way. Alternate left and right in rhythm to build POWER and speed, and hold both to brake or back-paddle. Keyboard: ←/→ or A/D, hold both (or ↓/S) to brake, Space/Enter for menus, P/Esc to pause. A settings toggle swaps to "arrow steering" if that feels easier.
- **Woolly bear rescue:** fuzzy black-and-orange caterpillars are stranded on floating leaves and sticks. Paddle close to scoop one up, then steer to the shore to drop it off. Each level has a "Woolly Bear Hero" counter, and the end screen celebrates every bear you saved.
- **Dad goes overboard** a few times per level: a goose steals his hat, he reaches for a frog, he leans too far on a sharp turn, or he does a huge sneeze. Big splash, lots of flailing and sputtering, then Alex paddles back to pick him up. He gets soggier each time (dripping, then a fish on his head, then a lily-pad hat).
- **Hazards:** logs, rocks, beaver dams with gaps, dive-bombing geese (a poop splat smears the screen for a moment), splashing fish, burping-bubble fish, dark stone tunnels where you only see a headlamp cone, and low bridges where everyone ducks automatically.
- **Collectibles:** golden acorns, turtles and frogs to wave at, and one hidden rubber duck per level.
- **5 levels:** Town Canal → Willow Bend → Fall Leaf Marsh → Beaver Pond → The Rapids, then the boss: a giant grumpy snapping turtle. Dodge his telegraphed lunges and bring him 3 flowers until he's happy, for a friendly finish.
- **Unlockable canoes:** Rocket (clear Willow Bend), Pirate (find 3 rubber ducks), Hot Dog (make the turtle happy). Best times and a top-10 leaderboard are saved on the device.
- **No harsh game over:** a bump costs a heart and plays a funny bonk. Run out of hearts and you get an "Oopsie!" and start again from the last checkpoint buoy.
- **Sound:** original WebAudio chiptune music for each level, synth sound effects, and warm voice lines that name Alex ("Woolly bear saved! Great job, Alex!"), played one at a time.

All art is procedural canvas and all audio is original WebAudio plus offline Piper TTS. No third-party game assets.

Dev: `src/gen.sh` (offline Piper TTS → `/tmp/arr`), `python3 src/build.py` (inlines clips and JS into `index.html`), `python3 src/icons.py` (Home Screen icons and og.png), `python3 src/test.py` (iPad 1024×768 and iPhone 844×390 landscape, portrait, touch, keyboard, stuck-input checks, control-coverage checks, and 4× CPU-throttle perf), `python3 src/fullrun.py` (scripted full playthrough of all 5 levels and the boss).

Input: touches are tracked per `Touch.identifier`. touchcancel, pointercancel, blur, pagehide and visibilitychange all clear input, so a paddle can never get stuck on.
