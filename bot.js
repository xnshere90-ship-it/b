const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion,
    Browsers
} = require("@whiskeysockets/baileys");

const P = require("pino");
const readline = require("readline");
const fs = require("fs");
const path = require("path");
const https = require("https");
const http = require("http");
const CryptoJS = require("crypto-js"); 
const { createCanvas } = require("canvas");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("ffmpeg-static");
const TelegramBot = require("node-telegram-bot-api");

ffmpeg.setFfmpegPath(ffmpegPath);

// ============================================================
// CONFIG & SETTINGS
// ============================================================

const AUTH_MAIN_DIR = path.join(__dirname, "auth_main");
const MULTI_AUTH_BASE = path.join(__dirname, "multi_auth");
const SETTINGS_FILE = path.join(__dirname, "settings.json");
const CUSTOM_PAIRING_CODE = "WPV12XNS";
const RECONNECT_DELAY = 4000;

let botSettings = {
    adminNumber: "",
    prefix: "!",
    telegramToken: "",
    telegramAdminId: ""
};

let botMode = "eco"; // Default mode is 'eco'
let tgBot = null;
let mainSocket = null;

const RR_TEXT = [
    ' 🔥 Oye सुन! Tere maa के चुत मै आग laag गयी 😅🙏 मैं mutke 🌊 बुझा दू 😅🤭',
    ' 🏦 तेरी मां को SBI बैंक लेजाकर लोन दिलाकर चोदुंगा 🎀😂🔥​',
    '🤨 Ye jo apne likha h uska matlab apki maa randi hai 👋🏻👋🏻👋🏻',
    '🖕 Konse colour ki ungali se chodu tujhe?',
    ' 👂 Kaan kholke sun! तेरी माँ randi hai!',
    ' 🚦 Bich सडक pe तेरी माँ को चोदके लंगड़ा bana दूंगा 😡👌🔥​',
    ' 👀 दूर से देखा खुदाई हो रही थी, पास जाके देखा तेरी माँ की चुदाई हो रही थी 👌💋😅',
    ' 🌳 जंगल जंगल माई चला, वहां मुझे मिली तेरी बहन की चूत 💦',
    ' 💖 SAY XNS DADDY ILYSM BRO 💖​',
    ' तेरी शक्ल देख के लगता है तेरे पापा ने कंडोम पहनना भूल गए थे!',
    ' 😎 तू इतना चुप क्यों है? क्या तेरी माँ ने आज चुदाई नहीं करवाई?',
    '🎯 मेरा निशाना हमेशा सही होता है, जैसे तेरी माँ की चूत में!',
    ' ⚡️ इतनी जल्दी बोलना सीख गया? क्या तेरी माँ ने चूसना सिखाया?'
];

const NC_SYMBOLS = ["💘", "💕", "💟", "❣️", "💔", "❤️‍🔥", "❤️‍🩹", "❤️", "🩷", "🧡", "💛", "💙"];

const NC1_TEMPLATES = [
    (base) => `${base} ? ⫸ 𝙇𝙊𝙒 𝙇𝙀𝙑𝙀𝙇 𝙆𝙐𝙏𝙏𝙀y ︴🌾︴`,
    (base) => `${base} ? ⫸ 𝙇𝙊𝙒 𝙇𝙀𝙑𝙀𝙇 𝙆𝙐𝙏𝙏𝙀Y ︴🌵︴`,
    (base) => `${base} ? ⫸ 𝙇𝙊𝙒 𝙇𝙀𝙑𝙀𝙇 𝙆𝙐𝙏𝙏𝙀y ︴🌴︴`,
    (base) => `${base} ? ⫸ 𝙇𝙊𝙒 𝙇𝙀𝙑𝙀𝙇 𝙆𝙐𝙏𝙏𝙀y ︴🌳︴`,
    (base) => `${base} ? ⫸ 𝙇𝙊𝙒 𝙇𝙀𝙑𝙀𝙇 𝙆𝙐𝙏𝙏𝙀y ︴🌲︴`,
    (base) => `${base} ? ⫸ 𝙇𝙊𝙒 𝙇𝙀𝙑𝙀𝙇 𝙆𝙐𝙏𝙏𝙀y ︴🌎︴`,
    (base) => `${base} ? ⫸ 𝙇𝙊𝙒 𝙇𝙀𝙑𝙀𝙇 𝙆𝙐𝙏𝙏𝙀y ︴🌍︴`,
    (base) => `${base} ? ⫸ 𝙇𝙊𝙒 𝙇𝙀𝙑𝙀𝙇 𝙆𝙐𝙏𝙏𝙀Y ︴🌏︴`,
    (base) => `${base} MC TERA BAAP? >🌕//ＧＯＤ ＸＮＳ // 🌕//`,
    (base) => `${base} ? ⫸ 𝙇𝙊𝙒 𝙇𝙀𝙑𝙀𝙇 𝙆𝙐𝙏𝙏𝙀Y ︴🌖︴`,
    (base) => `${base} ? ⫸ 𝙇𝙊𝙒 𝙇𝙀𝙑𝙀𝙇 𝙆𝙐𝙏𝙏𝙀Y ︴🌗︴`,
    (base) => `${base} ? ⫸ 𝙇𝙊𝙒 𝙇𝙀𝙑𝙀𝙇 𝙆𝙐𝙏𝙏𝙀y ︴🌘︴`,
    (base) => `${base} ? ⫸ 𝙇𝙊𝙒 𝙇𝙀𝙑𝙀𝙇 𝙆𝙐𝙏𝙏𝙀y ︴🌑︴`,
    (base) => `${base} ? ⫸ 𝙇𝙊𝙒 𝙇𝙀𝙑𝙀𝙇 𝙆𝙐𝙏𝙏𝙀y ︴🌒︴`,
    (base) => `${base} ? ⫸ 𝙇𝙊𝙒 𝙇𝙀𝙑𝙀𝙇 𝙆𝙐𝙏𝙏𝙀y ︴🌓︴`,
    (base) => `${base} ? ⫸ 𝙇𝙊𝙒 𝙇𝙀𝙑𝙀𝙇 𝙆𝙐𝙏𝙏𝙀y ︴🌔︴`,
    (base) => `${base} ? ⫸ 𝙇𝙊𝙒 𝙇𝙀𝙑𝙀𝙇 𝙆𝙐𝙏𝙏𝙀Y ︴🌙︴`,
    (base) => `${base} ? ⫸ 𝙇𝙊𝙒 𝙇𝙀𝙑𝙀𝙇 𝙆𝙐𝙏𝙏𝙀y ︴🌤️︴`
];

const DNC_TEMPLATES = [
    (base) => `💙${base}💙`,
    (base) => `💛${base}💛`,
    (base) => `🧡${base}🧡`,
    (base) => `🩷${base}🩷`,
    (base) => `❤️‍🩹${base}❤️‍🩹`,
    (base) => `💔${base}💔`,
    (base) => `❣️${base}❣️`,
    (base) => `💟${base}💟`
];

const MSG_1 = `
<name> HY KENG ITS MY GROUP
<name> HY KENG ITS MY GROUP
<name> HY KENG ITS MY GROUP
<name> HY KENG ITS MY GROUP
<name> HY KENG ITS MY GROUP
<name> HY KENG ITS MY GROUP
<name> HY KENG ITS MY GROUP
<name> HY KENG ITS MY GROUP
<name> HY KENG ITS MY GROUP
<name> HY KENG ITS MY GROUP
<name> HY KENG ITS MY GROUP
<name> HY KENG ITS MY GROUP
<name> HY KENG ITS MY GROUP
`.trim();

const MSG_2 = `
<name> HY MY NAME IS XNS 
<name> HY MY NAME IS XNS 
<name> HY MY NAME IS XNS 
<name> HY MY NAME IS XNS 
<name> HY MY NAME IS XNS 
<name> HY MY NAME IS XNS 
<name> HY MY NAME IS XNS 
<name> HY MY NAME IS XNS 
<name> HY MY NAME IS XNS 
<name> HY MY NAME IS XNS 
`.trim();

const MSG_3 = `
<name> HY IM GOOD BOY
<name> HY IM GOOD BOY
<name> HY IM GOOD BOY
<name> HY IM GOOD BOY
<name> HY IM GOOD BOY
<name> HY IM GOOD BOY
<name> HY IM GOOD BOY
<name> HY IM GOOD BOY
`.trim();

const TEXT_MENU = `> ╔━━─━─⟪  𝘅𝗻𝘀  𝗯𝗼𝘁  𓄋  𝘃𝟭𝟮 —͟͞͞☠︎︎ ⟫━─═╗
> ┃      *_XNS V12 PRO 999+_*
> ╚═━━━━─━─━─━─━━━─━─━─━─━═╝

> ⟦ ⚙️ 𝗦𝗬𝗦𝗧𝗘𝗠 𝗜𝗡𝗙𝗢 ⟧

➤ 𝗕𝗼𝘁 𝗜𝗗     » 𝗫𝗡𝗦 𝗩𝟭𝟮
➤ 𝗣𝗿𝗲𝗳𝗶𝘅     » ${botSettings.prefix}
➤ 𝗠𝗼𝗱𝗲       » ${botMode.toUpperCase()}
➤ 𝗦𝘁𝗮𝘁𝘂𝘀     » 𝗢𝗡𝗟𝗜𝗡𝗘

> ⟦ ⚙️ 𝗦𝗬𝗦𝗧𝗘𝗠 𝗖𝗢𝗡𝗧𝗥𝗢𝗟 ⟧

> 𒌐 ${botSettings.prefix}𝗺𝗲𝗻𝘂
> 𒌐 ${botSettings.prefix}𝘀𝘁𝗮𝘁𝘀
> 𒌐 ${botSettings.prefix}𝘃𝗻 <𝘁𝘁𝘀> (Voice Note)
> 𒌐 ${botSettings.prefix}𝗵𝗲𝗹𝗽
> 𒌐 ${botSettings.prefix}𝗽𝗶𝗻𝗴
> 𒌐 ${botSettings.prefix}𝗲𝗰𝗼
> 𒌐 ${botSettings.prefix}𝗿𝗮𝗴𝗲
> 𒌐 ${botSettings.prefix}𝗽𝗿𝗲𝗳𝗶𝘅 <𝗻𝗲𝘄>
> 𒌐 ${botSettings.prefix}𝗺𝘀𝗴 <𝗻𝗮𝗺𝗲>
> 𒌐 ${botSettings.prefix}𝗺𝘀𝗴𝗱 <𝗺𝘀> <𝗻𝗮𝗺𝗲>
> 𒌐 ${botSettings.prefix}𝗹𝗼𝗼𝗽 <𝗻𝗮𝗺𝗲>
> 𒌐 ${botSettings.prefix}𝘀𝗹𝗼𝗼𝗽
> 𒌐 ${botSettings.prefix}𝗳𝗼𝗿 (𝗥𝗲𝗽𝗹𝘆 𝘁𝗼 𝗺𝘀𝗴)
> 𒌐 ${botSettings.prefix}sfor
> 𒌐 ${botSettings.prefix}𝗱 (𝗥𝗲𝗽𝗹𝘆 𝘁𝗼 𝘂𝘀𝗲𝗿)
> 𒌐 ${botSettings.prefix}𝘀𝗱 (𝗩𝗶𝗲𝘄 𝗺𝘂𝘁𝗲𝗱 𝗹𝗶𝘀𝘁)
> 𒌐 ${botSettings.prefix}𝗶𝗻𝘆𝗼𝘂 (𝗟𝗶𝘀𝘁 𝗴𝗿𝗼𝘂𝗽𝘀)
> 𒌐 ${botSettings.prefix}𝗹𝗲𝗮𝘃𝗲 <𝗴𝗿𝗼𝘂𝗽 𝗻𝘂𝗺𝗯𝗲𝗿>
> 𒌐 ${botSettings.prefix}otp <𝗰𝗼𝗱𝗲>
> 𒌐 ${botSettings.prefix}𝗹𝗶𝗱 (𝗥𝗲𝗽𝗹𝘆 𝘁𝗼 𝘂𝘀𝗲𝗿)
> 𒌐 ${botSettings.prefix}𝗹𝗶𝘀𝘁𝗰𝗼 (𝗦𝗵𝗼𝘄 𝗰𝗼𝗮𝗱𝗺𝗶𝗻𝘀)
> 𒌐 ${botSettings.prefix}𝗹𝗶𝘃𝗲 <𝗮𝗺𝘁> <𝘁𝘅𝘁>
> 𒌐 ${botSettings.prefix}𝘂𝗻𝗹𝗶𝘃𝗲
> 𒌐 ${botSettings.prefix}𝘀 <𝘀𝗼𝗻𝗴>
> 𒌐 ${botSettings.prefix}𝗿𝗲𝗮𝗰𝘁 <𝗲𝗺𝗼𝗷𝗶>
> 𒌐 ${botSettings.prefix}𝗿𝗼𝗳
> 𒌐 ${botSettings.prefix}𝗿𝗿
> 𒌐 ${botSettings.prefix}stoprr
> 𒌐 ${botSettings.prefix}rr1
> 𒌐 ${botSettings.prefix}stoprr1
> 𒌐 ${botSettings.prefix}𝗻𝗰 <𝗯𝗮𝘀𝗲 𝘁𝗲𝘅𝘁>
> 𒌐 ${botSettings.prefix}𝘀𝗻𝗰
> 𒌐 ${botSettings.prefix}𝗱𝗻𝗰 <𝗯𝗮𝘀𝗲 𝘁𝗲𝘅𝘁>
> 𒌐 ${botSettings.prefix}𝘀𝗱𝗻𝗰
> 𒌐 ${botSettings.prefix}𝗹𝗶𝗻𝗸 <𝗻𝘂𝗺𝗯𝗲𝗿>
> 𒌐 ${botSettings.prefix}bots
> ("_") ${botSettings.prefix}dc <𝟱-𝗱𝗶𝗴𝗶𝘁 𝗶𝗱>
> 𒌐 ${botSettings.prefix}𝘀𝘁𝗼𝗽𝗮𝗹𝗹
> 𒌐 ${botSettings.prefix}𝗰𝗼
> 𒌐 ${botSettings.prefix}𝘁𝗲𝗺𝗽𝗮𝗱𝗺𝗶𝗻
> 𒌐 ${botSettings.prefix}deco

╔═━━━⟪  *_XNS 999+_*  𔒝     ⟫━━━═`;

