FROM node:20-alpine

# Enable pnpm via corepack
RUN corepack enable

WORKDIR /app

# Install dependencies first (better caching)
COPY package.json pnpm-lock.yaml ./
RUN pnpm install

# Copy source
COPY . .

EXPOSE 3000
CMD ["pnpm", "start:dev"]
