import pandas as pd
from binance.client import Client 
from datetime import datetime
import os
import time
from ta import add_all_ta_features
import numpy as np
from sklearn.decomposition import PCA
import warnings
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

warnings.filterwarnings('ignore')

'''
1. Gather/Convert Data
2. Generate Label
3. Add TA feature
4. Normalize and concatenate
5. Fit Principal Component Analysis (PCA) Model
'''

coins = ['ADA', 'ATOM', 'BAT', 'BNB', 'SOL', 'DOGE', 'UNI', 'VET', 'BTC', 'ONT', 'ETC', 'FIL', 'MKR', 'ETH', 'LTC', 'ZRX', 'NEO']

merge = False

interval = client.KLINE_INTERVAL_1HOUR
start_str = 'Jul 15, 2021'
end_str = 'Jun 15, 2022'

# Gather/Collect the Data and save to files (per symbol)
# for coin in coins:
#     print(f'gathering {coin}...')

#     klines = client.get_historical_klines(symbol=f'{coin}USDT', interval=interval, start_str=start_str, end_str=end_str)
#     # print(klines)

#     cols = ['OpenTime',
#             f'{coin}-USD_Open',
#             f'{coin}-USD_High',
#             f'{coin}-USD_Low',
#             f'{coin}-USD_Close',
#             f'{coin}-USD_volume',
#             'CloseTime',
#             f'{coin}-QuoteAssetVolume',
#             f'{coin}-NumberOfTrades',
#             f'{coin}-TBBAv',
#             f'{coin}-TBQAv',
#             f'{coin}-ignore']

#     coin_df = pd.DataFrame(klines, columns=cols)
#     # print(coin_df)
    
#     # normalize the dates from timestamps
#     coin_df['OpenTime'] = [datetime.fromtimestamp(ts / 1000) for ts in coin_df['OpenTime']] # list comprehension
#     coin_df['CloseTime'] = [datetime.fromtimestamp(ts / 1000) for ts in coin_df['CloseTime']] 

#     for col in coin_df.columns:
#         if not 'Time' in col:
#             coin_df[col] = coin_df[col].astype(float)

#     coin_df.to_csv(f'../data/{coin}_05Jul21+05Jun22_1h.csv')

#     time.sleep(1)


raw_data_path = '../data/'
symbols = ['ADA', 'ATOM', 'BAT', 'BNB', 'SOL', 'DOGE', 'UNI', 'VET', 'BTC', 'ONT', 'ETC', 'FIL', 'MKR', 'ETH', 'LTC', 'ZRX', 'NEO']
filenames = os.listdir(raw_data_path)

normalized_cols = [ 'volume_cmf',
                    'volume_mfi',
                    'volatility_dcp',
                    'trend_psar_down_indicator',
                    'trend_psar_up_indicator',
                    'momentum_rsi',
                    'momentum_stoch_rsi',
                    'momentum_stoch_rsi_k',
                    'momentum_stoch_rsi_d',
                    'momentum_stoch' ]

hours = 4

Xs = []     # feature set
ys = []     # target/label

for file in filenames:
    df = pd.read_csv(f'{raw_data_path}{file}')
    symbol = file.split('_')[0]

    print(f'preprocessing {symbol}...')

    dts = []
    for i in range(len(df)):
        dts.append(datetime.strptime(df['OpenTime'].iloc[i].split('.')[0], '%Y-%m-%d %H:%M:%S'))

    df['OpenTime'] = dts 

    dts = []
    for i in range(len(df)):
        dts.append(datetime.strptime(df['CloseTime'].iloc[i].split('.')[0], '%Y-%m-%d %H:%M:%S'))

    df['CloseTime'] = dts 

    labels = []

    for i in range(len(df)-hours):
        # change in price over hours
        labels.append(df[f'{symbol}-USD_Open'].iloc[i+hours] / df[f'{symbol}-USD_Close'].iloc[i])

    # chop off the last 4 frames given the look ahead condition above
    df = df.head(len(df) - hours)
    df['label'] = labels

    add_all_ta_features(df, 
                        open=f'{symbol}-USD_Open',
                        close=f'{symbol}-USD_Close',
                        high=f'{symbol}-USD_High',
                        low=f'{symbol}-USD_Low',
                        volume=f'{symbol}-USD_volume',
                        fillna=True)

    # print(df.columns)
    # print(df)

    # trim off the NaN values
    # df = df[50:]
    df = df[50:].reset_index(drop=True)
    df_features = df[normalized_cols]
    # print(df_features)

    # normalize to get all values between 0 and 1
    X = (df_features - df_features.min())/(df_features.max()-df_features.min())
    Xs.append(X)

    y = df['label']
    ys.append(y)
    
    # break # temp

# Concatenate data in the arrays
X = pd.concat(Xs)
y = pd.concat(ys)

# print(X)

# Do principal component analysis (PCA) - a form of unsupervised machine learning to distill 
# higher dimensional data into the most meaningful information 
pca = PCA(n_components=2)
pca.fit(X)
pcas = pd.DataFrame(pca.transform(X), columns=['pca1', 'pca2'])

# tag on the label

pcas['label'] = list(y)
print(pcas) 

# Do a scatter plot (import plotly.graph_objects as go)
# px.scatter(pcas, 
#            x='pca1', 
#            y='pca2', 
#            color='label', 
#            color_continous_scale='RdBu',
#            range_color=(0.97,1.03),
#            color_continuous_midpoint=1)


# Saving and Loading the ouput(s)

# import pickle 

# # Save
# pkl_filename = "pca_model_9_19_21.pkl"
# with open(pkl_filename, 'wb') as file:
#     pickle.dump(pca, file)

# # Load
# with open('pca_model_9_19_21.pkl', 'rb') as file:
#     pca = pickle.load(file)