// ============================================================
// TERMINAL & HELPERS
// ============================================================

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise(r => rl.question(q, ans => r(ans.trim())));
const sleep = ms => new Promise(r => setTimeout(r, ms));
const cleanPhoneNumber = num => String(num || "").replace(/[^\d]/g, "");
const validPhoneNumber = num => num.length >= 5 && num.length <= 25; 
const formatPairingCode = code => (code && String(code).length === 8) ? `${String(code).slice(0,4)}-${String(code).slice(4)}` : code;
const getStatusCode = err => err?.output?.statusCode || err?.data?.statusCode || null;

function loadSettings() {
    if (fs.existsSync(SETTINGS_FILE)) {
        try { 
            botSettings = { ...botSettings, ...JSON.parse(fs.readFileSync(SETTINGS_FILE, "utf-8")) }; 
        } catch (e) {}
    }
}
function saveSettings() { 
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(botSettings, null, 4)); 
}

// ============================================================
// CANVAS IMAGE MENU GENERATOR
// ============================================================

async function generateCanvasMenu() {
    const width = 800;
    const height = 1350;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");

    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, "#0f0c29");
    gradient.addColorStop(0.5, "#302b63");
    gradient.addColorStop(1, "#24243e");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = "#00ffcc";
    ctx.lineWidth = 6;
    ctx.strokeRect(20, 20, width - 40, height - 40);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 36px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("🤖 CRASHXNS BOT MENU", width / 2, 85);

    ctx.strokeStyle = "#ff007f";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(150, 110);
    ctx.lineTo(width - 150, 110);
    ctx.stroke();

    const commands = [
        { cmd: `${botSettings.prefix}ping`, desc: "Check bot execution latency" },
        { cmd: `${botSettings.prefix}menu`, desc: "Show interactive control panel" },
        { cmd: `${botSettings.prefix}stats`, desc: "Display comprehensive live bot stats & video" },
        { cmd: `${botSettings.prefix}vn <text>`, desc: "Generate and send voice note" },
        { cmd: `${botSettings.prefix}eco`, desc: "Switch to Eco Mode" },
        { cmd: `${botSettings.prefix}rage`, desc: "Switch to Rage Mode" },
        { cmd: `${botSettings.prefix}msg <name>`, desc: "Send full formatted custom spam blocks" },
        { cmd: `${botSettings.prefix}msgd <ms> <name>`, desc: "Send full blocks with custom delay" },
        { cmd: `${botSettings.prefix}loop <name>`, desc: "Infinite spam loop with default 2s delay" },
        { cmd: `${botSettings.prefix}sloop`, desc: "Stop infinite spam loop" },
        { cmd: `${botSettings.prefix}for`, desc: "Forward replied message in loop" },
        { cmd: `${botSettings.prefix}sfor`, desc: "Stop message forward loop" },
        { cmd: `${botSettings.prefix}d`, desc: "Auto-delete user messages" },
        { cmd: `${botSettings.prefix}sd`, desc: "View muted/auto-delete user list" },
        { cmd: `${botSettings.prefix}inyou`, desc: "List all added groups" },
        { cmd: `${botSettings.prefix}leave <num>`, desc: "Request OTP to leave group by number" },
        { cmd: `${botSettings.prefix}otp <code>`, desc: "Confirm OTP to securely leave group" },
        { cmd: `${botSettings.prefix}lid`, desc: "Show user LID format (e.g. 123@lid)" },
        { cmd: `${botSettings.prefix}listco`, desc: "Show all active co-admins" },
        { cmd: `${botSettings.prefix}help`, desc: "Trigger help video & options prompt" },
        { cmd: `${botSettings.prefix}s <name>`, desc: "Search & download songs, videos & lyrics" },
        { cmd: `${botSettings.prefix}live <amt> <txt>`, desc: "Run dynamic live-spam editor loop" },
        { cmd: `${botSettings.prefix}unlive`, desc: "Halt active background loop process" },
        { cmd: `${botSettings.prefix}react <emoji>`, desc: "Auto-react to messages continuously" },
        { cmd: `${botSettings.prefix}rof`, desc: "Stop auto-reacting mode" },
        { cmd: `${botSettings.prefix}co (reply)`, desc: "Assign replied user as Co-Admin" },
        { cmd: `${botSettings.prefix}tempadmin <min>`, desc: "Assign temporary admin with timer" },
        { cmd: `${botSettings.prefix}deco`, desc: "List and remove active Co-Admins" },
        { cmd: `${botSettings.prefix}rr (reply)`, desc: "Start looping preset replies to a user" },
        { cmd: `${botSettings.prefix}stoprr`, desc: "Stop active RR loop process" },
        { cmd: `${botSettings.prefix}rr1 (reply)`, desc: "Auto-reply per new message from target user" },
        { cmd: `${botSettings.prefix}stoprr1`, desc: "Stop active RR1 trigger listener" },
        { cmd: `${botSettings.prefix}nc <base>`, desc: "Group name changer (random)" },
        { cmd: `${botSettings.prefix}snc`, desc: "Stop group name changer loop" },
        { cmd: `${botSettings.prefix}nc1 <base>`, desc: "Group name changer (NC1 templates)" },
        { cmd: `${botSettings.prefix}snc1`, desc: "Stop NC1 template loop" },
        { cmd: `${botSettings.prefix}dnc <base>`, desc: "Group description loop" },
        { cmd: `${botSettings.prefix}sdnc`, desc: "Stop group description loop" },
        { cmd: `${botSettings.prefix}link <number>`, desc: "Pair and launch a sub-bot instance" },
        { cmd: `${botSettings.prefix}bots`, desc: "List all active paired sub-bots" },
        { cmd: `${botSettings.prefix}dc <5-digit>`, desc: "Disconnect and remove paired sub-bot" },
        { cmd: `${botSettings.prefix}stopall`, desc: "Stop ALL active features/loops instantly" },
        { cmd: `${botSettings.prefix}prefix <new>`, desc: "Modify system command trigger prefix" }
    ];

    ctx.textAlign = "left";
    let startY = 140;
    
    commands.forEach((item) => {
        ctx.fillStyle = "rgba(0, 255, 204, 0.15)";
        ctx.fillRect(50, startY - 17, 240, 24);
        ctx.strokeStyle = "#00ffcc";
        ctx.lineWidth = 1.5;
        ctx.strokeRect(50, startY - 17, 240, 24);

        ctx.fillStyle = "#00ffcc";
        ctx.font = "bold 11px monospace";
        ctx.fillText(item.cmd, 58, startY - 2);

        ctx.fillStyle = "#e0e0e0";
        ctx.font = "11px sans-serif";
        ctx.fillText(item.desc, 310, startY - 2);

        startY += 27;
    });

    ctx.fillStyle = "#8888aa";
    ctx.font = "italic 16px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("⚡ Powered by CRASHXNS Systems | All Rights Reserved", width / 2, height - 20);

    return canvas.toBuffer("image/jpeg");
}

// ============================================================
// JIOSAAVN CRYPTO & URL GENERATORS
// ============================================================

function decryptMediaUrl(encryptedUrl) {
    if (!encryptedUrl) return null;
    try {
        const key = CryptoJS.enc.Utf8.parse("38346591");
        const decrypted = CryptoJS.DES.decrypt(
            encryptedUrl.trim(),
            key,
            {
                mode: CryptoJS.mode.ECB,
                padding: CryptoJS.pad.Pkcs7
            }
        );
        const url = decrypted.toString(CryptoJS.enc.Utf8).trim();
        return url.startsWith("http") ? url.replace("http://", "https://") : null;
    } catch (e) {
        return null;
    }
}

function generateQualityUrls(baseUrl, supports320 = true) {
    if (!baseUrl) return [];
    let urls = [];
    urls.push({ quality: "Original", url: baseUrl });
    if (supports320) {
        const url320 = baseUrl.replace(/_96_p?\.mp4/, "_320.mp4");
        if (url320 !== baseUrl) urls.unshift({ quality: "320 kbps", url: url320 });
    }
    const url160 = baseUrl.replace(/_96_p?\.mp4/, "_160.mp4");
    if (url160 !== baseUrl) {
        urls.splice(supports320 ? 1 : 0, 0, { quality: "160 kbps", url: url160 });
    }
    const url96 = baseUrl.replace(/_320\.mp4|_160\.mp4/, "_96.mp4");
    if (url96 !== baseUrl) urls.push({ quality: "96 kbps", url: url96 });

    const uniqueUrls = [];
    const seen = new Set();
    for (const item of urls) {
        if (!seen.has(item.url)) {
            seen.add(item.url);
            uniqueUrls.push(item);
        }
    }
    return uniqueUrls;
}

// ============================================================
// OFFICIAL JIOSAAVN API & BUFFER FETCHERS
// ============================================================

async function fetchJioSaavnAPI(url) {
    return new Promise((resolve, reject) => {
        https.get(url, { headers: { "User-Agent": "Mozilla/5.0" } }, (res) => {
            let data = "";
            res.on("data", chunk => data += chunk);
            res.on("end", () => {
                try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
            });
        }).on("error", reject);
    });
}

async function fetchBuffer(url) {
    return new Promise((resolve, reject) => {
        const client = url.startsWith("https") ? https : http;
        const req = client.get(url, {
            family: 4,
            headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0" }
        }, (res) => {
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                return fetchBuffer(res.headers.location).then(resolve).catch(reject);
            }
            if (res.statusCode !== 200 && res.statusCode !== 206) {
                return reject(new Error(`HTTP Status ${res.statusCode}`));
            }
            const chunks = [];
            res.on("data", chunk => chunks.push(chunk));
            res.on("end", () => resolve(Buffer.concat(chunks)));
        });
        req.on("error", reject);
        req.setTimeout(30000, () => { req.destroy(); reject(new Error("Timeout")); });
    });
}

