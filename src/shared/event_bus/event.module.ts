import { Container } from 'inversify';
import { EmitterService } from './event_emitter';

// unique dependencies identifiers for each DI container
export const TYPES = {
    EmitterService: Symbol.for('EmitterService'),
};

// Create a DI container
const eventContainer = new Container();

// Bind dependencies
eventContainer.bind<EmitterService>(TYPES.EmitterService).to(EmitterService).inSingletonScope();

export { eventContainer };
