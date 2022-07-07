/* Binance Routes */

// TODO: Update on Remote.

// Dependencies
const express   = require('express');
const router    = express.Router();

const { 
    auth, verifyRoles, adminRole 
        }        = require('../../middleware/auth.js');
const ROLES      = require('../../../config/rolesList');
const primitives = require('../../services/binance/binance_primitives');

// routes
router.get('/', (req, res) => {
    res.send('Binance Routes')
});


// Get OrderBook Depth - Demo
// Method: 'GET', url = '/proxy/binance/obdepth_serveapi?symbol={symbol}&limit={limit}', Access: 'Public'
router.get('/obdepth_serveapi', async (req, res) => {
    let symbol = req.query.symbol;
    if (!symbol)
        symbol = 'BTCUSDT';

    let limit = req.query.limit;
    if (!limit)
        limit = 500;

    const result = await primitives.getObDepthDemo({ symbol, limit });
    res.json(result);
});


// --- General Endpoints ----

// Ping Binance Exchange
// Method: 'GET', url = '/proxy/binance/oper/ping', Access: 'Public'
router.get('/oper/ping', async (req, res) => {

    const result = await primitives.ping();
    res.json(result);
});


// Get current exchange/server time
// Method: 'GET', url = '/proxy/binance/oper/time', Access: 'Public'
router.get('/oper/time', async (req, res) => {
    
    const result = await primitives.getCurrentServerTime();
    res.json(result);
});


// Get Exchange Information
// Method: 'GET', url = '/proxy/binance/oper/exchangeInfo', Access: 'Public'
// Method: 'GET', url = '/proxy/binance/oper/ticker24hrPrice?symbols=[%22BTCUSDT%22,%22BNBUSDT%22]', Access: 'Public'
router.get('/oper/exchangeInfo', async (req, res) => {
    
    let symbols = typeof(req.query.symbols) == 'string' 
        && req.query.symbols.trim().length > 0 ? req.query.symbols.trim() : '[BTCUSDT]';

    if (symbols) {
        const result = await primitives.getExchangeInfo({ symbols });
        res.json(result);
    }
    else {
        res.status(401).json({ error: 1002, data: 'Missing required inputs, or inputs are invalid' });
    }
});


// --- Market Data Endpoints ----

// Get OrderBook Depth
// Method: 'GET', url = '/proxy/binance/oper/obdepth?symbol={symbol}&limit={limit}', Access: 'Public'
router.get('/oper/obdepth', auth, async (req, res) => {
    let symbol = req.query.symbol;
    if (!symbol)
        symbol = 'BTCUSDT';

    let limit = req.query.limit;
    if (!limit)
        limit = 500;

    const result = await primitives.getObDepth({ symbol, limit, user: req.user });
    res.json(result);
});


// Get Recent Trades
// Method: 'GET', url = '/proxy/binance/oper/trades?symbol={symbol}&limit={limit}', Access: 'Public'
router.get('/oper/trades', async (req, res) => {
    let symbol = req.query.symbol;
    if (!symbol)
        symbol = 'BTCUSDT';

    let limit = req.query.limit;
    if (!limit)
        limit = 500;   // default=500, max=1000

    const result = await primitives.getTrades({ symbol, limit });
    res.json(result);
});


// Get Historical Trades
// Method: 'GET', url = '/proxy/binance/oper/historicalTrades?symbol={symbol}&limit={limit}', Access: 'Private: Requires ApiKey'
router.get('/oper/historicalTrades', auth, async (req, res) => {
    if (!req.user) return res.status(403).json({ errorCode: -1, data: `Forbidden: user not found.` });

    let symbol = req.query.symbol;
    if (!symbol)
        symbol = 'BTCUSDT';

    let limit = req.query.limit;
    if (!limit)
        limit = 500;   // default=500, max=1000

    const result = await primitives.getHistoricalTrades({ symbol, limit, user: req.user });
    res.json(result);
});


