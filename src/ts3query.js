/**
 * TeamSpeak 3/6 Raw Query Protocol Client
 * 
 * TS6 использует тот же raw Query протокол, что и TS3
 * Порт по умолчанию: 10011
 */

import net from 'net';
import { EventEmitter } from 'events';

export class TS3Query extends EventEmitter {
  constructor(options = {}) {
    super();
    this.host = options.host || '127.0.0.1';
    this.port = options.port || 10011;
    this.username = options.username || 'serveradmin';
    this.password = options.password || '';
    
    this.socket = null;
    this.connected = false;
    this.authenticated = false;
    this.buffer = '';
    this.commandQueue = [];
    this.currentCommand = null;
  }

  /**
   * Подключение к серверу
   */
  connect() {
    return new Promise((resolve, reject) => {
      this.socket = net.createConnection(this.port, this.host);
      
      this.socket.setEncoding('utf8');
      
      this.socket.on('connect', () => {
        console.log(`✅ Подключено к ${this.host}:${this.port}`);
        this.connected = true;
      });

      this.socket.on('data', (data) => {
        this.handleData(data, resolve, reject);
      });

      this.socket.on('error', (error) => {
        console.error('❌ Ошибка сокета:', error.message);
        this.emit('error', error);
        reject(error);
      });

      this.socket.on('close', () => {
        console.log('🔌 Соединение закрыто');
        this.connected = false;
        this.emit('close');
      });
    });
  }

  /**
   * Обработка входящих данных
   */
  handleData(data, connectResolve, connectReject) {
    this.buffer += data;
    
    // Проверяем приветственное сообщение TS3
    if (this.buffer.includes('TS3') && !this.authenticated) {
      // Ждем полного приветствия
      if (this.buffer.includes('Welcome to the TeamSpeak 3')) {
        console.log('📡 Получено приветствие от сервера');
        this.buffer = '';
        this.authenticate().then(() => {
          connectResolve();
        }).catch(connectReject);
        return;
      }
    }

    // Обрабатываем ответы на команды
    this.processResponses();
  }

  /**
   * Обработка ответов на команды
   */
  processResponses() {
    const lines = this.buffer.split('\n\r');
    
    for (let i = 0; i < lines.length - 1; i++) {
      const line = lines[i].trim();
      
      if (line.startsWith('error ')) {
        // Это ответ на команду
        const response = this.parseError(line);
        
        if (this.currentCommand) {
          if (response.id === 0) {
            this.currentCommand.resolve(this.currentCommand.response);
          } else {
            this.currentCommand.reject(new Error(`${response.msg} (error id=${response.id})`));
          }
          this.currentCommand = null;
          this.processNextCommand();
        }
      } else if (line.startsWith('notify')) {
        // Это уведомление от сервера
        this.handleNotification(line);
      } else if (line && this.currentCommand) {
        // Это данные ответа
        this.currentCommand.response = line;
      }
    }

    // Оставляем неполную часть в буфере
    this.buffer = lines[lines.length - 1];
  }

  /**
   * Парсинг ошибки
   */
  parseError(line) {
    const match = line.match(/error id=(\d+) msg=(.+)/);
    if (match) {
      return {
        id: parseInt(match[1]),
        msg: this.unescape(match[2])
      };
    }
    return { id: -1, msg: 'Unknown error' };
  }

  /**
   * Аутентификация
   */
  async authenticate() {
    console.log('🔐 Аутентификация...');
    await this.send(`login ${this.username} ${this.password}`);
    this.authenticated = true;
    console.log('✅ Аутентификация успешна');
    
    // Выбираем первый виртуальный сервер
    await this.send('use sid=1');
    console.log('✅ Подключено к виртуальному серверу');
    
    this.emit('ready');
  }

  /**
   * Отправка команды
   */
  send(command) {
    return new Promise((resolve, reject) => {
      this.commandQueue.push({ command, resolve, reject, response: null });
      this.processNextCommand();
    });
  }

  /**
   * Обработка следующей команды в очереди
   */
  processNextCommand() {
    if (this.currentCommand || this.commandQueue.length === 0) {
      return;
    }

    this.currentCommand = this.commandQueue.shift();
    this.socket.write(this.currentCommand.command + '\n');
  }

