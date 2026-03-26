// src/modules/cftClient.js
require('dotenv').config();
const cftSDK = require('cftools-sdk');
const chalk = require('chalk');

console.log(chalk.blue('=== [CFTCLIENT] Inicjalizacja modułu ==='));
console.log(chalk.blue(`CFTOOLS_API_KEY: ${process.env.CFTOOLS_API_KEY ? '✓ istnieje (' + process.env.CFTOOLS_API_KEY.substring(0, 15) + '...)' : '✗ BRAK'}`));
console.log(chalk.blue(`CFTOOLS_API_SECRET: ${process.env.CFTOOLS_API_SECRET ? '✓ istnieje' : '✗ BRAK (to może być problem)'}`));

const serverConfig = require('../../config/servers');

console.log(chalk.green(`[CFTCLIENT] Załadowano ${serverConfig.length} serwerów`));

// ==================== TWORZENIE KLIENTA ====================
let cftClient;
try {
  cftClient = new cftSDK.CFToolsClientBuilder()
    .withCache()
    .withCredentials(
      process.env.CFTOOLS_API_KEY,           // Application Key
      process.env.CFTOOLS_API_SECRET || ''   // Secret (może być pusty w niektórych przypadkach)
    )
    .build();

  console.log(chalk.green('[CFTCLIENT] Klient CFTools zbudowany pomyślnie'));
} catch (err) {
  console.error(chalk.red('[CFTCLIENT] BŁĄD przy tworzeniu klienta:'), err.message);
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

const getServerConfigCommandOptionValue = (interaction) => {
  const value = interaction.options.getString('server');
  console.log(chalk.magenta(`[CFTCLIENT] Otrzymano wartość: ${value}`));

  const server = serverConfig.find(s => 
    s.CFTOOLS_SERVER_API_ID === value || 
    s.CFTOOLS_CLOUD_ID === value
  );

  if (!server) {
    console.error(chalk.red(`[CFTCLIENT] Nie znaleziono serwera dla: ${value}`));
    throw new Error(`Nie znaleziono serwera: ${value}`);
  }

  console.log(chalk.green(`[CFTCLIENT] Wybrano serwer: ${server.NAME}`));
  return server;
};

module.exports = {
  cftClient,
  requiredServerConfigCommandOption,
  getServerConfigCommandOptionValue
};
