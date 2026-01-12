FROM node:20-alpine

# Устанавливаем необходимые пакеты
RUN apk add --no-cache \
    ffmpeg \
    python3 \
    py3-pip \
    && pip3 install --break-system-packages yt-dlp

WORKDIR /app

# Копируем package файлы
COPY package*.json ./

# Устанавливаем зависимости
RUN npm ci --only=production 2>/dev/null || npm install --only=production

# Копируем исходный код
COPY src/ ./src/

# Создаем директорию для кэша
RUN mkdir -p ./cache

# Используем существующего пользователя node
RUN chown -R node:node /app

USER node

# Запускаем бота
CMD ["node", "src/index.js"]
