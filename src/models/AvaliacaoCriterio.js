const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const AvaliacaoCriterio = sequelize.define('AvaliacaoCriterio', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  avaliacao_id: { type: DataTypes.INTEGER, allowNull: false },
  criterio_id: { type: DataTypes.INTEGER, allowNull: false },
  nota: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1, max: 5 } }
}, {
  tableName: 'avaliacao_criterios',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['avaliacao_id', 'criterio_id'], unique: true }
  ]
});

module.exports = AvaliacaoCriterio;

