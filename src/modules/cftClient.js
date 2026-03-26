// src/modules/cftClient.js
require('dotenv').config();
const cftSDK = require('cftools-sdk');
const chalk = require('chalk');

console.log(chalk.blue('=== [CFTCLIENT] Inicjalizacja modułu ==='));
console.log(chalk.blue(`CFTOOLS_API_KEY: ${process.env.CFTOOLS_API_KEY ? '✓ istnieje' : '✗ BRAK'}`));
console.log(chalk.blue(`CFTOOLS_API_SECRET: ${process.env.CFTOOLS_API_SECRET ? '✓ istnieje' : '✗ BRAK'}`));

const serverConfig = require('../../config/servers');

console.log(chalk.green(`[CFTCLIENT] Załadowano ${serverConfig.length} serwerów:`));
serverConfig.forEach((s, i) => {
  console.log(chalk.green(`  ${i+1}. ${s.NAME} | ServerID: ${s.CFTOOLS_SERVER_API_ID}`));
});

// ==================== TWORZENIE KLIENTA CFTools ====================
let cftClient;

try {
  cftClient = new cftSDK.CFToolsClientBuilder()
    .withCache()
    .withCredentials(
      process.env.CFTOOLS_API_KEY,        // Application Key / API Key
      process.env.CFTOOLS_API_SECRET      // Secret
    )
    .build();

  console.log(chalk.green('[CFTCLIENT] Klient CFTools zbudowany pomyślnie'));
} catch (err) {
  console.error(chalk.red('[CFTCLIENT] Błąd podczas tworzenia klienta:'), err.message);
  throw err;
}

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
  console.log(chalk.magenta(`[CFTCLIENT] Otrzymano wartość: ${value}`));

  const server = serverConfig.find(s => 
    s.CFTOOLS_SERVER_API_ID === value
  );

  if (!server) {
    console.error(chalk.red(`[CFTCLIENT] Nie znaleziono serwera dla: ${value}`));
    throw new Error(`Nie znaleziono serwera: ${value}`);
  }

  console.log(chalk.green(`[CFTCLIENT] Wybrano serwer: ${server.NAME}`));
  return server;
};

// ====================== EXPORT ======================
module.exports = {
  cftClient,                          // ← musi być eksportowany
  requiredServerConfigCommandOption,
  getServerConfigCommandOptionValue
};
