import { createApp } from './app';
import { databaseConnection } from './shared/database/database';
import { logger } from './shared/configs/logger';
import { PORT } from './shared/configs';
import { inventoryContainer } from './product_management/inventory/di/inventory.container';
import { INVENTORY_TYPES } from './product_management/inventory/di/inventory.di';
import { InventoryEventListeners } from './product_management/inventory/inventory.event_listeners';
import { notificationContainer } from './notifications/di/notification.container';
import { NOTIFICATION_TYPES } from './notifications/di/notification.di';
import { NotificationEventListeners } from './notifications/notification.event_listeners';

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
      // Ensure event listeners are initialized at app startup
      inventoryContainer.get<InventoryEventListeners>(INVENTORY_TYPES.InventoryEventListeners);
      notificationContainer.get<NotificationEventListeners>(
        NOTIFICATION_TYPES.NotificationEventListeners,
      );
      logger.info('Server started successfully.');
    } catch (error) {
      logger.error(error);
      process.exit(1);
    }
  }
}

const server = new Server();
server.start();
