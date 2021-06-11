module.exports = (io) => {
    //채팅 기록
    const chatHistory = {};
    io.on("connection", (socket) => {
        
        // socket.on -> 데이터 수신, socket.emit 데이터 전송

        socket.on('chat', (arg) => {
            socket.sessionId = socket.sessionId || arg.sessionId 

            chatHistory[socket.sessionId] = chatHistory[socket.sessionId] || [];
            io.to(arg.room).emit('chat', arg);
        });

        /** 방 참여 */
        socket.on('join', (room) => {
            socket.join(room);
        });
        // 방 닫을 때
        socket.on("disconnecting", () => {

        });
        // 방이 닫혔을 때 
        socket.on("disconnect", () => {
            /** 방이 닫히면 현재 접속자와 대화 기록 후속 처리 */
            console.log(chatHistory[socket.sessionId]);

            /** 후속 처리 */
            delete chatHistory[socket.sessionId];

            console.log('disconnect');
        })
    })
}