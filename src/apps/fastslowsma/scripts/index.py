#### Run this script every n minutes with cron scheduler ####

import json
from binance import Client
import pandas as pd
import json
import sys, os

dir = os.path.dirname(__file__)
filepath = os.path.join(dir, '../../../../config/keys.json')
f = open(filepath)
data = json.load(f)
f.close()

api_key = data['BINANCE_API_KEY']
secret_key = data['BINANCE_API_SECRET']

client = Client(api_key, secret_key)


posframe = pd.read_csv('./position.csv')
print(posframe)

# select the currency to trade
def changepos(curr, buy=True):
    if buy:
        posframe.loc[posframe.currency == curr, 'position'] = 1
    else:
        posframe.loc[posframe.currency == curr, 'position'] = 0

    posframe.to_csv('./position.csv', index=False) # index=False to avoid saving the index as column as well

# pull hourly data from binance for a symbol (25h as the slow SMA time horizon)
def gethourlydata(symbol):
    frame = pd.DataFrame(client.get_historical_klines(symbol, '1h', '25 hours ago UTC'))
    frame = frame.iloc[:, :5]  # get all the rows and first five columns
    frame.columns = ['Time', 'Open', 'High', 'Low', 'Close']  # set the header titles
    frame[['Open', 'High', 'Low', 'Close']] = frame[['Open', 'High', 'Low', 'Close']].astype(float)
    frame.Time = pd.to_datetime(frame.Time, unit='ms')
    return frame

# df = gethourlydata('BTCUSDT')
# print(df)

def applytechnicals(df):
    df['FastSMA'] = df.Close.rolling(7).mean()
    df['SlowSMA'] = df.Close.rolling(25).mean()
    return df

# df = applytechnicals(df)
# print(df)

def trader(curr):
    qty = posframe[posframe.currency == curr].quantity.values[0]
    df = gethourlydata(curr)
    applytechnicals(df)
    lastrow = df.iloc[-1]
    if not posframe[posframe.currency == curr].position.values[0]:  # if not in a position
        if lastrow.FastSMA > lastrow.SlowSMA:
            print('BUY! BUY! BUY!')
            # order = client.create_order(symbol=curr,
            #                             side='BUY',
            #                             type='MARKET',
            #                             quantity=qty)
            # print(order)
            changepos(curr, buy=True)
        else:
            print(f'Not in position {curr} but Condition not fulfilled')
    else: 
        print(f'Already in {curr} position')

        if lastrow.SlowSMA > lastrow.FastSMA:
            print('SELL! SELL! SELL!')
            # order = client.create_order(symbol=curr,
            #                             side='SELL',
            #                             type='MARKET',
            #                             quantity=qty)
            # print(order)
            changepos(curr, buy=False)

# Run
for coin in posframe.currency:
    trader(coin)

#### Run this script every n minutes with cron scheduler ####