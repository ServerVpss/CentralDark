# Build from the repository root (EasyPanel build path: /).
# Keep the same working directory and runtime entrypoint proven in the local deploy.
FROM node:22-bookworm-slim
WORKDIR /app
COPY . .
WORKDIR /app/CentralDark-Core/apps/modulos/mcp
RUN npm install --omit=dev
EXPOSE 9100
CMD ["node", "dist/index.js"]
