import { Container } from 'inversify';
import { EmitterService } from '../event_emitter';
import { EVENT_TYPES } from './event.di';

// Create a DI container
const eventContainer = new Container();

// Bind dependencies
eventContainer
  .bind<EmitterService>(EVENT_TYPES.EmitterService)
  .to(EmitterService)
  .inSingletonScope();

export { eventContainer };
