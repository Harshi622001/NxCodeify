import nodemailer from "nodemailer";

function required(name, v) {
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

export function createTransportFromEnv() {
  const host = required("SMTP_HOST", process.env.SMTP_HOST);
  const port = Number(required("SMTP_PORT", process.env.SMTP_PORT));
  const user = required("SMTP_USER", process.env.SMTP_USER);
  const pass = required("SMTP_PASS", process.env.SMTP_PASS);
  const secure = String(process.env.SMTP_SECURE || "").toLowerCase() === "true" || port === 465;

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass }
  });
}

export async function sendLeadEmail(transporter, toEmail, lead, leadId) {
  const safe = (s) => String(s || "").trim();
  const subject = `New Lead — ${safe(lead.service)} — ${safe(lead.name)}`;

  const text = [
    `New lead received (id: ${leadId})`,
    "",
    `Name: ${safe(lead.name)}`,
    `Email: ${safe(lead.email)}`,
    `Phone: ${safe(lead.phone)}`,
    `Service: ${safe(lead.service)}`,
    `Source: ${safe(lead.source)}`,
    "",
    "Message:",
    safe(lead.message),
    "",
    `CreatedAt: ${safe(lead.createdAt)}`
  ].join("\n");

  const html = `
    <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;line-height:1.5">
      <h2 style="margin:0 0 8px">New lead received</h2>
      <p style="margin:0 0 14px;color:#445">Lead id: <strong>${leadId}</strong></p>
      <table cellspacing="0" cellpadding="6" style="border:1px solid #e7ecf3;border-radius:12px;overflow:hidden">
        <tr><td><strong>Name</strong></td><td>${escapeHtml(safe(lead.name))}</td></tr>
        <tr><td><strong>Email</strong></td><td>${escapeHtml(safe(lead.email))}</td></tr>
        <tr><td><strong>Phone</strong></td><td>${escapeHtml(safe(lead.phone))}</td></tr>
        <tr><td><strong>Service</strong></td><td>${escapeHtml(safe(lead.service))}</td></tr>
        <tr><td><strong>Source</strong></td><td>${escapeHtml(safe(lead.source))}</td></tr>
      </table>
      <h3 style="margin:16px 0 8px">Message</h3>
      <div style="border:1px solid #e7ecf3;background:#f6f8fc;border-radius:12px;padding:12px;white-space:pre-wrap">
        ${escapeHtml(safe(lead.message))}
      </div>
      <p style="margin:16px 0 0;color:#667;font-size:12px">CreatedAt: ${escapeHtml(safe(lead.createdAt))}</p>
    </div>
  `;

  await transporter.sendMail({
    from: process.env.MAIL_FROM || process.env.SMTP_USER,
    to: toEmail,
    replyTo: lead.email,
    subject,
    text,
    html
  });
}

function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

