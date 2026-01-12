/**
 * Обработчик команд для музыкального бота
 */

export class CommandHandler {
  constructor(bot, player, config) {
    this.bot = bot;
    this.player = player;
    this.config = config;
    this.prefix = config.bot.commandPrefix || '!';
    
    this.commands = new Map();
    this.registerCommands();
  }

  /**
   * Регистрация команд
   */
  registerCommands() {
    // !play <url> - воспроизвести трек
    this.commands.set('play', {
      description: 'Воспроизвести трек с YouTube',
      usage: '!play <youtube_url>',
      execute: async (args, invoker) => {
        if (!args[0]) {
          return '❌ Укажите ссылку на YouTube. Пример: !play https://youtube.com/watch?v=...';
        }

        const url = args[0];
        if (!this.isValidYouTubeUrl(url)) {
          return '❌ Неверная ссылка на YouTube';
        }

        try {
          const track = await this.player.addToQueue(url, invoker);
          return `✅ Добавлено в очередь: ${track.title}`;
        } catch (error) {
          return `❌ Ошибка: ${error.message}`;
        }
      }
    });

    // !skip - пропустить текущий трек
    this.commands.set('skip', {
      description: 'Пропустить текущий трек',
      usage: '!skip',
      execute: async () => {
        if (!this.player.isPlaying) {
          return '❌ Сейчас ничего не воспроизводится';
        }
        this.player.skip();
        return '⏭️ Трек пропущен';
      }
    });

    // !stop - остановить воспроизведение
    this.commands.set('stop', {
      description: 'Остановить воспроизведение и очистить очередь',
      usage: '!stop',
      execute: async () => {
        this.player.stop();
        return '⏹️ Воспроизведение остановлено';
      }
    });

    // !pause - пауза
    this.commands.set('pause', {
      description: 'Поставить на паузу',
      usage: '!pause',
      execute: async () => {
        if (!this.player.isPlaying) {
          return '❌ Сейчас ничего не воспроизводится';
        }
        this.player.pause();
        return '⏸️ Пауза';
      }
    });

    // !resume - продолжить
    this.commands.set('resume', {
      description: 'Продолжить воспроизведение',
      usage: '!resume',
      execute: async () => {
        if (!this.player.isPaused) {
          return '❌ Воспроизведение не на паузе';
        }
        this.player.resume();
        return '▶️ Продолжение воспроизведения';
      }
    });

    // !queue - показать очередь
    this.commands.set('queue', {
      description: 'Показать очередь воспроизведения',
      usage: '!queue',
      execute: async () => {
        const queue = this.player.getQueue();
        const current = this.player.getCurrentTrack();

        if (!current && queue.length === 0) {
          return '📭 Очередь пуста';
        }

        let message = '📋 Очередь воспроизведения:\n';
        
        if (current) {
          message += `▶️ Сейчас: ${current.title}\n`;
        }

        if (queue.length > 0) {
          message += '\n📜 Далее:\n';
          queue.slice(0, 10).forEach((track, index) => {
            message += `${index + 1}. ${track.title}\n`;
          });
          
          if (queue.length > 10) {
            message += `... и еще ${queue.length - 10} треков`;
          }
        }

        return message;
      }
    });

    // !nowplaying / !np - текущий трек
    this.commands.set('np', {
      description: 'Показать текущий трек',
      usage: '!np',
      execute: async () => {
        const current = this.player.getCurrentTrack();
        if (!current) {
          return '❌ Сейчас ничего не воспроизводится';
        }
        return `🎵 Сейчас играет: ${current.title} (заказал: ${current.requestedBy})`;
      }
    });
    this.commands.set('nowplaying', this.commands.get('np'));

    // !volume <0-100> - громкость
    this.commands.set('volume', {
      description: 'Установить громкость (0-100)',
      usage: '!volume <0-100>',
      execute: async (args) => {
        if (!args[0]) {
          return `🔊 Текущая громкость: ${this.player.volume}%`;
        }

        const volume = parseInt(args[0]);
        if (isNaN(volume) || volume < 0 || volume > 100) {
          return '❌ Укажите число от 0 до 100';
        }

        this.player.setVolume(volume);
        return `🔊 Громкость: ${volume}%`;
      }
    });

    // !clear - очистить очередь
    this.commands.set('clear', {
      description: 'Очистить очередь',
      usage: '!clear',
      execute: async () => {
        this.player.clearQueue();
        return '🗑️ Очередь очищена';
      }
    });

    // !help - помощь
    this.commands.set('help', {
      description: 'Показать список команд',
      usage: '!help',
      execute: async () => {
        let message = '📚 Команды музыкального бота:\n\n';
        
        const uniqueCommands = new Map();
        for (const [name, cmd] of this.commands) {
          if (!uniqueCommands.has(cmd.usage)) {
            uniqueCommands.set(cmd.usage, { name, ...cmd });
          }
        }
        
        for (const [usage, cmd] of uniqueCommands) {
          message += `${usage} - ${cmd.description}\n`;
        }
        
        return message;
      }
    });
  }

  /**
   * Обработка сообщения
   */
  async handleMessage(message, invokerName, invokerId) {
    // Проверяем, начинается ли сообщение с префикса
    if (!message.startsWith(this.prefix)) {
      return null;
    }

    // Парсим команду и аргументы
    const args = message.slice(this.prefix.length).trim().split(/\s+/);
    const commandName = args.shift().toLowerCase();

    // Ищем команду
    const command = this.commands.get(commandName);
    if (!command) {
      return null; // Игнорируем неизвестные команды
    }

    console.log(`📝 Команда от ${invokerName}: ${message}`);

    try {
      const response = await command.execute(args, invokerName, invokerId);
      return response;
    } catch (error) {
      console.error(`❌ Ошибка выполнения команды ${commandName}:`, error);
      return `❌ Ошибка: ${error.message}`;
    }
  }

  /**
   * Проверка YouTube URL
   */
  isValidYouTubeUrl(url) {
    const patterns = [
      /^(https?:\/\/)?(www\.)?youtube\.com\/watch\?v=[\w-]+/,
      /^(https?:\/\/)?(www\.)?youtu\.be\/[\w-]+/,
      /^(https?:\/\/)?(www\.)?youtube\.com\/shorts\/[\w-]+/,
      /^(https?:\/\/)?(music\.)?youtube\.com\/watch\?v=[\w-]+/
    ];
    
    return patterns.some(pattern => pattern.test(url));
  }
}
