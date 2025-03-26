import { createApp } from './app';
import { databaseConnection } from './shared/configs/database';
import { logger } from './shared/configs/logger';
import { inventoryEventListeners } from './product_management/inventory/inventory.events';
import { PORT } from './shared/configs';

export class Server {
  private readonly app;

  constructor() {
    this.app = createApp();
  }

  async start() {
    try {
      await databaseConnection();
      this.app.listen(PORT, () => {
        logger.info(`app is running on port ${PORT}`);
      });
      inventoryEventListeners;
      logger.info('Server started successfully.');
    } catch (error) {
      logger.error(error);
      process.exit(1);
    }
  }
}

const server = new Server();
server.start();
