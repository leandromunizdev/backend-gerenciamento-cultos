const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const LogsAuditoria = sequelize.define('LogsAuditoria', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  usuario_id: { type: DataTypes.INTEGER, allowNull: true },
  tabela: { type: DataTypes.STRING(100), allowNull: false },
  operacao: { type: DataTypes.STRING(10), allowNull: false },
  registro_id: { type: DataTypes.INTEGER, allowNull: false },
  dados_anteriores: { type: DataTypes.JSONB, allowNull: true },
  dados_novos: { type: DataTypes.JSONB, allowNull: true },
  ip_address: { type: DataTypes.INET, allowNull: true },
  user_agent: { type: DataTypes.TEXT, allowNull: true }
}, {
  tableName: 'logs_auditoria',
  timestamps: true,
  updatedAt: false,
  underscored: true,
  indexes: [
    { fields: ['tabela', 'created_at'] },
    { fields: ['usuario_id'] },
    { fields: ['operacao'] }
  ]
});

module.exports = LogsAuditoria;