// Get Compressed/Aggregate Trades Data
// Method: 'GET', url = '/proxy/binance/oper/aggregateTrades?symbol={symbol}&startTime={start}&endTime={end}&limit={limit}', Access: 'Public'
router.get('/oper/aggregateTrades', async (req, res) => {

    let symbol = typeof(req.query.symbol) == 'string' 
        && req.query.symbol.trim().length <= 8 ? req.query.symbol.trim() : 'BTCUSDT';

    const now = new Date().getTime(); 
    let startTime = typeof(req.query.startTime) == 'string'
        && req.query.startTime.trim().length > 0 ? parseInt(req.query.startTime.trim()) : now - (30 * 24 * 60 * 60 * 1e3); // 1 month ago
    let endTime = typeof(req.query.endTime) == 'string'
        && req.query.endTime.trim().length > 0 ? parseInt(req.query.endTime.trim()) : now; // now

    let limit = typeof(req.query.limit) == 'number' 
        && req.query.limit <= 1000 ? req.query.limit : 500;

    if (symbol && startTime && endTime && limit) {
        const result = await primitives.getAggregateTrades({ symbol, startTime, endTime, limit });
        res.json(result);
    }
    else {
        res.status(401).json({ error: 1002, data: 'Missing required inputs, or inputs are invalid' });
    }
});


// Get Candlestick/Klines Data
// Method: 'GET', url = '/proxy/binance/oper/klines?symbol={symbol}&interval={interval}&startTime={start}&endTime={end}&limit={limit}', Access: 'Public'
router.get('/oper/klines', async (req, res) => {

    let symbol = typeof(req.query.symbol) == 'string' 
        && req.query.symbol.trim().length <= 8 ? req.query.symbol.trim() : 'BTCUSDT';
    let interval = typeof(req.query.interval) == 'string' 
        && req.query.interval.trim().length >= 2 ? req.query.interval.trim() : '5m';

    const now = new Date().getTime(); 
    let startTime = typeof(req.query.startTime) == 'string'
        && req.query.startTime.trim().length > 0 ? parseInt(req.query.startTime.trim()) : now - (30 * 24 * 60 * 60 * 1e3); // 1 month ago
    let endTime = typeof(req.query.endTime) == 'string'
        && req.query.endTime.trim().length > 0 ? parseInt(req.query.endTime.trim()) : now; // now

    let limit = typeof(req.query.limit) == 'number' 
        && req.query.limit <= 1000 ? req.query.limit : 500;

    if (symbol && interval && startTime && endTime && limit) {
        const result = await primitives.getKlines({ symbol, interval, startTime, endTime, limit });
        res.json(result);
    }
    else {
        res.status(401).json({ error: 1002, data: 'Missing required inputs, or inputs are invalid' });
    }
});


// Get Current Average Price
// Method: 'GET', url = '/proxy/binance/oper/avgPrice?symbol={symbol}', Access: 'Public'
router.get('/oper/avgPrice', async (req, res) => {
    
    let symbol = typeof(req.query.symbol) == 'string' 
        && req.query.symbol.trim().length <= 8 ? req.query.symbol.trim() : 'BTCUSDT';

    if (symbol) {
        const result = await primitives.getAvgPrice({ symbol });
        res.json(result);
    }
    else {
        res.status(401).json({ error: 1002, data: 'Missing required inputs, or inputs are invalid' });
    }
});

// Get 24hr ticker price change statistics
// Method: 'GET', url = '/proxy/binance/oper/ticker24hrPrice?symbols=[%22BTCUSDT%22,%22BNBUSDT%22]', Access: 'Public'
router.get('/oper/ticker24hrPrice', async (req, res) => {
    
    let symbols = typeof(req.query.symbols) == 'string' 
        && req.query.symbols.trim().length > 0 ? req.query.symbols.trim() : '[BTCUSDT]';

    if (symbols) {
        const result = await primitives.getTicker24hrPrice({ symbols });
        res.json(result);
    }
    else {
        res.status(401).json({ error: 1002, data: 'Missing required inputs, or inputs are invalid' });
    }
});


// Get Symbol price ticker - Latest price for a symbol or symbols.
// Method: 'GET', url = '/proxy/binance/oper/tickerPrice?symbols=[%22BTCUSDT%22,%22BNBUSDT%22]', Access: 'Public'
router.get('/oper/tickerPrice', async (req, res) => {
    
    let symbols = typeof(req.query.symbols) == 'string' 
        && req.query.symbols.trim().length > 0 ? req.query.symbols.trim() : '[BTCUSDT]';

    if (symbols) {
        const result = await primitives.getTickerPrice({ symbols });
        res.json(result);
    }
    else {
        res.status(401).json({ error: 1002, data: 'Missing required inputs, or inputs are invalid' });
    }
});


