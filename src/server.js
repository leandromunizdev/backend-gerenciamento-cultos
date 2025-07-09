const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
require('dotenv').config();

const { sequelize, testConnection } = require('./config/database');
const routes = require('./routes');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const { requestLogger } = require('./middleware/logger');

const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || '0.0.0.0';

const app = express();

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutos
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 1000, // máximo 100 requests por IP
  message: {
    error: 'Muitas tentativas. Tente novamente em alguns minutos.',
    retryAfter: Math.ceil((parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000) / 1000)
  },
  standardHeaders: true,
  legacyHeaders: false
});

//app.use('/api', limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use(requestLogger);

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0'
  });
});

// Documentação Swagger
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Sistema de Gerenciamento de Cultos - AD Piedade',
      version: '1.0.0',
      description: 'API para gerenciamento de cultos, escalas e visitantes da Assembleia de Deus de Piedade',
      contact: {
        name: 'AD Piedade',
        url: 'https://adpiedade.com',
        email: 'contato@adpiedade.com'
      }
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Servidor de desenvolvimento'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  },
  apis: ['./src/routes/*.js', './src/models/*.js']
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/api', routes);

// Middleware de tratamento de erros
app.use(notFound);
app.use(errorHandler);

const startServer = async () => {
  try {
    await testConnection();

    require('./models');
    console.log('✅ Modelos carregados com sucesso.');

    // Iniciar servidor
    app.listen(PORT, HOST, () => {
      console.log(`🚀 Servidor rodando em http://${HOST}:${PORT}`);
      console.log(`📚 Documentação da API disponível em http://${HOST}:${PORT}/api-docs`);
      console.log(`🏥 Health check disponível em http://${HOST}:${PORT}/health`);
      console.log('');
      console.log('💡 Para popular o banco com dados iniciais, execute:');
      console.log('   npm run seed');
      console.log('');
    });

  } catch (error) {
    console.error('❌ Erro ao iniciar o servidor:', error);
    process.exit(1);
  }
};

// Tratamento de sinais de encerramento
process.on('SIGTERM', async () => {
  console.log('🔄 Recebido SIGTERM, encerrando servidor graciosamente...');
  await sequelize.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🔄 Recebido SIGINT, encerrando servidor graciosamente...');
  await sequelize.close();
  process.exit(0);
});

// Tratamento de erros não capturados
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

startServer();

