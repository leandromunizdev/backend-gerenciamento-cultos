const requestLogger = (req, res, next) => {
  const start = Date.now();

  // Capturar o IP real do cliente
  const clientIp = req.headers['x-forwarded-for'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    (req.connection.socket ? req.connection.socket.remoteAddress : null);

  // Log da requisição
  console.log(`📥 ${req.method} ${req.originalUrl} - IP: ${clientIp}`);

  // Interceptar a resposta para log
  const originalSend = res.send;
  res.send = function (data) {
    const duration = Date.now() - start;
    console.log(`📤 ${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms`);
    originalSend.call(this, data);
  };

  next();
};

const auditLogger = {
  async log(params) {
    try {
      const { LogsAuditoria } = require('../models');

      await LogsAuditoria.create({
        usuario_id: params.usuario_id || null,
        tabela: params.tabela,
        operacao: params.acao,
        registro_id: params.registro_id,
        dados_anteriores: params.dados_anteriores || null,
        dados_novos: params.dados_novos || null,
        ip_address: params.ip_address || null,
        user_agent: params.user_agent || null
      });
    } catch (error) {
      console.error('❌ Erro ao registrar log de auditoria:', error);
    }
  },

  async logOperation(req, operation, tableName, recordId, oldData = null, newData = null) {
    try {
      const { LogsAuditoria } = require('../models');

      const clientIp = req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        (req.connection.socket ? req.connection.socket.remoteAddress : null);

      await LogsAuditoria.create({
        usuario_id: req.user?.id || null,
        tabela: tableName,
        operacao: operation,
        registro_id: recordId,
        dados_anteriores: oldData,
        dados_novos: newData,
        ip_address: clientIp,
        user_agent: req.headers['user-agent']
      });
    } catch (error) {
      console.error('❌ Erro ao registrar log de auditoria:', error);
    }
  }
};

module.exports = { requestLogger, auditLogger };

