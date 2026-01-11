/**
 * Минимальный прототип для проверки подключения к TeamSpeak 6 серверу
 * 
 * ВАЖНО: Этот файл тестирует подключение через Server Query API (SSH)
 * Для музыкального бота может потребоваться другой подход (виртуальный клиент)
 */

import { readFileSync } from 'fs';
import { Query } from 'teamspeak.js';

// Загружаем конфигурацию
let config;
try {
  const configFile = readFileSync('./config.json', 'utf-8');
  config = JSON.parse(configFile);
} catch (error) {
  console.error('❌ Ошибка загрузки config.json:');
  console.error('   Создайте config.json на основе config.example.json');
  console.error('   И заполните необходимые данные');
  process.exit(1);
}

console.log('🚀 Запуск прототипа подключения к TeamSpeak 6...\n');

// Создаем Query подключение
const query = new Query({
  host: config.server.host,
  port: config.server.queryPort || 10022, // SSH Query обычно на 10022 для TS6
  protocol: 'ssh',
  ssh: {
    username: config.credentials.queryUsername,
    password: config.credentials.queryPassword,
  },
});

// Обработка подключения
query.on('ready', async () => {
  console.log('✅ Успешно подключено к серверу через Server Query API!');
  
  try {
    // Пытаемся получить список виртуальных серверов
    const servers = await query.virtualServers.list();
    console.log(`📊 Найдено виртуальных серверов: ${servers.length}`);
    
    if (servers.length > 0) {
      console.log('\n📋 Список серверов:');
      servers.forEach((server, index) => {
        console.log(`   ${index + 1}. ID: ${server.id}, Порт: ${server.port}, Пользователей: ${server.clientsOnline}`);
      });
      
      // Пытаемся подключиться к первому серверу
      if (servers[0]) {
        await query.virtualServers.use(servers[0].id);
        console.log(`\n✅ Подключено к виртуальному серверу ID: ${servers[0].id}`);
        
        // Пытаемся получить список каналов
        try {
          const channels = await query.channels.list();
          console.log(`📁 Найдено каналов: ${channels.length}`);
        } catch (error) {
          console.log('⚠️  Не удалось получить список каналов (это нормально для Query API)');
        }
      }
    }
    
    console.log('\n✅ Базовое подключение работает!');
    console.log('⚠️  ВАЖНО: Server Query API подходит для административных задач.');
    console.log('⚠️  Для музыкального бота может потребоваться виртуальный клиент (другой подход).');
    console.log('\n📝 Следующие шаги:');
    console.log('   1. Проверить, поддерживает ли teamspeak.js Client API');
    console.log('   2. Если нет - искать альтернативные библиотеки');
    console.log('   3. Или рассмотреть другие подходы\n');
    
  } catch (error) {
    console.error('❌ Ошибка при работе с сервером:', error.message);
  }
  
  // Закрываем соединение через 5 секунд
  setTimeout(() => {
    query.close();
    console.log('\n👋 Соединение закрыто. Прототип завершен.');
    process.exit(0);
  }, 5000);
});

// Обработка ошибок
query.on('error', (error) => {
  console.error('❌ Ошибка подключения:', error.message);
  console.error('\n💡 Возможные причины:');
  console.error('   - Неправильный IP адрес или порт');
  console.error('   - Неправильные учетные данные');
  console.error('   - Сервер не поддерживает SSH Query API');
  console.error('   - Firewall блокирует соединение');
  process.exit(1);
});

// Пытаемся подключиться
console.log(`🔌 Попытка подключения к ${config.server.host}:${config.server.queryPort || 10011}...`);
query.connect().catch((error) => {
  console.error('❌ Критическая ошибка подключения:', error.message);
  process.exit(1);
});