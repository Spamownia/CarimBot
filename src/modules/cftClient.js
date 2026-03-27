// src/modules/cftClient.js
require('dotenv').config();
const cftSDK = require('cftools-sdk');
const chalk = require('chalk');

console.log(chalk.blue('=== [CFTCLIENT] Inicjalizacja modułu ==='));

// Najważniejsze: używamy poprawnych nazw zmiennych dla CFTools Cloud
const credentials = {
  appId: process.env.CFTOOLS_APP_ID || process.env.CFTOOLS_API_KEY,
  secret: process.env.CFTOOLS_SECRET || process.env.CFTOOLS_API_SECRET
};

console.log(chalk.blue(`APP_ID / KEY: ${!!credentials.appId ? '✓ istnieje' : '✗ brak'}`));
console.log(chalk.blue(`SECRET: ${!!credentials.secret ? '✓ istnieje' : '✗ brak'}`));

if (!credentials.appId || !credentials.secret) {
  console.error(chalk.red('[CFTCLIENT] BRAK poprawnych kluczy do CFTools!'));
}

const serverConfig = require('../../config/servers');

console.log(chalk.green(`[CFTCLIENT] Załadowano ${serverConfig.length} serwerów:`));
serverConfig.forEach((s, i) => {
  console.log(chalk.green(`  ${i+1}. ${s.NAME} → ${s.CFTOOLS_SERVER_API_ID}`));
});

// Poprawna inicjalizacja dla aktualnej wersji cftools-sdk
const cftClient = new cftSDK.CFToolsClient(credentials.appId, credentials.secret);

console.log(chalk.green('[CFTCLIENT] Klient CFTools utworzony pomyślnie (używamy CFToolsClient bezpośrednio)'));

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
  console.log(chalk.magenta(`[CFTCLIENT] Wybrano serwer ID: ${value}`));

  const serverCfg = serverConfig.find(s => s.CFTOOLS_SERVER_API_ID === value);

  if (!serverCfg) {
    console.error(chalk.red(`[CFTCLIENT] NIE ZNALEZIONO serwera: ${value}`));
    throw new Error(`Nie znaleziono serwera: ${value}`);
  }

  console.log(chalk.green(`[CFTCLIENT] Użyto serwera: ${serverCfg.NAME}`));
  return serverCfg;
};

module.exports = {
  cftClient,
  requiredServerConfigCommandOption,
  getServerConfigCommandOptionValue
};
