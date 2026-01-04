# Build stage for frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /app

COPY package.json package-lock.json* ./

RUN npm ci

COPY . .

RUN npm run build

# Runtime stage
FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./

RUN npm ci --only=production

# Copy built frontend
COPY --from=frontend-builder /app/dist ./dist

# Copy remaining files
COPY . .

# Expose ports
EXPOSE 3000 3001

# Environment variables
ENV NODE_ENV=production
ENV PORT=3001

# Start both frontend and backend
CMD ["sh", "-c", "npm run server & npx vite preview --host 0.0.0.0 --port 3000"]
