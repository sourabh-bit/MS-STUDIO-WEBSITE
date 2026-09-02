# Puppeteer needs a real Chrome to run — it bundles Chromium itself, but
# the OS still needs these shared libraries to actually launch it. Render's
# default Node image doesn't guarantee all of them, which is what makes
# Puppeteer flaky there. Building our own image removes that guesswork:
# this exact list is Google/Puppeteer's own documented set for Debian.
FROM node:20-bookworm-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    fonts-liberation \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libc6 \
    libcairo2 \
    libcups2 \
    libdbus-1-3 \
    libexpat1 \
    libfontconfig1 \
    libgbm1 \
    libglib2.0-0 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libstdc++6 \
    libx11-6 \
    libx11-xcb1 \
    libxcb1 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxi6 \
    libxrandr2 \
    libxrender1 \
    libxss1 \
    libxtst6 \
    xdg-utils \
    wget \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Dependencies installed before the rest of the source is copied in, so
# Docker's layer cache skips this (~slow, downloads Chromium) step on
# every rebuild that only changed application code.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

ENV NODE_ENV=production
EXPOSE 4000

CMD ["node", "dist/server.js"]
