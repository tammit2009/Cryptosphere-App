
const axios = require('axios');
const Websocket = require('ws');
// const events = require('events');

const { getKeystoreEntries, getKeyFromKeystore } = require('../keystore');
const { generateHmacSignature } = require('../../utils/helpers');

const binanceBaseUrl = 'https://api.binance.com';

// temporary
const binance_apikey = process.env.BINANCE_API_KEY;
const binance_secret = process.env.BINANCE_API_SECRET;

const primitives = {};

async function getBinanceKeys(userId) {
    const keystoreEntries = await getKeystoreEntries(userId);
    if (!keystoreEntries) return false;

    const binanceApiKey    = getKeyFromKeystore(keystoreEntries, 'BINANCE_API_KEY');
    const binanceApiSecret = getKeyFromKeystore(keystoreEntries, 'BINANCE_API_SECRET');
    if (!binanceApiKey || !binanceApiSecret)  return false;

    return { apikey: binanceApiKey, secret: binanceApiSecret };
}


/*****************************/
/***** GENERAL ENDPOINTS *****/
/*****************************/

// Test connectivity
// url: GET /api/v3/ping
// parameters: none
primitives.ping = async function() {

    const endpoint = `/api/v3/ping`;

    try {
        const result = await axios.get(`${binanceBaseUrl}${endpoint}`, {});

        // Expected Response
        /*
        {}
        */

        return result.data;
    }
    catch (err) {
        return { errorCode: -1001, data: err.message };
    }   
};


// Check server time
// Test connectivity to the Rest API and get the current server time.
// url: GET /api/v3/time
// parameters: NONE
primitives.getCurrentServerTime = async function() {

    const endpoint = `/api/v3/time`;

    try {
        const result = await axios.get(`${binanceBaseUrl}${endpoint}`, {});

        // Expected Response
        /*
        {
            "serverTime": 1499827319559
        }
        */

        return result.data;
    }
    catch (err) {
        return { errorCode: -1001, data: err.message };
    }   
};


// Exchange information - Current exchange trading rules and symbol information
// url: GET /api/v3/exchangeInfo
// parameters: NONE | symbol | symbols
primitives.getExchangeInfo = async function({ symbols }) {
    
    // accepted formats:
    // 'https://api.binance.com/api/v3/ticker/24hr?symbols=[BTCUSDT,BNBUSDT]
    // 'https://api.binance.com/api/v3/ticker/24hr?symbols=%5B%22BTCUSDT%22,%22BNBUSDT%22%5D
    
    if (!symbols) return { errorCode: -2, data: `Symbols required.` };

    let endpoint = `/api/v3/exchangeInfo?symbols=${symbols}`;

    // console.log(`${binanceBaseUrl}${endpoint}`);

    try {
        const result = await axios.get(`${binanceBaseUrl}${endpoint}`, {});

        // Expected Response
        /*
        {
            "timezone": "UTC",
            "serverTime": 1565246363776,
            "rateLimits": [
                {
                //These are defined in the `ENUM definitions` section under `Rate Limiters (rateLimitType)`.
                //All limits are optional
                }
            ],
            "exchangeFilters": [
                //These are the defined filters in the `Filters` section.
                //All filters are optional.
            ],
            "symbols": [
                {
                    "symbol": "ETHBTC",
                    "status": "TRADING",
                    "baseAsset": "ETH",
                    "baseAssetPrecision": 8,
                    "quoteAsset": "BTC",
                    "quotePrecision": 8, // will be removed in future api versions (v4+)
                    "quoteAssetPrecision": 8,
                    "baseCommissionPrecision": 8,
                    "quoteCommissionPrecision": 8,
                    "orderTypes": [
                        "LIMIT",
                        "LIMIT_MAKER",
                        "MARKET",
                        "STOP_LOSS",
                        "STOP_LOSS_LIMIT",
                        "TAKE_PROFIT",
                        "TAKE_PROFIT_LIMIT"
                    ],
                    "icebergAllowed": true,
                    "ocoAllowed": true,
                    "quoteOrderQtyMarketAllowed": true,
                    "allowTrailingStop": false,
                    "cancelReplaceAllowed":false,
                    "isSpotTradingAllowed": true,
                    "isMarginTradingAllowed": true,
                    "filters": [
                        //These are defined in the Filters section.
                        //All filters are optional
                    ],
                    "permissions": [
                        "SPOT",
                        "MARGIN"
                    ]
                }
            ]
        }
        */
        return result.data;
    }
    catch (err) {
        return { errorCode: -1001, data: err.message };
    }   
};


/*********************************/
/***** MARKET DATA ENDPOINTS *****/
/*********************************/

// Get the orderbook depth data - DEMO
primitives.getObDepthDemo = async function({ symbol, limit, user }) {

    const endpoint = `/api/v3/depth?symbol=${symbol}&limit=${limit}`;

    try {
        const result = await axios.get(`${binanceBaseUrl}${endpoint}`, {});
        return result.data;
    }
    catch (err) {
        if (err.response) {
            return { errorCode: -1003, data: err.response.data };
        } 
        else if (err.request) {
            return { errorCode: -1002, data: err.request };
        } 
        else {
            return { errorCode: -1001, data: err.message };
        }
    }   
};


// Get the orderbook depth data
primitives.getObDepth = async function({ symbol, limit, user }) {
    if (!user) return { errorCode: -1, data: `Forbidden: user not found.` };

    if (!symbol) return { errorCode: -2, data: `Symbol required.` };

    // Are keys required? Get them from keystore
    // const binanceKeys = await getBinanceKeys(user._id);
    // if (!binanceKeys) return { errorCode: -5, data: `Invalid keys` };
    // const { apikey: binanceApiKey, secret: binanceApiSecret } = binanceKeys;

    const endpoint = `/api/v3/depth?symbol=${symbol}&limit=${limit}`;

    try {
        const result = await axios.get(`${binanceBaseUrl}${endpoint}`, {});
        return result.data;
    }
    catch (err) {
        return { errorCode: -1001, data: err.message };
    }   
};


// Recent trades list
// url: GET /api/v3/trades
// Parameters: symbol, limit
primitives.getTrades = async function({ symbol, limit }) {

    if (!symbol) return { errorCode: -2, data: `Symbol required.` };

    const endpoint = `/api/v3/trades?symbol=${symbol}&limit=${limit}`;

    try {
        const result = await axios.get(`${binanceBaseUrl}${endpoint}`, {});
        /*
        [
            {
                "id": 28457,
                "price": "4.00000100",
                "qty": "12.00000000",
                "quoteQty": "48.000012",
                "time": 1499865549590,
                "isBuyerMaker": true,
                "isBestMatch": true
            }
        ]
        */
        return result.data;
    }
    catch (err) {
        return { errorCode: -1001, data: err.message };
    }   
};


// Old trade lookup (MARKET_DATA)
// url: GET /api/v3/historicalTrades
// Parameters: symbol(M), limit, fromId - requires ApiKey
primitives.getHistoricalTrades = async function({ symbol, limit, user }) {
    // requires key
    if (!user) return { errorCode: -1, data: `Forbidden: user not found.` };

    const binanceKeys = await getBinanceKeys(user._id);
    if (!binanceKeys) return { errorCode: -5, data: `Invalid keys` };

    const { apikey: binanceApiKey /*, secret: binanceApiSecret*/ } = binanceKeys;

    const headers = {
        'X-MBX-APIKEY': binanceApiKey,
    };

    if (!symbol) return { errorCode: -2, data: `Symbol required.` };

    const endpoint = `/api/v3/historicalTrades?symbol=${symbol}&limit=${limit}`;

    try {
        const result = await axios.get(`${binanceBaseUrl}${endpoint}`, {
            headers, // params: {}
        });
        /*
        [
            {
                "id": 28457,
                "price": "4.00000100",
                "qty": "12.00000000",
                "quoteQty": "48.000012",
                "time": 1499865549590,
                "isBuyerMaker": true,
                "isBestMatch": true
            }
        ]
        */
        return result.data;
    }
    catch (err) {
        return { errorCode: -1001, data: err.message };
    }   
};


