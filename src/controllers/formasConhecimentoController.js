const { FormaConhecimento } = require('../models');

/**
 * Controlador para formas de conhecimento
 */
const formasConhecimentoController = {
  /**
   * @swagger
   * /api/formas-conhecimento:
   *   get:
   *     summary: Listar formas de conhecimento
   *     tags: [Formas de Conhecimento]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Lista de formas de conhecimento
   */
  async listar(req, res) {
    try {
      const formas = await FormaConhecimento.findAll({
        order: [['nome', 'ASC']]
      });

      res.json({
        success: true,
        data: { formas }
      });

    } catch (error) {
      console.error('Erro ao listar formas de conhecimento:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  },

  /**
   * @swagger
   * /api/formas-conhecimento/{id}:
   *   get:
   *     summary: Obter forma de conhecimento por ID
   *     tags: [Formas de Conhecimento]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: Dados da forma de conhecimento
   *       404:
   *         description: Forma de conhecimento não encontrada
   */
  async obter(req, res) {
    try {
      const { id } = req.params;

      const forma = await FormaConhecimento.findByPk(id);
      if (!forma) {
        return res.status(404).json({
          success: false,
          error: 'Forma de conhecimento não encontrada'
        });
      }

      res.json({
        success: true,
        data: { forma }
      });

    } catch (error) {
      console.error('Erro ao obter forma de conhecimento:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }
};

module.exports = formasConhecimentoController;

