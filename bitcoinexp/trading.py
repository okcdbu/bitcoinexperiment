import json
import datetime
from pybithumb import *
import pandas as pd
import numpy as np


def run(socketio):
    wm = WebSocketManager("ticker", ["BTC_KRW"], ticktype=["30M"])
    while True:
        data = wm.get()
        debug = get_ohlcv_data(data)
        dummy = bollinger_trader(debug)
        socketio.emit('ohlcv', json.dumps(dummy))


def get_chart_data(ticker):
    data = get_candlestick(ticker, chart_intervals="30m")
    data['date'] = data.index - pd.Timedelta('9 hours')  # put index(date) in data, KST timestamp to UTC timestamp
    data = bollinger_trader(data)
    return data


def bollinger_trader(data):
    data['bbmiddle'] = data['close'].rolling(window=20).mean()
    sigma = data['close'].rolling(window=20).std()
    data['bbupper'] = data['bbmiddle'] + 2 * sigma
    data['bblower'] = data['bbmiddle'] - 2 * sigma
    data['state'] = data.apply(get_position, axis=1)
    return data


def get_position(data):
    if data['high'] > data['bbupper']:  # 당일 고가가 볼린저밴드 상한선보다 높다면, 과매수 구간이므로 매도포지션
        return 'ask'
    elif data['low'] < data['bblower']:  # 당일 저가가 볼린저밴드 하한선보다 낮다면, 과매도 구간이므로 매수포지션
        return 'bid'
    else:  # 아무것도 아니라면
        return 'none'


def get_ohlcv_data(data):
    unixtime = datetime.datetime.strptime(data['content']['date'] + data['content']['time'],
                                          '%Y%m%d%H%M%S').timestamp()
    unixtime = str(int(unixtime))
    values = [unixtime, data['content']['openPrice'], data['content']['highPrice'], data['content']['lowPrice'],
              data['content']['closePrice'], data['content']['volume']]
    keys = ['date', 'open', 'high', 'low', 'close', 'volume']
    return pd.DataFrame(dict(zip(keys, values)))
