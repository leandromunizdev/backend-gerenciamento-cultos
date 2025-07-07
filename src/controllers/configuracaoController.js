const { Op } = require('sequelize');
const { auditLogger } = require('../middleware/logger');

// Simulação de configurações
let configuracoes = {
  nome_igreja: 'Assembleia de Deus de Piedade',
  endereco: 'Rua Principal, 123 - Piedade, SP',
  telefone: '(11) 99999-9999',
  email: 'contato@adpiedade.com',
  site: 'https://adpiedade.com',
  pastor_principal: 'Pastor João Silva',
  horarios_cultos: {
    domingo_manha: '09:00',
    domingo_noite: '19:00',
    quarta_feira: '19:30',
    sexta_feira: '19:30'
  },
  configuracoes_sistema: {
    permitir_autoconfirmacao_escalas: false,
    dias_antecedencia_escala: 7,
    notificar_escalas_por_email: true,
    notificar_escalas_por_sms: false,
    backup_automatico: true,
    manutencao_programada: false
  },
  redes_sociais: {
    facebook: 'https://facebook.com/adpiedade',
    instagram: '@adpiedade',
    youtube: 'https://youtube.com/adpiedade',
    whatsapp: '5511999999999'
  }
};

/**
 * @swagger
 * components:
 *   schemas:
 *     Configuracao:
 *       type: object
 *       properties:
 *         nome_igreja:
 *           type: string
 *           description: Nome da igreja
 *         endereco:
 *           type: string
 *           description: Endereço da igreja
 *         telefone:
 *           type: string
 *           description: Telefone da igreja
 *         email:
 *           type: string
 *           description: Email da igreja
 *         site:
 *           type: string
 *           description: Site da igreja
 *         pastor_principal:
 *           type: string
 *           description: Nome do pastor principal
 */

/**
 * @swagger
 * /api/configuracoes:
 *   get:
 *     summary: Obter configurações do sistema
 *     tags: [Configurações]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Configurações do sistema
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Configuracao'
 */
const obter = async (req, res) => {
  try {
    res.json({
      success: true,
      data: configuracoes
    });
  } catch (error) {
    console.error('Erro ao obter configurações:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

/**
 * @swagger
 * /api/configuracoes:
 *   put:
 *     summary: Atualizar configurações do sistema
 *     tags: [Configurações]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Configuracao'
 *     responses:
 *       200:
 *         description: Configurações atualizadas com sucesso
 *       400:
 *         description: Dados inválidos
 */
const atualizar = async (req, res) => {
  try {
    const novasConfiguracoes = req.body;

    if (novasConfiguracoes.nome_igreja && novasConfiguracoes.nome_igreja.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Nome da igreja é obrigatório'
      });
    }

    if (novasConfiguracoes.email && !isValidEmail(novasConfiguracoes.email)) {
      return res.status(400).json({
        success: false,
        error: 'Email inválido'
      });
    }

    const configuracoesAntigas = { ...configuracoes };

    configuracoes = {
      ...configuracoes,
      ...novasConfiguracoes
    };

    await auditLogger.log({
      usuario_id: req.user.id,
      acao: 'UPDATE',
      tabela: 'configuracoes',
      registro_id: 1,
      dados_antigos: configuracoesAntigas,
      dados_novos: configuracoes
    });

    res.json({
      success: true,
      data: configuracoes,
      message: 'Configurações atualizadas com sucesso'
    });

  } catch (error) {
    console.error('Erro ao atualizar configurações:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

/**
 * @swagger
 * /api/configuracoes/backup:
 *   post:
 *     summary: Gerar backup do sistema
 *     tags: [Configurações]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Backup gerado com sucesso
 */
const gerarBackup = async (req, res) => {
  try {
    // Simulação de geração de backup
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const nomeBackup = `backup-sistema-${timestamp}.sql`;

    // Log de auditoria
    await auditLogger.log({
      usuario_id: req.user.id,
      acao: 'BACKUP',
      tabela: 'sistema',
      registro_id: null,
      dados_novos: { nome_backup: nomeBackup }
    });

    res.json({
      success: true,
      data: {
        nome_backup: nomeBackup,
        data_geracao: new Date(),
        tamanho: '2.5 MB'
      },
      message: 'Backup gerado com sucesso'
    });

  } catch (error) {
    console.error('Erro ao gerar backup:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

/**
 * @swagger
 * /api/configuracoes/sistema/status:
 *   get:
 *     summary: Obter status do sistema
 *     tags: [Configurações]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Status do sistema
 */
const statusSistema = async (req, res) => {
  try {
    // Simulação de status do sistema
    const status = {
      versao: '1.0.0',
      ambiente: process.env.NODE_ENV || 'development',
      banco_dados: {
        status: 'conectado',
        versao: 'PostgreSQL 13.0'
      },
      memoria: {
        usada: '128 MB',
        total: '512 MB',
        percentual: 25
      },
      disco: {
        usado: '2.1 GB',
        total: '10 GB',
        percentual: 21
      },
      uptime: process.uptime(),
      ultimo_backup: '2024-01-15 10:30:00',
      manutencao_programada: configuracoes.configuracoes_sistema?.manutencao_programada || false
    };

    res.json({
      success: true,
      data: status
    });

  } catch (error) {
    console.error('Erro ao obter status do sistema:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

/**
 * @swagger
 * /api/configuracoes/logs:
 *   get:
 *     summary: Obter logs do sistema
 *     tags: [Configurações]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: nivel
 *         schema:
 *           type: string
 *           enum: [info, warning, error]
 *         description: Filtrar por nível de log
 *       - in: query
 *         name: data_inicio
 *         schema:
 *           type: string
 *           format: date
 *         description: Data de início
 *       - in: query
 *         name: data_fim
 *         schema:
 *           type: string
 *           format: date
 *         description: Data de fim
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 100
 *         description: Limite de registros
 *     responses:
 *       200:
 *         description: Logs do sistema
 */
const obterLogs = async (req, res) => {
  try {
    const { nivel, data_inicio, data_fim, limit = 100 } = req.query;

    // Simulação de logs 
    const logs = [
      {
        id: 1,
        timestamp: new Date(),
        nivel: 'info',
        mensagem: 'Sistema iniciado com sucesso',
        usuario: 'sistema',
        ip: '127.0.0.1'
      },
      {
        id: 2,
        timestamp: new Date(Date.now() - 3600000),
        nivel: 'warning',
        mensagem: 'Tentativa de login com credenciais inválidas',
        usuario: 'admin@adpiedade.com',
        ip: '192.168.1.100'
      },
      {
        id: 3,
        timestamp: new Date(Date.now() - 7200000),
        nivel: 'info',
        mensagem: 'Backup automático executado',
        usuario: 'sistema',
        ip: '127.0.0.1'
      }
    ];

    // Aplicar filtros (simulado)
    let logsFiltrados = logs;

    if (nivel) {
      logsFiltrados = logsFiltrados.filter(log => log.nivel === nivel);
    }

    // Limitar resultados
    logsFiltrados = logsFiltrados.slice(0, parseInt(limit));

    res.json({
      success: true,
      data: logsFiltrados,
      total: logsFiltrados.length
    });

  } catch (error) {
    console.error('Erro ao obter logs:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

// Função auxiliar para validar email
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

module.exports = {
  obter,
  atualizar,
  gerarBackup,
  statusSistema,
  obterLogs
};