// Get Compressed/Aggregate trades list
// Get compressed, aggregate trades. Trades that fill at the time, from the same taker order, 
// with the same price will have the quantity aggregated.
// url: GET /api/v3/aggTrades
// Parameters: symbol(M), fromId, startTime, endTime, limit
// - If both startTime and endTime are sent, time between startTime and endTime must be less than 1 hour.
// - If fromId, startTime, and endTime are not sent, the most recent aggregate trades will be returned.
primitives.getAggregateTrades = async function({ symbol, startTime, endTime, limit }) {

    if (!symbol) return { errorCode: -2, data: `Symbol required.` };

    let endpoint = `/api/v3/aggTrades?symbol=${symbol}`;
    if (startTime) 
        endpoint = endpoint + `&startTime=${startTime}`;  // startTime - endTime < 1 hour
    if (endTime)
        endpoint = endpoint + `&endTime=${endTime}`;
    if (limit)
        endpoint = endpoint + `&limit=${limit}`;  // default=500, max=1000

    console.log(`${binanceBaseUrl}${endpoint}`);

    try {
        const result = await axios.get(`${binanceBaseUrl}${endpoint}`, {});
        /*
        [
            {
                "a": 26129,         // Aggregate tradeId
                "p": "0.01633102",  // Price
                "q": "4.70443515",  // Quantity
                "f": 27781,         // First tradeId
                "l": 27781,         // Last tradeId
                "T": 1498793709153, // Timestamp
                "m": true,          // Was the buyer the maker?
                "M": true           // Was the trade the best price match?
            }
        ]
        */
        return result.data;
    }
    catch (err) {
        return { errorCode: -1001, data: err.message };
    }   
};

    
// Get the candlestick data (public)
primitives.getKlines = async function({ symbol, interval, startTime, endTime, limit }) {
    
    if (!symbol) return { errorCode: -2, data: `Symbol required.` };

    // interval options; 1m, 3m, 5m, 15m, 30m, 1h, 2h, 4h, 6h, 8h, 12h, 1d, 3d, 1w, 1M
    if (!interval) interval = '5m'; 

    let endpoint = `/api/v3/klines?symbol=${symbol}&interval=${interval}`;
    if (startTime) 
        endpoint = endpoint + `&startTime=${startTime}`;
    if (endTime)
        endpoint = endpoint + `&endTime=${endTime}`;
    if (limit)
        endpoint = endpoint + `&limit=${limit}`;  // default=500, max=1000

    // console.log(`${binanceBaseUrl}${endpoint}`);

    try {
        const result = await axios.get(`${binanceBaseUrl}${endpoint}`, {});

        // Expected Response
        /*
        [
            [
                1499040000000,      // Open time
                "0.01634790",       // Open
                "0.80000000",       // High
                "0.01575800",       // Low
                "0.01577100",       // Close
                "148976.11427815",  // Volume
                1499644799999,      // Close time
                "2434.19055334",    // Quote asset volume
                308,                // Number of trades
                "1756.87402397",    // Taker buy base asset volume
                "28.46694368",      // Taker buy quote asset volume
                "17928899.62484339" // Ignore.
            ]
        ]
        */
        return result.data;
    }
    catch (err) {
        return { errorCode: -1001, data: err.message };
    }   
};


// Get the current average price (public)
primitives.getAvgPrice = async function({ symbol }) {
    
    if (!symbol) return { errorCode: -2, data: `Symbol required.` };

    let endpoint = `/api/v3/avgPrice?symbol=${symbol}`;

    // console.log(`${binanceBaseUrl}${endpoint}`);

    try {
        const result = await axios.get(`${binanceBaseUrl}${endpoint}`, {});

        // Expected Response
        /*
        {
            "mins": 5,
            "price": "9.35751834"
        }
        */
        return result.data;
    }
    catch (err) {
        return { errorCode: -1001, data: err.message };
    }   
};


// Get 24hr ticker price change statistics (24 hour rolling window of price change statistics)
primitives.getTicker24hrPrice = async function({ symbols }) {

    // accepted formats:
    // 'https://api.binance.com/api/v3/ticker/24hr?symbols=[BTCUSDT,BNBUSDT]
    // 'https://api.binance.com/api/v3/ticker/24hr?symbols=%5B%22BTCUSDT%22,%22BNBUSDT%22%5D
    
    if (!symbols) return { errorCode: -2, data: `Symbols required.` };

    let endpoint = `/api/v3/ticker/24hr?symbols=${symbols}`;

    // console.log(`${binanceBaseUrl}${endpoint}`);

    try {
        const result = await axios.get(`${binanceBaseUrl}${endpoint}`, {});

        // Expected Response
        /*
        [
            {
                "symbol": "BNBBTC",
                "priceChange": "-94.99999800",
                "priceChangePercent": "-95.960",
                "weightedAvgPrice": "0.29628482",
                "prevClosePrice": "0.10002000",
                "lastPrice": "4.00000200",
                "lastQty": "200.00000000",
                "bidPrice": "4.00000000",
                "bidQty": "100.00000000",
                "askPrice": "4.00000200",
                "askQty": "100.00000000",
                "openPrice": "99.00000000",
                "highPrice": "100.00000000",
                "lowPrice": "0.10000000",
                "volume": "8913.30000000",
                "quoteVolume": "15.30000000",
                "openTime": 1499783499040,
                "closeTime": 1499869899040,
                "firstId": 28385,   // First tradeId
                "lastId": 28460,    // Last tradeId
                "count": 76         // Trade count
            }
        ]
        */
        return result.data;
    }
    catch (err) {
        return { errorCode: -1001, data: err.message };
    }   
};


// Symbol price ticker - Latest price for a symbol or symbols. (public)
primitives.getTickerPrice = async function({ symbols }) {
    
    if (!symbols) return { errorCode: -2, data: `Symbols required.` };

    let endpoint = `/api/v3/ticker/price?symbols=${symbols}`;

    // console.log(`${binanceBaseUrl}${endpoint}`);

    try {
        const result = await axios.get(`${binanceBaseUrl}${endpoint}`, {});

        // Expected Response
        /*
        [
            {
                "symbol": "LTCBTC",
                "price": "4.00000200"
            },
            {
                "symbol": "ETHBTC",
                "price": "0.07946600"
            }
        ]
        */
        return result.data;
    }
    catch (err) {
        return { errorCode: -1001, data: err.message };
    }   
};


// Symbol price ticker - Latest price for a symbol or symbols. (public)
primitives.getOrderBookTickerPrice = async function({ symbols }) {
    
    if (!symbols) return { errorCode: -2, data: `Symbols required.` };

    let endpoint = `/api/v3/ticker/bookTicker?symbols=${symbols}`;

    // console.log(`${binanceBaseUrl}${endpoint}`);

    try {
        const result = await axios.get(`${binanceBaseUrl}${endpoint}`, {});

        // Expected Response
        /*
        [
            {
                "symbol": "LTCBTC",
                "bidPrice": "4.00000000",
                "bidQty": "431.00000000",
                "askPrice": "4.00000200",
                "askQty": "9.00000000"
            },
            {
                "symbol": "ETHBTC",
                "bidPrice": "0.07946700",
                "bidQty": "9.00000000",
                "askPrice": "100000.00000000",
                "askQty": "1000.00000000"
            }
        ]
        */
        return result.data;
    }
    catch (err) {
        return { errorCode: -1001, data: err.message };
    }   
};

// Rolling window price change statistics
// Note: This endpoint is different from the GET /api/v3/ticker/24hr endpoint.
//   - The window used to compute statistics will be no more than 59999ms from the requested windowSize.
//   - openTime for /api/v3/ticker always starts on a minute, while the closeTime is the current time 
//     of the request. As such, the effective window will be up to 59999ms wider than windowSize.
//   - E.g. If the closeTime is 1641287867099 (January 04, 2022 09:17:47:099 UTC), and the 
//          windowSize is 1d. the openTime will be: 1641201420000 (January 3, 2022, 09:17:00)
primitives.getRollingWindowPriceChange = async function({ symbols, windowSize }) {

    // accepted formats:
    // 'https://api.binance.com/api/v3/ticker/24hr?symbols=[BTCUSDT,BNBUSDT]
    // 'https://api.binance.com/api/v3/ticker/24hr?symbols=%5B%22BTCUSDT%22,%22BNBUSDT%22%5D
    
    if (!symbols) return { errorCode: -2, data: `Symbols required.` };

    // supported values: 1m, 2m, ..., 59m, 1h, 2h, ..., 23h, 1d, ..., 7d
    if (!windowSize) windowSize = '1d';

    let endpoint = `/api/v3/ticker?symbols=${symbols}&windowSize=${windowSize}`;

    // console.log(`${binanceBaseUrl}${endpoint}`);

    try {
        const result = await axios.get(`${binanceBaseUrl}${endpoint}`, {});

        // Expected Response
        /*
        [
            {
                "symbol": "BTCUSDT",
                "priceChange": "-154.13000000",
                "priceChangePercent": "-0.740",
                "weightedAvgPrice": "20677.46305250",
                "openPrice": "20825.27000000",
                "highPrice": "20972.46000000",
                "lowPrice": "20327.92000000",
                "lastPrice": "20671.14000000",
                "volume": "72.65112300",
                "quoteVolume": "1502240.91155513",
                "openTime": 1655432400000,
                "closeTime": 1655446835460,
                "firstId": 11147809,
                "lastId": 11149775,
                "count": 1967
            },
            {
                "symbol": "BNBBTC",
                "priceChange": "0.00008530",
                "priceChangePercent": "0.823",
                "weightedAvgPrice": "0.01043129",
                "openPrice": "0.01036170",
                "highPrice": "0.01049850",
                "lowPrice": "0.01033870",
                "lastPrice": "0.01044700",
                "volume": "166.67000000",
                "quoteVolume": "1.73858301",
                "openTime": 1655432400000,
                "closeTime": 1655446835460,
                "firstId": 2351674,
                "lastId": 2352034,
                "count": 361
            }
        ]
        */
        return result.data;
    }
    catch (err) {
        return { errorCode: -1001, data: err.message };
    }   
};


