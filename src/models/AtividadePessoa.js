const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const AtividadePessoa = sequelize.define('AtividadePessoa', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  atividade_id: { type: DataTypes.INTEGER, allowNull: false },
  pessoa_id: { type: DataTypes.INTEGER, allowNull: false },
  papel: { type: DataTypes.STRING(100), allowNull: true },
  confirmado: { type: DataTypes.BOOLEAN, defaultValue: false }
}, {
  tableName: 'atividade_pessoas',
  timestamps: true,
  paranoid: true,
  underscored: true,
  indexes: [
    { fields: ['atividade_id', 'pessoa_id', 'papel'], unique: true, where: { deleted_at: null } }
  ]
});

module.exports = AtividadePessoa;

