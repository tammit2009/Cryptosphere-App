import pandas as pd
from binance.client import Client 
from datetime import datetime
import time
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


coins = ['BTC', 'ETH', 'LTC']
# interval = client.KLINE_INTERVAL_5MINUTE
# start_str = 'Jun 14, 2022'      # suggest using "1 month ago UTC"
interval = client.KLINE_INTERVAL_1HOUR
start_str = 'Jan 1, 2022'      # suggest using "1 month ago UTC"

merge = False

for coin in coins:
    print(f'gathering {coin}...')
    # klines = client.get_historical_klines(symbol=f'{coin}USDT', interval=interval, start_str=start_str)
    klines = client.get_historical_klines(symbol=f'{coin}USDT', interval=interval, start_str='Jan 1, 2022', end_str='Mar 30, 2022')
    # print(klines)

    cols = ['OpenTime',
            f'{coin}-USD_Open',
            f'{coin}-USD_High',
            f'{coin}-USD_Low',
            f'{coin}-USD_Close',
            f'{coin}-USD_volume',
            'CloseTime',
            f'{coin}-QuoteAssetVolume',
            f'{coin}-NumberOfTrades',
            f'{coin}-TBBAv',
            f'{coin}-TBQAv',
            f'{coin}-ignore']

    coin_df = pd.DataFrame(klines, columns=cols)
    # print(coin_df)

    if merge:
        all_coins_df = pd.merge(coin_df, all_coins_df, how='inner', on=['OpenTime', 'CloseTime'])
    else:
        all_coins_df = coin_df
        merge = True

    time.sleep(10)

# Process the frame date
all_coins_df['OpenTime'].iloc[0] / 1000
# print(datetime.fromtimestamp(all_coins_df['OpenTime'].iloc[0] / 1000))

# normalize the dates from timestamps
all_coins_df['OpenTime'] = [datetime.fromtimestamp(ts / 1000) for ts in all_coins_df['OpenTime']] # list comprehension
all_coins_df['CloseTime'] = [datetime.fromtimestamp(ts / 1000) for ts in all_coins_df['CloseTime']] 

# convert the data to float types
for col in all_coins_df.columns:
    if not 'Time' in col:   # matches 'OpenTime' and 'CloseTime'
        all_coins_df[col] = all_coins_df[col].astype(float)

# quick check 
# type(all_coins_df['LTC-USD_Open'].iloc[0])

# print(list(all_coins_df)) # list of all the data columns
# print(all_coins_df)

# Save to file
# all_coins_df.to_csv('../data/BTC_ETH_LTC_05May21_06May22_5m.csv', index=False)
# all_coins_df.to_csv('../data/BTC_ETH_LTC_01Jan22_14Jun22_1h.csv', index=False)
all_coins_df.to_csv('../data/BTC_ETH_LTC_01Jan22_30Mar22_1h.csv', index=False)

# $$$


# ------------------------------------------------------------------------------

# Plotting with Python Tools

# # plot(with dash: appears on a web page)
# import dash
# from dash import dcc
# from dash import html
# import plotly
# import plotly.graph_objects as go

# fig = go.Figure(data=[go.Candlestick(x=all_coins_df['OpenTime'],
#                 open=all_coins_df['BTC-USD_Open'],
#                 high=all_coins_df['BTC-USD_High'],
#                 low=all_coins_df['BTC-USD_Low'],
#                 close=all_coins_df['BTC-USD_Close'])])

# fig.update_layout(xaxis_rangeslider_visible=False)

# # app.layout = html.Div([
# #     dcc.Graph(figure=fig)
# # ])

# # app.run_server(debug=True, use_reloader=False)  # Turn off reloader if inside Jupyter
# fig.show()   