# Wolfinn backend: contact form (Google Apps Script)

One small script in your Google account powers the Contact page's **Send message** button. It emails each enquiry to admin@wolfinn.org from your own Google Workspace account, with the visitor's address set as reply-to, so you just press Reply. It's free.

## 1. Create the script (5 minutes)

1. Sign in to Google with your Workspace account and open <https://script.google.com>.
2. Click **New project**. Rename it **Wolfinn backend** (top left).
3. Delete the sample code, paste in everything from `Code.gs` in this folder, and click **Save**.

## 2. Add your settings

1. Click the gear icon (**Project Settings**), scroll to **Script properties**, and click **Add script property**.
2. Add the following:

| Property | Value |
|---|---|
| `NOTIFY_EMAIL` | `admin@wolfinn.org` |
| `LOG_SHEET_ID` | optional. The ID of a Google Sheet to log every enquiry (the long code in the Sheet's URL). |

## 3. Test it from the editor

1. In the editor, choose `testContact` in the function menu and press **Run**.
2. Google asks for permission the first time: **Review permissions** → your account → **Allow**. A test email should arrive in your inbox.

## 4. Deploy it as a web app

1. Click **Deploy → New deployment**. Under **Select type** (gear icon), choose **Web app**.
2. Set **Execute as** to **Me** (your account).
3. Set **Who has access** to **Anyone**. This is needed so website visitors can reach it; all they can do is send you a message.
4. Click **Deploy** and copy the **Web app URL**. It ends in `/exec`.

## 5. Connect the website

Open `site/js/site.js` and paste the URL here:

```js
var BACKEND = 'https://script.google.com/macros/s/XXXX/exec';
```

Commit and push (or send me the URL and I'll do it). Once the site is hosted, it redeploys on its own, and **Send message** really sends.

## Updating the script later

Edit the code, then go to **Deploy → Manage deployments**, click the pencil icon, set **Version** to **New version**, and click **Deploy**. The URL stays the same, so the website needs no change.

## Limits

- **Message cap:** at most 40 messages an hour across the site, to stop floods. Change `CONTACT_LIMIT_PER_HOUR` in `Code.gs` to adjust it.
- **Spam:** a hidden "honeypot" field quietly drops most bot submissions.
