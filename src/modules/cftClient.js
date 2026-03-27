// src/modules/cftClient.js
require('dotenv').config();
const cftSDK = require('cftools-sdk');
const chalk = require('chalk');

console.log(chalk.blue('=== [CFTCLIENT] Inicjalizacja modułu ==='));

const APP_ID = process.env.CFTOOLS_APP_ID;
const SECRET = process.env.CFTOOLS_SECRET;

console.log(chalk.blue(`CFTOOLS_APP_ID: ${!!APP_ID ? '✓ istnieje' : '✗ brak'}`));
console.log(chalk.blue(`CFTOOLS_SECRET: ${!!SECRET ? '✓ istnieje' : '✗ brak'}`));

const serverConfig = require('../../config/servers');

console.log(chalk.green(`[CFTCLIENT] Załadowano ${serverConfig.length} serwerów:`));
serverConfig.forEach((s, i) => {
  console.log(chalk.green(`  ${i+1}. ${s.NAME} → ${s.CFTOOLS_SERVER_API_ID}`));
});

// === NAJWAŻNIEJSZA ZMIANA – używamy starszej, ale stabilnej metody inicjalizacji ===
const cftClient = new cftSDK.CFToolsClient(APP_ID, SECRET);

console.log(chalk.green('[CFTCLIENT] Klient CFTools utworzony (bez Builder) – metoda bezpośrednia'));

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
    console.error(chalk.red(`[CFTCLIENT] NIE ZNALEZIONO serwera dla ID: ${value}`));
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