async function fetchSongLyrics(trackId, trackName, artistName) {
    try {
        const saavnLyricsUrl = `https://www.jiosaavn.com/api.php?__call=lyrics.getLyrics&ctx=web6dot0&_format=json&_marker=0%3F_marker%3D0&lyrics_id=${trackId}`;
        const saavnData = await fetchJioSaavnAPI(saavnLyricsUrl);
        if (saavnData && saavnData.lyrics) {
            return saavnData.lyrics
                .replace(/<br\s*\/?>/gi, "\n")
                .replace(/&quot;/g, '"')
                .replace(/&amp;/g, "&")
                .replace(/&#039;/g, "'")
                .trim();
        }
    } catch (e) {}
    return null;
}

async function searchSongs(query) {
    try {
        const searchUrl = `https://www.jiosaavn.com/api.php?__call=autocomplete.get&_format=json&_marker=0&cc=in&includeMetaTags=1&query=${encodeURIComponent(query)}`;
        const searchData = await fetchJioSaavnAPI(searchUrl);
        if (!searchData || !searchData.songs || searchData.songs.data.length === 0) return [];

        const songIds = searchData.songs.data.slice(0, 5).map(s => s.id).join(",");
        const detailsUrl = `https://www.jiosaavn.com/api.php?__call=song.getDetails&cc=in&_marker=0%3F_marker%3D0&_format=json&pids=${songIds}`;
        const detailsData = await fetchJioSaavnAPI(detailsUrl);
        
        const results = [];
        for (const key in detailsData) {
            const track = detailsData[key];
            if (track && track.id) {
                let mediaUrl = track.media_url || null;
                const encryptedMediaUrl = track.encrypted_media_url;
                const supports320 = String(track["320kbps"]).toLowerCase() === "true";
                const previewUrl = track.media_preview_url;

                if (!mediaUrl && encryptedMediaUrl) {
                    mediaUrl = decryptMediaUrl(encryptedMediaUrl);
                }

                results.push({
                    id: track.id,
                    name: track.song ? track.song.replace(/&quot;/g, '"') : "Unknown",
                    artists: track.primary_artists ? track.primary_artists.replace(/&quot;/g, '"') : "Unknown",
                    image: track.image ? track.image.replace("150x150", "500x500") : null,
                    quality_urls: generateQualityUrls(mediaUrl, supports320),
                    preview_url: previewUrl
                });
            }
        }
        return results;
    } catch (error) {
        throw error;
    }
}

// ============================================================
// FFMPEG OPUS CONVERTER FOR VOICE NOTE (PTT)
// ============================================================

async function convertToOpus(inputBuffer) {
    return new Promise((resolve, reject) => {
        const inputPath = path.join(__dirname, `tts_in_${Date.now()}.mp3`);
        const outputPath = path.join(__dirname, `tts_out_${Date.now()}.ogg`);

        fs.writeFileSync(inputPath, inputBuffer);

        ffmpeg(inputPath)
            .audioCodec("libopus")
            .audioChannels(1)
            .audioFrequency(48000)
            .format("ogg")
            .outputOptions([
                "-application", "voip",
                "-compression_level", "10"
            ])
            .on("end", () => {
                try {
                    const outputBuffer = fs.readFileSync(outputPath);
                    if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
                    if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
                    resolve(outputBuffer);
                } catch (err) {
                    reject(err);
                }
            })
            .on("error", (err) => {
                try {
                    if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
                    if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
                } catch {}
                reject(err);
            })
            .save(outputPath);
    });
}

// ============================================================
// STANDARD VOICE BUFFER GENERATOR
// ============================================================

async function generateVoiceBuffer(text) {
    return new Promise((resolve, reject) => {
        const encoded = encodeURIComponent(text);
        const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encoded}&tl=hi&client=tw-ob`;
        https.get(ttsUrl, { headers: { "User-Agent": "Mozilla/5.0" } }, (res) => {
            const chunks = [];
            res.on('data', chunk => chunks.push(chunk));
            res.on('end', () => resolve(Buffer.concat(chunks)));
        }).on('error', reject);
    });
}

// ============================================================
// GLOBAL STATE
// ============================================================

let stopping = false;
let isLiveRunning = false;
let songSessions = {}; 
let helpActiveSessions = {}; 
let activeReactionEmoji = null; 
let coAdmins = []; 
let tempAdmins = {}; 
let decoSessions = {}; 
let isRrRunning = false; 

let rr1Session = {
    active: false,
    targetJid: null,
    targetParticipant: null,
    currentIndex: 0
};

let ncSessions = {};  
let nc1Sessions = {}; 
let dncSessions = {}; 
let loopSessions = {}; 
let forwardLoopSessions = {}; 

let autoDeleteUsers = {}; 
let sdSessions = {};
let inyouLeaveSessions = {}; 

let pairedSubBots = {};

function generateFiveDigitId() {
    let id;
    do {
        id = Math.floor(10000 + Math.random() * 90000).toString();
    } while (pairedSubBots[id]);
    return id;
}

function checkActiveStatus(sessionObj) {
    for (const key in sessionObj) {
        const val = sessionObj[key];
        if (typeof val === 'object' && val !== null) {
            if (Object.values(val).some(Boolean)) return "ON 🟢";
        } else if (val) {
            return "ON 🟢";
        }
    }
    return "OFF 🔴";
}

function formatUptime(seconds) {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hrs}h ${mins}m ${secs}s`;
}

// ============================================================
// TELEGRAM MANAGEMENT BOT SETUP
// ============================================================

function setupTelegramBot() {
    if (!botSettings.telegramToken || !botSettings.telegramAdminId) return;

    try {
        tgBot = new TelegramBot(botSettings.telegramToken, { polling: true });
        console.log("🤖 Telegram Control Bot Started Successfully!");

        const isAuthorized = (chatId) => String(chatId) === String(botSettings.telegramAdminId);

        tgBot.onText(/\/start/, async (msg) => {
            if (!isAuthorized(msg.chat.id)) return tgBot.sendMessage(msg.chat.id, "⛔ *_UNAUTHORIZED_*");

            const menuText = `╔━━─━─⟪  𝘅𝗻𝘀  𝗯𝗼𝘁  𓄋  𝘃𝟭𝟮 —͟͞͞☠︎︎ ⟫━─═╗
┃      *_TELEGRAM MANAGEMENT PANEL_*
╚═━━━━─━─━─━─━━━─━─━─━─━═╝

> 🤖 *Available Commands:*

➤ \`/setp <number>\` - Set up & pair Main Manager Bot (saves in \`auth_main\`)
➤ \`/status\` - View bot performance & linked sub-bots
➤ \`/link <number>\` - Pair a new sub-bot (saves in \`multi_auth\`)
➤ \`/delink <bot_id>\` - Remove an active sub-bot
➤ \`/authall\` - Clear all authentication sessions
➤ \`/stopall\` - Halt all active background loops`;

            tgBot.sendMessage(msg.chat.id, menuText, { parse_mode: "Markdown" });
        });

        // /setp command for setting up/pairing the main manager bot (`auth_main`)
        tgBot.onText(/\/setp (.+)/, async (msg, match) => {
            if (!isAuthorized(msg.chat.id)) return tgBot.sendMessage(msg.chat.id, "⛔ *_UNAUTHORIZED_*");

            const primaryNum = cleanPhoneNumber(match[1]);
            if (!validPhoneNumber(primaryNum)) {
                return tgBot.sendMessage(msg.chat.id, "*_INVALID NUMBER_*", { parse_mode: "Markdown" });
            }

            tgBot.sendMessage(msg.chat.id, `*_INITIALIZING MAIN MANAGER BOT FOR +${primaryNum}_*`, { parse_mode: "Markdown" });
            await startMainBotTelegram(primaryNum, msg.chat.id);
        });

        tgBot.onText(/\/authall/, async (msg) => {
            if (!isAuthorized(msg.chat.id)) return tgBot.sendMessage(msg.chat.id, "⛔ *_UNAUTHORIZED_*");

            try {
                tgBot.sendMessage(msg.chat.id, "*_WIPING SESSIONS_*");

                if (mainSocket) {
                    try { mainSocket.ws?.close(); } catch {}
                }

                for (const bId in pairedSubBots) {
                    try { pairedSubBots[bId].socket.ws?.close(); } catch {}
                }
                pairedSubBots = {};

                if (fs.existsSync(AUTH_MAIN_DIR)) {
                    fs.rmSync(AUTH_MAIN_DIR, { recursive: true, force: true });
                }
                fs.mkdirSync(AUTH_MAIN_DIR, { recursive: true });

                if (fs.existsSync(MULTI_AUTH_BASE)) {
                    fs.rmSync(MULTI_AUTH_BASE, { recursive: true, force: true });
                }
                fs.mkdirSync(MULTI_AUTH_BASE, { recursive: true });

                botSettings.adminNumber = "";
                saveSettings();

                tgBot.sendMessage(msg.chat.id, "*_AUTH CLEARED_*", { parse_mode: "Markdown" });
            } catch (e) {
                tgBot.sendMessage(msg.chat.id, "*_ERROR_*");
            }
        });

        tgBot.onText(/\/status/, async (msg) => {
            if (!isAuthorized(msg.chat.id)) return tgBot.sendMessage(msg.chat.id, "⛔ *_UNAUTHORIZED_*");

            const uptimeStr = formatUptime(process.uptime());
            const mem = process.memoryUsage();
            const ramUsage = `${(mem.heapUsed / 1024 / 1024).toFixed(2)} MB`;
            const botKeys = Object.keys(pairedSubBots);

            let statusText = `📊 *XNS V12 BOT STATUS*\n\n`;
            statusText += `⏱️ *Uptime:* ${uptimeStr}\n`;
            statusText += `💾 *RAM:* ${ramUsage}\n`;
            statusText += `👑 *WP Admin:* ${botSettings.adminNumber ? botSettings.adminNumber : 'Not Set'}\n`;
            statusText += `🤖 *Active Sub-Bots:* ${botKeys.length}\n`;

            if (botKeys.length > 0) {
                statusText += `\n*Linked Numbers:* \n`;
                botKeys.forEach((id, idx) => {
                    statusText += `${idx + 1}. ID: \`${id}\` | Num: +${pairedSubBots[id].phoneNumber}\n`;
                });
            }

            tgBot.sendMessage(msg.chat.id, statusText, { parse_mode: "Markdown" });
        });

        tgBot.onText(/\/link (.+)/, async (msg, match) => {
            if (!isAuthorized(msg.chat.id)) return tgBot.sendMessage(msg.chat.id, "⛔ *_UNAUTHORIZED_*");

            const targetNum = cleanPhoneNumber(match[1]);
            if (!validPhoneNumber(targetNum)) {
                return tgBot.sendMessage(msg.chat.id, "*_INVALID NUMBER_*", { parse_mode: "Markdown" });
            }

            const chatId = msg.chat.id;
            const sentMsg = await tgBot.sendMessage(chatId, "*_CONNECTING SUB-BOT_*", { parse_mode: "Markdown" });
            const botId = generateFiveDigitId();

            await createSubBotTelegram(botId, targetNum, chatId, sentMsg.message_id);
        });

        tgBot.onText(/\/delink (.+)/, async (msg, match) => {
            if (!isAuthorized(msg.chat.id)) return tgBot.sendMessage(msg.chat.id, "⛔ *_UNAUTHORIZED_*");

            const botId = match[1].trim();
            if (!pairedSubBots[botId]) {
                return tgBot.sendMessage(msg.chat.id, "*_BOT NOT FOUND_*", { parse_mode: "Markdown" });
            }

            try {
                pairedSubBots[botId].socket.ws?.close();
                fs.rmSync(pairedSubBots[botId].authDir, { recursive: true, force: true });
                delete pairedSubBots[botId];
                tgBot.sendMessage(msg.chat.id, "*_DELINKED_*", { parse_mode: "Markdown" });
            } catch (e) {
                tgBot.sendMessage(msg.chat.id, "*_ERROR_*");
            }
        });

        tgBot.onText(/\/stopall/, async (msg) => {
            if (!isAuthorized(msg.chat.id)) return tgBot.sendMessage(msg.chat.id, "⛔ *_UNAUTHORIZED_*");

            isLiveRunning = false;
            isRrRunning = false;
            ncSessions = {};
            nc1Sessions = {};
            dncSessions = {};
            loopSessions = {};
            forwardLoopSessions = {};
            autoDeleteUsers = {};

            tgBot.sendMessage(msg.chat.id, "*_STOPPED_*");
        });

    } catch (e) {
        console.error("Telegram Bot Error:", e.message);
    }
}

// ============================================================
// SHARED MESSAGE HANDLER LOGIC FOR ALL BOTS
// ============================================================

function setupMessageHandler(activeSock, isSubBot = false, socketId = "main") {
    activeSock.ev.on("messages.upsert", async ({ messages }) => {
        messages.forEach(async (message) => {
            try {
                if (!message?.message) return;
                const jid = message.key?.remoteJid;
                if (!jid) return;

                const text = message.message?.conversation || message.message?.extendedTextMessage?.text || "";
                
                const senderFullId = message.key.fromMe ? activeSock.user.id : (message.key.participant || jid);
                const senderCleanId = cleanPhoneNumber(senderFullId);

                if (!botSettings.adminNumber && message.key.fromMe) {
                    botSettings.adminNumber = senderCleanId;
                    saveSettings();
                }

                const configuredAdmin = cleanPhoneNumber(botSettings.adminNumber);

                const isAdmin = (configuredAdmin !== "" && senderCleanId === configuredAdmin) || message.key.fromMe;
                const isCoAdmin = coAdmins.includes(senderCleanId) || tempAdmins.hasOwnProperty(senderCleanId);

                // Auto-Delete Feature (!d) Check
                if (jid.endsWith("@g.us") && autoDeleteUsers[jid] && autoDeleteUsers[jid][senderFullId]) {
                    try {
                        await activeSock.sendMessage(jid, {
                            delete: {
                                remoteJid: jid,
                                fromMe: false,
                                id: message.key.id,
                                participant: message.key.participant || senderFullId
                            }
                        });
                    } catch (e) {}
                }

                // SD List Number Selection
                if (isAdmin && sdSessions[senderCleanId] && sdSessions[senderCleanId].jid === jid) {
                    const session = sdSessions[senderCleanId];
                    const trimmedText = text.trim();

                    if (/^\d+$/.test(trimmedText)) {
                        const index = parseInt(trimmedText) - 1;
                        const targetParticipant = session.list[index];

                        if (targetParticipant) {
                            delete autoDeleteUsers[jid][targetParticipant];
                            delete sdSessions[senderCleanId];
                            await activeSock.sendMessage(jid, { 
                                text: "*_UNMUTED_*",
                                edit: session.msgKey
                            });
                            return;
                        } else {
                            delete sdSessions[senderCleanId];
                            await activeSock.sendMessage(jid, { text: "*_INVALID_*", edit: session.msgKey });
                            return;
                        }
                    } else {
                        delete sdSessions[senderCleanId];
                    }
                }

                // ECO MODE: Sub-bots are completely ignored; only the main manager bot responds
                if (botMode === "eco" && isSubBot) {
                    return;
                }

                if (rr1Session.active && rr1Session.targetJid === jid) {
                    const msgSenderClean = cleanPhoneNumber(message.key.fromMe ? activeSock.user.id : (message.key.participant || jid));
                    const targetClean = cleanPhoneNumber(rr1Session.targetParticipant);

                    if (msgSenderClean === targetClean && !message.key.fromMe) {
                        const replyText = RR_TEXT[rr1Session.currentIndex % RR_TEXT.length];
                        rr1Session.currentIndex++;

                        await activeSock.sendMessage(jid, { text: replyText }, { quoted: message });
                    }
                }

                if (!isAdmin && !isCoAdmin) return; 

                if (activeReactionEmoji && message.key) {
                    const isCommand = text.startsWith(botSettings.prefix);
                    const cmdName = isCommand ? text.slice(botSettings.prefix.length).trim().split(/ +/)[0].toLowerCase() : "";
                    
                    if (!isCommand || (cmdName !== "react" && cmdName !== "rof" && cmdName !== "co" && cmdName !== "deco" && cmdName !== "tempadmin" && cmdName !== "rr" && cmdName !== "stoprr" && cmdName !== "rr1" && cmdName !== "stoprr1" && cmdName !== "nc" && cmdName !== "snc" && cmdName !== "nc1" && cmdName !== "snc1" && cmdName !== "dnc" && cmdName !== "sdnc" && cmdName !== "link" && cmdName !== "bots" && cmdName !== "dc" && cmdName !== "stopall" && cmdName !== "eco" && cmdName !== "rage" && cmdName !== "msg" && cmdName !== "msgd" && cmdName !== "loop" && cmdName !== "sloop" && cmdName !== "for" && cmdName !== "sfor" && cmdName !== "d" && cmdName !== "sd" && cmdName !== "inyou" && cmdName !== "leave" && cmdName !== "otp" && cmdName !== "lid" && cmdName !== "listco" && cmdName !== "stats" && cmdName !== "vn")) {
                        try {
                            await activeSock.sendMessage(jid, {
                                react: {
                                    text: activeReactionEmoji,
                                    key: message.key
                                }
                            });
                        } catch (e) {}
                    }
                }

                if (isAdmin && decoSessions[senderCleanId]) {
                    const session = decoSessions[senderCleanId];
                    const trimmedText = text.trim();

                    if (/^\d+$/.test(trimmedText)) {
                        const index = parseInt(trimmedText) - 1;
                        const targetCoAdmin = session.list[index];

                        if (targetCoAdmin) {
                            coAdmins = coAdmins.filter(num => num !== targetCoAdmin);
                            delete decoSessions[senderCleanId];
                            await activeSock.sendMessage(jid, { 
                                text: "*_CO-ADMIN DELETED_*",
                                edit: session.msgKey
                            });
                            return;
                        } else {
                            delete decoSessions[senderCleanId];
                            await activeSock.sendMessage(jid, { text: "*_INVALID_*", edit: session.msgKey });
                            return;
                        }
                    } else {
                        delete decoSessions[senderCleanId];
                    }
                }

                if (!text) return;

                if (helpActiveSessions[senderCleanId]) {
                    const trimmedText = text.trim();

                    if (trimmedText === "1") {
                        delete helpActiveSessions[senderCleanId]; 
                        await activeSock.sendMessage(jid, { text: TEXT_MENU }, { quoted: message });
                        return;
                    } 
                    
                    if (trimmedText === "2") {
                        delete helpActiveSessions[senderCleanId]; 
                        const imageBuffer = await generateCanvasMenu();
                        await activeSock.sendMessage(jid, {
                            image: imageBuffer,
                            caption: `🤖 *_V12 XNS_*`
                        }, { quoted: message });
                        return;
                    }

                    delete helpActiveSessions[senderCleanId];
                }

                if (songSessions[senderCleanId]) {
                    const session = songSessions[senderCleanId];

                    if (session.step === 'SELECT_SONG' && /^[1-5]$/.test(text.trim())) {
                        const index = parseInt(text.trim()) - 1;
                        const track = session.tracks[index];

                        if (track) {
                            songSessions[senderCleanId] = { step: 'SELECT_FORMAT', track: track, msgKey: session.msgKey };
                            await activeSock.sendMessage(jid, { 
                                text: `🎵 You selected: *${track.name}*\n\nHow would you like to receive it?\n\n👉 Reply with:\n*1* - 🎧 Audio\n*2* - 🎬 Video\n*3* - 📜 Lyrics`,
                                edit: session.msgKey
                            });
                            return;
                        }
                    } else if (session.step === 'SELECT_FORMAT') {
                        const choice = text.trim().toLowerCase();
                        const track = session.track;
                        const mainMsgKey = session.msgKey;

                        if (choice === '3' || choice === 'lyrics' || choice === 'lyric' || choice === 'l') {
                            delete songSessions[senderCleanId];
                            await activeSock.sendMessage(jid, { text: "*_FETCHING LYRICS_*", edit: mainMsgKey });
                            const lyrics = await fetchSongLyrics(track.id, track.name, track.artists);

                            if (lyrics) {
                                await activeSock.sendMessage(jid, { text: `📜 *LYRICS*\n\n🎵 *Song:* ${track.name}\n🎙️ *Artist:* ${track.artists}\n\n${lyrics}` }, { quoted: message });
                            } else {
                                await activeSock.sendMessage(jid, { text: "*_NOT FOUND_*", edit: mainMsgKey });
                            }
                            return;
                        }

                        let isVideo = (choice === '2' || choice === 'video' || choice === 'v');
                        delete songSessions[senderCleanId]; 

                        if (track) {
                            await activeSock.sendMessage(jid, { text: "*_DOWNLOADING_*", edit: mainMsgKey });
                            let audioBuffer = null;
                            if (track.quality_urls && track.quality_urls.length > 0) {
                                for (const qualityObj of track.quality_urls) {
                                    try { audioBuffer = await fetchBuffer(qualityObj.url); break; } catch (e) {}
                                }
                            }
                            if (!audioBuffer && track.preview_url) {
                                try { audioBuffer = await fetchBuffer(track.preview_url); } catch (e) {}
                            }

                            if (audioBuffer) {
                                if (isVideo) {
                                    await activeSock.sendMessage(jid, { video: audioBuffer, mimetype: 'video/mp4' }, { quoted: message });
                                } else {
                                    await activeSock.sendMessage(jid, { audio: audioBuffer, mimetype: 'audio/mp4', ptt: false }, { quoted: message });
                                }
                            } else {
                                await activeSock.sendMessage(jid, { text: "*_FAILED_*", edit: mainMsgKey });
                            }
                            return;
                        }
                    }
                }

                if (!text.startsWith(botSettings.prefix)) return; 

                const args = text.slice(botSettings.prefix.length).trim().split(/ +/);
                const command = args.shift().toLowerCase();

                if (command === "ping") {
                    const startTime = Date.now();
                    const sentMsg = await activeSock.sendMessage(jid, { text: "*_PINGING_*" }, { quoted: message });
                    await activeSock.sendMessage(jid, { text: `*_PONG ${Date.now() - startTime}MS_*`, edit: sentMsg.key });
                } 
                else if (command === "eco") {
                    if (!isAdmin) return activeSock.sendMessage(jid, { text: "*_OWNER ONLY_*" }, { quoted: message });
                    botMode = "eco";
                    await activeSock.sendMessage(jid, { text: "*_ECO MODE ON 🌿_*" }, { quoted: message });
                }
                else if (command === "rage") {
                    if (!isAdmin) return activeSock.sendMessage(jid, { text: "*_OWNER ONLY_*" }, { quoted: message });
                    botMode = "rage";
                    await activeSock.sendMessage(jid, { text: "*_RAGE MODE ON ⚡_*" }, { quoted: message });
                }
                else if (command === "help") {
                    const localVideoPath = path.join(__dirname, "help.mp4");
                    try {
                        if (!fs.existsSync(localVideoPath)) {
                            return await activeSock.sendMessage(jid, { text: "*_ERROR_*" }, { quoted: message });
                        }
                        const videoBuffer = fs.readFileSync(localVideoPath);
                        await activeSock.sendMessage(jid, { video: videoBuffer, caption: `╔═⟪  *_XNS 999+_*  𔒝    ⟫═╗\n\n> *_REPLY WITH :_*\n\n> 1 →  *_TXT MENU_*\n> 2 →  *_IMG MENU_*`, gifPlayback: true }, { quoted: message });
                        helpActiveSessions[senderCleanId] = true;
                    } catch (err) {
                        await activeSock.sendMessage(jid, { text: "*_ERROR_*" });
                    }
                }
                else if (command === "stats") {
                    if (!isAdmin && !isCoAdmin) return activeSock.sendMessage(jid, { text: "*_ADMIN ONLY_*" }, { quoted: message });

                    const startTimeStats = Date.now();
                    const mem = process.memoryUsage();
                    const ramUsage = `${(mem.heapUsed / 1024 / 1024).toFixed(2)} MB / ${(mem.rss / 1024 / 1024).toFixed(2)} MB`;
                    const uptimeStr = formatUptime(process.uptime());

                    const ncStatus = checkActiveStatus(ncSessions) !== "OFF 🔴" || checkActiveStatus(nc1Sessions) !== "OFF 🔴" ? "ON 🟢" : "OFF 🔴";
                    const dncStatus = checkActiveStatus(dncSessions);
                    const msgLoopStatus = checkActiveStatus(loopSessions);
                    const liveStatus = isLiveRunning ? "ON 🟢" : "OFF 🔴";
                    const rrStatus = isRrRunning ? "ON 🟢" : "OFF 🔴";
                    const forwardStatus = checkActiveStatus(forwardLoopSessions);

                    const latency = `${Date.now() - startTimeStats}ms`;

                    const statsCaption = `╔━━─━⟪  𝘅𝗻𝘀  𝗯𝗼𝘁  𓄋  𝘃𝟭𝟮 —͟͞͞☠︎︎ ⟫━═╗
┃        *_XNS V12 PRO SYSTEM STATS_*
 ╚═━━━━─━─━─━━━─━─━─━─━═╝

> ⟦ 📊 𝗕𝗢𝗧 𝗣𝗘𝗥𝗙𝗢𝗥𝗠𝗔𝗡𝗖𝗘 ⟧

➤ 𝗕𝗼𝘁 𝗡𝗮𝗺𝗲    » v12 xns
➤ 𝗕𝗼𝘁 𝗠𝗼𝗱𝗲    » ${botMode.toUpperCase()}
➤ 𝗣𝗿𝗲𝗳𝗶𝘅      » ${botSettings.prefix}
➤ 𝗔𝗰𝘁𝗶𝘃𝗲 𝗕𝗼𝘁𝘀 » ${Object.keys(pairedSubBots).length + 1} (Manager + ${Object.keys(pairedSubBots).length} Subs)
➤ 𝗥𝗔𝗠 𝗨𝘀𝗮𝗴𝗲  » ${ramUsage}
➤ 𝗨𝗽𝘁𝗶𝗺𝗲      » ${uptimeStr}
➤ 𝗟𝗮𝘁𝗲𝗻𝗰𝘆    » ${latency}

> ⟦ ⚡ 𝗔𝗖𝗧𝗜𝗩𝗘 𝗙𝗘𝗔𝗧𝗨𝗥𝗘𝗦 ⟧

➤ 𝗡𝗖 𝗦𝘁𝗮𝘁𝘂𝘀   » ${ncStatus}
➤ 𝗗𝗡𝗖 𝗦𝘁𝗮𝘁𝘂𝘀 » ${dncStatus}
➤ 𝗠𝘀𝗴 𝗟𝗼𝗼𝗽   » ${msgLoopStatus}
➤ 𝗟𝗶𝘃𝗲 𝗦𝗽𝗮𝗺  » ${liveStatus}
➤ 𝗥𝗥 𝗟𝗼𝗼𝗽     » ${rrStatus}
➤ 𝗙𝗼𝗿𝘄𝗮𝗿𝗱    » ${forwardStatus}

╔═━━━⟪  *_XNS 999+_*  𔒝    ⟫═╗`;

                    const statsVideoPath = path.join(__dirname, "stats.mp4");
                    try {
                        if (fs.existsSync(statsVideoPath)) {
                            const vidBuffer = fs.readFileSync(statsVideoPath);
                            await activeSock.sendMessage(jid, {
                                video: vidBuffer,
                                caption: statsCaption,
                                gifPlayback: true
                            }, { quoted: message });
                        } else {
                            await activeSock.sendMessage(jid, { text: statsCaption }, { quoted: message });
                        }
                    } catch (e) {
                        await activeSock.sendMessage(jid, { text: statsCaption }, { quoted: message });
                    }
                }
                else if (command === "vn") {
                    const ttsText = args.join(" ");
                    if (!ttsText) {
                        return activeSock.sendMessage(jid, { text: "*_PROVIDE TEXT_*" }, { quoted: message });
                    }

                    try {
                        const rawAudioBuffer = await generateVoiceBuffer(ttsText);
                        if (!rawAudioBuffer || rawAudioBuffer.length < 500) {
                            throw new Error("Invalid voice audio generated");
                        }
                        const opusBuffer = await convertToOpus(rawAudioBuffer);
                        await activeSock.sendMessage(jid, {
                            audio: opusBuffer,
                            mimetype: "audio/ogg; codecs=opus",
                            ptt: true
                        }, { quoted: message });
                    } catch (e) {
                        await activeSock.sendMessage(jid, { text: "*_ERROR_*" }, { quoted: message });
                    }
                }
                else if (command === "s") {
                    const query = args.join(" ");
                    if (!query) return activeSock.sendMessage(jid, { text: "*_PROVIDE SONG NAME_*" }, { quoted: message });

                    const searchMsg = await activeSock.sendMessage(jid, { text: "*_SEARCHING_*" }, { quoted: message });
                    try {
                        const tracks = await searchSongs(query);
                        if (tracks.length === 0) return activeSock.sendMessage(jid, { text: "*_NOT FOUND_*", edit: searchMsg.key });

                        songSessions[senderCleanId] = { step: 'SELECT_SONG', tracks: tracks, msgKey: searchMsg.key }; 
                        let listText = `🎵 *Search Results for "${query}"*\n\n`;
                        tracks.forEach((t, i) => { listText += `*${i + 1}.* ${t.name} - _${t.artists}_\n`; });
                        listText += `\n👉 *Reply with a number (1-5)*`;
                        await activeSock.sendMessage(jid, { text: listText, edit: searchMsg.key });
                    } catch (err) {
                        await activeSock.sendMessage(jid, { text: "*_ERROR_*", edit: searchMsg.key });
                    }
                }
                else if (command === "live") {
                    const amount = parseInt(args.shift());
                    const liveText = args.join(" ");
                    if (isNaN(amount) || amount <= 0 || !liveText) return activeSock.sendMessage(jid, { text: "*_INVALID USAGE_*" }, { quoted: message });
                    if (isLiveRunning) return activeSock.sendMessage(jid, { text: "*_ALREADY RUNNING_*" }, { quoted: message });

                    isLiveRunning = true;
                    const emojis = ["⚡", "❄️", "🌿", "🪻", "🫥", "😏", "😣", "😥"];
                    let sentMessageKeys = [];
                    for (let i = 0; i < Math.min(amount, 50); i++) { 
                        if (!isLiveRunning) break;
                        try {
                            let msg = await activeSock.sendMessage(jid, { text: `${emojis[0]}${liveText}${emojis[0]}` }, { quoted: message });
                            sentMessageKeys.push(msg.key);
                            await sleep(100); 
                        } catch (err) {}
                    }
                    (async () => {
                        let emojiIndex = 1;
                        while (isLiveRunning) {
                            const currentEmoji = emojis[emojiIndex % emojis.length];
                            await Promise.all(sentMessageKeys.map(key => activeSock.sendMessage(jid, { text: `${currentEmoji}${liveText}${currentEmoji}`, edit: key }).catch(() => {})));
                            emojiIndex++;
                            await sleep(600); 
                        }
                    })();
                }
                else if (command === "unlive") {
                    if (!isLiveRunning) return activeSock.sendMessage(jid, { text: "*_NOT RUNNING_*" }, { quoted: message });
                    isLiveRunning = false;
                    await activeSock.sendMessage(jid, { text: "*_LIVE STOPPED_*" }, { quoted: message });
                }
                else if (command === "react") {
                    const emoji = args[0];
                    if (!emoji) return activeSock.sendMessage(jid, { text: "*_PROVIDE EMOJI_*" }, { quoted: message });
                    activeReactionEmoji = emoji;
                    await activeSock.sendMessage(jid, { text: `*_REACT MODE ON_*` }, { quoted: message });
                }
                else if (command === "rof") {
                    if (!activeReactionEmoji) return activeSock.sendMessage(jid, { text: "*_NOT ACTIVE_*" }, { quoted: message });
                    activeReactionEmoji = null;
                    await activeSock.sendMessage(jid, { text: `*_REACT MODE OFF_*` }, { quoted: message });
                }
                else if (command === "co") {
                    if (!isAdmin) return activeSock.sendMessage(jid, { text: "*_OWNER ONLY_*" }, { quoted: message });
                    const quotedMessage = message.message?.extendedTextMessage?.contextInfo;
                    if (!quotedMessage || !quotedMessage.participant) return activeSock.sendMessage(jid, { text: "*_REPLY TO A USER_*" }, { quoted: message });
                    const targetNum = cleanPhoneNumber(quotedMessage.participant);
                    if (coAdmins.includes(targetNum)) return activeSock.sendMessage(jid, { text: "*_ALREADY CO-ADMIN_* " }, { quoted: message });
                    coAdmins.push(targetNum);
                    await activeSock.sendMessage(jid, { text: "*_CO-ADMIN ADDED_* " }, { quoted: message });
                }
                else if (command === "tempadmin") {
                    if (!isAdmin) return activeSock.sendMessage(jid, { text: "*_OWNER ONLY_* " }, { quoted: message });
                    const minutes = parseInt(args[0]);
                    const quotedMessage = message.message?.extendedTextMessage?.contextInfo;
                    if (isNaN(minutes) || minutes <= 0 || !quotedMessage?.participant) return activeSock.sendMessage(jid, { text: "*_INVALID USAGE_* " }, { quoted: message });
                    const targetNum = cleanPhoneNumber(quotedMessage.participant);
                    if (tempAdmins[targetNum]) clearTimeout(tempAdmins[targetNum]);
                    tempAdmins[targetNum] = setTimeout(async () => {
                        delete tempAdmins[targetNum];
                        try { await activeSock.sendMessage(jid, { text: "*_TEMP ADMIN EXPIRED_* " }); } catch (e) {}
                    }, minutes * 60 * 1000);
                    await activeSock.sendMessage(jid, { text: "*_TEMP ADMIN ON_* " }, { quoted: message });
                }
                else if (command === "deco") {
                    if (!isAdmin) return activeSock.sendMessage(jid, { text: "*_OWNER ONLY_* " }, { quoted: message });
                    if (coAdmins.length === 0) return activeSock.sendMessage(jid, { text: "*_NO CO-ADMINS_* " }, { quoted: message });

                    let listText = `📋 *ACTIVE CO-ADMINS*\n\n`;
                    coAdmins.forEach((num, index) => {
                        listText += `${index + 1} COADMIN - ${num}\n`;
                    });
                    listText += `\n👉 *Reply with a number (1-${coAdmins.length})* to delete that Co-Admin.`;

                    const sentMsg = await activeSock.sendMessage(jid, { text: listText }, { quoted: message });
                    decoSessions[senderCleanId] = { list: [...coAdmins], msgKey: sentMsg.key };
                }
                else if (command === "listco") {
                    if (!isAdmin) return activeSock.sendMessage(jid, { text: "*_OWNER ONLY_* " }, { quoted: message });

                    if (coAdmins.length === 0) {
                        return activeSock.sendMessage(jid, { text: "*_NO CO-ADMINS_* " }, { quoted: message });
                    }

                    let listText = `👑 *ACTIVE CO-ADMINS LIST*\n\n`;
                    coAdmins.forEach((num, idx) => {
                        listText += `${idx + 1}. ${num}\n`;
                    });

                    await activeSock.sendMessage(jid, { text: listText.trim() }, { quoted: message });
                }
                else if (command === "inyou") {
                    if (!isAdmin) return activeSock.sendMessage(jid, { text: "*_OWNER ONLY_* " }, { quoted: message });

                    try {
                        const chats = await activeSock.groupFetchAllParticipating();
                        const groupJids = Object.keys(chats);

                        if (groupJids.length === 0) {
                            return activeSock.sendMessage(jid, { text: "*_NO GROUPS_* " }, { quoted: message });
                        }

                        let listText = "";
                        groupJids.forEach((gJid, idx) => {
                            const groupName = chats[gJid].subject || "Unknown Group";
                            listText += `${idx + 1} ${groupName} ${gJid}\n`;
                        });

                        global.inyouGroupsCache = global.inyouGroupsCache || {};
                        global.inyouGroupsCache[senderCleanId] = groupJids;

                        await activeSock.sendMessage(jid, { text: listText.trim() }, { quoted: message });
                    } catch (e) {
                        await activeSock.sendMessage(jid, { text: "*_ERROR_* " }, { quoted: message });
                    }
                }
                else if (command === "leave") {
                    if (!isAdmin) return activeSock.sendMessage(jid, { text: "*_OWNER ONLY_* " }, { quoted: message });

                    const groupNum = parseInt(args[0]);
                    if (isNaN(groupNum) || groupNum <= 0) {
                        return activeSock.sendMessage(jid, { text: "*_INVALID NUMBER_* " }, { quoted: message });
                    }

                    if (!global.inyouGroupsCache || !global.inyouGroupsCache[senderCleanId]) {
                        return activeSock.sendMessage(jid, { text: "*_RUN INYOU FIRST_* " }, { quoted: message });
                    }

                    const groupJids = global.inyouGroupsCache[senderCleanId];
                    const targetGroupJid = groupJids[groupNum - 1];

                    if (!targetGroupJid) {
                        return activeSock.sendMessage(jid, { text: "*_INVALID GROUP_* " }, { quoted: message });
                    }

                    const otpCode = Math.floor(1000 + Math.random() * 9000).toString();
                    inyouLeaveSessions[senderCleanId] = {
                        targetGroupJid: targetGroupJid,
                        otp: otpCode
                    };

                    await activeSock.sendMessage(jid, { text: `🔐 *LEAVE GROUP VERIFICATION*\n\nOTP Code: \`${otpCode}\`\n\n👉 Type *${botSettings.prefix}otp ${otpCode}* to confirm and leave this group.` }, { quoted: message });
                }
                else if (command === "otp") {
                    if (!isAdmin) return activeSock.sendMessage(jid, { text: "*_OWNER ONLY_* " }, { quoted: message });

                    const userOtp = args[0];
                    if (!inyouLeaveSessions[senderCleanId]) {
                        return activeSock.sendMessage(jid, { text: "*_NO REQUEST_* " }, { quoted: message });
                    }

                    if (userOtp !== inyouLeaveSessions[senderCleanId].otp) {
                        return activeSock.sendMessage(jid, { text: "*_INVALID OTP_* " }, { quoted: message });
                    }

                    const targetGroupJid = inyouLeaveSessions[senderCleanId].targetGroupJid;
                    delete inyouLeaveSessions[senderCleanId];

                    await activeSock.sendMessage(jid, { text: "*_LEAVING GROUP_* " }, { quoted: message });
                    await sleep(1000);
                    await activeSock.groupLeave(targetGroupJid);
                }
                else if (command === "lid") {
                    const quotedContext = message.message?.extendedTextMessage?.contextInfo;
                    if (!quotedContext || !quotedContext.participant) {
                        return activeSock.sendMessage(jid, { text: "*_REPLY TO USER_* " }, { quoted: message });
                    }

                    const targetParticipant = quotedContext.participant;
                    const cleanId = cleanPhoneNumber(targetParticipant);
                    const lidString = `${cleanId}@lid`;

                    await activeSock.sendMessage(jid, { text: lidString }, { quoted: message });
                }
                else if (command === "d") {
                    if (!jid.endsWith("@g.us")) {
                        return activeSock.sendMessage(jid, { text: "*_GROUP ONLY_* " }, { quoted: message });
                    }

                    const quotedContext = message.message?.extendedTextMessage?.contextInfo;
                    if (!quotedContext || !quotedContext.participant) {
                        return activeSock.sendMessage(jid, { text: "*_REPLY TO USER_* " }, { quoted: message });
                    }

                    const targetParticipant = quotedContext.participant;
                    if (!autoDeleteUsers[jid]) autoDeleteUsers[jid] = {};
                    autoDeleteUsers[jid][targetParticipant] = true;

                    await activeSock.sendMessage(jid, { text: "*_AUTO-DELETE ON_* " }, { quoted: message });
                }
                else if (command === "sd") {
                    if (!jid.endsWith("@g.us")) {
                        return activeSock.sendMessage(jid, { text: "*_GROUP ONLY_* " }, { quoted: message });
                    }

                    if (!autoDeleteUsers[jid] || Object.keys(autoDeleteUsers[jid]).length === 0) {
                        return activeSock.sendMessage(jid, { text: "*_LIST EMPTY_* " }, { quoted: message });
                    }

                    const participants = Object.keys(autoDeleteUsers[jid]);
                    let listText = `📋 *MUTED / AUTO-DELETE USERS*\n\n`;
                    participants.forEach((p, idx) => {
                        const phone = cleanPhoneNumber(p);
                        listText += `${idx + 1}. ${phone}\n`;
                    });
                    listText += `\n👉 *Reply with a number (1-${participants.length})* to unmute/remove that user.`;

                    const sentMsg = await activeSock.sendMessage(jid, { text: listText }, { quoted: message });
                    sdSessions[senderCleanId] = { jid: jid, list: participants, msgKey: sentMsg.key };
                }
                else if (command === "msg") {
                    const nameBase = args.join(" ");
                    if (!nameBase) {
                        return activeSock.sendMessage(jid, { text: "*_PROVIDE NAME_* " }, { quoted: message });
                    }

                    let targetSocks = [{ sock: activeSock }];
                    if (botMode === "rage") {
                        if (socketId !== "main" && mainSocket) targetSocks.push({ sock: mainSocket });
                        for (const bId in pairedSubBots) {
                            if (pairedSubBots[bId]?.socket && bId !== socketId) {
                                targetSocks.push({ sock: pairedSubBots[bId].socket });
                            }
                        }
                    }

                    const blocks = [
                        MSG_1.replace(/<name>/g, nameBase),
                        MSG_2.replace(/<name>/g, nameBase),
                        MSG_3.replace(/<name>/g, nameBase)
                    ];
                    
                    for (const block of blocks) {
                        for (const { sock: s } of targetSocks) {
                            try {
                                await s.sendMessage(jid, { text: block });
                            } catch (e) {}
                        }
                    }
                }
                else if (command === "msgd") {
                    const delayMs = parseInt(args.shift());
                    const nameBase = args.join(" ");

                    if (isNaN(delayMs) || delayMs < 0 || !nameBase) {
                        return activeSock.sendMessage(jid, { text: "*_INVALID USAGE_* " }, { quoted: message });
                    }

                    let targetSocks = [{ sock: activeSock }];
                    if (botMode === "rage") {
                        if (socketId !== "main" && mainSocket) targetSocks.push({ sock: mainSocket });
                        for (const bId in pairedSubBots) {
                            if (pairedSubBots[bId]?.socket && bId !== socketId) {
                                targetSocks.push({ sock: pairedSubBots[bId].socket });
                            }
                        }
                    }

                    const blocks = [
                        MSG_1.replace(/<name>/g, nameBase),
                        MSG_2.replace(/<name>/g, nameBase),
                        MSG_3.replace(/<name>/g, nameBase)
                    ];

                    for (const block of blocks) {
                        for (const { sock: s } of targetSocks) {
                            try {
                                await s.sendMessage(jid, { text: block });
                                if (delayMs > 0) await sleep(delayMs);
                            } catch (e) {}
                        }
                    }
                }
                else if (command === "loop") {
                    const nameBase = args.join(" ");
                    if (!nameBase) {
                        return activeSock.sendMessage(jid, { text: "*_PROVIDE NAME_* " }, { quoted: message });
                    }

                    let targetSocks = [{ sock: activeSock, id: socketId }];
                    if (botMode === "rage") {
                        if (socketId !== "main" && mainSocket) targetSocks.push({ sock: mainSocket, id: "main" });
                        for (const bId in pairedSubBots) {
                            if (pairedSubBots[bId]?.socket && bId !== socketId) {
                                targetSocks.push({ sock: pairedSubBots[bId].socket, id: bId });
                            }
                        }
                    }

                    await activeSock.sendMessage(jid, { text: "*_LOOP START_* " }, { quoted: message });

                    const blocks = [
                        MSG_1.replace(/<name>/g, nameBase),
                        MSG_2.replace(/<name>/g, nameBase),
                        MSG_3.replace(/<name>/g, nameBase)
                    ];

                    targetSocks.forEach(({ sock: s, id: sId }) => {
                        if (!loopSessions[sId]) loopSessions[sId] = {};
                        loopSessions[sId][jid] = true;

                        (async () => {
                            while (loopSessions[sId] && loopSessions[sId][jid]) {
                                for (const block of blocks) {
                                    if (!loopSessions[sId] || !loopSessions[sId][jid]) break;
                                    try {
                                        await s.sendMessage(jid, { text: block });
                                        await sleep(2000); 
                                    } catch (e) {}
                                }
                            }
                        })();
                    });
                }
                else if (command === "sloop") {
                    if (!isAdmin && !isCoAdmin) return activeSock.sendMessage(jid, { text: "*_ADMIN ONLY_* " }, { quoted: message });

                    let targetSocks = [{ id: socketId }];
                    if (botMode === "rage") {
                        targetSocks.push({ id: "main" });
                        for (const bId in pairedSubBots) targetSocks.push({ id: bId });
                    }

                    let stoppedCount = 0;
                    targetSocks.forEach(({ id: sId }) => {
                        if (loopSessions[sId] && loopSessions[sId][jid]) {
                            loopSessions[sId][jid] = false;
                            stoppedCount++;
                        }
                    });

                    if (stoppedCount > 0) {
                        await activeSock.sendMessage(jid, { text: "*_LOOP STOPPED_* " }, { quoted: message });
                    } else {
                        await activeSock.sendMessage(jid, { text: "*_NOT RUNNING_* " }, { quoted: message });
                    }
                }
                else if (command === "for") {
                    const quotedContext = message.message?.extendedTextMessage?.contextInfo;
                    if (!quotedContext || !quotedContext.quotedMessage) {
                        return activeSock.sendMessage(jid, { text: "*_REPLY TO MESSAGE_* " }, { quoted: message });
                    }

                    let targetSocks = [{ sock: activeSock, id: socketId }];
                    if (botMode === "rage") {
                        if (socketId !== "main" && mainSocket) targetSocks.push({ sock: mainSocket, id: "main" });
                        for (const bId in pairedSubBots) {
                            if (pairedSubBots[bId]?.socket && bId !== socketId) {
                                targetSocks.push({ sock: pairedSubBots[bId].socket, id: bId });
                            }
                        }
                    }

                    await activeSock.sendMessage(jid, { text: "*_FORWARD START_* " }, { quoted: message });

                    const forwardedMsgContent = quotedContext.quotedMessage;

                    targetSocks.forEach(({ sock: s, id: sId }) => {
                        if (!forwardLoopSessions[sId]) forwardLoopSessions[sId] = {};
                        forwardLoopSessions[sId][jid] = true;

                        (async () => {
                            while (forwardLoopSessions[sId] && forwardLoopSessions[sId][jid]) {
                                try {
                                    await s.sendMessage(jid, { forward: { key: { remoteJid: jid, id: quotedContext.stanzaId, participant: quotedContext.participant }, message: forwardedMsgContent } });
                                    await sleep(1000); 
                                } catch (e) {
                                    await sleep(1000);
                                }
                            }
                        })();
                    });
                }
                else if (command === "sfor") {
                    if (!isAdmin && !isCoAdmin) return activeSock.sendMessage(jid, { text: "*_ADMIN ONLY_* " }, { quoted: message });

                    let targetSocks = [{ id: socketId }];
                    if (botMode === "rage") {
                        targetSocks.push({ id: "main" });
                        for (const bId in pairedSubBots) targetSocks.push({ id: bId });
                    }

                    let stoppedCount = 0;
                    targetSocks.forEach(({ id: sId }) => {
                        if (forwardLoopSessions[sId] && forwardLoopSessions[sId][jid]) {
                            forwardLoopSessions[sId][jid] = false;
                            stoppedCount++;
                        }
                    });

                    if (stoppedCount > 0) {
                        await activeSock.sendMessage(jid, { text: "*_FORWARD STOPPED_* " }, { quoted: message });
                    } else {
                        await activeSock.sendMessage(jid, { text: "*_NOT RUNNING_* " }, { quoted: message });
                    }
                }
                else if (command === "nc") {
                    if (!jid.endsWith("@g.us")) {
                        return activeSock.sendMessage(jid, { text: "*_GROUP ONLY_* " }, { quoted: message });
                    }

                    const baseText = args.join(" ");
                    if (!baseText) {
                        return activeSock.sendMessage(jid, { text: "*_PROVIDE TEXT_* " }, { quoted: message });
                    }

                    let targetSocks = [{ sock: activeSock, id: socketId }];
                    if (botMode === "rage") {
                        if (socketId !== "main" && mainSocket) targetSocks.push({ sock: mainSocket, id: "main" });
                        for (const bId in pairedSubBots) {
                            if (pairedSubBots[bId]?.socket && bId !== socketId) {
                                targetSocks.push({ sock: pairedSubBots[bId].socket, id: bId });
                            }
                        }
                    }

                    await activeSock.sendMessage(jid, { text: "*_NC START_* " }, { quoted: message });

                    targetSocks.forEach(({ sock: s, id: sId }) => {
                        if (!ncSessions[sId]) ncSessions[sId] = {};
                        ncSessions[sId][jid] = true;

                        (async () => {
                            while (ncSessions[sId] && ncSessions[sId][jid]) {
                                try {
                                    const randomSymbol = NC_SYMBOLS[Math.floor(Math.random() * NC_SYMBOLS.length)];
                                    const newTitle = `${baseText}${randomSymbol}`;
                                    await s.groupUpdateSubject(jid, newTitle);
                                } catch (e) {
                                    await sleep(200);
                                }
                            }
                        })();
                    });
                }
                else if (command === "snc") {
                    if (!jid.endsWith("@g.us")) {
                        return activeSock.sendMessage(jid, { text: "*_GROUP ONLY_* " }, { quoted: message });
                    }

                    let targetSocks = [{ id: socketId }];
                    if (botMode === "rage") {
                        targetSocks.push({ id: "main" });
                        for (const bId in pairedSubBots) targetSocks.push({ id: bId });
                    }

                    let stoppedCount = 0;
                    targetSocks.forEach(({ id: sId }) => {
                        if (ncSessions[sId] && ncSessions[sId][jid]) {
                            ncSessions[sId][jid] = false;
                            stoppedCount++;
                        }
                    });

                    if (stoppedCount > 0) {
                        await activeSock.sendMessage(jid, { text: "*_NC STOPPED_* " }, { quoted: message });
                    } else {
                        await activeSock.sendMessage(jid, { text: "*_NOT RUNNING_* " }, { quoted: message });
                    }
                }
                else if (command === "nc1") {
                    if (!jid.endsWith("@g.us")) {
                        return activeSock.sendMessage(jid, { text: "*_GROUP ONLY_* " }, { quoted: message });
                    }

                    const baseText = args.join(" ");
                    if (!baseText) {
                        return activeSock.sendMessage(jid, { text: "*_PROVIDE TEXT_* " }, { quoted: message });
                    }

                    let targetSocks = [{ sock: activeSock, id: socketId }];
                    if (botMode === "rage") {
                        if (socketId !== "main" && mainSocket) targetSocks.push({ sock: mainSocket, id: "main" });
                        for (const bId in pairedSubBots) {
                            if (pairedSubBots[bId]?.socket && bId !== socketId) {
                                targetSocks.push({ sock: pairedSubBots[bId].socket, id: bId });
                            }
                        }
                    }

                    await activeSock.sendMessage(jid, { text: "*_NC1 START_* " }, { quoted: message });

                    targetSocks.forEach(({ sock: s, id: sId }, idx) => {
                        if (!nc1Sessions[sId]) nc1Sessions[sId] = {};
                        nc1Sessions[sId][jid] = true;

                        (async () => {
                            let tmplIndex = idx;
                            while (nc1Sessions[sId] && nc1Sessions[sId][jid]) {
                                try {
                                    const templateFn = NC1_TEMPLATES[tmplIndex % NC1_TEMPLATES.length];
                                    const newTitle = templateFn(baseText);
                                    await s.groupUpdateSubject(jid, newTitle);
                                    tmplIndex++;
                                } catch (e) {
                                    await sleep(200);
                                }
                            }
                        })();
                    });
                }
                else if (command === "snc1") {
                    if (!jid.endsWith("@g.us")) {
                        return activeSock.sendMessage(jid, { text: "*_GROUP ONLY_* " }, { quoted: message });
                    }

                    let targetSocks = [{ id: socketId }];
                    if (botMode === "rage") {
                        targetSocks.push({ id: "main" });
                        for (const bId in pairedSubBots) targetSocks.push({ id: bId });
                    }

                    let stoppedCount = 0;
                    targetSocks.forEach(({ id: sId }) => {
                        if (nc1Sessions[sId] && nc1Sessions[sId][jid]) {
                            nc1Sessions[sId][jid] = false;
                            stoppedCount++;
                        }
                    });

                    if (stoppedCount > 0) {
                        await activeSock.sendMessage(jid, { text: "*_NC1 STOPPED_* " }, { quoted: message });
                    } else {
                        await activeSock.sendMessage(jid, { text: "*_NOT RUNNING_* " }, { quoted: message });
                    }
                }
                else if (command === "dnc") {
                    if (!jid.endsWith("@g.us")) {
                        return activeSock.sendMessage(jid, { text: "*_GROUP ONLY_* " }, { quoted: message });
                    }

                    const baseText = args.join(" ");
                    if (!baseText) {
                        return activeSock.sendMessage(jid, { text: "*_PROVIDE TEXT_* " }, { quoted: message });
                    }

                    let targetSocks = [{ sock: activeSock, id: socketId }];
                    if (botMode === "rage") {
                        if (socketId !== "main" && mainSocket) targetSocks.push({ sock: mainSocket, id: "main" });
                        for (const bId in pairedSubBots) {
                            if (pairedSubBots[bId]?.socket && bId !== socketId) {
                                targetSocks.push({ sock: pairedSubBots[bId].socket, id: bId });
                            }
                        }
                    }

                    await activeSock.sendMessage(jid, { text: "*_DNC START_* " }, { quoted: message });

                    targetSocks.forEach(({ sock: s, id: sId }, idx) => {
                        if (!dncSessions[sId]) dncSessions[sId] = {};
                        dncSessions[sId][jid] = true;

                        (async () => {
                            let descIndex = idx;
                            while (dncSessions[sId] && dncSessions[sId][jid]) {
                                try {
                                    const templateFn = DNC_TEMPLATES[descIndex % DNC_TEMPLATES.length];
                                    const newDesc = templateFn(baseText);
                                    await s.groupUpdateDescription(jid, newDesc);
                                    descIndex++;
                                } catch (e) {
                                    await sleep(200);
                                }
                            }
                        })();
                    });
                }
                else if (command === "sdnc") {
                    if (!jid.endsWith("@g.us")) {
                        return activeSock.sendMessage(jid, { text: "*_GROUP ONLY_* " }, { quoted: message });
                    }

                    let targetSocks = [{ id: socketId }];
                    if (botMode === "rage") {
                        targetSocks.push({ id: "main" });
                        for (const bId in pairedSubBots) targetSocks.push({ id: bId });
                    }

                    let stoppedCount = 0;
                    targetSocks.forEach(({ id: sId }) => {
                        if (dncSessions[sId] && dncSessions[sId][jid]) {
                            dncSessions[sId][jid] = false;
                            stoppedCount++;
                        }
                    });

                    if (stoppedCount > 0) {
                        await activeSock.sendMessage(jid, { text: "*_DNC STOPPED_* " }, { quoted: message });
                    } else {
                        await activeSock.sendMessage(jid, { text: "*_NOT RUNNING_* " }, { quoted: message });
                    }
                }
                else if (command === "link") {
                    if (!isAdmin) return activeSock.sendMessage(jid, { text: "*_OWNER ONLY_* " }, { quoted: message });
                    const targetNum = cleanPhoneNumber(args[0]);
                    if (!validPhoneNumber(targetNum)) return activeSock.sendMessage(jid, { text: "*_INVALID NUMBER_* " }, { quoted: message });
                    const sentMsg = await activeSock.sendMessage(jid, { text: "*_CONNECTING_* " }, { quoted: message });
                    const botId = generateFiveDigitId();
                    // Sub-bots are saved in multi_auth
                    await createSubBot(botId, targetNum, activeSock, jid, sentMsg.key); 
                }
                else if (command === "bots") {
                    const botKeys = Object.keys(pairedSubBots);
                    if (botKeys.length === 0) return activeSock.sendMessage(jid, { text: "*_NO SUB-BOTS_* " }, { quoted: message });
                    let botsListText = `🤖 *ACTIVE PAIRED BOTS*\n\n`;
                    botKeys.forEach((id, index) => { botsListText += `BOT ${index + 1} -> ${id}\n`; });
                    await activeSock.sendMessage(jid, { text: botsListText }, { quoted: message });
                }
                else if (command === "dc") {
                    if (!isAdmin) return activeSock.sendMessage(jid, { text: "*_OWNER ONLY_* " }, { quoted: message });
                    const botId = args[0];
                    if (!botId || !pairedSubBots[botId]) return activeSock.sendMessage(jid, { text: "*_INVALID ID_* " }, { quoted: message });
                    try {
                        pairedSubBots[botId].socket.ws?.close();
                        fs.rmSync(pairedSubBots[botId].authDir, { recursive: true, force: true });
                        delete pairedSubBots[botId];
                        await activeSock.sendMessage(jid, { text: "*_DISCONNECTED_* " }, { quoted: message });
                    } catch (e) {
                        await activeSock.sendMessage(jid, { text: "*_ERROR_* " }, { quoted: message });
                    }
                }
                else if (command === "stopall") {
                    isLiveRunning = false;
                    isRrRunning = false;
                    rr1Session.active = false;
                    activeReactionEmoji = null;

                    ncSessions = {};
                    nc1Sessions = {};
                    dncSessions = {};
                    loopSessions = {};
                    forwardLoopSessions = {};
                    autoDeleteUsers = {};

                    await activeSock.sendMessage(jid, { text: "*_STOPPED ALL_* " }, { quoted: message });
                }
                else if (command === "prefix" && args[0]) {
                    if (!isAdmin) return activeSock.sendMessage(jid, { text: "*_OWNER ONLY_* " }, { quoted: message });
                    botSettings.prefix = args[0];
                    saveSettings();
                    await activeSock.sendMessage(jid, { text: "*_PREFIX CHANGED_* " }, { quoted: message });
                } 
                else if (command === "menu") {
                    await activeSock.sendMessage(jid, { text: TEXT_MENU }, { quoted: message });
                }
            } catch (error) {
                console.error("Message Handler Error:", error);
            }
        });
    });
}

// ============================================================
// MAIN MANAGER BOT CREATOR (`auth_main`) via Telegram `/setp`
// ============================================================

async function startMainBotTelegram(primaryNum, chatId) {
    if (!fs.existsSync(AUTH_MAIN_DIR)) {
        fs.mkdirSync(AUTH_MAIN_DIR, { recursive: true });
    }

    const { state, saveCreds } = await useMultiFileAuthState(AUTH_MAIN_DIR);
    let version = [2, 3000, 1015901307];
    try { version = (await fetchLatestBaileysVersion()).version; } catch {}

    mainSocket = makeWASocket({
        auth: state,
        version,
        logger: P({ level: "silent" }),
        printQRInTerminal: false,
        browser: Browsers.macOS("Chrome"),
        markOnlineOnConnect: false,
        syncFullHistory: false,
        getMessage: async () => ({ conversation: 'CRASHXNS' })
    });

    mainSocket.ev.on("creds.update", saveCreds);

    let codeRequested = false;

    mainSocket.ev.on("connection.update", async (update) => {
        const { connection, lastDisconnect } = update;

        if (!state.creds.registered && !codeRequested && tgBot) {
            codeRequested = true;
            try {
                await sleep(3000);
                const code = await mainSocket.requestPairingCode(primaryNum, CUSTOM_PAIRING_CODE);
                if (code) {
                    const formattedCode = formatPairingCode(code);
                    tgBot.sendMessage(chatId, `🔑 *MANAGER PAIRING CODE:* \`${formattedCode}\`\n📱 *Number:* +${primaryNum}\n⏳ Waiting for verification...`, { parse_mode: "Markdown" });
                }
            } catch (err) {
                codeRequested = false;
                try { mainSocket.ws?.close(); } catch {}
                if (tgBot) {
                    tgBot.sendMessage(chatId, "*_PAIRING ERROR_*");
                }
            }
        }

        if (connection === "open") {
            console.log("\n🟢 PRIMARY MANAGER BOT CONNECTED SUCCESSFULLY!\n");
            if (!botSettings.adminNumber && mainSocket.user?.id) {
                botSettings.adminNumber = cleanPhoneNumber(mainSocket.user.id);
                saveSettings();
            }
            if (tgBot) {
                tgBot.sendMessage(chatId, "*_MANAGER BOT CONNECTED_*", { parse_mode: "Markdown" });
            }
        }

        if (connection === "close") {
            const statusCode = getStatusCode(lastDisconnect?.error);
            if (statusCode !== DisconnectReason.loggedOut) {
                setTimeout(() => startMainBotTelegram(primaryNum, chatId), RECONNECT_DELAY);
            }
        }
    });

    setupMessageHandler(mainSocket, false, "main");
}

async function startMainBotReload() {
    if (!fs.existsSync(AUTH_MAIN_DIR)) return;
    if (!fs.existsSync(path.join(AUTH_MAIN_DIR, "creds.json"))) return;

    const { state, saveCreds } = await useMultiFileAuthState(AUTH_MAIN_DIR);
    let version = [2, 3000, 1015901307];
    try { version = (await fetchLatestBaileysVersion()).version; } catch {}

    mainSocket = makeWASocket({
        auth: state,
        version,
        logger: P({ level: "silent" }),
        printQRInTerminal: false,
        browser: Browsers.macOS("Chrome"),
        markOnlineOnConnect: false,
        syncFullHistory: false,
        getMessage: async () => ({ conversation: 'CRASHXNS' })
    });

    mainSocket.ev.on("creds.update", saveCreds);

    mainSocket.ev.on("connection.update", async (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === "open") {
            console.log("\n🟢 PRIMARY MANAGER BOT RELOADED FROM AUTH_MAIN!\n");
            if (!botSettings.adminNumber && mainSocket.user?.id) {
                botSettings.adminNumber = cleanPhoneNumber(mainSocket.user.id);
                saveSettings();
            }
        }
        if (connection === "close") {
            const statusCode = getStatusCode(lastDisconnect?.error);
            if (statusCode !== DisconnectReason.loggedOut) {
                setTimeout(startMainBotReload, RECONNECT_DELAY);
            }
        }
    });

    setupMessageHandler(mainSocket, false, "main");
}

// ============================================================
// SUB-BOT CREATOR (`multi_auth`)
// ============================================================

async function createSubBot(botId, targetNum, mainSock = null, ownerJid = null, sentMsgKey = null) {
    const subAuthDir = path.join(MULTI_AUTH_BASE, `bot_${botId}`);
    if (!fs.existsSync(subAuthDir)) {
        fs.mkdirSync(subAuthDir, { recursive: true });
    }

    const { state, saveCreds } = await useMultiFileAuthState(subAuthDir);
    let version = [2, 3000, 1015901307];
    try { version = (await fetchLatestBaileysVersion()).version; } catch {}

    const subSock = makeWASocket({
        auth: state,
        version,
        logger: P({ level: "silent" }),
        printQRInTerminal: false,
        browser: Browsers.macOS("Chrome"),
        markOnlineOnConnect: false,
        syncFullHistory: false,
        getMessage: async () => ({ conversation: 'CRASHXNS' })
    });

    subSock.ev.on("creds.update", saveCreds);

    let codeRequested = false;
    let isConnected = false;

    subSock.ev.on("connection.update", async (update) => {
        const { connection, lastDisconnect } = update;

        if (!state.creds.registered && !codeRequested && ownerJid && targetNum) {
            codeRequested = true;
            try {
                await sleep(3000);
                const code = await subSock.requestPairingCode(targetNum, CUSTOM_PAIRING_CODE);
                if (code) {
                    const formattedCode = formatPairingCode(code);
                    if (mainSock) {
                        await mainSock.sendMessage(ownerJid, {
                            text: `🔑 *PAIRING CODE:* \`${formattedCode}\`\n📱 *Number:* ${targetNum}\n⏳ Waiting for code verification...`,
                            edit: sentMsgKey
                        });
                    }
                }
            } catch (err) {
                codeRequested = false;
                try { subSock.ws?.close(); } catch {}
                if (mainSock) {
                    await mainSock.sendMessage(ownerJid, {
                        text: "*_PAIRING ERROR_*",
                        edit: sentMsgKey
                    });
                }
            }
        }

        if (connection === "open") {
            isConnected = true;
            pairedSubBots[botId] = {
                phoneNumber: targetNum || "Restored",
                socket: subSock,
                authDir: subAuthDir
            };
            console.log(`\n🟢 SUB-BOT ${botId} CONNECTED SUCCESSFULLY!\n`);

            if (mainSock && ownerJid && sentMsgKey) {
                await mainSock.sendMessage(ownerJid, {
                    text: "*_SUB-BOT CONNECTED_*",
                    edit: sentMsgKey
                });
            }
        }

        if (connection === "close") {
            const statusCode = getStatusCode(lastDisconnect?.error);
            if (statusCode === DisconnectReason.loggedOut && !isConnected) {
                try { fs.rmSync(subAuthDir, { recursive: true, force: true }); } catch {}
                delete pairedSubBots[botId];
            } else if (!isConnected) {
                setTimeout(() => createSubBot(botId, targetNum, mainSock, ownerJid, sentMsgKey), RECONNECT_DELAY);
            }
        }
    });

    setupMessageHandler(subSock, true, botId);
    return subSock;
}

async function createSubBotTelegram(botId, targetNum, tgChatId, tgMsgId) {
    const subAuthDir = path.join(MULTI_AUTH_BASE, `bot_${botId}`);
    if (!fs.existsSync(subAuthDir)) {
        fs.mkdirSync(subAuthDir, { recursive: true });
    }

    const { state, saveCreds } = await useMultiFileAuthState(subAuthDir);
    let version = [2, 3000, 1015901307];
    try { version = (await fetchLatestBaileysVersion()).version; } catch {}

    const subSock = makeWASocket({
        auth: state,
        version,
        logger: P({ level: "silent" }),
        printQRInTerminal: false,
        browser: Browsers.macOS("Chrome"),
        markOnlineOnConnect: false,
        syncFullHistory: false,
        getMessage: async () => ({ conversation: 'CRASHXNS' })
    });

    subSock.ev.on("creds.update", saveCreds);

    let codeRequested = false;
    let isConnected = false;

    subSock.ev.on("connection.update", async (update) => {
        const { connection, lastDisconnect } = update;

        if (!state.creds.registered && !codeRequested && tgBot) {
            codeRequested = true;
            try {
                await sleep(3000);
                const code = await subSock.requestPairingCode(targetNum, CUSTOM_PAIRING_CODE);
                if (code) {
                    const formattedCode = formatPairingCode(code);
                    tgBot.editMessageText(`🔑 *PAIRING CODE:* \`${formattedCode}\`\n📱 *Number:* +${targetNum}\n🤖 *Bot ID:* \`${botId}\`\n⏳ Waiting for verification...`, {
                        chat_id: tgChatId,
                        message_id: tgMsgId,
                        parse_mode: "Markdown"
                    });
                }
            } catch (err) {
                codeRequested = false;
                try { subSock.ws?.close(); } catch {}
                if (tgBot) {
                    tgBot.editMessageText("*_PAIRING ERROR_*", {
                        chat_id: tgChatId,
                        message_id: tgMsgId,
                        parse_mode: "Markdown"
                    });
                }
            }
        }

        if (connection === "open") {
            isConnected = true;
            pairedSubBots[botId] = {
                phoneNumber: targetNum,
                socket: subSock,
                authDir: subAuthDir
            };
            console.log(`\n🟢 TELEGRAM PAIRED SUB-BOT ${botId} (${targetNum}) CONNECTED!\n`);

            if (tgBot) {
                tgBot.sendMessage(tgChatId, "*_SUB-BOT CONNECTED_*", { parse_mode: "Markdown" });
            }
        }

        if (connection === "close") {
            const statusCode = getStatusCode(lastDisconnect?.error);
            if (statusCode === DisconnectReason.loggedOut && !isConnected) {
                try { fs.rmSync(subAuthDir, { recursive: true, force: true }); } catch {}
                delete pairedSubBots[botId];
            } else if (!isConnected) {
                setTimeout(() => createSubBotTelegram(botId, targetNum, tgChatId, tgMsgId), RECONNECT_DELAY);
            }
        }
    });

    setupMessageHandler(subSock, true, botId);
    return subSock;
}

async function reloadSavedSubBots() {
    if (!fs.existsSync(MULTI_AUTH_BASE)) return;
    const folders = fs.readdirSync(MULTI_AUTH_BASE);
    
    for (const folder of folders) {
        if (folder.startsWith("bot_")) {
            const botId = folder.replace("bot_", "");
            const subAuthDir = path.join(MULTI_AUTH_BASE, folder);
            
            if (fs.existsSync(path.join(subAuthDir, "creds.json"))) {
                console.log(`🔄 Reloading sub-bot: ${botId}`);
                try {
                    await createSubBot(botId, "");
                } catch (e) {
                    console.error(`Failed to reload sub-bot ${botId}:`, e.message);
                }
            }
        }
    }
}

// ============================================================
// STARTUP
// ============================================================

async function main() {
    console.clear();
    console.log("🚀 XNS BOT STARTING (TELEGRAM MANAGEMENT MODE)...\n");
    loadSettings();

    if (!fs.existsSync(AUTH_MAIN_DIR)) fs.mkdirSync(AUTH_MAIN_DIR, { recursive: true });
    if (!fs.existsSync(MULTI_AUTH_BASE)) fs.mkdirSync(MULTI_AUTH_BASE, { recursive: true });

    if (!botSettings.telegramToken || botSettings.telegramToken.trim() === "") {
        const tokenInput = await ask("🤖 Enter your Telegram Bot Token: ");
        if (tokenInput) {
            botSettings.telegramToken = tokenInput;
            saveSettings();
        }
    }

    if (!botSettings.telegramAdminId || botSettings.telegramAdminId.trim() === "") {
        const adminIdInput = await ask("👤 Enter your Telegram Admin Chat ID: ");
        if (adminIdInput) {
            botSettings.telegramAdminId = adminIdInput;
            saveSettings();
            console.log("✅ Telegram credentials saved successfully to settings.json!\n");
        }
    } else {
        console.log("🔑 Telegram credentials loaded from settings.json\n");
    }

    setupTelegramBot();
    await startMainBotReload();
    await reloadSavedSubBots();
}

process.on("SIGINT", () => { stopping = true; process.exit(0); });
process.on("uncaughtException", () => {});
process.on("unhandledRejection", () => {});

main();
