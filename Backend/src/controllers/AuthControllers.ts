import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import User from '../models/User.js';
import type { Request, Response } from "express";
import { AppError } from "../utils/AppError.js";
import type { RegisterDto, LoginDto } from "../dtos/AuthDtos.js";
import { toUserResponse } from "../utils/toUserResponse.js";
import {
  sendWelcomeEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
} from "../services/emailService.js";

// Reusable cookie options
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms — keep in sync with JWT_EXPIRES_IN
};

// POST /api/auth/register - Sign up user & send verification OTP email
export async function signup(req: Request, res: Response) {
  const { name, username, email, phone, password } = req.body as RegisterDto;
  const displayName = (name ?? username ?? email.split('@')[0]) as string;

  const userPhone = phone || '9876543210';
  const existingUser = (await User.findOne({
    $or: [{ email }, { phone: userPhone }],
  })) as any;

  if (existingUser) {
    if (!existingUser.isEmailVerified) {
      // User registered previously but hasn't verified email yet — generate fresh OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      console.log(`\n🔑 [DEV OTP CODE FOR ${existingUser.email}]: ${otp}\n`);
      existingUser.emailVerificationToken = otp;
      existingUser.emailVerificationExpires = new Date(Date.now() + 15 * 60 * 1000);
      await existingUser.save();

      sendVerificationEmail(existingUser.email, existingUser.name, otp).catch((err) =>
        console.error('Verification email error:', err)
      );

      return res.status(200).json({
        success: true,
        requiresOtp: true,
        email: existingUser.email,
        message: "Account already exists but email is unverified. A new OTP has been sent to your email!",
      });
    }

    throw new AppError("An account with this email or phone number already exists. Please log in instead.", 409);
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  console.log(`\n🔑 [DEV OTP CODE FOR ${email}]: ${otp}\n`);

  const newUser = (await User.create({
    name: displayName,
    email,
    phone: userPhone,
    password: await bcrypt.hash(password, parseInt(process.env.SALT_ROUNDS || "10", 10)),
    isEmailVerified: false,
    emailVerificationToken: otp,
    emailVerificationExpires: new Date(Date.now() + 15 * 60 * 1000),
  })) as any;

  // Send Verification Email
  sendVerificationEmail(newUser.email, newUser.name, otp).catch((err) =>
    console.error('Verification email error:', err)
  );

  return res.status(201).json({
    success: true,
    requiresOtp: true,
    email: newUser.email,
    message: "Registration successful! Please enter the 6-digit OTP sent to your email.",
  });
}

// POST /api/auth/verify-otp - Verify Email OTP
export async function verifyOtp(req: Request, res: Response) {
  const { email, otp } = req.body;
  if (!email || !otp) {
    throw new AppError("Email and OTP are required", 400);
  }

  const user = await User.findOne({ email }).select("+emailVerificationToken +emailVerificationExpires");
  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (user.isEmailVerified) {
    // Already verified — issue token directly
    const accessToken = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET as string,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" } as jwt.SignOptions
    );

    return res
      .status(200)
      .cookie("token", accessToken, cookieOptions)
      .json({
        success: true,
        message: "Email is already verified!",
        data: { user: toUserResponse(user) },
      });
  }

  const cleanOtp = otp ? otp.toString().replace(/\s+/g, '').trim() : '';
  const expectedOtp = user.emailVerificationToken ? user.emailVerificationToken.toString().trim() : '';

  if (!expectedOtp || expectedOtp !== cleanOtp) {
    throw new AppError("Invalid OTP code. Please enter the latest 6-digit OTP code sent to your email.", 400);
  }

  if (user.emailVerificationExpires && user.emailVerificationExpires.getTime() < Date.now()) {
    throw new AppError("OTP has expired. Please click 'Resend OTP' to receive a new code.", 400);
  }

  user.isEmailVerified = true;
  user.set('emailVerificationToken', undefined);
  user.set('emailVerificationExpires', undefined);
  await user.save();

  // Send Welcome Email upon successful verification
  sendWelcomeEmail(user.email, user.name).catch((err) =>
    console.error('Welcome email error:', err)
  );

  const accessToken = jwt.sign(
    { userId: user._id, email: user.email },
    process.env.JWT_SECRET as string,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" } as jwt.SignOptions
  );

  return res
    .status(200)
    .cookie("token", accessToken, cookieOptions)
    .json({
      success: true,
      message: "Email verified successfully! Welcome to Hath Ki Kala!",
      data: { user: toUserResponse(user) },
    });
}

// POST /api/auth/resend-otp - Resend OTP email
export async function resendOtp(req: Request, res: Response) {
  const { email } = req.body;
  if (!email) {
    throw new AppError("Email is required", 400);
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new AppError("User not found", 404);
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  console.log(`\n🔑 [DEV RESENT OTP CODE FOR ${user.email}]: ${otp}\n`);
  user.emailVerificationToken = otp;
  user.emailVerificationExpires = new Date(Date.now() + 15 * 60 * 1000);
  await user.save();

  await sendVerificationEmail(user.email, user.name, otp);

  return res.status(200).json({
    success: true,
    message: `A new 6-digit OTP has been sent to ${user.email}`,
  });
}

// POST /api/auth/login - Log in user
export async function login(req: Request, res: Response) {
  const { emailOrPhone, password } = req.body as LoginDto;

  const dbUser = await User.findOne({ $or: [{ email: emailOrPhone }, { phone: emailOrPhone }] }).select("+password");
  if (!dbUser) {
    throw new AppError("No such user exists", 404);
  }

  const isMatch = await bcrypt.compare(password, dbUser.password);
  if (!isMatch) {
    throw new AppError("Invalid password", 400);
  }

  const accessToken = jwt.sign(
    { userId: dbUser._id, email: dbUser.email },
    process.env.JWT_SECRET as string,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" } as jwt.SignOptions
  );

  return res
    .status(200)
    .cookie("token", accessToken, cookieOptions)
    .json({
      success: true,
      message: "Login successful",
      data: { user: toUserResponse(dbUser) },
    });
}

export async function logout(req: Request, res: Response) {
  res.clearCookie("token", cookieOptions);
  return res.status(200).json({ success: true, message: "Logged out successfully" });
}

// POST /api/auth/forgot-password - Request password reset email
export async function forgotPassword(req: Request, res: Response) {
  const { email } = req.body;
  if (!email) {
    throw new AppError("Email is required", 400);
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new AppError("User with this email does not exist", 404);
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetUrl = `${req.headers.origin || 'http://localhost:5174'}/reset-password?token=${resetToken}&email=${encodeURIComponent(user.email)}`;

  await sendPasswordResetEmail(user.email, user.name, resetUrl);

  return res.status(200).json({
    success: true,
    message: `Password reset instructions sent to ${user.email}`,
  });
}