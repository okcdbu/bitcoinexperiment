import json
import datetime
import pybithumb
from pybithumb import WebSocketManager


def run(socketio):
    wm = WebSocketManager("ticker", ["BTC_KRW"], ticktype=["30M"])
    while True:
        data = wm.get()
        unixtime = datetime.datetime.strptime(data['content']['date'] + data['content']['time'],
                                              '%Y%m%d%H%M%S').timestamp()
        unixtime = str(int(unixtime))
        values = [unixtime, data['content']['openPrice'], data['content']['highPrice'], data['content']['lowPrice'],
                  data['content']['closePrice'], data['content']['volume']]
        keys = ['date', 'open', 'high', 'low', 'close', 'volume']
        socketio.emit('ohlcv', json.dumps(dict(zip(keys, values))))


def get_position(ticker):  # if position should be located in bid, return minus value. if in ask, return plus value.
    # stay will return 0
    df = pybithumb.get_candlestick(ticker, chart_intervals="1m")
    ma20 = df['close'].rolling(window=20).mean()  # moving average 20d
    sigma = df['close'].rolling(window=20).std()  # standard deviation
    ubb = ma20 + 2 * sigma  # upper band bollinger
    lbb = ma20 - 2 * sigma  # lower band bollinger
    cur = pybithumb.get_current_price(ticker)
    if ubb < cur:  # position ask
        return cur - ubb
    elif lbb > cur:  # position bid
        return cur - lbb
    else:  # position stay
        return 0


def get_chart_data(ticker):
    data = pybithumb.get_candlestick(ticker, chart_intervals="30m")
    data['date'] = data.index  # put index(date) in data
    return data


def get_mean_data(ticker):
    df = pybithumb.get_candlestick(ticker, chart_intervals="1m")
    ma20 = df['close'].rolling(window=20).mean()  # moving average 20d
    return ma20

