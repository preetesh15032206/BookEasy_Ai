import { io } from 'socket.io-client';
const socket = io('http://localhost:3000');
socket.on('connect', () => {
    console.log('Connected');
    socket.emit('chat message', { text: "hello", history: [], user_id: "11111111-1111-1111-1111-111111111111" });
});
socket.on('chat response', (data) => {
    console.log(data);
    process.exit(0);
});
socket.on('connect_error', (err) => {
    console.error(err);
    process.exit(1);
});
