// const axios     = require('axios');
// const crypto    = require('crypto');

// const config                    = require('../../../../config');
// const { paramsToQueryString, generateHmacSignature }   = require('../../../utils');

// const binance_key       = config.get('BINANCE_API_KEY');
// const binance_secret    = config.get('BINANCE_API_SECRET');

// const apiBaseUrl        = 'https://api.binance.com';

// // market symbol format: 'ETHUSDT'
// // If startTime and endTime are not sent, the most recent klines are returned.
// exports.getKlines = async (market, interval, start, end) => {

//     const url = `${apiBaseUrl}/api/v3/klines?symbol=${market}&interval=${interval}&startTime=${start}&endTime=${end}`;
//     const market_data = await axios.get(url);
//     // writeDataToFileAsJson(market_data.data, "output.json");

//     filtered_mkt_data = market_data.data.map((data) => {
//         return data.slice(0, 7);    // get just Date & OHLCV
//     });

//     return filtered_mkt_data; // market_data.data;
// }

// // exports.historicalData = async (exchangeId, market) => {
// //     // using Binance Direct API
// //     const results = await getKlines(mktConfig.asset, mktConfig.base, '1m');
// //     // console.log(results); 
// //     console.log('start: ', results[0]);  
// //     console.log('end: ', results[results.length - 1]);      
// // }

// exports.intervalToSeconds = (interval) => {
//     switch (interval) {
//         case '1m':
//             return 60;
//         case '5m':
//             return 60*5;
//         case '15m':
//             return 60*15;
//         case '1h':
//             return 60*60;
//         case '4h':
//             return 60*60*4;
//         case '1d':
//             return 60*60*24;
//     }
// }

// // [ref]: "https://github.com/binance/binance-spot-api-docs/blob/master/rest-api.md#signed-trade-and-user_data-endpoint-security"

// const obtainBinanceListenKey = async () => {

//     const url = `${apiBaseUrl}/api/v3/userDataStream`;

//     try {
//         const result = await axios.post(url, null, { 
//             headers: { 
//                 "X-MBX-APIKEY": binance_key 
//             } 
//         });
//         // console.log('Received ListenKey: ', result.data.listenKey);
//         return result.data.listenKey;
//     }
//     catch (err) {
//         console.log(err);
//         return false;
//     }
// }
// exports.obtainBinanceListenKey = obtainBinanceListenKey;

// const binanceKeepAlive = exports.binanceKeepAlive = async (listenKey) => {
//     const url = `${apiBaseUrl}/api/v3/userDataStream`;

//     try {
//         const result = await axios.put(url, null, { 
//             headers: { 
//                 "X-MBX-APIKEY": binance_key 
//             },
//             params: {
//                 listenKey
//             }
//         });
        
//         // console.log('Keep Alive Response: ', result);
//         return Object.keys(result.data).length === 0;  // result should be an empty object
//     }
//     catch (err) {
//         console.log(err);
//         return false;
//     }
// }

// exports.binanceDestroyListenKey = async (listenKey) => {
//     const url = `${apiBaseUrl}/api/v3/userDataStream`;

//     try {
//         const result = await axios.delete(url, null, { 
//             headers: { 
//                 "X-MBX-APIKEY": binance_key 
//             },
//             params: {
//                 listenKey
//             }
//         });
        
//         console.log('Keep Alive Response: ', result.data);
//         return Object.keys(result.data).length === 0;  // result should be an empty object
//     }
//     catch (err) {
//         console.log(err);
//         return false;
//     }
// }

// // Exchange Information
// exports.getExchangeInfo = async () => {
//     const url = `${apiBaseUrl}/api/v3/exchangeInfo`;

//     const listenKey = await obtainBinanceListenKey();

//     try {
//         const result = await axios.get(url, { 
//             headers: { 
//                 "X-MBX-APIKEY": binance_key 
//             },
//             params: {
//                 listenKey
//             }
//         });

//         // console.log('Exchange Info: ', result.data);
//         return result.data;  
//     }
//     catch (err) {
//         console.log(err);
//         return false;
//     }
// }
    
// // Account Information 
// exports.getAccountInfo = async () => {
//     const url = `${apiBaseUrl}/api/v3/account`;

