from flask import Flask, render_template, request
from flask_socketio import SocketIO, emit, join_room, leave_room

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app)

@app.route('/')
def index():
    return render_template('home.html')

@socketio.on('connect')
def handle_connect():
    client_sid = request.sid  # 클라이언트의 소켓 ID를 가져옴
    print(f'Client connected: {client_sid}')

@socketio.on('join_room')
def handle_join_room(roomName):
    print(f'Joining room: {roomName}')
    
    # 방에 속한 모든 소켓의 ID 출력

    join_room(roomName)

    # 방에 있는 모든 소켓 가져오기
    room_sid_list = list(socketio.server.manager.rooms["/"].get(roomName, set()))
    # 자신의 소켓 ID 가져오기
    client_sid = request.sid
    
    # room_sid_list를 순회하면서 자신의 소켓 ID와 다른 소켓 ID를 출력
    print("방에 속한 소켓 id들중, 제가 아닌 것만 출력할게요")
    for sid in room_sid_list:
        if sid != client_sid:
            print(sid);
            emit('welcome', room=sid)


@socketio.on('offer')
def handle_offer(offer, roomName):
    emit('offer', offer, room=roomName)

@socketio.on('answer')
def handle_answer(answer, roomName):
    emit('answer', answer, room=roomName)

@socketio.on('ice')
def handle_ice(ice, roomName):
    print('handle ice');
    emit('ice', ice, room=roomName)

if __name__ == '__main__':
    socketio.run(app, port=3000)
