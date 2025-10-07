# Stage 1: Builder
FROM node:20 AS builder

WORKDIR /app

# Copy dependency files and install dependencies (cached layer)
COPY package.json package-lock.json ./
RUN npm ci --prefer-offline --no-audit

# Copy rest of the source code
COPY .env.staging .env.staging
COPY . .

# Replace this line:
# RUN npm run build
# With:
RUN npm run stagebuild

# Stage 2: Production Image
FROM node:20-slim

WORKDIR /app

# Install lightweight static server
RUN npm install -g serve

# Copy built app from builder
COPY --from=builder /app/dist ./build

# Expose port
EXPOSE 3173

# Set default command
CMD ["serve", "-s", "build", "-l", "3173"]
