// src/modules/cftClient.js
require('dotenv').config();
const cftSDK = require('cftools-sdk');
const chalk = require('chalk');

console.log(chalk.blue('=== [CFTCLIENT] Inicjalizacja modułu ==='));
console.log(chalk.blue(`CFTOOLS_API_KEY istnieje: ${!!process.env.CFTOOLS_API_KEY}`));

const serverConfig = require('../../config/servers');

console.log(chalk.green(`[CFTCLIENT] Załadowano ${serverConfig.length} serwerów`));

// ==================== TWORZENIE KLIENTA - alternatywny sposób ====================
let cftClient;

try {
  // Sposób 1: Standardowy (Application Key + Secret)
  cftClient = new cftSDK.CFToolsClientBuilder()
    .withCache()
    .withCredentials(
      process.env.CFTOOLS_API_KEY,
      process.env.CFTOOLS_API_SECRET || ''
    )
    .build();

  console.log(chalk.green('[CFTCLIENT] Klient CFTools zbudowany pomyślnie (metoda 1)'));
} catch (err) {
  console.error(chalk.red('[CFTCLIENT] Błąd metody 1:'), err.message);

  try {
    // Sposób 2: Tylko z API Key (dla niektórych kluczy Game Plugins)
    cftClient = new cftSDK.CFToolsClientBuilder()
      .withCache()
      .withCredentials(process.env.CFTOOLS_API_KEY)
      .build();

    console.log(chalk.green('[CFTCLIENT] Klient CFTools zbudowany pomyślnie (metoda 2 - tylko API Key)'));
  } catch (err2) {
    console.error(chalk.red('[CFTCLIENT] Błąd metody 2:'), err2.message);
    throw new Error('Nie udało się utworzyć klienta CFTools - sprawdź API Key');
  }
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
