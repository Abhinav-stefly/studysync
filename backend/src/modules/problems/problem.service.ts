import { Problem } from "./problem.model.js";
import { AppError } from "../../middleware/errorHandler.js";
import { CreateProblemInput, UpdateProblemInput, ListProblemsQuery } from "./problem.validation.js";
import { getRedisClient } from "../../config/redis.js";

export const createProblem = async (userId: string, input: CreateProblemInput) => {
  return Problem.create({ ...input, userId });
};

export const listProblems = async (userId: string, query: ListProblemsQuery) => {
  const { page, limit, difficulty, topic, status, search, sort } = query;

  const filter: Record<string, unknown> = { userId };
  if (difficulty) filter.difficulty = difficulty;
  if (topic) filter.topic = topic;
  if (status) filter.status = status;
  if (search) filter.title = { $regex: search, $options: "i" };

  const skip = (page - 1) * limit;

  const [problems, total] = await Promise.all([
    Problem.find(filter).sort(sort).skip(skip).limit(limit),
    Problem.countDocuments(filter),
  ]);

  return {
    problems,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getProblemById = async (userId: string, problemId: string) => {
  const problem = await Problem.findOne({ _id: problemId, userId });
  if (!problem) {
    throw new AppError("Problem not found", 404);
  }
  return problem;
};

export const updateProblem = async (userId: string, problemId: string, input: UpdateProblemInput) => {
  const problem = await Problem.findOneAndUpdate(
    { _id: problemId, userId },
    { $set: input },
    { new: true, runValidators: true }
  );
  if (!problem) {
    throw new AppError("Problem not found", 404);
  }
  return problem;
};

export const deleteProblem = async (userId: string, problemId: string) => {
  const problem = await Problem.findOneAndDelete({ _id: problemId, userId });
  if (!problem) {
    throw new AppError("Problem not found", 404);
  }
  return problem;
};

const POPULAR_CACHE_KEY = "problems:popular";
const POPULAR_CACHE_TTL_SECONDS = 120;

export const getPopularTopics = async () => {
  const redis = getRedisClient();

  const cached = await redis.get(POPULAR_CACHE_KEY);
  if (cached) {
    return JSON.parse(cached);
  }

  const popular = await Problem.aggregate([
    { $group: { _id: "$topic", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 },
    { $project: { _id: 0, topic: "$_id", count: 1 } },
  ]);

  await redis.set(POPULAR_CACHE_KEY, JSON.stringify(popular), "EX", POPULAR_CACHE_TTL_SECONDS);

  return popular;
};