const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Notificacao = sequelize.define('Notificacao', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  usuario_id: { type: DataTypes.INTEGER, allowNull: false },
  titulo: { type: DataTypes.STRING(255), allowNull: false },
  mensagem: { type: DataTypes.TEXT, allowNull: false },
  tipo: { type: DataTypes.STRING(50), allowNull: false },
  lida: { type: DataTypes.BOOLEAN, defaultValue: false },
  data_envio: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  data_leitura: { type: DataTypes.DATE, allowNull: true },
  referencia_tipo: { type: DataTypes.STRING(50), allowNull: true },
  referencia_id: { type: DataTypes.INTEGER, allowNull: true }
}, {
  tableName: 'notificacoes',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['usuario_id', 'lida'] },
    { fields: ['data_envio'] },
    { fields: ['tipo'] }
  ]
});

module.exports = Notificacao;

