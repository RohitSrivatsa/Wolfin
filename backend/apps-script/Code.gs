/**
 * Wolfinn backend: a Google Apps Script web app that powers the contact form
 * (action: "contact") and emails each enquiry from your Google Workspace account.
 * (An AI assistant can be added later; see git history for the earlier "chat" action.)
 *
 * Setup (once): see backend/apps-script/README.md
 * Script properties (Project Settings -> Script properties):
 *   NOTIFY_EMAIL        where contact messages go (default admin@wolfinn.org)
 *   LOG_SHEET_ID        optional: a Google Sheet ID to log every enquiry
 */

var DEFAULT_NOTIFY = 'admin@wolfinn.org';
var CONTACT_LIMIT_PER_HOUR = 40;

/* -------------------------------------------------------------- routing -- */
function doGet() {
  return json_({ ok: true, service: 'wolfinn' });
}

function doPost(e) {
  var body;
  try { body = JSON.parse((e && e.postData && e.postData.contents) || '{}'); }
  catch (err) { return json_({ ok: false, error: 'bad_request' }); }
  try {
    if (body.action === 'contact') return json_(handleContact_(body));
    return json_({ ok: false, error: 'unknown_action' });
  } catch (err) {
    console.error(err);
    return json_({ ok: false, error: 'server_error' });
  }
}

/* -------------------------------------------------------------- contact -- */
function handleContact_(b) {
  if (b.website) return { ok: true };                       // honeypot: bots fill hidden fields
  if (!underLimit_('contact', CONTACT_LIMIT_PER_HOUR)) return { ok: false, error: 'busy' };
  var name = clean_(b.name, 80), email = clean_(b.email, 120), biz = clean_(b.business, 120);
  var message = clean_(b.message, 6000), source = clean_(b.source, 40) || 'contact form';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, error: 'email' };
  if (!message) return { ok: false, error: 'empty' };

  var to = prop_('NOTIFY_EMAIL') || DEFAULT_NOTIFY;
  var subject = clean_(b.subject, 140) || ('New enquiry from ' + (name || email));
  var text = [
    'From: ' + (name || '(no name)') + ' <' + email + '>',
    biz ? 'Business: ' + biz : null,
    'Via: ' + source,
    '',
    message
  ].filter(function (l) { return l !== null; }).join('\n');
  MailApp.sendEmail({ to: to, replyTo: email, subject: '[Wolfinn] ' + subject, body: text, name: 'Wolfinn website' });
  logRow_([new Date(), source, name, email, biz, subject, message]);
  return { ok: true };
}

/* -------------------------------------------------------------- helpers -- */
function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
function prop_(k) { return PropertiesService.getScriptProperties().getProperty(k); }
function clean_(v, max) { return String(v == null ? '' : v).replace(/\u0000/g, '').trim().slice(0, max); }
function underLimit_(kind, perHour) {
  var cache = CacheService.getScriptCache();
  var k = 'rate_' + kind + '_' + Utilities.formatDate(new Date(), 'UTC', 'yyyyMMddHH');
  var lock = LockService.getScriptLock();
  try { lock.waitLock(3000); } catch (e) { return true; }
  try {
    var n = Number(cache.get(k) || 0) + 1;
    cache.put(k, String(n), 3700);
    return n <= perHour;
  } finally { lock.releaseLock(); }
}
function logRow_(row) {
  var id = prop_('LOG_SHEET_ID');
  if (!id) return;
  try { SpreadsheetApp.openById(id).getSheets()[0].appendRow(row); } catch (e) { console.error(e); }
}

/* Run this once from the editor to check email sending works. */
function testContact() {
  Logger.log(JSON.stringify(handleContact_({ name: 'Test', email: 'test@example.com', message: 'Hello from the setup test.', source: 'setup test' })));
}
