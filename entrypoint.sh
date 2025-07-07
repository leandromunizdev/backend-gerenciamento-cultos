#!/bin/sh

echo "⏳ Aguardando banco de dados em $DB_HOST:$DB_PORT..."

# Espera até que o banco esteja aceitando conexões
while ! nc -z $DB_HOST $DB_PORT; do
  sleep 1
done

echo "✅ Banco de dados disponível."

# Executa o seed
echo "🌱 Executando seed inicial..."
npm run seed || {
  echo "❌ Falha ao executar seed. Continuando mesmo assim..."
}

# Inicia o servidor
echo "🚀 Iniciando servidor..."
exec npm start
