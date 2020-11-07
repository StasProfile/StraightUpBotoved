const io =require('socket.io')(5000)

io.on('connection', socket => {
    socket.on('sound-serch', (audio, voiceChanel) => {
        try{
            audio = ytdl(audio, {filter: 'audioonly'});
            setTimeout(() => talk(audio, client.channels.cache.get(Mychannels[voiceChanel])), 300);

        }
        catch(e){
            io.emit('error',e);
        }
    })
    socket.on('sound', (audio, voiceChanel) => {

        setTimeout(() => talk(audio, client.channels.cache.get(Mychannels[voiceChanel])), 300);
    })
})