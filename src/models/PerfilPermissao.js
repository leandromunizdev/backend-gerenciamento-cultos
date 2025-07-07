const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');

class PerfilPermissao extends Model { }

PerfilPermissao.init({
  perfil_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  permissao_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  sequelize,
  modelName: 'PerfilPermissao',
  tableName: 'perfil_permissao',
  timestamps: false
});

module.exports = PerfilPermissao;
