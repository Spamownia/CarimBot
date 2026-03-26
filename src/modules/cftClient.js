// src/modules/cftClient.js
require('dotenv').config();
const cftSDK = require('cftools-sdk');
const chalk = require('chalk');

console.log(chalk.blue('=== [CFTCLIENT] Inicjalizacja ==='));

const serverConfig = require('../../config/servers');

console.log(chalk.green(`[CFTCLIENT] Załadowano ${serverConfig.length} serwerów`));

const requiredServerConfigCommandOption = {
  name: 'server',
  description: 'Wybierz serwer',
  type: 3,
  required: true,
  choices: serverConfig.map(s => ({ name: s.NAME, value: s.CFTOOLS_SERVER_API_ID }))
};

const getServerConfigCommandOptionValue = (interaction) => {
  let value = interaction.options.getString('server');

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
  requiredServerConfigCommandOption,
  getServerConfigCommandOptionValue
};
