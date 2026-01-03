# Development stage - Use Debian instead of Alpine
FROM node:18 AS development
WORKDIR /app

COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# Build stage - Use Debian-based image
FROM node:18 AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production --ignore-scripts
RUN npm install
COPY . .
RUN npm run build

# Production stage - Keep Alpine for nginx
FROM nginx:alpine AS production
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]