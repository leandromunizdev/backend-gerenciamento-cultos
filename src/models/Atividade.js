const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Atividade = sequelize.define('Atividade', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  culto_id: { type: DataTypes.INTEGER, allowNull: false },
  titulo: { type: DataTypes.STRING(255), allowNull: false, validate: { notEmpty: { msg: 'Título é obrigatório' } } },
  descricao: { type: DataTypes.TEXT, allowNull: true },
  tipo_atividade_id: { type: DataTypes.INTEGER, allowNull: false },
  ordem_programacao: { type: DataTypes.INTEGER, allowNull: false, validate: { min: { args: [1], msg: 'Ordem deve ser maior que 0' } } },
  horario_inicio: { type: DataTypes.TIME, allowNull: true },
  duracao_estimada: { type: DataTypes.INTEGER, allowNull: true, validate: { min: { args: [1], msg: 'Duração deve ser maior que 0' } } },
  observacoes: { type: DataTypes.TEXT, allowNull: true },
  created_by: { type: DataTypes.INTEGER, allowNull: false }
}, {
  tableName: 'atividades',
  timestamps: true,
  paranoid: true,
  underscored: true,
  indexes: [
    { fields: ['culto_id'] },
    { fields: ['tipo_atividade_id'] },
    { fields: ['culto_id', 'ordem_programacao'] }
  ]
});

module.exports = Atividade;

