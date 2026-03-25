require('dotenv').config();
const client = require('./client');
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');

client.once('ready', () => {
  console.log(chalk.green(`[READY] Bot online jako ${client.user.tag}`));
});

const loadCommands = () => {
  const commandPath = path.join(__dirname, 'commands', 'admin');
  if (!fs.existsSync(commandPath)) return console.log(chalk.red('[LOADER] Brak folderu admin'));

  const file = 'admin-player-list.js';
  const cmd = require(path.join(commandPath, file));
  if (cmd.load) {
    cmd.load(null, client.commands);
    console.log(chalk.green('[LOADER] Załadowano 1 komendę'));
  }
};

loadCommands();

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  const cmd = client.commands.get(interaction.commandName);
  if (cmd) await cmd.execute(interaction);
});

const PORT = process.env.PORT || 10000;
require('http').createServer((req, res) => res.end('OK')).listen(PORT);

client.login(process.env.DISCORD_TOKEN);
