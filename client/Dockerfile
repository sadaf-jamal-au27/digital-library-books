# Frontend (React/Vite) for Digital Library
# Stage 1: build
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
# Build with empty API URL so browser uses same origin; nginx will proxy /api to backend
ENV VITE_API_URL=
RUN npm run build

# Stage 2: serve with nginx
FROM nginx:alpine

# Remove default config and use ours (proxy /api to backend)
RUN rm -rf /usr/share/nginx/html/*
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
