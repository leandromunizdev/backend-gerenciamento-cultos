const notFound = (req, res, next) => {
  const error = new Error(`Rota não encontrada - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;

  // Erro de validação do Sequelize
  if (err.name === 'SequelizeValidationError') {
    statusCode = 400;
    message = err.errors.map(error => error.message).join(', ');
  }

  // Erro de chave única do Sequelize
  if (err.name === 'SequelizeUniqueConstraintError') {
    statusCode = 400;
    message = 'Dados duplicados. Verifique os campos únicos.';
  }

  // Erro de chave estrangeira do Sequelize
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    statusCode = 400;
    message = 'Referência inválida. Verifique os dados relacionados.';
  }

  // Erro de JWT
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Token inválido';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expirado';
  }

  // Log do erro
  console.error(`❌ Erro ${statusCode}: ${message}`);
  if (process.env.NODE_ENV === 'development') {
    console.error(err.stack);
  }

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = { notFound, errorHandler };

