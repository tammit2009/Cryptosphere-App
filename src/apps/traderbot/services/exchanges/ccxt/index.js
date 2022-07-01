const axios = require('axios');
const ccxt = require('ccxt');

// exports.ccxtGetAllMarketsOHLCV = async (exchange) => {
//     let sleep = (ms) => new Promise (resolve => setTimeout (resolve, ms));

//     if (exchange.has.fetchOHLCV) {
//         for (symbol in exchange.markets) {
//             await sleep (exchange.rateLimit) // milliseconds
//             console.log (await exchange.fetchOHLCV (symbol, '1m')) // one minute
//         }
//     }
// }

// exports.getBinanceClient = () => {
//     return new ccxt.binance({
//         apiKey: config.get(binance_key),
//         secret: config.get(binance_secret)
//     });
// }

// exports.listExchanges = () => {
//     return ccxt.exchanges;
// }

// exports.getAuthExchange = (exchangeId) => {
//     const exchangeClass = ccxt[exchangeId];
//     return new exchangeClass ({
//         'apiKey': binance_key,
//         'secret': binance_secret,
//     });
// }

// exports.getExchange = (exchangeId) => {
//     return new ccxt[exchangeId] ({
//         'rateLimit': 10000,             // unified exchange property
//         // 'headers': {
//         //     'YOUR_CUSTOM_HTTP_HEADER': 'YOUR_CUSTOM_VALUE',
//         // },
//         // 'options': {
//         //     'adjustForTimeDifference': true, // exchange-specific option
//         // }
//     });
// }

// exports.setExchangeOption = (option, value) => {
//     exchange.options[option] = value;
// }