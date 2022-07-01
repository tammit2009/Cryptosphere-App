import pandas as pd
from binance.client import Client 
from binance.exceptions import BinanceAPIException
from datetime import datetime, timedelta
import time
import math
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

# def truncate(number, digits) -> float:
#     stepper = 10.0 ** digits
#     return math.trunc(stepper * number) / stepper

def truncate(number, decimals=0):
    if not isinstance(decimals, int):
        raise TypeError("decimal places must be an integer.")
    elif decimals < 0:
        raise ValueError("decimal places has to be 0 or more")
    elif decimals == 0:
        return math.trunc(number)
    
    factor = 10.0 ** decimals 
    return math.trunc(number * factor) / factor


def sma(data, window):
    return data.rolling(window = window).mean()


def bollinger_band(data, sma, window, nstd):
    std = data.rolling(window = window).std()
    upper_band = sma + std * nstd 
    lower_band = sma - std * nstd 
    return upper_band, lower_band


def gather_data(symbols, start_n_hours_ago):
    merge = False
    for symbol in symbols:
        klines = client.get_historical_klines(symbol=f'{symbol}USDT', 
                                    interval=client.KLINE_INTERVAL_1HOUR, 
                                    start_str=str(datetime.now() - timedelta(hours=start_n_hours_ago)))                         
        # print(klines)

        cols = ['OpenTime',
                f'{symbol}-USD_Open',
                f'{symbol}-USD_High',
                f'{symbol}-USD_Low',
                f'{symbol}-USD_Close',
                f'{symbol}-USD_volume',
                'CloseTime',
                f'{symbol}-QuoteAssetVolume',
                f'{symbol}-NumberOfTrades',
                f'{symbol}-TBBAv',
                f'{symbol}-TBQAv',
                f'{symbol}-ignore']

        df = pd.DataFrame(klines, columns=cols)
        # print(coin_df)

        if merge == True:
            dfs = pd.merge(df, dfs, how='inner', on=['OpenTime', 'CloseTime'])
        else:
            dfs = df
            merge = True

        # time.sleep(1)

    # normalize the dates from timestamps
    dfs['OpenTime'] = [datetime.fromtimestamp(ts / 1000) for ts in dfs['OpenTime']] # list comprehension
    dfs['CloseTime'] = [datetime.fromtimestamp(ts / 1000) for ts in dfs['CloseTime']] 

    # convert the data to float types
    for col in dfs.columns:
        if not 'Time' in col:   # matches 'OpenTime' and 'CloseTime'
            dfs[col] = dfs[col].astype(float)

    for symbol in symbols:
        dfs[f'{symbol}_sma'] = sma(dfs[f'{symbol}-USD_Close'], window=20)
        dfs[f'{symbol}_upper_band'], dfs[f'{symbol}_lower_band'] = bollinger_band(data=dfs[f'{symbol}-USD_Close'],
                                                                            sma=dfs[f'{symbol}_sma'],
                                                                            window=20,
                                                                            nstd=3)
    dfs.dropna(inplace=True)

    return dfs


def get_states(df, symbols):
    states = {}

    # check and compare the last closing price
    for symbol in symbols:
        if df[f'{symbol}-USD_Close'].iloc[-1] < df[f'{symbol}_lower_band'].iloc[-1]:
            states[symbol] = 'below'
        elif df[f'{symbol}-USD_Close'].iloc[-1] > df[f'{symbol}_upper_band'].iloc[-1]:
            states[symbol] = 'above'
        else:
            states[symbol] = 'inside'

    return states   