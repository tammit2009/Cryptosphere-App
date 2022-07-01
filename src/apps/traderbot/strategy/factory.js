const Simple    = require('./strategies/simple');
// const MACD      = require('./strategies/simpleMACD');
// const Xsimple   = require('./strategies/xsimple');
// const RSI01     = require('./strategies/simpleRSI_1');
// const SlowFastMA     = require('./simpleSlowFastSMA');

// type of strategy: 'simple', 'macd', ...
// signalsData object: { onBuySignal, onSellSignal } as input to Strategy class

exports.create = function(type, signalsData) { 
    switch (type) {
        case 'simple':
            return new Simple(signalsData);
        // case 'macd':
        //     return new MACD(signalsData);
        // case 'xsimple':
        //     return new Xsimple(signalsData);
        // case 'rsi01':
        //     return new RSI01(signalsData);
        // case 'slowfastma':
        //     return new SlowFastMA(signalsData);
        default:
            return new Simple(signalsData);
    }
}