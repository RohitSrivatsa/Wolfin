# Wolfinn website

A static site: plain HTML, CSS and JavaScript, with no build step. To host it, upload this folder to any static host (Netlify, Vercel, Cloudflare Pages or GitHub Pages).

## Run it locally

```bash
cd site && python3 -m http.server 4500
```

Then open http://localhost:4500.

## Going live

See `../HOSTING.md` (Netlify + your Squarespace domain) and `../backend/apps-script/README.md` (contact form and Finn).

## Things to change

- **Backend URL:** `BACKEND` at the top of `js/site.js` (the Apps Script web app URL). Empty means the form copies instead of sending and Finn uses the FAQ.
- **Email address:** `EMAIL` at the top of `js/site.js` (currently rohit@wolfinn.org). The copy buttons, email links and the gap finder's pre-filled email all read from it.
- **Light and dark mode:** the site opens in light mode. The switch in the top bar changes it, and the choice is remembered on every page. The dark colours are in the `:root[data-wf-theme="dark"]` block near the top of `css/site.css`. The site uses its own `data-wf-theme` attribute so nothing outside the site can flip the theme.
- **Services:** six services (workflow automation, custom software, websites and web apps, software consulting, data analytics, AI assistants). The home tiles are in `index.html` (`.svc-grid`); the full list with mini flows is in `services.html`.
- **The wolf's howl:** copying the email makes the wolf lift its head. The head is cut out of `img/wolf-island.svg` in `js/site.js` (look for `wolf-clip-head`).
- **Contact composer options:** the problem and tool buttons are plain HTML in `contact.html`; the email wording is in `js/composer.js`.

## Files

- `index.html`, `services.html`, `contact.html`: the main pages.
- `demo-automation.html`, `demo-software.html`, `demo-websites.html`, `demo-consulting.html`, `demo-analytics.html`, `demo-assistant.html`: one interactive demo per service, linked from the service tiles. Each demo keeps its own styles and script inside the page; shared demo styles are in `css/demo.css`.
- `js/composer.js`: the Contact page composer. **Send message** goes through the backend; **Copy instead** always works.
- `js/finn.js`: Finn, the AI assistant on every page. Uses Claude through the backend, or a short built-in FAQ until the backend is set.
- `css/site.css`: all of the site's styling (colours are the tokens at the top).
- `css/scrollcraft.css`, `js/scrollcraft.js`: the scroll engine (reveals and hero parallax). Don't edit these.
- `js/orca.js`: the vector orca. Its tail is a separate piece so it can flap.
- `img/`: the wolf-on-island vector, the wordmark and the icons.

Motion is turned off for visitors who have "reduce motion" switched on in their system settings.
