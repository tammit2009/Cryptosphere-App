import websocket, json, pprint, talib, numpy
from binance.client import Client 
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

SOCKET = "wss://stream.binance.com:9443/ws/ethusdt@kline_1m"
RSI_PERIOD = 14
RSI_OVERBOUGHT = 70
RSI_OVERSOLD = 30
TRADE_SYMBOL = 'ETHUSDT'
TRADE_QUANTITY = 0.05

closes = []

in_position = False

def order(side, quantity, symbol, order_type=ORDER_TYPE_MARKET):
    try:
        print("sending order")
        order = client.create_order(symbol=symbol, 
                                    side=side, 
                                    type=order_type, 
                                    quantity=quantity)
        print(order)
    except Exception as e:
        return False

    return True

def on_open(ws):
    print("opened connection")

def on_close(ws):
    print("closed connection")

def on_message(ws, message):
    global closes

    print("received message")
    print(message)
    json_message = json.loads(message)
    pprint.pprint(json_message)   # pretty print

    candle = json_message['k']

    is_candle_closed = candle['x']
    close = candle['c']

    if is_candle_closed:
        print("candle closed at {}".format(close))
        closes.append(float(close))
        print("closes")
        print(closes)

        if len(closes) > RSI_PERIOD:
            np_closes = numpy.array(closes)
            rsi = talib.RSI(np_closes, RSI_PERIOD)
            print("all rsis calculated so far")
            print(rsi)
            last_rsi = rsi[-1]
            print("the current rsi is {}".format(last_rsi))

            if last_rsi > RSI_OVERBOUGHT:
                if in_position:
                    print("Overbought: Sell! Sell! Sell!")

                    # # put binance sell order logic here
                    # order_succeeded = order(SIDE_SELL, TRADE_QUANTITY, TRADE_SYMBOL)
                    # if order_succeeded:
                    #     in_position = False

                    in_position = False
                else:
                    print("It is overbought but you dont own any, nothing to do")

            if last_rsi < RSI_OVERSOLD:
                if in_position:
                    print("It is oversold, but you already own it, nothing to do")
                else:
                    print("Oversold: Buy! Buy! Buy!")

                    # # put binance buy order logic here
                    # order_succeeded = order(SIDE_BUY, TRADE_QUANTITY, TRADE_SYMBOL)
                    # if order_succeeded:
                    #     in_position = True
                    
                    in_position = True

ws = websocket.WebSocketApp(SOCKET, on_open=on_open, on_close=on_close, on_message=on_message)

ws.run_forever()
