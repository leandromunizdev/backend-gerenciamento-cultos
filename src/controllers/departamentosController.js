const { Departamento } = require('../models');

/**
 * Controlador para gerenciamento de departamentos
 */
const departamentosController = {
    /**
     * Listar todos os departamentos
     */
    async listar(req, res) {
        try {
            const departamentos = await Departamento.findAll({
                where: {
                    ativo: true
                },
                order: [['nome', 'ASC']]
            });

            res.json({
                success: true,
                data: departamentos
            });
        } catch (error) {
            console.error('Erro ao listar departamentos:', error);
            res.status(500).json({
                success: false,
                error: 'Erro interno do servidor'
            });
        }
    },

    /**
     * Obter departamento por ID
     */
    async obter(req, res) {
        try {
            const { id } = req.params;

            const departamento = await Departamento.findByPk(id);

            if (!departamento) {
                return res.status(404).json({
                    success: false,
                    error: 'Departamento não encontrado'
                });
            }

            res.json({
                success: true,
                data: departamento
            });
        } catch (error) {
            console.error('Erro ao obter departamento:', error);
            res.status(500).json({
                success: false,
                error: 'Erro interno do servidor'
            });
        }
    }
};

module.exports = departamentosController;

