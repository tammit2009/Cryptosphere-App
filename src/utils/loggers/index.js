const split = require('split');
const developmentLogger = require('./developmentLogger');
const productionLogger  = require('./productionLogger');

let logger = null;

if (process.env.NODE_ENV === 'development') {
    logger = developmentLogger();
}
else if (process.env.NODE_ENV === 'production') {
    logger = productionLogger();
}
else {
    logger = developmentLogger();
}

// create a stream object with a 'write' function that will be used by `morgan`
// const loggerStream = {
//     write: function(message, encoding) {
//         // use the 'info' log level so the output will be picked up by both transports (file and console)
//         logger.info(logger.info(message.substring(0, message.lastIndexOf('\n'))));
//     },
// };
const loggerStream = split().on('data', function(message) {
    logger.info(message);
});

module.exports = { logger, loggerStream };