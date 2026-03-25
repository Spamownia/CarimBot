const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const chalk = require('chalk');

const { requiredServerConfigCommandOption, getServerConfigCommandOptionValue } = require('../../modules/cftClient');
const cftSDK = require('cftools-sdk');

const execute = async (interaction) => {
  console.log(chalk.magenta(`[COMMAND] /admin-player-list wywołana`));

  try {
    const serverCfg = getServerConfigCommandOptionValue(interaction);

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
    console.log(chalk.green(`[COMMAND] /admin-player-list wykonana`));
  } catch (error) {
    console.error(chalk.red('[COMMAND ERROR]'), error);

    const errEmbed = new EmbedBuilder()
      .setColor(0xff0000)
      .setTitle('❌ Błąd')
      .setDescription(error.message);

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
