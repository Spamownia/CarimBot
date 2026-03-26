// src/commands/admin/admin-player-list.js
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const chalk = require('chalk');
const { 
  requiredServerConfigCommandOption, 
  getServerConfigCommandOptionValue,
  cftClient 
} = require('../../modules/cftClient');
const cftSDK = require('cftools-sdk');

const execute = async (interaction) => {
  console.log(chalk.magenta(`[COMMAND] /admin-player-list wywołana przez ${interaction.user.tag}`));

  try {
    // 1. Defer reply JAK NAJSZYBCIEJ (to rozwiązuje Unknown Interaction)
    await interaction.deferReply();

    const serverCfg = getServerConfigCommandOptionValue(interaction);

    console.log(chalk.magenta(`[COMMAND] Pobieram graczy dla: ${serverCfg.NAME}`));

    // 2. Wywołanie API
    const sessions = await cftClient.listGameSessions({
      serverApiId: cftSDK.ServerApiId.of(serverCfg.CFTOOLS_SERVER_API_ID)
    });

    console.log(chalk.green(`[COMMAND] Pobrano ${sessions.length} graczy`));

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
    console.error(chalk.red(`[COMMAND ERROR] /admin-player-list:`), error.message || error);

    const errEmbed = new EmbedBuilder()
      .setColor(0xff0000)
      .setTitle('❌ Błąd CFTools API')
      .setDescription(`**Szczegóły:** ${error.message || 'Nieznany błąd'}`);

    // Bezpieczna odpowiedź nawet jeśli interakcja wygasła
    try {
      if (interaction.deferred || interaction.replied) {
        await interaction.editReply({ embeds: [errEmbed] });
      } else {
        await interaction.reply({ embeds: [errEmbed], ephemeral: true });
      }
    } catch (replyError) {
      console.error(chalk.red('[REPLY ERROR] Nie udało się odpowiedzieć na interakcję'), replyError);
    }
  }
};

// Ładowanie komendy
execute.load = (filePath, collection) => {
  const data = new SlashCommandBuilder()
    .setName('admin-player-list')
    .setDescription('Pokazuje aktualną listę graczy online')
    .setDMPermission(false)
    .addStringOption(option => {
      option
        .setName(requiredServerConfigCommandOption.name)
        .setDescription(requiredServerConfigCommandOption.description)
        .setRequired(requiredServerConfigCommandOption.required)
        .setChoices(...requiredServerConfigCommandOption.choices);
      return option;
    });

  collection.set('admin-player-list', { data, execute, category: 'admin', aliases: [] });
  console.log(chalk.green(`[LOAD] Załadowano komendę: admin-player-list`));
};

execute.loadAliases = () => [];
module.exports = execute;
