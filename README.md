# Clínica Lena - WhatsApp (Baileys QR Code)
Número: 5591920029187

Recepcionista virtual responde texto, áudio e imagem com o mesmo modelo do perfil.

## Rodar local (QR Code)

```bash
npm install
npm start
# ou
./connect-clinica-lenai-whatsapp.sh
```
Escaneie o QR em WhatsApp > Aparelhos conectados > Conectar aparelho
QR também salvo em `qrcode.png`.

## Produção 24h

Veja `DEPLOY.md` — Railway, VPS com PM2, Docker.

## Configuração

Valores e políticas em `config.js` (espelho de `config.py`).
Lógica da recepcionista em `bot.js` — nunca inventa preço/disponibilidade.

## Scripts

- `npm start` — inicia Baileys
- `pm2 start ecosystem.config.js` — produção com auto-restart
