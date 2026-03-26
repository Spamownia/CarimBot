// src/commands/admin/admin-player-list.js
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const chalk = require('chalk');
const { requiredServerConfigCommandOption, getServerConfigCommandOptionValue } = require('../../modules/cftClient');
const cftSDK = require('cftools-sdk');

const execute = async (interaction) => {
  console.log(chalk.magenta(`[COMMAND] /admin-player-list wywołana przez ${interaction.user.tag}`));

  try {
    const serverCfg = getServerConfigCommandOptionValue(interaction);

    console.log(chalk.magenta(`[COMMAND] Pobieram graczy dla serwera: ${serverCfg.NAME}`));

    const sessions = await cftSDK.listGameSessions({
      serverApiId: cftSDK.ServerApiId.of(serverCfg.CFTOOLS_SERVER_API_ID)
    });

    const embed = new EmbedBuilder()
      .setColor(0x00ff88)
      .setTitle(`👮 Admin Player List – ${serverCfg.NAME}`)
      .setDescription(
        sessions.length
          ? sessions.map((s, i) => `${i + 1}. **${s.playerName || 'Nieznany'}** (${s.id})`).join('\n')
          : 'Brak graczy online.'
      )
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });

    console.log(chalk.green(`[COMMAND] /admin-player-list wykonana pomyślnie`));

  } catch (error) {
    console.error(chalk.red(`[COMMAND ERROR] /admin-player-list:`), error.message);

    const errEmbed = new EmbedBuilder()
      .setColor(0xff0000)
      .setTitle('❌ Błąd CFTools API')
      .setDescription(`**Szczegóły:** ${error.message}\n\nSprawdź logi Rendera.`);

    // Bezpieczna odpowiedź – unikamy Unknown Interaction
    if (interaction.deferred || interaction.replied) {
      await interaction.editReply({ embeds: [errEmbed] }).catch(console.error);
    } else {
      await interaction.reply({ embeds: [errEmbed], ephemeral: true }).catch(console.error);
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
        .setRequired(requiredServerConfigCommandOption.required)
        .setChoices(...requiredServerConfigCommandOption.choices);
      return option;
    });

  collection.set('admin-player-list', { data, execute, category: 'admin', aliases: [] });
  console.log(chalk.green(`[LOAD] Załadowano komendę: admin-player-list`));
};

execute.loadAliases = () => [];
module.exports = execute;
