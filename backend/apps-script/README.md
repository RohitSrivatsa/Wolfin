# Wolfinn backend: contact form + Finn (Google Apps Script)

One small script in your Google account does two jobs:

- **Contact form:** emails each enquiry to rohit@wolfinn.org from your own Google Workspace account. The visitor's address is set as reply-to, so you just press Reply.
- **Finn, the AI assistant:** answers visitors using Claude. Your Anthropic API key stays inside Google, never in the website.

It's free to run on Google's side. Finn's answers are billed by Anthropic per message (see "Costs" below).

## 1. Create the script (5 minutes)

1. Sign in to Google as **rohit@wolfinn.org** and open <https://script.google.com>.
2. Click **New project**. Rename it **Wolfinn backend** (top left).
3. Delete the sample code, paste in everything from `Code.gs` in this folder, and click **Save**.

## 2. Add your settings

1. Click the gear icon (**Project Settings**), scroll to **Script properties**, and click **Add script property**.
2. Add the following:

| Property | Value |
|---|---|
| `NOTIFY_EMAIL` | `rohit@wolfinn.org` |
| `ANTHROPIC_API_KEY` | your key from <https://console.anthropic.com> → API keys. Leave it out to run the form only. |
| `LOG_SHEET_ID` | optional. The ID of a Google Sheet to log every enquiry (the long code in the Sheet's URL). |

## 3. Test it from the editor

1. In the editor, choose `testContact` in the function menu and press **Run**.
2. Google asks for permission the first time: **Review permissions** → your account → **Allow**. A test email should arrive in your inbox.
3. Choose `testChat` and press **Run**. The log should show a reply from Finn. If it says `chat_off`, the API key property is missing.

## 4. Deploy it as a web app

1. Click **Deploy → New deployment**. Under **Select type** (gear icon), choose **Web app**.
2. Set **Execute as** to **Me (rohit@wolfinn.org)**.
3. Set **Who has access** to **Anyone**. This is needed so website visitors can reach it; they can only send a message or ask Finn a question.
4. Click **Deploy** and copy the **Web app URL**. It ends in `/exec`.

## 5. Connect the website

Open `site/js/site.js` and paste the URL here:

```js
var BACKEND = 'https://script.google.com/macros/s/XXXX/exec';
```

Commit and push. Once the site is hosted, it redeploys on its own. The Contact page's **Send message** then really sends, and Finn switches from the FAQ to Claude.

## Updating the script later

Edit the code, then go to **Deploy → Manage deployments**, click the pencil icon, set **Version** to **New version**, and click **Deploy**. The URL stays the same, so the website needs no change.

## Costs and limits

- **Model:** Finn uses `claude-opus-5-5` at low effort. A typical message costs around one to two cents.
- **Cheaper option:** change `MODEL` at the top of `Code.gs` to `'claude-haiku-5-5'` for roughly a fortieth of the cost, with simpler answers.
- **Built-in caps:** 300 chat messages and 40 form messages per hour across the whole site. Change `CHAT_LIMIT_PER_HOUR` and `CONTACT_LIMIT_PER_HOUR` to adjust them.
- **Spending limit:** set a monthly limit in the Anthropic Console (Settings → Limits) as a safety net.
- **Spam:** a hidden "honeypot" field quietly drops most bot submissions.
