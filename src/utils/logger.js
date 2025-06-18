const winston = require('winston');
const path = require('path');
const fs = require('fs');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir);
}

// Define log format
const logFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.printf(({ level, message, timestamp, stack }) => {
        if (stack) {
            return `${timestamp} ${level}: ${message}\n${stack}`;
        }
        return `${timestamp} ${level}: ${message}`;
    })
);

// Create the logger
const logger = winston.createLogger({
    format: logFormat,
    transports: [
        // Console logging
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            )
        }),
        // Error logging
        new winston.transports.File({
            filename: path.join(logsDir, 'error.log'),
            level: 'error'
        }),
        // Combined logging
        new winston.transports.File({
            filename: path.join(logsDir, 'combined.log')
        }),
        // Command logging
        new winston.transports.File({
            filename: path.join(logsDir, 'commands.log'),
            level: 'info'
        })
    ]
});

// Add debug logging in development mode
if (process.env.DEVELOPMENT === 'true') {
    logger.add(new winston.transports.File({
        filename: path.join(logsDir, 'debug.log'),
        level: 'debug'
    }));
}

module.exports = logger;
