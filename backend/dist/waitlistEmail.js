"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildWaitlistMailto = buildWaitlistMailto;
exports.sendWaitlistEmail = sendWaitlistEmail;
function escapeHtml(value) {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}
function buildWaitlistMailto({ name, email, message }) {
    const to = process.env.WAITLIST_TO_EMAIL || "hello@routemood.com";
    const subject = `Route Mood waitlist feedback from ${name}`;
    const body = [
        `Name: ${name}`,
        `Email: ${email}`,
        "",
        message
    ].join("\n");
    return `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
async function sendWaitlistEmail(input) {
    const apiKey = process.env.RESEND_API_KEY;
    const to = process.env.WAITLIST_TO_EMAIL || "hello@routemood.com";
    const from = process.env.WAITLIST_FROM_EMAIL || "Route Mood <onboarding@resend.dev>";
    if (!apiKey) {
        return {
            sent: false,
            mailtoUrl: buildWaitlistMailto(input),
            reason: "RESEND_API_KEY is not configured."
        };
    }
    const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            from,
            to,
            reply_to: input.email,
            subject: `Route Mood waitlist feedback from ${input.name}`,
            html: `
        <h2>New Route Mood waitlist message</h2>
        <p><strong>Name:</strong> ${escapeHtml(input.name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(input.email)}</p>
        <p><strong>Message:</strong></p>
        <p>${escapeHtml(input.message).replace(/\n/g, "<br>")}</p>
      `
        })
    });
    if (!response.ok) {
        return {
            sent: false,
            mailtoUrl: buildWaitlistMailto(input),
            reason: "Email provider rejected the request."
        };
    }
    return { sent: true };
}
