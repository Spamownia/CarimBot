// src/modules/cftClient.js
require('dotenv').config();
const cftSDK = require('cftools-sdk');
const chalk = require('chalk');

// ==================== DEBUG INICJALIZACJI ====================
console.log(chalk.blue('=== [CFTCLIENT] Inicjalizacja modułu ==='));
console.log(chalk.blue(`CFTOOLS_API_KEY istnieje: ${!!process.env.CFTOOLS_API_KEY}`));
console.log(chalk.blue(`CFTOOLS_API_SECRET istnieje: ${!!process.env.CFTOOLS_API_SECRET}`));

const serverConfig = require('../../config/servers');

console.log(chalk.green(`[CFTCLIENT] Załadowano ${serverConfig.length} serwerów:`));
serverConfig.forEach((s, i) => {
  console.log(chalk.green(`  ${i+1}. ${s.NAME} | ServerID: ${s.CFTOOLS_SERVER_API_ID || 'BRAK'}`));
});

// Tworzenie klienta CFTools
const cftClient = new cftSDK.CFToolsClientBuilder()
  .withCache()
  .withCredentials(
    process.env.CFTOOLS_API_KEY || process.env.CFTOOLS_API_APPLICATION_ID,
    process.env.CFTOOLS_API_SECRET
  )
  .build();

console.log(chalk.green('[CFTCLIENT] Klient CFTools zbudowany pomyślnie'));

// ====================== OPCJA SERWERA ======================
const requiredServerConfigCommandOption = {
  name: 'server',
  description: 'Wybierz serwer',
  type: 3,
  required: true,
  choices: serverConfig.map(s => ({
    name: s.NAME,
    value: s.CFTOOLS_SERVER_API_ID
  }))
};

// ====================== POBIERANIE SERWERA ======================
const getServerConfigCommandOptionValue = (interaction) => {
  const value = interaction.options.getString('server');
  console.log(chalk.magenta(`[CFTCLIENT] Otrzymano wartość z Discord: ${value}`));

  // Szukamy po Server ID lub Cloud ID (na wszelki wypadek)
  const server = serverConfig.find(s => 
    s.CFTOOLS_SERVER_API_ID === value || 
    (s.CFTOOLS_CLOUD_ID && s.CFTOOLS_CLOUD_ID === value)
  );

  if (!server) {
    console.error(chalk.red(`[CFTCLIENT] Nie znaleziono serwera dla wartości: ${value}`));
    throw new Error(`Nie znaleziono serwera: ${value}`);
  }

  console.log(chalk.green(`[CFTCLIENT] Wybrano serwer: ${server.NAME}`));
  return server;
};

// ====================== EXPORT ======================
module.exports = {
  cftClient,                          // ← WAŻNE: eksportujemy klienta!
  requiredServerConfigCommandOption,
  getServerConfigCommandOptionValue
};
