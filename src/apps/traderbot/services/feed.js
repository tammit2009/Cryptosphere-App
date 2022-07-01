// const axios = require('axios');
// const WebSocket = require('ws');

// const config = require('../../config');
// const binance = require('./exchanges/binance');

// const { timeout } = require('../utils');

// class Feed {

//     constructor({ asset, base, onUpdate, onError }) {
//         this.asset = asset;
//         this.base = base;
//         this.onUpdate = onUpdate;
//         this.onError = onError;
//         this.running = false;
//     }

//     async start() {

//         console.log('User Feed Starting...');

//         // First get the listenKey
//         const listenKey = await binance.obtainBinanceListenKey();
//         // await binance.binanceKeepAlive(listenKey);         // TODO: automate to ping every 30s
//         // binance.binanceDestroyListenKey(listenKey);        // Does not work correctly
        
//         timeout(300);

//         // Open user data websocket
//         const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${listenKey}`);
//         this.wsClient = ws;

//         return new Promise((resolve, reject) => {
//             console.log('client connecting to binance user data ws...')

//             ws.on('open', () => {
//                 this.running = true
//                 resolve(this.running)
//             });

//             // Update Source
//             ws.on('message', async (data) => {

//                 // data format
//                 console.log(data.toString());

//                 // if (data.type === 'heartbeat') { return }
//                 await this.onUpdate(data.toString());
//             });

//             ws.on('error', err => {
//                 this.onError(err);
//                 this.running = false;
//                 // ws.connect();
//                 // setTimeout(this.start, reconnectInterval);
//                 reject(err)
//             });
    
//             ws.on('close', (err) => {
//                 // if (this.running) {
//                 //     ws.connect();
//                 // }
//                 this.running = false
//                 reject(err)
//             });
//         });

//     }

//     async reconnect() {
//         // try {
//         //     await this.start()
//         // } catch (err) {
//         //     console.log('WEBSOCKET_RECONNECT: Error', new Error(err).message)
//         // }
//     }

//     reconnectLoop = () => {
//         // // repeat every 5 seconds
//         // setInterval(() => {
//         //     if (!this.running) {
//         //         this.reconnect()
//         //     }
//         // }, timeInterval)
//     }

//     timedStop = (timeoutMs) => {
//         // if (this.running) {
//         //     setTimeout(() => { this.stop() }, timeoutMs);
//         // }
//     }

//     stop() {
//         // this.running = false;
//         // this.wsClient.close();
//     }
// }

// module.exports = Feed;


// /* May be useful!!!

// // const timestamp = new Date().getTime(); const recvWnd = 5000;
//         // const query_str = `recvWindow=${recvWnd}&timestamp=${timestamp}`;

//         // creating hmac object
//         // const hmac = crypto.createHmac('sha256', binance_secret);
//         // let hmac_signature = hmac.update(query_str);  // passing the data to be hashed
//         // hmac_signature = hmac_signature.digest('hex');     // Creating the hmac in the required format
//         // console.log('query_str: ', query_str);
//         // console.log('hmac signature: ', hmac_signature);

//         // // const url = `https://api.binance.com/api/v3/userDataStream?${query_str}&${hmac_signature}`;
//         // const url = `https://api.binance.com/api/v3/userDataStream`;
//         // const cfg = {
//         //     headers: {
//         //         // 'Content-Type': 'application/json',
//         //         // "Access-Control-Allow-Origin": "*",
//         //         // 'Authorization': 'JWT fefege...',
//         //         "X-MBX-APIKEY": binance_key
//         //     },
//         //     params: {
//         //         recvWindow: recvWnd,
//         //         timestamp: timestamp,
//         //         signature: hmac_signature
//         //     }
//         // }
//         // const postData = { };

//         // const listenKey = await axios.post(url, null, cfg);

// */


// // Account Update
// // 'outboundAccountPosition' is sent any time an account balance has changed and 
// // contains the assets that were possibly changed by the event that generated the balance change.

// // {
// //     "e": "outboundAccountPosition", //Event type
// //     "E": 1564034571105,             //Event Time
// //     "u": 1564034571073,             //Time of last account update
// //     "B": [                          //Balances Array
// //       {
// //         "a": "ETH",                 //Asset
// //         "f": "10000.000000",        //Free
// //         "l": "0.000000"             //Locked
// //       }
// //     ]
// // }

