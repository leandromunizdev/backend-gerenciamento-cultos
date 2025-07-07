const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Avaliacao = sequelize.define('Avaliacao', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  culto_id: { type: DataTypes.INTEGER, allowNull: true },
  avaliador_id: { type: DataTypes.INTEGER, allowNull: true },
  nome_avaliador: { type: DataTypes.STRING(255), allowNull: true },
  email_avaliador: { type: DataTypes.STRING(255), allowNull: true },
  data_visita: { type: DataTypes.DATEONLY, allowNull: false },
  comentario_geral: { type: DataTypes.TEXT, allowNull: true },
  recomendaria: { type: DataTypes.BOOLEAN, allowNull: true }
}, {
  tableName: 'avaliacoes',
  timestamps: true,
  paranoid: true,
  underscored: true,
  indexes: [
    { fields: ['data_visita'] },
    { fields: ['culto_id'] },
    { fields: ['avaliador_id'] }
  ]
});

module.exports = Avaliacao;

