import { EventEmitter2 } from 'eventemitter2';
import { injectable } from 'inversify';

// main emitter function that can be used to emit events across the application
@injectable()
export class EmitterService extends EventEmitter2 {
  constructor() {
    super();
  }
}

// export const emitterService = new EmitterService();
