/* Broker Routes */

// Dependencies
const express   = require('express');
const router    = express.Router();

const { auth, verifyRoles, adminRole } = require('../../middleware/auth.js');
const ROLES                            = require('../../../config/rolesList');

const Broker = require('../../services/broker');
const broker = new Broker();

// Get Account Balance
// Method: 'GET', url = '/proxy/broker/account_balances', Access: 'Private: apiKey/Signed'
router.get('/account_balances', auth, async (req, res) => {
    try {
        const accountBalance = await broker.getAccountBalance();
        if (accountBalance) 
            res.json(accountBalance);
        else
            res.status(401).json({ error: 1003, message: err.message });
    }
    catch(err) {
        res.status(500).json({ error: 1002, message: err.message });
    }
});


// Get All Orders
// Method: 'GET', url = '/proxy/broker/orders', Access: 'Private: apiKey/Signed'
router.get('/orders', auth, async (req, res) => {

    let symbol = typeof(req.query.symbol) == 'string' 
        && req.query.symbol.trim().length > 0 ? req.query.symbol.trim() : 'BTCUSDT';

    let limit = typeof(req.query.limit) == 'number' 
        && req.query.limit <= 1000 ? req.query.limit : 500;

    try {
        const orders = await broker.getAllOrders(symbol, limit);
        if (orders) 
            res.json(orders);
        else
            res.status(401).json({ error: 1003, message: err.message });
    }
    catch(err) {
        res.status(500).json({ error: 1002, message: err.message });
    }
});


// Get Open Orders
// Method: 'GET', url = '/proxy/broker/open_orders', Access: 'Private: apiKey/Signed'
router.get('/open_orders', auth, async (req, res) => {

    let symbol = typeof(req.query.symbol) == 'string' 
        && req.query.symbol.trim().length > 0 ? req.query.symbol.trim() : false; // symbol can be blank

    let limit = typeof(req.query.limit) == 'number' 
        && req.query.limit <= 1000 ? req.query.limit : 500;

    try {
        const orders = await broker.getOpenOrders(symbol, limit);
        if (orders) 
            res.json(orders);
        else
            res.status(401).json({ error: 1003, message: err.message });
    }
    catch(err) {
        res.status(500).json({ error: 1002, message: err.message });
    }
});


// Get Order by Id
// Method: 'GET', url = '/proxy/broker/orders/:symbol/:orderId', Access: 'Private: apiKey/Signed'
router.get('/orders/:symbol/:orderId', auth, async (req, res) => {

    let symbol = typeof(req.params.symbol) == 'string' 
        && req.params.symbol.trim().length > 0 ? req.params.symbol.trim() : 'BTCUSDT';

    let orderId = typeof(req.params.orderId) == 'string' 
        && req.params.orderId.trim().length > 0 ? req.params.orderId.trim() : false;

    if (orderId && symbol) {
        try {
            const orders = await broker.getOrderById(orderId, symbol);
            if (orders) 
                res.json(orders);
            else
                res.status(401).json({ error: 1003, message: '1003' });
        }
        catch(err) {
            res.status(500).json({ error: 1002, message: err.message });
        }
    }
    else {
        res.status(401).json({ error: 1004, message: '1004' });
    }
    
});


// Get Order Status
// Method: 'GET', url = '/proxy/broker/order', Access: 'Private: apiKey/Signed'
router.get('/order', auth, async (req, res) => {

    let symbol = typeof(req.query.symbol) == 'string' 
        && req.query.symbol.trim().length > 0 ? req.query.symbol.trim() : 'BTCUSDT';

    let orderId = typeof(req.query.orderId) == 'string' 
        && req.query.orderId.trim().length > 0 ? req.query.orderId.trim() : false;

    let origClientOrderId = typeof(req.query.origClientOrderId) == 'number' 
        && req.query.origClientOrderId > 0 ? req.query.origClientOrderId : false;

    if (symbol && (orderId || origClientOrderId)) {
        try {
            const orders = await broker.getOrderStatus(orderId, origClientOrderId, symbol);
            if (orders) 
                res.json(orders);
            else
                res.status(401).json({ error: 1003, message: '1003' });
        }
        catch(err) {
            res.status(500).json({ error: 1002, message: err.message });
        }
    }
    else {
        res.status(401).json({ error: 1004, message: '1004' });
    }
    
});


