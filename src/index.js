/**
 * TeamSpeak 6 Music Bot
 * 
 * Музыкальный бот для TeamSpeak 6 с поддержкой YouTube
 */

import { readFileSync } from 'fs';
import { TS3Query } from './ts3query.js';
import { MusicPlayer } from './musicPlayer.js';
import { CommandHandler } from './commandHandler.js';

// Загружаем конфигурацию
let config;
try {
  const configFile = readFileSync('./config.json', 'utf-8');
  config = JSON.parse(configFile);
} catch (error) {
  console.error('❌ Ошибка загрузки config.json:');
  console.error('   Создайте config.json на основе config.example.json');
  process.exit(1);
}

console.log('🎵 Запуск TeamSpeak 6 Music Bot...\n');

// Создаем Query клиент
const query = new TS3Query({
  host: config.server.host,
  port: config.server.queryPort,
  username: config.credentials.queryUsername,
  password: config.credentials.queryPassword
});

// Создаем плеер
const player = new MusicPlayer();

// ID бота (заполнится после подключения)
let botClientId = null;
let botChannelId = null;

/**
 * Основная функция
 */
async function main() {
  try {
    // Подключаемся к серверу
    await query.connect();
    
    // Получаем информацию о себе
    const whoami = await query.whoami();
    botClientId = whoami.client_id;
    console.log(`🤖 Bot ID: ${botClientId}`);
    
    // Устанавливаем никнейм
    try {
      await query.setNickname(config.bot.nickname || 'MusicBot');
      console.log(`📛 Никнейм: ${config.bot.nickname}`);
    } catch (e) {
      console.log('⚠️ Не удалось изменить никнейм (возможно, уже занят)');
    }
    
    // Ищем канал для бота
    if (config.bot.defaultChannel) {
      try {
        const channels = await query.channelFind(config.bot.defaultChannel);
        if (channels.length > 0) {
          botChannelId = channels[0].cid;
          await query.clientMove(botClientId, botChannelId);
          console.log(`📁 Перемещен в канал: ${config.bot.defaultChannel}`);
        }
      } catch (e) {
        console.log(`⚠️ Канал "${config.bot.defaultChannel}" не найден`);
      }
    }
    
    // Создаем обработчик команд
    const commandHandler = new CommandHandler(query, player, config);
    
    // Подписываемся на уведомления о текстовых сообщениях
    await query.registerNotify('textserver');
    await query.registerNotify('textchannel');
    await query.registerNotify('textprivate');
    console.log('📡 Подписка на уведомления активирована');
    
    // Обработка текстовых сообщений
    query.on('textmessage', async (data) => {
      const message = data.msg;
      const invokerName = data.invokername;
      const invokerId = data.invokerid;
      
      // Игнорируем свои сообщения
      if (invokerId === botClientId) return;
      
      // Обрабатываем команду
      const response = await commandHandler.handleMessage(message, invokerName, invokerId);
      
      if (response) {
        // Отвечаем в тот же канал
        try {
          if (data.targetmode === '1') {
            // Приватное сообщение
            await query.sendPrivateMessage(invokerId, response);
          } else if (data.targetmode === '2') {
            // Канал
            await query.sendChannelMessage(botChannelId || 1, response);
          } else {
            // Сервер
            await query.sendTextMessage(3, 0, response);
          }
        } catch (e) {
          console.error('⚠️ Не удалось отправить ответ:', e.message);
        }
      }
    });
    
    // События плеера
    player.on('trackStart', (track) => {
      const message = `🎵 Сейчас играет: ${track.title}`;
      if (botChannelId) {
        query.sendChannelMessage(botChannelId, message).catch(() => {});
      }
    });
    
    player.on('queueEmpty', () => {
      const message = '📭 Очередь воспроизведения пуста';
      if (botChannelId) {
        query.sendChannelMessage(botChannelId, message).catch(() => {});
      }
    });
    
    console.log('\n✅ Бот готов к работе!');
    console.log('📝 Используйте команды в чате TeamSpeak:');
    console.log(`   ${config.bot.commandPrefix}play <youtube_url> - воспроизвести трек`);
    console.log(`   ${config.bot.commandPrefix}help - список всех команд\n`);
    
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
    process.exit(1);
  }
}

// Обработка сигналов завершения
process.on('SIGINT', async () => {
  console.log('\n👋 Завершение работы...');
  player.stop();
  query.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n👋 Завершение работы...');
  player.stop();
  query.close();
  process.exit(0);
});

// Запуск
main();
