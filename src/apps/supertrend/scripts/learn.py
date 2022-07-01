import ccxt
import json
import ta
import schedule
import pandas as pd
from ta.volatility import BollingerBands, AverageTrueRange
import sys, os

dir = os.path.dirname(__file__)
filepath = os.path.join(dir, '../../../../config/keys.json')
f = open(filepath)
data = json.load(f)
f.close()

api_key = data['BINANCE_API_KEY']
secret_key = data['BINANCE_API_SECRET']

# print(dir(ccxt))  # print the attributes of ccxt
# for exchange in ccxt.exchanges:  # list of exchanges
#     print(exchange)

exchange = ccxt.binance()
# print(exchange)

markets = exchange.load_markets()
# for market in markets:              # list of market
#     print(market)

# ticker = exchange.fetch_ticker('ZEN/USDT')
# print(ticker)

ohlc = exchange.fetch_ohlcv('BTC/BUSD', timeframe='15m', limit=5)
# print(ohlc)
# for candle in ohlc:
#     print(candle)

order_book = exchange.fetch_order_book('ETH/USDT')
# print(order_book)

exchange = ccxt.binance({
    'apiKey': api_key,
    'secret': secret_key
})

balances = exchange.fetch_balance()
# print(balances)

# print(balances['total']['USDT'])
# print(balances['total']['BTC'])
# print(balances['total']['ETH'])
# print(balances['total']['BUSD'])
# print(balances['total']['BNB'])

# # buy some ethereum
# # order = exchange.create_market_buy_order('ETH/USDT', 0.005)
# # print(order)


# ### Using technical analysis lib ###

bars = exchange.fetch_ohlcv('BTC/BUSD', limit=21)
# for bar in bars:
#     print(bar)

# use all the bars except the last one (bars[:-1])
df = pd.DataFrame(bars[:-1], columns=['timestamp', 'open', 'high', 'low', 'close', 'volume']) 
# print(df)

bb_indicator = BollingerBands(df['close'])

df['upper_band'] = bb_indicator.bollinger_hband()
df['lower_band'] = bb_indicator.bollinger_lband()
df['moving_average'] = bb_indicator.bollinger_mavg()

# default 14 period atr
atr_indicator = AverageTrueRange(df['high'], df['low'], df['close'])
df['atr'] = atr_indicator.average_true_range()

print(df)
