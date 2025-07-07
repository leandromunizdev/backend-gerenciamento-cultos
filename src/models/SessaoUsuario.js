const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const SessaoUsuario = sequelize.define('SessaoUsuario', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  usuario_id: { type: DataTypes.INTEGER, allowNull: false },
  token_hash: { type: DataTypes.STRING(255), allowNull: false },
  ip_address: { type: DataTypes.INET, allowNull: true },
  user_agent: { type: DataTypes.TEXT, allowNull: true },
  expires_at: { type: DataTypes.DATE, allowNull: false }
}, {
  tableName: 'sessoes_usuario',
  timestamps: true,
  updatedAt: false,
  underscored: true,
  indexes: [
    { fields: ['usuario_id'] },
    { fields: ['token_hash'] },
    { fields: ['expires_at'] }
  ]
});

module.exports = SessaoUsuario;

