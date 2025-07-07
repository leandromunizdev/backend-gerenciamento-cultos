const { CargoEclesiastico } = require('../models');

/**
 * Controlador para gerenciamento de cargos eclesiásticos
 */
const cargosController = {
    /**
     * Listar todos os cargos eclesiásticos
     */
    async listar(req, res) {
        try {
            const cargos = await CargoEclesiastico.findAll({
                where: {
                    ativo: true
                },
                order: [['nome', 'ASC']]
            });

            res.json({
                success: true,
                data: cargos
            });
        } catch (error) {
            console.error('Erro ao listar cargos:', error);
            res.status(500).json({
                success: false,
                error: 'Erro interno do servidor'
            });
        }
    },

    /**
     * Obter cargo por ID
     */
    async obter(req, res) {
        try {
            const { id } = req.params;

            const cargo = await CargoEclesiastico.findByPk(id);

            if (!cargo) {
                return res.status(404).json({
                    success: false,
                    error: 'Cargo não encontrado'
                });
            }

            res.json({
                success: true,
                data: cargo
            });
        } catch (error) {
            console.error('Erro ao obter cargo:', error);
            res.status(500).json({
                success: false,
                error: 'Erro interno do servidor'
            });
        }
    }
};

module.exports = cargosController;

