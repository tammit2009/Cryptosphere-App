from binance.client import Client   
import csv
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

# prices = client.get_all_tickers()
# for price in prices:
#     print(price)

# 15 minutes candlesticks
# candles = client.get_klines(symbol='BTCUSDT', interval=Client.KLINE_INTERVAL_15MINUTE)
# # print(candles)
# # print(len(candles))
# csvfile = open('../data/15minutes.csv', 'w', newline='')
# candlestick_writer = csv.writer(csvfile, delimiter=',')
# for candlestick in candles:
#     print(candlestick)
#     candlestick_writer.writerow(candlestick)
# csvfile.close()

# 5 minutes candlesticks
csvfile = open('../data/BTCUSDT_01APR2021_17MAY2022_5m.csv', 'w', newline='')
candlestick_writer = csv.writer(csvfile, delimiter=',')
candlesticks = client.get_historical_klines("BTCUSDT", Client.KLINE_INTERVAL_5MINUTE, "1 Apr, 2021", "1 May, 2022")
for candlestick in candlesticks:
    candlestick[0] = candlestick[0] / 1000
    candlestick_writer.writerow(candlestick)
csvfile.close()

# 1 day candlesticks
# csvfile = open('../data/BTCUSDT_01JAN2022_20MAY2022_1day.csv', 'w', newline='')
# candlestick_writer = csv.writer(csvfile, delimiter=',')
# candlesticks = client.get_historical_klines("BTCUSDT", Client.KLINE_INTERVAL_5MINUTE, "1 Apr, 2021", "1 May, 2022")
# for candlestick in candlesticks:
#     candlestick[0] = candlestick[0] / 1000
#     candlestick_writer.writerow(candlestick)
# csvfile.close()

# csvfile = open('../data/BTCUSDT_01JAN2022_20MAY2022_1day.csv', 'w', newline='')
# candlestick_writer = csv.writer(csvfile, delimiter=',')
# candlesticks = client.get_historical_klines("BTCUSDT", Client.KLINE_INTERVAL_1DAY, "1 Jan, 2022", "20 May, 2022")
# for candlestick in candlesticks:
#     candlestick[0] = candlestick[0] / 1000
#     candlestick_writer.writerow(candlestick)
# csvfile.close()
