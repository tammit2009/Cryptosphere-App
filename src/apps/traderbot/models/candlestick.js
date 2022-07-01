class Candlestick {
    constructor({
        low, high, close, open, interval, startTime = new Date(), volume, closed
    }) {
        this.startTime = startTime;
        this.interval = interval;
        this.open = open;
        this.high = high;
        this.low = low;
        this.close = close;
        this.volume = volume || 1e-5;
        this.state = closed ? 'closed' : 'open';
    }

    average() {
        return (this.close + this.high + this.low) / 3;
    }

    onPrice({ open, high, low, close, volume, time = new Date(), closed }) {
        if (this.state === 'closed') { throw new Error('Trying to add to closed candlestick') };

        this.open = open; 
        this.high = high; 
        this.low = low; 
        this.close = close; 
        this.volume = volume; 
        this.state = closed ? 'closed' : 'open'; 
        
        // this.volume + volume
        // if (this.high < price) { this.high = price }
        // if (this.low > price ) { this.close = price }
        // this.close = price;

        // Guard
        // const delta = (time - this.startTime) * 1e-3;
        // console.log('delta: ', delta);
        // if (delta > this.interval) {
        //     this.state = 'closed';
        // }
    }
}

module.exports = Candlestick;