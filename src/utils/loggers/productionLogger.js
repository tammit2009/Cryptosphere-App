const appRoot = require('app-root-path');
const { createLogger, format, transports } = require('winston');
const DailyRotateFile = require("winston-daily-rotate-file");

const config = require("../../../config/default.json");

const logFormat = format.combine(
    // format.colorize(),
    format.timestamp(),  // { format: "HH:mm:ss" }
    format.align(),
    format.printf(({ level, message, timestamp }) => {
        return `${timestamp} ${level} ${message}`;
    }),
);

// define the custom settings for each transport (file, console)
const options = {
    file: {
        level: config['logConfig'].logLevel,
        filename: `${appRoot}/${config['logConfig'].logFolder}/${config['logConfig'].logFile}`,
        datePattern: 'YYYY-MM-DD',  // 'YYYY-MM-DD-HH'
        handleExceptions: true,
        json: true,
        maxsize: 5242880, // 5MB
        maxFiles: '14d',
        colorize: false,
        zippedArchive: true,
        prepend: true,
    },
    console: {
        level: 'info',
        handleExceptions: true,
        json: false,
        colorize: true,
    },
};

const fileTransport = new DailyRotateFile(options.file);
const consoleTransport = new transports.Console(options.console)

const productionLogger = () => {
    return createLogger({
        level: 'debug',
        format: logFormat,      // basic format: winston.format.simple()
        transports: [ fileTransport, consoleTransport ],
        exitOnError: false, // do not exit on handled exceptions
    });
};

module.exports = productionLogger;
