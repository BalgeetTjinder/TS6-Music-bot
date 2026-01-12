#!/bin/bash

# Удаляем старый lock-файл если есть
rm -f /tmp/.X99-lock /tmp/.X11-unix/X99 2>/dev/null

# Запускаем виртуальный дисплей
export DISPLAY=:99
Xvfb :99 -screen 0 1024x768x16 -ac &
sleep 2

# Запускаем SinusBot
cd /opt/sinusbot
exec ./sinusbot
