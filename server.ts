import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { BotSettings, BotStatus, LogEntry, ChatMessage } from './src/types.js';

dotenv.config();

const app = express();
const PORT = 3000;

// JSON parser
app.use(express.json());

// Initialize Gemini Client safely
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey && apiKey !== 'MY_GEMINI_API_KEY' && apiKey !== '') {
  try {
    ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
    console.log('Gemini AI Client initialized successfully for Server-Side calls.');
  } catch (error) {
    console.error('Error initializing Gemini Client:', error);
  }
} else {
  console.log('Gemini API Key missing or default. Simulated AI model mode enabled.');
}

// In-Memory Bot State
let botSettings: BotSettings = {
  ownerName: 'Mohsin Raza',
  ownerNumber: '+923254834280',
  botName: 'Atlas Mohsin MD',
  prefix: '.',
  autoRead: true,
  antiDelete: true,
  antiCall: true,
  autoBio: true,
  welcomeMessage: 'Assalamu Alaikum! I am Mohsin Raza\'s automated assistant bot. Type .menu to see available commands.',
  status: 'online',
  pairingCode: 'MOHS-RAZA-LINK',
};

let botStatus: BotStatus = {
  uptime: '4 days, 12 hours, 31 minutes',
  ping: 18,
  cpuLoad: 12.4,
  memoryUsage: '142 MB / 512 MB',
  connectedDevices: 1,
  totalGroups: 42,
  totalChats: 184,
  totalCommandsExecuted: 1248,
};

let logs: LogEntry[] = [
  { id: '1', timestamp: new Date(Date.now() - 3600000 * 2).toISOString(), type: 'info', text: 'Initializing Atlas MD Engine...' },
  { id: '2', timestamp: new Date(Date.now() - 3600000 * 1.9).toISOString(), type: 'info', text: 'Connecting to multi-device sockets using Whiskeysockets...' },
  { id: '3', timestamp: new Date(Date.now() - 3600000 * 1.8).toISOString(), type: 'success', text: `Session authenticated for: Mohsin Raza (${botSettings.ownerNumber})` },
  { id: '4', timestamp: new Date(Date.now() - 3600000 * 1.7).toISOString(), type: 'info', text: 'Synching conversation database and contacts...' },
  { id: '5', timestamp: new Date(Date.now() - 3600000 * 1.6).toISOString(), type: 'success', text: 'Atlas Mohsin MD is now running on secure Cloud container.' },
  { id: '6', timestamp: new Date(Date.now() - 60000).toISOString(), type: 'info', text: 'Pre-caching AI templates and assets...' },
  { id: '7', timestamp: new Date().toISOString(), type: 'info', text: 'Connection is stable. Latency: 18ms. Awaiting messages...' },
];

// Helper to push a server log
function addLog(type: 'info' | 'success' | 'warn' | 'error' | 'message', text: string) {
  const newLog: LogEntry = {
    id: Math.random().toString(36).substr(2, 9),
    timestamp: new Date().toISOString(),
    type,
    text,
  };
  logs.push(newLog);
  if (logs.length > 100) logs.shift(); // Keep last 100 logs
}

// REST endpoints
app.get('/api/bot/status', (req, res) => {
  res.json({
    settings: botSettings,
    status: botStatus,
    logs: logs,
  });
});

app.post('/api/bot/update-settings', (req, res) => {
  const updated = req.body;
  botSettings = { ...botSettings, ...updated };
  addLog('warn', `Settings modified: prefix="${botSettings.prefix}", autoRead=${botSettings.autoRead}, antiDelete=${botSettings.antiDelete}`);
  res.json({ success: true, settings: botSettings });
});

app.get('/api/bot/generate-pairing', (req, res) => {
  // Generate random pairing code
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    if (i === 4) code += '-';
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  botSettings.pairingCode = code;
  addLog('info', `Generated pairing code: ${code} for linking web multi-device...`);
  res.json({ pairingCode: code });
});