//     const params = { 
//         recvWindow: 5000,
//         timestamp: new Date().getTime(),
//     };
    
//     params['signature'] = generateHmacSignature(binance_secret, params);

//     try {
//         const result = await axios.get(url, { 
//             headers: { "X-MBX-APIKEY": binance_key },
//             params
//         });

//         // console.log('Account Info: ', result.data);
//         return result.data;  
//     }
//     catch (err) {
//         console.log(err);
//         return false;
//     }
// }

// // Account Trade List
// exports.getAccountTradeList = async (_symbol) => {
//     const url = `${apiBaseUrl}/api/v3/myTrades  `;

//     const params = { 
//         recvWindow: 5000,
//         timestamp: new Date().getTime(),
//         symbol: _symbol,   
//     };
    
//     params['signature'] = generateHmacSignature(binance_secret, params);

//     // Sample parameters
//     // params: {
//     //     recvWindow: recvWnd,
//     //     timestamp: timestamp,
//     //     signature: hmac_signature,

//     //     symbol,                      // mandatory
//     //     orderId: xxx,                // This can only be used in combination with symbol
//     //     startTime: xxx,
//     //     endTime: xxx,
//     //     fromId: xxx,                 // TradeId to fetch from. Default gets most recent trades
//     //     limit: xxx,                  // Default 500; max 1000.
//     // }

//     try {
//         const result = await axios.get(url, { 
//             headers: { "X-MBX-APIKEY": binance_key },
//             params
//         });

//         console.log('Account Trade List: ', result.data);
//         return result.data;  
//     }
//     catch (err) {
//         console.log(err);
//         return false;
//     }
// }

// // Check Server Time
// exports.getServerTime = async () => {
//     const url = `${apiBaseUrl}/api/v3/time`;

//     try {
//         const result = await axios.get(url);
//         // console.log('Server Time: ', result.data.serverTime);
//         return result.data.serverTime;  
//     }
//     catch (err) {
//         console.log(err);
//         return false;
//     }
// }

// // Order Book
// exports.getOrderBook = async (symbol, limit) => {
//     const url = `${apiBaseUrl}/api/v3/depth`;

//     try {
//         const result = await axios.get(url, { params: {
//             symbol,
//             limit
//         }});
//         // console.log('Order Book: ', result.data);

//         return result.data;  
//     }
//     catch (err) {
//         console.log(err);
//         return false;
//     }
// }

// // Recent Trades List
// exports.getRecentTradesList = async (symbol, limit) => {
//     const url = `${apiBaseUrl}/api/v3/trades`;

//     try {
//         const result = await axios.get(url, { params: {
//             symbol,
//             limit  // Default 500; max 1000
//         }});
//         console.log('Recent Trades List: ', result.data);

//         return result.data;  
//     }
//     catch (err) {
//         console.log(err);
//         return false;
//     }
// }

// // New Order
// exports.createOrder = async (orderData) => {
//     const url = `${apiBaseUrl}/api/v3/order`;

//     // console.log('createOrder: ', orderData);

//     // TODO: validate the data to ensure all required are present in correct format

//     const params = { 
//         recvWindow: 5000,
//         timestamp: new Date().getTime(),
//         symbol: orderData.symbol,   
//         side: orderData.side,
//         type: orderData.type,
//     };

//     switch(orderData.type) {

//         case 'MARKET':
//             if (orderData.size) {
//                 params['quantity'] = orderData.size;
//             }
//             else if (orderData.funds) {
//                 params['quoteOrderQty'] = orderData.funds;
//             }
//             break;

//         case 'LIMIT':
//             params['quantity']    = orderData.size;
//             params['price']       = orderData.price;
//             params['timeInForce'] = 'GTC'; // GTC (Good Till Cancelled), IOC (Immediate Or Cancel), FOK (Fill or Kill)
//             break;

//         // This will execute a MARKET order when the conditions are met. (e.g. stopPrice is met 
//         // or trailingDelta is activated)
//         case 'STOP_LOSS':
//             // params['quantity']      = xxx;
//             // params['stopPrice ']    = xxx;
//             // params['trailingDelta'] = xxx;
//             break;

//         case 'STOP_LOSS_LIMIT':
//             // params['quantity']      = xxx;
//             // params['price ']        = xxx;
//             // params['stopPrice ']    = xxx;
//             // params['timeInForce ']  = xxx;
//             // params['trailingDelta'] = xxx;
//             break;

