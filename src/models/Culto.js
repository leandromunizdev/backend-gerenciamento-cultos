const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const { Op } = require('sequelize');


/**
 * @swagger
 * components:
 *   schemas:
 *     Culto:
 *       type: object
 *       required:
 *         - titulo
 *         - data_culto
 *         - horario_inicio
 *         - tipo_culto_id
 *         - status_id
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único do culto
 *         titulo:
 *           type: string
 *           description: Título do culto
 *         descricao:
 *           type: string
 *           description: Descrição do culto
 *         data_culto:
 *           type: string
 *           format: date
 *           description: Data do culto (AAAA-MM-DD)
 *         horario_inicio:
 *           type: string
 *           format: time
 *           description: Horário de início do culto (HH:MM:SS)
 *         horario_fim:
 *           type: string
 *           format: time
 *           description: Horário de fim do culto (HH:MM:SS)
 *         local:
 *           type: string
 *           description: Local onde o culto ocorrerá
 *         tipo_culto_id:
 *           type: integer
 *           description: ID do tipo de culto
 *         status_id:
 *           type: integer
 *           description: ID do status do culto
 *         observacoes:
 *           type: string
 *           description: Observações adicionais
 *         criado_por:
 *           type: integer
 *           description: ID do usuário que criou o culto
 *         atualizado_por:
 *           type: integer
 *           description: ID do usuário que atualizou o culto
 *         criado_em:
 *           type: string
 *           format: date-time
 *           description: Data de criação do registro
 *         atualizado_em:
 *           type: string
 *           format: date-time
 *           description: Data da última atualização do registro
 */
const Culto = sequelize.define('Culto', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  titulo: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [3, 200]
    }
  },
  descricao: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  data_culto: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    validate: {
      isDate: true
    }
  },
  horario_inicio: {
    type: DataTypes.TIME,
    allowNull: false
  },
  horario_fim: {
    type: DataTypes.TIME,
    allowNull: true,
    validate: {
      isAfterStart(value) {
        if (value && this.horario_inicio && value <= this.horario_inicio) {
          throw new Error('Horário de fim deve ser posterior ao horário de início');
        }
      }
    }
  },
  local: {
    type: DataTypes.STRING(200),
    allowNull: true,
    defaultValue: 'Templo Principal'
  },
  tipo_culto_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  status_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  observacoes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  criado_por: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  atualizado_por: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  tableName: 'cultos',
  timestamps: true,
  createdAt: 'criado_em',
  updatedAt: 'atualizado_em',
  paranoid: true,
  deletedAt: 'excluido_em',
  indexes: [
    { fields: ['data_culto'] },
    { fields: ['tipo_culto_id'] },
    { fields: ['status_id'] },
    {
      fields: ['data_culto', 'local'],
      name: 'idx_culto_data_local'
    }
  ]
});

Culto.prototype.verificarConflito = async function () {
  const conflitos = await Culto.findAll({
    where: {
      id: { [Op.ne]: this.id || 0 },
      local: this.local,
      data_culto: this.data_culto,
      [Op.or]: [
        {
          horario_inicio: {
            [Op.between]: [this.horario_inicio, this.horario_fim || this.horario_inicio]
          }
        },
        {
          horario_fim: {
            [Op.between]: [this.horario_inicio, this.horario_fim || this.horario_inicio]
          }
        },
        {
          [Op.and]: [
            { horario_inicio: { [Op.lte]: this.horario_inicio } },
            { horario_fim: { [Op.gte]: this.horario_fim || this.horario_inicio } }
          ]
        }
      ]
    }
  });

  return conflitos.length > 0;
};

Culto.prototype.podeSerEditado = function () {
  const agora = new Date();
  const dataHoraInicio = new Date(`${this.data_culto}T${this.horario_inicio}`);

  if (dataHoraInicio <= agora) return false;
  if ([3, 4].includes(this.status_id)) return false; // 3=Finalizado, 4=Cancelado

  return true;
};

// Método para verificar se pode ser excluído
Culto.prototype.podeSerExcluido = function () {
  const agora = new Date();
  const dataHoraInicio = new Date(`${this.data_culto}T${this.horario_inicio}`);
  return dataHoraInicio > agora;
};

module.exports = Culto;
