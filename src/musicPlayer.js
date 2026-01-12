/**
 * Music Player для TeamSpeak 6
 * 
 * Управляет очередью воспроизведения и загрузкой с YouTube
 */

import { spawn, exec } from 'child_process';
import { promisify } from 'util';
import { EventEmitter } from 'events';
import path from 'path';
import fs from 'fs';

const execAsync = promisify(exec);

export class MusicPlayer extends EventEmitter {
  constructor() {
    super();
    this.queue = [];
    this.currentTrack = null;
    this.isPlaying = false;
    this.isPaused = false;
    this.volume = 50;
    this.ffmpegProcess = null;
    this.cacheDir = './cache';
    
    // Создаем директорию для кэша
    if (!fs.existsSync(this.cacheDir)) {
      fs.mkdirSync(this.cacheDir, { recursive: true });
    }
  }

  /**
   * Добавить трек в очередь
   */
  async addToQueue(url, requestedBy) {
    try {
      const trackInfo = await this.getTrackInfo(url);
      
      const track = {
        url,
        title: trackInfo.title || 'Unknown',
        duration: trackInfo.duration || 0,
        requestedBy,
        filePath: null
      };

      this.queue.push(track);
      this.emit('trackAdded', track);
      
      console.log(`🎵 Добавлено в очередь: ${track.title}`);
      
      // Если ничего не играет, начинаем воспроизведение
      if (!this.isPlaying) {
        this.playNext();
      }
      
      return track;
    } catch (error) {
      console.error('❌ Ошибка добавления трека:', error.message);
      throw error;
    }
  }

  /**
   * Получить информацию о треке с YouTube
   */
  async getTrackInfo(url) {
    try {
      const { stdout } = await execAsync(
        `yt-dlp --no-download --print "%(title)s|||%(duration)s" "${url}"`,
        { timeout: 30000 }
      );
      
      const [title, duration] = stdout.trim().split('|||');
      
      return {
        title: title || 'Unknown',
        duration: parseInt(duration) || 0
      };
    } catch (error) {
      console.error('⚠️ Не удалось получить информацию о треке:', error.message);
      return { title: 'Unknown Track', duration: 0 };
    }
  }

  /**
   * Скачать трек с YouTube
   */
  async downloadTrack(url) {
    const fileName = `track_${Date.now()}.opus`;
    const filePath = path.join(this.cacheDir, fileName);
    
    console.log('📥 Загрузка трека...');
    
    try {
      await execAsync(
        `yt-dlp -x --audio-format opus --audio-quality 0 -o "${filePath}" "${url}"`,
        { timeout: 300000 }
      );
      
      console.log('✅ Трек загружен');
      return filePath;
    } catch (error) {
      console.error('❌ Ошибка загрузки:', error.message);
      throw error;
    }
  }

  /**
   * Воспроизвести следующий трек
   */
  async playNext() {
    if (this.queue.length === 0) {
      this.isPlaying = false;
      this.currentTrack = null;
      this.emit('queueEmpty');
      console.log('📭 Очередь пуста');
      return;
    }

    this.currentTrack = this.queue.shift();
    this.isPlaying = true;
    this.isPaused = false;

    try {
      console.log(`▶️ Воспроизведение: ${this.currentTrack.title}`);
      this.emit('trackStart', this.currentTrack);
      
      // Скачиваем трек
      this.currentTrack.filePath = await this.downloadTrack(this.currentTrack.url);
      
      // Воспроизводим через FFmpeg
      await this.playFile(this.currentTrack.filePath);
      
    } catch (error) {
      console.error('❌ Ошибка воспроизведения:', error.message);
      this.emit('trackError', this.currentTrack, error);
      // Переходим к следующему треку
      this.playNext();
    }
  }

  /**
   * Воспроизвести файл через FFmpeg
   * Примечание: Для реальной передачи звука в TS нужен виртуальный аудиоустройство
   */
  async playFile(filePath) {
    return new Promise((resolve, reject) => {
      // FFmpeg команда для воспроизведения
      // В реальном сценарии нужно настроить вывод на виртуальное аудиоустройство
      this.ffmpegProcess = spawn('ffplay', [
        '-nodisp',           // Без окна
        '-autoexit',         // Выход по окончании
        '-volume', String(this.volume),
        filePath
      ]);

      this.ffmpegProcess.on('error', (error) => {
        console.error('❌ FFmpeg ошибка:', error.message);
        reject(error);
      });

      this.ffmpegProcess.on('close', (code) => {
        console.log(`⏹️ Воспроизведение завершено (код: ${code})`);
        
        // Удаляем временный файл
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
        
        this.emit('trackEnd', this.currentTrack);
        resolve();
        
        // Воспроизводим следующий трек
        this.playNext();
      });
    });
  }

  /**
   * Пропустить текущий трек
   */
  skip() {
    if (this.ffmpegProcess) {
      this.ffmpegProcess.kill('SIGTERM');
    }
    console.log('⏭️ Трек пропущен');
  }

  /**
   * Остановить воспроизведение
   */
  stop() {
    this.queue = [];
    if (this.ffmpegProcess) {
      this.ffmpegProcess.kill('SIGTERM');
    }
    this.isPlaying = false;
    this.currentTrack = null;
    console.log('⏹️ Воспроизведение остановлено');
  }

  /**
   * Пауза
   */
  pause() {
    if (this.ffmpegProcess && !this.isPaused) {
      this.ffmpegProcess.kill('SIGSTOP');
      this.isPaused = true;
      console.log('⏸️ Пауза');
    }
  }

  /**
   * Продолжить
   */
  resume() {
    if (this.ffmpegProcess && this.isPaused) {
      this.ffmpegProcess.kill('SIGCONT');
      this.isPaused = false;
      console.log('▶️ Продолжение');
    }
  }

  /**
   * Установить громкость
   */
  setVolume(vol) {
    this.volume = Math.max(0, Math.min(100, vol));
    console.log(`🔊 Громкость: ${this.volume}%`);
  }

  /**
   * Получить очередь
   */
  getQueue() {
    return this.queue;
  }

  /**
   * Получить текущий трек
   */
  getCurrentTrack() {
    return this.currentTrack;
  }

  /**
   * Очистить очередь
   */
  clearQueue() {
    this.queue = [];
    console.log('🗑️ Очередь очищена');
  }

  /**
   * Форматирование времени
   */
  formatDuration(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
}
