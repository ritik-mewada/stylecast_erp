/**
 * Outgoing email.
 *
 * With SMTP_URL set (e.g. smtps://user:pass@smtp.example.com:465) mail goes
 * out through nodemailer. Without it, development prints each email to the
 * console so flows like password reset can be followed locally, and
 * production logs a warning instead (never the body, which may hold a token).
 */
import nodemailer from "nodemailer";
import { Config } from "../config";

const transport = Config.SMTP_URL ? nodemailer.createTransport(Config.SMTP_URL) : null;

export interface MailMessage {
  to: string;
  subject: string;
  text: string;
}

export const sendMail = async (message: MailMessage): Promise<void> => {
  if (transport) {
    await transport.sendMail({ from: Config.MAIL_FROM, ...message });
    return;
  }

  if (Config.NODE_ENV === "production") {
    console.warn(`✉️  SMTP_URL is not set; "${message.subject}" was not sent.`);
    return;
  }

  console.log(
    `✉️  [dev mail] To: ${message.to}\nSubject: ${message.subject}\n\n${message.text}\n`,
  );
};
