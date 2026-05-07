# Nxcodify Website (HTML/CSS/JS — Netlify-ready)

Static site: open `index.html` locally or deploy the folder to **Netlify** (drag-and-drop or Git).

## Contact form → Google Sheet + email (no backend, no AWS)

The form does **not** call Netlify Functions or a Node server. It `POST`s to **Google Apps Script**, which:

1. Appends a row to your spreadsheet  
2. Sends you an email via `MailApp` (e.g. to `nxcodeify@gmail.com`)

### Important: Google Forms vs Google Sheets

- **Google Forms** does **not** show **Extensions → Apps Script**. That menu exists only in **Google Sheets**.
- If you use a Form today, link it to a Sheet: open the Form → **Responses** → **Link to Sheets** (or create a new spreadsheet for responses) → **View in Sheets**.
- Open that file in **Google Sheets** (grid of cells). There you will see **Extensions** in the top menu bar.

### Path A — Apps Script from the Sheet (recommended)

1. Open the **spreadsheet** (not the Form editor).  
2. **Extensions → Apps Script**.  
3. Replace the default code with the contents of `google-apps-script/Code.gs`.  
4. Set `NOTIFY_EMAIL` at the top if needed. Leave `SPREADSHEET_ID = ""` empty when using this path.  
5. Save the project (disk icon).

### Path B — No “Extensions” menu (use script.google.com)

1. Open [script.google.com](https://script.google.com) while logged into the same Google account as the Sheet.  
2. **New project** → paste `google-apps-script/Code.gs`.  
3. In the script, set `SPREADSHEET_ID` to the ID from your Sheet URL:  
   `https://docs.google.com/spreadsheets/d/`**`THIS_LONG_ID`**`/edit`  
4. Save, then run **setupHeaders** and deploy the Web app as below.

### Authorize

In the Apps Script editor, select **setupHeaders** in the toolbar dropdown → **Run**. Approve access to **Spreadsheet** and **Mail** when asked.

### Deploy as Web App

1. **Deploy → New deployment**  
2. Type: **Web app**  
3. **Execute as:** Me  
4. **Who has access:** **Anyone**  
5. Deploy and copy the **Web app URL** (ends with `/exec`).

That URL is **not** the same as the Sheet’s “share” link.

### Connect the website

In `index.html`, find:

```html
window.NXCODEIFY_SHEETS_URL = "PASTE_YOUR_APPS_SCRIPT_WEB_APP_URL_HERE";
```

Replace the placeholder with your **Web app URL** (keep the quotes), commit, and deploy to Netlify.

### Test

Submit the form on your live site. You should see a new row in the **Leads** tab and an email in your inbox.

---

## Optional: local preview with Node (legacy)

A small Express + SQLite server exists in `server/` for local SMTP experiments; **you do not need it for Netlify**. For static preview only:

```bash
open index.html
```