//         // This will execute a MARKET order when the conditions are met. (e.g. stopPrice 
//         // is met or trailingDelta is activated)
//         case 'TAKE_PROFIT':
//             // params['quantity']      = xxx;
//             // params['stopPrice ']    = xxx;
//             // params['trailingDelta'] = xxx;
//             break;

//         case 'TAKE_PROFIT_LIMIT':
//             // params['quantity']      = xxx;
//             // params['price ']        = xxx;
//             // params['stopPrice ']    = xxx;
//             // params['timeInForce ']  = xxx;
//             // params['trailingDelta'] = xxx;
//             break;

//         // This is a LIMIT order that will be rejected if the order immediately matches
//         // and trades as a taker - also known as a POST-ONLY order.
//         case 'LIMIT_MAKER':                      
//             // params['quantity']      = xxx;
//             // params['price ']        = xxx;
//             break;
//     }

//     // generate hmac signature
//     params['signature'] = generateHmacSignature(binance_secret, params);
//     // console.log('params: ', params);

//     // try {
//     //     const result = await axios.post(url, null, { 
//     //         headers: { "X-MBX-APIKEY": binance_key },
//     //         params
//     //     });

//     //     console.log('Account Trade List: ', result.data);
//     //     return result.data;  
//     // }
//     // catch (err) {
//     //     console.log(err);
//     //     return false;
//     // }

//     // dummy
//     return {
//         "symbol": "ETHUSDT",
//         "orderId": 28,
//         "orderListId": -1, //Unless OCO, value will be -1
//         "clientOrderId": "6gCrw2kRUAF9CvJDGP16IP",
//         "transactTime": 1507725176595,
//         "price": "2791.5",
//         "origQty": "0.035823034210997674",
//         "executedQty": "0.035823034210997674",
//         "cummulativeQuoteQty": "0.035823034210997674",
//         "status": "FILLED",
//         "timeInForce": "GTC",
//         "type": "MARKET",
//         "side": "SELL"
//     }

//     // Sample parameters
//     // params: {
//     //     recvWindow: recvWnd,
//     //     timestamp: timestamp,
//     //     signature: hmac_signature,

//     //     symbol,                  // mandatory
//     //     side: xxx,               // mandatory
//     //     type: xxx,               // mandatory - 'LIMIT', 'MARKET', etc
//     //     timeInForce: xxx,         
//     //     quantity: xxx,           
//     //     price: xxx,            
//     //     newClientOrderId: xxx,   // A unique id among open orders. Automatically generated if not sent.
//                                     // Orders with the same newClientOrderID can be accepted only when the 
//                                     // previous one is filled, otherwise the order will be rejected.         
//     //     stopPrice: xxx,          // Used with STOP_LOSS, STOP_LOSS_LIMIT, TAKE_PROFIT, and TAKE_PROFIT_LIMIT orders.  
//     //     trailingDelta: xxx,      // Used with STOP_LOSS, STOP_LOSS_LIMIT, TAKE_PROFIT, and TAKE_PROFIT_LIMIT orders.       
//     //     icebergQty: xxx,         // Used with LIMIT, STOP_LOSS_LIMIT, and TAKE_PROFIT_LIMIT to create an iceberg order.   
//     //     newOrderRespType: xxx,   // Set the response JSON. ACK, RESULT, or FULL; MARKET and LIMIT order types default to FULL, all other orders default to ACK.                  
//     // }

//     // LIMIT orders
//     // - Mandatory Parameters: 'timeInForce', 'quantity', 'price'

//     // MARKET orders
//     // - Mandatory Parameters: 'quantity' or 'quoteOrderQty'
//     // - MARKET orders using the quantity field specifies the amount of the base asset the 
//     //   user wants to buy or sell at the market price.
//     //   e.g. MARKET order on BTCUSDT will specify how much BTC the user is buying or selling.
//     // - MARKET orders using quoteOrderQty specifies the amount the user wants to spend (when buying) 
//     //        or receive (when selling) the quote asset; the correct quantity will be determined based 
//     //        on the market liquidity and quoteOrderQty.
//     //        e.g. Using the symbol BTCUSDT:
//     //        - BUY side, the order will buy as many BTC as quoteOrderQty USDT can.
//     //        - SELL side, the order will sell as much BTC needed to receive quoteOrderQty USDT.

