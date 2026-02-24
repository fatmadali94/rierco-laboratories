# ============================================
# Dockerfile for Node.js Backend Services
# Specifically for projects with root-level index.js
# ============================================

FROM node:20-alpine AS builder

WORKDIR /app

# Configure npm for better connectivity in restricted networks
RUN npm config set registry https://registry.npmmirror.com && \
    npm config set strict-ssl false && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000 && \
    npm config set fetch-retries 5

# Copy package files
COPY package*.json ./

# Install all dependencies
RUN if [ -f "package-lock.json" ]; then \
      npm ci --legacy-peer-deps; \
    else \
      npm install --legacy-peer-deps; \
    fi

# Copy source code
COPY . .

# Build if build script exists (Babel compilation)
RUN npm run build 2>&1 || echo "No build script or build failed, using source files"

# ============================================
# Production stage
# ============================================
FROM node:20-alpine

WORKDIR /app

# Configure npm for production installs
RUN npm config set registry https://registry.npmmirror.com && \
    npm config set strict-ssl false

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN if [ -f "package-lock.json" ]; then \
      npm ci --only=production --legacy-peer-deps; \
    else \
      npm install --only=production --legacy-peer-deps; \
    fi && \
    npm cache clean --force

# Copy everything from builder (includes index.js, src/, dist/ if built)
COPY --from=builder /app .

# Expose port
EXPOSE 3000

# Start using npm start (which runs 'node index.js')
CMD ["npm", "start"]
