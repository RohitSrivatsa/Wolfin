# Putting wolfinn.org live

You keep **Squarespace** as the place the domain is registered, and **Google Workspace** for email. The website itself is hosted for free on **Netlify**, which builds straight from this GitHub repository. Squarespace only needs a few DNS records changed so wolfinn.org points at Netlify. Your email records are not touched.

Why not host on Squarespace itself: Squarespace only runs sites built in its own editor. It can't host a hand-built, multi-page site like this one with its own scripts and demos.

## Step 1: Host the site on Netlify (about 10 minutes, free)

1. Go to <https://app.netlify.com> and sign up with your GitHub account.
2. Click **Add new site → Import an existing project → GitHub**, and choose **rohitsrivatsa/wolfin**.
3. Fill in the settings:
   - **Branch to deploy:** `main` (see "Automatic updates" below)
   - **Base directory:** leave empty
   - **Build command:** leave empty (there is nothing to build)
   - **Publish directory:** `site`
4. Click **Deploy**. Within a minute you get a test address such as `wolfinn-xyz.netlify.app`. Open it and check the site.
5. Optional: **Site configuration → Change site name** to something like `wolfinn`, so the test address becomes `wolfinn.netlify.app`.

## Step 2: Tell Netlify about your domain

1. In Netlify open **Domain management → Add a domain**, type `wolfinn.org`, and confirm you own it.
2. Choose to keep DNS where it is (with **Squarespace**, the "external DNS" option). Netlify then shows the exact records to add. Normally these are:

| Type | Host | Value |
|---|---|---|
| A | `@` | `75.2.60.5` |
| CNAME | `www` | `<your-site-name>.netlify.app` |

Always use the values Netlify shows you, in case they differ from the table.

## Step 3: Change the DNS in Squarespace (about 5 minutes)

1. Sign in to Squarespace and open **Domains** → **wolfinn.org** → **DNS** (or **DNS Settings**).
2. Find the **Squarespace Defaults** group. These records point the domain at a Squarespace website: A records on `@`, and a `www` CNAME to `ext-cust.squarespace.com`. Delete that group (trash icon).
3. **Do not touch the Google Workspace records.** These are the MX records (`smtp.google.com`, or several `aspmx.l.google.com` entries), plus any TXT records for SPF (`v=spf1 include:_spf.google.com ~all`) or Google verification. They keep your email working.
4. Under **Custom records**, add the two records from Step 2.
5. If Squarespace complains that the domain is connected to a Squarespace website, disconnect that site first (**Domains → wolfinn.org → Website**).

## Step 4: Wait, then switch on HTTPS

- DNS changes usually take effect within an hour, and occasionally up to 48 hours.
- In Netlify's **Domain management**, `wolfinn.org` turns green once it's working. Netlify then issues the free HTTPS certificate on its own. Make sure **Force HTTPS** is on.
- Set `wolfinn.org` (without www) as the primary domain, so `www.wolfinn.org` redirects to it.

## Step 5: Switch on the contact form and Finn

Follow `backend/apps-script/README.md`. It sets up a Google Apps Script on your Workspace account, and you paste its URL into `site/js/site.js`.

## Automatic updates

Once Netlify is connected, **every change pushed to the `main` branch goes live on its own**, usually within a minute. Nothing needs uploading by hand.

- The work in these sessions is pushed to a working branch first. When you're happy with it, it's merged into `main` (I can open a pull request for you), and Netlify publishes it.
- Netlify also gives each pull request its own preview link, so you can check changes before they go live.
- The Apps Script backend is separate. If its code changes, publish a new version as described in its README. The website address doesn't change.

## Checklist after launch

- [ ] `https://wolfinn.org` and `https://www.wolfinn.org` both open the site with a padlock.
- [ ] Sending an email to rohit@wolfinn.org still works.
- [ ] The Contact page's **Send message** delivers to your inbox.
- [ ] Finn answers a question (and not "Preview: answers come from a short FAQ").
- [ ] A spending limit is set in the Anthropic Console.
