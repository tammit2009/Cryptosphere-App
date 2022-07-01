
const Candlestick = require('../models/candlestick');
const { timeout } = require('../utils');
const { getKlines, intervalToSeconds } = require('./exchanges/binance');

// Get historical data as candlesticks for specified start and end date range

class HistoricalService {

    constructor({ start, end, interval, asset, base }) {
        this.start = Math.floor(start * 1e-3);  
        this.end = Math.floor(end * 1e-3);
        this.interval = interval;   // '1m', '5m', etc
        this.market = `${asset}${base}`;
    }

    // get the historical data as candlestick array
    async getData() {
        const intervals = this.createRequests();        // [{ start1, end1 }, { start2, end2 }, ... ]
        const results = await this.performIntervals(intervals);
        console.log(results.length);
        
        // Eliminate repeats
        const timestamps = {};
        const filtered = results.filter((x, i) => {
            if (timestamps[x[0]]) {
                console.log(i);
                return false;
            }
            timestamps[x[0]] = true;
            return true;
        });

        const candlesticks = filtered.map((x) => {
            return new Candlestick({
                startTime: new Date(x[0]),
                open: x[1],
                high: x[2],
                low: x[3],
                close: x[4],
                interval: intervalToSeconds(this.interval),
                volume: x[5],
                closed: true
            });
        });

        return candlesticks;
    }

    // Batch requests each with max 300 data points
    createRequests() {
        const max_dpr = 300;    // max datapoints per request

        const delta = (parseInt(this.end) - parseInt(this.start));  // seconds
        const interval_s = intervalToSeconds(this.interval);        // '1m', '5m', '15m'... equivalents
        const numberIntervals = delta / interval_s;                 // number of '1m', '5m', ... intervals in the delta 
                                                                    // (e.g. there are 288 '5m' intervals in 24h)
        const numberRequests = Math.ceil(numberIntervals / max_dpr);
        // console.log('numberRequests: ', numberRequests);

        // build an array of intervals i.e. [{ start1, end1 }, { start2, end2 }, ... ]
        const intervals = Array(numberRequests).fill().map((_, index) => {
            const size = intervalToSeconds(this.interval) * max_dpr * 1e3; // 25h
            const start = new Date(this.start*1e3 + (index * size));
            const end = index + 1 === numberRequests 
                            ? new Date(this.end*1e3) : new Date(start.getTime() + size);
            return { start, end };
        });

        return intervals;
    }

    // Process each interval for batch requesting
    async performIntervals(intervals) {
        if (intervals.length == 0) { return [] }

        const interval = intervals[0];
        // console.log('interval: ', interval);

        const result = await this.performRequest(interval);
        await timeout(300);  // delay according to rate limit

        // recursively obtain results 
        return result.concat(await this.performIntervals(intervals.slice(1)));
    }

    // Perform the actual API query
    async performRequest({ start, end }) {
        // using Binance API
        const results = await getKlines(this.market, this.interval, start.getTime(), end.getTime());
        return results;
    }
}

module.exports = HistoricalService;