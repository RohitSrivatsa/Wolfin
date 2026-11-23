# Wolfinn website: project context (paste into a new chat)

I'm continuing work on my business website. Please read this before helping, and work the same way as before: make the change, test it (desktop + phone, light + dark), keep wording plain and simple, then ask before publishing to the live site.

## The business
- **Wolfinn**: a one-person software solutions studio run by me, Rohit (I'm the founder and the brand; no team, no client proof yet, no prices on the site).
- **Contact email:** admin@wolfinn.org (Google Workspace). Domain **wolfinn.org** is registered at Squarespace.
- **Services (in this order):** Custom software, Websites and web apps, Software consulting, Data analytics (dashboards from data), AI assistants, Workflow automation (last).
- **Tone:** calm, professional, simple, visual, little text. Avoid the word "gap" (use "problem"). No italics anywhere. No invented numbers, clients or reviews.

## Where everything lives
- **GitHub repo:** `RohitSrivatsa/Wolfin` (public).
  - `main` = live site. Every push to `main` auto-publishes in ~1 min via `.github/workflows/pages.yml` (build job uploads `site/`, then a deploy job publishes; uses checkout@v7, configure-pages@v6, upload-pages-artifact@v5, deploy-pages@v5).
  - Working branch used by Claude sessions: `claude/tender-noether-qyfl9o`. Work there, then push to `main` only after I say yes (fast-forward, no force).
- **Hosting:** GitHub Pages, Settings → Pages → Source: **GitHub Actions**, custom domain **wolfinn.org** with HTTPS. Squarespace DNS has GitHub's A records (185.199.108–111.153) and `www` CNAME → `rohitsrivatsa.github.io`. Google Workspace MX/TXT records must never be touched.
- **Full hosting guide:** `HOSTING.md`. Site notes: `site/README.md`.

## Site structure (`site/` folder, plain HTML/CSS/JS, no build step)
- Clean URLs via folders: `/` (index.html), `/services/`, `/contact/`, `/demos/software|websites|consulting|analytics|assistant|automation/`. Old `*.html` files are forwarding pages. All links/assets are root-relative (`/css/...`, `/services/`).
- `css/site.css` (all styling + theme tokens), `css/demo.css` (demo pages), `css/scrollcraft.css` + `js/scrollcraft.js` (scroll engine, don't edit), `js/site.js` (theme switch, email, wolf howl, backend helper), `js/orca.js` (vector orca with flapping tail), `js/composer.js` (contact form), `img/` (wolf-island.svg, wordmarks ink/light, favicon).
- `robots.txt` (allows all) and `sitemap.xml` (new clean URLs).

## Design
- "Waterline" concept from the logo: white sky above, teal water below, orange moon, wolf on an island, orca swimming (tail animates), drifting waves.
- Palette: ink #0B0D11, moon orange #F27A2E, tide #0E3A42, deep #032A31. Font: Inter Tight (headings 600), JetBrains Mono for small labels.
- **Light mode is the default.** A sliding sun/moon switch in the top bar toggles dark mode; the choice persists across pages. The site uses its own attribute `data-wf-theme` (not `data-theme`) so hosts can't flip it.
- Top bar: Home, Services, Contact (highlighted pill), theme switch. Phone: Menu button opens a fading teal menu.

## Pages
- **Home:** hero "Software solutions for whatever your business needs." (buttons: See it in action / Contact us), six service tiles each with a "Live demo" badge linking to its demo, "See all services" button, "Why Wolfinn" strip (One person start to finish / A plan before any building / Honest advice), ending with the Wolf + fin = Wolfinn story and the email with a Copy button (copying makes the wolf "howl": head lift).
- **Services:** rows for each service with a mini "how it works" flow and a "Try the demo" link.
- **Contact:** composer: tap problems + tools, name, email, business, notes → a live email preview → **Send message** (via Google Apps Script) or **Copy instead**; plus "Nothing fits? Email directly: admin@wolfinn.org". Shows "Sent. Thank you." on success; falls back to copying if sending fails.
- **Demos (sample data, clearly labelled):** automation pipeline, custom job-tracker app, three sample websites built live in a browser frame (bakery/dental/landscaping), consulting "tool check-up" (keep/replace/connect/drop for a café/trades/clinic), analytics dashboard from a messy spreadsheet, scripted dental-clinic AI chat.
- Removed for now: About page, AI assistant "Finn" (code in git history), the old "find your gap" / "Try it" page.

## Contact form backend
- Google Apps Script web app (code in `backend/apps-script/Code.gs`, guide in `backend/apps-script/README.md`). It emails each enquiry from my Workspace account with the visitor as reply-to. Hidden honeypot field; 40 messages/hour cap.
- Web app URL is set as `BACKEND` at the top of `site/js/site.js`:
  `https://script.google.com/macros/s/AKfycbzmecHxj-EXJ7N2txKFeUaoC9KVkS-phArVdhFmz75TK_T88XFYJUS2d41BfFfaxGoI/exec`
- Script property `NOTIFY_EMAIL` = admin@wolfinn.org (set in the Apps Script project settings, not in the repo).
- If the script code changes: Deploy → Manage deployments → Edit → New version (keeps the same URL).

## Things to know about the Claude environment
- Cloud sessions can't open wolfinn.org or script.google.com (network blocked) and can't control my Chrome; I test live pages myself or use Claude in Chrome from the desktop app.
- Check publish status via the repo's Actions runs ("Deploy site to GitHub Pages").

## Ideas not done yet
Booking link (Cal.com/Calendly), social preview images, a "page not found" page, privacy note, privacy-friendly analytics, my photo/name for trust, a real case study, "Who it's for" chips, bring-your-own-CSV on the analytics demo, a real AI assistant (Finn) later.
