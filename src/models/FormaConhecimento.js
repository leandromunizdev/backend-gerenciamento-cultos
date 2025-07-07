const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const FormaConhecimento = sequelize.define('FormaConhecimento', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nome: { type: DataTypes.STRING(100), allowNull: false, validate: { notEmpty: { msg: 'Nome é obrigatório' } } },
  descricao: { type: DataTypes.TEXT, allowNull: true },
  ativo: { type: DataTypes.BOOLEAN, defaultValue: true }
}, {
  tableName: 'formas_conhecimento',
  timestamps: true,
  paranoid: true,
  underscored: true,
  indexes: [
    { fields: ['nome'], unique: true, where: { deleted_at: null } }
  ]
});

module.exports = FormaConhecimento;

