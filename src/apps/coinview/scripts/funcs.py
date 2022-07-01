
from binance import Client
from binance.enums import *
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

def get_account_info():
    account = client.get_account()
    balances = account['balances']
    exchange_info = client.get_exchange_info()
    symbols = exchange_info['symbols']
    data = {
        "account": account,
        "balances": balances,
        "exchange_info": exchange_info,
        "symbols": symbols
    }
    return json.dumps(data)  # dict to json; the opposite oper is json.loads(data)

def buy(symbol, quantity):
    try:
        # order = client.create_order(
        #     symbol = symbol,  # symbol = request.form['symbol'],     # LOT_SIZE', 'minQty': '0.00001000'   
        #     side = SIDE_BUY,
        #     type = ORDER_TYPE_MARKET,
        #     quantity = quantity  # quantity = request.form['quantity']  # around $2.9; 
        # )
        return json.dumps({
            "message": "order created successfully.",
            "status": "success"
        })
    except Exception as e:
        # flash(e.message, "error")  # message, category of error
        return json.dumps({
            "error": e.message,
            "category": "error"
        })

def sell(symbol, quantity):
    try:
        # order = client.create_order(
        #     symbol = symbol,  # symbol = request.form['symbol'],     # LOT_SIZE', 'minQty': '0.00001000'   
        #     side = SIDE_SELL,
        #     type = ORDER_TYPE_MARKET,
        #     quantity = quantity  # quantity = request.form['quantity']  # around $2.9; 
        # )
        return json.dumps({
            "message": "order created successfully.",
            "status": "success"
        })
    except Exception as e:
        # flash(e.message, "error")  # message, category of error
        return json.dumps({
            "error": e.message,
            "category": "error"
        })


def settings():
    return 'settings'


def history():
    candlesticks = client.get_historical_klines("BTCUSDT", Client.KLINE_INTERVAL_15MINUTE, "1 month ago UTC")

    processed_candlesticks = []

    for data in candlesticks:
        candlestick = {
            "time":  data[0] / 1000,
            "open":  data[1],
            "high":  data[2],
            "low":   data[3],
            "close": data[4]
        }

        processed_candlesticks.append(candlestick)

    return json.dumps(processed_candlesticks)


if sys.argv[1] == 'accountInfo':
    out = get_account_info()
    print(out)

elif sys.argv[1] == 'buy':
    out = buy(sys.argv[2], sys.argv[3])
    print(out)

elif sys.argv[1] == 'sell':
    out = sell(sys.argv[2], sys.argv[3])
    print(out)

elif sys.argv[1] == 'history':
    out = history()
    print(out)

else:
    out = json.dumps({
        "error": "method not found"
    })
    print(out)
   

# ----------------------------------------------------------------------------

# my_tz = pytz.timezone('Africa/Lagos')

# account = client.get_account()
# print(account)

# def get_minute_data(symbol, interval, lookback):
#     frame = pd.DataFrame(client.get_historical_klines(symbol, interval, lookback + ' min ago UTC + 1'))
#     frame = frame.iloc[:, :6]
#     frame.columns = ['Time', 'Open', 'High', 'Low', 'Close', 'Volume']
#     frame = frame.set_index('Time')
#     # frame.index = pd.to_datetime(frame.index, unit='ms')
#     # frame.index = frame.index.tz_localize(pytz.utc).tz_convert(my_tz) # set the correct timezone
#     frame = frame.astype(float)
#     return frame

# df = get_minute_data('BTCBUSD', '1m', '30')
# # print(df)

# # convert to json
# # out = df.to_json()
# out = df.to_json(orient='table')
# # out = out[1:-1].replace( '},{', '} {' )
# print(out)

# save to file
# df.to_json('temp.json', orient='records', lines=True)
# save to file as compressed
# df.to_json('temp.json.gz', orient='records', lines=True, compression='gzip')
