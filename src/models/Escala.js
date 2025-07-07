const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * @swagger
 * components:
 *   schemas:
 *     Escala:
 *       type: object
 *       required:
 *         - culto_id
 *         - pessoa_id
 *         - funcao_id
 *         - created_by
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único da escala
 *         culto_id:
 *           type: integer
 *           description: ID do culto
 *         pessoa_id:
 *           type: integer
 *           description: ID da pessoa escalada
 *         funcao_id:
 *           type: integer
 *           description: ID da função
 *         status_id:
 *           type: integer
 *           description: ID do status da escala
 *           default: 1
 *         confirmado_em:
 *           type: string
 *           format: date-time
 *           description: Data e hora da confirmação
 *         check_in_em:
 *           type: string
 *           format: date-time
 *           description: Data e hora do check-in
 *         observacoes:
 *           type: string
 *           description: Observações sobre a escala
 *         created_by:
 *           type: integer
 *           description: ID do usuário que criou a escala
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *         deleted_at:
 *           type: string
 *           format: date-time
 */
const Escala = sequelize.define('Escala', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  culto_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Culto é obrigatório'
      }
    }
  },
  pessoa_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Pessoa é obrigatória'
      }
    }
  },
  funcao_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Função é obrigatória'
      }
    }
  },
  status_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  confirmado_em: {
    type: DataTypes.DATE,
    allowNull: true
  },
  check_in_em: {
    type: DataTypes.DATE,
    allowNull: true
  },
  observacoes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Usuário criador é obrigatório'
      }
    }
  }
}, {
  tableName: 'escalas',
  timestamps: true,
  paranoid: true,
  underscored: true,
  indexes: [
    {
      fields: ['culto_id', 'pessoa_id', 'funcao_id'],
      unique: true,
      where: {
        deleted_at: null
      }
    },
    {
      fields: ['culto_id']
    },
    {
      fields: ['pessoa_id']
    },
    {
      fields: ['funcao_id']
    },
    {
      fields: ['status_id']
    },
    {
      fields: ['created_by']
    }
  ]
});

Escala.prototype.confirmar = async function () {
  this.confirmado_em = new Date();
  this.status_id = 2;
  await this.save();
};

Escala.prototype.fazerCheckIn = async function () {
  this.check_in_em = new Date();
  this.status_id = 3;
  await this.save();
};

Escala.prototype.marcarAusente = async function () {
  this.status_id = 4;
  await this.save();
};

Escala.prototype.estaConfirmada = function () {
  return this.confirmado_em !== null;
};

Escala.prototype.fezCheckIn = function () {
  return this.check_in_em !== null;
};

Escala.prototype.getTempoCheckIn = function () {
  if (!this.check_in_em) return null;

  return this.check_in_em.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

module.exports = Escala;

