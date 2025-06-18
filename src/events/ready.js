const logger = require('../utils/logger');

module.exports = {
    name: 'ready',
    once: true, execute(client) {
        logger.info(`Bot is ready! Logged in as ${client.user.tag}`);
        logger.info(`Serving ${client.guilds.cache.size} guilds`);
        logger.debug('Cached guilds:', client.guilds.cache.map(guild => ({
            name: guild.name,
            id: guild.id,
            memberCount: guild.memberCount
        })));

        // Set the bot's activity
        client.user.setPresence({
            activities: [{
                name: 'Toko Myrex',
                type: 2 // 2 is "Listening to"
            }],
            status: 'online'
        });
    },
};
