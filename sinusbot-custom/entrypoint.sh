#!/bin/bash

# Исправляем права на директории
chown -R 1001:1001 /opt/sinusbot/data 2>/dev/null
chown -R 1001:1001 /opt/sinusbot/scripts 2>/dev/null
mkdir -p /opt/sinusbot/data/db
chown -R 1001:1001 /opt/sinusbot/data/db

# Удаляем старый lock-файл если есть
rm -f /tmp/.X99-lock /tmp/.X11-unix/X99 2>/dev/null
mkdir -p /tmp/.X11-unix
chmod 1777 /tmp/.X11-unix

# Запускаем виртуальный дисплей
export DISPLAY=:99
Xvfb :99 -screen 0 1024x768x16 -ac &
sleep 2

# Переключаемся на пользователя sinusbot и запускаем
cd /opt/sinusbot
exec su -s /bin/bash -c './sinusbot' sinusbot
