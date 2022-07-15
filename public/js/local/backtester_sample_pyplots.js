

function testPlot() {
    // Plot 0 and 2 share the same x-axis labels

    // subplot traces 
    // [ 2, 3 ]
    // [ 0, 1 ]

    var trace0 = {
        x: [1, 2, 3],
        y: [2, 3, 4],
        type: 'scatter'
    };
      
    var trace1 = {
        x: [20, 30, 40],
        y: [5, 5, 5],
        xaxis: 'x2',
        yaxis: 'y',
        type: 'scatter'
    };
      
    var trace2 = {
        x: [2, 3, 4],
        y: [600, 700, 800],
        xaxis: 'x',
        yaxis: 'y3',
        type: 'scatter'
    };
      
    var trace3 = {
        x: [4000, 5000, 6000],
        y: [7000, 8000, 9000],
        xaxis: 'x4',
        yaxis: 'y4',
        type: 'scatter'
    };
      
    var data = [trace0, trace1, trace2, trace3];
      
    var layout = {
        grid: {
            rows: 2,
            columns: 2,
            subplots:[['xy','x2y'], ['xy3','x4y4']],
            roworder:'bottom to top'
        }
    };
      
    Plotly.newPlot('chartContainer', data, layout);
}

function testPlot2() {
    // Plot 0 and 2 use independent x-axis labels

    // subplot traces 
    // [ 2, 3 ]
    // [ 0, 1 ]

    var trace0 = {
        x: [1, 2, 3],
        y: [2, 3, 4],
        type: 'scatter'
    };
      
    var trace1 = {
        x: [20, 30, 40],
        y: [5, 5, 5],
        xaxis: 'x2',
        yaxis: 'y',
        type: 'scatter'
    };
      
    var trace2 = {
        x: [2, 3, 4],
        y: [600, 700, 800],
        xaxis: 'x5',
        yaxis: 'y3',
        type: 'scatter'
    };
      
    var trace3 = {
        x: [4000, 5000, 6000],
        y: [7000, 8000, 9000],
        xaxis: 'x4',
        yaxis: 'y4',
        type: 'scatter'
    };
      
    var data = [trace0, trace1, trace2, trace3];
      
    var layout = {
        grid: {
            rows: 2,
            columns: 2,
            subplots:[['xy','x2y'], ['x5y3','x4y4']],
            roworder:'bottom to top'
        }
    };
      
    Plotly.newPlot('chartContainer', data, layout);
}


function testPlot3() {
    // Plot 2 and 3 use independent y-axis labels

    // subplot traces 
    // [ 2, 3 ]
    // [ 0, 1 ]

    var trace0 = {
        x: [1, 2, 3],
        y: [2, 3, 4],
        type: 'scatter'
    };
      
    var trace1 = {
        x: [20, 30, 40],
        y: [5, 5, 5],
        xaxis: 'x2',
        yaxis: 'y',
        type: 'scatter'
    };
      
    var trace2 = {
        x: [2, 3, 4],
        y: [600, 700, 800],
        xaxis: 'x5',
        yaxis: 'y3',
        type: 'scatter'
    };
      
    var trace3 = {
        x: [4000, 5000, 6000],
        y: [7000, 8000, 9000],
        xaxis: 'x4',
        yaxis: 'y3',
        type: 'scatter'
    };

    var trace4 = {
        x: [4500, 5500, 6500],
        y: [2000, 4000, 3000],
        xaxis: 'x4',
        yaxis: 'y3',
        type: 'scatter'
    };
      
    var data = [trace0, trace1, trace2, trace3, trace4];
      
    var layout = {
        grid: {
            rows: 2,
            columns: 2,
            subplots:[['xy','x2y'], ['x5y3','x4y3']],
            roworder:'bottom to top'
        }
    };
      
    Plotly.newPlot('chartContainer', data, layout);
}


function testPlot4() {
    // Plot 0 and 2 share the same x-axis labels

    // subplot traces 
    // [ 2, 3 ]
    // [ 0, 1 ]

    var trace0 = {
        x: [1, 2, 3],
        y: [2, 3, 4],
        type: 'scatter',
        xaxis: 'x', 
        yaxis: 'y'
    };

    var trace3 = {
        x: [1, 2, 3],
        y: [7000, 8000, 9000],
        xaxis: 'x',
        yaxis: 'y2',
        type: 'scatter'
    };
      
    var trace2 = {
        x: [2, 3, 4],
        y: [600, 700, 800],
        xaxis: 'x',
        yaxis: 'y3',
        type: 'scatter'
    };
      
    var data = [trace0, trace2, trace3];
      
    // var layout = {
    //     grid: {
    //         rows: 2,
    //         columns: 1,
    //         subplots:[['xy'], ['xy3']],
    //         roworder:'top to bottom',
    //         yaxes:[['y','y2'], ['y']],
    //         yside: [['left', 'right'], ['left']]
    //     }
    // };

    var layout = {
        grid: {
            rows: 2, 
            columns: 1, 
            subplots:[['xy'], ['xy3']],
            roworder:'bottom to top' 
        },
        dragmode: 'zoom', 
        margin: {
            r: 50, 
            t: 25, 
            b: 40, 
            l: 60
        }, 
        showlegend: false, 
        // xaxis: {
        //     // domain: [0, 1],
        //     // autorange: true, 
        //     rangeslider: { visible: false },
        //     title: 'Date', 
        //     // type: 'date'
        // }, 
        // // xaxis2: {
        // //     // domain: [0, 1],
        // //     // autorange: true, 
        // //     rangeslider: { visible: false },
        // //     title: 'Date', 
        // //     // type: 'date'
        // // }, 
        yaxis: {
            // domain: [0, 0.5],
            title: 'Price',
            autorange: true, 
            type: 'linear',
            // overlaying: 'y2',
        },
        yaxis2: {
            // domain: [0.5, 1],
            title: 'Volume',
            side: 'right'
        },
        // // yaxis3: {
        // //     domain: [1, 1],
        // //     title: 'Volume2',
        // //     // titlefont: {color: 'rgb(148, 103, 189)'},
        // //     // tickfont: {color: 'rgb(148, 103, 189)'},
        // //     side: 'right'
        // // },
        // shapes: [drawEnclosingRectangle(dateRangeMin, dateRangeMax), ...sar_shapes],
    };
      
    Plotly.newPlot('chartContainer', data, layout);
}