// // Balance Update
// // Balance Update occurs during the following:
// // - Deposits or withdrawals from the account
// // - Transfer of funds between accounts (e.g. Spot to Margin)

// // {
// //     "e": "balanceUpdate",         //Event Type
// //     "E": 1573200697110,           //Event Time
// //     "a": "BTC",                   //Asset
// //     "d": "100.00000000",          //Balance Delta
// //     "T": 1573200697068            //Clear Time
// // }

// // Order Update
// // Orders are updated with the executionReport event.
// // Check the Rest API Documentation 'https://github.com/binance/binance-spot-api-docs/blob/master/rest-api.md#enum-definitions' 
// // and below for relevant enum definitions.
// // - Average price can be found by doing Z divided by z.

// // {
// //     "e": "executionReport",        // Event type
// //     "E": 1499405658658,            // Event time
// //     "s": "ETHBTC",                 // Symbol
// //     "c": "mUvoqJxFIILMdfAW5iGSOW", // Client order ID
// //     "S": "BUY",                    // Side
// //     "o": "LIMIT",                  // Order type
// //     "f": "GTC",                    // Time in force
// //     "q": "1.00000000",             // Order quantity
// //     "p": "0.10264410",             // Order price
// //     "P": "0.00000000",             // Stop price
// //     "d": 4,                        // Trailing Delta; This is only visible if the order was a trailing stop order.
// //     "F": "0.00000000",             // Iceberg quantity
// //     "g": -1,                       // OrderListId
// //     "C": null,                     // Original client order ID; This is the ID of the order being canceled
// //     "x": "NEW",                    // Current execution type
// //     "X": "NEW",                    // Current order status
// //     "r": "NONE",                   // Order reject reason; will be an error code.
// //     "i": 4293153,                  // Order ID
// //     "l": "0.00000000",             // Last executed quantity
// //     "z": "0.00000000",             // Cumulative filled quantity
// //     "L": "0.00000000",             // Last executed price
// //     "n": "0",                      // Commission amount
// //     "N": null,                     // Commission asset
// //     "T": 1499405658657,            // Transaction time
// //     "t": -1,                       // Trade ID
// //     "I": 8641984,                  // Ignore
// //     "w": true,                     // Is the order on the book?
// //     "m": false,                    // Is this trade the maker side?
// //     "M": false,                    // Ignore
// //     "O": 1499405658657,            // Order creation time
// //     "Z": "0.00000000",             // Cumulative quote asset transacted quantity
// //     "Y": "0.00000000",             // Last quote asset transacted quantity (i.e. lastPrice * lastQty)
// //     "Q": "0.00000000"              // Quote Order Qty
// // }


// // Execution types
// // - NEW - The order has been accepted into the engine.
// // - CANCELED - The order has been canceled by the user.
// // - REPLACED (currently unused)
// // - REJECTED - The order has been rejected and was not processed. (This is never pushed into the User 
// //              Data Stream)
// // - TRADE - Part of the order or all of the order's quantity has filled.
// // - EXPIRED - The order was canceled according to the order type's rules (e.g. LIMIT FOK orders with 
// //             no fill, LIMIT IOC or MARKET orders that partially fill) or by the exchange, (e.g. orders 
// //             canceled during liquidation, orders canceled during maintenance)

// // If the order is an OCO, an event will be displayed named ListStatus in addition to the executionReport 
// // event.

// // {
// //     "e": "listStatus",                //Event Type
// //     "E": 1564035303637,               //Event Time
// //     "s": "ETHBTC",                    //Symbol
// //     "g": 2,                           //OrderListId
// //     "c": "OCO",                       //Contingency Type
// //     "l": "EXEC_STARTED",              //List Status Type
// //     "L": "EXECUTING",                 //List Order Status
// //     "r": "NONE",                      //List Reject Reason
// //     "C": "F4QN4G8DlFATFlIUQ0cjdD",    //List Client Order ID
// //     "T": 1564035303625,               //Transaction Time
// //     "O": [                            //An array of objects
// //       {
// //         "s": "ETHBTC",                //Symbol
// //         "i": 17,                      // orderId
// //         "c": "AJYsMjErWJesZvqlJCTUgL" //ClientOrderId
// //       },
// //       {
// //         "s": "ETHBTC",
// //         "i": 18,
// //         "c": "bfYPSQdLoqAJeNrOr9adzq"
// //       }
// //     ]
// // }