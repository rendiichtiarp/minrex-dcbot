const { Client, Collection, GatewayIntentBits } = require('discord.js');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const logger = require('./utils/logger');
const db = require('./utils/database');

// Load environment variables
dotenv.config();

// Initialize database
db.initialize().catch(error => {
    logger.error('Failed to initialize database:', error);
    process.exit(1);
});

// Create client instance
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ]
});

// Create collections for commands
client.commands = new Collection();

// Load handlers
const handlersPath = path.join(__dirname, 'handlers');
const handlerFiles = fs.readdirSync(handlersPath).filter(file => file.endsWith('.js'));

for (const file of handlerFiles) {
    const filePath = path.join(handlersPath, file);
    require(filePath)(client);
}

// Login to Discord
client.login(process.env.TOKEN);
