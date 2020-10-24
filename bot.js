require('dotenv').config();
const Discord = require('discord.js');
const ytdl = require('ytdl-core');
const client = new Discord.Client();



async function say(path, msg) {
    const connection = await msg.member.voice.channel.join();
    const dispatcher = connection.play(path, {
        volume: 1,
    });
    dispatcher.on('finish', () => {
        console.log('Finished playing!');
        dispatcher.destroy();
        msg.member.voice.channel.leave();
    });
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

    if (msg.content === 'StraightUp') {
        msg.member.voice.channel.join();
        setTimeout(() => say('StraightUp.mp3', msg), 1500);
    }
    
    if (msg.content === 'Dope') {
        msg.member.voice.channel.join();
        setTimeout(() => say('Dope.mp3', msg), 1500);
    }

    if (msg.content === 'ItsLit') {
        msg.member.voice.channel.join();
        setTimeout(() => say('ItsLit.mp3', msg), 1500);
     }

    if (msg.content === 'LaFlame') {
        msg.member.voice.channel.join();
        setTimeout(() => say('LaFlame.mp3', msg), 1500);
    }

    if (msg.content === 'ТВАРЬ') {
        msg.member.voice.channel.join();
        setTimeout(() => say('ТВАРЬ.mp3', msg), 1500);
    }

    if (msg.content === 'Добро') {
        msg.member.voice.channel.join();
        setTimeout(() => say('Добро.m4a', msg), 1500);
    }

    if (msg.content === '345') {
        msg.member.voice.channel.join();
        setTimeout(() => say('345.mp3', msg), 1500);
    }

    if (msg.content === 'минус три') {
        msg.member.voice.channel.join();
        setTimeout(() => say('минус три.m4a', msg), 1500);
    }

    if (msg.content === 'гучи') {
        msg.member.voice.channel.join();
        setTimeout(() => say('гучи.mp3', msg), 1500);
    }

    if (msg.content.substr(0,2) === '!p' || msg.content.substr(0,3) === ';;p' || msg.content.substr(0,5) === '!play' || msg.content.substr(0,6) === ';;play') {
        msg.member.voice.channel.join();
        setTimeout(() => say('нахуя а главное зачем.m4a', msg), 1500);
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