//     // STOP_LOSS order
//     // - Mandatory Parameters: 'quantity', 'stopPrice' or 'trailingDelta'
//     // - This will execute a MARKET order when the conditions are met. (e.g. stopPrice is met or 
//     //   trailingDelta is activated)

//     // STOP_LOSS_LIMIT order
//     // - Mandatory Parameters: 'timeInForce', 'quantity', 'price', 'stopPrice' or 'trailingDelta'

//     // TAKE_PROFIT order
//     // - Mandatory Parameters: 'quantity', 'stopPrice' or 'trailingDelta'
//     // - This will execute a MARKET order when the conditions are met. (e.g. stopPrice is met or 
//     //   trailingDelta is activated)

//     // TAKE_PROFIT_LIMIT order
//     // - Mandatory Parameters: 'timeInForce', 'quantity', 'price', 'stopPrice' or 'trailingDelta'

//     // LIMIT_MAKER order          
//     // - Mandatory Parameters: 'quantity', 'price'   
// }

// // Test Order
// exports.createTestOrder = async (_symbol, _side, _type, _qty) => {
//     const url = `${apiBaseUrl}/api/v3/test`;

//     // Tests new order creation and signature/recvWindow long. Creates and validates a new order 
//     // but does not send it into the matching engine.

//     const params = { 
//         recvWindow: 5000,
//         timestamp: new Date().getTime(),
//         symbol: _symbol,   
//         side: _side,
//         type: _type,
//         quantity: _qty      // can also be quoteOrderQty (see ref.)
//     };

//     params['signature'] = generateHmacSignature(binance_secret, params);

//     try {
//         const result = await axios.post(url, null, { 
//             headers: { "X-MBX-APIKEY": binance_key },
//             params
//         });

//         console.log('Account Trade List: ', result.data);
//         return result.data;  
//     }
//     catch (err) {
//         console.log(err);
//         return false;
//     }

//     // parameters
//     // - Same as POST /api/v3/order      
// }

// // Query Order
// exports.getOrder = async ({ symbol, orderId, origClientOrderId }) => {
//     const url = `${apiBaseUrl}/api/v3/test`;

//     const params = { 
//         recvWindow: 5000,
//         timestamp: new Date().getTime(),
//         symbol: symbol,   
//     };

//     if (orderId) {
//         params['orderId'] = orderId;
//     }
//     else if (origClientOrderId) {
//         params['origClientOrderId'] = origClientOrderId;
//     }

//     params['signature'] = generateHmacSignature(binance_secret, params);
//     // console.log('params: ', params);
    
//     // try {
//     //     const result = await axios.get(url, { 
//     //         headers: { "X-MBX-APIKEY": binance_key },
//     //         params
//     //     });

//     //     console.log('Account Trade List: ', result.data);
//     //     return result.data;  
//     // }
//     // catch (err) {
//     //     console.log(err);
//     //     return false;
//     // }

//     // // Sample parameters
//     // // params: {
//     // //     recvWindow: recvWnd,
//     // //     timestamp: timestamp,
//     // //     signature: hmac_signature,

//     // //     symbol,                     // mandatory
//     // //     orderId: xxx,               // OR origClientOrderId
//     // //     origClientOrderId: xxx,     // OR orderId
//     // // }

//     // sample return only
//     return {
//         "symbol": "LTCBTC",
//         "orderId": 1,
//         "orderListId": -1,              // Unless part of an OCO, the value will always be -1
//         "clientOrderId": "myOrder1",
//         "price": "0.1",
//         "origQty": "1.0",
//         "executedQty": "0.0",
//         "cummulativeQuoteQty": "0.0",
//         "status": "NEW",
//         "timeInForce": "GTC",
//         "type": "LIMIT",
//         "side": "BUY",
//         "stopPrice": "0.0",
//         "icebergQty": "0.0",
//         "time": 1499827319559,
//         "updateTime": 1499827319559,
//         "isWorking": true,
//         "origQuoteOrderQty": "0.000000"
//     }
// }