// Get Symbol order book ticker - Best price/qty on the order book for a symbol or symbols.
// Method: 'GET', url = '/proxy/binance/oper/orderbookTickerPrice?symbols=[%22BTCUSDT%22,%22BNBUSDT%22]', Access: 'Public'
router.get('/oper/orderbookTickerPrice', async (req, res) => {
    
    let symbols = typeof(req.query.symbols) == 'string' 
        && req.query.symbols.trim().length > 0 ? req.query.symbols.trim() : '[BTCUSDT]';

    if (symbols) {
        const result = await primitives.getOrderBookTickerPrice({ symbols });
        res.json(result);
    }
    else {
        res.status(401).json({ error: 1002, data: 'Missing required inputs, or inputs are invalid' });
    }
});


// Get Rolling window price change statistics
// Method: 'GET', url = '/proxy/binance/oper/rollingWindowPriceChange?symbols=[%22BTCUSDT%22,%22BNBUSDT%22]', Access: 'Public'
router.get('/oper/rollingWindowPriceChange', async (req, res) => {
    
    let symbols = typeof(req.query.symbols) == 'string' 
        && req.query.symbols.trim().length > 0 ? req.query.symbols.trim() : '[BTCUSDT]';

    if (symbols) {
        const result = await primitives.getRollingWindowPriceChange({ symbols });
        res.json(result);
    }
    else {
        res.status(401).json({ error: 1002, data: 'Missing required inputs, or inputs are invalid' });
    }
});

// --- Accounts Endpoints ----

// Get Account Information
// Method: 'GET', url = '/proxy/binance/oper/account', Access: 'Private: apiKey/Signed'
// params: recvWindow, timestamp
router.get('/oper/account', async (req, res) => {
    
    let recvWindow = typeof(req.body.recvWindow) == 'number' 
        && req.body.recvWindow > 0 ? req.body.recvWindow : 5000;

    if (recvWindow) {
        // Not Needed but send anyway
        const orderData = {
            recvWindow,
            timestamp: new Date().getTime(),
        }

        const result = await primitives.getAccountInfo(orderData);
        res.json(result);
    }
    else {
        res.status(401).json({ error: 1002, data: 'Missing required inputs, or inputs are invalid' });
    }
});


// Create Order
// Method: 'POST', url = '/proxy/binance/oper/order', Access: 'Private: apiKey/Signed'
router.post('/oper/order', async (req, res) => {
    
    let recvWindow = typeof(req.body.recvWindow) == 'number' 
        && req.body.recvWindow > 0 ? req.body.recvWindow : 5000;
    let symbol = typeof(req.body.symbol) == 'string' 
        && req.body.symbol.trim().length > 0 ? req.body.symbol.trim() : 'BTCUSDT';
    let side = typeof(req.body.side) == 'string' 
        && req.body.side.trim().length > 0 ? req.body.side.trim() : 'BUY';
    let type = typeof(req.body.type) == 'string' 
        && req.body.type.trim().length > 0 ? req.body.type.trim() : 'MARKET';

    // optional parameters
    let size = typeof(req.body.size) == 'number'
        && req.body.size > 0 ? req.body.size : false;
    let funds = typeof(req.body.funds) == 'number'
        && req.body.funds > 0 ? req.body.funds : false;
    let price = typeof(req.body.price) == 'number'
        && req.body.price > 0 ? req.body.price : false;

    if (recvWindow && symbol && side && type) {

        const orderData = {
            recvWindow, timestamp: new Date().getTime(), symbol, side, type, size, funds, price
        }

        const result = await primitives.createOrder(orderData);
        res.json(result);
    }
    else {
        res.status(401).json({ error: 1002, data: 'Missing required inputs, or inputs are invalid' });
    }
});


