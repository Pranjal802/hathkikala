import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from '../models/User.js';
import type { Request, Response } from "express";
import { AppError } from "../utils/AppError.js";
import type { RegisterDto, LoginDto } from "../dtos/AuthDtos.js";
import { toUserResponse } from "../utils/toUserResponse.js";

// Reusable cookie options
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms — keep in sync with JWT_EXPIRES_IN
};

export async function signup(req: Request, res: Response) {
  const { username, email, phone, password } = req.body as RegisterDto;

  const existingUser = await User.findOne({
    $or: [{ username }, { email }, { phone }],
  });

  if (existingUser) {
    throw new AppError("Email/Company name already exists", 409);
  }

  const newUser = await User.create({
    // username,
    email,
    phone,
    password: await bcrypt.hash(password, parseInt(process.env.SALT_ROUNDS || "10", 10)),
  });

  const accessToken = jwt.sign(
    { userId: newUser._id, email: newUser.email },
    process.env.JWT_SECRET as string,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" } as jwt.SignOptions
  );

  return res
    .status(201)
    .cookie("token", accessToken, cookieOptions)
    .json({
      success: true,
      message: "User created successfully",
      data: { user: toUserResponse(newUser) },
    });
}

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