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

// ====================== AUTOMATYCZNE ŁADOWANIE KOMEND ======================
const loadCommands = () => {
  console.log(chalk.blue('[LOADER] Rozpoczynam ładowanie komend...'));
  let count = 0;

  const commandsPath = path.join(__dirname, 'commands');
  if (!fs.existsSync(commandsPath)) {
    console.error(chalk.red('[LOADER] Folder commands nie istnieje!'));
    return;
  }

  const categories = fs.readdirSync(commandsPath);

  categories.forEach(category => {
    const categoryPath = path.join(commandsPath, category);
    if (!fs.lstatSync(categoryPath).isDirectory()) return;

    const commandFiles = fs.readdirSync(categoryPath).filter(file => file.endsWith('.js'));

    commandFiles.forEach(file => {
      const filePath = path.join(categoryPath, file);
      try {
        const command = require(filePath);

        if (command.execute && command.load) {
          command.load(filePath, client.commands);
          console.log(chalk.green(`[LOAD] Załadowano: ${category}/${file}`));
          count++;
        } else {
          console.log(chalk.yellow(`[LOAD] Pominięto (brak execute/load): ${category}/${file}`));
        }
      } catch (err) {
        console.error(chalk.red(`[LOAD ERROR] Błąd przy ładowaniu ${category}/${file}`), err.message);
      }
    });
  });

  console.log(chalk.green(`[LOADER] Załadowano łącznie ${count} komend`));
};

loadCommands();

// ====================== OBSŁUGA INTERAKCJI ======================
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) {
    console.log(chalk.yellow(`[HANDLER] Nieznana komenda: ${interaction.commandName}`));
    return;
  }

  try {
    console.log(chalk.magenta(`[COMMAND] /${interaction.commandName} wywołana przez ${interaction.user.tag}`));
    await command.execute(interaction);
  } catch (error) {
    console.error(chalk.red(`[COMMAND ERROR] /${interaction.commandName}:`), error.message);

    const errEmbed = new EmbedBuilder()
      .setColor(0xff0000)
      .setTitle('❌ Błąd')
      .setDescription(`**Szczegóły:** ${error.message}`);

    if (interaction.deferred || interaction.replied) {
      await interaction.editReply({ embeds: [errEmbed] }).catch(() => {});
    } else {
      await interaction.reply({ embeds: [errEmbed], ephemeral: true }).catch(() => {});
    }
  }
});

client.login(process.env.DISCORD_TOKEN)
  .then(() => console.log(chalk.green('[LOGIN] Token zaakceptowany')))
  .catch(err => console.error(chalk.red('[LOGIN ERROR]'), err.message));
