// EventEmitter3 shim for proper ES module compatibility
import * as EventEmitterModule from 'eventemitter3';

// Handle both CommonJS and ES module patterns
const EventEmitter = EventEmitterModule.default || EventEmitterModule;

// Export both default and named exports to handle different import styles
export default EventEmitter;
export { EventEmitter };

// Also export the entire module for compatibility
export * from 'eventemitter3';
