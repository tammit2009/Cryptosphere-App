
const Backtester = require('./main/backtester');
const Trader     = require('./main/trader');
const { logger } = require("../../utils/loggers");
// const dbhandler  = require('../utils/db_handler');

var traderbot = {};

traderbot.init = async function(data) {

    logger.info('initializing traderbot');

    console.log(data);

    // const { interval, asset, base, strategy, start, end, type, funds, live, ticksrc } = data;

    // switch (type) {
    //     case 'trader':
    //         const trader = new Trader({
    //             start, end, interval, asset, base, strategy, type, funds, live, ticksrc
    //         });
    
    //         await trader.start();
    //         break;
    //     case 'backtester':
    //     default: 
    //         const tester = new Backtester({
    //             reporter, start, end, interval, asset, base, strategy
    //         });

    //         await tester.start();
    //         break;
    // } 
};

traderbot.terminate = function() {

    logger.info('terminating traderbot');

};

module.exports = traderbot;