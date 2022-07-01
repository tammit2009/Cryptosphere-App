/* Binance Routes */

// Dependencies
const express   = require('express');
const router    = express.Router();
const axios     = require('axios');

const binanceBaseUrl = 'https://api.binance.com';

// routes
router.get('/', (req, res) => {
    res.send('Binance Routes')
});


// Get list of coins 
// Method: 'GET', url = '/proxy/binance/obdepth_serveapi?symbol={symbol}&limit={limit}', Access: 'Public'
router.get('/obdepth_serveapi', async (req, res) => {

    let symbol = req.query.symbol;
    if (!symbol)
        symbol = 'BTCUSDT';

    let limit = req.query.limit;
    if (!limit)
        limit = 500;

    const endpoint = `/api/v3/depth?symbol=${symbol}&limit=${limit}`;

    try {
        const result = await axios.get(`${binanceBaseUrl}${endpoint}`, {});
        res.json(result.data);
    }
    catch (err) {
        if (err.response) {
            res.json({ errorCode: -1, data: err.response.data });
        } 
        else if (err.request) {
            res.json({ errorCode: -2, data: err.request });
        } 
        else {
            res.json({ errorCode: -3, data: err.message });
        }
    }   
});


// Exports
module.exports = router;