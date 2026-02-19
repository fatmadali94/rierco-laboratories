# ============================================
# Dockerfile for Node.js Backend Services
# Use this for: auth-service, chat-service, materials-backend, tire-backend
# Supports both TypeScript (with build) and plain JavaScript projects
# ============================================

FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci

# Copy source code and configs
COPY . .

# Build TypeScript if tsconfig exists
RUN if [ -f "tsconfig.json" ]; then \
    echo "Building TypeScript project..." && \
    npm run build; \
    else \
    echo "JavaScript project - no build needed"; \
    fi

# ============================================
# Production stage
# ============================================
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production && npm cache clean --force

# Copy the entire built app from builder
COPY --from=builder /app .

# Expose port (will be overridden by docker-compose)
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:' + (process.env.PORT || 3000) + '/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)}).on('error', () => process.exit(1))"

# Smart start: use dist/index.js for TypeScript builds, src/index.js for JavaScript
CMD ["sh", "-c", "if [ -f dist/index.js ]; then node dist/index.js; elif [ -f dist/server.js ]; then node dist/server.js; elif [ -f src/index.js ]; then node src/index.js; else node src/server.js; fi"]