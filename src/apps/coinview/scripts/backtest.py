import backtrader as bt
from pathlib import Path

class RSIStrategy(bt.Strategy):

    def __init__(self):
        self.rsi = bt.talib.RSI(self.data, period=14)

    def next(self):
        if self.rsi < 30 and not self.position:
            self.buy(size=1)

        if self.rsi > 70 and self.position:
            self.close()

# cerebro = bt.Cerebro()

# base_path = Path(__file__).parent
# file_path = (base_path / "../data/BTCUSDT_01JAN2022_20MAY2022_1day.csv").resolve()

# data = bt.feeds.GenericCSVData(dataname=file_path, dtformat=2) # dtformat => dateformat float

# cerebro.adddata(data)

# cerebro.addstrategy(RSIStrategy)

# cerebro.run()

# cerebro.plot()
