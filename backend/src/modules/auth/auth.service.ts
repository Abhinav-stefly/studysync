import bcrypt from "bcrypt";
import { Types } from "mongoose";
import { User } from "../users/user.model.js";
import { AppError } from "../../middleware/errorHandler.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "./token.utils.js";
import { RegisterInput, LoginInput } from "./auth.validation.js";

const SALT_ROUNDS = 10;

// One place decides what a client may see about a user, so register,
// login, and refresh can never return different shapes.
const toPublicUser = (user: { _id: Types.ObjectId; name: string; email: string; role: string }) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
});

export const registerUser = async (input: RegisterInput) => {
  const existingUser = await User.findOne({ email: input.email });
  if (existingUser) {
    throw new AppError("Email already in use", 409);
  }

  const hashedPassword = await bcrypt.hash(input.password, SALT_ROUNDS);

  const user = await User.create({
    name: input.name,
    email: input.email,
    password: hashedPassword,
  });

  return {
    user: toPublicUser(user),
    accessToken: generateAccessToken(user._id, user.role),
    refreshToken: generateRefreshToken(user._id),
  };
};

export const loginUser = async (input: LoginInput) => {
  const user = await User.findOne({ email: input.email }).select("+password");
  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  const isPasswordValid = await bcrypt.compare(input.password, user.password);
  if (!isPasswordValid) {
    throw new AppError("Invalid email or password", 401);
  }

  return {
    user: toPublicUser(user),
    accessToken: generateAccessToken(user._id, user.role),
    refreshToken: generateRefreshToken(user._id),
  };
};

export const refreshSession = async (refreshToken: string | undefined) => {
  // Every failure throws the same error, so a caller cannot distinguish
  // "no cookie" from "forged" from "expired" from "account deleted".
  const fail = () => new AppError("Not authenticated", 401);

  if (!refreshToken) throw fail();

  let userId: string;
  try {
    ({ userId } = verifyRefreshToken(refreshToken));
  } catch {
    throw fail();
  }

  // Re-read the user rather than trusting the token: the role may have
  // changed since login, and the account may no longer exist.
  const user = await User.findById(userId);
  if (!user) throw fail();

  return {
    user: toPublicUser(user),
    accessToken: generateAccessToken(user._id, user.role),
  };
};