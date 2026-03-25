// src/handlers/commands.js
const chalk = require('chalk');
const client = require('../client');

module.exports = async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  console.log(chalk.cyan(`[HANDLER] Otrzymano komendę: /${interaction.commandName}`));

  const command = client.commands.get(interaction.commandName);
  if (!command) {
    console.log(chalk.yellow(`[HANDLER] Nie znaleziono komendy: ${interaction.commandName}`));
    return;
  }

  try {
    await command.execute(interaction);
    console.log(chalk.green(`[HANDLER] Komenda /${interaction.commandName} wykonana pomyślnie`));
  } catch (error) {
    console.error(chalk.red(`[HANDLER ERROR] w komendzie /${interaction.commandName}:`), error);

    const errorMsg = { content: '❌ Wystąpił błąd podczas wykonywania komendy.', ephemeral: true };

    if (interaction.deferred || interaction.replied) {
      await interaction.editReply(errorMsg);
    } else {
      await interaction.reply(errorMsg);
    }
  }
};
