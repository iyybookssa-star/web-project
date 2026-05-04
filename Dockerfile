# ── Stage 1: Build the React/Vite client ──
FROM node:20-alpine AS client-build

WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ ./
RUN npm run build

# ── Stage 2: Production server ──
FROM node:20-alpine

WORKDIR /app

# Copy server files and install deps
COPY server/package*.json ./server/
RUN cd server && npm install --omit=dev

COPY server/ ./server/

# Copy built client into server/public for static serving
COPY --from=client-build /app/client/dist ./server/public

EXPOSE 5000

# Set default env vars (override at runtime)
ENV NODE_ENV=production
ENV PORT=5000

CMD ["node", "server/server.js"]
