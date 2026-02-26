# Backend (Node/Express) for Digital Library
FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Application code
COPY . .

# Create upload dirs (books, covers, avatars)
RUN mkdir -p uploads/books uploads/covers uploads/avatars

# Auto-seed on first run (only when .seeded does not exist in volume)
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 3001

ENTRYPOINT ["/docker-entrypoint.sh"]