// Create Test Order
// Method: 'POST', url = '/proxy/binance/oper/order/test', Access: 'Private: apiKey/Signed'
router.post('/oper/order/test', async (req, res) => {
    
    let recvWindow = typeof(req.body.recvWindow) == 'number' 
        && req.body.recvWindow > 0 ? req.body.recvWindow : 5000;
    let symbol = typeof(req.body.symbol) == 'string' 
        && req.body.symbol.trim().length > 0 ? req.body.symbol.trim() : 'BTCUSDT';
    let side = typeof(req.body.side) == 'string' 
        && req.body.side.trim().length > 0 ? req.body.side.trim() : 'BUY';
    let type = typeof(req.body.type) == 'string' 
        && req.body.type.trim().length > 0 ? req.body.type.trim() : 'MARKET';

    // optional parameters
    let size = typeof(req.body.size) == 'number'
        && req.body.size > 0 ? req.body.size : false;
    let funds = typeof(req.body.funds) == 'number'
        && req.body.funds > 0 ? req.body.funds : false;
    let price = typeof(req.body.price) == 'number'
        && req.body.price > 0 ? req.body.price : false;

    if (recvWindow && symbol && side && type) {

        const orderData = {
            recvWindow, timestamp: new Date().getTime(), symbol, side, type, size, funds, price
        }

        const result = await primitives.createTestOrder(orderData);
        res.json(result);
    }
    else {
        res.status(401).json({ error: 1002, data: 'Missing required inputs, or inputs are invalid' });
    }
});


// Get ALL Orders
// Method: 'GET', url = '/proxy/binance/oper/allOrders', Access: 'Private: apiKey/Signed'
router.get('/oper/allOrders', async (req, res) => {

    console.log(req.query);
    
    let recvWindow = typeof(req.query.recvWindow) == 'number' 
        && req.query.recvWindow > 0 ? req.query.recvWindow : 5000;
    let symbol = typeof(req.query.symbol) == 'string' 
        && req.query.symbol.trim().length > 0 ? req.query.symbol.trim() : 'BTCUSDT';

    // For some unknown reason, startTime makes the transaction fail
    // const now = new Date().getTime(); 
    // let startTime = typeof(req.query.startTime) == 'string'
    //     && req.query.startTime.trim().length > 0 ? parseInt(req.query.startTime.trim()) : now - (30 * 24 * 60 * 60 * 1e3); // 1 month ago
    // let endTime = typeof(req.query.endTime) == 'string'
    //     && req.query.endTime.trim().length > 0 ? parseInt(req.query.endTime.trim()) : now; // now

    let orderId = typeof(req.query.orderId) == 'number' 
        && req.query.orderId > 0 ? req.query.orderId : false;

    let limit = typeof(req.query.limit) == 'number' 
        && req.query.limit <= 1000 ? req.query.limit : 500;

    if (recvWindow && symbol) {

        const orderData = {
            recvWindow, 
            timestamp: new Date().getTime(), 
            symbol, 
            // startTime, endTime,
            orderId,
            limit
        }

        const result = await primitives.getAllOrders(orderData);
        res.json(result);
    }
    else {
        res.status(401).json({ error: 1002, data: 'Missing required inputs, or inputs are invalid' });
    }
});


// Get ALL (my) Trades
// Method: 'GET', url = '/proxy/binance/oper/myTrades', Access: 'Private: apiKey/Signed'
router.get('/oper/myTrades', async (req, res) => {
    
    let recvWindow = typeof(req.query.recvWindow) == 'number' 
        && req.query.recvWindow > 0 ? req.query.recvWindow : 5000;
    let symbol = typeof(req.query.symbol) == 'string' 
        && req.query.symbol.trim().length > 0 ? req.query.symbol.trim() : 'BTCUSDT';

    // For some unknown reason, startTime makes the transaction fail
    // const now = new Date().getTime(); 
    // let startTime = typeof(req.query.startTime) == 'string'
    //     && req.query.startTime.trim().length > 0 ? parseInt(req.query.startTime.trim()) : now - (30 * 24 * 60 * 60 * 1e3); // 1 month ago
    // let endTime = typeof(req.query.endTime) == 'string'
    //     && req.query.endTime.trim().length > 0 ? parseInt(req.query.endTime.trim()) : now; // now

    let orderId = typeof(req.query.orderId) == 'number' 
        && req.query.orderId > 0 ? req.query.orderId : false;

    let limit = typeof(req.query.limit) == 'number' 
        && req.query.limit <= 1000 ? req.query.limit : 500;

    if (recvWindow && symbol) {

        const orderData = {
            recvWindow, 
            timestamp: new Date().getTime(), 
            symbol, 
            // startTime, endTime,
            orderId,
            limit
        }

        const result = await primitives.getMyTrades(orderData);
        res.json(result);
    }
    else {
        res.status(401).json({ error: 1002, data: 'Missing required inputs, or inputs are invalid' });
    }
});


