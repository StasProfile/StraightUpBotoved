require('dotenv').config();

const Discord = require('discord.js');
const ytdl = require('ytdl-core');
const client = new Discord.Client();


async function say(path, voiceChannel) {
    const connection = await voiceChannel.join();
    setTimeout( () => {
        const dispatcher = connection.play(path, {
            volume: 1,
         });
        dispatcher.on('finish', () => {
            console.log('Finished playing!');
            dispatcher.destroy();
           voiceChannel.leave();
       });
    },500);
}

client.on('ready', () => {
    console.log('bot is running ' + client.user.tag);
})

client.on('message',async msg => {
    if (msg.content === 'ping') {
        msg.reply('pong');
    }

    if (msg.content === 'BoxHelp') {
        msg.reply('BoxConnect\nBoxDisconnect\nStraightUp\nDope\nItsLit\nLaFlame\nТВАРЬ\nДобро\n345\nминус три\nгучи\n+p{youtube video link}\n       -pause\n       -resume\n       -stop');
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
        '345': '345.mp3',
        'минус три': 'минус три.m4a',
        'гучи': 'гучи.mp3',
     }
     if (messages.hasOwnProperty(msg.content)){
        say(`audio/${messages[msg.content]}`, msg.member.voice.channel);
     }

    if (msg.content.substr(0,2) === '!p' || msg.content.substr(0,3) === ';;p' || msg.content.substr(0,5) === '!play' || msg.content.substr(0,6) === ';;play') {
        msg.member.voice.channel.join();
        setTimeout(() => say('audio/нахуя а главное зачем.m4a', msg), 1500);
    }

    if (msg.content.substr(0,2) === '+p') {
        const connection = await msg.member.voice.channel.join();
        const words = msg.content.replace(/ +/g, ' ').trim().split(' ');
        let word = words[words.indexOf('-t') + 1];
        word = Number.parseInt(word) || 0;
        connection.play(ytdl(msg.content.substring(2), { filter: 'audioonly' }), { seek: word });
    }
    
    if (msg.content === '-pause') {
        const voiceConnection = msg.guild.voice.connection;

        if (voiceConnection) {
            if (voiceConnection.dispatcher) {
                voiceConnection.dispatcher.pause();
            }
        }
    }

    if (msg.content === '-resume') {
        const voiceConnection = msg.guild.voice.connection;
        if (voiceConnection) {
            if (voiceConnection.dispatcher) {
                voiceConnection.dispatcher.resume();
            }
        }
    }

    if (msg.content === '-stop') {
        const voiceConnection = msg.guild.voice.connection;
        if (voiceConnection) {
            if (voiceConnection.dispatcher) {
                voiceConnection.dispatcher.destroy();
            }
        }
    }
})
client.login(process.env.TOKEN);
