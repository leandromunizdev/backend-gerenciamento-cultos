-- Script de inicialização do banco PostgreSQL
-- Este arquivo é executado automaticamente quando o container do PostgreSQL é criado

-- Criar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Configurações de timezone
SET timezone = 'America/Sao_Paulo';

-- Comentário informativo
COMMENT ON DATABASE sistema_cultos IS 'Banco de dados do Sistema de Gerenciamento de Cultos - AD Piedade';