// Get Current Open Orders
// Method: 'GET', url = '/proxy/binance/oper/openOrders', Access: 'Private: apiKey/Signed'
router.get('/oper/openOrders', async (req, res) => {
    
    let recvWindow = typeof(req.query.recvWindow) == 'number' 
        && req.query.recvWindow > 0 ? req.query.recvWindow : 5000;
    let symbol = typeof(req.query.symbol) == 'string' 
        && req.query.symbol.trim().length > 0 ? req.query.symbol.trim() : 'BTCUSDT';

    if (recvWindow && symbol) {

        const orderData = {
            recvWindow, 
            timestamp: new Date().getTime(), 
            symbol
        }

        const result = await primitives.getOpenOrders(orderData);
        res.json(result);
    }
    else {
        res.status(401).json({ error: 1002, data: 'Missing required inputs, or inputs are invalid' });
    }
});


// Query Order
// Method: 'GET', url = '/proxy/binance/oper/order', Access: 'Private: apiKey/Signed'
router.get('/oper/order', async (req, res) => {
    
    let recvWindow = typeof(req.query.recvWindow) == 'number' 
        && req.query.recvWindow > 0 ? req.query.recvWindow : 5000;
    let symbol = typeof(req.query.symbol) == 'string' 
        && req.query.symbol.trim().length > 0 ? req.query.symbol.trim() : 'BTCUSDT';
    let orderId = typeof(req.query.orderId) == 'number' 
        && req.query.orderId > 0 ? req.query.orderId : false;
    let origClientOrderId = typeof(req.query.origClientOrderId) == 'number' 
        && req.query.origClientOrderId > 0 ? req.query.origClientOrderId : false;

    if (recvWindow && symbol && (orderId || origClientOrderId)) {

        const orderData = {
            recvWindow, 
            timestamp: new Date().getTime(), 
            symbol,
            orderId,
            origClientOrderId
        }

        const result = await primitives.getOrderStatus(orderData);
        res.json(result);
    }
    else {
        res.status(401).json({ error: 1002, data: 'Missing required inputs, or inputs are invalid' });
    }
});


// Cancel Order
// Method: 'DELETE', url = '/proxy/binance/oper/order', Access: 'Private: apiKey/Signed'
router.delete('/oper/order', async (req, res) => {
    
    let recvWindow = typeof(req.query.recvWindow) == 'number' 
        && req.query.recvWindow > 0 ? req.query.recvWindow : 5000;
    let symbol = typeof(req.query.symbol) == 'string' 
        && req.query.symbol.trim().length > 0 ? req.query.symbol.trim() : 'BTCUSDT';
    let orderId = typeof(req.query.orderId) == 'number' 
        && req.query.orderId > 0 ? req.query.orderId : false;
    let origClientOrderId = typeof(req.query.origClientOrderId) == 'number' 
        && req.query.origClientOrderId > 0 ? req.query.origClientOrderId : false;

    if (recvWindow && symbol && (orderId || origClientOrderId)) {

        const orderData = {
            recvWindow, 
            timestamp: new Date().getTime(), 
            symbol,
            orderId,
            origClientOrderId
        }

        const result = await primitives.cancelOrder(orderData);
        res.json(result);
    }
    else {
        res.status(401).json({ error: 1002, data: 'Missing required inputs, or inputs are invalid' });
    }
});


// Cancel All Open Orders
// Method: 'DELETE', url = '/proxy/binance/oper/openOrders', Access: 'Private: apiKey/Signed'
router.delete('/oper/openOrders', async (req, res) => {
    
    let recvWindow = typeof(req.query.recvWindow) == 'number' 
        && req.query.recvWindow > 0 ? req.query.recvWindow : 5000;
    let symbol = typeof(req.query.symbol) == 'string' 
        && req.query.symbol.trim().length > 0 ? req.query.symbol.trim() : 'BTCUSDT';

    if (recvWindow && symbol && (orderId || origClientOrderId)) {

        const orderData = {
            recvWindow, 
            timestamp: new Date().getTime(), 
            symbol
        }

        const result = await primitives.cancelOpenOrders(orderData);
        res.json(result);
    }
    else {
        res.status(401).json({ error: 1002, data: 'Missing required inputs, or inputs are invalid' });
    }
});


