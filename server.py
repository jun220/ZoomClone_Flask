from flask import Flask, render_template
from flask_socketio import SocketIO, emit, join_room, leave_room

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your_secret_key'  # 시크릿 키 설정

socketio = SocketIO(app)

@app.route('/')
def index():
    return render_template('home.html')

@socketio.on('connect')
def handle_connect():
    print('Client connected')

@socketio.on('join_room')
def handle_join_room(room_name):
    print(f'Join room: {room_name}')
    join_room(room_name)
    emit('welcome', room=room_name)

@socketio.on('offer')
def handle_offer(offer, room_name):
    emit('offer', offer, room=room_name)

@socketio.on('answer')
def handle_answer(answer, room_name):
    emit('answer', answer, room=room_name)

@socketio.on('ice')
def handle_ice(ice, room_name):
    emit('ice', ice, room=room_name)

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=3000)
