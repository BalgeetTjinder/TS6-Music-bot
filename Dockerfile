FROM mcr.microsoft.com/dotnet/runtime:8.0

LABEL maintainer="TS6 Music Bot"
LABEL description="TS3AudioBot for TeamSpeak 6"

# Отключаем глобализацию .NET (решает проблему с ICU)
ENV DOTNET_SYSTEM_GLOBALIZATION_INVARIANT=1

# Устанавливаем зависимости
RUN apt-get update && apt-get install -y \
    ffmpeg \
    opus-tools \
    libopus0 \
    wget \
    python3 \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Устанавливаем libssl 1.1 (требуется для TS3AudioBot)
RUN wget http://archive.ubuntu.com/ubuntu/pool/main/o/openssl/libssl1.1_1.1.1f-1ubuntu2_amd64.deb \
    && dpkg -i libssl1.1_1.1.1f-1ubuntu2_amd64.deb \
    && rm libssl1.1_1.1.1f-1ubuntu2_amd64.deb

# Устанавливаем yt-dlp
RUN wget -O /usr/local/bin/yt-dlp https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp \
    && chmod +x /usr/local/bin/yt-dlp

# Создаём пользователя
RUN useradd -m -s /bin/bash ts3bot

# Создаём директорию
WORKDIR /opt/ts3audiobot

# Скачиваем TS3AudioBot
RUN wget https://github.com/Splamy/TS3AudioBot/releases/latest/download/TS3AudioBot_linux_x64.tar.gz \
    && tar -xzf TS3AudioBot_linux_x64.tar.gz \
    && rm TS3AudioBot_linux_x64.tar.gz \
    && chown -R ts3bot:ts3bot /opt/ts3audiobot

# Переключаемся на пользователя
USER ts3bot

# Порт веб-интерфейса
EXPOSE 58913

# Том для данных
VOLUME ["/opt/ts3audiobot/data"]

# Запуск
CMD ["./TS3AudioBot"]
