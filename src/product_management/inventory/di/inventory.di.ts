// unique dependencies identifiers for each DI container
export const TYPES = {
    InventoryRepository: Symbol.for('InventoryRepository'),
    InventoryService: Symbol.for('InventoryService'),
    InventoryController: Symbol.for('InventoryController'),
    InventoryEventListeners: Symbol.for('InventoryEventListeners'),
};