// Create Market Order
// Method: 'POST', url = '/proxy/broker/order/market', Access: 'Private: apiKey/Signed'
router.post('/order/market', auth, async (req, res) => {

    let symbol = typeof(req.body.symbol) == 'string' 
        && req.body.symbol.trim().length > 0 ? req.body.symbol.trim() : false;  // must have symbol

    let side = typeof(req.body.side) == 'string' 
        && req.body.side.trim().length > 0 ? req.body.side.trim() : false;      // must have side

    let size = typeof(req.body.size) == 'number' 
        && req.body.size > 0 ? req.body.size : false;                           // must have size

    if (symbol && side && size) {
        try {
            const order = await broker.createMarketOrder(symbol, side, size);
            if (order) 
                res.json(order);
            else
                res.status(401).json({ error: 1003, message: '1003' });
        }
        catch(err) {
            res.status(500).json({ error: 1001, message: err.message });
        }
    }
    else {
        res.status(401).json({ error: 1002, data: 'Missing required inputs, or inputs are invalid' });
    }
});


// Create Limit Order
// Method: 'POST', url = '/proxy/broker/order/limit', Access: 'Private: apiKey/Signed'
router.post('/order/limit', auth, async (req, res) => {

    let symbol = typeof(req.body.symbol) == 'string' 
        && req.body.symbol.trim().length > 0 ? req.body.symbol.trim() : false;  // must have symbol

    let side = typeof(req.body.side) == 'string' 
        && req.body.side.trim().length > 0 ? req.body.side.trim() : false;      // must have side

    let price = typeof(req.body.price) == 'number' 
        && req.body.price > 0 ? req.body.price : false;                           // must have price

    let size = typeof(req.body.size) == 'number' 
        && req.body.size > 0 ? req.body.size : false;                           // must have size

    if (symbol && side && price && size) {
        try {
            const order = await broker.createLimitOrder(symbol, side, price, size);
            if (order) 
                res.json(order);
            else
                res.status(401).json({ error: 1003, message: order });
        }
        catch(err) {
            res.status(500).json({ error: 1001, message: err.message });
        }
    }
    else {
        res.status(401).json({ error: 1002, data: 'Missing required inputs, or inputs are invalid' });
    }
});


// Cancel Order
// Method: 'DELETE', url = '/proxy/broker/order', Access: 'Private: apiKey/Signed'
router.delete('/order', auth, async (req, res) => {

    let symbol = typeof(req.query.symbol) == 'string' 
        && req.query.symbol.trim().length > 0 ? req.query.symbol.trim() : 'BTCUSDT';

    let orderId = typeof(req.query.orderId) == 'string' 
        && req.query.orderId.trim().length > 0 ? req.query.orderId.trim() : false;

    let origClientOrderId = typeof(req.query.origClientOrderId) == 'number' 
        && req.query.origClientOrderId > 0 ? req.query.origClientOrderId : false;

    if (symbol && (orderId || origClientOrderId)) {
        try {
            const order = await broker.cancelOrder(orderId, origClientOrderId, symbol);
            if (order) 
                res.json(order);
            else
                res.status(401).json({ error: 1003, message: '1003' });
        }
        catch(err) {
            res.status(500).json({ error: 1002, message: err.message });
        }
    }
    else {
        res.status(401).json({ error: 1004, message: '1004' });
    }
});


// Get Ticker Price - Latest price for a symbol or symbols.
// Method: 'GET', url = '/proxy/broker/ticker_prices?symbols=[%22BTCUSDT%22,%22BNBUSDT%22]'', Access: 'Public'
router.get('/ticker_prices', async (req, res) => {

    let symbols = typeof(req.query.symbols) == 'string' 
        && req.query.symbols.trim().length > 0 ? req.query.symbols.trim() : '["BTCUSDT"]';

    if (symbols) {
        try {
            const tickerPrice = await broker.getTickerPrice(symbols);
            if (tickerPrice) 
                res.json(tickerPrice);
            else
                res.status(401).json({ error: 1003, message: '1003' });
        }
        catch(err) {
            res.status(500).json({ error: 1002, message: err.message });
        }
    }
    else {
        res.status(401).json({ error: 1004, message: '1004' });
    }
});


// Get OrderBook Ticker Price - Best price/qty on the order book for a symbol or symbols.
// Method: 'GET', url = '/proxy/broker/obticker_prices?symbols=[%22BTCUSDT%22,%22BNBUSDT%22]'', Access: 'Public'
router.get('/obticker_prices', async (req, res) => {

    let symbols = typeof(req.query.symbols) == 'string' 
        && req.query.symbols.trim().length > 0 ? req.query.symbols.trim() : '["BTCUSDT"]';

    if (symbols) {
        try {
            const obtickerPrice = await broker.getOrderBookTickerPrice(symbols);
            if (obtickerPrice) 
                res.json(obtickerPrice);
            else
                res.status(401).json({ error: 1003, message: '1003' });
        }
        catch(err) {
            res.status(500).json({ error: 1002, message: err.message });
        }
    }
    else {
        res.status(401).json({ error: 1004, message: '1004' });
    }
});


// Exports
module.exports = router;