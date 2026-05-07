/**
 * Nxcodify lead form → Google Sheet + email (no Netlify/AWS backend).
 *
 * --- If you use Google Forms ---
 * Google Forms does NOT have "Extensions → Apps Script". You must use the *spreadsheet*
 * that stores your form responses:
 * 1. Open your Form → tab "Responses" → link or create a Google Sheet (response destination).
 * 2. Click "View in Sheets" / open that Sheet in Google Sheets (sheets.google.com).
 * 3. In the *Sheet*, menu: Extensions → Apps Script → paste this code.
 *
 * --- If you don’t see Extensions in Sheets ---
 * Go to https://script.google.com → New project → paste this code → set SPREADSHEET_ID
 * below (the long id in your Sheet’s URL: docs.google.com/spreadsheets/d/THIS_PART/edit)
 *
 * Setup (either path):
 * 1. Paste this file into Code.gs, save.
 * 2. Run setupHeaders() once → authorize Spreadsheet + Mail.
 * 3. Deploy → New deployment → Web app → Execute as: Me → Who has access: Anyone.
 * 4. Copy Web App URL (/exec) into index.html → window.NXCODEIFY_SHEETS_URL
 */

/** Leave "" if the script was created from the Sheet (Extensions → Apps Script). */
var SPREADSHEET_ID = "";

var SHEET_NAME = "Leads";
var NOTIFY_EMAIL = "nxcodeify@gmail.com";

function getSpreadsheet_() {
  if (SPREADSHEET_ID && String(SPREADSHEET_ID).trim() !== "") {
    return SpreadsheetApp.openById(String(SPREADSHEET_ID).trim());
  }
  return SpreadsheetApp.getActiveSpreadsheet();
}

function doPost(e) {
  try {
    if (!e || !e.parameter || !e.parameter.data) {
      throw new Error("Missing form data");
    }
    var p = JSON.parse(e.parameter.data);
    var ss = getSpreadsheet_();
    var sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
      sheet
        .getRange(1, 1, 1, 7)
        .setValues([["Submitted At", "Name", "Email", "Phone", "Service", "Message", "Source"]]);
    }
    var row = [
      p.submittedAt || new Date().toISOString(),
      p.name || "",
      p.email || "",
      p.phone || "",
      p.service || "",
      p.message || "",
      p.source || "",
    ];
    sheet.appendRow(row);

    var subject = "New Nxcodify lead — " + (p.service || "inquiry") + " — " + (p.name || "");
    var body =
      "Name: " +
      (p.name || "") +
      "\nEmail: " +
      (p.email || "") +
      "\nPhone: " +
      (p.phone || "") +
      "\nService: " +
      (p.service || "") +
      "\nSource: " +
      (p.source || "") +
      "\n\nMessage:\n" +
      (p.message || "");

    MailApp.sendEmail({
      to: NOTIFY_EMAIL,
      replyTo: p.email || NOTIFY_EMAIL,
      subject: subject,
      body: body,
    });

    return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(
      ContentService.MimeType.JSON
    );
  } catch (err) {
    var msg = err && err.message ? err.message : String(err);
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: msg })).setMimeType(
      ContentService.MimeType.JSON
    );
  }
}

// Allows opening the /exec URL in a browser (GET).
function doGet() {
  return ContentService.createTextOutput(
    JSON.stringify({
      ok: true,
      message: "Nxcodify lead endpoint is live. Use POST /exec with form data."
    })
  ).setMimeType(ContentService.MimeType.JSON);
}

/** Run once from Apps Script editor to create the "Leads" tab + headers. */
function setupHeaders() {
  var ss = getSpreadsheet_();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  sheet.getRange(1, 1, 1, 7).setValues([["Submitted At", "Name", "Email", "Phone", "Service", "Message", "Source"]]);
}
