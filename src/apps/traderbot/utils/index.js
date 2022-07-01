// const axios     = require('axios');
// const ccxt      = require('ccxt');
// const crypto    = require('crypto');

// // const config = require('../config');

// // const binance_key = config.get('BINANCE_API_KEY');
// // const binance_secret = config.get('BINANCE_API_SECRET');

// exports.printAllRcvdCliArgs = ({ interval, asset, base, strategy, start, end, type, funds, live, ticksrc }) => {
//     console.log('interval: ', interval);
//     console.log('market asset: ' , asset);
//     console.log('market base: ' , base);
//     console.log('market: '  , `${base}${asset}`);
//     console.log('strategy: ', strategy);
//     console.log('start: '   , start);
//     console.log('end: '     , end);
//     console.log('type: '    , type);
//     console.log('funds: '   , funds);
//     console.log('live: '    , live);
//     console.log('ticksrc: '  , ticksrc);

//     console.log(process.argv);
// };

// exports.timeout = (ms) => {
//     return new Promise(resolve => setTimeout(resolve, ms));
// }

// const paramsToQueryString = exports.paramsToQueryString = (obj) => {
//     let paramArr = [];

//     for (let p in obj) {
//         if (obj.hasOwnProperty(p)) {
//             paramArr.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
//         }
//     }

//     return paramArr.join("&");  
// }

// exports.generateHmacSignature = (secret, params) => {

//     const query_str = paramsToQueryString(params); 
//     const hmac = crypto.createHmac('sha256', secret);
//     let hmac_signature = hmac.update(query_str);         // passing the data to be hashed
//     hmac_signature = hmac_signature.digest('hex');       // Creating the hmac in the required format

//     return hmac_signature;
// }

// function writeDataToFileAsJson(jsonData, outputFile) {
//     // file system module to perform file operations
//     const fs = require('fs');

//     // stringify JSON Object
//     var jsonContent = JSON.stringify(jsonData, getCircularReplacer());
//     //console.log(jsonContent);

//     fs.writeFile(outputFile, jsonContent, 'utf8', function (err) {
//         if (err) {
//             console.log("An error occured while writing JSON Object to File.");
//             return console.log(err);
//         }

//         console.log("JSON file has been saved.");
//     });
// }

// const getCircularReplacer = () => {
//     const seen = new WeakSet();
//     return (key, value) => {
//         if (typeof value === 'object' && value !== null) {
//             if (seen.has(value)) {
//                 return;
//             }
//             seen.add(value);
//         }
//         return value;
//     };
// };

// class AsyncLock {
//     constructor () {
//       this.disable = () => {}
//       this.promise = Promise.resolve()
//     }
  
//     enable () {
//       this.promise = new Promise(resolve => this.disable = resolve)
//     }
// }

// exports.AsyncLock = AsyncLock;


