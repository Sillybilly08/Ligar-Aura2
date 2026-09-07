#!/bin/bash
# connect-clinica-lenai-whatsapp.sh
# Clínica Lena - Conexão WhatsApp via Baileys (QR Code)
# Número: 5591920029187

set -e
DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$DIR"

echo "=========================================="
echo " Clínica Lena - WhatsApp 5591920029187"
echo " Conexão via Baileys (QR Code)"
echo "=========================================="
echo ""

# verifica node
if ! command -v node >/dev/null 2>&1; then
  echo "ERRO: Node.js não encontrado. Instale Node 18+ primeiro."
  exit 1
fi
echo "[ok] Node $(node -v) | npm $(npm -v)"

# instala deps se precisar
if [ ! -d "node_modules" ]; then
  echo "[info] Instalando dependências..."
  npm install
fi

# limpa QR antigo
rm -f qrcode.png

echo ""
echo "[info] Iniciando... escaneie o QR Code abaixo"
echo "       WhatsApp > Configurações > Aparelhos conectados > Conectar aparelho"
echo ""

# se tiver .env com OPENAI_API_KEY, avisa sobre transcrição
if grep -q "OPENAI_API_KEY=." .env 2>/dev/null; then
  echo "[info] Transcrição de áudio ativada (Whisper)"
else
  echo "[info] Sem OPENAI_API_KEY - áudios receberão resposta acolhedora (adicione a chave em .env para transcrever)"
fi
echo ""

# inicia - o próprio index.js gera QR no terminal + qrcode.png
npm start
