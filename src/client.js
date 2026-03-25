// src/client.js
require('dotenv').config();

const { Client, GatewayIntentBits, Collection } = require('discord.js');
const chalk = require('chalk');

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

client.commands = new Collection();
client.emojis = { success: '✅', error: '❌' };

console.log(chalk.green('[CLIENT] Client zainicjalizowany'));

module.exports = client;
