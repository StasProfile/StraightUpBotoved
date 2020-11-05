require('dotenv').config();

const Discord = require('discord.js');
const ytdl = require('ytdl-core');
const client = new Discord.Client();

async function say(path, voiceChannel, vol = 1, bit = 96) {
    const connection = await voiceChannel.join();
    setTimeout(() => {
        const dispatcher = connection.play(path, {
            volume: vol,
            bitrate: bit,
         });
         dispatcher.on('finish', () => {
            dispatcher.destroy();
           voiceChannel.leave();
       });
    }, 500);
}

client.on('ready', () => {
    console.log('bot is running ' + client.user.tag);
})

client.on('message',async msg => {
    if (msg.content === 'ping') {
        msg.reply('pong');
    }

    if (msg.content === 'BoxHelp') {
        msg.reply('\nBoxConnect\nBoxDisconnect\nStraightUp\nDope\nItsLit\nLaFlame\nТВАРЬ\nДобро\nгадза\nминусТри\nгучи\nбарбарики\nкриминал\nбасы\n+p{youtube video link}\n       +pause\n       +resume\n       +stop');
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
     
     if (messages.hasOwnProperty(args[0])){
        let volume = args[args.indexOf('-v') + 1];
        volume = Number.parseFloat(volume) || 1;
        say(`audio/${messages[args[0]]}`, msg.member.voice.channel, volume);
     }

    if (/^(!|;;)p(lay)? ?(.*)?/i.test(messages.content)) {
        msg.member.voice.channel.join();
        say('audio/нахуя а главное зачем.m4a', msg.member.voice.channel, 5);
    }

    if (msg.content.substr(0,3) === '+p ') {
        const connection = await msg.member.voice.channel.join();
        const words = msg.content.replace(/ +/g, ' ').trim().split(' ');
        let word = words[words.indexOf('-t') + 1];
        word = Number.parseInt(word) || 0;
        let volume = args[args.indexOf('-v') + 1];
        volume = Number.parseFloat(volume) || 1;
        console.log(volume);
        connection.play(ytdl(msg.content.substring(2), { filter: 'audioonly'}), {seek: word, volume: volume});
    }
    
    if (msg.content === '+pause') {
        const voiceConnection = msg.guild.voice.connection;

        if (voiceConnection) {
            if (voiceConnection.dispatcher) {
                voiceConnection.dispatcher.pause();
            }
        }
    }

    if (msg.content === '+resume') {
        const voiceConnection = msg.guild.voice.connection;
        if (voiceConnection) {
            if (voiceConnection.dispatcher) {
                voiceConnection.dispatcher.resume();
            }
        }
    }

    if (msg.content === '+stop') {
        const voiceConnection = msg.guild.voice.connection;
        if (voiceConnection) {
            if (voiceConnection.dispatcher) {
                voiceConnection.dispatcher.destroy();
            }
        }
    }
})

client.login(process.env.TOKEN);