// // Query All Account Orders => active, canceled, or filled
// exports.getAllAccountOrders = async (_symbol) => {
//     const url = `${apiBaseUrl}/api/v3/allOrders`;

//     // Tests new order creation and signature/recvWindow long. Creates and validates a new order 
//     // but does not send it into the matching engine.

//     const params = { 
//         recvWindow: 5000,
//         timestamp: new Date().getTime(),
//         symbol: _symbol,   
//         // orderId: _orderId,                      
//     };

//     params['signature'] = generateHmacSignature(binance_secret, params);

//     try {
//         const result = await axios.get(url, { 
//             headers: { "X-MBX-APIKEY": binance_key },
//             params
//         });

//         console.log('All Account Orders: ', result.data);
//         return result.data;  
//     }
//     catch (err) {
//         console.log(err);
//         return false;
//     }

//     // Sample parameters
//     // params: {
//     //     recvWindow: recvWnd,
//     //     timestamp: timestamp,
//     //     signature: hmac_signature,

//     //     symbol,                     // mandatory
//     //     orderId: xxx,               
//     //     startTime: xxx,             
//     //     endTime: xxx,               
//     //     limit: xxx,                 // Default 500; max 1000.
//     // }
// }

// // Cancel Order
// exports.cancelOrder = async (_symbol, _orderId, origClientOrderId) => {
//     const url = `${apiBaseUrl}/api/v3/test`;

//     // Tests new order creation and signature/recvWindow long. Creates and validates a new order 
//     // but does not send it into the matching engine.

//     const params = { 
//         recvWindow: 5000,
//         timestamp: new Date().getTime(),
//         symbol: _symbol,   
//         orderId: _orderId,                      // OR origClientOrderId
//         origClientOrderId: _origClientOrderId   // OR orderId
//     };

//     params['signature'] = generateHmacSignature(binance_secret, params);

//     try {
//         const result = await axios.delete(url, { 
//             headers: { "X-MBX-APIKEY": binance_key },
//             params
//         });

//         console.log('Account Trade List: ', result.data);
//         return result.data;  
//     }
//     catch (err) {
//         console.log(err);
//         return false;
//     }

//     // Sample parameters
//     // params: {
//     //     recvWindow: recvWnd,
//     //     timestamp: timestamp,
//     //     signature: hmac_signature,

//     //     symbol,                     // mandatory
//     //     orderId: xxx,               // OR origClientOrderId
//     //     origClientOrderId: xxx,     // OR orderId
//     //     newClientOrderId: xxx       // Used to uniquely identify this cancel. Automatically generated by default.
//     // }
// }

// // Current average price
// exports.getCurrentAvgPrice = async (symbol) => {
//     const url = `${apiBaseUrl}/api/v3/avgPrice`;

//     try {
//         const result = await axios.get(url, { params: { 
//             symbol 
//         }});
//         console.log('Current Avg Price: ', result.data.price); // data: { mins: 5, price: '2910.87826403' }

//         return result.data.price;  
//     }
//     catch (err) {
//         console.log(err);
//         return false;
//     }
// }

// // 24hr ticker price change statistics
// exports.get24HrTickerPriceChangeStats = async (symbol) => {
//     const url = `${apiBaseUrl}/api/v3/ticker/24hr`;

//     try {
//         const result = await axios.get(url, { params: { 
//             symbol 
//         }});
//         console.log('24Hr Ticker Price Change Stats: ', result.data); 

//         return result.data;  
//     }
//     catch (err) {
//         console.log(err);
//         return false;
//     }
// }

// // Symbol price ticker: latest price for a symbol or symbols
// exports.getSymbolPriceTicker = async (symbol) => {
//     const url = `${apiBaseUrl}/api/v3/ticker/price`;

//     try {
//         const result = await axios.get(url, { params: { 
//             symbol 
//         }});
//         console.log('Symbol Price Ticker: ', result.data); 

//         return result.data;  
//     }
//     catch (err) {
//         console.log(err);
//         return false;
//     }
// }

// // Symbol order book ticker
// exports.getSymbolOrderBookTicker = async (symbol) => {
//     const url = `${apiBaseUrl}/api/v3/ticker/bookTicker`;

//     try {
//         const result = await axios.get(url, { params: { 
//             symbol 
//         }});
//         console.log('Symbol Book Ticker: ', result.data); 

