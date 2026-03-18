require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

app.use(express.static(path.join(__dirname, '../client')));

io.on('connection', (socket) => {
    console.log('🔌 Usuario conectado');

    socket.on('joinRoom', async ({ room, user }) => {
        socket.join(room);
        
        // 1. Asegurar que la sala existe en la BD
        await supabase.from('salas').upsert([{ id: room, creador_id: user }]);

        // 2. Cargar bloques existentes de esa sala
        const { data } = await supabase
            .from('construcciones')
            .select('*')
            .eq('sala_id', room);

        socket.emit('initBlocks', data || []);
    });

    socket.on('newBlock', (block) => {
        // Retransmitir a todos en la sala menos al que lo creó
        socket.to(block.sala_id).emit('addBlock', block);
    });

    socket.on('disconnect', () => {
        console.log('❌ Usuario desconectado');
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`🚀 Proyectado en http://localhost:${PORT}`));