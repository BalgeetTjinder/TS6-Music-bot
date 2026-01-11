FROM node:20-alpine

WORKDIR /app

# Копируем package файлы
COPY package*.json ./

# Устанавливаем зависимости
RUN npm ci --only=production

# Копируем остальные файлы
COPY . .

# Используем существующего пользователя node (безопасность)
RUN chown -R node:node /app

USER node

# Запускаем бота
CMD ["node", "index.js"]