//         return result.data;  
//     }
//     catch (err) {
//         console.log(err);
//         return false;
//     }
// }

// // Cancel all open orders on a Symbol
// exports.cancelAllOpenOrders = async (_symbol) => {
//     const url = `${apiBaseUrl}/api/v3/openOrders `;

//     const params = { 
//         recvWindow: 5000,
//         timestamp: new Date().getTime(),
//         symbol: _symbol,   
//     };
    
//     params['signature'] = generateHmacSignature(binance_secret, params);

//     // Sample parameters
//     // params: {
//     //     recvWindow: recvWnd,
//     //     timestamp: timestamp,
//     //     signature: hmac_signature,

//     //     symbol,                      // mandatory
//     // }

//     try {
//         const result = await axios.get(url, { 
//             headers: { "X-MBX-APIKEY": binance_key },
//             params
//         });

//         console.log('Cancel All Open Orders: ', result.data);
//         return result.data;  
//     }
//     catch (err) {
//         console.log(err);
//         return false;
//     }
// }

// // Current Open Orders
// exports.getCurrentOpenOrders = async () => {
//     const url = `${apiBaseUrl}/api/v3/openOrders`;

//     const params = { 
//         recvWindow: 5000,
//         timestamp: new Date().getTime(),
//         // symbol: _symbol,   
//     };
    
//     params['signature'] = generateHmacSignature(binance_secret, params);

//     // Sample parameters
//     // params: {
//     //     recvWindow: recvWnd,
//     //     timestamp: timestamp,
//     //     signature: hmac_signature,

//     //     symbol,                      // optional
//     // }

//     try {
//         const result = await axios.get(url, { 
//             headers: { "X-MBX-APIKEY": binance_key },
//             params
//         });

//         console.log('Current Open Orders: ', result.data);
//         return result.data;  
//     }
//     catch (err) {
//         console.log(err);
//         return false;
//     }
// }

// // New OCO - (OCO: One Cancels the Other)
// exports.create_OCO_Order = async (_symbol, _side, _qty, _price, _stop) => {
//     const url = `${apiBaseUrl}/api/v3/order/oco`;

//     const params = { 
//         recvWindow: 5000,
//         timestamp: new Date().getTime(),
//         symbol: _symbol,        // mandatory 
//         side:   _side,          // mandatory 
//         quantity: _qty,         // mandatory 
//         price: _price,          // mandatory 
//         stopPrice: _stop,       // mandatory 
//     };
    
//     params['signature'] = generateHmacSignature(binance_secret, params);

//     // Sample parameters
//     // params: {
//     //     recvWindow: recvWnd,
//     //     timestamp: timestamp,
//     //     signature: hmac_signature,

//     //     symbol,                      // mandatory
//     //     listClientOrderId,           // Optional: A unique Id for the entire orderList
//     //     side,                        // mandatory
//     //     quantity,                    // mandatory
//     //     limitClientOrderId,          // Optional: A unique Id for the limit order
//     //     price,                       // mandatory
//     //     limitIcebergQty,             // Optional: Used to make the LIMIT_MAKER leg an iceberg order.
//     //     trailingDelta,
//     //     stopClientOrderId,           // Optional: A unique Id for the stop loss/stop loss limit leg
//     //     stopPrice,                   // mandatory
//     //     stopLimitPrice,              // Optional: If provided, stopLimitTimeInForce is required.
//     //     stopIcebergQty,              // Used with STOP_LOSS_LIMIT leg to make an iceberg order.
//     //     stopLimitTimeInForce,        // Valid values are GTC/FOK/IOC
//     //     newOrderRespType,            // Set the response JSON.
//     // }

//     try {
//         const result = await axios.post(url, { 
//             headers: { "X-MBX-APIKEY": binance_key },
//             params
//         });

//         console.log('Create New OCO Orders: ', result.data);
//         return result.data;  
//     }
//     catch (err) {
//         console.log(err);
//         return false;
//     }
// }

// // Cancel OCO - (OCO: One Cancels the Other)
// exports.cancel_OCO_Order = async (_symbol, _orderListId, _listClientOrderId, _newClientOrderId) => {
//     const url = `${apiBaseUrl}/api/v3/order/orderList`;

