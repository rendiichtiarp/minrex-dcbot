const mysql = require("mysql2/promise");
const logger = require("../logger");

let pool;

async function initialize() {
  try {
    pool = mysql.createPool({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME || "discord_bot",
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    }); // Test connection
    await pool.getConnection();
    logger.info("Database connection established successfully");

    // Create table if it doesn't exist
    await createTable();
  } catch (error) {
    logger.error("Error initializing database:", error);
    throw error;
  }
}

async function createTable() {
  try {
    await pool.execute(`
            CREATE TABLE IF NOT EXISTS verification_settings (
                guild_id VARCHAR(20) PRIMARY KEY,
                channel_id VARCHAR(20) NOT NULL,
                role_id VARCHAR(20) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

    logger.info("Database table created/verified successfully");
  } catch (error) {
    logger.error("Error creating database tables:", error);
    throw error;
  }
}

async function query(sql, params) {
  try {
    const [results] = await pool.execute(sql, params);
    return results;
  } catch (error) {
    logger.error("Database query error:", error);
    throw error;
  }
}

module.exports = {
  initialize,
  query,
  // Verification settings queries
  verification: {
    async saveSettings(guildId, channelId, roleId) {
      return await query(
        "INSERT INTO verification_settings (guild_id, channel_id, role_id) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE channel_id = ?, role_id = ?",
        [guildId, channelId, roleId, channelId, roleId]
      );
    },

    async getSettings(guildId) {
      const results = await query(
        "SELECT * FROM verification_settings WHERE guild_id = ?",
        [guildId]
      );
      return results[0];
    },
  },
};
