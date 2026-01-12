# SinusBot для TeamSpeak 6 (кастомный образ)

Кастомный Docker-образ SinusBot на базе Ubuntu 24.04 с клиентом TeamSpeak 3.6.2 для поддержки TS6.

## Сборка и запуск

### 1. Подготовьте клиент TeamSpeak 3.6.2

```bash
# Скопируйте файлы клиента в папку ts3client
mkdir -p ts3client
cp ~/TS6-Music-bot/sinusbot/ts3client_linux_amd64 ts3client/
cp ~/TS6-Music-bot/sinusbot/*.so* ts3client/
cp ~/TS6-Music-bot/sinusbot/qt.conf ts3client/
cp ~/TS6-Music-bot/sinusbot/openglblacklist.json ts3client/
cp ~/TS6-Music-bot/sinusbot/QtWebEngineProcess ts3client/
cp -r ~/TS6-Music-bot/sinusbot/platforms ts3client/
cp -r ~/TS6-Music-bot/sinusbot/soundbackends ts3client/
cp -r ~/TS6-Music-bot/sinusbot/iconengines ts3client/
cp -r ~/TS6-Music-bot/sinusbot/imageformats ts3client/
cp -r ~/TS6-Music-bot/sinusbot/sqldrivers ts3client/
cp -r ~/TS6-Music-bot/sinusbot/xcbglintegrations ts3client/
```

### 2. Соберите образ

```bash
sudo docker-compose build
```

### 3. Запустите

```bash
sudo docker-compose up -d
```

### 4. Проверьте логи

```bash
sudo docker logs -f sinusbot-ts6
```

### 5. Откройте веб-интерфейс

http://ВАШ_IP:8087

Логин и пароль будут в логах при первом запуске.
