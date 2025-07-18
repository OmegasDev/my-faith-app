// global.ts

if (typeof globalThis.structuredClone !== 'function') {
    const structuredClone = require('realistic-structured-clone');
    globalThis.structuredClone = structuredClone;
  }
  