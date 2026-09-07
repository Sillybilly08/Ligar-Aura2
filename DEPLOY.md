# Clínica Lena - Deploy 24h (5591920029187)

## Opção 1 — Railway (recomendado, grátis para começar)

1. Crie conta em railway.app (login com GitHub)
2. New Project > Deploy from GitHub repo
   - Se o repo ainda não está no GitHub: `git push` este projeto
3. Railway detecta Dockerfile automaticamente
4. Variables: adicione `OPENAI_API_KEY` se quiser transcrição de áudio (opcional)
5. Deploy > Logs > aguarde "[Lena] Iniciando..."
6. **Primeiro pareamento:** no log do Railway vai aparecer o QR Code + `qrcode.png` não é visível no Railway.
   Solução: rode local 1x para parear, depois faça upload da pasta `auth_info_baileys` como Volume:
   - Ou: use Railway Volume em `/app/auth_info_baileys` e faça o pareamento via local e depois copie os arquivos
   - Mais simples: deploy, abra Settings > Variables > adicione volume, e no primeiro boot copie o QR do log (texto) e escaneie

Dica: para ver o QR no Railway, use o log em texto (qrcode-terminal) — copie e escaneie com o celular.

## Opção 2 — VPS Ubuntu (qualquer VPS R$15/mês)

```bash
# no VPS
git clone <seu-repo> && cd Ligar-Aura2
npm install --omit=dev

# com PM2 (mantém vivo após fechar terminal)
npm install -g pm2
pm2 start ecosystem.config.js
pm2 save
pm2 startup  # copie e cole o comando que ele mostrar

# ver QR
pm2 logs clinica-lena
# ou se rodar sem pm2:
npm start
# QR aparece no terminal + qrcode.png
```

Para atualizar:
```bash
git pull
pm2 restart clinica-lena
```

## Opção 3 — Docker

```bash
docker build -t clinica-lena .
docker run -d --name lena --restart unless-stopped -v lena-auth:/app/auth_info_baileys clinica-lena
docker logs -f lena  # ver QR
```

## Persistência da sessão

A pasta `auth_info_baileys/` guarda o login. NÃO apague. Se apagar, precisa escanear QR de novo.
No Railway/Render, configure um Volume persistente em `/app/auth_info_baileys`.

## Transcrição de áudio

Opcional. Adicione em .env ou variável de ambiente:
```
OPENAI_API_KEY=sk-...
```
Sem ela, áudios recebem resposta acolhedora genérica (sem transcrever).

## Verificar se está online

Mande "Oi" para 5591920029187 de outro número.
