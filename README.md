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

## Deploy 1-clique (zero custo)

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template?template=https://github.com/Sillybilly08/Ligar-Aura2)
[![Deploy to Koyeb](https://www.koyeb.com/static/images/deploy/button.svg)](https://app.koyeb.com/deploy?type=git&repository=github.com/Sillybilly08/Ligar-Aura2&branch=main&name=clinica-lena)
[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/Sillybilly08/Ligar-Aura2)

> Koyeb = recomendado grátis permanente (não dorme). Railway = free trial. Render free dorme (não recomendado para WhatsApp).

Após deploy, veja os Logs e escaneie o QR em texto com o celular 5591920029187.
