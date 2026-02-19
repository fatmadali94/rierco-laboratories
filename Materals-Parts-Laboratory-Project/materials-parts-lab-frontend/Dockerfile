# ============================================
# Dockerfile for Vite Frontend Applications
# Use this for: auth-frontend, materials-frontend, tire-frontend
# ============================================

FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build arguments (passed from docker-compose)
ARG VITE_BASE_URL
ARG VITE_AUTH_URL
ARG VITE_AUTH_PORTAL_URL
ARG VITE_CHAT_URL
ARG VITE_CURRENT_SYSTEM
ARG VITE_TIRE_LAB_URL
ARG VITE_MATERIALS_LAB_URL
ARG VITE_APP_NAME

# Set environment variables for build
ENV VITE_BASE_URL=${VITE_BASE_URL}
ENV VITE_AUTH_URL=${VITE_AUTH_URL}
ENV VITE_AUTH_PORTAL_URL=${VITE_AUTH_PORTAL_URL}
ENV VITE_CHAT_URL=${VITE_CHAT_URL}
ENV VITE_CURRENT_SYSTEM=${VITE_CURRENT_SYSTEM}
ENV VITE_TIRE_LAB_URL=${VITE_TIRE_LAB_URL}
ENV VITE_MATERIALS_LAB_URL=${VITE_MATERIALS_LAB_URL}
ENV VITE_APP_NAME=${VITE_APP_NAME}

# Build the application
RUN npm run build

# ============================================
# Production stage with Nginx
# ============================================
FROM nginx:alpine

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx config (must exist in build context)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]