/*****************************/
/***** ACCOUNT ENDPOINTS *****/
/*****************************/

// Get Account Information (TRADE)
// url: GET /api/v3/account  (HMAC SHA256)
primitives.getAccountInfo = async function(orderData) { // orderData not needed but included anyway

    let params = {
        recvWindow: 5000,
        timestamp: new Date().getTime(),
    }

    // generate hmac signature
    params['signature'] = generateHmacSignature(binance_secret, params);

    let endpoint = `/api/v3/account`;

    // console.log(`${binanceBaseUrl}${endpoint}`);

    try {
        const result = await axios.get(`${binanceBaseUrl}${endpoint}`, {
            headers: { "X-MBX-APIKEY": binance_apikey }, 
            params
        });

        // Expected Response
        /*
        {
            "makerCommission": 15,
            "takerCommission": 15,
            "buyerCommission": 0,
            "sellerCommission": 0,
            "canTrade": true,
            "canWithdraw": true,
            "canDeposit": true,
            "updateTime": 123456789,
            "accountType": "SPOT",
            "balances": [
                {
                "asset": "BTC",
                "free": "4723846.89208129",
                "locked": "0.00000000"
                },
                {
                "asset": "LTC",
                "free": "4763368.68006011",
                "locked": "0.00000000"
                }
            ],
                "permissions": [
                "SPOT"
            ]
        }
        */
        return result.data;
    }
    catch (err) {
        return { errorCode: -1001, data: err };
    }   
};


// Create a New order (TRADE)
// url: POST /api/v3/order  (HMAC SHA256)
primitives.createOrder = async function(orderData) {

    let params = {
        recvWindow: orderData.recvWindow,
        timestamp: new Date().getTime(),
        symbol: orderData.symbol,
        side: orderData.side,
        type: orderData.type
    }

    switch(orderData.type) {
        case 'MARKET':
            // the amount of the base asset the user wants to buy or sell
            if (orderData.size) {
                params['quantity'] = orderData.size;  
            }
            // the amount the user wants to spend (when buying) or receive (when selling) the quote 
            // asset; the correct quantity will be determined based on the market liquidity and quoteOrderQty
            else if (orderData.funds) {
                params['quoteOrderQty'] = orderData.funds; 
            }
            break;

        case 'LIMIT':
            params['quantity']    = orderData.size;
            params['price']       = orderData.price;
            params['timeInForce'] = 'GTC'; // GTC (Good Till Cancelled), IOC (Immediate Or Cancel), FOK (Fill or Kill)
            break;

        // This will execute a MARKET order when the conditions are met. (e.g. stopPrice is met 
        // or trailingDelta is activated)
        case 'STOP_LOSS':
            // params['quantity']      = xxx;
            // params['stopPrice ']    = xxx;
            // params['trailingDelta'] = xxx;
            break;

        case 'STOP_LOSS_LIMIT':
            // params['quantity']      = xxx;
            // params['price ']        = xxx;
            // params['stopPrice ']    = xxx;
            // params['timeInForce ']  = xxx;
            // params['trailingDelta'] = xxx;
            break;

        // This will execute a MARKET order when the conditions are met. (e.g. stopPrice 
        // is met or trailingDelta is activated)
        case 'TAKE_PROFIT':
            // params['quantity']      = xxx;
            // params['stopPrice ']    = xxx;
            // params['trailingDelta'] = xxx;
            break;

        case 'TAKE_PROFIT_LIMIT':
            // params['quantity']      = xxx;
            // params['price ']        = xxx;
            // params['stopPrice ']    = xxx;
            // params['timeInForce ']  = xxx;
            // params['trailingDelta'] = xxx;
            break;

        // This is a LIMIT order that will be rejected if the order immediately matches
        // and trades as a taker - also known as a POST-ONLY order.
        case 'LIMIT_MAKER':                      
            // params['quantity']      = xxx;
            // params['price ']        = xxx;
            break;
    }

    // generate hmac signature
    params['signature'] = generateHmacSignature(binance_secret, params);

    // console.log('params:', params);

    // let endpoint = `/api/v3/order`;

    // try {
    //     // object to 'form-urlencoded' i.e. 'recvWindow=5000&timestamp=1657449660591&symbol=BTCBUSD&...'
    //     // previously used 'querystring.stringify(params)' but it is deprecated, so using URLSearchParms now
    //     const data = new URLSearchParams(params).toString();  

    //     // send to binance order endpoint
    //     const result = await axios.post(`${binanceBaseUrl}${endpoint}`, data, {
    //         headers: { 
    //             "Content-Type": "application/x-www-form-urlencoded",
    //             "X-MBX-APIKEY": binance_apikey 
    //         }
    //     });

    //     // Expected Response
    //     /*
    //     // Response ACK
    //     {
    //         "symbol": "BTCUSDT",
    //         "orderId": 28,
    //         "orderListId": -1, //Unless OCO, value will be -1
    //         "clientOrderId": "6gCrw2kRUAF9CvJDGP16IP",
    //         "transactTime": 1507725176595
    //     }

    //     // Response RESULT
    //     {
    //         "symbol": "BTCUSDT",
    //         "orderId": 28,
    //         "orderListId": -1, //Unless OCO, value will be -1
    //         "clientOrderId": "6gCrw2kRUAF9CvJDGP16IP",
    //         "transactTime": 1507725176595,
    //         "price": "0.00000000",
    //         "origQty": "10.00000000",
    //         "executedQty": "10.00000000",
    //         "cummulativeQuoteQty": "10.00000000",
    //         "status": "FILLED",
    //         "timeInForce": "GTC",
    //         "type": "MARKET",
    //         "side": "SELL"
    //     }

    //     // Response FULL:
    //     {
    //         "symbol": "BTCUSDT",
    //         "orderId": 28,
    //         "orderListId": -1, //Unless OCO, value will be -1
    //         "clientOrderId": "6gCrw2kRUAF9CvJDGP16IP",
    //         "transactTime": 1507725176595,
    //         "price": "0.00000000",
    //         "origQty": "10.00000000",
    //         "executedQty": "10.00000000",
    //         "cummulativeQuoteQty": "10.00000000",
    //         "status": "FILLED",
    //         "timeInForce": "GTC",
    //         "type": "MARKET",
    //         "side": "SELL",
    //         "fills": [
    //             {
    //                 "price": "4000.00000000",
    //                 "qty": "1.00000000",
    //                 "commission": "4.00000000",
    //                 "commissionAsset": "USDT",
    //                 "tradeId": 56
    //             },
    //             {
    //                 "price": "3999.00000000",
    //                 "qty": "5.00000000",
    //                 "commission": "19.99500000",
    //                 "commissionAsset": "USDT",
    //                 "tradeId": 57
    //             },
    //             {
    //                 "price": "3998.00000000",
    //                 "qty": "2.00000000",
    //                 "commission": "7.99600000",
    //                 "commissionAsset": "USDT",
    //                 "tradeId": 58
    //             },
    //             {
    //                 "price": "3997.00000000",
    //                 "qty": "1.00000000",
    //                 "commission": "3.99700000",
    //                 "commissionAsset": "USDT",
    //                 "tradeId": 59
    //             },
    //             {
    //                 "price": "3995.00000000",
    //                 "qty": "1.00000000",
    //                 "commission": "3.99500000",
    //                 "commissionAsset": "USDT",
    //                 "tradeId": 60
    //             }
    //         ]
    //     }
    //     */

    //     return result.data;
    // }
    // catch (err) {
    //     console.log(err);
    //     return { errorCode: -1001, data: err.message };
    // }   

    return {
        data:         {
            "symbol": "TEST_ETHBUSD",
            "orderId": 31,
            "orderListId": -1, //Unless OCO, value will be -1
            "clientOrderId": "6gCrw2kRUAF9CvJDGP16IP",
            "transactTime": 1507725176595,
            "price": "0.00000000",
            "origQty": "10.00000000",
            "executedQty": "10.00000000",
            "cummulativeQuoteQty": "10.00000000",
            "status": "NEW",
            "timeInForce": "GTC",
            "type": "LIMIT",
            "side": "BUY"
        }
    }
};


