const { default: makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion, DisconnectReason } = require('@whiskeysockets/baileys');
const pino = require('pino');
const fs = require('fs');
const http = require('http');
const { processarMensagem } = require('./bot.js');

const AUTH_DIR = './auth_info_baileys';
let pairingCode = null;

// Servidor HTTP simples para servir o Pairing Code
const server = http.createServer((req, res) => {
  if (req.url === '/codigo') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`
      <div style="font-family: sans-serif; text-align: center; padding: 40px;">
        <h2>Bianca Velmora - Código de Pareamento</h2>
        <h1 style="font-size: 48px; letter-spacing: 4px; color: #2e7d32;">${pairingCode || "Gerando..."}</h1>
        <p>Acesse o WhatsApp > Aparelhos Conectados > Conectar com número de telefone e digite este código.</p>
      </div>
    `);
  } else if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', bot: 'Bianca Velmora', number: '5591981384986' }));
  } else {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Bot Bianca Velmora Online. Acesse /codigo para ver o pareamento.');
  }
});

server.listen(process.env.PORT || 3000, () => {
  console.log(`Servidor HTTP ouvindo na porta ${process.env.PORT || 3000}`);
});

async function iniciar() {
  if (fs.existsSync(AUTH_DIR)) {
    fs.rmSync(AUTH_DIR, { recursive: true, force: true });
    console.log("[AUTO-CLEAN] Sessão limpa.");
  }

  const { version } = await fetchLatestBaileysVersion();
  const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);

  const sock = makeWASocket({
    version,
    logger: pino({ level: 'silent' }),
    printQRInTerminal: false,
    auth: state
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;
    
    if (!sock.authState.creds.registered) {
      const phoneNumber = process.env.PAIRING_NUMBER || '5591981384986';
      setTimeout(async () => {
        try {
          pairingCode = await sock.requestPairingCode(phoneNumber);
          console.log(`\n===================================`);
          console.log(`CÓDIGO DE PAREAMENTO: ${pairingCode}`);
          console.log(`===================================\n`);
        } catch (err) {
          console.error("Erro ao solicitar pairing code:", err.message);
        }
      }, 3000);
    }

    if (connection === 'close') {
      const shouldReconnect = lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut;
      if (shouldReconnect) iniciar();
    } else if (connection === 'open') {
      console.log('Bianca Velmora conectada ao WhatsApp com sucesso!');
    }
  });

  sock.ev.on('messages.upsert', async (m) => {
    const msg = m.messages[0];
    if (!msg.message || msg.key.fromMe) return;

    const sender = msg.key.remoteJid;
    const text = msg.message.conversation || msg.message.extendedTextMessage?.text || "";

    console.log(`[Mensagem de ${sender}]: ${text}`);

    const resposta = processarMensagem(sender, text);
    if (resposta) {
      await sock.sendMessage(sender, { text: resposta });
    }
  });
}

iniciar();
