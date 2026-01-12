#!/bin/bash

# Запускаем виртуальный дисплей
export DISPLAY=:99
Xvfb :99 -screen 0 1024x768x16 &
sleep 2

# Запускаем SinusBot
cd /opt/sinusbot
exec ./sinusbot
