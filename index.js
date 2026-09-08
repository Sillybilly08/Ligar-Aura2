const { default: makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion, DisconnectReason } = require('@whiskeysockets/baileys');
const pino = require('pino');
const fs = require('fs');

const AUTH_DIR = './auth_info_baileys';

async function iniciar() {
  if (fs.existsSync(AUTH_DIR)) {
    fs.rmSync(AUTH_DIR, { recursive: true, force: true });
    console.log("[AUTO-CLEAN] Sessão limpa.");
  }

  const { version } = await fetchLatestBaileysVersion();
  const sock = makeWASocket({
    version,
    logger: pino({ level: 'silent' }),
    printQRInTerminal: false,
    auth: (await useMultiFileAuthState(AUTH_DIR)).state
  });

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update;
    if (connection === 'close') {
      const shouldReconnect = lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut;
      if (shouldReconnect) iniciar();
    } else if (connection === 'open') {
      console.log('Bianca Velmora conectada!');
    }
  });

  sock.ev.on('messages.upsert', async (m) => {
    const msg = m.messages[0];
    if (!msg.message || msg.key.fromMe) return;
    
    const sender = msg.key.remoteJid;
    const text = msg.message.conversation || msg.message.extendedTextMessage?.text;

    console.log(`Mensagem de ${sender}: ${text}`);
    
    // Logica do Funil Bianca aqui
    await sock.sendMessage(sender, { text: 'Oi, sou a Bianca da Velmora. Como posso te ajudar hoje? 😊' });
  });
}

iniciar();