// Test new order (TRADE)
// url: POST /api/v3/order  (HMAC SHA256)
primitives.createTestOrder = async function(orderData) {

    let params = {
        recvWindow: orderData.recvWindow,
        timestamp: new Date().getTime(),
        symbol: orderData.symbol,
        side: orderData.side,
        type: orderData.type
    }

    switch(orderData.type) {
        case 'MARKET':
            console.log('market')
            if (orderData.size) {
                params['quantity'] = orderData.size;  
            }
            else if (orderData.funds) {
                params['quoteOrderQty'] = orderData.funds; 
            }
            break;

        case 'LIMIT':
            params['quantity']    = orderData.size;
            params['price']       = orderData.price;
            params['timeInForce'] = 'GTC'; // GTC (Good Till Cancelled), IOC (Immediate Or Cancel), FOK (Fill or Kill)
            break;

        case 'STOP_LOSS':
            // params['quantity']      = xxx;
            // params['stopPrice ']    = xxx;
            // params['trailingDelta'] = xxx;
            break;

        case 'STOP_LOSS_LIMIT':
            // params['quantity']      = xxx;
            // params['price ']        = xxx;
            // params['stopPrice ']    = xxx;
            // params['timeInForce ']  = xxx;
            // params['trailingDelta'] = xxx;
            break;

        case 'TAKE_PROFIT':
            // params['quantity']      = xxx;
            // params['stopPrice ']    = xxx;
            // params['trailingDelta'] = xxx;
            break;

        case 'TAKE_PROFIT_LIMIT':
            // params['quantity']      = xxx;
            // params['price ']        = xxx;
            // params['stopPrice ']    = xxx;
            // params['timeInForce ']  = xxx;
            // params['trailingDelta'] = xxx;
            break;

        case 'LIMIT_MAKER':                      
            // params['quantity']      = xxx;
            // params['price ']        = xxx;
            break;
    }

    // generate hmac signature
    params['signature'] = generateHmacSignature(binance_secret, params);

    let endpoint = `${binanceBaseUrl}/api/v3/order/test`;

    try {
        const result = await axios.post(`${binanceBaseUrl}${endpoint}`, {
            headers: { "X-MBX-APIKEY": binance_apikey }, 
            params
        });

        // Expected Response
        /*
        {}
        */
        return result.data;
    }
    catch (err) {
        return { errorCode: -1001, data: err.message };
    }   
};


// Get All Orders (USER_DATA) - Get all account orders; active, canceled, or filled.
// url: /api/v3/allOrders (HMAC SHA256)
// params: orderId, symbol, recvWindow, timestamp, startTime, endTime, limit
// - If orderId is set, it will get orders >= that orderId. Otherwise most recent orders are returned.
// - If startTime and/or endTime provided, orderId is not required.
primitives.getAllOrders = async function(orderData) {

    let params = {
        recvWindow: orderData.recvWindow,
        timestamp: new Date().getTime(),
        symbol: orderData.symbol,
        limit: orderData.limit
    }

    if (orderData.orderId) {
        params['orderId'] = orderData.orderId;
    }
    // else {
    //     if (orderData.startTime) {
    //         params['startTime'] = orderData.startTime;
    //     }
    //     if (orderData.endTime) {
    //         params['endTime'] = orderData.endTime;
    //     }
    // }

    // console.log('params:', params)

    // generate hmac signature
    params['signature'] = generateHmacSignature(binance_secret, params);

    let endpoint = `/api/v3/allOrders`;

    try {
        const result = await axios.get(`${binanceBaseUrl}${endpoint}`, {
            headers: { "X-MBX-APIKEY": binance_apikey }, 
            params
        });

        // Expected Response
        /*
        [
            {
                "symbol": "LTCBTC",
                "orderId": 1,
                "orderListId": -1, //Unless OCO, the value will always be -1
                "clientOrderId": "myOrder1",
                "price": "0.1",
                "origQty": "1.0",
                "executedQty": "0.0",
                "cummulativeQuoteQty": "0.0",
                "status": "NEW",
                "timeInForce": "GTC",
                "type": "LIMIT",
                "side": "BUY",
                "stopPrice": "0.0",
                "icebergQty": "0.0",
                "time": 1499827319559,
                "updateTime": 1499827319559,
                "isWorking": true,
                "origQuoteOrderQty": "0.000000"
            }
        ]
        */
        return result.data;
    }
    catch (err) {
        return { errorCode: -1001, data: err };
    }   
};


// Get Current open orders (USER_DATA)
// url: /api/v3/openOrders  (HMAC SHA256)
// params: symbol, recvWindow, timestamp
primitives.getOpenOrders = async function(orderData) {

    let params = {
        recvWindow: orderData.recvWindow,
        timestamp: new Date().getTime()
    }

    if (orderData.symbol)   // if symbol is included
        params['symbol'] = orderData.symbol;

    // generate hmac signature
    params['signature'] = generateHmacSignature(binance_secret, params);

    let endpoint = `/api/v3/openOrders`;

    try {
        const result = await axios.get(`${binanceBaseUrl}${endpoint}`, {
            headers: { "X-MBX-APIKEY": binance_apikey }, 
            params
        });

        // Expected Response
        /*
        [
            {
                "symbol": "LTCBTC",
                "orderId": 1,
                "orderListId": -1, //Unless OCO, the value will always be -1
                "clientOrderId": "myOrder1",
                "price": "0.1",
                "origQty": "1.0",
                "executedQty": "0.0",
                "cummulativeQuoteQty": "0.0",
                "status": "NEW",
                "timeInForce": "GTC",
                "type": "LIMIT",
                "side": "BUY",
                "stopPrice": "0.0",
                "icebergQty": "0.0",
                "time": 1499827319559,
                "updateTime": 1499827319559,
                "isWorking": true,
                "origQuoteOrderQty": "0.000000"
            }
        ]
        */
        return result.data;
    }
    catch (err) {
        return { errorCode: -1001, data: err.message };
    }   
};


// Query Order Status (USER_DATA)
// url: GET /api/v3/order  (HMAC SHA256)
// params: symbol, orderId, origClientOrderId, recvWindow, timestamp
primitives.getOrderStatus = async function(orderData) {

    // status: "NEW", "PARTIALLY_FILLED", "FILLED", "CANCELED", "REJECTED", "EXPIRED"

    let params = {
        recvWindow: orderData.recvWindow,
        timestamp: new Date().getTime(),
        symbol: orderData.symbol,
    }

    if (orderData.orderId) {
        params.orderId = orderData.orderId;
    }
    else if (orderData.origClientOrderId) {
        params['origClientOrderId'] = orderData.origClientOrderId;
    }

    // console.log('params:', params);

    // generate hmac signature
    params['signature'] = generateHmacSignature(binance_secret, params);

    let endpoint = `/api/v3/order`;

    try {
        const result = await axios.get(`${binanceBaseUrl}${endpoint}`, {
            headers: { "X-MBX-APIKEY": binance_apikey }, 
            params
        });

        // Expected Response
        /*
        {
            "symbol": "LTCBTC",
            "orderId": 1,
            "orderListId": -1 //Unless part of an OCO, the value will always be -1.
            "clientOrderId": "myOrder1",
            "price": "0.1",
            "origQty": "1.0",
            "executedQty": "0.0",
            "cummulativeQuoteQty": "0.0",
            "status": "NEW",
            "timeInForce": "GTC",
            "type": "LIMIT",
            "side": "BUY",
            "stopPrice": "0.0",
            "icebergQty": "0.0",
            "time": 1499827319559,
            "updateTime": 1499827319559,
            "isWorking": true,
            "origQuoteOrderQty": "0.000000"
        }
        */
        return result.data;
    }
    catch (err) {
        return { errorCode: -1001, data: err.message };
    }   
};

