# Wolfinn website

A static site: plain HTML, CSS and JavaScript, with no build step. To host it, upload this folder to any static host (Netlify, Vercel, Cloudflare Pages or GitHub Pages).

## Run it locally

```bash
cd site && python3 -m http.server 4500
```

Then open http://localhost:4500.

## Things to change

- **Email address:** `EMAIL` at the top of `js/site.js` (currently rohit@wolfinn.org). The copy buttons, email links and the gap finder's pre-filled email all read from it.
- **Light and dark mode:** the toggle in the top bar remembers each visitor's choice, and otherwise follows their system setting. The dark colours are in the two dark blocks near the top of `css/site.css`.
- **Founder name:** on `about.html`, the signature currently just says "Founder".
- **Services:** the home page tiles are in `index.html` (`.svc-grid`). The full list with mini flows is in `services.html`.
- **Gap finder tasks:** edit `TASKS` in `js/site.js`. Each task has a name, its steps and a result line. `GUESS` maps typed words to the closest task.

## Files

- `index.html`, `gap.html` (Find your gap), `services.html`, `about.html`, `contact.html`: the five pages.
- `css/site.css`: all of the site's styling (colours are the tokens at the top).
- `css/scrollcraft.css`, `js/scrollcraft.js`: the scroll engine (reveals and hero parallax). Don't edit these.
- `js/orca.js`: the vector orca. Its tail is a separate piece so it can flap.
- `img/`: the wolf-on-island vector, the wordmark and the icons.

Motion is turned off for visitors who have "reduce motion" switched on in their system settings.
