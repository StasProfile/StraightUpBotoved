require('dotenv').config();

const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const Discord = require('discord.js');
const ytdl = require('ytdl-core');
const client = new Discord.Client();
const { getAudioDurationInSeconds } = require('get-audio-duration');
const YouTube = require("discord-youtube-api");
// const youtube = new YouTube("google api key");
let myInterval;
let durat = 100;

function audioTime(dispatcher) {
    if (dispatcher === null) return clearInterval(myInterval);
    io.emit('audio-time', dispatcher.streamTime);
}

async function say(path, voiceChannel, vol = 1, seek = 0, bit = 96) {
    const connection = await voiceChannel.join();
    setTimeout(async () => {
        const dispatcher = connection.play(path, {
            volume: vol,
            seek: seek,
            bitrate: bit,
        });
        const duration = await getAudioDurationInSeconds(path);
        durat = duration * 1000;
        
        io.emit('new-song', durat);
        myInterval = setInterval(() => { audioTime(dispatcher) }, 1000);
        dispatcher.on('finish', () => {
            clearInterval(myInterval);
            dispatcher.destroy();
            voiceChannel.leave();
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
                voiceConnection.dispatcher.destroy();
            }
        }
    }
}


client.on('ready', () => {
    console.log('bot is running ' + client.user.tag);
})

client.on('message', async msg => {
    if (msg.content === 'ping') {
        msg.reply('pong');
    }

    if (msg.content === 'BoxHelp') {
        msg.reply('\nBoxConnect\nBoxDisconnect\nStraightUp\nDope\nItsLit\nLaFlame\nТВАРЬ\nДобро\nгадза\nминусТри\nгучи\nбарбарики\nкриминал\nбасы\n+p {youtube video link}\n       +pause\n       +resume\n       +stop');
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
        let volume = args[args.indexOf('-v') + 1];
        volume = Number.parseFloat(volume) || 1;
        say(`audio/${messages[args[0]]}`, msg.member.voice.channel, volume);
    }

    if (/^(!|;;)p(lay)? ?(.*)?/i.test(messages.content)) {
        msg.member.voice.channel.join();
        say('audio/нахуя а главное зачем.m4a', msg.member.voice.channel, 5);
    }

    if (msg.content.substr(0, 3) === '+p ') {
        //const connection = await msg.member.voice.channel.join();
        const words = msg.content.replace(/ +/g, ' ').trim().split(' ');
        let word = words[words.indexOf('-t') + 1];
        word = Number.parseInt(word) || 0;
        let volume = args[args.indexOf('-v') + 1];
        volume = Number.parseFloat(volume) || 1;
        console.log(volume);
        say(ytdl(msg.content.substring(2), { filter: 'audioonly' }), msg.member.voice.channel, volume, word);
    }
    //trysearch
    // if (msg.content.substr(0,3) === '+s ') {
    //     const connection = await msg.member.voice.channel.join();
    //     const word = msg.content.substr(2,msg.content.length - 1);
    //     console.log(word);
    //     const video = await youtube.searchVideos(word);
    //     console.log(video.url);
    //     connection.play(ytdl(video.url, { filter: 'audioonly'}));
    // }


    if (msg.content === '+pause') {
        audioAction(msg.content, msg.member.voice.channel.id);
    }

    if (msg.content === '+resume') {
        audioAction(msg.content, msg.member.voice.channel.id);
    }

    if (msg.content === '+stop') {
        audioAction(msg.content, msg.member.voice.channel.id);
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
    durat
};
