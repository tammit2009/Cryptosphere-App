const tulind = require('tulind');
const { promisify } = require('util');

// promisify functions 
const sma_async = promisify(tulind.indicators.sma.indicator);
const ema_async = promisify(tulind.indicators.ema.indicator);
const rsi_async = promisify(tulind.indicators.rsi.indicator);
const macd_async = promisify(tulind.indicators.macd.indicator);

const sma_inc = async (data) => {

    // only need the close values
    const d1 = data.map((d) => d.close);
    const results = await sma_async([d1], [100]); // close, period=100

    // determine NaN entries
    const d2 = results[0];
    const diff = data.length - d2.length; 

    // create original sized array, setting the first NaN entries
    const emptyArray = [...new Array(diff)].map((d) => '');
    // then the result entries
    const d3 = [...emptyArray, ...d2];

    // add this to the original array as the sma key
    data = data.map((d, i) => ({ ...d, sma: d3[i] }));

    // console.log(data);

    return data;
};

const ema_inc = async (data) => {

    // only need the close values
    const d1 = data.map((d) => d.close);
    const results = await ema_async([d1], [21]); // close, period=21

    // determine NaN entries
    const d2 = results[0];
    const diff = data.length - d2.length; 

    // create original sized array, setting the first NaN entries
    const emptyArray = [...new Array(diff)].map((d) => '');
    // then the result entries
    const d3 = [...emptyArray, ...d2];

    // add this to the original array as the sma key
    data = data.map((d, i) => ({ ...d, ema: d3[i] }));

    // console.log(data);

    return data;
};

const rsi_inc = async (data) => {

    // only need the close values
    const d1 = data.map((d) => d.close);
    const results = await rsi_async([d1], [21]); // close, period=21

    // determine NaN entries
    const d2 = results[0];
    const diff = data.length - d2.length; 

    // create original sized array, setting the first NaN entries
    const emptyArray = [...new Array(diff)].map((d) => '');
    // then the result entries
    const d3 = [...emptyArray, ...d2];

    // add this to the original array as the sma key
    data = data.map((d, i) => ({ ...d, rsi: d3[i] }));

    // console.log(data);

    return data;
};

const macd_inc = async (data) => {

    // only need the close values
    const d1 = data.map((d) => d.close);
    const results = await macd_async([d1], [12, 26, 9]); // close, periods=12, 26, 9

    // determine NaN entries
    const diff = data.length - results[0].length; 

    // create original sized array, setting the first NaN entries
    const emptyArray = [...new Array(diff)].map((d) => '');

    // then the result entries
    const macd1 = [...emptyArray, ...results[0]];
    const macd2 = [...emptyArray, ...results[1]];
    const macd3 = [...emptyArray, ...results[2]];

    // add this to the original array as the sma key
    data = data.map((d, i) => ({ 
        ...d, 
        macd_fast: macd1[i],
        macd_slow: macd2[i],
        macd_histogram: macd3[i]
    }));

    // console.log(data);

    return data;
};

const markers_inc = (data) => {
    
    data = data.map((d, i, arr) => {

        if (i > 0) {	
            // EMA21 crosses over SMA100 - LONG
            const long = arr[i].ema > arr[i].sma && arr[i-1].ema < arr[i-1].sma ? true : false;
            
            // EMA21 crosses under SMA100 - SHORT
            const short = arr[i].ema < arr[i].sma && arr[i-1].ema > arr[i-1].sma ? true : false;

            return { ...d, long, short };
        }
        else {
            return { ...d, long: false, short: false }; // TODO: confirm the initial conditions
        }

    });

    return data;
}

const sma_vol_inc = async (data) => {

    // only need the volume values
    const d1 = data.map((d) => d.volume);
    const results = await sma_async([d1], [21]); // volume, period=21

    // determine NaN entries
    const d2 = results[0];
    const diff = data.length - d2.length; 

    // create original sized array, setting the first NaN entries
    const emptyArray = [...new Array(diff)].map((d) => '');
    // then the result entries
    const d3 = [...emptyArray, ...d2];

    // add this to the original array as the sma key
    data = data.map((d, i) => ({ ...d, sma_vol: d3[i] }));

    // console.log(data);

    return data;
};

// price change per unit volume
const pchgpuv_inc = async (data) => {

    let dprevious = 0.0;
    const d1 = data.map((d, i) => {
        if (i > 0) {
            const pchgpuv = ((d.close - dprevious)/(d.volume + 1)) * 100; // to avoid div-by-zero error
            dprevious = d.close;
            return pchgpuv;  
        }
        else {
            dprevious = d.close;
            return 0.0;
        }
    });

    // add this to the original array as the sma key
    data = data.map((d, i) => ({ ...d, pchgpuv: d1[i] }));

    // only need the volume values
    const d2 = data.map((d) => d.pchgpuv);
    const results = await sma_async([d2], [5]); // volume, period=5

    // determine NaN entries
    const d3 = results[0];
    const diff = data.length - d3.length; 

    // create original sized array, setting the first NaN entries
    const emptyArray = [...new Array(diff)].map((d) => '');
    // then the result entries
    const d4 = [...emptyArray, ...d3];

    // add this to the original array as the sma key
    data = data.map((d, i) => ({ ...d, sma_pchgpuv: d4[i] }));

    // console.log(data);

    return data;
};


module.exports = {
    sma_inc,
    ema_inc,
    rsi_inc,
    macd_inc,
    markers_inc,
    sma_vol_inc,
    pchgpuv_inc
}