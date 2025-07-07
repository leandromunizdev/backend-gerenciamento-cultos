const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const TipoAtividade = sequelize.define('TipoAtividade', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nome: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Nome do tipo de atividade é obrigatório' },
      len: { args: [2, 100], msg: 'Nome deve ter entre 2 e 100 caracteres' }
    }
  },
  descricao: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  cor: {
    type: DataTypes.STRING(7),
    allowNull: true,
    validate: {
      is: { args: /^#[0-9A-Fa-f]{6}$/, msg: 'Cor deve estar no formato hexadecimal (#RRGGBB)' }
    }
  },
  duracao_padrao: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: { args: [1], msg: 'Duração padrão deve ser maior que 0 minutos' }
    }
  },
  ativo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'tipos_atividade',
  timestamps: true,
  paranoid: true,
  underscored: true,
  indexes: [
    { fields: ['nome'], unique: true, where: { deleted_at: null } },
    { fields: ['ativo'] }
  ]
});

module.exports = TipoAtividade;