  /**
   * Обработка уведомлений
   */
  handleNotification(line) {
    const type = line.split(' ')[0];
    const data = this.parseResponse(line.substring(type.length + 1));
    
    if (type === 'notifytextmessage') {
      this.emit('textmessage', data);
    } else if (type === 'notifycliententerview') {
      this.emit('clientconnect', data);
    } else if (type === 'notifyclientleftview') {
      this.emit('clientdisconnect', data);
    } else {
      this.emit('notification', { type, data });
    }
  }

  /**
   * Парсинг ответа
   */
  parseResponse(response) {
    if (!response) return {};
    
    const result = {};
    const pairs = response.split(' ');
    
    for (const pair of pairs) {
      const [key, value] = pair.split('=');
      if (key) {
        result[key] = value ? this.unescape(value) : '';
      }
    }
    
    return result;
  }

  /**
   * Парсинг списка
   */
  parseList(response) {
    if (!response) return [];
    
    return response.split('|').map(item => this.parseResponse(item));
  }

  /**
   * Экранирование строки
   */
  escape(str) {
    return str
      .replace(/\\/g, '\\\\')
      .replace(/\//g, '\\/')
      .replace(/ /g, '\\s')
      .replace(/\|/g, '\\p')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/\t/g, '\\t');
  }

  /**
   * Снятие экранирования
   */
  unescape(str) {
    return str
      .replace(/\\s/g, ' ')
      .replace(/\\p/g, '|')
      .replace(/\\n/g, '\n')
      .replace(/\\r/g, '\r')
      .replace(/\\t/g, '\t')
      .replace(/\\\//g, '/')
      .replace(/\\\\/g, '\\');
  }

  // ========== API методы ==========

  /**
   * Получить информацию о себе
   */
  async whoami() {
    const response = await this.send('whoami');
    return this.parseResponse(response);
  }

  /**
   * Получить список каналов
   */
  async channelList() {
    const response = await this.send('channellist');
    return this.parseList(response);
  }

  /**
   * Получить список клиентов
   */
  async clientList() {
    const response = await this.send('clientlist');
    return this.parseList(response);
  }

  /**
   * Найти клиента по имени
   */
  async clientFind(pattern) {
    const response = await this.send(`clientfind pattern=${this.escape(pattern)}`);
    return this.parseList(response);
  }

  /**
   * Получить информацию о клиенте
   */
  async clientInfo(clid) {
    const response = await this.send(`clientinfo clid=${clid}`);
    return this.parseResponse(response);
  }

  /**
   * Переместить клиента в канал
   */
  async clientMove(clid, cid) {
    await this.send(`clientmove clid=${clid} cid=${cid}`);
  }

  /**
   * Отправить текстовое сообщение
   */
  async sendTextMessage(targetmode, target, msg) {
    // targetmode: 1 = client, 2 = channel, 3 = server
    await this.send(`sendtextmessage targetmode=${targetmode} target=${target} msg=${this.escape(msg)}`);
  }

  /**
   * Отправить сообщение в канал
   */
  async sendChannelMessage(cid, msg) {
    await this.sendTextMessage(2, cid, msg);
  }

  /**
   * Отправить приватное сообщение
   */
  async sendPrivateMessage(clid, msg) {
    await this.sendTextMessage(1, clid, msg);
  }

  /**
   * Изменить никнейм бота
   */
  async setNickname(nickname) {
    await this.send(`clientupdate client_nickname=${this.escape(nickname)}`);
  }

  /**
   * Подписаться на уведомления
   */
  async registerNotify(event, id = 0) {
    await this.send(`servernotifyregister event=${event} id=${id}`);
  }

  /**
   * Найти канал по имени
   */
  async channelFind(pattern) {
    const response = await this.send(`channelfind pattern=${this.escape(pattern)}`);
    return this.parseList(response);
  }

  /**
   * Отключение
   */
  async quit() {
    await this.send('quit');
    this.socket.end();
  }

  /**
   * Закрыть соединение
   */
  close() {
    if (this.socket) {
      this.socket.destroy();
    }
  }
}
