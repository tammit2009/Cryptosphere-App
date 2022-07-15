
function timestampToFmtDatetime(ts) {
    // fn
    const plus0 = num => `0${num.toString()}`.slice(-2);

    var d = new Date(ts);

    const year = d.getFullYear();
    const month = plus0(d.getMonth() + 1);
    const date = plus0(d.getDate());
    const hour = plus0(d.getHours());
    const minute = plus0(d.getMinutes());
    const second = plus0(d.getSeconds());
    const rest = ts.toString().slice(-5);

    return (
        // format: '2020-04-05 16:39'                 // format: '2020-04-05_16:39:45.85725'
        `${year}-${month}-${date} ${hour}:${minute}`  // `${year}-${month}-${date}_${hour}:${minute}:${second}.${rest}`
    );
};

function getSupportResistancePoints(point, pointType, dateRangeMin, dateRangeMax) {
    return {
        type: 'line',
        xref: 'x',
        yref: 'y',
        x0: dateRangeMin,    
        y0: point,
        x1: dateRangeMax,
        y1: point,
        opacity: 0.6,
        line: {
            color: pointType == 'Resistance' ? '#ff3300' : '#00cc99',
            width: 1,
        }
    }
}

function drawEnclosingRectangle(dateRangeMin, dateRangeMax) {
    return {
        type: 'rect',
        xref: 'x',
        yref: 'y',
        x0: dateRangeMin,
        y0: 0,                  // <--- min of y range required
        x1: dateRangeMax,
        y1: 1,                  // <--- max of y range required
        fillcolor: '#d3d3d3',
        opacity: 0.2,
        line: {
            width: 0
        }
    }
}

function getDateRange(dtArr) {
    const dates = dtArr.map((dt) => new Date(dt));

    const min = dates.reduce(function (a, b) { return a < b ? a : b; }); 
    const max = dates.reduce(function (a, b) { return a > b ? a : b; });

    // Pad the time
    let minTs = min.getTime() - 5 * 60 * 1e3;  // subtract 5 mins
    let maxTs = max.getTime() + 5 * 60 * 1e3;  // add 5 mins

    const dateRangeMin = timestampToFmtDatetime(minTs); // '2022-07-14 08:45';
    const dateRangeMax = timestampToFmtDatetime(maxTs); // '2022-07-14 12:55';

    return { dateRangeMin, dateRangeMax };
}

function plotSupportResistance(rcvdata) {

    // console.log(rcvdata);

    let dtm = rcvdata.output.map((dt) => {
        return timestampToFmtDatetime(dt.Time);
    });
    const { dateRangeMin, dateRangeMax } = getDateRange(dtm);

    let opens = rcvdata.output.map((dt) => dt.Open);
    let highs = rcvdata.output.map((dt) => dt.High);
    let lows = rcvdata.output.map((dt) => dt.Low);
    let closes = rcvdata.output.map((dt) => dt.Close);
    let volumes = rcvdata.output.map((dt) => dt.Volume);

    let dirs = closes.map((close, i) => {
        if (i > 0) {
            if (close > closes[i-1]) return 1;
            else return -1;
        }
        return 0;
    });

    let resistance = rcvdata.sar.resistance;
    let support = rcvdata.sar.support;

    let resistance_lines = resistance.map((r) => getSupportResistancePoints(r, 'Resistance', dateRangeMin, dateRangeMax));
    let support_lines    = support.map((s) => getSupportResistancePoints(s, 'Support', dateRangeMin, dateRangeMax));
    let sar_shapes = [...support_lines, ...resistance_lines];

    // Display Chart
    var trace1 = {
        x: dtm,
        close: closes,
        high: highs,
        low: lows,
        open: opens,
        decreasing: { line: {color: '#ff3300'} },
        increasing: { line: {color: '#00cc99'} }, 
        line: {color: 'rgba(31,119,180,1)'}, 
        type: 'candlestick', 
        xaxis: 'x', 
        yaxis: 'y'
    };

    var trace2 = {
        x: dtm,
        y: volumes,
        marker: {
            color: dirs.map(dir => (dir !== 0 ? (dir === 1 ? '#00cc99' : '#ff3300') : '#ccc')),
            opacity: 0.4
        },
        type: 'bar', 
        xaxis: 'x', 
        yaxis: 'y2',
    };

    var trace3 = {
        x: dtm,
        y: volumes,
        marker: {
            color: dirs.map(dir => (dir !== 0 ? (dir === 1 ? '#00cc99' : '#ff3300') : '#ccc')),
            opacity: 0.8
        },
        type: 'bar', 
        xaxis: 'x', 
        yaxis: 'y3',
    };

    // Set the traces
    var data = [trace1, trace2, trace3];

    var layout = {
        // title: "Candlestick Chart",
        height: 600,
        dragmode: 'zoom', 
        margin: {
          r: 50, 
          t: 25, 
          b: 40, 
          l: 60
        }, 
        showlegend: false, 
        xaxis: {
            domain: [0, 0.9],
            autorange: true, 
            range: [dateRangeMin, dateRangeMax], 
            rangeslider: { visible: false },
            title: 'Date', 
            type: 'date'
        }, 
        xaxis2: {
            domain: [0, 0.9],
            anchor: 'y3',
            autorange: true, 
            range: [dateRangeMin, dateRangeMax], 
            rangeslider: { visible: false },
            title: 'Date', 
            type: 'date'
        }, 
        yaxis: {
            domain: [0.40, 1],
            title: {
                text: 'Price',
                standoff: 15   // px
            },
            titlefont: {color: 'rgb(148, 103, 189)'},
            tickfont: {color: 'rgb(148, 103, 189)'},
            autorange: true, 
            type: 'linear',
            overlaying: 'y2',
        },
        yaxis2: {
            domain: [0.40, 1],
            title: {
                text: 'Volume',
                standoff: 15   // px
            },
            titlefont: {color: 'rgb(148, 103, 189)'},
            tickfont: {color: 'rgb(148, 103, 189)'},
            side: 'right',
            type: 'linear',
            automargin: true
        },
        yaxis3: {
            domain: [0, 0.30],
            title: {
                text: 'Volume',
                standoff: 15   // px
            },
            titlefont: {color: 'rgb(148, 103, 189)'},
            tickfont: {color: 'rgb(148, 103, 189)'},
        },
        // shapes: [drawEnclosingRectangle(dateRangeMin, dateRangeMax), ...sar_shapes],
        shapes: [...sar_shapes],
    };

    Plotly.newPlot('chartContainer', data, layout);

}
