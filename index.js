import makeWASocket, { useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, downloadMediaMessage } from "@whiskeysockets/baileys";
import qrcode from "qrcode-terminal";
import QRCode from "qrcode";
import pino from "pino";
import "dotenv/config";

// evita crash por erro de sessão/conflito 440/428
process.on("uncaughtException", (e) => {
  console.log("[aviso] exceção capturada:", e.message?.slice(0, 200));
});
process.on("unhandledRejection", (e) => {
  console.log("[aviso] promise rejeitada:", String(e)?.slice(0, 200));
});
import fs from "fs";
import { responder } from "./bot.js";

// Silencia logs verbose do Baileys, mantém só erros
const logger = pino({ level: "silent" });

const AUTH_DIR = "./auth_info_baileys";

async function transcreverAudio(buffer, mimeType) {
  // Se tiver OPENAI_API_KEY, tenta transcrever via Whisper
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  try {
    const form = new FormData();
    const ext = mimeType?.includes("mp4") ? "mp4" : mimeType?.includes("ogg") ? "ogg" : "mp3";
    const blob = new Blob([buffer], { type: mimeType || "audio/ogg" });
    form.append("file", blob, `audio.${ext}`);
    form.append("model", "whisper-1");
    form.append("language", "pt");

    const res = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}` },
      body: form,
    });
    if (!res.ok) {
      const err = await res.text();
      console.log("[audio] Whisper erro:", err.slice(0, 300));
      return null;
    }
    const data = await res.json();
    return data.text || null;
  } catch (e) {
    console.log("[audio] falha transcrição:", e.message);
    return null;
  }
}

function extrairTextoMensagem(msg) {
  if (!msg.message) return { tipo: "texto", texto: "" };
  const m = msg.message;

  // Texto simples ou com legenda
  if (m.conversation) return { tipo: "texto", texto: m.conversation };
  if (m.extendedTextMessage?.text) return { tipo: "texto", texto: m.extendedTextMessage.text };
  if (m.imageMessage) return { tipo: "imagem", texto: m.imageMessage.caption || "" , raw: m };
  if (m.videoMessage) return { tipo: "imagem", texto: m.videoMessage.caption || "" , raw: m }; // trata vídeo como imagem p/ responder
  if (m.audioMessage || m.pttMessage) return { tipo: "audio", texto: "", raw: m };
  if (m.documentMessage) return { tipo: "texto", texto: m.documentMessage.caption || "" };
  // Botões / listas / outros
  if (m.buttonsResponseMessage) return { tipo: "texto", texto: m.buttonsResponseMessage.selectedDisplayText || "" };
  if (m.listResponseMessage) return { tipo: "texto", texto: m.listResponseMessage.title || "" };
  return { tipo: "texto", texto: "" };
}

async function iniciar() {
  const { version } = await fetchLatestBaileysVersion();
  console.log(`[Lena] Baileys v${version.join(".")} | Número: 5591920029187`);
  console.log(`[Lena] Iniciando... escaneie o QR Code abaixo no WhatsApp da clínica.`);

  const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);

  const sock = makeWASocket({
    version,
    auth: state,
    logger,
    printQRInTerminal: false, // vamos renderizar manualmente com qrcode-terminal
    browser: ["Clinica Lena", "Chrome", "1.0"],
    syncFullHistory: false,
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log("\n================ QR CODE ================");
      console.log("Abra o WhatsApp da clínica (5591920029187):");
      console.log("  > Configurações > Aparelhos conectados > Conectar aparelho");
      console.log("  > Escaneie o QR abaixo (expira em ~30s, um novo será gerado):\n");
      qrcode.generate(qr, { small: true });
      console.log("\n========================================\n");
      // também salva como imagem PNG para visualização fora do terminal
      try {
        await QRCode.toFile("./qrcode.png", qr, { width: 400, margin: 2 });
        console.log("[Lena] QR salvo em ./qrcode.png - abra o arquivo para escanear");
      } catch(e) { console.log("[QR png] erro:", e.message); }
    }

    if (connection === "close") {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      const reason = lastDisconnect?.error?.message || statusCode;
      console.log(`[Lena] Conexão fechada: ${reason} (code ${statusCode})`);

      // código 440 = conflito: mesmo número conectado em outro lugar (WhatsApp Web/baileys duplicado)
      if (statusCode === 440 || statusCode === 428) {
        console.log("[Lena] Conflito 440/428: o WhatsApp está aberto em outro aparelho/sessão.");
        console.log("        Feche o WhatsApp Web em outros navegadores e mantenha só esta conexão.");
        console.log("        Tentando reconectar em 8s...");
        setTimeout(iniciar, 8000);
        return;
      }
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
      if (shouldReconnect) {
        console.log("[Lena] Reconectando em 3s...");
        setTimeout(iniciar, 5000);
      } else {
        console.log("[Lena] Deslogado. Apague a pasta auth_info_baileys e escaneie novamente: rm -rf auth_info_baileys && npm start");
      }
    } else if (connection === "open") {
      console.log("\n✅ Conectado com sucesso como Clínica Lena (5591920029187)!");
      console.log("   A recepcionista já está respondendo a textos, áudios e imagens.\n");
    }
  });

  sock.ev.on("messages.upsert", async ({ messages, type }) => {
    if (type !== "notify") return;

    for (const msg of messages) {
      try {
        // Ignora status, broadcast e mensagens do próprio bot
        if (msg.key.remoteJid === "status@broadcast") continue;
        if (msg.key.fromMe) continue;
        // Ignora grupos (opcional - comente a linha abaixo se quiser atender grupos)
        if (msg.key.remoteJid.endsWith("@g.us")) continue;

        const jid = msg.key.remoteJid;
        const isAudio = !!msg.message?.audioMessage || !!msg.message?.pttMessage;
        const isImage = !!msg.message?.imageMessage || !!msg.message?.videoMessage;

        let texto = "";
        let tipo = "texto";

        if (isImage) {
          tipo = "imagem";
          const cap = msg.message.imageMessage?.caption || msg.message.videoMessage?.caption || "";
          texto = cap;
          console.log(`[msg] 📷 imagem de ${jid} | legenda: "${cap}"`);
          // Não precisa baixar a imagem para responder (a recepcionista relaciona com serviços pela legenda/contexto)
          // Se quiser análise visual real com IA, descomente o download abaixo:
          // const buf = await downloadMediaMessage(msg, "buffer", {}, { logger });
        } else if (isAudio) {
          tipo = "audio";
          console.log(`[msg] 🎤 áudio de ${jid} - baixando e transcrevendo...`);
          try {
            const buffer = await downloadMediaMessage(msg, "buffer", {}, { logger, reuploadRequest: sock.updateMediaMessage });
            const mime = msg.message.audioMessage?.mimetype || msg.message.pttMessage?.mimetype || "audio/ogg";
            const transcricao = await transcreverAudio(buffer, mime);
            if (transcricao) {
              texto = transcricao;
              console.log(`[audio] transcrição: "${transcricao}"`);
            } else {
              // Sem API key ou falha: responde de forma acolhedora pedindo texto ou tratando como pedido geral
              // Mantém a regra de nunca expor processamento interno
              texto = ""; // vai cair no fallback acolhedor do bot.js para áudio
              console.log(`[audio] sem transcrição (sem OPENAI_API_KEY ou falha) - usando fallback`);
            }
          } catch (e) {
            console.log("[audio] erro download:", e.message);
            texto = "";
          }
        } else {
          const extraido = extrairTextoMensagem(msg);
          texto = extraido.texto || "";
          tipo = extraido.tipo;
          if (!texto) continue; // ignora mensagens vazias (ex: reação, sticker)
          console.log(`[msg] 💬 ${jid}: "${texto.slice(0, 120)}"`);
        }

        // Gera resposta da recepcionista (mesmo modelo do perfil)
        // IMPORTANTE: envia APENAS a resposta final, em linguagem natural
        let resposta = responder(texto, tipo);

        // Se era áudio e transcrevemos, usa o texto transcrito como base (tipo texto)
        if (isAudio && texto) {
          resposta = responder(texto, "texto");
        }

        // Simula digitando
        await sock.sendPresenceUpdate("composing", jid);
        await new Promise(r => setTimeout(r, 300 + Math.random() * 300));

        await sock.sendMessage(jid, { text: resposta });
        await sock.sendPresenceUpdate("paused", jid);
        console.log(`[Lena] ↩︎ respondido para ${jid}`);

      } catch (e) {
        console.error("[erro] ao processar mensagem:", e);
      }
    }
  });
}

iniciar().catch(err => {
  console.error("[fatal]", err);
  process.exit(1);
});
