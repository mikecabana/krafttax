// Wait list collector. Paste into the Apps Script editor of a Google Sheet
// (Extensions > Apps Script), then Deploy > New deployment > Web app,
// "Execute as: Me", "Who has access: Anyone". Put the /exec URL in index.html.
// Each signup becomes a row: timestamp, email, language.

var EMAIL_RE = /^[a-z0-9][a-z0-9._%+-]*@[a-z0-9.-]+\.[a-z]{2,}$/;

function doPost(e) {
  var body = {};
  try { body = JSON.parse(e.postData.contents); } catch (err) {}

  // Honeypot: bots fill the hidden field. Pretend it worked.
  if (body.website) return json({ ok: true });

  var email = String(body.email || '').trim().toLowerCase();
  if (email.length > 254 || !EMAIL_RE.test(email)) return json({ ok: false, error: 'invalid_email' });
  var lang = body.lang === 'fr' ? 'fr' : 'en';

  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
    if (sheet.getLastRow() === 0) sheet.appendRow(['Timestamp', 'Email', 'Language']);
    var count = sheet.getLastRow() - 1;
    if (count > 0) {
      var emails = sheet.getRange(2, 2, count, 1).getValues();
      for (var i = 0; i < emails.length; i++) {
        if (emails[i][0] === email) return json({ ok: true, already: true, count: count });
      }
    }
    sheet.appendRow([new Date(), email, lang]);
    return json({ ok: true, already: false, count: count + 1 });
  } finally {
    lock.releaseLock();
  }
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
