const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Visitante = sequelize.define('Visitante', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nome_completo: { type: DataTypes.STRING(255), allowNull: false, validate: { notEmpty: { msg: 'Nome é obrigatório' } } },
  whatsapp: { type: DataTypes.STRING(20), allowNull: true },
  data_nascimento: { type: DataTypes.DATEONLY, allowNull: true },
  eh_cristao: { type: DataTypes.BOOLEAN, allowNull: true },
  mora_perto: { type: DataTypes.BOOLEAN, allowNull: true },
  igreja_origem: { type: DataTypes.STRING(255), allowNull: true },
  forma_conhecimento_id: { type: DataTypes.INTEGER, allowNull: true },
  observacoes: { type: DataTypes.TEXT, allowNull: true },
  avisos_organizador: { type: DataTypes.TEXT, allowNull: true },
  data_visita: { type: DataTypes.DATEONLY, allowNull: false },
  culto_id: { type: DataTypes.INTEGER, allowNull: true },
  cadastrado_por: { type: DataTypes.INTEGER, allowNull: false }
}, {
  tableName: 'visitantes',
  timestamps: true,
  paranoid: true,
  underscored: true,
  indexes: [
    { fields: ['data_visita'] },
    { fields: ['cadastrado_por'] },
    { fields: ['whatsapp'] }
  ]
});

module.exports = Visitante;

