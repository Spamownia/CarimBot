require('dotenv').config();
const cftSDK = require('cftools-sdk');
const chalk = require('chalk');

console.log(chalk.blue('=== [CFTCLIENT] Inicjalizacja ==='));

const serverConfig = require('../../config/servers');

console.log(chalk.green(`[CFTCLIENT] Załadowano ${serverConfig.length} serwerów`));

const cftClient = new cftSDK.CFToolsClientBuilder()
  .withCache()
  .withCredentials(process.env.CFTOOLS_API_KEY, process.env.CFTOOLS_API_SECRET)
  .build();

const requiredServerConfigCommandOption = {
  name: 'server',
  description: 'Wybierz serwer',
  type: 3,
  required: true,
  choices: serverConfig.map(s => ({ name: s.NAME, value: s.CFTOOLS_SERVER_API_ID }))
};

const getServerConfigCommandOptionValue = (interaction) => {
  const value = interaction.options.getString('server');
  const server = serverConfig.find(s => s.CFTOOLS_SERVER_API_ID === value);
  if (!server) throw new Error(`Nie znaleziono serwera: ${value}`);
  return server;
};

module.exports = {
  requiredServerConfigCommandOption,
  getServerConfigCommandOptionValue
};
