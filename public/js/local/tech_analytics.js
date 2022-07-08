
const base_url = 'http://localhost:5000';  

// vars
const domElement        = document.getElementById('ta_chart');
const selectIntervalEl    = document.getElementById('selectInterval');
const selectSymbolEl    = document.getElementById('selectSymbol');
const btnSubmitSymbolEl = document.getElementById('btnSubmitSymbol');

const getData = async () => {

    const interval = selectIntervalEl.value;
    const symbol = selectSymbolEl.value;

    const resp = await fetch(`${base_url}/api/v1/tech_analytics/${symbol}/${interval}`);
    const data = await resp.json();

    // console.log(data);
    
    return data;
}

// getData()

// add event listeners
btnSubmitSymbolEl.addEventListener('click', () => renderChart());

const chartProperties = {
    timeScale: {
        timeVisible: true,
        secondsVisible: true,
    },
    // width: 1000,
    // height: 400,
    pane: 0
};

let chart;

const renderChart = async () => {

    if (chart) chart.remove();

    chart = LightweightCharts.createChart(domElement, chartProperties);
    
    const candleseries = chart.addCandlestickSeries();
    const klinedata = await getData();
    candleseries.setData(klinedata);

    // SMA
    const sma_series = chart.addLineSeries({ color: 'red', lineWidth: 1 });
    const sma_data = klinedata.filter((d) => d.sma).map((d) => ({ time: d.time, value: d.sma }));
    sma_series.setData(sma_data);

    // EMA
    const ema_series = chart.addLineSeries({ color: 'green', lineWidth: 1 });
    const ema_data = klinedata.filter((d) => d.ema).map((d) => ({ time: d.time, value: d.ema }));
    ema_series.setData(ema_data);

    // RSI
    const rsi_series = chart.addLineSeries({ color: 'purple', lineWidth: 1, pane: 1 });
    const rsi_data = klinedata.filter((d) => d.rsi).map((d) => ({ time: d.time, value: d.rsi }));
    rsi_series.setData(rsi_data);

    // MACD FAST
    const macd_fast_series = chart.addLineSeries({ color: 'blue', lineWidth: 1, pane: 2 });
    const macd_fast_data = klinedata.filter((d) => d.macd_fast).map((d) => ({ time: d.time, value: d.macd_fast }));
    macd_fast_series.setData(macd_fast_data);

    // MACD SLOW
    const macd_slow_series = chart.addLineSeries({ color: 'red', lineWidth: 1, pane: 2 });
    const macd_slow_data = klinedata.filter((d) => d.macd_slow).map((d) => ({ time: d.time, value: d.macd_slow }));
    macd_slow_series.setData(macd_slow_data);

    // MACD HISTOGRAM
    const macd_histogram_series = chart.addHistogramSeries({ pane: 2 });
    const macd_histogram_data = klinedata.filter((d) => d.macd_histogram).map((d) => ({ 
                time: d.time, value: d.macd_histogram, color:  d.macd_histogram > 0 ? 'green' : 'red' }));
    macd_histogram_series.setData(macd_histogram_data);

    // VOLUME 
    const vol_series = chart.addHistogramSeries({ color: 'purple', lineWidth: 1, pane: 3 });
    const vol_data = klinedata.filter((d) => d.volume).map((d) => ({ time: d.time, value: d.volume }));
    vol_series.setData(vol_data);

    // SMA VOLUME
    const sma_vol_series = chart.addLineSeries({ color: 'red', lineWidth: 2, pane: 3 });
    const sma_vol_data = klinedata.filter((d) => d.sma_vol).map((d) => ({ time: d.time, value: d.sma_vol }));
    sma_vol_series.setData(sma_vol_data);

    // PCHGPUV - Price Change per unit Volume
    const pchgpuv_series = chart.addLineSeries({ color: 'blue', lineWidth: 2, pane: 4 });
    const pchgpuv_data = klinedata.filter((d) => d.pchgpuv).map((d) => ({ time: d.time, value: d.pchgpuv }));
    pchgpuv_series.setData(pchgpuv_data);

    // SMA PCHGPUV - SMA of Price Change per unit Volume
    const sma_pchgpuv_series = chart.addLineSeries({ color: 'red', lineWidth: 2, pane: 4 });
    const sma_pchgpuv_data = klinedata.filter((d) => d.sma_pchgpuv).map((d) => ({ time: d.time, value: d.sma_pchgpuv }));
    sma_pchgpuv_series.setData(sma_pchgpuv_data);

    // // MARKERS
    // candleseries.setMarkers(
    //     klinedata.filter((d) => d.long || d.short)
    //         .map((d) => (
    //             d.long ? {
    //                 time: d.time,
    //                 position: 'belowBar',
    //                 color: 'green',
    //                 shape: 'arrowUp',
    //                 text: 'LONG'
    //             }
    //             : {
    //                 time: d.time,
    //                 position: 'aboveBar',
    //                 color: 'red',
    //                 shape: 'arrowDown',
    //                 text: 'SHORT'
    //             }
    //         ))
    // );    

    // // SUPPORT/RESISTANCE LINES
    // const resistanceLine = candleseries.createPriceLine({
    //     price: 30083,
    //     color: 'red',
    //     lineWidth: 2,
    //     // lineStyle: LightweightCharts.lineStyle.Solid,
    //     title: 'Resistance Line'
    // });

    // const supportLine = candleseries.createPriceLine({
    //     price: 29731,
    //     color: 'green',
    //     lineWidth: 2,
    //     // lineStyle: LightweightCharts.lineStyle.Solid,
    //     title: 'Support Line'
    // });

    // // OHLC VALUES
    // chart.subscribeCrosshairMove((param) => {
    //     const ohlc = param.seriesPrices.get(candleseries);
    //     const rsi = param.seriesPrices.get(rsi_series);
    //     if (ohlc) renderOHLC(ohlc);
    //     if (rsi) renderRSI(rsi);
    // });

    // // CONDITIONAL BACKGROUND
    // const conditional_bgd_series = chart.addHistogramSeries({
    //     pane: 0,
    //     lineWidth: 0,
    //     priceScaleId: 'cpcid1',
    //     base: 1
    // });
    // const conditional_bgd_data = klinedata.map((d, i) => (
    //     i < 100
    //         ? { time: d.time, value: 0, color: 'rgba(255, 0, 0, 0.1)' }
    //         : i < 200
    //         ? { time: d.time, value: 0, color: 'rgba(0, 255, 0, 0.1)' }
    //         : { time: d.time, value: 0, color: 'rgba(255, 0, 0, 0)' }
    // ));
    // conditional_bgd_series.setData(conditional_bgd_data);
    // chart
    //     // .priceScaleId('cpcid1')
    //     .applyOptions({ scaleMargin: { bottom: 0, top: 0 }});

};

// const renderOHLC = (d) => {
//     const { open, high, low, close } = d;
//     const markup = `<p>O<span class="${ 
//         open > close ? 'red' : 'green' 
//     }">${open}</span> H<span class="${ 
//         open > close ? 'red' : 'green' 
//     }">${high}</span> L<span class="${ 
//         open > close ? 'red' : 'green' 
//     }">${low}</span> C<span class="${ 
//         open > close ? 'red' : 'green' 
//     }">${close}</span></p>`;
//     document.getElementById('ohlc').innerHTML = markup;
// };

// const renderRSI = (d) => {
//     const markup = `<p>${d.toFixed(2)}</p>`;
//     document.getElementById('rsi').innerHTML = markup;
// }

renderChart()