// Cancel order (TRADE) - Cancel an active order.
// url: DELETE /api/v3/order  (HMAC SHA256)
// params: symbol, orderId, origClientOrderId, newClientOrderId, recvWindow, timestamp
primitives.cancelOrder = async function(orderData) {

    let params = {
        recvWindow: orderData.recvWindow,
        timestamp: new Date().getTime(),
        symbol: orderData.symbol,
    }

    if (orderData.orderId) {
        params['orderId'] = orderData.orderId;
    }
    else if (orderData.origClientOrderId) {
        params['origClientOrderId'] = orderData.origClientOrderId;
    }

    // generate hmac signature
    params['signature'] = generateHmacSignature(binance_secret, params);

    // console.log('params:', params);

    let endpoint = `/api/v3/order`;

    try {
        const result = await axios.delete(`${binanceBaseUrl}${endpoint}`, {
            headers: { "X-MBX-APIKEY": binance_apikey }, 
            params
        });

        // Expected Response
        /*
        {
            "symbol": "LTCBTC",
            "origClientOrderId": "myOrder1",
            "orderId": 4,
            "orderListId": -1, //Unless part of an OCO, the value will always be -1.
            "clientOrderId": "cancelMyOrder1",
            "price": "2.00000000",
            "origQty": "1.00000000",
            "executedQty": "0.00000000",
            "cummulativeQuoteQty": "0.00000000",
            "status": "CANCELED",
            "timeInForce": "GTC",
            "type": "LIMIT",
            "side": "BUY"
        }
        */

        return result.data;
    }
    catch (err) {
        console.log(err);
        return { errorCode: -1001, data: err.message };
    }   
};


// Cancel all Open Orders on a Symbol (TRADE) - This includes OCO orders.
// url: DELETE /api/v3/openOrders  (HMAC SHA256)
// params: symbol, orderId, origClientOrderId, newClientOrderId, recvWindow, timestamp
primitives.cancelOpenOrders = async function(orderData) {

    let params = {
        recvWindow: orderData.recvWindow,
        timestamp: new Date().getTime(),
        symbol: orderData.symbol,
    }

    // generate hmac signature
    params['signature'] = generateHmacSignature(binance_secret, params);

    let endpoint = `/api/v3/openOrders`;

    try {
        const result = await axios.delete(`${binanceBaseUrl}${endpoint}`, {
            headers: { "X-MBX-APIKEY": binance_apikey }, 
            params
        });

        // Expected Response
        /*
        [
            {
                "symbol": "BTCUSDT",
                "origClientOrderId": "E6APeyTJvkMvLMYMqu1KQ4",
                "orderId": 11,
                "orderListId": -1,
                "clientOrderId": "pXLV6Hz6mprAcVYpVMTGgx",
                "price": "0.089853",
                "origQty": "0.178622",
                "executedQty": "0.000000",
                "cummulativeQuoteQty": "0.000000",
                "status": "CANCELED",
                "timeInForce": "GTC",
                "type": "LIMIT",
                "side": "BUY"
            },
            {
                "symbol": "BTCUSDT",
                "origClientOrderId": "A3EF2HCwxgZPFMrfwbgrhv",
                "orderId": 13,
                "orderListId": -1,
                "clientOrderId": "pXLV6Hz6mprAcVYpVMTGgx",
                "price": "0.090430",
                "origQty": "0.178622",
                "executedQty": "0.000000",
                "cummulativeQuoteQty": "0.000000",
                "status": "CANCELED",
                "timeInForce": "GTC",
                "type": "LIMIT",
                "side": "BUY"
            },
            {
                "orderListId": 1929,
                "contingencyType": "OCO",
                "listStatusType": "ALL_DONE",
                "listOrderStatus": "ALL_DONE",
                "listClientOrderId": "2inzWQdDvZLHbbAmAozX2N",
                "transactionTime": 1585230948299,
                "symbol": "BTCUSDT",
                "orders": [
                {
                    "symbol": "BTCUSDT",
                    "orderId": 20,
                    "clientOrderId": "CwOOIPHSmYywx6jZX77TdL"
                },
                {
                    "symbol": "BTCUSDT",
                    "orderId": 21,
                    "clientOrderId": "461cPg51vQjV3zIMOXNz39"
                }
                ],
                "orderReports": [
                {
                    "symbol": "BTCUSDT",
                    "origClientOrderId": "CwOOIPHSmYywx6jZX77TdL",
                    "orderId": 20,
                    "orderListId": 1929,
                    "clientOrderId": "pXLV6Hz6mprAcVYpVMTGgx",
                    "price": "0.668611",
                    "origQty": "0.690354",
                    "executedQty": "0.000000",
                    "cummulativeQuoteQty": "0.000000",
                    "status": "CANCELED",
                    "timeInForce": "GTC",
                    "type": "STOP_LOSS_LIMIT",
                    "side": "BUY",
                    "stopPrice": "0.378131",
                    "icebergQty": "0.017083"
                },
                {
                    "symbol": "BTCUSDT",
                    "origClientOrderId": "461cPg51vQjV3zIMOXNz39",
                    "orderId": 21,
                    "orderListId": 1929,
                    "clientOrderId": "pXLV6Hz6mprAcVYpVMTGgx",
                    "price": "0.008791",
                    "origQty": "0.690354",
                    "executedQty": "0.000000",
                    "cummulativeQuoteQty": "0.000000",
                    "status": "CANCELED",
                    "timeInForce": "GTC",
                    "type": "LIMIT_MAKER",
                    "side": "BUY",
                    "icebergQty": "0.639962"
                }
                ]
            }
        ]
        */
        return result.data;
    }
    catch (err) {
        return { errorCode: -1001, data: err.message };
    }   
};


