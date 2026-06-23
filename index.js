import { connectToWhatsApp } from './src/core/connector.js';
import { startDashboard } from './src/dashboard/app.js';
import logger from './src/core/logger.js';
import config from './src/config.js';

const startBot = async () => {
  try {
    await connectToWhatsApp();
    logger.info(`✅ Bot "${config.BOT_NAME}" started successfully!`);
    if (process.env.DASHBOARD_PORT) {
      startDashboard();
      logger.info(`📊 Dashboard running on port ${process.env.DASHBOARD_PORT}`);
    }
  } catch (error) {
    logger.error('Fatal error:', error);
    setTimeout(startBot, 5000);
  }
};

startBot();
