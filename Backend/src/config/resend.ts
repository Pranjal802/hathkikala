import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.RESEND_API_KEY || '';

export const resend = new Resend(apiKey);
export const EMAIL_FROM = process.env.EMAIL_FROM || 'Hath Ki Kala <onboarding@resend.dev>';
