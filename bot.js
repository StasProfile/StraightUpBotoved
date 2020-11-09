require('dotenv').config();

const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const Discord = require('discord.js');
const ytdl = require('ytdl-core');
const lodashClonedeep = require("lodash.clonedeep");
const client = new Discord.Client();
const { getAudioDurationInSeconds } = require('get-audio-duration');
//const YouTube = require("discord-youtube-api");
//const youtube = new YouTube(process.env.KEY);

const search = require('youtube-search');

let myInterval;
let lastAudio = {}
lastAudio.duration = 0;
lastAudio.lastTime = 0;

let queue = [];

function audioTime(dispatcher, seek) {
    io.emit('audio-time', lastAudio.lastTime = dispatcher.streamTime + seek * 1000);
}


const opts = {
    maxResults: 1,
    key: process.env.KEY
};



async function say(voiceChannel, sendChannel = undefined) {
    clearInterval(myInterval);
    let path;
    try {
        path = queue[0].url != undefined ? ytdl(queue[0].url, { filter: 'audioonly' }) : queue[0].path;
    } catch (e) {
        queue.shift();
        console.log(e)
        sendChannel != undefined ? sendChannel.send("Неправильная ссылка") : io.emit('error', e);
        if (queue[0] != undefined) {
            return say(voiceChannel, sendChannel)
        } else {
            lastAudio.channel = null;
            io.emit('end-sining');
            return voiceChannel.leave();
        }
    }
    lastAudio.channel = voiceChannel;
    const connection = await voiceChannel.join();

    setTimeout(async () => {
        const dispatcher = connection.play(path, {
            volume: queue[0].vol,
            seek: queue[0].seek,
        });
        const duration = await getAudioDurationInSeconds(path);
        lastAudio.duration = duration * 1000;
        myInterval = setInterval(() => { audioTime(dispatcher, queue[0].seek) }, 1000);
        io.emit('new-song', lastAudio.duration);

        dispatcher.on('finish', () => {
            queue.shift();
            clearInterval(myInterval);
            dispatcher.destroy();
            if (queue[0] != undefined) {
                say(voiceChannel, sendChannel)
            } else {
                lastAudio.channel = null;
                voiceChannel.leave();
            }
        });
    }, 500);
}


function audioAction(action, channel) {
    const voiceConnection = client.voice.connections.find(vc => vc.channel.id === channel);
    if (voiceConnection) {
        if (voiceConnection.dispatcher) {
            if (action === "+pause") {
                clearInterval(myInterval);
                voiceConnection.dispatcher.pause();
            } else if (action === "+resume") {
                myInterval = setInterval(() => { audioTime(voiceConnection.dispatcher) }, 1000);
                voiceConnection.dispatcher.resume();
            } else if (action === "+stop") {
                clearInterval(myInterval);
                queue = [];
                voiceConnection.dispatcher.destroy();
                voiceChannel.leave();
            }
        }
    }
}


client.on('ready', () => {
    console.log('bot is running ' + client.user.tag);
})

client.on('message', async msg => {


    if (msg.content === 'BoxHelp') {
        msg.reply('\nBoxConnect\nBoxDisconnect\nStraightUp\nDope\nItsLit\nLaFlame\nТВАРЬ\nДобро\nгадза\nминусТри\nгучи\nбарбарики\nкриминал\nбасы\n+p {youtube video link}/ +s {youtube video keywoard}\n       +pause\n       +resume\n       +stop\n       +skip');
    }

    if (!msg.guild) return;

    if (msg.content === 'BoxConnect') {
        if (msg.member.voice.channel) {
            const connection = await msg.member.voice.channel.join();
        } else {
            msg.reply('Сначала зайди в голосовой канал, тупица!');
        }
    }

    if (msg.content === 'BoxDisconnect') {
        msg.member.voice.channel.leave();
    }


    const messages = {
        'StraightUp': 'StraightUp.mp3',
        'Dope': 'Dope.mp3',
        'ItsLit': 'ItsLit.mp3',
        'LaFlame': 'LaFlame.mp3',
        'ТВАРЬ': 'ТВАРЬ.mp3',
        'Добро': 'Добро.m4a',
        'гадза': '345.mp3',
        'минусТри': 'минус три.m4a',
        'гучи': 'гучи.mp3',
        'барбарики': 'барбарики.mp3',
        'криминал': 'криминал.m4a',
        'басы': 'басы.mp3',
        'ашотик': 'ашотик.m4a',
    }



    const args = msg.content.replace(/ +/g, ' ').trim().split(' ');



    if (messages.hasOwnProperty(args[0])) {
        if (queue[0] === undefined) {
            let volume = args[args.indexOf('-v') + 1];
            volume = Number.parseFloat(volume) || 1;
            queue.push({
                path: `audio/${messages[args[0]]}`,
                vol: volume,
                seek: 0
            });
            say(msg.member.voice.channel);
        }
        else {
            msg.reply('Не мешай слушать музыку или Валакаса, ч0рт!)');
        }
    }

    // if (/^(!|;;)p(lay)? ?(.*)?/i.test(messages.content)) {
    //     msg.member.voice.channel.join();
    //     say('audio/нахуя а главное зачем.m4a', msg.member.voice.channel, 5);
    // }

    if (msg.content.substr(0, 3) === '+p ') {
        //const connection = await msg.member.voice.channel.join();
        const words = msg.content.replace(/ +/g, ' ').trim().split(' ');
        let word = words[words.indexOf('-t') + 1];
        word = Number.parseInt(word) || 0;
        let volume = args[args.indexOf('-v') + 1];
        volume = Number.parseFloat(volume) || 1;
        // console.log(volume);
        if (msg.content.substr(3, 6) === 'http') {
            queue.push({
                url: words[1],
                vol: volume,
                seek: word
            });
            if (queue[1] === undefined) {
                say(msg.member.voice.channel, msg.channel);
            }
        } 
        else {
            const word = msg.content.substr(3);
            await search(word, opts, function (err, results) {
                if (err) return msg.reply('Sorry, can\'t find this video :(');
                // console.dir(results);
                console.log(results[0].link);
                queue.push({
                    url: results[0].link,
                    vol: 1,
                    seek: 0
                });
                if (queue[1] === undefined) {
                    say(msg.member.voice.channel, msg.channel);
                }
            });
        }
    }

    if (msg.content === '+pause') {
    audioAction(msg.content, msg.member.voice.channel.id);
}

if (msg.content === '+resume') {
    audioAction(msg.content, msg.member.voice.channel.id);
}

if (msg.content === '+stop') {
    audioAction(msg.content, msg.member.voice.channel.id);
}

if (msg.content === '+skip') {
    const voiceConnection = msg.guild.voice.connection;
    if (voiceConnection) {
        if (voiceConnection.dispatcher) {
            clearInterval(myInterval);
            voiceConnection.dispatcher.destroy();
            queue.shift();
            console.log(queue);
            if (queue[0] !== undefined) {
                say(msg.member.voice.channel, msg.channel);
            }
        }
    }
}
})

client.login(process.env.TOKEN);

module.exports = {
    app,
    server,
    io,
    client,
    say,
    audioAction,
    lastAudio,
    queue
};
