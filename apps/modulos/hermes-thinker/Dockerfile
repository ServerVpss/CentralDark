# Hermes-Thinker — cérebro pensante em container
# Base slim + Chromium via Playwright (browser, prints, navegação)
FROM node:22-bookworm-slim

WORKDIR /app

# deps do Chromium
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates fonts-liberation wget \
 && rm -rf /var/lib/apt/lists/*

COPY package.json ./
RUN npm install --omit=dev \
 && npx playwright install --with-deps chromium \
 && rm -rf /root/.npm

COPY src ./src
COPY prompts ./prompts

ENV NODE_ENV=production
EXPOSE 7801

CMD ["node", "src/index.mjs"]
