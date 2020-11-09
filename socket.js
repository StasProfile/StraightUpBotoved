
const { app, server, io, client, say, lastAudio, queue } = require('./bot');
const ytdl = require('ytdl-core');

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', socket => {
    if (lastAudio.channel) socket.emit('now-song', lastAudio.duration, lastAudio.lastTime);
    socket.on('sound-serch', (audio, voiceChanel, volume) => {
            let params = new URLSearchParams(audio);
            let seek = params.get('t') || 0;
            queue.push({
                url: audio,
                vol: volume,
                seek: seek
            });
            if (queue[1] === undefined) {
                say(client.channels.cache.get(voiceChanel));
            }
    })
    socket.on('new-time-of-song', (newSeek) =>{
        console.log(newSeek);
        queue[0].seek = newSeek;
        say(lastAudio.channel);
    });
    // socket.on('sound', (audio, voiceChanel) => {

    //     setTimeout(() => talk(audio, client.channels.cache.get(Mychannels[voiceChanel])), 300);
    // })
})

server.listen(process.env.PORT || 5000);

module.exports = { io };