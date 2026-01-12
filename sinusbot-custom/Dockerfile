FROM ubuntu:24.04

LABEL maintainer="TS6 Music Bot"
LABEL description="SinusBot with TeamSpeak 3.6.2 client for TS6 support"

# Отключаем интерактивные запросы
ENV DEBIAN_FRONTEND=noninteractive

# Устанавливаем зависимости
RUN apt-get update && apt-get install -y \
    curl \
    wget \
    x11vnc \
    xvfb \
    libxcursor1 \
    libnss3 \
    libegl1 \
    x11-xkb-utils \
    libasound2t64 \
    libpci3 \
    libxslt1.1 \
    libxkbcommon0 \
    libxss1 \
    libglib2.0-0 \
    python3 \
    libpulse0 \
    libevent-2.1-7t64 \
    liblcms2-2 \
    libatomic1 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    libxtst6 \
    libcups2 \
    libdrm2 \
    libgbm1 \
    ffmpeg \
    locales \
    bzip2 \
    ca-certificates \
    libfontconfig1 \
    libfreetype6 \
    libgl1 \
    libopengl0 \
    libsm6 \
    libxrender1 \
    && rm -rf /var/lib/apt/lists/*

# Настраиваем локаль
RUN locale-gen en_US.UTF-8
ENV LANG=en_US.UTF-8 LC_ALL=en_US.UTF-8

# Создаём пользователя sinusbot
RUN groupadd -g 1000 sinusbot && \
    useradd -u 1000 -g sinusbot -m -s /bin/bash sinusbot

# Создаём директории
RUN mkdir -p /opt/sinusbot /opt/sinusbot/data /opt/sinusbot/scripts \
    /opt/sinusbot/TeamSpeak3-Client-linux_amd64

# Скачиваем SinusBot
WORKDIR /opt/sinusbot
RUN wget -q https://www.sinusbot.com/dl/sinusbot.current.tar.bz2 && \
    tar -xjf sinusbot.current.tar.bz2 && \
    rm sinusbot.current.tar.bz2 && \
    cp config.ini.dist config.ini

# Копируем клиент TeamSpeak 3.6.2 (будет добавлен при сборке)
COPY --chown=sinusbot:sinusbot ts3client/ /opt/sinusbot/TeamSpeak3-Client-linux_amd64/

# Устанавливаем права
RUN chmod 755 /opt/sinusbot/sinusbot && \
    chmod 755 /opt/sinusbot/TeamSpeak3-Client-linux_amd64/ts3client_linux_amd64 && \
    chown -R sinusbot:sinusbot /opt/sinusbot

# Копируем entrypoint скрипт
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Рабочая директория
WORKDIR /opt/sinusbot

# Открываем порт веб-интерфейса
EXPOSE 8087

# Том для данных
VOLUME ["/opt/sinusbot/data", "/opt/sinusbot/scripts"]

# Переключаемся на пользователя sinusbot
USER sinusbot

# Запуск
ENTRYPOINT ["/entrypoint.sh"]
