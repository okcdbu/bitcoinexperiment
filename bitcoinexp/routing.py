from flask import Flask, render_template
from bitcoinexp.trading import get_chart_data, run
from flask_socketio import SocketIO
import threading

app = Flask(__name__)
socketio = SocketIO(app)
thread_lock = threading.Lock()


@app.route("/")
@app.route("/chart")
def chart_visualization():
    return render_template('chart.html')


@socketio.on("connect")
def init_data():
    data = get_chart_data("BTC")
    jsondata = data.to_json(orient='records')  # get json data like {{open,high,low,close,date},...}
    worker = threading.Thread(target=run, args=(socketio,))
    worker.start()
    socketio.emit('response', jsondata)
