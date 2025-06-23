// Browser polyfills for Node.js util module
export const TextEncoder = globalThis.TextEncoder || window.TextEncoder;
export const TextDecoder = globalThis.TextDecoder || window.TextDecoder;

// Additional util exports that might be needed
export const promisify = (fn) => {
  return (...args) => {
    return new Promise((resolve, reject) => {
      fn(...args, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  };
};

export const callbackify = (fn) => {
  return (...args) => {
    const callback = args.pop();
    fn(...args)
      .then(result => callback(null, result))
      .catch(err => callback(err));
  };
};

// Inspect function (simplified)
export const inspect = (obj) => {
  if (typeof obj === 'string') return `'${obj}'`;
  if (typeof obj === 'number' || typeof obj === 'boolean') return String(obj);
  if (obj === null) return 'null';
  if (obj === undefined) return 'undefined';
  if (Array.isArray(obj)) return `[${obj.map(inspect).join(', ')}]`;
  if (typeof obj === 'object') {
    const entries = Object.entries(obj).map(([k, v]) => `${k}: ${inspect(v)}`);
    return `{ ${entries.join(', ')} }`;
  }
  return String(obj);
};

// Format function (simplified)
export const format = (f, ...args) => {
  let i = 0;
  return f.replace(/%[sdj%]/g, (x) => {
    if (x === '%%') return x;
    if (i >= args.length) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
};

// Default export for compatibility
export default {
  TextEncoder,
  TextDecoder,
  promisify,
  callbackify,
  inspect,
  format
};