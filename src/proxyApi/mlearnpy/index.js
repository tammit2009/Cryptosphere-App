/* Binance Routes */

// TODO: Update on Remote.

// Dependencies
const express   = require('express');
const router    = express.Router();

const { auth, verifyRoles, adminRole } = require('../../middleware/auth.js');
const ROLES                            = require('../../../config/rolesList');

const primitives = require('../../services/mlearnpy/mlearnpy_primitives');

// routes

// Get Basic Binance KLines
// Method: 'GET', url = '/proxy/mlearnpy/binance_klines?symbol={symbol}&interval={interval}&lookback={lookback}', Access: 'Public'
// e.g. '/proxy/mlearnpy/binance_klines?symbol=BTCBUSD&interval=1m&lookback=30'
router.get('/binance_klines', async (req, res) => {
    let symbol = req.query.symbol;
    if (!symbol)
        symbol = 'BTCUSDT';

    let interval = req.query.interval;  // '1m' '5m', '30m', '1h', '4h', '1d'
    if (!interval)
        interval = '5m';

    let lookback = req.query.lookback;
    if (!lookback)
        lookback = '30';                // append e.g. '30 mins ago'

    const result = await primitives.getBinanceKlines({ symbol, interval, lookback });
    res.json(result);
});


// Get Basic Binance KLines with Support and Resistance
// e.g. '/proxy/mlearnpy/binance_klines_sar?symbol=BTCBUSD&interval=1m&lookback=30'
router.get('/binance_klines_sar', async (req, res) => {
    let symbol = req.query.symbol;
    if (!symbol)
        symbol = 'BTCUSDT';

    let interval = req.query.interval;  // '1m' '5m', '30m', '1h', '4h', '1d'
    if (!interval)
        interval = '5m';

    let lookback = req.query.lookback;
    if (!lookback)
        lookback = '30';                // append e.g. '30 mins ago'

    const result = await primitives.getBinanceKlinesSR({ symbol, interval, lookback });
    res.json(result);
});


// Exports
module.exports = router;