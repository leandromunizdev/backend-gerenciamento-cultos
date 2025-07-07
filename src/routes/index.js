const express = require('express');
const router = express.Router();

const authRoutes = require('./auth');
const usuariosRoutes = require('./usuarios');
const perfisRoutes = require('./perfis');
const cultosRoutes = require('./cultos');
const tiposCultosRoutes = require('./tiposCultos');
const escalasRoutes = require('./escalas');
const cargosRoutes = require('./cargos');
const departamentosRoutes = require('./departamentos');
const atividadesRoutes = require('./atividades');
const configuracaoRoutes = require('./configuracoes');
const pessoasRoutes = require('./pessoas');
const formasConhecimentoRoutes = require('./formasConhecimento');
const funcoesRoutes = require('./funcoes');
const visitantesRoutes = require('./visitantes');
const avaliacoesRoutes = require('./avaliacoes');

/**
 * @swagger
 * /api:
 *   get:
 *     summary: Informações da API
 *     description: Retorna informações básicas sobre a API
 *     tags: [Sistema]
 *     responses:
 *       200:
 *         description: Informações da API
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                 version:
 *                   type: string
 *                 description:
 *                   type: string
 */
router.get('/', (req, res) => {
  res.json({
    name: 'Sistema de Gerenciamento de Cultos - AD Piedade',
    version: '1.0.0',
    description: 'API para gerenciamento de cultos, escalas e visitantes',
    endpoints: {
      documentation: '/api-docs',
      health: '/health',
      auth: '/api/auth'
    }
  });
});

router.use('/auth', authRoutes);
router.use('/usuarios', usuariosRoutes);
router.use('/perfis', perfisRoutes);
router.use('/cultos', cultosRoutes);
router.use('/tipos-cultos', tiposCultosRoutes);
router.use('/escalas', escalasRoutes);
router.use('/cargos', cargosRoutes);
router.use('/departamentos', departamentosRoutes);
router.use('/funcoes', funcoesRoutes);
router.use('/atividades', atividadesRoutes);
router.use('/configuracoes', configuracaoRoutes);
router.use('/pessoas', pessoasRoutes);
router.use('/formas-conhecimento', formasConhecimentoRoutes);
router.use('/visitantes', visitantesRoutes);
router.use('/avaliacoes', avaliacoesRoutes);

module.exports = router;

