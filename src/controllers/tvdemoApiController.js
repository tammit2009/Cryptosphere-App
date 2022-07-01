
/***********************************/
/*** TradingView Demo Controller ***/
/***********************************/

const asyncHandler  = require('express-async-handler');
const createError   = require('http-errors');
const async         = require('async');
const axios         = require('axios');

// TradingView Demo 
// Method: 'GET', url = '/api/v1/tvdemo/:symbol/:interval', Access: 'Public'
const getTradingViewDemoData = asyncHandler(async (req, res) => {

    // TODO: validate symbol and interval

    // tulind functions
    const { 
        sma_inc, 
        ema_inc, 
        rsi_inc, 
        macd_inc,
        markers_inc 
    } = require('../apps/tvdemo/indicators');

    try {
        const { symbol, interval } = req.params;
        const resp = await axios.get(`https://api.binance.com/api/v3/klines`, {
                params: {
                    symbol,
                    interval,
                    //limit=20
                }
            }
        ); 
        
        const data = resp.data; // JSON.parse(resp.data);
        let klinedata = data.map((d) => ({
            time: d[0] / 1000,
            open: d[1] * 1,
            high: d[2] * 1,
            low: d[3] * 1,
            close: d[4] * 1,
        }));

        // sma
        klinedata = await sma_inc(klinedata);
        // ema
        klinedata = await ema_inc(klinedata);
        // rsi
        klinedata = await rsi_inc(klinedata);
        // macd
        klinedata = await macd_inc(klinedata);
        // markers
        klinedata = markers_inc(klinedata);

        res.status(200).json(klinedata);
    }
    catch (err) {
        res.status(500).send(err);
    }
});


module.exports = { 
    getTradingViewDemoData,
};