const { app, startServer } = require('./src/app');
const { sequelize } = require('./src/config/database');

const PORT = process.env.PORT || 5000;
let server;

startServer().then(() => {
  server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV}`);
    console.log(`API URL: http://localhost:${PORT}/api`);
  });
}).catch(error => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  if (!server) {
    sequelize.close();
    return;
  }

  server.close(() => {
    console.log('HTTP server closed');
    sequelize.close();
  });
});
