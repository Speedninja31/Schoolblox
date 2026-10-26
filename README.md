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
