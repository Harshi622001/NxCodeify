import "dotenv/config";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { openDb, insertLead, updateLeadStatus } from "./db.js";
import { createTransportFromEnv, sendLeadEmail } from "./mailer.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, "..");

const app = express();
app.disable("x-powered-by");

app.use(express.json({ limit: "200kb" }));

// Serve static site
app.use(express.static(rootDir));

const db = openDb();

function validateLead(body) {
  const lead = {
    createdAt: new Date().toISOString(),
    name: String(body?.name || "").trim(),
    email: String(body?.email || "").trim(),
    phone: String(body?.phone || "").trim(),
    service: String(body?.service || "").trim(),
    message: String(body?.message || "").trim(),
    source: String(body?.source || "").trim()
  };

  if (lead.name.length < 2) throw new Error("Invalid name");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email)) throw new Error("Invalid email");
  if (!lead.service) throw new Error("Missing service");
  if (lead.message.length < 10) throw new Error("Message too short");
  if (lead.phone && !/^[0-9+\s()-]{7,}$/.test(lead.phone)) throw new Error("Invalid phone");
  return lead;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function sendWithRetry({ transporter, toEmail, lead, leadId, maxAttempts = 4 }) {
  let attempt = 0;
  let lastErr = null;
  while (attempt < maxAttempts) {
    attempt += 1;
    try {
      await sendLeadEmail(transporter, toEmail, lead, leadId);
      return { ok: true, attempts: attempt };
    } catch (e) {
      lastErr = e;
      // exponential backoff with small jitter
      const backoff = Math.min(8000, 600 * 2 ** (attempt - 1)) + Math.floor(Math.random() * 250);
      await updateLeadStatus(db, leadId, "retrying", attempt, String(e?.message || e));
      await sleep(backoff);
    }
  }
  return { ok: false, attempts: attempt, error: String(lastErr?.message || lastErr) };
}

app.post("/api/lead", async (req, res) => {
  try {
    const toEmail = process.env.LEADS_TO || "nxcodeify@gmail.com";
    const lead = validateLead(req.body);

    // Always store first (prevents data loss).
    const leadId = await insertLead(db, { ...lead, status: "received", attempts: 0, lastError: "" });

    // If SMTP isn't configured yet, keep the lead stored and return a helpful error.
    let transporter = null;
    try {
      transporter = createTransportFromEnv();
    } catch (e) {
      await updateLeadStatus(db, leadId, "stored_no_smtp", 0, String(e?.message || e));
      return res.status(503).json({
        ok: false,
        error:
          "Lead saved locally, but email is not configured yet. Set SMTP env vars in server/.env and restart."
      });
    }

    const out = await sendWithRetry({ transporter, toEmail, lead, leadId, maxAttempts: 4 });
    if (out.ok) {
      await updateLeadStatus(db, leadId, "sent", out.attempts, "");
      return res.json({ ok: true, leadId, attempts: out.attempts });
    }

    await updateLeadStatus(db, leadId, "failed", out.attempts, out.error);
    return res.status(502).json({ ok: false, error: "Email failed after retries. Lead was saved safely." });
  } catch (e) {
    return res.status(400).json({ ok: false, error: String(e?.message || e) });
  }
});

// SPA-ish fallback (keeps anchor routes friendly if you add any later)
app.get("*", (req, res) => {
  res.sendFile(path.join(rootDir, "index.html"));
});

const PORT = Number(process.env.PORT || 8787);
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Nxcodify site running on http://localhost:${PORT}`);
});

