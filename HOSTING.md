# Putting wolfinn.org live (GitHub Pages + Squarespace)

- **GitHub Pages** hosts the website for free, straight from this repository (it's public, which free Pages requires).
- **Squarespace** keeps the domain; you only change where wolfinn.org points.
- **Google Workspace** email (admin@wolfinn.org) is not affected, as long as you leave its records alone.

Squarespace itself can't host this site: it only runs sites built in its own editor.

## Part A: Switch on GitHub Pages (about 5 minutes)

1. **Create the `main` branch.** On GitHub, open the repository, click the branch menu (top left of the file list), type `main`, and choose **Create branch: main from 'claude/tender-noether-qyfl9o'**.
2. **Make it the default branch.** Go to **Settings → General → Default branch**, click the switch icon, choose `main`, and confirm.
3. **Choose how Pages publishes.** Go to **Settings → Pages**. Under **Build and deployment → Source**, choose **GitHub Actions**.
4. **Run the first publish.** Open the **Actions** tab, click **Deploy site to GitHub Pages** → **Run workflow** → **Run workflow**. Wait for the green tick (about a minute).
5. **Check it.** **Settings → Pages** now shows the address `https://rohitsrivatsa.github.io/Wolfin/`. Open it and check the site works.

## Part B: Verify the domain on GitHub (recommended, 3 minutes)

This stops anyone else from claiming wolfinn.org on GitHub.

1. On GitHub, click your profile photo → **Settings** (your account settings, not the repository's) → **Pages** → **Add a domain**.
2. Type `wolfinn.org` and click **Add domain**. GitHub shows a **TXT record**: a host like `_github-pages-challenge-rohitsrivatsa` and a long value. Keep this page open.
3. Add that TXT record in Squarespace (Part C, step 4), then come back and click **Verify**.

## Part C: Point wolfinn.org at GitHub in Squarespace (about 10 minutes)

1. Sign in at **squarespace.com** → **Domains** (or go to account.squarespace.com/domains) → click **wolfinn.org**.
2. In the left menu, open **DNS** → **DNS Settings**.
3. **Remove the Squarespace website records.** Find the group called **Squarespace Defaults**: four A records on `@` and a CNAME `www → ext-cust.squarespace.com`. Click the trash icon to delete the group.
   - **Leave the "Google Workspace" group exactly as it is**: the MX records (`smtp.google.com`, or several `aspmx.l.google.com` entries) and any TXT records like `v=spf1 include:_spf.google.com ~all` or `google-site-verification=...`. These run your email.
   - If Squarespace says the domain is in use by a Squarespace site, first go to **Domains → wolfinn.org → Website** and disconnect it.
4. **Add the GitHub records.** Under **Custom records**, click **Add record** for each row:

| Type | Host | Data / points to |
|---|---|---|
| A | `@` | `185.199.108.153` |
| A | `@` | `185.199.109.153` |
| A | `@` | `185.199.110.153` |
| A | `@` | `185.199.111.153` |
| AAAA | `@` | `2606:50c0:8000::153` |
| AAAA | `@` | `2606:50c0:8001::153` |
| AAAA | `@` | `2606:50c0:8002::153` |
| AAAA | `@` | `2606:50c0:8003::153` |
| CNAME | `www` | `rohitsrivatsa.github.io` |
| TXT | the host from Part B | the value from Part B |

   The AAAA rows are optional (they add IPv6), but recommended. Use your GitHub username in lowercase for the CNAME.
5. Click **Save** on each. In Part B, click **Verify** once the TXT record has been picked up (minutes to an hour).

## Part D: Connect the domain in GitHub and turn on HTTPS

1. In the repository, go to **Settings → Pages → Custom domain**, type `wolfinn.org`, and click **Save**.
2. GitHub runs a DNS check. It can say "DNS check in progress" for anywhere from a few minutes up to 24 hours while the change spreads.
3. When the check passes, tick **Enforce HTTPS**. The tick box may take up to an hour to become available while GitHub issues the free certificate.
4. Open `https://wolfinn.org` and `https://www.wolfinn.org`. Both should show the site with a padlock, and `www` should redirect to `wolfinn.org`.

## Automatic updates

Every change merged into `main` publishes itself within a minute or two through the **Deploy site to GitHub Pages** workflow. Work from these sessions lands on a working branch first; merging it into `main` (I can open a pull request) makes it live.

## Afterwards

- Send yourself a test email to admin@wolfinn.org to confirm email still works.
- Switch on the contact form's Send button: follow `backend/apps-script/README.md`, then send me the web app URL.

## If something goes wrong

- **"Domain does not resolve to the GitHub Pages server":** the DNS hasn't spread yet, or a Squarespace default A record is still there. Re-check Part C, step 3.
- **The Actions run fails with a "Pages" or "environment" error:** check that Part A, step 3 is set to **GitHub Actions**, then run the workflow again.
- **Email stopped:** a Google record was deleted by mistake. In Squarespace DNS Settings, use **Add preset → Google Workspace** to restore it.
