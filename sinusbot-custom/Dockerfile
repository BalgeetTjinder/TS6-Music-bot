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
    libavcodec-extra \
    libavfilter-extra \
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

# Создаём пользователя sinusbot (используем существующую группу если GID 1000 занят)
RUN groupadd -g 1001 sinusbot || true && \
    useradd -u 1001 -g 1001 -m -s /bin/bash sinusbot || \
    useradd -u 1001 -m -s /bin/bash sinusbot

# Создаём директории
RUN mkdir -p /opt/sinusbot /opt/sinusbot/data /opt/sinusbot/scripts \
    /opt/sinusbot/TeamSpeak3-Client-linux_amd64

# Копируем SinusBot (из локальных файлов)
WORKDIR /opt/sinusbot
COPY sinusbot-files/sinusbot /opt/sinusbot/sinusbot
COPY sinusbot-files/config.ini.dist /opt/sinusbot/config.ini
COPY sinusbot-files/scripts /opt/sinusbot/scripts
COPY sinusbot-files/plugin /opt/sinusbot/plugin

# Копируем клиент TeamSpeak 3.6.2 (будет добавлен при сборке)
COPY ts3client/ /opt/sinusbot/TeamSpeak3-Client-linux_amd64/

# Создаём симлинки для FFmpeg (SinusBot требует FFmpeg 4.x)
RUN ln -sf /usr/lib/x86_64-linux-gnu/libavfilter.so.9 /usr/lib/x86_64-linux-gnu/libavfilter.so.8 || true && \
    ln -sf /usr/lib/x86_64-linux-gnu/libavformat.so.60 /usr/lib/x86_64-linux-gnu/libavformat.so.59 || true && \
    ln -sf /usr/lib/x86_64-linux-gnu/libavcodec.so.60 /usr/lib/x86_64-linux-gnu/libavcodec.so.59 || true && \
    ln -sf /usr/lib/x86_64-linux-gnu/libavutil.so.58 /usr/lib/x86_64-linux-gnu/libavutil.so.57 || true && \
    ln -sf /usr/lib/x86_64-linux-gnu/libswresample.so.4 /usr/lib/x86_64-linux-gnu/libswresample.so.3 || true && \
    ln -sf /usr/lib/x86_64-linux-gnu/libswscale.so.7 /usr/lib/x86_64-linux-gnu/libswscale.so.6 || true

# Устанавливаем права
RUN chmod 755 /opt/sinusbot/sinusbot && \
    chmod 755 /opt/sinusbot/TeamSpeak3-Client-linux_amd64/ts3client_linux_amd64 && \
    chown -R 1001:1001 /opt/sinusbot

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
USER 1001

# Запуск
ENTRYPOINT ["/entrypoint.sh"]
