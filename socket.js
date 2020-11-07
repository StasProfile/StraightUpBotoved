
const { app, server, io, client, say, durat } = require('./bot');
const ytdl = require('ytdl-core');

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', socket => {
    socket.emit('now-song', durat);
    socket.on('sound-serch', (audio, voiceChanel, volume) => {
        try {
            let params = new URLSearchParams(audio);
            let seek = params.get('t') || 0;
            //console.log(seek);
            console.log(audio);
            audio = ytdl(audio, { filter: 'audioonly' });


            say(audio, client.channels.cache.get(voiceChanel), volume, seek);

        }
        catch (e) {
            io.emit('error', e);
        }
    })
    // socket.on('sound', (audio, voiceChanel) => {

    //     setTimeout(() => talk(audio, client.channels.cache.get(Mychannels[voiceChanel])), 300);
    // })
})

server.listen(process.env.PORT || 5000);

module.exports = { io };