function testPlot5() {
    // Plot 0 and 2 have independent x-axis labels

    // subplot traces 
    // [ 2, 3 ]
    // [ 0, 1 ]

    var trace0 = {
        x: [1, 2, 3],
        y: [2, 3, 4],
        type: 'scatter',
        xaxis: 'x', 
        yaxis: 'y'
    };

    var trace2 = {
        x: [2, 3, 4],
        y: [600, 700, 800],
        xaxis: 'x2',                // <--- note this for independent x-axes
        yaxis: 'y2',
        type: 'scatter'
    };

    var trace3 = {
        x: [1, 2, 3],
        y: [7000, 2000, 9000],
        xaxis: 'x',
        yaxis: 'y3',
        type: 'scatter'
    };
      
    var data = [trace0, trace2, trace3];

    var layout = {
        dragmode: 'zoom', 
        margin: {
            r: 50, 
            t: 25, 
            b: 40, 
            l: 60
        }, 
        showlegend: false, 
        xaxis: {
            domain: [0, 1],
            rangeslider: { visible: false },
            title: 'Date', 
            // type: 'date'
        }, 
        xaxis2: {
            domain: [0, 1],
            // autorange: true, 
            // rangeslider: { visible: false },
            anchor: 'y2',
            title: 'Date', 
            // type: 'date'
        }, 
        yaxis: {
            domain: [0.50, 1],
            title: 'Price',
            type: 'linear',
        },
        yaxis3: {
            domain: [0.55, 1],
            title: 'Volume2',
            type: 'linear',
            overlaying: 'y',
            side: 'right'
        },
        yaxis2: {
            domain: [0, 0.35],
            title: 'Volume',
        },
        // shapes: [drawEnclosingRectangle(dateRangeMin, dateRangeMax), ...sar_shapes],
    };
      
    Plotly.newPlot('chartContainer', data, layout);
}


function testPlot6() {
    // Plot 0 and 2 share the same x-axis labels

    // subplot traces 
    // [ 2, 3 ]
    // [ 0, 1 ]

    var trace0 = {
        x: [1, 2, 3],
        y: [2, 3, 4],
        type: 'scatter',
        xaxis: 'x', 
        yaxis: 'y'
    };

    var trace2 = {
        x: [2, 3, 4],
        y: [600, 700, 800],
        xaxis: 'x',
        yaxis: 'y2',
        type: 'scatter'
    };

    var trace3 = {
        x: [1, 2, 3],
        y: [7000, 2000, 9000],
        xaxis: 'x',
        yaxis: 'y3',
        type: 'scatter',
        line: {color: 'rgba(168, 117, 50, 0.4)'},  // control opacity here
    };
      
    var data = [trace0, trace2, trace3];

    var layout = {
        dragmode: 'zoom', 
        margin: {
            r: 20, 
            t: 25, 
            b: 40, 
            l: 60
        }, 
        showlegend: false, 
        xaxis: {
            domain: [0, 0.9],
            rangeslider: { visible: false },
            title: 'Date', 
        }, 
        xaxis2: {
            domain: [0, 0.9],
            anchor: 'y2',
            title: 'Date', 
        }, 
        yaxis: {
            domain: [0.50, 1],
            title: 'Price',
            type: 'linear',
        },
        yaxis3: {
            domain: [0.50, 1],
            title: {
                text: 'Volume3',
                standoff: 15
            },
            type: 'linear',
            overlaying: 'y',
            side: 'right',
            automargin: true
        },
        yaxis2: {
            domain: [0, 0.35],
            title: 'Volume',
        },
        shapes: [
            {
                type: 'rect',
                xref: 'x',
                yref: 'y',
                x0: 1,
                y0: 0,
                x1: 4,
                y1: 4,
                fillcolor: '#d3d3d3',
                opacity: 0.2,
                line: {
                    width: 0
                }
            },
            {
                type: 'line',
                x0: 1,    
                y0: 2.7,
                x1: 4,
                y1: 2.7,
                opacity: 0.6,
                line: {
                    color: '#ff3300',
                    width: 1,
                }
            },
            {
                type: 'line',
                x0: 1,    
                y0: 3.8,
                x1: 4,
                y1: 2.7,
                opacity: 0.6,
                line: {
                    color: '#00cc99',
                    width: 1,
                }
            },
        ],
    };
      
    Plotly.newPlot('chartContainer', data, layout);
}