// src/modules/cftClient.js
require('dotenv').config();
const cftSDK = require('cftools-sdk');
const chalk = require('chalk');

console.log(chalk.blue('=== [CFTCLIENT] Inicjalizacja modułu ==='));
console.log(chalk.blue(`CFTOOLS_API_KEY: ${process.env.CFTOOLS_API_KEY ? '✓ istnieje' : '✗ BRAK'}`));

const serverConfig = require('../../config/servers');

console.log(chalk.green(`[CFTCLIENT] Załadowano ${serverConfig.length} serwerów`));

// ==================== TWORZENIE KLIENTA - WERSJA DLA GAME PLUGINS ====================
let cftClient;

try {
  // Metoda dla kluczy Game Plugins / RCON (najczęściej działa z tym typem klucza)
  cftClient = new cftSDK.CFToolsClientBuilder()
    .withCache()
    .withCredentials(process.env.CFTOOLS_API_KEY)   // tylko jeden parametr
    .build();

  console.log(chalk.green('[CFTCLIENT] Klient CFTools zbudowany (tryb Game Plugins)'));
} catch (err) {
  console.error(chalk.red('[CFTCLIENT] Błąd tworzenia klienta:'), err.message);
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
