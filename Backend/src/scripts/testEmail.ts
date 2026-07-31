import { resend, EMAIL_FROM } from '../config/resend.js';
import dotenv from 'dotenv';

dotenv.config();

async function testResend() {
  console.log('Sending test email via Resend SDK...');
  console.log('API Key:', process.env.RESEND_API_KEY);
  console.log('From:', EMAIL_FROM);

  const targets = ['hathkikalashop@gmail.com', 'patelpranjal802@gmail.com'];

  for (const to of targets) {
    console.log(`\n--- Sending to ${to} ---`);
    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: [to],
      subject: '🌸 Resend API Test Email - Hath Ki Kala',
      html: '<h2>Resend Delivery Test</h2><p>Your Resend API email integration is working!</p>',
    });

    if (error) {
      console.error(`ERROR sending to ${to}:`, error);
    } else {
      console.log(`SUCCESS sending to ${to}! Message ID: ${data?.id}`);
    }
  }
}

testResend();
