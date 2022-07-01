import ccxt
import json 
import schedule
import pandas as pd 
import numpy as np
from datetime import datetime
import time
import json
import sys, os
pd.set_option('display.max_rows', None)   # display as many rows required

# pd.options.mode.chained_assignment = None # disable chained assignments
import warnings 
warnings.filterwarnings('ignore')

dir = os.path.dirname(__file__)
filepath = os.path.join(dir, '../../../../config/keys.json')
f = open(filepath)
data = json.load(f)
f.close()

api_key = data['BINANCE_API_KEY']
secret_key = data['BINANCE_API_SECRET']

exchange = ccxt.binance({
    'apiKey': api_key,
    'secret': secret_key
})

balances = exchange.fetch_balance()

print(f"USDT: {balances['total']['USDT']}")
print( f"BTC: {balances['total']['BTC']}")
print( f"ETH: {balances['total']['ETH']}")
print( f"BUSD: {balances['total']['BUSD']}")
print( f"BNB: {balances['total']['BNB']}")

# calculate the True Range
def tr(df):
    df['previous_close'] = df['close'].shift(1)  # required to compute TR
    df['high-low'] = df['high'] - df['low']
    df['high-pc'] = abs(df['high'] - df['previous_close'])
    df['low-pc'] = abs(df['low'] - df['previous_close'])
    tr = df[['high-low', 'high-pc', 'low-pc']].max(axis=1)
    return tr

# calculate the average true range
def atr(df, period=14):
    df['tr'] = tr(df) 
    # print('calculate average true range')
    the_atr = df['tr'].rolling(period).mean()
    return the_atr

# calculate the supertrend
def supertrend(df, period=14, multiplier=3):
    hl2 = ((df['high'] + df['low']) / 2)
    df['atr'] = atr(df, period=period)
    df['upperband'] = hl2 + (multiplier * df['atr']) # basic upperband
    df['lowerband'] = hl2 - (multiplier * df['atr']) # basic lowerband
    df['in_uptrend'] = True

    for current in range(1, len(df.index)):
        previous = current - 1

        if df['close'][current] > df['upperband'][previous]:
            df['in_uptrend'][current] = True 
        elif df['close'][current] < df['lowerband'][previous]:
            df['in_uptrend'][current] = False 
        else:
            df['in_uptrend'][current] = df['in_uptrend'][previous]

            if df['in_uptrend'][current] and df['lowerband'][current] < df['lowerband'][previous]:
                df['lowerband'][current] = df['lowerband'][previous]
        
            if not df['in_uptrend'][current] and df['upperband'][current] > df['upperband'][previous]:
                df['upperband'][current] = df['upperband'][previous]

    return df

in_position = False

def check_buy_sell_signals(df):
    global in_position

    print('checking for buys and sells')

    # check the last two frames
    # print(df.tail(2))
    last_row_index = len(df.index) - 1
    previous_row_index = last_row_index - 1

    # #### for testing force a buy ##############

    # df['in_uptrend'][last_row_index] = True 

    # #### for testing force a sell #############

    # df['in_uptrend'][previous_row_index] = True 
    # df['in_uptrend'][last_row_index] = False 

    # ###########################################

    if not df['in_uptrend'][previous_row_index] and df['in_uptrend'][last_row_index]:
        print('changed to uptrend')
        if not in_position:
            print('buy, buy, buy')

            # order = exchange.create_market_buy_order('ETH/USDT', 0.005)
            # print(order)

            in_position = True
        else:
            print("already in position, nothing to do")

    elif df['in_uptrend'][previous_row_index] and not df['in_uptrend'][last_row_index]:
        print('changed to downtrend') 
        if in_position:
            print('sell, sell, sell')

            # order = exchange.create_market_sell_order('ETH/USDT', 0.005)
            # print(order)

            in_position = False
        else:
            print("you are not in position, nothing to sell") 

    else:
        if df['in_uptrend'][last_row_index]:
            print('in uptrend')
        else:
            print('in downtrend')

def run_bot():
    print(f"Fetching new bars for {datetime.now().isoformat()}")
    bars = exchange.fetch_ohlcv('ETH/USDT', timeframe='1m', limit=100)
    df = pd.DataFrame(bars[:-1], columns=['timestamp', 'open', 'high', 'low', 'close', 'volume'])
    df['timestamp'] = pd.to_datetime(df['timestamp'], unit='ms')
    supertrend_data = supertrend(df)
    check_buy_sell_signals(supertrend_data)

# initialize schedule
# schedule.every(5).seconds.do(run_bot)
schedule.every(1).minutes.do(run_bot)

# run loop
while True:
    schedule.run_pending()
    time.sleep(1)


