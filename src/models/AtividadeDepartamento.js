const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const AtividadeDepartamento = sequelize.define('AtividadeDepartamento', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  atividade_id: { type: DataTypes.INTEGER, allowNull: false },
  departamento_id: { type: DataTypes.INTEGER, allowNull: false },
  papel: { type: DataTypes.STRING(100), allowNull: true },
  confirmado: { type: DataTypes.BOOLEAN, defaultValue: false }
}, {
  tableName: 'atividade_departamentos',
  timestamps: true,
  paranoid: true,
  underscored: true,
  indexes: [
    { fields: ['atividade_id', 'departamento_id', 'papel'], unique: true, where: { deleted_at: null } }
  ]
});

module.exports = AtividadeDepartamento;

