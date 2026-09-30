import "server-only";
import nodemailer, { type Transporter } from "nodemailer";

/**
 * Email transport.
 *
 * - If SMTP_HOST is set in the environment, real SMTP is used (Gmail app password,
 *   Resend SMTP, Mailtrap, Brevo…) — see .env.example.
 * - Otherwise a free Ethereal test inbox is created automatically with
 *   `nodemailer.createTestAccount()`. Nothing reaches a real inbox; every message
 *   gets a preview URL you can open in the browser.
 */

export type MailMessage = { to: string; subject: string; html: string; text: string; replyTo?: string };
export type MailResult = { messageId: string; previewUrl?: string; provider: "smtp" | "ethereal" };

const SEND_TIMEOUT_MS = 15_000;

type MailerCache = { transporter?: Promise<{ transporter: Transporter; provider: MailResult["provider"]; from: string }> };
// Survive Next.js dev hot-reloads so we don't create a new Ethereal account on every edit.
const cache = ((globalThis as { __smilecareMailer?: MailerCache }).__smilecareMailer ??= {});

async function createTransporter() {
  const host = process.env.SMTP_HOST;
  if (host) {
    const port = Number(process.env.SMTP_PORT ?? 587);
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: process.env.SMTP_SECURE ? process.env.SMTP_SECURE === "true" : port === 465,
      auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS ?? "" } : undefined,
    });
    const from = process.env.MAIL_FROM || process.env.SMTP_USER || "no-reply@smilecare.local";
    return { transporter, provider: "smtp" as const, from };
  }

  const account = await nodemailer.createTestAccount();
  const transporter = nodemailer.createTransport({
    host: account.smtp.host,
    port: account.smtp.port,
    secure: account.smtp.secure,
    auth: { user: account.user, pass: account.pass },
  });
  console.info(`[mail] Using Ethereal test inbox ${account.user} — log in at https://ethereal.email with password ${account.pass}`);
  return { transporter, provider: "ethereal" as const, from: account.user };
}

function getTransporter() {
  if (!cache.transporter) {
    cache.transporter = createTransporter().catch((error) => {
      cache.transporter = undefined; // allow a retry on the next email
      throw error;
    });
  }
  return cache.transporter;
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`Mail server did not respond within ${ms / 1000}s`)), ms);
    promise.then(
      (v) => (clearTimeout(timer), resolve(v)),
      (e) => (clearTimeout(timer), reject(e)),
    );
  });
}

export async function sendMail(message: MailMessage, fromName: string): Promise<MailResult> {
  return withTimeout(
    (async () => {
      const { transporter, provider, from } = await getTransporter();
      const info = await transporter.sendMail({ from: { name: fromName, address: from }, ...message });
      const preview = provider === "ethereal" ? nodemailer.getTestMessageUrl(info) : false;
      if (preview) console.info(`[mail] "${message.subject}" → ${message.to} · preview: ${preview}`);
      return { messageId: info.messageId, previewUrl: preview || undefined, provider };
    })(),
    SEND_TIMEOUT_MS,
  );
}
