FROM node:20-slim
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
# Baileys precisa persistir a sessão
VOLUME ["/app/auth_info_baileys"]
EXPOSE 3000
ENV NODE_ENV=production
CMD ["node", "index.js"]
