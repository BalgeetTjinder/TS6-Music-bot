#!/bin/bash
# Скрипт сборки TS3AudioBot с патчем для TS6

set -e

echo "=== TS3AudioBot for TS6 - Build Script ==="

# Клонируем репозиторий если не существует
if [ ! -d ~/TS3AudioBot ]; then
    echo "[1/4] Cloning TS3AudioBot..."
    cd ~
    git clone https://github.com/Splamy/TS3AudioBot.git
else
    echo "[1/4] TS3AudioBot already exists, updating..."
    cd ~/TS3AudioBot
    git checkout .
    git pull
fi

# Применяем патч
echo "[2/4] Applying TS6 patch..."
cp ~/TS6-Music-bot/ts3audiobot-patch/License.cs.patch ~/TS3AudioBot/TSLib/Full/License.cs

# Компилируем
echo "[3/4] Building..."
cd ~/TS3AudioBot
dotnet build -c Release

# Создаём симлинк для libopus
echo "[4/4] Setting up..."
sudo ln -sf /usr/lib/x86_64-linux-gnu/libopus.so.0 /usr/lib/x86_64-linux-gnu/libopus.so 2>/dev/null || true

echo ""
echo "=== Build complete! ==="
echo ""
echo "To run the bot:"
echo "  cd ~/TS3AudioBot/TS3AudioBot/bin/Release/net*/"
echo "  ./TS3AudioBot"
echo ""
