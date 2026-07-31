import { resend, EMAIL_FROM } from '../config/resend.js';
import {
  getVerificationEmailHtml,
  getWelcomeEmailHtml,
  getPasswordResetEmailHtml,
  getOrderConfirmationEmailHtml,
  getShippingUpdateEmailHtml,
} from './emailTemplates.js';

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

// 100% Resend Email Service
export async function sendEmail({ to, subject, html }: SendEmailOptions) {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey || apiKey.includes('re_123456789') || apiKey === 'your_resend_api_key_here') {
    console.log(`\n================== [RESEND EMAIL SIMULATION] ==================`);
    console.log(`TO: ${to}`);
    console.log(`SUBJECT: ${subject}`);
    console.log(`STATUS: Logged cleanly (Add RESEND_API_KEY in Backend/.env to send real emails)`);
    console.log(`=================================================================\n`);
    return { success: true, simulated: true };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: [to],
      subject,
      html,
    });

    if (error) {
      console.error('[Resend API Error]:', error);
      if (error.name === 'validation_error' || (error as any).statusCode === 403) {
        console.warn(`\n⚠️ Resend Free Tier Limit: Resend testing mode only sends emails to your Resend account owner email.\nTo send emails to all customer addresses, verify your domain at https://resend.com/domains\n`);
      }
      return { success: false, error };
    }

    console.log(`[RESEND EMAIL SENT] ID: ${data?.id} to ${to}`);
    return { success: true, id: data?.id };
  } catch (err: any) {
    console.error('[Resend Exception]:', err?.message || err);
    return { success: false, error: err };
  }
}

// 1. Send Verification OTP Email
export async function sendVerificationEmail(toEmail: string, name: string, otp: string) {
  const html = getVerificationEmailHtml({ name, otp });
  return sendEmail({
    to: toEmail,
    subject: '🌸 Email Verification OTP - Hath Ki Kala',
    html,
  });
}

// 2. Send Welcome Email
export async function sendWelcomeEmail(toEmail: string, name: string) {
  const html = getWelcomeEmailHtml({ name });
  return sendEmail({
    to: toEmail,
    subject: '🌸 Welcome to Hath Ki Kala!',
    html,
  });
}

// 3. Send Password Reset Email
export async function sendPasswordResetEmail(toEmail: string, name: string, resetUrl: string) {
  const html = getPasswordResetEmailHtml({ name, resetUrl });
  return sendEmail({
    to: toEmail,
    subject: '🔐 Reset Your Password - Hath Ki Kala',
    html,
  });
}

// 4. Send Order Confirmation Email
export async function sendOrderConfirmationEmail(toEmail: string, order: any) {
  const html = getOrderConfirmationEmailHtml({ order });
  return sendEmail({
    to: toEmail,
    subject: `🎉 Order Confirmation #${order.id} - Hath Ki Kala`,
    html,
  });
}

// 5. Send Shipping Update Email
export async function sendShippingUpdateEmail(toEmail: string, order: any) {
  const html = getShippingUpdateEmailHtml({ order });
  return sendEmail({
    to: toEmail,
    subject: `🚚 Your Order #${order.id} Has Been Shipped! - Hath Ki Kala`,
    html,
  });
}