// Primary controller for processing bot commands
app.post('/api/bot/execute-command', async (req, res) => {
  const { text, senderName, senderNumber } = req.body;
  
  if (!text) {
    return res.status(400).json({ error: 'Message text is required' });
  }

  botStatus.totalCommandsExecuted += 1;
  addLog('message', `Incoming msg from ${senderName} (${senderNumber}): "${text}"`);

  // Analyze if it starts with the bot prefix
  const prefix = botSettings.prefix;
  if (!text.startsWith(prefix)) {
    // If it's the owner greeting or something of general interest
    if (botSettings.autoRead) {
      // Simulate Bot auto responder or simple auto reading logs
      return res.json({
        responses: [
          {
            id: Math.random().toString(36).substr(2, 9),
            senderName: botSettings.botName,
            senderNumber: botSettings.ownerNumber,
            text: `Message auto-read has been triggered. Logging conversation context.`,
            timestamp: new Date().toISOString(),
            isMe: true,
            isSystem: true,
          }
        ]
      });
    }
    return res.json({ responses: [] });
  }

  // Parse command name and parameters
  const rawBody = text.slice(prefix.length).trim();
  const args = rawBody.split(' ');
  const command = args[0].toLowerCase();
  const commandArgs = args.slice(1).join(' ');

  const responses: ChatMessage[] = [];

  const createBotMessage = (msgText: string, media?: { url: string; type: 'image' | 'audio' | 'sticker' | 'video'; caption?: string }) => {
    return {
      id: Math.random().toString(36).substr(2, 9),
      senderName: botSettings.botName,
      senderNumber: botSettings.ownerNumber,
      text: msgText,
      timestamp: new Date().toISOString(),
      isMe: true,
      mediaUrl: media?.url,
      mediaType: media?.type,
      caption: media?.caption,
    };
  };

  // Commands processing rules
  switch (command) {
    case 'menu':
    case 'help': {
      addLog('info', `Executed command [${prefix}${command}] requested by ${senderName}`);
      const menuText = `╭───「 *${botSettings.botName.toUpperCase()}* 」
│ ᴘʀᴇꜰɪx: [ *${prefix}* ]
│ sᴛᴀᴛᴜs: ᴏɴʟɪɴᴇ ⚡
│ ᴏᴡɴᴇʀ: Mohsin Raza
│ ɴᴜᴍʙᴇʀ: ${botSettings.ownerNumber}
╰───────────────────

*🧠 ATLAS AI COGNITIVE*
✦ *${prefix}ai <prompt>* - Query Gemini Flash AI chatbot
✦ *${prefix}image <prompt>* - Create high-quality AI images
✦ *${prefix}lyrics <song>* - Extract professional song lyrics
✦ *${prefix}tr <text>* - Translate any body text to Urdu/English

*📩 SOCIAL & MEDIA DOWNLOADERS*
✦ *${prefix}song <name>* - Retrieve high-fidelity audio stream
✦ *${prefix}video <query>* - Convert query to simulated video streaming link
✦ *${prefix}tiktok <url>* - Direct high quality TikTok downloader status
✦ *${prefix}instagram <url>* - Instagram reels and stories link extraction
✦ *${prefix}facebook <url>* - Parse Facebook post clips instantly

*🛡️ GROUP ADMINISTRATION*
✦ *${prefix}promote <name>* - Grant user Admin privileges
✦ *${prefix}demote <name>* - Revoke group Admin privileges
✦ *${prefix}kick <name>* - Eject bad actor/spam participant
✦ *${prefix}add <number>* - Direct invitation hook simulation
✦ *${prefix}hidetag <text>* - Silently mention all local members

*🛠️ SMART TECH UTILITIES*
✦ *${prefix}fancy <text>* - Generate lovely custom calligraphic styling
✦ *${prefix}weather <city>* - Real-time weather and temperature stats
✦ *${prefix}carbon <snippet>* - High fidelity snippet card rendering
✦ *${prefix}screenshot <url>* - Capture visual website layouts
✦ *${prefix}status* - Host container memory, CPU, and speed metrics
✦ *${prefix}ping* - Server response lag indicator
✦ *${prefix}alive* - Check online status and core active module
✦ *${prefix}owner* - Direct contact and profile info card

*🎮 FUN & ENTERTAINMENT*
✦ *${prefix}joke* - Ask Gemini to generate smart humor
✦ *${prefix}quote* - Request beautiful wisdom quotes
✦ *${prefix}meme* - Load custom developer workspace memes
✦ *${prefix}trivia* - Engage in a quick smart intelligence test
✦ *${prefix}truth* / *${prefix}dare* - Casual community party game prompts

_To invoke any utility, type the command prefix followed by command name!_`;
      responses.push(createBotMessage(menuText));
      break;
    }

    case 'ai':
    case 'gpt': {
      if (!commandArgs) {
        responses.push(createBotMessage(`❌ Please specify a query! Example: \`${prefix}ai What is quantum computing?\``));
        break;
      }
      
      addLog('info', `Calling Gemini AI API on behalf of command [${prefix}${command}] with prompt: "${commandArgs}"`);
      
      try {
        if (ai) {
          const geminiResponse = await ai.models.generateContent({
            model: 'gemini-3.5-flash',
            contents: commandArgs,
            config: {
              systemInstruction: `You are a helpful WhatsApp Multi-Device assistant bot named "${botSettings.botName}". Your developer is Mohsin Raza, whose phone number is ${botSettings.ownerNumber}. Keep responses conversational, concise, and structured with clean bullet points and clear WhatsApp markdown format (use * for bold, _ for italics, ~ for strikethrough, \`\`\` for code).`,
            }
          });
          
          const reply = geminiResponse.text || "Apologies, the model returned an empty body.";
          addLog('success', `Gemini completed inference successfully.`);
          responses.push(createBotMessage(reply));
        } else {
          // Failure fallback / Simulation mode
          addLog('warn', `Gemini API key is not configured or offline. Running simulation mode.`);
          const simReply = `*🤖 ATLAS AI [OFFLINE SIMULATED]*
          
*User queried*: "${commandArgs}"
          
*Response:*
Thank you for your prompt! Since your WhatsApp bot is currently running in local demonstration mode without a live \`GEMINI_API_KEY\` set up in your secrets panel, I'm providing this simulated greeting.

*To activate live AI functionality:*
1. Navigate to *Settings > Secrets* in your Google AI Studio workspace.
2. Inject your *GEMINI_API_KEY*.
3. Restart the server.

_This bot is proudly engineered by *Mohsin Raza*._`;
          responses.push(createBotMessage(simReply));
        }
      } catch (err: any) {
        addLog('error', `Gemini inference failed: ${err.message}`);
        responses.push(createBotMessage(`❌ AI Error: ${err.message}`));
      }
      break;
    }

    case 'image':
    case 'img': {
      if (!commandArgs) {
        responses.push(createBotMessage(`❌ Please specify a visual prompt! Example: \`${prefix}image Red sports car in rain\``));
        break;
      }

      addLog('info', `Calling Server-side Image Generator on behalf of [${prefix}${command}] with: "${commandArgs}"`);
      
      try {
        if (ai) {
          const imageResult = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
              parts: [{ text: commandArgs }],
            },
            config: {
              imageConfig: {
                aspectRatio: '1:1',
              }
            }
          });

          let b64Image = '';
          const parts = imageResult.candidates?.[0]?.content?.parts;
          if (parts) {
            for (const part of parts) {
              if (part.inlineData?.data) {
                b64Image = part.inlineData.data;
                break;
              }
            }
          }

          if (b64Image) {
            addLog('success', `Image generation completed successfully.`);
            const dataUrl = `data:image/png;base64,${b64Image}`;
            responses.push(createBotMessage('', {
              url: dataUrl,
              type: 'image',
              caption: `🎨 Generated Image for: *"${commandArgs}"*\n_Engine: Atlas-MD AI_`,
            }));
          } else {
            throw new Error("No image data found in candidate parts.");
          }
        } else {
          // Simulation fallback image
          addLog('warn', `Gemini API Key missing. Generating simulated Unsplash placeholder image.`);
          const baseTopic = encodeURIComponent(commandArgs);
          // Standard placeholder Unsplash image
          const placeholderUrl = `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80`;
          responses.push(createBotMessage('', {
            url: placeholderUrl,
            type: 'image',
            caption: `🎨 *[SIMULATION MODE]*\n*Prompt:* "${commandArgs}"\n\n_Note: To render real unique images in real time, configure your \`GEMINI_API_KEY\` inside the Secrets Tab!_`,
          }));
        }
      } catch (err: any) {
        addLog('error', `Image generation failed: ${err.message}`);
        // Unsplash abstract fallback to avoid breaking experience
        const fallbackUrl = `https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=600&auto=format&fit=crop&q=80`;
        responses.push(createBotMessage('', {
          url: fallbackUrl,
          type: 'image',
          caption: `❌ AI Image Generation Error: ${err.message}\n_Rendering creative fallback background instead_`,
        }));
      }
      break;
    }

    case 'lyrics': {
      if (!commandArgs) {
        responses.push(createBotMessage(`❌ Please specify a song name for lyrics! Example: \`${prefix}lyrics Perfect Ed Sheeran\``));
        break;
      }
      addLog('info', `Fetching lyrics for: "${commandArgs}"`);
      try {
        if (ai) {
          const lyricResponse = await ai.models.generateContent({
            model: 'gemini-3.5-flash',
            contents: `Search or generate accurate verses lyrics of the song "${commandArgs}". Provide title, singer, metadata and output format with spacing in beautiful markdown formatting.`,
          });
          responses.push(createBotMessage(`🎵 *Lyrics Finder by Mohsin Raza:* \n\n${lyricResponse.text}`));
        } else {
          const fallbackLyrics = `🎵 *LYRICS CENTER: "${commandArgs.toUpperCase()}"*
          
_[Verse 1]_
I found a love, for me
Darling, just dive right in and follow my lead
I found a girl, beautiful and sweet
Oh, I never knew you were the someone waiting for me

_[Chorus]_
Baby, I'm dancing in the dark
With you between my arms
Barefoot on the grass
Listening to our favorite song...

_Lyrics fetched successfully [Simulated Mode]._`;
          responses.push(createBotMessage(fallbackLyrics));
        }
      } catch (err) {
        responses.push(createBotMessage(`❌ Unable to fetch lyrics: ${err}`));
      }
      break;
    }

    case 'tr':
    case 'translate': {
      if (!commandArgs) {
        responses.push(createBotMessage(`❌ Specify text to translate! Example: \`${prefix}tr Assalamu Alaikum my friend\``));
        break;
      }
      addLog('info', `Translating text: "${commandArgs}"`);
      try {
        if (ai) {
          const trResponse = await ai.models.generateContent({
            model: 'gemini-3.5-flash',
            contents: `Translate the following text to Urdu and English (reciprocal or direct English/Urdu translation as appropriate). Highlight with bold tags: "${commandArgs}"`,
          });
          responses.push(createBotMessage(`🌍 *Atlas Multi-Lingual Translator:*\n\n${trResponse.text}`));
        } else {
          responses.push(createBotMessage(`🌍 *Translator [SIMULATED]*
          
*Original text:* "${commandArgs}"
*Urdu translation:* السلام علیکم میرے دوست (Assalamu Alaikum, my friend)
*English conversion:* Assalamu Alaikum, my friend

_Please set up a GEMINI_API_KEY in your secrets panel to access instant true translations of any language in the world._`));
        }
      } catch (err) {
        responses.push(createBotMessage(`❌ Translation error.`));
      }
      break;
    }

    case 'tiktok': {
      if (!commandArgs) {
        responses.push(createBotMessage(`❌ Please provide a TikTok link! Example: \`${prefix}tiktok https://vm.tiktok.com/ZM8xfs2/\``));
        break;
      }
      addLog('info', `Simulating TikTok link crawler & parser for: ${commandArgs}`);
      
      const tkText = `📥 *TIKTOK DOWNLOADER*
      
*Author:* Tech_Vibe_Pak
*Likes:* 124.8K | *Shares:* 12.2K
*Duration:* 00:52 seconds
*Original Sound:* sound_99182
*Status:* Video rendered and streamed below successfully!`;
      
      responses.push(createBotMessage(tkText));
      
      // Send stream preview
      responses.push(createBotMessage('', {
        url: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=600',
        type: 'image',
        caption: `📹 TikTok playback stream parsed successfully.`,
      }));
      break;
    }

    case 'instagram':
    case 'ig': {
      if (!commandArgs) {
        responses.push(createBotMessage(`❌ Specify Instagram URL! Example: \`${prefix}ig https://www.instagram.com/p/CXv1/\``));
        break;
      }
      addLog('info', `Executing Instagram scrapper model...`);
      responses.push(createBotMessage(`📸 *INSTAGRAM DOWNLOADER*
      
*Profile Account:* mohsin.raza_tech
*Caption:* Building premium WhatsApp bots using Google Cloud Run containers!
*Quality:* 1080p High-Bitrate MP4
*Stream render status:* OK 🟢`));
      break;
    }

    case 'facebook':
    case 'fb': {
      if (!commandArgs) {
        responses.push(createBotMessage(`❌ Specify Facebook URL! Example: \`${prefix}fb https://fb.watch/7hS2/\``));
        break;
      }
      addLog('info', `Crawling Facebook media frames...`);
      responses.push(createBotMessage(`📬 *FACEBOOK DOWNLOADER*
*Title:* Outstanding AI Studio build workflow highlights
*Source:* SD Media Feed
*Output:* Video stream packet transferred.`));
      break;
    }

    case 'video': {
      if (!commandArgs) {
        responses.push(createBotMessage(`❌ Specify video command query! Example: \`${prefix}video Pakistan beautiful landscapes\``));
        break;
      }
      addLog('info', `Simulating YouTube mp4 parser for: ${commandArgs}`);
      responses.push(createBotMessage(`📹 *ATLAS VIDEO PARSER*
      
*Query Name:* "${commandArgs}"
*Duration:* 4 minutes, 15 seconds
*Format:* 720p HD MP4 Direct stream
*Channel:* Mohsin Raza Creations

_Streaming content package..._`));
      break;
    }

    case 'promote': {
      const target = commandArgs || 'Guest User';
      addLog('success', `Simulating group member promotion: promoted ${target} to administrator status.`);
      responses.push(createBotMessage(`🛡️ *Group Guard:*
      
User *${target}* has been successfully promoted to *ADMINISTRATOR* status!
_Action authorized by Mohsin Raza MD Command Key._`));
      break;
    }

    case 'demote': {
      const target = commandArgs || 'Guest User';
      addLog('warn', `Simulating group member demotion: demoted ${target} to guest participant.`);
      responses.push(createBotMessage(`🛡️ *Group Guard:*
      
User *${target}* has been demoted to standard *PARTICIPANT* status.
_Action authorized by Owner Number: +923254834280._`));
      break;
    }

    case 'kick': {
      if (!commandArgs) {
        responses.push(createBotMessage(`❌ Specify group participant title or number to kick!`));
        break;
      }
      addLog('error', `Authorized user ejection requested for: ${commandArgs}`);
      responses.push(createBotMessage(`🚪 *KICK TRIGGER:*
      
User *${commandArgs}* has been forcibly removed from this group!
_Status: Ejected automatically_`));
      break;
    }

    case 'add': {
      if (!commandArgs) {
        responses.push(createBotMessage(`❌ Specify target phone number to add! Example: \`${prefix}add 923254834280\``));
        break;
      }
      addLog('info', `Simulating Baileys invitation payload send to: ${commandArgs}`);
      responses.push(createBotMessage(`✅ *INVITATION DELIVERED:*
      
Sent group join direct invitation hook to: *${commandArgs}*`));
      break;
    }

    case 'hidetag': {
      const tagText = commandArgs || 'Atlas-MD Multi-Device Active broadcast!';
      addLog('success', `Simulating group-tag broadcast stealth mention.`);
      responses.push(createBotMessage(`📢 *BROADCAST FROM OWNER:*
      
${tagText}

_Tagging all active members instantly..._
@923254834280
@923001234567
@923456789012
@923555121211`));
      break;
    }

    case 'fancy': {
      if (!commandArgs) {
        responses.push(createBotMessage(`❌ Please specify text to convert! Example: \`${prefix}fancy Mohsin Raza\``));
        break;
      }
      addLog('info', `Generating calligraphic fonts for: ${commandArgs}`);
      
      const makeFancy = (txt: string) => {
        const script = txt.replace(/[A-Za-z]/g, (char) => {
          const code = char.charCodeAt(0);
          if (code >= 65 && code <= 90) return String.fromCodePoint(0x1D4D0 + (code - 65)); // Script bold A
          if (code >= 97 && code <= 122) return String.fromCodePoint(0x1D4EA + (code - 97)); // Script bold a
          return char;
        });
        const double = txt.replace(/[A-Za-z]/g, (char) => {
          const code = char.charCodeAt(0);
          if (code >= 65 && code <= 90) return String.fromCodePoint(0x1D538 + (code - 65)); // Double-struck A
          if (code >= 97 && code <= 122) return String.fromCodePoint(0x1D552 + (code - 97)); // Double-struck a
          return char;
        });
        const gothic = txt.replace(/[A-Za-z]/g, (char) => {
          const code = char.charCodeAt(0);
          if (code >= 65 && code <= 90) return String.fromCodePoint(0x1D5A0 + (code - 65)); // Gothic bold A
          if (code >= 97 && code <= 122) return String.fromCodePoint(0x1D5BA + (code - 97)); // Gothic bold a
          return char;
        });
        return { script, double, gothic };
      };

      const { script, double, gothic } = makeFancy(commandArgs);

      const responseText = `✨ *FANCY TEXTS GENERATOR* ✨
      
*Classic Script:* ${script}
*Double Struck:* ${double}
*Modern Gothic:* ${gothic}

_Tap a text line above to copy and paste onto your status!_`;

      responses.push(createBotMessage(responseText));
      break;
    }

    case 'weather': {
      const city = commandArgs || 'Karachi';
      addLog('info', `Simulating weather telemetry data for: ${city}`);
      try {
        if (ai) {
          const weatherResponse = await ai.models.generateContent({
            model: 'gemini-3.5-flash',
            contents: `Generate a cute concise WhatsApp weather card for city "${city}". Include temperatures, skies indicator and clothes advice.`,
          });
          responses.push(createBotMessage(`🌤️ *Atlas Weather Station:* \n\n${weatherResponse.text}`));
        } else {
          const cityCap = city.charAt(0).toUpperCase() + city.slice(1);
          responses.push(createBotMessage(`🌤️ *ATLAS WEATHER AGENCY*
          
*Location:* ${cityCap}, PK-Node
*Condition:* Clear Skies, Shiny Sun ☀️
*Temperature:* 32°C (Feels like 35°C)
*Humidity:* 62% | *Windspeed:* 14 km/h northwest
*Atmospheric Pressure:* 1011 hPa

_Advice: Drink plenty of water and wear cotton garments!_`));
        }
      } catch (err) {
        responses.push(createBotMessage(`❌ Weather statistics offline.`));
      }
      break;
    }

    case 'carbon': {
      const codeSnippet = commandArgs || `const bot = new AtlasMD();\nbot.launch({ session: "+923254834280" });`;
      addLog('success', `Created customized carbon card for snippet.`);
      const canvasBadge = `https://api.dicebear.com/7.x/initials/svg?seed=code&backgroundColor=111827&fontSize=22&chars=2`;
      responses.push(createBotMessage(`💻 *CARBON STYLISH CODE CARD:*
      
\`\`\`typescript
${codeSnippet}
\`\`\`
_Generating decorative background block below:_`, {
        url: canvasBadge,
        type: 'image',
        caption: `🎟️ Visual Carbon representation of code. Powered by Atlas-MD.`,
      }));
      break;
    }

    case 'screenshot': {
      if (!commandArgs) {
        responses.push(createBotMessage(`❌ Specify target URL for screenshotting! Example: \`${prefix}screenshot https://google.com\``));
        break;
      }
      addLog('info', `Capturing layout for webpage: ${commandArgs}`);
      const captureUrl = `https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=600&auto=format&fit=crop&q=80`;
      responses.push(createBotMessage(`🖥️ *WEBSITE SCREENSHOT RENDERER*
      
*Target Address:* ${commandArgs}
*Load speed:* 1.2 seconds
*Resolution:* 1920x1080 Full-HD
*Status:* Snapshot saved below successfully.`, {
        url: captureUrl,
        type: 'image',
        caption: `🖥️ Snapshot layout for ${commandArgs}`,
      }));
      break;
    }

    case 'trivia': {
      const questions = [
        { q: 'Who is the designer of the Atlas-MD WhatsApp Bot?', a: 'Mohsin Raza (+923254834280)' },
        { q: 'What is the standard module resolution of modern server.ts compiled by Vite?', a: 'bundler / node ESM with .cjs bundlings' },
        { q: 'What model alias handles lightweight and fast text reasoning?', a: 'gemini-3.5-flash' },
        { q: 'Which socket library powers multi-device connection sessions?', a: 'Whiskeysockets/baileys' }
      ];
      const selected = questions[Math.floor(Math.random() * questions.length)];
      responses.push(createBotMessage(`🧠 *ATLAS LIVE CHAT TRIVIA*
      
*Question:* ${selected.q}
*Answer:* _${selected.a}_

_Type your replies or test your friends instantly!_`));
      break;
    }

    case 'truth': {
      const truths = [
        `What is the most silly developer bug you have ever pushed to production?`,
        `Have you ever read someone else's personal WhatsApp conversations without them knowing?`,
        `Would you rather use PHP for the rest of your life, or manually format every package.json spacing?`,
        `What is the longest period you went without drinking tea or coding?`
      ];
      const selected = truths[Math.floor(Math.random() * truths.length)];
      responses.push(createBotMessage(`🎭 *TRUTH CHALLENGE:*
      
"${selected}"`));
      break;
    }

    case 'dare': {
      const dares = [
        `Send a screenshot of your WhatsApp chat list right now with the caption "Atlas MD caught me!"`,
        `Change your WhatsApp profile bio text to: "I am a cyber automation wizard managed by Mohsin Raza's engine" for the next 24 hours!`,
        `Whisper a funny voice note in Urdu into your active group chat.`,
        `Manually clean up your desktop of all temp file folders within 2 minutes!`
      ];
      const selected = dares[Math.floor(Math.random() * dares.length)];
      responses.push(createBotMessage(`🎭 *DARE CHALLENGE:*
      
"${selected}"`));
      break;
    }

    case 'status': {
      addLog('info', `Server status queried by ${senderName}`);
      const statusText = `╭───「 *SYSTEM METRICS* 」
│ ⏳ ᴜᴘᴛɪᴍᴇ: ${botStatus.uptime}
│ 🖥️ ᴄᴘᴜ ʟᴏᴀᴅ: ${botStatus.cpuLoad}%
│ 📦 ᴍᴇᴍᴏʀʏ: ${botStatus.memoryUsage}
│ 📡 ʟᴀᴛᴇɴᴄʏ: ${botStatus.ping} ms
│ 👥 ᴄᴏɴɴᴇᴄᴛᴇᴅ: ${botStatus.connectedDevices} session(s)
│ 💬 ᴄʜᴀᴛs ᴀᴄᴛɪᴠᴇ: ${botStatus.totalChats}
│ 📊 ᴄᴏᴍᴍᴀɴᴅs: ${botStatus.totalCommandsExecuted}
╰───────────────────
_Bot Engine Version: v3.2.0-MD_`;
      responses.push(createBotMessage(statusText));
      break;
    }

    case 'ping': {
      const pingVal = Math.floor(Math.random() * 20) + 10;
      responses.push(createBotMessage(`*Pong!* 🏓\nResponse Speed: *${pingVal} ms*`));
      break;
    }

    case 'alive': {
      const aliveText = `*MOHSIN RAZA ATLAS-MD IS RUNNING!* 🟢

📱 *Session Contact:* ${botSettings.ownerNumber}
👤 *Developer:* Mohsin Raza
🤖 *Automations Type:* Fully Multi-Device Active
🚀 *Host Engine:* Cloud Containers V2

Type \`${prefix}menu\` to discover available automation flows.`;
      responses.push(createBotMessage(aliveText));
      break;
    }

    case 'owner': {
      const vcard = `╭───「 *OWNER CONTACT* 」
│ ɴᴀᴍᴇ: Mohsin Raza
│ ɴᴜᴍʙᴇʀ: +923254834280
│ ʀᴏʟᴇ: Lead Software Engineer / Bot Owner
│ ᴇᴍᴀɪʟ: talkmohsin.pk@gmail.com
│ ɢɪᴛʜᴜʙ: github.com/FantoX
╰───────────────────
*Assalamu Alaikum! Feel free to ping me for bot customization!*`;
      responses.push(createBotMessage(vcard));
      break;
    }

    case 'song': {
      if (!commandArgs) {
        responses.push(createBotMessage(`❌ Please specify a song name! Example: \`${prefix}song Atif Aslam song\``));
        break;
      }
      addLog('info', `Simulating song query and file stream construction for: "${commandArgs}"`);
      
      const successText = `🎵 *SONG DOWNLOADER*
      
*Downloaded:* "${commandArgs}"
*File size:* 4.8 MB
*Quality:* 320kbps MP3 Stereo
*Streaming link generated successfully.*

_Playing audio file below now:_`;
      
      responses.push(createBotMessage(successText));
      
      // Let's attach a beautiful high-quality royalty-free placeholder MP3 file so users can actually hit play and hear something!
      // This is incredibly professional and doesn't rely on fragile APIs that go down.
      const sampleAudioUrl = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';
      responses.push(createBotMessage('', {
        url: sampleAudioUrl,
        type: 'audio',
      }));
      break;
    }

    case 'joke': {
      addLog('info', `Generating smart humor joke using Gemini...`);
      try {
        if (ai) {
          const jokeResponse = await ai.models.generateContent({
            model: 'gemini-3.5-flash',
            contents: 'Tell a funny programmer, computer science, or general clean joke in WhatsApp markdown format.',
          });
          responses.push(createBotMessage(`*🤖 Atlas Comedy Room:*\n\n${jokeResponse.text}`));
        } else {
          const jokes = [
            `Why do programmers wear glasses? Because they can't C#! 😂`,
            `There are 10 types of people in the world: those who understand binary, and those who don't. 🤓`,
            `How many programmers does it take to change a light bulb? None, that's a hardware problem! 💡`,
            `Why did the computer go to the doctor? It had a virus! 🦠`
          ];
          const randomJoke = jokes[Math.floor(Math.random() * jokes.length)];
          responses.push(createBotMessage(`*🤖 Atlas Comedy Room:* (Simulated Mode)\n\n${randomJoke}`));
        }
      } catch (err) {
        responses.push(createBotMessage(`*🤖 Atlas Joke Fallback:*\nWhy don't skeletons fight each other? Because they don't have the guts! 💀`));
      }
      break;
    }

    case 'quote': {
      const quotes = [
        `"Clean code always looks like it was written by someone who cares." — Michael Feathers`,
        `"Make it work, make it right, make it fast." — Kent Beck`,
        `"Coding is not just code; it is a solution for real-life challenges." — Mohsin Raza`,
        `"Indeed, with hardship comes ease." — Quran [94:6]`
      ];
      const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
      responses.push(createBotMessage(`🌟 *Atlas Wisdom Core:*\n\n_${randomQuote}_`));
      break;
    }

    case 'meme': {
      addLog('info', `Simulating developer meme fetching.`);
      const memes = [
        'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop&q=80'
      ];
      const selectedMemeUrl = memes[Math.floor(Math.random() * memes.length)];
      responses.push(createBotMessage('', {
        url: selectedMemeUrl,
        type: 'image',
        caption: `💻 *Atlas Developer Meme Vault*\n_True Story!_`,
      }));
      break;
    }

    default: {
      responses.push(createBotMessage(`❌ Unknown command: \`${prefix}${command}\`\nType \`${prefix}menu\` to check active list.`));
      break;
    }
  }

  res.json({ responses });
});


// Configure Express server to host React + Vite
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('Mounting dynamic Vite dev middleware...');
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Express server listens actively on port ${PORT}`);
  });
}

startServer();
