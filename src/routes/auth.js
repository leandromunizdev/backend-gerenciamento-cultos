const express = require('express');
const router = express.Router();
const { login, me, logout, verify } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Autenticação
 *   description: Endpoints para autenticação de usuários
 */

router.post('/login', login);

router.get('/me', authenticate, me);
router.get('/verify', authenticate, verify);
router.post('/logout', authenticate, logout);

module.exports = router;

