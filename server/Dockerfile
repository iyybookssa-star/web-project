# ---- Server Dockerfile ----
FROM node:20-alpine

# Create app directory
WORKDIR /app

# Install dependencies (production only)
COPY package.json package-lock.json* ./
RUN npm install --omit=dev

# Copy source
COPY . .

EXPOSE 5000

CMD ["node", "server.js"]
