ZERO CUSTO - Clinica Lena 5591920029187
========================================

O Codespace atual desliga quando voce fecha a aba. Para ficar 24h sem pagar,
use uma destas 3 opcoes (todas com Dockerfile ja pronto).

OPCAO A - KOYEB (mais facil, gratis permanente, NAO dorme)
-----------------------------------------------------------
1. Crie conta em koyeb.com (login com GitHub)
2. Push este projeto para GitHub:
   git push <seu-repo>
3. Koyeb > Create App > From GitHub > selecione o repo
   - Builder: Dockerfile
   - Port: 3000 (nao precisa expor, mas deixe)
   - Add Volume: /app/auth_info_baileys (para nao pedir QR a cada deploy)
4. Add Variable: OPENAI_API_KEY (opcional, so para transcrever audio)
5. Deploy > Logs > copie o QR em texto e escaneie com 5591920029187
   WhatsApp > Aparelhos conectados > Conectar aparelho
6. Pronto. Koyeb free nao dorme, fica online direto.

OPCAO B - FLY.IO (gratis dentro da franquia, nao dorme)
--------------------------------------------------------
No seu PC (uma vez so):

  curl -L https://fly.io/install.sh | sh
  fly auth login
  fly launch --no-deploy  # ja tem fly.toml, so confirme
  fly volumes create lena_auth --region gru --size 1
  fly deploy
  fly logs  # ver QR e escanear

Free allowance cobre 1 VM 256-512MB. Se passar, cobra centavos.
Comando para ver uso: fly dashboard

OPCAO C - ORACLE ALWAYS FREE (VM gratis para sempre, seu controle total)
-------------------------------------------------------------------------
1. Crie conta em cloud.oracle.com (cartao pedido mas nao cobra)
2. Create Instance > Always Free > Ampere A1 (4 vCPU gratis) ou E2.1
   - Image: Ubuntu 22.04
   - Abra porta 22
3. SSH na VM:

  sudo apt update && sudo apt install -y nodejs npm git
  git clone <seu-repo> && cd Ligar-Aura2
  npm install
  npm install -g pm2
  pm2 start ecosystem.config.js
  pm2 save
  pm2 startup  # copie o comando que aparecer e cole
  pm2 logs clinica-lena  # ver QR

VM Oracle free nunca expira se voce usar 1x por mes.

OPCAO D - SEU PROPRIO PC/RASPBERRY (zero custo, sem depender de nuvem)
-----------------------------------------------------------------------
Deixe um PC ligado:

  npm install -g pm2
  pm2 start ecosystem.config.js
  pm2 save
  pm2 startup

Windows: pm2-startup install
Precisa: manter PC ligado e internet ok.

QUAL ESCOLHER?
- Quer 1 clique e esquecer: Koyeb (A)
- Quer controle total gratis para sempre: Oracle (C)
- Tem PC velho ligado: Opcao D (mais zero custo impossivel)

RENDER FREE - NAO RECOMENDADO para Baileys:
Render free dorme apos 15min sem acesso, derruba o WhatsApp.
So use se aceitar reconectar sempre. Por isso nao use render.yaml
para producao - use Koyeb/Fly/Oracle acima.

DICA: pasta auth_info_baileys ja pareada. No primeiro deploy de qualquer
opcao, copie ela como Volume para nao precisar escanear de novo.
Se perder, basta escanear QR de novo no log.
