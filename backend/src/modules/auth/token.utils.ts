import jwt, { SignOptions } from "jsonwebtoken";
import { Types } from "mongoose";

interface TokenPayload {
  userId: string;
  role: string;
}

export const generateAccessToken = (userId: Types.ObjectId, role: string): string => {
  const payload: TokenPayload = { userId: userId.toString(), role };
  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET as string, {
    expiresIn: process.env.JWT_ACCESS_EXPIRY as SignOptions["expiresIn"],
  });
};

export const generateRefreshToken = (userId: Types.ObjectId): string => {
  const payload = { userId: userId.toString() };
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET as string, {
    expiresIn: process.env.JWT_REFRESH_EXPIRY as SignOptions["expiresIn"],
  });
};

export const verifyAccessToken = (token: string): TokenPayload => {
  return jwt.verify(token, process.env.JWT_ACCESS_SECRET as string) as TokenPayload;
};

export const verifyRefreshToken = (token: string): { userId: string } => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET as string) as { userId: string };
};