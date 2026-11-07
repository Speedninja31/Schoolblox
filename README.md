# SchoolBlox

A browser games hub (3D games built with Three.js, multiplayer by Supabase Realtime). No build step: it is plain HTML, CSS and JavaScript files.

## Folder layout

```
index.html            the page (menu layout + script list)
css/style.css         all styling
js/config.js          your Supabase URL + key (multiplayer and friends)
js/core.js            shared engine: 3D setup, avatars, controls, chat, friends, effects, game loop
js/menu.js            home screen: hero banner, cards, search, favorites, settings
js/games/             ONE FILE PER GAME
  avatar.js  tower.js  survive.js  pets.js  mm.js  hang.js
  fish.js    garden.js zom.js      snow.js  coming-soon.js
```

Each game file has three parts: its menu card (`GAMES.push(...)`), its menu info (`META.id=...`) and its engine (`ENG.id={...}`).

| File | Game |
|---|---|
| avatar.js | Avatar Shop |
| tower.js | Sky Tower |
| survive.js | Disaster Survival |
| pets.js | Pet Hatchery |
| mm.js | Murder Mystery |
| hang.js | Plaza Hangout |
| fish.js | Fishing Frenzy |
| garden.js | Garden Grove |
| zom.js | Zombie Siege |
| snow.js | Snowball Fight |

## Put it online

Upload the **contents** of this folder (so `index.html` is at the top level).

- **GitHub Pages:** new repo, upload everything, Settings, Pages, deploy from the main branch, root folder.
- **Netlify:** drag the folder onto the Deploys tab of your site (or connect the GitHub repo).
- **Vercel:** import the GitHub repo and click Deploy (no settings needed).

After an update, hard refresh the page (Ctrl+Shift+R) so the browser loads the new files.

## Multiplayer setup

Open `js/config.js` and paste your Supabase project URL and publishable key. The publishable key is safe to be public.

## Add a new game

1. Copy a small game file such as `js/games/hang.js` and rename it.
2. Change the card, the `META` line and the engine.
3. Add `<script src="js/games/yourgame.js"></script>` in `index.html`, before the `js/menu.js` line.

## Troubleshooting

- **Page looks like plain unstyled text, or the menu is empty:** a file did not load. The page now shows a red bar naming the missing file. Make sure `css/style.css`, `js/config.js`, `js/core.js`, `js/menu.js` and everything in `js/games/` are in the repository in those exact folders.
- **Still the old version after uploading:** wait for the Netlify/Vercel deploy to show "Published", then hard refresh (Ctrl+Shift+R).

## Quests, badges and gamepasses (js/quests.js)

- **Quests:** every game has one easy quest (+20 SchoolBux) and one hard quest (+100). They reset every hour (the top of the hour) and the wording rotates. Progress is read from the running game, so game files did not need changes. Edit the `Q` table in `js/quests.js` to change quests or rewards.
- **Income:** just being on the site gives +1 SchoolBux per minute (the Idle Income gamepass makes it +4). Pizza Place wages are now 1/4 of what they were.
- **Badges:** permanent achievements, listed in the `BD` table.
- **Gamepasses:** bought once with SchoolBux. VIP, Quest Reroll, Speed Coil, High Jump, Idle Income (the `PASSES` table).
- **Tools:** Speed Coil (Z) and High Jump (X) are real tools. Buy the gamepass, then equip it from the hotbar on the left of the screen (click it, or press the key). The tool shows in your hand and only works while equipped. Tools are off in Murder Mystery. Add a tool in the `TOOLS` table in `js/quests.js`.
- **Buttons:** Quests, Badges and Gamepasses are three separate buttons (top bar and side menu in the hub, and in the game bar while playing).
- Saved as `hubquests`, `hubbadges`, `hubpasses`, so accounts and export/import include them.

## Admin Console + special weather (js/admin.js, js/weather.js)
Open it with **`** (backquote), the /admin chat command, or the shield button. It only works while you are logged in as the admin account with your key on the device. It is a centered, draggable window (double-click the header to recenter).
- **Powers (only you, in any 3D game):** Fly (G, Space up, Shift/C down), Noclip (N), God mode, Air jump, Invisible, Teleport to your aim (T) or to a player, plus sliders for speed, jump, gravity and size. On phones, Fly shows up/down buttons.
- **Weather (everyone, or only you):** Rain, Thunderstorm, Blizzard, Meteor Shower, Aurora, Blood Moon, Disco Party, Gold Rush, Tornado, Dense Fog, Heatwave, Candy Rain, Eclipse, Starfall. It is drawn as an overlay, so it works in every game. Add a new one in the `TYPES` table in `js/weather.js`.
- **Events (everyone online):** Speed Party, Moon Gravity, Giant Party, Tiny Party, Bux Rain, Fireworks, Confetti, a 10 second Countdown, global message, clear chat.
- **Players:** teleport to, mute, kick, ban, give or take SchoolBux, and the report inbox.
- Every event is a signed command, so nobody else can fake one. See `NEW` in `js/admin.js` to add your own.

## Cops & Robbers (js/games/jail.js)
Pick Police or Prisoner. Prisoners start in a cell, escape (hack the gate keypad or dig the tunnel), rob the Bank, Jewelry Store, Gas Station and ATMs by holding E, and get away in cars. Crimes raise a wanted level and bot cops chase you. Police press E to arrest, F or right-click to taser, and can drive the police cars. Bots fill both teams when you play solo. Heists and arrests count for quests.

## Fishing Frenzy (js/games/fish.js)
- **Real fish:** every species is a low-poly 3D model that swims in the water. Cast near one to lure it: it swims over, nibbles (the bobber dips), then bites. Rare fish have a glowing ring on the surface.
- **Rods and reeling:** 5 rods that bend while you reel, bait, Perfect Cast zone, Perfect Hook, Flawless bonus, three fight styles (steady, dart, power), junk and treasure chests.
- **NPCs:** a shopkeeper on each island (Old Finn, Granny Moss, Capt. Coral) with speech bubbles, a request board and shop. Ambient anglers fish on the docks.
- **Progression:** angler levels (luck bonus), bigger bags, a Fish Book, three islands with their own fish.
- **World:** day/night with sun, moon and stars, rain every few minutes (fish bite more), clouds, gulls, fireflies. Time and weather come from the clock, so everyone online sees the same sky.
- Data lives at the top of the file (`FISH`, `RODS`, `BAITS`, `NPCD`, `ANGD`). Fish looks are in `FV`.
