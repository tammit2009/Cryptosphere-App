import pandas as pd
from binance.client import Client 
from datetime import datetime, timedelta
import time
from binance.exceptions import *
from auxilliary_functions import *
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


symbols = ['BTC', 'ETH', 'LTC']
start_n_hours_ago = 48
balance_unit = 'USDT'

first = True

BUY_AMOUNT_USDT = 100

precision = {}
for symbol in symbols:
    precision[symbol] = client.get_symbol_info(f'{symbol}USDT')['quotePrecision']


### Test data gathering #####
# df = gather_data(symbols, start_n_hours_ago)
# print(df)
# print(df.columns)
# print(get_states(df, symbols))

# print(client.get_orderbook_ticker(symbol = 'BTCUSDT'))


# ### Loop example ###
# while True:
#     if datetime.now().minute == 38 and datetime.now().second == 40:
#         print('Hello')
#         time.sleep(1)


# ######## Loop (run the script) ############################################

while True:
    if (datetime.now().second % 10 == 0) or first:   # 10 seconds
        if datetime.now().minute == 0 and datetime.now().second == 10:  # top of the hour (10s into the hour)
            # refresh data
            first = False
            df = gather_data(symbols, start_n_hours_ago)
            states = get_states(df, symbols)
            print('Current state of the market:')
            print(states)

        try:
            print('\n')
            if balance_unit == 'USDT': # Looking to buy
                for symbol in symbols:
                    ask_price = float(client.get_orderbook_ticker(symbol = f'{symbol}USDT')['askPrice'])
                    lower_band = df[f'{symbol}_lower_band'].iloc[-1]
                    print(f'{symbol}: ask_price {ask_price} | lower band {lower_band}')
                    if ask_price < lower_band and states[symbol] == 'inside': # buy signal

                        ###############################################################################################

                        print(f'Buy order placed:')
                        # buy_order = client.order_limit_buy(symbol=f'{symbol}USDT', 
                        #                             quantity=truncate(BUY_AMOUNT_USDT / ask_price, precision[symbol]), 
                        #                             price=ask_price)
                        # print(buy_order)
                        
                        # start = datetime.now() # time to cancel after an hour if order not filled

                        # while True:
                        #     time.sleep(1) # check every 1s
                        #     buy_order = client.get_order(symbol=buy_order['symbol'], orderId=buy_order['orderId'])

                        #     seconds_since_buy = (datetime.now() - start).seconds
                        #     print(seconds_since_buy)

                        #     # resolve buy order
                        #     if float(buy_order['executedQty']) == 0 and seconds_since_buy > 60*60:
                        #         client.cancel_order(symbol=buy_order['symbol'], orderId=buy_order['orderId'])
                        #         break

                        #     # if not completely filled
                        #     if float(buy_order['executedQty']) != 0 and float(buy_order['executedQty']) != float(buy_order['origQty']):
                        #         client.cancel_order(symbol=buy_order['symbol'], orderId=buy_order['orderId'])
                        #         balance_unit = symbol
                        #         break

                        #     # completely filled
                        #     if float(buy_order['executedQty']) == float(buy_order['origQty']):
                        #         balance_unit = symbol
                        #         break

                        print('Buy')

                        #####################

                        balance_unit = symbol
                        break

            if balance_unit != 'USDT': # Looking to sell
                bid_price = float(client.get_orderbook_ticker(symbol = f'{balance_unit}USDT')['bidPrice'])
                upper_band = df[f'{balance_unit}_upper_band'].iloc[-1]
                if bid_price < upper_band and states[balance_unit] == 'inside': # sell signal
                    
                    #####################

                    # client.order_market_sell(symbol=buy_order['symbol'], 
                    #                         quantity=truncate(float(buy_order['executedQty']), 
                    #                         precision[buy_order['symbol'].replace('USDT', '')]))

                    print('Sell')

                    #####################

                    balance_unit = 'USDT'

            time.sleep(1)

        except BinanceAPIException as e:
            print(e.status.code)
            print(e.message)
