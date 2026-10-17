# ---------- Stage 1: build ----------
FROM node:24-alpine AS build
WORKDIR /app

# Dependencies first, for layer caching
COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# ---------- Stage 2: runtime ----------
FROM node:24-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Only the compiled output crosses over from the build stage
COPY --from=build /app/dist ./dist

# Don't run as root inside the container
USER node

EXPOSE 5000
CMD ["node", "dist/server.js"]