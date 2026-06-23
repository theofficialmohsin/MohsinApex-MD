import makeWASocket, { useMultiFileAuthState, DisconnectReason } from '@whiskeysockets/baileys';
import pino from 'pino';

const start = async () => {
  const { state, saveCreds } = await useMultiFileAuthState('./sessions_test');
  const sock = makeWASocket({
    logger: pino({ level: 'debug' }),
    auth: state,
    browser: ['TestBot', 'Chrome', '1.0.0'],
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update;
    if (qr) {
      console.log('📱 SCAN THIS QR CODE:');
      console.log(qr);
    }
    if (connection === 'close') {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      console.log(`❌ Closed: ${statusCode}`);
      if (statusCode !== DisconnectReason.loggedOut) {
        setTimeout(start, 5000);
      }
    } else if (connection === 'open') {
      console.log('✅ Connected!');
    }
  });
};

start();