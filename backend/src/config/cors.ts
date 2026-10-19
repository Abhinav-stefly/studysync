// Single source of truth for allowed browser origins.
// Comma-separated, so one backend can serve localhost and the deployed frontend.
export const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);