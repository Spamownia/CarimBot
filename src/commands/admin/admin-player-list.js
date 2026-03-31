// src/commands/admin/admin-player-list.js
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const chalk = require('chalk');

const { requiredServerConfigCommandOption, getServerConfigCommandOptionValue, cftClient } = require('../../modules/cftClient');
const cftSDK = require('cftools-sdk');

const execute = async (interaction) => {
  console.log(chalk.magenta(`[COMMAND] /admin-player-list wywołana przez ${interaction.user.tag}`));

  try {
    const serverCfg = getServerConfigCommandOptionValue(interaction);

    console.log(chalk.yellow(`[DEBUG] Używam Server API ID: ${serverCfg.CFTOOLS_SERVER_API_ID}`));

    // Poprawna metoda w cftools-sdk v3
    console.log(chalk.blue(`[DEBUG] Wywołuję listGameSessions...`));

    const sessions = await cftClient.listGameSessions({
      serverApiId: cftSDK.ServerApiId.of(serverCfg.CFTOOLS_SERVER_API_ID)
    });

    console.log(chalk.green(`[DEBUG] Pobrano ${sessions.length} sesji graczy`));

    const embed = new EmbedBuilder()
      .setColor(0x00ff88)
      .setTitle(`👮 Admin Player List – ${serverCfg.NAME}`)
      .setDescription(
        sessions.length
          ? sessions.map((s, i) => `${i + 1}. **${s.playerName || 'Nieznany'}** (${s.id})`).join('\n')
          : 'Brak graczy online na tym serwerze.'
      )
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });

    console.log(chalk.green(`[COMMAND] /admin-player-list wykonana pomyślnie`));

  } catch (error) {
    console.error(chalk.red(`[COMMAND ERROR] /admin-player-list:`));
    console.error(chalk.red('Nazwa błędu:'), error.name);
    console.error(chalk.red('Wiadomość:'), error.message);
    console.error(chalk.red('Stack:'), error.stack ? error.stack.substring(0, 500) : 'brak');

    const errEmbed = new EmbedBuilder()
      .setColor(0xff0000)
      .setTitle('❌ Błąd CFTools API')
      .setDescription(`**Szczegóły:** ${error.message}`);

    if (interaction.deferred || interaction.replied) {
      await interaction.editReply({ embeds: [errEmbed] });
    } else {
      await interaction.reply({ embeds: [errEmbed], ephemeral: true });
    }
  }
};

execute.load = (filePath, collection) => {
  const data = new SlashCommandBuilder()
    .setName('admin-player-list')
    .setDescription('Pokazuje listę graczy online (dla adminów)')
    .setDMPermission(false)
    .addStringOption(option => {
      option
        .setName(requiredServerConfigCommandOption.name)
        .setDescription(requiredServerConfigCommandOption.description)
        .setRequired(true)
        .setChoices(...requiredServerConfigCommandOption.choices);
      return option;
    });

  collection.set('admin-player-list', { data, execute, category: 'admin' });
  console.log(chalk.green('[LOAD] Załadowano: admin-player-list'));
};

module.exports = execute;