// Cancel and Replace Order
// Method: 'POST', url = '/proxy/binance/oper/order/cancelReplace', Access: 'Private: apiKey/Signed'
router.post('/oper/order/cancelReplace', async (req, res) => {
    
    let recvWindow = typeof(req.body.recvWindow) == 'number' 
        && req.body.recvWindow > 0 ? req.body.recvWindow : 5000;
    let symbol = typeof(req.body.symbol) == 'string' 
        && req.body.symbol.trim().length > 0 ? req.body.symbol.trim() : 'BTCUSDT';
    let side = typeof(req.body.side) == 'string' 
        && req.body.side.trim().length > 0 ? req.body.side.trim() : 'BUY';
    let type = typeof(req.body.type) == 'string' 
        && req.body.type.trim().length > 0 ? req.body.type.trim() : 'MARKET';
    let cancelOrderId = typeof(req.query.cancelOrderId) == 'number' 
        && req.query.cancelOrderId > 0 ? req.query.cancelOrderId : false;
    let cancelOrigClientOrderId = typeof(req.query.cancelOrigClientOrderId) == 'number' 
        && req.query.cancelOrigClientOrderId > 0 ? req.query.cancelOrigClientOrderId : false;

    // optional parameters
    let size = typeof(req.body.size) == 'number'
        && req.body.size > 0 ? req.body.size : false;
    let funds = typeof(req.body.funds) == 'number'
        && req.body.funds > 0 ? req.body.funds : false;
    let price = typeof(req.body.price) == 'number'
        && req.body.price > 0 ? req.body.price : false;

    if (recvWindow && symbol && side && type && (cancelOrderId || cancelOrigClientOrderId)) {

        const orderData = {
            recvWindow, timestamp: new Date().getTime(), symbol, 
            side, type, size, funds, price,
            cancelOrderId, 
            cancelOrigClientOrderId
        }

        const result = await primitives.cancelReplaceOrder(orderData);
        res.json(result);
    }
    else {
        res.status(401).json({ error: 1002, data: 'Missing required inputs, or inputs are invalid' });
    }
});


/************************************/
/**** User data stream endpoints ****/
/************************************/

// Start a new User Stream - Get Binance Listen Key
// Method: 'POST', url = '/proxy/binance/oper/userStream', Access: 'Public'
router.post('/oper/userStream', async (req, res) => {
    const listenKey = await primitives.obtainBinanceListenKey();

    // Start a websocket user stream
    primitives.wss_binance.startStream({ listenKey });

    res.json({ code: 0, message: `Websocket Stream Initiated.`, listenKey });
});


// Keep Alive User Stream 
// Method: 'PUT ', url = '/proxy/binance/oper/userStream', Access: 'Public'
router.put('/oper/userStream', async (req, res) => {

    let listenKey = typeof(req.body.listenKey) == 'string' 
        && req.body.listenKey.trim().length > 0 ? req.body.listenKey.trim() : false;

    if (listenKey) {
        const result = await primitives.binanceKeepAlive(listenKey);
        if (result) 
            res.json({ code: 0, message: `Websocket Stream Refreshed.` });
    }
    else {
        res.status(401).json({ error: 1002, data: 'Missing required inputs, or inputs are invalid' });
    } 
});


// Close user data stream
// Method: 'DELETE ', url = '/proxy/binance/oper/userStream', Access: 'Public'
router.delete('/oper/userStream', async (req, res) => {

    let listenKey = typeof(req.body.listenKey) == 'string' 
        && req.body.listenKey.trim().length > 0 ? req.body.listenKey.trim() : false;

    if (listenKey) {

        // Stop the socket stream
        primitives.wss_binance.stopStream({ listenKey });

        const result = await primitives.binanceDestroyListenKey(listenKey);
        if (result)
            res.json({ code: 0, message: `Websocket Stream Closed.` });
    }
    else {
        res.status(401).json({ error: 1002, data: 'Missing required inputs, or inputs are invalid' });
    } 
});



// Exports
module.exports = router;