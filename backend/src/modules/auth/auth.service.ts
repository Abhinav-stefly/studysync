import bcrypt from "bcrypt";
import { User } from "../users/user.model.js";
import { AppError } from "../../middleware/errorHandler.js";
import { generateAccessToken, generateRefreshToken } from "./token.utils.js";
import { RegisterInput, LoginInput } from "./auth.validation.js";

const SALT_ROUNDS = 10;

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

  const accessToken = generateAccessToken(user._id, user.role);
  const refreshToken = generateRefreshToken(user._id);

  return {
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
    accessToken,
    refreshToken,
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

  const accessToken = generateAccessToken(user._id, user.role);
  const refreshToken = generateRefreshToken(user._id);

  return {
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
    accessToken,
    refreshToken,
  };
};