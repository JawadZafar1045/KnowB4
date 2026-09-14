const app = require('./src/app');
const config = require('./src/config/environment');
const { connectDB } = require('./src/config/database');
require('./src/config/storage'); // ensure upload directories exist

const startServer = async () => {
  try {
    await connectDB();

    const server = app.listen(config.port, () => {
      console.log(`=================================================`);
      console.log(`🛡️  CYBERAWARE MULTI-TENANT BACKEND RUNNING`);
      console.log(`🌐 Port: ${config.port}`);
      console.log(`🔒 Mode: ${config.nodeEnv}`);
      console.log(`🔗 Health URL: http://localhost:${config.port}/api/health`);
      console.log(`=================================================`);
    });

    process.on('unhandledRejection', (err) => {
      console.error('Unhandled Promise Rejection:', err);
    });

    return server;
  } catch (err) {
    console.error('Fatal Server Startup Error:', err);
    process.exit(1);
  }
};

if (require.main === module) {
  startServer();
}

module.exports = { startServer };
