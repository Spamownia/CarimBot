// src/index.js
require('dotenv').config();

const { Client, GatewayIntentBits, Collection } = require('discord.js');
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

client.commands = new Collection();

client.once('ready', () => {
  console.log(chalk.green(`[READY] Bot online jako ${client.user.tag}`));
});

// Ładowanie komend
const loadCommands = () => {
  console.log(chalk.blue('[LOADER] Rozpoczynam ładowanie komend...'));
  let count = 0;

  const commandsPath = path.join(__dirname, 'commands');
  if (!fs.existsSync(commandsPath)) {
    console.error(chalk.red('[LOADER] Folder "commands" nie istnieje!'));
    return;
  }

  const categories = fs.readdirSync(commandsPath);

  categories.forEach(category => {
    const categoryPath = path.join(commandsPath, category);
    if (!fs.lstatSync(categoryPath).isDirectory()) return;

    const files = fs.readdirSync(categoryPath).filter(f => f.endsWith('.js'));

    files.forEach(file => {
      const filePath = path.join(categoryPath, file);
      try {
        const command = require(filePath);

        if (typeof command.load === 'function') {
          command.load(filePath, client.commands);
          count++;
        } else {
          console.log(chalk.yellow(`[LOAD] Pominięto (brak .load): ${category}/${file}`));
        }
      } catch (err) {
        console.error(chalk.red(`[LOAD ERROR] Błąd w pliku ${category}/${file}`), err.message);
      }
    });
  });

  console.log(chalk.green(`[LOADER] Załadowano łącznie ${count} komend`));
};

loadCommands();

client.on('interactionCreate', require('./handlers/commands'));

client.login(process.env.DISCORD_TOKEN)
  .then(() => console.log(chalk.green('[LOGIN] Token zaakceptowany')))
  .catch(err => console.error(chalk.red('[LOGIN ERROR]'), err));
