const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const CriterioAvaliacao = sequelize.define('CriterioAvaliacao', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nome: { type: DataTypes.STRING(100), allowNull: false, validate: { notEmpty: { msg: 'Nome é obrigatório' } } },
  descricao: { type: DataTypes.TEXT, allowNull: true },
  ordem_exibicao: { type: DataTypes.INTEGER, defaultValue: 0 },
  ativo: { type: DataTypes.BOOLEAN, defaultValue: true }
}, {
  tableName: 'criterios_avaliacao',
  timestamps: true,
  paranoid: true,
  underscored: true,
  indexes: [
    { fields: ['ordem_exibicao'] },
    { fields: ['ativo'] }
  ]
});

module.exports = CriterioAvaliacao;