// Cancel an Existing Order and Send a New Order (TRADE)
// url: POST /api/v3/cancelReplace  (HMAC SHA256)
primitives.cancelReplaceOrder = async function(orderData) {

    let params = {
        recvWindow: orderData.recvWindow,
        timestamp: new Date().getTime(),
        symbol: orderData.symbol,
        side: orderData.side,
        type: orderData.type,
        cancelOrderId: orderData.cancelOrderId,
        cancelOrigClientOrderId: orderData.cancelOrigClientOrderId,
        cancelReplaceMode: 'STOP_ON_FAILURE ',  // can be 'STOP_ON_FAILURE' or 'ALLOW_FAILURES'
    }

    switch(orderData.type) {
        case 'MARKET':
            console.log('market')
            if (orderData.size) {
                params['quantity'] = orderData.size;  
            }
            else if (orderData.funds) {
                params['quoteOrderQty'] = orderData.funds; 
            }
            break;

        case 'LIMIT':
            params['quantity']    = orderData.size;
            params['price']       = orderData.price;
            params['timeInForce'] = 'GTC'; // GTC (Good Till Cancelled), IOC (Immediate Or Cancel), FOK (Fill or Kill)
            break;

        case 'STOP_LOSS':
            // params['quantity']      = xxx;
            // params['stopPrice ']    = xxx;
            // params['trailingDelta'] = xxx;
            break;

        case 'STOP_LOSS_LIMIT':
            // params['quantity']      = xxx;
            // params['price ']        = xxx;
            // params['stopPrice ']    = xxx;
            // params['timeInForce ']  = xxx;
            // params['trailingDelta'] = xxx;
            break;

        case 'TAKE_PROFIT':
            // params['quantity']      = xxx;
            // params['stopPrice ']    = xxx;
            // params['trailingDelta'] = xxx;
            break;

        case 'TAKE_PROFIT_LIMIT':
            // params['quantity']      = xxx;
            // params['price ']        = xxx;
            // params['stopPrice ']    = xxx;
            // params['timeInForce ']  = xxx;
            // params['trailingDelta'] = xxx;
            break;

        case 'LIMIT_MAKER':                      
            // params['quantity']      = xxx;
            // params['price ']        = xxx;
            break;
    }

    // generate hmac signature
    params['signature'] = generateHmacSignature(binance_secret, params);

    let endpoint = `/api/v3/order/cancelReplace`;

    try {
        const result = await axios.post(`${binanceBaseUrl}${endpoint}`, {
            headers: { "X-MBX-APIKEY": binance_apikey }, 
            params
        });

        // Expected Response
        /*
        // Response SUCCESS:
        // Both the cancel order placement and new order placement succeeded.
        {
            "cancelResult": "SUCCESS",
            "newOrderResult": "SUCCESS",
            "cancelResponse": {
                "symbol": "BTCUSDT",
                "origClientOrderId": "DnLo3vTAQcjha43lAZhZ0y",
                "orderId": 9,
                "orderListId": -1,
                "clientOrderId": "osxN3JXAtJvKvCqGeMWMVR",
                "price": "0.01000000",
                "origQty": "0.000100",
                "executedQty": "0.00000000",
                "cummulativeQuoteQty": "0.00000000",
                "status": "CANCELED",
                "timeInForce": "GTC",
                "type": "LIMIT",
                "side": "SELL"
            },
            "newOrderResponse": {
                "symbol": "BTCUSDT",
                "orderId": 10,
                "orderListId": -1,
                "clientOrderId": "wOceeeOzNORyLiQfw7jd8S",
                "transactTime": 1652928801803,
                "price": "0.02000000",
                "origQty": "0.040000",
                "executedQty": "0.00000000",
                "cummulativeQuoteQty": "0.00000000",
                "status": "NEW",
                "timeInForce": "GTC",
                "type": "LIMIT",
                "side": "BUY",
                "fills": []
            }
        }

        // Response when Cancel Order Fails with STOP_ON FAILURE:
        {
            "code": -2022,
            "msg": "Order cancel-replace failed.",
            "data": {
                "cancelResult": "FAILURE",
                "newOrderResult": "NOT_ATTEMPTED",
                "cancelResponse": {
                    "code": -2011,
                    "msg": "Unknown order sent."
                },
                "newOrderResponse": null
            }
        }

        // Response when Cancel Order Succeeds but New Order Placement Fails:
        {
            "code": -2021,
            "msg": "Order cancel-replace partially failed.",
            "data": {
                "cancelResult": "SUCCESS",
                "newOrderResult": "FAILURE",
                "cancelResponse": {
                "symbol": "BTCUSDT",
                "origClientOrderId": "86M8erehfExV8z2RC8Zo8k",
                "orderId": 3,
                "orderListId": -1,
                "clientOrderId": "G1kLo6aDv2KGNTFcjfTSFq",
                "price": "0.006123",
                "origQty": "10000.000000",
                "executedQty": "0.000000",
                "cummulativeQuoteQty": "0.000000",
                "status": "CANCELED",
                "timeInForce": "GTC",
                "type": "LIMIT_MAKER",
                "side": "SELL"
                },
                "newOrderResponse": {
                "code": -2010,
                "msg": "Order would immediately match and take."
                }
            }
        }

        // Response when Cancel Order fails with ALLOW_FAILURE:
        {
            "code": -2021,
            "msg": "Order cancel-replace partially failed.",
            "data": {
                    "cancelResult": "FAILURE",
                    "newOrderResult": "SUCCESS",
                    "cancelResponse": {
                    "code": -2011,
                    "msg": "Unknown order sent."
                },
                "newOrderResponse": {
                    "symbol": "BTCUSDT",
                    "orderId": 11,
                    "orderListId": -1,
                    "clientOrderId": "pfojJMg6IMNDKuJqDxvoxN",
                    "transactTime": 1648540168818
                }
            }
        }

        // Response when both Cancel Order and New Order Placement fail:
        {
            "code": -2022,
            "msg": "Order cancel-replace failed.",
            "data": {
                    "cancelResult": "FAILURE",
                    "newOrderResult": "FAILURE",
                    "cancelResponse": {
                    "code": -2011,
                    "msg": "Unknown order sent."
                },
                "newOrderResponse": {
                    "code": -2010,
                    "msg": "Order would immediately match and take."
                }
            }
        }

        */
        return result.data;
    }
    catch (err) {
        return { errorCode: -1001, data: err.message };
    }   
};


// Account trade list (USER_DATA)
// url: GET /api/v3/myTrades  (HMAC SHA256)
// params: orderId, symbol, recvWindow, timestamp, startTime, endTime, fromId, limit
// - If fromId is set, it will get trades >= that fromId. Otherwise most recent trades are returned.
primitives.getMyTrades = async function(orderData) {

    let params = {
        recvWindow: orderData.recvWindow,
        timestamp: new Date().getTime(),
        symbol: orderData.symbol,
        limit: orderData.limit
    }

    if (orderData.orderId) {
        params['orderId'] = orderData.orderId;
    }
    // else {
    //     if (orderData.startTime) {
    //         params['startTime'] = orderData.startTime;
    //     }
    //     if (orderData.endTime) {
    //         params['endTime'] = orderData.endTime;
    //     }
    // }

    // generate hmac signature
    params['signature'] = generateHmacSignature(binance_secret, params);

    let endpoint = `/api/v3/myTrades`;

    try {
        const result = await axios.get(`${binanceBaseUrl}${endpoint}`, {
            headers: { "X-MBX-APIKEY": binance_apikey }, 
            params
        });

        // Expected Response
        /*
        [
            {
                "symbol": "LTCBTC",
                "orderId": 1,
                "orderListId": -1, //Unless OCO, the value will always be -1
                "clientOrderId": "myOrder1",
                "price": "0.1",
                "origQty": "1.0",
                "executedQty": "0.0",
                "cummulativeQuoteQty": "0.0",
                "status": "NEW",
                "timeInForce": "GTC",
                "type": "LIMIT",
                "side": "BUY",
                "stopPrice": "0.0",
                "icebergQty": "0.0",
                "time": 1499827319559,
                "updateTime": 1499827319559,
                "isWorking": true,
                "origQuoteOrderQty": "0.000000"
            }
        ]
        */
        return result.data;
    }
    catch (err) {
        return { errorCode: -1001, data: err.message };
    }   
};



// New OCO (TRADE) - (OCO: One Cancels the Other)
// url: /api/v3/order/oco (HMAC SHA256)
primitives.createOcoOrder = async function(orderData) {

    let params = {
        recvWindow: orderData.recvWindow,
        timestamp: new Date().getTime(),
        symbol: orderData.symbol,
        side: orderData.side,
        quantity: orderData.size,
        price: orderData.price,
        stopPrice: orderData.stopPrice
    }

    // generate hmac signature
    params['signature'] = generateHmacSignature(binance_secret, params);

    let endpoint = `/api/v3/order/oco`;

    try {
        const result = await axios.post(`${binanceBaseUrl}${endpoint}`, {
            headers: { "X-MBX-APIKEY": binance_apikey }, 
            params
        });

        // Expected Response
        /*
        {
            "orderListId": 0,
            "contingencyType": "OCO",
            "listStatusType": "EXEC_STARTED",
            "listOrderStatus": "EXECUTING",
            "listClientOrderId": "JYVpp3F0f5CAG15DhtrqLp",
            "transactionTime": 1563417480525,
            "symbol": "LTCBTC",
            "orders": [
                {
                "symbol": "LTCBTC",
                "orderId": 2,
                "clientOrderId": "Kk7sqHb9J6mJWTMDVW7Vos"
                },
                {
                "symbol": "LTCBTC",
                "orderId": 3,
                "clientOrderId": "xTXKaGYd4bluPVp78IVRvl"
                }
            ],
            "orderReports": [
                {
                "symbol": "LTCBTC",
                "orderId": 2,
                "orderListId": 0,
                "clientOrderId": "Kk7sqHb9J6mJWTMDVW7Vos",
                "transactTime": 1563417480525,
                "price": "0.000000",
                "origQty": "0.624363",
                "executedQty": "0.000000",
                "cummulativeQuoteQty": "0.000000",
                "status": "NEW",
                "timeInForce": "GTC",
                "type": "STOP_LOSS",
                "side": "BUY",
                "stopPrice": "0.960664"
                },
                {
                "symbol": "LTCBTC",
                "orderId": 3,
                "orderListId": 0,
                "clientOrderId": "xTXKaGYd4bluPVp78IVRvl",
                "transactTime": 1563417480525,
                "price": "0.036435",
                "origQty": "0.624363",
                "executedQty": "0.000000",
                "cummulativeQuoteQty": "0.000000",
                "status": "NEW",
                "timeInForce": "GTC",
                "type": "LIMIT_MAKER",
                "side": "BUY"
                }
            ]
        }
        */
        return result.data;
    }
    catch (err) {
        return { errorCode: -1001, data: err.message };
    }   
};


