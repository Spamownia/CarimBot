// src/modules/cftClient.js
require('dotenv').config();
const cftSDK = require('cftools-sdk');
const chalk = require('chalk');

console.log(chalk.blue('=== [CFTCLIENT] Inicjalizacja modułu ==='));

const APP_ID = process.env.CFTOOLS_APP_ID || process.env.CFTOOLS_API_APPLICATION_ID || process.env.CFTOOLS_API_KEY;
const SECRET = process.env.CFTOOLS_SECRET || process.env.CFTOOLS_API_SECRET;

console.log(chalk.blue(`APP_ID istnieje: ${!!APP_ID}`));
console.log(chalk.blue(`SECRET istnieje: ${!!SECRET}`));

if (!APP_ID || !SECRET) {
  console.error(chalk.red('[CFTCLIENT] BRAK KLUCZY uwierzytelniających! Dodaj CFTOOLS_APP_ID i CFTOOLS_SECRET w Environment Variables.'));
}

const serverConfig = require('../../config/servers');

console.log(chalk.green(`[CFTCLIENT] Załadowano ${serverConfig.length} serwerów`));
serverConfig.forEach((s, i) => {
  console.log(chalk.green(`  ${i+1}. ${s.NAME} → ${s.CFTOOLS_SERVER_API_ID}`));
});

// Poprawna inicjalizacja dla CFTools Cloud (Game Plugins)
const cftClient = new cftSDK.CFToolsClientBuilder()
  .withCache()
  .withCredentials(APP_ID, SECRET)     // <--- najważniejsze
  .build();

console.log(chalk.green('[CFTCLIENT] Klient CFTools zbudowany pomyślnie'));

const requiredServerConfigCommandOption = {
  name: 'server',
  description: 'Wybierz serwer',
  type: 3,
  required: true,
  choices: serverConfig.map(s => ({ name: s.NAME, value: s.CFTOOLS_SERVER_API_ID }))
};

const getServerConfigCommandOptionValue = (interaction) => {
  const value = interaction.options.getString('server');
  const serverCfg = serverConfig.find(s => s.CFTOOLS_SERVER_API_ID === value);

  if (!serverCfg) throw new Error(`Nie znaleziono serwera: ${value}`);

  console.log(chalk.green(`[CFTCLIENT] Wybrano serwer: ${serverCfg.NAME}`));
  return serverCfg;
};

module.exports = {
  cftClient,
  requiredServerConfigCommandOption,
  getServerConfigCommandOptionValue
};