//     const params = { 
//         recvWindow: 5000,
//         timestamp: new Date().getTime(),
//         symbol: _symbol,                               // mandatory 
//         // orderListId:   _side,                       // optional 
//         // listClientOrderId: _qty,                    // optional 
//         // newClientOrderId: _newClientOrderId,        // optional 
//     };
    
//     params['signature'] = generateHmacSignature(binance_secret, params);

//     // Sample parameters
//     // params: {
//     //     recvWindow: recvWnd,
//     //     timestamp: timestamp,
//     //     signature: hmac_signature,

//     //     symbol,                      // mandatory
//     //     orderListId,                 // Optional: Either orderListId or listClientOrderId must be provided
//     //     listClientOrderId,           // Optional: Either orderListId or listClientOrderId must be provided
//     //     newClientOrderId,            // Optional: Used to uniquely identify this cancel. Automatically generated by default
//     // }

//     try {
//         const result = await axios.delete(url, { 
//             headers: { "X-MBX-APIKEY": binance_key },
//             params
//         });

//         console.log('Create New OCO Orders: ', result.data);
//         return result.data;  
//     }
//     catch (err) {
//         console.log(err);
//         return false;
//     }
// }

// // Query OCO - (OCO: One Cancels the Other) Retrieves a specific OCO based on provided optional parameters
// exports.get_OCO_Order = async (_orderListId, _listClientOrderId) => {
//     const url = `${apiBaseUrl}/api/v3/orderList`;

//     const params = { 
//         recvWindow: 5000,
//         timestamp: new Date().getTime(),
//         orderListId:   _orderListId,                       // optional 
//         listClientOrderId: _listClientOrderId,             // optional 
//     };
    
//     params['signature'] = generateHmacSignature(binance_secret, params);

//     // Sample parameters
//     // params: {
//     //     recvWindow: recvWnd,
//     //     timestamp: timestamp,
//     //     signature: hmac_signature,

//     //     orderListId,                 // Either orderListId or listClientOrderId must be provided
//     //     listClientOrderId,           // Either orderListId or listClientOrderId must be provided
//     // }

//     try {
//         const result = await axios.delete(url, { 
//             headers: { "X-MBX-APIKEY": binance_key },
//             params
//         });

//         console.log('Query OCO Orders: ', result.data);
//         return result.data;  
//     }
//     catch (err) {
//         console.log(err);
//         return false;
//     }
// }

// // Query all OCO - (OCO: One Cancels the Other)
// exports.getAll_OCO_Order = async () => {
//     const url = `${apiBaseUrl}/api/v3/allOrderList`;

//     const params = { 
//         recvWindow: 5000,
//         timestamp: new Date().getTime(), 
//         // fromId:
//         // startTime: ,
//         // endTime: 
//     };
    
//     params['signature'] = generateHmacSignature(binance_secret, params);

//     // Sample parameters
//     // params: {
//     //     recvWindow: recvWnd,
//     //     timestamp: timestamp,
//     //     signature: hmac_signature,
//     //     fromId                   // If supplied, neither startTime or endTime can be provided
//     //     startTime
//     //     endTime
//     //     limit
//     // }

//     try {
//         const result = await axios.get(url, { 
//             headers: { "X-MBX-APIKEY": binance_key },
//             params
//         });

//         console.log('Query OCO Orders: ', result.data);
//         return result.data;  
//     }
//     catch (err) {
//         console.log(err);
//         return false;
//     }
// }

// // Query Open OCO - (OCO: One Cancels the Other)
// exports.getOpen_OCO_Order = async () => {
//     const url = `${apiBaseUrl}/api/v3/openOrderList`;

//     const params = { 
//         recvWindow: 5000,
//         timestamp: new Date().getTime()
//     };
    
//     params['signature'] = generateHmacSignature(binance_secret, params);

//     // Sample parameters
//     // params: {
//     //     recvWindow: recvWnd,
//     //     timestamp: timestamp,
//     //     signature: hmac_signature,
//     // }

//     try {
//         const result = await axios.get(url, { 
//             headers: { "X-MBX-APIKEY": binance_key },
//             params
//         });

//         console.log('Open OCO Orders: ', result.data);
//         return result.data;  
//     }
//     catch (err) {
//         console.log(err);
//         return false;
//     }
// }