// Cancel OCO (TRADE)
// url: /api/v3/orderList (HMAC SHA256)
// params: symbol, orderId, origClientOrderId, newClientOrderId, recvWindow, timestamp
primitives.cancelOcoOrder = async function(orderData) {

    let params = {
        recvWindow: orderData.recvWindow,
        timestamp: new Date().getTime(),
        symbol: orderData.symbol,
    }

    if (orderListId) {
        params['orderListId'] = orderData.orderListId;
    }
    else if (listClientOrderId) {
        params['listClientOrderId'] = orderData.listClientOrderId;
    }

    // generate hmac signature
    params['signature'] = generateHmacSignature(binance_secret, params);

    let endpoint = `/api/v3/orderList`;

    try {
        const result = await axios.delete(`${binanceBaseUrl}${endpoint}`, {
            headers: { "X-MBX-APIKEY": binance_apikey }, 
            params
        });

        // Expected Response
        /*
        {
            "orderListId": 0,
            "contingencyType": "OCO",
            "listStatusType": "ALL_DONE",
            "listOrderStatus": "ALL_DONE",
            "listClientOrderId": "C3wyj4WVEktd7u9aVBRXcN",
            "transactionTime": 1574040868128,
            "symbol": "LTCBTC",
            "orders": [
                {
                "symbol": "LTCBTC",
                "orderId": 2,
                "clientOrderId": "pO9ufTiFGg3nw2fOdgeOXa"
                },
                {
                "symbol": "LTCBTC",
                "orderId": 3,
                "clientOrderId": "TXOvglzXuaubXAaENpaRCB"
                }
            ],
            "orderReports": [
                {
                "symbol": "LTCBTC",
                "origClientOrderId": "pO9ufTiFGg3nw2fOdgeOXa",
                "orderId": 2,
                "orderListId": 0,
                "clientOrderId": "unfWT8ig8i0uj6lPuYLez6",
                "price": "1.00000000",
                "origQty": "10.00000000",
                "executedQty": "0.00000000",
                "cummulativeQuoteQty": "0.00000000",
                "status": "CANCELED",
                "timeInForce": "GTC",
                "type": "STOP_LOSS_LIMIT",
                "side": "SELL",
                "stopPrice": "1.00000000"
                },
                {
                "symbol": "LTCBTC",
                "origClientOrderId": "TXOvglzXuaubXAaENpaRCB",
                "orderId": 3,
                "orderListId": 0,
                "clientOrderId": "unfWT8ig8i0uj6lPuYLez6",
                "price": "3.00000000",
                "origQty": "10.00000000",
                "executedQty": "0.00000000",
                "cummulativeQuoteQty": "0.00000000",
                "status": "CANCELED",
                "timeInForce": "GTC",
                "type": "LIMIT_MAKER",
                "side": "SELL"
                }
            ]
        }
        */
        return result.data;
    }
    catch (err) {
        return { errorCode: -1001, data: err.message };
    }   
};


// Query OCO (USER_DATA)
// url: GET /api/v3/orderList (HMAC SHA256)
// params: orderListId, origClientOrderId, recvWindow, timestamp
primitives.getOcoOrder = async function(orderData) {

    let params = {
        recvWindow: orderData.recvWindow,
        timestamp: new Date().getTime(),
        symbol: orderData.symbol,
    }

    if (orderListId) {
        params['orderListId'] = orderData.orderListId;
    }
    else if (origClientOrderId) {
        params['origClientOrderId'] = orderData.origClientOrderId;
    }

    // generate hmac signature
    params['signature'] = generateHmacSignature(binance_secret, params);

    let endpoint = `/api/v3/orderList`;

    try {
        const result = await axios.get(`${binanceBaseUrl}${endpoint}`, {
            headers: { "X-MBX-APIKEY": binance_apikey }, 
            params
        });

        // Expected Response
        /*
        {
            "orderListId": 27,
            "contingencyType": "OCO",
            "listStatusType": "EXEC_STARTED",
            "listOrderStatus": "EXECUTING",
            "listClientOrderId": "h2USkA5YQpaXHPIrkd96xE",
            "transactionTime": 1565245656253,
            "symbol": "LTCBTC",
            "orders": [
                {
                "symbol": "LTCBTC",
                "orderId": 4,
                "clientOrderId": "qD1gy3kc3Gx0rihm9Y3xwS"
                },
                {
                "symbol": "LTCBTC",
                "orderId": 5,
                "clientOrderId": "ARzZ9I00CPM8i3NhmU9Ega"
                }
            ]
        }
        */
        return result.data;
    }
    catch (err) {
        return { errorCode: -1001, data: err.message };
    }   
};


// Query all OCO (USER_DATA)
// url: /api/v3/allOrderList (HMAC SHA256)
// params: fromId, symbol, recvWindow, timestamp, startTime, endTime, limit
// - If fromId is provided, If supplied, neither startTime or endTime can be provided.
primitives.getAllOcoOrders = async function(orderData) {

    let params = {
        recvWindow: orderData.recvWindow,
        timestamp: new Date().getTime(),
        symbol: orderData.symbol,
        limit: orderData.limit
    }

    if (orderData.orderId) {
        params['orderId'] = orderData.orderId;
    }
    // else {
    //     if (orderData.startTime) {
    //         params['startTime'] = orderData.startTime;
    //     }
    //     if (orderData.endTime) {
    //         params['endTime'] = orderData.endTime;
    //     }
    // }

    // console.log('params:', params)

    // generate hmac signature
    params['signature'] = generateHmacSignature(binance_secret, params);

    let endpoint = `/api/v3/allOrderList`;

    try {
        const result = await axios.get(`${binanceBaseUrl}${endpoint}`, {
            headers: { "X-MBX-APIKEY": binance_apikey }, 
            params
        });

        // Expected Response
        /*
        [
            {
                "orderListId": 29,
                "contingencyType": "OCO",
                "listStatusType": "EXEC_STARTED",
                "listOrderStatus": "EXECUTING",
                "listClientOrderId": "amEEAXryFzFwYF1FeRpUoZ",
                "transactionTime": 1565245913483,
                "symbol": "LTCBTC",
                "orders": [
                {
                    "symbol": "LTCBTC",
                    "orderId": 4,
                    "clientOrderId": "oD7aesZqjEGlZrbtRpy5zB"
                },
                {
                    "symbol": "LTCBTC",
                    "orderId": 5,
                    "clientOrderId": "Jr1h6xirOxgeJOUuYQS7V3"
                }
                ]
            },
            {
                "orderListId": 28,
                "contingencyType": "OCO",
                "listStatusType": "EXEC_STARTED",
                "listOrderStatus": "EXECUTING",
                "listClientOrderId": "hG7hFNxJV6cZy3Ze4AUT4d",
                "transactionTime": 1565245913407,
                "symbol": "LTCBTC",
                "orders": [
                {
                    "symbol": "LTCBTC",
                    "orderId": 2,
                    "clientOrderId": "j6lFOfbmFMRjTYA7rRJ0LP"
                },
                {
                    "symbol": "LTCBTC",
                    "orderId": 3,
                    "clientOrderId": "z0KCjOdditiLS5ekAFtK81"
                }
                ]
            }
        ]
        */
        return result.data;
    }
    catch (err) {
        return { errorCode: -1001, data: err };
    }   

    return "ok";
};


// Query Open OCO (USER_DATA)
// url: /api/v3/openOrderList (HMAC SHA256)
// params: symbol, recvWindow, timestamp
primitives.getOpenOcoOrders = async function(orderData) {

    let params = {
        recvWindow: orderData.recvWindow,
        timestamp: new Date().getTime(),
        symbol: orderData.symbol,
    }

    // generate hmac signature
    params['signature'] = generateHmacSignature(binance_secret, params);

    let endpoint = `/api/v3/openOrderList `;

    try {
        const result = await axios.get(`${binanceBaseUrl}${endpoint}`, {
            headers: { "X-MBX-APIKEY": binance_apikey }, 
            params
        });

        // Expected Response
        /*
        [
            {
                "orderListId": 31,
                "contingencyType": "OCO",
                "listStatusType": "EXEC_STARTED",
                "listOrderStatus": "EXECUTING",
                "listClientOrderId": "wuB13fmulKj3YjdqWEcsnp",
                "transactionTime": 1565246080644,
                "symbol": "LTCBTC",
                "orders": [
                {
                    "symbol": "LTCBTC",
                    "orderId": 4,
                    "clientOrderId": "r3EH2N76dHfLoSZWIUw1bT"
                },
                {
                    "symbol": "LTCBTC",
                    "orderId": 5,
                    "clientOrderId": "Cv1SnyPD3qhqpbjpYEHbd2"
                }
                ]
            }
        ]
        */
        return result.data;
    }
    catch (err) {
        return { errorCode: -1001, data: err.message };
    }   
};

