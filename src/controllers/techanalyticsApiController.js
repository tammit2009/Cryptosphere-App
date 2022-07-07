/********************************/
/*** TechAnalytics Controller ***/
/********************************/

const asyncHandler  = require('express-async-handler');
const axios         = require('axios');


// TechAnalytics Page 
// Method: 'GET', url = '/api/v1/tech_analytics/:symbol/:interval', Access: 'Public'
const getTechAnalyticsData = asyncHandler(async (req, res) => {

    // TODO: validate symbol and interval

    // tulind functions
    const { 
        sma_inc, 
        ema_inc, 
        rsi_inc, 
        macd_inc,
        markers_inc 
    } = require('../libs/ta/tulip_indicators');

    try {
        const { symbol, interval } = req.params;
        const resp = await axios.get(`https://api.binance.com/api/v3/klines`, {
                params: {
                    symbol,
                    interval,
                    // limit: 100  
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
        // klinedata = markers_inc(klinedata);

        res.status(200).json(klinedata);
    }
    catch (err) {
        res.status(500).send(err);
    } 
});


module.exports = { 
    getTechAnalyticsData,
};