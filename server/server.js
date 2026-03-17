const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Servir archivos estáticos desde la carpeta client
app.use(express.static(path.join(__dirname, '../client')));

io.on('connection', (socket) => {
    console.log('Un jugador se ha conectado: ' + socket.id);

    socket.on('disconnect', () => {
        console.log('Jugador desconectado');
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});