// Query Current Order Count Usage (TRADE) - Displays the user's current order count usage for all intervals.
// url: GET /api/v3/rateLimit/order
// params: recvWindow, timestamp
// Expected Response
    /*
    [

        {
            "rateLimitType": "ORDERS",
            "interval": "SECOND",
            "intervalNum": 10,
            "limit": 50,
            "count": 0
        },
        {
            "rateLimitType": "ORDERS",
            "interval": "DAY",
            "intervalNum": 1,
            "limit": 160000,
            "count": 0
        }
    ]
    */


/************************************/
/**** User data stream endpoints ****/
/************************************/

// Start user data stream (USER_STREAM)
// url: POST /api/v3/userDataStream
// params: NONE
// - Start a new user data stream. The stream will close after 60 minutes unless a keepalive is sent.
primitives.obtainBinanceListenKey = async () => {

    const url = `${binanceBaseUrl}/api/v3/userDataStream`;

    try {
        const result = await axios.post(url, null, { 
            headers: { 
                "X-MBX-APIKEY": binance_apikey 
            } 

            // Expected Response:
            /*
            {
                "listenKey": "pqia91ma19a5s61cv6a81va65sdf19v8a65a1a5s61cv6a81va65sdf19v8a65a1"
            }
            */
        });
        
        console.log('Received ListenKey: ', result.data.listenKey);
        
        return result.data.listenKey;
    }
    catch (err) {
        console.log(err);
        return false;
    }
}


// Keep Alive user data stream (USER_STREAM)
// url: PUT /api/v3/userDataStream
// params: listenKey
// - Keepalive a user data stream to prevent a time out. User data streams will close after 60 minutes. 
//   It's recommended to send a ping about every 30 minutes.
primitives.binanceKeepAlive = async (listenKey) => {
    const url = `${binanceBaseUrl}/api/v3/userDataStream`;

    try {
        const result = await axios.put(url, null, { 
            headers: { 
                "X-MBX-APIKEY": binance_apikey 
            },
            params: {
                listenKey
            }
        });

        // Expected Response:
        /*
        {}
        */
        
        // console.log('Keep Alive Response: ', result);
        return Object.keys(result.data).length === 0;  // result should be an empty object
    }
    catch (err) {
        console.log(err);
        return false;
    }
}

// Close user data stream (USER_STREAM)
// url: DELETE /api/v3/userDataStream
// params: listenKey
// - Close out a user data stream.
primitives.binanceDestroyListenKey = async (listenKey) => {
    const url = `${binanceBaseUrl}/api/v3/userDataStream`;

    console.log('ListenKey:', listenKey)

    try {
        const result = await axios.delete(url, { 
            headers: { 
                "X-MBX-APIKEY": binance_apikey 
            },
            params: {
                listenKey
            }
        });

        // Expected Response:
        /*
        {}
        */
        
        // console.log('Destroy ListenKey Response: ', result.data);
        return Object.keys(result.data).length === 0;  // result should be an empty object
    }
    catch (err) {
        console.log(err);
        return false;
    }
}

// Define binance websocket user stream
primitives.wss_binance = {
    // EE: new events(), //event emitter
    ws: '',
    startStream({ listenKey }) {
        if (primitives.wss_binance.ws) primitives.wss_binance.ws.terminate();

        primitives.wss_binance.ws = new Websocket(
            `wss://stream.binance.com:9443/ws/${listenKey}`
        );

        // Example received output:
        /*
        {"e":"balanceUpdate","E":1656851432707,"a":"BUSD","d":"25.00000000","T":1656851432706}
        {"e":"outboundAccountPosition","E":1656851432707,"u":1656851432706,"B":[{"a":"BUSD","f":"25.09962320","l":"0.00000000"}]}
        */
        
        primitives.wss_binance.ws.on('message', primitives.wss_binance.processStream);
    },
    stopStream() {
        if (primitives.wss_binance.ws) 
            primitives.wss_binance.ws.terminate();
    },
    processStream(payload) {
        console.log(payload.toString());

        // const pl = JSON.parse(payload);
        // wss_binance.EE.emit('OBUPDATES', pl);
    },
};


/**************************/
/*** Websocket Payloads ***/ 
/**************************/

// Account Update
// outboundAccountPosition is sent any time an account balance has changed and contains 
// the assets that were possibly changed by the event that generated the balance change.
    /*
    {
        "e": "outboundAccountPosition", //Event type
        "E": 1564034571105,             //Event Time
        "u": 1564034571073,             //Time of last account update
        "B": [                          //Balances Array
            {
                "a": "ETH",                 //Asset
                "f": "10000.000000",        //Free
                "l": "0.000000"             //Locked
            }
        ]
    }
    */

// Balance Update
// Balance Update occurs during the following:
// - Deposits or withdrawals from the account
// - Transfer of funds between accounts (e.g. Spot to Margin)
    /*
    {
        "e": "balanceUpdate",         //Event Type
        "E": 1573200697110,           //Event Time
        "a": "BTC",                   //Asset
        "d": "100.00000000",          //Balance Delta
        "T": 1573200697068            //Clear Time
    }
    */

// Order Update
// Orders are updated with the executionReport event.
// Check the Rest API Documentation: 'https://github.com/binance/binance-spot-api-docs/blob/master/rest-api.md#enum-definitions'.
// - Average price can be found by doing Z divided by z.
    /*
    {
        "e": "executionReport",        // Event type
        "E": 1499405658658,            // Event time
        "s": "ETHBTC",                 // Symbol
        "c": "mUvoqJxFIILMdfAW5iGSOW", // Client order ID
        "S": "BUY",                    // Side
        "o": "LIMIT",                  // Order type
        "f": "GTC",                    // Time in force
        "q": "1.00000000",             // Order quantity
        "p": "0.10264410",             // Order price
        "P": "0.00000000",             // Stop price
        "d": 4,                        // Trailing Delta; This is only visible if the order was a trailing stop order.
        "F": "0.00000000",             // Iceberg quantity
        "g": -1,                       // OrderListId
        "C": null,                     // Original client order ID; This is the ID of the order being canceled
        "x": "NEW",                    // Current execution type
        "X": "NEW",                    // Current order status
        "r": "NONE",                   // Order reject reason; will be an error code.
        "i": 4293153,                  // Order ID
        "l": "0.00000000",             // Last executed quantity
        "z": "0.00000000",             // Cumulative filled quantity
        "L": "0.00000000",             // Last executed price
        "n": "0",                      // Commission amount
        "N": null,                     // Commission asset
        "T": 1499405658657,            // Transaction time
        "t": -1,                       // Trade ID
        "I": 8641984,                  // Ignore
        "w": true,                     // Is the order on the book?
        "m": false,                    // Is this trade the maker side?
        "M": false,                    // Ignore
        "O": 1499405658657,            // Order creation time
        "Z": "0.00000000",             // Cumulative quote asset transacted quantity
        "Y": "0.00000000",             // Last quote asset transacted quantity (i.e. lastPrice * lastQty)
        "Q": "0.00000000"              // Quote Order Qty
    }
    */

    // Notes on Execution types:
    // - NEW - The order has been accepted into the engine.
    // - CANCELED - The order has been canceled by the user.
    // - REPLACED (currently unused)
    // - REJECTED - The order has been rejected and was not processed. (This is never pushed into the User Data Stream)
    // - TRADE - Part of the order or all of the order's quantity has filled.
    // - EXPIRED - The order was canceled according to the order type's rules (e.g. LIMIT FOK orders with no fill, LIMIT IOC or MARKET orders that partially fill) or by the exchange, (e.g. orders canceled during liquidation, orders canceled during maintenance)

// If the order is an OCO, an event will be displayed named ListStatus in addition to the executionReport event.
    /*
    {
        "e": "listStatus",                //Event Type
        "E": 1564035303637,               //Event Time
        "s": "ETHBTC",                    //Symbol
        "g": 2,                           //OrderListId
        "c": "OCO",                       //Contingency Type
        "l": "EXEC_STARTED",              //List Status Type
        "L": "EXECUTING",                 //List Order Status
        "r": "NONE",                      //List Reject Reason
        "C": "F4QN4G8DlFATFlIUQ0cjdD",    //List Client Order ID
        "T": 1564035303625,               //Transaction Time
        "O": [                            //An array of objects
            {
            "s": "ETHBTC",                //Symbol
            "i": 17,                      // orderId
            "c": "AJYsMjErWJesZvqlJCTUgL" //ClientOrderId
            },
            {
            "s": "ETHBTC",
            "i": 18,
            "c": "bfYPSQdLoqAJeNrOr9adzq"
            }
        ]
    }
    */





module.exports = primitives;